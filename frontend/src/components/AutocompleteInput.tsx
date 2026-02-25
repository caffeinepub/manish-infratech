import React, { useState, useRef, useEffect } from 'react';

interface AutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  placeholder?: string;
  className?: string;
  onBlur?: () => void;
  disabled?: boolean;
}

export default function AutocompleteInput({
  value,
  onChange,
  suggestions,
  placeholder,
  className = '',
  onBlur,
  disabled,
}: AutocompleteInputProps) {
  const [open, setOpen] = useState(false);
  const [filtered, setFiltered] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value.trim() === '') {
      setFiltered([]);
      setOpen(false);
      return;
    }
    const lower = value.toLowerCase();
    const matches = suggestions.filter(s => s.toLowerCase().includes(lower) && s !== value);
    setFiltered(matches);
    setOpen(matches.length > 0);
  }, [value, suggestions]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        onBlur?.();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onBlur]);

  const handleSelect = (s: string) => {
    onChange(s);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={className}
        onFocus={() => {
          if (filtered.length > 0) setOpen(true);
        }}
        autoComplete="off"
      />
      {open && (
        <ul className="absolute z-50 left-0 right-0 top-full mt-0.5 bg-white border border-navy-200 rounded shadow-lg max-h-48 overflow-y-auto text-sm">
          {filtered.map(s => (
            <li
              key={s}
              onMouseDown={() => handleSelect(s)}
              className="px-3 py-1.5 cursor-pointer hover:bg-saffron-50 text-navy-800"
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
