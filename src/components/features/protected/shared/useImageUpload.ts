"use client";

import * as React from "react";

import type {
  ImageUploadError,
  ImageUploadResult,
} from "./image-type";

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE_MB = 5;

interface UseImageUploadOptions {
  onUploaded?: (result: ImageUploadResult) => void;
  onError?: (error: ImageUploadError) => void;
  validate?: (file: File) => string | null;
}

export function useImageUpload(options: UseImageUploadOptions = {}) {
  const { onUploaded, onError, validate } = options;

  const [isUploading, setIsUploading] = React.useState(false);
  const [errors, setErrors] = React.useState<ImageUploadError[]>([]);
  const [results, setResults] = React.useState<ImageUploadResult[]>([]);

  const reset = React.useCallback(() => {
    setErrors([]);
    setResults([]);
  }, []);

  const validateFile = React.useCallback(
    (file: File): string | null => {
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        return "File must be a JPEG, PNG or WEBP image.";
      }
      if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
        return `Image must be ${MAX_IMAGE_SIZE_MB}MB or smaller.`;
      }
      if (validate) return validate(file);
      return null;
    },
    [validate],
  );

  const uploadFile = React.useCallback(
    async (file: File): Promise<ImageUploadResult | null> => {
      const validationError = validateFile(file);
      if (validationError) {
        const err = { file: file.name, reason: validationError };
        setErrors((prev) => [...prev, err]);
        onError?.(err);
        return null;
      }

      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch("/api/image", {
          method: "POST",
          body: formData,
        });

        const payload = await response.json().catch(() => null);

        if (!response.ok) {
          const reason = payload?.message ?? "Upload failed on the server.";
          const err = { file: file.name, reason };
          setErrors((prev) => [...prev, err]);
          onError?.(err);
          return null;
        }

        const result = payload?.data as ImageUploadResult;
        if (result) {
          setResults((prev) => [...prev, result]);
          onUploaded?.(result);
        }
        return result ?? null;
      } catch {
        const err = { file: file.name, reason: "Network error during upload." };
        setErrors((prev) => [...prev, err]);
        onError?.(err);
        return null;
      }
    },
    [onError, onUploaded, validateFile],
  );

  const uploadFiles = React.useCallback(
    async (files: File[]) => {
      setIsUploading(true);
      setErrors([]);
      try {
        const uploaded: ImageUploadResult[] = [];
        for (const file of files) {
          const result = await uploadFile(file);
          if (result) uploaded.push(result);
        }
        return uploaded;
      } finally {
        setIsUploading(false);
      }
    },
    [uploadFile],
  );

  return {
    isUploading,
    errors,
    results,
    uploadFiles,
    reset,
  };
}