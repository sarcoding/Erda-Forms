import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from '../contexts/FormContext';
import QuestionBuilder from '../components/QuestionBuilder';
import FormElement from '../components/FormElement';

const FormBuilder = () => {
  const { formId } = useParams();
  const { currentForm, dispatch, createForm, getForm, updateForm } = useForm();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('edit');
  
  useEffect(() => {
    const initializeForm = async () => {
      setIsLoading(true);
      try {
        if (formId) {
          // Edit existing form
          await getForm(formId);
        } else {
          // Create new form
          const newFormId = await createForm();
          navigate(`/forms/edit/${newFormId}`, { replace: true });
        }
      } catch (error) {
        console.error('Error initializing form:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeForm();
  }, [formId, createForm, getForm, navigate]);
  
  const handleFormChange = (field, value) => {
    dispatch({
      type: 'UPDATE_FORM_FIELD',
      payload: { field, value }
    });
  };
  
  const handleAddQuestion = () => {
    const newQuestion = {
      id: Date.now().toString(),
      type: 'short-text',
      title: '',
      required: false,
      options: []
    };
    
    dispatch({
      type: 'ADD_QUESTION',
      payload: newQuestion
    });
  };
  
  const handleQuestionChange = (updatedQuestion) => {
    dispatch({
      type: 'UPDATE_QUESTION',
      payload: updatedQuestion
    });
  };
  
  const handleDeleteQuestion = (questionId) => {
    dispatch({
      type: 'DELETE_QUESTION',
      payload: questionId
    });
  };
  
  const handleSaveForm = async () => {
    setIsSaving(true);
    try {
      await updateForm();
      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving form:', error);
      alert('Failed to save form. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <input
              type="text"
              className="text-2xl font-bold border-b-2 border-transparent focus:border-blue-500 focus:outline-none"
              placeholder="Form Title"
              value={currentForm.title}
              onChange={(e) => handleFormChange('title', e.target.value)}
            />
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab(activeTab === 'edit' ? 'preview' : 'edit')}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              {activeTab === 'edit' ? 'Preview' : 'Edit'}
            </button>
            <button
              onClick={handleSaveForm}
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </header>
      
      <main className="flex-1 flex">
        {/* Edit pane */}
        {activeTab === 'edit' && (
          <div className="w-full max-w-3xl mx-auto p-4">
            <div className="mb-8">
              <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
                <input
                  type="text"
                  className="w-full text-2xl font-medium mb-2 border-b-2 border-transparent focus:border-blue-500 focus:outline-none"
                  placeholder="Form Title"
                  value={currentForm.title}
                  onChange={(e) => handleFormChange('title', e.target.value)}
                />
                <textarea
                  className="w-full border-b-2 border-transparent focus:border-blue-500 focus:outline-none"
                  placeholder="Form Description"
                  value={currentForm.description || ''}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                  rows={2}
                />
              </div>
              
              {currentForm.questions.map((question) => (
                <QuestionBuilder
                  key={question.id}
                  question={question}
                  onChange={handleQuestionChange}
                  onDelete={() => handleDeleteQuestion(question.id)}
                />
              ))}
              
              <button
                onClick={handleAddQuestion}
                className="w-full py-3 bg-white rounded-lg shadow-sm border border-gray-300 text-blue-600 font-medium hover:bg-gray-50"
              >
                + Add Question
              </button>
            </div>
          </div>
        )}
        
        {/* Preview pane */}
        {activeTab === 'preview' && (
          <div className="w-full max-w-3xl mx-auto p-4">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
              <h1 className="text-2xl font-medium mb-2">{currentForm.title}</h1>
              {currentForm.description && (
                <p className="text-gray-600 mb-4">{currentForm.description}</p>
              )}
            </div>
            
            {currentForm.questions.map((question) => (
              <div key={question.id} className="bg-white rounded-lg shadow-sm p-6 mb-4">
                <FormElement question={question} preview={true} />
              </div>
            ))}
            
            <div className="flex justify-end mt-4">
              <button
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                disabled
              >
                Submit
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default FormBuilder;