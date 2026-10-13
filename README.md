# 舆情百战演练平台 (Battle Drill Platform)

突发网络舆情多端协同推演与红蓝对抗实训演练系统。

---

## 📁 目录结构说明

```text
├── battle-drill-platform/          # 核心演练平台工程（方案A：赛博红蓝对抗多端交互原型）
│   ├── screen.html                 # 导播大屏端（全景战况、热度波形、舆论风向）
│   ├── pc.html                     # 电脑工作台（席位操作、处置策略、研判报告）
│   ├── mobile.html                 # 移动端（现场采编、即时爆料、快讯反馈）
│   ├── admin.html                  # 导播总控端（剧本控制、事件注入、倒计时控制）
│   ├── server.mjs                  # 多端协同 WebSocket 同步服务
│   ├── package.json                # 工程依赖与启动脚本
│   └── start.bat                   # Windows 一键启动脚本
├── global-eye-admin-prototype/     # 演练管理与配置后台原型系统
├── 演练材料与脚本/
│   ├── 6.28应急演练脚本.docx
│   ├── 情景模拟演练脚本---【文化旅游、社会治安】.docx
│   ├── 情景模拟演练脚本---【生态环保】.docx
│   ├── 情景模拟演练脚本---【食品安全】.docx
│   ├── 突发网络YQ桌面推演材料---【医疗事故】.docx
│   ├── 演练材料一：火灾事故V6.doc
│   └── 演练材料二：K市P区学生遭霸凌后自杀V6.docx
└── README.md
```

---

## 🚀 核心平台快速启动

### 方式一：一键启动（Windows）
双击运行 `battle-drill-platform/start.bat` 即可启动服务。

### 方式二：命令行启动
```bash
cd battle-drill-platform
npm install
npm run dev
```

服务默认启动在 `http://localhost:5173`。

### 🌐 访问入口
- **总控大厅 / 导航页**：`http://localhost:5173/`
- **导播总控大屏**：`http://localhost:5173/screen.html`
- **研判演习 PC 端**：`http://localhost:5173/pc.html`
- **移动作战端**：`http://localhost:5173/mobile.html`
- **导播总控管理端**：`http://localhost:5173/admin.html`
