import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const HeroSection = () => {
  return (
    <section className="relative py-20 md:py-32 bg-background overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl filter -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl filter translate-x-1/2 translate-y-1/2"></div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-6xl font-extrabold text-text-primary tracking-tight">
            The AI Creative Studio for <span className="text-primary">Modern Agencies</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-text-secondary">
            Generate stunning, on-brand ad creatives in seconds. Go from concept to campaign-ready visuals with the power of generative AI.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/auth"
              className="w-full sm:w-auto bg-primary hover:bg-primary-hover text-white font-bold py-3 px-8 rounded-lg text-lg transition-transform transform hover:scale-105"
            >
              Get Started for Free
            </Link>
            <Link
              to="/auth"
              className="w-full sm:w-auto text-text-primary font-medium py-3 px-8 rounded-lg hover:bg-surface transition-colors"
            >
              View Demo
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
