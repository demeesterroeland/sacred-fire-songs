import { Mic2 } from 'lucide-react';

export default function ArtistsPage() {
    return (
        <div>
            <div className="mt-16 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-gray-800/60 border border-gray-700/40 flex items-center justify-center mb-5">
                    <Mic2 className="w-8 h-8 text-gray-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-300 mb-1">Followed Artists</h2>
                <p className="text-sm text-gray-600 max-w-xs">
                    Follow artists you love and they&apos;ll appear here.
                </p>
                <span className="mt-4 text-[10px] font-bold uppercase tracking-widest text-gray-600 bg-gray-800/60 border border-gray-700/40 px-3 py-1 rounded-full">
                    Coming soon
                </span>
            </div>
        </div>
    );
}
