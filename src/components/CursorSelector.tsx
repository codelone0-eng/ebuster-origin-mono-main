import React, { useState } from 'react';
import { MousePointer, Circle, Square, Diamond, Zap, Star, Heart, Target, Eye, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useLanguage } from '@/hooks/useLanguage';

export type CursorType = 
  | 'default' 
  | 'sparkles';

interface CursorSelectorProps {
  currentCursor: CursorType;
  onCursorChange: (cursor: CursorType) => void;
}

const getCursorOptions = (t: any) => [
  { id: 'default' as CursorType, name: t('header.cursor.options.default'), icon: MousePointer, description: t('header.cursor.descriptions.default') },
  { id: 'sparkles' as CursorType, name: t('header.cursor.options.sparkles'), icon: Sparkles, description: t('header.cursor.descriptions.sparkles') },
];

export const CursorSelector = ({ currentCursor, onCursorChange }: CursorSelectorProps) => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const cursorOptions = getCursorOptions(t);
  const currentOption = cursorOptions.find(option => option.id === currentCursor);

  const getCursorPreview = (cursorType: CursorType) => {
    const baseStyle = {
      width: '16px',
      height: '16px',
      border: '2px solid rgba(96, 96, 96, 0.9)',
      borderRadius: '50%',
      background: 'transparent',
    };

    switch (cursorType) {
      case 'sparkles':
        return { 
          ...baseStyle, 
          background: 'rgba(96, 96, 96, 0.9)', 
          boxShadow: '0 0 4px rgba(96, 96, 96, 0.5)' 
        };
      default:
        return baseStyle;
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 w-9 rounded-xl hover:bg-accent/20 transition-colors duration-200"
        >
          <div 
            style={getCursorPreview(currentCursor)}
            className="cursor-preview"
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4 bg-card/95 backdrop-blur-xl border border-border/30 rounded-2xl shadow-xl">
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-foreground mb-1">{t('header.cursor.title')}</h3>
            <p className="text-sm text-muted-foreground">{t('header.cursor.description')}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {cursorOptions.map((option) => {
              const isSelected = currentCursor === option.id;
              
              return (
                <Button
                  key={option.id}
                  variant="ghost"
                  className={`h-auto p-4 rounded-xl transition-all duration-200 ${
                    isSelected 
                      ? 'bg-primary/20 border border-primary/30 text-primary' 
                      : 'hover:bg-accent/10 border border-transparent'
                  }`}
                  onClick={() => {
                    onCursorChange(option.id);
                    setIsOpen(false);
                  }}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <div className={`p-2 rounded-lg transition-colors duration-200 ${
                      isSelected ? 'bg-primary/10' : 'bg-muted/20'
                    }`}>
                      <div 
                        style={getCursorPreview(option.id)}
                        className="cursor-preview"
                      />
                    </div>
                    <div className="text-center">
                      <div className={`text-sm font-medium ${
                        isSelected ? 'text-primary' : 'text-foreground'
                      }`}>
                        {option.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {option.description}
                      </div>
                    </div>
                  </div>
                </Button>
              );
            })}
          </div>
          
          <div className="pt-2 border-t border-border/20">
            <p className="text-xs text-muted-foreground text-center">
              {t('header.cursor.adaptNote')}
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
