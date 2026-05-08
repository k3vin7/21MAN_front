import type { ProfileActivity } from '@/features/user/user.types';
import { cn } from '@/lib/cn';

type ActivityGraphProps = {
  activities: ProfileActivity[];
};

const days = Array.from({ length: 35 }, (_, index) => index);

export const ActivityGraph = ({ activities }: ActivityGraphProps) => {
  return (
    <div className="rounded-lg border border-white/10 bg-slate-900/70 p-5">
      <h3 className="text-base font-semibold text-white">Activity Graph</h3>
      <div className="mt-4 grid grid-cols-7 gap-2">
        {days.map((day) => {
          const count = activities.filter((_, index) => index % 35 === day % 35).length;

          return (
            <div
              key={day}
              className={cn(
                'aspect-square rounded-sm border border-white/5',
                count > 1 ? 'bg-accent-300' : count === 1 ? 'bg-accent-500/60' : 'bg-slate-800',
              )}
              title={`${count} activities`}
            />
          );
        })}
      </div>
      <p className="mt-4 text-xs text-slate-500">최근 5주 활동 밀도</p>
    </div>
  );
};

