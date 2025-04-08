import React from 'react';

const FormElement = ({ question, answer, onChange, preview = false }) => {
  const handleChange = (value) => {
    if (!preview && onChange) {
      onChange(question.id, value);
    }
  };
  
  switch (question.type) {
    case 'short-text':
      return (
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            {question.title}
            {question.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <input
            type="text"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder={question.placeholder || ''}
            value={answer || ''}
            onChange={(e) => handleChange(e.target.value)}
            disabled={preview}
            required={question.required}
          />
          {question.helpText && (
            <p className="text-gray-500 text-xs mt-1">{question.helpText}</p>
          )}
        </div>
      );
      
    case 'long-text':
      return (
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            {question.title}
            {question.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <textarea
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder={question.placeholder || ''}
            value={answer || ''}
            onChange={(e) => handleChange(e.target.value)}
            disabled={preview}
            required={question.required}
            rows={4}
          />
          {question.helpText && (
            <p className="text-gray-500 text-xs mt-1">{question.helpText}</p>
          )}
        </div>
      );
      
    case 'multiple-choice':
      return (
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            {question.title}
            {question.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {question.options.map((option, index) => (
            <div key={index} className="flex items-center mb-2">
              <input
                type="radio"
                id={`${question.id}-option-${index}`}
                name={question.id}
                value={option}
                checked={answer === option}
                onChange={() => handleChange(option)}
                disabled={preview}
                required={question.required}
                className="mr-2"
              />
              <label htmlFor={`${question.id}-option-${index}`}>{option}</label>
            </div>
          ))}
          {question.helpText && (
            <p className="text-gray-500 text-xs mt-1">{question.helpText}</p>
          )}
        </div>
      );
      
    case 'checkboxes':
      return (
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            {question.title}
            {question.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {question.options.map((option, index) => (
            <div key={index} className="flex items-center mb-2">
              <input
                type="checkbox"
                id={`${question.id}-option-${index}`}
                name={`${question.id}-option-${index}`}
                value={option}
                checked={Array.isArray(answer) && answer.includes(option)}
                onChange={(e) => {
                  const currentAnswers = Array.isArray(answer) ? [...answer] : [];
                  if (e.target.checked) {
                    handleChange([...currentAnswers, option]);
                  } else {
                    handleChange(currentAnswers.filter(a => a !== option));
                  }
                }}
                disabled={preview}
                className="mr-2"
              />
              <label htmlFor={`${question.id}-option-${index}`}>{option}</label>
            </div>
          ))}
          {question.helpText && (
            <p className="text-gray-500 text-xs mt-1">{question.helpText}</p>
          )}
        </div>
      );
      
    case 'dropdown':
      return (
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            {question.title}
            {question.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <select
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={answer || ''}
            onChange={(e) => handleChange(e.target.value)}
            disabled={preview}
            required={question.required}
          >
            <option value="">Select an option</option>
            {question.options.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
          {question.helpText && (
            <p className="text-gray-500 text-xs mt-1">{question.helpText}</p>
          )}
        </div>
      );
      
    default:
      return null;
  }
};

export default FormElement;