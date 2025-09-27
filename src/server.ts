import express from 'express';
import { core } from './core';

const app = express();
app.use(express.json());
const PORT = 3000;

// Endpoint เพื่อลิสต์ปลั๊กอินทั้งหมด
app.get('/plugins', async (req, res) => {
  try {
    const artifacts = await core.listArtifacts(); // สมมติว่ามีฟังก์ชันนี้ใน core.ts
    res.json(artifacts);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Endpoint เพื่อ render template
app.post('/plugins/:id/:version/render', async (req, res) => {
  try {
    const { id, version } = req.params;
    const props = req.body;
    
    const result = await core.renderTemplate(id, version, props);
    res.json(JSON.parse(result.renderedJson));
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// Endpoint เพื่อ verify invocation
app.post('/verify', async (req, res) => {
    try {
        const invocation = req.body;
        const traceId = `trace-${Date.now()}`; // สร้าง trace id ง่ายๆ
        const result = await core.verifyInvocation(invocation, traceId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
