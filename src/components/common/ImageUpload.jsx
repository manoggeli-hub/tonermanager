import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function ImageUpload({ value, onChange, className }) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    onChange(file_url);
    setUploading(false);
  };

  const handleRemove = () => {
    onChange('');
  };

  return (
    <div className={cn("space-y-2", className)}>
      {value ? (
        <div className="relative inline-block">
          <img 
            src={value} 
            alt="Vorschau" 
            className="w-24 h-24 object-cover rounded-lg border border-slate-200"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6"
            onClick={handleRemove}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-slate-400 transition-colors">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading}
          />
          {uploading ? (
            <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
          ) : (
            <>
              <ImageIcon className="w-6 h-6 text-slate-400 mb-1" />
              <span className="text-xs text-slate-500">Bild</span>
            </>
          )}
        </label>
      )}
    </div>
  );
}