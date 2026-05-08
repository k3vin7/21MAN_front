import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Textarea } from '@/components/common/Textarea';
import type { Character, Location } from '@/features/repository/repository.types';
import {
  createWizardId,
  type RepositoryWizardStepProps,
} from '@/components/forms/repositoryWizard.types';

export const StepReadme = ({ draft, updateDraft }: RepositoryWizardStepProps) => {
  const updateCharacter = (characterId: string, patch: Partial<Character>) => {
    updateDraft({
      mainCharacters: draft.mainCharacters.map((character) =>
        character.id === characterId ? { ...character, ...patch } : character,
      ),
    });
  };

  const updateLocation = (locationId: string, patch: Partial<Location>) => {
    updateDraft({
      mainLocations: draft.mainLocations.map((location) =>
        location.id === locationId ? { ...location, ...patch } : location,
      ),
    });
  };

  return (
    <div className="space-y-6">
      <Textarea
        label="세계관 개요"
        onChange={(event) => updateDraft({ worldOverview: event.target.value })}
        placeholder="세계의 규칙, 분위기, 중심 갈등을 적어주세요."
        value={draft.worldOverview}
      />

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-950">주요 캐릭터</h2>
          <Button
            leftIcon={<Plus className="size-4" />}
            onClick={() =>
              updateDraft({
                mainCharacters: [
                  ...draft.mainCharacters,
                  {
                    id: createWizardId('character'),
                    name: '',
                    role: '',
                    description: '',
                  },
                ],
              })
            }
            variant="secondary"
          >
            캐릭터 추가
          </Button>
        </div>

        {draft.mainCharacters.map((character) => (
          <div key={character.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
              <Input
                label="이름"
                onChange={(event) => updateCharacter(character.id, { name: event.target.value })}
                value={character.name}
              />
              <Input
                label="역할"
                onChange={(event) => updateCharacter(character.id, { role: event.target.value })}
                value={character.role}
              />
              <Button
                aria-label="캐릭터 삭제"
                className="self-end"
                leftIcon={<Trash2 className="size-4" />}
                onClick={() =>
                  updateDraft({
                    mainCharacters: draft.mainCharacters.filter((item) => item.id !== character.id),
                  })
                }
                size="icon"
                variant="ghost"
              >
                삭제
              </Button>
            </div>
            <Textarea
              className="mt-3 min-h-24"
              label="설명"
              onChange={(event) => updateCharacter(character.id, { description: event.target.value })}
              value={character.description}
            />
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-950">주요 장소</h2>
          <Button
            leftIcon={<Plus className="size-4" />}
            onClick={() =>
              updateDraft({
                mainLocations: [
                  ...draft.mainLocations,
                  {
                    id: createWizardId('location'),
                    name: '',
                    description: '',
                  },
                ],
              })
            }
            variant="secondary"
          >
            지역 추가
          </Button>
        </div>

        {draft.mainLocations.map((location) => (
          <div key={location.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
              <Input
                label="이름"
                onChange={(event) => updateLocation(location.id, { name: event.target.value })}
                value={location.name}
              />
              <Button
                aria-label="지역 삭제"
                className="self-end"
                leftIcon={<Trash2 className="size-4" />}
                onClick={() =>
                  updateDraft({
                    mainLocations: draft.mainLocations.filter((item) => item.id !== location.id),
                  })
                }
                size="icon"
                variant="ghost"
              >
                삭제
              </Button>
            </div>
            <Textarea
              className="mt-3 min-h-24"
              label="설명"
              onChange={(event) => updateLocation(location.id, { description: event.target.value })}
              value={location.description}
            />
          </div>
        ))}
      </section>

      <Textarea
        helperText="한 줄에 하나씩 입력하면 미리보기에서 목록으로 렌더링됩니다."
        label="핵심 규칙"
        onChange={(event) => updateDraft({ coreRulesText: event.target.value })}
        placeholder="기억은 빌릴 수 있지만 소유할 수 없다."
        value={draft.coreRulesText}
      />
      <Textarea
        helperText="여기 적은 내용은 AI 충돌 검사의 기준이 됩니다."
        label="금지 설정"
        onChange={(event) => updateDraft({ forbiddenSettingsText: event.target.value })}
        placeholder="실존 지역 비하&#10;특정 집단에 대한 고정관념 강화"
        value={draft.forbiddenSettingsText}
      />
    </div>
  );
};
