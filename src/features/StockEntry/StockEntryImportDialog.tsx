import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Download, FileSpreadsheet, Upload, CheckCircle2, AlertTriangle } from 'lucide-react';

import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/Dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { inventoryService, type StockEntryImportResult } from '../../services/inventoryService';
import { storeService } from '../../services/storeService';
import { formatCurrency } from '../../utils';
import { handleError } from '../../utils/errorHandler';
import type { Supplier } from '../../types';

interface StoreOption {
  id: string | number;
  name: string;
  type?: string;
}

interface StockEntryImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  suppliers: Supplier[];
  onSuccess: () => void;
}

// Excel (shablon) orqali omborga kirim qilish oynasi.
// Yetkazib beruvchi + naqd/karta to'lov formada, mahsulot satrlari Excel faylda.
export function StockEntryImportDialog({ open, onOpenChange, suppliers, onSuccess }: StockEntryImportDialogProps) {
  const { t } = useTranslation();

  const [supplierId, setSupplierId] = useState('');
  const [storeId, setStoreId] = useState('');
  const [cashAmount, setCashAmount] = useState('');
  const [cardAmount, setCardAmount] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [stores, setStores] = useState<StoreOption[]>([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<StockEntryImportResult | null>(null);

  // Kirim faqat asosiy (type='b') do'konga qilinadi.
  const baseStores = useMemo(() => stores.filter((s) => s.type === 'b'), [stores]);

  useEffect(() => {
    if (!open) return;
    setSupplierId('');
    setStoreId('');
    setCashAmount('');
    setCardAmount('');
    setFile(null);
    setResult(null);
    storeService
      .getAll()
      .then((res) => setStores(Array.isArray(res.data) ? (res.data as StoreOption[]) : []))
      .catch(() => setStores([]));
  }, [open]);

  // Yagona asosiy do'kon bo'lsa — avtomatik tanlaymiz.
  useEffect(() => {
    if (open && baseStores.length === 1) setStoreId(String(baseStores[0].id));
  }, [open, baseStores]);

  const handleDownloadTemplate = async () => {
    try {
      const blob = await inventoryService.downloadImportTemplate();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'kirim_import_shablon.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      handleError(error, { showToast: true });
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setResult(null);
  };

  const handleImport = async () => {
    if (!supplierId || !file) return;
    try {
      setImporting(true);
      const res = await inventoryService.importEntries({
        file,
        supplier: supplierId,
        cash_amount: cashAmount || undefined,
        card_amount: cardAmount || undefined,
        store: storeId || undefined,
      });
      setResult(res);
      toast.success(
        t('inventory.importSuccess', "Kirim yaratildi: {{count}} ta mahsulot", { count: res.created }),
      );
      onSuccess();
    } catch (error) {
      // 400 javobida ham natija (skipped sabablari) bo'lishi mumkin — ko'rsatamiz.
      const resp = (error as { response?: { data?: StockEntryImportResult } }).response?.data;
      if (resp && Array.isArray(resp.skipped)) {
        setResult(resp);
        if (resp.detail) toast.error(resp.detail);
      } else {
        handleError(error, { showToast: true });
      }
    } finally {
      setImporting(false);
    }
  };

  const succeeded = result?.entry_id != null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('inventory.importTitle', 'Excel orqali kirim qilish')}</DialogTitle>
          <DialogDescription>
            {t(
              'inventory.importDescription',
              "Shablonni yuklab oling, mahsulot satrlarini to'ldiring va faylni yuklang. Mahsulot Barcode / SKU / nom bo'yicha aniqlanadi.",
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Shablon yuklab olish */}
          <Button type="button" variant="outline" size="sm" onClick={handleDownloadTemplate}>
            <Download className="h-4 w-4 mr-2" />
            {t('inventory.downloadTemplate', 'Shablonni yuklab olish')}
          </Button>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('inventory.supplier', 'Yetkazib beruvchi')} *</Label>
              <Select value={supplierId} onValueChange={setSupplierId}>
                <SelectTrigger>
                  <SelectValue placeholder={t('placeholders.select', 'Tanlang')} />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {baseStores.length > 1 && (
              <div className="space-y-2">
                <Label>{t('inventory.store', "Do'kon (ombor)")} *</Label>
                <Select value={storeId} onValueChange={setStoreId}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('placeholders.select', 'Tanlang')} />
                  </SelectTrigger>
                  <SelectContent>
                    {baseStores.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>{t('inventory.cashAmount', "Naqd to'lov")}</Label>
              <Input
                type="number"
                min="0"
                placeholder="0"
                value={cashAmount}
                onChange={(e) => setCashAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('inventory.cardAmount', "Karta to'lovi")}</Label>
              <Input
                type="number"
                min="0"
                placeholder="0"
                value={cardAmount}
                onChange={(e) => setCardAmount(e.target.value)}
              />
            </div>
          </div>

          {/* Fayl tanlash */}
          <div className="space-y-2">
            <Label>{t('inventory.excelFile', 'Excel fayl (.xlsx)')} *</Label>
            <label className="flex items-center gap-3 border border-dashed rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors">
              <FileSpreadsheet className="h-8 w-8 text-green-600 shrink-0" />
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">
                  {file ? file.name : t('inventory.chooseFile', 'Fayl tanlash uchun bosing')}
                </div>
                <div className="text-xs text-muted-foreground">
                  {t('inventory.onlyXlsx', 'Faqat .xlsx qabul qilinadi')}
                </div>
              </div>
              <input type="file" accept=".xlsx" className="hidden" onChange={handleFileChange} />
            </label>
          </div>

          {/* Natija */}
          {result && (
            <div
              className={`rounded-lg border p-4 space-y-3 ${
                succeeded ? 'border-green-300 bg-green-50 dark:bg-green-950/30' : 'border-red-300 bg-red-50 dark:bg-red-950/30'
              }`}
            >
              <div className="flex items-center gap-2 font-medium">
                {succeeded ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    {t('inventory.importCreated', '{{count}} ta mahsulot kirim qilindi', { count: result.created })}
                    {' · '}
                    {formatCurrency(Number(result.total_amount))}
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    {result.detail || t('inventory.importFailed', 'Import amalga oshmadi')}
                  </>
                )}
              </div>
              {succeeded && (
                <div className="text-sm text-muted-foreground">
                  {t('inventory.paid', "To'langan")}: {formatCurrency(Number(result.paid_amount))}
                  {' · '}
                  {t('inventory.debt', 'Qarz')}: {formatCurrency(Number(result.debt_amount))}
                </div>
              )}
              {result.skipped.length > 0 && (
                <div className="space-y-1">
                  <div className="text-sm font-medium">
                    {t('inventory.skippedRows', "O'tkazib yuborilgan satrlar")}: {result.skipped.length}
                  </div>
                  <div className="max-h-48 overflow-y-auto rounded border bg-background">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-20">{t('inventory.row', 'Satr')}</TableHead>
                          <TableHead>{t('inventory.reason', 'Sabab')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {result.skipped.map((s, i) => (
                          <TableRow key={i}>
                            <TableCell>{s.row}</TableCell>
                            <TableCell className="text-sm">{s.reason}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              {succeeded ? t('common.close', 'Yopish') : t('common.cancel', 'Bekor qilish')}
            </Button>
            <Button
              type="button"
              className="flex-1"
              onClick={handleImport}
              disabled={importing || !supplierId || !file || (baseStores.length > 1 && !storeId)}
            >
              <Upload className="h-4 w-4 mr-2" />
              {importing ? t('common.loading', 'Yuklanmoqda…') : t('inventory.importAction', 'Import qilish')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
