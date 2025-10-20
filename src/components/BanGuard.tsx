import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

interface BanInfo {
  isBanned: boolean;
  reason?: string;
  banDate?: string;
  unbanDate?: string;
  banType?: string;
  remainingDays?: number;
}

// Hook для проверки статуса бана пользователя
export const useBanStatus = (): BanInfo => {
  const [banInfo, setBanInfo] = useState<BanInfo>({ isBanned: false });

  useEffect(() => {
    // Здесь должна быть логика проверки статуса бана
    // Например, запрос к API или проверка localStorage
    
    // Mock данные для демонстрации
    const mockBanInfo: BanInfo = {
      isBanned: false, // Изменить на true для тестирования
      reason: "Нарушение правил сообщества - спам и нежелательный контент",
      banDate: "15 января 2024 г., 14:30",
      unbanDate: "15 февраля 2024 г., 14:30",
      banType: "Временная блокировка",
      remainingDays: 12
    };

    // Проверяем localStorage для демонстрации
    const storedBanStatus = localStorage.getItem('userBanStatus');
    if (storedBanStatus) {
      setBanInfo(JSON.parse(storedBanStatus));
    } else {
      setBanInfo(mockBanInfo);
    }
  }, []);

  return banInfo;
};

// Компонент для защиты маршрутов от забаненных пользователей
interface BanGuardProps {
  children: React.ReactNode;
}

export const BanGuard: React.FC<BanGuardProps> = ({ children }) => {
  const banInfo = useBanStatus();

  if (banInfo.isBanned) {
    return <Navigate to="/ban" replace />;
  }

  return <>{children}</>;
};

// Утилиты для работы с баном
export const banUtils = {
  // Установить статус бана (для админки)
  setBanStatus: (banInfo: BanInfo) => {
    localStorage.setItem('userBanStatus', JSON.stringify(banInfo));
  },

  // Снять бан
  removeBan: () => {
    localStorage.removeItem('userBanStatus');
  },

  // Проверить, забанен ли пользователь
  isUserBanned: (): boolean => {
    const banStatus = localStorage.getItem('userBanStatus');
    if (banStatus) {
      const banInfo = JSON.parse(banStatus);
      return banInfo.isBanned;
    }
    return false;
  },

  // Получить информацию о бане
  getBanInfo: (): BanInfo | null => {
    const banStatus = localStorage.getItem('userBanStatus');
    if (banStatus) {
      return JSON.parse(banStatus);
    }
    return null;
  }
};
