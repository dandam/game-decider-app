import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '../data-display/Card';

describe('Card Components', () => {
  describe('Card', () => {
    it('renders correctly', () => {
      render(<Card data-testid="card">Card content</Card>);
      expect(screen.getByTestId('card')).toBeInTheDocument();
    });

    it('applies different variants correctly', () => {
      const { rerender } = render(
        <Card variant="outlined" data-testid="card">
          Content
        </Card>
      );
      expect(screen.getByTestId('card')).toHaveClass('border-surface-300');

      rerender(
        <Card variant="elevated" data-testid="card">
          Content
        </Card>
      );
      expect(screen.getByTestId('card')).toHaveClass('shadow-md');

      rerender(
        <Card variant="ghost" data-testid="card">
          Content
        </Card>
      );
      expect(screen.getByTestId('card')).toHaveClass('border-transparent');
    });

    it('applies interactive styles when interactive prop is true', () => {
      render(
        <Card interactive data-testid="card">
          Interactive card
        </Card>
      );
      expect(screen.getByTestId('card')).toHaveClass('cursor-pointer');
    });

    it('handles click events when interactive', async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();

      render(
        <Card interactive onClick={handleClick} data-testid="card">
          Interactive card
        </Card>
      );

      await user.click(screen.getByTestId('card'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('CardHeader', () => {
    it('renders correctly', () => {
      render(<CardHeader data-testid="header">Header content</CardHeader>);
      expect(screen.getByTestId('header')).toBeInTheDocument();
    });
  });

  describe('CardTitle', () => {
    it('renders as h3 element', () => {
      render(<CardTitle>Card Title</CardTitle>);
      const title = screen.getByRole('heading', { level: 3 });
      expect(title).toBeInTheDocument();
      expect(title).toHaveTextContent('Card Title');
    });
  });

  describe('CardDescription', () => {
    it('renders correctly', () => {
      render(<CardDescription>Card description</CardDescription>);
      expect(screen.getByText('Card description')).toBeInTheDocument();
    });
  });

  describe('CardContent', () => {
    it('renders correctly', () => {
      render(<CardContent data-testid="content">Card content</CardContent>);
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });
  });

  describe('CardFooter', () => {
    it('renders correctly', () => {
      render(<CardFooter data-testid="footer">Footer content</CardFooter>);
      expect(screen.getByTestId('footer')).toBeInTheDocument();
    });
  });

  describe('Complete Card', () => {
    it('renders all parts together correctly', () => {
      render(
        <Card data-testid="complete-card">
          <CardHeader>
            <CardTitle>Test Card</CardTitle>
            <CardDescription>This is a test card</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Card content goes here</p>
          </CardContent>
          <CardFooter>
            <button>Action</button>
          </CardFooter>
        </Card>
      );

      expect(screen.getByTestId('complete-card')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 3, name: 'Test Card' })).toBeInTheDocument();
      expect(screen.getByText('This is a test card')).toBeInTheDocument();
      expect(screen.getByText('Card content goes here')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
    });
  });
});
