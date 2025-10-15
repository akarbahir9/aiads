import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { Loader2, UploadCloud, FileImage } from 'lucide-react';

const folderSchema = z.object({
  name: z.string().min(1, 'Folder name is required'),
  manual_keywords: z.string().optional(),
});

type FolderFormData = z.infer<typeof folderSchema>;

interface CreateReferenceFolderFormProps {
  onFolderCreated: () => void;
}

const CreateReferenceFolderForm: React.FC<CreateReferenceFolderFormProps> = ({ onFolderCreated }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FolderFormData>({
    resolver: zodResolver(folderSchema),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImageFiles(Array.from(e.target.files));
    }
  };

  const onSubmit = async (formData: FolderFormData) => {
    if (imageFiles.length === 0) {
      toast.error("Please select at least one image to upload.");
      return;
    }
    setIsSubmitting(true);

    const promise = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("Authentication error: User not found.");

        // 1. Create the folder record
        const folderData = {
          name: formData.name,
          manual_keywords: formData.manual_keywords?.split(',').map(k => k.trim()).filter(Boolean) || [],
          user_id: session.user.id,
        };
        const { data: newFolder, error: insertError } = await supabase.from('reference_folders').insert(folderData).select().single();
        if (insertError) throw new Error(`Failed to create folder: ${insertError.message}`);

        // 2. Upload images and create image records
        const uploadPromises = imageFiles.map(async (file) => {
            const fileName = `${session.user.id}/${newFolder.id}/${Date.now()}-${file.name}`;
            const { data: uploadData, error: uploadError } = await supabase.storage.from('reference-images').upload(fileName, file);
            if (uploadError) throw new Error(`Image upload failed for ${file.name}: ${uploadError.message}`);
            
            const { data: urlData } = supabase.storage.from('reference-images').getPublicUrl(uploadData.path);
            
            return {
                folder_id: newFolder.id,
                image_url: urlData.publicUrl,
                user_id: session.user.id,
            };
        });
        
        const imageRecords = await Promise.all(uploadPromises);

        // 3. Insert image records into the database
        const { error: imageInsertError } = await supabase.from('reference_images').insert(imageRecords);
        if (imageInsertError) throw new Error(`Failed to save image records: ${imageInsertError.message}`);
    };

    toast.promise(promise(), {
      loading: `Uploading ${imageFiles.length} images...`,
      success: () => {
        reset();
        setImageFiles([]);
        onFolderCreated();
        setIsSubmitting(false);
        return 'Reference folder created successfully!';
      },
      error: (err) => {
        setIsSubmitting(false);
        // Attempt to clean up created folder if image uploads fail
        // This is a simplified cleanup. A more robust solution would use DB transactions or edge functions.
        return err.message;
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-text-secondary mb-1">Folder Name *</label>
        <input {...register('name')} id="name" className="w-full bg-background border border-border-color rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary" />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">Images *</label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-border-color border-dashed rounded-md">
          <div className="space-y-1 text-center">
            <UploadCloud className="mx-auto h-12 w-12 text-text-secondary" />
            <div className="flex text-sm text-text-secondary">
              <label htmlFor="file-upload" className="relative cursor-pointer bg-surface rounded-md font-medium text-primary hover:text-primary-hover focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary">
                <span>Upload files</span>
                <input id="file-upload" type="file" className="sr-only" multiple onChange={handleFileChange} accept="image/png, image/jpeg" />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-text-secondary">PNG, JPG up to 10MB each</p>
          </div>
        </div>
        {imageFiles.length > 0 && (
            <div className="mt-4">
                <p className="text-sm font-medium text-text-secondary">{imageFiles.length} file(s) selected:</p>
                <ul className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                    {imageFiles.map((file, index) => (
                        <li key={index} className="text-sm text-text-primary flex items-center">
                            <FileImage className="h-4 w-4 mr-2 text-text-secondary" />
                            {file.name}
                        </li>
                    ))}
                </ul>
            </div>
        )}
      </div>

      <div>
        <label htmlFor="manual_keywords" className="block text-sm font-medium text-text-secondary mb-1">Manual Keywords (comma-separated)</label>
        <input {...register('manual_keywords')} id="manual_keywords" placeholder="e.g., rustic, minimal, luxury" className="w-full bg-background border border-border-color rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary" />
      </div>

      <div className="flex justify-end pt-4">
        <button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary-hover text-white font-bold py-2 px-6 rounded-lg flex items-center justify-center transition-colors duration-300 disabled:bg-secondary disabled:cursor-not-allowed">
          {isSubmitting && <Loader2 className="h-5 w-5 mr-2 animate-spin" />}
          {isSubmitting ? 'Creating...' : 'Create Folder'}
        </button>
      </div>
    </form>
  );
};

export default CreateReferenceFolderForm;
