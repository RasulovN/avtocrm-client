import { useState, useRef, useEffect } from 'react';
import { Info } from 'lucide-react';
import { cn } from '../../utils';

interface PrinterFormatInfoProps {
  /** Popover sarlavhasi, masalan "Chek printer formati" */
  title: string;
  /** Format qatorlari, masalan ["Width: 2.15 inch", "Height: 3.15 inch"] */
  lines: string[];
  /** Qo'shimcha izoh (ixtiyoriy) */
  note?: string;
  /** Popover qaysi tomonga ochilsin */
  align?: 'left' | 'right';
  className?: string;
}

// Kichik (ⓘ) info ikonka + bosilganda ochiladigan popover.
// "Printerni shu formatda sozlang" kabi ma'lumotni ko'rsatish uchun (chek/barcode yonida).
// `print-hidden` — chop etishda ko'rinmaydi.
export function PrinterFormatInfo({ title, lines, note, align = 'right', className }: PrinterFormatInfoProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div className={cn('relative inline-flex print-hidden', className)} ref={ref}>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
        className="inline-flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
        title={title}
        aria-label={title}
      >
        <Info className="h-4 w-4" />
      </button>
      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          className={cn(
            'absolute top-full mt-1.5 z-50 w-60 rounded-lg border border-border/60 bg-card p-3 text-left shadow-xl',
            align === 'right' ? 'right-0' : 'left-0',
          )}
        >
          <p className="mb-1.5 text-xs font-semibold text-foreground">{title}</p>
          <ul className="space-y-0.5 text-xs text-muted-foreground">
            {lines.map((l, i) => (
              <li key={i} className="font-mono">{l}</li>
            ))}
          </ul>
          {note && (
            <p className="mt-2 border-t border-border/50 pt-2 text-[11px] leading-snug text-muted-foreground">
              {note}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
