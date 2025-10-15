import React, { useState, useEffect } from 'react';
import { ReferenceFolder, ReferenceImage } from '../../types';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { Folder, Image as ImageIcon, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface ReferenceFolderCardProps {
  folder: ReferenceFolder;
  onFolderDeleted: (folderId: string) => void;
}

const ReferenceFolderCard: React.FC<ReferenceFolderCardProps> = ({ folder, onFolderDeleted }) => {
  const [images, setImages] = useState<ReferenceImage[]>([]);
  const [imageCount, setImageCount] = useState(0);

  useEffect(() => {
    const fetchFolderContents = async () => {
      const { data: imageData, error: imageError } = await supabase
        .from('reference_images')
        .select('id, image_url')
        .eq('folder_id', folder.id)
        .limit(4);

      if (imageError) {
        console.error('Error fetching images for folder', folder.id, imageError);
      } else {
        setImages(imageData || []);
      }

      const { count, error: countError } = await supabase
        .from('reference_images')
        .select('*', { count: 'exact', head: true })
        .eq('folder_id', folder.id);
      
      if (countError) {
        console.error('Error fetching image count', countError);
      } else {
        setImageCount(count || 0);
      }
    };

    fetchFolderContents();
  }, [folder.id]);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!window.confirm(`Are you sure you want to delete the folder "${folder.name}" and all its images? This action cannot be undone.`)) {
      return;
    }

    const promise = async () => {
        const { data: imagesToDelete, error: fetchErr } = await supabase.from('reference_images').select('image_url').eq('folder_id', folder.id);
        if (fetchErr) throw new Error("Could not fetch images for deletion.");

        if (imagesToDelete.length > 0) {
            const pathsToDelete = imagesToDelete.map(img => new URL(img.image_url).pathname.split('/public/reference-images/')[1]).filter(Boolean);
            const { error: storageErr } = await supabase.storage.from('reference-images').remove(pathsToDelete);
            if (storageErr) console.warn("Some images may not have been deleted from storage:", storageErr.message);
        }

        const { error: dbErr } = await supabase.from('reference_folders').delete().eq('id', folder.id);
        if (dbErr) throw new Error(`Failed to delete folder: ${dbErr.message}`);

        return folder.id;
    };

    toast.promise(promise(), {
        loading: 'Deleting folder...',
        success: (deletedId) => {
            onFolderDeleted(deletedId);
            return `Folder "${folder.name}" deleted successfully.`;
        },
        error: (err) => err.message,
    });
  };

  const allKeywords = [...(folder.manual_keywords || []), ...(folder.auto_keywords || [])];

  return (
    <Link to={`/app/references/${folder.id}`} className="block">
      <motion.div 
        whileHover={{ y: -5 }}
        className="bg-surface border border-border-color rounded-lg flex flex-col transition-shadow hover:shadow-lg hover:shadow-primary/10 cursor-pointer h-full"
      >
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3 min-w-0">
              <Folder className="h-6 w-6 text-primary flex-shrink-0" />
              <h3 className="text-lg font-bold text-text-primary flex-1 truncate" title={folder.name}>{folder.name}</h3>
            </div>
            <button onClick={handleDelete} className="text-text-secondary hover:text-red-500 p-1 rounded-full transition-colors z-10">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <p className="text-sm text-text-secondary mt-1">{imageCount} items</p>
        </div>

        <div className="grid grid-cols-2 grid-rows-2 gap-px bg-border-color flex-grow min-h-[150px]">
          {images.length > 0 ? (
            images.slice(0, 4).map(img => (
              <div key={img.id} className="bg-background aspect-square">
                <img src={img.image_url} alt="Reference" className="w-full h-full object-cover" />
              </div>
            ))
          ) : (
            <div className="col-span-2 row-span-2 flex items-center justify-center bg-background text-text-secondary">
              <ImageIcon className="h-8 w-8" />
            </div>
          )}
        </div>
        
        {allKeywords.length > 0 && (
          <div className="p-4 mt-auto border-t border-border-color">
            <p className="text-sm font-medium text-text-secondary mb-2">Keywords</p>
            <div className="flex flex-wrap gap-2">
              {allKeywords.slice(0, 5).map((keyword, index) => (
                <span key={index} className="text-xs bg-secondary text-text-primary px-2 py-1 rounded-full">{keyword}</span>
              ))}
              {allKeywords.length > 5 && <span className="text-xs bg-secondary text-text-primary px-2 py-1 rounded-full">+{allKeywords.length - 5} more</span>}
            </div>
          </div>
        )}
      </motion.div>
    </Link>
  );
};

export default ReferenceFolderCard;
