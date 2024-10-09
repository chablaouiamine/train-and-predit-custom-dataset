import React, { useState } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MainPage from './MainPage';
import TrainingPage from './TrainingPage';
import PredictionPage from './PredictionPage';


function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<TrainingPage />} />
        <Route path="/predict" element={<PredictionPage />} />
      </Routes>
    </Router>
  );
}

export default App;