import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { student_id, threshold = 3 } = await req.json();

    console.log(`Analyzing misconception patterns for student: ${student_id}`);

    // Get misconception frequency data
    const { data: misconceptionData, error: misconceptionError } = await supabase
      .rpc('get_student_misconceptions', { p_student_id: student_id });

    if (misconceptionError) {
      throw new Error(`Error fetching misconceptions: ${misconceptionError.message}`);
    }

    if (!misconceptionData || misconceptionData.length === 0) {
      return new Response(JSON.stringify({ 
        patterns: [],
        message: 'No misconceptions found for analysis' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Analyze patterns
    const patterns = [];
    const criticalPatterns = [];
    const emergingPatterns = [];

    for (const misconception of misconceptionData) {
      const frequency = misconception.frequency;
      const topics = misconception.topics || [];
      
      let severity = 'low';
      let patternType = 'emerging';
      
      if (frequency >= 10) {
        severity = 'critical';
        patternType = 'persistent';
      } else if (frequency >= 6) {
        severity = 'high';
        patternType = 'recurring';
      } else if (frequency >= threshold) {
        severity = 'medium';
        patternType = 'developing';
      }

      if (frequency >= threshold) {
        const pattern = {
          student_id,
          misconception_code: misconception.red_herring,
          frequency,
          severity,
          pattern_type: patternType,
          topics,
          first_seen: new Date(Date.now() - (frequency * 24 * 60 * 60 * 1000)).toISOString(), // Estimate
          last_seen: new Date().toISOString(),
          trend: frequency >= 5 ? 'increasing' : 'stable'
        };

        patterns.push(pattern);

        if (severity === 'critical') {
          criticalPatterns.push(pattern);
        } else if (patternType === 'emerging' && frequency >= threshold) {
          emergingPatterns.push(pattern);
        }
      }
    }

    // Store patterns in database
    for (const pattern of patterns) {
      const patternKey = `${student_id}-${pattern.misconception_code}`;
      
      await supabase
        .from('bootcamp_misconception_patterns')
        .upsert({
          pattern_key: patternKey,
          pattern_data: {
            student_id: pattern.student_id,
            misconception_code: pattern.misconception_code,
            frequency: pattern.frequency,
            severity: pattern.severity,
            pattern_type: pattern.pattern_type,
            topics: pattern.topics,
            first_seen: pattern.first_seen,
            last_seen: pattern.last_seen,
            trend: pattern.trend,
            analysis_date: new Date().toISOString()
          },
          hit_count: pattern.frequency,
          last_used: new Date().toISOString()
        });
    }

    // Generate recommendations
    const recommendations = [];
    
    if (criticalPatterns.length > 0) {
      recommendations.push({
        type: 'urgent_intervention',
        title: 'Critical Misconception Patterns Detected',
        description: `${criticalPatterns.length} misconceptions require immediate attention`,
        patterns: criticalPatterns,
        priority: 1
      });
    }

    if (emergingPatterns.length > 0) {
      recommendations.push({
        type: 'early_intervention',
        title: 'Emerging Patterns Identified',
        description: `${emergingPatterns.length} misconceptions are developing - early intervention recommended`,
        patterns: emergingPatterns,
        priority: 2
      });
    }

    // Topic clustering analysis
    const topicClusters = {};
    patterns.forEach(pattern => {
      pattern.topics.forEach(topic => {
        if (!topicClusters[topic]) {
          topicClusters[topic] = [];
        }
        topicClusters[topic].push(pattern);
      });
    });

    const problematicTopics = Object.entries(topicClusters)
      .filter(([_, patterns]) => patterns.length >= 2)
      .map(([topic, patterns]) => ({
        topic,
        misconception_count: patterns.length,
        total_frequency: patterns.reduce((sum, p) => sum + p.frequency, 0),
        patterns
      }))
      .sort((a, b) => b.total_frequency - a.total_frequency);

    console.log(`Analysis complete: ${patterns.length} patterns identified, ${recommendations.length} recommendations generated`);

    return new Response(JSON.stringify({
      patterns,
      critical_patterns: criticalPatterns,
      emerging_patterns: emergingPatterns,
      recommendations,
      problematic_topics: problematicTopics,
      analysis_summary: {
        total_patterns: patterns.length,
        critical_count: criticalPatterns.length,
        emerging_count: emergingPatterns.length,
        most_problematic_topic: problematicTopics[0]?.topic || null
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-misconception-patterns:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});