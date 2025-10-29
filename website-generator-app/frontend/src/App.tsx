import { motion } from "framer-motion";
import React, { useEffect, useReducer, useState } from "react";

import { initialState } from "./types/formTypes";
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


  // Test backend connection 
  const handlePing = async () => {
    try {
      const response: Response = await fetch("http://localhost:8080/api/generate/ping");
      const text: string = await response.text();
      console.log("Ping response:", text);
      alert(text);
    } catch (error) {
      console.error("Error connecting to backend:", error);
    alert("Failed to connect to backend!");
    }
  }

  

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold bg-linear-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent mb-3">
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

      <div className="border-2 border-solid bg-white/20 text-7xl">
        <button 
          className="hover:cursor-pointer"
          onClick={() => handlePing()}
        >Hello</button>
      </div>
    </div>
    
  );
}

export default App
