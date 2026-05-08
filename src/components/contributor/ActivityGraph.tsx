import type { ProfileActivity } from '@/features/user/user.types';
import { cn } from '@/lib/cn';

type ActivityGraphProps = {
  activities: ProfileActivity[];
};

const days = Array.from({ length: 35 }, (_, index) => index);

export const ActivityGraph = ({ activities }: ActivityGraphProps) => {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold text-slate-950">Activity Graph</h3>
      <div className="mt-4 grid grid-cols-7 gap-2">
        {days.map((day) => {
          const count = activities.filter((_, index) => index % 35 === day % 35).length;

          return (
            <div
              key={day}
              className={cn(
                'aspect-square rounded-sm border border-slate-200',
                count > 1 ? 'bg-accent-400' : count === 1 ? 'bg-accent-200' : 'bg-slate-100',
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
