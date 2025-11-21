import React, { useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Copy,
  Download,
  Maximize2,
  Minimize2,
  RotateCcw,
  Save,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  readOnly?: boolean;
  height?: string | number;
  className?: string;
  showLineNumbers?: boolean;
  showMinimap?: boolean;
  onSave?: () => void;
  onFormat?: () => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  language = 'javascript',
  readOnly = false,
  height = '500px',
  className,
  showLineNumbers = true,
  showMinimap = false,
  onSave,
  onFormat
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [selectedLang, setSelectedLang] = React.useState(language);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
  };

  const handleDownload = () => {
    const blob = new Blob([value], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `script.${selectedLang === 'javascript' ? 'js' : 'txt'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      onSave?.();
    }
    
    // Tab support
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      onChange(newValue);
      
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      }, 0);
    }
  };

  const lines = value.split('\n');
  const lineCount = lines.length;

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
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono text-xs">
            {selectedLang}
          </Badge>
          <Select value={selectedLang} onValueChange={setSelectedLang}>
            <SelectTrigger className="h-7 w-32 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="javascript">JavaScript</SelectItem>
              <SelectItem value="typescript">TypeScript</SelectItem>
              <SelectItem value="python">Python</SelectItem>
              <SelectItem value="html">HTML</SelectItem>
              <SelectItem value="css">CSS</SelectItem>
              <SelectItem value="json">JSON</SelectItem>
              <SelectItem value="markdown">Markdown</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground">
            {lineCount} {lineCount === 1 ? 'строка' : 'строк'} · {value.length} символов
          </span>
        </div>

        <div className="flex items-center gap-1">
          {onFormat && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onFormat}
              className="h-7 px-2"
            >
              <Sparkles className="mr-1 h-3 w-3" />
              Форматировать
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-7 px-2"
          >
            <Copy className="mr-1 h-3 w-3" />
            Копировать
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            className="h-7 px-2"
          >
            <Download className="mr-1 h-3 w-3" />
            Скачать
          </Button>
          {onSave && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onSave}
              className="h-7 px-2"
            >
              <Save className="mr-1 h-3 w-3" />
              Сохранить
            </Button>
          )}
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

      {/* Editor Area */}
      <div
        className="relative overflow-auto bg-background"
        style={{ height: isFullscreen ? 'calc(100vh - 48px)' : height }}
      >
        <div className="flex">
          {/* Line Numbers */}
          {showLineNumbers && (
            <div className="select-none border-r bg-muted/20 px-3 py-4 text-right font-mono text-xs text-muted-foreground">
              {lines.map((_, index) => (
                <div key={index} className="leading-6">
                  {index + 1}
                </div>
              ))}
            </div>
          )}

          {/* Code Area */}
          <div className="relative flex-1">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              readOnly={readOnly}
              spellCheck={false}
              className={cn(
                'w-full resize-none bg-transparent px-4 py-4 font-mono text-sm leading-6 outline-none',
                readOnly && 'cursor-default'
              )}
              style={{
                minHeight: isFullscreen ? 'calc(100vh - 48px)' : height,
                tabSize: 2
              }}
              placeholder="// Начните писать код..."
            />
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between border-t bg-muted/30 px-4 py-1 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>UTF-8</span>
          <span>LF</span>
          {readOnly && <Badge variant="secondary">Только чтение</Badge>}
        </div>
        <div className="flex items-center gap-4">
          <span>Ctrl+S для сохранения</span>
          <span>Tab для отступа</span>
        </div>
      </div>
    </Card>
  );
};

export default CodeEditor;
