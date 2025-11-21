import { PERMISSIONS } from '@/types/permissions';

/**
 * Хук для детальной проверки разрешений на основе RBAC
 * Работает с новой системой разрешений из permissions.ts
 */
export const useDetailedPermissions = () => {
  // Получаем пользователя из localStorage (временно, пока нет useAuth)
  const getUserData = () => {
    try {
      const userData = localStorage.getItem('ebuster_user');
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  };
  
  const user = getUserData();

  /**
   * Проверка наличия конкретного разрешения
   */
  const hasPermission = (permissionId: string): boolean => {
    if (!user) return false;
    
    // Админы имеют все права
    if (user.role === 'admin' || user.role_name === 'admin') return true;
    
    // Проверяем наличие разрешения в массиве permissions пользователя
    const userPermissions = user.permissions || [];
    return userPermissions.includes(permissionId);
  };

  /**
   * Проверка наличия хотя бы одного из разрешений
   */
  const hasAnyPermission = (permissionIds: string[]): boolean => {
    return permissionIds.some(permissionId => hasPermission(permissionId));
  };

  /**
   * Проверка наличия всех разрешений
   */
  const hasAllPermissions = (permissionIds: string[]): boolean => {
    return permissionIds.every(permissionId => hasPermission(permissionId));
  };

  // === СКРИПТЫ ===
  const canViewScripts = () => hasPermission('scripts.view');
  const canDownloadScripts = () => hasPermission('scripts.download');
  const canDownloadPremiumScripts = () => hasPermission('scripts.download_premium');
  const canCreateScripts = () => hasPermission('scripts.create');
  const canEditOwnScripts = () => hasPermission('scripts.edit_own');
  const canDeleteOwnScripts = () => hasPermission('scripts.delete_own');
  const canPublishScripts = () => hasPermission('scripts.publish');
  const canMarkScriptPremium = () => hasPermission('scripts.mark_premium');
  const canModerateScripts = () => hasPermission('scripts.moderate');
  const canEditAnyScripts = () => hasPermission('scripts.edit_any');
  const canDeleteAnyScripts = () => hasPermission('scripts.delete_any');

  // === ВИЗУАЛЬНЫЙ КОНСТРУКТОР ===
  const canAccessVisualBuilder = () => hasPermission('visual_builder.access');
  const canSaveToExtension = () => hasPermission('visual_builder.save_to_extension');
  const canExportCode = () => hasPermission('visual_builder.export_code');
  const canUseAdvancedBlocks = () => hasPermission('visual_builder.advanced_blocks');

  // === МАРКЕТПЛЕЙС ===
  const canViewMarketplace = () => hasPermission('marketplace.view');
  const canRateScripts = () => hasPermission('marketplace.rate');
  const canCommentScripts = () => hasPermission('marketplace.comment');
  const canReportScripts = () => hasPermission('marketplace.report');

  // === ПРОФИЛЬ ===
  const canEditProfile = () => hasPermission('profile.edit');
  const canUploadAvatar = () => hasPermission('profile.avatar');
  const canUseCustomBadge = () => hasPermission('profile.custom_badge');
  const canUseReferrals = () => hasPermission('profile.referrals');

  // === ПОДДЕРЖКА ===
  const canCreateTickets = () => hasPermission('support.create_ticket');
  const hasPrioritySupport = () => hasPermission('support.priority');
  const canUseSupportChat = () => hasPermission('support.chat');
  const canAttachFiles = () => hasPermission('support.attachments');

  // === АДМИНИСТРИРОВАНИЕ ===
  const canAccessAdminPanel = () => hasPermission('admin.access');
  const canViewUsers = () => hasPermission('admin.users.view');
  const canEditUsers = () => hasPermission('admin.users.edit');
  const canBanUsers = () => hasPermission('admin.users.ban');
  const canDeleteUsers = () => hasPermission('admin.users.delete');
  const canManageRoles = () => hasPermission('admin.roles.manage');
  const canAssignRoles = () => hasPermission('admin.roles.assign');
  const canManageScripts = () => hasPermission('admin.scripts.manage');
  const canViewTickets = () => hasPermission('admin.tickets.view');
  const canManageTickets = () => hasPermission('admin.tickets.manage');
  const canAccessMonitoring = () => hasPermission('admin.monitoring');
  const canChangeSettings = () => hasPermission('admin.settings');

  // === API ===
  const canAccessAPI = () => hasPermission('api.access');
  const canUseWebhooks = () => hasPermission('api.webhooks');
  const hasExtendedAPILimits = () => hasPermission('api.extended_limits');

  // === АНАЛИТИКА ===
  const canViewOwnAnalytics = () => hasPermission('analytics.view_own');
  const canViewAllAnalytics = () => hasPermission('analytics.view_all');
  const canExportAnalytics = () => hasPermission('analytics.export');

  /**
   * Получить список всех разрешений пользователя
   */
  const getUserPermissions = (): string[] => {
    return user?.permissions || [];
  };

  /**
   * Получить детали разрешения
   */
  const getPermissionDetails = (permissionId: string) => {
    return PERMISSIONS[permissionId];
  };

  /**
   * Проверить, является ли пользователь администратором
   */
  const isAdmin = (): boolean => {
    return user?.role === 'admin' || user?.role_name === 'admin';
  };

  return {
    // Базовые проверки
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAdmin,
    getUserPermissions,
    getPermissionDetails,

    // Скрипты
    canViewScripts,
    canDownloadScripts,
    canDownloadPremiumScripts,
    canCreateScripts,
    canEditOwnScripts,
    canDeleteOwnScripts,
    canPublishScripts,
    canMarkScriptPremium,
    canModerateScripts,
    canEditAnyScripts,
    canDeleteAnyScripts,

    // Визуальный конструктор
    canAccessVisualBuilder,
    canSaveToExtension,
    canExportCode,
    canUseAdvancedBlocks,

    // Маркетплейс
    canViewMarketplace,
    canRateScripts,
    canCommentScripts,
    canReportScripts,

    // Профиль
    canEditProfile,
    canUploadAvatar,
    canUseCustomBadge,
    canUseReferrals,

    // Поддержка
    canCreateTickets,
    hasPrioritySupport,
    canUseSupportChat,
    canAttachFiles,

    // Администрирование
    canAccessAdminPanel,
    canViewUsers,
    canEditUsers,
    canBanUsers,
    canDeleteUsers,
    canManageRoles,
    canAssignRoles,
    canManageScripts,
    canViewTickets,
    canManageTickets,
    canAccessMonitoring,
    canChangeSettings,

    // API
    canAccessAPI,
    canUseWebhooks,
    hasExtendedAPILimits,

    // Аналитика
    canViewOwnAnalytics,
    canViewAllAnalytics,
    canExportAnalytics
  };
};
