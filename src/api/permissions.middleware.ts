import { Request, Response, NextFunction } from 'express';
import { permissionsService } from '../services/permissions.service';

/**
 * Middleware для проверки наличия определенной возможности (feature)
 */
export const checkFeature = (featurePath: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized'
        });
      }

      const hasFeature = await permissionsService.checkFeature(userId, featurePath);

      if (!hasFeature) {
        return res.status(403).json({
          success: false,
          error: `Feature '${featurePath}' is not available for your plan`,
          upgrade_required: true
        });
      }

      next();
    } catch (error) {
      console.error('Error in checkFeature middleware:', error);
      // Fail-open: если проверка не работает, даем доступ
      next();
    }
  };
};

/**
 * Middleware для проверки лимита
 */
export const checkLimit = (limitKey: string, getCurrentValue: (req: Request) => Promise<number>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized'
        });
      }

      const currentValue = await getCurrentValue(req);
      const { allowed, limit, remaining } = await permissionsService.checkLimit(userId, limitKey, currentValue);

      if (!allowed) {
        return res.status(403).json({
          success: false,
          error: `Limit exceeded for '${limitKey}'`,
          limit,
          current: currentValue,
          remaining: 0,
          upgrade_required: true
        });
      }

      // Добавляем информацию о лимите в request
      (req as any).limit = { limit, remaining };

      next();
    } catch (error) {
      console.error('Error in checkLimit middleware:', error);
      // Fail-open: если проверка не работает, даем доступ
      next();
    }
  };
};

/**
 * Middleware для проверки прав админа
 */
export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
    }

    const isAdmin = await permissionsService.isAdmin(userId);

    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }

    next();
  } catch (error) {
    console.error('Error in requireAdmin middleware:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

/**
 * Middleware для проверки активной подписки
 */
export const requireActiveSubscription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
    }

    const isActive = await permissionsService.checkSubscriptionActive(userId);

    if (!isActive) {
      return res.status(403).json({
        success: false,
        error: 'Active subscription required',
        upgrade_required: true
      });
    }

    next();
  } catch (error) {
    console.error('Error in requireActiveSubscription middleware:', error);
    // Fail-open
    next();
  }
};

/**
 * Middleware для проверки минимальной роли
 */
export const requireRole = (minRoleName: string) => {
  const roleHierarchy: Record<string, number> = {
    'free': 0,
    'pro': 1,
    'premium': 2,
    'admin': 3
  };

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized'
        });
      }

      const role = await permissionsService.getUserRole(userId);

      if (!role) {
        return res.status(403).json({
          success: false,
          error: 'No role assigned'
        });
      }

      const userRoleLevel = roleHierarchy[role.name] || 0;
      const requiredRoleLevel = roleHierarchy[minRoleName] || 0;

      if (userRoleLevel < requiredRoleLevel) {
        return res.status(403).json({
          success: false,
          error: `Minimum role '${minRoleName}' required`,
          current_role: role.name,
          upgrade_required: true
        });
      }

      next();
    } catch (error) {
      console.error('Error in requireRole middleware:', error);
      // Fail-open
      next();
    }
  };
};
