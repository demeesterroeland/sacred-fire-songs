import { Disc3 } from 'lucide-react';
import { getServerT } from '@/lib/i18n/server';

export default async function AlbumsPage() {
    const t = await getServerT();
    return (
        <div>
            <div className="mt-16 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-gray-200/60 dark:bg-gray-800/60 border border-gray-300/40 dark:border-gray-700/40 flex items-center justify-center mb-5">
                    <Disc3 className="w-8 h-8 text-gray-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-1">{t('albums.likedAlbums')}</h2>
                <p className="text-sm text-gray-600 max-w-xs">
                    {t('albums.description')}
                </p>
                <span className="mt-4 text-[10px] font-bold uppercase tracking-widest text-gray-600 bg-gray-200/60 dark:bg-gray-800/60 border border-gray-300/40 dark:border-gray-700/40 px-3 py-1 rounded-full">
                    {t('common.comingSoon')}
                </span>
            </div>
        </div>
    );
}
