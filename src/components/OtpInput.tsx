import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
}

export function OtpInput({ 
  length = 6, 
  value, 
  onChange, 
  disabled = false,
  autoFocus = false 
}: OtpInputProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  const handleChange = (index: number, inputValue: string) => {
    // Разрешаем только цифры
    const digit = inputValue.replace(/\D/g, '');
    
    if (digit.length === 0) {
      // Удаление
      const newValue = value.slice(0, index) + value.slice(index + 1);
      onChange(newValue);
      return;
    }

    if (digit.length === 1) {
      // Один символ - обновляем текущую позицию
      const newValue = value.slice(0, index) + digit + value.slice(index + 1);
      onChange(newValue);
      
      // Переходим к следующему полю
      if (index < length - 1) {
        inputRefs.current[index + 1]?.focus();
        setActiveIndex(index + 1);
      }
    } else {
      // Несколько символов - вставка
      const digits = digit.slice(0, length - index);
      const newValue = value.slice(0, index) + digits + value.slice(index + digits.length);
      onChange(newValue.slice(0, length));
      
      // Фокус на следующее пустое поле
      const nextIndex = Math.min(index + digits.length, length - 1);
      inputRefs.current[nextIndex]?.focus();
      setActiveIndex(nextIndex);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      
      if (value[index]) {
        // Удаляем текущий символ
        const newValue = value.slice(0, index) + value.slice(index + 1);
        onChange(newValue);
      } else if (index > 0) {
        // Переходим к предыдущему полю
        inputRefs.current[index - 1]?.focus();
        setActiveIndex(index - 1);
        // Удаляем предыдущий символ
        const newValue = value.slice(0, index - 1) + value.slice(index);
        onChange(newValue);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
      setActiveIndex(index - 1);
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
      setActiveIndex(index + 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    onChange(pastedData);
    
    // Фокус на последнее заполненное поле
    const nextIndex = Math.min(pastedData.length, length - 1);
    inputRefs.current[nextIndex]?.focus();
    setActiveIndex(nextIndex);
  };

  const handleFocus = (index: number) => {
    setActiveIndex(index);
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={value[index] || ''}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={() => handleFocus(index)}
            disabled={disabled}
            className={cn(
              "relative flex h-10 w-10 items-center justify-center",
              "border-y border-r border-input text-sm transition-all",
              "first:rounded-l-md first:border-l last:rounded-r-md",
              "text-center font-mono",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
              activeIndex === index && "z-10 ring-2 ring-ring ring-offset-background"
            )}
          />
        ))}
      </div>
      
      <div className="flex items-center justify-center w-2">
        <div className="w-1 h-1 rounded-full bg-muted-foreground" />
      </div>
      
      <div className="flex items-center gap-2">
        {Array.from({ length: 3 }).map((_, i) => {
          const index = i + 3;
          return (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={value[index] || ''}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              onFocus={() => handleFocus(index)}
              disabled={disabled}
              className={cn(
                "relative flex h-10 w-10 items-center justify-center",
                "border-y border-r border-input text-sm transition-all",
                "first:rounded-l-md first:border-l last:rounded-r-md",
                "text-center font-mono",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                "disabled:cursor-not-allowed disabled:opacity-50",
                activeIndex === index && "z-10 ring-2 ring-ring ring-offset-background"
              )}
            />
          );
        })}
      </div>
    </div>
  );
}
