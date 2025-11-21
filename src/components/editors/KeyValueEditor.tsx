import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Save, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KeyValueEditorProps {
  value: Record<string, any>;
  onChange: (value: Record<string, any>) => void;
  label?: string;
  className?: string;
  allowedTypes?: ('string' | 'number' | 'boolean' | 'json')[];
  maxEntries?: number;
}

export const KeyValueEditor: React.FC<KeyValueEditorProps> = ({
  value,
  onChange,
  label = 'Параметры',
  className,
  allowedTypes = ['string', 'number', 'boolean', 'json'],
  maxEntries = 50
}) => {
  const [entries, setEntries] = useState<Array<{ key: string; value: string; type: string }>>(
    Object.entries(value).map(([key, val]) => ({
      key,
      value: typeof val === 'object' ? JSON.stringify(val, null, 2) : String(val),
      type: typeof val === 'object' ? 'json' : typeof val
    }))
  );

  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newType, setNewType] = useState<string>('string');

  const handleAdd = () => {
    if (!newKey.trim()) return;
    if (entries.length >= maxEntries) return;

    const newEntry = { key: newKey.trim(), value: newValue, type: newType };
    const updated = [...entries, newEntry];
    setEntries(updated);
    applyChanges(updated);

    setNewKey('');
    setNewValue('');
    setNewType('string');
  };

  const handleRemove = (index: number) => {
    const updated = entries.filter((_, i) => i !== index);
    setEntries(updated);
    applyChanges(updated);
  };

  const handleUpdate = (index: number, field: 'key' | 'value' | 'type', newVal: string) => {
    const updated = [...entries];
    updated[index] = { ...updated[index], [field]: newVal };
    setEntries(updated);
    applyChanges(updated);
  };

  const applyChanges = (updatedEntries: typeof entries) => {
    const result: Record<string, any> = {};
    updatedEntries.forEach(({ key, value, type }) => {
      if (!key.trim()) return;

      try {
        if (type === 'number') {
          result[key] = Number(value);
        } else if (type === 'boolean') {
          result[key] = value === 'true' || value === '1';
        } else if (type === 'json') {
          result[key] = JSON.parse(value);
        } else {
          result[key] = value;
        }
      } catch {
        result[key] = value;
      }
    });
    onChange(result);
  };

  const handleReset = () => {
    setEntries([]);
    onChange({});
  };

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{label}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {entries.length} / {maxEntries}
            </Badge>
            {entries.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="h-7 px-2"
              >
                <RotateCcw className="mr-1 h-3 w-3" />
                Очистить
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Existing Entries */}
        {entries.length > 0 && (
          <div className="space-y-2">
            {entries.map((entry, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={entry.key}
                  onChange={(e) => handleUpdate(index, 'key', e.target.value)}
                  placeholder="ключ"
                  className="h-8 flex-1 text-xs"
                />
                <select
                  value={entry.type}
                  onChange={(e) => handleUpdate(index, 'type', e.target.value)}
                  className="h-8 rounded-md border bg-background px-2 text-xs"
                >
                  {allowedTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <Input
                  value={entry.value}
                  onChange={(e) => handleUpdate(index, 'value', e.target.value)}
                  placeholder="значение"
                  className="h-8 flex-[2] text-xs"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemove(index)}
                  className="h-8 w-8 p-0 text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Add New Entry */}
        {entries.length < maxEntries && (
          <div className="flex items-center gap-2 border-t pt-3">
            <Input
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              placeholder="Новый ключ"
              className="h-8 flex-1 text-xs"
              onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
            />
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
              className="h-8 rounded-md border bg-background px-2 text-xs"
            >
              {allowedTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <Input
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder="Значение"
              className="h-8 flex-[2] text-xs"
              onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleAdd}
              disabled={!newKey.trim()}
              className="h-8 px-3"
            >
              <Plus className="mr-1 h-3 w-3" />
              Добавить
            </Button>
          </div>
        )}

        {entries.length === 0 && (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Нет параметров. Добавьте первый ключ-значение выше.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default KeyValueEditor;
