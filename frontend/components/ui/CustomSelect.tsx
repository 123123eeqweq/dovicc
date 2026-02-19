'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function CustomSelect({
  value,
  onChange,
  options,
  className = '',
  placeholder,
  disabled = false
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const selectedOption = options.find(opt => opt.value === value);
  const displayValue = selectedOption ? selectedOption.label : placeholder || 'Оберіть...';

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div ref={selectRef} className="relative">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full h-11 px-4 text-sm bg-white border border-slate-200 rounded-xl
          focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500
          cursor-pointer text-slate-700 outline-none
          flex items-center justify-between gap-2
          transition-colors
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-slate-300'}
          ${isOpen ? 'border-emerald-500 ring-2 ring-emerald-500/25' : ''}
          ${className}
        `}
      >
        <span className="truncate text-left flex-1">{displayValue}</span>
        <ChevronDown
          size={16}
          className={`text-slate-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
          <div className="max-h-60 overflow-y-auto custom-select-scrollbar" data-allow-scroll>
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`
                  w-full px-3 py-2 text-sm text-left transition-colors cursor-pointer
                  ${value === option.value
                    ? 'bg-emerald-50 text-emerald-700 font-medium'
                    : 'text-slate-700 hover:bg-slate-50'
                  }
                `}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
