# Game Night Concierge UI Component Library

A comprehensive, type-safe, and accessible component library built for the Game Night Concierge application. Built with TypeScript, Tailwind CSS, and class-variance-authority (CVA) for consistent, themeable components.

## Features

- 🎨 **Theme-aware**: Integrates seamlessly with the CSS variable-based theming system
- 🔧 **Type-safe**: Full TypeScript support with proper type inference
- ♿ **Accessible**: WCAG 2.1 AA compliant with proper ARIA attributes
- 🎯 **Consistent**: CVA-based variant system for predictable styling
- 🧪 **Well-tested**: Comprehensive test coverage with Jest and React Testing Library
- 📦 **Tree-shakeable**: Optimized exports for minimal bundle size

## Installation

The component library is part of the main application. Import components from the main index:

```tsx
import { Button, Input, Card } from '@/components/ui';
```

## Component Categories

### Form Components

#### Input

Text input with validation states and multiple sizes.

```tsx
import { Input } from '@/components/ui';

// Basic usage
<Input placeholder="Enter text..." />

// With validation states
<Input error placeholder="Error state" />
<Input success placeholder="Success state" />

// Different sizes
<Input size="sm" placeholder="Small input" />
<Input size="lg" placeholder="Large input" />
```

#### Textarea

Multi-line text input with consistent styling.

```tsx
import { Textarea } from '@/components/ui';

<Textarea placeholder="Enter longer text..." />
<Textarea size="lg" rows={6} />
```

#### Select

Dropdown selection with custom styling.

```tsx
import { Select } from '@/components/ui';

<Select placeholder="Choose an option">
  <option value="1">Option 1</option>
  <option value="2">Option 2</option>
</Select>;
```

#### Checkbox

Boolean selection with label support.

```tsx
import { Checkbox } from '@/components/ui';

<Checkbox id="agree" label="I agree to the terms" />
<Checkbox disabled label="Disabled option" />
```

#### RadioGroup

Single selection from multiple options.

```tsx
import { RadioGroup } from '@/components/ui';

const options = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
];

<RadioGroup
  name="selection"
  options={options}
  defaultValue="option1"
  onValueChange={value => console.log(value)}
/>;
```

#### FormField

Wrapper component for labels, errors, and help text.

```tsx
import { FormField, Input } from '@/components/ui';

<FormField label="Email Address" htmlFor="email" error="Please enter a valid email" required>
  <Input id="email" type="email" error />
</FormField>;
```

### Data Display Components

#### Card

Flexible content container with header, content, and footer sections.

```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button
} from '@/components/ui';

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>

// Interactive card
<Card interactive onClick={() => console.log('clicked')}>
  <CardContent>Clickable card</CardContent>
</Card>
```

#### Badge

Status indicators and tags with multiple variants.

```tsx
import { Badge } from '@/components/ui';

<Badge>Default</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="error">Error</Badge>
<Badge size="sm">Small badge</Badge>
```

#### Avatar

User profile images with automatic fallback to initials.

```tsx
import { Avatar } from '@/components/ui';

<Avatar
  src="/path/to/image.jpg"
  alt="User Name"
  fallback="UN"
  size="lg"
/>

// Without image (shows initials)
<Avatar fallback="John Doe" />
```

### Feedback Components

#### Alert

Status messages and notifications with icons.

```tsx
import { Alert, AlertTitle, AlertDescription } from '@/components/ui';

<Alert variant="success">
  <AlertTitle>Success!</AlertTitle>
  <AlertDescription>
    Your action was completed successfully.
  </AlertDescription>
</Alert>

<Alert variant="error">
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>
    Something went wrong. Please try again.
  </AlertDescription>
</Alert>
```

#### Loading

Loading states with spinner and dots variants.

```tsx
import { Loading } from '@/components/ui';

<Loading text="Loading..." />
<Loading variant="dots" size="lg" />
<Loading size="sm" />
```

### Layout Components

#### Container

Content width management with responsive breakpoints.

```tsx
import { Container } from '@/components/ui';

<Container size="lg">
  <p>Contained content</p>
</Container>

<Container size="full" padding="none">
  <p>Full width, no padding</p>
</Container>
```

#### Stack

Flexible spacing for vertical and horizontal layouts.

```tsx
import { Stack } from '@/components/ui';

// Vertical stack (default)
<Stack spacing="lg">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</Stack>

// Horizontal stack
<Stack direction="horizontal" spacing="sm" align="center">
  <div>Item 1</div>
  <div>Item 2</div>
</Stack>
```

### Overlay Components

#### Modal

Dialog overlays with backdrop and focus management.

```tsx
import {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
  Button,
} from '@/components/ui';

const [open, setOpen] = useState(false);

<Modal open={open} onOpenChange={setOpen} size="lg">
  <ModalHeader>
    <ModalTitle>Modal Title</ModalTitle>
    <ModalDescription>Modal description</ModalDescription>
  </ModalHeader>
  <div className="p-6">
    <p>Modal content</p>
  </div>
  <ModalFooter>
    <Button variant="outline" onClick={() => setOpen(false)}>
      Cancel
    </Button>
    <Button onClick={() => setOpen(false)}>Confirm</Button>
  </ModalFooter>
</Modal>;
```

## Theming

All components automatically support the application's theming system using CSS variables. Components will adapt to light/dark mode changes automatically.

### Theme Variables Used

- `--color-primary`: Primary brand color
- `--color-surface-*`: Surface colors (50-900 scale)
- `--radius-*`: Border radius values
- `--shadow-*`: Box shadow values
- `--transition-*`: Animation transitions

## Accessibility

All components follow WCAG 2.1 AA guidelines:

- Semantic HTML elements
- Proper ARIA attributes
- Keyboard navigation support
- Focus management
- Screen reader compatibility
- Color contrast compliance

## Testing

Components are thoroughly tested with Jest and React Testing Library:

```bash
# Run component tests
npm test -- --testPathPattern="components/ui"

# Run with coverage
npm test -- --testPathPattern="components/ui" --coverage
```

## Development Guidelines

### Adding New Components

1. Create component in appropriate category directory
2. Follow the CVA pattern for variants
3. Use TypeScript with proper interfaces
4. Include forwardRef for DOM elements
5. Add comprehensive tests
6. Export from main index file

### Component Structure

```tsx
'use client';

import { HTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const componentVariants = cva('base-classes', {
  variants: {
    variant: {
      /* variants */
    },
    size: {
      /* sizes */
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
});

export interface ComponentProps
  extends HTMLAttributes<HTMLElement>,
    VariantProps<typeof componentVariants> {
  // Additional props
}

export const Component = forwardRef<HTMLElement, ComponentProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <element ref={ref} className={componentVariants({ variant, size, className })} {...props} />
    );
  }
);

Component.displayName = 'Component';
```

## Performance

- Tree-shakeable exports minimize bundle size
- CVA provides efficient class generation
- Components use React.forwardRef for optimal re-renders
- No runtime CSS-in-JS overhead

## Browser Support

Components support all modern browsers that support:

- CSS Custom Properties (CSS Variables)
- ES2018+ JavaScript features
- React 18+

## Contributing

When contributing new components:

1. Follow existing patterns and conventions
2. Ensure accessibility compliance
3. Add comprehensive tests
4. Update documentation
5. Test in both light and dark themes
