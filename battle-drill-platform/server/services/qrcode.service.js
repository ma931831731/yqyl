import QRCode from 'qrcode';

export class QrCodeService {
  /**
   * 生成 SVG 矢量二维码字符串
   * @param {string} text - 需要编码的目标 URL 或文本
   * @param {object} options - QRCode 生成配置选项
   * @returns {Promise<string>} SVG 字符串
   */
  static async generateSvg(text, options = {}) {
    const defaultOptions = {
      type: 'svg',
      margin: 1,
      width: 140,
      ...options
    };
    return await QRCode.toString(text || 'https://localhost', defaultOptions);
  }
}
