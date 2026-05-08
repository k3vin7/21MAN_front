import { X } from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Textarea } from '@/components/common/Textarea';
import type { RepositoryGenre } from '@/features/repository/repository.types';
import { GENRES } from '@/lib/constants';
import type { RepositoryWizardStepProps } from '@/components/forms/repositoryWizard.types';

export const StepBasicInfo = ({ draft, updateDraft }: RepositoryWizardStepProps) => {
  const toggleGenre = (genre: RepositoryGenre) => {
    updateDraft({
      genres: draft.genres.includes(genre)
        ? draft.genres.filter((item) => item !== genre)
        : [...draft.genres, genre],
    });
  };

  const addTag = (value: string) => {
    const nextTag = value.trim().replace(/^#/, '');

    if (!nextTag || draft.tags.includes(nextTag)) {
      return;
    }

    updateDraft({ tags: [...draft.tags, nextTag] });
  };

  return (
    <div className="space-y-5">
      <Input
        label="Title"
        onChange={(event) => updateDraft({ title: event.target.value })}
        placeholder="예: 북촌 달그림자 기록"
        value={draft.title}
      />
      <Input
        label="Thumbnail URL"
        onChange={(event) => updateDraft({ thumbnail: event.target.value })}
        placeholder="https://images.unsplash.com/..."
        value={draft.thumbnail}
      />
      <Input
        label="One-line intro"
        onChange={(event) => updateDraft({ intro: event.target.value })}
        placeholder="이 세계관을 한 문장으로 소개해주세요."
        value={draft.intro}
      />
      <Textarea
        label="Description"
        onChange={(event) => updateDraft({ description: event.target.value })}
        placeholder="검색 카드와 상세 헤더에 표시될 소개입니다."
        value={draft.description}
      />

      <fieldset>
        <legend className="text-sm font-medium text-slate-700">Genre</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {GENRES.map((genre) => (
            <button
              key={genre}
              className={`rounded-lg border px-3 py-2 text-sm transition ${
                draft.genres.includes(genre)
                  ? 'border-accent-300 bg-accent-50 text-accent-900'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950'
              }`}
              onClick={() => toggleGenre(genre)}
              type="button"
            >
              {genre}
            </button>
          ))}
        </div>
      </fieldset>

      <div>
        <label className="text-sm font-medium text-slate-700" htmlFor="tag-input">
          Tags
        </label>
        <input
          id="tag-input"
          className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none placeholder:text-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/15"
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              addTag(event.currentTarget.value);
              event.currentTarget.value = '';
            }
          }}
          placeholder="태그 입력 후 Enter"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {draft.tags.map((tag) => (
            <Badge key={tag} tone="blue">
              #{tag}
              <button
                aria-label={`${tag} 태그 삭제`}
                className="ml-2"
                onClick={() => updateDraft({ tags: draft.tags.filter((item) => item !== tag) })}
                type="button"
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
        <Button className="mt-3" onClick={() => addTag('캐릭터모집')} size="sm" variant="secondary">
          캐릭터모집 태그 추가
        </Button>
      </div>
    </div>
  );
};
