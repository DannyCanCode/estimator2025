from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from io import BytesIO
import math

router = APIRouter()

class MaterialCost(BaseModel):
    shingles: float
    underlayment: float
    starter: float
    ridge_caps: float
    drip_edge: float
    ice_water: float
    total: float

class LaborCost(BaseModel):
    base: float
    steep_slope: float
    total: float

class EstimateCosts(BaseModel):
    materials: MaterialCost
    labor: LaborCost
    total: float

class PricingItem(BaseModel):
    price: float
    unit: str

class MaterialsPricing(BaseModel):
    shingles: PricingItem
    underlayment: PricingItem
    starter: PricingItem
    ridge_caps: PricingItem
    drip_edge: PricingItem
    ice_water: PricingItem

class LaborPricing(BaseModel):
    base_installation: PricingItem
    steep_slope_factor: PricingItem
    waste_factor: float

class PricingConfig(BaseModel):
    materials: MaterialsPricing
    labor: LaborPricing

class EstimateRequest(BaseModel):
    measurements: Dict[str, Any]
    pricing: PricingConfig
    selected_shingle: str
    costs: EstimateCosts

@router.post("/generate-estimate")
async def generate_estimate(request: EstimateRequest) -> bytes:
    """Generate a PDF estimate based on measurements and pricing."""
    try:
        # Create PDF buffer
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=72, leftMargin=72, topMargin=72, bottomMargin=72)
        
        # Get styles
        styles = getSampleStyleSheet()
        title_style = styles['Heading1']
        heading_style = styles['Heading2']
        normal_style = styles['Normal']
        
        # Create custom styles
        company_style = ParagraphStyle(
            'CompanyStyle',
            parent=styles['Normal'],
            fontSize=12,
            spaceAfter=30
        )
        
        table_header_style = ParagraphStyle(
            'TableHeader',
            parent=styles['Normal'],
            fontSize=10,
            textColor=colors.white,
            alignment=TA_CENTER
        )
        
        table_cell_style = ParagraphStyle(
            'TableCell',
            parent=styles['Normal'],
            fontSize=10
        )
        
        # Build document content
        content = []
        
        # Add header with logo placeholder
        content.append(Paragraph("3MG Roofing Estimate", title_style))
        content.append(Spacer(1, 12))
        
        # Add company info
        content.append(Paragraph(
            "3MG Roofing<br/>"
            "Professional Roofing Services<br/>"
            "Phone: (555) 123-4567<br/>"
            "Email: info@3mgroofing.com", 
            company_style
        ))
        
        # Add customer info section
        content.append(Paragraph("Project Details", heading_style))
        content.append(Spacer(1, 12))
        
        # Add measurements section
        measurements_data = [
            ["Total Area", f"{request.measurements['total_area']} sq ft"],
            ["Total Squares", f"{request.measurements['total_squares']} squares"],
            ["Predominant Pitch", f"{request.measurements['predominant_pitch']}"],
            ["Eaves Length", f"{request.measurements.get('eaves', 0)} ft"],
            ["Rakes Length", f"{request.measurements.get('rakes', 0)} ft"],
            ["Ridges Length", f"{request.measurements.get('length_measurements', {}).get('ridges', {}).get('length', 0)} ft"],
            ["Valleys Length", f"{request.measurements.get('length_measurements', {}).get('valleys', {}).get('length', 0)} ft"],
        ]
        
        # Create measurements table
        measurements_table = Table(measurements_data, colWidths=[200, 200])
        measurements_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.grey),
            ('TEXTCOLOR', (0, 0), (0, -1), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('BOX', (0, 0), (-1, -1), 2, colors.black),
        ]))
        content.append(measurements_table)
        content.append(Spacer(1, 20))

        # Add materials section
        content.append(Paragraph("Materials", heading_style))
        content.append(Spacer(1, 12))
        
        materials_data = [
            ["Item", "Quantity", "Price per Unit", "Total"],
            ["GAF Timberline HDZ Shingles", f"{request.measurements['total_squares']} squares", 
             f"${request.pricing['materials']['shingles']['price']:.2f}", 
             f"${request.measurements['total_squares'] * request.pricing['materials']['shingles']['price']:.2f}"],
        ]
        
        # Add underlayment
        underlayment_rolls = math.ceil(float(request.measurements['total_squares']) / 1.6)
        materials_data.append([
            "GAF Weatherwatch Ice & Water Shield",
            f"{underlayment_rolls} rolls",
            "$117.50",
            f"${underlayment_rolls * 117.50:.2f}"
        ])
        
        # Create materials table
        materials_table = Table(materials_data, colWidths=[200, 100, 100, 100])
        materials_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('ALIGN', (2, 0), (-1, -1), 'RIGHT'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('BOX', (0, 0), (-1, -1), 2, colors.black),
        ]))
        content.append(materials_table)
        content.append(Spacer(1, 20))

        # Add labor section
        content.append(Paragraph("Labor", heading_style))
        content.append(Spacer(1, 12))
        
        labor_data = [
            ["Task", "Rate", "Units", "Total"],
            ["Base Installation", "$65.00/square", f"{request.measurements['total_squares']} squares", 
             f"${float(request.measurements['total_squares']) * 65.00:.2f}"],
            ["Permits and Inspections", "$500.00", "1", "$500.00"],
            ["Dumpster", "$450.00", "1", "$450.00"],
        ]
        
        # Create labor table
        labor_table = Table(labor_data, colWidths=[200, 100, 100, 100])
        labor_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('ALIGN', (2, 0), (-1, -1), 'RIGHT'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('BOX', (0, 0), (-1, -1), 2, colors.black),
        ]))
        content.append(labor_table)
        content.append(Spacer(1, 20))

        # Add total section
        total_materials = request.measurements['total_squares'] * request.pricing['materials']['shingles']['price'] + \
                         underlayment_rolls * 117.50
        total_labor = float(request.measurements['total_squares']) * 65.00 + 500.00 + 450.00
        grand_total = total_materials + total_labor

        content.append(Paragraph("Summary", heading_style))
        content.append(Spacer(1, 12))
        
        summary_data = [
            ["Category", "Amount"],
            ["Materials Total", f"${total_materials:.2f}"],
            ["Labor Total", f"${total_labor:.2f}"],
            ["Grand Total", f"${grand_total:.2f}"],
        ]
        
        # Create summary table
        summary_table = Table(summary_data, colWidths=[200, 200])
        summary_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('BOX', (0, 0), (-1, -1), 2, colors.black),
            ('BACKGROUND', (0, -1), (-1, -1), colors.lightgrey),
        ]))
        content.append(summary_table)
        
        # Add terms and conditions
        content.append(Spacer(1, 30))
        content.append(Paragraph("Terms and Conditions", heading_style))
        content.append(Spacer(1, 12))
        content.append(Paragraph(
            "1. This estimate is valid for 30 days from the date of issue.<br/>"
            "2. A 50% deposit is required to schedule the work.<br/>"
            "3. Final payment is due upon completion of the project.<br/>"
            "4. All work comes with a 5-year workmanship warranty.<br/>"
            "5. Material warranties are provided by the manufacturers.",
            normal_style
        ))

        # Build PDF
        doc.build(content)
        buffer.seek(0)
        return buffer.getvalue()

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 