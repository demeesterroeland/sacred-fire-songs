export const getCategoryColor = (slug: string) => {
  // --- 1. Top-level Categories (Headers) ---
  if (slug === 'the-elements') return 'blue';
  if (slug === 'nature') return 'emerald';
  if (slug === 'languages') return 'purple';
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

  // LANGUAGES
  if (slug === 'spanish') return 'purple';
  if (slug === 'english') return 'blue';
  if (slug === 'portuguese') return 'emerald';
  if (slug === 'quechua-kichwa') return 'teal';
  if (slug === 'nahuatl') return 'red';
  if (slug === 'huni-kuin') return 'orange';
  if (slug === 'german') return 'amber';
  if (slug === 'belarusian') return 'yellow';
  if (slug === 'croatian') return 'pink';
  if (slug === 'italian') return 'sky';
  if (slug === 'lithuanian') return 'lime';
  if (slug === 'russian') return 'indigo';

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
      inactive: 'bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20',
      pill: 'bg-blue-900/20 text-blue-400 border border-blue-900/30'
    },
    red: {
      active: 'bg-red-600 text-white border-red-500',
      inactive: 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20',
      pill: 'bg-red-900/20 text-red-500 border border-red-900/30'
    },
    amber: {
      active: 'bg-amber-600 text-white border-amber-500',
      inactive: 'bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20',
      pill: 'bg-amber-900/20 text-amber-500 border border-amber-900/30'
    },
    sky: {
      active: 'bg-sky-600 text-white border-sky-500',
      inactive: 'bg-sky-500/10 text-sky-400 border-sky-500/20 hover:bg-sky-500/20',
      pill: 'bg-sky-900/20 text-sky-400 border border-sky-900/30'
    },
    emerald: {
      active: 'bg-emerald-600 text-white border-emerald-500',
      inactive: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20',
      pill: 'bg-emerald-900/20 text-emerald-400 border border-emerald-900/30'
    },
    yellow: {
      active: 'bg-yellow-600 text-white border-yellow-500',
      inactive: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/20',
      pill: 'bg-yellow-900/20 text-yellow-500 border border-yellow-900/30'
    },
    indigo: {
      active: 'bg-indigo-600 text-white border-indigo-500',
      inactive: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/20',
      pill: 'bg-indigo-900/20 text-indigo-400 border border-indigo-900/30'
    },
    teal: {
      active: 'bg-teal-600 text-white border-teal-500',
      inactive: 'bg-teal-500/10 text-teal-400 border-teal-500/20 hover:bg-teal-500/20',
      pill: 'bg-teal-900/20 text-teal-400 border border-teal-900/30'
    },
    purple: {
      active: 'bg-purple-600 text-white border-purple-500',
      inactive: 'bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20',
      pill: 'bg-purple-900/20 text-purple-400 border border-purple-900/30'
    },
    orange: {
      active: 'bg-orange-600 text-white border-orange-500',
      inactive: 'bg-orange-500/10 text-orange-500 border-orange-500/20 hover:bg-orange-500/20',
      pill: 'bg-orange-900/20 text-orange-500 border border-orange-900/30'
    },
    lime: {
      active: 'bg-lime-600 text-white border-lime-500',
      inactive: 'bg-lime-500/10 text-lime-400 border-lime-500/20 hover:bg-lime-500/20',
      pill: 'bg-lime-900/20 text-lime-400 border border-lime-900/30'
    },
    pink: {
      active: 'bg-pink-600 text-white border-pink-500',
      inactive: 'bg-pink-500/10 text-pink-400 border-pink-500/20 hover:bg-pink-500/20',
      pill: 'bg-pink-900/20 text-pink-400 border border-pink-900/30'
    },
    gray: {
      active: 'bg-gray-600 text-white border-gray-500',
      inactive: 'bg-gray-300/50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-700 hover:bg-gray-300 dark:hover:bg-gray-700',
      pill: 'bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-700'
    },
  };
  return styles[color] || styles.gray;
}
