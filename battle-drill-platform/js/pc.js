/**
 * 舆情百战演练平台 · PC作战中枢控制器 (PS主机平台风格 + 角色准备室 + 红蓝作战室)
 * 极致性能优化 + 复盘汇总报告 (在线预览与HTML下载) + 状态机闭环生命周期
 */

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

  currentStageIndex = newStageIndex;

  const tagEl = document.getElementById('warCurrentStageTag');
  if (tagEl) tagEl.textContent = nextStage.name;

  const fishboneTag = document.getElementById('fishboneActiveStageBadge');
  if (fishboneTag) fishboneTag.textContent = nextStage.name;

  // 核心：调用状态机 setDrillStage，实时核算各阶段公信力与红蓝对抗指标，全端同步
  if (window.drillEngine) {
    window.drillEngine.setDrillStage(newStageIndex);
  }

  renderCredibilityAndFists();
  renderFishboneTimeline(true);
  renderVirtualProgressTracker();
  showToastNotice(`🚀 演练阶段已推进至：${nextStage.name}！公信力与攻防态势已实时更新。`);
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

// 4.3 渲染公信力双拳与动态数字动效
let currentDisplayedScore = 92;
let scoreAnimationTimer = null;

function animateScoreNumber(targetScore) {
  const scoreEl = document.getElementById('warCredScoreVal');
  if (!scoreEl) return;

  targetScore = Math.max(0, Math.min(100, Math.round(targetScore)));
  if (currentDisplayedScore === targetScore) {
    scoreEl.textContent = targetScore;
    return;
  }

  if (scoreAnimationTimer) clearInterval(scoreAnimationTimer);

  const startScore = currentDisplayedScore;
  const startTime = performance.now();
  const duration = 500;

  scoreAnimationTimer = setInterval(() => {
    const elapsed = performance.now() - startTime;
    const progress = Math.min(1, elapsed / duration);
    const ease = 1 - (1 - progress) * (1 - progress);
    const val = Math.round(startScore + (targetScore - startScore) * ease);
    scoreEl.textContent = val;

    if (progress >= 1) {
      clearInterval(scoreAnimationTimer);
      currentDisplayedScore = targetScore;
      scoreEl.textContent = targetScore;
    }
  }, 20);
}

function renderCredibilityAndFists() {
  const state = window.drillEngine ? window.drillEngine.getState() : { battle: { credibilityScore: 92 } };
  const score = state.battle.credibilityScore !== undefined ? state.battle.credibilityScore : 92;

  animateScoreNumber(score);

  // 动态更新红蓝负向施压与处置挽回分值
  const redPenaltyEl = document.getElementById('warRedPenaltyVal');
  const blueRestoreEl = document.getElementById('warBlueRestoreVal');

  const redPenalty = state.battle.redPenalty !== undefined ? state.battle.redPenalty : -25;
  const blueRestore = state.battle.blueRestore !== undefined ? state.battle.blueRestore : 20;

  if (redPenaltyEl) {
    redPenaltyEl.textContent = `负向施压 ${redPenalty} 分`;
  }
  if (blueRestoreEl) {
    blueRestoreEl.textContent = `处置挽回 +${blueRestore} 分`;
  }

  const badgeEl = document.getElementById('warCredibilityBadge');
  const ratingEl = document.getElementById('warCredRatingLabel');
  const noticeEl = document.getElementById('warAlertNoticeText');

  // 判定区间与红色预警
  if (badgeEl) {
    if (score >= 60 && score <= 80) {
      if (!badgeEl.classList.contains('alert-flashing')) badgeEl.classList.add('alert-flashing');
      if (noticeEl) noticeEl.innerHTML = '<b style="color:#ff2a5f;">🚨 红色预警！公信力陷入危机警戒区！</b>';
    } else {
      if (badgeEl.classList.contains('alert-flashing')) badgeEl.classList.remove('alert-flashing');
      if (score > 80) {
        if (noticeEl) noticeEl.innerHTML = '<span style="color:#00e676;">● 态势稳定，公信力保持在安全高位</span>';
      } else {
        if (noticeEl) noticeEl.innerHTML = '<b style="color:#ff2a5f;">❌ 彻底崩塌！公信力已跌破安全警戒红线！</b>';
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

function escapeQuotes(str) {
  if (!str) return '';
  return String(str)
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '&quot;')
    .replace(/\n/g, ' ')
    .replace(/\r/g, '');
}

// 4.4 渲染横向鱼骨图攻防时序图谱 (上红攻下蓝防 · 鱼刺时序骨骼)
function renderFishboneTimeline(force = false) {
  const state = window.drillEngine ? window.drillEngine.getState() : {};
  const confrontations = state.timelineConfrontations || [];
  const viewport = document.getElementById('timelineScrollViewport');
  if (!viewport) return;

  if (isTimelineDragging && !force) return;

  const checksum = confrontations.map(c => `${c.id}_${c.red ? 'R' : ''}_${c.blues?.length || 0}`).join('|');
  if (!force && checksum === lastTimelineChecksum) {
    return;
  }
  lastTimelineChecksum = checksum;

  const isNewItemAdded = confrontations.length > lastTimelineCount;
  lastTimelineCount = confrontations.length;

  if (confrontations.length === 0) {
    viewport.innerHTML = `
      <div style="color:var(--pc-text-muted); font-size:13px; margin:auto; text-align:center; padding:40px;">
        <span style="font-size:28px;">🐟</span><br>
        暂无攻防事件，等待红蓝双方发起时序推演内容...
      </div>
    `;
    return;
  }

  const activeStageId = state.room?.stageId || 'STAGE-01';
  const stageMap = {
    'STAGE-01': '阶段一：初发舆情发现与核实',
    'STAGE-02': '阶段二：现场受阻与初次通报',
    'STAGE-03': '阶段三：家属情绪与次生舆情',
    'STAGE-04': '阶段四：恶性造谣与辟谣执法',
    'STAGE-05': '阶段五：新闻发布会与善后定调'
  };

  const getMiniPlatform = (platform, defaultType = 'red') => {
    const p = platform || '';
    if (p.includes('抖音')) return '<span class="card-mini-platform red">🎵 抖音</span>';
    if (p.includes('微博')) return '<span class="card-mini-platform red">👁️ 微博</span>';
    if (p.includes('快手')) return '<span class="card-mini-platform red">📹 快手</span>';
    if (p.includes('点点密信') || p.includes('指令')) return '<span class="card-mini-platform blue">💬 密信指令</span>';
    if (p.includes('发布会')) return '<span class="card-mini-platform blue">🎤 发布会</span>';
    if (p.includes('通报') || p.includes('官方')) return '<span class="card-mini-platform blue">🏛️ 官方通报</span>';
    return `<span class="card-mini-platform ${defaultType === 'red' ? 'red' : 'blue'}">📢 ${p || (defaultType === 'red' ? '网络平台' : '官方协同')}</span>`;
  };

  const getCleanSummaryText = (text) => {
    if (!text) return '';
    return text.replace(/<[^>]+>/g, '').trim();
  };

  const stageShortNameMap = {
    'STAGE-01': '阶段一',
    'STAGE-02': '阶段二',
    'STAGE-03': '阶段三',
    'STAGE-04': '阶段四',
    'STAGE-05': '阶段五'
  };

  const stageDateMap = {
    'STAGE-01': '04-08',
    'STAGE-02': '04-08',
    'STAGE-03': '04-08',
    'STAGE-04': '04-09',
    'STAGE-05': '04-09'
  };

  const columnsHtml = confrontations.map((c, idx) => {
    const red = c.red || null;
    const blues = (c.blues && c.blues.length > 0) ? c.blues : [];
    const hasRed = !!(red && red.content);
    const hasBlue = blues.length > 0;
    const isNodeActive = c.stageId === activeStageId || idx === confrontations.length - 1;

    // 清理阶段名称：删除阶段后面的具体文字，只保留“阶段一”、“阶段二”等纯净标识
    const rawStageName = c.stageName || stageShortNameMap[c.stageId] || `阶段${idx + 1}`;
    const cleanStageName = rawStageName.includes('：') 
      ? rawStageName.split('：')[0] 
      : (rawStageName.includes(':') ? rawStageName.split(':')[0] : rawStageName);

    // 具体日期与时间展示 (例如 04-08 18:57)
    let dateText = c.date;
    if (!dateText) {
      if (c.stageId === 'STAGE-03') {
        const hour = parseInt(c.time || '00', 10);
        dateText = (hour < 12) ? '04-09' : '04-08';
      } else {
        dateText = stageDateMap[c.stageId] || '04-08';
      }
    }
    const timeText = c.time || '18:57';
    const fullDateTime = `${dateText} ${timeText}`;

    // 1. 上侧红方卡片 (极致轻量化：固定136px，角色标签、时间/得分、2行摘要、媒体缩略角标)
    let redCardHtml = '';
    let redBoneHtml = '';
    if (hasRed) {
      const hasVideo = !!(red.videoUrl || (red.assetName && red.assetName.includes('视频')) || red.assetId === 'AST-001');
      const hasImg = !!(!hasVideo && (red.imgUrl || (red.assetName && (red.assetName.includes('照片') || red.assetName.includes('图')))));
      const videoSrc = red.videoUrl || './media/fire_material_video.mp4';
      const imgSrc = red.imgUrl || './media/cover.png';
      const roleName = red.role || red.author || '网络施压角色';
      const penaltyText = red.penalty ? `${red.penalty}分` : '-15分';
      const summaryText = getCleanSummaryText(red.content || '');

      let mediaThumbBadge = '';
      if (hasVideo) {
        mediaThumbBadge = `
          <div class="card-media-badge red" onclick="event.stopPropagation(); openMediaZoomModal('video', '${videoSrc}', '【红方视频回放】${escapeQuotes(roleName)}')" title="点击播放完整视频">
            <span class="media-badge-icon">▶</span>
            <span class="media-badge-text">现场视频</span>
          </div>
        `;
      } else if (hasImg) {
        mediaThumbBadge = `
          <div class="card-media-badge red" onclick="event.stopPropagation(); openMediaZoomModal('image', '${imgSrc}', '【红方现场图片】${escapeQuotes(roleName)}')" title="点击放大图片">
            <span class="media-badge-icon">🔍</span>
            <span class="media-badge-text">实况图片</span>
          </div>
        `;
      } else {
        mediaThumbBadge = `<span class="card-media-empty"></span>`;
      }

      redCardHtml = `
        <div class="fishbone-card-red" onclick="openFishboneDetail('${c.id}', 'red')" title="点击查看详情与完整通报">
          <div class="fishbone-card-head">
            <div class="fishbone-card-role-wrap">
              <span class="fishbone-card-avatar">${red.avatar || '🔴'}</span>
              <span class="fishbone-card-role-name">${roleName}</span>
              ${getMiniPlatform(red.platform, 'red')}
            </div>
            <div class="fishbone-card-meta-right">
              <span class="fishbone-card-penalty">${penaltyText}</span>
            </div>
          </div>
          <div class="fishbone-card-summary" title="${escapeQuotes(summaryText)}">
            ${summaryText}
          </div>
          <div class="fishbone-card-foot">
            ${mediaThumbBadge}
            <span class="card-expand-link red">详情/全文 ❯</span>
          </div>
        </div>
      `;
      redBoneHtml = `
        <div class="rib-laser-bone bone-down">
          <span class="bone-arrow">▼</span>
        </div>
      `;
    } else {
      // 红方未发布留空：完全不展示任何框和文字，透明安全占位
      redCardHtml = `<div class="fishbone-empty-transparent"></div>`;
      redBoneHtml = `<div class="rib-laser-bone bone-transparent"></div>`;
    }

    // 2. 下侧蓝方卡片 (极致轻量化：固定136px，角色标签、时间/得分、2行摘要、媒体缩略角标)
    let blueCardHtml = '';
    let blueBoneHtml = '';
    if (hasBlue) {
      const b = blues[0];
      const hasVideo = !!(b.videoUrl || (b.assetName && b.assetName.includes('视频')));
      const hasImg = !!(!hasVideo && (b.imgUrl || (b.assetName && (b.assetName.includes('照片') || b.assetName.includes('图')))));
      const videoSrc = b.videoUrl || './media/fire_material_video.mp4';
      const imgSrc = b.imgUrl || './media/cover.png';
      const roleName = b.role || '处置席位';
      const restoreText = `+${b.delta || 10}分`;
      const rawStatement = b.statement || b.desc || '已执行应急处置措施并固定证据';
      const noticeTitle = b.title ? `【${b.title}】` : '';
      const summaryText = getCleanSummaryText(rawStatement);

      let mediaThumbBadge = '';
      if (hasVideo) {
        mediaThumbBadge = `
          <div class="card-media-badge blue" onclick="event.stopPropagation(); openMediaZoomModal('video', '${videoSrc}', '【蓝方处置视频】${escapeQuotes(roleName)}')" title="点击播放完整视频">
            <span class="media-badge-icon">▶</span>
            <span class="media-badge-text">处置视频</span>
          </div>
        `;
      } else if (hasImg) {
        mediaThumbBadge = `
          <div class="card-media-badge blue" onclick="event.stopPropagation(); openMediaZoomModal('image', '${imgSrc}', '【蓝方通报图片】${escapeQuotes(roleName)}')" title="点击放大图片">
            <span class="media-badge-icon">🔍</span>
            <span class="media-badge-text">通报图片</span>
          </div>
        `;
      } else {
        mediaThumbBadge = `<span class="card-media-empty"></span>`;
      }

      blueCardHtml = `
        <div class="fishbone-card-blue" onclick="openFishboneDetail('${c.id}', 'blue')" title="点击查看详情与通报全文">
          <div class="fishbone-card-head">
            <div class="fishbone-card-role-wrap">
              <span class="fishbone-card-avatar">${b.avatar || '🏛️'}</span>
              <span class="fishbone-card-role-name">${roleName}</span>
              ${getMiniPlatform(b.platform || b.category, 'blue')}
            </div>
            <div class="fishbone-card-meta-right">
              <span class="fishbone-card-restore">${restoreText}</span>
            </div>
          </div>
          <div class="fishbone-card-summary" title="${escapeQuotes(noticeTitle + summaryText)}">
            ${noticeTitle ? `<span style="color:#00f0ff; font-weight:700;">${noticeTitle}</span>` : ''}${summaryText}
          </div>
          <div class="fishbone-card-foot">
            ${mediaThumbBadge}
            <span class="card-expand-link blue">查看通报 ❯</span>
          </div>
        </div>
      `;
      blueBoneHtml = `
        <div class="rib-laser-bone bone-up">
          <span class="bone-arrow">▲</span>
        </div>
      `;
    } else {
      // 蓝方未发布留空：完全不展示任何框和文字，透明安全占位
      blueBoneHtml = `<div class="rib-laser-bone bone-transparent"></div>`;
      blueCardHtml = `<div class="fishbone-empty-transparent"></div>`;
    }

    // 3. 中部时间轴节点：具体日期 + 时间与纯净所属阶段紧凑排在一起 (20% 高度区域)
    return `
      <div class="fishbone-vertebra-column ${isNodeActive ? 'active' : ''}" id="fb_node_${c.id}" data-cf-id="${c.id}">
        <!-- 上部鱼刺：红方卡片或留空透明 (严格 40% 视口分配) -->
        <div class="fishbone-rib-upper">
          ${redCardHtml}
          ${redBoneHtml}
        </div>

        <!-- 中部脊椎节点：具体日期与时间 + 所属阶段紧凑排在一起 (严格 20% 视口分配) -->
        <div class="fishbone-vertebra-joint" onclick="focusFishboneNode('fb_node_${c.id}')" title="点击聚焦此节点 · ${fullDateTime} · ${cleanStageName}">
          <div class="vertebra-compact-pill">
            <span class="vertebra-compact-time">📅 ${fullDateTime}</span>
            <span class="vertebra-compact-sep">|</span>
            <span class="vertebra-compact-stage">${cleanStageName}</span>
          </div>
        </div>

        <!-- 下部鱼刺：蓝方卡片或留空透明 (严格 40% 视口分配) -->
        <div class="fishbone-rib-lower">
          ${blueBoneHtml}
          ${blueCardHtml}
        </div>
      </div>
    `;
  }).join('');

  viewport.innerHTML = `
    <div class="fishbone-track">
      <!-- 鱼头源头 -->
      <div class="fishbone-head-hub">
        <div class="fishbone-head-badge">
          <span style="font-size:22px;">🔥</span>
        </div>
        <div class="fishbone-head-label">事发源头 18:57</div>
      </div>

      <!-- 贯穿主鱼骨中轴脊梁 -->
      <div class="fishbone-main-spine"></div>

      <!-- 纵向鱼骨阵列 (严密对齐，节点清晰时序展现) -->
      ${columnsHtml}

      <!-- 鱼尾前沿 -->
      <div class="fishbone-tail-hub">
        <div class="fishbone-tail-badge">
          <span style="font-size:22px;">🎯</span>
        </div>
        <div class="fishbone-tail-label">推演动态前沿</div>
      </div>
    </div>
  `;

  // 顺畅滚至最新前沿
  if (isNewItemAdded && !isTimelineDragging) {
    requestAnimationFrame(() => {
      viewport.scrollTo({ left: viewport.scrollWidth, behavior: 'smooth' });
    });
  }
}

// 聚焦单个鱼骨节点并滚动居中
function focusFishboneNode(nodeId) {
  const node = document.getElementById(nodeId);
  const viewport = document.getElementById('timelineScrollViewport');
  if (node && viewport) {
    const nodeLeft = node.offsetLeft;
    const nodeWidth = node.clientWidth;
    const viewWidth = viewport.clientWidth;
    viewport.scrollTo({
      left: Math.max(0, nodeLeft - viewWidth / 2 + nodeWidth / 2),
      behavior: 'smooth'
    });
    document.querySelectorAll('.fishbone-vertebra-column').forEach(col => col.classList.remove('active'));
    node.classList.add('active');
  }
}

// 兼容别名
function renderHorizontalTimeline(force = false) {
  renderFishboneTimeline(force);
}

// 时间轴横向按钮滚动
function scrollTimeline(direction) {
  const viewport = document.getElementById('timelineScrollViewport');
  if (!viewport) return;
  const distance = direction === 'left' ? -320 : 320;
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

  // 支持鼠标滚轮水平滑动鱼骨图
  viewport.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.preventDefault();
      viewport.scrollLeft += e.deltaY * 1.2;
    }
  }, { passive: false });
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

  // 同步高亮底部阶段快捷按钮
  for (let i = 0; i < 5; i++) {
    const btn = document.getElementById(`pcStageBtn${i}`);
    if (btn) {
      btn.classList.toggle('active', i === currentStageIndex);
    }
  }
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
    if (state.room?.stageIndex !== undefined) {
      currentStageIndex = state.room.stageIndex;
      const tagEl = document.getElementById('warCurrentStageTag');
      if (tagEl && state.room.stageName) tagEl.textContent = state.room.stageName;
      const fishboneTag = document.getElementById('fishboneActiveStageBadge');
      if (fishboneTag && state.room.stageName) fishboneTag.textContent = state.room.stageName;
    }
    renderWarRoomCampSeats();
    renderTrendingBanner();
    renderCredibilityAndFists();
    renderFishboneTimeline();
    renderVirtualProgressTracker();
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

// ==================== 通报全文、密信指令与富媒体抽屉模态弹窗 ====================

window.openFishboneDetail = function(cfId, camp) {
  const state = window.drillEngine ? window.drillEngine.getState() : {};
  const confrontations = state.timelineConfrontations || [];
  const c = confrontations.find(item => item.id === cfId);
  if (!c) return;

  const stageShortNameMap = {
    'STAGE-01': '阶段一',
    'STAGE-02': '阶段二',
    'STAGE-03': '阶段三',
    'STAGE-04': '阶段四',
    'STAGE-05': '阶段五'
  };
  const stageDateMap = {
    'STAGE-01': '04-08',
    'STAGE-02': '04-08',
    'STAGE-03': '04-08',
    'STAGE-04': '04-09',
    'STAGE-05': '04-09'
  };

  const rawStageName = c.stageName || stageShortNameMap[c.stageId] || '推演阶段';
  const cleanStageName = rawStageName.includes('：') 
    ? rawStageName.split('：')[0] 
    : (rawStageName.includes(':') ? rawStageName.split(':')[0] : rawStageName);
  let dateText = c.date;
    if (!dateText) {
      if (c.stageId === 'STAGE-03') {
        const hour = parseInt(c.time || '00', 10);
        dateText = (hour < 12) ? '04-09' : '04-08';
      } else {
        dateText = stageDateMap[c.stageId] || '04-08';
      }
    }
  const timeText = c.time || '18:57';

  if (camp === 'red' && c.red) {
    const red = c.red;
    const hasVideo = !!(red.videoUrl || (red.assetName && red.assetName.includes('视频')) || red.assetId === 'AST-001');
    const hasImg = !!(!hasVideo && (red.imgUrl || (red.assetName && (red.assetName.includes('照片') || red.assetName.includes('图')))));
    const videoSrc = red.videoUrl || './media/fire_material_video.mp4';
    const imgSrc = red.imgUrl || './media/cover.png';
    const roleName = red.role || red.author || '网络发酵施压角色';

    openStatementDetailModal({
      isRed: true,
      avatar: red.avatar || '🔴',
      role: roleName,
      platform: red.platform || '抖音短视频发布',
      date: dateText,
      time: timeText,
      stage: cleanStageName,
      scoreText: red.penalty ? `${red.penalty}分` : '-15分',
      title: `【红方施压通报】${roleName}`,
      content: red.content || '暂无内容',
      hasVideo: hasVideo,
      videoSrc: videoSrc,
      hasImg: hasImg,
      imgSrc: imgSrc
    });
  } else if (camp === 'blue' && c.blues && c.blues.length > 0) {
    const b = c.blues[0];
    const hasVideo = !!(b.videoUrl || (b.assetName && b.assetName.includes('视频')));
    const hasImg = !!(!hasVideo && (b.imgUrl || (b.assetName && (b.assetName.includes('照片') || b.assetName.includes('图')))));
    const videoSrc = b.videoUrl || './media/fire_material_video.mp4';
    const imgSrc = b.imgUrl || './media/cover.png';
    const roleName = b.role || '应急处置席位';

    openStatementDetailModal({
      isRed: false,
      avatar: b.avatar || '🏛️',
      role: roleName,
      platform: b.platform || b.category || '官方协同发布处置',
      date: dateText,
      time: timeText,
      stage: cleanStageName,
      scoreText: `+${b.delta || 10}分`,
      title: b.title || '【官方应急协同处置通报与指令】',
      content: b.statement || b.desc || '已执行应对处置措施并固定证据',
      hasVideo: hasVideo,
      videoSrc: videoSrc,
      hasImg: hasImg,
      imgSrc: imgSrc
    });
  }
};

window.openStatementDetailModal = function(data) {
  const overlay = document.getElementById('overlayStatementDetail');
  const avatarEl = document.getElementById('statementDetailRoleAvatar');
  const titleEl = document.getElementById('statementDetailRoleTitle');
  const metaEl = document.getElementById('statementDetailMeta');
  const headingEl = document.getElementById('statementDetailHeading');
  const fullTextEl = document.getElementById('statementDetailFullText');
  const scoreTagEl = document.getElementById('statementDetailScoreTag');
  const mediaBoxEl = document.getElementById('statementDetailMediaBox');

  if (!overlay) return;

  if (avatarEl) avatarEl.textContent = data.avatar || (data.isRed ? '🔴' : '🏛️');
  if (titleEl) titleEl.textContent = data.role || '发布席位';
  if (metaEl) {
    const dateTime = `${data.date ? data.date + ' ' : ''}${data.time || '18:57'}`;
    metaEl.textContent = `发布平台：${data.platform || '官方通报'} · ⏱️ ${dateTime} · 🚩 ${data.stage || '推演阶段'}`;
  }
  if (headingEl) {
    headingEl.textContent = data.title || '发布通报与处置详情';
    headingEl.style.color = data.isRed ? '#ff6b8b' : '#00f0ff';
  }
  if (fullTextEl) {
    fullTextEl.innerHTML = (data.content || '').replace(/\n/g, '<br>');
  }
  if (scoreTagEl) {
    scoreTagEl.textContent = `公信力影响：${data.scoreText || '+10分'}`;
    scoreTagEl.style.color = data.isRed ? '#ff2a5f' : '#00e676';
  }

  // 富媒体抽屉呈现：视频播放器与大图在此居中完整播放与交互
  if (mediaBoxEl) {
    if (data.hasVideo) {
      mediaBoxEl.style.display = 'block';
      mediaBoxEl.innerHTML = `
        <div style="background:#000; border-radius:6px; overflow:hidden; border:1px solid rgba(0,240,255,0.3); margin-bottom:12px;">
          <div style="padding:4px 8px; font-size:11px; color:#00f0ff; background:rgba(0,240,255,0.1); display:flex; justify-content:space-between; align-items:center;">
            <span>🎬 现场视频素材完整回放 (支持音画控制与全屏播放)</span>
          </div>
          <video src="${data.videoSrc}" controls autoplay playsinline style="width:100%; max-height:280px; display:block; outline:none; background:#000;"></video>
        </div>
      `;
    } else if (data.hasImg) {
      mediaBoxEl.style.display = 'block';
      mediaBoxEl.innerHTML = `
        <div style="background:#000; border-radius:6px; overflow:hidden; border:1px solid rgba(0,240,255,0.3); margin-bottom:12px;">
          <div style="padding:4px 8px; font-size:11px; color:#00f0ff; background:rgba(0,240,255,0.1);">
            <span>🖼️ 实况证据图片 (点击放大)</span>
          </div>
          <img src="${data.imgSrc}" onclick="openMediaZoomModal('image', '${data.imgSrc}', '实况证据放大')" style="width:100%; max-height:260px; object-fit:contain; display:block; cursor:zoom-in;" alt="实况证据" />
        </div>
      `;
    } else {
      mediaBoxEl.style.display = 'none';
      mediaBoxEl.innerHTML = '';
    }
  }

  overlay.style.display = 'flex';
};

window.closeStatementDetailModal = function() {
  const overlay = document.getElementById('overlayStatementDetail');
  if (overlay) overlay.style.display = 'none';
  const mediaBoxEl = document.getElementById('statementDetailMediaBox');
  if (mediaBoxEl) {
    const video = mediaBoxEl.querySelector('video');
    if (video) video.pause();
    mediaBoxEl.innerHTML = '';
  }
};

window.openMediaZoomModal = function(type, src, title) {
  const overlay = document.getElementById('overlayMediaZoom');
  const titleEl = document.getElementById('mediaZoomTitle');
  const bodyEl = document.getElementById('mediaZoomBody');

  if (!overlay || !bodyEl) return;

  if (titleEl) titleEl.textContent = title || '🔍 媒体素材放大查看';

  if (type === 'video') {
    bodyEl.innerHTML = `
      <video src="${src}" controls autoplay playsinline class="media-zoom-video"></video>
    `;
  } else {
    bodyEl.innerHTML = `
      <img src="${src}" class="media-zoom-img" alt="放大查看" />
    `;
  }

  overlay.style.display = 'flex';
};

window.closeMediaZoomModal = function(e) {
  const overlay = document.getElementById('overlayMediaZoom');
  const bodyEl = document.getElementById('mediaZoomBody');
  if (overlay) overlay.style.display = 'none';
  if (bodyEl) {
    // 停止正在播放的视频
    const video = bodyEl.querySelector('video');
    if (video) video.pause();
    bodyEl.innerHTML = '';
  }
};
