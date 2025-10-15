import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { Loader2, UploadCloud, FileImage } from 'lucide-react';

interface UploadMoreImagesFormProps {
  folderId: string;
  onImagesUploaded: () => void;
}

const UploadMoreImagesForm: React.FC<UploadMoreImagesFormProps> = ({ folderId, onImagesUploaded }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImageFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (imageFiles.length === 0) {
      toast.error("Please select at least one image to upload.");
      return;
    }
    setIsSubmitting(true);

    const promise = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("Authentication error: User not found.");

        const uploadPromises = imageFiles.map(async (file) => {
            const fileName = `${session.user.id}/${folderId}/${Date.now()}-${file.name}`;
            const { data: uploadData, error: uploadError } = await supabase.storage.from('reference-images').upload(fileName, file);
            if (uploadError) throw new Error(`Image upload failed for ${file.name}: ${uploadError.message}`);
            
            const { data: urlData } = supabase.storage.from('reference-images').getPublicUrl(uploadData.path);
            
            return {
                folder_id: folderId,
                image_url: urlData.publicUrl,
                user_id: session.user.id,
            };
        });
        
        const imageRecords = await Promise.all(uploadPromises);
        const { error: imageInsertError } = await supabase.from('reference_images').insert(imageRecords);
        if (imageInsertError) throw new Error(`Failed to save image records: ${imageInsertError.message}`);
    };

    toast.promise(promise(), {
      loading: `Uploading ${imageFiles.length} images...`,
      success: () => {
        setImageFiles([]);
        onImagesUploaded();
        return 'Images uploaded successfully!';
      },
      error: (err) => err.message,
      finally: () => setIsSubmitting(false),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-border-color border-dashed rounded-md">
          <div className="space-y-1 text-center">
            <UploadCloud className="mx-auto h-10 w-10 text-text-secondary" />
            <div className="flex text-sm text-text-secondary">
              <label htmlFor="more-file-upload" className="relative cursor-pointer bg-surface rounded-md font-medium text-primary hover:text-primary-hover">
                <span>Upload files</span>
                <input id="more-file-upload" type="file" className="sr-only" multiple onChange={handleFileChange} accept="image/png, image/jpeg" />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
          </div>
        </div>
        {imageFiles.length > 0 && (
            <div className="mt-3">
                <p className="text-xs font-medium text-text-secondary">{imageFiles.length} file(s) selected</p>
            </div>
        )}
      </div>

      <div className="flex justify-end">
        <button type="submit" disabled={isSubmitting || imageFiles.length === 0} className="bg-secondary hover:bg-secondary-hover text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center transition-colors duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed text-sm">
          {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {isSubmitting ? 'Uploading...' : 'Upload'}
        </button>
      </div>
    </form>
  );
};

export default UploadMoreImagesForm;
