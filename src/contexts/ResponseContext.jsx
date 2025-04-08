import React, { createContext, useContext, useState, useEffect } from 'react';
import { openDB } from 'idb';

const ResponseContext = createContext();

export const useResponse = () => useContext(ResponseContext);

export const ResponseProvider = ({ children }) => {
  const [responses, setResponses] = useState([]);
  const [formResponses, setFormResponses] = useState([]);
  
  // Get responses for a specific form
  const getFormResponses = async (formId) => {
    const db = await openDB('forms-clone-db', 1);
    
    // Check if the index exists and create it if not
    const tx = db.transaction('responses', 'readwrite');
    if (!tx.store.indexNames.contains('formId')) {
      await db.close();
      const dbUpgrade = await openDB('forms-clone-db', 2, {
        upgrade(db) {
          const store = db.objectStoreNames.contains('responses') 
            ? db.transaction.objectStore('responses') 
            : db.createObjectStore('responses', { keyPath: 'id' });
          if (!store.indexNames.contains('formId')) {
            store.createIndex('formId', 'formId', { unique: false });
          }
        }
      });
      await dbUpgrade.close();
    }
    await tx.done;
    
    // Now get responses using the index
    const db2 = await openDB('forms-clone-db', 2);
    const index = db2.transaction('responses').store.index('formId');
    const formResponses = await index.getAll(formId);
    
    setFormResponses(formResponses);
    return formResponses;
  };
  
  // Submit a new response
  const submitResponse = async (formId, responseData) => {
    const newResponse = {
      id: Date.now().toString(),
      formId,
      data: responseData,
      submittedAt: new Date()
    };
    
    const db = await openDB('forms-clone-db', 2);
    await db.add('responses', newResponse);
    
    return newResponse;
  };
  
  // Get response counts for all forms
  const getResponseCounts = async () => {
    const db = await openDB('forms-clone-db', 2);
    const forms = await db.getAll('forms');
    const responses = await db.getAll('responses');
    
    const counts = {};
    responses.forEach(response => {
      counts[response.formId] = (counts[response.formId] || 0) + 1;
    });
    
    return counts;
  };
  
  return (
    <ResponseContext.Provider 
      value={{ 
        responses, 
        formResponses, 
        getFormResponses, 
        submitResponse,
        getResponseCounts
      }}
    >
      {children}
    </ResponseContext.Provider>
  );
};