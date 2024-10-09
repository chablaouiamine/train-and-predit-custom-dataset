import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Fade from '@mui/material/Fade';
import {
    Button,
    Container,
    TextField,
    Typography,
    Box,
    CircularProgress,
    Snackbar,
    Card,
    CardContent,
} from '@mui/material';
import { styled } from '@mui/material/styles';


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

function PredictionPage() {
    // State variables and handlers remain the same
    const [features, setFeatures] = useState([]);
    const [inputValues, setInputValues] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [prediction, setPrediction] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');

    // Fetch the features from the backend
    useEffect(() => {
        const fetchFeatures = async () => {
            try {
                const response = await axios.get('/api/features');
                setFeatures(response.data.features);
                // Initialize input values as an empty object
                const initialValues = response.data.features.reduce((acc, feature) => {
                    acc[feature] = '';
                    return acc;
                }, {});
                setInputValues(initialValues);
            } catch (error) {
                setErrorMessage('Error fetching features. Please try again.');
            }
        };
        fetchFeatures();
    }, []);

    // Handle input change
    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setInputValues({
            ...inputValues,
            [name]: value,
        });
    };

    // Handle prediction form submission
    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        try {
            const response = await axios.post('/api/predict', inputValues);
            setPrediction(response.data.prediction);
        } catch (error) {
            setErrorMessage('Error making prediction. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <StyledContainer>
            <StyledCard elevation={3}>
                <CardContent>
                    <Typography variant="h4" component="h1" gutterBottom align="center">
                        Make a Prediction
                    </Typography>
                    <Box component="form" onSubmit={handleSubmit} mt={2}>
                        {features.map((feature) => (
                            <TextField
                                key={feature}
                                label={feature}
                                name={feature}
                                value={inputValues[feature]}
                                onChange={handleInputChange}
                                margin="normal"
                                fullWidth
                                required
                            />
                        ))}
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={isLoading}
                            fullWidth
                            sx={{ mt: 3 }}
                        >
                            {isLoading ? <CircularProgress size={24} /> : 'Submit'}
                        </Button>
                    </Box>
                    {/* {prediction && (
            <Box mt={4} textAlign="center">
              <Typography variant="h6" color="textSecondary">
                Prediction Result:
              </Typography>
              <Typography variant="h4" color="primary">
                {prediction}
              </Typography>
            </Box>
          )} */}
                    {prediction && (
                        <Fade in={!!prediction}>
                            <Box mt={4} textAlign="center">
                                <Typography variant="h6" color="textSecondary">
                                    Prediction Result:
                                </Typography>
                                <Typography variant="h4" color="primary">
                                    {prediction}
                                </Typography>
                            </Box>
                        </Fade>
                    )}
                </CardContent>
            </StyledCard>
            <Snackbar
                open={!!errorMessage}
                autoHideDuration={6000}
                onClose={() => setErrorMessage('')}
                message={errorMessage}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            />
        </StyledContainer>
    );
}

export default PredictionPage;
