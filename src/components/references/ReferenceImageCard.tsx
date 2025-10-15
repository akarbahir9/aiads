import React from 'react';
import { ReferenceImage } from '../../types';
import { Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface ReferenceImageCardProps {
  image: ReferenceImage;
  onImageDeleted: (imageId: string) => void;
}

const ReferenceImageCard: React.FC<ReferenceImageCardProps> = ({ image, onImageDeleted }) => {
  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!window.confirm(`Are you sure you want to delete this image?`)) {
      return;
    }

    const promise = async () => {
      const path = new URL(image.image_url).pathname.split('/public/reference-images/')[1];
      if (!path) throw new Error("Could not determine image path for deletion.");

      const { error: storageError } = await supabase.storage.from('reference-images').remove([path]);
      if (storageError) throw new Error(`Storage deletion failed: ${storageError.message}`);
      
      const { error: dbError } = await supabase.from('reference_images').delete().eq('id', image.id);
      if (dbError) throw new Error(`Database deletion failed: ${dbError.message}`);

      return image.id;
    };

    toast.promise(promise(), {
      loading: 'Deleting image...',
      success: (deletedId) => {
        onImageDeleted(deletedId);
        return `Image deleted successfully.`;
      },
      error: (err) => err.message,
    });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="aspect-square bg-background rounded-lg overflow-hidden relative group"
    >
      <img src={image.image_url} alt="Reference" className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <button
          onClick={handleDelete}
          className="bg-red-600/80 hover:bg-red-500 text-white rounded-full h-10 w-10 flex items-center justify-center transition-transform transform scale-75 group-hover:scale-100"
          aria-label="Delete image"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>
    </motion.div>
  );
};

export default ReferenceImageCard;
