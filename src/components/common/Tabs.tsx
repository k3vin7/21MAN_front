import { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type TabItem<T extends string> = {
  value: T;
  label: string;
  badge?: ReactNode;
  content: ReactNode;
};

type TabsProps<T extends string> = {
  items: TabItem<T>[];
  value: T;
  onValueChange: (value: T) => void;
  className?: string;
};

export const Tabs = <T extends string>({ items, value, onValueChange, className }: TabsProps<T>) => {
  const activeItem = items.find((item) => item.value === value) ?? items[0];

  return (
    <div className={className}>
      <div className="flex gap-1 overflow-x-auto rounded-lg border border-slate-200 bg-slate-50 p-1">
        {items.map((item) => {
          const isActive = item.value === activeItem.value;

          return (
            <button
              key={item.value}
              className={cn(
                'inline-flex h-9 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-medium transition',
                isActive ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:bg-white hover:text-slate-950',
              )}
              onClick={() => onValueChange(item.value)}
              type="button"
            >
              {item.label}
              {item.badge}
            </button>
          );
        })}
      </div>

      <div className="mt-4">{activeItem.content}</div>
    </div>
  );
};
