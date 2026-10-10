import { createServer } from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { networkInterfaces } from 'node:os';
import QRCode from 'qrcode';

const port = Number(process.env.PORT || 5173);
const root = process.cwd();

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm'
};

function getLocalIp() {
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

function resolvePath(url) {
  const pathname = decodeURIComponent(new URL(url, `http://localhost:${port}`).pathname);
  const target = pathname === '/' ? '/index.html' : pathname;
  const fullPath = normalize(join(root, target));
  return fullPath.startsWith(root) ? fullPath : join(root, 'index.html');
}

const server = createServer(async (req, res) => {
  try {
    const rawUrl = req.url || '/';

    // CORS 预检
    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      });
      return res.end();
    }

    // 二维码生成 API
    if (rawUrl.startsWith('/api/qrcode')) {
      const parsed = new URL(rawUrl, `http://localhost:${port}`);
      const text = parsed.searchParams.get('data') || parsed.searchParams.get('text') || 'https://localhost';
      const svg = await QRCode.toString(text, { type: 'svg', margin: 1, width: 140 });
      res.writeHead(200, {
        'Content-Type': 'image/svg+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=86400',
        'Access-Control-Allow-Origin': '*'
      });
      return res.end(svg);
    }

    // 本地文件上传 API (支持剧本封面与背景图保存至 uploads/ 目录)
    if (rawUrl.startsWith('/api/upload') && req.method === 'POST') {
      const chunks = [];
      req.on('data', chunk => chunks.push(chunk));
      req.on('end', async () => {
        try {
          const body = Buffer.concat(chunks).toString('utf-8');
          const payload = JSON.parse(body);
          if (!payload || !payload.data) {
            res.writeHead(400, {
              'Content-Type': 'application/json; charset=utf-8',
              'Access-Control-Allow-Origin': '*'
            });
            return res.end(JSON.stringify({ success: false, error: '缺少图片数据' }));
          }

          const matches = payload.data.match(/^data:image\/([a-zA-Z0-9\+\-\.]+);base64,(.+)$/);
          if (!matches) {
            res.writeHead(400, {
              'Content-Type': 'application/json; charset=utf-8',
              'Access-Control-Allow-Origin': '*'
            });
            return res.end(JSON.stringify({ success: false, error: '无效的图片格式' }));
          }

          let ext = matches[1].toLowerCase();
          if (ext === 'jpeg') ext = 'jpg';
          if (ext.includes('svg')) ext = 'svg';
          if (ext.includes('png')) ext = 'png';
          if (ext.includes('webp')) ext = 'webp';
          if (ext.includes('gif')) ext = 'gif';

          const safeName = (payload.name || 'image').replace(/[^a-zA-Z0-9_\-\u4e00-\u9fa5]/g, '_').slice(0, 32);
          const fileName = `${Date.now()}_${safeName}.${ext}`;
          const uploadsDir = join(root, 'uploads');
          await mkdir(uploadsDir, { recursive: true });
          const filePath = join(uploadsDir, fileName);
          await writeFile(filePath, Buffer.from(matches[2], 'base64'));

          res.writeHead(200, {
            'Content-Type': 'application/json; charset=utf-8',
            'Access-Control-Allow-Origin': '*'
          });
          return res.end(JSON.stringify({ success: true, url: `/uploads/${fileName}`, fileName }));
        } catch (uploadErr) {
          res.writeHead(500, {
            'Content-Type': 'application/json; charset=utf-8',
            'Access-Control-Allow-Origin': '*'
          });
          return res.end(JSON.stringify({ success: false, error: uploadErr.message }));
        }
      });
      return;
    }

    const filePath = resolvePath(rawUrl);
    const body = await readFile(filePath);
    res.writeHead(200, {
      'Content-Type': mimeTypes[extname(filePath)] || 'application/octet-stream',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(body);
  } catch (err) {
    try {
      const fallback = await readFile(join(root, 'index.html'));
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(fallback);
    } catch {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
    }
  }
});

server.listen(port, '0.0.0.0', () => {
  const ip = getLocalIp();
  console.log('================================================================');
  console.log('🔥 舆情百战演练系统 · 方案A（赛博红蓝对抗）原型服务已就绪！');
  console.log(`🌐 本地总控演示中心: http://localhost:${port}`);
  console.log(`🖥️ 大屏端独立地址:   http://localhost:${port}/screen.html`);
  console.log(`💻 PC端作战台地址:   http://localhost:${port}/pc.html`);
  console.log(`📱 手机H5参演端地址: http://${ip}:${port}/mobile.html`);
  console.log(`⚙️ 后台剧本编辑地址: http://localhost:${port}/admin.html`);
  console.log('================================================================');
});
