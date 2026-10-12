import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { SERVER_CONFIG } from '../config/server.config.js';

export class UploadService {
  /**
   * 保存 Base64 图片到本地上传目录
   * @param {object} param0
   * @param {string} param0.data - Base64 Data URL (如 data:image/png;base64,...)
   * @param {string} [param0.name] - 建议保存的文件原始安全名称
   * @returns {Promise<{ url: string, fileName: string }>}
   */
  static async saveBase64Image({ data, name }) {
    if (!data) {
      throw new Error('缺少图片数据');
    }

    const matches = data.match(/^data:image\/([a-zA-Z0-9\+\-\.]+);base64,(.+)$/);
    if (!matches) {
      throw new Error('无效的图片格式，需为 Base64 DataURL');
    }

    let ext = matches[1].toLowerCase();
    if (ext === 'jpeg') ext = 'jpg';
    if (ext.includes('svg')) ext = 'svg';
    if (ext.includes('png')) ext = 'png';
    if (ext.includes('webp')) ext = 'webp';
    if (ext.includes('gif')) ext = 'gif';

    const safeName = (name || 'image')
      .replace(/[^a-zA-Z0-9_\-\u4e00-\u9fa5]/g, '_')
      .slice(0, 32);

    const fileName = `${Date.now()}_${safeName}.${ext}`;
    const uploadsDir = SERVER_CONFIG.uploadsDir;

    await mkdir(uploadsDir, { recursive: true });
    const filePath = join(uploadsDir, fileName);
    await writeFile(filePath, Buffer.from(matches[2], 'base64'));

    return {
      url: `/uploads/${fileName}`,
      fileName
    };
  }
}
