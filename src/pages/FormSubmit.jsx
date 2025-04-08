import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from '../contexts/FormContext';
import { useResponse } from '../contexts/ResponseContext';
import FormElement from '../components/FormElement';

const FormSubmit = () => {
  const { formId } = useParams();
  const navigate = useNavigate();
  const { getForm } = useForm();
  const { submitResponse } = useResponse();
  const [form, setForm] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [answers, setAnswers] = useState({});
  const [errors, setErrors] = useState({});
  
  useEffect(() => {
    const loadForm = async () => {
      setIsLoading(true);
      try {
        const formData = await getForm(formId);
        if (formData) {
          setForm(formData);
        } else {
          navigate('/not-found');
        }
      } catch (error) {
        console.error('Error loading form:', error);
        navigate('/not-found');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadForm();
  }, [formId, getForm, navigate]);
  
  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
    
    // Clear error for this question
    if (errors[questionId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    form.questions.forEach(question => {
      if (question.required) {
        const answer = answers[question.id];
        if (!answer || (Array.isArray(answer) && answer.length === 0)) {
          newErrors[question.id] = 'This question requires an answer';
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Scroll to first error
      const firstErrorId = Object.keys(errors)[0];
      document.getElementById(firstErrorId)?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    
    setIsSubmitting(true);
    try {
      await submitResponse(formId, answers);
      setSubmitted(true);
      // Clear answers
      setAnswers({});
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to submit form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }
  
  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-green-600 mb-4">Form Submitted!</h2>
            <p className="text-gray-600 mb-6">Thank you for submitting the form.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Submit Another Response
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
            <h1 className="text-2xl font-medium mb-2">{form.title}</h1>
            {form.description && (
              <p className="text-gray-600 mb-4">{form.description}</p>
            )}
          </div>
          
          {form.questions.map((question) => (
            <div key={question.id} id={question.id} className="bg-white rounded-lg shadow-sm p-6 mb-4">
              <FormElement
                question={question}
                answer={answers[question.id]}
                onChange={handleAnswerChange}
              />
              {errors[question.id] && (
                <p className="text-red-500 text-sm mt-1">{errors[question.id]}</p>
              )}
            </div>
          ))}
          
          <div className="flex justify-between mt-4">
            <div></div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormSubmit;