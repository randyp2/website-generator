import React from "react";
import type { FormState } from "../types/formTypes";

interface StepBasicInfoProps {
    state: FormState;
    updateField: (field: keyof FormState, value: string | string[]) => void;
}

const ABOUT_YOU_CHAR_LIMIT: number = 500;

const StepBasicInfo: React.FC<StepBasicInfoProps> = ({ state, updateField }) => {

    return (
        <>
            {/* Input for name of portoflio */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                <input
                    type="text"
                    value={state.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    className="w-full bg-gray-800/50 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                    placeholder="John Doe"
                />
            </div>

            {/* Input for tagline for hero */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Tagline</label>
                <input
                    type="text"
                    value={state.tagline}
                    onChange={(e) => updateField("tagline", e.target.value)}
                    className="w-full bg-gray-800/50 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                    placeholder="Full-Stack Developer & Designer"
                />
            </div>

            {/* Input for content for about section */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">About You</label>
                <textarea
                    value={state.about}
                    onChange={(e) => updateField("about", e.target.value)}
                    rows={4}
                    className="w-full bg-gray-800/50 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all resize-none"
                    placeholder="Tell us about yourself..."
                />
            </div>

            {/* Character Counter */}
            <div className="flex justify-between items-center -mt-5">
              <p className="text-gray-500 text-sm">
                Tip: Describe what you do, your passions, or your background to give AI more context.
              </p>
              <span
                className={`text-xs font-medium ${
                  state.customStyle.length >= 150 ? "text-red-400" : (state.customStyle.length >= 100 ? "text-yellow-300" : "text-gray-400")
                }`}
              >
                {state.customStyle.length}/{150}
              </span>
            </div>
        </>
    );
}

export default StepBasicInfo;