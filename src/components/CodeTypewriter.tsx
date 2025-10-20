import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage';

export const CodeTypewriter = () => {
  const { t } = useLanguage();
  
  const codeSnippets = [
    {
      title: "ebuster.js",
      lines: [
        "const ebuster = new Extension({",
        "  theme: 'graphite',",
        "  performance: 'blazing-fast',",
        "  security: 'enterprise-grade'",
        "});",
        "",
        "ebuster.initialize();"
      ]
    },
    {
      title: "config.ts",
      lines: [
        "interface Config {",
        "  theme: 'graphite' | 'monochrome';",
        "  performance: 'optimized';",
        "  security: 'enterprise';",
        "}",
        "",
        "const config: Config = {",
        "  theme: 'graphite',",
        "  performance: 'optimized',",
        "  security: 'enterprise'",
        "};"
      ]
    },
    {
      title: "main.ts",
      lines: [
        "import { Ebuster } from './core';",
        "",
        "const app = new Ebuster({",
        "  extensions: ['chrome'],",
        "  plugins: ['security', 'performance'],",
        "  theme: 'graphite'",
        "});",
        "",
        "app.start();"
      ]
    }
  ];

  const [currentSnippetIndex, setCurrentSnippetIndex] = useState(0);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const currentSnippet = codeSnippets[currentSnippetIndex];
      const currentLine = currentSnippet.lines[currentLineIndex];
      
      if (isPaused) {
        setIsPaused(false);
        if (currentLineIndex < currentSnippet.lines.length - 1) {
          setCurrentLineIndex(prev => prev + 1);
          setCurrentText('');
        } else {
          setIsDeleting(true);
        }
        return;
      }

      if (isDeleting) {
        if (currentText.length > 0) {
          setCurrentText(currentText.slice(0, -1));
        } else {
          setIsDeleting(false);
          if (currentSnippetIndex < codeSnippets.length - 1) {
            setCurrentSnippetIndex(prev => prev + 1);
            setCurrentLineIndex(0);
          } else {
            setCurrentSnippetIndex(0);
            setCurrentLineIndex(0);
          }
        }
      } else {
        if (currentText.length < currentLine.length) {
          setCurrentText(currentLine.slice(0, currentText.length + 1));
        } else {
          setIsPaused(true);
        }
      }
    }, isPaused ? 1000 : isDeleting ? 50 : 80);

    return () => clearTimeout(timeout);
  }, [currentText, currentSnippetIndex, currentLineIndex, isDeleting, isPaused]);

  const getSyntaxColor = (text: string) => {
    if (text.includes('const') || text.includes('interface') || text.includes('import')) {
      return 'text-blue-400';
    }
    if (text.includes('new') || text.includes('Extension') || text.includes('Ebuster')) {
      return 'text-green-400';
    }
    if (text.includes("'") || text.includes('"')) {
      return 'text-yellow-400';
    }
    if (text.includes('{') || text.includes('}') || text.includes('(') || text.includes(')')) {
      return 'text-purple-400';
    }
    return 'text-gray-300';
  };

  return (
    <div className="relative">
      {/* Code Animation */}
      <div className="bg-black/90 backdrop-blur-sm border border-border/30 rounded-lg p-6 mb-8 max-w-4xl mx-auto transition-all duration-500 hover:bg-black/95 hover:border-border/50 group font-mono">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <span className="text-sm text-gray-400 ml-2 transition-all duration-300 group-hover:text-gray-300">
            {codeSnippets[currentSnippetIndex].title}
          </span>
        </div>
        
        <div className="text-sm relative">
          <div className="flex items-center min-h-[1.5rem]">
            <span className="text-gray-600 mr-4 w-8 text-right">
              {currentLineIndex + 1}
            </span>
            <span className={`${getSyntaxColor(currentText)} transition-colors duration-200`}>
              {currentText}
              <span className="inline-block w-0.5 h-5 bg-gradient-to-b from-primary to-accent animate-pulse ml-1"></span>
            </span>
          </div>
          {/* Terminal glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg pointer-events-none"></div>
        </div>
      </div>

      {/* Description - Static Text */}
      <div className="text-center">
        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
          {t('index.hero.description')}
        </p>
      </div>
    </div>
  );
};
