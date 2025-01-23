import { NextResponse } from 'next/server';
import PDFDocument from 'pdfkit';

export async function POST(req: Request) {
  try {
    const estimate = await req.json();
    
    // Create a PDF document
    const doc = new PDFDocument({ 
      margin: 50,
      size: 'LETTER'  // Use standard letter size
    });
    
    const chunks: Buffer[] = [];

    // Collect PDF data chunks
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    
    // Company Header
    doc.fontSize(20)
      .text('3MG ROOFING', 50, 50, { align: 'left' })
      .fontSize(10)
      .text(estimate.companyInfo.address, 50, 75)
      .text(`${estimate.companyInfo.city}, ${estimate.companyInfo.state} ${estimate.companyInfo.zip}`, 50, 90)
      .text(`Phone: ${estimate.companyInfo.phone}`, 50, 105);

    // Date and Claim Information
    doc.fontSize(12)
      .text(new Date().toLocaleDateString(), 500, 50, { align: 'right' })
      .text('Claim Information', 500, 65, { align: 'right' })
      .text('RETAIL', 500, 80, { align: 'right' });

    // Company Representative
    doc.fontSize(12)
      .text('Company Representative', 50, 140)
      .text(estimate.companyInfo.representative, 50, 155)
      .text(`Phone: ${estimate.companyInfo.repPhone}`, 50, 170)
      .text(estimate.companyInfo.email, 50, 185);

    // Customer Information
    doc.fontSize(12)
      .text('Job:', 350, 140)
      .text(estimate.customerName, 350, 155)
      .text(estimate.address, 350, 170);

    // Materials Section
    doc.moveDown(2)
      .fontSize(14)
      .text('3MG Roof Replacement Section', 50, 220)
      .moveDown();

    // Create table headers
    const tableTop = 250;
    doc.fontSize(10)
      .text('Material', 50, tableTop)
      .text('Qty', 350, tableTop)
      .text('Unit', 400, tableTop)
      .text('Price', 500, tableTop);

    // Add items
    let y = tableTop + 20;
    estimate.items.forEach((item: any) => {
      if (y > 700) {  // Check if we need a new page
        doc.addPage();
        y = 50;  // Reset Y position on new page
      }
      
      doc.text(item.name, 50, y)
        .text(item.quantity.toString(), 350, y)
        .text(item.unit, 400, y)
        .text(`$${item.price.toFixed(2)}`, 500, y);
      
      y += 20;  // Move down for next item
    });

    // Add totals
    doc.moveDown(2)
      .fontSize(12)
      .text('TOTAL', 400, y)
      .text(`$${estimate.totalCost.toFixed(2)}`, 500, y);

    // Add terms and conditions on a new page
    doc.addPage()
      .fontSize(14)
      .text('Terms and Conditions', 50, 50)
      .moveDown()
      .fontSize(10)
      .text([
        '1. This estimate is valid for 30 days from the date of issue.',
        '2. A 50% deposit is required to schedule the work.',
        '3. Final payment is due upon completion of the work.',
        '4. All work comes with a 5-year workmanship warranty.',
        '5. Material warranties are provided by the manufacturers.',
        '6. Any changes to the scope of work may result in additional charges.',
        '7. 3MG Roofing is not responsible for any existing code violations.',
        '8. Customer is responsible for obtaining necessary permits.',
        '9. Work will be performed during normal business hours.',
        '10. This estimate includes normal wear and tear repairs only.'
      ].join('\n\n'));

    // Add signature lines
    doc.moveDown(4)
      .fontSize(12)
      .text('By signing below, you agree to the terms and conditions stated above:', 50)
      .moveDown(2)
      .text('_______________________', 50)
      .text('Customer Signature', 50)
      .moveDown()
      .text('_______________________', 50)
      .text('Date', 50)
      .moveDown(2)
      .text('_______________________', 350)
      .text('3MG Roofing Representative', 350)
      .moveDown()
      .text('_______________________', 350)
      .text('Date', 350);

    // Finalize the PDF
    doc.end();

    // Wait for all chunks to be collected
    const pdfBuffer = Buffer.concat(chunks);

    // Return the PDF as a response
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=estimate-${estimate.customerName.replace(/\s+/g, '-')}.pdf`
      }
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to generate PDF' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 