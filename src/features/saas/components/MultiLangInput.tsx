import { useRef, useState } from 'react';
import { Languages, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Input, Label } from '../../../components/ui';
import { cn } from '../../../utils';
import { autoFillFromUz, uzToCyrillic } from '../autoTranslate';

// 4 tilli kirish maydoni qiymatlari (uz — asosiy/majburiy, qolganlari ixtiyoriy).
export interface MultiLangValues {
  uz: string;
  en: string;
  ru: string;
  cyrl: string;
}

export const emptyMultiLang: MultiLangValues = { uz: '', en: '', ru: '', cyrl: '' };

type LangKey = keyof MultiLangValues;

const TABS: { key: LangKey; label: string }[] = [
  { key: 'uz', label: 'Uz' },
  { key: 'en', label: 'En' },
  { key: 'ru', label: 'Ру' },
  { key: 'cyrl', label: 'Кир' },
];

interface MultiLangInputProps {
  label: string;
  values: MultiLangValues;
  onChange: (values: MultiLangValues) => void;
  type?: 'input' | 'textarea';
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  // Avto-tarjima tugmasi (default: yoqilgan)
  autoTranslate?: boolean;
}

// Til tablari bilan ixcham 4 tilli matn kiritish.
//  - "Tarjima" tugmasi: uz dan ru/en (API) + cyrl (transliteratsiya) ni to'ldiradi.
//  - Jonli: uz yozilganda cyrl avtomatik transliteratsiya bo'ladi (cyrl qo'lda
//    o'zgartirilmagan bo'lsa).
export function MultiLangInput({
  label,
  values,
  onChange,
  type = 'input',
  required = false,
  placeholder,
  disabled = false,
  autoTranslate = true,
}: MultiLangInputProps) {
  const [active, setActive] = useState<LangKey>('uz');
  const [translating, setTranslating] = useState(false);
  // cyrl qo'lda tahrirlangan bo'lsa jonli transliteratsiya to'xtaydi
  const cyrlTouchedRef = useRef(Boolean(values.cyrl));

  const setLang = (key: LangKey, val: string) => {
    if (key === 'cyrl') {
      cyrlTouchedRef.current = true;
      onChange({ ...values, cyrl: val });
      return;
    }
    if (key === 'uz') {
      const next = { ...values, uz: val };
      // cyrl hali qo'lda tahrirlanmagan bo'lsa — jonli transliteratsiya
      if (!cyrlTouchedRef.current) {
        next.cyrl = uzToCyrillic(val);
      }
      onChange(next);
      return;
    }
    onChange({ ...values, [key]: val });
  };

  const handleTranslate = async () => {
    const uz = (values.uz || '').trim();
    if (!uz) {
      toast.error('Avval o\'zbekcha (Uz) matnni kiriting!');
      setActive('uz');
      return;
    }
    setTranslating(true);
    try {
      const filled = await autoFillFromUz(uz);
      cyrlTouchedRef.current = true;
      onChange({
        uz: values.uz,
        ru: filled.ru || values.ru,
        en: filled.en || values.en,
        cyrl: filled.cyrl,
      });
      if (filled.ru || filled.en) {
        toast.success('Tarjima qilindi');
      } else {
        toast('Faqat kirill transliteratsiya qilindi (tarjima API javob bermadi)', { icon: 'ℹ️' });
      }
    } finally {
      setTranslating(false);
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <Label>
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </Label>
        <div className="flex items-center gap-1.5">
          {autoTranslate && (
            <button
              type="button"
              onClick={handleTranslate}
              disabled={disabled || translating}
              title="O'zbekchadan ru/en/kirillga avtomatik to'ldirish"
              className="inline-flex items-center gap-1 rounded-md border border-primary/30 bg-primary/5 px-2 py-0.5 text-xs font-medium text-primary hover:bg-primary/10 disabled:opacity-50 transition-colors"
            >
              {translating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Languages className="h-3 w-3" />}
              Tarjima
            </button>
          )}
          <div className="inline-flex rounded-lg border border-border/60 bg-muted/40 p-0.5">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActive(tab.key)}
                className={cn(
                  'rounded-md px-2 py-0.5 text-xs font-medium transition-colors',
                  active === tab.key
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {tab.label}
                {tab.key === 'uz' && required && <span className="ml-0.5 text-red-500">*</span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      {type === 'textarea' ? (
        <textarea
          value={values[active]}
          onChange={(e) => setLang(active, e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          rows={3}
          className={cn(
            'flex w-full rounded-xl border border-input bg-background px-3.5 py-2 text-sm ring-offset-background placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:border-primary/50 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200',
          )}
        />
      ) : (
        <Input
          value={values[active]}
          onChange={(e) => setLang(active, e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
        />
      )}
    </div>
  );
}
