# BL1NK SDK Development Guidelines

🏗️ Monorepo Structure Overview

```
bl1nk/
├── core/                          # Shared core libraries
│   ├── types/                     # TypeScript shared types
│   ├── schemas/                   # Rust validation schemas  
│   └── utils/                     # Shared utilities
├── sdks/                          # Language-specific SDKs
│   ├── rust/                      # Rust SDK (Cargo workspace)
│   ├── python/                    # Python SDK (Poetry workspace)
│   └── nodejs/                    # Node.js SDK (pnpm workspace)
├── spec/                          # API specifications (OpenAPI)
├── plugins/                       # Built-in MCP plugins
├── examples/                      # Usage examples
├── docs/                          # Documentation
└── scripts/                       # Build and utility scripts
```

🚀 Getting Started

Prerequisites

```bash
# Install all required tools
make setup-deps

# Or install manually:
# Rust: curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
# Python: pip install poetry
# Node.js: npm install -g pnpm
# Make: (usually pre-installed on Unix systems)
```

Initial Setup

```bash
# Clone the repository
git clone https://github.com/UnicornXOS/bl1nk-sdk.git
cd bl1nk-sdk

# Install all dependencies
make install

# Build all SDKs
make build

# Run tests
make test
```

📁 Project Organization

Core Libraries (core/)

Purpose: Shared logic and types across all language SDKs.

· core/types/: TypeScript type definitions shared across Node.js and frontend
· core/schemas/: Rust-based JSON schemas for validation
· core/utils/: Utility functions shared across languages

SDKs (sdks/)

Each language SDK follows similar structure:

```
sdks/{language}/
├── bl1nk-sdk/          # Main SDK package
├── bl1nk-agent/        # Agent framework (if exists)
├── bl1nk-cli/          # CLI tools (if exists)
└── bl1nk-*/            # Other packages
```

Specifications (spec/)

· Single Source of Truth: All API definitions
· Code Generation: SDKs are partially generated from specs
· Version Control: OpenAPI specs are versioned alongside code

🛠️ Development Workflow

1. Making Changes

```bash
# Create a feature branch
git checkout -b feat/add-new-tool

# Make changes across languages
# Use the unified commands:

# Generate code from updated OpenAPI spec
make generate

# Build all SDKs to verify
make build

# Run tests
make test

# Format code
make format

# Lint code
make lint
```

2. Cross-Language Development

When adding a feature that needs to work across all languages:

1. Update OpenAPI spec (spec/openapi.yaml) first
2. Run code generation: make generate
3. Implement business logic in each language
4. Add tests in each language
5. Verify consistency: make test-cross-language

3. Adding a New Endpoint

Example workflow for adding /v1/plugins/{id}/tools endpoint:

```bash
# 1. Update OpenAPI spec
vim spec/openapi.yaml
# Add new path definition

# 2. Generate code
make generate

# 3. Implement in each SDK
# Rust: sdks/rust/bl1nk-sdk/src/api/plugins.rs
# Python: sdks/python/bl1nk-sdk/bl1nk/api/plugins.py
# Node.js: sdks/nodejs/packages/bl1nk-sdk/src/api/plugins.ts

# 4. Add tests
# Add corresponding test files in each language

# 5. Verify
make test
```

🔧 Build System

Unified Make Commands

```bash
# Build everything
make build

# Build specific language
make build-rust
make build-python
make build-nodejs

# Clean builds
make clean

# Generate documentation
make docs
```

Language-Specific Builds

Rust:

```bash
cd sdks/rust
cargo build --release
cargo test
cargo fmt
cargo clippy
```

Python:

```bash
cd sdks/python
poetry install
poetry run pytest
poetry run black .
poetry run ruff check .
```

Node.js:

```bash
cd sdks/nodejs
pnpm install
pnpm run build
pnpm run test
pnpm run lint
pnpm run format
```

🧪 Testing Strategy

Test Pyramid

1. Unit Tests (70%): Isolated component tests
2. Integration Tests (20%): Cross-component tests
3. E2E Tests (10%): Full system tests
4. Cross-Language Tests: Ensure consistency

Running Tests

```bash
# Run all tests
make test

# Run specific test suites
make test-unit           # Unit tests only
make test-integration    # Integration tests
make test-e2e           # End-to-end tests
make test-cross-language # Cross-language consistency

# Test specific SDK
make test-rust
make test-python  
make test-nodejs

# With coverage
make test-coverage
```

Writing Tests

Test File Structure:

```
sdks/rust/bl1nk-sdk/tests/
├── unit/
│   ├── client_test.rs
│   └── api_test.rs
├── integration/
│   └── plugin_integration_test.rs
└── e2e/
    └── full_workflow_test.rs
```

Example Test (Rust):

```rust
#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_plugin_creation() {
        let plugin = Plugin::new("test-plugin");
        assert_eq!(plugin.id(), "test-plugin");
    }
    
    #[tokio::test]
    async fn test_async_client() {
        let client = Client::new();
        let result = client.get_plugin("test").await;
        assert!(result.is_ok());
    }
}
```

📝 Code Standards

Style Guidelines

Rust:

· Follow Rustfmt and Clippy defaults
· Use snake_case for functions/variables
· Use PascalCase for types
· Document all public APIs with /// comments

Python:

· Follow PEP 8
· Use Black for formatting
· Use type hints for all functions
· Google-style docstrings

TypeScript:

· Use ESLint and Prettier
· Strict TypeScript mode
· Camel case for functions/variables
· Pascal case for types/interfaces

Documentation Standards

All public APIs must include:

```rust
/// Fetches a plugin by its ID.
///
/// # Arguments
/// * `plugin_id` - The unique identifier of the plugin
/// * `client` - Authenticated HTTP client
///
/// # Returns
/// `Result<Plugin, ApiError>` - Plugin data or error
///
/// # Errors
/// Returns `ApiError::NotFound` if plugin doesn't exist
///
/// # Examples
/// ```
/// let plugin = fetch_plugin("weather", &client).await?;
/// ```
pub async fn fetch_plugin(plugin_id: &str, client: &Client) -> Result<Plugin, ApiError> {
    // implementation
}
```

Error Handling

Consistent error patterns across languages:

```rust
// Rust
#[derive(Debug, thiserror::Error)]
pub enum Bl1nkError {
    #[error("Network error: {0}")]
    Network(#[from] reqwest::Error),
    #[error("Plugin not found: {0}")]
    PluginNotFound(String),
}

// Python
class Bl1nkError(Exception):
    pass

class NetworkError(Bl1nkError):
    pass

class PluginNotFoundError(Bl1nkError):
    pass

# TypeScript
export class Bl1nkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'Bl1nkError';
  }
}

export class NetworkError extends Bl1nkError {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}
```

🔄 Git & Version Control

Branch Strategy

```
main
├── develop
│   ├── feat/new-feature
│   ├── fix/bug-fix
│   └── docs/update-readme
└── release/v1.2.3
```

Commit Messages

Follow Conventional Commits:

```
feat(rust): add async client implementation
fix(python): handle None in config validation
docs: update agent usage examples
style(nodejs): format code with prettier
test: add integration tests for plugins
build: update dependencies
ci: add cross-language testing
chore: update README
```

Pull Request Process

1. Create PR from feature branch to develop
2. Ensure CI passes (tests, linting, builds)
3. Request reviews from language experts
4. Address feedback
5. Squash commits before merging
6. Delete branch after merge

🚀 Release Process

Version Management

We use changesets:

```bash
# Add changeset
npx changeset

# Create version bump PR
npx changeset version

# Publish packages
npx changeset publish
```

Release Checklist

· All tests pass (make test)
· Cross-language consistency verified
· Documentation updated
· Changelog entries added
· Version numbers bumped
· Docker images built
· Release notes written

🐳 Docker Development

Development Containers

```bash
# Start development environment
docker-compose up dev

# Run tests in container
docker-compose run test

# Build all SDKs
docker-compose run build
```

Production Images

```dockerfile
# Multi-stage build for each SDK
# See docker/Dockerfile.* for details
```

📊 Monitoring & Debugging

Logging

```bash
# Enable debug logging
RUST_LOG=debug make test-rust
BL1NK_LOG_LEVEL=debug make test-python
DEBUG=bl1nk:* make test-nodejs
```

Performance Profiling

```bash
# Profile Rust code
cargo flamegraph --bin bl1nk-cli

# Profile Python code
poetry run python -m cProfile -o profile.stats script.py

# Profile Node.js code
node --prof script.js
```

🤝 Contributing

First-time Contributors

1. Fork the repository
2. Set up development environment (make setup)
3. Pick a "good first issue" from GitHub
4. Create a branch
5. Make changes and test
6. Submit PR

Code Review Guidelines

Reviewers should check:

· Code follows style guidelines
· Tests are adequate
· Documentation is updated
· No breaking changes
· Cross-language consistency
· Performance considerations
· Security implications

Community Guidelines

· Be respectful and inclusive
· Provide constructive feedback
· Document your code
· Write tests for new features
· Follow the established patterns

🆘 Troubleshooting

Common Issues

Build fails:

```bash
# Clean and rebuild
make clean
make build

# Check for dependency issues
make check-deps
```

Tests fail:

```bash
# Run specific failing test
make test-rust -- --test-threads=1

# Check for environment issues
make check-env
```

Cross-language inconsistencies:

```bash
# Regenerate from spec
make generate

# Run cross-language tests
make test-cross-language
```

Getting Help

· GitHub Issues: Bug reports and feature requests
· GitHub Discussions: Questions and ideas
· Discord Community: Real-time help
· Documentation: docs/ directory

📚 Additional Resources

Internal Documentation

· AGENTS.md - Agent framework guide
· CLAUDE.md - Claude integration guide
· API_SPEC.md - API specification details
· PLUGINS.md - Plugin development guide

External Resources

· Rust Book
· Python Documentation
· TypeScript Handbook
· OpenAPI Specification
· MCP Protocol

📄 License

All code is licensed under MIT unless otherwise specified. See LICENSE.

---

This document is maintained by the BL1NK SDK team. Last updated: $(date)

---