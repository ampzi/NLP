import type { LucideIcon } from 'lucide-react';
import { MoreVertical } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';

export interface DropdownMenuItem {
  label: string;
  icon?: LucideIcon;
  onSelect: () => void;
  destructive?: boolean;
  disabled?: boolean;
}

interface DropdownMenuProps {
  items: DropdownMenuItem[];
  trigger?: ReactNode;
  align?: 'start' | 'end';
}

export function DropdownMenu({ items, trigger, align = 'start' }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="باز کردن منو"
        className="inline-flex items-center justify-center rounded-md p-2 text-charcoal transition-colors hover:bg-ink/5 hover:text-ink"
      >
        {trigger ?? <MoreVertical className="h-4 w-4" />}
      </button>
      {open && (
        <div
          role="menu"
          className={`absolute z-20 mt-1 w-48 rounded-md border border-stone bg-ivory py-1 shadow-subtle ${
            align === 'end' ? 'end-0' : 'start-0'
          }`}
        >
          {items.map((item, i) => (
            <button
              key={i}
              role="menuitem"
              disabled={item.disabled}
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                item.onSelect();
              }}
              className={`flex w-full items-center gap-2.5 px-3 py-2 text-start text-sm transition-colors hover:bg-ink/5 disabled:cursor-not-allowed disabled:opacity-50 ${
                item.destructive ? 'text-signal' : 'text-ink'
              }`}
            >
              {item.icon && <item.icon className="h-4 w-4" strokeWidth={2} />}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
