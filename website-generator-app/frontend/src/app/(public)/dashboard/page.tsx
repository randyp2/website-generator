"use client";

import React, { useEffect, useReducer, useState } from "react";
import { motion } from "framer-motion";
import FormContainer from "@/app/(public)/dashboard/components/FormContainer";

import { formReducer } from "@/webgenForm/useFormReducer";
import PreviewContainer from "@/app/(public)/dashboard/components/PreviewContainer";
import { initialState } from "@/webgenForm/formType";



export default function DashboardPage() {
  // Form state containing user's portfolio info
  const [state, dispatch] = useReducer(formReducer, initialState);
  useEffect(() => {
    console.log(state);
  }, [state])
  // Generated html/css code
  const [generatedHTML, setGeneratedHTML] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  /**
   * @brief Calls backend to generate html/css code by calling openAi API
   */
  const handleGenerate = async () => {
    setIsLoading(true);

    try {
      const response: Response = await fetch(
        "http://localhost:8080/api/generate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(state),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      console.log("Backend response received");
      const data: { html: string } = await response.json();
      console.log("Backend JSON response:", data);

      setGeneratedHTML(data.html);
      setShowPreview(true);
    } catch (error) {
      console.error("Error generating website:", error);
    } finally {
      setIsLoading(false);
    }
    // Simulate a small delay like the real API call
  // setTimeout(() => {
  //   const testHTML = `
  //     <!DOCTYPE html>
  //     <html lang="en">
  //       <head>
  //         <meta charset="UTF-8" />
  //         <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  //         <title>Test Portfolio</title>
  //         <style>
  //           body {
  //             font-family: 'Inter', sans-serif;
  //             background: linear-gradient(135deg, #f0f9ff, #cbebff);
  //             color: #0f172a;
  //             margin: 0;
  //             display: flex;
  //             flex-direction: column;
  //             align-items: center;
  //             justify-content: center;
  //             height: 100vh;
  //             text-align: center;
  //           }
  //           h1 {
  //             font-size: 2.5rem;
  //             margin-bottom: 0.5rem;
  //             color: #0369a1;
  //           }
  //           p {
  //             max-width: 500px;
  //             color: #334155;
  //             font-size: 1.1rem;
  //           }
  //           button {
  //             margin-top: 20px;
  //             padding: 10px 20px;
  //             border: none;
  //             border-radius: 8px;
  //             background: #0ea5e9;
  //             color: white;
  //             font-weight: 600;
  //             cursor: pointer;
  //             transition: background 0.2s ease;
  //           }
  //           button:hover {
  //             background: #0284c7;
  //           }
  //         </style>
  //       </head>
  //       <body>
  //         <h1>🚀 Portfolio Preview Loaded</h1>
  //         <p>This is a test of your Next.js iframe rendering logic.</p>
  //         <button onclick="alert('Preview works!')">Click me!</button>
  //       </body>
  //     </html>
  //   `;

  //   setGeneratedHTML(testHTML);
  //   setShowPreview(true);
  //   setIsLoading(false);
  // }, 1000);
  };

  return (
    <div className="min-h-screen pt-20 bg-linear-to-br from-white via-slate-50 to-sky-50/30">
      {/* Hero Header */}
      <section className="relative py-12 px-6 overflow-hidden">
        {/* Subtle background orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            

            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-3">
              Build Your{" "}
              <span className="bg-linear-to-r from-sky-600 to-cyan-600 bg-clip-text text-transparent">
                Professional
              </span>{" "}
              Portfolio
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Fill in your details and watch AI craft your story in real-time.
              Each step brings you closer to your perfect portfolio.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Workspace */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Left Panel - Form (Takes 5 columns) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="lg:col-span-5"
          >
            <FormContainer
              state={state}
              dispatch={dispatch}
              onGenerate={handleGenerate}
              isLoading={isLoading}
            />
          </motion.div>

          {/* Right Panel - Preview (Takes 7 columns) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="lg:col-span-7"
          >
            <PreviewContainer
              formData={state}
              showPreview={showPreview}
              isLoading={isLoading}
              generatedHTML={generatedHTML ?? ""}
            />
          </motion.div>
        </div>
      </section>
    </div>
  );
};

