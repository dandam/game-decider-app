# Game Night Concierge Frontend

This is the frontend application for Game Night Concierge, built with Next.js and Tailwind CSS.

## Theming System

The application uses a CSS variable-based theming system integrated with Tailwind CSS. This provides a flexible and maintainable approach to managing the application's visual design.

### Key Components

- `ThemeProvider`: Context provider for theme management (`/src/components/theme/ThemeProvider.tsx`)
- `ThemeToggle`: UI component for switching between light and dark modes (`/src/components/theme/ThemeToggle.tsx`)
- Theme tokens: CSS variables defined in `/src/styles/themes/tokens.css`
- Dark theme overrides: `/src/styles/themes/dark.css`

### Theme Structure

The theming system uses CSS variables for:
- Colors (surface, primary, etc.)
- Typography (font families, sizes)
- Spacing
- Border radius
- Shadows
- Transitions

### Usage in Components

```tsx
// Example of using theme variables in Tailwind classes
<div className="bg-surface-100 text-surface-900">
  <h1 className="text-xl font-sans">Themed Content</h1>
</div>
```

### Tailwind Configuration

The theme configuration in `tailwind.config.js` maps CSS variables to Tailwind's color system and other design tokens. This allows seamless use of theme variables through Tailwind's utility classes.

### Dark Mode

Dark mode is implemented using CSS variables and Tailwind's dark mode feature. The system supports both class and data-attribute based dark mode switching.

## TODO

- [ ] Add visual references for layout and component design
- [ ] Implement additional theme variants beyond light/dark
- [ ] Create theme documentation with color palette visualization
- [ ] Add theme switching animations
- [ ] Create theme-aware component variants

## Development

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

The application will be available at http://localhost:3000.

## Docker Development

The frontend is containerized using Docker. To run the frontend in a container:

```bash
docker compose up frontend
``` 