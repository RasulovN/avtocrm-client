import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Loader2, X, CreditCard, ShieldCheck } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { paymentsApi } from '../services';

interface Props {
  open: boolean;
  subscriptionId: number;
  planName: string;
  amountLabel: string; // masalan "99 000 so'm"
  onClose: () => void;
  onSuccess: () => void;
}

type Step = 'card' | 'otp';

function getApiError(e: unknown): string | null {
  const r = (e as { response?: { data?: { detail?: string } } })?.response;
  return r?.data?.detail ?? null;
}

export function PaymeCardModal({ open, subscriptionId, planName, amountLabel, onClose, onSuccess }: Props) {
  const { t } = useTranslation();
  const [step, setStep] = useState<Step>('card');
  const [number, setNumber] = useState('');
  const [expire, setExpire] = useState('');
  const [code, setCode] = useState('');
  const [token, setToken] = useState('');
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const [testMode, setTestMode] = useState(false);
  const closedRef = useRef(false);

  useEffect(() => {
    if (!open) return;
    closedRef.current = false;
    setStep('card'); setNumber(''); setExpire(''); setCode(''); setToken(''); setPhone(''); setBusy(false);
    paymentsApi.config().then((c) => setTestMode(c.test_mode)).catch(() => {});
  }, [open]);

  if (!open) return null;

  const fmtNumber = (v: string) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  const fmtExpire = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 4);
    return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  };

  const submitCard = async () => {
    const digits = number.replace(/\D/g, '');
    const exp = expire.replace(/\D/g, '');
    if (digits.length < 16) { toast.error(t('payme.errCardNumber', "Karta raqamini to'liq kiriting")); return; }
    if (exp.length !== 4) { toast.error(t('payme.errExpire', 'Amal qilish muddatini kiriting (MM/YY)')); return; }
    setBusy(true);
    try {
      const res = await paymentsApi.cardCreate(digits, exp, false);
      if (res.need_verify) {
        setToken(res.token);
        setPhone(res.phone ?? '');
        setStep('otp');
        toast.success(t('payme.codeSent', 'Tasdiqlash kodi SMS orqali yuborildi'));
      } else {
        // Tasdiq shart emas — to'g'ridan-to'g'ri to'laymiz
        await doPay(res.token);
      }
    } catch (e) {
      toast.error(getApiError(e) ?? t('payme.errCard', 'Karta qabul qilinmadi'));
    } finally {
      if (!closedRef.current) setBusy(false);
    }
  };

  const submitOtp = async () => {
    if (code.replace(/\D/g, '').length < 4) { toast.error(t('payme.errCode', 'Kodni kiriting')); return; }
    setBusy(true);
    try {
      const verified = await paymentsApi.cardVerify(token, code.replace(/\D/g, ''));
      await doPay(verified.token);
    } catch (e) {
      toast.error(getApiError(e) ?? t('payme.errCode', "Kod noto'g'ri"));
    } finally {
      if (!closedRef.current) setBusy(false);
    }
  };

  const doPay = async (payToken: string) => {
    const res = await paymentsApi.pay(subscriptionId, payToken);
    if (res.success) {
      closedRef.current = true;
      toast.success(t('payme.paid', "To'lov muvaffaqiyatli! Obuna faollashtirildi."), { duration: 5000 });
      onSuccess();
      onClose();
    } else {
      toast.error(t('payme.errPay', "To'lov amalga oshmadi"));
    }
  };

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={() => !busy && onClose()}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-card border border-border shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">{t('payme.title', "Karta orqali to'lov")}</h3>
          </div>
          <button type="button" onClick={() => !busy && onClose()} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="text-sm text-muted-foreground">
            {planName} — <span className="font-semibold text-foreground">{amountLabel}</span>
          </div>

          {step === 'card' ? (
            <div className="space-y-3">
              {/* MUHIM: inputlarda name atributi yo'q (Payme talabi) */}
              <div>
                <label className="text-xs font-medium text-muted-foreground">{t('payme.cardNumber', 'Karta raqami')}</label>
                <input
                  inputMode="numeric" autoComplete="off"
                  value={number}
                  onChange={(e) => setNumber(fmtNumber(e.target.value))}
                  placeholder="8600 0000 0000 0000"
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm tracking-wider focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">{t('payme.expire', 'Amal qilish muddati')}</label>
                <input
                  inputMode="numeric" autoComplete="off"
                  value={expire}
                  onChange={(e) => setExpire(fmtExpire(e.target.value))}
                  placeholder="MM/YY"
                  className="mt-1 w-40 rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <Button className="w-full h-11" disabled={busy} onClick={submitCard}>
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : t('payme.continue', 'Davom etish')}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {t('payme.codeHint', 'Tasdiqlash kodi yuborildi')}{phone ? `: ${phone}` : ''}
              </p>
              <input
                inputMode="numeric" autoComplete="one-time-code"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="• • • • • •"
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-center text-lg tracking-[0.4em] focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button className="w-full h-11" disabled={busy} onClick={submitOtp}>
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : t('payme.pay', "To'lash")}
              </Button>
              <button type="button" className="w-full text-xs text-muted-foreground hover:text-foreground" onClick={() => setStep('card')} disabled={busy}>
                {t('payme.back', 'Ortga')}
              </button>
            </div>
          )}

          {testMode && (
            <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-2.5 text-[11px] text-amber-700 dark:text-amber-400">
              {t('payme.testHint', 'TEST rejimi: karta 8600 4954 7331 6478, muddat 03/99, SMS kod 666666')}
            </div>
          )}

          <div className="flex items-center justify-center gap-1.5 pt-1 text-[11px] text-muted-foreground">
            <ShieldCheck className="w-3.5 h-3.5" />
            {t('payme.secured', "Karta ma'lumotlari Payme serverida saqlanadi. Powered by Payme")}
          </div>
        </div>
      </div>
    </div>
  );
}
