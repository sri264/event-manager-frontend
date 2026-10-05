import { Construction } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface ComingSoonProps {
  title: string;
  description?: string;
  backTo?: string;
}

/** Placeholder for screens that are routed but not yet implemented. */
export function ComingSoon({ title, description, backTo = '/' }: ComingSoonProps) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 py-16 text-center">
      <span className="mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-secondary text-primary">
        <Construction className="h-7 w-7" />
      </span>
      <h1 className="text-2xl font-bold text-navy">{title}</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        {description ?? 'This screen is being built and will be available soon.'}
      </p>
      <Button asChild variant="outline" className="mt-6">
        <Link to={backTo}>Go back</Link>
      </Button>
    </div>
  );
}
