import type { ReactNode } from 'react';
import { AppShell } from './AppShell';
import { COMPANY_MENU } from '../menu.config';
import { NotificationProvider } from '../../../context/NotificationProvider';
import { NotificationToast } from '../../../components/shared/NotificationToast';
import { SupportWidget } from '../../support/SupportWidget';

export function CompanyLayout({ children }: { children: ReactNode }) {
  return (
    <NotificationProvider>
      <NotificationToast />
      <AppShell menu={COMPANY_MENU} brandTitle="Zumex" brandSubtitle="Biznes paneli" gated>
        {children}
      </AppShell>
      {/* Suzuvchi qo'llab-quvvatlash chati (barcha sahifalar ustidan) */}
      <SupportWidget />
    </NotificationProvider>
  );
}
