import { FormEvent, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/auth.store';
import type { Repository, RecruitingAreaType, WorkScale } from '@/features/repository/repository.types';
import { useRepositoryStore } from '@/features/repository/repository.store';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useToast } from '@/hooks/useToast';
import { RECOMMENDED_TAGS } from '@/lib/constants';

type DraftItem = {
  id: string;
  name: string;
  description: string;
};

type DraftLink = {
  id: string;
  url: string;
};

type SimpleRepositoryDraft = {
  title: string;
  description: string;
  thumbnail: string;
  tags: string[];
  tagQuery: string;
  externalLinks: DraftLink[];
  worldOverview: string;
  characters: DraftItem[];
  regions: DraftItem[];
  worldRulesText: string;
  forbiddenSettingsText: string;
  recruitingTypes: RecruitingAreaType[];
};

const wizardStorageKey = 'worldbuild:new-repository-simple';

const defaultThumbnail =
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80';

const recruitingOptions: Array<{ type: RecruitingAreaType; label: string; description: string }> = [
  {
    type: 'CHARACTER',
    label: '캐릭터 모집',
    description: '새 인물, 관계, 성격 제안',
  },
  {
    type: 'EPISODE',
    label: '에피소드 제안',
    description: '새 사건, 외전, 장면 제안',
  },
  {
    type: 'WORLD_RULE',
    label: '세계관 찾기',
    description: '규칙, 지역, 문화 설정 제안',
  },
];

const createId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const createInitialState = (): SimpleRepositoryDraft => ({
  title: '',
  description: '',
  thumbnail: '',
  tags: [],
  tagQuery: '',
  externalLinks: [{ id: createId('link'), url: '' }],
  worldOverview: '',
  characters: [{ id: createId('character'), name: '', description: '' }],
  regions: [{ id: createId('region'), name: '', description: '' }],
  worldRulesText: '',
  forbiddenSettingsText: '',
  recruitingTypes: ['CHARACTER'],
});

const slugify = (value: string) => {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, '-')
    .replace(/^-|-$/g, '');

  return normalized || 'new-world';
};

const createRepositoryId = (title: string) => `${slugify(title)}-${Date.now().toString(36)}`;

const lines = (value: string) => value.split('\n').map((line) => line.trim()).filter(Boolean);

export const RepositoryWizard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const currentUser = useAuthStore((state) => state.user);
  const createRepository = useRepositoryStore((state) => state.createRepository);
  const [draft, setDraft, clearDraft] = useLocalStorage<SimpleRepositoryDraft>(
    wizardStorageKey,
    createInitialState(),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPublishing, setIsPublishing] = useState(false);

  const recommendedTags = RECOMMENDED_TAGS.slice(0, 5);
  const tagSuggestions = useMemo(() => {
    const query = draft.tagQuery.trim().toLowerCase();
    if (!query) {
      return [];
    }

    return recommendedTags.filter((tag) => tag.toLowerCase().includes(query) && !draft.tags.includes(tag));
  }, [draft.tagQuery, draft.tags, recommendedTags]);

  const canPublish = Boolean(draft.title.trim()) && draft.tags.length <= 10 && !isPublishing;

  const updateDraft = (patch: Partial<SimpleRepositoryDraft>) => {
    setDraft((current) => ({
      ...current,
      ...patch,
    }));
  };

  const toggleTag = (tag: string) => {
    const nextTags = draft.tags.includes(tag)
      ? draft.tags.filter((item) => item !== tag)
      : [...draft.tags, tag].slice(0, 10);

    updateDraft({ tags: nextTags });
  };

  const addTagFromInput = () => {
    const tag = draft.tagQuery.trim().replace(/^#/, '');
    if (!tag) {
      return;
    }

    if (draft.tags.length >= 10) {
      setErrors({ tags: '태그는 10개까지만 추가할 수 있습니다.' });
      return;
    }

    updateDraft({
      tags: draft.tags.includes(tag) ? draft.tags : [...draft.tags, tag],
      tagQuery: '',
    });
    setErrors((current) => ({ ...current, tags: '' }));
  };

  const updateLink = (id: string, url: string) => {
    updateDraft({
      externalLinks: draft.externalLinks.map((link) => (link.id === id ? { ...link, url } : link)),
    });
  };

  const updateItem = (key: 'characters' | 'regions', id: string, patch: Partial<DraftItem>) => {
    updateDraft({
      [key]: draft[key].map((item) => (item.id === id ? { ...item, ...patch } : item)),
    });
  };

  const removeItem = (key: 'characters' | 'regions', id: string) => {
    updateDraft({
      [key]: draft[key].filter((item) => item.id !== id),
    });
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!draft.title.trim()) {
      nextErrors.title = '제목을 입력해주세요.';
    }

    if (draft.tags.length > 10) {
      nextErrors.tags = '태그는 10개까지만 추가할 수 있습니다.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    setIsPublishing(true);

    try {
      const repository = buildRepositoryFromDraft(draft, currentUser?.username);
      const createdRepository = await createRepository(repository);

      if (!createdRepository) {
        toast({
          title: '저장에 실패했습니다.',
          description: '잠시 뒤 다시 시도해주세요.',
          tone: 'error',
        });
        return;
      }

      clearDraft();
      toast({
        title: '세계관을 만들었습니다.',
        tone: 'success',
      });
      navigate(`/r/${createdRepository.id}`);
    } catch {
      toast({
        title: '저장에 실패했습니다.',
        description: '잠시 뒤 다시 시도해주세요.',
        tone: 'error',
      });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <form className="mx-auto max-w-2xl pb-28" onSubmit={handleSubmit}>
      <h1 className="text-3xl font-bold tracking-normal text-slate-950">내 세계관 등록</h1>

      <div className="mt-12 space-y-12">
        <section className="space-y-5">
          <InputField
            error={errors.title}
            label="제목"
            onChange={(value) => updateDraft({ title: value })}
            placeholder="달빛 왕국의 마법사들"
            value={draft.title}
          />
          <TextField
            label="설명"
            onChange={(value) => updateDraft({ description: value })}
            placeholder="마법 학교에서 시작되는 성장 이야기"
            value={draft.description}
          />
          <InputField
            label="썸네일"
            onChange={(value) => updateDraft({ thumbnail: value })}
            placeholder="https://example.com/image.png"
            value={draft.thumbnail}
          />

          <div className="space-y-2">
            <Label>태그</Label>
            <div className="flex gap-2">
              <input
                className="h-12 min-w-0 flex-1 rounded-xl border-0 bg-slate-100 px-4 text-base text-slate-950 outline-none placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500/70"
                onChange={(event) => updateDraft({ tagQuery: event.target.value })}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    addTagFromInput();
                  }
                }}
                placeholder="판타지"
                value={draft.tagQuery}
              />
              <button
                className="h-12 rounded-xl bg-slate-950 px-4 text-sm font-bold text-white"
                onClick={addTagFromInput}
                type="button"
              >
                추가
              </button>
            </div>
            {tagSuggestions.length ? (
              <div className="flex flex-wrap gap-2">
                {tagSuggestions.map((tag) => (
                  <button
                    key={tag}
                    className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700"
                    onClick={() => {
                      toggleTag(tag);
                      updateDraft({ tagQuery: '' });
                    }}
                    type="button"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            ) : null}
            <div className="flex flex-wrap gap-2">
              {recommendedTags.map((tag) => (
                <button
                  key={tag}
                  className={`rounded-full px-3 py-2 text-sm font-bold transition ${
                    draft.tags.includes(tag)
                      ? 'bg-slate-950 text-white'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                  onClick={() => toggleTag(tag)}
                  type="button"
                >
                  #{tag}
                </button>
              ))}
            </div>
            {draft.tags.length ? (
              <p className="text-sm text-slate-500">선택됨: {draft.tags.map((tag) => `#${tag}`).join(' ')}</p>
            ) : (
              <p className="text-sm text-slate-500">추천 태그를 선택하거나 직접 입력할 수 있습니다.</p>
            )}
            {errors.tags ? <p className="text-sm text-red-500">{errors.tags}</p> : null}
          </div>

          <DynamicLinks
            links={draft.externalLinks}
            onAdd={() => updateDraft({ externalLinks: [...draft.externalLinks, { id: createId('link'), url: '' }] })}
            onChange={updateLink}
            onRemove={(id) => updateDraft({ externalLinks: draft.externalLinks.filter((link) => link.id !== id) })}
          />
        </section>

        <section className="space-y-5">
          <h2 className="text-xl font-bold text-slate-950">소개</h2>
          <TextField
            label="작품 설명"
            onChange={(value) => updateDraft({ worldOverview: value })}
            placeholder="이 세계에서 중요한 사건과 분위기"
            value={draft.worldOverview}
          />
          <DynamicItems
            items={draft.characters}
            label="캐릭터"
            namePlaceholder="아르카"
            onAdd={() => updateDraft({ characters: [...draft.characters, { id: createId('character'), name: '', description: '' }] })}
            onChange={(id, patch) => updateItem('characters', id, patch)}
            onRemove={(id) => removeItem('characters', id)}
            textPlaceholder="주인공 마법사"
          />
          <DynamicItems
            items={draft.regions}
            label="지역"
            namePlaceholder="에테르 왕국"
            onAdd={() => updateDraft({ regions: [...draft.regions, { id: createId('region'), name: '', description: '' }] })}
            onChange={(id, patch) => updateItem('regions', id, patch)}
            onRemove={(id) => removeItem('regions', id)}
            textPlaceholder="마법이 가장 발달한 나라"
          />
          <TextField
            label="세계관 규칙"
            onChange={(value) => updateDraft({ worldRulesText: value })}
            placeholder={'마법은 감정에 반응한다\n왕국 밖에서는 시간의 흐름이 다르다'}
            value={draft.worldRulesText}
          />
          <TextField
            label="금지 설정"
            onChange={(value) => updateDraft({ forbiddenSettingsText: value })}
            placeholder="신이 직접 등장하는 설정"
            value={draft.forbiddenSettingsText}
          />
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-950">모집 항목</h2>
          <div className="grid gap-3">
            {recruitingOptions.map((option) => {
              const selected = draft.recruitingTypes.includes(option.type);

              return (
                <button
                  key={option.type}
                  className={`rounded-2xl p-4 text-left transition ${
                    selected ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                  onClick={() => {
                    updateDraft({
                      recruitingTypes: selected
                        ? draft.recruitingTypes.filter((type) => type !== option.type)
                        : [...draft.recruitingTypes, option.type],
                    });
                  }}
                  type="button"
                >
                  <span className="font-bold">{option.label}</span>
                  <span className={`mt-1 block text-sm ${selected ? 'text-slate-300' : 'text-slate-500'}`}>
                    {option.description}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-100 bg-white/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto max-w-2xl">
          <button
            className="h-14 w-full rounded-xl bg-blue-600 text-base font-bold text-white transition hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400"
            disabled={!canPublish}
            type="submit"
          >
            {isPublishing ? '만드는 중' : '만들기'}
          </button>
          {!draft.title.trim() ? (
            <p className="mt-2 text-center text-sm text-slate-500">제목을 입력하면 만들 수 있습니다.</p>
          ) : null}
        </div>
      </div>
    </form>
  );
};

const buildRepositoryFromDraft = (draft: SimpleRepositoryDraft, authorId?: string): Repository => {
  const now = new Date().toISOString();
  const coreRules = lines(draft.worldRulesText);
  const forbiddenSettings = lines(draft.forbiddenSettingsText);
  const recruitingTypes: RecruitingAreaType[] = draft.recruitingTypes.length ? draft.recruitingTypes : ['CHARACTER'];
  const workScale: WorkScale = draft.worldOverview.length > 350 ? 'LONG' : draft.worldOverview.length > 160 ? 'MEDIUM' : 'SHORT';

  return {
    id: createRepositoryId(draft.title),
    title: draft.title.trim(),
    thumbnail: draft.thumbnail.trim() || defaultThumbnail,
    authorId: authorId || 'current-user',
    description: draft.description.trim() || draft.worldOverview.trim(),
    genre: draft.tags.includes('SF') ? 'SF' : '판타지',
    workScale,
    tags: Array.from(new Set(draft.tags.filter(Boolean))),
    externalLinks: draft.externalLinks
      .filter((link) => link.url.trim())
      .map((link, index) => ({
        type: `link-${index + 1}`,
        url: link.url.trim(),
      })),
    readme: {
      intro: draft.description.trim() || draft.worldOverview.trim(),
      worldOverview: draft.worldOverview.trim() || draft.description.trim(),
      mainCharacters: draft.characters
        .filter((character) => character.name.trim())
        .map((character) => ({ ...character, role: '등장인물' })),
      mainLocations: draft.regions.filter((region) => region.name.trim()),
      coreRules: coreRules.length ? coreRules : ['공식 규칙은 원작자 검토를 통해 확정됩니다.'],
      forbiddenSettings: forbiddenSettings.length ? forbiddenSettings : ['기존 설정과 직접 충돌하는 전개'],
      recruitingAreas: recruitingTypes.map((type) => ({
        id: createId('area'),
        type,
        status: 'ACTIVELY_RECRUITING',
        difficulty: 'MEDIUM',
        description: recruitingOptions.find((option) => option.type === type)?.description ?? '창작 제안을 받습니다.',
      })),
      contributionGuidelines: '작품 분위기와 금지 설정을 확인한 뒤 창작 제안을 보내주세요.',
    },
    stats: {
      prCount: 0,
      mergeCount: 0,
      mergeRate: 0,
      avgReviewDays: 0,
      contributorCount: 0,
      lastActivity: now,
    },
    badges: ['NEW'],
  };
};

const Label = ({ children }: { children: string }) => {
  return <label className="text-sm font-bold text-slate-700">{children}</label>;
};

const InputField = ({
  error,
  label,
  onChange,
  placeholder,
  value,
}: {
  error?: string;
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
}) => {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <input
        className="h-12 w-full rounded-xl border-0 bg-slate-100 px-4 text-base text-slate-950 outline-none placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500/70"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        value={value}
      />
      {error ? <p className="text-sm text-red-500">{error}</p> : null}
    </div>
  );
};

const TextField = ({
  label,
  onChange,
  placeholder,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
}) => {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <textarea
        className="min-h-28 w-full resize-y rounded-xl border-0 bg-slate-100 px-4 py-3 text-base leading-7 text-slate-950 outline-none placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500/70"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        value={value}
      />
    </div>
  );
};

const DynamicLinks = ({
  links,
  onAdd,
  onChange,
  onRemove,
}: {
  links: DraftLink[];
  onAdd: () => void;
  onChange: (id: string, url: string) => void;
  onRemove: (id: string) => void;
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>외부 링크</Label>
        <button className="text-sm font-bold text-blue-600" onClick={onAdd} type="button">
          추가
        </button>
      </div>
      {links.map((link) => (
        <div key={link.id} className="flex gap-2">
          <input
            className="h-12 min-w-0 flex-1 rounded-xl border-0 bg-slate-100 px-4 text-base text-slate-950 outline-none placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500/70"
            onChange={(event) => onChange(link.id, event.target.value)}
            placeholder="https://example.com"
            value={link.url}
          />
          {links.length > 1 ? (
            <button className="px-2 text-sm font-bold text-slate-400" onClick={() => onRemove(link.id)} type="button">
              삭제
            </button>
          ) : null}
        </div>
      ))}
    </div>
  );
};

const DynamicItems = ({
  items,
  label,
  namePlaceholder,
  onAdd,
  onChange,
  onRemove,
  textPlaceholder,
}: {
  items: DraftItem[];
  label: string;
  namePlaceholder: string;
  onAdd: () => void;
  onChange: (id: string, patch: Partial<DraftItem>) => void;
  onRemove: (id: string) => void;
  textPlaceholder: string;
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <button className="text-sm font-bold text-blue-600" onClick={onAdd} type="button">
          추가
        </button>
      </div>
      {items.map((item) => (
        <div key={item.id} className="space-y-2 rounded-2xl bg-slate-50 p-3">
          <div className="flex gap-2">
            <input
              className="h-11 min-w-0 flex-1 rounded-xl border-0 bg-white px-3 text-base text-slate-950 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/70"
              onChange={(event) => onChange(item.id, { name: event.target.value })}
              placeholder={namePlaceholder}
              value={item.name}
            />
            {items.length > 1 ? (
              <button className="px-2 text-sm font-bold text-slate-400" onClick={() => onRemove(item.id)} type="button">
                삭제
              </button>
            ) : null}
          </div>
          <textarea
            className="min-h-20 w-full resize-y rounded-xl border-0 bg-white px-3 py-2 text-base leading-6 text-slate-950 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/70"
            onChange={(event) => onChange(item.id, { description: event.target.value })}
            placeholder={textPlaceholder}
            value={item.description}
          />
        </div>
      ))}
    </div>
  );
};
