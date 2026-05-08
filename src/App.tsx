import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import GroundLesson from './components/GroundLesson';
import FlightLesson from './components/FlightLesson';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<div>Dashboard Placeholder</div>} />
          <Route path="rating" element={<div>Rating Placeholder</div>} />
          <Route path="lesson-type" element={<div>Lesson Type Placeholder</div>} />
          <Route path="ground-lesson" element={<GroundLesson />} />
          <Route path="flight-lesson" element={<FlightLesson />} />
          <Route path="history" element={<div>History Placeholder</div>} />
          <Route path="auth" element={<div>Auth Placeholder</div>} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}
