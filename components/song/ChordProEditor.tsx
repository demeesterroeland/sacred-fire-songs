import React, { forwardRef, useRef } from 'react';

interface ChordProEditorProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value?: string;
}

const ChordProEditor = forwardRef<HTMLTextAreaElement, ChordProEditorProps>(
  ({ className = '', style, value = '', onChange, ...props }, ref) => {
    const backdropRef = useRef<HTMLDivElement>(null);

    // Sync scroll from textarea to backdrop
    const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
      if (backdropRef.current) {
        backdropRef.current.scrollTop = e.currentTarget.scrollTop;
        backdropRef.current.scrollLeft = e.currentTarget.scrollLeft;
      }
    };

    const renderHighlights = (text: string) => {
      // Split by brackets to find chords [Am]
      // We use a regex that captures the delimiters to include them in the parts
      const parts = text.split(/(\[.*?\])/g);
      return parts.map((part, i) => {
        if (part.startsWith('[') && part.endsWith(']')) {
          // Highlight chords in primary color (Red)
          return <span key={i} className="text-primary font-bold">{part}</span>;
        }
        return part;
      });
    };

    return (
      <div className={`relative group ${className}`}>
        {/* Backdrop Layer (Highlights) — MUST match textarea's white-space and overflow
            exactly so line counts never diverge. white-space:pre ensures 1 source line
            = 1 rendered line on both layers, regardless of font sub-pixel differences. */}
        <div
          ref={backdropRef}
          className="absolute inset-0 pointer-events-none p-4 font-mono text-sm leading-relaxed text-white"
          aria-hidden="true"
          style={{
            zIndex: 0,
            whiteSpace: 'pre',      // no wrapping — mirrors textarea behaviour
            overflowX: 'auto',      // scroll to follow textarea horizontal scroll
            overflowY: 'scroll',    // always reserve scrollbar gutter (matches textarea)
            scrollbarWidth: 'none', // Firefox: hide scrollbar visually
            msOverflowStyle: 'none',
          }}
        >
          {renderHighlights(value)}
          <br />
        </div>

        {/* Input Layer (Textarea) */}
        <textarea
          ref={ref}
          className="relative z-10 block w-full h-full bg-transparent text-transparent caret-white p-4 font-mono text-sm leading-relaxed focus:outline-none resize-none selection:bg-blue-500/30 selection:text-transparent placeholder:text-[#a19eb7]/30"
          style={{
            ...style,
            color: 'transparent',
            whiteSpace: 'pre',   // disable textarea word-wrap
            overflowX: 'auto',
            overflowY: 'scroll', // always show scrollbar gutter
          }}
          onScroll={handleScroll}
          onChange={onChange}
          value={value}
          spellCheck={false}
          wrap="off"
          {...props}
        />
      </div>
    );
  }
);

ChordProEditor.displayName = 'ChordProEditor';
export default ChordProEditor;
