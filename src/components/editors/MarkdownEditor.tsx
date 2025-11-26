import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Bold,
  Italic,
  Link,
  List,
  ListOrdered,
  Code,
  Quote,
  Heading1,
  Heading2,
  Image,
  Eye,
  FileText,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { sanitizeHTML } from '@/utils/sanitize';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  height?: string | number;
  className?: string;
  placeholder?: string;
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  height = '500px',
  className,
  placeholder = '# Начните писать документацию...'
}) => {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview' | 'split'>('split');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const insertMarkdown = (before: string, after: string = '') => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
    
    onChange(newText);
    
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start + before.length;
      textarea.selectionEnd = start + before.length + selectedText.length;
    }, 0);
  };

  const renderMarkdown = (text: string): string => {
    let html = text;

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mt-6 mb-3">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>');

    // Bold
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong class="font-semibold">$1</strong>');

    // Italic
    html = html.replace(/\*(.*?)\*/gim, '<em class="italic">$1</em>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" class="text-primary underline">$1</a>');

    // Code blocks
    html = html.replace(/```([^`]+)```/gim, '<pre class="bg-muted p-3 rounded-md my-2 overflow-x-auto"><code class="text-sm">$1</code></pre>');

    // Inline code
    html = html.replace(/`([^`]+)`/gim, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm">$1</code>');

    // Lists
    html = html.replace(/^\* (.*$)/gim, '<li class="ml-4">$1</li>');
    html = html.replace(/^- (.*$)/gim, '<li class="ml-4">$1</li>');
    html = html.replace(/^\d+\. (.*$)/gim, '<li class="ml-4 list-decimal">$1</li>');

    // Blockquotes
    html = html.replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-primary pl-4 italic my-2">$1</blockquote>');

    // Line breaks
    html = html.replace(/\n/gim, '<br />');

    // Санитизация для защиты от XSS
    return sanitizeHTML(html);
  };

  const toolbarButtons = [
    { icon: Heading1, action: () => insertMarkdown('# '), label: 'Заголовок 1' },
    { icon: Heading2, action: () => insertMarkdown('## '), label: 'Заголовок 2' },
    { icon: Bold, action: () => insertMarkdown('**', '**'), label: 'Жирный' },
    { icon: Italic, action: () => insertMarkdown('*', '*'), label: 'Курсив' },
    { icon: Code, action: () => insertMarkdown('`', '`'), label: 'Код' },
    { icon: Link, action: () => insertMarkdown('[', '](url)'), label: 'Ссылка' },
    { icon: Image, action: () => insertMarkdown('![alt](', ')'), label: 'Изображение' },
    { icon: List, action: () => insertMarkdown('- '), label: 'Список' },
    { icon: ListOrdered, action: () => insertMarkdown('1. '), label: 'Нумерованный список' },
    { icon: Quote, action: () => insertMarkdown('> '), label: 'Цитата' }
  ];

  return (
    <Card
      className={cn(
        'relative overflow-hidden',
        isFullscreen && 'fixed inset-0 z-50 rounded-none',
        className
      )}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-2">
        <div className="flex items-center gap-1">
          {toolbarButtons.map((btn, index) => (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              onClick={btn.action}
              className="h-8 w-8 p-0"
              title={btn.label}
            >
              <btn.icon className="h-4 w-4" />
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList className="h-8">
              <TabsTrigger value="edit" className="h-7 text-xs">
                <FileText className="mr-1 h-3 w-3" />
                Редактор
              </TabsTrigger>
              <TabsTrigger value="split" className="h-7 text-xs">
                Разделение
              </TabsTrigger>
              <TabsTrigger value="preview" className="h-7 text-xs">
                <Eye className="mr-1 h-3 w-3" />
                Превью
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="h-7 px-2"
          >
            {isFullscreen ? (
              <Minimize2 className="h-3 w-3" />
            ) : (
              <Maximize2 className="h-3 w-3" />
            )}
          </Button>
        </div>
      </div>

      {/* Editor/Preview Area */}
      <div
        className="overflow-auto"
        style={{ height: isFullscreen ? 'calc(100vh - 48px)' : height }}
      >
        {activeTab === 'edit' && (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="h-full w-full resize-none bg-background p-4 font-mono text-sm leading-relaxed outline-none"
            spellCheck={false}
          />
        )}

        {activeTab === 'preview' && (
          <div
            className="prose prose-sm max-w-none p-4 dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(value) }}
          />
        )}

        {activeTab === 'split' && (
          <div className="grid h-full grid-cols-2 divide-x">
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="h-full w-full resize-none bg-background p-4 font-mono text-sm leading-relaxed outline-none"
              spellCheck={false}
            />
            <div
              className="prose prose-sm max-w-none overflow-auto p-4 dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(value) }}
            />
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between border-t bg-muted/30 px-4 py-1 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>Markdown</span>
          <Badge variant="secondary" className="text-xs">
            {value.split('\n').length} строк
          </Badge>
          <span>{value.length} символов</span>
        </div>
        <div>
          <span>Используйте панель инструментов для форматирования</span>
        </div>
      </div>
    </Card>
  );
};

export default MarkdownEditor;
