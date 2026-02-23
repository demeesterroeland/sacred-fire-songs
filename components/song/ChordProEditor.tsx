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
        {/* Backdrop Layer (Highlights) — must have same overflow/scrollbar mode as the
            textarea so line wrapping is identical and cursor positions match after scroll */}
        <div
          ref={backdropRef}
          className="absolute inset-0 pointer-events-none p-4 whitespace-pre-wrap break-words font-mono text-sm leading-relaxed overflow-y-scroll overflow-x-hidden text-white"
          aria-hidden="true"
          style={{
            zIndex: 0,
            scrollbarWidth: 'none',   // Firefox: hide track visually
            msOverflowStyle: 'none',  // IE/Edge: hide track
          }}
        >
          {renderHighlights(value)}
          {/* Add a generic break to ensure last empty line visibility if needed */}
          <br />
        </div>

        {/* Input Layer (Textarea) */}
        <textarea
          ref={ref}
          className="relative z-10 block w-full h-full bg-transparent text-transparent caret-white p-4 font-mono text-sm leading-relaxed focus:outline-none resize-none overflow-y-scroll overflow-x-hidden selection:bg-blue-500/30 selection:text-transparent placeholder:text-[#a19eb7]/30"
          onScroll={handleScroll}
          onChange={onChange}
          value={value}
          spellCheck={false}
          {...props}
          style={{
            ...style,
            color: 'transparent',
          }}
        />
      </div>
    );
  }
);

ChordProEditor.displayName = 'ChordProEditor';
export default ChordProEditor;
