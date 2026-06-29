import { cn } from '../../utils';

type LogoProps = {
  /** Tailwind o'lcham/ko'rinish klasslari, masalan: "h-9 w-auto" */
  className?: string;
  /**
   * 'auto'  — mavzuga qarab almashadi (light fon → logo-light, dark fon → logo-dark)
   * 'light' — har doim och fon uchun logo (qora "ZUMEX")
   * 'dark'  — har doim qoramtir fon uchun logo (oq matn, shaffof fon)
   */
  variant?: 'auto' | 'light' | 'dark';
  /** true bo'lsa faqat "Z" belgisi (wordmarksiz) — kichik/kvadrat joylar uchun */
  mark?: boolean;
};

// To'liq lockup (Z + ZUMEX) va faqat belgi (Z) variantlari.
const SRC = {
  full: { light: '/images/logo-light.png', dark: '/images/logo-dark.png' },
  mark: { light: '/images/logo-mark-light.png', dark: '/images/logo-mark-dark.png' },
};

/**
 * Zumex logotipi — ikki rejim uchun. Mavzu (.dark klassi) bo'yicha mos rasm
 * CSS orqali almashadi, shuning uchun rejim o'zgarganda "miltillash" bo'lmaydi.
 */
export function Logo({ className, variant = 'auto', mark = false }: LogoProps) {
  const src = mark ? SRC.mark : SRC.full;
  const base = 'object-contain select-none';
  if (variant === 'light') {
    return <img src={src.light} alt="Zumex" loading="eager" decoding="async" className={cn(base, className)} />;
  }
  if (variant === 'dark') {
    return <img src={src.dark} alt="Zumex" loading="eager" decoding="async" className={cn(base, className)} />;
  }
  return (
    <>
      <img src={src.light} alt="Zumex" loading="eager" decoding="async" className={cn(base, 'block dark:hidden', className)} />
      <img src={src.dark} alt="" aria-hidden="true" loading="eager" decoding="async" className={cn(base, 'hidden dark:block', className)} />
    </>
  );
}
