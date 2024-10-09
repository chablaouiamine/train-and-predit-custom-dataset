import React, { useState } from 'react';
import axios from 'axios';
import {
  Button,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  Box,
  CircularProgress,
  Snackbar,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const StyledContainer = styled(Container)(({ theme }) => ({
    marginTop: theme.spacing(8),
    display: 'flex',
    justifyContent: 'center',
  }));
  
  const StyledCard = styled(Card)(({ theme }) => ({
    maxWidth: 600,
    width: '100%',
    padding: theme.spacing(2),
  }));
  
  function TrainingPage() {
    // State variables and handlers remain the same
    const [file, setFile] = useState(null);
    const [targetVariable, setTargetVariable] = useState('');
    const [columns, setColumns] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [predictionUrl, setPredictionUrl] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setColumns([]); // Reset columns when a new file is selected
    setTargetVariable(''); // Reset target variable when a new file is selected
  };

  const handleFileUpload = async () => {
    if (!file) {
      setErrorMessage('Please select a file first.');
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/api/upload', formData);
      if (response.data && response.data.columns) {
        setColumns(response.data.columns);  // Store the received columns
        console.log('Columns received:', response.data.columns); // Debug log
      } else {
        throw new Error('No columns data in response');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setErrorMessage('Error uploading file. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTargetVariableChange = (event) => {
    setTargetVariable(event.target.value);
  };

  const handleTrainModels = async () => {
    if (!targetVariable) {
      setErrorMessage('Please select a target variable.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post('/api/train', { target_variable: targetVariable });
      setPredictionUrl(response.data.prediction_url);
    } catch (error) {
      console.error('Error training models:', error);
      setErrorMessage('Error training models. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseError = () => {
    setErrorMessage('');
  };

  return (
    <StyledContainer>
      <StyledCard elevation={3}>
        <CardContent>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            ML Model Trainer
          </Typography>
          <Box mt={2} display="flex" flexDirection="column" alignItems="center">
            <Button
              variant="contained"
              component="label"
              startIcon={<UploadFileIcon />}
            >
              Choose CSV File
              <input
                type="file"
                accept=".csv"
                hidden
                onChange={handleFileChange}
              />
            </Button>
            {file && (
              <Typography variant="body1" mt={2}>
                {file.name}
              </Typography>
            )}
            {file && (
              <Button
                variant="outlined"
                color="primary"
                onClick={handleFileUpload}
                disabled={isLoading}
                startIcon={<CloudUploadIcon />}
                sx={{ mt: 2 }}
              >
                {isLoading ? <CircularProgress size={24} /> : 'Upload'}
              </Button>
            )}
            {columns.length > 0 && (
              <FormControl fullWidth sx={{ mt: 3 }}>
                <InputLabel id="target-variable-label">
                  Target Variable
                </InputLabel>
                <Select
                  labelId="target-variable-label"
                  id="target-variable-select"
                  value={targetVariable}
                  onChange={handleTargetVariableChange}
                  label="Target Variable"
                >
                  {columns.map((column) => (
                    <MenuItem key={column} value={column}>
                      {column}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            {targetVariable && (
              <Button
                variant="contained"
                color="secondary"
                onClick={handleTrainModels}
                disabled={isLoading}
                sx={{ mt: 3 }}
              >
                {isLoading ? <CircularProgress size={24} /> : 'Train Models'}
              </Button>
            )}
            {predictionUrl && (
              <Box mt={3}>
                <Typography variant="body1">
                  Models trained successfully! Go to the{' '}
                  <Button
                    variant="text"
                    color="primary"
                    onClick={() => window.location.href = predictionUrl}
                  >
                    Prediction Page
                  </Button>
                </Typography>
              </Box>
            )}
          </Box>
        </CardContent>
      </StyledCard>
      <Snackbar
        open={!!errorMessage}
        autoHideDuration={6000}
        onClose={handleCloseError}
        message={errorMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </StyledContainer>
  );
}

export default TrainingPage;
