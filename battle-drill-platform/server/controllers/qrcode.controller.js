import { QrCodeService } from '../services/qrcode.service.js';

export class QrCodeController {
  /**
   * 处理 /api/qrcode GET 请求
   */
  static async handleGetQrCode(req, res) {
    try {
      const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
      const text = urlObj.searchParams.get('data') || urlObj.searchParams.get('text') || 'https://localhost';
      
      const svg = await QrCodeService.generateSvg(text);

      res.writeHead(200, {
        'Content-Type': 'image/svg+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=86400',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(svg);
    } catch (err) {
      res.writeHead(500, {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify({ success: false, error: err.message }));
    }
  }
}
