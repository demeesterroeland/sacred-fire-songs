export const getCategoryColor = (slug: string) => {
  // --- 1. Top-level Categories (Headers) ---
  if (slug === 'the-elements') return 'blue';
  if (slug === 'nature') return 'emerald';
  if (slug === 'languages') return 'gray';
  if (slug === 'lineage-tradition') return 'amber';
  if (slug === 'medicine-healing') return 'red';
  if (slug === 'spiritual-concepts') return 'yellow';

  // --- 2. Specific Sub-categories (Tags) ---
  // Ensuring uniqueness within same main categories

  // THE ELEMENTS
  if (slug === 'fire') return 'red';
  if (slug === 'water') return 'blue';
  if (slug === 'air') return 'sky';
  if (slug === 'earth') return 'amber';

  // NATURE
  if (slug === 'animales') return 'orange';
  if (slug === 'bird') return 'teal';
  if (slug === 'plantas') return 'emerald';
  if (slug === 'moon') return 'indigo';
  if (slug === 'sun') return 'yellow';
  if (slug === 'mountain') return 'sky'; // reused with Air, but different category
  if (slug === 'selva') return 'lime';

  // LANGUAGES (Always neutral gray)
  if (
    slug === 'spanish' ||
    slug === 'english' ||
    slug === 'portuguese' ||
    slug === 'quechua-kichwa' ||
    slug === 'nahuatl' ||
    slug === 'huni-kuin' ||
    slug === 'german' ||
    slug === 'belarusian' ||
    slug === 'croatian' ||
    slug === 'italian' ||
    slug === 'lithuanian' ||
    slug === 'russian'
  ) return 'gray';

  // LINEAGE & TRADITION
  if (slug === 'santo-daime') return 'purple';
  if (slug === 'traditional') return 'pink';
  if (slug === 'lakota') return 'orange';
  if (slug === 'sacred-pipe') return 'sky';
  if (slug === 'temazcal') return 'teal';
  if (slug === 'umbanda') return 'blue';

  // MEDICINE & HEALING
  if (slug === 'icaros') return 'teal';
  if (slug === 'healing-limpieza') return 'emerald';
  if (slug === 'protection') return 'indigo';
  if (slug === 'opening-closing') return 'yellow';
  if (slug === 'ayahuasca') return 'lime';
  if (slug === 'peyote') return 'amber';
  if (slug === 'rape') return 'sky';
  if (slug === 'san-pedro') return 'orange';
  if (slug === 'santa-maria') return 'purple';
  if (slug === 'tobacco') return 'pink';

  // SPIRITUAL CONCEPTS
  if (slug === 'gratitude') return 'yellow';
  if (slug === 'love-heart') return 'pink';
  if (slug === 'plegarias') return 'purple';
  if (slug === 'vocalization') return 'sky';
  if (slug === 'women') return 'emerald';

  // Fallback heuristics for any new/unexpected tags
  if (slug.includes('water') || slug.includes('blue')) return 'blue';
  if (slug.includes('fire') || slug.includes('red')) return 'red';
  if (slug.includes('earth') || slug.includes('amber')) return 'amber';
  if (slug.includes('air') || slug.includes('slate')) return 'sky';
  if (slug.includes('nature') || slug.includes('green') || slug.includes('plant') || slug.includes('selva')) return 'emerald';
  if (slug.includes('sun') || slug.includes('yellow')) return 'yellow';
  return 'gray';
};

export const getCategoryStyles = (color: string) => {
  const styles: Record<string, { active: string, inactive: string, pill: string }> = {
    blue: {
      active: 'bg-blue-600 text-white border-blue-500',
      inactive: 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20 hover:bg-blue-200 dark:hover:bg-blue-500/20',
      pill: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/30'
    },
    red: {
      active: 'bg-red-600 text-white border-red-500',
      inactive: 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-500 border-red-200 dark:border-red-500/20 hover:bg-red-200 dark:hover:bg-red-500/20',
      pill: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-500 border border-red-200 dark:border-red-900/30'
    },
    amber: {
      active: 'bg-amber-600 text-white border-amber-500',
      inactive: 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-500 border-amber-200 dark:border-amber-500/20 hover:bg-amber-200 dark:hover:bg-amber-500/20',
      pill: 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-500 border border-amber-200 dark:border-amber-900/30'
    },
    sky: {
      active: 'bg-sky-600 text-white border-sky-500',
      inactive: 'bg-sky-100 dark:bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-500/20 hover:bg-sky-200 dark:hover:bg-sky-500/20',
      pill: 'bg-sky-100 dark:bg-sky-900/20 text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-900/30'
    },
    emerald: {
      active: 'bg-emerald-600 text-white border-emerald-500',
      inactive: 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20 hover:bg-emerald-200 dark:hover:bg-emerald-500/20',
      pill: 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30'
    },
    yellow: {
      active: 'bg-yellow-600 text-white border-yellow-500',
      inactive: 'bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-500 border-yellow-200 dark:border-yellow-500/20 hover:bg-yellow-200 dark:hover:bg-yellow-500/20',
      pill: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-500 border border-yellow-200 dark:border-yellow-900/30'
    },
    indigo: {
      active: 'bg-indigo-600 text-white border-indigo-500',
      inactive: 'bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20 hover:bg-indigo-200 dark:hover:bg-indigo-500/20',
      pill: 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/30'
    },
    teal: {
      active: 'bg-teal-600 text-white border-teal-500',
      inactive: 'bg-teal-100 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-500/20 hover:bg-teal-200 dark:hover:bg-teal-500/20',
      pill: 'bg-teal-100 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-900/30'
    },
    purple: {
      active: 'bg-purple-600 text-white border-purple-500',
      inactive: 'bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-500/20 hover:bg-purple-200 dark:hover:bg-purple-500/20',
      pill: 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-900/30'
    },
    orange: {
      active: 'bg-orange-600 text-white border-orange-500',
      inactive: 'bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-500 border-orange-200 dark:border-orange-500/20 hover:bg-orange-200 dark:hover:bg-orange-500/20',
      pill: 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-500 border border-orange-200 dark:border-orange-900/30'
    },
    lime: {
      active: 'bg-lime-600 text-white border-lime-500',
      inactive: 'bg-lime-100 dark:bg-lime-500/10 text-lime-700 dark:text-lime-400 border-lime-200 dark:border-lime-500/20 hover:bg-lime-200 dark:hover:bg-lime-500/20',
      pill: 'bg-lime-100 dark:bg-lime-900/20 text-lime-700 dark:text-lime-400 border border-lime-200 dark:border-lime-900/30'
    },
    pink: {
      active: 'bg-pink-600 text-white border-pink-500',
      inactive: 'bg-pink-100 dark:bg-pink-500/10 text-pink-700 dark:text-pink-400 border-pink-200 dark:border-pink-500/20 hover:bg-pink-200 dark:hover:bg-pink-500/20',
      pill: 'bg-pink-100 dark:bg-pink-900/20 text-pink-700 dark:text-pink-400 border border-pink-200 dark:border-pink-900/30'
    },
    gray: {
      active: 'bg-gray-600 text-white border-gray-500',
      inactive: 'bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700',
      pill: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
    },
  };
  return styles[color] || styles.gray;
}
