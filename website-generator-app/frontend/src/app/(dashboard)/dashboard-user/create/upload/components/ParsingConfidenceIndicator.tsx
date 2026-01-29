import React from 'react';

interface ParsingConfidenceIndicatorProps {
  confidenceScore?: number;
  parsingMethod?: string;
}

/**
 * Component that displays a confidence indicator for resume parsing quality.
 *
 * Confidence levels:
 * - High (>= 0.70): Green badge
 * - Medium (0.40-0.69): Yellow badge
 * - Low (< 0.40): Red badge
 */
export default function ParsingConfidenceIndicator({
  confidenceScore,
  parsingMethod
}: ParsingConfidenceIndicatorProps) {
  // If no confidence score, don't display anything
  if (confidenceScore === undefined || confidenceScore === null) {
    return null;
  }

  // Determine confidence level and styling
  const getConfidenceLevel = () => {
    if (confidenceScore >= 0.70) {
      return {
        level: 'High',
        label: 'High Quality Parsing',
        color: 'bg-green-100 text-green-800 border-green-300',
        icon: '✓'
      };
    } else if (confidenceScore >= 0.40) {
      return {
        level: 'Medium',
        label: 'Medium Quality - Review Recommended',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        icon: '⚠'
      };
    } else {
      return {
        level: 'Low',
        label: 'Low Quality - Verify Data',
        color: 'bg-red-100 text-red-800 border-red-300',
        icon: '!'
      };
    }
  };

  const confidence = getConfidenceLevel();
  const scorePercentage = Math.round(confidenceScore * 100);

  // Format parsing method for display
  const formatParsingMethod = (method?: string) => {
    if (!method) return '';
    switch (method) {
      case 'regex':
        return 'Regex Parser';
      case 'llm':
        return 'AI-Enhanced Parser';
      case 'regex_low_confidence':
        return 'Regex Parser (Low Confidence)';
      default:
        return method;
    }
  };

  return (
    <div className="mt-4 p-4 rounded-lg border bg-white shadow-sm">
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${confidence.color}`}>
          {confidence.icon}
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${confidence.color}`}>
              {confidence.label}
            </span>
          </div>

          <div className="text-sm text-gray-600 space-y-1">
            <div>
              <span className="font-medium">Confidence Score:</span>{' '}
              <span className="font-mono">{scorePercentage}%</span>
            </div>
            {parsingMethod && (
              <div>
                <span className="font-medium">Parsing Method:</span>{' '}
                {formatParsingMethod(parsingMethod)}
              </div>
            )}
          </div>

          {/* Additional guidance based on confidence level */}
          {confidence.level === 'Medium' && (
            <p className="mt-2 text-xs text-gray-500">
              Please review the extracted information to ensure accuracy before generating your portfolio.
            </p>
          )}
          {confidence.level === 'Low' && (
            <p className="mt-2 text-xs text-gray-500">
              The parser had difficulty extracting information from your resume.
              Please carefully verify all extracted data before proceeding.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
