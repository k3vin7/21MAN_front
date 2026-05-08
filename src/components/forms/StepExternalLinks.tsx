import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import {
  createWizardId,
  type RepositoryWizardStepProps,
  type WizardExternalLink,
} from '@/components/forms/repositoryWizard.types';

const supportedLinkTypes = ['Naver Webtoon', 'KakaoPage', 'Instagram', 'Notion', 'Website'];

export const StepExternalLinks = ({ draft, updateDraft }: RepositoryWizardStepProps) => {
  const updateLink = (linkId: string, patch: Partial<WizardExternalLink>) => {
    updateDraft({
      externalLinks: draft.externalLinks.map((link) =>
        link.id === linkId ? { ...link, ...patch } : link,
      ),
    });
  };

  const addLink = () => {
    updateDraft({
      externalLinks: [
        ...draft.externalLinks,
        {
          id: createWizardId('link'),
          type: 'Notion',
          url: '',
        },
      ],
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">외부 링크</h2>
          <p className="mt-1 text-sm text-slate-500">작품 원문, 설정 문서, SNS를 연결할 수 있습니다.</p>
        </div>
        <Button leftIcon={<Plus className="size-4" />} onClick={addLink} variant="secondary">
          링크 추가
        </Button>
      </div>

      <div className="space-y-3">
        {draft.externalLinks.map((link) => (
          <div key={link.id} className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 md:grid-cols-[180px_minmax(0,1fr)_auto]">
            <label className="text-sm font-medium text-slate-700">
              링크 유형
              <select
                className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/15"
                onChange={(event) => updateLink(link.id, { type: event.target.value })}
                value={link.type}
              >
                {supportedLinkTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>
            <Input
              label="URL"
              onChange={(event) => updateLink(link.id, { url: event.target.value })}
              placeholder="https://..."
              value={link.url}
            />
            <Button
              aria-label="링크 삭제"
              className="self-end"
              leftIcon={<Trash2 className="size-4" />}
              onClick={() =>
                updateDraft({ externalLinks: draft.externalLinks.filter((item) => item.id !== link.id) })
              }
              size="icon"
              variant="ghost"
            >
              삭제
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
