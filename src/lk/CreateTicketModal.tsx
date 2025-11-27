import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
          priority
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: 'Тикет создан',
          description: result.data?.ticket_number ? `Номер тикета: ${result.data.ticket_number}` : undefined,
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-6">
        <DialogHeader>
          <DialogTitle className="text-white text-2xl font-semibold">Создать новый тикет</DialogTitle>
          <DialogDescription className="text-white/60 text-sm mt-2">
            Опишите вашу проблему или вопрос. Мы постараемся ответить как можно скорее.
          </DialogDescription>
        </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 mt-6">
            {/* Тема */}
            <div className="space-y-2">
              <Label htmlFor="subject" className="text-white text-sm font-medium">
                Тема <span className="text-red-400">*</span>
              </Label>
              <Input
                id="subject"
                placeholder="Кратко опишите проблему"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                maxLength={500}
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-white/30 focus:ring-0 rounded-xl h-11"
              />
              <p className="text-xs text-white/40">
                {subject.length}/500 символов
              </p>
            </div>

            {/* Описание */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-white text-sm font-medium">
                Описание <span className="text-red-400">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Подробно опишите вашу проблему или вопрос..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-white/30 focus:ring-0 rounded-xl resize-none"
              />
              <p className="text-xs text-white/40">
                Чем подробнее вы опишете проблему, тем быстрее мы сможем помочь
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority" className="text-white text-sm font-medium">Приоритет</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="w-full bg-white/5 border-white/10 text-white rounded-xl h-11 focus:ring-0 focus:border-white/30">
                  <SelectValue placeholder="Выберите приоритет" />
                </SelectTrigger>
                <SelectContent className="bg-white/[0.02] border-white/10 text-white rounded-xl">
                  <SelectItem value="low" className="focus:bg-white/10 text-white">Низкий</SelectItem>
                  <SelectItem value="medium" className="focus:bg-white/10 text-white">Средний</SelectItem>
                  <SelectItem value="high" className="focus:bg-white/10 text-white">Высокий</SelectItem>
                  <SelectItem value="critical" className="focus:bg-white/10 text-white">Критический</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Кнопки */}
            <div className="flex justify-end gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose} 
                disabled={loading}
                className="border-white/10 text-white hover:bg-white/10 rounded-xl"
              >
                Отмена
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                className="bg-white text-black hover:bg-white/90 font-medium rounded-xl"
              >
                {loading ? 'Создание...' : 'Создать тикет'}
              </Button>
            </div>
          </form>
      </DialogContent>
    </Dialog>
  );
};
