import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Monitor, Smartphone, RefreshCw } from 'lucide-react';
import { PageHeader } from '../../../components/shared/PageHeader';
import { Card, CardContent } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../../../components/ui/Select';
import { auditApi, type AuditLogRow } from '../../../services/auditApi';
import { useAuthStore } from '../../../app/store';
import { formatDate } from '../../../utils/index';

const ACTION_STYLES: Record<string, string> = {
  login: 'bg-green-700',
  logout: 'bg-gray-500',
  create: 'bg-blue-600',
  update: 'bg-amber-700',
  delete: 'bg-red-600',
};

function deviceInfo(ua: string | null): { label: string; mobile: boolean } {
  if (!ua) return { label: '—', mobile: false };
  const mobile = /Android|iPhone|iPad|Mobile|okhttp|Dart|Expo/i.test(ua);
  let os = 'Unknown';
  if (/Android/i.test(ua)) os = 'Android';
  else if (/iPhone|iPad|iOS/i.test(ua)) os = 'iOS';
  else if (/Windows/i.test(ua)) os = 'Windows';
  else if (/Mac OS X|Macintosh/i.test(ua)) os = 'macOS';
  else if (/Linux/i.test(ua)) os = 'Linux';
  let browser = '';
  if (/Edg\//i.test(ua)) browser = 'Edge';
  else if (/Chrome\//i.test(ua)) browser = 'Chrome';
  else if (/Firefox\//i.test(ua)) browser = 'Firefox';
  else if (/Safari\//i.test(ua)) browser = 'Safari';
  return { label: browser ? `${os} • ${browser}` : os, mobile };
}

const ACTIONS = ['login', 'logout', 'create', 'update', 'delete'];

export function AuditLogsPage() {
  const { t } = useTranslation();
  const { isSuperUser } = useAuthStore();
  const superAdmin = isSuperUser();
  const [rows, setRows] = useState<AuditLogRow[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [action, setAction] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const limit = 20;

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await auditApi.logs({ page, limit, action: action || undefined });
      setRows(res.results);
      setCount(res.count);
    } catch {
      setRows([]);
      setCount(0);
    } finally {
      setLoading(false);
    }
  }, [page, action]);

  useEffect(() => {
    void load();
  }, [load]);

  const actionLabel = (a: string) => t(`audit.action.${a}`, a);
  const totalPages = Math.max(1, Math.ceil(count / limit));

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('audit.title', 'Faollik loglari')}
        description={t('audit.subtitle', 'Foydalanuvchilarning tizimdagi harakatlari')}
        actions={
          <Button variant="outline" size="sm" onClick={() => load()}>
            <RefreshCw className="h-4 w-4 mr-1.5" />
            {t('common.refresh', 'Yangilash')}
          </Button>
        }
      />

      <div className="flex items-center gap-3 flex-wrap">
        <div className="w-48">
          <Select value={action || 'all'} onValueChange={(v) => { setAction(v === 'all' ? '' : v); setPage(1); }}>
            <SelectTrigger>
              <SelectValue placeholder={t('audit.allActions', 'Barcha amallar')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('audit.allActions', 'Barcha amallar')}</SelectItem>
              {ACTIONS.map((a) => (
                <SelectItem key={a} value={a}>{actionLabel(a)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <span className="text-sm text-muted-foreground">{count} {t('audit.records', 'yozuv')}</span>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground border-b border-border/60 bg-muted/30">
                  <th className="py-2.5 px-4 font-medium">{t('audit.user', 'Foydalanuvchi')}</th>
                  {superAdmin && <th className="py-2.5 px-4 font-medium">{t('audit.company', 'Kompaniya')}</th>}
                  <th className="py-2.5 px-4 font-medium">{t('audit.actionCol', 'Amal')}</th>
                  <th className="py-2.5 px-4 font-medium">{t('audit.entity', 'Obyekt')}</th>
                  <th className="py-2.5 px-4 font-medium">{t('audit.device', 'Qurilma')}</th>
                  <th className="py-2.5 px-4 font-medium">IP</th>
                  <th className="py-2.5 px-4 font-medium">{t('audit.time', 'Vaqt')}</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={superAdmin ? 7 : 6} className="py-10 text-center text-muted-foreground">{t('common.loading', 'Yuklanmoqda...')}</td></tr>
                ) : rows.length === 0 ? (
                  <tr><td colSpan={superAdmin ? 7 : 6} className="py-10 text-center text-muted-foreground">{t('audit.empty', 'Loglar yo\'q')}</td></tr>
                ) : (
                  rows.map((r) => {
                    const dev = deviceInfo(r.user_agent);
                    return (
                      <tr key={r.id} className="border-b border-border/40 last:border-0 hover:bg-muted/20">
                        <td className="py-2.5 px-4 font-medium">{r.user_name ?? `#${r.user_id ?? '-'}`}</td>
                        {superAdmin && <td className="py-2.5 px-4 text-muted-foreground">{r.company_name ?? '—'}</td>}
                        <td className="py-2.5 px-4 text-white">
                          <Badge className={ACTION_STYLES[r.action] ?? 'bg-gray-500'}>{actionLabel(r.action)}</Badge>
                        </td>
                        <td className="py-2.5 px-4 text-muted-foreground text-black">{r.entity ?? '—'}</td>
                        <td className="py-2.5 px-4">
                          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                            {dev.mobile ? <Smartphone className="h-3.5 w-3.5" /> : <Monitor className="h-3.5 w-3.5" />}
                            {dev.label}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-muted-foreground font-mono text-xs">{r.ip_address ?? '—'}</td>
                        <td className="py-2.5 px-4 text-muted-foreground whitespace-nowrap">{formatDate(r.created_at)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
