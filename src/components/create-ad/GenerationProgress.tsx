import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

interface GenerationProgressProps {
  steps: string[];
}

const GenerationProgress: React.FC<GenerationProgressProps> = ({ steps }) => {
  return (
    <div className="bg-surface p-4 rounded-lg border border-border-color">
      <h4 className="text-sm font-semibold text-text-primary mb-3">Generation Progress</h4>
      <div className="space-y-2">
        <AnimatePresence>
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center text-sm"
            >
              {step.startsWith('✅') ? (
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
              ) : (
                <div className="h-4 w-4 mr-2 flex-shrink-0 flex items-center justify-center">
                    <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
                </div>
              )}
              <span className={step.startsWith('✅') ? 'text-text-secondary' : 'text-text-primary'}>
                {step.replace('✅ ', '')}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GenerationProgress;
