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

const sseClients = new Set();

function broadcastSSE(data) {
  const message = `data: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(message);
    } catch {
      sseClients.delete(client);
    }
  }
}

function getLocalIp() {
  const nets = networkInterfaces();
  const candidates = [];
  for (const name of Object.keys(nets)) {
    const lowerName = name.toLowerCase();
    // 过滤虚拟网卡、VPN、TUN、WSL、Docker 等
    const isVirtual = /tun|tap|singbox|clash|wsl|veth|docker|hyper-v|virtual/i.test(lowerName);

    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        if (net.address.startsWith('127.') || net.address.startsWith('169.254.')) continue;
        candidates.push({ name, address: net.address, isVirtual });
      }
    }
  }

  // 1. 优先非虚拟网卡的 192.168.x.x (最常见的家庭/办公Wi-Fi局域网网段)
  const lan192 = candidates.find(c => !c.isVirtual && c.address.startsWith('192.168.'));
  if (lan192) return lan192.address;

  // 2. 其次非虚拟网卡的 10.x.x.x
  const lan10 = candidates.find(c => !c.isVirtual && c.address.startsWith('10.'));
  if (lan10) return lan10.address;

  // 3. 其它任意非虚拟物理网卡 IPv4
  const physical = candidates.find(c => !c.isVirtual);
  if (physical) return physical.address;

  // 4. 若无物理网卡，退而求其次选第一个非空候选
  if (candidates.length > 0) return candidates[0].address;

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

    // 系统网络信息 API (供前端获取真实的手机扫码局域网物理IP)
    if (rawUrl.startsWith('/api/network') || rawUrl.startsWith('/api/ip')) {
      const ip = getLocalIp();
      res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*'
      });
      return res.end(JSON.stringify({ success: true, ip, port, origin: `http://${ip}:${port}` }));
    }

    // 二维码生成 API (自动将 localhost 替换为真实局域网 IP，保证手机扫码可用)
    if (rawUrl.startsWith('/api/qrcode')) {
      const parsed = new URL(rawUrl, `http://localhost:${port}`);
      let text = parsed.searchParams.get('data') || parsed.searchParams.get('text') || `http://localhost:${port}`;
      const bestIp = getLocalIp();
      const lanOrigin = (bestIp && bestIp !== 'localhost') ? `http://${bestIp}:${port}` : `http://localhost:${port}`;
      if (text.startsWith('/')) {
        text = `${lanOrigin}${text}`;
      } else if (bestIp && bestIp !== 'localhost') {
        text = text.replace(/localhost/gi, bestIp).replace(/127\.0\.0\.1/g, bestIp);
      }
      const svg = await QRCode.toString(text, { type: 'svg', margin: 1, width: 140 });
      res.writeHead(200, {
        'Content-Type': 'image/svg+xml; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*'
      });
      return res.end(svg);
    }

    // SSE 跨设备实时同步事件流 (供大屏、中控、手机多设备局域网实时互通)
    if (rawUrl.startsWith('/api/sync/events')) {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*'
      });
      res.write(`data: ${JSON.stringify({ type: 'CONNECTED', timestamp: Date.now() })}\n\n`);
      sseClients.add(res);

      req.on('close', () => {
        sseClients.delete(res);
      });
      return;
    }

    // 跨设备状态广播推送 API
    if (rawUrl.startsWith('/api/sync/publish') && req.method === 'POST') {
      const chunks = [];
      req.on('data', chunk => chunks.push(chunk));
      req.on('end', () => {
        try {
          const body = Buffer.concat(chunks).toString('utf-8');
          const payload = JSON.parse(body || '{}');
          broadcastSSE(payload);
          res.writeHead(200, {
            'Content-Type': 'application/json; charset=utf-8',
            'Access-Control-Allow-Origin': '*'
          });
          return res.end(JSON.stringify({ success: true }));
        } catch (err) {
          res.writeHead(400, {
            'Content-Type': 'application/json; charset=utf-8',
            'Access-Control-Allow-Origin': '*'
          });
          return res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });
      return;
    }

    // 本地文件上传 API (支持剧本图片与手机端现场短视频保存至 uploads/ 目录)
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
            return res.end(JSON.stringify({ success: false, error: '缺少媒体数据' }));
          }

          // 匹配图片或视频 base64
          const matches = payload.data.match(/^data:([a-zA-Z0-9\+\-\.]+)\/([a-zA-Z0-9\+\-\.]+);base64,(.+)$/);
          if (!matches) {
            res.writeHead(400, {
              'Content-Type': 'application/json; charset=utf-8',
              'Access-Control-Allow-Origin': '*'
            });
            return res.end(JSON.stringify({ success: false, error: '无效的数据格式' }));
          }

          const mediaType = matches[1].toLowerCase(); // 'image' or 'video'
          let ext = matches[2].toLowerCase();
          if (ext === 'jpeg') ext = 'jpg';
          if (ext.includes('svg')) ext = 'svg';
          if (ext.includes('png')) ext = 'png';
          if (ext.includes('webp')) ext = 'webp';
          if (ext.includes('gif')) ext = 'gif';
          if (ext.includes('mp4')) ext = 'mp4';
          if (ext.includes('webm')) ext = 'webm';
          if (ext.includes('quicktime') || ext.includes('mov')) ext = 'mp4';

          const safeName = (payload.name || (mediaType === 'video' ? 'video' : 'image')).replace(/[^a-zA-Z0-9_\-\u4e00-\u9fa5]/g, '_').slice(0, 32);
          const fileName = `${Date.now()}_${safeName}.${ext}`;
          const uploadsDir = join(root, 'uploads');
          await mkdir(uploadsDir, { recursive: true });
          const filePath = join(uploadsDir, fileName);
          await writeFile(filePath, Buffer.from(matches[3], 'base64'));

          res.writeHead(200, {
            'Content-Type': 'application/json; charset=utf-8',
            'Access-Control-Allow-Origin': '*'
          });
          return res.end(JSON.stringify({ success: true, url: `/uploads/${fileName}`, fileName, mediaType }));
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
