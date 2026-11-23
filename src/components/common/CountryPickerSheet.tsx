'use client';

import React, { useState, useMemo } from 'react';
import { WORLD_COUNTRIES, Country, searchCountries } from '@/lib/countries';
import { Search, X, Check } from 'lucide-react';

interface CountryPickerSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (country: Country) => void;
  onSelectCountry?: (country: Country) => void;
  selectedCode?: string;
  selectedCountry?: Country;
  title?: string;
}

export const CountryPickerSheet: React.FC<CountryPickerSheetProps> = ({
  isOpen,
  onClose,
  onSelect,
  onSelectCountry,
  selectedCode = 'NG',
  selectedCountry,
  title = 'Select Country / Region',
}) => {
  const [search, setSearch] = useState('');
  const activeCode = selectedCountry?.code || selectedCode;

  const handleSelect = (c: Country) => {
    if (onSelectCountry) onSelectCountry(c);
    if (onSelect) onSelect(c);
    onClose();
  };

  const filteredCountries = useMemo(() => {
    return searchCountries(search);
  }, [search]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Sheet / Modal */}
      <div className="relative w-full sm:max-w-md bg-neutral-950 border-t sm:border border-neutral-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden z-10 max-h-[85vh] flex flex-col animate-fade-in">
        {/* Header */}
        <div className="p-4 border-b border-neutral-850 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">{title}</h3>
            <p className="text-[11px] text-neutral-400">Search by country name, code, or dial code</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-900 text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-3 border-b border-neutral-850 bg-neutral-900/60">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input
              type="text"
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Type to search (e.g. Nigeria, US, UK, Ghana, Kenya)..."
              className="w-full py-2.5 pl-9 pr-8 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#0095f6] transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center text-[10px]"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Countries List */}
        <div className="flex-1 overflow-y-auto p-2 divide-y divide-neutral-900">
          {filteredCountries.length === 0 ? (
            <div className="py-12 text-center text-xs text-neutral-500">
              No country found matching &quot;{search}&quot;.
            </div>
          ) : (
            filteredCountries.map((c) => {
              const safeSelected = (activeCode || 'NG').toLowerCase();
              const isSelected =
                (c.code && c.code.toLowerCase() === safeSelected) ||
                (c.name && c.name.toLowerCase() === safeSelected) ||
                c.dialCode === activeCode;
              return (
                <button
                  key={`${c.code}-${c.dialCode}`}
                  onClick={() => handleSelect(c)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-colors ${
                    isSelected
                      ? 'bg-[#181818] text-[#0095f6] font-semibold'
                      : 'text-neutral-300 hover:bg-[#181818] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl leading-none">{c.flag}</span>
                    <div>
                      <span className="text-xs font-semibold block">{c.name}</span>
                      <span className="text-[10px] text-neutral-500 font-mono">{c.code}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-neutral-400">
                      {c.dialCode}
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-[#0095f6] stroke-[2.5]" />}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default CountryPickerSheet;
