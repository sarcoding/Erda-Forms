import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useResponse } from '../contexts/ResponseContext';

const FormCard = ({ form, onView, onDelete }) => {
  const [responseCount, setResponseCount] = useState(0);
  const navigate = useNavigate();
  const { getFormResponses } = useResponse();
  
  useEffect(() => {
    const fetchResponses = async () => {
      const responses = await getFormResponses(form.id);
      setResponseCount(responses.length);
    };
    
    fetchResponses();
  }, [form.id, getFormResponses]);
  
  const handleEdit = (e) => {
    e.stopPropagation();
    navigate(`/forms/edit/${form.id}`);
  };
  
  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this form?')) {
      onDelete(form.id);
    }
  };
  
  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-all hover:shadow-lg"
      onDoubleClick={() => onView(form.id)}
    >
      <div className="p-4 border-b">
        <h3 className="text-lg font-medium text-gray-900 truncate">{form.title}</h3>
        <p className="text-sm text-gray-500 mt-1 truncate">{form.description || 'No description'}</p>
      </div>
      
      <div className="px-4 py-3 bg-gray-50 flex justify-between items-center">
        <div>
          <p className="text-xs text-gray-500">Created: {new Date(form.createdAt).toLocaleDateString()}</p>
          <p className="text-xs text-gray-500 mt-1">{responseCount} responses</p>
        </div>
        
        <div className="flex space-x-2">
          <button 
            onClick={handleEdit}
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
          >
            Edit
          </button>
          <button 
            onClick={handleDelete}
            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormCard;