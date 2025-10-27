import React from "react";
import type { FormState } from "../../types/formTypes";

interface StepCustomProps {
    state: FormState;
    updateField: (field: keyof FormState, value: string | string[]) => void;
}

const StepCustom: React.FC<StepCustomProps> = ({ state, updateField }) => {
    return (
        <>
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Custom Section Title (Optional)
                </label>
                <input
                    type="text"
                    value={state.customSectionTitle}
                    onChange={(e) => updateField('customSectionTitle', e.target.value)}
                    className="w-full bg-gray-800/50 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                    placeholder="e.g., Featured Projects"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Custom Section Content (Optional)
                </label>
                <textarea
                    value={state.customSectionContent}
                    onChange={(e) => updateField('customSectionContent', e.target.value)}
                    rows={6}
                    className="w-full bg-gray-800/50 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all resize-none"
                    placeholder="Add any custom content here..."
                />
            </div>
        </>
    );
}


export default StepCustom;