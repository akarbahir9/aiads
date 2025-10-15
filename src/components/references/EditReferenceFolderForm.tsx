import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { ReferenceFolder } from '../../types';

const folderSchema = z.object({
  name: z.string().min(1, 'Folder name is required'),
  manual_keywords: z.string().optional(),
});

type FolderFormData = z.infer<typeof folderSchema>;

interface EditReferenceFolderFormProps {
  folder: ReferenceFolder;
  onFolderUpdated: (updatedFolder: ReferenceFolder) => void;
}

const EditReferenceFolderForm: React.FC<EditReferenceFolderFormProps> = ({ folder, onFolderUpdated }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FolderFormData>({
    resolver: zodResolver(folderSchema),
    defaultValues: {
      name: folder.name,
      manual_keywords: folder.manual_keywords?.join(', ') || '',
    },
  });

  const onSubmit = async (formData: FolderFormData) => {
    setIsSubmitting(true);
    const promise = async () => {
      const updatedData = {
        name: formData.name,
        manual_keywords: formData.manual_keywords?.split(',').map(k => k.trim()).filter(Boolean) || [],
      };

      const { data, error } = await supabase
        .from('reference_folders')
        .update(updatedData)
        .eq('id', folder.id)
        .select()
        .single();
      
      if (error) throw new Error(`Failed to update folder: ${error.message}`);
      return data;
    };

    toast.promise(promise(), {
      loading: 'Saving changes...',
      success: (updatedFolder) => {
        onFolderUpdated(updatedFolder);
        return 'Folder details saved successfully!';
      },
      error: (err) => err.message,
      finally: () => setIsSubmitting(false),
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
        <label htmlFor="manual_keywords" className="block text-sm font-medium text-text-secondary mb-1">Manual Keywords (comma-separated)</label>
        <input {...register('manual_keywords')} id="manual_keywords" className="w-full bg-background border border-border-color rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary" />
      </div>

      <div className="flex justify-end pt-2">
        <button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center transition-colors duration-300 disabled:bg-secondary disabled:cursor-not-allowed text-sm">
          {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};

export default EditReferenceFolderForm;
