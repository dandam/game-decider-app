# How to Run and Validate Each Task

This document outlines the proper workflow for implementing, testing, and validating tasks in the Game Night Concierge project.

## Development Environment Setup

### Docker Environment
- **CRITICAL**: Use `docker compose` (NOT `docker-compose` - it's deprecated)
- The frontend runs in Docker containers, not directly with `npm run dev` on host
- Always check container status: `docker compose ps`
- Start services: `docker compose up -d`
- View logs: `docker compose logs -f [service-name]`

### Local Development (Alternative)
- If running locally: `cd frontend && npm run dev`
- Note: May use alternative ports (e.g., 3001 if 3000 is occupied)
- Check terminal output for actual port: `Local: http://localhost:3001`

## Task Implementation Workflow

### 1. Code Implementation
- Create feature branch: `git checkout -b feature/task-[number]-[description]`
- Implement according to task requirements in `docs/tasks/`
- Follow established patterns and architecture
- Ensure TypeScript compilation without errors
- Test components individually during development

### 2. Technical Validation
- **Linting**: Ensure no TypeScript/ESLint errors
- **Compilation**: Verify Next.js builds successfully
- **API Integration**: Test API calls work with real backend data
- **Responsive Design**: Test across mobile, tablet, desktop viewports
- **Theme Support**: Verify light/dark mode compatibility
- **Error Handling**: Test error states and loading states

### 3. Functional Testing
- **Core Functionality**: All acceptance criteria met
- **User Interactions**: Click handlers, form submissions, navigation
- **Data Flow**: API calls, state management, data display
- **Performance**: Page load times, filter response times
- **Accessibility**: Keyboard navigation, screen reader compatibility

### 4. Visual Quality Assurance
- **Design Consistency**: Matches existing component library
- **Typography**: Proper font weights, sizes, hierarchy
- **Spacing**: Consistent margins, padding, grid layouts
- **Colors**: Proper use of theme colors and variants
- **Interactive States**: Hover, focus, active, disabled states
- **Loading States**: Skeleton screens, spinners, progress indicators

### 5. PM Review and Approval Process

#### PM Testing Checklist
- [ ] **User Experience**: Intuitive and matches user expectations
- [ ] **Feature Completeness**: All acceptance criteria satisfied
- [ ] **Visual Polish**: Professional appearance, consistent with design system
- [ ] **Performance**: Acceptable load times and responsiveness
- [ ] **Error Handling**: Graceful failure modes and user feedback
- [ ] **Mobile Experience**: Fully functional on mobile devices
- [ ] **Integration**: Works properly with existing features

#### PM Approval Requirements
1. **Functional Demo**: Live demonstration of all features
2. **Edge Case Testing**: Handling of empty states, errors, extreme data
3. **User Journey Validation**: Complete user workflows work end-to-end
4. **Business Logic Verification**: Features align with product requirements
5. **Quality Standards**: Code quality, documentation, and maintainability

### 6. Documentation and Handoff
- **Implementation Summary**: Create `docs/implementation/task-[number]-[description].md`
- **API Documentation**: Update if new endpoints or changes made
- **Component Documentation**: Update component library docs if applicable
- **Testing Notes**: Document any special testing considerations
- **Known Issues**: Document any limitations or future improvements needed

## Common Validation Commands

### Docker Environment
```bash
# Check container status
docker compose ps

# Start all services
docker compose up -d

# View frontend logs
docker compose logs -f frontend

# Restart frontend after code changes
docker compose restart frontend

# Access frontend container shell
docker compose exec frontend sh
```

### Local Development
```bash
# Start frontend development server
cd frontend && npm run dev

# Run linting
npm run lint

# Run tests
npm run test

# Build for production (validation)
npm run build
```

### Testing URLs
- **Frontend**: http://localhost:3000 (Docker) or check terminal for actual port
- **Backend API**: http://localhost:8000
- **Admin Interface**: http://localhost:3000/data-demo (for data validation)

## Task Completion Criteria

### Technical Completion
- ✅ All TypeScript compilation errors resolved
- ✅ All linting errors resolved  
- ✅ All acceptance criteria implemented
- ✅ Responsive design working across devices
- ✅ Error handling and loading states implemented
- ✅ Integration with existing API and components

### PM Sign-off Requirements
- ✅ **Visual QA Passed**: Professional appearance, consistent styling
- ✅ **Functional QA Passed**: All features work as expected
- ✅ **User Experience Validated**: Intuitive and meets user needs
- ✅ **Performance Acceptable**: Fast load times and smooth interactions
- ✅ **Mobile Experience Verified**: Fully functional on mobile devices
- ✅ **Integration Tested**: Works with existing features and data

### Documentation Complete
- ✅ Implementation summary created in `docs/implementation/`
- ✅ Any new patterns or components documented
- ✅ Task marked as "Done" in milestone tracking
- ✅ Code committed and pushed to feature branch

## Important Notes

- **PM Approval Required**: Tasks are not complete until PM (Dan) provides explicit sign-off
- **Real Data Testing**: Always test with actual BoardGameArena data, not mock data
- **Performance Standards**: Initial page load < 2 seconds, interactions < 500ms
- **Browser Support**: Test in Chrome, Firefox, Safari, and mobile browsers
- **Accessibility**: Ensure WCAG 2.1 AA compliance for all interactive elements

## Troubleshooting

### Common Issues
- **Port Conflicts**: Check terminal output for actual port being used
- **Docker Issues**: Restart containers with `docker compose restart`
- **API Connection**: Verify backend is running and accessible
- **Build Errors**: Check for TypeScript errors and missing dependencies
- **Styling Issues**: Verify Tailwind classes and theme variables are correct

### Getting Help
- Check existing implementation summaries in `docs/implementation/`
- Review component library documentation
- Test against working features for patterns
- Consult architecture documentation for design decisions

---

**Remember**: Quality over speed. It's better to take time to implement features properly than to rush and create technical debt or poor user experiences. 