import React from 'react';
import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const tiers = [
  {
    name: 'Starter',
    price: 'Free',
    features: ['1 Brand', '10 Generations/mo', 'Basic Support'],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Pro',
    price: '$49',
    features: ['5 Brands', '100 Generations/mo', 'Advanced AI Models', 'Priority Support'],
    cta: 'Choose Pro',
    popular: true,
  },
  {
    name: 'Agency',
    price: 'Contact Us',
    features: ['Unlimited Brands', 'Custom Generations', 'Team Collaboration', 'Dedicated Account Manager'],
    cta: 'Contact Sales',
    popular: false,
  },
];

const PricingSection = () => {
  return (
    <section id="pricing" className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary">Simple, transparent pricing</h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-text-secondary">
            Choose the plan that's right for you.
          </p>
        </div>
        <div className="mt-16 grid gap-8 md:grid-cols-3 items-start">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              className={`bg-surface rounded-lg border p-8 flex flex-col ${tier.popular ? 'border-primary shadow-2xl shadow-primary/20' : 'border-border-color'}`}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {tier.popular && (
                <div className="text-center mb-4">
                  <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">MOST POPULAR</span>
                </div>
              )}
              <h3 className="text-2xl font-bold text-text-primary text-center">{tier.name}</h3>
              <div className="mt-4 text-center">
                <span className="text-4xl font-extrabold text-text-primary">{tier.price}</span>
                {tier.price !== 'Free' && tier.price !== 'Contact Us' && <span className="text-base font-medium text-text-secondary">/mo</span>}
              </div>
              <ul className="mt-8 space-y-4 flex-grow">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-1" />
                    <span className="text-text-secondary">{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-10">
                <Link
                  to="/auth"
                  className={`w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md ${
                    tier.popular
                      ? 'bg-primary text-white hover:bg-primary-hover'
                      : 'bg-secondary text-text-primary hover:bg-secondary-hover'
                  }`}
                >
                  {tier.cta}
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
