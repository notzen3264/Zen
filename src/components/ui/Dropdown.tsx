import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function Dropdown({ options, value, onChange, placeholder = 'Select an option', className }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const selectedOption = options.find(option => option.value === value);

  const handleSelect = (value: string) => {
    onChange(value);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div ref={dropdownRef} className={cn("dropdown", className)}>
      <div 
        className="flex items-center justify-between h-12 px-4 rounded-2xl cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          {selectedOption?.icon}
          <span className="text-text">{selectedOption?.label || placeholder}</span>
        </div>
        <ChevronDown className={cn("w-4 h-4 transition-transform", isOpen && "transform rotate-180")} />
      </div>
      
      {isOpen && (
        <div className="dropdown-content z-[9999999]">
          {options.map((option) => (
            <div 
              key={option.value} 
              className={cn(
                "dropdown-item flex items-center gap-2",
                option.value === value && "bg-surface0"
              )}
              onClick={() => handleSelect(option.value)}
            >
              {option.icon}
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}