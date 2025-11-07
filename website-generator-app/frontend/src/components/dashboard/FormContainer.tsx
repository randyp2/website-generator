"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiChevronLeft, FiChevronRight, FiZap, FiCheck } from "react-icons/fi";
import { FormState, FormAction } from "@/webgenForm/formType";
import StepBasicInfo from "./StepBasicInfo";
import StepContact from "./StepContact";
import StepCustom from "./StepCustom";
import StepSkills from "./StepSkills";
import StepStyle from "./StepStyle";


interface FormProps {
  state: FormState;
  dispatch: React.Dispatch<FormAction>;
  onGenerate: () => void;
  isLoading: boolean;
}

const FormContainer: React.FC<FormProps> = ({
  state,
  dispatch,
  onGenerate,
  isLoading,
}) => {
  const [skillInput, setSkillInput] = useState<string>("");

  const updateField = (field: keyof FormState, value: string | string[]) => {
    dispatch({ type: "UPDATE_FIELD", field, value });
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !state.skills.includes(skillInput.trim())) {
      updateField("skills", [...state.skills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    updateField(
      "skills",
      state.skills.filter((s) => s !== skill)
    );
  };

  const steps = [
    {
      title: "Basic Info",
      component: <StepBasicInfo state={state} updateField={updateField} />,
    },
    {
      title: "Skills",
      component: (
        <StepSkills
          state={state}
          handleAddSkill={handleAddSkill}
          removeSkill={removeSkill}
          skillInput={skillInput}
          setSkillInput={setSkillInput}
        />
      ),
    },
    {
      title: "Contact",
      component: <StepContact state={state} updateField={updateField} />,
    },
    {
      title: "Style",
      component: <StepStyle state={state} updateField={updateField} />,
    },
    {
      title: "Custom",
      component: <StepCustom state={state} updateField={updateField} />,
    },
  ];

  const isLastStep = state.currentStep === steps.length - 1;
  const progress = ((state.currentStep + 1) / steps.length) * 100;

  return (
    <div className="sticky top-24">
      {/* Card Container */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 overflow-hidden">
        {/* Header with Progress */}
        <div className="relative bg-linear-to-br from-sky-50 to-cyan-50/50 px-6 py-6 border-b border-slate-200/60">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Step {state.currentStep + 1} of {steps.length}
              </h2>
              <p className="text-sm text-slate-600 mt-0.5">
                {steps[state.currentStep].title}
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-slate-200 shadow-sm">
              <FiCheck className="w-4 h-4 text-sky-500" />
              <span className="text-sm font-medium text-slate-700">
                {progress.toFixed(0)}%
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-slate-200/50 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="h-full bg-linear-to-r from-sky-400 to-cyan-400 rounded-full"
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="px-6 py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={state.currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {steps[state.currentStep].component}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Footer */}
        <div className="px-6 py-5 bg-slate-50/50 border-t border-slate-200/60 flex items-center justify-between">
          {/* Back Button */}
          <motion.button
            whileHover={{ scale: state.currentStep === 0 ? 1 : 1.02 }}
            whileTap={{ scale: state.currentStep === 0 ? 1 : 0.98 }}
            onClick={() => dispatch({ type: "PREV_STEP" })}
            disabled={state.currentStep === 0}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all ${
              state.currentStep === 0
                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                : "bg-white border border-slate-300 text-slate-700 hover:border-slate-400 hover:shadow-sm shadow-sm"
            }`}
          >
            <FiChevronLeft className="w-4 h-4" />
            Back
          </motion.button>

          {/* Step Indicators (Mobile Hidden) */}
          <div className="hidden md:flex items-center gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === state.currentStep
                    ? "w-8 bg-sky-500"
                    : index < state.currentStep
                    ? "bg-sky-300"
                    : "bg-slate-300"
                }`}
              />
            ))}
          </div>

          {/* Next/Generate Button */}
          {!isLastStep ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => dispatch({ type: "NEXT_STEP" })}
              className="flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-sky-400 to-cyan-400 text-white rounded-lg font-semibold shadow-md shadow-sky-300/30 hover:shadow-lg hover:shadow-sky-400/40 transition-all"
            >
              Next
              <FiChevronRight className="w-4 h-4" />
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
              onClick={onGenerate}
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-2.5 bg-linear-to-r from-sky-500 to-cyan-500 text-white rounded-lg font-semibold shadow-lg shadow-sky-400/30 hover:shadow-xl hover:shadow-sky-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FiZap className="w-4 h-4" />
                  Generate Portfolio
                </>
              )}
            </motion.button>
          )}
        </div>
      </div>

      {/* Helper Text Below Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-4 px-4"
      >
        <p className="text-sm text-slate-500 text-center">
          💡{" "}
          <span className="font-medium">
            Tip: Take your time filling each section for the best results
          </span>
        </p>
      </motion.div>
    </div>
  );
};

export default FormContainer;