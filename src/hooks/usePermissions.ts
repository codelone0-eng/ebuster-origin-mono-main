import { useCallback } from 'react';
import { useSubscription } from './useSubscription';

interface UsePermissionsReturn {
  can: (featurePath: string) => boolean;
  cannot: (featurePath: string) => boolean;
  withinLimit: (limitKey: string, currentValue: number) => boolean;
  getLimitInfo: (limitKey: string, currentValue: number) => { allowed: boolean; limit: number; remaining: number };
  isRole: (roleName: string) => boolean;
  isAdmin: () => boolean;
  isPro: () => boolean;
  isPremium: () => boolean;
  isFree: () => boolean;
  requiresUpgrade: (featurePath: string) => boolean;
}

/**
 * Hook для проверки прав доступа пользователя
 * Использует данные из useSubscription
 */
export const usePermissions = (): UsePermissionsReturn => {
  const { role, checkFeature, checkLimit, hasRole, isAdmin: checkIsAdmin } = useSubscription();

  /**
   * Проверить наличие возможности
   */
  const can = useCallback((featurePath: string): boolean => {
    return checkFeature(featurePath);
  }, [checkFeature]);

  /**
   * Проверить отсутствие возможности
   */
  const cannot = useCallback((featurePath: string): boolean => {
    return !checkFeature(featurePath);
  }, [checkFeature]);

  /**
   * Проверить, что значение в пределах лимита
   */
  const withinLimit = useCallback((limitKey: string, currentValue: number): boolean => {
    const { allowed } = checkLimit(limitKey, currentValue);
    return allowed;
  }, [checkLimit]);

  /**
   * Получить информацию о лимите
   */
  const getLimitInfo = useCallback((limitKey: string, currentValue: number) => {
    return checkLimit(limitKey, currentValue);
  }, [checkLimit]);

  /**
   * Проверить роль
   */
  const isRole = useCallback((roleName: string): boolean => {
    return hasRole(roleName);
  }, [hasRole]);

  /**
   * Проверить админа
   */
  const isAdmin = useCallback((): boolean => {
    return checkIsAdmin();
  }, [checkIsAdmin]);

  /**
   * Проверить Pro роль
   */
  const isPro = useCallback((): boolean => {
    return hasRole('pro');
  }, [hasRole]);

  /**
   * Проверить Premium роль
   */
  const isPremium = useCallback((): boolean => {
    return hasRole('premium');
  }, [hasRole]);

  /**
   * Проверить Free роль
   */
  const isFree = useCallback((): boolean => {
    return hasRole('free') || !role;
  }, [hasRole, role]);

  /**
   * Проверить, требуется ли апгрейд для функции
   */
  const requiresUpgrade = useCallback((featurePath: string): boolean => {
    return !checkFeature(featurePath) && !checkIsAdmin();
  }, [checkFeature, checkIsAdmin]);

  return {
    can,
    cannot,
    withinLimit,
    getLimitInfo,
    isRole,
    isAdmin,
    isPro,
    isPremium,
    isFree,
    requiresUpgrade
  };
};
