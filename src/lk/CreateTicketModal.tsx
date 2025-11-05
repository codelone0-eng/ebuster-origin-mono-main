import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

import { API_CONFIG } from '@/config/api';

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateTicketModal: React.FC<CreateTicketModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject.trim() || !description.trim()) {
      toast({
        title: 'Ошибка валидации',
        description: 'Заполните все обязательные поля',
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('ebuster_token');
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          subject,
          message: description,
          priority,
          category: 'general'
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: 'Тикет создан',
          description: `Номер тикета: ${result.data.ticket_number}`,
          variant: 'success'
        });
        
        // Сброс формы
        setSubject('');
        setDescription('');
        setPriority('medium');

        onSuccess();
      } else {
        throw new Error(result.error || 'Failed to create ticket');
      }
    } catch (error: any) {
      console.error('Create ticket error:', error);
      toast({
        title: 'Ошибка создания',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Создать новый тикет</DialogTitle>
          <DialogDescription>
            Опишите вашу проблему или вопрос. Мы постараемся ответить как можно скорее.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Тема */}
          <div className="space-y-2">
            <Label htmlFor="subject">
              Тема <span className="text-destructive">*</span>
            </Label>
            <Input
              id="subject"
              placeholder="Кратко опишите проблему"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={500}
              required
            />
            <p className="text-xs text-muted-foreground">
              {subject.length}/500 символов
            </p>
          </div>

          {/* Описание */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Описание <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Подробно опишите вашу проблему или вопрос..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              required
            />
            <p className="text-xs text-muted-foreground">
              Чем подробнее вы опишете проблему, тем быстрее мы сможем помочь
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Приоритет */}
            <div className="space-y-2">
              <Label htmlFor="priority">Приоритет</Label>
              <select
                id="priority"
                className="w-full rounded-md border content-border-40 bg-card/60 px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="low">Низкий</option>
                <option value="medium">Средний</option>
                <option value="high">Высокий</option>
                <option value="critical">Критический</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Категория</Label>
              <div className="text-sm text-muted-foreground bg-card/60 border content-border-40 rounded-md px-3 py-2">
                Категории временно недоступны
              </div>
              <p className="text-xs text-muted-foreground">
                Выберите подходящую категорию для вашего запроса
              </p>
            </div>
          </div>

          {/* Кнопки */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Отмена
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Создание...' : 'Создать тикет'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
