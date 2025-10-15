import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { Loader2, Upload } from 'lucide-react';

const brandSchema = z.object({
  name: z.string().min(1, 'Brand name is required'),
  colors: z.string().optional(),
  personality_keywords: z.string().optional(),
  font_style: z.string().optional(),
  target_audience_notes: z.string().optional(),
});

type BrandFormData = z.infer<typeof brandSchema>;

interface CreateBrandFormProps {
  onBrandCreated: () => void;
}

const CreateBrandForm: React.FC<CreateBrandFormProps> = ({ onBrandCreated }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<BrandFormData>({
    resolver: zodResolver(brandSchema),
  });

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (formData: BrandFormData) => {
    setIsSubmitting(true);

    const promise = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("Authentication error: User not found.");

        let logo_url: string | null = null;
        if (logoFile) {
            const fileName = `${session.user.id}/${Date.now()}-${logoFile.name}`;
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('brands-logos')
                .upload(fileName, logoFile);

            if (uploadError) throw new Error(`Logo upload failed: ${uploadError.message}`);
            
            const { data: urlData } = supabase.storage.from('brands-logos').getPublicUrl(uploadData.path);
            logo_url = urlData.publicUrl;
        }

        const brandData = {
          name: formData.name,
          logo_url,
          colors: formData.colors?.split(',').map(c => c.trim()).filter(Boolean) || [],
          personality_keywords: formData.personality_keywords?.split(',').map(k => k.trim()).filter(Boolean) || [],
          font_style: formData.font_style || null,
          target_audience_notes: formData.target_audience_notes || null,
          user_id: session.user.id,
        };

        const { error: insertError } = await supabase.from('brands').insert(brandData);
        if (insertError) throw new Error(`Failed to create brand: ${insertError.message}`);
    };

    toast.promise(promise(), {
      loading: 'Creating brand...',
      success: () => {
        reset();
        setLogoFile(null);
        setLogoPreview(null);
        onBrandCreated();
        setIsSubmitting(false);
        return 'Brand created successfully!';
      },
      error: (err) => {
        setIsSubmitting(false);
        return err.message;
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-text-secondary mb-1">Brand Name *</label>
        <input {...register('name')} id="name" className="w-full bg-background border border-border-color rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary" />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">Logo</label>
        <div className="mt-1 flex items-center space-x-4">
            {logoPreview ? (
                <img src={logoPreview} alt="Logo preview" className="h-16 w-16 rounded-full object-cover" />
            ) : (
                <div className="h-16 w-16 rounded-full bg-background flex items-center justify-center border border-border-color">
                    <Upload className="h-6 w-6 text-text-secondary" />
                </div>
            )}
            <label htmlFor="logo-upload" className="cursor-pointer bg-secondary text-text-primary text-sm font-medium py-2 px-4 rounded-md hover:bg-secondary-hover transition-colors">
                <span>Upload file</span>
                <input id="logo-upload" type="file" className="sr-only" accept="image/png, image/jpeg, image/svg+xml" onChange={handleLogoChange} />
            </label>
        </div>
      </div>

      <div>
        <label htmlFor="colors" className="block text-sm font-medium text-text-secondary mb-1">Brand Colors (comma-separated hex codes)</label>
        <input {...register('colors')} id="colors" placeholder="#FFFFFF, #000000, #4F46E5" className="w-full bg-background border border-border-color rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary" />
      </div>
      
      <div>
        <label htmlFor="personality_keywords" className="block text-sm font-medium text-text-secondary mb-1">Personality Keywords (comma-separated)</label>
        <input {...register('personality_keywords')} id="personality_keywords" placeholder="luxury, friendly, bold" className="w-full bg-background border border-border-color rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary" />
      </div>

      <div>
        <label htmlFor="font_style" className="block text-sm font-medium text-text-secondary mb-1">Font Style</label>
        <input {...register('font_style')} id="font_style" placeholder="e.g., Sans-serif, elegant" className="w-full bg-background border border-border-color rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary" />
      </div>

      <div>
        <label htmlFor="target_audience_notes" className="block text-sm font-medium text-text-secondary mb-1">Target Audience Notes</label>
        <textarea {...register('target_audience_notes')} id="target_audience_notes" rows={3} className="w-full bg-background border border-border-color rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"></textarea>
      </div>

      <div className="flex justify-end pt-4">
        <button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary-hover text-white font-bold py-2 px-6 rounded-lg flex items-center justify-center transition-colors duration-300 disabled:bg-secondary disabled:cursor-not-allowed">
          {isSubmitting && <Loader2 className="h-5 w-5 mr-2 animate-spin" />}
          {isSubmitting ? 'Creating...' : 'Create Brand'}
        </button>
      </div>
    </form>
  );
};

export default CreateBrandForm;
