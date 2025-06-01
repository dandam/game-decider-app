# Frontend Testing Guide

## Overview
This directory contains the test suite for the Game Decider App frontend. We use Jest and React Testing Library for testing our React components and utilities.

## Test Structure
- Component tests are co-located with components in `__tests__` directories
- Utility functions have tests in the same directory
- Common test utilities are in `utils/test-utils.tsx`

## Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Key Features
- Jest for test running and assertions
- React Testing Library for component testing
- User Event for simulating user interactions
- Jest DOM for DOM-specific assertions
- Automatic mocking of Next.js features

## Writing Tests
1. Use React Testing Library's queries in this order:
   - getByRole
   - getByLabelText
   - getByPlaceholderText
   - getByText
   - getByDisplayValue
   - getByAltText
   - getByTitle
   - getByTestId

2. Follow the Testing Library Guiding Principles:
   - Test your software the way users use it
   - Find elements by accessibility markers
   - Avoid implementation details

3. Common Patterns:
   ```tsx
   import { render, screen } from '@/utils/test-utils';
   import userEvent from '@testing-library/user-event';
   
   describe('ComponentName', () => {
     it('should render correctly', () => {
       render(<Component />);
       expect(screen.getByRole('button')).toBeInTheDocument();
     });
   
     it('should handle user interactions', async () => {
       const user = userEvent.setup();
       render(<Component />);
       await user.click(screen.getByRole('button'));
       expect(screen.getByText('Changed')).toBeInTheDocument();
     });
   });
   ```

## Best Practices
1. Test behavior, not implementation
2. Use semantic queries (roles, labels, text)
3. Write accessible components (they're easier to test)
4. Test error states and loading states
5. Use `data-testid` as a last resort
6. Keep tests focused and isolated

## Coverage Goals
- Minimum 80% coverage for all files
- Focus on user-facing components
- Test all interactive elements
- Test error handling and edge cases

## Mocking
- Next.js router is automatically mocked
- Next.js Image component is automatically mocked
- Add additional mocks in `jest.setup.ts`

## Debugging Tests
- Use `screen.debug()` to print the DOM
- Use `test.only` or `describe.only` to run specific tests
- Check `coverage/lcov-report/index.html` for coverage details 