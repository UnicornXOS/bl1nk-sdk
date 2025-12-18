# โครงสร้าง Monorepo แบบ Comprehensive


```
bl1nk-mcp/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                 # CI สำหรับทุกภาษา
│   │   ├── release.yml            # Release automation
│   │   └── test-matrix.yml       # Matrix testing ทุกภาษา
│   └── ISSUE_TEMPLATE/
├── spec/                          # API Specification
│   ├── openapi/
│   │   ├── openapi.yaml          # Source of truth
│   │   ├── openapi.json          # Generated
│   │   └── extensions/           # OpenAPI extensions
│   ├── asyncapi/                  # สำหรับ real-time events
│   ├── protobuf/                  # สำหรับ gRPC (ถ้าต้องการ)
│   └── jsonschema/               # JSON Schema files แยก
├── core/                          # Core libraries (แชร์ logic)
│   ├── types/                     # Shared TypeScript types
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── schemas/                   # Shared validation schemas
│   │   ├── src/
│   │   └── Cargo.toml
│   └── utils/                     # Shared utilities
├── sdks/                          # Language-specific SDKs
│   ├── rust/
│   │   ├── bl1nk-sdk/            # Main Rust SDK
│   │   │   ├── src/
│   │   │   ├── examples/
│   │   │   ├── tests/
│   │   │   ├── Cargo.toml
│   │   │   └── README.md
│   │   ├── bl1nk-macro/          # Rust macros (ถ้าต้องการ)
│   │   └── bl1nk-derive/         # Derive macros
│   ├── python/
│   │   ├── bl1nk-sdk/            # Python SDK
│   │   │   ├── bl1nk/
│   │   │   ├── tests/
│   │   │   ├── examples/
│   │   │   ├── pyproject.toml
│   │   │   ├── setup.py
│   │   │   └── README.md
│   │   └── bl1nk-cli/            # Python CLI tool
│   ├── nodejs/
│   │   ├── packages/
│   │   │   ├── bl1nk-sdk/        # Core TypeScript SDK
│   │   │   ├── bl1nk-client/     # HTTP client
│   │   │   ├── bl1nk-cli/        # CLI tool
│   │   │   └── bl1nk-react/      # React hooks (ถ้าต้องการ)
│   │   └── package.json          # Root package.json (workspace)
│   ├── golang/                    # ถ้าต้องการ Go SDK ในอนาคต
│   └── dotnet/                    # ถ้าต้องการ .NET SDK ในอนาคต
├── server/                        # Reference implementations
│   ├── rust-server/              # Rust server implementation
│   ├── python-server/            # FastAPI server
│   └── nodejs-server/            # Express/NestJS server
├── plugins/                       # Built-in plugins
│   ├── weather/
│   ├── database/
│   ├── filesystem/
│   └── template/
├── examples/                      # Example projects
│   ├── rust-examples/
│   ├── python-examples/
│   ├── nodejs-examples/
│   └── cross-language/
├── tools/                         # Development tools
│   ├── codegen/                  # Code generation tools
│   ├── test-runner/              # Cross-language test runner
│   └── benchmark/                # Performance benchmarks
├── docs/
│   ├── api/                      # API documentation
│   ├── sdk/                      # SDK documentation
│   ├── plugins/                  # Plugin development guide
│   └── CONTRIBUTING.md
├── scripts/                       # Build and utility scripts
│   ├── generate/                 # Code generation scripts
│   ├── release/                  # Release scripts
│   ├── test/                     # Test scripts
│   └── docker/                   # Docker-related scripts
├── docker/
│   ├── Dockerfile.rust
│   ├── Dockerfile.python
│   ├── Dockerfile.nodejs
│   └── docker-compose.yml
├── .vscode/                       # VS Code settings
├── .devcontainer/                 # Dev container configuration
├── Makefile                       # Unified build commands
├── justfile                       # Just command runner
├── LICENSE
└── README.md
```

## 2. Detailed Structure สำหรับแต่ละภาษา

### 2.1 Rust SDK Structure

```
sdks/rust/
├── bl1nk-sdk/
│   ├── Cargo.toml
│   ├── README.md
│   ├── CHANGELOG.md
│   ├── src/
│   │   ├── lib.rs                # Main library entry
│   │   ├── client/               # HTTP client implementation
│   │   │   ├── mod.rs
│   │   │   ├── async_client.rs
│   │   │   └── sync_client.rs
│   │   ├── models/               # Generated models
│   │   │   ├── mod.rs
│   │   │   ├── plugin.rs
│   │   │   ├── tool.rs
│   │   │   └── context.rs
│   │   ├── api/                  # API endpoints
│   │   │   ├── mod.rs
│   │   │   ├── plugins.rs
│   │   │   ├── tools.rs
│   │   │   └── context.rs
│   │   ├── error.rs              # Error handling
│   │   ├── config.rs             # Configuration
│   │   ├── validation.rs         # Data validation
│   │   └── utils.rs              # Utilities
│   ├── examples/
│   │   ├── basic.rs
│   │   ├── plugin_management.rs
│   │   └── tool_invocation.rs
│   ├── tests/
│   │   ├── integration/
│   │   └── unit/
│   └── benches/                  # Benchmarks
│       └── client_bench.rs
├── bl1nk-macro/                  # Optional proc macros
│   ├── Cargo.toml
│   ├── src/
│   │   ├── lib.rs
│   │   └── derive/
│   └── examples/
└── Cargo.toml                    # Workspace Cargo.toml
```

Cargo.toml (workspace):

```toml
[workspace]
members = ["bl1nk-sdk", "bl1nk-macro"]
resolver = "2"

[workspace.dependencies]
serde = { version = "1.0", features = ["derive"] }
reqwest = { version = "0.12", features = ["json", "rustls-tls"] }
tokio = { version = "1.0", features = ["full"] }
thiserror = "1.0"
validator = "0.16"
```

### 2.2 Python SDK Structure

```
sdks/python/
├── bl1nk-sdk/
│   ├── pyproject.toml
│   ├── setup.py
│   ├── setup.cfg
│   ├── README.md
│   ├── CHANGELOG.md
│   ├── bl1nk/
│   │   ├── __init__.py
│   │   ├── client.py             # Main client
│   │   ├── models/               # Pydantic models
│   │   │   ├── __init__.py
│   │   │   ├── plugin.py
│   │   │   ├── tool.py
│   │   │   └── context.py
│   │   ├── api/                  # API modules
│   │   │   ├── __init__.py
│   │   │   ├── plugins.py
│   │   │   ├── tools.py
│   │   │   └── context.py
│   │   ├── exceptions.py         # Custom exceptions
│   │   ├── config.py             # Configuration
│   │   ├── validation.py         # Validation utilities
│   │   ├── async_client.py       # Async client
│   │   └── sync_client.py        # Sync client
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── test_client.py
│   │   ├── test_models.py
│   │   └── fixtures/
│   ├── examples/
│   │   ├── basic_usage.py
│   │   ├── async_example.py
│   │   └── plugin_example.py
│   └── requirements/
│       ├── requirements.txt
│       ├── requirements-dev.txt
│       └── requirements-test.txt
└── bl1nk-cli/                    # Optional CLI tool
    ├── pyproject.toml
    └── src/bl1nk_cli/
```

pyproject.toml:

```toml
[project]
name = "bl1nk-sdk"
version = "0.1.0"
description = "BL1NK SDK for Python"
requires-python = ">=3.8"
dependencies = [
    "pydantic>=2.0",
    "httpx>=0.25.0",
    "typing-extensions>=4.0",
    "python-dotenv>=1.0",
]

[project.optional-dependencies]
dev = ["pytest>=7.0", "pytest-asyncio", "black", "mypy"]
async = ["anyio>=3.0"]
cli = ["typer>=0.9", "rich>=13.0"]

[build-system]
requires = ["setuptools>=61.0", "wheel"]
build-backend = "setuptools.build_meta"
```

### 2.3 Node.js/TypeScript SDK Structure

```
sdks/nodejs/
├── package.json                  # Workspace root
├── pnpm-workspace.yaml           # PNPM workspace config
├── tsconfig.base.json           # Base TypeScript config
├── packages/
│   ├── bl1nk-sdk/               # Core SDK
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── client/
│   │   │   ├── models/
│   │   │   ├── api/
│   │   │   ├── errors/
│   │   │   ├── validation/
│   │   │   └── utils/
│   │   ├── tests/
│   │   └── examples/
│   ├── bl1nk-client/            # HTTP client implementation
│   │   ├── package.json
│   │   ├── src/
│   │   │   ├── fetch-client.ts
│   │   │   ├── axios-client.ts
│   │   │   └── websocket-client.ts
│   │   └── tests/
│   ├── bl1nk-cli/               # CLI tool
│   │   ├── package.json
│   │   ├── bin/
│   │   ├── src/
│   │   └── commands/
│   ├── bl1nk-react/             # React hooks (optional)
│   │   ├── package.json
│   │   ├── src/
│   │   │   ├── hooks/
│   │   │   ├── components/
│   │   │   └── providers/
│   │   └── examples/
│   └── bl1nk-test-utils/        # Test utilities
│       ├── package.json
│       └── src/
├── examples/
│   ├── nodejs-example/
│   ├── react-example/
│   └── nextjs-example/
└── tools/
    ├── codegen/                 # OpenAPI code generation
    └── scripts/
```

package.json (workspace root):

```json
{
  "name": "bl1nk-sdk-workspace",
  "private": true,
  "workspaces": ["packages/*"],
  "scripts": {
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "generate": "turbo run generate",
    "release": "changeset publish"
  },
  "devDependencies": {
    "turbo": "^1.10.0",
    "@changesets/cli": "^2.26.0",
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0",
    "prettier": "^3.0.0"
  }
}
```

## 3. Shared Core Components

### 3.1 Core Types (TypeScript)

```
core/types/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts
│   ├── api.types.ts            # OpenAPI generated types
│   ├── plugin.types.ts         # Plugin-related types
│   ├── tool.types.ts           # Tool-related types
│   ├── context.types.ts        # Context types
│   ├── error.types.ts          # Error types
│   └── shared.types.ts         # Shared utility types
└── scripts/
    └── generate-types.ts       # Generate from OpenAPI
```

### 3.2 Shared Validation Schemas

```
core/schemas/
├── Cargo.toml                  # Rust crate
├── src/
│   ├── lib.rs
│   ├── plugin.rs              # Plugin validation
│   ├── tool.rs                # Tool validation
│   └── context.rs             # Context validation
├── schemas/                    # JSON Schema files
│   ├── plugin.schema.json
│   ├── tool.schema.json
│   └── context.schema.json
└── python/                     # Python version
    ├── __init__.py
    └── validation.py
```

## 4. Build System และ Automation

### 4.1 Makefile (Unified Build)

```makefile
.PHONY: all build test lint format clean generate release

# Default target
all: generate build test

# Code generation
generate:
	@echo "Generating code from OpenAPI spec..."
	@cd scripts/generate && npm run generate:all

# Build all SDKs
build:
	@echo "Building Rust SDK..."
	@cd sdks/rust && cargo build --release
	@echo "Building Python SDK..."
	@cd sdks/python && poetry build
	@echo "Building Node.js SDK..."
	@cd sdks/nodejs && npm run build

# Test all SDKs
test:
	@echo "Testing Rust SDK..."
	@cd sdks/rust && cargo test
	@echo "Testing Python SDK..."
	@cd sdks/python && pytest
	@echo "Testing Node.js SDK..."
	@cd sdks/nodejs && npm test

# Lint all SDKs
lint:
	@echo "Linting Rust SDK..."
	@cd sdks/rust && cargo clippy
	@echo "Linting Python SDK..."
	@cd sdks/python && black --check .
	@echo "Linting Node.js SDK..."
	@cd sdks/nodejs && npm run lint

# Format code
format:
	@echo "Formatting Rust code..."
	@cd sdks/rust && cargo fmt
	@echo "Formatting Python code..."
	@cd sdks/python && black .
	@echo "Formatting TypeScript code..."
	@cd sdks/nodejs && npm run format

# Clean build artifacts
clean:
	@cd sdks/rust && cargo clean
	@cd sdks/python && rm -rf dist build *.egg-info
	@cd sdks/nodejs && npm run clean
	@rm -rf spec/openapi.json

# Release preparation
release: test
	@echo "Creating releases..."
	@cd scripts/release && node release.js

# Docker builds
docker-build:
	docker build -t bl1nk/rust-sdk -f docker/Dockerfile.rust .
	docker build -t bl1nk/python-sdk -f docker/Dockerfile.python .
	docker build -t bl1nk/nodejs-sdk -f docker/Dockerfile.nodejs .

# Development setup
dev-setup:
	@echo "Setting up development environment..."
	@./scripts/setup/dev-setup.sh

help:
	@echo "Available commands:"
	@echo "  make build     - Build all SDKs"
	@echo "  make test      - Test all SDKs"
	@echo "  make lint      - Lint all SDKs"
	@echo "  make format    - Format code"
	@echo "  make generate  - Generate code from OpenAPI"
	@echo "  make clean     - Clean build artifacts"
	@echo "  make release   - Prepare releases"
	@echo "  make docker-build - Build Docker images"
```

### 4.2 Justfile (Alternative to Make)

```makefile
# Just commands for BL1NK SDK development

# Default task
default:
  just --list

# Build all SDKs
build:
  #!/usr/bin/env bash
  echo "Building all SDKs..."
  cd sdks/rust && cargo build --release
  cd sdks/python && poetry build
  cd sdks/nodejs && npm run build

# Test all SDKs
test *args:
  #!/usr/bin/env bash
  echo "Running tests..."
  
  if [[ -z "{{args}}" ]]; then
    cd sdks/rust && cargo test
    cd sdks/python && pytest
    cd sdks/nodejs && npm test
  else
    # Test specific SDK
    case "{{args}}" in
      rust)
        cd sdks/rust && cargo test
        ;;
      python)
        cd sdks/python && pytest
        ;;
      nodejs)
        cd sdks/nodejs && npm test
        ;;
    esac
  fi

# Generate code from OpenAPI
generate:
  cd scripts/generate && node generate-all.js

# Run development servers
dev server="rust":
  case "{{server}}" in
    rust)
      cd server/rust-server && cargo run
      ;;
    python)
      cd server/python-server && uvicorn main:app --reload
      ;;
    nodejs)
      cd server/nodejs-server && npm run dev
      ;;
  esac

# Create new plugin
new-plugin name lang="rust":
  #!/usr/bin/env bash
  mkdir -p plugins/{{name}}
  
  case "{{lang}}" in
    rust)
      cp -r plugins/template/rust/* plugins/{{name}}/
      ;;
    python)
      cp -r plugins/template/python/* plugins/{{name}}/
      ;;
    nodejs)
      cp -r plugins/template/nodejs/* plugins/{{name}}/
      ;;
  esac
  
  echo "Created plugin {{name}} in {{lang}}"

# Benchmark
bench:
  cd sdks/rust && cargo bench
  cd tools/benchmark && npm run bench
```

## 5. CI/CD Pipeline (GitHub Actions)

.github/workflows/ci.yml:

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: make generate
      - uses: stefanzweifel/git-auto-commit-action@v4
        with:
          commit_message: "chore: regenerate code from OpenAPI spec"

  test:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]
        language: [rust, python, nodejs]
      fail-fast: false
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Rust
        if: matrix.language == 'rust'
        uses: dtolnay/rust-toolchain@stable
      
      - name: Setup Python
        if: matrix.language == 'python'
        uses: actions/setup-python@v4
        with:
          python-version: '3.10'
      
      - name: Setup Node.js
        if: matrix.language == 'nodejs'
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Run tests
        run: |
          case "${{ matrix.language }}" in
            rust)
              cd sdks/rust && cargo test
              ;;
            python)
              cd sdks/python && pip install -e .[dev] && pytest
              ;;
            nodejs)
              cd sdks/nodejs && npm ci && npm test
              ;;
          esac

  integration:
    runs-on: ubuntu-latest
    needs: [generate, test]
    services:
      redis:
        image: redis:alpine
        ports:
          - 6379:6379
    steps:
      - uses: actions/checkout@v4
      - run: make docker-build
      - run: docker-compose up -d
      - run: |
          cd tests/integration
          ./run-integration-tests.sh

  release:
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    needs: [integration]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: make release
      - uses: softprops/action-gh-release@v1
        with:
          files: |
            sdks/rust/target/release/*.tar.gz
            sdks/python/dist/*.whl
            sdks/nodejs/packages/*/dist/*.tgz
```

## 6. Code Generation Script

scripts/generate/generate-all.js:

```javascript
#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Configuration
const config = {
  openapiFile: path.join(__dirname, '../../spec/openapi/openapi.yaml'),
  output: {
    rust: path.join(__dirname, '../../sdks/rust/bl1nk-sdk/src/models'),
    python: path.join(__dirname, '../../sdks/python/bl1nk-sdk/bl1nk/models'),
    typescript: path.join(__dirname, '../../core/types/src'),
    jsonSchema: path.join(__dirname, '../../core/schemas/schemas'),
  },
};

// Generate from OpenAPI spec
async function generateAll() {
  console.log('🚀 Generating code from OpenAPI specification...');
  
  // 1. Read and validate OpenAPI spec
  const spec = readOpenApiSpec();
  validateSpec(spec);
  
  // 2. Generate JSON version
  generateJsonSpec(spec);
  
  // 3. Generate language-specific code
  await generateRustCode(spec);
  await generatePythonCode(spec);
  await generateTypeScriptCode(spec);
  await generateJsonSchemas(spec);
  
  // 4. Generate documentation
  generateDocumentation(spec);
  
  console.log('✅ All code generated successfully!');
}

function readOpenApiSpec() {
  console.log('📖 Reading OpenAPI specification...');
  const content = fs.readFileSync(config.openapiFile, 'utf8');
  return yaml.load(content);
}

function validateSpec(spec) {
  console.log('🔍 Validating OpenAPI specification...');
  // Add validation logic here
  if (!spec.openapi) throw new Error('Missing openapi field');
  if (!spec.info) throw new Error('Missing info field');
  if (!spec.paths) throw new Error('Missing paths field');
  console.log('✅ Specification is valid');
}

function generateJsonSpec(spec) {
  console.log('📄 Generating JSON version...');
  const jsonPath = config.openapiFile.replace('.yaml', '.json');
  fs.writeFileSync(jsonPath, JSON.stringify(spec, null, 2));
  console.log(`✅ JSON generated: ${jsonPath}`);
}

async function generateRustCode(spec) {
  console.log('🦀 Generating Rust code...');
  
  // Use openapi-generator for Rust
  try {
    execSync(
      `docker run --rm -v ${process.cwd()}:/local openapitools/openapi-generator-cli generate \
      -i /local/spec/openapi/openapi.yaml \
      -g rust \
      -o /local/sdks/rust/generated \
      --additional-properties=packageName=bl1nk-sdk`,
      { stdio: 'inherit' }
    );
    
    // Post-processing for Rust
    postProcessRustCode();
  } catch (error) {
    console.error('❌ Error generating Rust code:', error.message);
  }
}

async function generatePythonCode(spec) {
  console.log('🐍 Generating Python code...');
  
  // Use openapi-generator for Python
  try {
    execSync(
      `docker run --rm -v ${process.cwd()}:/local openapitools/openapi-generator-cli generate \
      -i /local/spec/openapi/openapi.yaml \
      -g python \
      -o /local/sdks/python/generated \
      --additional-properties=packageName=bl1nk_sdk,projectName=bl1nk-sdk`,
      { stdio: 'inherit' }
    );
    
    // Post-processing for Python
    postProcessPythonCode();
  } catch (error) {
    console.error('❌ Error generating Python code:', error.message);
  }
}

async function generateTypeScriptCode(spec) {
  console.log('📘 Generating TypeScript code...');
  
  // Use openapi-typescript for TypeScript
  try {
    const { generateTypes } = require('openapi-typescript');
    const tsCode = await generateTypes(spec);
    
    fs.writeFileSync(
      path.join(config.output.typescript, 'api.types.ts'),
      `// Generated from OpenAPI specification\n// DO NOT EDIT MANUALLY\n\n${tsCode}`
    );
  } catch (error) {
    console.