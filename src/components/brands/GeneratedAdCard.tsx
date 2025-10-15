import React, { useState } from 'react';
import { GeneratedAd } from '../../types';
import { motion } from 'framer-motion';
import { Calendar, Tag, PenSquare, RotateCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import EditCaptionModal from './EditCaptionModal';

interface GeneratedAdCardProps {
  ad: GeneratedAd;
  onAdUpdated: (updatedAd: GeneratedAd) => void;
}

const GeneratedAdCard: React.FC<GeneratedAdCardProps> = ({ ad, onAdUpdated }) => {
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleRegenerate = () => {
    navigate('/', { state: { ad } });
  };

  return (
    <>
      <motion.div 
        whileHover={{ y: -5 }}
        className="bg-surface border border-border-color rounded-lg overflow-hidden flex flex-col group"
      >
        <div className="aspect-[4/5] overflow-hidden">
          <img src={ad.image_url} alt={ad.concept} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        </div>
        <div className="p-4 flex flex-col flex-grow">
          <div className="flex-grow">
            <p className="text-xs text-text-secondary flex items-center mb-2">
              <Calendar className="h-3 w-3 mr-1.5" />
              {new Date(ad.created_at).toLocaleDateString()}
            </p>
            <p className="text-sm font-semibold text-text-primary mb-2 line-clamp-2" title={ad.concept}>
              {ad.concept}
            </p>
            <p className="text-xs text-text-secondary bg-background p-2 rounded-md line-clamp-3 whitespace-pre-wrap">
              {ad.caption}
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-border-color">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs bg-secondary text-text-primary px-2 py-1 rounded-full flex items-center">
                <Tag className="h-3 w-3 mr-1" />
                {ad.goal}
              </span>
              <span className="text-xs text-text-secondary">v{ad.version}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <button onClick={() => setIsEditModalOpen(true)} className="bg-secondary hover:bg-secondary-hover text-text-primary font-medium py-2 px-3 rounded-md flex items-center justify-center transition"><PenSquare className="h-4 w-4 mr-2" />Edit</button>
              <button onClick={handleRegenerate} className="bg-secondary hover:bg-secondary-hover text-text-primary font-medium py-2 px-3 rounded-md flex items-center justify-center transition"><RotateCw className="h-4 w-4 mr-2" />Regen</button>
            </div>
          </div>
        </div>
      </motion.div>
      <EditCaptionModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        ad={ad}
        onAdUpdated={onAdUpdated}
      />
    </>
  );
};

export default GeneratedAdCard;
