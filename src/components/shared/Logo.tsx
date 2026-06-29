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
};

const LIGHT_SRC = '/images/logo-light.png'; // och fon uchun
const DARK_SRC = '/images/logo-dark.png'; // qoramtir fon uchun (shaffof)

/**
 * Zumex logotipi — ikki rejim uchun. Mavzu (.dark klassi) bo'yicha mos rasm
 * CSS orqali almashadi, shuning uchun rejim o'zgarganda "miltillash" bo'lmaydi.
 */
export function Logo({ className, variant = 'auto' }: LogoProps) {
  if (variant === 'light') {
    return <img src={LIGHT_SRC} alt="Zumex" loading="eager" decoding="async" className={cn('object-contain select-none', className)} />;
  }
  if (variant === 'dark') {
    return <img src={DARK_SRC} alt="Zumex" loading="eager" decoding="async" className={cn('object-contain select-none', className)} />;
  }
  return (
    <>
      <img src={LIGHT_SRC} alt="Zumex" loading="eager" decoding="async" className={cn('object-contain select-none block dark:hidden', className)} />
      <img src={DARK_SRC} alt="" aria-hidden="true" loading="eager" decoding="async" className={cn('object-contain select-none hidden dark:block', className)} />
    </>
  );
}
