"use client";

import { ImagePlus, Link2, Loader2, Plus, UploadCloud, X } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useImageUpload } from "./useImageUpload";
import type {
  ImageUploadError,
  ImageUploadResult,
} from "./image-type";
import { cn } from "@/lib/utils";

interface UploadedImageValue {
  url: string;
  imageId?: string;
  _id?: string;
}

interface ImageDropZoneProps {
  mode?: "single" | "multiple";
  value?: UploadedImageValue[];
  onChange?: (images: UploadedImageValue[]) => void;
  maxImages?: number;
  className?: string;
  disabled?: boolean;
}

export function ImageDropZone({
  mode = "single",
  value = [],
  onChange,
  maxImages = mode === "single" ? 1 : 8,
  className,
  disabled = false,
}: ImageDropZoneProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = React.useState(false);
  const [urlInput, setUrlInput] = React.useState("");
  const [urlError, setUrlError] = React.useState<string | null>(null);

  const { isUploading, errors, uploadFiles } = useImageUpload({
    onUploaded: (result) => {
      const next =
        mode === "single" ? [result] : [...value, result].slice(0, maxImages);
      onChange?.(next);
    },
  });

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || disabled || isUploading) return;
    const files = Array.from(fileList);

    if (mode === "single") {
      onChange?.([]);
    }

    const uploaded = await uploadFiles(files);
    if (mode === "single") {
      const first = uploaded[0] as ImageUploadResult | undefined;
      if (first) onChange?.([first]);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
    void handleFiles(event.dataTransfer.files);
  };

  const removeImage = (index: number) => {
    onChange?.(value.filter((_, i) => i !== index));
  };

  const addByUrl = () => {
    if (disabled || isUploading) return;
    if (mode === "multiple" && remaining <= 0) return;
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    let parsed: URL;
    try {
      parsed = new URL(trimmed);
    } catch {
      setUrlError("Enter a valid image URL.");
      return;
    }
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      setUrlError("URL must start with http:// or https://");
      return;
    }
    const next =
      mode === "single"
        ? [{ url: trimmed }]
        : [...value, { url: trimmed }].slice(0, maxImages);
    onChange?.(next);
    setUrlInput("");
    setUrlError(null);
  };

  const remaining = maxImages - value.length;

  return (
    <div className={cn("flex w-full flex-col gap-3", className)}>
      <div
        role="button"
        tabIndex={0}
        aria-disabled={disabled || isUploading || remaining <= 0}
        onClick={() => {
          if (!disabled && !isUploading && remaining > 0) inputRef.current?.click();
        }}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled && remaining > 0) setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            if (!disabled && !isUploading && remaining > 0) inputRef.current?.click();
          }
        }}
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-center transition-colors",
          dragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/30",
          (disabled || isUploading || remaining <= 0) &&
            "pointer-events-none cursor-not-allowed opacity-60",
          "cursor-pointer",
        )}
      >
        {isUploading ? (
          <>
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Uploading…</p>
          </>
        ) : (
          <>
            <UploadCloud className="size-8 text-muted-foreground" />
            <p className="text-sm font-medium">
              Drag & drop or{" "}
              <span className="text-primary underline-offset-4 hover:underline">
                browse
              </span>{" "}
              {mode === "single" ? "an image" : "images"}
            </p>
            <p className="text-xs text-muted-foreground">
              JPEG, PNG or WEBP · max 5MB
              {mode === "multiple" && remaining > 0
                ? ` · ${remaining} slot${remaining === 1 ? "" : "s"} left`
                : ""}
            </p>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple={mode === "multiple"}
        className="hidden"
        onChange={(event) => {
          void handleFiles(event.target.files);
          event.target.value = "";
        }}
      />

      {(mode === "single" || remaining > 0) && (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Link2 className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="url"
                value={urlInput}
                placeholder="Or paste an image URL"
                aria-label="Image URL"
                className="pl-9"
                onChange={(event) => {
                  setUrlInput(event.target.value);
                  setUrlError(null);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addByUrl();
                  }
                }}
              />
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={disabled || isUploading || !urlInput.trim()}
              onClick={addByUrl}
            >
              <Plus className="size-4" />
              Add
            </Button>
          </div>
          {urlError && <p className="text-xs text-destructive">{urlError}</p>}
        </div>
      )}

      {errors.length > 0 && (
        <ul className="flex flex-col gap-1">
          {errors.map((error) => (
            <li key={`${error.file}-${error.reason}`} className="text-xs text-destructive">
              {error.file}: {error.reason}
            </li>
          ))}
        </ul>
      )}

      {value.length > 0 && (
        <div
          className={cn(
            "grid gap-3",
            mode === "multiple" ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4" : "grid-cols-1",
          )}
        >
          {value.map((image, index) => (
            <div key={image.url} className="group relative overflow-hidden rounded-lg border">
              <img
                src={image.url}
                alt={`Uploaded image ${index + 1}`}
                className="aspect-square w-full object-cover"
              />
              <span className="absolute top-2 left-2 rounded bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white">
                Image {index + 1}
              </span>
              <button
                type="button"
                aria-label={`Remove image ${index + 1}`}
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 flex size-7 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive"
              >
                <X className="size-4" />
              </button>
              {image.imageId && (
                <span className="absolute bottom-2 left-2 max-w-[70%] truncate rounded bg-black/60 px-2 py-0.5 text-[10px] text-white">
                  {image.imageId}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {mode === "single" && value.length === 0 && !isUploading && (
        <div className="hidden items-center gap-1 text-xs text-muted-foreground">
          <ImagePlus className="size-3.5" />
          Uploading is optional until a file is selected.
        </div>
      )}
    </div>
  );
}