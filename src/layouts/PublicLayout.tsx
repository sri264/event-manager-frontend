import { Outlet, ScrollRestoration } from 'react-router-dom';
import { Footer } from '@/components/common/Footer';
import { Header } from '@/components/common/Header';
import { ScrollToTopButton } from '@/components/common/ScrollToTopButton';

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <ScrollToTopButton />
      <ScrollRestoration />
    </div>
  );
}
