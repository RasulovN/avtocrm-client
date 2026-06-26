import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Send, Megaphone, Users, Smartphone, Building2, ShieldCheck, Trash2, Loader2 } from 'lucide-react';
import { PageHeader } from '../../../../components/shared/PageHeader';
import { Card, CardContent } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Label } from '../../../../components/ui/Label';
import { Badge } from '../../../../components/ui/Badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../../../../components/ui/Select';
import { notificationApi, type Audience, type BroadcastItem } from '../../../../services/notificationApi';
import { companiesApi } from '../../services';
import { handleError } from '../../../../utils/errorHandler';
import { formatDate } from '../../../../utils/index';

const AUDIENCE_META: { value: Audience; labelKey: string; fallback: string; icon: React.ElementType }[] = [
  { value: 'all', labelKey: 'notifications.audience.all', fallback: 'Barcha foydalanuvchilar', icon: Users },
  { value: 'mobile', labelKey: 'notifications.audience.mobile', fallback: 'Mobil foydalanuvchilar', icon: Smartphone },
  { value: 'company_users', labelKey: 'notifications.audience.companyUsers', fallback: 'Kompaniya foydalanuvchilari', icon: Building2 },
  { value: 'company_admins', labelKey: 'notifications.audience.companyAdmins', fallback: 'Kompaniya adminlari', icon: ShieldCheck },
  { value: 'company', labelKey: 'notifications.audience.company', fallback: 'Bitta kompaniya', icon: Building2 },
];

export function NotificationsPage() {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [link, setLink] = useState('');
  const [audience, setAudience] = useState<Audience>('all');
  const [companyId, setCompanyId] = useState<string>('');
  const [companies, setCompanies] = useState<{ id: number; name: string }[]>([]);
  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState<BroadcastItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadHistory = useCallback(async () => {
    try {
      setLoadingHistory(true);
      const res = await notificationApi.broadcasts({ page: 1, limit: 20 });
      setHistory(res.results);
    } catch (e) {
      handleError(e, { showToast: false });
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    void loadHistory();
    companiesApi
      .list({ limit: 100 })
      .then((res) => setCompanies(res.results.map((c) => ({ id: c.id, name: c.name }))))
      .catch(() => {});
  }, [loadHistory]);

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error(t('errors.validationError', "Sarlavha va matnni to'ldiring"));
      return;
    }
    if (audience === 'company' && !companyId) {
      toast.error(t('notifications.pickCompany', 'Kompaniyani tanlang'));
      return;
    }
    try {
      setSending(true);
      const res = await notificationApi.broadcast({
        title: title.trim(),
        message: message.trim(),
        link: link.trim() || null,
        audience,
        company: audience === 'company' ? Number(companyId) : null,
      });
      toast.success(
        `${t('notifications.sent', 'Yuborildi')} — ${res.recipient_count} ${t('notifications.recipients', 'qabul qiluvchi')}`,
      );
      setTitle('');
      setMessage('');
      setLink('');
      await loadHistory();
    } catch (e) {
      handleError(e, { showToast: true });
    } finally {
      setSending(false);
    }
  };

  const audienceLabel = (a: string) => {
    const m = AUDIENCE_META.find((x) => x.value === a);
    return m ? t(m.labelKey, m.fallback) : a;
  };

  const handleDeleteBroadcast = async (id: number) => {
    if (!window.confirm(t('notifications.deleteConfirm', "Bu broadcast'ni o'z ro'yxatingizdan o'chirasizmi? (Qabul qiluvchilarniki saqlanadi)"))) {
      return;
    }
    setDeletingId(id);
    try {
      await notificationApi.deleteBroadcast(id);
      setHistory((prev) => prev.filter((b) => b.id !== id));
      toast.success(t('common.deleted', "O'chirildi"));
    } catch (e) {
      handleError(e, { showToast: true });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('notifications.broadcastTitle', 'Bildirishnoma yuborish')}
        description={t('notifications.broadcastSubtitle', 'Foydalanuvchilarga ommaviy bildirishnoma yuboring')}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Compose */}
        <Card>
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Megaphone className="h-4 w-4 text-primary" />
              {t('notifications.compose', 'Yangi bildirishnoma')}
            </div>

            <div className="space-y-2">
              <Label>{t('notifications.audienceLabel', 'Kimga')}</Label>
              <Select value={audience} onValueChange={(v) => setAudience(v as Audience)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AUDIENCE_META.map((a) => (
                    <SelectItem key={a.value} value={a.value}>
                      {t(a.labelKey, a.fallback)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {audience === 'company' && (
              <div className="space-y-2">
                <Label>{t('notifications.company', 'Kompaniya')}</Label>
                <Select value={companyId} onValueChange={setCompanyId}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('notifications.pickCompany', 'Kompaniyani tanlang')} />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>{t('notifications.titleLabel', 'Sarlavha')}</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={255} placeholder={t('notifications.titlePlaceholder', 'Masalan: Tizim yangilanishi')} />
            </div>

            <div className="space-y-2">
              <Label>{t('notifications.messageLabel', 'Matn')}</Label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder={t('notifications.messagePlaceholder', 'Bildirishnoma matni...')}
              />
            </div>

            <div className="space-y-2">
              <Label>{t('notifications.linkLabel', 'Havola (ixtiyoriy)')}</Label>
              <Input value={link} onChange={(e) => setLink(e.target.value)} placeholder="/dashboard" />
            </div>

            <Button onClick={handleSend} disabled={sending} className="w-full">
              <Send className="h-4 w-4 mr-2" />
              {sending ? t('common.saving', 'Yuborilmoqda...') : t('notifications.send', 'Yuborish')}
            </Button>
          </CardContent>
        </Card>

        {/* History */}
        <Card>
          <CardContent className="p-5 space-y-3">
            <div className="text-sm font-semibold">{t('notifications.history', 'Yuborilganlar tarixi')}</div>
            {loadingHistory ? (
              <div className="py-8 text-center text-sm text-muted-foreground">{t('common.loading', 'Yuklanmoqda...')}</div>
            ) : history.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">{t('notifications.noHistory', 'Hozircha yuborilmagan')}</div>
            ) : (
              <div className="space-y-2 max-h-[520px] overflow-y-auto">
                {history.map((b) => (
                  <div key={b.id} className="group rounded-lg border border-border/50 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold flex-1 min-w-0">{b.title}</p>
                      <Badge variant="outline" className="shrink-0 text-[10px]">
                        {audienceLabel(b.audience)}
                      </Badge>
                      <button
                        type="button"
                        onClick={() => handleDeleteBroadcast(b.id)}
                        disabled={deletingId === b.id}
                        title={t('common.delete', "O'chirish")}
                        className="shrink-0 flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100 disabled:opacity-50"
                      >
                        {deletingId === b.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{b.message}</p>
                    <div className="flex items-center justify-between mt-2 text-[11px] text-muted-foreground/80">
                      <span>{b.company ? b.company.name : t('notifications.platformWide', 'Platforma bo\'yicha')}</span>
                      <span>{b.recipient_count} • {formatDate(b.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
