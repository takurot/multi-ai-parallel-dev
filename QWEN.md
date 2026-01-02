# AI Multi-Tool Parallel Dev Orchestrator - Project Context

## Project Overview

The AI Multi-Tool Parallel Dev Orchestrator is a platform that orchestrates multiple AI coding tools (like Codex CLI, Claude Code, OpenAI/Anthropic APIs) to automatically generate and execute development plans from task lists with dependencies. The project enables parallel development by managing task dependencies, selecting appropriate AI models based on task complexity, and handling validation and review processes.

### Key Features
- **Task Dependency Management**: Builds DAGs (Directed Acyclic Graphs) from YAML-defined task lists
- **Parallel Execution**: Executes independent tasks in parallel to improve development speed
- **Dynamic Model Selection**: Automatically assigns optimal LLM models based on task difficulty and cost targets
- **Auto Validation & Self-Healing**: Runs tests/linting after implementation and includes automatic fix loops when failing
- **Cross Review**: AI peer review pipeline between different models
- **Conflict Resolution**: Automatic detection and rebasing of merge conflicts in parallel development

### Architecture Components
The project is organized into several key modules:
- `adapters/` - Tool adapter interfaces for different AI coding tools
- `cli/` - Command-line interface implementation
- `config/` - Configuration file loading and schema definitions
- `dag/` - DAG construction and topological sorting logic
- `git/` - Git operations and worktree management
- `policy/` - Model selection and cost policy engine (recently implemented PR-06)
- `scheduler/` - Task scheduling and execution management
- `tasks/` - Task definition parsing and validation
- `types/` - Shared type definitions
- `validation/` - Validation pipeline for tests/linting
- `review/` - Cross-review functionality
- `context/` - Context management for dependent tasks
- `visualization/` - Status and graph visualization

## Building and Running

### Prerequisites
- Node.js v20 or higher
- Git

### Setup
```bash
npm install
```

### Building
```bash
npm run build  # Compiles TypeScript to JavaScript in dist/ directory
```

### Running
```bash
npm start  # Runs the built application
npm run dev  # Runs in development mode with auto-restart
npx orchestrator --help  # Shows CLI help after building
```

### Testing
```bash
npm test  # Run all tests
npm run test:watch  # Run tests in watch mode
npm run test:coverage  # Run tests with coverage report
```

### Linting and Formatting
```bash
npm run lint  # Check code quality
npm run format  # Format code with Prettier
```

## Development Conventions

### Code Structure
- Written in TypeScript with strict mode enabled
- Uses ES modules (`import`/`export`) rather than CommonJS
- Follows a modular architecture with clear separation of concerns
- Each module has its own subdirectory with related functionality

### Testing
- Test Driven Development (TDD) approach is strongly encouraged
- Tests are co-located with source files using `.test.ts` suffix
- Unit test coverage target is 80%+ for new features
- Integration and E2E tests are also part of the test suite

### Git Workflow
- Feature branches follow the pattern `feature/PR-XX-<name>`
- Pull requests are created for each PR implementation
- Commits should be in English using imperative mood
- Follow the implementation plan in `docs/PLAN.md`

### Project Phases
The project is organized in three phases:
1. **Phase 1: Core** - Basic infrastructure (project setup, task schema, DAG builder, Git manager, tool adapters, model policy engine)
2. **Phase 2: Reliability** - Validation, self-healing, cross-review, escalation, dry-run
3. **Phase 3: Expansion** - Web API, UI, advanced features

### Current Status
As of the latest update, PR-06 (Model & Cost Policy Engine) has been completed, which includes:
- Model profile type definitions and parsing
- Cost calculation utilities
- Model selection logic based on cost tier and complexity hints
- Budget management with spending tracking and warning thresholds

## Key Files and Directories

- `package.json` - Project dependencies, scripts, and CLI entry point
- `tsconfig.json` - TypeScript compilation configuration
- `docs/SPEC.md` - Detailed specification of the system
- `docs/PLAN.md` - Implementation roadmap and progress tracking
- `docs/PROMPT.md` - Development guidelines and AI assistant instructions
- `src/policy/` - Recently implemented model policy engine components
- `.eslintrc.json` - ESLint configuration for code quality
- `.gitignore` - Git ignore patterns

## CLI Usage

After building, the orchestrator can be used as:
```bash
npx orchestrator init          # Initialize a new project
npx orchestrator run tasks.yaml  # Execute a task list
npx orchestrator validate tasks.yaml  # Validate task file
npx orchestrator status        # Check execution status
npx orchestrator plan --dry-run  # Estimate costs without executing
```

## Development Guidelines

- Always follow the TDD approach: write tests first, then implement
- Maintain type safety - avoid using `any` type
- Follow existing code patterns and conventions
- Update PLAN.md when completing PRs
- Write comprehensive tests for new functionality
- Ensure all tests pass and linting succeeds before committing