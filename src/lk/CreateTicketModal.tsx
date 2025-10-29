import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { API_CONFIG } from '@/config/api';
import { useToast } from '@/hooks/use-toast';

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface SupportTeam {
  id: number;
  name: string;
  description: string;
}

export const CreateTicketModal: React.FC<CreateTicketModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [teamId, setTeamId] = useState<number>(1);
  const [teams, setTeams] = useState<SupportTeam[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadTeams();
    }
  }, [isOpen]);

  const loadTeams = async () => {
    try {
      const token = localStorage.getItem('ebuster_token');
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/tickets/teams`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      
      if (result.success && result.data) {
        setTeams(result.data);
        if (result.data.length > 0) {
          setTeamId(result.data[0].id);
        }
      }
    } catch (error) {
      console.error('Load teams error:', error);
    }
  };

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
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-gray-500" />
                      Низкий
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      Средний
                    </div>
                  </SelectItem>
                  <SelectItem value="high">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-orange-500" />
                      Высокий
                    </div>
                  </SelectItem>
                  <SelectItem value="critical">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      Критический
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Категория/Команда */}
            <div className="space-y-2">
              <Label htmlFor="team">Категория</Label>
              <Select 
                value={teamId.toString()} 
                onValueChange={(value) => setTeamId(Number(value))}
              >
                <SelectTrigger id="team">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id.toString()}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
