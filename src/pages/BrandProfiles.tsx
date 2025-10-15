import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Brand } from '../types';
import { Plus, Loader2 } from 'lucide-react';
import BrandCard from '../components/brands/BrandCard';
import CreateBrandForm from '../components/brands/CreateBrandForm';
import Modal from '../components/ui/Modal';
import { toast } from 'sonner';

const BrandProfiles = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const fetchBrands = useCallback(async () => {
    setIsLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setIsLoading(false);
      toast.error("You must be logged in to view brands.");
      return;
    }

    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching brands:', error);
      toast.error('Failed to fetch brands.');
    } else {
      setBrands(data || []);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  const handleBrandCreated = () => {
    setIsModalOpen(false);
    fetchBrands();
  };
  
  const handleBrandDeleted = (deletedBrandId: string) => {
    setBrands(prevBrands => prevBrands.filter(brand => brand.id !== deletedBrandId));
  };


  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl font-semibold text-text-primary">Your Brands</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center transition-colors duration-300 w-full sm:w-auto"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create New Brand
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      ) : brands.length === 0 ? (
        <div className="text-center bg-surface border border-border-color rounded-lg py-12 px-4">
          <h3 className="text-lg font-medium text-text-primary">No Brands Found</h3>
          <p className="text-text-secondary mt-2">Get started by creating your first brand profile.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {brands.map((brand) => (
            <BrandCard key={brand.id} brand={brand} onBrandDeleted={handleBrandDeleted} />
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Brand Profile">
        <CreateBrandForm onBrandCreated={handleBrandCreated} />
      </Modal>
    </div>
  );
};

export default BrandProfiles;
