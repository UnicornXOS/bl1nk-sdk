import { core } from './src/core.js';

async function testPipeline() {
  try {
    // 1. Register plugin (ต้องมี plugin.yaml ใน directory)
    // const plugin = await core.registerPlugin('./example-plugin');
    
    // 2. Test template rendering
    const renderResult = await core.renderTemplate('test-tool', '1.0.0', {
      TOOL_ID: 'search-api',
      TOOL_VERSION: '1.0.0',
      INVOCATION_ID: 'invoc-123',
      QUERY: 'test query',
      LIMIT: 10,
      FILTERS: ['active', 'verified'],
      TIMESTAMP: new Date().toISOString(),
      CALLER_ID: 'user-123'
    });
    
    console.log('Render result:', renderResult);
    
    // 3. Validate invocation
    const invocation = JSON.parse(renderResult.renderedJson);
    const validation = await core.validateInvocation(invocation);
    console.log('Validation:', validation);
    
    // 4. Verify invocation
    const verification = await core.verifyInvocation(invocation, 'trace-123');
    console.log('Verification:', verification);
    
  } catch (error) {
    console.error('Pipeline test failed:', error);
  }
}

testPipeline();