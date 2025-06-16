import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';

// Add providers here if needed (e.g., Theme, Auth, etc.)
const Providers = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, { wrapper: Providers, ...options });

// Re-export everything
export * from '@testing-library/react';

// Override render method
export { customRender as render };
