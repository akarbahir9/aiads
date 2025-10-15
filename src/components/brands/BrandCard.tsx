import React from 'react';
import { Brand } from '../../types';
import { Trash2, Building } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface BrandCardProps {
  brand: Brand;
  onBrandDeleted: (brandId: string) => void;
}

const BrandCard: React.FC<BrandCardProps> = ({ brand, onBrandDeleted }) => {
  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!window.confirm(`Are you sure you want to delete the brand "${brand.name}"? This action cannot be undone.`)) {
      return;
    }

    const promise = async () => {
      // 1. Delete logo from storage if it exists
      if (brand.logo_url) {
        const path = new URL(brand.logo_url).pathname.split('/public/brands-logos/')[1];
        if (path) {
            const { error: storageError } = await supabase.storage.from('brands-logos').remove([path]);
            if (storageError) throw new Error(`Failed to delete logo: ${storageError.message}`);
        }
      }

      // 2. Delete brand from database
      const { error: dbError } = await supabase.from('brands').delete().eq('id', brand.id);
      if (dbError) throw new Error(`Failed to delete brand: ${dbError.message}`);
      
      return brand.id;
    };

    toast.promise(promise(), {
      loading: 'Deleting brand...',
      success: (deletedId) => {
        onBrandDeleted(deletedId);
        return `Brand "${brand.name}" deleted successfully.`;
      },
      error: (err) => err.message,
    });
  };

  return (
    <Link to={`/brands/${brand.id}`} className="block">
      <motion.div 
        whileHover={{ y: -5 }}
        className="bg-surface border border-border-color rounded-lg p-4 flex flex-col justify-between h-full cursor-pointer transition-shadow hover:shadow-lg hover:shadow-primary/10"
      >
        <div>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              {brand.logo_url ? (
                <img src={brand.logo_url} alt={`${brand.name} logo`} className="h-12 w-12 rounded-full object-cover bg-background" />
              ) : (
                <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center">
                  <Building className="h-6 w-6 text-text-secondary" />
                </div>
              )}
              <h3 className="text-lg font-bold text-text-primary">{brand.name}</h3>
            </div>
            <button onClick={handleDelete} className="text-text-secondary hover:text-red-500 p-1 rounded-full transition-colors z-10">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-text-secondary">Brand Colors</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {brand.colors && brand.colors.length > 0 ? (
                brand.colors.map((color, index) => (
                  <div key={index} className="h-6 w-6 rounded-full border-2 border-surface" style={{ backgroundColor: color }} title={color}></div>
                ))
              ) : (
                <p className="text-xs text-text-secondary">No colors set</p>
              )}
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-text-secondary">Personality</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {brand.personality_keywords && brand.personality_keywords.length > 0 ? (
                brand.personality_keywords.map((keyword, index) => (
                  <span key={index} className="text-xs bg-secondary text-text-primary px-2 py-1 rounded-full">{keyword}</span>
                ))
              ) : (
                <p className="text-xs text-text-secondary">No keywords set</p>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default BrandCard;
