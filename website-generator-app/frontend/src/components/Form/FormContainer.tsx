import React, { useReducer, useState } from "react";
import { initialState, type FormState, type FormAction } from "../../types/formTypes";
import { formReducer } from "./hooks/useReducerHook";
import { AnimatePresence, motion } from "framer-motion";
import { FiCheck, FiChevronLeft, FiChevronRight, FiZap } from "react-icons/fi";
import ProgressIndicator from "./ProgressIndicator";
import StepBasicInfo from "../StepBasicInfo";
import StepSkills from "./StepSkills";
import StepContact from "./StepContact";
import StepStyle from "./StepStyle";
import StepCustom from "./StepCustom";



interface FormProps {
  state: FormState;
  dispatch: React.ActionDispatch<[action: FormAction]>
  onGenerate: (data: FormState) => void;
  isLoading: boolean;

}

const FormContainer: React.FC<FormProps> = ({ state, dispatch, onGenerate, isLoading }) => {
  
  const [skillInput, setSkillInput] = useState<string>('');

  const updateField = (field: keyof FormState, value: string | string[]) => {
    dispatch({ type: 'UPDATE_FIELD', field, value });
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !state.skills.includes(skillInput.trim())) {
      updateField('skills', [...state.skills, skillInput.trim()]); // Update skills/add skills
      setSkillInput(''); // Reset skill input
    }
  };

  const removeSkill = (skill: string) => {
    updateField('skills', state.skills.filter(s => s !== skill));
  };

  const steps = [
    { title: "Basic Info", component: <StepBasicInfo state={state} updateField={updateField} /> },
    { title: "Skills", component: <StepSkills state={state} handleAddSkill={handleAddSkill} removeSkill={removeSkill} skillInput={skillInput} setSkillInput={setSkillInput} /> },
    { title: "Contact", component: <StepContact state={state} updateField={updateField} /> },
    { title: "Style", component: <StepStyle state={state} updateField={updateField} /> },
    { title: "Custom", component: <StepCustom state={state} updateField={updateField} /> },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 shadow-2xl border border-gray-700 backdrop-blur-lg"
    >
      {/* Progress Indicator */}
      <ProgressIndicator currentStep={state.currentStep} steps={steps} />

      {/* Form Steps */}
      {/* Step Transitions */}
      <AnimatePresence mode="wait">
        <motion.div
          key={state.currentStep}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {steps[state.currentStep].component}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <button
          onClick={() => dispatch({ type: 'PREV_STEP' })}
          disabled={state.currentStep === 0}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all hover:cursor-pointer ${state.currentStep === 0
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-gray-700 hover:bg-gray-600'
            }`}
        >
          <FiChevronLeft />
          Back
        </button>

        {
          state.currentStep < steps.length - 1 ? 
          (

            // Display next button if not on last step
            <button
              onClick={() => dispatch({ type: 'NEXT_STEP' })}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/50 transition-all hover:cursor-pointer"
            >
              Next
              <FiChevronRight />
            </button>
          ) :
          (
            <button
              onClick={() => onGenerate(state)}
              disabled={isLoading}
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                  Generating...
                </>
              ) : (
                <>
                  <FiZap />
                  Generate
                </>
              )}
            </button>
          )
        }
      </div>
    </motion.div>
  );

}

export default FormContainer;