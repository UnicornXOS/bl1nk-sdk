import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { InvocationSchema, ContractSchema, ValidationResult } from './types';

const ajv = new Ajv({ allErrors: true, strict: true });
addFormats(ajv);

export const pluginYamlSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', pattern: '^[a-z0-9-]+$' },
    version: { type: 'string', pattern: '^[0-9]+\\.[0-9]+\\.[0-9]+$' },
    name: { type: 'string', minLength: 1 },
    description: { type: 'string', minLength: 1 },
    runtime: {
      type: 'object',
      properties: {
        type: { enum: ['nodejs', 'python', 'wasm', 'http'] },
        version: { type: 'string' },
        entrypoint: { type: 'string' },
        adapter: { type: 'string' },
      },
      required: ['type', 'version'],
    },
    contract: {
      type: 'object',
      properties: {
        input: { type: 'object' },
        output: { type: 'object' },
      },
      required: ['input', 'output'],
    },
    permissions: {
      type: 'object',
      properties: {
        network: { type: 'boolean' },
        filesystem: { enum: ['read', 'write', 'none'] },
        env: { type: 'boolean' },
        ai: { type: 'boolean' },
      },
    },
    template: {
      type: 'object',
      properties: {
        templatePath: { type: 'string' },
        propsSchema: { type: 'object' },
        allowedPlaceholders: { type: 'array', items: { type: 'string' } },
      },
      required: ['templatePath', 'propsSchema', 'allowedPlaceholders'],
    },
  },
  required: ['id', 'version', 'name', 'description', 'runtime', 'contract'],
};

export const invocationSchema = {
  type: 'object',
  properties: {
    tool_id: { type: 'string', pattern: '^[a-z0-9-]+$' },
    tool_version: { type: 'string', pattern: '^[0-9]+\\.[0-9]+\\.[0-9]+$' },
    invocation_id: { type: 'string', minLength: 1 },
    args: { type: 'object' },
    timestamp: { type: 'string', format: 'date-time' },
    caller_id: { type: 'string' },
  },
  required: ['tool_id', 'tool_version', 'invocation_id', 'args', 'timestamp'],
};

const validatePluginYaml = ajv.compile(pluginYamlSchema);
const validateInvocationObj = ajv.compile(invocationSchema);

export function validatePluginYamlData(data: any): ValidationResult {
  const valid = validatePluginYaml(data);
  return {
    ok: valid,
    errors: validatePluginYaml.errors?.map(err => 
      `${err.instancePath} ${err.message}`
    ),
  };
}

export function validateInvocation(invocation: any): ValidationResult {
  const valid = validateInvocationObj(invocation);
  return {
    ok: valid,
    errors: validateInvocationObj.errors?.map(err => 
      `${err.instancePath} ${err.message}`
    ),
  };
}

export function validateProps(props: any, schema: ContractSchema): ValidationResult {
  try {
    const validatePropsFn = ajv.compile(schema);
    const valid = validatePropsFn(props);
    return {
      ok: valid,
      errors: validatePropsFn.errors?.map(err => 
        `${err.instancePath} ${err.message}`
      ),
    };
  } catch (error) {
    return {
      ok: false,
      errors: [`Schema compilation failed: ${error}`],
    };
  }
}
