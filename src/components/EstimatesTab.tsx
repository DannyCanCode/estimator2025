import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Button, Grid, Box } from '@mui/material';
import { Estimate } from '../types/estimate';
import { estimateService } from '../services/estimateService';
import { toast } from 'react-hot-toast';

export const EstimatesTab: React.FC = () => {
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEstimates();
  }, []);

  const loadEstimates = async () => {
    try {
      setLoading(true);
      const data = await estimateService.getEstimates();
      setEstimates(data);
    } catch (error) {
      toast.error('Failed to load estimates');
      console.error('Error loading estimates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (estimate: Estimate) => {
    try {
      setLoading(true);
      const blob = await estimateService.generatePDF(estimate);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `estimate-${estimate.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast.error('Failed to download PDF');
      console.error('Error downloading PDF:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Saved Estimates
      </Typography>
      <Grid container spacing={3}>
        {estimates.map((estimate) => (
          <Grid item xs={12} sm={6} md={4} key={estimate.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {estimate.customerName}
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  {new Date(estimate.date).toLocaleDateString()}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  {estimate.address}
                </Typography>
                <Typography variant="h6" color="primary">
                  ${estimate.totalCost.toLocaleString()}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleDownloadPDF(estimate)}
                    disabled={loading}
                    fullWidth
                  >
                    Download PDF
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}; 