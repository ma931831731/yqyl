import { QrCodeController } from '../controllers/qrcode.controller.js';
import { UploadController } from '../controllers/upload.controller.js';

/**
 * 统一 API 路由中间件 (兼顾 Vite Dev Server 中间件与 Node 原生 Server)
 */
export function apiRouterMiddleware(req, res, next = () => {}) {
  const url = req.url || '/';

  // 1. CORS 跨域预检处理
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    return res.end();
  }

  // 2. /api/qrcode 路由
  if (url.startsWith('/api/qrcode')) {
    return QrCodeController.handleGetQrCode(req, res);
  }

  // 3. /api/upload 路由
  if (url.startsWith('/api/upload') && req.method === 'POST') {
    return UploadController.handleUpload(req, res);
  }

  // 非匹配 API，进入下一层中间件 (静态文件服务等)
  next();
}
