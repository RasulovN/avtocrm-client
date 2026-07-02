import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Save, User, Mail, Shield, Lock, Eye, EyeOff } from 'lucide-react';
import { PageHeader } from '../../../../components/shared/PageHeader';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Label } from '../../../../components/ui/Label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../../components/ui/Card';
import { useAuthStore } from '../../../../app/store';
import { authService } from '../../../../services/authService';

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export function AdminProfilePage() {
  const { t } = useTranslation();
  const { user } = useAuthStore();

  const [passwordData, setPasswordData] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [saving, setSaving] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);

  const handleChange = (field: keyof PasswordFormData, value: string) =>
    setPasswordData((prev) => ({ ...prev, [field]: value }));

  const toggleVisibility = (field: keyof typeof showPasswords) =>
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));

  // Joriy parol esdan chiqqan bo'lsa — tiklash havolasini admin emailiga yuboramiz
  // (mavjud forgot-password oqimi: email -> /reset-password/:uidb64/:token sahifasi).
  const handleForgotPassword = async () => {
    const email = user?.email;
    if (!email) {
      toast.error(t('auth.noEmailForReset', 'Hisobingizda email ko‘rsatilmagan.'));
      return;
    }
    try {
      setSendingReset(true);
      await authService.forgotPassword({ email });
      toast.success(
        t('auth.resetLinkSent', 'Parolni tiklash havolasi emailingizga yuborildi: {{email}}', { email }),
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : t('errors.generic', 'Xatolik yuz berdi');
      toast.error(message);
    } finally {
      setSendingReset(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error(t('errors.validationError', 'Parollar mos kelmadi'));
      return;
    }
    if (passwordData.newPassword.length < 8) {
      toast.error(t('auth.passwordMinLength', 'Parol kamida 8 ta belgidan iborat bo‘lishi kerak.'));
      return;
    }
    try {
      setSaving(true);
      await authService.changePassword({
        old_password: passwordData.currentPassword,
        new_password: passwordData.newPassword,
        confirm_password: passwordData.confirmPassword,
      });
      toast.success(t('messages.passwordUpdated', 'Parol muvaffaqiyatli o‘zgartirildi'));
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      const message = error instanceof Error ? error.message : t('errors.generic', 'Xatolik yuz berdi');
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('auth.profile', 'Profil')}
        description={t('auth.profileDescription', 'Hisob maʼlumotlari va xavfsizlik')}
      />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profil maʼlumotlari (faqat ko'rish) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {t('auth.profile', 'Profil')}
            </CardTitle>
            <CardDescription>{t('common.viewOnly', 'Faqat ko‘rish rejimi')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{t('users.fullName', 'Toʻliq ism')}</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={user?.full_name || 'Admin'} className="pl-10" disabled />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t('auth.email', 'Email')}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={user?.email || '—'} className="pl-10" disabled />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t('users.role', 'Rol')}</Label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={t('roles.superuser', 'Super Admin')} className="pl-10 capitalize" disabled />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Parolni o'zgartirish */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              {t('auth.changePassword', 'Parolni oʻzgartirish')}
            </CardTitle>
            <CardDescription>
              {t('auth.changePasswordDescription', 'Hisobingiz parolini yangilang')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">{t('auth.currentPassword', 'Joriy parol')}</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('currentPassword', e.target.value)}
                    className="pr-10"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => toggleVisibility('current')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {/* Joriy parol esdan chiqqan bo'lsa — emailga tiklash havolasi yuboriladi */}
                <div className="text-right">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={sendingReset}
                    className="text-sm text-primary hover:underline disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {sendingReset
                      ? t('auth.resetLinkSending', 'Yuborilmoqda…')
                      : t('auth.forgotPassword', 'Parolni unutdingizmi?')}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">{t('auth.newPassword', 'Yangi parol')}</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('newPassword', e.target.value)}
                    className="pr-10"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => toggleVisibility('new')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t('auth.confirmPassword', 'Parolni tasdiqlang')}</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('confirmPassword', e.target.value)}
                    className="pr-10"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => toggleVisibility('confirm')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? t('common.loading', 'Yuklanmoqda...') : t('auth.updatePassword', 'Parolni yangilash')}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
