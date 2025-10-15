import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '../lib/supabase';
import { Brand, GeneratedAd } from '../types';
import { UploadCloud, Sparkles, Image, ChevronDown, Loader2, Info } from 'lucide-react';
import { findBestReferenceFolder, constructNanoBananaPrompt, generateVisual, generateCaption } from '../lib/ai';
import { toast } from 'sonner';
import GenerationProgress from '../components/create-ad/GenerationProgress';
import { useLocation, useNavigate } from 'react-router-dom';

const adGoals = ["Awareness", "Engagement", "Sales", "Premium Branding"];
const adRatios = ["1:1 Square", "4:5 Portrait", "9:16 Story", "16:9 Landscape"];

const createAdSchema = z.object({
  brandId: z.string().min(1, "Please select a brand."),
  adGoal: z.string(),
  adRatio: z.string(),
  message: z.string().min(3, "Message is too short."),
  concept: z.string().min(10, "Concept is too short."),
  includeLogo: z.boolean(),
});

type CreateAdFormData = z.infer<typeof createAdSchema>;

const CreateAd = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoadingBrands, setIsLoadingBrands] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStatus, setGenerationStatus] = useState<string[]>([]);
  const [generationResult, setGenerationResult] = useState<Partial<GeneratedAd> | null>(null);

  const location = useLocation();
  const navigate = useNavigate();
  const adToRegenerate: GeneratedAd | null = location.state?.ad || null;

  const { register, handleSubmit, formState: { errors }, reset } = useForm<CreateAdFormData>({
    resolver: zodResolver(createAdSchema),
    defaultValues: {
      adGoal: adGoals[0],
      adRatio: adRatios[0],
      includeLogo: false,
    }
  });

  useEffect(() => {
    const fetchBrands = async () => {
      setIsLoadingBrands(true);
      try {
        const { data, error } = await supabase.from('brands').select('*').order('name', { ascending: true });
        if (error) throw error;
        setBrands(data || []);
      } catch (err: any) {
        toast.error('Failed to fetch brands.', { description: err.message });
      } finally {
        setIsLoadingBrands(false);
      }
    };
    fetchBrands();
  }, []);

  useEffect(() => {
    if (adToRegenerate && brands.length > 0) {
      reset({
        brandId: adToRegenerate.brand_id,
        adGoal: adToRegenerate.goal,
        adRatio: adToRegenerate.ratio,
        message: adToRegenerate.message,
        concept: adToRegenerate.concept,
        includeLogo: adToRegenerate.include_logo,
      });
      toast.info("Loaded previous ad settings for regeneration.");
      // Clear state after loading to prevent re-loading on re-renders
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [adToRegenerate, brands, reset, navigate, location.pathname]);


  const onSubmit = async (formData: CreateAdFormData) => {
    setIsGenerating(true);
    setGenerationStatus([]);
    setGenerationResult(null);

    const generationPromise = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("You must be logged in to generate an ad.");

      setGenerationStatus(prev => [...prev, "Fetching brand and reference data..."]);
      const selectedBrand = brands.find(b => b.id === formData.brandId);
      if (!selectedBrand) throw new Error("Selected brand not found.");

      const { data: allFolders, error: folderError } = await supabase.from('reference_folders').select('*');
      if (folderError) throw new Error("Could not fetch reference folders.");
      
      setGenerationStatus(prev => [...prev, "✅ Data fetched. Matching references..."]);
      await new Promise(res => setTimeout(res, 500));
      const matchedReference = findBestReferenceFolder(formData.concept, allFolders || []);
      if (!matchedReference) throw new Error("No suitable reference folder found.");
      setGenerationStatus(prev => [...prev, `✅ Reference matched: "${matchedReference.name}"`]);

      await new Promise(res => setTimeout(res, 300));
      const visualPrompt = constructNanoBananaPrompt(formData, selectedBrand, matchedReference);
      setGenerationStatus(prev => [...prev, "✅ Visual prompt constructed."]);

      setGenerationStatus(prev => [...prev, "Generating visual... (this may take a moment)"]);
      const imageUrl = await generateVisual(formData.adRatio);
      setGenerationStatus(prev => [...prev, "✅ Visual generated successfully."]);

      setGenerationStatus(prev => [...prev, "Writing caption..."]);
      const caption = await generateCaption(formData.adGoal, selectedBrand.name, formData.concept);
      setGenerationStatus(prev => [...prev, "✅ Caption written."]);

      setGenerationStatus(prev => [...prev, "Saving ad to database..."]);
      const finalAdData: Omit<GeneratedAd, 'id' | 'created_at'> = {
        brand_id: selectedBrand.id,
        user_id: session.user.id,
        goal: formData.adGoal,
        ratio: formData.adRatio,
        concept: formData.concept,
        message: formData.message,
        include_logo: formData.includeLogo,
        used_reference_folder_id: matchedReference.id,
        visual_style_prompt: visualPrompt,
        image_url: imageUrl,
        caption: caption,
        version: adToRegenerate ? adToRegenerate.version + 1 : 1,
      };

      const { data: savedAd, error: insertError } = await supabase.from('generated_ads').insert(finalAdData).select().single();
      if (insertError) throw new Error(`Database save failed: ${insertError.message}`);
      
      setGenerationResult(savedAd);
      setGenerationStatus(prev => [...prev, "✅ Ad saved successfully!"]);
      return savedAd;
    };

    toast.promise(generationPromise(), {
      loading: 'Starting ad generation...',
      success: 'Ad generated and saved successfully!',
      error: (err) => err.message,
      finally: () => setIsGenerating(false)
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
      <fieldset disabled={isGenerating} className="lg:col-span-2 space-y-6">
        
        {adToRegenerate && (
          <div className="bg-blue-900/50 border border-blue-700 text-blue-200 text-sm rounded-lg p-4 flex items-center">
            <Info className="h-5 w-5 mr-3 flex-shrink-0" />
            <span>You are regenerating a previous ad. Adjust the settings below and click "Generate Ad" to create a new version.</span>
          </div>
        )}

        <div className="bg-surface p-4 md:p-6 rounded-lg border border-border-color">
          <label htmlFor="brandId" className="block text-sm font-medium text-text-secondary mb-2">Select Brand</label>
          <div className="relative">
            <select 
              id="brandId"
              {...register('brandId')}
              className="w-full bg-background border border-border-color rounded-md py-2.5 px-4 appearance-none focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {isLoadingBrands && <option>Loading brands...</option>}
              {!isLoadingBrands && brands.length === 0 && <option value="">No brands found. Create one first.</option>}
              {brands.map(brand => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary pointer-events-none" />
          </div>
          {errors.brandId && <p className="text-red-500 text-xs mt-1">{errors.brandId.message}</p>}
        </div>

        <div className="bg-surface p-4 md:p-6 rounded-lg border border-border-color">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Upload Product Photo (Optional)</h3>
          <div className="border-2 border-dashed border-border-color rounded-lg p-8 md:p-12 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary transition opacity-50 cursor-not-allowed">
            <UploadCloud className="h-10 w-10 md:h-12 md:w-12 text-text-secondary" />
            <p className="mt-4 text-sm text-text-secondary">Drag & drop files here or <span className="font-semibold text-primary">browse</span></p>
            <p className="text-xs text-text-secondary mt-1">Feature coming soon</p>
          </div>
        </div>

        <div className="bg-surface p-4 md:p-6 rounded-lg border border-border-color">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Ad Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="adGoal" className="block text-sm font-medium text-text-secondary mb-2">Ad Goal</label>
              <div className="relative">
                <select {...register('adGoal')} id="adGoal" className="w-full bg-background border border-border-color rounded-md py-2.5 px-4 appearance-none focus:outline-none focus:ring-2 focus:ring-primary">
                  {adGoals.map(g => <option key={g}>{g}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary pointer-events-none" />
              </div>
            </div>
            <div>
              <label htmlFor="adRatio" className="block text-sm font-medium text-text-secondary mb-2">Ad Ratio</label>
              <div className="relative">
                <select {...register('adRatio')} id="adRatio" className="w-full bg-background border border-border-color rounded-md py-2.5 px-4 appearance-none focus:outline-none focus:ring-2 focus:ring-primary">
                  {adRatios.map(r => <option key={r}>{r}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary pointer-events-none" />
              </div>
            </div>
          </div>
          <div className="mt-4">
            <label htmlFor="message" className="block text-sm font-medium text-text-secondary mb-2">Message to Deliver</label>
            <textarea {...register('message')} id="message" rows={3} className="w-full bg-background border border-border-color rounded-md p-4 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. 'Show freshness and grill quality'"></textarea>
            {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>}
          </div>
          <div className="mt-4 flex items-center">
            <input {...register('includeLogo')} id="includeLogo" type="checkbox" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
            <label htmlFor="includeLogo" className="ml-2 block text-sm text-text-primary">Include Brand Logo</label>
          </div>
        </div>

        <div className="bg-surface p-4 md:p-6 rounded-lg border border-border-color">
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="concept" className="block text-sm font-medium text-text-secondary">Write Concept</label>
            <button type="button" onClick={() => toast.info('AI Concept Enhancement is coming soon!')} className="flex items-center text-sm text-accent font-medium hover:text-primary transition">
              <Sparkles className="h-4 w-4 mr-1.5" />
              Enhance Concept
            </button>
          </div>
          <textarea {...register('concept')} id="concept" rows={4} className="w-full bg-background border border-border-color rounded-md p-4 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. 'A juicy steak on a rustic wooden board...'"></textarea>
          {errors.concept && <p className="text-red-500 text-xs mt-1">{errors.concept.message}</p>}
        </div>

        {isGenerating && <GenerationProgress steps={generationStatus} />}

        <button type="submit" className="w-full bg-gradient-button hover:bg-gradient-button-hover text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center text-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 disabled:bg-none disabled:bg-secondary">
          {isGenerating ? <Loader2 className="h-6 w-6 mr-2 animate-spin" /> : <Sparkles className="h-5 w-5 mr-2" />}
          {isGenerating ? 'Generating...' : 'Generate Ad'}
        </button>
      </fieldset>

      <div className="space-y-6">
        <div className="bg-surface p-4 md:p-6 rounded-lg border border-border-color h-full flex flex-col">
          <div className="flex-grow flex items-center justify-center bg-background rounded-md min-h-[300px] lg:min-h-[400px] overflow-hidden">
            {generationResult?.image_url ? (
              <img src={generationResult.image_url} alt="Generated ad" className="w-full h-full object-contain"/>
            ) : (
              <div className="text-center text-text-secondary px-4">
                <Image className="h-12 w-12 md:h-16 md:w-16 mx-auto" />
                <p className="mt-4 font-medium text-sm md:text-base">Your generated ad will appear here...</p>
              </div>
            )}
          </div>
          <div className="mt-4">
            <h4 className="text-base font-semibold text-text-primary mb-2">AI Generated Caption</h4>
            <div className="bg-background p-4 rounded-md text-sm text-text-secondary h-32 overflow-y-auto whitespace-pre-wrap">
              {generationResult?.caption || "Caption and headline will be generated here..."}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default CreateAd;
