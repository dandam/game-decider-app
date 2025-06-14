# Task 49: Frontend Component Library

**Milestone**: 2 - MVP Core  
**Priority**: P1  
**Status**: To Do  
**Size**: M  
**Branch**: `feature/task-49-component-library`

## Context & Background

You are working on the **Game Night Concierge** application, a modern web app that helps friends make better decisions about what board games to play on BoardGameArena.com. This is **Task 49** from **Milestone 2: MVP Core**, focusing on creating a comprehensive frontend component library.

## Current Project State

**Tech Stack:**
- **Frontend**: Next.js 15.3.3 with App Router, TypeScript, Tailwind CSS
- **Component Architecture**: class-variance-authority (CVA) for variant-based styling
- **Theming**: CSS variables + Tailwind integration with dark mode support
- **Testing**: Jest + React Testing Library with 80% coverage threshold
- **State Management**: React Context (theme management implemented)

**Existing Foundation:**
- ✅ Theming system with CSS variables and dark mode (Task #23)
- ✅ API client setup with TypeScript types (Task #48)
- ✅ Base project structure with Docker development environment
- ✅ One example component: `Button.tsx` using CVA pattern

**Current Component Structure:**
```
frontend/src/components/
├── theme/
│   ├── ThemeProvider.tsx    # Context provider for theme management
│   └── ThemeToggle.tsx      # Theme switching component
└── ui/
    └── Button.tsx           # Example component with CVA variants
```

## Task Requirements

Create a comprehensive, reusable component library that supports the Game Night Concierge MVP features. The library should be:

1. **Type-safe** with full TypeScript support
2. **Theme-aware** using the existing CSS variable system
3. **Accessible** following WCAG 2.1 AA guidelines
4. **Consistent** with established patterns (CVA, theme tokens)
5. **Well-tested** with comprehensive test coverage
6. **Documented** with clear usage examples

## Required Components

Based on the MVP requirements and API structure, implement these core components:

### Form Components
- **Input** - Text input with validation states
- **Textarea** - Multi-line text input
- **Select** - Dropdown selection
- **Checkbox** - Boolean selection
- **RadioGroup** - Single selection from options
- **FormField** - Wrapper with label, error, and help text

### Data Display
- **Card** - Content container with variants
- **Badge** - Status indicators and tags
- **Avatar** - User profile images with fallbacks
- **Table** - Data tables with sorting/filtering
- **List** - Structured data lists
- **Stat** - Key metrics display

### Navigation
- **Tabs** - Content switching
- **Breadcrumb** - Navigation hierarchy
- **Pagination** - Data navigation

### Feedback
- **Alert** - Status messages and notifications
- **Toast** - Temporary notifications
- **Loading** - Loading states and spinners
- **EmptyState** - No data states

### Layout
- **Container** - Content width management
- **Stack** - Vertical/horizontal spacing
- **Grid** - Responsive grid layouts
- **Divider** - Content separation

### Overlays
- **Modal** - Dialog overlays
- **Popover** - Contextual overlays
- **Tooltip** - Hover information

## Implementation Guidelines

### 1. Component Architecture
```tsx
// Use CVA for variant-based styling
import { cva, type VariantProps } from 'class-variance-authority';

const componentVariants = cva(
  'base-classes',
  {
    variants: {
      variant: { /* variants */ },
      size: { /* sizes */ },
    },
    defaultVariants: { /* defaults */ },
  }
);

interface ComponentProps
  extends HTMLAttributes<HTMLElement>,
    VariantProps<typeof componentVariants> {
  // Additional props
}
```

### 2. Theme Integration
- Use CSS variables from `tokens.css` (e.g., `bg-surface-100`, `text-surface-900`)
- Support dark mode automatically via theme system
- Follow established color palette and spacing scale

### 3. Accessibility Requirements
- Semantic HTML elements
- ARIA attributes where needed
- Keyboard navigation support
- Focus management
- Screen reader compatibility

### 4. File Organization
```
frontend/src/components/ui/
├── forms/
│   ├── Input.tsx
│   ├── Select.tsx
│   └── FormField.tsx
├── data-display/
│   ├── Card.tsx
│   ├── Table.tsx
│   └── Badge.tsx
├── navigation/
│   ├── Tabs.tsx
│   └── Pagination.tsx
├── feedback/
│   ├── Alert.tsx
│   └── Loading.tsx
├── layout/
│   ├── Container.tsx
│   └── Stack.tsx
├── overlays/
│   ├── Modal.tsx
│   └── Tooltip.tsx
└── index.ts  # Barrel exports
```

### 5. Testing Requirements
- Unit tests for each component
- Accessibility tests using jest-axe
- Theme switching tests
- User interaction tests
- Minimum 80% coverage

## Domain-Specific Context

The components will be used for:
- **Player Management**: Profile forms, player lists, preference settings
- **Game Library**: Game cards, filtering, search results
- **Game Sessions**: Session creation, player selection, game matching
- **Analytics**: Statistics display, progress tracking

## Acceptance Criteria

### 1. Component Library Structure
- [ ] All required components implemented
- [ ] Consistent API patterns across components
- [ ] Proper TypeScript types and interfaces
- [ ] CVA-based variant system

### 2. Theme Integration
- [ ] All components use theme tokens
- [ ] Dark mode support works correctly
- [ ] Consistent visual hierarchy

### 3. Accessibility
- [ ] WCAG 2.1 AA compliance
- [ ] Keyboard navigation
- [ ] Screen reader support
- [ ] Focus management

### 4. Testing
- [ ] Unit tests for all components
- [ ] Accessibility tests
- [ ] 80%+ test coverage
- [ ] Integration with existing test setup

### 5. Documentation
- [ ] Storybook-style component documentation
- [ ] Usage examples for each component
- [ ] Props documentation
- [ ] Migration guide from existing components

### 6. Performance
- [ ] Tree-shaking friendly exports
- [ ] Minimal bundle impact
- [ ] Efficient re-renders

## Technical Constraints

- **No new major dependencies** - work with existing stack
- **Maintain existing patterns** - follow Button.tsx example
- **Backward compatibility** - don't break existing theme system
- **Bundle size** - keep component library under 50KB gzipped

## Getting Started

1. **Create new branch**: `feature/task-49-component-library`
2. **Review existing patterns**: Study `Button.tsx` and theme system
3. **Start with core components**: Input, Card, Alert (most commonly used)
4. **Test incrementally**: Write tests as you build each component
5. **Document as you go**: Create usage examples for each component

## Success Metrics

- All MVP user flows can be built with component library
- 100% TypeScript coverage with no `any` types
- 80%+ test coverage across all components
- Zero accessibility violations in automated testing
- Positive developer experience (clear APIs, good IntelliSense)

## Resources

- **Existing Button component**: `frontend/src/components/ui/Button.tsx`
- **Theme tokens**: `frontend/src/styles/themes/tokens.css`
- **API types**: `frontend/src/lib/api/types.ts`
- **Testing setup**: `frontend/__tests__/README.md`
- **Theming documentation**: `docs/spikes/theming-strategy.md`

## Dependencies

- **Blocked by**: None (all prerequisites completed)
- **Blocks**: 
  - Task #34: Player profile UI components
  - Task #35: Game library UI components
  - Task #38: Player preferences UI
  - Task #50: Loading and error states

## Notes

This component library will serve as the foundation for all MVP frontend features and should be built with extensibility in mind for future enhancements. The implementation should prioritize:

1. **Developer Experience**: Clear APIs, good TypeScript support, helpful error messages
2. **User Experience**: Consistent interactions, smooth animations, accessible design
3. **Maintainability**: Well-organized code, comprehensive tests, clear documentation
4. **Performance**: Efficient rendering, minimal bundle size, tree-shaking support

The component library is a critical foundation piece that will accelerate development of all subsequent UI tasks in the milestone. 