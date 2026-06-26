import type { ReactNode } from 'react';
import { AppShell } from './AppShell';
import { PLATFORM_MENU } from '../menu.config';
import { NotificationProvider } from '../../../context/NotificationProvider';
import { NotificationToast } from '../../../components/shared/NotificationToast';

export function PlatformLayout({ children }: { children: ReactNode }) {
  return (
    <NotificationProvider>
      <NotificationToast />
      <AppShell menu={PLATFORM_MENU} brandTitle="AutoCRM" brandSubtitle="Super Admin">
        {children}
      </AppShell>
    </NotificationProvider>
  );
}
