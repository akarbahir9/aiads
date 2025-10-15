import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Brand, GeneratedAd } from '../types';
import { Loader2, ArrowLeft, Building, Image } from 'lucide-react';
import { toast } from 'sonner';
import GeneratedAdCard from '../components/brands/GeneratedAdCard';

const BrandDetail = () => {
  const { brandId } = useParams<{ brandId: string }>();
  const [brand, setBrand] = useState<Brand | null>(null);
  const [ads, setAds] = useState<GeneratedAd[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAds = useCallback(async () => {
    if (!brandId) return;
    const { data: adsData, error: adsError } = await supabase
      .from('generated_ads')
      .select('*')
      .eq('brand_id', brandId)
      .order('created_at', { ascending: false });

    if (adsError) throw new Error(`Failed to fetch ads: ${adsError.message}`);
    setAds(adsData || []);
  }, [brandId]);

  useEffect(() => {
    if (!brandId) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const { data: brandData, error: brandError } = await supabase
          .from('brands')
          .select('*')
          .eq('id', brandId)
          .single();

        if (brandError) throw new Error(`Failed to fetch brand details: ${brandError.message}`);
        setBrand(brandData);

        await fetchAds();

      } catch (err: any) {
        toast.error(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [brandId, fetchAds]);
  
  const handleAdUpdated = (updatedAd: GeneratedAd) => {
    setAds(currentAds => currentAds.map(ad => ad.id === updatedAd.id ? updatedAd : ad));
  };


  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full pt-20">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="text-center pt-20">
        <h2 className="text-2xl font-bold text-red-500">Brand not found</h2>
        <Link to="/app/brands" className="mt-4 inline-flex items-center text-primary hover:underline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to all brands
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <Link to="/app/brands" className="mb-4 inline-flex items-center text-sm font-medium text-text-secondary hover:text-text-primary">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to all brands
        </Link>
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 mt-2">
          {brand.logo_url ? (
            <img src={brand.logo_url} alt={`${brand.name} logo`} className="h-20 w-20 rounded-full object-cover bg-background border-2 border-border-color flex-shrink-0" />
          ) : (
            <div className="h-20 w-20 rounded-full bg-secondary flex items-center justify-center border-2 border-border-color flex-shrink-0">
              <Building className="h-10 w-10 text-text-secondary" />
            </div>
          )}
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-text-primary">{brand.name}</h1>
            <p className="text-text-secondary mt-1">Ad Generation History</p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-text-primary mb-6">Generated Ads ({ads.length})</h2>
        {ads.length === 0 ? (
          <div className="text-center bg-surface border border-border-color rounded-lg py-12 md:py-16 px-4">
            <Image className="h-12 w-12 mx-auto text-text-secondary" />
            <h3 className="text-lg font-medium text-text-primary mt-4">No Ads Generated Yet</h3>
            <p className="text-text-secondary mt-2 max-w-md mx-auto">Go to the "Create Ad" page to generate the first ad for {brand.name}.</p>
            <Link to="/app" className="mt-6 inline-block bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded-lg">
              Create Ad
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {ads.map(ad => (
              <GeneratedAdCard key={ad.id} ad={ad} onAdUpdated={handleAdUpdated} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandDetail;
