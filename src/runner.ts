import { VM } from 'vm2';
import { NormalizedPlugin } from './types';

export async function executeNodePlugin(
  artifact: NormalizedPlugin,
  input: any,
  context: any // ข้อมูลเพิ่มเติมที่อยากส่งให้ปลั๊กอิน
): Promise<any> {

  if (artifact.runtime.type !== 'nodejs') {
    throw new Error('This runner is only for nodejs plugins');
  }

  // สร้าง Sandbox ที่จำกัดสิทธิ์
  const sandbox = {
    input,
    context,
    console, // อนุญาตให้ใช้ console.log ได้
    // ไม่อนุญาตให้เข้าถึง 'fs', 'child_process', 'process'
  };

  const vm = new VM({
    timeout: 1000, // จำกัดเวลาทำงาน 1 วินาที
    sandbox,
    eval: false,
    wasm: false,
  });

  // โค้ดของปลั๊กอิน (สมมติว่าอ่านมาจาก entrypoint)
  const pluginCode = `
    // ตัวอย่างโค้ดในปลั๊กอิน
    function handler(input, context) {
      return { message: \`Hello, \${input.name}!\`, from: context.caller };
    }
    module.exports = { handler };
  `;
  
  // รันโค้ดใน VM
  const scriptResult = vm.run(pluginCode);
  
  if (typeof scriptResult.handler !== 'function') {
    throw new Error('Plugin must export a handler function');
  }

  // เรียกใช้ handler function
  const output = scriptResult.handler(input, context);
  return output;
}

// ใน core.ts สามารถเรียกใช้
// const output = await executeNodePlugin(artifact, input, { caller: 'CoreSDK' });
