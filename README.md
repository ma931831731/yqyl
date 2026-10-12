# 舆情百战演练平台 (Battle Drill Platform)

突发网络舆情多端协同推演与红蓝对抗实训演练系统。

---

## 🏛️ 分层架构体系说明 (Layered Architecture)

平台已全面完成工程化重构，遵循经典分层架构与高内聚、低耦合原则进行模块化拆解：

```text
battle-drill-platform/
├── server/                         # 1. 服务端分层体系 (Server & API Layer)
│   ├── config/                     # 配置层 (MIME 类型映射、端口与路径配置)
│   │   ├── mime.config.js
│   │   └── server.config.js
│   ├── controllers/                # 控制器层 (HTTP 请求解析与响应封装)
│   │   ├── qrcode.controller.js    # 二维码生成 API 控制器 (/api/qrcode)
│   │   └── upload.controller.js    # 视觉素材文件上传控制器 (/api/upload)
│   ├── services/                   # 业务逻辑服务层 (核心功能逻辑)
│   │   ├── qrcode.service.js       # 二维码矢量图生成业务
│   │   └── upload.service.js       # Base64 图片解析、合法性校验与本地持久化
│   ├── middlewares/                # 中间件层 (CORS、路由接入中间件)
│   │   └── api-router.middleware.js # API 分发中间件 (同时适配 Vite Dev 与 Node Server)
│   ├── utils/                      # 工具层 (网络探测与局域网 IP 解析)
│   │   └── network.util.js
│   └── app.mjs                     # 独立生产环境 Node HTTP 服务入口
│
├── src/                            # 2. 客户端工程化源码 (Client Application Layer)
│   ├── core/                       # 核心引擎与状态管理层 (Core State & Engine)
│   │   ├── constants.js            # 演练系统状态常量、阶段枚举与信道定义
│   │   ├── event-bus.js            # 全局解耦事件通信总线 (Pub/Sub EventBus)
│   │   └── sync-engine.js          # 跨端毫秒级实时同步状态机 (BroadcastChannel + LocalStorage)
│   ├── data/                       # 领域数据与资产仓 (Domain Data & Repository)
│   │   ├── initial-state.js        # 初始业务状态树 (DEFAULT_STATE)
│   │   └── cartridges/             # 突发事件剧本卡带数据仓
│   │       └── index.js            # 火灾演练V6等预设卡带及存储适配器
│   ├── components/                 # 组件化交互层 (Components & Widgets)
│   │   └── common/                 # 跨终端通用公共组件 (Toast 轻提示、Modal、QRCode 等)
│   │       ├── toast.js
│   │       ├── modal.js
│   │       └── qrcode-viewer.js
│   ├── styles/                     # 设计系统与样式层 (Styles & Design Tokens)
│   │   ├── tokens/                 # 基础设计令牌 (Cyberpunk 霓虹色彩变量、字阶、间距)
│   │   │   └── variables.css
│   │   ├── common/                 # 全局基础重置与赛博通用卡片/按钮规范
│   │   │   └── cyber-base.css
│   │   └── modules/                # 各终端专属样式模块
│   │       ├── screen.css          # 指挥大屏样式模块
│   │       ├── pc.css              # PC 作战工作台样式模块
│   │       ├── mobile.css          # 移动端学员参演样式模块
│   │       └── admin.css           # global-eye 规范管理端样式模块
│   └── views/                      # 页面组装与控制器层 (Views Assembly Layer)
│       ├── portal/index.js         # 总控导航大厅入口装配
│       ├── screen/index.js         # 态势指挥大屏端入口装配
│       ├── pc/index.js             # PC 作战席工作台入口装配
│       ├── mobile/index.js         # 移动端学员参演入口装配
│       └── admin/index.js          # 后台剧本编排总控入口装配
│
├── index.html                      # MPA 入口 1: 总控导航大厅
├── screen.html                     # MPA 入口 2: 态势指挥总控大屏
├── pc.html                         # MPA 入口 3: PC 端作战台与卡带大厅
├── mobile.html                     # MPA 入口 4: 移动端学员参演终端
├── admin.html                      # MPA 入口 5: 剧本演练编排管理后台
├── vite.config.mjs                 # Vite 现代化工程化构建与多页应用 (MPA) 配置
├── package.json                    # 工程依赖与脚本定义
└── start.bat                       # Windows 一键快速启动脚本
```

---

## 🚀 核心平台快速启动

### 方式一：一键启动（Windows）
双击运行 `battle-drill-platform/start.bat` 即可启动服务。

### 方式二：命令行启动 (开发模式)
```bash
cd battle-drill-platform
npm install
npm run dev
```

### 方式三：独立生产服务启动 (免前端构建)
```bash
cd battle-drill-platform
npm run serve
```

### 方式四：生产打包编译
```bash
cd battle-drill-platform
npm run build
```

---

## 🌐 访问入口
- **总控大厅 / 导航页**：`http://localhost:5173/`
- **导播总控大屏**：`http://localhost:5173/screen.html`
- **研判演习 PC 端**：`http://localhost:5173/pc.html`
- **移动作战端**：`http://localhost:5173/mobile.html` (手机扫码局域网直连)
- **导播总控管理端**：`http://localhost:5173/admin.html`
