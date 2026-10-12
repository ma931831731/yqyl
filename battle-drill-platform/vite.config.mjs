import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { apiRouterMiddleware } from './server/middlewares/api-router.middleware.js';
import { getLocalIp } from './server/utils/network.util.js';

export default defineConfig({
  root: '.',
  server: {
    port: 5173,
    host: '0.0.0.0',
    cors: true
  },
  resolve: {
    alias: {
      '@': resolve(process.cwd(), 'src'),
      '@core': resolve(process.cwd(), 'src/core'),
      '@components': resolve(process.cwd(), 'src/components'),
      '@styles': resolve(process.cwd(), 'src/styles'),
      '@data': resolve(process.cwd(), 'src/data'),
      '@server': resolve(process.cwd(), 'server')
    }
  },
  plugins: [
    {
      name: 'drill-server-api-middleware',
      configureServer(server) {
        // 将服务端分层路由中间件接入 Vite 开发服务器
        server.middlewares.use((req, res, next) => {
          apiRouterMiddleware(req, res, next);
        });

        // 打印多端局域网访问地址提示
        setTimeout(() => {
          const ip = getLocalIp();
          console.log('\n================================================================');
          console.log('🚀 [Vite] 舆情百战演练平台 · 现代化分层架构工程启动完毕！');
          console.log(`🌐 演练演示总控入口: http://localhost:5173`);
          console.log(`🖥️ 态势指挥大屏端:   http://localhost:5173/screen.html`);
          console.log(`💻 作战席位 PC 工作台: http://localhost:5173/pc.html`);
          console.log(`📱 移动学员实训终端:   http://${ip}:5173/mobile.html`);
          console.log(`⚙️ 后台剧本编辑器:     http://localhost:5173/admin.html`);
          console.log('================================================================\n');
        }, 300);
      }
    }
  ],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        index: resolve(process.cwd(), 'index.html'),
        screen: resolve(process.cwd(), 'screen.html'),
        pc: resolve(process.cwd(), 'pc.html'),
        mobile: resolve(process.cwd(), 'mobile.html'),
        admin: resolve(process.cwd(), 'admin.html')
      }
    }
  }
});
