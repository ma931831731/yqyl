/**
 * 二维码生成与展示器
 */

export async function fetchQrCodeSvg(text) {
  try {
    const res = await fetch(`/api/qrcode?data=${encodeURIComponent(text)}`);
    if (res.ok) {
      return await res.text();
    }
  } catch (err) {
    console.error('[QRCodeViewer] Failed to fetch qr code:', err);
  }
  return '';
}

export async function mountQrCode(containerSelector, text) {
  const container = typeof containerSelector === 'string'
    ? document.querySelector(containerSelector)
    : containerSelector;
  if (!container) return;

  const svg = await fetchQrCodeSvg(text);
  if (svg) {
    container.innerHTML = svg;
  }
}
