import { measurementPatterns } from "./patterns.ts";
import type { Measurements, DebugInfo, ExtractionResult } from "./types.ts";

export function extractMeasurements(text: string): ExtractionResult {
  const measurements: Measurements = {};
  const debugInfo: DebugInfo = {
    matched_patterns: {},
    text_samples: {}
  };

  // Clean up text content
  text = text
    .replace(/\r\n/g, '\n')
    .replace(/\s+/g, ' ')
    .trim();

  console.log('Processing text content, length:', text.length);

  const tryPatterns = (patterns: RegExp[], text: string) => {
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) return match;
    }
    return null;
  };

  // Extract measurements using patterns
  for (const [key, patternList] of Object.entries(measurementPatterns)) {
    debugInfo.text_samples[key] = text.substring(0, 1000);
    const match = tryPatterns(patternList, text);
    debugInfo.matched_patterns[key] = !!match;

    if (match) {
      if (key === 'waste_table') {
        try {
          const percentages = match[1].trim().split('\n').map(p => parseInt(p));
          const areas = match[2].trim().split('\n').map(a => parseFloat(a.replace(',', '')));
          
          const wasteEntries = percentages.map((percentage, i) => ({
            percentage,
            area: areas[i],
            is_suggested: i === Math.floor(percentages.length / 2)
          }));
          
          measurements[key] = wasteEntries;
          measurements.suggested_waste_percentage = percentages[Math.floor(percentages.length / 2)];
        } catch (e) {
          debugInfo.waste_table_error = e.message;
        }
      } else if (['ridges', 'hips'].includes(key)) {
        // Try the new page 10 format first (includes both length and count)
        const page10Match = tryPatterns([patternList[0]], text);
        if (page10Match) {
          measurements[key] = {
            length: parseFloat(page10Match[1].replace(',', '')),
            count: parseInt(page10Match[2])
          };
        } else {
          // Fall back to separate length and count patterns
          const lengthMatch = tryPatterns([patternList[1]], text);
          const countMatch = tryPatterns([patternList[2]], text);
          measurements[key] = {
            length: lengthMatch ? parseFloat(lengthMatch[1].replace(',', '')) : 0,
            count: countMatch ? parseInt(countMatch[1]) : 0
          };
        }
      } else if (key === 'combined_ridges_hips') {
        // Only use combined total if individual measurements weren't found
        if (!measurements.ridges?.length && !measurements.hips?.length) {
          const totalLength = parseFloat(match[1].replace(',', ''));
          // Store in both ridges and hips for backward compatibility
          measurements.ridges = { length: totalLength, count: 0 };
          measurements.hips = { length: 0, count: 0 };
          console.log('Using combined ridges/hips measurement:', totalLength);
        }
      } else if (['valleys', 'rakes', 'eaves'].includes(key)) {
        const lengthMatch = tryPatterns([patternList[0]], text);
        const countMatch = tryPatterns([patternList[1]], text);
        measurements[key] = {
          length: lengthMatch ? parseFloat(lengthMatch[1].replace(',', '')) : 0,
          count: countMatch ? parseInt(countMatch[1]) : 0
        };
      } else {
        const value = match[1].replace(',', '');
        measurements[key] = !isNaN(parseFloat(value)) ? parseFloat(value) : value;
      }
    }
  }

  console.log('Extracted measurements:', measurements);
  console.log('Debug info:', debugInfo);

  return { measurements, debugInfo };
}