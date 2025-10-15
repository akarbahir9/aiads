import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ReferenceFolder, ReferenceImage } from '../types';
import { Loader2, ArrowLeft, Folder, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import EditReferenceFolderForm from '../components/references/EditReferenceFolderForm';
import UploadMoreImagesForm from '../components/references/UploadMoreImagesForm';
import ReferenceImageCard from '../components/references/ReferenceImageCard';

const ReferenceDetail = () => {
  const { folderId } = useParams<{ folderId: string }>();
  const [folder, setFolder] = useState<ReferenceFolder | null>(null);
  const [images, setImages] = useState<ReferenceImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFolderAndImages = useCallback(async () => {
    if (!folderId) return;
    setIsLoading(true);
    try {
      const { data: folderData, error: folderError } = await supabase
        .from('reference_folders')
        .select('*')
        .eq('id', folderId)
        .single();
      if (folderError) throw new Error(`Failed to fetch folder: ${folderError.message}`);
      setFolder(folderData);

      const { data: imagesData, error: imagesError } = await supabase
        .from('reference_images')
        .select('*')
        .eq('folder_id', folderId)
        .order('created_at', { ascending: false });
      if (imagesError) throw new Error(`Failed to fetch images: ${imagesError.message}`);
      setImages(imagesData);

    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [folderId]);

  useEffect(() => {
    fetchFolderAndImages();
  }, [fetchFolderAndImages]);

  const handleFolderUpdated = (updatedFolder: ReferenceFolder) => {
    setFolder(updatedFolder);
  };
  
  const handleImagesUploaded = () => {
    fetchFolderAndImages(); // Refetch everything to show new images
  };

  const handleImageDeleted = (deletedImageId: string) => {
    setImages(currentImages => currentImages.filter(img => img.id !== deletedImageId));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full pt-20">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
      </div>
    );
  }

  if (!folder) {
    return (
      <div className="text-center pt-20">
        <h2 className="text-2xl font-bold text-red-500">Reference Folder not found</h2>
        <Link to="/references" className="mt-4 inline-flex items-center text-primary hover:underline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to all references
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <Link to="/references" className="mb-4 inline-flex items-center text-sm font-medium text-text-secondary hover:text-text-primary">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to References Library
        </Link>
        <div className="flex items-center space-x-4 mt-2">
          <Folder className="h-10 w-10 text-primary flex-shrink-0" />
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-text-primary">{folder.name}</h1>
            <p className="text-text-secondary mt-1">Contains {images.length} images</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 order-2 lg:order-1">
          <h2 className="text-2xl font-semibold text-text-primary mb-6">Images in this Folder</h2>
          {images.length === 0 ? (
            <div className="text-center bg-surface border border-border-color rounded-lg py-12 px-4">
              <ImageIcon className="h-12 w-12 mx-auto text-text-secondary" />
              <h3 className="text-lg font-medium text-text-primary mt-4">No Images Found</h3>
              <p className="text-text-secondary mt-2">Upload some images to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {images.map(image => (
                <ReferenceImageCard key={image.id} image={image} onImageDeleted={handleImageDeleted} />
              ))}
            </div>
          )}
        </div>
        <div className="lg:col-span-1 space-y-6 order-1 lg:order-2">
          <div className="bg-surface p-6 rounded-lg border border-border-color">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Edit Folder Details</h3>
            <EditReferenceFolderForm folder={folder} onFolderUpdated={handleFolderUpdated} />
          </div>
          <div className="bg-surface p-6 rounded-lg border border-border-color">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Upload More Images</h3>
            <UploadMoreImagesForm folderId={folder.id} onImagesUploaded={handleImagesUploaded} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferenceDetail;
