import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import Modal from '../ui/Modal';
import { GeneratedAd } from '../../types';

const captionSchema = z.object({
  caption: z.string().min(10, 'Caption is too short.'),
});

type CaptionFormData = z.infer<typeof captionSchema>;

interface EditCaptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  ad: GeneratedAd;
  onAdUpdated: (updatedAd: GeneratedAd) => void;
}

const EditCaptionModal: React.FC<EditCaptionModalProps> = ({ isOpen, onClose, ad, onAdUpdated }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<CaptionFormData>({
    resolver: zodResolver(captionSchema),
    defaultValues: {
      caption: ad.caption,
    },
  });

  const onSubmit = async (formData: CaptionFormData) => {
    setIsSubmitting(true);
    const promise = async () => {
      const { data, error } = await supabase
        .from('generated_ads')
        .update({ caption: formData.caption })
        .eq('id', ad.id)
        .select()
        .single();

      if (error) throw new Error(`Failed to update caption: ${error.message}`);
      return data;
    };

    toast.promise(promise(), {
      loading: 'Updating caption...',
      success: (updatedAd) => {
        onAdUpdated(updatedAd);
        onClose();
        return 'Caption updated successfully!';
      },
      error: (err) => err.message,
      finally: () => setIsSubmitting(false),
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Ad Caption">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="caption" className="block text-sm font-medium text-text-secondary mb-1">Caption</label>
          <textarea
            {...register('caption')}
            id="caption"
            rows={8}
            className="w-full bg-background border border-border-color rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {errors.caption && <p className="text-red-500 text-xs mt-1">{errors.caption.message}</p>}
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary hover:bg-primary-hover text-white font-bold py-2 px-6 rounded-lg flex items-center justify-center transition-colors duration-300 disabled:bg-secondary disabled:cursor-not-allowed"
          >
            {isSubmitting && <Loader2 className="h-5 w-5 mr-2 animate-spin" />}
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditCaptionModal;
