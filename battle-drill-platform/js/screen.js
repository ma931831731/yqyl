/* ==========================================================================
   2-2. 政府公信力时序演化态势趋势图 (按每个时间节点展示，与演练阶段深度联动)
   ========================================================================== */
class CredibilityTrendChart {
  constructor() {
    this.canvas = document.getElementById('credibilityTrendCanvas');
    this.container = document.getElementById('trendChartViewport');
    this.tooltip = document.getElementById('trendChartTooltip');
    if (!this.canvas || !this.container) return;

    this.ctx = this.canvas.getContext('2d');
    this.currentStageIdx = 1;
    this.hoveredNode = null;

    // 14 个时序演练节点 (覆盖阶段一到阶段五全流程)
    this.nodes = [
      { time: '04-08 18:57', score: 92, stageIdx: 0, stageName: '阶段一·初发核实', event: '突发火情居民楼受阻', delta: -8, note: '基准公信力受冲击' },
      { time: '04-08 19:25', score: 92, stageIdx: 0, stageName: '阶段一·初发核实', event: '短视频网络发酵扩散', delta: 0, note: '短视频自媒体跟进' },
      { time: '04-08 19:40', score: 88, stageIdx: 1, stageName: '阶段二·现场通报', event: '现场全面交通管制', delta: -4, note: '消防深入火场搜救' },
      { time: '04-08 20:10', score: 83, stageIdx: 1, stageName: '阶段二·现场通报', event: '私家车堵塞消防通道声讨', delta: -5, note: '网络强烈谴责堵道' },
      { time: '04-08 21:00', score: 83, stageIdx: 1, stageName: '阶段二·现场通报', event: '联合调查组首期权威通报', delta: +5, note: '黄金首报对冲舆情' },
      { time: '04-08 21:40', score: 79, stageIdx: 2, stageName: '阶段三·次生造谣', event: '快手自媒体煽动次生伤亡', delta: -4, note: '夸大死亡造谣' },
      { time: '04-08 23:00', score: 76, stageIdx: 2, stageName: '阶段三·次生造谣', event: '@正义家长联盟 借题补课炒作', delta: -3, note: '挑唆教育黑产对立' },
      { time: '04-09 01:30', score: 77, stageIdx: 2, stageName: '阶段三·次生造谣', event: '教育局连夜联合摸排辟谣', delta: +1, note: '澄清租住陪读家庭' },
      { time: '04-09 03:20', score: 71, stageIdx: 2, stageName: '阶段三·次生造谣', event: '业主爆料伪造签字空消火栓箱', delta: -6, note: '舆论公信力跌至低谷' },
      { time: '04-09 05:40', score: 74, stageIdx: 2, stageName: '阶段三·次生造谣', event: '立案查封物业消检假签字台账', delta: +3, note: '雷霆立案执法逆转' },
      { time: '04-09 07:15', score: 80, stageIdx: 3, stageName: '阶段四·铁证辟谣', event: '网信办锁定造谣黑水军IP与身份', delta: +6, note: '锁定首要造谣团伙' },
      { time: '04-09 08:00', score: 85, stageIdx: 3, stageName: '阶段四·铁证辟谣', event: '市公安局发布全网行政拘留通报', delta: +5, note: '全网严正辟谣定调' },
      { time: '04-09 09:30', score: 92, stageIdx: 4, stageName: '阶段五·定调复盘', event: '联合调查组召开新闻发布会通气', delta: +7, note: '全流程调查报告出炉' },
      { time: '04-09 10:00', score: 98, stageIdx: 4, stageName: '阶段五·定调复盘', event: '市政府权威定调与通报归档', delta: +6, note: '公信力重归高位98分' }
    ];

    this.initEvents();
    this.resize();
  }

  resize() {
    if (!this.canvas || !this.container) return;
    const rect = this.container.getBoundingClientRect();
    const w = rect.width || this.container.clientWidth || 800;
    const h = rect.height || this.container.clientHeight || 180;
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = w * dpr;
    this.canvas.height = h * dpr;
    if (this.ctx.resetTransform) {
      this.ctx.resetTransform();
    } else {
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
    this.ctx.scale(dpr, dpr);
    this.width = w;
    this.height = h;
    this.render();
  }

  updateStage(stageIdx, stateScore) {
    this.currentStageIdx = typeof stageIdx === 'number' ? stageIdx : 1;
    if (typeof stateScore === 'number') {
      const stageNodes = this.nodes.filter(n => n.stageIdx === this.currentStageIdx);
      if (stageNodes.length > 0) {
        stageNodes[stageNodes.length - 1].score = stateScore;
      }
    }
    const tag = document.getElementById('trendCurrentStageTag');
    if (tag) {
      const stageNames = ['阶段一·初发 (92分)', '阶段二·现场通报 (83分)', '阶段三·次生造谣 (74分)', '阶段四·铁证辟谣 (85分)', '阶段五·发布会定调 (98分)'];
      const curScore = stateScore || (this.nodes.find(n => n.stageIdx === this.currentStageIdx)?.score || 83);
      tag.textContent = `${stageNames[this.currentStageIdx]?.split(' ')[0] || '推演阶段'} · ${curScore}分`;
    }
    document.querySelectorAll('#trendStageLinkBadges .trend-stage-badge').forEach(b => {
      b.classList.toggle('active', Number(b.dataset.stage) === this.currentStageIdx);
    });
    this.render();
  }

  initEvents() {
    if (!this.canvas) return;

    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      let closest = null;
      let minDis = 26;

      if (this.nodeCoords) {
        for (const pt of this.nodeCoords) {
          const d = Math.hypot(pt.x - mouseX, pt.y - mouseY);
          if (d < minDis) {
            minDis = d;
            closest = pt;
          }
        }
      }

      this.hoveredNode = closest;
      if (closest) {
        this.canvas.style.cursor = 'pointer';
        if (this.tooltip) {
          const n = closest.node;
          const deltaColor = n.delta >= 0 ? '#00e676' : '#ff2a5f';
          const deltaSign = n.delta >= 0 ? `+${n.delta}` : `${n.delta}`;
          this.tooltip.innerHTML = `
            <div style="font-weight:700; color:#00f0ff; margin-bottom:2px;">🕒 ${n.time} · ${n.stageName}</div>
            <div style="color:#ffffff; font-size:11px; margin-bottom:2px;">📌 ${n.event}</div>
            <div style="display:flex; justify-content:space-between; gap:12px; font-size:10.5px; color:#a8d5ff;">
              <span>公信力: <b style="color:#00f0ff; font-size:12.5px;">${n.score}</b> 分</span>
              <span>变动: <b style="color:${deltaColor}">${deltaSign}</b></span>
            </div>
            <div style="font-size:9.5px; color:#7b8fae; margin-top:2px;">${n.note}</div>
          `;
          this.tooltip.style.left = `${closest.x}px`;
          this.tooltip.style.top = `${closest.y}px`;
          this.tooltip.style.display = 'block';
        }
      } else {
        this.canvas.style.cursor = 'default';
        if (this.tooltip) this.tooltip.style.display = 'none';
      }
      this.render();
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.hoveredNode = null;
      if (this.tooltip) this.tooltip.style.display = 'none';
      this.render();
    });

    this.canvas.addEventListener('click', () => {
      if (this.hoveredNode) {
        if (typeof window.setStageFromScreen === 'function') {
          window.setStageFromScreen(this.hoveredNode.node.stageIdx);
        }
      }
    });
  }

  render() {
    if (!this.ctx || !this.width || !this.height) return;
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    ctx.clearRect(0, 0, w, h);

    const padLeft = 44;
    const padRight = 32;
    const padTop = 22;
    const padBottom = 26;

    const plotW = w - padLeft - padRight;
    const plotH = h - padTop - padBottom;

    if (plotW <= 0 || plotH <= 0) return;

    const minScore = 60;
    const maxScore = 100;

    const getY = (val) => {
      const norm = (val - minScore) / (maxScore - minScore);
      return padTop + plotH * (1 - norm);
    };

    const nTotal = this.nodes.length;
    const getX = (idx) => padLeft + (idx / (nTotal - 1)) * plotW;

    // 1. 绘制阶段背景微光色带与纵向虚线分隔
    const stageColors = [
      'rgba(0, 240, 255, 0.03)',
      'rgba(0, 136, 255, 0.04)',
      'rgba(255, 42, 95, 0.04)',
      'rgba(0, 230, 118, 0.04)',
      'rgba(0, 240, 255, 0.05)'
    ];
    const stageNames = ['一·初发', '二·发酵', '三·造谣', '四·辟谣', '五·定调'];

    let lastStage = -1;
    let stageStartIdx = 0;
    for (let i = 0; i <= nTotal; i++) {
      const curStage = i < nTotal ? this.nodes[i].stageIdx : 5;
      if (curStage !== lastStage) {
        if (lastStage !== -1) {
          const xStart = getX(stageStartIdx);
          const xEnd = getX(i - 1);
          const bgW = Math.max(2, xEnd - xStart);
          ctx.fillStyle = stageColors[lastStage % stageColors.length];
          ctx.fillRect(xStart, padTop, bgW, plotH);

          // 阶段标签
          ctx.fillStyle = lastStage === this.currentStageIdx ? '#00f0ff' : 'rgba(123, 143, 174, 0.55)';
          ctx.font = '9px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(stageNames[lastStage] || `阶段${lastStage+1}`, xStart + bgW / 2, padTop - 6);

          // 虚线分割
          ctx.beginPath();
          ctx.setLineDash([3, 4]);
          ctx.strokeStyle = 'rgba(0, 240, 255, 0.12)';
          ctx.moveTo(xStart, padTop);
          ctx.lineTo(xStart, padTop + plotH);
          ctx.stroke();
          ctx.setLineDash([]);
        }
        lastStage = curStage;
        stageStartIdx = i;
      }
    }

    // 2. 绘制 Y 轴横向辅助网格 (60, 70, 80, 90, 100)
    const yGridScores = [60, 70, 80, 90, 100];
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.font = '9px monospace';

    for (const sc of yGridScores) {
      const y = getY(sc);
      ctx.beginPath();
      if (sc === 80) {
        // 80分安全基准警戒线 (黄色虚线)
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = 'rgba(255, 170, 0, 0.5)';
        ctx.lineWidth = 1.2;
      } else {
        ctx.setLineDash([]);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 0.8;
      }
      ctx.moveTo(padLeft, y);
      ctx.lineTo(padLeft + plotW, y);
      ctx.stroke();

      ctx.fillStyle = sc === 80 ? '#ffaa00' : 'rgba(123, 143, 174, 0.65)';
      ctx.fillText(`${sc}`, padLeft - 6, y);
    }
    ctx.setLineDash([]);

    // 3. 计算节点屏幕坐标
    this.nodeCoords = this.nodes.map((node, idx) => ({
      x: getX(idx),
      y: getY(node.score),
      node,
      idx
    }));

    // 4. 绘制填充渐变区域 (Area Fill)
    const activeCoords = this.nodeCoords.filter(p => p.node.stageIdx <= this.currentStageIdx);
    if (activeCoords.length > 1) {
      ctx.beginPath();
      ctx.moveTo(activeCoords[0].x, padTop + plotH);
      for (let i = 0; i < activeCoords.length; i++) {
        ctx.lineTo(activeCoords[i].x, activeCoords[i].y);
      }
      ctx.lineTo(activeCoords[activeCoords.length - 1].x, padTop + plotH);
      ctx.closePath();

      const areaGrad = ctx.createLinearGradient(0, padTop, 0, padTop + plotH);
      areaGrad.addColorStop(0, 'rgba(0, 240, 255, 0.22)');
      areaGrad.addColorStop(0.6, 'rgba(0, 136, 255, 0.06)');
      areaGrad.addColorStop(1, 'rgba(0, 240, 255, 0.0)');
      ctx.fillStyle = areaGrad;
      ctx.fill();
    }

    // 5. 绘制平滑霓虹曲线
    if (activeCoords.length > 1) {
      ctx.beginPath();
      ctx.moveTo(activeCoords[0].x, activeCoords[0].y);
      for (let i = 1; i < activeCoords.length; i++) {
        const prev = activeCoords[i - 1];
        const cur = activeCoords[i];
        const cpx1 = prev.x + (cur.x - prev.x) / 2;
        const cpy1 = prev.y;
        const cpx2 = prev.x + (cur.x - prev.x) / 2;
        const cpy2 = cur.y;
        ctx.bezierCurveTo(cpx1, cpy1, cpx2, cpy2, cur.x, cur.y);
      }
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 2.4;
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // 预测阶段虚线
    if (activeCoords.length < this.nodeCoords.length) {
      ctx.beginPath();
      ctx.setLineDash([3, 4]);
      const lastActive = activeCoords[activeCoords.length - 1];
      ctx.moveTo(lastActive.x, lastActive.y);
      for (let i = activeCoords.length; i < this.nodeCoords.length; i++) {
        const prev = this.nodeCoords[i - 1];
        const cur = this.nodeCoords[i];
        const cpx1 = prev.x + (cur.x - prev.x) / 2;
        const cpy1 = prev.y;
        const cpx2 = prev.x + (cur.x - prev.x) / 2;
        const cpy2 = cur.y;
        ctx.bezierCurveTo(cpx1, cpy1, cpx2, cpy2, cur.x, cur.y);
      }
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.32)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 6. 绘制节点圆点与时间
    for (const pt of this.nodeCoords) {
      const isPastOrCur = pt.node.stageIdx <= this.currentStageIdx;
      const isCurrentNode = pt === activeCoords[activeCoords.length - 1];
      const isHovered = this.hoveredNode && this.hoveredNode.idx === pt.idx;

      if (isCurrentNode) {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 240, 255, 0.25)';
        ctx.fill();
      }

      ctx.beginPath();
      const dotR = isHovered ? 5 : (isCurrentNode ? 4 : 3);
      ctx.arc(pt.x, pt.y, dotR, 0, Math.PI * 2);

      if (isHovered) {
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 10;
      } else if (isCurrentNode) {
        ctx.fillStyle = '#00f0ff';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 8;
      } else if (isPastOrCur) {
        ctx.fillStyle = pt.node.score >= 80 ? '#00e676' : '#ffaa00';
        ctx.strokeStyle = '#060c1c';
        ctx.lineWidth = 1.2;
        ctx.shadowBlur = 0;
      } else {
        ctx.fillStyle = 'rgba(123, 143, 174, 0.35)';
        ctx.strokeStyle = '#060c1c';
        ctx.lineWidth = 1;
        ctx.shadowBlur = 0;
      }

      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      // 分数数值
      if (isPastOrCur || isHovered) {
        ctx.fillStyle = pt.node.score >= 80 ? '#00f0ff' : '#ffaa00';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(pt.node.score, pt.x, pt.y - 7);
      }

      // 底部时间
      ctx.fillStyle = isCurrentNode ? '#00f0ff' : (isPastOrCur ? '#a8d5ff' : 'rgba(123, 143, 174, 0.5)');
      ctx.font = '8px sans-serif';
      ctx.textAlign = 'center';
      const timePart = pt.node.time.split(' ')[1] || pt.node.time;
      ctx.fillText(timePart, pt.x, padTop + plotH + 12);

      // 跨天标注
      if (pt.node.time.includes('04-09') && (pt.idx === 7 || pt.idx === 10)) {
        ctx.fillStyle = 'rgba(255, 170, 0, 0.75)';
        ctx.font = '7px sans-serif';
        ctx.fillText('04-09', pt.x, padTop + plotH + 20);
      }
    }
  }
}
/**
 * 舆情百战演练指挥大屏 · 方案A 赛博红蓝对抗大屏专属逻辑
 * 核心功能：
 * 1. 左侧：红方攻击方实时舆情态势及实时榜单 TOP 5
 * 2. 右侧：蓝方防守端内容与处置履历流水
 * 3. 中间：随推演实时发展动态生长的扩展图谱 (Dynamic Knowledge & Propagation Graph)
 * 4. 背景图：实时绑定当前剧本背景图 (带高保真科技暗光遮罩)
 * 5. 下方：红蓝即时战力对抗天平、公信力核心仪表盘、全阶段进度轴与跨部门调度跑马灯
 * 6. 状态：演练进行中、演练暂停、演练结束全景显要呈现与联动
 */

let arenaInstance = null;
let trendChartInstance = null;
let propagationGraphInstance = null;
let currentCenterMode = 'graph';
let currentActiveScriptId = null;
let currentScreenScore = 92;
let screenScoreAnimTimer = null;


/* ==========================================================================
   0. 指挥总控大屏 1920*1080 标准高清自适应缩放引擎
   - 横向100%铺满屏幕，两边彻底杜绝留白 (按窗口宽度 scaleX = innerWidth / 1920)
   - 纵向根据屏幕可用高度 (如 1920x911 等笔记本分辨率) 动态计算，不溢出不裁切
   - 当屏幕比例与 16:9 接近时 (如 1920x911, 1920x1080)，scaleX 与 scaleY 独立微调或等比横向铺满，保持底部仪表盘与天平永不变形
   ========================================================================== */
function adaptLargeScreenResolution() {
  const container = document.getElementById("screenContainer");
  if (!container) return;

  // 1. 横向 100% 满幅铺满当前视口（彻底消除左右两侧黑边与留白）
  // 2. 纵向基于弹性 Flex 自动安全容纳在视口内部（彻底杜绝底部总控底栏被截断或推挤出屏幕）
  // 3. 彻底杜绝非等比 scale(scaleX, scaleY)，保持 Canvas、仪表盘与卡片 1:1 绝对正圆与原生矢量比例，杜绝畸变变形
  container.style.transform = "none";
  container.style.webkitTransform = "none";
  container.style.transformOrigin = "top left";
  container.style.position = "relative";
  container.style.width = "100%";
  container.style.height = "100%";
  container.style.left = "0";
  container.style.top = "0";

  window.__screenScaleRatioX = 1;
  window.__screenScaleRatioY = 1;
  window.__screenScaleRatio = 1;

  // 触发图谱与仪表盘重新按精确像素绘制
  if (window.propagationGraphInstance) {
    window.propagationGraphInstance.resize();
  }
  if (window.arenaInstance) {
    window.arenaInstance.resize();
  }
  initGaugeCanvas();
  trendChartInstance = new CredibilityTrendChart();
}

document.addEventListener('DOMContentLoaded', () => {
  // 0. 执行 1920*1080 大屏分辨率自适应视口初始化
  adaptLargeScreenResolution();
  // 1. 初始化中间力导向拓扑图谱与红蓝对抗交锋矩阵
  initPropagationGraph();
  initConfrontationArena();

  // 2. 初始化底部公信力仪表盘
  initGaugeCanvas();
  trendChartInstance = new CredibilityTrendChart();

  // 3. 订阅跨端状态机
  if (window.drillEngine) {
    window.drillEngine.subscribe((state, action) => {
      renderAll(state, action);
    });
    renderAll(window.drillEngine.getState(), 'INIT');
  } else {
    console.warn('drillEngine not found, rendering fallback demo state.');
  }

  // 确保首次加载及Flex布局稳定后，图谱和趋势图Canvas以精确宽高重绘
  setTimeout(() => {
    adaptLargeScreenResolution();
    if (propagationGraphInstance) propagationGraphInstance.resize();
    if (trendChartInstance) trendChartInstance.resize();
    if (arenaInstance) arenaInstance.resize();
    drawGaugeSpeedometer(currentScreenScore);
  }, 100);

  // 4. 时钟倒计时定时器
  setInterval(() => {
    updateTimerTick();
  }, 1000);

  // 5. 窗口缩放适配 (1920*1080 等比缩放与内部组件自适应)
  window.addEventListener('resize', () => {
    adaptLargeScreenResolution();
    if (propagationGraphInstance) {
      propagationGraphInstance.resize();
    }
    if (arenaInstance) {
      arenaInstance.resize();
    }
    if (trendChartInstance) {
      trendChartInstance.resize();
    }
    drawGaugeSpeedometer(currentScreenScore);
  });
});

/**
 * 全景渲染总调度
 */
function renderAll(state, action) {
  if (!state) return;

  // 1. 剧本与背景图更新
  updateScriptAndBackground(state);

  // 2. 演练全局运行状态 (进行中 / 暂停 / 结束)
  renderDrillStatus(state.drillStatus, state.battle?.credibilityScore);

  // 3. 顶栏基础信息 (房间、预警等级、阶段、虚拟时钟)
  renderHeaderInfo(state);

  // 4. 左侧：红方攻击态势全景与实时热搜榜
  renderRedCampAndTrending(state);

  // 5. 右侧：蓝方防守态势与应急处置流水
  renderBlueCampAndMeasures(state);

  // 6. 中间：随推演实时发展动态生长的力导向扩展图谱与红蓝对抗交锋
  if (propagationGraphInstance) {
    propagationGraphInstance.updateData(state);
  }
  if (arenaInstance) {
    arenaInstance.updateData(state);
  }
  if (trendChartInstance) {
    trendChartInstance.updateStage(state.drillStage || 0, state.battle?.credibilityScore);
  }

  // 7. 下方：红蓝即时战力天平、公信力仪表盘、阶段推进与密信跑马灯
  renderBottomDock(state);
}

/* ==========================================================================
   1. 剧本背景图绑定 (背景图是剧本的背景图)
   ========================================================================== */
function updateScriptAndBackground(state) {
  const scriptId = state.activeScriptId || 'JB-FIRE-20250408';
  if (scriptId === currentActiveScriptId) return;
  currentActiveScriptId = scriptId;

  // 从剧本库或默认库获取当前剧本配置
  const cartridges = (typeof window.getDrillCartridges === 'function')
    ? window.getDrillCartridges()
    : (window.DEFAULT_DRILL_CARTRIDGES || []);

  const script = cartridges.find(c => c.id === scriptId) || cartridges[0] || {};

  // 确定背景图 URL：优先使用剧本自身的 bgUrl，如果是默认图片或空，优先使用本地 media/bg.png
  let bgUrl = script.bgUrl || './media/bg.png';
  if (bgUrl.includes('unsplash') && !bgUrl.includes('custom')) {
    // 默认使用本地高质量火灾推演背景图
    bgUrl = './media/bg.png';
  }

  // 注入 CSS 变量与背景样式
  document.documentElement.style.setProperty('--script-bg-url', `url('${bgUrl}')`);
  const container = document.getElementById('screenContainer');
  if (container) {
    container.style.backgroundImage = `var(--script-bg-url)`;
  }

  // 顶栏剧本名称
  const roomNameEl = document.getElementById('roomName');
  if (roomNameEl && script.name) {
    roomNameEl.textContent = script.name;
    roomNameEl.title = script.name;
  }
}

/* ==========================================================================
   2. 演练状态指示与全局横幅 (演练结束、演练暂停展示状态)
   ========================================================================== */
function renderDrillStatus(status, credibilityScore = 72) {
  const indicator = document.getElementById('drillStatusIndicator');
  const mainText = document.getElementById('statusMainText');
  const enText = document.getElementById('statusEnText');
  const quickBtn = document.getElementById('statusQuickBtn');
  const countdownStatus = document.getElementById('countdownStatusBadge');

  const pauseBanner = document.getElementById('drillPauseBanner');
  const endedBanner = document.getElementById('drillEndedBanner');
  const bannerFinalScore = document.getElementById('bannerFinalScore');

  // 移除既有状态类名
  if (indicator) {
    indicator.classList.remove('paused', 'ended', 'ready');
  }

  if (status === 'PAUSED') {
    // 1. 暂停状态展示
    if (indicator) indicator.classList.add('paused');
    if (mainText) mainText.textContent = '演练已暂停';
    if (enText) enText.textContent = 'PAUSED';
    if (quickBtn) quickBtn.textContent = '▶';
    if (countdownStatus) {
      countdownStatus.textContent = '时钟静止';
      countdownStatus.style.color = '#ffaa00';
      countdownStatus.style.borderColor = 'rgba(255,170,0,0.4)';
    }

    if (pauseBanner) pauseBanner.style.display = 'block';
    if (endedBanner) endedBanner.style.display = 'none';

  } else if (status === 'ENDED' || status === 'SUCCESS' || status === 'FAILED') {
    // 2. 演练结束展示
    if (indicator) indicator.classList.add('ended');
    if (mainText) mainText.textContent = '演练已结束';
    if (enText) enText.textContent = 'ENDED / 复盘';
    if (quickBtn) quickBtn.textContent = '⏹️';
    if (countdownStatus) {
      countdownStatus.textContent = '已完结';
      countdownStatus.style.color = '#ff2a5f';
      countdownStatus.style.borderColor = 'rgba(255,42,95,0.4)';
    }

    if (pauseBanner) pauseBanner.style.display = 'none';
    if (endedBanner) {
      endedBanner.style.display = 'block';
      if (bannerFinalScore) {
        bannerFinalScore.textContent = `${credibilityScore}分 (${credibilityScore >= 70 ? '良好防守' : '舆情承压'})`;
      }
    }

  } else if (status === 'LOBBY' || status === 'ROSTER') {
    // 3. 备战就绪中
    if (indicator) indicator.classList.add('ready');
    if (mainText) mainText.textContent = '备战就绪中';
    if (enText) enText.textContent = 'STANDBY';
    if (quickBtn) quickBtn.textContent = '▶';
    if (countdownStatus) countdownStatus.textContent = '等待指令';

    if (pauseBanner) pauseBanner.style.display = 'none';
    if (endedBanner) endedBanner.style.display = 'none';

  } else {
    // 4. 正常进行中 (RUNNING)
    if (mainText) mainText.textContent = '演练进行中';
    if (enText) enText.textContent = 'IN PROGRESS';
    if (quickBtn) quickBtn.textContent = '⏸️';
    if (countdownStatus) {
      countdownStatus.textContent = '正常推进';
      countdownStatus.style.color = '#00e676';
      countdownStatus.style.borderColor = 'rgba(0,230,118,0.4)';
    }

    if (pauseBanner) pauseBanner.style.display = 'none';
    if (endedBanner) endedBanner.style.display = 'none';
  }
}

// 快速暂停/恢复演练
function toggleDrillPause(e) {
  if (e) e.stopPropagation();
  if (!window.drillEngine) return;
  const current = window.drillEngine.getState().drillStatus;
  if (current === 'PAUSED') {
    window.drillEngine.resumeDrill();
  } else if (current === 'RUNNING') {
    window.drillEngine.pauseDrill();
  } else {
    window.drillEngine.startDrill();
  }
}

function resumeDrillFromScreen() {
  if (window.drillEngine) {
    window.drillEngine.resumeDrill();
  }
}

function restartDrillFromScreen() {
  if (window.drillEngine) {
    window.drillEngine.resetScenario();
    window.drillEngine.startDrill();
  }
}

function toggleScreenFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen().catch(() => {});
  }
}

/* ==========================================================================
   3. 顶栏信息渲染
   ========================================================================== */
function renderHeaderInfo(state) {
  const room = state.room || {};

  // 房间号
  const roomCodeEl = document.getElementById('roomCode');
  if (roomCodeEl) roomCodeEl.textContent = '#' + (room.id || 'ROOM-8821');

  // 演练剧本名称展示在顶栏大主标题
  const roomNameEl = document.getElementById('roomName');
  if (roomNameEl && room.name) {
    roomNameEl.textContent = room.name;
    roomNameEl.title = room.name;
  }

  // 阶段名称
  const stageNameEl = document.getElementById('stageName');
  if (stageNameEl && room.stageName) {
    stageNameEl.textContent = room.stageName;
  }

  // 预警等级
  const alertBadge = document.getElementById('alertBadge');
  if (alertBadge && room.alertLevel) {
    alertBadge.className = `alert-badge alert-${room.alertLevel}`;
    const map = {
      'BLUE': '四级蓝色预警',
      'YELLOW': '三级黄色预警',
      'ORANGE': '二级橙色预警',
      'RED': '一级红色重大'
    };
    alertBadge.textContent = map[room.alertLevel] || '二级橙色预警';
  }

  // 虚拟推演时钟
  const clockEl = document.getElementById('virtualClock');
  if (clockEl) {
    const vt = room.virtualTime ? room.virtualTime.slice(-5) : '19:22';
    clockEl.textContent = `${vt} (${room.speed || 24}x)`;
  }
}

/* ==========================================================================
   4. 左侧：红方攻击态势与实时热搜榜
   ========================================================================== */
function renderRedCampAndTrending(state) {
  const battle = state.battle || {};
  const confrontations = state.timelineConfrontations || [];

  // 负面声量
  const redVolEl = document.getElementById('redVolumeVal');
  if (redVolEl) {
    const vol = battle.redVolume || 20450;
    redVolEl.textContent = Number(vol).toLocaleString();
  }

  // 扣分累计
  let penaltySum = 0;
  confrontations.forEach(c => {
    if (c.red && typeof c.red.penalty === 'number') {
      penaltySum += c.red.penalty;
    }
  });
  const penaltyEl = document.getElementById('redPenaltySum');
  if (penaltyEl) {
    penaltyEl.textContent = `${penaltySum || -75} 分`;
  }

  // 攻击轮次
  const trendValEl = document.getElementById('redTrendVal');
  if (trendValEl) {
    trendValEl.textContent = `▲ +34% 环比激增 (${confrontations.length} 轮次)`;
  }

  // 红方攻势动态流
  const redStream = document.getElementById('redAttackStream');
  if (redStream) {
    // 倒序展示最近红方贴文
    const recentConfrontations = confrontations.slice(-4).reverse();
    if (recentConfrontations.length === 0) {
      redStream.innerHTML = `<div style="color:#788aa6; font-size:11px; padding:10px; text-align:center;">暂无最新攻击贴文</div>`;
    } else {
      redStream.innerHTML = recentConfrontations.map(c => {
        const red = c.red || {};
        return `
          <div class="red-attack-card">
            <div class="card-top-row">
              <span class="card-author">${red.author || red.role || '造谣网民'} · <span style="font-weight:normal; color:#8ea2bf;">[${red.platform || '抖音'}]</span></span>
              <span class="card-penalty">${red.penalty || -15}分</span>
            </div>
            <div class="card-body-text" title="${red.content || ''}">
              ${red.content || '发布不实舆情爆料贴文与虚假视频'}
            </div>
          </div>
        `;
      }).join('');
    }
  }

  // 实时热搜榜 TOP 5
  const trendingContainer = document.getElementById('trendingList');
  if (trendingContainer && state.trendingList) {
    const list = state.trendingList.slice(0, 5);
    trendingContainer.innerHTML = list.map((item, idx) => {
      const rank = item.rank || (idx + 1);
      const tagClass = item.tag === '爆' ? 'tag-bao' : item.tag === '沸' ? 'tag-fei' : item.tag === '热' ? 'tag-re' : item.tag === '新' ? 'tag-xin' : 'tag-jian';
      const rumorHtml = item.isRumor ? `<span class="rumor-flag">⚠️ 谣言</span>` : '';

      return `
        <div class="trending-row ${item.isHighlighted ? 'row-highlight' : ''}">
          <span class="trending-rank rank-${rank}">${rank}</span>
          <span class="trending-tag ${tagClass}">${item.tag || '热'}</span>
          <span class="trending-title" title="${item.title || ''}">${item.title || ''}</span>
          ${rumorHtml}
          <span class="trending-heat">${item.heat || '100万'}</span>
        </div>
      `;
    }).join('');
  }
}

/* ==========================================================================
   5. 右侧：蓝方防守态势与应急处置流水
   ========================================================================== */
function renderBlueCampAndMeasures(state) {
  const battle = state.battle || {};
  const confrontations = state.timelineConfrontations || [];

  // 正面声量
  const blueVolEl = document.getElementById('blueVolumeVal');
  if (blueVolEl) {
    const vol = battle.blueVolume || 16820;
    blueVolEl.textContent = Number(vol).toLocaleString();
  }

  // 挽回公信力总计
  let gainSum = 0;
  let measuresCount = 0;
  const allMeasures = [];

  confrontations.forEach(c => {
    if (c.blues && Array.isArray(c.blues)) {
      c.blues.forEach(b => {
        measuresCount++;
        gainSum += (b.delta || 10);
        allMeasures.push(Object.assign({}, b, { time: c.time }));
      });
    }
  });

  const recoveryEl = document.getElementById('blueRecoveryVal');
  if (recoveryEl) {
    recoveryEl.textContent = `+${gainSum || 60} 分`;
  }

  // 蓝方协同席位认领状态
  if (state.seats) {
    ['blue_commander', 'blue_emergency', 'blue_fire', 'blue_police', 'blue_health', 'blue_spokesman'].forEach(seatId => {
      const el = document.getElementById(`seat_${seatId}`);
      if (el) {
        const s = state.seats[seatId];
        if (s && s.assigned) {
          el.className = 'seat-badge online';
        } else {
          el.className = 'seat-badge';
        }
      }
    });
  }

  // 蓝方处置措施流水 (展示最近 4 条处置)
  const measuresStream = document.getElementById('blueMeasuresStream');
  if (measuresStream) {
    const recentMeasures = allMeasures.slice(-4).reverse();
    if (recentMeasures.length === 0) {
      measuresStream.innerHTML = `<div style="color:#788aa6; font-size:11px; padding:10px; text-align:center;">暂无处置措施，各专班正在调度核实...</div>`;
    } else {
      measuresStream.innerHTML = recentMeasures.map(m => {
        return `
          <div class="blue-measure-card">
            <div class="blue-card-title">
              <span>${m.role || '应急指挥席'} · <span style="font-weight:normal; color:#8ea2bf;">${m.time || '19:10'}</span></span>
              <span class="blue-card-delta">+${m.delta || 10}分</span>
            </div>
            <div class="blue-card-desc" title="${m.title || ''} ${m.statement || ''}">
              <strong>${m.title || ''}</strong>: ${m.statement || '快速组织部门协同研判与辟谣澄清'}
            </div>
          </div>
        `;
      }).join('');
    }
  }
}

/* ==========================================================================
   6. 下方：红蓝博弈总控底栏
   ========================================================================== */
function renderBottomDock(state) {
  const battle = state.battle || { redPower: 42, bluePower: 58, credibilityScore: 72 };

  // 1. 红蓝博弈条与百分比
  const redBar = document.getElementById('redBarFill');
  const blueBar = document.getElementById('blueBarFill');
  const barRedVal = document.getElementById('barRedVal');
  const barBlueVal = document.getElementById('barBlueVal');
  const verdictTag = document.getElementById('balanceVerdictTag');

  const rPower = Math.max(10, Math.min(90, battle.redPower || 42));
  const bPower = 100 - rPower;

  if (redBar) redBar.style.width = `${rPower}%`;
  if (blueBar) blueBar.style.width = `${bPower}%`;
  if (barRedVal) barRedVal.textContent = `${rPower}%`;
  if (barBlueVal) barBlueVal.textContent = `${bPower}%`;

  if (verdictTag) {
    if (bPower >= 60) {
      verdictTag.textContent = '🛡️ 蓝方正面引导占绝对优势';
      verdictTag.style.color = '#00f0ff';
    } else if (bPower >= 50) {
      verdictTag.textContent = '🛡️ 蓝方正向对冲略占上风';
      verdictTag.style.color = '#80e5ff';
    } else if (rPower >= 60) {
      verdictTag.textContent = '🔥 红方负面舆论施压主导';
      verdictTag.style.color = '#ff6b8b';
    } else {
      verdictTag.textContent = '⚖️ 双方声量处于胶着焦灼博弈';
      verdictTag.style.color = '#ffaa00';
    }
  }

  // 2. 政府公信力速度计仪表盘 (根据演练阶段实时动态变化)
  const score = battle.credibilityScore !== undefined ? battle.credibilityScore : 92;
  animateScreenScore(score);

  const levelBadge = document.getElementById('credibilityLevelBadge');
  const trendText = document.getElementById('credibilityTrendText');

  if (levelBadge) {
    levelBadge.className = 'gauge-level-badge ' + (score >= 80 ? 'level-good' : score >= 60 ? 'level-warn' : 'level-danger');
    levelBadge.textContent = score >= 80 ? '良好可控' : score >= 60 ? '警戒承压' : '危机失控';
  }

  if (trendText) {
    if (score >= 95) {
      trendText.textContent = '★ 卓越标杆 权威闭环';
      trendText.style.color = '#00e676';
    } else if (score >= 80) {
      trendText.textContent = '▲ 权威通报落地 持续回升';
      trendText.style.color = '#00e676';
    } else if (score >= 60) {
      trendText.textContent = '◆ 舆情处于攻防拉锯阶段';
      trendText.style.color = '#ffaa00';
    } else {
      trendText.textContent = '▼ 虚假谣言持续发酵 承压';
      trendText.style.color = '#ff2a5f';
    }
  }

  // 3. 全五阶段推进进度轴 (支持点击直达与公信力联动)
  const currentStageIndex = state.room ? (state.room.stageIndex || 0) : 0;
  for (let i = 1; i <= 5; i++) {
    const pill = document.getElementById(`stageStep${i}`);
    if (pill) {
      pill.classList.remove('done', 'active');
      if (i - 1 < currentStageIndex) {
        pill.classList.add('done');
      } else if (i - 1 === currentStageIndex) {
        pill.classList.add('active');
      }
    }
  }

  // 4. 点点密信跨部门直报跑马灯
  const tickerEl = document.getElementById('latestDispatch');
  if (tickerEl && state.chatMessages && state.chatMessages.length > 0) {
    const latest = state.chatMessages[state.chatMessages.length - 1];
    tickerEl.innerHTML = `<strong>[${latest.time || '19:15'}] ${latest.senderName || '系统'}：</strong> ${latest.content || ''}`;
  }
}

/* ==========================================================================
   7. 公信力半圆速度计仪表盘与数字缓动引擎 (Canvas)
   ========================================================================== */
function animateScreenScore(targetScore) {
  targetScore = Math.max(0, Math.min(100, Math.round(Number(targetScore || 92))));
  const scoreText = document.getElementById('credibilityScoreText');
  if (!scoreText) return;

  if (currentScreenScore === targetScore) {
    scoreText.textContent = targetScore;
    drawGaugeSpeedometer(targetScore);
    return;
  }

  if (screenScoreAnimTimer) clearInterval(screenScoreAnimTimer);
  const start = currentScreenScore;
  const startTime = performance.now();
  const duration = 500;

  screenScoreAnimTimer = setInterval(() => {
    const elapsed = performance.now() - startTime;
    const progress = Math.min(1, elapsed / duration);
    const ease = 1 - (1 - progress) * (1 - progress);
    const val = Math.round(start + (targetScore - start) * ease);

    scoreText.textContent = val;
    drawGaugeSpeedometer(val);

    if (progress >= 1) {
      clearInterval(screenScoreAnimTimer);
      currentScreenScore = targetScore;
      scoreText.textContent = targetScore;
      drawGaugeSpeedometer(targetScore);
    }
  }, 20);
}

function initGaugeCanvas() {
  const canvas = document.getElementById('gaugeCanvas');
  if (!canvas) return;
  canvas.width = 130;
  canvas.height = 76;
  drawGaugeSpeedometer(currentScreenScore || 83);
}

function drawGaugeSpeedometer(score) {
  const canvas = document.getElementById('gaugeCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const cx = w / 2;
  const cy = 58;
  const r = 45;

  ctx.clearRect(0, 0, w, h);

  // 背景外半弧 (正圆)
  ctx.beginPath();
  ctx.arc(cx, cy, r, Math.PI, 0, false);
  ctx.lineWidth = 7.5;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineCap = 'round';
  ctx.stroke();

  // 刻度线
  const totalTicks = 8;
  for (let i = 0; i <= totalTicks; i++) {
    const angle = Math.PI + (Math.PI / totalTicks) * i;
    const x1 = cx + (r - 6) * Math.cos(angle);
    const y1 = cy + (r - 6) * Math.sin(angle);
    const x2 = cx + (r - 11) * Math.cos(angle);
    const y2 = cy + (r - 11) * Math.sin(angle);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.stroke();
  }

  // 进度半圆弧 (红 -> 橙 -> 蓝 -> 绿渐变, 绝对正圆)
  const percent = Math.min(100, Math.max(0, score)) / 100;
  if (percent > 0) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, Math.PI, Math.PI + Math.PI * percent, false);

    const grad = ctx.createLinearGradient(cx - r, cy, cx + r, cy);
    grad.addColorStop(0, '#ff2a5f');
    grad.addColorStop(0.4, '#ffaa00');
    grad.addColorStop(0.75, '#00f0ff');
    grad.addColorStop(1, '#00e676');

    ctx.strokeStyle = grad;
    ctx.lineWidth = 7.5;
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  // 动态指针 (Needle)
  const needleAngle = Math.PI + Math.PI * percent;
  const needleLen = r - 8;
  const nx = cx + needleLen * Math.cos(needleAngle);
  const ny = cy + needleLen * Math.sin(needleAngle);

  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(nx, ny);
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#ffffff';
  ctx.shadowColor = '#00f0ff';
  ctx.shadowBlur = 6;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // 中心发光圆盘 (Pivot)
  ctx.beginPath();
  ctx.arc(cx, cy, 4.5, 0, Math.PI * 2);
  ctx.fillStyle = '#00f0ff';
  ctx.shadowColor = '#00f0ff';
  ctx.shadowBlur = 8;
  ctx.fill();
  ctx.shadowBlur = 0;
}

/* ==========================================================================
   8. 中间：舆情扩展图谱与时序交锋矩阵控制器
   ========================================================================== */
function initPropagationGraph() {
  const container = document.getElementById('graphContainer');
  const canvas = document.getElementById('propagationCanvas');
  const tooltip = document.getElementById('graphTooltip');
  if (!container || !canvas) return;

  propagationGraphInstance = new DynamicPropagationGraph(container, canvas, tooltip);
}

function initConfrontationArena() {
  arenaInstance = {
    selectedStage: -1,
    filterStage(stageIdx) {
      this.selectedStage = stageIdx;
      const state = window.drillEngine ? window.drillEngine.getState() : null;
      if (state) this.updateData(state);
    },
    resize() {
      const bgCanvas = document.getElementById('arenaBgCanvas');
      if (bgCanvas && bgCanvas.parentElement) {
        bgCanvas.width = bgCanvas.parentElement.clientWidth;
        bgCanvas.height = bgCanvas.parentElement.clientHeight;
      }
      const nexusCanvas = document.getElementById('arenaNexusCanvas');
      if (nexusCanvas && nexusCanvas.parentElement) {
        nexusCanvas.width = nexusCanvas.parentElement.clientWidth;
        nexusCanvas.height = nexusCanvas.parentElement.clientHeight;
      }
    },
    updateData(state) {
      const redStream = document.getElementById('arenaRedStream');
      const blueStream = document.getElementById('arenaBlueStream');
      if (!redStream || !blueStream) return;

      const confrontations = state?.timelineConfrontations || [];
      const filter = this.selectedStage;
      const filtered = filter >= 0
        ? confrontations.filter(c => {
            if (!c.stageId) return true;
            const sNum = parseInt(c.stageId.replace(/\D/g, ''), 10);
            return isNaN(sNum) || sNum <= (filter + 1);
          })
        : confrontations;

      redStream.innerHTML = filtered.map(c => {
        const r = c.red || {};
        return `
          <div class="arena-card-red active">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="font-weight:700; color:#ff99b0; font-size:11px;">🔥 ${r.role || '红方角色'}</span>
              <span style="color:#ff2a5f; font-weight:800; font-size:11px;">${r.penalty || -15}分</span>
            </div>
            <div style="font-size:10px; color:#d8e5ff; line-height:1.4;">${r.content || ''}</div>
            <div style="font-size:9.5px; color:#788aa6; display:flex; justify-content:space-between;">
              <span>${r.platform || '社交网络'} · ${c.time || '18:57'}</span>
              <span>${r.trendingRank ? 'Top ' + r.trendingRank : '舆情施压'}</span>
            </div>
          </div>
        `;
      }).join('') || '<div style="color:#788aa6; font-size:10.5px; text-align:center; padding:20px;">暂无该阶段红方攻势</div>';

      let allBlues = [];
      filtered.forEach(c => {
        if (c.blues && c.blues.length > 0) {
          c.blues.forEach(b => allBlues.push(Object.assign({}, b, { time: c.time })));
        }
      });

      blueStream.innerHTML = allBlues.map(b => `
        <div class="arena-card-blue active">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-weight:700; color:#80f4ff; font-size:11px;">🛡️ ${b.role || '处置席位'}</span>
            <span style="color:#00e676; font-weight:800; font-size:11px;">+${b.delta || 10}分</span>
          </div>
          <div style="font-size:10.5px; color:#fff; font-weight:600;">${b.title || ''}</div>
          <div style="font-size:10px; color:#d8e5ff; line-height:1.4;">${b.statement || ''}</div>
          <div style="font-size:9.5px; color:#788aa6;">⏱️ ${b.time || '19:15'} · 权威通报闭环</div>
        </div>
      `).join('') || '<div style="color:#788aa6; font-size:10.5px; text-align:center; padding:20px;">蓝方研判处置响应中...</div>';

      const redCountTag = document.getElementById('arenaRedCountTag');
      const blueCountTag = document.getElementById('arenaBlueCountTag');
      if (redCountTag) redCountTag.textContent = `共 ${filtered.length} 轮舆情攻势`;
      if (blueCountTag) blueCountTag.textContent = `共 ${allBlues.length} 项处置阻断`;
    }
  };
  arenaInstance.resize();
}


function switchCenterMode(mode) {
  currentCenterMode = mode;
  const graphContainer = document.getElementById('graphContainer');
  const arenaViewport = document.getElementById('arenaBattleViewport');
  const btnGraph = document.getElementById('btnModeGraph');
  const btnArena = document.getElementById('btnModeArena');
  const mainTitle = document.getElementById('centerPanelMainTitle');
  const stageBadge = document.getElementById('graphStageBadge');
  const metricsPills = document.getElementById('graphMetricsPills');

  if (graphContainer) graphContainer.style.display = 'none';
  if (arenaViewport) arenaViewport.style.display = 'none';
  if (btnGraph) btnGraph.classList.remove('active');
  if (btnArena) btnArena.classList.remove('active');

  const state = window.drillEngine ? window.drillEngine.getState() : null;

  if (mode === 'arena') {
    if (arenaViewport) arenaViewport.style.display = 'flex';
    if (btnArena) btnArena.classList.add('active');
    if (mainTitle) mainTitle.textContent = '⚡ 红蓝对抗交锋矩阵 · 实时战线双向碰撞';
    if (stageBadge) stageBadge.textContent = '交锋矩阵';
    if (metricsPills) metricsPills.style.display = 'none';
    if (arenaInstance) {
      arenaInstance.resize();
      if (state) arenaInstance.updateData(state);
    }
  } else {
    // mode === 'graph'
    if (graphContainer) graphContainer.style.display = 'flex';
    if (btnGraph) btnGraph.classList.add('active');
    if (mainTitle) mainTitle.textContent = '🕸️ 舆情全网传播扩展图谱 · 动态力导向演化拓扑';
    if (stageBadge) stageBadge.textContent = '动态拓扑';
    if (metricsPills) metricsPills.style.display = 'flex';
    if (propagationGraphInstance) {
      propagationGraphInstance.resize();
      if (state) propagationGraphInstance.updateData(state);
    }
  }
}

function filterCenterStage(stageIdx) {
  document.querySelectorAll('#graphStageTabs .stage-filter-btn').forEach(btn => {
    btn.classList.toggle('active', Number(btn.dataset.stage) === stageIdx);
  });
  if (propagationGraphInstance) propagationGraphInstance.filterStage(stageIdx);
  if (arenaInstance) arenaInstance.filterStage(stageIdx);
}

function filterArenaStage(stageIdx) {
  filterCenterStage(stageIdx);
}

// 大屏端快速切换演练阶段，联动全端所有区域 (中枢、图谱、趋势图、左右攻防态势)
function setStageFromScreen(stageIndex) {
  const idx = Math.max(0, Math.min(4, Number(stageIndex || 0)));
  if (window.drillEngine) {
    window.drillEngine.setDrillStage(idx);
  }
  const state = window.drillEngine ? window.drillEngine.getState() : null;
  if (trendChartInstance) {
    trendChartInstance.updateStage(idx, state?.battle?.credibilityScore);
  }
  if (propagationGraphInstance) {
    if (typeof propagationGraphInstance.filterStage === 'function') {
      propagationGraphInstance.filterStage(idx);
    }
    if (state) propagationGraphInstance.updateData(state);
  }
  if (arenaInstance) {
    if (typeof arenaInstance.filterStage === 'function') {
      arenaInstance.filterStage(idx);
    }
    if (state) arenaInstance.updateData(state);
  }
}

function resetGraphView() {
  if (propagationGraphInstance) {
    propagationGraphInstance.resetCenter();
  }
}

function zoomGraphIn() {
  if (propagationGraphInstance) {
    propagationGraphInstance.zoomIn();
  }
}

function zoomGraphOut() {
  if (propagationGraphInstance) {
    propagationGraphInstance.zoomOut();
  }
}

class DynamicPropagationGraph {
  constructor(container, canvas, tooltip) {
    this.container = container;
    this.canvas = canvas;
    this.tooltip = tooltip;
    this.ctx = canvas.getContext('2d');

    this.width = container.clientWidth || 1000;
    this.height = container.clientHeight || 600;
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    this.nodes = [];
    this.links = [];
    this.particles = [];

    this.offsetX = 0;
    this.offsetY = 0;
    this.zoom = 1;
    this.isPanning = false;
    this.panStartX = 0;
    this.panStartY = 0;

    this.draggedNode = null;
    this.dragOffsetX = 0;
    this.dragOffsetY = 0;
    this.hoveredNode = null;

    this.bindEvents();
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  resize() {
    this.width = this.container.clientWidth || 1000;
    this.height = this.container.clientHeight || 600;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  resetCenter() {
    this.offsetX = 0;
    this.offsetY = 0;
    this.zoom = 1;
    this.nodes.forEach(n => {
      n.isPinned = false;
      n.isDragging = false;
    });
    const state = window.drillEngine ? window.drillEngine.getState() : null;
    if (state) {
      this.updateData(state);
    }
  }

  zoomIn() {
    const cx = this.width / 2;
    const cy = this.height / 2;
    const newZoom = Math.min(2.5, +(this.zoom * 1.2).toFixed(2));
    this.offsetX = cx - (cx - this.offsetX) * (newZoom / this.zoom);
    this.offsetY = cy - (cy - this.offsetY) * (newZoom / this.zoom);
    this.zoom = newZoom;
  }

  zoomOut() {
    const cx = this.width / 2;
    const cy = this.height / 2;
    const newZoom = Math.max(0.5, +(this.zoom / 1.2).toFixed(2));
    this.offsetX = cx - (cx - this.offsetX) * (newZoom / this.zoom);
    this.offsetY = cy - (cy - this.offsetY) * (newZoom / this.zoom);
    this.zoom = newZoom;
  }

  getNodeAt(worldX, worldY) {
    const hitSlack = 15 / this.zoom;
    for (let i = this.nodes.length - 1; i >= 0; i--) {
      const node = this.nodes[i];
      const dx = node.x - worldX;
      const dy = node.y - worldY;
      if (Math.hypot(dx, dy) <= node.radius + hitSlack) {
        return node;
      }
    }
    return null;
  }

  bindEvents() {
    const getPointerCoords = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.touches && e.touches.length > 0 ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches && e.touches.length > 0 ? e.touches[0].clientY : e.clientY;
      // 兼容 1920*1080 CSS transform scale 缩放下的精确指针物理映射
      const scaleX = rect.width ? (this.canvas.width / rect.width) : 1;
      const scaleY = rect.height ? (this.canvas.height / rect.height) : 1;
      const canvasX = (clientX - rect.left) * scaleX;
      const canvasY = (clientY - rect.top) * scaleY;
      return {
        canvasX,
        canvasY,
        worldX: (canvasX - this.offsetX) / this.zoom,
        worldY: (canvasY - this.offsetY) / this.zoom,
        clientX,
        clientY
      };
    };

    const handlePointerDown = (e) => {
      const coords = getPointerCoords(e);
      const hitNode = this.getNodeAt(coords.worldX, coords.worldY);

      if (hitNode) {
        this.draggedNode = hitNode;
        hitNode.isDragging = true;
        hitNode.isPinned = true;
        this.dragOffsetX = hitNode.x - coords.worldX;
        this.dragOffsetY = hitNode.y - coords.worldY;
        this.canvas.style.cursor = 'grabbing';
        if (this.tooltip) this.tooltip.style.display = 'none';
        if (e.cancelable && e.type.startsWith('touch')) e.preventDefault();
      } else {
        this.isPanning = true;
        this.panStartX = coords.canvasX - this.offsetX;
        this.panStartY = coords.canvasY - this.offsetY;
        this.canvas.style.cursor = 'grabbing';
      }
    };

    const handlePointerMove = (e) => {
      const coords = getPointerCoords(e);

      if (this.draggedNode) {
        if (e.cancelable && e.type.startsWith('touch')) e.preventDefault();
        const newX = coords.worldX + this.dragOffsetX;
        const newY = coords.worldY + this.dragOffsetY;
        this.draggedNode.x = newX;
        this.draggedNode.y = newY;
        this.draggedNode.targetX = newX;
        this.draggedNode.targetY = newY;
        this.draggedNode.isPinned = true;
        this.canvas.style.cursor = 'grabbing';
        if (this.tooltip) this.tooltip.style.display = 'none';
      } else if (this.isPanning) {
        if (e.cancelable && e.type.startsWith('touch')) e.preventDefault();
        this.offsetX = coords.canvasX - this.panStartX;
        this.offsetY = coords.canvasY - this.panStartY;
        this.canvas.style.cursor = 'grabbing';
      } else {
        const found = this.getNodeAt(coords.worldX, coords.worldY);
        this.hoveredNode = found;
        this.canvas.style.cursor = found ? 'grab' : 'default';
        this.updateTooltip(found, coords.canvasX, coords.canvasY);
      }
    };

    const handlePointerUp = () => {
      if (this.draggedNode) {
        this.draggedNode.isDragging = false;
        this.draggedNode.targetX = this.draggedNode.x;
        this.draggedNode.targetY = this.draggedNode.y;
        this.draggedNode.isPinned = true;
        this.draggedNode = null;
      }
      this.isPanning = false;
      this.canvas.style.cursor = this.hoveredNode ? 'grab' : 'default';
    };

    // 鼠标拖拽事件绑定
    this.canvas.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);

    // 滚轮缩放事件
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const coords = getPointerCoords(e);
      const factor = e.deltaY < 0 ? 1.12 : 0.89;
      const newZoom = Math.max(0.5, Math.min(2.5, +(this.zoom * factor).toFixed(3)));
      this.offsetX = coords.canvasX - (coords.canvasX - this.offsetX) * (newZoom / this.zoom);
      this.offsetY = coords.canvasY - (coords.canvasY - this.offsetY) * (newZoom / this.zoom);
      this.zoom = newZoom;
    }, { passive: false });

    // 触控支持 (大屏触控互动)
    this.canvas.addEventListener('touchstart', handlePointerDown, { passive: false });
    window.addEventListener('touchmove', handlePointerMove, { passive: false });
    window.addEventListener('touchend', handlePointerUp);
  }

  updateTooltip(node, x, y) {
    if (!this.tooltip) return;
    if (!node || this.draggedNode) {
      this.tooltip.style.display = 'none';
      return;
    }

    const typeColor = node.type === 'red' ? '#ff2a5f' : node.type === 'blue' ? '#00f0ff' : '#ffaa00';
    const typeLabel = node.type === 'red' ? '红方攻击节点' : node.type === 'blue' ? '蓝方防御阻断' : '突发事件源头';

    this.tooltip.innerHTML = `
      <div class="tooltip-title">
        <span>${node.title || node.name}</span>
        <span class="tooltip-tag" style="background:${typeColor}; color:#000;">${typeLabel}</span>
      </div>
      <div style="color:#a8c4ea; margin-bottom:4px;">${node.role || ''} · ${node.time || ''}</div>
      <div style="font-size:10.5px; color:#d8e5ff;">${node.desc || ''}</div>
      <div style="margin-top:6px; font-size:10px; color:#00f0ff; opacity:0.85;">💡 可直接按住圆圈拖拽调整拓扑位置</div>
    `;

    this.tooltip.style.left = `${Math.min(this.width - 240, x + 15)}px`;
    this.tooltip.style.top = `${Math.max(10, y - 45)}px`;
    this.tooltip.style.display = 'block';
  }

  filterStage(stageIdx) {
    this.selectedStage = stageIdx;
    const badge = document.getElementById('graphStageBadge');
    if (badge) {
      const map = ['阶段一·初发', '阶段二·发酵', '阶段三·造谣', '阶段四·辟谣', '阶段五·定调'];
      badge.textContent = stageIdx >= 0 ? `递增推进·${map[stageIdx] || `阶段${stageIdx + 1}`}` : '全网图谱';
    }
    const state = window.drillEngine ? window.drillEngine.getState() : null;
    if (state) {
      this.updateData(state);
    }
  }

  updateData(state) {
    // 核心需求：每次切换演练阶段，图谱是递增的，而不是只展示这个阶段的
    const currentStageIndex = (this.selectedStage !== undefined && this.selectedStage >= 0)
      ? this.selectedStage
      : (state.room?.stageIndex !== undefined ? state.room.stageIndex : 0);

    // 优先从剧本库提取从阶段一(STAGE-01)至当前阶段的所有攻防事件 (完全累积递增)
    const cartridges = (typeof window !== 'undefined' && typeof window.getDrillCartridges === 'function')
      ? window.getDrillCartridges()
      : (typeof window !== 'undefined' ? window.DEFAULT_DRILL_CARTRIDGES : null);
    const activeScript = (cartridges && cartridges[0]) ? cartridges[0] : null;

    let confrontations = [];
    if (activeScript && activeScript.stages && activeScript.stages.length > 0) {
      for (let sIdx = 0; sIdx <= currentStageIndex && sIdx < activeScript.stages.length; sIdx++) {
        const stg = activeScript.stages[sIdx];
        if (stg.confrontations && stg.confrontations.length > 0) {
          stg.confrontations.forEach(c => {
            confrontations.push(JSON.parse(JSON.stringify(c)));
          });
        }
      }
    }

    // 备用兜底逻辑：若未能从剧本直接提取，则从 state.timelineConfrontations 按阶段递增累积截取
    if (confrontations.length === 0) {
      const rawConfrontations = state.timelineConfrontations || [];
      const allowedStageIds = [];
      for (let s = 0; s <= currentStageIndex; s++) {
        allowedStageIds.push(`STAGE-0${s + 1}`);
      }
      confrontations = rawConfrontations.filter(c => {
        if (!c.stageId) return true;
        const sNum = parseInt(c.stageId.replace(/\D/g, ''), 10);
        return isNaN(sNum) || sNum <= (currentStageIndex + 1);
      });
      if (confrontations.length === 0) {
        confrontations = rawConfrontations;
      }
    }

    const rootName = state.room?.name || 'P区4.8住宅突发火灾爆燃';

    const cx = this.width / 2;
    const cy = this.height / 2;

    // 根据屏幕可视区域动态计算宽裕尺度，确保图谱气势恢宏、舒展大方
    const minDim = Math.min(this.width, this.height);
    const scale = Math.max(0.95, Math.min(1.4, minDim / 600));

    const newNodes = [];
    const newLinks = [];

    // 1. 核心源头根节点 (Incident Core)
    const rootRadius = Math.round(26 * scale);
    const rootNode = {
      id: 'NODE-ROOT',
      name: '事发核心源头',
      title: rootName,
      role: '突发事件源头',
      time: '04-08 18:57',
      desc: '23层高层住宅突发爆燃事故，浓烟滚滚居民逃生',
      type: 'root',
      radius: rootRadius,
      isRoot: true,
      x: cx,
      y: cy,
      targetX: cx,
      targetY: cy
    };
    newNodes.push(rootNode);

    // 2. 收集所有攻防对抗事件并预计算节点列表
    const redItems = [];
    const blueItems = [];

    confrontations.forEach((c, cIndex) => {
      const red = c.red || {};
      const redNodeId = `RED-${c.id || cIndex}`;
      redItems.push({
        id: redNodeId,
        cIndex,
        time: c.time || '19:00',
        role: red.role || red.author || '网络造谣爆料',
        title: red.role || '红方渗透施压',
        platformRole: `${red.platform || '全网平台'} · ${red.author || ''}`,
        desc: (red.content || '').slice(0, 48),
        impact: `${red.penalty || -15} 分`
      });

      if (c.blues && Array.isArray(c.blues)) {
        c.blues.forEach((b, bIndex) => {
          const blueNodeId = `BLUE-${c.id}-${bIndex}`;
          blueItems.push({
            id: blueNodeId,
            redSourceId: redNodeId,
            time: c.time || '19:15',
            role: b.role || '处置席位',
            title: b.title || '官方研判处置',
            platformRole: b.role || '市委网信办监测专班',
            desc: (b.statement || '').slice(0, 48),
            impact: `+${b.delta || 10} 分`
          });
        });
      }
    });

    const totalReds = redItems.length;
    const totalBlues = blueItems.length;

    // 3. 红方节点扇形布局 (左翼大展角分布：115° 至 245°，双层错落半径，绝不扎堆重叠)
    const redRadius = Math.round(18 * scale);
    const redStartAngle = Math.PI * 0.64;
    const redSpanAngle = Math.PI * 0.72;
    const redR1 = 230 * scale;
    const redR2 = 345 * scale;

    redItems.forEach((r, idx) => {
      const angle = totalReds === 1 
        ? Math.PI 
        : redStartAngle + (idx / Math.max(1, totalReds - 1)) * redSpanAngle;
      const dist = (idx % 2 === 0) ? redR1 : redR2;

      const rNode = {
        id: r.id,
        name: r.role,
        title: r.title,
        role: r.platformRole,
        time: r.time,
        desc: r.desc,
        impact: r.impact,
        type: 'red',
        radius: redRadius,
        x: cx + Math.cos(angle) * (dist * 0.75),
        y: cy + Math.sin(angle) * (dist * 0.75),
        targetX: cx + Math.cos(angle) * dist,
        targetY: cy + Math.sin(angle) * dist
      };
      newNodes.push(rNode);

      // 根节点 -> 红方攻击节点
      newLinks.push({
        source: rootNode.id,
        target: r.id,
        type: 'red'
      });
    });

    // 4. 蓝方节点扇形布局 (右翼大展角分布：-65° 至 +65°，三层深远错落半径，舒展分布)
    const blueRadius = Math.round(18 * scale);
    const blueStartAngle = -Math.PI * 0.36;
    const blueSpanAngle = Math.PI * 0.72;
    const blueR1 = 225 * scale;
    const blueR2 = 325 * scale;
    const blueR3 = 425 * scale;

    blueItems.forEach((b, idx) => {
      const angle = totalBlues === 1
        ? 0
        : blueStartAngle + (idx / Math.max(1, totalBlues - 1)) * blueSpanAngle;
      const dist = (idx % 3 === 0) ? blueR1 : ((idx % 3 === 1) ? blueR2 : blueR3);

      const bNode = {
        id: b.id,
        name: b.role,
        title: b.title,
        role: b.platformRole,
        time: b.time,
        desc: b.desc,
        impact: b.impact,
        type: 'blue',
        radius: blueRadius,
        x: cx + Math.cos(angle) * (dist * 0.75),
        y: cy + Math.sin(angle) * (dist * 0.75),
        targetX: cx + Math.cos(angle) * dist,
        targetY: cy + Math.sin(angle) * dist
      };
      newNodes.push(bNode);

      // 红方 -> 蓝方防御阻断
      newLinks.push({
        source: b.redSourceId,
        target: b.id,
        type: 'blue'
      });

      // 蓝方 -> 根节点护盾回溯
      newLinks.push({
        source: b.id,
        target: rootNode.id,
        type: 'shield'
      });
    });

    // 5. 强力排斥防重叠松弛迭代算法 (确保所有圆圈与标签保持充裕间距，绝不重叠)
    const minNodeGap = Math.round(52 * scale);
    for (let iter = 0; iter < 16; iter++) {
      for (let i = 0; i < newNodes.length; i++) {
        for (let j = i + 1; j < newNodes.length; j++) {
          const ni = newNodes[i];
          const nj = newNodes[j];
          let dx = nj.targetX - ni.targetX;
          let dy = nj.targetY - ni.targetY;
          let dist = Math.hypot(dx, dy) || 0.001;
          const requiredDist = ni.radius + nj.radius + minNodeGap;

          if (dist < requiredDist) {
            const overlap = (requiredDist - dist) * 0.5;
            const nx = (dx / dist) * overlap;
            const ny = (dy / dist) * overlap;

            if (!ni.isRoot && !ni.isPinned) {
              ni.targetX -= nx;
              ni.targetY -= ny;
            }
            if (!nj.isRoot && !nj.isPinned) {
              nj.targetX += nx;
              nj.targetY += ny;
            }
          }
        }
      }
    }

    // 6. 平滑继承现有位置或用户已拖拽锚定的自定义位置
    newNodes.forEach(nn => {
      const existing = this.nodes.find(n => n.id === nn.id);
      if (existing) {
        nn.x = existing.x;
        nn.y = existing.y;
        if (existing.isPinned) {
          nn.targetX = existing.targetX;
          nn.targetY = existing.targetY;
          nn.isPinned = true;
        }
      }
    });

    this.nodes = newNodes;
    this.links = newLinks;

    // 更新角标状态统计
    const nodeCountEl = document.getElementById('graphNodeCount');
    const redLinksEl = document.getElementById('graphRedLinksCount');
    const blueLinksEl = document.getElementById('graphBlueLinksCount');
    const feedTextEl = document.getElementById('graphEventText');

    if (nodeCountEl) nodeCountEl.textContent = this.nodes.length;
    if (redLinksEl) redLinksEl.textContent = totalReds;
    if (blueLinksEl) blueLinksEl.textContent = totalBlues;

    if (feedTextEl && confrontations.length > 0) {
      const latest = confrontations[confrontations.length - 1];
      const red = latest.red || {};
      feedTextEl.textContent = `实时拓扑演化：[${latest.time || '最新'}] ${red.role || '造谣攻击'} 节点接入网络，蓝方专班已布设对冲阻断！`;
    }

    this.reinitParticles();
  }

  reinitParticles() {
    this.particles = [];
    this.links.forEach((link, idx) => {
      for (let i = 0; i < 2; i++) {
        this.particles.push({
          linkIdx: idx,
          t: Math.random(),
          speed: 0.005 + Math.random() * 0.004,
          color: link.type === 'red' ? '#ff2a5f' : link.type === 'blue' ? '#00f0ff' : '#00e676'
        });
      }
    });
  }

  animate() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    ctx.save();
    ctx.translate(this.offsetX, this.offsetY);
    ctx.scale(this.zoom, this.zoom);

    // 缓动更新非拖拽中节点位置
    this.nodes.forEach(n => {
      if (!n.isDragging) {
        n.x += (n.targetX - n.x) * 0.1;
        n.y += (n.targetY - n.y) * 0.1;
      }
    });

    // 1. 绘制拓扑连线
    this.links.forEach(link => {
      const sNode = this.nodes.find(n => n.id === link.source);
      const tNode = this.nodes.find(n => n.id === link.target);
      if (!sNode || !tNode) return;

      ctx.beginPath();
      ctx.moveTo(sNode.x, sNode.y);
      ctx.lineTo(tNode.x, tNode.y);

      if (link.type === 'red') {
        ctx.strokeStyle = 'rgba(255, 42, 95, 0.4)';
        ctx.lineWidth = 2.0;
        ctx.setLineDash([5, 5]);
      } else if (link.type === 'blue') {
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.5)';
        ctx.lineWidth = 2.4;
        ctx.setLineDash([]);
      } else {
        ctx.strokeStyle = 'rgba(0, 230, 118, 0.3)';
        ctx.lineWidth = 1.4;
        ctx.setLineDash([3, 4]);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // 2. 绘制流动能量光子
    this.particles.forEach(p => {
      const link = this.links[p.linkIdx];
      if (!link) return;
      const sNode = this.nodes.find(n => n.id === link.source);
      const tNode = this.nodes.find(n => n.id === link.target);
      if (!sNode || !tNode) return;

      p.t += p.speed;
      if (p.t > 1) p.t = 0;

      const px = sNode.x + (tNode.x - sNode.x) * p.t;
      const py = sNode.y + (tNode.y - sNode.y) * p.t;

      ctx.beginPath();
      ctx.arc(px, py, 3, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // 3. 绘制节点圆圈与文字
    this.nodes.forEach(node => {
      const isHovered = this.hoveredNode && this.hoveredNode.id === node.id;
      const isBeingDragged = this.draggedNode && this.draggedNode.id === node.id;

      // 拖拽激活靶向准星动画环
      if (isBeingDragged) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius + 12, 0, Math.PI * 2);
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius + 18, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // 根节点外层脉冲波
      if (node.isRoot) {
        const pulse = node.radius + 4 + Math.sin(Date.now() * 0.004) * 6;
        ctx.beginPath();
        ctx.arc(node.x, node.y, pulse + 6, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 170, 0, 0.16)';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(node.x, node.y, pulse, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 170, 0, 0.45)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // 悬停外光环
      if (isHovered && !isBeingDragged) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius + 7, 0, Math.PI * 2);
        ctx.strokeStyle = node.type === 'red' ? 'rgba(255, 42, 95, 0.6)' : node.type === 'blue' ? 'rgba(0, 240, 255, 0.6)' : 'rgba(255, 170, 0, 0.6)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // 核心圆形
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius + (isHovered ? 3 : 0), 0, Math.PI * 2);

      let grad = ctx.createRadialGradient(node.x - 3, node.y - 3, 2, node.x, node.y, node.radius);
      if (node.type === 'red') {
        grad.addColorStop(0, '#ff7a98');
        grad.addColorStop(1, '#ff1a53');
      } else if (node.type === 'blue') {
        grad.addColorStop(0, '#a3f7ff');
        grad.addColorStop(1, '#0084ff');
      } else {
        grad.addColorStop(0, '#fff0a6');
        grad.addColorStop(1, '#ff9900');
      }

      ctx.fillStyle = grad;
      ctx.shadowColor = node.type === 'red' ? '#ff2a5f' : node.type === 'blue' ? '#00f0ff' : '#ffaa00';
      ctx.shadowBlur = (isHovered || isBeingDragged) ? 22 : 12;
      ctx.fill();
      ctx.shadowBlur = 0;

      // 圆形边框
      ctx.lineWidth = (isHovered || isBeingDragged) ? 2.8 : 1.8;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      // 圆内微标
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const icon = node.type === 'red' ? '🔥' : node.type === 'blue' ? '🛡️' : '⚠️';
      ctx.fillText(icon, node.x, node.y - 1);

      // 下方标签文字背景药丸底色（防止与连线互相穿透重叠，保持清晰易读）
      const label = node.name.length > 8 ? node.name.slice(0, 7) + '..' : node.name;
      ctx.font = 'bold 11px sans-serif';
      const textWidth = ctx.measureText(label).width;
      const textY = node.y + node.radius + 14;

      ctx.save();
      ctx.fillStyle = isHovered ? 'rgba(8, 20, 48, 0.95)' : 'rgba(5, 11, 28, 0.85)';
      ctx.strokeStyle = isHovered 
        ? (node.type === 'red' ? '#ff2a5f' : node.type === 'blue' ? '#00f0ff' : '#ffaa00')
        : 'rgba(0, 240, 255, 0.25)';
      ctx.lineWidth = 1;

      // 绘制圆角胶囊
      const pillW = textWidth + 14;
      const pillH = 18;
      const pillX = node.x - pillW / 2;
      const pillY = textY - pillH / 2;
      const r = 4;

      ctx.beginPath();
      ctx.moveTo(pillX + r, pillY);
      ctx.lineTo(pillX + pillW - r, pillY);
      ctx.quadraticCurveTo(pillX + pillW, pillY, pillX + pillW, pillY + r);
      ctx.lineTo(pillX + pillW, pillY + pillH - r);
      ctx.quadraticCurveTo(pillX + pillW, pillY + pillH, pillX + pillW - r, pillY + pillH);
      ctx.lineTo(pillX + r, pillY + pillH);
      ctx.quadraticCurveTo(pillX, pillY + pillH, pillX, pillY + pillH - r);
      ctx.lineTo(pillX, pillY + r);
      ctx.quadraticCurveTo(pillX, pillY, pillX + r, pillY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = isHovered ? '#ffffff' : '#d2e5ff';
      ctx.fillText(label, node.x, textY + 0.5);
      ctx.restore();
    });

    ctx.restore();

    requestAnimationFrame(this.animate);
  }
}

/* ==========================================================================
   9. 倒计时推进逻辑 (支持演练暂停时冻结)
   ========================================================================== */
function updateTimerTick() {
  const cd = document.getElementById('countdownTimer');
  if (!cd) return;

  const state = window.drillEngine ? window.drillEngine.getState() : null;
  if (!state) return;

  // 如果处于暂停状态或结束状态，倒计时停止
  if (state.drillStatus === 'PAUSED' || state.drillStatus === 'ENDED') {
    return;
  }

  if (state.room && state.room.realRemainingSeconds > 0) {
    state.room.realRemainingSeconds -= 1;
    const m = Math.floor(state.room.realRemainingSeconds / 60).toString().padStart(2, '0');
    const s = (state.room.realRemainingSeconds % 60).toString().padStart(2, '0');
    cd.textContent = `${m}:${s}`;
  }
}

/* ==========================================================================
   10. 实战演练多阶段全屏视图总控 (Stage Layers Controller)
   ========================================================================== */

function hideAllScreenStageLayers() {
  const layerIds = ['screenVideoLayer', 'screenRosterLayer', 'screenSettlementLayer', 'screenSummaryLayer'];
  layerIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  const battleLayer = document.getElementById('screenBattleLayer');
  if (battleLayer) battleLayer.style.display = 'grid';
}

function renderScreenPhase(phase, meta = {}) {
  const state = window.drillEngine ? window.drillEngine.getState() : null;
  const currentPhase = phase || (state ? state.screenPhase : 'PHASE_LOBBY');

  const videoLayer = document.getElementById('screenVideoLayer');
  const rosterLayer = document.getElementById('screenRosterLayer');
  const settleLayer = document.getElementById('screenSettlementLayer');
  const summaryLayer = document.getElementById('screenSummaryLayer');
  const battleLayer = document.getElementById('screenBattleLayer');

  // 先隐藏所有阶段层
  hideAllScreenStageLayers();

  if (currentPhase === 'PHASE_STORY_VIDEO' || currentPhase === 'PHASE_RULES_VIDEO') {
    if (battleLayer) battleLayer.style.display = 'none';
    if (videoLayer) {
      videoLayer.style.display = 'flex';
      const badge = document.getElementById('videoStageBadge');
      const title = document.getElementById('videoMainTitle');
      const videoEl = document.getElementById('stageMainVideo');

      if (currentPhase === 'PHASE_STORY_VIDEO') {
        if (badge) badge.textContent = '🎬 故事背景还原 (第一视角)';
        if (title) title.textContent = meta.title || '突发火灾现场全景还原与首发爆料';
      } else {
        if (badge) badge.textContent = '📖 演练玩法与防误导规则';
        if (title) title.textContent = meta.title || '红蓝博弈实战演练规则与注意事项宣贯';
      }

      if (videoEl) {
        if (meta.url) videoEl.src = meta.url;
        videoEl.currentTime = 0;
        videoEl.play().catch(() => {});
      }
    }
  } else if (currentPhase === 'PHASE_ROSTER_WALL') {
    if (battleLayer) battleLayer.style.display = 'none';
    if (rosterLayer) {
      rosterLayer.style.display = 'flex';
      renderRosterWall();
    }
  } else if (currentPhase === 'PHASE_STAGE_SETTLEMENT') {
    if (battleLayer) battleLayer.style.display = 'none';
    if (settleLayer) {
      settleLayer.style.display = 'flex';
      renderSettlementWall();
    }
  } else if (currentPhase === 'PHASE_FINAL_SUMMARY') {
    if (battleLayer) battleLayer.style.display = 'none';
    if (summaryLayer) {
      summaryLayer.style.display = 'flex';
      renderSummaryWall();
    }
  } else {
    // 默认或 PHASE_BATTLE：主作战大屏
    if (battleLayer) battleLayer.style.display = 'grid';
  }
}

// 跳过当前视频
function skipScreenVideo() {
  const videoEl = document.getElementById('stageMainVideo');
  if (videoEl) videoEl.pause();
  hideAllScreenStageLayers();
}

// 渲染角色认领墙 (红蓝分列展示，支持单人排座与大圆桌组)
function renderRosterWall() {
  const state = window.drillEngine ? window.drillEngine.getState() : null;
  if (!state || !state.seats) return;

  const blueGrid = document.getElementById('rosterBlueGrid');
  const redGrid = document.getElementById('rosterRedGrid');
  if (!blueGrid || !redGrid) return;

  let totalCount = 0;
  let claimedCount = 0;

  const blueSeats = [];
  const redSeats = [];

  Object.keys(state.seats).forEach(key => {
    const seat = state.seats[key];
    totalCount++;
    if (seat.assigned) claimedCount++;
    if (seat.camp === 'red') {
      redSeats.push(seat);
    } else {
      blueSeats.push(seat);
    }
  });

  const rosterClaimedCount = document.getElementById('rosterClaimedCount');
  const rosterTotalCount = document.getElementById('rosterTotalCount');
  if (rosterClaimedCount) rosterClaimedCount.textContent = claimedCount;
  if (rosterTotalCount) rosterTotalCount.textContent = totalCount;

  // 渲染蓝方席位
  blueGrid.innerHTML = blueSeats.map(seat => `
    <div class="roster-seat-card ${seat.assigned ? 'claimed' : ''}">
      <div class="seat-avatar-box">${seat.avatar || '🛡️'}</div>
      <div class="seat-info-col">
        <div class="seat-role-title">${seat.role || seat.name}</div>
        <div class="seat-user-tag">${seat.assigned ? `✅ 已由 ${seat.user} 认领` : '⏳ 待认领 (扫码选择)'}</div>
      </div>
    </div>
  `).join('');

  // 渲染红方席位
  redGrid.innerHTML = redSeats.map(seat => `
    <div class="roster-seat-card red-seat ${seat.assigned ? 'claimed' : ''}">
      <div class="seat-avatar-box">${seat.avatar || '🔥'}</div>
      <div class="seat-info-col">
        <div class="seat-role-title">${seat.name}</div>
        <div class="seat-user-tag">${seat.assigned ? `🔥 ${seat.user} 正在带节奏` : '💬 开放群演/吃瓜网民加入'}</div>
      </div>
    </div>
  `).join('');
}

// 渲染阶段结算战报
function renderSettlementWall() {
  const state = window.drillEngine ? window.drillEngine.getState() : null;
  if (!state) return;

  const numEl = document.getElementById('settleCredibilityNum');
  const redEl = document.getElementById('settleRedPenalty');
  const blueEl = document.getElementById('settleBlueRestore');
  const listEl = document.getElementById('settleMeasuresList');
  const tagEl = document.getElementById('settlementStageTag');

  if (numEl) numEl.textContent = state.battle.credibilityScore;
  if (redEl) redEl.textContent = state.battle.redPenalty + ' 分';
  if (blueEl) blueEl.textContent = '+' + state.battle.blueRestore + ' 分';
  if (tagEl) tagEl.textContent = state.room.stageName || '当前阶段';

  if (listEl && state.timelineConfrontations) {
    const stageCfs = state.timelineConfrontations.filter(c => c.stageId === state.room.stageId);
    listEl.innerHTML = stageCfs.map(cf => {
      if (cf.red) {
        return `
          <div class="diff-item red-diff">
            <strong>🔥 [红方出招] ${cf.red.role || '网民'}：</strong> ${cf.red.content.slice(0, 48)}... (${cf.red.penalty}分)
          </div>
        `;
      } else if (cf.blues && cf.blues.length > 0) {
        const b = cf.blues[0];
        const isGood = (b.delta || 0) >= 0;
        return `
          <div class="diff-item ${isGood ? 'blue-diff' : 'red-diff'}">
            <strong>${isGood ? '✅' : '❌'} [蓝方响应] ${b.role || '处置部门'}：</strong> ${b.title} (${b.delta >= 0 ? '+' : ''}${b.delta}分)
          </div>
        `;
      }
      return '';
    }).join('');
  }
}

// 渲染终局复盘报告
function renderSummaryWall() {
  const state = window.drillEngine ? window.drillEngine.getState() : null;
  if (!state) return;
  // 保持现有终局结构并刷新最新数据
}

/* ==========================================================================
   11. Web Audio 原生声光报警引擎 (免文件依赖，100% 极速发声)
   ========================================================================== */
let audioCtx = null;

function playEmergencyAlarmSound() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    if (!audioCtx) audioCtx = new AudioContextClass();
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sawtooth';
    // 警报高低双音急促交替 (880Hz / 620Hz)
    for (let i = 0; i < 6; i++) {
      const t = now + i * 0.4;
      osc.frequency.setValueAtTime(880, t);
      osc.frequency.setValueAtTime(620, t + 0.2);
    }

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 2.4);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(now);
    osc.stop(now + 2.5);
  } catch (err) {
    console.warn('Audio alarm playback error:', err);
  }
}

function triggerScreenAlarmUI(reason = '检测到严重失当处置或公信力跌破红线！') {
  // 1. 播放报警声音
  playEmergencyAlarmSound();

  // 2. 屏幕四周呼吸脉冲光晕
  const pulseEl = document.getElementById('screenAlarmPulse');
  if (pulseEl) pulseEl.style.display = 'block';

  // 3. 顶部警报 Banner
  const bannerEl = document.getElementById('screenAlarmBanner');
  const reasonEl = document.getElementById('alarmReasonText');
  if (reasonEl) reasonEl.textContent = reason;
  if (bannerEl) bannerEl.style.display = 'block';

  // 5秒后自动弱化脉冲
  setTimeout(() => {
    if (pulseEl) pulseEl.style.display = 'none';
  }, 5000);
}

function dismissScreenAlarm() {
  const pulseEl = document.getElementById('screenAlarmPulse');
  const bannerEl = document.getElementById('screenAlarmBanner');
  if (pulseEl) pulseEl.style.display = 'none';
  if (bannerEl) bannerEl.style.display = 'none';
}

/* ==========================================================================
   12. 网民互动 (点赞/转发/评论) 实时动效
   ========================================================================== */
function updateCrowdStatsUI(stats, latestComment = null) {
  if (!stats) return;
  const lEl = document.getElementById('crowdLikeCount');
  const sEl = document.getElementById('crowdShareCount');
  const cEl = document.getElementById('crowdCommentCount');

  if (lEl) lEl.textContent = (stats.likeCount || 0).toLocaleString();
  if (sEl) sEl.textContent = (stats.shareCount || 0).toLocaleString();
  if (cEl) cEl.textContent = (stats.commentCount || 0).toLocaleString();

  if (latestComment) {
    const marquee = document.getElementById('crowdCommentsMarquee');
    if (marquee) {
      const item = document.createElement('div');
      item.className = 'comment-item';
      item.innerHTML = `<strong>${latestComment.author || '网友'}：</strong> ${latestComment.text || latestComment}`;
      marquee.insertBefore(item, marquee.firstChild);
      if (marquee.children.length > 8) {
        marquee.removeChild(marquee.lastChild);
      }
    }
  }
}

/* ==========================================================================
   13. 全局同步事件监听与启动绑定
   ========================================================================== */
if (window.drillEngine) {
  window.drillEngine.subscribe((state, action, payload) => {
    // 监听阶段变更
    if (action === 'SCREEN_PHASE_CHANGED') {
      renderScreenPhase(payload.phase, payload.video);
    }

    // 监听警报事件
    if (action === 'TRIGGER_ALARM') {
      triggerScreenAlarmUI(payload.reason);
    }

    // 监听席位认领变更
    if (action === 'ROLE_CLAIMED' || action === 'ROLE_UNCLAIMED' || action === 'ALL_ROLES_CLAIMED') {
      renderRosterWall();
    }

    // 监听网民互动
    if (action === 'CROWD_INTERACTION') {
      updateCrowdStatsUI(payload.stats, payload.type === 'COMMENT' ? { author: payload.author, text: payload.content } : null);
    }

    // 监听阶段结算
    if (action === 'STAGE_ADVANCED') {
      if (state.screenPhase === 'PHASE_STAGE_SETTLEMENT') {
        renderSettlementWall();
      }
    }
  });

  // 页面就绪后初次渲染阶段
  window.addEventListener('DOMContentLoaded', () => {
    const s = window.drillEngine.getState();
    if (s && s.screenPhase) {
      renderScreenPhase(s.screenPhase, s.screenVideo);
    }
  });
}

