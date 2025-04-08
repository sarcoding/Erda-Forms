import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { FormProvider } from './contexts/FormContext';
import { ResponseProvider } from './contexts/ResponseContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Dashboard from './pages/Dashboard';
import FormBuilder from './pages/FormBuilder';
import FormView from './pages/FormView';
import FormSubmit from './pages/FormSubmit';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import './index.css';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <FormProvider>
        <ResponseProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/forms/create" element={
                <ProtectedRoute>
                  <FormBuilder />
                </ProtectedRoute>
              } />
              <Route path="/forms/edit/:formId" element={
                <ProtectedRoute>
                  <FormBuilder />
                </ProtectedRoute>
              } />
              <Route path="/forms/view/:formId" element={
                <ProtectedRoute>
                  <FormView />
                </ProtectedRoute>
              } />
              <Route path="/f/:formId" element={<FormSubmit />} />
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </ResponseProvider>
      </FormProvider>
    </AuthProvider>
  );
}

export default App;