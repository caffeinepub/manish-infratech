import React, { useState, useRef, useEffect } from 'react';

interface AutocompleteInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  suggestions: string[];
  onValueChange?: (value: string) => void;
}

export default function AutocompleteInput({
  suggestions,
  onValueChange,
  value,
  onChange,
  ...props
}: AutocompleteInputProps) {
  const [open, setOpen] = useState(false);
  const [filtered, setFiltered] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentValue = (value as string) ?? '';

  useEffect(() => {
    if (currentValue.trim().length === 0) {
      setFiltered(suggestions.slice(0, 10));
    } else {
      const lower = currentValue.toLowerCase();
      setFiltered(
        suggestions.filter(s => s.toLowerCase().includes(lower)).slice(0, 10)
      );
    }
  }, [currentValue, suggestions]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e);
    onValueChange?.(e.target.value);
    setOpen(true);
  };

  const handleSelect = (suggestion: string) => {
    onValueChange?.(suggestion);
    // Simulate a change event
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value'
    )?.set;
    if (containerRef.current) {
      const input = containerRef.current.querySelector('input');
      if (input && nativeInputValueSetter) {
        nativeInputValueSetter.call(input, suggestion);
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <input
        {...props}
        value={value}
        onChange={handleInputChange}
        onFocus={() => setOpen(true)}
        autoComplete="off"
        className={`w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm transition ${props.className ?? ''}`}
      />
      {open && filtered.length > 0 && (
        <ul className="absolute z-50 w-full bg-card border border-border rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
          {filtered.map((s, i) => (
            <li
              key={i}
              onMouseDown={() => handleSelect(s)}
              className="px-3 py-2 text-sm cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors"
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
