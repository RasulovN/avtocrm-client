import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Loader2, Save } from 'lucide-react';
import { Button } from '../../../../components/ui';
import { siteSettingsApi } from '../../services';
import { ContactSettingsForm } from '../../components/ContactSettingsForm';
import { normalizeContact, EMPTY_CONTACT, type ContactInfo } from '../../contact.types';

export function SiteSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [value, setValue] = useState<ContactInfo>(EMPTY_CONTACT);

  useEffect(() => {
    siteSettingsApi
      .get()
      .then((s) => setValue(normalizeContact(s)))
      .catch(() => toast.error("Sozlamalarni yuklab bo'lmadi"))
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const saved = await siteSettingsApi.update(value);
      setValue(normalizeContact(saved));
      toast.success('Saqlandi — landing sahifa yangilandi');
    } catch {
      toast.error("Saqlab bo'lmadi");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-24 text-slate-400"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Landing sozlamalari</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Aloqa ma'lumotlari, xaritadagi joylashuv va ijtimoiy tarmoqlar — landing sahifada ko'rinadi</p>
      </div>

      <ContactSettingsForm value={value} onChange={setValue} />

      <div className="sticky bottom-4 flex justify-end">
        <Button onClick={save} disabled={saving} className="shadow-lg">
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Saqlash
        </Button>
      </div>
    </div>
  );
}
