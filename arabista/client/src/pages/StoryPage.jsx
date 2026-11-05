import React from 'react';
import Container from '../components/common/Container';
import SectionHeading from '../components/common/SectionHeading';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { Coffee, Heart, Sparkles } from 'lucide-react';

export default function StoryPage() {
  return (
    <div className="py-12 md:py-20 space-y-16">
      <Container>
        <SectionHeading
          eyebrow="Our Journey"
          title="The Story of Arabista"
          subtitle="Born out of an obsession with slow roasted coffee and mindful gatherings in the heart of Surat."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="aspect-[4/5] arch-frame bg-sage/20 relative flex items-center justify-center p-8 text-center shadow-soft">
            <div className="relative z-10 text-forest">
              <span className="text-xs text-coffee font-semibold tracking-widest uppercase">
                Est. Surat, Gujarat
              </span>
              <h3 className="text-3xl font-serif font-bold mt-2">
                Conscious Craft &amp; Community
              </h3>
            </div>
          </div>

          <div className="space-y-6 text-charcoal/80 leading-relaxed font-sans">
            <h3 className="text-2xl md:text-3xl font-serif font-medium text-forest">
              Crafted with Intention, Poured with Care
            </h3>
            <p>
              Arabista was conceptualized as an antithesis to hurried, industrial coffee.
              We wanted a sanctuary in Surat where coffee is treated not merely as fuel,
              but as an aromatic artisanal ritual.
            </p>
            <p>
              From our 18-hour cold brew extractions infused with freshly cracked green
              cardamom to our 48-hour fermented sourdough crusts, we honour slow, unhurried methods.
            </p>
            <p>
              Every cup tells a story of sustainable estates, passionate farmers, and
              painstaking barista calibration.
            </p>

            <div className="pt-4">
              <Button to="/menu" variant="primary" size="md">
                Experience Our Menu
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
