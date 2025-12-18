#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
import YAML from 'yaml';
import { Command } from 'commander';
import chalk from 'chalk';

// สำหรับ ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const program = new Command();

program
  .name('generate-openapi')
  .description('Generate OpenAPI JSON from YAML and vice versa')
  .version('1.0.0');

program
  .command('yaml-to-json')
  .description('Convert YAML to JSON')
  .requiredOption('-i, --input <file>', 'Input YAML file')
  .option('-o, --output <file>', 'Output JSON file')
  .option('-p, --pretty', 'Pretty print JSON', true)
  .action((options) => {
    convertYamlToJson(options.input, options.output, options.pretty);
  });

program
  .command('json-to-yaml')
  .description('Convert JSON to YAML')
  .requiredOption('-i, --input <file>', 'Input JSON file')
  .option('-o, --output <file>', 'Output YAML file')
  .action((options) => {
    convertJsonToYaml(options.input, options.output);
  });

program
  .command('validate')
  .description('Validate OpenAPI specification')
  .requiredOption('-f, --file <file>', 'OpenAPI file to validate')
  .action((options) => {
    validateOpenApi(options.file);
  });

program
  .command('generate-types')
  .description('Generate TypeScript types from OpenAPI spec')
  .requiredOption('-i, --input <file>', 'Input OpenAPI file')
  .option('-o, --output <file>', 'Output TypeScript file')
  .action((options) => {
    generateTypes(options.input, options.output);
  });

program
  .command('watch')
  .description('Watch for changes and regenerate')
  .option('-i, --input <file>', 'Input YAML file', 'spec/openapi.yaml')
  .option('-o, --output <file>', 'Output JSON file', 'spec/openapi.json')
  .action((options) => {
    watchFile(options.input, options.output);
  });

function ensureDirectoryExists(filePath) {
  const dir = dirname(filePath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

function readYamlFile(filePath) {
  try {
    console.log(chalk.blue(`📖 Reading YAML file: ${filePath}`));
    const content = readFileSync(filePath, 'utf8');
    return YAML.parse(content);
  } catch (error) {
    console.error(chalk.red(`❌ Error reading YAML file: ${error.message}`));
    process.exit(1);
  }
}

function readJsonFile(filePath) {
  try {
    console.log(chalk.blue(`📖 Reading JSON file: ${filePath}`));
    const content = readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(chalk.red(`❌ Error reading JSON file: ${error.message}`));
    process.exit(1);
  }
}

function convertYamlToJson(inputPath, outputPath, pretty = true) {
  try {
    const yamlContent = readYamlFile(inputPath);
    
    // ถ้าไม่ได้ระบุ output path ให้สร้างจาก input path
    const jsonPath = outputPath || inputPath.replace(/\.yaml$/, '.json');
    
    ensureDirectoryExists(jsonPath);
    
    const jsonContent = pretty 
      ? JSON.stringify(yamlContent, null, 2)
      : JSON.stringify(yamlContent);
    
    writeFileSync(jsonPath, jsonContent, 'utf8');
    
    console.log(chalk.green(`✅ Successfully converted ${inputPath} to ${jsonPath}`));
    
    // Validate the generated JSON
    try {
      JSON.parse(jsonContent);
      console.log(chalk.green('✅ Generated JSON is valid'));
    } catch (error) {
      console.warn(chalk.yellow(`⚠️ Warning: Generated JSON may have issues: ${error.message}`));
    }
    
    return jsonPath;
  } catch (error) {
    console.error(chalk.red(`❌ Error converting YAML to JSON: ${error.message}`));
    process.exit(1);
  }
}

function convertJsonToYaml(inputPath, outputPath) {
  try {
    const jsonContent = readJsonFile(inputPath);
    
    // ถ้าไม่ได้ระบุ output path ให้สร้างจาก input path
    const yamlPath = outputPath || inputPath.replace(/\.json$/, '.yaml');
    
    ensureDirectoryExists(yamlPath);
    
    const yamlString = YAML.stringify(jsonContent, {
      indent: 2,
      simpleKeys: true,
      lineWidth: 120,
    });
    
    writeFileSync(yamlPath, yamlString, 'utf8');
    
    console.log(chalk.green(`✅ Successfully converted ${inputPath} to ${yamlPath}`));
    
    return yamlPath;
  } catch (error) {
    console.error(chalk.red(`❌ Error converting JSON to YAML: ${error.message}`));
    process.exit(1);
  }
}

function validateOpenApi(filePath) {
  try {
    console.log(chalk.blue(`🔍 Validating OpenAPI file: ${filePath}`));
    
    let spec;
    if (filePath.endsWith('.yaml') || filePath.endsWith('.yml')) {
      spec = readYamlFile(filePath);
    } else if (filePath.endsWith('.json')) {
      spec = readJsonFile(filePath);
    } else {
      throw new Error('Unsupported file format. Use .yaml, .yml, or .json');
    }
    
    // Basic validation
    const requiredOpenApiFields = ['openapi', 'info', 'paths'];
    const missingFields = requiredOpenApiFields.filter(field => !spec[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required OpenAPI fields: ${missingFields.join(', ')}`);
    }
    
    // Validate version
    if (!spec.openapi.startsWith('3.')) {
      console.warn(chalk.yellow(`⚠️ Warning: OpenAPI version ${spec.openapi} may not be fully supported`));
    }
    
    // Validate info object
    const requiredInfoFields = ['title', 'version'];
    const missingInfoFields = requiredInfoFields.filter(field => !spec.info?.[field]);
    
    if (missingInfoFields.length > 0) {
      throw new Error(`Missing required info fields: ${missingInfoFields.join(', ')}`);
    }
    
    console.log(chalk.green(`✅ OpenAPI specification is valid`));
    console.log(chalk.blue(`📊 Specification details:`));
    console.log(chalk.blue(`  - Version: ${spec.openapi}`));
    console.log(chalk.blue(`  - Title: ${spec.info.title}`));
    console.log(chalk.blue(`  - API Version: ${spec.info.version}`));
    console.log(chalk.blue(`  - Paths: ${Object.keys(spec.paths).length}`));
    
    if (spec.servers?.length > 0) {
      console.log(chalk.blue(`  - Servers: ${spec.servers.length}`));
    }
    
    return true;
  } catch (error) {
    console.error(chalk.red(`❌ Validation failed: ${error.message}`));
    process.exit(1);
  }
}

function generateTypes(inputPath, outputPath) {
  try {
    console.log(chalk.blue(`⚡ Generating TypeScript types from: ${inputPath}`));
    
    let spec;
    if (inputPath.endsWith('.yaml') || inputPath.endsWith('.yml')) {
      spec = readYamlFile(inputPath);
    } else if (inputPath.endsWith('.json')) {
      spec = readJsonFile(inputPath);
    } else {
      throw new Error('Unsupported file format. Use .yaml, .yml, or .json');
    }
    
    const typesPath = outputPath || 'src/types/api.ts';
    ensureDirectoryExists(typesPath);
    
    // Simple TypeScript types generation
    let typesContent = `// Generated TypeScript types from OpenAPI specification
// DO NOT EDIT THIS FILE DIRECTLY
// Generated on: ${new Date().toISOString()}

export interface OpenAPISpec {
  openapi: string;
  info: {
    title: string;
    description?: string;
    version: string;
  };
  paths: Record<string, any>;
  components?: {
    schemas?: Record<string, any>;
    parameters?: Record<string, any>;
    responses?: Record<string, any>;
    securitySchemes?: Record<string, any>;
  };
}

// Component Schemas\n`;

    // Generate interfaces for schemas
    if (spec.components?.schemas) {
      Object.entries(spec.components.schemas).forEach(([name, schema]) => {
        typesContent += `\nexport interface ${name} {\n`;
        
        if (schema.properties) {
          Object.entries(schema.properties).forEach(([propName, propSchema]) => {
            const required = Array.isArray(schema.required) && schema.required.includes(propName);
            const type = getTypeScriptType(propSchema);
            typesContent += `  ${propName}${required ? '' : '?'}: ${type};\n`;
          });
        }
        
        typesContent += `}\n`;
      });
    }

    // Generate enums for parameters with enum values
    if (spec.components?.parameters) {
      Object.entries(spec.components.parameters).forEach(([name, param]) => {
        if (param.schema?.enum) {
          typesContent += `\nexport enum ${name} {\n`;
          param.schema.enum.forEach((value, index) => {
            typesContent += `  ${value.toUpperCase().replace(/[^A-Z0-9_]/g, '_')} = '${value}',\n`;
          });
          typesContent += `}\n`;
        }
      });
    }

    writeFileSync(typesPath, typesContent, 'utf8');
    
    console.log(chalk.green(`✅ TypeScript types generated at: ${typesPath}`));
    
    return typesPath;
  } catch (error) {
    console.error(chalk.red(`❌ Error generating TypeScript types: ${error.message}`));
    process.exit(1);
  }
}

function getTypeScriptType(schema) {
  if (!schema || typeof schema !== 'object') return 'any';
  
  if (schema.type === 'string') {
    if (schema.enum) {
      return schema.enum.map(v => `'${v}'`).join(' | ');
    }
    if (schema.format === 'date-time') return 'Date | string';
    if (schema.format === 'uuid') return 'string';
    if (schema.format === 'email') return 'string';
    if (schema.format === 'uri') return 'string';
    return 'string';
  }
  
  if (schema.type === 'number' || schema.type === 'integer') {
    return 'number';
  }
  
  if (schema.type === 'boolean') {
    return 'boolean';
  }
  
  if (schema.type === 'array') {
    const itemType = getTypeScriptType(schema.items);
    return `${itemType}[]`;
  }
  
  if (schema.type === 'object') {
    return 'Record<string, any>';
  }
  
  if (schema.$ref) {
    const refName = schema.$ref.split('/').pop();
    return refName;
  }
  
  return 'any';
}

function watchFile(inputPath, outputPath) {
  const chokidar = import('chokidar').catch(() => {
    console.error(chalk.red('❌ chokidar is required for watch mode. Install it with: npm install chokidar'));
    process.exit(1);
  });
  
  chokidar.then((chokidar) => {
    console.log(chalk.blue(`👀 Watching for changes in: ${inputPath}`));
    
    chokidar.watch(inputPath).on('change', (path) => {
      console.log(chalk.yellow(`🔄 File changed: ${path}`));
      convertYamlToJson(inputPath, outputPath);
    });
  });
}

// Parse command line arguments
program.parse(process.argv);

// ถ้าไม่มีการระบุ command ให้แสดง help
if (!process.argv.slice(2).length) {
  program.outputHelp();
}