/**
 * UI store hooks for easy component integration.
 * Provides typed selectors and actions for UI-related functionality.
 */

import { useStore } from '../index';
import type { Theme, ToastState, ModalState } from '../types';

// =============================================================================
// THEME HOOKS
// =============================================================================

/**
 * Hook to get the current theme.
 * @returns Current theme value
 */
export const useTheme = () => {
  return useStore((state) => state.ui.theme);
};

/**
 * Hook to get theme actions.
 * @returns Theme-related actions
 */
export const useThemeActions = () => {
  return useStore((state) => ({
    setTheme: state.ui.setTheme,
    toggleTheme: state.ui.toggleTheme,
  }));
};

/**
 * Hook to toggle between light and dark themes.
 * @returns Toggle theme function
 */
export const useToggleTheme = () => {
  return useStore((state) => state.ui.toggleTheme);
};

// =============================================================================
// TOAST HOOKS
// =============================================================================

/**
 * Hook to get current toasts.
 * @returns Array of current toasts
 */
export const useToasts = () => {
  return useStore((state) => state.ui.toasts);
};

/**
 * Hook to get toast actions.
 * @returns Toast-related actions
 */
export const useToastActions = () => {
  return useStore((state) => ({
    addToast: state.ui.addToast,
    removeToast: state.ui.removeToast,
    clearToasts: state.ui.clearToasts,
  }));
};

/**
 * Hook to add a toast notification.
 * @returns Add toast function
 */
export const useAddToast = () => {
  return useStore((state) => state.ui.addToast);
};

/**
 * Hook to remove a specific toast.
 * @returns Remove toast function
 */
export const useRemoveToast = () => {
  return useStore((state) => state.ui.removeToast);
};

// =============================================================================
// MODAL HOOKS
// =============================================================================

/**
 * Hook to get current modals.
 * @returns Current modals object
 */
export const useModals = () => {
  return useStore((state) => state.ui.modals);
};

/**
 * Hook to get modal actions.
 * @returns Modal-related actions
 */
export const useModalActions = () => {
  return useStore((state) => ({
    openModal: state.ui.openModal,
    closeModal: state.ui.closeModal,
    closeAllModals: state.ui.closeAllModals,
  }));
};

/**
 * Hook to get a specific modal state.
 * @param modalId - Modal identifier
 * @returns Modal state or undefined
 */
export const useModal = (modalId: string) => {
  return useStore((state) => state.ui.modals[modalId]);
};

/**
 * Hook to check if any modal is open.
 * @returns True if any modal is open
 */
export const useIsAnyModalOpen = () => {
  return useStore((state) => 
    Object.values(state.ui.modals).some(modal => modal.isOpen)
  );
};

// =============================================================================
// LOADING STATE HOOKS
// =============================================================================

/**
 * Hook to get all loading states.
 * @returns Loading states object
 */
export const useLoadingStates = () => {
  return useStore((state) => state.ui.loading);
};

/**
 * Hook to get loading actions.
 * @returns Loading state actions
 */
export const useLoadingActions = () => {
  return useStore((state) => ({
    setLoading: state.ui.setLoading,
    clearLoading: state.ui.clearLoading,
    isLoading: state.ui.isLoading,
  }));
};

/**
 * Hook to check if a specific key is loading.
 * @param key - Loading key to check
 * @returns True if loading
 */
export const useIsLoading = (key: string) => {
  return useStore((state) => state.ui.isLoading(key));
};

/**
 * Hook to check if any loading state is active.
 * @returns True if any loading is active
 */
export const useIsAnyLoading = () => {
  return useStore((state) => Object.keys(state.ui.loading).length > 0);
};

// =============================================================================
// ERROR STATE HOOKS
// =============================================================================

/**
 * Hook to get all error states.
 * @returns Error states object
 */
export const useErrorStates = () => {
  return useStore((state) => state.ui.errors);
};

/**
 * Hook to get error actions.
 * @returns Error state actions
 */
export const useErrorActions = () => {
  return useStore((state) => ({
    setError: state.ui.setError,
    clearError: state.ui.clearError,
    clearAllErrors: state.ui.clearAllErrors,
    getError: state.ui.getError,
  }));
};

/**
 * Hook to get a specific error.
 * @param key - Error key to check
 * @returns Error message or null
 */
export const useError = (key: string) => {
  return useStore((state) => state.ui.getError(key));
};

/**
 * Hook to check if any error is active.
 * @returns True if any error is active
 */
export const useHasAnyError = () => {
  return useStore((state) => Object.keys(state.ui.errors).length > 0);
};

// =============================================================================
// NAVIGATION HOOKS
// =============================================================================

/**
 * Hook to get current breadcrumbs.
 * @returns Current breadcrumbs array
 */
export const useBreadcrumbs = () => {
  return useStore((state) => state.ui.breadcrumbs);
};

/**
 * Hook to get current page title.
 * @returns Current page title or null
 */
export const usePageTitle = () => {
  return useStore((state) => state.ui.pageTitle);
};

/**
 * Hook to get navigation actions.
 * @returns Navigation-related actions
 */
export const useNavigationActions = () => {
  return useStore((state) => ({
    setBreadcrumbs: state.ui.setBreadcrumbs,
    setPageTitle: state.ui.setPageTitle,
  }));
};

// =============================================================================
// SIDEBAR HOOKS
// =============================================================================

/**
 * Hook to get sidebar state.
 * @returns True if sidebar is open
 */
export const useSidebarOpen = () => {
  return useStore((state) => state.ui.sidebarOpen);
};

/**
 * Hook to get sidebar actions.
 * @returns Sidebar-related actions
 */
export const useSidebarActions = () => {
  return useStore((state) => ({
    toggleSidebar: state.ui.toggleSidebar,
    setSidebarOpen: state.ui.setSidebarOpen,
  }));
};

/**
 * Hook to toggle sidebar.
 * @returns Toggle sidebar function
 */
export const useToggleSidebar = () => {
  return useStore((state) => state.ui.toggleSidebar);
};

// =============================================================================
// CONVENIENCE HOOKS
// =============================================================================

/**
 * Hook for quick toast notifications.
 * @returns Object with toast helper functions
 */
export const useToastHelpers = () => {
  const addToast = useStore((state) => state.ui.addToast);

  return {
    success: (message: string, description?: string) =>
      addToast({ type: 'success', message, description }),
    
    error: (message: string, description?: string) =>
      addToast({ type: 'error', message, description, duration: 0 }),
    
    warning: (message: string, description?: string) =>
      addToast({ type: 'warning', message, description }),
    
    info: (message: string, description?: string) =>
      addToast({ type: 'info', message, description }),
  };
};

/**
 * Hook for managing a specific loading state.
 * @param key - Loading key to manage
 * @returns Object with loading state and setter
 */
export const useLoadingState = (key: string) => {
  const isLoading = useStore((state) => state.ui.isLoading(key));
  const setLoading = useStore((state) => state.ui.setLoading);
  const clearLoading = useStore((state) => state.ui.clearLoading);

  return {
    isLoading,
    setLoading: (loading: boolean) => setLoading(key, loading),
    clearLoading: () => clearLoading(key),
  };
};

/**
 * Hook for managing a specific error state.
 * @param key - Error key to manage
 * @returns Object with error state and setter
 */
export const useErrorState = (key: string) => {
  const error = useStore((state) => state.ui.getError(key));
  const setError = useStore((state) => state.ui.setError);
  const clearError = useStore((state) => state.ui.clearError);

  return {
    error,
    hasError: Boolean(error),
    setError: (error: string | null) => setError(key, error),
    clearError: () => clearError(key),
  };
};

/**
 * Hook for managing a modal with typed content.
 * @param modalId - Modal identifier
 * @returns Object with modal state and actions
 */
export const useModalState = (modalId: string) => {
  const modal = useStore((state) => state.ui.modals[modalId]);
  const openModal = useStore((state) => state.ui.openModal);
  const closeModal = useStore((state) => state.ui.closeModal);

  return {
    isOpen: Boolean(modal?.isOpen),
    modal,
    open: (config: Omit<ModalState, 'isOpen'>) => openModal(modalId, config),
    close: () => closeModal(modalId),
  };
};

/**
 * Hook to get UI state summary.
 * @returns UI state summary object
 */
export const useUIState = () => {
  return useStore((state) => ({
    theme: state.ui.theme,
    sidebarOpen: state.ui.sidebarOpen,
    hasToasts: state.ui.toasts.length > 0,
    hasModals: Object.values(state.ui.modals).some(modal => modal.isOpen),
    hasLoadingStates: Object.keys(state.ui.loading).length > 0,
    hasErrors: Object.keys(state.ui.errors).length > 0,
    pageTitle: state.ui.pageTitle,
    breadcrumbsCount: state.ui.breadcrumbs.length,
  }));
}; 