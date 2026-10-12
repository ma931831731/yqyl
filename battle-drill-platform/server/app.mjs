import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { SERVER_CONFIG } from './config/server.config.js';
import { MIME_TYPES } from './config/mime.config.js';
import { getLocalIp } from './utils/network.util.js';
import { apiRouterMiddleware } from './middlewares/api-router.middleware.js';

const root = SERVER_CONFIG.root;
const port = SERVER_CONFIG.port;

function resolvePath(url) {
  const pathname = decodeURIComponent(new URL(url, `http://localhost:${port}`).pathname);
  const target = pathname === '/' ? '/index.html' : pathname;
  const fullPath = normalize(join(root, target));
  return fullPath.startsWith(root) ? fullPath : join(root, 'index.html');
}

export function createDrillServer() {
  return createServer(async (req, res) => {
    // 优先进入分层 API 路由中间件
    apiRouterMiddleware(req, res, async () => {
      // 静态资源文件回退服务
      try {
        const filePath = resolvePath(req.url || '/');
        const body = await readFile(filePath);
        res.writeHead(200, {
          'Content-Type': MIME_TYPES[extname(filePath)] || 'application/octet-stream',
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
  });
}

// 若直接运行 node server/app.mjs
if (process.argv[1]?.endsWith('app.mjs') || process.argv[1]?.endsWith('server.mjs')) {
  const server = createDrillServer();
  server.listen(port, SERVER_CONFIG.host, () => {
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
}
