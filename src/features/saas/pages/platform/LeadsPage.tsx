import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import toast from 'react-hot-toast';
import { Loader2, Trash2, RefreshCw, Mail, Phone, Building2, GripVertical, LayoutGrid, List as ListIcon, Plus, Pencil } from 'lucide-react';
import {
  Button, Card, CardContent, Input, Label,
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '../../../../components/ui';
import { Badge } from '../../../../components/ui/Badge';
import { ConfirmDialog } from '../../../../components/shared/ConfirmDialog';
import { leadsApi, type Lead, type LeadAdminPayload } from '../../services';
import { SourceBadge, SourceIcon, SELECTABLE_SOURCES } from '../../leadSources';
import { getSocket } from '../../../../services/socket';

// Ustunlar (pipeline tartibi). dot — ustun rangi, badge — List ko'rinishi uchun.
// label — tarjima bo'lmaganida ishlatiladigan zaxira (fallback) matn.
const COLUMNS: { value: string; label: string; dot: string; badge: string }[] = [
  { value: 'new', label: 'Yangi', dot: 'bg-blue-500', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300' },
  { value: 'contacted', label: "Bog'lanildi", dot: 'bg-amber-500', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300' },
  { value: 'approved', label: 'Tasdiqlangan', dot: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' },
  { value: 'rejected', label: 'Rad etilgan', dot: 'bg-rose-500', badge: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300' },
  { value: 'closed', label: 'Yopilgan', dot: 'bg-slate-400', badge: 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300' },
];

const inputCls =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/40';

const emptyForm: LeadAdminPayload = {
  name: '', phone: '', email: '', company: '', stores_range: '', source: 'manual', status: 'new', note: '',
};

// Joriy tilga mos sana formatlash.
function fmtDate(s: string, lng: string): string {
  const locale = lng === 'ru' ? 'ru-RU' : lng === 'en' ? 'en-US' : 'uz-UZ';
  try { return new Date(s).toLocaleDateString(locale, { day: '2-digit', month: 'short' }); } catch { return s; }
}
function statusToast(status: string, t: TFunction) {
  if (status === 'approved') toast.success(t('leads.toast.approved', 'Tasdiqlandi — mijozga email yuborildi'));
  else if (status === 'contacted') toast.success(t('leads.toast.contacted', "Bog'lanildi — mijozga email yuborildi"));
  else if (status === 'rejected') toast.success(t('leads.toast.rejected', 'Rad etildi — mijozga email yuborildi'));
  else toast.success(t('leads.toast.statusUpdated', 'Status yangilandi'));
}

export function LeadsPage() {
  const { t, i18n } = useTranslation();
  const colLabel = (value: string) =>
    t(`leads.status.${value}`, COLUMNS.find((c) => c.value === value)?.label ?? value);
  const [items, setItems] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [newCount, setNewCount] = useState(0);
  const [view, setView] = useState<'board' | 'list'>('board');
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [dragId, setDragId] = useState<number | null>(null);
  const [overCol, setOverCol] = useState<string | null>(null);

  // Create / edit modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Lead | null>(null);
  const [form, setForm] = useState<LeadAdminPayload>(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    leadsApi
      .list({ status: 'all', limit: 300 })
      .then((r) => { setItems(r.results); setNewCount(r.new_count); })
      .catch(() => toast.error(t('leads.toast.loadError', "Zayavkalarni yuklab bo'lmadi")))
      .finally(() => setLoading(false));
  }, [t]);

  useEffect(() => { load(); }, [load]);

  // Jonli yangilanish: yangi zayavka kelganda ro'yxatni avtomatik qayta yuklaymiz.
  useEffect(() => {
    const socket = getSocket();
    const onNewLead = (lead: { name?: string }) => {
      toast.success(
        t('leads.toast.newLead', 'Yangi zayavka: {{name}}', { name: lead?.name ?? '' }),
        { icon: '📩' },
      );
      load();
    };
    socket.on('lead:new', onNewLead);
    return () => { socket.off('lead:new', onNewLead); };
  }, [load, t]);

  // Statusni o'zgartirish (drag-drop yoki select). Optimistik + xatoda qaytarish.
  const moveLead = async (id: number, status: string) => {
    const lead = items.find((l) => l.id === id);
    if (!lead || lead.status === status) return;
    const prev = lead.status;
    setItems((p) => p.map((l) => (l.id === id ? { ...l, status } : l)));
    try {
      await leadsApi.update(id, { status });
      statusToast(status, t);
    } catch {
      setItems((p) => p.map((l) => (l.id === id ? { ...l, status: prev } : l)));
      toast.error(t('leads.toast.statusError', "Statusni o'zgartirib bo'lmadi"));
    }
  };

  const remove = async () => {
    if (confirmId == null) return;
    try {
      await leadsApi.remove(confirmId);
      setItems((p) => p.filter((l) => l.id !== confirmId));
      toast.success(t('leads.toast.deleted', "Zayavka o'chirildi"));
    } catch {
      toast.error(t('leads.toast.deleteError', "O'chirib bo'lmadi"));
    } finally {
      setConfirmId(null);
    }
  };

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (l: Lead) => {
    setEditing(l);
    setForm({
      name: l.name, phone: l.phone, email: l.email,
      company: l.company ?? '', stores_range: l.stores_range ?? '',
      source: l.source || 'website', status: l.status, note: l.note ?? '',
    });
    setModalOpen(true);
  };

  const submitForm = async () => {
    if (!form.name?.trim() || !form.phone?.trim() || !form.email?.trim()) {
      toast.error(t('leads.toast.required', 'Ism, telefon va email majburiy'));
      return;
    }
    setSaving(true);
    try {
      const payload: LeadAdminPayload = {
        name: form.name?.trim(),
        phone: form.phone?.trim(),
        email: form.email?.trim(),
        company: form.company?.trim() || null,
        stores_range: form.stores_range?.trim() || null,
        source: form.source,
        status: form.status,
        note: form.note?.trim() || null,
      };
      if (editing) {
        const updated = await leadsApi.update(editing.id, payload);
        setItems((p) => p.map((l) => (l.id === editing.id ? updated : l)));
        toast.success(t('leads.toast.updated', 'Lead yangilandi'));
      } else {
        const created = await leadsApi.createAdmin(payload);
        setItems((p) => [created, ...p]);
        toast.success(t('leads.toast.created', "Lead qo'shildi"));
      }
      setModalOpen(false);
    } catch {
      toast.error(editing ? t('leads.toast.updateError', "Yangilab bo'lmadi") : t('leads.toast.createError', "Qo'shib bo'lmadi"));
    } finally {
      setSaving(false);
    }
  };

  const q = search.trim().toLowerCase();
  const filtered = items.filter((l) => {
    if (sourceFilter !== 'all' && (l.source || 'website') !== sourceFilter) return false;
    if (q && ![l.name, l.phone, l.email, l.company].some((v) => (v || '').toLowerCase().includes(q))) return false;
    return true;
  });

  const card = (l: Lead) => (
    <div
      key={l.id}
      draggable
      onDragStart={() => setDragId(l.id)}
      onDragEnd={() => { setDragId(null); setOverCol(null); }}
      className={`group cursor-grab rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition active:cursor-grabbing hover:shadow-md dark:border-slate-700 dark:bg-slate-900 ${dragId === l.id ? 'opacity-40' : ''}`}
    >
      <div className="flex items-start gap-2">
        <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-slate-300 group-hover:text-slate-400" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate font-semibold text-slate-900 dark:text-white">{l.name}</span>
            <div className="flex items-center gap-1.5 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
              <button onClick={() => openEdit(l)} title={t('common.edit', 'Tahrirlash')}><Pencil className="h-3.5 w-3.5 text-slate-400 hover:text-indigo-600" /></button>
              <button onClick={() => setConfirmId(l.id)} title={t('common.delete', "O'chirish")}><Trash2 className="h-3.5 w-3.5 text-rose-400 hover:text-rose-600" /></button>
            </div>
          </div>
          {l.company && <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400"><Building2 className="h-3 w-3" />{l.company}</div>}
          <a href={`tel:${l.phone}`} className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-600 hover:text-indigo-600 dark:text-slate-300"><Phone className="h-3 w-3" />{l.phone}</a>
          <a href={`mailto:${l.email}`} className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-slate-600 hover:text-indigo-600 dark:text-slate-300"><Mail className="h-3 w-3 shrink-0" /><span className="truncate">{l.email}</span></a>
          <div className="mt-2 flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400" title={t('leads.source', 'Manba')}><SourceIcon code={l.source} size={13} />{l.stores_range && <span className="ml-1 rounded-md bg-slate-100 px-1.5 py-0.5 dark:bg-slate-800">{l.stores_range}</span>}</span>
            <span className="text-[11px] text-slate-400">{fmtDate(l.created_at, i18n.language)}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('leads.title', 'Ledlar')}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t('leads.subtitle', "Kartani sudrab statusni o'zgartiring — mijozga avtomatik email boradi")}
            {newCount > 0 && <span className="ml-2 rounded-full bg-blue-600 px-2 py-0.5 text-xs font-semibold text-white">{t('leads.newBadge', '{{count}} yangi', { count: newCount })}</span>}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex shrink-0 rounded-lg border border-slate-200 p-0.5 dark:border-slate-700">
            <button onClick={() => setView('board')} className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium ${view === 'board' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}><LayoutGrid className="h-4 w-4" /> <span className="hidden sm:inline">{t('leads.board', 'Board')}</span></button>
            <button onClick={() => setView('list')} className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium ${view === 'list' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}><ListIcon className="h-4 w-4" /> <span className="hidden sm:inline">{t('leads.list', "Ro'yxat")}</span></button>
          </div>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="min-w-[130px] flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900 sm:flex-none"
            title={t('leads.sourceFilter', "Manba bo'yicha filtr")}
          >
            <option value="all">{t('leads.allSources', 'Barcha manbalar')}</option>
            {SELECTABLE_SOURCES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('common.search', 'Qidirish') + '...'}
            className="min-w-[150px] flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900 sm:w-52 sm:flex-none"
          />
          <Button variant="outline" className="shrink-0" onClick={load} title={t('leads.refresh', 'Yangilash')}><RefreshCw className="h-4 w-4" /></Button>
          <Button className="shrink-0" onClick={openCreate}><Plus className="h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline">{t('leads.newLead', 'Yangi lead')}</span></Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24 text-slate-400"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : view === 'board' ? (
        <div className="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-3 sm:gap-4">
          {COLUMNS.map((col) => {
            const colItems = filtered.filter((l) => l.status === col.value);
            const isOver = overCol === col.value;
            return (
              <div
                key={col.value}
                onDragOver={(e) => { e.preventDefault(); if (overCol !== col.value) setOverCol(col.value); }}
                onDrop={(e) => { e.preventDefault(); if (dragId != null) moveLead(dragId, col.value); setOverCol(null); }}
                className={`flex w-[82vw] max-w-[20rem] shrink-0 snap-start flex-col rounded-2xl border p-2 transition sm:w-72 ${isOver ? 'border-indigo-400 bg-indigo-50/60 dark:border-indigo-500 dark:bg-indigo-500/10' : 'border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-900/40'}`}
              >
                <div className="flex items-center gap-2 px-2 py-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${col.dot}`} />
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{colLabel(col.value)}</span>
                  <span className="ml-auto rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">{colItems.length}</span>
                </div>
                <div className="flex min-h-[120px] flex-1 flex-col gap-2 p-1">
                  {colItems.map(card)}
                  {colItems.length === 0 && <div className="rounded-xl border border-dashed border-slate-200 py-8 text-center text-xs text-slate-400 dark:border-slate-700">{t('leads.empty', "Bo'sh")}</div>}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            {filtered.length === 0 ? (
              <p className="py-16 text-center text-slate-400">{t('leads.noLeads', "Zayavkalar yo'q")}</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('leads.th.customer', 'Mijoz')}</TableHead>
                    <TableHead>{t('leads.th.contact', 'Aloqa')}</TableHead>
                    <TableHead>{t('leads.th.company', 'Kompaniya')}</TableHead>
                    <TableHead>{t('leads.th.source', 'Manba')}</TableHead>
                    <TableHead>{t('leads.th.date', 'Sana')}</TableHead>
                    <TableHead>{t('leads.th.status', 'Status')}</TableHead>
                    <TableHead className="text-right">{t('leads.th.action', 'Amal')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((l) => {
                    const st = COLUMNS.find((s) => s.value === l.status);
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
                        <TableCell><SourceBadge code={l.source} /></TableCell>
                        <TableCell className="whitespace-nowrap text-sm text-slate-500">{fmtDate(l.created_at, i18n.language)}</TableCell>
                        <TableCell><Badge className={st?.badge}>{colLabel(l.status)}</Badge></TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            <select
                              value={l.status}
                              onChange={(e) => moveLead(l.id, e.target.value)}
                              className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900"
                            >
                              {COLUMNS.map((s) => <option key={s.value} value={s.value}>{colLabel(s.value)}</option>)}
                            </select>
                            <Button variant="ghost" size="icon" onClick={() => openEdit(l)} title={t('common.edit', 'Tahrirlash')}><Pencil className="h-4 w-4 text-slate-500" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => setConfirmId(l.id)} title={t('common.delete', "O'chirish")}><Trash2 className="h-4 w-4 text-rose-500" /></Button>
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
      )}

      {/* Create / Edit modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>{editing ? t('leads.modal.editTitle', 'Leadni tahrirlash') : t('leads.modal.createTitle', "Yangi lead qo'shish")}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-3 py-2 sm:grid-cols-2">
            <div className="col-span-2">
              <Label className="text-sm">{t('leads.modal.name', 'Ism')} *</Label>
              <Input className="mt-1" value={form.name ?? ''} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder={t('leads.modal.namePh', 'Mijoz ismi')} />
            </div>
            <div>
              <Label className="text-sm">{t('leads.modal.phone', 'Telefon')} *</Label>
              <Input className="mt-1" value={form.phone ?? ''} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="+998..." />
            </div>
            <div>
              <Label className="text-sm">{t('leads.modal.email', 'Email')} *</Label>
              <Input className="mt-1" type="email" value={form.email ?? ''} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="email@misol.com" />
            </div>
            <div>
              <Label className="text-sm">{t('leads.modal.company', 'Kompaniya')}</Label>
              <Input className="mt-1" value={form.company ?? ''} onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))} placeholder={t('leads.modal.companyPh', 'Kompaniya nomi')} />
            </div>
            <div>
              <Label className="text-sm">{t('leads.modal.stores', "Do'konlar")}</Label>
              <Input className="mt-1" value={form.stores_range ?? ''} onChange={(e) => setForm((f) => ({ ...f, stores_range: e.target.value }))} placeholder={t('leads.modal.storesPh', "masalan: 2–5 do'kon")} />
            </div>
            <div>
              <Label className="text-sm">{t('leads.modal.source', 'Manba')}</Label>
              <select className={`mt-1 ${inputCls}`} value={form.source ?? 'manual'} onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))}>
                {SELECTABLE_SOURCES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-sm">{t('leads.modal.status', 'Status')}</Label>
              <select className={`mt-1 ${inputCls}`} value={form.status ?? 'new'} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
                {COLUMNS.map((s) => <option key={s.value} value={s.value}>{colLabel(s.value)}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <Label className="text-sm">{t('leads.modal.note', 'Izoh (ichki)')}</Label>
              <textarea
                className={`mt-1 ${inputCls} min-h-[72px] resize-y`}
                value={form.note ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                placeholder={t('leads.modal.notePh', "Faqat adminlar ko'radigan izoh")}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)} disabled={saving}>{t('common.cancel', 'Bekor qilish')}</Button>
            <Button onClick={submitForm} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editing ? t('common.save', 'Saqlash') : t('leads.modal.add', "Qo'shish")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmId != null}
        onOpenChange={(o) => !o && setConfirmId(null)}
        title={t('leads.confirm.title', "Zayavkani o'chirish")}
        description={t('leads.confirm.description', "Bu zayavka butunlay o'chiriladi. Davom etasizmi?")}
        confirmText={t('common.delete', "O'chirish")}
        onConfirm={remove}
      />
    </div>
  );
}
