import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Textarea } from '@/components/common/Textarea';
import type {
  Difficulty,
  RecruitingAreaStatus,
  RecruitingAreaType,
} from '@/features/repository/repository.types';
import {
  DIFFICULTY_LABELS,
  RECRUITING_AREA_LABELS,
  RECRUITING_STATUS_LABELS,
} from '@/lib/constants';
import {
  createWizardId,
  type RepositoryWizardStepProps,
  type WizardRecruitingArea,
} from '@/components/forms/repositoryWizard.types';

const areaTypes = Object.keys(RECRUITING_AREA_LABELS) as RecruitingAreaType[];
const statuses = Object.keys(RECRUITING_STATUS_LABELS) as RecruitingAreaStatus[];
const difficulties = Object.keys(DIFFICULTY_LABELS) as Difficulty[];

export const StepRecruitingAreas = ({ draft, updateDraft }: RepositoryWizardStepProps) => {
  const updateArea = (areaId: string, patch: Partial<WizardRecruitingArea>) => {
    updateDraft({
      recruitingAreas: draft.recruitingAreas.map((area) =>
        area.id === areaId ? { ...area, ...patch } : area,
      ),
    });
  };

  const addArea = () => {
    updateDraft({
      recruitingAreas: [
        ...draft.recruitingAreas,
        {
          id: createWizardId('area'),
          type: 'CHARACTER',
          status: 'ACTIVELY_RECRUITING',
          difficulty: 'MEDIUM',
          description: '',
        },
      ],
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">모집 영역</h2>
          <p className="mt-1 text-sm text-slate-500">공동창작자가 어디에 참여할 수 있는지 명확히 알려주세요.</p>
        </div>
        <Button leftIcon={<Plus className="size-4" />} onClick={addArea} variant="secondary">
          모집 영역 추가
        </Button>
      </div>

      <div className="space-y-4">
        {draft.recruitingAreas.map((area) => (
          <div key={area.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="grid gap-3 md:grid-cols-3">
              <WizardSelect
                label="영역 유형"
                onChange={(value) => updateArea(area.id, { type: value as RecruitingAreaType })}
                options={areaTypes.map((type) => ({ label: RECRUITING_AREA_LABELS[type], value: type }))}
                value={area.type}
              />
              <WizardSelect
                label="모집 상태"
                onChange={(value) => updateArea(area.id, { status: value as RecruitingAreaStatus })}
                options={statuses.map((status) => ({ label: RECRUITING_STATUS_LABELS[status], value: status }))}
                value={area.status}
              />
              <WizardSelect
                label="난이도"
                onChange={(value) => updateArea(area.id, { difficulty: value as Difficulty })}
                options={difficulties.map((difficulty) => ({ label: DIFFICULTY_LABELS[difficulty], value: difficulty }))}
                value={area.difficulty}
              />
            </div>
            <Textarea
              className="mt-3 min-h-24"
              label="설명"
              onChange={(event) => updateArea(area.id, { description: event.target.value })}
              value={area.description}
            />
            <Button
              className="mt-3"
              leftIcon={<Trash2 className="size-4" />}
              onClick={() =>
                updateDraft({ recruitingAreas: draft.recruitingAreas.filter((item) => item.id !== area.id) })
              }
              variant="ghost"
            >
              모집 영역 삭제
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

type WizardSelectProps = {
  label: string;
  value: string;
  options: Array<{ label: string; value: string }>;
  onChange: (value: string) => void;
};

const WizardSelect = ({ label, value, options, onChange }: WizardSelectProps) => {
  return (
    <label className="text-sm font-medium text-slate-700">
      {label}
      <select
        className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/15"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
};
