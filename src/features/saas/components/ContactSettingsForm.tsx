import { Plus, Trash2, MapPin, X } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from '../../../components/ui';
import { YandexMapPicker } from './YandexMapPicker';
import type { ContactInfo, SocialLink } from '../contact.types';

interface Props {
  value: ContactInfo;
  onChange: (next: ContactInfo) => void;
}

const CONTACT_FIELDS: { key: keyof ContactInfo; label: string; ph: string }[] = [
  { key: 'phone', label: "Telefon (ko'rinadigan)", ph: '+998 (90) 123-45-67' },
  { key: 'phoneHref', label: 'Telefon (havola — faqat raqamlar)', ph: '+998901234567' },
  { key: 'email', label: 'Email', ph: 'info@kompaniya.uz' },
  { key: 'address', label: 'Manzil (matn)', ph: 'Toshkent, Chilonzor 12' },
];

// Qayta ishlatiladigan aloqa + xarita + ijtimoiy tarmoqlar formasi.
// Landing (super admin) va kompaniya sozlamalarida bir xil ishlatiladi.
export function ContactSettingsForm({ value, onChange }: Props) {
  const set = (patch: Partial<ContactInfo>) => onChange({ ...value, ...patch });
  const socials = value.socials ?? [];

  const setSocial = (i: number, patch: Partial<SocialLink>) => {
    const next = socials.map((s, idx) => (idx === i ? { ...s, ...patch } : s));
    set({ socials: next });
  };
  const addSocial = () => set({ socials: [...socials, { name: '', url: '' }] });
  const removeSocial = (i: number) => set({ socials: socials.filter((_, idx) => idx !== i) });

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader><CardTitle>Aloqa ma'lumotlari</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {CONTACT_FIELDS.map((f) => (
            <div key={f.key}>
              <Label>{f.label}</Label>
              <Input
                value={(value[f.key] as string) ?? ''}
                placeholder={f.ph}
                onChange={(e) => set({ [f.key]: e.target.value } as Partial<ContactInfo>)}
                className="mt-1.5"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5 text-indigo-500" /> Joylashuv (xaritadan tanlang)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-slate-500 dark:text-slate-400">Xaritani bosing yoki belgini suring — koordinata saqlanadi va landing/saytda ko'rinadi.</p>
          <YandexMapPicker
            latitude={value.location ? String(value.location.lat) : ''}
            longitude={value.location ? String(value.location.lng) : ''}
            onChange={(lat, lng) => set({ location: { lat: Number(lat), lng: Number(lng) } })}
          />
          {value.location && (
            <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
              <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-mono dark:bg-slate-800">
                {value.location.lat.toFixed(6)}, {value.location.lng.toFixed(6)}
              </span>
              <button type="button" onClick={() => set({ location: null })} className="inline-flex items-center gap-1 text-rose-500 hover:underline">
                <X className="h-3.5 w-3.5" /> Tozalash
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Ijtimoiy tarmoqlar</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addSocial}><Plus className="mr-1.5 h-4 w-4" /> Qo'shish</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {socials.length === 0 && (
            <p className="text-sm text-slate-400">Hali ijtimoiy tarmoq qo'shilmagan. "Qo'shish" tugmasini bosing.</p>
          )}
          {socials.map((s, i) => (
            <div key={i} className="flex items-end gap-2">
              <div className="w-40 shrink-0">
                {i === 0 && <Label className="text-xs">Nomi</Label>}
                <Input value={s.name} placeholder="Telegram" onChange={(e) => setSocial(i, { name: e.target.value })} className="mt-1" />
              </div>
              <div className="flex-1">
                {i === 0 && <Label className="text-xs">Havola</Label>}
                <Input value={s.url} placeholder="https://t.me/..." onChange={(e) => setSocial(i, { url: e.target.value })} className="mt-1" />
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={() => removeSocial(i)}><Trash2 className="h-4 w-4 text-rose-500" /></Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
