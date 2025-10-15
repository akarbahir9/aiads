import React from 'react';
import { BrainCircuit, Sparkles, Library } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  {
    icon: BrainCircuit,
    title: 'Brand Intelligence',
    description: "Upload brand guidelines, logos, and colors. Our AI learns your brand's DNA to ensure every creative is perfectly on-brand.",
  },
  {
    icon: Sparkles,
    title: 'AI Ad Generation',
    description: 'Describe your concept and let our AI generate dozens of unique ad variations, complete with visuals and copy.',
  },
  {
    icon: Library,
    title: 'Reference Library',
    description: 'Train the AI on your best-performing ads or moodboards to guide the visual style and improve results over time.',
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 md:py-28 bg-surface">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary">Everything you need, nothing you don't.</h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-text-secondary">
            Streamline your creative workflow with powerful, intuitive tools.
          </p>
        </div>
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="bg-background p-8 rounded-lg border border-border-color text-center"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-lg bg-primary text-white">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-6 text-xl font-bold text-text-primary">{feature.title}</h3>
              <p className="mt-2 text-base text-text-secondary">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
