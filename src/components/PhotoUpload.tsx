"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Upload, X, Image as ImageIcon } from "lucide-react";
import { generateId, type MeasurementPhoto } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";

interface PhotoUploadProps {
  photos: MeasurementPhoto[];
  onChange: (photos: MeasurementPhoto[]) => void;
}

export function PhotoUpload({ photos, onChange }: PhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newPhoto: MeasurementPhoto = {
          id: generateId(),
          url: reader.result as string,
          label: file.name.split(".")[0] || "Measurement Photo",
          createdAt: new Date().toISOString(),
        };
        onChange([...photos, newPhoto]);
      };
      reader.readAsDataURL(file);
    });
    
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  const removePhoto = (id: string) => {
    onChange(photos.filter((p) => p.id !== id));
  };

  const updateLabel = (id: string, label: string) => {
    onChange(
      photos.map((p) => (p.id === id ? { ...p, label } : p))
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          className="border-dashed border-2 h-24 w-32 flex flex-col items-center justify-center gap-2 hover:border-stone-400 transition-colors"
        >
          <Upload className="w-5 h-5 text-stone-500" />
          <span className="text-xs text-stone-500">Upload Files</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => cameraInputRef.current?.click()}
          className="border-dashed border-2 h-24 w-32 flex flex-col items-center justify-center gap-2 hover:border-stone-400 transition-colors"
        >
          <Camera className="w-5 h-5 text-stone-500" />
          <span className="text-xs text-stone-500">Take Photo</span>
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          multiple
          className="hidden"
        />
        <input
          type="file"
          ref={cameraInputRef}
          onChange={handleFileChange}
          accept="image/*"
          capture="environment"
          className="hidden"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {photos.map((photo) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative group border rounded-lg overflow-hidden bg-stone-50"
            >
                <div className="aspect-square relative">
                  <img
                    src={photo.url}
                    alt={photo.label}
                    className="w-full h-full object-cover"
                  />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => removePhoto(photo.id)}
                  className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
              <div className="p-2">
                <Input
                  value={photo.label}
                  onChange={(e) => updateLabel(photo.id, e.target.value)}
                  placeholder="Photo label (e.g. Front)"
                  className="h-7 text-xs"
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {photos.length === 0 && (
        <div className="py-8 text-center border-2 border-dashed rounded-lg bg-stone-50/50">
          <ImageIcon className="w-8 h-8 text-stone-300 mx-auto mb-2" />
          <p className="text-sm text-stone-500">
            No photos added yet
          </p>
        </div>
      )}
    </div>
  );
}
