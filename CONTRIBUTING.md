# Contributing to Tecnophite Registration Portal

Thank you for contributing! Please follow these guidelines.

## Getting Started

1. Fork the repository
2. Clone your fork locally
3. Create a feature branch from `develop`:
   ```bash
   git checkout develop
   git checkout -b feature/your-feature-name
   ```
4. Set up both frontend and backend as described in the root `README.md`

## Development Workflow

1. Make your changes in your feature branch
2. Write/update tests for your changes
3. Ensure linting passes:
   - Frontend: `npm run lint`
   - Backend: `flake8 app/`
4. Commit with descriptive messages following [Conventional Commits](https://www.conventionalcommits.org/):
   ```
   feat: add event registration endpoint
   fix: resolve login redirect loop
   docs: update API reference for /events
   ```
5. Push your branch and open a Pull Request to `develop`

## Pull Request Guidelines

- Reference related issues in your PR description
- Include screenshots for UI changes
- Ensure CI checks pass before requesting review
- Keep PRs focused — one feature/fix per PR

## Code Style

- **Frontend:** ESLint + Prettier (auto-formatted on save)
- **Backend:** PEP 8, enforced via `black` and `flake8`

## Reporting Issues

Open a GitHub Issue with:
- Steps to reproduce
- Expected vs. actual behavior
- Screenshots (if applicable)
- Browser/OS information
