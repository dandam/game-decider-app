import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MainLayout from '../MainLayout';

describe('MainLayout', () => {
  it('renders navigation links correctly', () => {
    render(
      <MainLayout>
        <div>Test Content</div>
      </MainLayout>
    );

    // Check if all navigation links are present
    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /games/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /sessions/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /profile/i })).toBeInTheDocument();
  });

  it('renders children content', () => {
    const testContent = 'Test Child Content';
    render(
      <MainLayout>
        <div>{testContent}</div>
      </MainLayout>
    );

    expect(screen.getByText(testContent)).toBeInTheDocument();
  });

  it('toggles mobile menu on button click', async () => {
    const user = userEvent.setup();
    render(
      <MainLayout>
        <div>Test Content</div>
      </MainLayout>
    );

    // Mobile menu should be hidden initially
    const mobileMenu = screen.getByRole('navigation', { hidden: true });
    expect(mobileMenu).not.toBeVisible();

    // Click the menu button
    const menuButton = screen.getByRole('button', { name: /open menu/i });
    await user.click(menuButton);

    // Mobile menu should be visible
    expect(mobileMenu).toBeVisible();

    // Click the close button
    const closeButton = screen.getByRole('button', { name: /close menu/i });
    await user.click(closeButton);

    // Mobile menu should be hidden again
    expect(mobileMenu).not.toBeVisible();
  });
}); 