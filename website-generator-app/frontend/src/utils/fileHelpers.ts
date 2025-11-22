/**
 * File Helper Utilities
 *
 * Utility functions for working with files throughout the application.
 */

/**
 * Format file size from bytes to human-readable string
 *
 * Converts a raw byte count into a human-readable format with appropriate units.
 * This is a pure utility function with no side effects.
 *
 * Algorithm:
 * 1. Returns "0 Bytes" for zero-byte files
 * 2. Uses base-1024 (binary) conversion (1 KB = 1024 Bytes)
 * 3. Determines appropriate unit by logarithmic calculation
 * 4. Rounds to 2 decimal places for readability
 *
 * Examples:
 * - 512 bytes → "512 Bytes"
 * - 2048 bytes → "2 KB"
 * - 1572864 bytes → "1.5 MB"
 * - 1073741824 bytes → "1 GB"
 *
 * @param bytes - File size in bytes (number)
 * @returns Human-readable file size string with unit (e.g., "2.5 MB")
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024; // Binary base (2^10)
  const sizes = ["Bytes", "KB", "MB", "GB"];
  // Calculate which unit to use based on size magnitude
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  // Convert to appropriate unit and round to 2 decimal places
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};
