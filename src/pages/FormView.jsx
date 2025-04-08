import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from '../contexts/FormContext';
import { useResponse } from '../contexts/ResponseContext';

const FormView = ({ formId: propFormId, isPreview }) => {
  const { formId: paramFormId } = useParams();
  const formId = propFormId || paramFormId;
  const { getForm } = useForm();
  const { getFormResponses } = useResponse();
  const [form, setForm] = useState(null);
  const [responses, setResponses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('summary');
  
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const formData = await getForm(formId);
        if (formData) {
          setForm(formData);
          
          if (!isPreview) {
            const responseData = await getFormResponses(formId);
            setResponses(responseData);
          }
        }
      } catch (error) {
        console.error('Error loading form data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [formId, getForm, getFormResponses, isPreview]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <p>Loading...</p>
      </div>
    );
  }
  
  if (!form) {
    return (
      <div className="p-6">
        <p>Form not found</p>
      </div>
    );
  }
  
  // For preview mode or when there are no responses
  if (isPreview || responses.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">{form.title}</h1>
        {form.description && <p className="text-gray-600 mb-6">{form.description}</p>}
        
        <div className="space-y-6">
          {form.questions.map((question) => (
            <div key={question.id} className="border-b pb-4">
              <h3 className="font-medium">{question.title}</h3>
              <p className="text-gray-500 text-sm mt-1">{question.type.replace('-', ' ')} question</p>
              {question.required && <span className="text-red-500 text-sm">Required</span>}
              
              {['multiple-choice', 'checkboxes', 'dropdown'].includes(question.type) && (
                <div className="mt-2">
                  <p className="text-sm font-medium">Options:</p>
                  <ul className="list-disc ml-5 text-sm">
                    {question.options.map((option, idx) => (
                      <li key={idx}>{option}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {!isPreview && (
          <div className="mt-8 p-6 bg-gray-50 rounded-lg text-center">
            <p className="text-lg font-medium">No responses yet</p>
            <p className="text-gray-500 mt-1">Share your form to collect responses</p>
            <div className="mt-4">
              <p className="text-sm font-medium">Share URL:</p>
              <code className="bg-gray-100 p-2 rounded block mt-1 overflow-auto">
                {window.location.origin}/f/{formId}
              </code>
            </div>
          </div>
        )}
      </div>
    );
  }
  
  // For responses view
  return (
    <div className="h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{form.title}</h1>
        <p className="text-gray-600 mt-1">{responses.length} responses</p>
      </div>
      
      <div className="mb-6 border-b">
        <div className="flex space-x-4">
          <button
            className={`pb-2 px-1 ${activeTab === 'summary' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
            onClick={() => setActiveTab('summary')}
          >
            Summary
          </button>
          <button
            className={`pb-2 px-1 ${activeTab === 'individual' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
            onClick={() => setActiveTab('individual')}
          >
            Individual Responses
          </button>
        </div>
      </div>
      
      {activeTab === 'summary' && (
        <div className="space-y-8">
          {form.questions.map((question) => {
            // Get all answers for this question
            const questionAnswers = responses
              .map(response => response.data[question.id])
              .filter(Boolean);
            
            // Calculate basic stats
            let stats;
            
            if (['multiple-choice', 'dropdown'].includes(question.type)) {
              // Calculate counts for each option
              const counts = {};
              question.options.forEach(option => {
                counts[option] = questionAnswers.filter(answer => answer === option).length;
              });
              stats = counts;
            } else if (question.type === 'checkboxes') {
              // Calculate counts for each option in checkboxes
              const counts = {};
              question.options.forEach(option => {
                counts[option] = questionAnswers.filter(
                  answer => Array.isArray(answer) && answer.includes(option)
                ).length;
              });
              stats = counts;
            }
            
            return (
              <div key={question.id} className="border-b pb-6">
                <h3 className="font-medium text-lg">{question.title}</h3>
                
                {['multiple-choice', 'dropdown', 'checkboxes'].includes(question.type) && stats && (
                  <div className="mt-4">
                    {Object.entries(stats).map(([option, count]) => {
                      const percentage = responses.length > 0 
                        ? Math.round((count / responses.length) * 100) 
                        : 0;
                      
                      return (
                        <div key={option} className="mb-2">
                          <div className="flex justify-between text-sm mb-1">
                            <span>{option}</span>
                            <span>{count} ({percentage}%)</span>
                          </div>
                          <div className="bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 rounded-full h-2" 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                
                {['short-text', 'long-text'].includes(question.type) && (
                  <div className="mt-4">
                    <p className="text-sm font-medium">Text responses:</p>
                    {questionAnswers.length > 0 ? (
                      <div className="mt-2 space-y-2">
                        {questionAnswers.map((answer, idx) => (
                          <div key={idx} className="p-2 bg-gray-50 rounded">
                            {answer}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm mt-1">No responses for this question</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      
      {activeTab === 'individual' && (
        <div>
          {responses.map((response, responseIdx) => (
            <div key={responseIdx} className="mb-8 p-4 border rounded-lg">
              <div className="flex justify-between items-center mb-4 pb-2 border-b">
                <h3 className="font-medium">Response #{responseIdx + 1}</h3>
                <p className="text-sm text-gray-500">
                  {new Date(response.submittedAt).toLocaleString()}
                </p>
              </div>
              
              <div className="space-y-4">
                {form.questions.map((question) => {
                  const answer = response.data[question.id];
                  
                  return (
                    <div key={question.id} className="grid grid-cols-3 gap-4">
                      <div className="col-span-1 font-medium">{question.title}</div>
                      <div className="col-span-2">
                        {!answer && <span className="text-gray-400">No answer</span>}
                        
                        {answer && question.type === 'checkboxes' && Array.isArray(answer) && (
                          <ul className="list-disc ml-5">
                            {answer.map((option, idx) => (
                              <li key={idx}>{option}</li>
                            ))}
                          </ul>
                        )}
                        
                        {answer && question.type !== 'checkboxes' && (
                          <span>{answer}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FormView;