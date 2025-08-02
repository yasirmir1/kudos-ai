/**
 * Content Upload Script for Bootcamp Learning Content
 * 
 * This script reads JSON content files and uploads them to Supabase database.
 * Usage: node upload-content.js [content-file.json]
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Supabase configuration
const SUPABASE_URL = 'https://gqkfbxhuijpfcnjimlfj.supabase.co';
const SUPABASE_SERVICE_KEY = 'YOUR_SERVICE_ROLE_KEY_HERE'; // Replace with actual service role key

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

/**
 * Upload learning content to database
 * @param {Object} contentData - The structured learning content
 */
async function uploadContent(contentData) {
    console.log('🚀 Starting content upload...');
    
    try {
        // Upload curriculum topics first
        if (contentData.curriculum_topics && contentData.curriculum_topics.length > 0) {
            console.log('📚 Uploading curriculum topics...');
            
            for (const topic of contentData.curriculum_topics) {
                const { error } = await supabase
                    .from('bootcamp_curriculum_topics')
                    .upsert(topic);
                    
                if (error) {
                    console.error(`❌ Error uploading topic ${topic.id}:`, error);
                } else {
                    console.log(`✅ Uploaded topic: ${topic.topic_name}`);
                }
            }
        }
        
        // Upload curriculum content
        if (contentData.curriculum_content && contentData.curriculum_content.length > 0) {
            console.log('📝 Uploading curriculum content...');
            
            for (const content of contentData.curriculum_content) {
                const { error } = await supabase
                    .from('bootcamp_curriculum_content')
                    .upsert(content);
                    
                if (error) {
                    console.error(`❌ Error uploading content for ${content.topic_id}:`, error);
                } else {
                    console.log(`✅ Uploaded ${content.stage_type} for ${content.topic_id}`);
                }
            }
        }
        
        console.log('🎉 Content upload completed successfully!');
        
    } catch (error) {
        console.error('💥 Upload failed:', error);
        process.exit(1);
    }
}

/**
 * Validate content structure
 * @param {Object} contentData - Content to validate
 */
function validateContent(contentData) {
    const requiredFields = {
        curriculum_topics: ['id', 'topic_name', 'topic_order', 'difficulty'],
        curriculum_content: ['topic_id', 'stage_type', 'stage_order', 'content']
    };
    
    for (const [section, fields] of Object.entries(requiredFields)) {
        if (!contentData[section]) {
            throw new Error(`Missing required section: ${section}`);
        }
        
        contentData[section].forEach((item, index) => {
            fields.forEach(field => {
                if (item[field] === undefined || item[field] === null) {
                    throw new Error(`Missing required field '${field}' in ${section}[${index}]`);
                }
            });
        });
    }
    
    console.log('✅ Content validation passed');
}

/**
 * Main execution function
 */
async function main() {
    const args = process.argv.slice(2);
    const contentFile = args[0] || 'database-upload-content.json';
    
    try {
        // Read content file
        console.log(`📖 Reading content from: ${contentFile}`);
        const contentPath = path.resolve(contentFile);
        
        if (!fs.existsSync(contentPath)) {
            throw new Error(`Content file not found: ${contentPath}`);
        }
        
        const contentData = JSON.parse(fs.readFileSync(contentPath, 'utf8'));
        
        // Validate content structure
        validateContent(contentData);
        
        // Upload to database
        await uploadContent(contentData);
        
    } catch (error) {
        console.error('💥 Script failed:', error.message);
        process.exit(1);
    }
}

// Template for creating new content
const CONTENT_TEMPLATE = {
    curriculum_topics: [
        {
            id: "topic_id_here",
            topic_name: "Topic Name Here",
            topic_order: 1,
            module_id: "mod1",
            difficulty: "foundation", // foundation, intermediate, advanced
            estimated_duration_minutes: 60,
            prerequisites: ["prerequisite_topic_1"],
            learning_objectives: [
                "Learning objective 1",
                "Learning objective 2"
            ]
        }
    ],
    curriculum_content: [
        {
            topic_id: "topic_id_here",
            stage_type: "concept_introduction", // concept_introduction, guided_practice, independent_practice, assessment
            stage_order: 1,
            title: "Stage Title",
            description: "Stage description",
            estimated_time_minutes: 15,
            content: {
                // Stage-specific content structure
                introduction: "Introduction text",
                // Add stage-specific fields based on stage_type
            },
            media_urls: ["/path/to/media.png"] // Optional
        }
    ]
};

/**
 * Generate template file
 */
function generateTemplate() {
    const templatePath = 'content-template.json';
    fs.writeFileSync(templatePath, JSON.stringify(CONTENT_TEMPLATE, null, 2));
    console.log(`📄 Template created: ${templatePath}`);
}

// Handle command line arguments
if (process.argv.includes('--template')) {
    generateTemplate();
} else {
    main();
}

export { uploadContent, validateContent, CONTENT_TEMPLATE };