import React from 'react';
import { Link } from 'react-router-dom';
import { Bot } from 'lucide-react';

const LandingHeader = () => {
  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border-color">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Bot className="h-7 w-7 text-primary" />
              <span className="text-xl font-bold text-text-primary">AgencyBrain</span>
            </Link>
          </div>
          <nav className="hidden md:flex md:space-x-8">
            <button onClick={() => scrollTo('features')} className="text-sm font-medium text-text-secondary hover:text-primary transition-colors">Features</button>
            <button onClick={() => scrollTo('pricing')} className="text-sm font-medium text-text-secondary hover:text-primary transition-colors">Pricing</button>
            <button onClick={() => scrollTo('contact')} className="text-sm font-medium text-text-secondary hover:text-primary transition-colors">Contact</button>
          </nav>
          <div className="flex items-center">
            <Link to="/auth" className="bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default LandingHeader;
