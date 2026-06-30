import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  X, Loader2, Building2, Phone, Mail, MapPin, Tag, User, CheckCircle2, XCircle,
} from 'lucide-react';
import { companiesApi } from '../saas/services';
import type { Company } from '../saas/types';
import { resolveSupportUrl } from '../../services/supportApi';

function statusLabel(status: string, t: (k: string, d: string) => string): string {
  switch (status) {
    case 'active': return t('company.statusActive', 'Faol');
    case 'onboarding': return t('company.statusOnboarding', "Ro'yxatdan o'tmoqda");
    case 'suspended': return t('company.statusSuspended', 'To\'xtatilgan');
    default: return status;
  }
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value?: React.ReactNode }) {
  if (value === null || value === undefined || value === '') return null;
  return (
    <div className="flex items-start gap-3 py-2">
      <div className="mt-0.5 text-muted-foreground">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="break-words text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

export function CompanyInfoModal({ companyId, onClose }: { companyId: number | null; onClose: () => void }) {
  const { t } = useTranslation();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!companyId) return;
    setLoading(true);
    setError(false);
    setCompany(null);
    companiesApi
      .get(companyId)
      .then((c) => setCompany(c))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [companyId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!companyId) return null;

  const address = company
    ? [company.country?.name, company.region?.name, company.district?.name, company.street]
        .filter(Boolean)
        .join(', ')
    : '';
  const contactPhone = company?.contact?.phone?.trim();
  const socials = company?.contact?.socials?.filter((s) => s.url) ?? [];

  return (
    <div
      className="fixed inset-0 z-[330] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sarlavha */}
        <div className="flex items-center justify-between gap-2 border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">{t('support.companyInfo', 'Kompaniya ma\'lumotlari')}</h3>
          </div>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[calc(85vh-4rem)] overflow-y-auto p-5">
          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : error || !company ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {t('support.companyLoadError', "Ma'lumotni yuklab bo'lmadi")}
            </p>
          ) : (
            <>
              {/* Logo + nom + status */}
              <div className="mb-3 flex items-center gap-3">
                {company.logo ? (
                  <img
                    src={resolveSupportUrl(company.logo)}
                    alt={company.name}
                    className="h-14 w-14 rounded-xl border border-border object-cover"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/15 text-lg font-bold text-primary">
                    {company.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate text-base font-bold">{company.name}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        company.status === 'active'
                          ? 'bg-green-500/15 text-green-600'
                          : 'bg-amber-500/15 text-amber-600'
                      }`}
                    >
                      {statusLabel(company.status, t)}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      {company.subscription_active ? (
                        <><CheckCircle2 className="h-3.5 w-3.5 text-green-600" /> {t('support.subActive', 'Obuna faol')}</>
                      ) : (
                        <><XCircle className="h-3.5 w-3.5 text-red-500" /> {t('support.subInactive', 'Obuna yo\'q')}</>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-border/50">
                <Row icon={<User className="h-4 w-4" />} label={t('support.owner', 'Egasi')} value={company.owner?.full_name} />
                <Row
                  icon={<Phone className="h-4 w-4" />}
                  label={t('support.ownerPhone', 'Egasi telefoni')}
                  value={company.owner?.phone_number ? <a href={`tel:${company.owner.phone_number}`} className="text-primary hover:underline">{company.owner.phone_number}</a> : null}
                />
                <Row
                  icon={<Mail className="h-4 w-4" />}
                  label={t('support.ownerEmail', 'Egasi email')}
                  value={company.owner?.email ? <a href={`mailto:${company.owner.email}`} className="text-primary hover:underline">{company.owner.email}</a> : null}
                />
                <Row
                  icon={<Phone className="h-4 w-4" />}
                  label={t('support.companyPhone', 'Kompaniya telefoni')}
                  value={company.phone_number ? <a href={`tel:${company.phone_number}`} className="text-primary hover:underline">{company.phone_number}</a> : null}
                />
                <Row
                  icon={<Mail className="h-4 w-4" />}
                  label={t('support.companyEmail', 'Kompaniya email')}
                  value={company.email ? <a href={`mailto:${company.email}`} className="text-primary hover:underline">{company.email}</a> : null}
                />
                {contactPhone && contactPhone !== company.phone_number && (
                  <Row
                    icon={<Phone className="h-4 w-4" />}
                    label={t('support.otherPhone', 'Qo\'shimcha telefon')}
                    value={<a href={`tel:${contactPhone}`} className="text-primary hover:underline">{contactPhone}</a>}
                  />
                )}
                <Row icon={<Tag className="h-4 w-4" />} label={t('support.category', 'Soha')} value={company.category?.name} />
                <Row icon={<MapPin className="h-4 w-4" />} label={t('support.address', 'Manzil')} value={address || undefined} />
                {socials.length > 0 && (
                  <Row
                    icon={<Building2 className="h-4 w-4" />}
                    label={t('support.socials', 'Ijtimoiy tarmoqlar')}
                    value={
                      <span className="flex flex-wrap gap-x-3 gap-y-1">
                        {socials.map((s, i) => (
                          <a key={i} href={s.url} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                            {s.name || s.url}
                          </a>
                        ))}
                      </span>
                    }
                  />
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
