#!/usr/bin/env node

import { Command } from 'commander';
import path from 'path';
import fs from 'fs/promises';
import { core } from './core';

const program = new Command();

program
  .name('core-cli')
  .description('CLI for managing the Core Plugin System')
  .version('0.1.0');

program
  .command('register')
  .description('Register a plugin from a local repository path')
  .argument('<repoPath>', 'Path to the plugin repository')
  .action(async (repoPath) => {
    try {
      const absolutePath = path.resolve(repoPath);
      console.log(`Registering plugin from ${absolutePath}...`);
      const normalized = await core.registerPlugin(absolutePath);
      console.log('Plugin registered successfully!');
      console.log(`ID: ${normalized.id}, Version: ${normalized.version}, Hash: ${normalized.hash}`);
    } catch (error) {
      console.error('Failed to register plugin:', error);
      process.exit(1);
    }
  });

program
  .command('render')
  .description('Render an invocation template for a plugin')
  .argument('<toolId>', 'Tool ID of the plugin')
  .argument('<toolVersion>', 'Tool version of the plugin')
  .argument('<propsJsonPath>', 'Path to the JSON file containing props')
  .action(async (toolId, toolVersion, propsJsonPath) => {
    try {
      const propsContent = await fs.readFile(path.resolve(propsJsonPath), 'utf-8');
      const props = JSON.parse(propsContent);
      
      console.log(`Rendering template for ${toolId}@${toolVersion}...`);
      const result = await core.renderTemplate(toolId, toolVersion, props);
      
      console.log('Rendered Invocation JSON:');
      console.log(JSON.stringify(JSON.parse(result.renderedJson), null, 2));
    } catch (error) {
      console.error('Failed to render template:', error);
      process.exit(1);
    }
  });

// เพิ่มคำสั่งอื่นๆ เช่น verify, list, get-artifact ตามต้องการ

program.parse(process.argv);
