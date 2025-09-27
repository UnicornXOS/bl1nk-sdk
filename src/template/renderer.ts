import { RenderResult, ValidationResult } from '../types';
import { validateProps } from '../validators';

export function renderTemplate(
  text: string,
  props: Record<string, any>,
  allowedPlaceholders: string[]
): RenderResult {
  const usedPlaceholders: string[] = [];
  const placeholders = new Set<string>();
  
  // Find all placeholders
  const placeholderRegex = /\$\{\{([^}]+)\}\}/g;
  let match;
  while ((match = placeholderRegex.exec(text)) !== null) {
    placeholders.add(match[1].trim());
  }
  
  // Validate allowed placeholders
  for (const placeholder of placeholders) {
    if (!allowedPlaceholders.includes(placeholder)) {
      throw new Error(`Placeholder {{${placeholder}}} is not allowed`);
    }
  }
  
  let rendered = text;
  
  // Replace placeholders with JSON-escaped values
  for (const placeholder of placeholders) {
    if (props[placeholder] !== undefined) {
      const value = JSON.stringify(props[placeholder]).slice(1, -1);
      rendered = rendered.replace(
        new RegExp(`\\$\\{\\{\\s*${placeholder}\\s*\\}\\}`, 'g'),
        value
      );
      usedPlaceholders.push(placeholder);
    } else {
      throw new Error(`Missing value for placeholder: ${placeholder}`);
    }
  }
  
  // Validate JSON syntax
  try {
    JSON.parse(rendered);
  } catch (error) {
    throw new Error(`Rendered template is not valid JSON: ${error}`);
  }
  
  return {
    renderedJson: rendered,
    usedPlaceholders,
  };
}

export function safeRenderTemplate(
  text: string,
  props: Record<string, any>,
  allowedPlaceholders: string[],
  schema?: any
): { result?: RenderResult; error?: string } {
  try {
    // Validate props against schema if provided
    if (schema) {
      const validation = validateProps(props, schema);
      if (!validation.ok) {
        return { error: `Invalid props: ${validation.errors?.join(', ')}` };
      }
    }
    
    // Validate template size
    if (text.length > 1024 * 1024) { // 1MB limit
      return { error: 'Template too large' };
    }
    
    const result = renderTemplate(text, props, allowedPlaceholders);
    
    // Validate rendered JSON size
    if (result.renderedJson.length > 1024 * 1024) {
      return { error: 'Rendered JSON too large' };
    }
    
    return { result };
  } catch (error) {
    return { error: (error as Error).message };
  }
}
