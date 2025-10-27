import React from "react";
import { FiCheck } from "react-icons/fi";


interface ProgressIndicatorProps {
    currentStep: number;
    steps: { title: string }[];
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ currentStep, steps }) => {

    return (
        <div className="flex justify-between mb-8">
            {steps.map((step, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                    {/* If we are passed the current step then highlight green and check it */}
                    <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 
                                    ${index === currentStep
                                        ? "bg-gradient-to-r from-green-400 to-emerald-500 scale-110"
                                        : index < currentStep
                                            ? "bg-green-600"
                                            : "bg-gray-700"
                                    }
                                `}
                    >
                        {index < currentStep ? (
                            <FiCheck className="text-white" />
                        ) : (
                            <span className="text-sm font-semibold">{index + 1}</span>
                        )}
                    </div>
                    <span className="text-xs mt-2 text-gray-400">{step.title}</span>
                </div>
            ))}
        </div>
    );
}

export default ProgressIndicator;


