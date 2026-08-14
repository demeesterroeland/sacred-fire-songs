'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { User, Plus } from 'lucide-react';
import { AuthorPill } from '@/components/ui/AuthorPill';
import { createClient } from '@/lib/supabase/client';
import { parseArtists, sortTagSuggestions } from '@/lib/songs/artistUtils';

export interface ArtistSuggestion {
  name: string;
  song_count: number;
}

export interface ArtistTagInputProps {
  selectedArtists: string[];
  onChange: (artists: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function ArtistTagInput({
  selectedArtists,
  onChange,
  placeholder = 'Type artist name and press Enter...',
  className = '',
}: ArtistTagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [availableArtists, setAvailableArtists] = useState<ArtistSuggestion[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch unique artists & song counts from database
  useEffect(() => {
    async function loadArtists() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('compositions')
          .select('original_author')
          .not('original_author', 'is', null);

        if (error) {
          console.error('Failed to load artists:', error);
          return;
        }

        const countsMap = new Map<string, { name: string; count: number }>();

        (data || []).forEach((row) => {
          const parsed = parseArtists(row.original_author);
          parsed.forEach((artistName) => {
            const key = artistName.toLowerCase();
            const existing = countsMap.get(key);
            if (existing) {
              existing.count += 1;
            } else {
              countsMap.set(key, { name: artistName, count: 1 });
            }
          });
        });

        const list: ArtistSuggestion[] = Array.from(countsMap.values()).map((item) => ({
          name: item.name,
          song_count: item.count,
        }));

        setAvailableArtists(list);
      } catch (err) {
        console.error('Error fetching artists for autocomplete:', err);
      }
    }

    loadArtists();
  }, []);

  // Filter and sort suggestions
  const suggestions = useMemo(() => {
    const term = inputValue.trim().toLowerCase();
    const selectedKeys = new Set(selectedArtists.map((a) => a.toLowerCase()));

    const filtered = availableArtists.filter((item) => {
      if (selectedKeys.has(item.name.toLowerCase())) return false;
      if (!term) return true;
      return item.name.toLowerCase().includes(term);
    });

    // Primary sort: song_count descending, Secondary sort: alphabetical
    return sortTagSuggestions(filtered);
  }, [availableArtists, inputValue, selectedArtists]);

  // Check if typed input exact matches an existing suggestion or selected item
  const isExactMatch = useMemo(() => {
    const term = inputValue.trim().toLowerCase();
    if (!term) return true;
    return (
      selectedArtists.some((a) => a.toLowerCase() === term) ||
      availableArtists.some((a) => a.name.toLowerCase() === term)
    );
  }, [inputValue, selectedArtists, availableArtists]);

  // Handle outside click to close dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addArtist = (artistName: string) => {
    const trimmed = artistName.trim();
    if (!trimmed) return;
    const lowerKey = trimmed.toLowerCase();
    if (!selectedArtists.some((a) => a.toLowerCase() === lowerKey)) {
      onChange([...selectedArtists, trimmed]);
    }
    setInputValue('');
    setIsOpen(false);
    setHighlightedIndex(0);
    inputRef.current?.focus();
  };

  const removeArtist = (indexToRemove: number) => {
    const updated = selectedArtists.filter((_, idx) => idx !== indexToRemove);
    onChange(updated);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (isOpen && suggestions.length > 0 && highlightedIndex < suggestions.length) {
        addArtist(suggestions[highlightedIndex].name);
      } else if (inputValue.trim()) {
        addArtist(inputValue.trim());
      }
    } else if (e.key === 'Backspace' && !inputValue && selectedArtists.length > 0) {
      removeArtist(selectedArtists.length - 1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) setIsOpen(true);
      const maxIndex = suggestions.length + (!isExactMatch ? 1 : 0) - 1;
      setHighlightedIndex((prev) => (prev < maxIndex ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) setIsOpen(true);
      const maxIndex = suggestions.length + (!isExactMatch ? 1 : 0) - 1;
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : maxIndex));
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Input container with selected pills inline */}
      <div
        className="flex flex-wrap items-center gap-1.5 min-h-[46px] w-full bg-gray-50 dark:bg-[#1d1c26] border border-gray-300 dark:border-[#3f3d52] rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-primary focus-within:border-primary transition-all cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        <User className="w-4 h-4 text-gray-400 shrink-0 mr-1" />

        {selectedArtists.map((artist, idx) => (
          <AuthorPill
            key={idx}
            author={artist}
            variant="badge"
            onRemove={() => removeArtist(idx)}
          />
        ))}

        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setIsOpen(true);
            setHighlightedIndex(0);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={selectedArtists.length === 0 ? placeholder : 'Add another artist...'}
          className="flex-1 min-w-[150px] bg-transparent border-none outline-none text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-[#a19eb7]/50"
        />
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && (suggestions.length > 0 || (inputValue.trim() && !isExactMatch)) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#1d1c26] border border-gray-200 dark:border-[#3f3d52] rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto py-1 animate-in fade-in slide-in-from-top-1 duration-150">
          {suggestions.map((item, idx) => {
            const isHighlighted = idx === highlightedIndex;
            return (
              <div
                key={item.name}
                onClick={() => addArtist(item.name)}
                onMouseEnter={() => setHighlightedIndex(idx)}
                className={`flex items-center justify-between px-3 py-2 text-xs cursor-pointer transition-colors ${
                  isHighlighted
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-medium'
                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800/60'
                }`}
              >
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 opacity-60" />
                  <span>{item.name}</span>
                </div>
                <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono">
                  {item.song_count} {item.song_count === 1 ? 'song' : 'songs'}
                </span>
              </div>
            );
          })}

          {inputValue.trim() && !isExactMatch && (
            <div
              onClick={() => addArtist(inputValue.trim())}
              onMouseEnter={() => setHighlightedIndex(suggestions.length)}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold cursor-pointer border-t border-gray-100 dark:border-gray-800 transition-colors ${
                highlightedIndex === suggestions.length
                  ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300'
                  : 'text-indigo-600 dark:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-800/60'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add new artist &quot;{inputValue.trim()}&quot;</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
