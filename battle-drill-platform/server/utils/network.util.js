import { networkInterfaces } from 'node:os';

/**
 * 探测获取本地 IPv4 局域网物理地址 (用于手机端同网络访问扫码)
 */
export function getLocalIp() {
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
