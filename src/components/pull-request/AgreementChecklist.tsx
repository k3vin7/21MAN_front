type AgreementChecklistProps = {
  value: string[];
  onChange: (value: string[]) => void;
};

const agreements = [
  {
    id: 'ip',
    label: '공식 반영 시 IP는 원작자에게 귀속됨에 동의',
  },
  {
    id: 'credit',
    label: '크레딧은 내 프로필에 영구 표기됨에 동의',
  },
  {
    id: 'timestamp',
    label: '작성 / 제출 / 열람 시점이 영구 기록됨에 동의',
  },
];

export const AGREEMENT_IDS = agreements.map((agreement) => agreement.id);

export const AgreementChecklist = ({ value, onChange }: AgreementChecklistProps) => {
  const toggleAgreement = (agreementId: string) => {
    onChange(
      value.includes(agreementId)
        ? value.filter((item) => item !== agreementId)
        : [...value, agreementId],
    );
  };

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-950">제출 전 동의</h2>
      <div className="mt-4 space-y-3">
        {agreements.map((agreement) => (
          <label key={agreement.id} className="flex cursor-pointer items-center gap-3 text-sm text-slate-700">
            <input
              checked={value.includes(agreement.id)}
              className="size-4 rounded border-slate-300 bg-white text-accent-600 focus:ring-accent-500"
              onChange={() => toggleAgreement(agreement.id)}
              type="checkbox"
            />
            {agreement.label}
          </label>
        ))}
      </div>
    </section>
  );
};
