import { motion, AnimatePresence } from "framer-motion";
import React, { useEffect, useEffectEvent, useReducer, useState } from "react";
import { FiChevronRight, FiChevronLeft, FiZap, FiCheck } from 'react-icons/fi';
import { initialState, type FormAction, type FormState } from "./types/formTypes";
import { formReducer } from "./components/Form/hooks/useReducerHook";
import FormContainer from "./components/Form/FormContainer";
import PreviewContainer from "./components/Preview/PreviewContainer";




const App: React.FC = () => {
  const [state, dispatch] = useReducer(formReducer, initialState);
  useEffect(() => {
    console.log("Form State Updated:", state);
  }, [state]);

  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  

  

  const handleGenerate = async () => {
    setIsLoading(true);
    
    // TODO: Replace with actual API call
    // const response = await fetch('/api/generate', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(state)
    // });
    // const data = await response.json();
    
    // Simulate API delay
    setTimeout(() => {
      setIsLoading(false);
      setShowPreview(true);
    }, 2000);
  };

  

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent mb-3">
            Bit2Byte AI Website Generator
          </h1>
          <p className="text-gray-400 text-lg">Create your portfolio in minutes</p>
        </motion.div>

        {/* Main Layout */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Panel - Form */}
          <FormContainer state={state} dispatch={dispatch} onGenerate={handleGenerate} isLoading={isLoading} />

          {/* Right Panel: Preview */}
          <PreviewContainer
            formData={state}
            showPreview={showPreview}
            isLoading={isLoading}
          />

        </div>
      </div>
    </div>
  );
}

export default App
