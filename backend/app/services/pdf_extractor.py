import re
import os
from typing import Dict, Any, List, Optional
import fitz  # pymupdf
from loguru import logger
from io import BytesIO
import traceback

class PDFExtractor:
    """Class to extract measurements from EagleView PDF reports."""

    def __init__(self) -> None:
        """Initialize PDFExtractor with compiled regex patterns."""
        # Pre-compile regular expressions for better performance
        self.patterns: Dict[str, re.Pattern] = {
            'total_area': re.compile(r'Total\s+Roof\s+Area\s*=\s*(\d+,?\d*)\s*sq\s*ft', re.IGNORECASE),
            'predominant_pitch': re.compile(r'Predominant\s+Pitch\s*=\s*(\d+/\d+)', re.IGNORECASE),
            'ridges': re.compile(r'(?:Total\s+)?Ridges(?:/Hips)?\s*=\s*(\d+)\s*ft', re.IGNORECASE),
            'valleys': re.compile(r'(?:Total\s+)?Valleys\s*=\s*(\d+)\s*ft', re.IGNORECASE),
            'eaves': re.compile(r'(?:Total\s+)?Eaves(?:/Starter)?[‡†]?\s*=\s*(\d+)\s*ft', re.IGNORECASE),
            'rakes': re.compile(r'(?:Total\s+)?Rakes[†]?\s*=\s*(\d+)\s*ft', re.IGNORECASE),
            'hips': re.compile(r'(?:Total\s+)?Hips\s*=\s*(\d+)\s*ft', re.IGNORECASE),
            'flashing': re.compile(r'(?:Total\s+)?Flashing\s*=\s*(\d+)\s*ft', re.IGNORECASE),
            'step_flashing': re.compile(r'(?:Total\s+)?Step\s+flashing\s*=\s*(\d+)\s*ft', re.IGNORECASE),
            'penetrations_area': re.compile(r'Total\s+Penetrations\s+Area\s*=\s*(\d+)\s*sq\s*ft', re.IGNORECASE),
            'penetrations_perimeter': re.compile(r'Total\s+Penetrations\s+Perimeter\s*=\s*(\d+)\s*ft', re.IGNORECASE),
            'suggested_waste': re.compile(r'(?P<waste_percentage>\d+)%\s*\n\s*(?P<area_sq_ft>\d+)\s*\n\s*(?P<suggested_squares>\d+\.\d+)', re.IGNORECASE | re.DOTALL)
        }

    def find_measurement_with_count(self, text: str, key: str, length: float) -> Optional[int]:
        """
        Find count for a measurement using various patterns.
        
        Args:
            text: The text to search in
            key: The measurement key (e.g., 'ridges', 'valleys')
            length: The length value to match
            
        Returns:
            Optional[int]: The count if found, otherwise 1
        """
        try:
            logger.debug(f"Searching for {key} count in text: {text[:200]}...")

            # Pattern 1: Look for small numbers (1-2 digits) in parentheses after measurement
            after_pattern = rf'{key}.*?{length}\s*(?:ft|feet|\')?\s*\(([1-9][0-9]?)\)'
            after_match = re.search(after_pattern, text, re.IGNORECASE | re.DOTALL)
            if after_match:
                logger.debug(f"Found count after {key}: {after_match.group(1)}")
                return int(after_match.group(1))

            # Pattern 2: Look for small numbers before measurement
            before_pattern = rf'([1-9][0-9]?)\s*{key}'
            before_match = re.search(before_pattern, text, re.IGNORECASE)
            if before_match:
                logger.debug(f"Found count before {key}: {before_match.group(1)}")
                return int(before_match.group(1))

            # Pattern 3: Look for count in a broader context, still limiting to small numbers
            context_pattern = rf'{key}.*?{length}.*?\(([1-9][0-9]?)\)'
            context_match = re.search(context_pattern, text, re.IGNORECASE | re.DOTALL)
            if context_match:
                logger.debug(f"Found count in context for {key}: {context_match.group(1)}")
                return int(context_match.group(1))

            logger.warning(f"No count found for {key} with length {length}, using default count of 1")
            return 1

        except Exception as e:
            logger.error(f"Error finding count for {key}: {e}")
            return 1

    def extract_areas_per_pitch_fallback(self, text: str) -> List[Dict[str, Any]]:
        """Extract areas per pitch using a multiline pattern that matches EagleView's format."""
        areas_per_pitch = []
        
        # First, try to find the "Areas per Pitch" section
        section_pattern = r'Areas\s+per\s+Pitch.*?\n(.*?)(?=\n\s*\n|\Z)'
        section_match = re.search(section_pattern, text, re.DOTALL | re.IGNORECASE)
        
        if section_match:
            section_text = section_match.group(1)
            logger.debug(f"Found Areas per Pitch section: {section_text}")
            
            # Split into lines and clean them
            lines = [line.strip() for line in section_text.split('\n') if line.strip()]
            
            # Initialize lists for each type of data
            pitches = []
            areas = []
            percentages = []
            
            # Process each line
            for line in lines:
                if '/' in line and line.replace('/', '').replace(' ', '').isdigit():
                    # This is a pitch line (e.g., "4/12")
                    pitches.append(line.strip())
                elif line.endswith('%'):
                    # This is a percentage line
                    try:
                        percentage = float(line.rstrip('%').strip())
                        percentages.append(percentage)
                    except ValueError:
                        continue
                else:
                    # Try to parse as an area
                    try:
                        area = float(line.replace(',', '').strip())
                        areas.append(area)
                    except ValueError:
                        continue
            
            logger.debug(f"Found {len(pitches)} pitches: {pitches}")
            logger.debug(f"Found {len(areas)} areas: {areas}")
            logger.debug(f"Found {len(percentages)} percentages: {percentages}")
            
            # Group data in sets of three
            for i in range(0, min(len(pitches), len(areas), len(percentages)), 3):
                group_pitches = pitches[i:i+3]
                group_areas = areas[i:i+3]
                group_percentages = percentages[i:i+3]
                
                # Verify we have complete data for this group
                if len(group_pitches) == 3 and len(group_areas) == 3 and len(group_percentages) == 3:
                    # Check if percentages sum to approximately 100%
                    if abs(sum(group_percentages) - 100) < 1:
                        # Add each pitch in the group
                        for j in range(3):
                            pitch_data = {
                                'pitch': group_pitches[j],
                                'area': group_areas[j],
                                'percentage': group_percentages[j]
                            }
                            areas_per_pitch.append(pitch_data)
                            logger.info(f"Added pitch data: {pitch_data}")
        
        if not areas_per_pitch:
            logger.warning("No areas per pitch data extracted")
            logger.debug("Raw text being processed:")
            logger.debug(text[:500])  # Log first 500 chars for debugging
        else:
            logger.info(f"Successfully extracted {len(areas_per_pitch)} pitch areas")
            
        return areas_per_pitch

    def extract_waste_percentage(self, text):
        """Extract waste percentage from text."""
        logger.info("Extracting waste percentage...")
        
        # Use the exact pattern that worked in the Jupyter notebook
        waste_pattern = r'(\d+)%'
        match = re.search(waste_pattern, text)
        
        if match:
            try:
                waste = float(match.group(1))
                logger.info(f"Found waste percentage: {waste}%")
                return waste
            except (ValueError, IndexError) as e:
                logger.error(f"Error parsing waste percentage: {e}")
                logger.error(f"Text being searched: {text}")
        
        logger.warning("No waste percentage found in text")
        return 12  # Default to 12% if not found

    def extract_text(self, pdf_content: bytes) -> str:
        """Extract text from PDF content bytes."""
        doc = fitz.open(stream=pdf_content, filetype="pdf")
        text = ""
        for page in doc:
            page_text = page.get_text()
            logger.debug(f"Extracted text from page {page.number + 1} (length: {len(page_text)})")
            text += page_text + "\n\n"  # Add extra newlines between pages
        
        logger.debug(f"Total extracted text length: {len(text)}")
        logger.debug("First 1000 chars of text:\n" + text[:1000])
        logger.debug("Last 1000 chars of text:\n" + text[-1000:])
        
        return text

    def extract_measurements(self, pdf_content: bytes) -> Dict[str, Any]:
        """Extract all measurements from the PDF content bytes."""
        text = self.extract_text(pdf_content)
        logger.debug(f"Extracted text from PDF: {text[:1000]}")  # Log first 1000 chars
        
        try:
            # Extract areas per pitch first since we need the full text
            areas_per_pitch = self.extract_areas_per_pitch_fallback(text)
            logger.info(f"Extracted areas per pitch: {areas_per_pitch}")
            
            # Find Report Summary section
            summary_match = re.search(r'Report Summary.*?(?=\n\s*\n|\Z)', text, re.DOTALL)
            if summary_match:
                summary_text = summary_match.group(0)
                logger.debug(f"Found Report Summary section: {summary_text}")
            else:
                summary_text = text
                logger.warning("No Report Summary section found, using full text")
            
            # Extract other measurements
            matches_found = {}
            for key in ['total_area', 'predominant_pitch', 'ridges', 'hips', 'valleys', 'rakes', 'eaves', 'flashing', 'step_flashing']:
                value = getattr(self, f'extract_{key}')(summary_text)
                matches_found[key] = value
                logger.debug(f"Extracted {key}: {value}")
                if value == 0 or value == "0/12":
                    # Try searching in full text if not found in summary
                    value = getattr(self, f'extract_{key}')(text)
                    matches_found[key] = value
                    logger.debug(f"Retried {key} in full text: {value}")
            
            matches_found["waste_percentage"] = self.extract_waste_percentage(summary_text)
            matches_found["areas_per_pitch"] = areas_per_pitch
            
            # Add pitch_details if we found areas_per_pitch
            if areas_per_pitch:
                matches_found["pitch_details"] = [
                    {"pitch": x["pitch"], "area": x["area"]} for x in areas_per_pitch
                ]
            
            logger.info(f"Final measurements: {matches_found}")
            return matches_found
            
        except Exception as e:
            logger.error(f"Error extracting measurements: {e}")
            logger.error(f"Traceback: {traceback.format_exc()}")
            raise 

    def extract_total_area(self, text: str) -> float:
        """Extract total area from text."""
        match = self.patterns['total_area'].search(text)
        if match:
            area_str = match.group(1).replace(',', '')
            return float(area_str)
        return 0.0

    def extract_predominant_pitch(self, text: str) -> str:
        """Extract predominant pitch from text."""
        match = self.patterns['predominant_pitch'].search(text)
        if match:
            return match.group(1)
        return "0/12"

    def extract_ridges(self, text: str) -> float:
        """Extract ridges length from text."""
        match = self.patterns['ridges'].search(text)
        if match:
            return float(match.group(1))
        return 0.0

    def extract_valleys(self, text: str) -> float:
        """Extract valleys length from text."""
        match = self.patterns['valleys'].search(text)
        if match:
            return float(match.group(1))
        return 0.0

    def extract_rakes(self, text: str) -> float:
        """Extract rakes length from text."""
        match = self.patterns['rakes'].search(text)
        if match:
            return float(match.group(1))
        return 0.0

    def extract_eaves(self, text: str) -> float:
        """Extract eaves length from text."""
        match = self.patterns['eaves'].search(text)
        if match:
            return float(match.group(1))
        return 0.0

    def extract_hips(self, text: str) -> float:
        """Extract hips length from text."""
        match = self.patterns['hips'].search(text)
        if match:
            return float(match.group(1))
        return 0.0

    def extract_flashing(self, text: str) -> float:
        """Extract flashing length from text."""
        match = self.patterns['flashing'].search(text)
        if match:
            return float(match.group(1))
        return 0.0

    def extract_step_flashing(self, text: str) -> float:
        """Extract step flashing length from text."""
        match = self.patterns['step_flashing'].search(text)
        if match:
            return float(match.group(1))
        return 0.0

    def extract_penetrations_area(self, text: str) -> float:
        """Extract total penetrations area from text."""
        match = self.patterns['penetrations_area'].search(text)
        if match:
            return float(match.group(1))
        return 0.0

    def extract_penetrations_perimeter(self, text: str) -> float:
        """Extract total penetrations perimeter from text."""
        match = self.patterns['penetrations_perimeter'].search(text)
        if match:
            return float(match.group(1))
        return 0.0 