from fastapi import APIRouter, Request, Response, UploadFile, File
from fastapi.responses import StreamingResponse, JSONResponse
from io import BytesIO
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
import json
from app.services.pdf_extractor import PDFExtractor

router = APIRouter()

@router.post("/generate-pdf")
async def generate_pdf(request: Request):
    try:
        # Get the estimate data from the request
        estimate = await request.json()
        
        if not estimate or 'customerName' not in estimate or 'address' not in estimate:
            return Response(
                content=json.dumps({"error": "Missing required estimate data"}),
                status_code=400,
                media_type="application/json"
            )

        # Create a BytesIO buffer to receive PDF data
        buffer = BytesIO()
        
        # Create the PDF document
        c = canvas.Canvas(buffer, pagesize=letter)
        
        # Company Header
        c.setFont("Helvetica-Bold", 20)
        c.drawString(50, 750, "3MG ROOFING")
        
        c.setFont("Helvetica", 10)
        c.drawString(50, 730, estimate['companyInfo']['address'])
        c.drawString(50, 715, f"{estimate['companyInfo']['city']}, {estimate['companyInfo']['state']} {estimate['companyInfo']['zip']}")
        c.drawString(50, 700, f"Phone: {estimate['companyInfo']['phone']}")

        # Date and Claim Information
        c.setFont("Helvetica", 12)
        from datetime import datetime
        date_str = datetime.now().strftime("%m/%d/%Y")
        c.drawRightString(550, 750, date_str)
        c.drawRightString(550, 735, "Claim Information")
        c.drawRightString(550, 720, "RETAIL")

        # Company Representative
        c.setFont("Helvetica", 12)
        c.drawString(50, 650, "Company Representative")
        c.drawString(50, 635, estimate['companyInfo']['representative'])
        c.drawString(50, 620, f"Phone: {estimate['companyInfo']['repPhone']}")
        c.drawString(50, 605, estimate['companyInfo']['email'])

        # Customer Information
        c.drawString(350, 650, "Job:")
        c.drawString(350, 635, estimate['customerName'])
        c.drawString(350, 620, estimate['address'])

        # Materials Section
        c.setFont("Helvetica-Bold", 14)
        c.drawString(50, 550, "3MG Roof Replacement Section")

        # Table Headers
        y = 520
        c.setFont("Helvetica", 10)
        c.drawString(50, y, "Material")
        c.drawString(350, y, "Qty")
        c.drawString(400, y, "Unit")
        c.drawString(500, y, "Price")

        # Add items
        y -= 20
        if 'items' in estimate and isinstance(estimate['items'], list):
            for item in estimate['items']:
                if y < 50:  # Need new page
                    c.showPage()
                    y = 750
                
                c.drawString(50, y, item['name'])
                c.drawString(350, y, str(item['quantity']))
                c.drawString(400, y, item['unit'])
                c.drawRightString(550, y, f"${item['price']:.2f}")
                y -= 20

        # Add total
        c.setFont("Helvetica-Bold", 12)
        y -= 20
        c.drawString(400, y, "TOTAL")
        c.drawRightString(550, y, f"${estimate['totalCost']:.2f}")

        # Terms and conditions on new page
        c.showPage()
        c.setFont("Helvetica-Bold", 14)
        c.drawString(50, 750, "Terms and Conditions")
        
        terms = [
            "1. This estimate is valid for 30 days from the date of issue.",
            "2. A 50% deposit is required to schedule the work.",
            "3. Final payment is due upon completion of the work.",
            "4. All work comes with a 5-year workmanship warranty.",
            "5. Material warranties are provided by the manufacturers.",
            "6. Any changes to the scope of work may result in additional charges.",
            "7. 3MG Roofing is not responsible for any existing code violations.",
            "8. Customer is responsible for obtaining necessary permits.",
            "9. Work will be performed during normal business hours.",
            "10. This estimate includes normal wear and tear repairs only."
        ]

        c.setFont("Helvetica", 10)
        y = 720
        for term in terms:
            c.drawString(50, y, term)
            y -= 30

        # Signature lines
        y -= 30
        c.setFont("Helvetica", 12)
        c.drawString(50, y, "By signing below, you agree to the terms and conditions stated above:")
        
        y -= 50
        c.drawString(50, y, "_______________________")
        c.drawString(50, y - 20, "Customer Signature")
        
        y -= 40
        c.drawString(50, y, "_______________________")
        c.drawString(50, y - 20, "Date")
        
        y -= 40
        c.drawString(350, y, "_______________________")
        c.drawString(350, y - 20, "3MG Roofing Representative")
        
        y -= 40
        c.drawString(350, y, "_______________________")
        c.drawString(350, y - 20, "Date")

        # Save the PDF
        c.save()
        
        # Move buffer position to start
        buffer.seek(0)
        
        # Return the PDF
        return StreamingResponse(
            buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=estimate-{estimate['customerName'].replace(' ', '-')}.pdf"
            }
        )

    except Exception as e:
        print(f"Error generating PDF: {str(e)}")
        return Response(
            content=json.dumps({"error": "Failed to generate PDF", "details": str(e)}),
            status_code=500,
            media_type="application/json"
        )

@router.post("/process-pdf")
async def process_pdf(file: UploadFile = File(...)):
    try:
        # Read the uploaded file
        contents = await file.read()
        
        # Initialize PDF extractor
        extractor = PDFExtractor()
        
        # Extract measurements
        measurements = extractor.extract_measurements(contents)
        
        return JSONResponse(content={"measurements": measurements})
        
    except Exception as e:
        print(f"Error processing PDF: {str(e)}")
        return JSONResponse(
            content={"error": "Failed to process PDF", "details": str(e)},
            status_code=500
        ) 