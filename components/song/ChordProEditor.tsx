import React, { forwardRef } from 'react';

interface ChordProEditorProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value?: string;
}

const ChordProEditor = forwardRef<HTMLTextAreaElement, ChordProEditorProps>(
  ({ className = '', style, value = '', onChange, ...props }, ref) => {

    const renderHighlights = (text: string) => {
      const parts = text.split(/(\[.*?\])/g);
      return parts.map((part, i) => {
        if (part.startsWith('[') && part.endsWith(']')) {
          return <span key={i} className="text-primary font-bold">{part}</span>;
        }
        return part;
      });
    };

    const sharedStyles: React.CSSProperties = {
      padding: '16px',
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
      fontSize: '14px',
      lineHeight: '24px',
      letterSpacing: 'normal',
      textRendering: 'optimizeSpeed',
      whiteSpace: 'pre',
      border: 'none',
      margin: '0',
      boxSizing: 'border-box',
      textAlign: 'left',
    };

    return (
      <div
        className={`relative group ${className}`}
        style={{ ...style, overflow: 'auto', WebkitOverflowScrolling: 'touch' }}
      >
        <div style={{ position: 'relative', minWidth: '100%', minHeight: '100%', width: 'max-content', display: 'flex' }}>
          {/* Backdrop Layer */}
          <div
            className="pointer-events-none text-gray-900 dark:text-white flex-1"
            aria-hidden="true"
            style={{
              ...sharedStyles,
              position: 'relative',
              zIndex: 0,
              minHeight: '100%',
            }}
          >
            {renderHighlights(value)}
            {/* Ensure a phantom newline matches textarea boundary at the bottom */}
            {value.endsWith('\n') ? '\n\u200B' : ''}
            {/* Ensure empty textarea has a physical height of 1 row */}
            {value === '' ? '\u200B' : ''}
          </div>

          {/* Input Layer */}
          <textarea
            ref={ref}
            className="absolute top-0 left-0 bg-transparent caret-gray-900 dark:caret-white focus:outline-none resize-none selection:bg-blue-500/30 selection:text-transparent placeholder:text-[#a19eb7]/30"
            style={{
              ...sharedStyles,
              zIndex: 1,
              color: 'transparent',
              WebkitTextFillColor: 'transparent',
              overflow: 'hidden',
              display: 'block',
              width: '100%',
              height: '100%',
              outline: 'none',
            }}
            onChange={onChange}
            value={value}
            spellCheck={false}
            wrap="off"
            {...props}
          />
        </div>
      </div>
    );
  }
);

ChordProEditor.displayName = 'ChordProEditor';
export default ChordProEditor;
