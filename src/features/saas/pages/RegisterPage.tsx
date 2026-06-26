import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Car, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Label } from '../../../components/ui/Label';
import { Card, CardContent, CardDescription, CardHeader } from '../../../components/ui/Card';
import { saasAuth } from '../services';

export function RegisterPage() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ full_name: '', email: '', password: '', confirm_password: '' });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (form.password !== form.confirm_password) {
      setError(t('auth.passwordMismatch', 'Parollar mos kelmadi'));
      return;
    }
    setLoading(true);
    try {
      await saasAuth.register(form);
      setDone(true);
    } catch (err: unknown) {
      const e2 = err as { response?: { data?: Record<string, unknown> } };
      const data = e2.response?.data;
      setError(data ? Object.values(data).flat().join(' ') : t('common.error', 'Xatolik'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-3xl" />
      </div>
      <div className="relative z-10 w-full max-w-md mx-4 animate-fade-in-up">
        <Card className="shadow-xl border-border/40 backdrop-blur-sm bg-card/90">
          <CardHeader className="space-y-4 text-center pb-2">
            <div className="mx-auto w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
              <Car className="w-8 h-8 text-primary-foreground" />
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight">AutoCRM</h1>
              <CardDescription className="text-base">{t('auth.register', "Ro'yxatdan o'tish")}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {done ? (
              <div className="text-center space-y-4 py-4">
                <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto" />
                <p className="font-semibold text-lg">{t('auth.checkEmail', 'Emailingizni tekshiring')}</p>
                <p className="text-sm text-muted-foreground">
                  {t('auth.verifySent', "")} <span className="font-medium">{form.email}</span> {t('auth.verifySent2', "manziliga tasdiqlash havolasi yuborildi. Havola orqali emailingizni tasdiqlang.")}
                </p>
                <Link to="/login"><Button variant="outline" className="w-full h-11 mt-2">{t('auth.backToLogin', 'Kirishga qaytish')}</Button></Link>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name" className="text-sm font-semibold">{t('auth.fullName', 'Ism familiya')}</Label>
                  <Input id="full_name" value={form.full_name} onChange={(e) => update('full_name', e.target.value)} className="h-11" placeholder="Ism familiya" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold">Email</Label>
                  <Input id="email" type="email" required value={form.email} onChange={(e) => update('email', e.target.value)} className="h-11" placeholder="email@misol.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-semibold">{t('auth.password', 'Parol')}</Label>
                  <div className="relative">
                    <Input id="password" type={show ? 'text' : 'password'} required value={form.password} onChange={(e) => update('password', e.target.value)} className="h-11 pr-10" placeholder="••••••••" />
                    <button type="button" onClick={() => setShow(!show)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">{show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm" className="text-sm font-semibold">{t('auth.confirmPassword', 'Parolni tasdiqlang')}</Label>
                  <Input id="confirm" type={show ? 'text' : 'password'} required value={form.confirm_password} onChange={(e) => update('confirm_password', e.target.value)} className="h-11" placeholder="••••••••" />
                </div>
                {error && <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20"><p className="text-sm text-destructive font-medium">{error}</p></div>}
                <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={loading}>
                  {loading ? t('common.loading', 'Yuklanmoqda...') : t('auth.registerButton', "Ro'yxatdan o'tish")}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  {t('auth.haveAccount', 'Hisobingiz bormi?')}{' '}
                  <Link to="/login" className="text-primary hover:underline font-semibold">{t('auth.login', 'Kirish')}</Link>
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
