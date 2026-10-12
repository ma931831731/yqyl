import { UploadService } from '../services/upload.service.js';

export class UploadController {
  /**
   * 处理 /api/upload POST 请求
   */
  static async handleUpload(req, res) {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', async () => {
      try {
        const bodyStr = Buffer.concat(chunks).toString('utf-8');
        const payload = JSON.parse(bodyStr || '{}');

        const result = await UploadService.saveBase64Image({
          data: payload.data,
          name: payload.name
        });

        res.writeHead(200, {
          'Content-Type': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({
          success: true,
          url: result.url,
          fileName: result.fileName
        }));
      } catch (err) {
        res.writeHead(400, {
          'Content-Type': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({
          success: false,
          error: err.message
        }));
      }
    });
  }
}
