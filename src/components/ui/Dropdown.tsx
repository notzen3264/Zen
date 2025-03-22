import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";
import { cn } from "../../lib/utils";

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

export function Dropdown({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  className,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number; width: number } | null>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((option) => option.value === value);

  const updatePosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX, width: rect.width });
    }
  };

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      window.addEventListener("scroll", updatePosition, { passive: true });
    }
    return () => {
      window.removeEventListener("scroll", updatePosition);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        buttonRef.current && !buttonRef.current.contains(event.target as Node) &&
        dropdownRef.current && !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className={cn("relative dropdown", className)}>
      <div
        ref={buttonRef}
        className="flex items-center justify-between h-12 px-4 rounded-2xl cursor-pointer"
        onClick={() => {
          setIsOpen((prev) => !prev);
          updatePosition();
        }}
      >
        <div className="flex items-center gap-2">
          {selectedOption?.icon}
          <span className="text-text">{selectedOption?.label || placeholder}</span>
        </div>
        <ChevronDown className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")} />
      </div>

      {isOpen && position &&
        createPortal(
          <div
            ref={dropdownRef}
            className="dropdown-content z-50 absolute mt-2 transition-none"
            style={{ top: position.top, left: position.left, width: position.width }}
          >
            {options.map((option) => (
              <div
                key={option.value}
                className={cn(
                  "dropdown-item flex items-center gap-2 z-50",
                  option.value === value && "bg-surface0"
                )}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
              >
                {option.icon}
                {option.label}
              </div>
            ))}
          </div>,
          document.body
        )}
    </div>
  );
}
