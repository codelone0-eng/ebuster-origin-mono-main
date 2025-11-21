import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import {
  Play,
  Save,
  Download,
  Upload,
  Trash2,
  Plus,
  MousePointer,
  Type,
  Navigation,
  Clock,
  Database,
  Code,
  AlertCircle,
  CheckCircle,
  Copy,
  Settings
} from 'lucide-react';

// Типы блоков
type BlockType = 'click' | 'input' | 'navigate' | 'wait' | 'extract' | 'code' | 'condition';

interface ScriptBlock {
  id: string;
  type: BlockType;
  label: string;
  params: Record<string, any>;
  position: { x: number; y: number };
}

interface ScriptProject {
  id: string;
  name: string;
  description: string;
  blocks: ScriptBlock[];
  createdAt: string;
  updatedAt: string;
}

// Определение доступных блоков
const BLOCK_TYPES = [
  {
    type: 'click' as BlockType,
    label: 'Клик по элементу',
    icon: <MousePointer className="h-4 w-4" />,
    color: 'bg-blue-500',
    params: { selector: '', description: '' },
    generateCode: (params: any) => `await page.click('${params.selector}');`
  },
  {
    type: 'input' as BlockType,
    label: 'Ввод текста',
    icon: <Type className="h-4 w-4" />,
    color: 'bg-green-500',
    params: { selector: '', text: '', description: '' },
    generateCode: (params: any) => `await page.fill('${params.selector}', '${params.text}');`
  },
  {
    type: 'navigate' as BlockType,
    label: 'Перейти по URL',
    icon: <Navigation className="h-4 w-4" />,
    color: 'bg-purple-500',
    params: { url: '', description: '' },
    generateCode: (params: any) => `await page.goto('${params.url}');`
  },
  {
    type: 'wait' as BlockType,
    label: 'Ожидание элемента',
    icon: <Clock className="h-4 w-4" />,
    color: 'bg-yellow-500',
    params: { selector: '', timeout: 5000, description: '' },
    generateCode: (params: any) => `await page.waitForSelector('${params.selector}', { timeout: ${params.timeout} });`
  },
  {
    type: 'extract' as BlockType,
    label: 'Извлечь данные',
    icon: <Database className="h-4 w-4" />,
    color: 'bg-orange-500',
    params: { selector: '', attribute: 'textContent', variable: '', description: '' },
    generateCode: (params: any) => `const ${params.variable} = await page.$eval('${params.selector}', el => el.${params.attribute});`
  },
  {
    type: 'code' as BlockType,
    label: 'Произвольный код',
    icon: <Code className="h-4 w-4" />,
    color: 'bg-gray-500',
    params: { code: '', description: '' },
    generateCode: (params: any) => params.code
  }
];

// Генерация полного кода скрипта
const generateFullScript = (blocks: ScriptBlock[], projectName: string): string => {
  const header = `/**
 * ${projectName}
 * Автоматически сгенерировано визуальным конструктором
 * Дата: ${new Date().toLocaleString('ru-RU')}
 */

async function ${projectName.replace(/[^a-zA-Z0-9]/g, '_')}(page) {
  try {`;
  
  const body = blocks
    .sort((a, b) => a.position.y - b.position.y)
    .map(block => {
      const blockDef = BLOCK_TYPES.find(b => b.type === block.type);
      if (!blockDef) return '';
      const code = blockDef.generateCode(block.params);
      const comment = block.params.description ? `    // ${block.params.description}` : '';
      return `${comment}\n    ${code}`;
    })
    .join('\n\n');
  
  const footer = `\n  } catch (error) {
    console.error('Ошибка выполнения скрипта:', error);
    throw error;
  }
}

export default ${projectName.replace(/[^a-zA-Z0-9]/g, '_')};`;
  
  return header + '\n' + body + footer;
};





export const VisualScriptBuilder: React.FC = () => {
  const { toast } = useToast();
  const [projectName, setProjectName] = useState('Мой скрипт');
  const [projectDescription, setProjectDescription] = useState('');
  const [blocks, setBlocks] = useState<ScriptBlock[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<ScriptBlock | null>(null);
  const [generatedCode, setGeneratedCode] = useState('');

  // Добавление нового блока
  const addBlock = useCallback((type: BlockType) => {
    const blockDef = BLOCK_TYPES.find(b => b.type === type);
    if (!blockDef) return;

    const newBlock: ScriptBlock = {
      id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      label: blockDef.label,
      params: { ...blockDef.params },
      position: { x: 0, y: blocks.length * 100 }
    };

    setBlocks(prev => [...prev, newBlock]);
    setSelectedBlock(newBlock);
    toast({
      title: 'Блок добавлен',
      description: `${blockDef.label} добавлен в сценарий`,
    });
  }, [blocks.length, toast]);

  // Удаление блока
  const deleteBlock = useCallback((id: string) => {
    setBlocks(prev => prev.filter(b => b.id !== id));
    if (selectedBlock?.id === id) {
      setSelectedBlock(null);
    }
    toast({
      title: 'Блок удалён',
      variant: 'default',
    });
  }, [selectedBlock, toast]);

  // Обновление параметров блока
  const updateBlockParams = useCallback((id: string, params: Record<string, any>) => {
    setBlocks(prev => prev.map(b => 
      b.id === id ? { ...b, params: { ...b.params, ...params } } : b
    ));
  }, []);

  // Генерация кода
  const handleGenerateCode = useCallback(() => {
    const code = generateFullScript(blocks, projectName);
    setGeneratedCode(code);
    toast({
      title: 'Код сгенерирован',
      description: `${blocks.length} блоков преобразовано в код`,
    });
  }, [blocks, projectName, toast]);

  // Сохранение проекта
  const handleSaveProject = useCallback(() => {
    const project: ScriptProject = {
      id: `project_${Date.now()}`,
      name: projectName,
      description: projectDescription,
      blocks,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem(`visual_script_${project.id}`, JSON.stringify(project));
    toast({
      title: 'Проект сохранён',
      description: `"${projectName}" сохранён локально`,
    });
  }, [projectName, projectDescription, blocks, toast]);

  // Экспорт кода
  const handleExportCode = useCallback(() => {
    if (!generatedCode) {
      handleGenerateCode();
      return;
    }

    const blob = new Blob([generatedCode], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName.replace(/[^a-zA-Z0-9]/g, '_')}.js`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Код экспортирован',
      description: 'Файл скачан',
    });
  }, [generatedCode, projectName, handleGenerateCode, toast]);

  // Копирование кода
  const handleCopyCode = useCallback(() => {
    if (!generatedCode) return;
    
    navigator.clipboard.writeText(generatedCode);
    toast({
      title: 'Код скопирован',
      description: 'Код скопирован в буфер обмена',
    });
  }, [generatedCode, toast]);

  return (
    <div className="space-y-6">
      {/* Заголовок и действия */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-2 flex-1">
              <Input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="text-2xl font-bold border-none p-0 h-auto focus-visible:ring-0"
                placeholder="Название проекта"
              />
              <Input
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                className="text-sm text-muted-foreground border-none p-0 h-auto focus-visible:ring-0"
                placeholder="Описание (необязательно)"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleSaveProject}>
                <Save className="h-4 w-4 mr-2" />
                Сохранить
              </Button>
              <Button variant="outline" size="sm" onClick={handleGenerateCode}>
                <Code className="h-4 w-4 mr-2" />
                Генерировать
              </Button>
              <Button size="sm" onClick={handleExportCode}>
                <Download className="h-4 w-4 mr-2" />
                Экспорт
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid lg:grid-cols-[300px,1fr,350px] gap-6">
        {/* Панель блоков */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Блоки</CardTitle>
            <CardDescription>Перетащите блок в рабочую область</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <ScrollArea className="h-[600px]">
              {BLOCK_TYPES.map((blockType) => (
                <Button
                  key={blockType.type}
                  variant="outline"
                  className="w-full justify-start mb-2"
                  onClick={() => addBlock(blockType.type)}
                >
                  <div className={`w-8 h-8 rounded flex items-center justify-center mr-3 ${blockType.color} text-white`}>
                    {blockType.icon}
                  </div>
                  <span className="text-sm">{blockType.label}</span>
                </Button>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Рабочая область */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Рабочая область</CardTitle>
            <CardDescription>{blocks.length} блоков в сценарии</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              {blocks.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Пустой сценарий</h3>
                  <p className="text-sm text-muted-foreground">
                    Добавьте блоки из левой панели, чтобы начать создание скрипта
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {blocks.map((block, index) => {
                    const blockDef = BLOCK_TYPES.find(b => b.type === block.type);
                    if (!blockDef) return null;

                    return (
                      <Card
                        key={block.id}
                        className={`cursor-pointer transition-all ${
                          selectedBlock?.id === block.id
                            ? 'ring-2 ring-primary'
                            : 'hover:shadow-md'
                        }`}
                        onClick={() => setSelectedBlock(block)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <Badge variant="secondary" className="shrink-0">
                              {index + 1}
                            </Badge>
                            <div className={`w-10 h-10 rounded flex items-center justify-center ${blockDef.color} text-white shrink-0`}>
                              {blockDef.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-sm">{blockDef.label}</h4>
                              <p className="text-xs text-muted-foreground truncate">
                                {block.params.description || block.params.selector || block.params.url || 'Настройте параметры'}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteBlock(block.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Панель свойств */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Свойства</CardTitle>
            <CardDescription>
              {selectedBlock ? 'Настройте параметры блока' : 'Выберите блок'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              {selectedBlock ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Описание</label>
                    <Textarea
                      value={selectedBlock.params.description || ''}
                      onChange={(e) => updateBlockParams(selectedBlock.id, { description: e.target.value })}
                      placeholder="Опишите, что делает этот блок"
                      rows={2}
                    />
                  </div>

                  {selectedBlock.type === 'click' && (
                    <div>
                      <label className="text-sm font-medium mb-2 block">CSS Селектор</label>
                      <Input
                        value={selectedBlock.params.selector || ''}
                        onChange={(e) => updateBlockParams(selectedBlock.id, { selector: e.target.value })}
                        placeholder="button.submit, #login, .btn-primary"
                      />
                    </div>
                  )}

                  {selectedBlock.type === 'input' && (
                    <>
                      <div>
                        <label className="text-sm font-medium mb-2 block">CSS Селектор</label>
                        <Input
                          value={selectedBlock.params.selector || ''}
                          onChange={(e) => updateBlockParams(selectedBlock.id, { selector: e.target.value })}
                          placeholder="input[name='email']"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Текст для ввода</label>
                        <Input
                          value={selectedBlock.params.text || ''}
                          onChange={(e) => updateBlockParams(selectedBlock.id, { text: e.target.value })}
                          placeholder="test@example.com"
                        />
                      </div>
                    </>
                  )}

                  {selectedBlock.type === 'navigate' && (
                    <div>
                      <label className="text-sm font-medium mb-2 block">URL</label>
                      <Input
                        value={selectedBlock.params.url || ''}
                        onChange={(e) => updateBlockParams(selectedBlock.id, { url: e.target.value })}
                        placeholder="https://example.com"
                      />
                    </div>
                  )}

                  {selectedBlock.type === 'wait' && (
                    <>
                      <div>
                        <label className="text-sm font-medium mb-2 block">CSS Селектор</label>
                        <Input
                          value={selectedBlock.params.selector || ''}
                          onChange={(e) => updateBlockParams(selectedBlock.id, { selector: e.target.value })}
                          placeholder=".loading-complete"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Таймаут (мс)</label>
                        <Input
                          type="number"
                          value={selectedBlock.params.timeout || 5000}
                          onChange={(e) => updateBlockParams(selectedBlock.id, { timeout: parseInt(e.target.value) })}
                        />
                      </div>
                    </>
                  )}

                  {selectedBlock.type === 'extract' && (
                    <>
                      <div>
                        <label className="text-sm font-medium mb-2 block">CSS Селектор</label>
                        <Input
                          value={selectedBlock.params.selector || ''}
                          onChange={(e) => updateBlockParams(selectedBlock.id, { selector: e.target.value })}
                          placeholder=".price, h1.title"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Атрибут</label>
                        <Input
                          value={selectedBlock.params.attribute || 'textContent'}
                          onChange={(e) => updateBlockParams(selectedBlock.id, { attribute: e.target.value })}
                          placeholder="textContent, href, src"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Имя переменной</label>
                        <Input
                          value={selectedBlock.params.variable || ''}
                          onChange={(e) => updateBlockParams(selectedBlock.id, { variable: e.target.value })}
                          placeholder="price, title, imageUrl"
                        />
                      </div>
                    </>
                  )}

                  {selectedBlock.type === 'code' && (
                    <div>
                      <label className="text-sm font-medium mb-2 block">JavaScript код</label>
                      <Textarea
                        value={selectedBlock.params.code || ''}
                        onChange={(e) => updateBlockParams(selectedBlock.id, { code: e.target.value })}
                        placeholder="await page.evaluate(() => { ... })"
                        rows={8}
                        className="font-mono text-xs"
                      />
                    </div>
                  )}

                  <div className="pt-4 border-t">
                    <h4 className="text-sm font-semibold mb-2">Предпросмотр кода:</h4>
                    <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                      <code>
                        {BLOCK_TYPES.find(b => b.type === selectedBlock.type)?.generateCode(selectedBlock.params)}
                      </code>
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <Settings className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground">
                    Выберите блок для настройки параметров
                  </p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Вкладка с кодом */}
      {generatedCode && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Сгенерированный код</CardTitle>
                <CardDescription>Готовый JavaScript для выполнения</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCopyCode}>
                  <Copy className="h-4 w-4 mr-2" />
                  Копировать
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportCode}>
                  <Download className="h-4 w-4 mr-2" />
                  Скачать
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <pre className="text-xs bg-muted p-4 rounded font-mono">
                <code>{generatedCode}</code>
              </pre>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VisualScriptBuilder;
