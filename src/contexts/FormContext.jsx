import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { openDB } from 'idb';

const FormContext = createContext();

export const useForm = () => useContext(FormContext);

const formReducer = (state, action) => {
  switch (action.type) {
    case 'SET_FORMS':
      return { ...state, forms: action.payload };
    case 'SET_CURRENT_FORM':
      return { ...state, currentForm: action.payload };
    case 'UPDATE_FORM_FIELD':
      return {
        ...state,
        currentForm: {
          ...state.currentForm,
          [action.payload.field]: action.payload.value
        }
      };
    case 'ADD_QUESTION':
      return {
        ...state,
        currentForm: {
          ...state.currentForm,
          questions: [...state.currentForm.questions, action.payload]
        }
      };
    case 'UPDATE_QUESTION':
      return {
        ...state,
        currentForm: {
          ...state.currentForm,
          questions: state.currentForm.questions.map(q => 
            q.id === action.payload.id ? action.payload : q
          )
        }
      };
    case 'DELETE_QUESTION':
      return {
        ...state,
        currentForm: {
          ...state.currentForm,
          questions: state.currentForm.questions.filter(q => q.id !== action.payload)
        }
      };
    case 'REORDER_QUESTIONS':
      return {
        ...state,
        currentForm: {
          ...state.currentForm,
          questions: action.payload
        }
      };
    default:
      return state;
  }
};

const initialState = {
  forms: [],
  currentForm: {
    id: '',
    title: 'Untitled Form',
    description: '',
    questions: [],
    createdAt: null,
    updatedAt: null,
    isPublished: false
  }
};

export const FormProvider = ({ children }) => {
  const [state, dispatch] = useReducer(formReducer, initialState);
  
  // Initialize database
  useEffect(() => {
    const initDB = async () => {
      const db = await openDB('forms-clone-db', 1, {
        upgrade(db) {
          // Create a store for forms
          if (!db.objectStoreNames.contains('forms')) {
            db.createObjectStore('forms', { keyPath: 'id' });
          }
          // Create a store for responses
          if (!db.objectStoreNames.contains('responses')) {
            db.createObjectStore('responses', { keyPath: 'id' });
          }
        },
      });
      
      // Load forms from IndexedDB
      const forms = await db.getAll('forms');
      dispatch({ type: 'SET_FORMS', payload: forms });
    };
    
    initDB();
  }, []);
  
  // Create a new form
  const createForm = async () => {
    const newForm = {
      ...initialState.currentForm,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const db = await openDB('forms-clone-db', 1);
    await db.add('forms', newForm);
    
    // Refresh forms list
    const forms = await db.getAll('forms');
    dispatch({ type: 'SET_FORMS', payload: forms });
    dispatch({ type: 'SET_CURRENT_FORM', payload: newForm });
    
    return newForm.id;
  };
  
  // Get a specific form
  const getForm = async (formId) => {
    const db = await openDB('forms-clone-db', 1);
    const form = await db.get('forms', formId);
    
    if (form) {
      dispatch({ type: 'SET_CURRENT_FORM', payload: form });
    }
    
    return form;
  };
  
  // Update a form
  const updateForm = async () => {
    const form = {
      ...state.currentForm,
      updatedAt: new Date()
    };
    
    const db = await openDB('forms-clone-db', 1);
    await db.put('forms', form);
    
    // Refresh forms list
    const forms = await db.getAll('forms');
    dispatch({ type: 'SET_FORMS', payload: forms });
    
    return form;
  };
  
  // Delete a form
  const deleteForm = async (formId) => {
    const db = await openDB('forms-clone-db', 1);
    await db.delete('forms', formId);
    
    // Delete associated responses
    const tx = db.transaction('responses', 'readwrite');
    const index = tx.store.index('formId');
    let cursor = await index.openCursor(IDBKeyRange.only(formId));
    
    while (cursor) {
      cursor.delete();
      cursor = await cursor.continue();
    }
    
    await tx.done;
    
    // Refresh forms list
    const forms = await db.getAll('forms');
    dispatch({ type: 'SET_FORMS', payload: forms });
  };
  
  return (
    <FormContext.Provider 
      value={{ 
        ...state, 
        dispatch, 
        createForm, 
        getForm, 
        updateForm, 
        deleteForm 
      }}
    >
      {children}
    </FormContext.Provider>
  );
};