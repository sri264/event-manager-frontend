import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          aria-label="Back to top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          initial={{ opacity: 0, scale: 0.8, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 12 }}
          className="fixed bottom-6 right-6 z-40 grid h-12 w-12 place-items-center rounded-full bg-navy text-white shadow-search transition-colors hover:bg-primary"
        >
          <ArrowUp className="h-5 w-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
