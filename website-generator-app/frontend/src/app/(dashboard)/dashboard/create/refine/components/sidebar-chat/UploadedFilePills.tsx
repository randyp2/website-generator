"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Video, X } from "lucide-react";
import type { UploadedFile } from "@/types/file";

interface UploadedFilePillsProps {
    uploadedFiles: UploadedFile[];
    previewUrls: Map<string, string>;
    onRemoveFile: (index: number) => void;
}

export const UploadedFilePills: React.FC<UploadedFilePillsProps> = ({
    uploadedFiles,
    previewUrls,
    onRemoveFile,
}) => (
    <AnimatePresence>
        {uploadedFiles.length > 0 && (
            <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mb-3 flex max-h-24 flex-wrap gap-2 overflow-y-auto"
            >
                {uploadedFiles.map((file, index) => (
                    <UploadedFilePill
                        key={`pill-${file.name}-${index}`}
                        file={file}
                        index={index}
                        preview={previewUrls.get(`${file.name}-${index}`)}
                        onRemoveFile={onRemoveFile}
                    />
                ))}
            </motion.div>
        )}
    </AnimatePresence>
);

interface UploadedFilePillProps {
    file: UploadedFile;
    index: number;
    preview?: string;
    onRemoveFile: (index: number) => void;
}

const UploadedFilePill: React.FC<UploadedFilePillProps> = ({
    file,
    index,
    preview,
    onRemoveFile,
}) => {
    const isImage = file.type.startsWith("image/");

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex h-10 items-center gap-2 rounded-lg border border-border bg-muted/60 px-2 py-1.5 dark:border-white/10 dark:bg-white/5"
        >
            <div className="relative flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded bg-muted dark:bg-[#0a0f14]">
                {isImage && preview ? (
                    <Image
                        src={preview}
                        alt={file.name}
                        fill
                        unoptimized
                        className="object-cover"
                    />
                ) : (
                    <Video className="h-4 w-4 text-muted-foreground dark:text-white/40" />
                )}
            </div>
            <span className="max-w-[100px] truncate text-xs font-medium text-muted-foreground dark:text-white/70">
                {file.name}
            </span>
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onRemoveFile(index)}
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted transition-colors hover:bg-red-500/10 dark:bg-white/10 dark:hover:bg-red-500/20"
            >
                <X className="h-3 w-3 text-muted-foreground hover:text-red-500 dark:text-white/60 dark:hover:text-red-400" />
            </motion.button>
        </motion.div>
    );
};
