import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { ReferenceFolder } from '../types';
import { Plus, Loader2 } from 'lucide-react';
import ReferenceFolderCard from '../components/references/ReferenceFolderCard';
import CreateReferenceFolderForm from '../components/references/CreateReferenceFolderForm';
import Modal from '../components/ui/Modal';
import { toast } from 'sonner';

const ReferencesLibrary = () => {
  const [folders, setFolders] = useState<ReferenceFolder[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const fetchFolders = useCallback(async () => {
    setIsLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setIsLoading(false);
      toast.error("You must be logged in to view references.");
      return;
    }

    const { data, error } = await supabase
      .from('reference_folders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reference folders:', error);
      toast.error('Failed to fetch reference folders.');
    } else {
      setFolders(data || []);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);
  
  const handleFolderCreated = () => {
    setIsModalOpen(false);
    fetchFolders();
  };

  const handleFolderDeleted = (deletedFolderId: string) => {
    setFolders(prevFolders => prevFolders.filter(folder => folder.id !== deletedFolderId));
  };


  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl font-semibold text-text-primary">Your Reference Folders</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center transition-colors duration-300 w-full sm:w-auto"
        >
          <Plus className="h-5 w-5 mr-2" />
          Upload New Folder
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      ) : folders.length === 0 ? (
        <div className="text-center bg-surface border border-border-color rounded-lg py-12 px-4">
          <h3 className="text-lg font-medium text-text-primary">No Reference Folders Found</h3>
          <p className="text-text-secondary mt-2">Upload a folder of images to start training the AI.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {folders.map((folder) => (
            <ReferenceFolderCard key={folder.id} folder={folder} onFolderDeleted={handleFolderDeleted} />
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Upload New Reference Folder">
        <CreateReferenceFolderForm onFolderCreated={handleFolderCreated} />
      </Modal>
    </div>
  );
};

export default ReferencesLibrary;
