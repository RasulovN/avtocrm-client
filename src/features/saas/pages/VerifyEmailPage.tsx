import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Card, CardContent } from '../../../components/ui/Card';
import { saasAuth } from '../services';

export function VerifyEmailPage() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const token = params.get('token');
  const [state, setState] = useState<'loading' | 'ok' | 'fail'>('loading');

  useEffect(() => {
    if (!token) { setState('fail'); return; }
    let cancelled = false;
    saasAuth.verifyEmail(token)
      .then(() => { if (!cancelled) setState('ok'); })
      .catch(() => { if (!cancelled) setState('fail'); });
    return () => { cancelled = true; };
  }, [token]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="w-full max-w-md mx-4">
        <Card className="shadow-xl border-border/40 bg-card/90">
          <CardContent className="py-10 text-center space-y-4">
            {state === 'loading' && (<>
              <Loader2 className="w-14 h-14 text-primary mx-auto animate-spin" />
              <p className="font-semibold text-lg">{t('auth.verifying', 'Tasdiqlanmoqda...')}</p>
            </>)}
            {state === 'ok' && (<>
              <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto" />
              <p className="font-semibold text-lg">{t('auth.emailVerified', 'Email tasdiqlandi!')}</p>
              <p className="text-sm text-muted-foreground">{t('auth.canLogin', 'Endi tizimga kirishingiz mumkin.')}</p>
              <Link to="/login"><Button className="w-full h-11 mt-2">{t('auth.login', 'Kirish')}</Button></Link>
            </>)}
            {state === 'fail' && (<>
              <XCircle className="w-14 h-14 text-destructive mx-auto" />
              <p className="font-semibold text-lg">{t('auth.verifyFailed', 'Tasdiqlash amalga oshmadi')}</p>
              <p className="text-sm text-muted-foreground">{t('auth.verifyFailedDesc', 'Havola yaroqsiz yoki muddati tugagan.')}</p>
              <Link to="/login"><Button variant="outline" className="w-full h-11 mt-2">{t('auth.backToLogin', 'Kirishga qaytish')}</Button></Link>
            </>)}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
