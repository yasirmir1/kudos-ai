export interface ParsedInsight {
  id: string;
  title: string;
  emoji: string;
  sections: InsightSection[];
}

export interface InsightSection {
  type: 'what-happens' | 'why-tricky' | 'how-to-tackle' | 'shows-up-in';
  icon: string;
  title: string;
  content: string;
}

export function parseInsights(text: string): ParsedInsight[] {
  if (!text) return [];

  // Split by insight headers (### **number. Title**)
  const insightBlocks = text.split(/###\s*\*\*\d+\.\s*/).filter(block => block.trim());
  
  return insightBlocks.map((block, index) => {
    const lines = block.split('\n').filter(line => line.trim());
    if (lines.length === 0) return null;

    // Extract title and emoji from first line
    const firstLine = lines[0];
    const titleMatch = firstLine.match(/^([^*]+)\*\*\s*(.*)$/);
    const title = titleMatch ? titleMatch[1].trim() : firstLine;
    const emoji = extractEmoji(title) || '💡';
    const cleanTitle = removeEmoji(title);

    const sections: InsightSection[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip empty lines and dividers
      if (!line || line === '---') continue;
      
      // Parse different section types
      if (line.includes('**What usually happens:**')) {
        sections.push({
          type: 'what-happens',
          icon: '🤔',
          title: 'What usually happens',
          content: extractContent(line)
        });
      } else if (line.includes('**Why this is tricky:**')) {
        sections.push({
          type: 'why-tricky',
          icon: '💡',
          title: 'Why this is tricky',
          content: extractContent(line)
        });
      } else if (line.includes('**How to tackle it:**')) {
        // Collect multi-line content for this section
        const content = [extractContent(line)];
        let j = i + 1;
        while (j < lines.length && !lines[j].includes('**') && lines[j].trim() !== '---') {
          const nextLine = lines[j].trim();
          if (nextLine && !nextLine.startsWith('###')) {
            content.push(nextLine.replace(/^-\s*/, '• '));
          }
          j++;
        }
        i = j - 1; // Skip processed lines
        
        sections.push({
          type: 'how-to-tackle',
          icon: '🛠️',
          title: 'How to tackle it',
          content: content.filter(c => c).join('\n')
        });
      } else if (line.includes('**Shows up in:**')) {
        sections.push({
          type: 'shows-up-in',
          icon: '📚',
          title: 'Shows up in',
          content: extractContent(line)
        });
      }
    }

    return {
      id: `insight-${index}`,
      title: cleanTitle,
      emoji,
      sections
    };
  }).filter(Boolean) as ParsedInsight[];
}

function extractContent(line: string): string {
  // Remove markdown formatting and extract content after the bold title
  const match = line.match(/\*\*[^*]+\*\*\s*(.+)$/);
  return match ? match[1].trim() : line.replace(/\*\*/g, '').trim();
}

function extractEmoji(text: string): string | null {
  const emojiMatch = text.match(/([\u{1F300}-\u{1F9FF}])/u);
  return emojiMatch ? emojiMatch[1] : null;
}

function removeEmoji(text: string): string {
  return text.replace(/([\u{1F300}-\u{1F9FF}])/gu, '').trim();
}