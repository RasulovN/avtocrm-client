import { useState, useRef, useEffect, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Menu, ChevronLeft, X, User, ChevronDown, Settings, LogOut, Sun, Moon, Globe, Lock,
} from 'lucide-react';
import { cn } from '../../../utils';
import { useThemeStore, useAuthStore } from '../../../app/store';
import { Button } from '../../../components/ui';
import { Logo } from '../../../components/shared/Logo';
import { NotificationBell } from '../../../components/shared/NotificationBell';
import type { MenuEntry } from '../menu.config';

const LANGUAGES: { code: string; label: string; name: string }[] = [
  { code: 'uz', label: "O'z", name: "O'zbekcha" },
  { code: 'en', label: 'En', name: 'English' },
  { code: 'ru', label: 'Ру', name: 'Русский' },
  { code: 'cyrl', label: 'Кир', name: 'Ўзбекча (кирилл)' },
];

interface AppShellProps {
  menu: MenuEntry[];
  brandTitle: string;
  brandSubtitle: string;
  gated?: boolean; // obuna gating qo'llanadimi (company panel)
  headerExtra?: ReactNode;
  children: ReactNode;
}

export function AppShell({ menu, brandTitle, brandSubtitle, gated, headerExtra, children }: AppShellProps) {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const lang = i18n.language || 'uz';
  const currentLang = LANGUAGES.find((l) => l.code === i18n.language) ?? LANGUAGES[0];
  const { theme, toggleTheme } = useThemeStore();
  const { user, company, subscriptionActive, hasPermission, logout } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showLang, setShowLang] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null); // ochiq submenu (akkordeon)
  const profileRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfile(false);
      if (langRef.current && !langRef.current.contains(e.target as Node)) setShowLang(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  // Parent ko'rinadi: o'zining ruxsati YOKI kamida bitta child ruxsati bo'lsa.
  const visible = menu.filter(
    (m) => hasPermission(m.permission) || (m.children?.some((c) => hasPermission(c.permission)) ?? false),
  );

  // t() obyekt qaytarsa (i18n kalit to'qnashuvi) — fallback string'ga o'tamiz.
  const tLabel = (key: string, fb: string): string => {
    const v = t(key, fb);
    return typeof v === 'string' ? v : fb;
  };

  // Joriy yo'lga mos parent submenu'sini avtomatik ochish.
  useEffect(() => {
    const activeParent = visible.find(
      (m) => m.children?.length &&
        (location.pathname.startsWith(`/${lang}${m.path}`) ||
          m.children.some((c) => location.pathname === `/${lang}${c.path}`)),
    );
    if (activeParent) setOpenMenu(activeParent.path);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const switchLanguage = (newLang: string) => {
    i18n.changeLanguage(newLang);
    localStorage.setItem('i18nextLng', newLang);
    const parts = location.pathname.split('/').filter(Boolean);
    if (parts[0] && LANGUAGES.some((l) => l.code === parts[0])) {
      parts[0] = newLang;
      navigate('/' + parts.join('/'));
    }
  };

  return (
    <div className="app-shell flex min-h-screen">
      {isSidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      <aside className={cn(
        'fixed inset-y-0 left-0 z-40 bg-sidebar border-r border-border/60 transition-all duration-300 flex flex-col',
        isCollapsed ? 'w-[68px]' : 'w-[260px]',
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      )}>
        {/* Brand */}
        <div className={cn('h-16 flex items-center border-b border-border/60 shrink-0', isCollapsed ? 'justify-center px-2' : 'px-5 justify-between')}>
          {!isCollapsed ? (
            <div className="flex items-center gap-2.5">
              <Logo mark className="h-10 w-10 shrink-0 rounded-lg" />
              <div>
                <h1 className="text-base font-bold text-foreground tracking-tight truncate max-w-[150px]">{brandTitle}</h1>
                <p className="text-[11px] text-muted-foreground leading-tight">{brandSubtitle}</p>
              </div>
            </div>
          ) : (
            <Logo mark className="h-10 w-10 shrink-0 rounded-lg" />
          )}
          <button onClick={() => setIsCollapsed(!isCollapsed)} className={cn('p-1.5 rounded-lg hover:bg-muted hidden lg:flex items-center justify-center', isCollapsed && 'absolute -right-3 top-5 z-50 bg-card border shadow-sm')}>
            <ChevronLeft className={cn('h-3.5 w-3.5 text-muted-foreground transition-transform', isCollapsed && 'rotate-180')} />
          </button>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-1.5 rounded-lg hover:bg-muted"><X className="h-4 w-4" /></button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 px-3 space-y-0.5 overflow-y-auto">
          {visible.map((item) => {
            const locked = gated && !subscriptionActive && !item.alwaysAvailable;
            const href = `/${lang}${item.path}`;
            const children = item.children?.filter((c) => hasPermission(c.permission)) ?? [];
            const hasChildren = children.length > 0 && !isCollapsed && !locked;
            const sectionActive =
              location.pathname === href ||
              location.pathname.startsWith(href + '/') ||
              children.some((c) => location.pathname === `/${lang}${c.path}`);

            // ── Submenu (akkordeon) ──
            if (hasChildren) {
              const isOpen = openMenu === item.path;
              return (
                <div key={item.path}>
                  <button
                    type="button"
                    onClick={() => setOpenMenu(isOpen ? null : item.path)}
                    className={cn('sidebar-nav-item w-full', sectionActive && 'active')}
                  >
                    <item.icon className="h-[18px] w-[18px] shrink-0" />
                    <span className="flex-1 text-left">{tLabel(item.label, item.fallback)}</span>
                    <ChevronDown className={cn('h-3.5 w-3.5 opacity-50 transition-transform', isOpen && 'rotate-180')} />
                  </button>
                  {isOpen && (
                    <div className="mt-0.5 ml-3.5 pl-3 border-l border-border/50 space-y-0.5">
                      {children.map((c) => {
                        const chref = `/${lang}${c.path}`;
                        const cActive = location.pathname === chref;
                        return (
                          <Link
                            key={c.path}
                            to={chref}
                            onClick={() => setIsSidebarOpen(false)}
                            className={cn('sidebar-nav-item text-[13px] py-1.5', cActive && 'active')}
                          >
                            <c.icon className="h-4 w-4 shrink-0" />
                            <span className="flex-1">{tLabel(c.label, c.fallback)}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            // ── Oddiy element (yoki collapsed / locked) ──
            return (
              <Link
                key={item.path}
                to={locked ? `/${lang}/subscription` : href}
                onClick={() => setIsSidebarOpen(false)}
                className={cn('sidebar-nav-item', sectionActive && 'active', isCollapsed && 'justify-center px-2', locked && 'opacity-50')}
                title={isCollapsed ? (tLabel(item.label, item.fallback) as string) : undefined}
              >
                <item.icon className="h-[18px] w-[18px] shrink-0" />
                {!isCollapsed && <span className="flex-1">{tLabel(item.label, item.fallback)}</span>}
                {!isCollapsed && locked && <Lock className="h-3.5 w-3.5 opacity-60" />}
              </Link>
            );
          })}
        </nav>

        {/* Profile */}
        <div className={cn('border-t border-border/60 p-3', isCollapsed && 'flex justify-center')}>
          <div className="relative w-full" ref={profileRef}>
            <div className={cn('flex items-center gap-3 p-2 rounded-xl cursor-pointer hover:bg-muted', isCollapsed && 'justify-center')} onClick={() => setShowProfile(!showProfile)}>
              <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"><User className="h-4 w-4 text-primary" /></div>
              {!isCollapsed && (
                <>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate text-foreground">{user?.full_name || user?.phone_number || user?.email}</p>
                    <p className="text-[11px] text-muted-foreground capitalize truncate">{user?.role || ''}</p>
                  </div>
                  <ChevronDown className={cn('h-3.5 w-3.5 text-muted-foreground transition-transform', showProfile && 'rotate-180')} />
                </>
              )}
            </div>
            {showProfile && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-card border border-border/60 rounded-xl shadow-xl p-3 space-y-1.5 z-50">
                {hasPermission('company.settings.update') && (
                  <Button variant="ghost" className="w-full justify-start rounded-lg h-9 text-sm" onClick={() => navigate(`/${lang}/settings`)}>
                    <Settings className="h-4 w-4 mr-2" />{t('nav.settings', 'Sozlamalar')}
                  </Button>
                )}
                <Button variant="ghost" className="w-full justify-start rounded-lg h-9 text-sm text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />{t('auth.logout', 'Chiqish')}
                </Button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className={cn('flex-1 flex flex-col transition-all duration-300', isCollapsed ? 'lg:ml-[68px]' : 'lg:ml-[260px]')}>
        <header className="sticky top-0 z-20 h-16 border-b border-border/60 bg-background/80 backdrop-blur-xl">
          <div className="flex h-full items-center justify-between px-4 lg:px-6">
            <div className="flex items-center gap-3">
              <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-muted"><Menu className="h-5 w-5" /></button>
              {company && (
                <div className="flex items-center gap-2 bg-primary/5 px-3.5 py-2 rounded-xl border border-primary/10">
                  <span className="font-semibold text-xs sm:text-sm text-primary truncate max-w-[150px] sm:max-w-[250px]">{company.name}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              {headerExtra}
              <NotificationBell />
              <div className="relative" ref={langRef}>
                <button
                  type="button"
                  onClick={() => setShowLang((v) => !v)}
                  aria-haspopup="listbox"
                  aria-expanded={showLang}
                  className="flex items-center gap-1.5 h-9 rounded-xl bg-muted/50 px-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                >
                  <Globe className="h-[18px] w-[18px] text-muted-foreground shrink-0" />
                  <span className="hidden sm:inline">{currentLang.label}</span>
                  <ChevronDown className={cn('h-3.5 w-3.5 text-muted-foreground transition-transform', showLang && 'rotate-180')} />
                </button>
                {showLang && (
                  <div
                    role="listbox"
                    className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-border/60 bg-card p-1.5 shadow-xl z-50"
                  >
                    {LANGUAGES.map((l) => (
                      <button
                        key={l.code}
                        role="option"
                        aria-selected={i18n.language === l.code}
                        onClick={() => { switchLanguage(l.code); setShowLang(false); }}
                        className={cn(
                          'flex w-full items-center justify-between gap-2 rounded-lg px-3 h-9 text-sm font-medium transition-colors',
                          i18n.language === l.code ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted',
                        )}
                      >
                        <span>{l.name}</span>
                        <span className="text-xs text-muted-foreground">{l.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Button variant="ghost" size="icon" className="rounded-xl h-9 w-9" onClick={toggleTheme}>
                {theme === 'dark' ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
              </Button>
            </div>
          </div>
        </header>
        <main id="main-content" className="flex-1 p-4 lg:p-6" tabIndex={-1}>
          <div className="animate-fade-in-up">{children}</div>
        </main>
      </div>
    </div>
  );
}
