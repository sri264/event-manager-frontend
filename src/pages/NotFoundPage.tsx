import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="text-7xl font-extrabold text-primary">404</p>
      <h1 className="mt-4 text-2xl font-bold text-navy">Page not found</h1>
      <p className="mt-2 text-muted-foreground">The page you are looking for doesn&apos;t exist.</p>
      <Button asChild className="mt-6">
        <Link to="/">Back to Home</Link>
      </Button>
    </div>
  );
}
