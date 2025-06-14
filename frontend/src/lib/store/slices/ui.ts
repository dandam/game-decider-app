/**
 * UI slice for managing application-wide UI state.
 * Handles theme, modals, toasts, loading states, and navigation.
 */

import { StateCreator } from 'zustand';
import { produce } from 'immer';
import type { UISlice, RootState, Theme, ToastState } from '../types';

// Toast auto-dismiss time in milliseconds
const DEFAULT_TOAST_DURATION = 5000;

// Maximum number of toasts to show at once
const MAX_TOASTS = 5;

/**
 * Creates the UI slice with all UI-related state and actions.
 */
export const createUISlice: StateCreator<
  RootState,
  [['zustand/devtools', never]],
  [],
  UISlice
> = (set, get) => ({
  // =============================================================================
  // INITIAL STATE
  // =============================================================================
  
  theme: 'system',
  sidebarOpen: false,
  modals: {},
  toasts: [],
  loading: {},
  errors: {},
  breadcrumbs: [],
  pageTitle: null,

  // =============================================================================
  // THEME MANAGEMENT
  // =============================================================================

  /**
   * Sets the application theme.
   * @param theme - Theme to set ('light', 'dark', or 'system')
   */
  setTheme: (theme) => {
    set(produce((state: RootState) => {
      state.ui.theme = theme;
    }), false, 'ui/set-theme');

    // Persist theme preference
    if (typeof window !== 'undefined') {
      localStorage.setItem('game-decider-theme', theme);
    }

    // Apply theme to document
    applyThemeToDocument(theme);
  },

  /**
   * Toggles between light and dark themes.
   */
  toggleTheme: () => {
    const currentTheme = get().ui.theme;
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    get().ui.setTheme(newTheme);
  },

  // =============================================================================
  // SIDEBAR MANAGEMENT
  // =============================================================================

  /**
   * Toggles the sidebar open/closed state.
   */
  toggleSidebar: () => {
    set(produce((state: RootState) => {
      state.ui.sidebarOpen = !state.ui.sidebarOpen;
    }), false, 'ui/toggle-sidebar');
  },

  /**
   * Sets the sidebar open state.
   * @param open - Whether sidebar should be open
   */
  setSidebarOpen: (open) => {
    set(produce((state: RootState) => {
      state.ui.sidebarOpen = open;
    }), false, 'ui/set-sidebar-open');
  },

  // =============================================================================
  // MODAL MANAGEMENT
  // =============================================================================

  /**
   * Opens a modal with the specified configuration.
   * @param id - Unique modal identifier
   * @param modal - Modal configuration
   */
  openModal: (id, modal) => {
    set(produce((state: RootState) => {
      state.ui.modals[id] = {
        ...modal,
        isOpen: true,
      };
    }), false, 'ui/open-modal');
  },

  /**
   * Closes a specific modal.
   * @param id - Modal identifier to close
   */
  closeModal: (id) => {
    set(produce((state: RootState) => {
      if (state.ui.modals[id]) {
        state.ui.modals[id].isOpen = false;
      }
    }), false, 'ui/close-modal');

    // Clean up modal after animation time
    setTimeout(() => {
      set(produce((state: RootState) => {
        delete state.ui.modals[id];
      }), false, 'ui/cleanup-modal');
    }, 300); // Match typical modal animation duration
  },

  /**
   * Closes all open modals.
   */
  closeAllModals: () => {
    set(produce((state: RootState) => {
      Object.keys(state.ui.modals).forEach(id => {
        if (state.ui.modals[id].isOpen) {
          state.ui.modals[id].isOpen = false;
        }
      });
    }), false, 'ui/close-all-modals');

    // Clean up all modals after animation
    setTimeout(() => {
      set(produce((state: RootState) => {
        state.ui.modals = {};
      }), false, 'ui/cleanup-all-modals');
    }, 300);
  },

  // =============================================================================
  // TOAST MANAGEMENT
  // =============================================================================

  /**
   * Adds a toast notification.
   * @param toast - Toast configuration
   * @returns Toast ID for manual removal
   */
  addToast: (toast) => {
    const id = generateToastId();
    const duration = toast.duration ?? DEFAULT_TOAST_DURATION;
    
    const fullToast: ToastState = {
      ...toast,
      id,
      duration,
      dismissible: toast.dismissible ?? true,
    };

    set(produce((state: RootState) => {
      // Add to beginning of array (newest first)
      state.ui.toasts.unshift(fullToast);
      
      // Respect maximum toasts limit
      if (state.ui.toasts.length > MAX_TOASTS) {
        state.ui.toasts = state.ui.toasts.slice(0, MAX_TOASTS);
      }
    }), false, 'ui/add-toast');

    // Auto-dismiss if duration is set
    if (duration > 0) {
      setTimeout(() => {
        get().ui.removeToast(id);
      }, duration);
    }

    return id;
  },

  /**
   * Removes a specific toast.
   * @param id - Toast ID to remove
   */
  removeToast: (id) => {
    set(produce((state: RootState) => {
      state.ui.toasts = state.ui.toasts.filter(toast => toast.id !== id);
    }), false, 'ui/remove-toast');
  },

  /**
   * Clears all toasts.
   */
  clearToasts: () => {
    set(produce((state: RootState) => {
      state.ui.toasts = [];
    }), false, 'ui/clear-toasts');
  },

  // =============================================================================
  // LOADING STATE MANAGEMENT
  // =============================================================================

  /**
   * Sets loading state for a specific key.
   * @param key - Loading state key
   * @param loading - Loading state
   */
  setLoading: (key, loading) => {
    set(produce((state: RootState) => {
      if (loading) {
        state.ui.loading[key] = true;
      } else {
        delete state.ui.loading[key];
      }
    }), false, 'ui/set-loading');
  },

  /**
   * Clears loading state for a specific key.
   * @param key - Loading state key to clear
   */
  clearLoading: (key) => {
    set(produce((state: RootState) => {
      delete state.ui.loading[key];
    }), false, 'ui/clear-loading');
  },

  // =============================================================================
  // ERROR STATE MANAGEMENT
  // =============================================================================

  /**
   * Sets error state for a specific key.
   * @param key - Error state key
   * @param error - Error message or null to clear
   */
  setError: (key, error) => {
    set(produce((state: RootState) => {
      if (error) {
        state.ui.errors[key] = error;
      } else {
        delete state.ui.errors[key];
      }
    }), false, 'ui/set-error');
  },

  /**
   * Clears error state for a specific key.
   * @param key - Error state key to clear
   */
  clearError: (key) => {
    set(produce((state: RootState) => {
      delete state.ui.errors[key];
    }), false, 'ui/clear-error');
  },

  /**
   * Clears all error states.
   */
  clearAllErrors: () => {
    set(produce((state: RootState) => {
      state.ui.errors = {};
    }), false, 'ui/clear-all-errors');
  },

  // =============================================================================
  // NAVIGATION MANAGEMENT
  // =============================================================================

  /**
   * Sets the breadcrumb navigation.
   * @param breadcrumbs - Array of breadcrumb items
   */
  setBreadcrumbs: (breadcrumbs) => {
    set(produce((state: RootState) => {
      state.ui.breadcrumbs = breadcrumbs;
    }), false, 'ui/set-breadcrumbs');
  },

  /**
   * Sets the page title.
   * @param title - Page title or null to clear
   */
  setPageTitle: (title) => {
    set(produce((state: RootState) => {
      state.ui.pageTitle = title;
    }), false, 'ui/set-page-title');

    // Update document title
    if (typeof window !== 'undefined' && title) {
      document.title = `${title} - Game Decider`;
    } else if (typeof window !== 'undefined') {
      document.title = 'Game Decider';
    }
  },

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  /**
   * Checks if a specific loading state is active.
   * @param key - Loading state key
   * @returns True if loading
   */
  isLoading: (key) => {
    return Boolean(get().ui.loading[key]);
  },

  /**
   * Gets error message for a specific key.
   * @param key - Error state key
   * @returns Error message or null
   */
  getError: (key) => {
    return get().ui.errors[key] || null;
  },
});

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Generates a unique toast ID.
 * @returns Unique toast identifier
 */
const generateToastId = (): string => {
  return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Applies theme to the document element.
 * @param theme - Theme to apply
 */
const applyThemeToDocument = (theme: Theme): void => {
  if (typeof window === 'undefined') return;

  const root = document.documentElement;
  
  // Remove existing theme classes
  root.classList.remove('light', 'dark');
  
  if (theme === 'system') {
    // Use system preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    root.classList.add(mediaQuery.matches ? 'dark' : 'light');
    
    // Listen for system theme changes
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      root.classList.remove('light', 'dark');
      root.classList.add(e.matches ? 'dark' : 'light');
    };
    
    mediaQuery.addEventListener('change', handleSystemThemeChange);
  } else {
    root.classList.add(theme);
  }
};

/**
 * Hydrates theme from localStorage on app startup.
 * Should be called once during app initialization.
 */
export const hydrateTheme = (): Theme => {
  if (typeof window === 'undefined') {
    return 'system';
  }

  const savedTheme = localStorage.getItem('game-decider-theme') as Theme;
  const validThemes: Theme[] = ['light', 'dark', 'system'];
  
  if (savedTheme && validThemes.includes(savedTheme)) {
    applyThemeToDocument(savedTheme);
    return savedTheme;
  }
  
  // Default to system preference
  applyThemeToDocument('system');
  return 'system';
};

/**
 * Convenience function to add success toast.
 * @param message - Success message
 * @param description - Optional description
 */
export const addSuccessToast = (
  addToast: UISlice['addToast'],
  message: string,
  description?: string
): string => {
  return addToast({
    type: 'success',
    message,
    description,
  });
};

/**
 * Convenience function to add error toast.
 * @param message - Error message
 * @param description - Optional description
 */
export const addErrorToast = (
  addToast: UISlice['addToast'],
  message: string,
  description?: string
): string => {
  return addToast({
    type: 'error',
    message,
    description,
    duration: 0, // Don't auto-dismiss errors
  });
};

/**
 * Convenience function to add warning toast.
 * @param message - Warning message
 * @param description - Optional description
 */
export const addWarningToast = (
  addToast: UISlice['addToast'],
  message: string,
  description?: string
): string => {
  return addToast({
    type: 'warning',
    message,
    description,
  });
};

/**
 * Convenience function to add info toast.
 * @param message - Info message
 * @param description - Optional description
 */
export const addInfoToast = (
  addToast: UISlice['addToast'],
  message: string,
  description?: string
): string => {
  return addToast({
    type: 'info',
    message,
    description,
  });
}; 