import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  height?: string | number;
  onSave?: () => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  language = 'javascript',
  height = '100%',
  onSave
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  // Sync scroll of line numbers with textarea
  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = textareaRef.current?.selectionStart || 0;
      const end = textareaRef.current?.selectionEnd || 0;
      
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      onChange(newValue);
      
      // Restore cursor position (async to wait for render)
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      onSave?.();
    }
  };

  const lineCount = value.split('\n').length;
  const lines = Array.from({ length: lineCount }, (_, i) => i + 1);

  return (
    <div className="relative flex h-full font-mono text-sm bg-[#111111] text-[#d4d4d4] overflow-hidden group">
      {/* Line Numbers */}
      <div 
        ref={lineNumbersRef}
        className="flex-none w-12 bg-[#1a1a1a] border-r border-[#2d2d2d] text-[#606060] text-right select-none overflow-hidden pt-4 pb-4"
      >
        {lines.map((line) => (
          <div key={line} className="px-3 leading-6 h-6 text-xs">
            {line}
          </div>
        ))}
      </div>

      {/* Editor Area */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={handleScroll}
        onKeyDown={handleKeyDown}
        className="flex-1 w-full h-full bg-transparent border-0 p-0 pl-4 pt-4 pb-4 resize-none focus:ring-0 focus:outline-none leading-6 text-sm font-mono text-[#e0e0e0] whitespace-pre"
        spellCheck={false}
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        style={{ 
          tabSize: 2,
          outline: 'none'
        }}
      />
      
      <div className="absolute top-2 right-4 px-2 py-1 rounded bg-[#2d2d2d]/50 text-[10px] text-neutral-500 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
        {language}
      </div>
    </div>
  );
};
