import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pdfRoutes } from './routes/pdfRoutes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3008;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api', pdfRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 