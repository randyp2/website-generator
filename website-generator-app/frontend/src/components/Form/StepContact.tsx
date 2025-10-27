import React from "react";
import type { FormState } from "../../types/formTypes";


interface StepContactProps {
    state: FormState;
    updateField: (field: keyof FormState, value: string | string[]) => void;
}

const StepContact: React.FC<StepContactProps> = ({ state, updateField }) => {
    return (
        <>
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                </label>
                <input
                    type="email"
                    value={state.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    className="w-full bg-gray-800/50 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                    placeholder="john@example.com"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    GitHub
                </label>
                <input
                    type="text"
                    value={state.github}
                    onChange={(e) => updateField('github', e.target.value)}
                    className="w-full bg-gray-800/50 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                    placeholder="github.com/johndoe"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    LinkedIn
                </label>
                <input
                    type="text"
                    value={state.linkedin}
                    onChange={(e) => updateField('linkedin', e.target.value)}
                    className="w-full bg-gray-800/50 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                    placeholder="linkedin.com/in/johndoe"
                />
            </div>
        </>
    );
}

export default StepContact;