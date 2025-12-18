Global Development Guidelines for BL1NK SDK Monorepo

🏗️ Project Architecture and Context

Monorepo Structure

This is a multi-language monorepo with independently versioned packages for Rust, Python, and Node.js, unified under a common SDK architecture.

```
bl1nk/
├── core/                          # Shared core libraries
│   ├── types/                     # Shared TypeScript types
│   ├── schemas/                   # Shared validation schemas (Rust)
│   └── utils/                     # Shared utilities
├── sdks/                          # Language-specific SDKs
│   ├── rust/                      # Rust SDK workspace
│   │   ├── bl1nk-sdk/            # Main Rust SDK
│   │   ├── bl1nk-agent/          # Agent framework
│   │   └── Cargo.toml           # Workspace configuration
│   ├── python/                    # Python packages
│   │   ├── bl1nk-sdk/            # Core Python SDK
│   │   ├── bl1nk-agent/          # Python agent framework
│   │   └── pyproject.toml       # Poetry workspace
│   └── nodejs/                    # Node.js packages (pnpm workspace)
│       ├── packages/
│       │   ├── bl1nk-sdk/        # TypeScript SDK
│       │   ├── bl1nk-client/     # HTTP client
│       │   ├── bl1nk-cli/        # CLI tools
│       │   └── bl1nk-claude/     # Claude integration
│       └── package.json          # Workspace configuration
├── spec/                          # API specifications
│   ├── openapi/                  # OpenAPI 3.0 specifications
│   └── asyncapi/                 # AsyncAPI specifications
├── plugins/                       # Built-in plugins
│   ├── weather/                  # Weather plugin
│   ├── calculator/               # Calculator plugin
│   └── template/                 # Plugin templates
├── server/                        # Reference implementations
│   ├── rust-server/              # Rust server
│   ├── python-server/            # FastAPI server
│   └── nodejs-server/            # Node.js server
├── examples/                      # Example projects
├── tools/                         # Development tools
├── docs/                          # Documentation
└── scripts/                       # Build and utility scripts
```

Layer Architecture

· Specification Layer (spec/): API contracts (OpenAPI, AsyncAPI) as single source of truth
· Core Layer (core/): Language-agnostic abstractions, shared types, validation schemas
· SDK Layer (sdks/): Language-specific implementations
  · Rust: Memory-safe, high-performance SDK
  · Python: Easy-to-use SDK with async support
  · Node.js: TypeScript-first SDK with extensive tooling
· Plugin Layer (plugins/): Built-in MCP plugins
· Integration Layer: Third-party service integrations
· Application Layer (examples/, server/): Usage examples and reference implementations

🛠️ Development Tools & Commands

Unified Build System

We use make as the primary task runner with language-specific tools:

```bash
# Install all dependencies
make setup

# Build all SDKs
make build

# Run all tests
make test

# Lint all code
make lint

# Format all code
make format

# Generate code from specifications
make generate

# Clean build artifacts
make clean
```

Language-Specific Tools

Rust:

· cargo - Package manager and build system
· cargo fmt - Code formatting
· cargo clippy - Linting
· cargo test - Testing

Python:

· poetry - Dependency management
· black - Code formatting
· ruff - Linting
· mypy - Type checking
· pytest - Testing

Node.js:

· pnpm - Package manager (workspace)
· prettier - Code formatting
· eslint - Linting
· typescript - Type checking
· vitest - Testing

Key Configuration Files

· Makefile - Unified build commands
· justfile - Alternative task runner (optional)
· spec/openapi.yaml - OpenAPI specification (source of truth)
· .github/workflows/ - CI/CD pipelines
· .devcontainer/ - Development container configuration
· docker/ - Docker configurations for each language

📝 Commit Standards

We follow Conventional Commits with the following types:

```bash
# Allowed commit types
feat:     # New feature
fix:      # Bug fix
docs:     # Documentation changes
style:    # Code style changes (formatting, missing semicolons, etc.)
refactor: # Code refactoring (no functional changes)
perf:     # Performance improvements
test:     # Adding or fixing tests
build:    # Build system or external dependencies
ci:       # CI configuration changes
chore:    # Maintenance tasks
revert:   # Revert previous commit

# Allowed scopes (example)
rust:     # Rust SDK changes
python:   # Python SDK changes
nodejs:   # Node.js SDK changes
core:     # Core library changes
spec:     # API specification changes
plugins:  # Plugin changes
docs:     # Documentation
ci:       # CI/CD

# Examples
feat(rust): add async client implementation
fix(python): handle None in config validation
docs: update agent usage examples
```

Pre-commit Hooks

We use pre-commit hooks to ensure code quality:

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.4.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-added-large-files
  
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.1.6
    hooks:
      - id: ruff
        args: [--fix]
  
  - repo: https://github.com/psf/black
    rev: 23.11.0
    hooks:
      - id: black
  
  - repo: https://github.com/doublify/pre-commit-rust
    rev: v1.0
    hooks:
      - id: fmt
      - id: clippy
```

🔄 Pull Request Guidelines

PR Template

```markdown
## Description
<!-- Describe the changes and why they are needed -->

## Type of Change
- [ ] 🐛 Bug fix
- [ ] ✨ New feature
- [ ] 📚 Documentation update
- [ ] 🎨 Code style update
- [ ] ♻️ Refactor
- [ ] 🚀 Performance improvement
- [ ] 🧪 Test update
- [ ] 🔧 Build/CI update
- [ ] 📦 Dependency update

## AI Assistance Disclosure
<!-- Disclosure for AI-generated contributions -->
- [ ] This contribution was created with the assistance of AI tools
- [ ] AI tools used: [List AI tools used]
- [ ] Human review performed: [Describe human review process]

## Testing
<!-- Describe how you tested these changes -->
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Cross-language tests passing
- [ ] Documentation updated

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Commented code in hard-to-understand areas
- [ ] Documentation reflects changes
- [ ] Changes generate no new warnings
- [ ] Added tests that prove fix/feature works
- [ ] New and existing unit tests pass locally
- [ ] PR title follows conventional commits
- [ ] Breaking changes documented

## Related Issues
<!-- Link to related issues -->
Fixes # (issue)
```

PR Review Checklist

Reviewers should check:

· Code follows established patterns
· All tests pass
· No breaking changes without proper migration path
· Documentation is updated
· Performance implications considered
· Security considerations addressed
· Cross-language consistency maintained
· API specifications updated if needed

🎯 Core Development Principles

1. Maintain Stable Public Interfaces

CRITICAL: Always preserve backward compatibility for exported/public APIs.

Before making ANY changes to public APIs:

1. Check if the function/class is exported in public interface files:
   · Rust: lib.rs or module pub use statements
   · Python: __init__.py exports
   · TypeScript: index.ts exports
2. Use semantic versioning:
   · MAJOR: Breaking changes
   · MINOR: New features (backward compatible)
   · PATCH: Bug fixes (backward compatible)
3. Breaking changes require:
   · Clear migration guide in MIGRATION.md
   · Deprecation warnings for at least one minor version
   · Update to major version number

Example of safe API evolution:

```rust
// Before
pub struct Config {
    pub api_key: String,
}

// After (backward compatible)
pub struct Config {
    pub api_key: String,
    #[serde(default)]
    pub timeout: Option<Duration>, // New optional field
}

// Use builder pattern for complex configuration
pub struct ConfigBuilder {
    api_key: String,
    timeout: Option<Duration>,
}

impl ConfigBuilder {
    pub fn new(api_key: impl Into<String>) -> Self {
        Self {
            api_key: api_key.into(),
            timeout: None,
        }
    }
    
    pub fn timeout(mut self, timeout: Duration) -> Self {
        self.timeout = Some(timeout);
        self
    }
    
    pub fn build(self) -> Config {
        Config {
            api_key: self.api_key,
            timeout: self.timeout,
        }
    }
}
```

2. Code Quality Standards

All code MUST include proper documentation and type hints:

Rust Example:

```rust
/// Fetch plugin information by ID.
///
/// # Arguments
/// * `plugin_id` - Unique identifier of the plugin
/// * `client` - HTTP client for making requests
///
/// # Returns
/// `Result<Plugin, ApiError>` - Plugin information or error
///
/// # Errors
/// Returns `ApiError::NotFound` if plugin doesn't exist
/// Returns `ApiError::Network` if network request fails
///
/// # Examples
/// ```
/// let plugin = fetch_plugin("weather", &client).await?;
/// assert_eq!(plugin.name, "Weather Plugin");
/// ```
pub async fn fetch_plugin(
    plugin_id: &str,
    client: &HttpClient,
) -> Result<Plugin, ApiError> {
    // Implementation
}
```

Python Example:

```python
def fetch_plugin(plugin_id: str, client: HttpClient) -> Plugin:
    """Fetch plugin information by ID.

    Args:
        plugin_id: Unique identifier of the plugin.
        client: HTTP client for making requests.

    Returns:
        Plugin information.

    Raises:
        NotFoundError: If plugin doesn't exist.
        NetworkError: If network request fails.

    Example:
        >>> plugin = fetch_plugin("weather", client)
        >>> plugin.name
        'Weather Plugin'
    """
```

TypeScript Example:

```typescript
/**
 * Fetch plugin information by ID.
 * 
 * @param pluginId - Unique identifier of the plugin
 * @param client - HTTP client for making requests
 * 
 * @returns Plugin information
 * 
 * @throws {NotFoundError} If plugin doesn't exist
 * @throws {NetworkError} If network request fails
 * 
 * @example
 * ```typescript
 * const plugin = await fetchPlugin('weather', client);
 * console.log(plugin.name); // 'Weather Plugin'
```

*/
async function fetchPlugin(
pluginId: string,
client: HttpClient
):Promise<Plugin> {
// Implementation
}

```

### 3. Testing Requirements

**Every feature or bugfix MUST be covered by tests:**

**Test Pyramid:**
- **Unit Tests** (70%): Fast, isolated tests for individual components
- **Integration Tests** (20%): Tests for component interactions
- **End-to-End Tests** (10%): Full system tests

**Cross-language Testing:**
```python
# tests/cross_language/test_plugin_consistency.py
def test_plugin_schema_consistency():
    """Test that plugin schemas are consistent across languages."""
    
    # Load Rust-generated schema
    rust_schema = load_json("sdks/rust/target/schema.json")
    
    # Load Python-generated schema  
    python_schema = load_json("sdks/python/dist/schema.json")
    
    # Load TypeScript-generated schema
    ts_schema = load_json("sdks/nodejs/packages/sdk/dist/schema.json")
    
    # All schemas should be equivalent
    assert_schemas_equal(rust_schema, python_schema)
    assert_schemas_equal(python_schema, ts_schema)
```

Property-Based Testing:

```rust
// tests/property_based.rs
use proptest::prelude::*;

proptest! {
    #[test]
    fn test_config_validation(config in any::<Config>()) {
        // For any config, validation should not panic
        let result = std::panic::catch_unwind(|| {
            config.validate().unwrap();
        });
        assert!(result.is_ok());
    }
}
```

4. Security and Risk Assessment

Security Checklist:

· No eval(), exec(), or pickle on user-controlled input
· Input validation at API boundaries
· Proper error handling (no bare except: in Python)
· Resource cleanup (file handles, connections, memory)
· No secrets in logs or error messages
· Rate limiting implemented
· Authentication/authorization checks
· Dependency security scanning
· Memory safety (Rust: no unsafe blocks without review)

Security Examples:

```rust
// SAFE: Input validation
pub fn validate_input(input: &str) -> Result<(), ValidationError> {
    // Reject inputs that could be dangerous
    if input.contains('\0') {
        return Err(ValidationError::NullByte);
    }
    
    // Limit input size
    if input.len() > MAX_INPUT_SIZE {
        return Err(ValidationError::TooLong);
    }
    
    Ok(())
}

// UNSAFE: Avoid this pattern
pub fn unsafe_eval(input: &str) -> String {
    // NEVER DO THIS
    // This would allow arbitrary code execution
    // format!("eval({})", input)
    
    // Instead, use safe alternatives
    input.to_string() // Safe
}
```

5. Performance Considerations

Performance Checklist:

· Benchmark critical paths
· Memory usage optimized
· Network calls minimized
· Cache where appropriate
· Async/await used for I/O operations
· Streaming for large responses

Benchmark Examples:

```rust
// benches/client_bench.rs
use criterion::{criterion_group, criterion_main, Criterion};

fn bench_client_requests(c: &mut Criterion) {
    let client = HttpClient::new();
    
    c.bench_function("plugin_fetch", |b| {
        b.iter(|| {
            let rt = tokio::runtime::Runtime::new().unwrap();
            rt.block_on(async {
                client.fetch_plugin("weather").await.unwrap()
            })
        })
    });
}

criterion_group!(benches, bench_client_requests);
criterion_main!(benches);
```

📚 Documentation Standards

Code Documentation

Three levels of documentation:

1. Inline Comments: Explain "why", not "what"
   ```rust
   // GOOD: Explains the reason
   // Using HashMap for O(1) lookups by plugin ID
   let plugins: HashMap<String, Plugin> = load_plugins();
   
   // BAD: Redundant
   // Create a new HashMap
   let plugins = HashMap::new();
   ```
2. Function/Method Docs: Complete API documentation
3. Module/Crate Docs: High-level overview and examples

API Documentation Generation

```bash
# Generate documentation for all languages
make docs

# Language-specific docs
make docs-rust    # cargo doc --open
make docs-python  # pdoc --html
make docs-nodejs  # typedoc --out docs/api
```

README Standards

Each package must include:

1. Badges (version, license, build status)
2. Installation instructions
3. Quick Start example
4. API Reference link
5. Contributing section
6. License information

🤝 Cross-Language Consistency

Naming Conventions

Concept Rust Python TypeScript
Function snake_case snake_case camelCase
Variable snake_case snake_case camelCase
Constant SCREAMING_SNAKE_CASE SCREAMING_SNAKE_CASE SCREAMING_SNAKE_CASE
Class/Type PascalCase PascalCase PascalCase
Enum Variant PascalCase PascalCase PascalCase
File snake_case.rs snake_case.py camelCase.ts

Error Handling Patterns

Consistent error types across languages:

```rust
// Rust
#[derive(Debug, thiserror::Error)]
pub enum Bl1nkError {
    #[error("Network error: {0}")]
    Network(#[from] reqwest::Error),
    
    #[error("Plugin not found: {0}")]
    PluginNotFound(String),
    
    #[error("Validation error: {0}")]
    Validation(String),
}

// Python
class Bl1nkError(Exception):
    """Base exception for BL1NK SDK."""
    pass

class NetworkError(Bl1nkError):
    """Network-related errors."""
    pass

class PluginNotFoundError(Bl1nkError):
    """Plugin not found."""
    pass

class ValidationError(Bl1nkError):
    """Validation errors."""
    pass

// TypeScript
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

export class PluginNotFoundError extends Bl1nkError {
  constructor(pluginId: string) {
    super(`Plugin not found: ${pluginId}`);
    this.name = 'PluginNotFoundError';
  }
}
```

🔄 Release Process

Version Management

We use changesets for version management:

```bash
# Add a changeset
npx changeset

# Version packages
npx changeset version

# Publish packages
npx changeset publish
```

Release Checklist

· All tests pass
· Documentation updated
· Changelog updated
· Version numbers bumped
· Docker images built
· Release notes written
· Announcement prepared

🆘 Getting Help

Internal Resources

· Documentation: docs.bl1nk.dev
· Issue Tracker: GitHub Issues
· Discussions: GitHub Discussions
· Code Review: Follow PR guidelines above

External Resources

· Rust: The Rust Book
· Python: Python Documentation
· TypeScript: TypeScript Handbook
· OpenAPI: OpenAPI Specification

📄 License

All code in this repository is licensed under the MIT License unless otherwise specified. See LICENSE for details.

---

These guidelines are living documents. Contribute improvements via pull requests following the standards outlined above.