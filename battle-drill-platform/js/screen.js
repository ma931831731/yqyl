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

let propagationGraphInstance = null;
let currentActiveScriptId = null;

document.addEventListener('DOMContentLoaded', () => {
  // 1. 初始化中间动态扩展图谱
  initPropagationGraph();

  // 2. 初始化底部公信力仪表盘
  initGaugeCanvas();

  // 3. 订阅跨端状态机
  if (window.drillEngine) {
    window.drillEngine.subscribe((state, action) => {
      renderAll(state, action);
    });
    // 首次渲染
    renderAll(window.drillEngine.getState(), 'INIT');
  } else {
    console.warn('drillEngine not found, rendering fallback demo state.');
  }

  // 4. 时钟倒计时定时器
  setInterval(() => {
    updateTimerTick();
  }, 1000);

  // 5. 窗口缩放适配
  window.addEventListener('resize', () => {
    if (propagationGraphInstance) {
      propagationGraphInstance.resize();
    }
    const state = window.drillEngine ? window.drillEngine.getState() : null;
    if (state) {
      drawGaugeSpeedometer(state.battle ? state.battle.credibilityScore : 72);
    }
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

  // 6. 中间：扩展图谱动态演化
  if (propagationGraphInstance) {
    propagationGraphInstance.updateData(state);
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

  // 2. 政府公信力速度计仪表盘
  const score = battle.credibilityScore !== undefined ? battle.credibilityScore : 72;
  const scoreText = document.getElementById('credibilityScoreText');
  const levelBadge = document.getElementById('credibilityLevelBadge');
  const trendText = document.getElementById('credibilityTrendText');

  if (scoreText) scoreText.textContent = score;

  if (levelBadge) {
    levelBadge.className = 'gauge-level-badge ' + (score >= 80 ? 'level-good' : score >= 60 ? 'level-warn' : 'level-danger');
    levelBadge.textContent = score >= 80 ? '良好可控' : score >= 60 ? '警戒承压' : '危机失控';
  }

  if (trendText) {
    if (score >= 80) {
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

  drawGaugeSpeedometer(score);

  // 3. 全五阶段推进进度轴
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
   7. 绘制公信力半圆速度计仪表盘 (Canvas)
   ========================================================================== */
function initGaugeCanvas() {
  const canvas = document.getElementById('gaugeCanvas');
  if (!canvas) return;
  canvas.width = 140;
  canvas.height = 95;
  drawGaugeSpeedometer(72);
}

function drawGaugeSpeedometer(score) {
  const canvas = document.getElementById('gaugeCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const cx = w / 2;
  const cy = 78;
  const r = 58;

  ctx.clearRect(0, 0, w, h);

  // 背景外半弧
  ctx.beginPath();
  ctx.arc(cx, cy, r, Math.PI, 0, false);
  ctx.lineWidth = 9;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineCap = 'round';
  ctx.stroke();

  // 刻度线
  const totalTicks = 10;
  for (let i = 0; i <= totalTicks; i++) {
    const angle = Math.PI + (Math.PI / totalTicks) * i;
    const x1 = cx + (r - 10) * Math.cos(angle);
    const y1 = cy + (r - 10) * Math.sin(angle);
    const x2 = cx + (r - 15) * Math.cos(angle);
    const y2 = cy + (r - 15) * Math.sin(angle);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.stroke();
  }

  // 进度半圆弧 (红 -> 橙 -> 蓝 -> 绿渐变)
  const percent = Math.min(100, Math.max(0, score)) / 100;
  if (percent > 0) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, Math.PI, Math.PI + Math.PI * percent, false);

    const grad = ctx.createLinearGradient(0, cy, w, cy);
    grad.addColorStop(0, '#ff2a5f');
    grad.addColorStop(0.5, '#ffaa00');
    grad.addColorStop(0.8, '#00f0ff');
    grad.addColorStop(1, '#00e676');

    ctx.strokeStyle = grad;
    ctx.lineWidth = 9;
    ctx.lineCap = 'round';
    ctx.stroke();
  }
}

/* ==========================================================================
   8. 中间：舆情扩展图谱 (根据实时发展动态演化拓扑引擎)
   ========================================================================== */
function initPropagationGraph() {
  const container = document.getElementById('graphContainer');
  const canvas = document.getElementById('propagationCanvas');
  const tooltip = document.getElementById('graphTooltip');
  if (!container || !canvas) return;

  propagationGraphInstance = new DynamicPropagationGraph(container, canvas, tooltip);
}

function resetGraphView() {
  if (propagationGraphInstance) {
    propagationGraphInstance.resetCenter();
  }
}

class DynamicPropagationGraph {
  constructor(container, canvas, tooltip) {
    this.container = container;
    this.canvas = canvas;
    this.tooltip = tooltip;
    this.ctx = canvas.getContext('2d');

    this.width = container.clientWidth;
    this.height = container.clientHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    this.nodes = [];
    this.links = [];
    this.particles = [];

    this.offsetX = 0;
    this.offsetY = 0;
    this.isDragging = false;
    this.startX = 0;
    this.startY = 0;
    this.hoveredNode = null;

    this.bindEvents();
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  resize() {
    this.width = this.container.clientWidth;
    this.height = this.container.clientHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  resetCenter() {
    this.offsetX = 0;
    this.offsetY = 0;
    // 重新让根节点居中
    if (this.nodes.length > 0 && this.nodes[0].isRoot) {
      this.nodes[0].targetX = this.width / 2;
      this.nodes[0].targetY = this.height / 2;
    }
  }

  bindEvents() {
    this.canvas.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.startX = e.clientX - this.offsetX;
      this.startY = e.clientY - this.offsetY;
    });

    window.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        this.offsetX = e.clientX - this.startX;
        this.offsetY = e.clientY - this.startY;
      }

      // 计算鼠标悬浮节点
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left - this.offsetX;
      const mouseY = e.clientY - rect.top - this.offsetY;

      let found = null;
      for (const node of this.nodes) {
        const dx = node.x - mouseX;
        const dy = node.y - mouseY;
        if (Math.sqrt(dx * dx + dy * dy) <= node.radius + 6) {
          found = node;
          break;
        }
      }

      this.hoveredNode = found;
      this.updateTooltip(found, e.clientX - rect.left, e.clientY - rect.top);
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });
  }

  updateTooltip(node, x, y) {
    if (!this.tooltip) return;
    if (!node) {
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
      ${node.impact ? `<div style="margin-top:4px; font-weight:bold; color:${node.type==='red'?'#ff4d6d':'#00e676'};">公信力影响: ${node.impact}</div>` : ''}
    `;

    this.tooltip.style.left = `${Math.min(this.width - 240, x + 12)}px`;
    this.tooltip.style.top = `${Math.max(10, y - 40)}px`;
    this.tooltip.style.display = 'block';
  }

  updateData(state) {
    const confrontations = state.timelineConfrontations || [];
    const rootName = state.room?.name || 'P区4.8住宅突发火灾爆燃';

    const cx = this.width / 2;
    const cy = this.height / 2;

    const newNodes = [];
    const newLinks = [];

    // 1. 核心源头根节点 (Incident Core)
    const rootNode = {
      id: 'NODE-ROOT',
      name: '事发核心源头',
      title: rootName,
      role: '突发事件源头',
      time: '04-08 18:57',
      desc: '23层高层住宅突发爆燃事故，浓烟滚滚居民逃生',
      type: 'root',
      radius: 18,
      isRoot: true,
      x: cx,
      y: cy,
      targetX: cx,
      targetY: cy
    };
    newNodes.push(rootNode);

    // 2. 遍历对抗事件，动态生成红方攻击节点与蓝方防守节点
    let redCount = 0;
    let blueCount = 0;

    confrontations.forEach((c, cIndex) => {
      const red = c.red || {};
      const redNodeId = `RED-${c.id || cIndex}`;

      // 分布在左上到左下扇区
      const angleRed = Math.PI * 0.75 + (cIndex / Math.max(1, confrontations.length)) * Math.PI * 0.7;
      const distRed = 110 + (cIndex % 3) * 35;

      const rNode = {
        id: redNodeId,
        name: red.role || red.author || '网络造谣爆料',
        title: red.role || '红方渗透施压',
        role: `${red.platform || '全网平台'} · ${red.author || ''}`,
        time: c.time || '19:00',
        desc: (red.content || '').slice(0, 48),
        impact: `${red.penalty || -15} 分`,
        type: 'red',
        radius: 12,
        x: cx + Math.cos(angleRed) * (distRed * 0.6),
        y: cy + Math.sin(angleRed) * (distRed * 0.6),
        targetX: cx + Math.cos(angleRed) * distRed,
        targetY: cy + Math.sin(angleRed) * distRed
      };
      newNodes.push(rNode);
      redCount++;

      // 连线：根节点 -> 红方攻击节点
      newLinks.push({
        source: rootNode.id,
        target: redNodeId,
        type: 'red'
      });

      // 蓝方防守措施节点
      if (c.blues && Array.isArray(c.blues)) {
        c.blues.forEach((b, bIndex) => {
          const blueNodeId = `BLUE-${c.id}-${bIndex}`;
          // 分布在右上到右下扇区
          const angleBlue = -Math.PI * 0.35 + (blueCount / 6) * Math.PI * 0.75;
          const distBlue = 120 + (blueCount % 3) * 30;

          const bNode = {
            id: blueNodeId,
            name: b.role || '处置席位',
            title: b.title || '官方研判处置',
            role: b.role || '市委网信办监测专班',
            time: c.time || '19:15',
            desc: (b.statement || '').slice(0, 48),
            impact: `+${b.delta || 10} 分`,
            type: 'blue',
            radius: 13,
            x: cx + Math.cos(angleBlue) * (distBlue * 0.6),
            y: cy + Math.sin(angleBlue) * (distBlue * 0.6),
            targetX: cx + Math.cos(angleBlue) * distBlue,
            targetY: cy + Math.sin(angleBlue) * distBlue
          };
          newNodes.push(bNode);
          blueCount++;

          // 连线：红方攻击节点 -> 蓝方防御阻断节点 (攻防钳制)
          newLinks.push({
            source: redNodeId,
            target: blueNodeId,
            type: 'blue'
          });

          // 连线：蓝方节点 -> 根节点 (护盾回溯)
          newLinks.push({
            source: blueNodeId,
            target: rootNode.id,
            type: 'shield'
          });
        });
      }
    });

    // 保留现有节点位置以平滑过渡
    newNodes.forEach(nn => {
      const existing = this.nodes.find(n => n.id === nn.id);
      if (existing) {
        nn.x = existing.x;
        nn.y = existing.y;
      }
    });

    this.nodes = newNodes;
    this.links = newLinks;

    // 更新角标数据
    const nodeCountEl = document.getElementById('graphNodeCount');
    const redLinksEl = document.getElementById('graphRedLinksCount');
    const blueLinksEl = document.getElementById('graphBlueLinksCount');
    const feedTextEl = document.getElementById('graphEventText');

    if (nodeCountEl) nodeCountEl.textContent = this.nodes.length;
    if (redLinksEl) redLinksEl.textContent = redCount;
    if (blueLinksEl) blueLinksEl.textContent = blueCount;

    if (feedTextEl && confrontations.length > 0) {
      const latest = confrontations[confrontations.length - 1];
      const red = latest.red || {};
      feedTextEl.textContent = `实时拓扑演化：[${latest.time || '最新'}] ${red.role || '造谣攻击'} 节点接入网络，蓝方专班已布设对冲阻断！`;
    }

    // 重新生成运动粒子
    this.reinitParticles();
  }

  reinitParticles() {
    this.particles = [];
    this.links.forEach((link, idx) => {
      for (let i = 0; i < 2; i++) {
        this.particles.push({
          linkIdx: idx,
          t: Math.random(),
          speed: 0.006 + Math.random() * 0.005,
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

    // 缓动节点到 targetX, targetY
    this.nodes.forEach(n => {
      n.x += (n.targetX - n.x) * 0.08;
      n.y += (n.targetY - n.y) * 0.08;
    });

    // 1. 绘制连线
    this.links.forEach(link => {
      const sNode = this.nodes.find(n => n.id === link.source);
      const tNode = this.nodes.find(n => n.id === link.target);
      if (!sNode || !tNode) return;

      ctx.beginPath();
      ctx.moveTo(sNode.x, sNode.y);
      ctx.lineTo(tNode.x, tNode.y);

      if (link.type === 'red') {
        ctx.strokeStyle = 'rgba(255, 42, 95, 0.35)';
        ctx.lineWidth = 1.8;
        ctx.setLineDash([4, 4]);
      } else if (link.type === 'blue') {
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.45)';
        ctx.lineWidth = 2.2;
        ctx.setLineDash([]);
      } else {
        ctx.strokeStyle = 'rgba(0, 230, 118, 0.25)';
        ctx.lineWidth = 1.2;
        ctx.setLineDash([2, 4]);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // 2. 绘制流动光子粒子
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
      ctx.arc(px, py, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // 3. 绘制节点
    this.nodes.forEach(node => {
      const isHovered = this.hoveredNode && this.hoveredNode.id === node.id;

      // 外发光环
      if (node.isRoot) {
        // 根节点脉冲
        const pulse = 18 + Math.sin(Date.now() * 0.004) * 4;
        ctx.beginPath();
        ctx.arc(node.x, node.y, pulse + 6, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 170, 0, 0.15)';
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius + (isHovered ? 4 : 0), 0, Math.PI * 2);

      let grad = ctx.createRadialGradient(node.x, node.y, 1, node.x, node.y, node.radius);
      if (node.type === 'red') {
        grad.addColorStop(0, '#ff6b8b');
        grad.addColorStop(1, '#ff2a5f');
      } else if (node.type === 'blue') {
        grad.addColorStop(0, '#80f4ff');
        grad.addColorStop(1, '#0088ff');
      } else {
        grad.addColorStop(0, '#ffe082');
        grad.addColorStop(1, '#ffaa00');
      }

      ctx.fillStyle = grad;
      ctx.shadowColor = node.type === 'red' ? '#ff2a5f' : node.type === 'blue' ? '#00f0ff' : '#ffaa00';
      ctx.shadowBlur = isHovered ? 16 : 8;
      ctx.fill();
      ctx.shadowBlur = 0;

      // 边框
      ctx.lineWidth = isHovered ? 2.5 : 1.5;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      // 节点文本
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10.5px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // 节点内文字或图标
      const icon = node.type === 'red' ? '🔥' : node.type === 'blue' ? '🛡️' : '⚠️';
      ctx.fillText(icon, node.x, node.y - 1);

      // 节点下方标题
      ctx.font = '10px sans-serif';
      ctx.fillStyle = isHovered ? '#ffffff' : '#c8dbf7';
      const label = node.name.length > 7 ? node.name.slice(0, 6) + '..' : node.name;
      ctx.fillText(label, node.x, node.y + node.radius + 11);
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
