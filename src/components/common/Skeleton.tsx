import { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export const Skeleton = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-slate-200', className)}
      aria-hidden="true"
      {...props}
    />
  );
};
