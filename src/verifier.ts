import { InvocationSchema, VerifierResult } from './types';
import { listArtifacts } from './registry';

export async function verifyInvocation(
  invocation: InvocationSchema,
  trace_id: string
): Promise<VerifierResult> {
  try {
    // 1. Check if tool exists in registry
    const artifacts = await listArtifacts();
    const toolExists = artifacts.some(
      art => art.id === invocation.tool_id && art.version === invocation.tool_version
    );
    
    if (!toolExists) {
      return {
        approved: false,
        reason: `Tool ${invocation.tool_id}@${invocation.tool_version} not found in registry`,
        confidence_check: 0.1,
        trace_id,
      };
    }
    
    // 2. Check schema compliance (basic validation)
    const artifact = artifacts.find(
      art => art.id === invocation.tool_id && art.version === invocation.tool_version
    );
    
    if (artifact) {
      // Validate args against contract
      const missingArgs = artifact.contract.input.required?.filter(
        req => invocation.args[req] === undefined
      ) || [];
      
      if (missingArgs.length > 0) {
        return {
          approved: false,
          reason: `Missing required arguments: ${missingArgs.join(', ')}`,
          confidence_check: 0.3,
          trace_id,
        };
      }
    }
    
    // 3. Simple deterministic verification (ใน production ควรใช้ LLM)
    // สำหรับ stub เราใช้ rule-based approval
    const shouldApprove = invocation.args && Object.keys(invocation.args).length > 0;
    
    return {
      approved: shouldApprove,
      reason: shouldApprove ? 'Args validation passed' : 'No arguments provided',
      confidence_check: shouldApprove ? 0.8 : 0.2,
      trace_id,
    };
    
  } catch (error) {
    return {
      approved: false,
      reason: `Verification error: ${error}`,
      confidence_check: 0.0,
      trace_id,
    };
  }
}