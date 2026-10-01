"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";
import { EASE } from "@/components/motion-primitives";

export interface DropdownOption {
  label: string;
  value: string | number;
}

interface CustomDropdownProps {
  options: DropdownOption[] | string[];
  value: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
  menuClassName?: string;
}

export default function CustomDropdown({
  options,
  value,
  onChange,
  placeholder = "Select option",
  className = "",
  triggerClassName = "",
  menuClassName = "",
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  // Open upwards when there isn't room below (e.g. above the phone app dock).
  const [openUp, setOpenUp] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Only apply our default font size when the caller doesn't set one, so the
  // two arbitrary font-size utilities never compete.
  const hasCustomText = /(^|\s)text-\[/.test(triggerClassName);

  // Normalize options to DropdownOption format
  const normalizedOptions: DropdownOption[] = options.map((opt) =>
    typeof opt === "string" ? { label: opt, value: opt } : opt
  );

  const selectedOption = normalizedOptions.find(
    (opt) => String(opt.value) === String(value)
  ) || normalizedOptions[0];

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const toggle = () => {
    if (!isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const isPhone = window.matchMedia("(max-width: 767px)").matches;
      // Bottom app dock (64px + safe area) covers the bottom of the screen on phones.
      const bottomInset = isPhone ? 84 : 12;
      const menuHeight = Math.min(normalizedOptions.length * (isPhone ? 46 : 34) + 16, 240);
      const spaceBelow = window.innerHeight - rect.bottom - bottomInset;
      const spaceAbove = rect.top - 80; // fixed top navbar
      setOpenUp(spaceBelow < menuHeight && spaceAbove > spaceBelow);
    }
    setIsOpen((prev) => !prev);
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={toggle}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`flex min-h-[44px] w-full items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left ${
          hasCustomText ? "" : "text-[14px] sm:text-[12.5px]"
        } transition-all cursor-pointer sm:min-h-0 ${
          isOpen
            ? "border-amber-400 bg-[#1e1e1e] text-white ring-1 ring-amber-400/30 shadow-md"
            : "border-white/15 bg-white/5 text-white/90 hover:border-amber-400/40 hover:bg-white/[0.08]"
        } ${triggerClassName}`}
      >
        <span className="truncate font-medium">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className={`shrink-0 transition-colors ${
            isOpen ? "text-amber-400" : "text-white/50"
          }`}
        >
          <ChevronDown className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
        </motion.div>
      </button>

      {/* Custom Animated Popup Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: openUp ? 4 : -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: openUp ? 4 : -4, scale: 0.98 }}
            transition={{ duration: 0.16, ease: EASE }}
            role="listbox"
            className={`absolute left-0 ${
              openUp ? "bottom-full mb-1.5" : "top-full mt-1.5"
            } w-full z-50 overflow-hidden rounded-xl border border-white/15 bg-[#181818]/98 p-1 shadow-[0_16px_36px_rgba(0,0,0,0.85)] backdrop-blur-2xl ring-1 ring-white/10 ${menuClassName}`}
          >
            <div className="max-h-[min(14rem,45vh)] overflow-y-auto overscroll-contain scrollbar-none py-0.5 space-y-0.5 sm:max-h-56">
              {normalizedOptions.map((opt) => {
                const isSelected = String(opt.value) === String(value);
                return (
                  <button
                    key={String(opt.value)}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                    className={`group flex min-h-[44px] w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-[14px] transition-all text-left cursor-pointer sm:min-h-0 sm:gap-0 sm:px-2.5 sm:text-[12px] ${
                      isSelected
                        ? "bg-amber-400/15 font-semibold text-amber-300 border border-amber-400/30"
                        : "text-white/80 hover:bg-white/10 hover:text-white active:bg-white/10"
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && (
                      <Check className="h-4 w-4 shrink-0 text-amber-400 stroke-[2.5] sm:h-3.5 sm:w-3.5" />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
