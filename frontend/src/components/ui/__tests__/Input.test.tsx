import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '../forms/Input';

describe('Input', () => {
  it('renders correctly', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('handles user input', async () => {
    const user = userEvent.setup();
    render(<Input placeholder="Enter text" />);

    const input = screen.getByPlaceholderText('Enter text');
    await user.type(input, 'Hello World');

    expect(input).toHaveValue('Hello World');
  });

  it('applies error variant when error prop is true', () => {
    render(<Input error placeholder="Enter text" />);
    const input = screen.getByPlaceholderText('Enter text');

    expect(input).toHaveClass('border-red-500');
  });

  it('applies success variant when success prop is true', () => {
    render(<Input success placeholder="Enter text" />);
    const input = screen.getByPlaceholderText('Enter text');

    expect(input).toHaveClass('border-green-500');
  });

  it('applies different sizes correctly', () => {
    const { rerender } = render(<Input size="sm" placeholder="Small" />);
    expect(screen.getByPlaceholderText('Small')).toHaveClass('h-8');

    rerender(<Input size="lg" placeholder="Large" />);
    expect(screen.getByPlaceholderText('Large')).toHaveClass('h-12');
  });

  it('is disabled when disabled prop is true', () => {
    render(<Input disabled placeholder="Disabled input" />);
    const input = screen.getByPlaceholderText('Disabled input');

    expect(input).toBeDisabled();
    expect(input).toHaveClass('disabled:opacity-50');
  });

  it('forwards ref correctly', () => {
    const ref = { current: null };
    render(<Input ref={ref} placeholder="Ref test" />);

    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('supports different input types', () => {
    render(<Input type="email" placeholder="Email" />);
    const input = screen.getByPlaceholderText('Email');

    expect(input).toHaveAttribute('type', 'email');
  });
});
