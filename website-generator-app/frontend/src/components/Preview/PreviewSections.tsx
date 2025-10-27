import React from "react";
import type { FormState } from "../../types/formTypes";
import { motion } from "framer-motion";


interface PreviewSectionsProps {
    formData: FormState | null;
    isLoading: boolean;
}


const PreviewSections: React.FC<PreviewSectionsProps> = ({ formData, isLoading}) => {
    if (!formData) return null;

    const {
      name,
      tagline,
      about,
      skills,
      email,
      github,
      linkedin,
      customSectionTitle,
      customSectionContent,
    } = formData;
  
    return (
      <motion.div
        key="preview"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full"
      >
        <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent mb-2">
              {name || "Your Name"}
            </h2>
            <p className="text-xl text-gray-400 mb-6">
              {tagline || "Your Tagline"}
            </p>
          </motion.div>
  
          {/* About */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-6"
          >
            <h3 className="text-lg font-semibold text-green-400 mb-2">About</h3>
            <p className="text-gray-300 leading-relaxed">
              {about || "Your about section will appear here..."}
            </p>
          </motion.div>
  
          {/* Skills */}
          {skills.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-6"
            >
              <h3 className="text-lg font-semibold text-green-400 mb-3">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-green-500/20 border border-green-500/50 rounded-full text-green-300 text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
  
          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex gap-4 text-sm"
          >
            {email && (
              <a
                href={`mailto:${email}`}
                className="text-green-400 hover:text-green-300 transition-colors"
              >
                Email
              </a>
            )}
            {github && (
              <a
                href={github}
                className="text-green-400 hover:text-green-300 transition-colors"
              >
                GitHub
              </a>
            )}
            {linkedin && (
              <a
                href={linkedin}
                className="text-green-400 hover:text-green-300 transition-colors"
              >
                LinkedIn
              </a>
            )}
          </motion.div>
  
          {/* Custom Section */}
          {customSectionTitle && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-6 pt-6 border-t border-gray-700"
            >
              <h3 className="text-lg font-semibold text-green-400 mb-2">
                {customSectionTitle}
              </h3>
              <p className="text-gray-300">
                {customSectionContent || "Custom content will appear here..."}
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>
    );
}


export default PreviewSections;