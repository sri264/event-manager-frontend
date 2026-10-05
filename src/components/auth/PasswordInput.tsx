import { Eye, EyeOff } from 'lucide-react';
import { forwardRef, useState, type ComponentProps } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export const PasswordInput = forwardRef<HTMLInputElement, ComponentProps<'input'>>(
  ({ className, ...props }, ref) => {
    const [visible, setVisible] = useState(false);
    return (
      <div className="relative">
        <Input
          ref={ref}
          type={visible ? 'text' : 'password'}
          className={cn('pr-10', className)}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible(v => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-md text-muted-foreground hover:text-foreground"
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    );
  },
);
PasswordInput.displayName = 'PasswordInput';
