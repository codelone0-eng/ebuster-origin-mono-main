import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { useSubscription } from '@/hooks/useSubscription';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Crown, Lock, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FeatureGateProps {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgradePrompt?: boolean;
}

/**
 * Компонент для ограничения доступа к функциям на основе роли пользователя
 * 
 * @example
 * <FeatureGate feature="scripts.can_publish">
 *   <PublishButton />
 * </FeatureGate>
 */
export const FeatureGate: React.FC<FeatureGateProps> = ({
  feature,
  children,
  fallback,
  showUpgradePrompt = true
}) => {
  const { can } = usePermissions();
  const { role, loading } = useSubscription();
  const navigate = useNavigate();

  // Пока загружается, показываем loading state
  if (loading) {
    return null;
  }

  // Если есть доступ, показываем контент
  if (can(feature)) {
    return <>{children}</>;
  }

  // Если есть кастомный fallback, показываем его
  if (fallback) {
    return <>{fallback}</>;
  }

  // Если нужно показать upgrade prompt
  if (showUpgradePrompt) {
    return <UpgradePrompt feature={feature} currentRole={role?.name || 'free'} />;
  }

  // По умолчанию ничего не показываем
  return null;
};

/**
 * Промпт для апгрейда подписки
 */
const UpgradePrompt: React.FC<{ feature: string; currentRole: string }> = ({ feature, currentRole }) => {
  const navigate = useNavigate();

  const getFeatureInfo = (feature: string) => {
    const featureMap: Record<string, { title: string; description: string; requiredPlan: string }> = {
      'scripts.can_publish': {
        title: 'Публикация скриптов',
        description: 'Публикуйте свои скрипты и делитесь ими с сообществом',
        requiredPlan: 'Pro'
      },
      'scripts.can_feature': {
        title: 'Featured скрипты',
        description: 'Размещайте скрипты в разделе Featured для большей видимости',
        requiredPlan: 'Premium'
      },
      'scripts.can_premium': {
        title: 'Premium скрипты',
        description: 'Создавайте и продавайте premium скрипты',
        requiredPlan: 'Premium'
      },
      'downloads.unlimited': {
        title: 'Неограниченные загрузки',
        description: 'Загружайте скрипты без ограничений',
        requiredPlan: 'Premium'
      },
      'support.priority': {
        title: 'Приоритетная поддержка',
        description: 'Получайте ответы на вопросы в приоритетном порядке',
        requiredPlan: 'Pro'
      },
      'support.chat': {
        title: 'Чат поддержки',
        description: 'Прямой доступ к чату с технической поддержкой',
        requiredPlan: 'Premium'
      },
      'api.enabled': {
        title: 'API доступ',
        description: 'Используйте API для интеграции с вашими приложениями',
        requiredPlan: 'Pro'
      }
    };

    return featureMap[feature] || {
      title: 'Премиум функция',
      description: 'Эта функция доступна только на платных планах',
      requiredPlan: 'Pro'
    };
  };

  const info = getFeatureInfo(feature);

  return (
    <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-accent/5">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            {info.requiredPlan === 'Premium' ? (
              <Crown className="h-5 w-5 text-primary" />
            ) : (
              <Zap className="h-5 w-5 text-primary" />
            )}
          </div>
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Lock className="h-4 w-4" />
              {info.title}
            </CardTitle>
            <CardDescription>
              Требуется план: <span className="font-semibold text-primary">{info.requiredPlan}</span>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          {info.description}
        </p>
        <div className="flex gap-2">
          <Button
            onClick={() => navigate('/pricing')}
            className="flex-1"
          >
            <Crown className="h-4 w-4 mr-2" />
            Обновить план
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/pricing')}
            className="flex-1"
          >
            Узнать больше
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Компонент для ограничения по лимиту
 */
interface LimitGateProps {
  limitKey: string;
  currentValue: number;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const LimitGate: React.FC<LimitGateProps> = ({
  limitKey,
  currentValue,
  children,
  fallback
}) => {
  const { withinLimit, getLimitInfo } = usePermissions();
  const { loading } = useSubscription();

  if (loading) {
    return null;
  }

  const { allowed, limit, remaining } = getLimitInfo(limitKey, currentValue);

  if (allowed) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <Card className="border-destructive/50 bg-destructive/5">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Lock className="h-4 w-4" />
          Лимит достигнут
        </CardTitle>
        <CardDescription>
          Вы достигли лимита: {currentValue} из {limit}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Обновите план для увеличения лимитов
        </p>
        <Button className="w-full">
          <Crown className="h-4 w-4 mr-2" />
          Обновить план
        </Button>
      </CardContent>
    </Card>
  );
};
