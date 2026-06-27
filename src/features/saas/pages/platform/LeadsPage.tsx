import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Loader2, Trash2, RefreshCw, Mail, Phone } from 'lucide-react';
import {
  Button, Card, CardContent,
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../../../../components/ui';
import { Badge } from '../../../../components/ui/Badge';
import { ConfirmDialog } from '../../../../components/shared/ConfirmDialog';
import { leadsApi, type Lead } from '../../services';

const STATUSES: { value: string; label: string; tone: string }[] = [
  { value: 'new', label: 'Yangi', tone: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300' },
  { value: 'approved', label: 'Tasdiqlangan', tone: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' },
  { value: 'rejected', label: 'Rad etilgan', tone: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300' },
  { value: 'contacted', label: "Bog'lanildi", tone: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300' },
  { value: 'closed', label: 'Yopilgan', tone: 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300' },
];
const FILTERS = [{ value: 'all', label: 'Hammasi' }, ...STATUSES.map((s) => ({ value: s.value, label: s.label }))];

function fmtDate(s: string): string {
  try { return new Date(s).toLocaleString('uz-UZ', { dateStyle: 'short', timeStyle: 'short' }); } catch { return s; }
}

export function LeadsPage() {
  const [items, setItems] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [newCount, setNewCount] = useState(0);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    leadsApi
      .list({ status: statusFilter, search: search || undefined, limit: 100 })
      .then((r) => { setItems(r.results); setNewCount(r.new_count); })
      .catch(() => toast.error("Zayavkalarni yuklab bo'lmadi"))
      .finally(() => setLoading(false));
  }, [statusFilter, search]);

  useEffect(() => { load(); }, [load]);

  const changeStatus = async (lead: Lead, status: string) => {
    if (status === lead.status) return;
    setSavingId(lead.id);
    try {
      await leadsApi.update(lead.id, { status });
      setItems((prev) => prev.map((l) => (l.id === lead.id ? { ...l, status } : l)));
      if (status === 'approved') toast.success("Tasdiqlandi — mijozga email yuborildi");
      else if (status === 'rejected') toast.success("Rad etildi — mijozga email yuborildi");
      else toast.success('Status yangilandi');
    } catch {
      toast.error("Statusni o'zgartirib bo'lmadi");
    } finally {
      setSavingId(null);
    }
  };

  const remove = async () => {
    if (confirmId == null) return;
    try {
      await leadsApi.remove(confirmId);
      setItems((prev) => prev.filter((l) => l.id !== confirmId));
      toast.success("Zayavka o'chirildi");
    } catch {
      toast.error("O'chirib bo'lmadi");
    } finally {
      setConfirmId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Demo zayavkalar</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Landing sahifadan kelgan so'rovlar
            {newCount > 0 && <span className="ml-2 rounded-full bg-blue-600 px-2 py-0.5 text-xs font-semibold text-white">{newCount} yangi</span>}
          </p>
        </div>
        <Button variant="outline" onClick={load}><RefreshCw className="mr-2 h-4 w-4" /> Yangilash</Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              statusFilter === f.value
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            {f.label}
          </button>
        ))}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Ism, telefon yoki kompaniya..."
          className="ml-auto w-64 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-slate-400"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : items.length === 0 ? (
            <p className="py-16 text-center text-slate-400">Zayavkalar yo'q</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mijoz</TableHead>
                  <TableHead>Aloqa</TableHead>
                  <TableHead>Kompaniya</TableHead>
                  <TableHead>Do'konlar</TableHead>
                  <TableHead>Sana</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((l) => {
                  const st = STATUSES.find((s) => s.value === l.status);
                  return (
                    <TableRow key={l.id}>
                      <TableCell className="font-medium text-slate-900 dark:text-white">{l.name}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-0.5 text-sm">
                          <a href={`tel:${l.phone}`} className="flex items-center gap-1.5 text-slate-600 hover:text-indigo-600 dark:text-slate-300"><Phone className="h-3.5 w-3.5" />{l.phone}</a>
                          <a href={`mailto:${l.email}`} className="flex items-center gap-1.5 text-slate-600 hover:text-indigo-600 dark:text-slate-300"><Mail className="h-3.5 w-3.5" />{l.email}</a>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-300">{l.company || '—'}</TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-300">{l.stores_range || '—'}</TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-slate-500">{fmtDate(l.created_at)}</TableCell>
                      <TableCell>
                        <Badge className={st?.tone}>{st?.label ?? l.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <select
                            value={l.status}
                            disabled={savingId === l.id}
                            onChange={(e) => changeStatus(l, e.target.value)}
                            className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900"
                          >
                            {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                          </select>
                          <Button variant="ghost" size="icon" onClick={() => setConfirmId(l.id)}><Trash2 className="h-4 w-4 text-rose-500" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmId != null}
        onOpenChange={(o) => !o && setConfirmId(null)}
        title="Zayavkani o'chirish"
        description="Bu zayavka butunlay o'chiriladi. Davom etasizmi?"
        confirmText="O'chirish"
        onConfirm={remove}
      />
    </div>
  );
}
