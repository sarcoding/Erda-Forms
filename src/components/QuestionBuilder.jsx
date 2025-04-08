import React, { useState } from 'react';

const QuestionBuilder = ({ question, onChange, onDelete }) => {
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  
  const handleChange = (field, value) => {
    onChange({
      ...question,
      [field]: value
    });
  };
  
  const handleOptionChange = (index, value) => {
    const newOptions = [...question.options];
    newOptions[index] = value;
    handleChange('options', newOptions);
  };
  
  const addOption = () => {
    handleChange('options', [...(question.options || []), `Option ${(question.options || []).length + 1}`]);
  };
  
  const removeOption = (index) => {
    const newOptions = [...question.options];
    newOptions.splice(index, 1);
    handleChange('options', newOptions);
  };
  
  return (
    <div className="border rounded-lg p-4 mb-4 bg-white shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <div className="flex-1">
          <input
            type="text"
            className="w-full text-lg font-medium border-b-2 border-blue-500 focus:outline-none"
            placeholder="Question"
            value={question.title || ''}
            onChange={(e) => handleChange('title', e.target.value)}
          />
        </div>
        
        <div className="ml-4">
          <select
            className="border rounded px-2 py-1"
            value={question.type || 'short-text'}
            onChange={(e) => handleChange('type', e.target.value)}
          >
            <option value="short-text">Short answer</option>
            <option value="long-text">Paragraph</option>
            <option value="multiple-choice">Multiple choice</option>
            <option value="checkboxes">Checkboxes</option>
            <option value="dropdown">Dropdown</option>
          </select>
        </div>
      </div>
      
      {['multiple-choice', 'checkboxes', 'dropdown'].includes(question.type) && (
        <div className="mb-4">
          <div className="mb-2">Options:</div>
          {(question.options || []).map((option, index) => (
            <div key={index} className="flex items-center mb-2">
              <input
                type={question.type === 'multiple-choice' ? 'radio' : 'checkbox'}
                disabled
                className="mr-2"
              />
              <input
                type="text"
                className="flex-1 border rounded px-2 py-1"
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
              />
              <button
                type="button"
                className="ml-2 text-red-500"
                onClick={() => removeOption(index)}
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            className="text-blue-500 mt-2"
            onClick={addOption}
          >
            Add option
          </button>
        </div>
      )}
      
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id={`required-${question.id}`}
            checked={question.required || false}
            onChange={(e) => handleChange('required', e.target.checked)}
            className="mr-2"
          />
          <label htmlFor={`required-${question.id}`}>Required</label>
        </div>
        
        <div className="flex">
          <button
            type="button"
            className="text-gray-500 mr-4"
            onClick={() => setIsOptionsOpen(!isOptionsOpen)}
          >
            Advanced options
          </button>
          <button
            type="button"
            className="text-red-500"
            onClick={onDelete}
          >
            Delete
          </button>
        </div>
      </div>
      
      {isOptionsOpen && (
        <div className="mt-4 pt-4 border-t">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Help Text
            </label>
            <input
              type="text"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Help text for this question"
              value={question.helpText || ''}
              onChange={(e) => handleChange('helpText', e.target.value)}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Placeholder
            </label>
            <input
              type="text"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Placeholder text"
              value={question.placeholder || ''}
              onChange={(e) => handleChange('placeholder', e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionBuilder;