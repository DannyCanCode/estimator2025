from fastapi import APIRouter, UploadFile, HTTPException, File
from fastapi.responses import JSONResponse
from loguru import logger
from ..services.pdf_extractor import PDFExtractor
import traceback

router = APIRouter()
pdf_extractor = PDFExtractor()

@router.post("/process-pdf")
async def process_pdf(file: UploadFile = File(...)):
    """Process uploaded PDF and extract measurements."""
    # Get original filename, fallback to uploaded filename if not present
    filename = getattr(file, 'filename', None) or file.filename
    logger.info(f"Received file: {filename}")
    
    # Check if filename exists and has an extension
    if not filename or '.' not in filename:
        logger.error(f"Invalid filename: {filename}")
        return JSONResponse(
            status_code=400,
            content={"error": "Invalid file: Missing filename or extension"}
        )
    
    # Check if it's a PDF file
    file_extension = filename.lower().split('.')[-1]
    if file_extension != 'pdf':
        logger.error(f"Invalid file type: {file_extension}")
        return JSONResponse(
            status_code=400,
            content={"error": f"File must be a PDF, got {file_extension}"}
        )
    
    try:
        contents = await file.read()
        if not contents:
            logger.error("Empty file received")
            return JSONResponse(
                status_code=400,
                content={"error": "Empty file"}
            )
            
        response_data = pdf_extractor.extract_measurements(contents)
        if not response_data:
            logger.error("No measurements extracted from PDF")
            return JSONResponse(
                status_code=400,
                content={"error": "Could not extract measurements from PDF"}
            )
            
        logger.info(f"Extracted measurements: {response_data}")
        return JSONResponse(content=response_data)
    
    except Exception as e:
        error_msg = str(e)
        logger.error(f"Error processing PDF: {error_msg}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        return JSONResponse(
            status_code=500,
            content={"error": f"Failed to process PDF: {error_msg}"}
        )
    finally:
        await file.close() 