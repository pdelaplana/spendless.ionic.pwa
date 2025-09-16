# Pull Request

## Description
<!-- Provide a brief description of the changes in this PR -->

## Type of Change
<!-- Check the boxes that apply -->
- [ ] 🐛 Bug fix (non-breaking change which fixes an issue)
- [ ] ✨ New feature (non-breaking change which adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] 📚 Documentation (changes to documentation)
- [ ] 🎨 Style (formatting, missing semi colons, etc; no code change)
- [ ] ♻️ Refactoring (no functional changes, no api changes)
- [ ] ⚡ Performance improvements
- [ ] ✅ Test (adding missing tests, refactoring tests; no production code change)
- [ ] 🔧 Build/CI (changes to build process or continuous integration)

## Related Issues
<!-- Link to any related issues -->
Closes #

## Testing
<!-- Describe the tests you ran to verify your changes -->
- [ ] Unit tests pass (`npm run test.unit`)
- [ ] E2E tests pass (`npm run test.e2e`)
- [ ] Code linting passes (`npm run lint`)
- [ ] Build succeeds (`npm run build`)

## Code Quality Checklist
<!-- Verify your changes meet the Spendless coding standards -->
- [ ] TypeScript strict mode compliance
- [ ] Proper import organization (external → internal → relative)
- [ ] Design system token usage (no hardcoded values)
- [ ] Error handling with Sentry integration
- [ ] JSDoc comments for public APIs
- [ ] Accessibility attributes for interactive elements
- [ ] Consistent naming conventions followed

## Architecture Compliance
- [ ] Domain logic separated from UI concerns
- [ ] Hooks follow established patterns (`use[Action][Entity]`)
- [ ] State management uses TanStack Query + Context
- [ ] Firebase operations include proper error handling
- [ ] Components use provider pattern for shared state

## Screenshots/Videos
<!-- If applicable, add screenshots or videos to help explain your changes -->

## Additional Notes
<!-- Any additional information that would be helpful for reviewers -->

## Reviewer Notes
<!-- For maintainers - any specific areas to focus on during review -->