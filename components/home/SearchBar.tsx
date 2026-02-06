'use client';

import { Search } from 'lucide-react';

interface SearchBarProps {
    value?: string;
    onChange: (text: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
    return (
        <div className="relative group w-full max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-red-500 transition-colors" />
            <input
                type="text"
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-gray-900/50 border border-gray-800 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-red-500/30 focus:border-red-500/50 transition-all outline-none"
                placeholder="Search 200+ medicine songs..."
            />
        </div>
    );
}

