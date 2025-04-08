import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from '../contexts/FormContext';
import { useAuth } from '../contexts/AuthContext';
import FormCard from '../components/FormCard';
import FormView from './FormView';

const Dashboard = () => {
  const { forms, deleteForm } = useForm();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [viewFormId, setViewFormId] = useState(null);
  
  const handleCreateForm = async () => {
    navigate('/forms/create');
  };
  
  const handleViewForm = (formId) => {
    setViewFormId(formId);
  };
  
  const handleCloseModal = () => {
    setViewFormId(null);
  };
  
  const handleDeleteForm = async (formId) => {
    await deleteForm(formId);
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Forms Dashboard</h1>
          <div className="flex space-x-4">
            <button
              onClick={handleCreateForm}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create Form
            </button>
            <button
              onClick={logout}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {forms.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="text-xl font-medium text-gray-500">No forms yet</h2>
            <p className="mt-2 text-gray-500">Create your first form to get started</p>
            <button
              onClick={handleCreateForm}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create Form
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {forms.map(form => (
              <FormCard
                key={form.id}
                form={form}
                onView={handleViewForm}
                onDelete={handleDeleteForm}
              />
            ))}
          </div>
        )}
      </main>
      
      {viewFormId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-5/6 flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-medium">Form Preview</h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <FormView formId={viewFormId} isPreview={true} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;