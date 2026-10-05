import { AboutSection } from './sections/AboutSection';
import { AmenitiesSection } from './sections/AmenitiesSection';
import { CtaSection } from './sections/CtaSection';
import { FacilitiesSection } from './sections/FacilitiesSection';
import { GallerySection } from './sections/GallerySection';
import { HeroSection } from './sections/HeroSection';
import { HighlightsStrip } from './sections/HighlightsStrip';
import { PopularVenuesSection } from './sections/PopularVenuesSection';
import { TestimonialsSection } from './sections/TestimonialsSection';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <HighlightsStrip />
      <FacilitiesSection />
      <AboutSection />
      <PopularVenuesSection />
      <AmenitiesSection />
      <GallerySection />
      <TestimonialsSection />
      <CtaSection />
    </>
  );
}
