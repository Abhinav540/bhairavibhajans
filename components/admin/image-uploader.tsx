"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, Upload, X } from "lucide-react";

const MAX_SIZE = 10 * 1024 * 1024;

interface ImageUploaderProps {
  onSelect: (url: string) => void;
  onClose: () => void;
}

export function ImageUploader({ onSelect, onClose }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickFile = (f: File | undefined) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setError("Please choose an image file (JPG, PNG, WEBP or GIF).");
      return;
    }
    if (f.size > MAX_SIZE) {
      setError("Image must be under 10 MB.");
      return;
    }
    setFile(f);
    setError(null);
    setPreview(URL.createObjectURL(f));
  };

  const chooseAgain = () => {
    if (inputRef.current) inputRef.current.click();
  };

  const upload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Could not upload the image.");
        return;
      }
      onSelect(json.url);
      onClose();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={() => !uploading && onClose()} role="presentation">
      <div
        className="admin-gallery-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Upload an image"
      >
        <div className="modal-header">
          <h2>Add Image</h2>
          <button type="button" className="close-btn" onClick={onClose} aria-label="Close" disabled={uploading}>
            <X size={18} />
          </button>
        </div>

        {!file ? (
          <button
            type="button"
            className="admin-upload-drop"
            onClick={() => inputRef.current?.click()}
          >
            <ImagePlus size={34} />
            <strong>Choose an image</strong>
            <span>From your computer, phone or gallery — JPG, PNG, WEBP, GIF (max 10 MB)</span>
          </button>
        ) : (
          <div className="admin-upload-body">
            <div className="admin-upload-preview">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {preview && <img src={preview} alt="Preview" />}
              <div className="admin-upload-file-name">
                <strong>{file.name}</strong>
                <span>{(file.size / 1024 / 1024).toFixed(1)} MB</span>
              </div>
            </div>
            {error && <p className="admin-form-error">{error}</p>}
            <div className="admin-form-actions">
              <button type="button" className="admin-ghost-btn" onClick={chooseAgain} disabled={uploading}>
                Choose Again
              </button>
              <button type="button" className="admin-accent-btn" onClick={upload} disabled={uploading}>
                {uploading ? <Loader2 size={16} className="spin" /> : <Upload size={16} />}
                {uploading ? "Uploading…" : "Upload Image"}
              </button>
            </div>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          hidden
          onChange={(e) => pickFile(e.target.files?.[0])}
        />
      </div>
    </div>
  );
}