import express from 'express';
import multer from 'multer';
import { processUploadedPdf } from '../services/pdfProcessingService';

export const pdfRoutes = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

pdfRoutes.post('/process-pdf', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (req.file.mimetype !== 'application/pdf') {
      return res.status(400).json({ error: 'File must be a PDF' });
    }

    const measurements = await processUploadedPdf(req.file.buffer);
    res.json(measurements);
  } catch (error) {
    console.error('Error processing PDF:', error);
    res.status(500).json({ error: error.message || 'Failed to process PDF' });
  }
}); 