/**
 * 舆情百战演练平台 · PC作战中枢控制器 (PS主机平台风格 + 角色准备室 + 红蓝作战室)
 * 极致性能优化 + 复盘汇总报告 (在线预览与HTML下载) + 状态机闭环生命周期
 */
import '../../styles/common/cyber-base.css';
import '../../styles/modules/pc.css';
import { drillEngine } from '../../core/sync-engine.js';
import { getDrillCartridges, saveDrillCartridges } from '../../data/cartridges/index.js';
import { showToast } from '../../components/common/toast.js';

// ==================== 全局运行态变量 ====================
let drillCartridges = [];
let currentSelectedScript = null;
let currentActiveView = 'lobby'; // 'lobby' | 'roster' | 'warroom'
let currentStageIndex = 0;
let drillTimerInterval = null;
let realRemainingSeconds = 5400;
let realTotalSeconds = 5400;
let virtualCurrentDate = null;
let isDrillRunning = false;
let isDrillPaused = false;

// 鼠标拖拽时间轴状态与RAF调度
let isTimelineDragging = false;
let timelineDragRaf = null;

// 高性能缓存指纹与双缓冲图层
let activeBackdropLayer = 'A';
let lastQRScriptId = null;
let lastRenderedRosterHash = '';
let lastSeatsScrollHash = '';
let lastTrendingHash = '';
let lastTimelineChecksum = '';
let lastTimelineCount = 0;
let lastIMHash = '';

// 当前或上一次演练复盘数据对象
let currentDebriefReportData = null;

document.addEventListener('DOMContentLoaded', () => {
  initCartridgeData();
  initViewTabs();
  initLobby();
  initTimelineMouseDrag();
  preloadCartridgeImages();
  initDrillStateSanitizer();

  // 监听跨端状态机
  if (window.drillEngine) {
    window.drillEngine.subscribe((state, action, payload) => {
      onEngineSync(state, action, payload);
    });
    // 初始静默同步一次状态（此时不触发任何弹窗）
    onEngineSync(window.drillEngine.getState(), 'INIT', null);
  }

  // 检查并更新大厅上次复盘报告按钮
  updateLobbyReportButton();
});

// 初始化重置非法结束状态，防止刚进入页面就弹出已结束
function initDrillStateSanitizer() {
  // 隐藏右下角点点密信圆圈图标，仅在正式开启演练后才显示
  const dotLauncher = document.getElementById('floatingDotLauncher');
  if (dotLauncher) dotLauncher.style.display = 'none';

  // 隐藏所有全屏状态模态弹窗
  document.querySelectorAll('.fullscreen-state-overlay').forEach(el => el.style.display = 'none');

  // 如果状态机中残留了旧对局的 ENDED 状态，自动重置为 LOBBY 状态
  if (window.drillEngine) {
    const s = window.drillEngine.getState();
    if (s.drillStatus === 'ENDED' || s.drillStatus === 'SUCCESS' || s.drillStatus === 'FAILED') {
      window.drillEngine.setDrillStatus('LOBBY');
    }
  }
}

// ==================== 1. 数据初始化与剧本大厅 (PS主机平台模式) ====================

function initCartridgeData() {
  if (typeof window.getDrillCartridges === 'function') {
    drillCartridges = window.getDrillCartridges();
  } else if (window.DEFAULT_DRILL_CARTRIDGES) {
    drillCartridges = window.DEFAULT_DRILL_CARTRIDGES;
  } else {
    drillCartridges = [];
  }

  // 默认选中第一个剧本 (火灾事故V6)
  if (drillCartridges.length > 0) {
    currentSelectedScript = drillCartridges[0];
  }
}

// 利用空闲时间预加载所有剧本封面和背景大图，消除悬浮切图卡顿
function preloadCartridgeImages() {
  if (!drillCartridges || !drillCartridges.length) return;
  const runner = window.requestIdleCallback || ((cb) => setTimeout(cb, 120));
  runner(() => {
    drillCartridges.forEach(s => {
      if (s.coverUrl) {
        const img = new Image();
        img.src = s.coverUrl;
      }
      if (s.bgUrl) {
        const img = new Image();
        img.src = s.bgUrl;
      }
    });
  });
}

function initViewTabs() {
  const tabs = document.querySelectorAll('.pc-tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.target;
      switchView(target);
    });
  });
}

function switchView(viewName) {
  if (currentActiveView === viewName) return;
  currentActiveView = viewName;

  // 更新导航高亮
  document.querySelectorAll('.pc-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.target === viewName);
  });

  const lobbyEl = document.getElementById('viewLobby');
  const rosterEl = document.getElementById('viewRoster');
  const warEl = document.getElementById('viewWarRoom');

  if (lobbyEl) lobbyEl.style.display = viewName === 'lobby' ? 'flex' : 'none';
  if (rosterEl) rosterEl.style.display = viewName === 'roster' ? 'flex' : 'none';
  if (warEl) warEl.style.display = viewName === 'warroom' ? 'flex' : 'none';

  // 右下角点点密信图标显隐规则：只有在作战室且演练已启动时才显示
  const dotLauncher = document.getElementById('floatingDotLauncher');
  if (dotLauncher) {
    dotLauncher.style.display = (viewName === 'warroom' && isDrillRunning) ? 'flex' : 'none';
  }
  const im = document.getElementById('floatingIMWindow');
  if (im && (viewName !== 'warroom' || !isDrillRunning)) {
    im.style.display = 'none';
  }

  // 视图切换时，执行当前激活视图的针对性渲染
  if (viewName === 'lobby') {
    updateLobbyReportButton();
  } else if (viewName === 'roster') {
    renderRosterView(true);
  } else if (viewName === 'warroom') {
    renderWarRoomView();
  }
}

function initLobby() {
  renderLobbyTiles();
  if (currentSelectedScript) {
    applyScriptToLobbyHero(currentSelectedScript);
  }
  updateLobbyReportButton();
}

// 渲染 PS 游戏方块卡带横排 (方块不大，紧凑主机风)
function renderLobbyTiles() {
  const track = document.getElementById('lobbyTilesTrack');
  if (!track) return;

  track.innerHTML = drillCartridges.map((s) => {
    const isSelected = currentSelectedScript && currentSelectedScript.id === s.id;
    const diffMap = {
      easy: '★☆☆☆☆ 简单',
      medium: '★★★★☆ 中等',
      hard: '★★★★★ 困难',
      hell: '★★★★★ 地狱'
    };
    const diffStr = diffMap[s.difficulty] || '★★★☆☆ 实战';

    return `
      <div class="script-tile-card ${isSelected ? 'selected' : ''}" 
           id="tile_${s.id}"
           onmouseenter="onTileHover('${s.id}')"
           onclick="onTileClick('${s.id}')">
        <div class="script-tile-cover" style="background-image: url('${s.coverUrl || 'https://images.unsplash.com/photo-1542385151-efd9000785a0?w=400'}');">
          <span class="script-tile-badge">${s.typeName || '突发演练'}</span>
        </div>
        <div class="script-tile-info">
          <div class="script-tile-name" title="${s.name}">${s.name}</div>
          <div class="script-tile-meta">
            <span>${diffStr}</span>
            <span style="color:var(--pc-cyan);">${s.virtualDuration || 90}m</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// 悬浮即框选中该剧本，更新背景图与中上方介绍字段 (带去重防抖)
function onTileHover(scriptId) {
  if (currentSelectedScript && currentSelectedScript.id === scriptId) return;
  const script = drillCartridges.find(s => s.id === scriptId);
  if (!script) return;

  currentSelectedScript = script;

  // 仅精确更新卡片选中状态，避免全量重绘
  const targetId = `tile_${scriptId}`;
  document.querySelectorAll('.script-tile-card').forEach(el => {
    const shouldBeSelected = el.id === targetId;
    if (el.classList.contains('selected') !== shouldBeSelected) {
      el.classList.toggle('selected', shouldBeSelected);
    }
  });

  applyScriptToLobbyHero(script);
}

// 双缓冲 GPU 加速背景图切换，避免 CPU 重新光栅化导致的掉帧
function setLobbyBackdropImage(url) {
  if (!url) return;
  const layerA = document.getElementById('lobbyBackdropA');
  const layerB = document.getElementById('lobbyBackdropB');
  if (!layerA || !layerB) {
    const single = document.getElementById('lobbyBackdrop');
    if (single) single.style.backgroundImage = `url('${url}')`;
    return;
  }

  if (activeBackdropLayer === 'A') {
    layerB.style.backgroundImage = `url('${url}')`;
    layerB.style.opacity = '1';
    layerA.style.opacity = '0';
    activeBackdropLayer = 'B';
  } else {
    layerA.style.backgroundImage = `url('${url}')`;
    layerA.style.opacity = '1';
    layerB.style.opacity = '0';
    activeBackdropLayer = 'A';
  }
}

// 应用剧本详情至大厅背景与上方看板
function applyScriptToLobbyHero(script) {
  if (!script) return;
  setLobbyBackdropImage(script.bgUrl);

  const codeEl = document.getElementById('heroScriptCode');
  const titleEl = document.getElementById('heroScriptTitle');
  const badgesEl = document.getElementById('heroScriptBadges');
  const descEl = document.getElementById('heroScriptDesc');

  if (codeEl) codeEl.textContent = `[${script.id}]`;
  if (titleEl) titleEl.textContent = script.name;

  if (badgesEl) {
    const diffMap = {
      easy: '简单指导',
      medium: '★★★★☆ 中等推演',
      hard: '★★★★★ 高压对抗',
      hell: '极限实战'
    };
    const diff = diffMap[script.difficulty] || '中等难度';
    badgesEl.innerHTML = `
      <span class="badge-ps badge-active">● ${script.status === 'active' ? '当前演练中' : '就绪待启动'}</span>
      <span class="badge-ps badge-cyan">${script.typeName || '应急实战'}</span>
      <span class="badge-ps badge-gold">${diff}</span>
      <span class="badge-ps">⏱️ 演练真实时长: ${script.virtualDuration || 90} 分钟</span>
      <span class="badge-ps">⚡ 时间倍速: ${script.timeSpeed || 24}.0x (1小时=1天)</span>
      <span class="badge-ps">👥 ${script.stages?.length || 5} 大推演阶段 · 8 席位</span>
    `;
  }

  if (descEl) {
    descEl.innerHTML = `
      <strong>📌 剧本情境背景：</strong>${script.bgDesc || '突发重大应急公共事件，引发社会网络舆论高度关注与多平台发酵，考验政企联合协同应对能力。'}
    `;
  }
}

// 点击剧本方块，进入剧本准备室
function onTileClick(scriptId) {
  onTileHover(scriptId);
  enterCurrentSelectedScript();
}

function enterCurrentSelectedScript() {
  if (!currentSelectedScript) return;
  switchView('roster');
}

// ==================== 2. 视图二：角色就位准备室 (双二维码 + 认领卡片) ====================

// 本地毫秒级快速生成二维码，消除海外网络请求阻滞
function updateRosterQRCodes(scriptId) {
  if (lastQRScriptId === scriptId) return;
  lastQRScriptId = scriptId;

  const currentHost = window.location.origin || 'http://localhost:5173';
  const qrRed = document.getElementById('qrImgRed');
  const qrBlue = document.getElementById('qrImgBlue');

  const redUrl = `${currentHost}/mobile.html?camp=red&script=${scriptId}`;
  const blueUrl = `${currentHost}/mobile.html?camp=blue&script=${scriptId}`;

  if (qrRed) {
    qrRed.src = `/api/qrcode?data=${encodeURIComponent(redUrl)}`;
  }
  if (qrBlue) {
    qrBlue.src = `/api/qrcode?data=${encodeURIComponent(blueUrl)}`;
  }
}

function renderRosterView(force = false) {
  if (!currentSelectedScript) return;

  const titleEl = document.getElementById('rosterTargetScriptName');
  if (titleEl && titleEl.textContent !== currentSelectedScript.name) {
    titleEl.textContent = currentSelectedScript.name;
  }

  // 更新二维码（若剧本ID未变自动命中缓存）
  updateRosterQRCodes(currentSelectedScript.id);

  const engineState = window.drillEngine ? window.drillEngine.getState() : {};
  const seats = engineState.seats || {};

  // 状态哈希比对：若席位认领状态未发生变化，跳过 DOM 重建
  const rosterHash = `${currentSelectedScript.id}_` + Object.entries(seats).map(([k, s]) => `${k}:${s.assigned ? 1 : 0}:${s.user || ''}`).join('|');
  if (!force && rosterHash === lastRenderedRosterHash) {
    return;
  }
  lastRenderedRosterHash = rosterHash;

  // 1. 渲染红方角色
  const redGrid = document.getElementById('rosterRedRolesGrid');
  const redSeats = Object.values(seats).filter(s => s.camp === 'red');
  let redClaimedCount = 0;

  if (redGrid) {
    redGrid.innerHTML = redSeats.map(seat => {
      if (seat.assigned) redClaimedCount++;
      return `
        <div class="roster-role-card ${seat.assigned ? 'claimed claimed-red' : ''}" 
             onclick="toggleSeatClaim('${seat.id}')"
             title="${seat.assigned ? '已就位：' + seat.user : '点击可直接快捷认领/取消'}">
          <div class="role-card-avatar" style="${seat.assigned ? 'border-color:var(--pc-red); color:var(--pc-red);' : ''}">
            ${seat.avatar || '👤'}
          </div>
          <div class="role-card-user">${seat.assigned ? (seat.user || '已扫码就位') : '待扫码认领'}</div>
          <div class="role-card-name">${seat.name}</div>
          <span class="role-card-status-pill">${seat.assigned ? '● 已就绪' : '待加入'}</span>
        </div>
      `;
    }).join('');
  }

  // 2. 渲染蓝方席位 (指挥长特殊标冠)
  const blueGrid = document.getElementById('rosterBlueRolesGrid');
  const blueSeats = Object.values(seats).filter(s => s.camp === 'blue');
  let blueClaimedCount = 0;

  if (blueGrid) {
    blueGrid.innerHTML = blueSeats.map(seat => {
      if (seat.assigned) blueClaimedCount++;
      const isCmd = seat.isCommander;
      return `
        <div class="roster-role-card ${seat.assigned ? 'claimed claimed-blue' : ''} ${isCmd ? 'role-commander' : ''}" 
             onclick="toggleSeatClaim('${seat.id}')"
             title="${seat.assigned ? '已就位：' + seat.user : '点击可快捷认领/取消'}">
          <div class="role-card-avatar" style="${seat.assigned ? (isCmd ? 'border-color:var(--pc-gold); color:var(--pc-gold);' : 'border-color:var(--pc-cyan); color:var(--pc-cyan);') : ''}">
            ${seat.avatar || (isCmd ? '👑' : '🏛️')}
          </div>
          <div class="role-card-user">${seat.assigned ? (seat.user || '已扫码就位') : '待扫码认领'}</div>
          <div class="role-card-name" style="${isCmd ? 'color:var(--pc-gold);' : ''}">
            ${isCmd ? '👑 ' : ''}${seat.name}
          </div>
          <span class="role-card-status-pill">${seat.assigned ? (isCmd ? '★ 指挥长就绪' : '● 已就绪') : '待加入'}</span>
        </div>
      `;
    }).join('');
  }

  // 更新计数与指挥长权限按钮状态
  const totalSeats = redSeats.length + blueSeats.length;
  const totalClaimed = redClaimedCount + blueClaimedCount;

  const countBadge = document.getElementById('rosterSeatedCountBadge');
  if (countBadge) countBadge.textContent = `👥 就绪席位: ${totalClaimed} / ${totalSeats}`;

  const redRatio = document.getElementById('redSeatedRatioText');
  if (redRatio) redRatio.textContent = `${redClaimedCount} / ${redSeats.length} 已就绪`;

  const blueRatio = document.getElementById('blueSeatedRatioText');
  if (blueRatio) blueRatio.textContent = `${blueClaimedCount} / ${blueSeats.length} 已就绪`;

  // 核心规则：只有指挥长角色才可以进入作战室，其他人员都在手机端作战
  const commanderSeat = seats['blue_commander'];
  const enterBtn = document.getElementById('btnEnterWarRoom');

  if (enterBtn) {
    if (commanderSeat && commanderSeat.assigned) {
      enterBtn.disabled = false;
      enterBtn.innerHTML = '⚔️ 指挥长进入作战室 (开启实战推演)';
      enterBtn.style.opacity = '1';
      enterBtn.style.boxShadow = '0 0 20px rgba(0, 240, 255, 0.7)';
    } else {
      enterBtn.disabled = true;
      enterBtn.innerHTML = '🔒 等待指挥长扫码就位 (仅指挥长可进)';
      enterBtn.style.opacity = '0.55';
      enterBtn.style.boxShadow = 'none';
    }
  }
}

// 快捷点击席位卡片切换认领
function toggleSeatClaim(seatId) {
  if (!window.drillEngine) return;
  const state = window.drillEngine.getState();
  const seat = state.seats[seatId];
  if (!seat) return;

  if (seat.assigned) {
    window.drillEngine.unclaimRole(seatId);
  } else {
    const mockUser = seat.isCommander ? '李主任 (PC就位)' : '学员·' + (Math.floor(100 + Math.random() * 900));
    window.drillEngine.claimRole(seatId, mockUser);
  }
}

// 一键全员模拟就位
function simulateClaimAllRoles() {
  if (!window.drillEngine) return;
  window.drillEngine.claimAllSeats();
  showToastNotice('⚡ 8名红方席位与8名蓝方席位已全部就绪！网信办指挥长已点亮。');
}

// 尝试进入作战室
function attemptEnterWarRoom() {
  const engineState = window.drillEngine ? window.drillEngine.getState() : {};
  const commanderSeat = engineState.seats ? engineState.seats['blue_commander'] : null;

  if (!commanderSeat || !commanderSeat.assigned) {
    alert('⚠️ 无法进入作战室！\n\n依据参演规则：只有【网信办指挥长】席位扫码就位后，方可进入 PC 作战中枢指挥！其他参演人员均在手机移动端协同推演。');
    return;
  }

  // 确保进入作战室时，旧的弹窗全部关闭
  document.querySelectorAll('.fullscreen-state-overlay').forEach(el => el.style.display = 'none');
  switchView('warroom');
}

// ==================== 3. 视图三：指挥作战室 (核心攻防机制 + 倒计时 + 双拳) ====================

function renderWarRoomView() {
  if (!currentSelectedScript) return;

  const script = currentSelectedScript;
  const nameEl = document.getElementById('warCurrentScriptName');
  if (nameEl && nameEl.textContent !== script.name) nameEl.textContent = script.name;

  const stages = script.stages || [];
  const currentStage = stages[currentStageIndex] || stages[0];

  const tagEl = document.getElementById('warCurrentStageTag');
  if (tagEl && currentStage) tagEl.textContent = currentStage.name;

  const speedPill = document.getElementById('warSpeedPill');
  if (speedPill) speedPill.textContent = `${script.timeSpeed || 24}.0x 倍速`;

  // 初始化倒计时
  realTotalSeconds = (script.virtualDuration || 90) * 60;
  if (!isDrillRunning && !isDrillPaused) {
    realRemainingSeconds = realTotalSeconds;
  }
  updateCountdownDisplay();

  // 虚拟时间
  virtualCurrentDate = new Date(`${script.startDate || '2026-04-08'}T18:57:00`);
  updateVirtualClockDisplay();

  // 按钮重置（支持第二次进入再次推演）
  const btnStart = document.getElementById('btnStartDrill');
  const btnPause = document.getElementById('btnPauseDrill');
  const btnEnd = document.getElementById('btnEndDrill');
  if (btnStart) btnStart.style.display = isDrillRunning ? 'none' : 'inline-flex';
  if (btnPause) btnPause.style.display = (isDrillRunning && !isDrillPaused) ? 'inline-flex' : 'none';
  if (btnEnd) btnEnd.style.display = isDrillPaused ? 'inline-flex' : 'none';

  // 强制全量子组件同步一次
  renderWarRoomCampSeats(true);
  renderTrendingBanner(true);
  renderCredibilityAndFists();
  renderHorizontalTimeline(true);
  renderVirtualProgressTracker();
}

function updateCountdownDisplay() {
  const el = document.getElementById('warRealCountdown');
  if (!el) return;

  const hours = Math.floor(realRemainingSeconds / 3600);
  const minutes = Math.floor((realRemainingSeconds % 3600) / 60);
  const seconds = realRemainingSeconds % 60;

  const str = [
    String(hours).padStart(2, '0'),
    String(minutes).padStart(2, '0'),
    String(seconds).padStart(2, '0')
  ].join(':');

  if (el.textContent !== str) {
    el.textContent = str;
  }
}

function updateVirtualClockDisplay() {
  const el = document.getElementById('warVirtualClock');
  if (!el || !virtualCurrentDate) return;

  const y = virtualCurrentDate.getFullYear();
  const m = String(virtualCurrentDate.getMonth() + 1).padStart(2, '0');
  const d = String(virtualCurrentDate.getDate()).padStart(2, '0');
  const hh = String(virtualCurrentDate.getHours()).padStart(2, '0');
  const mm = String(virtualCurrentDate.getMinutes()).padStart(2, '0');

  const formatted = `${y}-${m}-${d} ${hh}:${mm}`;
  if (el.textContent !== formatted) {
    el.textContent = formatted;
  }
}

// 开始演练 (开启实战推演)
function handleStartDrill() {
  isDrillRunning = true;
  isDrillPaused = false;

  const btnStart = document.getElementById('btnStartDrill');
  const btnPause = document.getElementById('btnPauseDrill');
  const btnEnd = document.getElementById('btnEndDrill');
  if (btnStart) btnStart.style.display = 'none';
  if (btnPause) btnPause.style.display = 'inline-flex';
  if (btnEnd) btnEnd.style.display = 'none';

  // 核心规则：只有点击所有人员席位就位点击开启实战推演，才出现右下角点点密信圆圈图标
  const dotLauncher = document.getElementById('floatingDotLauncher');
  if (dotLauncher) dotLauncher.style.display = 'flex';

  if (window.drillEngine) {
    window.drillEngine.startDrill(currentSelectedScript?.id);
  }

  startCountdownTimer();
  showToastNotice('▶️ 百战实战演练已启动！真实时间倒计时开始，右下角点点密信指挥群已开启。');
}

// 暂停演练
function handlePauseDrill() {
  isDrillRunning = false;
  isDrillPaused = true;

  clearInterval(drillTimerInterval);

  const btnStart = document.getElementById('btnStartDrill');
  const btnPause = document.getElementById('btnPauseDrill');
  const btnEnd = document.getElementById('btnEndDrill');
  if (btnStart) btnStart.style.display = 'none';
  if (btnPause) btnPause.style.display = 'none';
  if (btnEnd) btnEnd.style.display = 'inline-flex';

  if (window.drillEngine) {
    window.drillEngine.pauseDrill();
  }

  const overlay = document.getElementById('overlayPause');
  if (overlay) overlay.style.display = 'flex';
}

// 继续演练 (解除暂停)
function handleResumeDrill() {
  const overlay = document.getElementById('overlayPause');
  if (overlay) overlay.style.display = 'none';

  isDrillRunning = true;
  isDrillPaused = false;

  const btnPause = document.getElementById('btnPauseDrill');
  const btnEnd = document.getElementById('btnEndDrill');
  if (btnPause) btnPause.style.display = 'inline-flex';
  if (btnEnd) btnEnd.style.display = 'none';

  if (window.drillEngine) {
    window.drillEngine.resumeDrill();
  }

  startCountdownTimer();
}

// 结束演练 (仅在主动点击结束或时间结束时触发)
function handleEndDrillManually() {
  clearInterval(drillTimerInterval);
  isDrillRunning = false;
  isDrillPaused = false;

  if (window.drillEngine) {
    window.drillEngine.endDrill('MANUAL');
  }

  // 自动生成复盘汇总报告并持久化留痕
  currentDebriefReportData = generateDrillDebriefReport('ENDED');

  const pauseOverlay = document.getElementById('overlayPause');
  if (pauseOverlay) pauseOverlay.style.display = 'none';

  const endOverlay = document.getElementById('overlayEnded');
  if (endOverlay) endOverlay.style.display = 'flex';
}

function handleEndDrillFromModal() {
  handleEndDrillManually();
}

// 从弹窗返回剧本大厅 (第一次结束后，第二次可以重新进入再次演练)
function returnToLobbyFromModal() {
  document.querySelectorAll('.fullscreen-state-overlay').forEach(el => el.style.display = 'none');
  clearInterval(drillTimerInterval);
  isDrillRunning = false;
  isDrillPaused = false;

  // 重置状态机为大厅状态，清理旧对局的 ENDED 标识，恢复公信力基准
  if (window.drillEngine) {
    window.drillEngine.setDrillStatus('LOBBY');
    window.drillEngine.state.battle.credibilityScore = 100;
  }

  // 隐藏右下角点点密信
  const dotLauncher = document.getElementById('floatingDotLauncher');
  if (dotLauncher) dotLauncher.style.display = 'none';
  const im = document.getElementById('floatingIMWindow');
  if (im) im.style.display = 'none';

  switchView('lobby');
  updateLobbyReportButton();
}

// 重新开启本剧本再次推演
function restartCurrentScriptDrill() {
  document.querySelectorAll('.fullscreen-state-overlay').forEach(el => el.style.display = 'none');
  clearInterval(drillTimerInterval);
  isDrillRunning = false;
  isDrillPaused = false;

  if (window.drillEngine) {
    window.drillEngine.resetScenario();
    window.drillEngine.claimAllSeats(); // 保持模拟就绪
    window.drillEngine.setDrillStatus('READY');
  }

  currentStageIndex = 0;
  realRemainingSeconds = realTotalSeconds;
  renderWarRoomView();
  handleStartDrill();
}

// 真实时间倒计时主循环
function startCountdownTimer() {
  clearInterval(drillTimerInterval);

  drillTimerInterval = setInterval(() => {
    if (!isDrillRunning) return;

    if (realRemainingSeconds > 0) {
      realRemainingSeconds--;
      updateCountdownDisplay();

      // 虚拟时间换算 (例如24倍速：真实1秒 = 虚拟24秒)
      const speed = currentSelectedScript?.timeSpeed || 24;
      if (virtualCurrentDate) {
        virtualCurrentDate.setSeconds(virtualCurrentDate.getSeconds() + speed);
        updateVirtualClockDisplay();
      }

      // 阶段自动推进判断
      const stages = currentSelectedScript?.stages || [];
      if (stages.length > 0) {
        const stageDuration = realTotalSeconds / stages.length;
        const elapsed = realTotalSeconds - realRemainingSeconds;
        const calculatedStageIdx = Math.min(stages.length - 1, Math.floor(elapsed / stageDuration));

        if (calculatedStageIdx > currentStageIndex) {
          currentStageIndex = calculatedStageIdx;
          onStageAdvanced(currentStageIndex);
        }
      }
    } else {
      // 时间结束，执行结局判定
      clearInterval(drillTimerInterval);
      isDrillRunning = false;
      evaluateDrillOutcome();
    }
  }, 1000);
}

// 阶段推进触发
function onStageAdvanced(newStageIndex) {
  const stages = currentSelectedScript?.stages || [];
  const nextStage = stages[newStageIndex];
  if (!nextStage) return;

  const tagEl = document.getElementById('warCurrentStageTag');
  if (tagEl) tagEl.textContent = nextStage.name;

  // 全局同步阶段推进至状态机，并根据演练危机演化动态联动公信力分数
  if (window.drillEngine) {
    window.drillEngine.advanceStage(newStageIndex, nextStage.name, nextStage.id || `STAGE-0${newStageIndex + 1}`);
  }

  // 挂载该阶段的新增红方攻击至时间轴（蓝方留待学员或操作者响应处置）
  if (nextStage.confrontations && window.drillEngine) {
    nextStage.confrontations.forEach(c => {
      const state = window.drillEngine.getState();
      const exists = state.timelineConfrontations?.some(tc => tc.id === c.id);
      if (!exists && c.red) {
        window.drillEngine.postRedCombat(c.red);
      }
    });
  }

  renderVirtualProgressTracker();
  renderCredibilityAndFists();
  showToastNotice(`🚀 演练阶段已推进至：${nextStage.name}！双方攻防对抗升级。`);
}

// 手动强制推进阶段
function forceAdvanceStage() {
  const stages = currentSelectedScript?.stages || [];
  if (currentStageIndex < stages.length - 1) {
    currentStageIndex++;
    onStageAdvanced(currentStageIndex);
  } else {
    evaluateDrillOutcome();
  }
}

// 演练结局判定 (仅在演练运行态触发)
function evaluateDrillOutcome() {
  if (!isDrillRunning && !isDrillPaused) return;

  const state = window.drillEngine ? window.drillEngine.getState() : { battle: { credibilityScore: 100 } };
  const score = state.battle.credibilityScore;

  clearInterval(drillTimerInterval);
  isDrillRunning = false;
  isDrillPaused = false;

  if (score < 60) {
    // 演练失败：公信力小于60分红线崩塌
    currentDebriefReportData = generateDrillDebriefReport('FAILED');
    if (window.drillEngine) {
      window.drillEngine.setDrillStatus('FAILED');
    }
    const overlay = document.getElementById('overlayFailure');
    const scoreEl = document.getElementById('failureFinalScore');
    if (scoreEl) scoreEl.textContent = `${score} 分`;
    if (overlay) overlay.style.display = 'flex';
  } else if (score >= 95 && currentStageIndex >= (currentSelectedScript?.stages?.length || 5) - 1) {
    // 演练成功：公信力大于95分以上且全阶段完成
    currentDebriefReportData = generateDrillDebriefReport('SUCCESS');
    if (window.drillEngine) {
      window.drillEngine.setDrillStatus('SUCCESS');
    }
    const overlay = document.getElementById('overlaySuccess');
    const scoreEl = document.getElementById('successFinalScore');
    if (scoreEl) scoreEl.textContent = `${score} 分`;
    if (overlay) overlay.style.display = 'flex';
  } else {
    // 正常倒计时结束归档
    currentDebriefReportData = generateDrillDebriefReport('ENDED');
    if (window.drillEngine) {
      window.drillEngine.setDrillStatus('ENDED');
    }
    const overlay = document.getElementById('overlayEnded');
    if (overlay) overlay.style.display = 'flex';
  }
}

// ==================== 4. 作战室子组件渲染与攻防状态 ====================

// 4.1 渲染左右席位立柱 (带指纹比对跳过)
function renderWarRoomCampSeats(force = false) {
  const state = window.drillEngine ? window.drillEngine.getState() : {};
  const seats = state.seats || {};

  const seatsHash = Object.entries(seats).map(([k, s]) => `${k}:${s.assigned ? 1 : 0}:${s.user || ''}`).join('|');
  if (!force && seatsHash === lastSeatsScrollHash) {
    return;
  }
  lastSeatsScrollHash = seatsHash;

  const redScroll = document.getElementById('warRedSeatsScroll');
  const blueScroll = document.getElementById('warBlueSeatsScroll');

  const redList = Object.values(seats).filter(s => s.camp === 'red');
  const blueList = Object.values(seats).filter(s => s.camp === 'blue');

  if (redScroll) {
    redScroll.innerHTML = redList.map(s => `
      <div class="war-seat-item active-seat">
        <span class="war-seat-avatar">${s.avatar || '👤'}</span>
        <div style="flex:1; overflow:hidden;">
          <div style="font-weight:700; color:#ff6b8b; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${s.name}</div>
          <div style="font-size:9.5px; color:var(--pc-text-muted);">${s.platform || '发酵平台'} · 施压中</div>
        </div>
        <span style="font-size:9.5px; color:#ff2a5f;">● 攻</span>
      </div>
    `).join('');
  }

  if (blueScroll) {
    blueScroll.innerHTML = blueList.map(s => {
      const isCmd = s.isCommander;
      return `
        <div class="war-seat-item active-seat" style="${isCmd ? 'border-color:var(--pc-gold);' : ''}">
          <span class="war-seat-avatar">${s.avatar || (isCmd ? '👑' : '🏛️')}</span>
          <div style="flex:1; overflow:hidden;">
            <div style="font-weight:700; color:${isCmd ? 'var(--pc-gold)' : 'var(--pc-cyan)'}; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
              ${isCmd ? '👑 ' : ''}${s.name}
            </div>
            <div style="font-size:9.5px; color:var(--pc-text-muted);">${s.department || '协同部门'} · 双工</div>
          </div>
          <span style="font-size:9.5px; color:var(--pc-cyan);">● 防</span>
        </div>
      `;
    }).join('');
  }
}

// 4.2 渲染实时热搜榜单 (带哈希比对跳过)
function renderTrendingBanner(force = false) {
  const state = window.drillEngine ? window.drillEngine.getState() : {};
  const list = state.trendingList || [];
  const container = document.getElementById('warTrendingItemsRow');
  if (!container) return;

  const trendHash = list.map(item => `${item.id}_${item.rank}_${item.isHighlighted}`).join('|');
  if (!force && trendHash === lastTrendingHash) {
    return;
  }
  lastTrendingHash = trendHash;

  container.innerHTML = list.map(item => {
    const isPulse = item.isHighlighted;
    return `
      <div class="trending-chip ${isPulse ? 'incident-active-pulse' : ''}" title="${item.title}">
        <span style="color:#ffaa00; font-weight:700;">#${item.rank}</span>
        <span style="background:${item.tag === '爆' ? '#ff2a5f' : '#ffaa00'}; color:#000; font-weight:900; font-size:9px; padding:0 3px; border-radius:2px;">${item.tag}</span>
        <span style="max-width:180px; overflow:hidden; text-overflow:ellipsis;">${item.title}</span>
        <span style="color:var(--pc-text-muted); font-size:9.5px;">${item.heat}</span>
      </div>
    `;
  }).join('');
}

// 4.3 渲染公信力双拳与分数
function renderCredibilityAndFists() {
  const state = window.drillEngine ? window.drillEngine.getState() : { battle: { credibilityScore: 100 } };
  const score = state.battle.credibilityScore;

  const scoreEl = document.getElementById('warCredScoreVal');
  const badgeEl = document.getElementById('warCredibilityBadge');
  const ratingEl = document.getElementById('warCredRatingLabel');
  const noticeEl = document.getElementById('warAlertNoticeText');

  if (scoreEl && scoreEl.textContent !== String(score)) {
    scoreEl.textContent = score;
  }

  // 判定区间与红色预警
  if (badgeEl) {
    if (score >= 60 && score <= 80) {
      if (!badgeEl.classList.contains('alert-flashing')) badgeEl.classList.add('alert-flashing');
      if (noticeEl) noticeEl.innerHTML = '<b style="color:#ff2a5f;">🚨 红色预警！公信力陷入危机警戒区！</b>';
    } else {
      if (badgeEl.classList.contains('alert-flashing')) badgeEl.classList.remove('alert-flashing');
      if (score > 80) {
        if (noticeEl) noticeEl.innerHTML = '<span style="color:#00e676;">● 态势稳定，公信力保持在安全高位</span>';
      }
    }
  }

  if (ratingEl) {
    let rating = '安全受信';
    if (score >= 95) rating = '卓越 (标杆)';
    else if (score >= 80) rating = '安全受信';
    else if (score >= 60) rating = '⚠️ 警戒危机';
    else rating = '❌ 彻底崩塌';

    if (ratingEl.textContent !== rating) ratingEl.textContent = rating;
  }

  // 若公信力跌破60分且演练正在进行，立即判定失败
  if (score < 60 && isDrillRunning) {
    clearInterval(drillTimerInterval);
    isDrillRunning = false;
    evaluateDrillOutcome();
  }
}

// 4.4 渲染横向可左右拖动时间轴 (彻底杜绝拖拽中的重绘跳闪)
function renderHorizontalTimeline(force = false) {
  const state = window.drillEngine ? window.drillEngine.getState() : {};
  const confrontations = state.timelineConfrontations || [];
  const viewport = document.getElementById('timelineScrollViewport');
  if (!viewport) return;

  // 用户正在手动按住拖动时间轴时，严禁重绘打断用户视线
  if (isTimelineDragging && !force) return;

  const checksum = confrontations.map(c => `${c.id}_${c.blues?.length || 0}`).join('|');
  if (!force && checksum === lastTimelineChecksum) {
    return;
  }
  lastTimelineChecksum = checksum;

  const isNewItemAdded = confrontations.length > lastTimelineCount;
  lastTimelineCount = confrontations.length;

  if (confrontations.length === 0) {
    viewport.innerHTML = `
      <div style="color:var(--pc-text-muted); font-size:12px; margin:auto;">
        暂无攻防事件，等待红蓝双方发起推演内容...
      </div>
    `;
    return;
  }

  viewport.innerHTML = `
    <div class="fishbone-track">
      <div class="fishbone-spine-line"></div>
      <div class="fishbone-head-badge">
        <span>🐟 演练博弈前沿</span>
        <span>▶</span>
      </div>
      ${confrontations.map((c, idx) => {
        const red = c.red || {};
        const blues = c.blues || [];

        const bluesHtml = blues.length > 0 ? blues.map(b => `
          <div style="background:rgba(0,240,255,0.06); border:1px solid rgba(0,240,255,0.25); border-radius:4px; padding:5px 8px; margin-bottom:4px;">
            <div class="node-blue-head">
              <span>🏛️ ${b.role || '处置席位'}</span>
              <span style="color:var(--pc-cyan); font-weight:bold;">+${b.delta || 10}分</span>
            </div>
            <div style="color:#fff; font-weight:600; font-size:11px; margin-bottom:2px;">${b.title || ''}</div>
            <div style="color:#94a3b8; font-size:10px; line-height:1.4;">${b.statement || ''}</div>
          </div>
        `).join('') : `
          <div style="background:rgba(255,184,0,0.1); border:1px dashed #ffb800; border-radius:4px; padding:6px; color:#ffb800; font-size:10px; text-align:center;">
            ⚠️ 官方应对响应中 (公信力持续承压)
          </div>
        `;

        return `
          <div class="fishbone-column-node" id="cf_node_${c.id}">
            <!-- 上方红刺：红方施压卡片 -->
            <div class="fishbone-upper-rib">
              <div class="fishbone-card-red">
                <div class="node-red-head">
                  <span>👤 ${red.role || red.author || '红方角色'}</span>
                  <span style="color:#ff6b8b; font-weight:bold;">${red.penalty || -15}分</span>
                </div>
                <div style="color:#fecaca; font-size:11px; margin-bottom:2px; line-height:1.4;">${red.content || ''}</div>
                ${red.assetName ? `<div style="font-size:10px; color:#ff99ab; margin-top:2px;">🎬 关联物证: ${red.assetName}</div>` : ''}
              </div>
              <div class="fishbone-connector-top"></div>
            </div>

            <!-- 中部脊椎骨节 -->
            <div class="fishbone-vertebra-joint" title="推演节点 ${idx + 1} (${c.time || '18:57'})">
              <span class="fishbone-joint-time">${c.time || '18:57'}</span>
              <span class="fishbone-joint-seq">#${idx + 1}</span>
            </div>

            <!-- 下方蓝刺：蓝方应对卡片 -->
            <div class="fishbone-lower-rib">
              <div class="fishbone-connector-bottom"></div>
              <div class="fishbone-card-blue">
                ${bluesHtml}
              </div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  // 仅在新增了对抗项且没有在拖拽时，顺畅滚至最右最新前沿
  if (isNewItemAdded && !isTimelineDragging) {
    requestAnimationFrame(() => {
      viewport.scrollTo({ left: viewport.scrollWidth, behavior: 'smooth' });
    });
  }
}

// 时间轴横向按钮滚动
function scrollTimeline(direction) {
  const viewport = document.getElementById('timelineScrollViewport');
  if (!viewport) return;
  const distance = direction === 'left' ? -340 : 340;
  viewport.scrollBy({ left: distance, behavior: 'smooth' });
}

// 鼠标丝滑拖拽时间轴 (RAF节流 + 全局事件追踪)
function initTimelineMouseDrag() {
  const viewport = document.getElementById('timelineScrollViewport');
  if (!viewport) return;

  let isDragging = false;
  let startX = 0;
  let scrollStart = 0;
  let pendingScroll = 0;

  viewport.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    isDragging = true;
    isTimelineDragging = true;
    startX = e.pageX;
    scrollStart = viewport.scrollLeft;
    pendingScroll = scrollStart;
    viewport.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const walk = (e.pageX - startX) * 1.35;
    pendingScroll = scrollStart - walk;

    if (!timelineDragRaf) {
      timelineDragRaf = requestAnimationFrame(() => {
        viewport.scrollLeft = pendingScroll;
        timelineDragRaf = null;
      });
    }
  });

  const stopDrag = () => {
    if (!isDragging) return;
    isDragging = false;
    isTimelineDragging = false;
    viewport.style.cursor = 'grab';
    document.body.style.userSelect = '';
    if (timelineDragRaf) {
      cancelAnimationFrame(timelineDragRaf);
      timelineDragRaf = null;
    }
  };

  window.addEventListener('mouseup', stopDrag);
  window.addEventListener('mouseleave', stopDrag);
}

// 4.5 底部虚拟时间推进进度轴
function renderVirtualProgressTracker() {
  const stages = currentSelectedScript?.stages || [];
  const total = stages.length || 5;
  const current = currentStageIndex + 1;
  const percent = Math.min(100, Math.round((current / total) * 100));

  const fillEl = document.getElementById('virtualTrackerFill');
  const textEl = document.getElementById('virtualStageProgressText');

  if (fillEl) fillEl.style.width = `${percent}%`;
  if (textEl) textEl.textContent = `阶段 ${current} / ${total} · ${stages[currentStageIndex]?.name || '推演中'}`;
}

// ==================== 5. 右下角圆圈“点”字图标与点点密信群聊 ====================

function toggleFloatingIM() {
  const im = document.getElementById('floatingIMWindow');
  const dot = document.getElementById('imUnreadDot');
  if (!im) return;

  const isHidden = im.style.display === 'none' || !im.style.display;
  im.style.display = isHidden ? 'flex' : 'none';

  if (isHidden && dot) {
    dot.style.display = 'none';
  }

  if (isHidden) {
    renderIMMessages(true);
  }
}

function renderIMMessages(force = false) {
  const im = document.getElementById('floatingIMWindow');
  if (!force && (!im || im.style.display === 'none' || !im.style.display)) {
    return;
  }

  const state = window.drillEngine ? window.drillEngine.getState() : {};
  const msgs = state.chatMessages || [];
  const container = document.getElementById('imMsgArea');
  if (!container) return;

  const imHash = `${msgs.length}_${msgs[msgs.length - 1]?.id || ''}`;
  if (!force && imHash === lastIMHash) {
    return;
  }
  lastIMHash = imHash;

  container.innerHTML = msgs.map(m => {
    let bubbleCls = 'bubble-other';
    if (m.senderId === 'blue_commander') bubbleCls = 'bubble-mine';
    else if (m.role === 'BOT' || m.senderId === 'sentinel_bot') bubbleCls = 'bubble-bot';

    return `
      <div style="display:flex; flex-direction:column; gap:2px;">
        <div style="font-size:10px; color:var(--pc-text-muted); ${m.senderId === 'blue_commander' ? 'text-align:right;' : ''}">
          ${m.senderName} <span style="margin-left:4px;">${m.time || ''}</span>
        </div>
        <div class="im-msg-bubble ${bubbleCls}">
          ${m.content}
        </div>
      </div>
    `;
  }).join('');

  requestAnimationFrame(() => {
    container.scrollTop = container.scrollHeight;
  });
}

// 指挥长下发催办指令
function quickSendCommand(text) {
  const input = document.getElementById('imTextInput');
  if (input) {
    input.value = text;
    sendCommanderIMMessage();
  }
}

function sendCommanderIMMessage() {
  const input = document.getElementById('imTextInput');
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;

  if (window.drillEngine) {
    window.drillEngine.sendChatMessage('blue_commander', '网信办指挥长·李主任', '👑', 'BLUE', text);
  }

  input.value = '';
}

// ==================== 6. 状态机同步回调响应 (按需按屏响应) ====================

function onEngineSync(state, action, payload) {
  if (!state) return;

  // 核心优化：仅渲染当前用户所处的活跃屏幕，杜绝后台无谓重绘与卡顿
  if (currentActiveView === 'roster') {
    renderRosterView();
  } else if (currentActiveView === 'warroom') {
    renderWarRoomCampSeats();
    renderTrendingBanner();
    renderCredibilityAndFists();
    renderHorizontalTimeline();
  }

  // IM 抽屉消息仅在展开时或收到新消息时更新
  renderIMMessages();

  // 若收到红方攻击事件，右下角“点”字图标亮起红点
  if (action === 'RED_POST_CREATED') {
    const dot = document.getElementById('imUnreadDot');
    const im = document.getElementById('floatingIMWindow');
    if (dot && (!im || im.style.display === 'none')) {
      dot.style.display = 'block';
    }
  }

  // 状态变更模态框响应：只有在演练正在运行或作战室中，且明确收到 DRILL_* 广播时才响应，杜绝进入页面时错误触发
  if (action === 'DRILL_PAUSED' && isDrillRunning) {
    handlePauseDrill();
  } else if (action === 'DRILL_RESUMED' && isDrillPaused) {
    handleResumeDrill();
  } else if (action === 'DRILL_ENDED' && (isDrillRunning || isDrillPaused)) {
    handleEndDrillManually();
  }
}

// ==================== 7. 复盘汇总报告系统 (在线预览 + HTML文件下载) ====================

// 生成结构化复盘数据并持久化至 localStorage
function generateDrillDebriefReport(outcomeType = 'ENDED') {
  const engineState = window.drillEngine ? window.drillEngine.getState() : {};
  const script = currentSelectedScript || (drillCartridges.length ? drillCartridges[0] : {});
  const score = engineState.battle ? engineState.battle.credibilityScore : 100;
  const confrontations = engineState.timelineConfrontations || [];
  const chatMessages = engineState.chatMessages || [];
  const seats = engineState.seats || {};

  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const timeStr = now.toTimeString().slice(0, 8);

  const durationMinutes = script.virtualDuration || 90;
  const elapsedSeconds = Math.max(0, realTotalSeconds - realRemainingSeconds);
  const elapsedMin = Math.floor(elapsedSeconds / 60);
  const elapsedSec = elapsedSeconds % 60;
  const timeUsedStr = `${elapsedMin}分${elapsedSec}秒`;

  let outcomeLabel = '正常归档 (指挥长手动结束)';
  let outcomeBadgeColor = '#94a3b8';
  let outcomeDesc = '推演由指挥长主动终止归档，本次攻防对抗全流程数据已封存留痕。';

  if (outcomeType === 'SUCCESS' || score >= 95) {
    outcomeLabel = '推演圆满成功 (达成卓越公信力)';
    outcomeBadgeColor = '#ffb800';
    outcomeDesc = '最终政府公信力得分达标（≥95分），各部门协同通报与线下处置严谨高效，谣言得到权威压制。';
  } else if (outcomeType === 'FAILED' || score < 60) {
    outcomeLabel = '推演失守告负 (公信力跌破红线)';
    outcomeBadgeColor = '#ff2a5f';
    outcomeDesc = '政府公信力跌破60分警戒红线，自媒体谣言严重恶性蔓延失控，官方响应滞后失据。';
  }

  // 统计攻防分值
  const redAttacks = confrontations.map(c => c.red).filter(Boolean);
  const totalPenalty = redAttacks.reduce((acc, r) => acc + (Number(r.penalty) || 0), 0);

  const blueDefenses = [];
  confrontations.forEach(c => {
    if (c.blues) blueDefenses.push(...c.blues);
  });
  const totalRestored = blueDefenses.reduce((acc, b) => acc + (Number(b.delta) || 0), 0);

  const report = {
    id: 'RPT-' + Date.now(),
    scriptId: script.id || 'JB-FIRE-20250408',
    scriptName: script.name || '突发火灾爆燃与网络造谣处置演练',
    scriptType: script.typeName || '重大突发应急实战',
    generatedTime: `${dateStr} ${timeStr}`,
    durationMinutes,
    timeUsedStr,
    timeSpeed: script.timeSpeed || 24,
    finalScore: score,
    outcomeType,
    outcomeLabel,
    outcomeBadgeColor,
    outcomeDesc,
    totalPenalty,
    totalRestored,
    confrontations,
    chatMessages,
    seats,
    assessmentConclusion: score >= 95 
      ? '【卓越】信息核实与权威通报响应敏捷，线上线下双向闭环协同严密，有效把握住了舆论引导第一定义权。' 
      : (score >= 80 
        ? '【良好】处置过程较为平稳，但在前中期伤亡底数核实与记者现场探访疏导上略有拖延，仍有提速空间。' 
        : '【需整改】官方权威发声严重滞后于社交网络爆料发酵，关键信息公开透明度不足导致谣言滋生，需彻底健全多部门联席应急通报机制。')
  };

  try {
    localStorage.setItem('last_drill_report', JSON.stringify(report));
  } catch (e) {
    console.error('Storage save error:', e);
  }

  return report;
}

// 刷新大厅上次复盘报告按钮显示
function updateLobbyReportButton() {
  const dock = document.getElementById('lobbyLastReportDock');
  const badge = document.getElementById('lobbyLastScoreBadge');
  if (!dock) return;

  const saved = localStorage.getItem('last_drill_report');
  if (saved) {
    try {
      const r = JSON.parse(saved);
      dock.style.display = 'inline-flex';
      if (badge) {
        badge.textContent = `${r.finalScore}分 · ${r.outcomeType === 'SUCCESS' ? '成功' : (r.outcomeType === 'FAILED' ? '失败' : '完成')}`;
        badge.style.color = r.outcomeType === 'SUCCESS' ? '#ffb800' : (r.outcomeType === 'FAILED' ? '#ff2a5f' : '#00f0ff');
      }
    } catch {
      dock.style.display = 'none';
    }
  } else {
    dock.style.display = 'none';
  }
}

// 大厅入口查看上次复盘
function previewLastDrillReport() {
  const saved = localStorage.getItem('last_drill_report');
  if (!saved) {
    alert('暂无上一次演练的复盘战报记录，请先开启并完成一局实战演练！');
    return;
  }
  try {
    const report = JSON.parse(saved);
    openDebriefReportModal(report);
  } catch (e) {
    alert('复盘报告数据解析异常：' + e.message);
  }
}

// 打开复盘报告模态框
function openDebriefReportModal(report = null) {
  const data = report || currentDebriefReportData || generateDrillDebriefReport('ENDED');
  currentDebriefReportData = data;

  const overlay = document.getElementById('overlayDebriefReport');
  const contentArea = document.getElementById('debriefReportContentArea');
  const titleEl = document.getElementById('reportModalTitle');
  const subEl = document.getElementById('reportModalSub');

  if (!overlay || !contentArea) return;

  if (titleEl) titleEl.textContent = `📑 ${data.scriptName} · 推演复盘汇总报告`;
  if (subEl) subEl.textContent = `生成时间: ${data.generatedTime} · 真实耗时: ${data.timeUsedStr} · 时间倍速: ${data.timeSpeed}.0x`;

  // 渲染红蓝席位列表
  const seats = data.seats || {};
  const redSeats = Object.values(seats).filter(s => s.camp === 'red');
  const blueSeats = Object.values(seats).filter(s => s.camp === 'blue');

  const redSeatsList = redSeats.map(s => `<span class="badge-report-red">👤 ${s.name} (${s.user || '已参演'})</span>`).join(' ') || '无记录';
  const blueSeatsList = blueSeats.map(s => `<span class="badge-report-blue">${s.isCommander ? '👑' : '🏛️'} ${s.name} (${s.user || '已参演'})</span>`).join(' ') || '无记录';

  // 渲染对抗节点表格行
  const cfList = data.confrontations || [];
  const tableRows = cfList.map((c, idx) => {
    const r = c.red || {};
    const blues = c.blues || [];
    const blueStr = blues.map(b => `<div>🏛️ <b>${b.role}</b>: ${b.title || b.statement} <b style="color:var(--pc-cyan);">(+${b.delta}分)</b></div>`).join('') || '<span style="color:#ffb800;">⚠️ 暂无应对处置</span>';

    return `
      <tr>
        <td style="font-weight:700; color:var(--pc-cyan);">#${idx + 1}</td>
        <td>${c.time || '18:57'}</td>
        <td>
          <div style="font-weight:600; color:#ff6b8b;">${r.role || '红方角色'} <span class="badge-report-red">${r.penalty || -15}分</span></div>
          <div style="color:#cbd5e1; margin-top:2px;">${r.content || ''}</div>
          ${r.assetName ? `<div style="font-size:10px; color:#ff99ab;">🎬 关联物证: ${r.assetName}</div>` : ''}
        </td>
        <td>${blueStr}</td>
      </tr>
    `;
  }).join('') || '<tr><td colspan="4" style="text-align:center; color:#64748b;">本场演练暂无对抗记录</td></tr>';

  // 渲染点点密信记录摘要
  const msgs = (data.chatMessages || []).slice(-8);
  const msgHtml = msgs.map(m => `
    <div style="font-size:11px; padding:4px 8px; background:rgba(255,255,255,0.03); border-radius:4px;">
      <span style="color:var(--pc-cyan); font-weight:600;">${m.senderName}:</span>
      <span style="color:#e2e8f0;">${m.content}</span>
      <span style="color:#64748b; font-size:9.5px; margin-left:6px;">${m.time || ''}</span>
    </div>
  `).join('') || '<div style="color:#64748b; font-size:11px;">无密信调度记录</div>';

  contentArea.innerHTML = `
    <!-- 1. 核心指标卡片四宫格 -->
    <div class="report-kpi-grid">
      <div class="report-kpi-card" style="border-color:${data.outcomeBadgeColor};">
        <div class="report-kpi-val" style="color:${data.outcomeBadgeColor};">${data.finalScore} <span style="font-size:13px;">分</span></div>
        <div class="report-kpi-label">最终政府公信力得分</div>
      </div>
      <div class="report-kpi-card">
        <div class="report-kpi-val" style="font-size:18px; color:#fff; line-height:32px;">${data.outcomeLabel.slice(0, 6)}</div>
        <div class="report-kpi-label">综合演练推演判定</div>
      </div>
      <div class="report-kpi-card">
        <div class="report-kpi-val" style="color:#ff6b8b;">${data.totalPenalty} <span style="font-size:13px;">分</span></div>
        <div class="report-kpi-label">红方舆情施压累计扣分</div>
      </div>
      <div class="report-kpi-card">
        <div class="report-kpi-val" style="color:var(--pc-cyan);">+${data.totalRestored} <span style="font-size:13px;">分</span></div>
        <div class="report-kpi-label">蓝方官方处置挽回得分</div>
      </div>
    </div>

    <!-- 2. 推演判定与专家建议 -->
    <div class="report-section-card">
      <div class="report-section-title">
        <span>🎯</span>
        <span>综合判定结论与督导建议</span>
      </div>
      <div style="font-size:12.5px; color:#cbd5e1; line-height:1.6;">
        <strong style="color:${data.outcomeBadgeColor};">【结论分析】</strong>${data.outcomeDesc}
      </div>
      <div style="font-size:12.5px; color:#cbd5e1; line-height:1.6; margin-top:4px;">
        <strong style="color:var(--pc-gold);">【专家建议】</strong>${data.assessmentConclusion}
      </div>
    </div>

    <!-- 3. 参演席位出勤台账 -->
    <div class="report-section-card">
      <div class="report-section-title">
        <span>👥</span>
        <span>参演各方席位到岗明细</span>
      </div>
      <div style="font-size:11.5px; line-height:1.8;">
        <div style="color:#ff6b8b; font-weight:600; margin-bottom:4px;">🔴 红方舆情施压阵营席位：</div>
        <div style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:8px;">${redSeatsList}</div>
        <div style="color:var(--pc-cyan); font-weight:600; margin-bottom:4px;">🔵 蓝方官方协同处置阵营席位：</div>
        <div style="display:flex; flex-wrap:wrap; gap:6px;">${blueSeatsList}</div>
      </div>
    </div>

    <!-- 4. 攻防全景复盘数据表 -->
    <div class="report-section-card">
      <div class="report-section-title">
        <span>⚔️</span>
        <span>攻防推演全过程对抗事件复盘清单 (${cfList.length} 个节点)</span>
      </div>
      <div style="overflow-x:auto;">
        <table class="report-data-table">
          <thead>
            <tr>
              <th style="width:40px;">序号</th>
              <th style="width:70px;">虚拟时间</th>
              <th style="width:45%;">红方进攻贴文与物证 (负向施压)</th>
              <th style="width:45%;">蓝方官方应对响应措施 (公信力挽回)</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </div>
    </div>

    <!-- 5. 点点密信指挥记录留痕 -->
    <div class="report-section-card">
      <div class="report-section-title">
        <span>💬</span>
        <span>点点密信应急专班调度指令留痕 (最近8条)</span>
      </div>
      <div style="display:flex; flex-direction:column; gap:6px;">
        ${msgHtml}
      </div>
    </div>
  `;

  overlay.style.display = 'flex';
}

function closeDebriefReportModal() {
  const overlay = document.getElementById('overlayDebriefReport');
  if (overlay) overlay.style.display = 'none';
}

// 下载当前复盘战报
function downloadCurrentDebriefReport() {
  const data = currentDebriefReportData || generateDrillDebriefReport('ENDED');
  downloadDebriefReportAsHtml(data);
}

// 下载上次复盘战报 (大厅入口)
function downloadLastDrillReport() {
  const saved = localStorage.getItem('last_drill_report');
  if (!saved) {
    alert('暂无上一次演练的复盘战报记录！');
    return;
  }
  try {
    const data = JSON.parse(saved);
    downloadDebriefReportAsHtml(data);
  } catch (e) {
    alert('战报数据异常：' + e.message);
  }
}

// 生成便携式离线独立 HTML 战报文档并下载
function downloadDebriefReportAsHtml(data) {
  if (!data) return;

  const cfRows = (data.confrontations || []).map((c, i) => {
    const r = c.red || {};
    const blues = (c.blues || []).map(b => `<div><b>🏛️ ${b.role}:</b> ${b.title || b.statement} (+${b.delta}分)</div>`).join('') || '官方应对中';
    return `
      <tr>
        <td style="text-align:center;">${i + 1}</td>
        <td>${c.time || '18:57'}</td>
        <td>
          <b style="color:#d92d50;">${r.role || '红方'}:</b> ${r.content || ''}
          ${r.assetName ? `<div style="font-size:11px; color:#888;">🎬 物证: ${r.assetName}</div>` : ''}
          <span style="color:#d92d50; font-weight:bold;">(${r.penalty || -15}分)</span>
        </td>
        <td style="color:#0284c7;">${blues}</td>
      </tr>
    `;
  }).join('');

  const htmlContent = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>舆情百战演练平台 · 复盘报告 - ${data.scriptName}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", sans-serif; background:#f8fafc; color:#1e293b; margin:0; padding:30px; }
    .report-wrap { max-width: 920px; margin: 0 auto; background: #fff; padding: 36px 42px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
    .header { border-bottom: 2px solid #0284c7; padding-bottom: 16px; margin-bottom: 24px; display:flex; justify-content:space-between; align-items:flex-end; }
    .title { font-size: 24px; font-weight: 800; color: #0f172a; margin: 0; }
    .meta { font-size: 12px; color: #64748b; margin-top: 6px; }
    .kpi-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 24px; }
    .kpi-box { background: #f1f5f9; padding: 14px; border-radius: 6px; text-align: center; }
    .kpi-val { font-size: 28px; font-weight: 900; color: #0284c7; }
    .kpi-label { font-size: 11px; color: #64748b; margin-top: 4px; }
    .section-title { font-size: 15px; font-weight: 700; color: #0f172a; margin: 24px 0 10px 0; border-left: 4px solid #0284c7; padding-left: 10px; }
    .box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px; line-height: 1.6; font-size: 13px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 8px; }
    th { background: #f1f5f9; text-align: left; padding: 8px 10px; border: 1px solid #cbd5e1; font-weight: 700; }
    td { padding: 8px 10px; border: 1px solid #e2e8f0; line-height: 1.45; }
    @media print { body { padding:0; background:#fff; } .report-wrap { box-shadow:none; border:none; padding:0; } }
  </style>
</head>
<body>
  <div class="report-wrap">
    <div class="header">
      <div>
        <h1 class="title">🛡️ 舆情百战演练平台 · 实战对抗推演复盘汇总报告</h1>
        <div class="meta">剧本编号: [${data.scriptId}] · 剧本名称: ${data.scriptName} · 生成时间: ${data.generatedTime}</div>
      </div>
      <div style="font-size:12px; color:#64748b; text-align:right;">
        演练耗时: <b>${data.timeUsedStr}</b><br>
        推进倍速: <b>${data.timeSpeed}.0x</b>
      </div>
    </div>

    <div class="kpi-row">
      <div class="kpi-box">
        <div class="kpi-val" style="color:${data.finalScore >= 95 ? '#d97706' : (data.finalScore < 60 ? '#dc2626' : '#0284c7')};">${data.finalScore} 分</div>
        <div class="kpi-label">最终政府公信力得分</div>
      </div>
      <div class="kpi-box">
        <div class="kpi-val" style="font-size:18px; line-height:36px; color:#0f172a;">${data.outcomeLabel.slice(0, 6)}</div>
        <div class="kpi-label">推演判定结论</div>
      </div>
      <div class="kpi-box">
        <div class="kpi-val" style="color:#dc2626;">${data.totalPenalty} 分</div>
        <div class="kpi-label">红方舆情施压扣分</div>
      </div>
      <div class="kpi-box">
        <div class="kpi-val" style="color:#0284c7;">+${data.totalRestored} 分</div>
        <div class="kpi-label">蓝方官方处置挽回分</div>
      </div>
    </div>

    <div class="section-title">一、 综合演练判定与督导结论</div>
    <div class="box">
      <p style="margin:0 0 6px 0;"><b>【结论判定】</b> ${data.outcomeDesc}</p>
      <p style="margin:0;"><b>【专家改进建议】</b> ${data.assessmentConclusion}</p>
    </div>

    <div class="section-title">二、 双方攻防对抗事件全景复盘表</div>
    <table>
      <thead>
        <tr>
          <th style="width:40px; text-align:center;">序号</th>
          <th style="width:70px;">推演时间</th>
          <th style="width:45%;">红方舆情攻击内容与物证</th>
          <th style="width:45%;">蓝方官方协同应对处置措施</th>
        </tr>
      </thead>
      <tbody>
        ${cfRows}
      </tbody>
    </table>

    <div style="margin-top:32px; padding-top:16px; border-top:1px dashed #cbd5e1; font-size:11px; color:#94a3b8; display:flex; justify-content:space-between;">
      <span>报告出具单位: 市委网信办监测专班 / 舆情百战实战演练系统</span>
      <span>权威存档凭据 · 密级: 内部工作演练</span>
    </div>
  </div>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safeTitle = (data.scriptName || '演练').replace(/[/\\?%*:|"<>]/g, '_');
  a.href = url;
  a.download = `舆情百战推演复盘汇总报告_${safeTitle}_${new Date().toISOString().slice(0, 10)}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToastNotice('📥 复盘汇总报告已成功下载！');
}

// 页面微提示
function showToastNotice(text) {
  console.log('[PC Notice]', text);
}
