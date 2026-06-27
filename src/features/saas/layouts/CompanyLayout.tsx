import type { ReactNode } from 'react';
import { AppShell } from './AppShell';
import { COMPANY_MENU } from '../menu.config';
import { NotificationProvider } from '../../../context/NotificationProvider';
import { NotificationToast } from '../../../components/shared/NotificationToast';

export function CompanyLayout({ children }: { children: ReactNode }) {
  return (
    <NotificationProvider>
      <NotificationToast />
      <AppShell menu={COMPANY_MENU} brandTitle="Zumex" brandSubtitle="Biznes paneli" gated>
        {children}
      </AppShell>
    </NotificationProvider>
  );
}
