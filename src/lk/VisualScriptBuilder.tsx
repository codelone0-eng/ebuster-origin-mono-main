import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useDetailedPermissions } from '@/hooks/useDetailedPermissions';
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
  Settings,
  GitBranch,
  Repeat,
  Link,
  Cloud,
  Lock
} from 'lucide-react';

// Типы блоков
type BlockType = 'click' | 'input' | 'navigate' | 'wait' | 'extract' | 'code' | 'condition' | 'loop' | 'url-match';

interface ScriptBlock {
  id: string;
  type: BlockType;
  label: string;
  params: Record<string, any>;
  position: { x: number; y: number };
  children?: ScriptBlock[]; // Для вложенных блоков (условия, циклы)
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
  },
  {
    type: 'condition' as BlockType,
    label: 'Условие (if/else)',
    icon: <GitBranch className="h-4 w-4" />,
    color: 'bg-pink-500',
    params: { 
      conditionType: 'element-exists', // element-exists, element-visible, text-contains, url-contains
      selector: '', 
      value: '',
      description: '' 
    },
    generateCode: (params: any, children?: ScriptBlock[]) => {
      let condition = '';
      switch (params.conditionType) {
        case 'element-exists':
          condition = `await page.$('${params.selector}') !== null`;
          break;
        case 'element-visible':
          condition = `await page.isVisible('${params.selector}')`;
          break;
        case 'text-contains':
          condition = `(await page.textContent('${params.selector}')).includes('${params.value}')`;
          break;
        case 'url-contains':
          condition = `page.url().includes('${params.value}')`;
          break;
      }
      return `if (${condition}) {\n      // Действия при выполнении условия\n    }`;
    }
  },
  {
    type: 'loop' as BlockType,
    label: 'Цикл (повторение)',
    icon: <Repeat className="h-4 w-4" />,
    color: 'bg-indigo-500',
    params: { 
      loopType: 'count', // count, while-exists, for-each
      count: 5,
      selector: '',
      description: '' 
    },
    generateCode: (params: any) => {
      switch (params.loopType) {
        case 'count':
          return `for (let i = 0; i < ${params.count}; i++) {\n      // Повторяемые действия\n    }`;
        case 'while-exists':
          return `while (await page.$('${params.selector}') !== null) {\n      // Действия пока элемент существует\n    }`;
        case 'for-each':
          return `const elements = await page.$$('${params.selector}');\n    for (const element of elements) {\n      // Действия для каждого элемента\n    }`;
        default:
          return '';
      }
    }
  },
  {
    type: 'url-match' as BlockType,
    label: 'URL фильтр',
    icon: <Link className="h-4 w-4" />,
    color: 'bg-teal-500',
    params: { 
      matchType: 'contains', // contains, exact, regex, starts-with
      pattern: '',
      description: '' 
    },
    generateCode: (params: any) => {
      let condition = '';
      switch (params.matchType) {
        case 'contains':
          condition = `page.url().includes('${params.pattern}')`;
          break;
        case 'exact':
          condition = `page.url() === '${params.pattern}'`;
          break;
        case 'starts-with':
          condition = `page.url().startsWith('${params.pattern}')`;
          break;
        case 'regex':
          condition = `/${params.pattern}/.test(page.url())`;
          break;
      }
      return `// Выполнять только если: ${condition}\nif (${condition}) {\n      // Действия для этого URL\n    }`;
    }
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
  const permissions = useDetailedPermissions();
  const [projectName, setProjectName] = useState('Мой скрипт');
  const [projectDescription, setProjectDescription] = useState('');
  const [blocks, setBlocks] = useState<ScriptBlock[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<ScriptBlock | null>(null);
  const [generatedCode, setGeneratedCode] = useState('');

  // Проверка доступа
  if (!permissions.canAccessVisualBuilder()) {
    return (
      <div className="bg-[#1f1f1f] border border-[#2d2d2d] rounded-lg p-8 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-[#2d2d2d] flex items-center justify-center">
            <Lock className="h-6 w-6 text-[#808080]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Визуальный конструктор недоступен</h3>
            <p className="text-sm text-[#808080]">Требуется подписка Pro или выше</p>
          </div>
        </div>
        <div className="space-y-4">
          <p className="text-[#a3a3a3]">
            Визуальный конструктор скриптов доступен пользователям с подпиской Pro, Premium или выше.
          </p>
          <div className="bg-[#2d2d2d] rounded-lg p-4 space-y-2">
            <h4 className="font-semibold text-white">Что вы получите:</h4>
            <ul className="space-y-1 text-sm text-[#a3a3a3]">
              <li>✓ Создание скриптов без кода</li>
              <li>✓ Drag & Drop интерфейс</li>
              <li>✓ Автоматическая генерация кода</li>
              <li>✓ Сохранение в расширение</li>
              <li>✓ Экспорт готового кода</li>
            </ul>
          </div>
          <Button 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white" 
            onClick={() => window.location.href = '/pricing'}
          >
            Посмотреть тарифы
          </Button>
        </div>
      </div>
    );
  }

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

  // Сохранение напрямую в расширение
  const handleSaveToExtension = useCallback(async () => {
    if (!generatedCode) {
      handleGenerateCode();
      return;
    }

    try {
      const token = localStorage.getItem('ebuster_token');
      
      // Формируем данные скрипта в формате API
      const scriptData = {
        name: projectName,
        description: projectDescription || 'Создано в визуальном конструкторе',
        code: generatedCode,
        version: '1.0.0',
        category_id: 1, // Можно добавить выбор категории
        is_public: false,
        metadata: {
          visual_builder: true,
          blocks_count: blocks.length,
          created_with: 'visual-script-builder',
          blocks: blocks.map(b => ({
            type: b.type,
            label: b.label
          }))
        }
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/scripts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(scriptData)
      });

      if (!response.ok) {
        throw new Error('Ошибка сохранения скрипта');
      }

      const result = await response.json();

      toast({
        title: 'Скрипт сохранён в расширение',
        description: `"${projectName}" доступен в вашей библиотеке скриптов`,
      });

      // Опционально: перенаправить на страницу скриптов
      // window.location.href = '/dashboard?tab=scripts';

    } catch (error) {
      console.error('Ошибка сохранения в расширение:', error);
      toast({
        title: 'Ошибка сохранения',
        description: 'Не удалось сохранить скрипт в расширение',
        variant: 'destructive'
      });
    }
  }, [generatedCode, projectName, projectDescription, blocks, handleGenerateCode, toast]);

  return (
    <div className="space-y-6">
      {/* Заголовок и действия */}
      <div className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-lg p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="space-y-2 flex-1 min-w-0">
            <Input
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="text-2xl font-bold bg-transparent border-none p-0 h-auto focus-visible:ring-0 text-white placeholder:text-[#808080]"
              placeholder="Название проекта"
            />
            <Input
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              className="text-sm bg-transparent border-none p-0 h-auto focus-visible:ring-0 text-[#808080] placeholder:text-[#606060]"
              placeholder="Описание (необязательно)"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSaveProject}
              className="bg-[#2d2d2d] border-[#404040] text-white hover:bg-[#3d3d3d]"
            >
              <Save className="h-4 w-4 mr-2" />
              Сохранить
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleGenerateCode}
              className="bg-[#2d2d2d] border-[#404040] text-white hover:bg-[#3d3d3d]"
            >
              <Code className="h-4 w-4 mr-2" />
              Генерировать
            </Button>
            <Button 
              size="sm" 
              onClick={handleSaveToExtension} 
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={!permissions.canSaveToExtension()}
            >
              <Cloud className="h-4 w-4 mr-2" />
              В расширение
              {!permissions.canSaveToExtension() && <Lock className="h-3 w-3 ml-2" />}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleExportCode}
              className="bg-[#2d2d2d] border-[#404040] text-white hover:bg-[#3d3d3d]"
            >
              <Download className="h-4 w-4 mr-2" />
              Экспорт
            </Button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[300px,1fr,350px] gap-6">
        {/* Панель блоков */}
        <div className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-lg p-4">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-white mb-1">Библиотека блоков</h3>
            <p className="text-xs text-[#808080]">Нажмите на блок, чтобы добавить</p>
          </div>
          <ScrollArea className="h-[600px] pr-4">
              {/* Категория: Действия */}
              <div className="mb-6">
                <h3 className="text-xs font-semibold text-[#808080] uppercase tracking-wider mb-3">Действия</h3>
                <div className="space-y-2">
                  {BLOCK_TYPES.filter(b => ['click', 'input', 'navigate'].includes(b.type)).map((blockType) => (
                    <Button
                      key={blockType.type}
                      variant="outline"
                      className="w-full justify-start bg-[#1f1f1f] border-[#2d2d2d] text-white hover:bg-[#2d2d2d] transition-all"
                      onClick={() => addBlock(blockType.type)}
                    >
                      <div className={`w-8 h-8 rounded flex items-center justify-center mr-3 ${blockType.color} text-white shrink-0`}>
                        {blockType.icon}
                      </div>
                      <span className="text-sm truncate">{blockType.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Категория: Ожидание и проверки */}
              <div className="mb-6">
                <h3 className="text-xs font-semibold text-[#808080] uppercase tracking-wider mb-3">Ожидание</h3>
                <div className="space-y-2">
                  {BLOCK_TYPES.filter(b => ['wait', 'condition', 'url-match'].includes(b.type)).map((blockType) => {
                    const isAdvanced = ['condition', 'url-match'].includes(blockType.type);
                    const hasAccess = !isAdvanced || permissions.canUseAdvancedBlocks();
                    
                    return (
                      <Button
                        key={blockType.type}
                        variant="outline"
                        className="w-full justify-start bg-[#1f1f1f] border-[#2d2d2d] text-white hover:bg-[#2d2d2d] transition-all relative disabled:opacity-50"
                        onClick={() => hasAccess && addBlock(blockType.type)}
                        disabled={!hasAccess}
                      >
                        <div className={`w-8 h-8 rounded flex items-center justify-center mr-3 ${blockType.color} text-white shrink-0`}>
                          {blockType.icon}
                        </div>
                        <span className="text-sm truncate">{blockType.label}</span>
                        {!hasAccess && (
                          <Badge className="ml-auto bg-purple-500/10 text-purple-500 border-purple-500/20">
                            <Lock className="h-3 w-3 mr-1" />
                            Premium
                          </Badge>
                        )}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Категория: Данные и циклы */}
              <div className="mb-6">
                <h3 className="text-xs font-semibold text-[#808080] uppercase tracking-wider mb-3">Данные</h3>
                <div className="space-y-2">
                  {BLOCK_TYPES.filter(b => ['extract', 'loop', 'code'].includes(b.type)).map((blockType) => {
                    const isAdvanced = ['loop', 'code'].includes(blockType.type);
                    const hasAccess = !isAdvanced || permissions.canUseAdvancedBlocks();
                    
                    return (
                      <Button
                        key={blockType.type}
                        variant="outline"
                        className="w-full justify-start bg-[#1f1f1f] border-[#2d2d2d] text-white hover:bg-[#2d2d2d] transition-all disabled:opacity-50"
                        onClick={() => hasAccess && addBlock(blockType.type)}
                        disabled={!hasAccess}
                      >
                        <div className={`w-8 h-8 rounded flex items-center justify-center mr-3 ${blockType.color} text-white shrink-0`}>
                          {blockType.icon}
                        </div>
                        <span className="text-sm truncate">{blockType.label}</span>
                        {!hasAccess && (
                          <Badge className="ml-auto bg-purple-500/10 text-purple-500 border-purple-500/20">
                            <Lock className="h-3 w-3 mr-1" />
                            Premium
                          </Badge>
                        )}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Подсказка */}
              <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-xs text-[#a3a3a3]">
                  <strong className="text-white">Совет:</strong> Начните с блока "URL фильтр", чтобы указать, на каких страницах будет работать скрипт.
                </p>
              </div>
            </ScrollArea>
        </div>

        {/* Рабочая область */}
        <div className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-lg p-4">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-white mb-1">Рабочая область</h3>
            <p className="text-xs text-[#808080]">{blocks.length} блоков в сценарии</p>
          </div>
          <ScrollArea className="h-[600px]">
            {blocks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <AlertCircle className="h-12 w-12 text-[#808080] mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-white">Пустой сценарий</h3>
                <p className="text-sm text-[#808080]">
                  Добавьте блоки из левой панели, чтобы начать создание скрипта
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {blocks.map((block, index) => {
                  const blockDef = BLOCK_TYPES.find(b => b.type === block.type);
                  if (!blockDef) return null;

                  return (
                    <div
                      key={block.id}
                      className={`cursor-pointer transition-all bg-[#1f1f1f] border rounded-lg p-4 ${
                        selectedBlock?.id === block.id
                          ? 'ring-2 ring-blue-500 border-blue-500/50'
                          : 'border-[#2d2d2d] hover:border-[#404040]'
                      }`}
                      onClick={() => setSelectedBlock(block)}
                    >
                      <div className="flex items-center gap-3">
                        <Badge className="shrink-0 bg-[#2d2d2d] text-[#a3a3a3] border-[#404040]">
                          {index + 1}
                        </Badge>
                        <div className={`w-10 h-10 rounded flex items-center justify-center ${blockDef.color} text-white shrink-0`}>
                          {blockDef.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm text-white">{blockDef.label}</h4>
                          <p className="text-xs text-[#808080] truncate">
                            {block.params.description || block.params.selector || block.params.url || 'Настройте параметры'}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:bg-red-500/10 hover:text-red-500"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteBlock(block.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Панель свойств */}
        <div className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-lg p-4">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-white mb-1">Свойства</h3>
            <p className="text-xs text-[#808080]">
              {selectedBlock ? 'Настройте параметры блока' : 'Выберите блок'}
            </p>
          </div>
          <ScrollArea className="h-[600px]">
            {selectedBlock ? (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-[#808080] uppercase tracking-wide mb-2 block">Описание</label>
                  <Textarea
                    value={selectedBlock.params.description || ''}
                    onChange={(e) => updateBlockParams(selectedBlock.id, { description: e.target.value })}
                    placeholder="Опишите, что делает этот блок"
                    rows={2}
                    className="bg-[#111111] border-[#2d2d2d] text-white placeholder:text-[#606060]"
                  />
                </div>

                  {selectedBlock.type === 'click' && (
                    <div>
                      <label className="text-xs font-semibold text-[#808080] uppercase tracking-wide mb-2 block">CSS Селектор</label>
                      <Input
                        value={selectedBlock.params.selector || ''}
                        onChange={(e) => updateBlockParams(selectedBlock.id, { selector: e.target.value })}
                        placeholder="button.submit, #login, .btn-primary"
                        className="bg-[#111111] border-[#2d2d2d] text-white placeholder:text-[#606060]"
                      />
                    </div>
                  )}

                  {selectedBlock.type === 'input' && (
                    <>
                      <div>
                        <label className="text-xs font-semibold text-[#808080] uppercase tracking-wide mb-2 block">CSS Селектор</label>
                        <Input
                          value={selectedBlock.params.selector || ''}
                          onChange={(e) => updateBlockParams(selectedBlock.id, { selector: e.target.value })}
                          placeholder="input[name='email']"
                          className="bg-[#111111] border-[#2d2d2d] text-white placeholder:text-[#606060]"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-[#808080] uppercase tracking-wide mb-2 block">Текст для ввода</label>
                        <Input
                          value={selectedBlock.params.text || ''}
                          onChange={(e) => updateBlockParams(selectedBlock.id, { text: e.target.value })}
                          placeholder="test@example.com"
                          className="bg-[#111111] border-[#2d2d2d] text-white placeholder:text-[#606060]"
                        />
                      </div>
                    </>
                  )}

                  {selectedBlock.type === 'navigate' && (
                    <div>
                      <label className="text-xs font-semibold text-[#808080] uppercase tracking-wide mb-2 block">URL</label>
                      <Input
                        value={selectedBlock.params.url || ''}
                        onChange={(e) => updateBlockParams(selectedBlock.id, { url: e.target.value })}
                        placeholder="https://example.com"
                        className="bg-[#111111] border-[#2d2d2d] text-white placeholder:text-[#606060]"
                      />
                    </div>
                  )}

                  {selectedBlock.type === 'wait' && (
                    <>
                      <div>
                        <label className="text-xs font-semibold text-[#808080] uppercase tracking-wide mb-2 block">CSS Селектор</label>
                        <Input
                          value={selectedBlock.params.selector || ''}
                          onChange={(e) => updateBlockParams(selectedBlock.id, { selector: e.target.value })}
                          placeholder=".loading-complete"
                          className="bg-[#111111] border-[#2d2d2d] text-white placeholder:text-[#606060]"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-[#808080] uppercase tracking-wide mb-2 block">Таймаут (мс)</label>
                        <Input
                          type="number"
                          value={selectedBlock.params.timeout || 5000}
                          onChange={(e) => updateBlockParams(selectedBlock.id, { timeout: parseInt(e.target.value) })}
                          className="bg-[#111111] border-[#2d2d2d] text-white"
                        />
                      </div>
                    </>
                  )}

                  {selectedBlock.type === 'extract' && (
                    <>
                      <div>
                        <label className="text-xs font-semibold text-[#808080] uppercase tracking-wide mb-2 block">CSS Селектор</label>
                        <Input
                          value={selectedBlock.params.selector || ''}
                          onChange={(e) => updateBlockParams(selectedBlock.id, { selector: e.target.value })}
                          placeholder=".price, h1.title"
                          className="bg-[#111111] border-[#2d2d2d] text-white placeholder:text-[#606060]"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-[#808080] uppercase tracking-wide mb-2 block">Атрибут</label>
                        <Input
                          value={selectedBlock.params.attribute || 'textContent'}
                          onChange={(e) => updateBlockParams(selectedBlock.id, { attribute: e.target.value })}
                          placeholder="textContent, href, src"
                          className="bg-[#111111] border-[#2d2d2d] text-white placeholder:text-[#606060]"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-[#808080] uppercase tracking-wide mb-2 block">Имя переменной</label>
                        <Input
                          value={selectedBlock.params.variable || ''}
                          onChange={(e) => updateBlockParams(selectedBlock.id, { variable: e.target.value })}
                          placeholder="price, title, imageUrl"
                          className="bg-[#111111] border-[#2d2d2d] text-white placeholder:text-[#606060]"
                        />
                      </div>
                    </>
                  )}

                  {selectedBlock.type === 'code' && (
                    <div>
                      <label className="text-xs font-semibold text-[#808080] uppercase tracking-wide mb-2 block">JavaScript код</label>
                      <Textarea
                        value={selectedBlock.params.code || ''}
                        onChange={(e) => updateBlockParams(selectedBlock.id, { code: e.target.value })}
                        placeholder="await page.evaluate(() => { ... })"
                        rows={8}
                        className="font-mono text-xs bg-[#111111] border-[#2d2d2d] text-[#d4d4d4] placeholder:text-[#606060]"
                      />
                    </div>
                  )}

                  {selectedBlock.type === 'condition' && (
                    <>
                      <div>
                        <label className="text-xs font-semibold text-[#808080] uppercase tracking-wide mb-2 block">Тип условия</label>
                        <select
                          value={selectedBlock.params.conditionType || 'element-exists'}
                          onChange={(e) => updateBlockParams(selectedBlock.id, { conditionType: e.target.value })}
                          className="w-full p-2 border border-[#2d2d2d] rounded-md bg-[#111111] text-white"
                        >
                          <option value="element-exists">Элемент существует</option>
                          <option value="element-visible">Элемент видим</option>
                          <option value="text-contains">Текст содержит</option>
                          <option value="url-contains">URL содержит</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-[#808080] uppercase tracking-wide mb-2 block">
                          {selectedBlock.params.conditionType === 'url-contains' ? 'Часть URL' : 'CSS Селектор'}
                        </label>
                        <Input
                          value={selectedBlock.params.selector || ''}
                          onChange={(e) => updateBlockParams(selectedBlock.id, { selector: e.target.value })}
                          placeholder={selectedBlock.params.conditionType === 'url-contains' ? '/products/' : '.success-message'}
                          className="bg-[#111111] border-[#2d2d2d] text-white placeholder:text-[#606060]"
                        />
                      </div>
                      {selectedBlock.params.conditionType === 'text-contains' && (
                        <div>
                          <label className="text-xs font-semibold text-[#808080] uppercase tracking-wide mb-2 block">Искомый текст</label>
                          <Input
                            value={selectedBlock.params.value || ''}
                            onChange={(e) => updateBlockParams(selectedBlock.id, { value: e.target.value })}
                            placeholder="Успешно"
                            className="bg-[#111111] border-[#2d2d2d] text-white placeholder:text-[#606060]"
                          />
                        </div>
                      )}
                    </>
                  )}

                  {selectedBlock.type === 'loop' && (
                    <>
                      <div>
                        <label className="text-xs font-semibold text-[#808080] uppercase tracking-wide mb-2 block">Тип цикла</label>
                        <select
                          value={selectedBlock.params.loopType || 'count'}
                          onChange={(e) => updateBlockParams(selectedBlock.id, { loopType: e.target.value })}
                          className="w-full p-2 border border-[#2d2d2d] rounded-md bg-[#111111] text-white"
                        >
                          <option value="count">Повторить N раз</option>
                          <option value="while-exists">Пока элемент существует</option>
                          <option value="for-each">Для каждого элемента</option>
                        </select>
                      </div>
                      {selectedBlock.params.loopType === 'count' && (
                        <div>
                          <label className="text-xs font-semibold text-[#808080] uppercase tracking-wide mb-2 block">Количество повторений</label>
                          <Input
                            type="number"
                            value={selectedBlock.params.count || 5}
                            onChange={(e) => updateBlockParams(selectedBlock.id, { count: parseInt(e.target.value) })}
                            min="1"
                            className="bg-[#111111] border-[#2d2d2d] text-white"
                          />
                        </div>
                      )}
                      {(selectedBlock.params.loopType === 'while-exists' || selectedBlock.params.loopType === 'for-each') && (
                        <div>
                          <label className="text-xs font-semibold text-[#808080] uppercase tracking-wide mb-2 block">CSS Селектор</label>
                          <Input
                            value={selectedBlock.params.selector || ''}
                            onChange={(e) => updateBlockParams(selectedBlock.id, { selector: e.target.value })}
                            placeholder=".item, .product-card"
                            className="bg-[#111111] border-[#2d2d2d] text-white placeholder:text-[#606060]"
                          />
                        </div>
                      )}
                    </>
                  )}

                  {selectedBlock.type === 'url-match' && (
                    <>
                      <div>
                        <label className="text-xs font-semibold text-[#808080] uppercase tracking-wide mb-2 block">Тип совпадения</label>
                        <select
                          value={selectedBlock.params.matchType || 'contains'}
                          onChange={(e) => updateBlockParams(selectedBlock.id, { matchType: e.target.value })}
                          className="w-full p-2 border border-[#2d2d2d] rounded-md bg-[#111111] text-white"
                        >
                          <option value="contains">Содержит</option>
                          <option value="exact">Точное совпадение</option>
                          <option value="starts-with">Начинается с</option>
                          <option value="regex">Регулярное выражение</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-[#808080] uppercase tracking-wide mb-2 block">Шаблон URL</label>
                        <Input
                          value={selectedBlock.params.pattern || ''}
                          onChange={(e) => updateBlockParams(selectedBlock.id, { pattern: e.target.value })}
                          placeholder={
                            selectedBlock.params.matchType === 'regex' 
                              ? '^https://example\\.com/.*' 
                              : selectedBlock.params.matchType === 'exact'
                              ? 'https://example.com/page'
                              : '/products/'
                          }
                          className="bg-[#111111] border-[#2d2d2d] text-white placeholder:text-[#606060]"
                        />
                      </div>
                      <div className="p-3 bg-[#2d2d2d] rounded-lg border border-[#404040]">
                        <p className="text-xs text-[#a3a3a3]">
                          <strong className="text-white">Совет:</strong> URL фильтр определяет, на каких страницах будет выполняться скрипт.
                          {selectedBlock.params.matchType === 'contains' && ' Скрипт запустится на всех URL, содержащих указанный текст.'}
                          {selectedBlock.params.matchType === 'exact' && ' Скрипт запустится только на точно указанном URL.'}
                          {selectedBlock.params.matchType === 'starts-with' && ' Скрипт запустится на всех URL, начинающихся с указанного текста.'}
                          {selectedBlock.params.matchType === 'regex' && ' Используйте регулярное выражение для сложных паттернов.'}
                        </p>
                      </div>
                    </>
                  )}

                  <div className="pt-4 border-t border-[#2d2d2d]">
                    <h4 className="text-xs font-semibold text-[#808080] uppercase tracking-wide mb-2">Предпросмотр кода:</h4>
                    <pre className="text-xs bg-[#111111] border border-[#2d2d2d] p-3 rounded overflow-x-auto text-[#d4d4d4] font-mono">
                      <code>
                        {BLOCK_TYPES.find(b => b.type === selectedBlock.type)?.generateCode(selectedBlock.params)}
                      </code>
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <Settings className="h-12 w-12 text-[#808080] mb-4" />
                  <p className="text-sm text-[#808080]">
                    Выберите блок для настройки параметров
                  </p>
                </div>
              )}
            </ScrollArea>
        </div>
      </div>

      {/* Вкладка с кодом */}
      {generatedCode && (
        <div className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Сгенерированный код</h3>
              <p className="text-xs text-[#808080]">Готовый JavaScript для выполнения</p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCopyCode}
                className="bg-[#2d2d2d] border-[#404040] text-white hover:bg-[#3d3d3d]"
              >
                <Copy className="h-4 w-4 mr-2" />
                Копировать
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleExportCode}
                className="bg-[#2d2d2d] border-[#404040] text-white hover:bg-[#3d3d3d]"
              >
                <Download className="h-4 w-4 mr-2" />
                Скачать
              </Button>
            </div>
          </div>
          <ScrollArea className="h-[400px]">
            <pre className="text-xs bg-[#111111] border border-[#2d2d2d] p-4 rounded font-mono text-[#d4d4d4]">
              <code>{generatedCode}</code>
            </pre>
          </ScrollArea>
        </div>
      )}
    </div>
  );
};

export default VisualScriptBuilder;
