/**
 * H5 移动端交互脚本 · 方案A 赛博红蓝对抗
 * 核心特性：
 * 1. 扫码选择红蓝阵营不同席位角色，根据当前处置阶段动态配发展示对应角色的进攻内容（红方）或处置措施（蓝方）；
 * 2. 红方展示预设视频/多模态素材与专属攻击项（如“云朵儿”发布火灾视频）；
 * 3. 蓝方展示正向高效防守与失当推诿防守走向（如“区应急管理局”疏散/推诿）；
 * 4. 严密阵营隔离：只有蓝方才有点点密信聊天群，红方无点点密信；
 * 5. 演练结束后，全员弹出演练成功/失败结果，锁定所有操作禁止再次点击。
 */
import '../../styles/common/cyber-base.css';
import '../../styles/modules/mobile.css';
import { drillEngine } from '../../core/sync-engine.js';
import { getDrillCartridges } from '../../data/cartridges/index.js';
import { showToast } from '../../components/common/toast.js';

let myCurrentSeat = null;
let currentViewingStageIndex = 0;
let executedActionIds = new Set();
let isDrillFinishedLock = false;
let isCombatActive = false; // 是否开启作战 (PC作战室 drillStatus === 'RUNNING')
let prevDrillStatus = null; // 记录前一个演练状态

document.addEventListener('DOMContentLoaded', () => {
  initMobileTabs();
  initUrlParamsAndSeat();
  initSocialFreePost();
  initMobileChat();

  if (window.drillEngine) {
    window.drillEngine.subscribe((state, action, payload) => {
      renderMobileView(state);
    });
    renderMobileView(window.drillEngine.getState());
  }
});

// ==================== 1. 选项卡与阵营隔离 ====================

function initMobileTabs() {
  const tabs = document.querySelectorAll('.m-tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const target = tab.dataset.target;
      switchMobileView(target);
    });
  });
}

function switchMobileView(target) {
  const isRed = myCurrentSeat?.camp === 'red';

  // 隐藏所有视图
  const views = ['viewRedActions', 'viewBlueActions', 'viewIM', 'viewSocialFree', 'viewClues'];
  views.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  if (target === 'stage_actions') {
    if (isRed) {
      document.getElementById('viewRedActions').style.display = 'block';
    } else {
      document.getElementById('viewBlueActions').style.display = 'block';
    }
  } else if (target === 'im') {
    // 只有蓝方才允许打开点点密信
    if (!isRed) {
      document.getElementById('viewIM').style.display = 'flex';
      const dot = document.getElementById('mImBadgeDot');
      if (dot) dot.style.display = 'none';
    }
  } else if (target === 'social_free') {
    document.getElementById('viewSocialFree').style.display = 'block';
  } else if (target === 'clues') {
    document.getElementById('viewClues').style.display = 'block';
  }
}

// ==================== 2. 席位认领与阵营切换 ====================

function initUrlParamsAndSeat() {
  const urlParams = new URLSearchParams(window.location.search);
  const camp = urlParams.get('camp');
  const roleParam = urlParams.get('role') || urlParams.get('seat');
  const savedSeatId = localStorage.getItem('m_saved_seat_id');

  let targetSeatId = null;

  if (roleParam) {
    targetSeatId = roleParam;
  } else if (camp === 'blue') {
    targetSeatId = 'blue_emergency'; // 蓝方默认：区应急管理局·王科长
  } else if (camp === 'red') {
    targetSeatId = 'red_cloud'; // 红方默认：抖音网民“云朵儿”
  } else if (savedSeatId) {
    targetSeatId = savedSeatId;
  } else {
    targetSeatId = 'red_cloud';
  }

  selectRole(targetSeatId, true);
}

function selectRole(seatId, isInit = false) {
  if (!window.drillEngine) return;
  const state = window.drillEngine.getState();
  const seat = state.seats[seatId];
  if (!seat) return;

  myCurrentSeat = seat;
  localStorage.setItem('m_saved_seat_id', seat.id);

  const userName = seat.user || ('学员·' + seat.name.slice(0, 3));
  window.drillEngine.claimRole(seatId, userName);

  // 1. 更新顶部席位信息
  const avatarEl = document.getElementById('mCurrentRoleAvatar');
  const titleEl = document.getElementById('mCurrentRoleTitle');
  const campEl = document.getElementById('mCurrentRoleCampText');

  if (avatarEl) avatarEl.textContent = seat.avatar || (seat.camp === 'red' ? '📱' : '🛡️');
  if (titleEl) titleEl.textContent = seat.name;
  if (campEl) {
    if (seat.camp === 'red') {
      campEl.textContent = `【红方阵营】${seat.platform || '网络发酵造谣施压'}`;
      campEl.style.color = '#ff6b8b';
    } else {
      campEl.textContent = `【蓝方阵营】${seat.department || '官方协同应急处置'}`;
      campEl.style.color = '#00f0ff';
    }
  }

  // 2. 阵营隔离逻辑：只有蓝方才有点点密信聊天群！
  const imTab = document.getElementById('mtab_im');
  const freeTab = document.getElementById('mtab_social_free');
  const actionTab = document.getElementById('mtab_stage_actions');
  const clueTab = document.getElementById('mtab_clues');

  if (seat.camp === 'red') {
    // 红方：隐藏点点密信群，展示自由发帖Tab
    if (imTab) imTab.style.display = 'none';
    if (freeTab) freeTab.style.display = 'block';
    if (actionTab) actionTab.textContent = '⚔️ 阶段进攻行动';
  } else {
    // 蓝方：显示点点密信群，隐藏自由爆料Tab
    if (imTab) imTab.style.display = 'block';
    if (freeTab) freeTab.style.display = 'none';
    if (actionTab) actionTab.textContent = '🛡️ 阶段处置防守';
  }

  // 3. 更新身份与指引线索卡
  updateClueCardContent(seat);

  // 4. 重置视图：在PC作战室未开启作战时，H5端只能查看当前身份，还不能作战！
  const isRunning = state?.drillStatus === 'RUNNING';
  if (!isRunning && clueTab) {
    clueTab.click(); // 未开战时，默认定位到“查看当前身份与态势”
  } else if (actionTab) {
    actionTab.click(); // 已开战时，直接进入作战行动
  }
  closeRoleSelectSheet();

  // 重新渲染攻防内容与状态
  renderCurrentStageCombatCards(state);
}

function updateClueCardContent(seat) {
  const clueName = document.getElementById('mClueRoleName');
  const clueDesc = document.getElementById('mClueRoleDesc');
  const clueGuide = document.getElementById('mClueGuideContent');

  if (clueName) {
    clueName.textContent = `【${seat.camp === 'red' ? '红方' : '蓝方'}】${seat.name}`;
  }
  if (clueDesc) {
    if (seat.camp === 'red') {
      clueDesc.textContent = `立场：红方舆论施压方 · 平台归属：${seat.platform || '短视频/社交媒体'}。任务：依据火灾事故各阶段现场素材，持续制造舆论声浪与煽动猜疑，削弱官方公信力。`;
    } else {
      clueDesc.textContent = `所属单位：${seat.department || '应急指挥专班'} · 职责角色：${seat.role}。任务：参与点点密信跨部门应急协同，研判真伪核查前线死伤，依法发布通报辟谣挽回公信力。`;
    }
  }
  if (clueGuide) {
    if (seat.camp === 'red') {
      clueGuide.innerHTML = `
        <div>1. 本阶段进攻行动：点击【⚔️ 阶段进攻行动】，使用剧本配置好的现场视频与爆料发起进攻。</div>
        <div>2. 自由爆料发帖：可在【📢 自由爆料发帖】中自主编写造谣煽动文案，推入PC作战中枢时间轴。</div>
        <div>3. 核心目标：在演练结束前将政府公信力打压跌破 60 分警戒红线，即可判定红方胜利！</div>
        <div style="color:#ff6b8b; margin-top:4px;">⚠️ 注意：红方无权加入内部点点密信专班群。</div>
      `;
    } else {
      clueGuide.innerHTML = `
        <div>1. 本阶段处置防守：点击【🛡️ 阶段处置防守】，选择正向协同或推诿扯皮措施，主导事态走向。</div>
        <div>2. 点点密信指挥群：点击【💬 点点密信指挥群】，接收指挥长指令、哨兵机器人警报与协同汇报。</div>
        <div>3. 核心目标：保持各阶段信息公开与通报辟谣，确保公信力始终保持在 80 分以上直至演练成功！</div>
      `;
    }
  }
}

function openRoleSelectSheet() {
  const modal = document.getElementById('roleSheetModal');
  if (!modal || !window.drillEngine) return;

  const state = window.drillEngine.getState();
  const seats = state.seats || {};
  const stage = getCurrentStage(state);

  const redList = document.getElementById('sheetRedList');
  const blueList = document.getElementById('sheetBlueList');

  // 获取各角色在当前阶段的攻防任务简要提示
  const getRoleStageTaskHint = (seat) => {
    if (!stage) return '';
    if (seat.camp === 'red') {
      if (seat.id === 'red_cloud') return '阶段一：发布居民楼爆燃实拍视频 (MP4)';
      if (seat.id === 'red_live') return '阶段一：发布火势十米高有人挥毛巾';
      if (seat.id === 'red_owner') return '阶段二：曝光私家车堵死消防生命通道';
      if (seat.id === 'red_reporter') return '阶段二：直播采访遇阻引发全网声讨';
      if (seat.id === 'red_parents') return '阶段三：质疑补课黑产业链带节奏';
      if (seat.id === 'red_xiaofei') return '阶段四：造谣担架抬出20多人';
      if (seat.id === 'red_huahua') return '阶段四：恶性造谣据说死了50人';
      if (seat.id === 'red_family') return '阶段三/四：家属情绪激动维权要说法';
      return '依阶段发起网络爆料与舆论施压';
    } else {
      if (seat.id === 'blue_commander') return '阶段一：点点密信内部指令督导应急消防';
      if (seat.id === 'blue_emergency') return '阶段一：疏散现场人员展开内攻 / 推诿扯皮';
      if (seat.id === 'blue_fire') return '阶段一：高喷车内攻 / 阶段二：破拆违停车辆';
      if (seat.id === 'blue_police') return '阶段二：交通管制 / 阶段四：拘留造谣大V';
      if (seat.id === 'blue_spokesman') return '阶段二：首期伤亡通报 / 阶段五：发布会答问';
      if (seat.id === 'blue_health') return '阶段三：连夜入驻医院 / 阶段四：公布救治名册';
      if (seat.id === 'blue_housing') return '阶段三：查封物业维保台账移交纪检';
      if (seat.id === 'blue_street') return '阶段三：一户一专班深入关怀善后';
      return '协同跨部门联合处置与信息研判';
    }
  };

  if (redList) {
    redList.innerHTML = Object.values(seats).filter(s => s.camp === 'red').map(s => {
      const isCurrent = myCurrentSeat?.id === s.id;
      const taskHint = getRoleStageTaskHint(s);
      return `
        <div style="background:#131d36; padding:9px; border-radius:8px; border:1.5px solid ${isCurrent ? '#ff2a5f' : '#2b3954'}; cursor:pointer; position:relative; transition:all 0.2s;" onclick="selectRole('${s.id}')">
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <span style="font-size:20px;">${s.avatar || '📱'}</span>
            ${isCurrent ? '<span style="font-size:9.5px; background:#ff2a5f; color:#fff; font-weight:700; padding:2px 5px; border-radius:3px;">当前席位</span>' : '<span style="font-size:9.5px; color:#ff809b; border:1px solid rgba(255,107,139,0.3); padding:1px 4px; border-radius:3px;">点击切换</span>'}
          </div>
          <div style="font-size:12px; font-weight:700; color:#fff; margin-top:5px;">${s.name}</div>
          <div style="font-size:10px; color:#ff99ab; margin-top:2px;">${s.platform || '红方爆料'}</div>
          <div style="font-size:9.5px; color:#94a3b8; margin-top:4px; line-height:1.3; background:rgba(0,0,0,0.25); padding:3px 5px; border-radius:4px;">
            📌 ${taskHint}
          </div>
        </div>
      `;
    }).join('');
  }

  if (blueList) {
    blueList.innerHTML = Object.values(seats).filter(s => s.camp === 'blue').map(s => {
      const isCurrent = myCurrentSeat?.id === s.id;
      const taskHint = getRoleStageTaskHint(s);
      return `
        <div style="background:#131d36; padding:9px; border-radius:8px; border:1.5px solid ${isCurrent ? '#00f0ff' : '#2b3954'}; cursor:pointer; position:relative; transition:all 0.2s;" onclick="selectRole('${s.id}')">
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <span style="font-size:20px;">${s.avatar || '🏛️'}</span>
            ${isCurrent ? '<span style="font-size:9.5px; background:#00f0ff; color:#000; font-weight:700; padding:2px 5px; border-radius:3px;">当前席位</span>' : '<span style="font-size:9.5px; color:#00f0ff; border:1px solid rgba(0,240,255,0.3); padding:1px 4px; border-radius:3px;">点击切换</span>'}
          </div>
          <div style="font-size:12px; font-weight:700; color:#fff; margin-top:5px;">${s.name}</div>
          <div style="font-size:10px; color:#00f0ff; margin-top:2px;">${s.department || '官方处置'}</div>
          <div style="font-size:9.5px; color:#94a3b8; margin-top:4px; line-height:1.3; background:rgba(0,0,0,0.25); padding:3px 5px; border-radius:4px;">
            🛡️ ${taskHint}
          </div>
        </div>
      `;
    }).join('');
  }

  modal.style.display = 'flex';
}

function closeRoleSelectSheet() {
  const modal = document.getElementById('roleSheetModal');
  if (modal) modal.style.display = 'none';
}

// ==================== 3. 动态加载剧本与阶段攻防卡片 ====================

function getCurrentCartridge() {
  const state = window.drillEngine ? window.drillEngine.getState() : null;
  const scriptId = state?.activeScriptId || 'JB-FIRE-20250408';
  if (typeof window.getDrillCartridges === 'function') {
    const list = window.getDrillCartridges();
    const found = list.find(s => s.id === scriptId);
    if (found) return found;
    if (list.length > 0) return list[0];
  }
  return window.DEFAULT_DRILL_CARTRIDGES ? window.DEFAULT_DRILL_CARTRIDGES[0] : null;
}

function getCurrentStage(state) {
  const cartridge = getCurrentCartridge();
  if (!cartridge || !cartridge.stages || cartridge.stages.length === 0) return null;
  const stageIdx = state?.room?.stageIndex !== undefined ? state.room.stageIndex : currentViewingStageIndex;
  currentViewingStageIndex = stageIdx;
  return cartridge.stages[stageIdx] || cartridge.stages[0];
}

// 角色匹配辅助函数
function isMatchRedRole(itemRole, seat) {
  if (!itemRole || !seat) return false;
  const sName = seat.name || '';
  const sRole = seat.role || '';
  return itemRole.includes(sName) || sName.includes(itemRole) ||
         itemRole.includes(sRole) || sRole.includes(itemRole) ||
         (seat.id === 'red_cloud' && itemRole.includes('云朵儿')) ||
         (seat.id === 'red_xiaofei' && itemRole.includes('小飞飞')) ||
         (seat.id === 'red_huahua' && itemRole.includes('花花的世界')) ||
         (seat.id === 'red_live' && (itemRole.includes('现场') || itemRole.includes('快手') || itemRole.includes('群众'))) ||
         (seat.id === 'red_reporter' && (itemRole.includes('记者') || itemRole.includes('红星'))) ||
         (seat.id === 'red_parents' && itemRole.includes('家长')) ||
         (seat.id === 'red_owner' && (itemRole.includes('业主') || itemRole.includes('居民'))) ||
         (seat.id === 'red_family' && (itemRole.includes('家属') || itemRole.includes('遇难')));
}

function isMatchBlueRole(itemRole, seat) {
  if (!itemRole || !seat) return false;
  const sName = seat.name || '';
  const sRole = seat.role || '';
  const sDept = seat.department || '';
  return itemRole.includes(sName) || sName.includes(itemRole) ||
         itemRole.includes(sRole) || sRole.includes(itemRole) ||
         itemRole.includes(sDept) || sDept.includes(itemRole) ||
         (seat.id === 'blue_commander' && (itemRole.includes('指挥长') || itemRole.includes('网信办'))) ||
         (seat.id === 'blue_emergency' && itemRole.includes('应急')) ||
         (seat.id === 'blue_fire' && itemRole.includes('消防')) ||
         (seat.id === 'blue_police' && (itemRole.includes('公安') || itemRole.includes('交警') || itemRole.includes('警情'))) ||
         (seat.id === 'blue_health' && (itemRole.includes('卫健') || itemRole.includes('医院') || itemRole.includes('救治'))) ||
         (seat.id === 'blue_housing' && (itemRole.includes('住建') || itemRole.includes('安监'))) ||
         (seat.id === 'blue_street' && (itemRole.includes('街道') || itemRole.includes('社区'))) ||
         (seat.id === 'blue_spokesman' && (itemRole.includes('发言人') || itemRole.includes('调查组') || itemRole.includes('常务副区长')));
}

// 核心渲染：根据当前阶段与席位生成攻防卡片
function renderCurrentStageCombatCards(state) {
  const stage = getCurrentStage(state);
  if (!stage) return;

  const isRed = myCurrentSeat?.camp === 'red';
  const status = state?.drillStatus;
  const isRunning = status === 'RUNNING';
  isCombatActive = isRunning;

  // 1. 更新顶部阶段条
  const headerTitle = document.getElementById('mStageHeaderTitle');
  const scoreBadge = document.getElementById('mStageScoreBadge');
  const stageDesc = document.getElementById('mStageDescText');

  if (!isRunning && !isDrillFinishedLock) {
    if (headerTitle) headerTitle.textContent = '⏳ 战备就绪 · 等待PC作战室开启实战';
    if (scoreBadge) {
      scoreBadge.textContent = '待命中';
      scoreBadge.className = 'm-stage-score-badge';
    }
    if (stageDesc) {
      stageDesc.textContent = `您已就绪席位【${myCurrentSeat?.name || '当前角色'}】。当前PC作战室未开启实战，只能查看身份还不能作战。作战室点击【开始演练】后将自动激活！`;
    }
  } else {
    if (headerTitle) headerTitle.textContent = stage.name;
    if (stageDesc) stageDesc.textContent = stage.summary || '双方红蓝多轮博弈攻防正在进行中...';

    const score = state?.battle?.credibilityScore !== undefined ? state.battle.credibilityScore : 100;
    if (scoreBadge) {
      scoreBadge.textContent = `公信力 ${score}分`;
      if (score < 60) {
        scoreBadge.className = 'm-stage-score-badge danger';
      } else {
        scoreBadge.className = 'm-stage-score-badge';
      }
    }
  }

  // 2. 检查已执行对抗记录，标记已发出的卡片
  if (state?.timelineConfrontations) {
    state.timelineConfrontations.forEach(c => {
      if (c.red && c.red.id) executedActionIds.add(c.red.id);
      if (c.blues) c.blues.forEach(b => { if (b.id) executedActionIds.add(b.id); });
    });
  }

  // 3. 渲染红方进攻卡片
  if (isRed) {
    renderRedStageCards(stage, state);
  } else {
    renderBlueStageCards(stage, state);
  }

  // 4. 渲染后台配置全员席位在该阶段的任务与快速切换卡片
  renderAllRolesOverview(stage, state);
}

// 渲染红方当前阶段进攻
function renderRedStageCards(stage, state) {
  const exclusiveContainer = document.getElementById('redRoleExclusiveList');
  const collabContainer = document.getElementById('redRoleCollabList');
  if (!exclusiveContainer || !collabContainer) return;

  // 汇集当前阶段所有红方进攻项
  const allRedAttacks = [];

  if (stage.confrontations) {
    stage.confrontations.forEach(cf => {
      if (cf.red) allRedAttacks.push(Object.assign({}, cf.red, { cfId: cf.id }));
    });
  }

  if (stage.redCamp?.posts) {
    stage.redCamp.posts.forEach(p => {
      if (!allRedAttacks.some(a => a.id === p.id)) {
        allRedAttacks.push(p);
      }
    });
  }

  const exclusiveList = [];
  const collabList = [];

  allRedAttacks.forEach(att => {
    if (isMatchRedRole(att.role || att.author, myCurrentSeat)) {
      exclusiveList.push(att);
    } else {
      collabList.push(att);
    }
  });

  const renderCard = (att, isExclusive = false) => {
    const isExecuted = executedActionIds.has(att.id);
    const hasVideo = att.assetId === 'AST-001' || (att.assetName && att.assetName.includes('视频'));
    const penalty = att.penalty || -15;

    let mediaHtml = '';
    if (hasVideo) {
      mediaHtml = `
        <div class="m-media-box">
          <div class="m-media-tag">🎬 剧本配置素材视频 (MP4·居民楼爆燃实拍)</div>
          <video src="./media/fire_material_video.mp4" controls playsinline preload="metadata" poster="https://images.unsplash.com/photo-1542385151-efd9000785a0?w=400" class="m-media-video"></video>
        </div>
      `;
    } else if (att.assetName) {
      mediaHtml = `
        <div class="m-media-box" style="padding:6px 10px; font-size:11px; color:#ff99ab;">
          📸 剧本配置多模态素材：${att.assetName}
        </div>
      `;
    }

    let btnClass = '';
    let btnDisabled = false;
    let btnText = '';

    if (isDrillFinishedLock) {
      btnClass = 'disabled-locked';
      btnDisabled = true;
      btnText = '🔒 演练已结束 (操作锁定)';
    } else if (!isCombatActive) {
      btnClass = 'btn-waiting-drill';
      btnDisabled = true;
      btnText = '⏳ 等待PC作战室开启实战推演...';
    } else if (isExecuted) {
      btnClass = 'btn-executed';
      btnDisabled = false;
      btnText = '✅ 进攻已发动 (发酵生效中)';
    } else {
      btnClass = '';
      btnDisabled = false;
      btnText = '🔥 立即发布该项进攻 (注入作战中枢)';
    }

    return `
      <div class="m-action-card m-action-card-red ${isExclusive ? 'exclusive-card' : ''}">
        <div class="m-card-head">
          <span class="m-card-badge ${isExclusive ? 'm-card-badge-exclusive' : 'm-card-badge-platform'}">
            ${isExclusive ? '⭐ 本席位专属进攻' : `👤 ${att.role || '红方角色'}`}
          </span>
          <span class="m-card-badge m-card-badge-platform">
            ${att.platform || '抖音短视频'} · ${att.trendingRank || '冲击热搜'}
          </span>
        </div>

        <div class="m-card-title">${att.title || (hasVideo ? '发布火灾现场爆料视频' : '突发网络发酵舆论施压')}</div>
        <div class="m-card-body-text">${att.content || '现场浓烟遮天蔽日，逃生居民惊慌哭泣...'}</div>

        ${mediaHtml}

        <div class="m-card-impact-row" style="justify-content: flex-end;">
          <span style="color:#788aa6; font-size:11px;">${isExecuted ? '● 进攻已发动生效' : (!isCombatActive ? '⏳ 待命中' : '● 待发起攻势')}</span>
        </div>

        <button class="m-action-btn btn-cyber-red action-executable-btn ${btnClass}" 
                ${btnDisabled ? 'disabled' : ''}
                onclick="triggerRedAttack('${att.id}', '${escapeQuotes(att.content)}', ${penalty}, '${escapeQuotes(att.role || myCurrentSeat?.name)}', '${escapeQuotes(att.platform)}', '${escapeQuotes(att.assetName)}')">
          ${btnText}
        </button>
      </div>
    `;
  };

  exclusiveContainer.innerHTML = exclusiveList.length > 0 
    ? exclusiveList.map(item => renderCard(item, true)).join('')
    : `<div style="padding:12px; text-align:center; color:#788aa6; font-size:11.5px; background:rgba(0,0,0,0.25); border-radius:6px;">本阶段当前席位待命中，可协同友军发起下方攻势。</div>`;

  collabContainer.innerHTML = collabList.length > 0
    ? collabList.map(item => renderCard(item, false)).join('')
    : `<div style="padding:10px; text-align:center; color:#64748b; font-size:11px;">暂无其他协同红方攻势</div>`;
}

// 渲染蓝方当前阶段防守措施 (学员移动端不展示走向与分值增减)
function renderBlueStageCards(stage, state) {
  const exclusiveContainer = document.getElementById('blueRoleExclusiveList');
  const collabContainer = document.getElementById('blueRoleCollabList');
  if (!exclusiveContainer || !collabContainer) return;

  const allBlueMeasures = [];

  if (stage.blueCamp?.measures) {
    stage.blueCamp.measures.forEach(m => allBlueMeasures.push(m));
  }

  if (stage.confrontations) {
    stage.confrontations.forEach(cf => {
      if (cf.blues) {
        cf.blues.forEach(b => {
          if (!allBlueMeasures.some(m => m.id === b.id)) {
            allBlueMeasures.push(Object.assign({}, b, { targetCfId: cf.id }));
          }
        });
      }
    });
  }

  const exclusiveList = [];
  const collabList = [];

  allBlueMeasures.forEach(m => {
    if (isMatchBlueRole(m.role, myCurrentSeat)) {
      exclusiveList.push(m);
    } else {
      collabList.push(m);
    }
  });

  const renderCard = (m, isExclusive = false) => {
    const isExecuted = executedActionIds.has(m.id);
    const isNegative = m.type === 'negative' || (m.delta && m.delta < 0);
    const delta = m.delta !== undefined ? m.delta : (isNegative ? -15 : 10);

    let btnClass = '';
    let btnDisabled = false;
    let btnText = '';

    if (isDrillFinishedLock) {
      btnClass = 'disabled-locked';
      btnDisabled = true;
      btnText = '🔒 演练已结束 (操作锁定)';
    } else if (!isCombatActive) {
      btnClass = 'btn-waiting-drill';
      btnDisabled = true;
      btnText = '⏳ 等待PC作战室开启实战推演...';
    } else if (isExecuted) {
      btnClass = 'btn-executed';
      btnDisabled = false;
      btnText = '✅ 措施已执行 (已同步至中枢)';
    } else {
      btnClass = isNegative ? 'btn-cyber-red' : 'btn-cyber';
      btnDisabled = false;
      btnText = '🛡️ 报送并执行处置措施';
    }

    return `
      <div class="m-action-card m-action-card-blue ${isNegative ? 'negative-branch' : ''} ${isExclusive ? 'exclusive-card' : ''}">
        <div class="m-card-head">
          <span class="m-card-badge m-card-badge-platform">
            ${m.role || myCurrentSeat?.department || '协同部门'}
          </span>
          ${isExclusive ? '<span class="m-card-badge m-card-badge-exclusive">⭐ 本席位专属行动</span>' : ''}
        </div>

        <div class="m-card-title">${m.title || '前线应急处置响应与核实'}</div>
        <div class="m-card-body-text">
          ${m.statement || m.desc || '迅速落实处置职责，反馈伤亡核查材料，强化信息研判权威发布。'}
        </div>

        <div class="m-card-impact-row" style="justify-content: flex-end;">
          <span style="color:#788aa6; font-size:11px;">${isExecuted ? '● 措施已执行上报' : (!isCombatActive ? '⏳ 待命中' : '● 待执行上报')}</span>
        </div>

        <button class="m-action-btn action-executable-btn ${btnClass}"
                ${btnDisabled ? 'disabled' : ''}
                onclick="triggerBlueDefense('${m.id}', '${escapeQuotes(m.title)}', '${escapeQuotes(m.statement || m.desc)}', ${delta}, '${escapeQuotes(m.role || myCurrentSeat?.name)}', '${m.targetCfId || ''}')">
          ${btnText}
        </button>
      </div>
    `;
  };

  exclusiveContainer.innerHTML = exclusiveList.length > 0
    ? exclusiveList.map(item => renderCard(item, true)).join('')
    : `<div style="padding:12px; text-align:center; color:#788aa6; font-size:11.5px; background:rgba(0,0,0,0.25); border-radius:6px;">本阶段当前席位未配置独立行动，可协同各部门执行下方措施。</div>`;

  collabContainer.innerHTML = collabList.length > 0
    ? collabList.map(item => renderCard(item, false)).join('')
    : `<div style="padding:10px; text-align:center; color:#64748b; font-size:11px;">暂无其他协同部门措施</div>`;
}

// 渲染后台剧本配置的全部席位在该阶段的任务概览，并支持直接切换进入对应人员视角
function renderAllRolesOverview(stage, state) {
  const isRed = myCurrentSeat?.camp === 'red';
  const container = document.getElementById(isRed ? 'redAllRolesOverview' : 'blueAllRolesOverview');
  if (!container || !state?.seats) return;

  const targetCamp = isRed ? 'red' : 'blue';
  const seatsList = Object.values(state.seats).filter(s => s.camp === targetCamp);

  const getRoleStageDesc = (seat) => {
    if (!stage) return '待命中';
    if (seat.camp === 'red') {
      if (seat.id === 'red_cloud') return '【阶段一】发布火灾现场实况视频 (MP4)，冲击热搜 Top 1';
      if (seat.id === 'red_live') return '【阶段一】发布火势窜起十米高有人挥白毛巾';
      if (seat.id === 'red_owner') return '【阶段二】发布私家车堵塞消防通道现场照片';
      if (seat.id === 'red_reporter') return '【阶段二】红星新闻直播被抢设备引发采访声讨';
      if (seat.id === 'red_parents') return '【阶段三】正义家长联盟质疑黑产补课发酵';
      if (seat.id === 'red_xiaofei') return '【阶段四】评论区造谣担架抬出20多个死伤惨重';
      if (seat.id === 'red_huahua') return '【阶段四】微博大V恶性造谣“据说死了50人”';
      if (seat.id === 'red_family') return '【阶段三/四】家属群聚集声讨要说法';
      return '依处置阶段发起网络舆情攻击';
    } else {
      if (seat.id === 'blue_commander') return '【阶段一】点点密信内部指令督导应急消防核查伤亡';
      if (seat.id === 'blue_emergency') return '【阶段一】现场疏散群众展开内攻 / 以非本管辖推诿扯皮';
      if (seat.id === 'blue_fire') return '【阶段一】高喷车内攻灭火 / 【阶段二】破拆移位阻障车辆';
      if (seat.id === 'blue_police') return '【阶段二】交通管制疏导 / 【阶段四】依法行政拘留造谣大V';
      if (seat.id === 'blue_spokesman') return '【阶段二】首期伤亡权威通报 / 【阶段五】新闻发布会致歉答问';
      if (seat.id === 'blue_health') return '【阶段三】一户一专班入驻医院 / 【阶段四】公布真实救治名册';
      if (seat.id === 'blue_housing') return '【阶段三】查封物业维保台账移交纪检监察立案';
      if (seat.id === 'blue_street') return '【阶段三】深入社区群众开展温情抚慰善后';
      return '跨部门应急协同与官方通报发布';
    }
  };

  container.innerHTML = seatsList.map(s => {
    const isCurrent = myCurrentSeat?.id === s.id;
    const taskDesc = getRoleStageDesc(s);
    return `
      <div style="background:#0e162b; border:1px solid ${isCurrent ? (isRed ? '#ff2a5f' : '#00f0ff') : 'rgba(255,255,255,0.08)'}; border-radius:6px; padding:8px 10px; display:flex; justify-content:space-between; align-items:center;">
        <div style="display:flex; align-items:center; gap:8px; flex:1; overflow:hidden;">
          <span style="font-size:20px;">${s.avatar || (isRed ? '📱' : '🏛️')}</span>
          <div style="flex:1; overflow:hidden;">
            <div style="display:flex; align-items:center; gap:6px;">
              <span style="font-size:12px; font-weight:700; color:#fff;">${s.name}</span>
              ${isCurrent ? `<span style="font-size:9px; background:${isRed ? '#ff2a5f' : '#00f0ff'}; color:${isRed ? '#fff' : '#000'}; font-weight:700; padding:1px 4px; border-radius:2px;">当前视角</span>` : ''}
            </div>
            <div style="font-size:10px; color:#94a3b8; margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${taskDesc}</div>
          </div>
        </div>
        <button class="btn-cyber ${isRed ? 'btn-cyber-red' : ''}" style="padding:3px 8px; font-size:10px; white-space:nowrap; margin-left:8px;" onclick="selectRole('${s.id}')">
          ${isCurrent ? '当前视角' : '进入该视角 ❯'}
        </button>
      </div>
    `;
  }).join('');
}

function escapeQuotes(str) {
  if (!str) return '';
  return String(str).replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

// ==================== 4. 触发进攻与处置执行 ====================

function triggerRedAttack(id, content, penalty, role, platform, assetName) {
  if (isDrillFinishedLock) {
    alert('🔒 演练已结束，操作已锁定！');
    return;
  }
  if (!isCombatActive) {
    alert('⏳ 作战尚未开始！\nPC作战室未开启作战时，H5端只能查看当前身份，还不能作战。请等待PC作战室指挥长点击【开始演练】！');
    return;
  }
  if (!window.drillEngine) return;

  executedActionIds.add(id);

  const postData = {
    id: id || ('RP-' + Date.now()),
    role: role || myCurrentSeat?.name || '抖音网民“云朵儿”',
    author: role || myCurrentSeat?.name || '抖音网民“云朵儿”',
    platform: platform || myCurrentSeat?.platform || '抖音短视频',
    content: content || '突发火灾现场爆料实况！',
    penalty: Number(penalty || -15),
    assetName: assetName || (id === 'RP-101' ? '火灾现场实况视频 (MP4)' : '现场实拍'),
    trendingRank: 'Top 1 (爆)'
  };

  window.drillEngine.postRedCombat(postData);

  alert(`🔥 进攻发动成功！\n以【${postData.role}】身份发布爆料，政府公信力已扣除 ${Math.abs(postData.penalty)} 分，PC 作战中枢与大屏已同步更新！`);
  renderCurrentStageCombatCards(window.drillEngine.getState());
}

function triggerBlueDefense(id, title, statement, delta, role, targetCfId) {
  if (isDrillFinishedLock) {
    alert('🔒 演练已结束，操作已锁定！');
    return;
  }
  if (!isCombatActive) {
    alert('⏳ 作战尚未开始！\nPC作战室未开启作战时，H5端只能查看当前身份，还不能作战。请等待PC作战室指挥长点击【开始演练】！');
    return;
  }
  if (!window.drillEngine) return;

  executedActionIds.add(id);

  const measureData = {
    id: id || ('BM-' + Date.now()),
    role: role || myCurrentSeat?.name || '区应急管理局指挥调度席',
    roleId: myCurrentSeat?.id || 'blue_emergency',
    title: title || '应急处置响应',
    statement: statement || '前线处置工作全力推进中。',
    delta: Number(delta !== undefined ? delta : 10),
    branchName: delta > 0 ? '正向高效处置' : '失当迟滞应对'
  };

  window.drillEngine.executeBlueMeasure(measureData, targetCfId || null);

  const prefix = delta >= 0 ? '✅ 处置报送成功！公信力挽回 +' + delta + '分' : '⚠️ 已执行失当应对！公信力扣减 ' + delta + '分';
  alert(`${prefix}\n已通过点点密信内部通报，并推入 PC 作战中枢时间轴！`);
  renderCurrentStageCombatCards(window.drillEngine.getState());
}

// ==================== 5. 自由发帖与点点密信 ====================

function initSocialFreePost() {
  const postBtn = document.getElementById('mPublishSocialBtn');
  const inputEl = document.getElementById('mSocialInput');
  const isRumorCheck = document.getElementById('mIsRumorCheck');

  if (postBtn && inputEl) {
    postBtn.addEventListener('click', () => {
      if (isDrillFinishedLock) {
        alert('🔒 演练已结束，操作已锁定！');
        return;
      }
      if (!isCombatActive) {
        alert('⏳ 作战尚未开始！PC作战室未开启作战时，H5端只能查看当前身份还不能作战。请等待PC作战室开启实战！');
        return;
      }
      const text = inputEl.value.trim();
      if (!text) {
        alert('请输入发帖爆料具体文案！');
        return;
      }

      if (window.drillEngine) {
        const isRumor = isRumorCheck ? isRumorCheck.checked : true;
        const penalty = isRumor ? -15 : -8;
        const author = myCurrentSeat ? myCurrentSeat.name : '抖音网民“云朵儿”';

        window.drillEngine.postRedCombat({
          id: 'RP-' + Date.now(),
          role: author,
          author: author,
          platform: myCurrentSeat?.platform || '抖音短视频',
          content: text,
          penalty: penalty,
          assetName: '学员现场自主撰写',
          trendingRank: 'Top 2 (沸)'
        });

        alert('🔥 发帖成功！已同步推入 PC 作战中枢时间轴，哨兵机器人已在群内告警！');
      }
      inputEl.value = '';
    });
  }
}

function initMobileChat() {
  const sendBtn = document.getElementById('mSendChatBtn');
  const inputEl = document.getElementById('mChatInput');

  const send = () => {
    if (isDrillFinishedLock) {
      alert('🔒 演练已结束，操作已锁定！');
      return;
    }
    if (!isCombatActive) {
      alert('⏳ 作战尚未开始！PC作战室未开启作战时还不能报送作战指令。请等待PC作战室开启实战！');
      return;
    }
    const text = inputEl.value.trim();
    if (!text) return;
    if (window.drillEngine) {
      const roleName = myCurrentSeat ? myCurrentSeat.name : '协同处置席位';
      const roleId = myCurrentSeat ? myCurrentSeat.id : 'blue_dept';
      window.drillEngine.sendChatMessage(roleId, roleName, myCurrentSeat?.avatar || '🏛️', 'BLUE', text);
    }
    inputEl.value = '';
  };

  if (sendBtn && inputEl) {
    sendBtn.addEventListener('click', send);
    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') send();
    });
  }

  // 快捷气泡报送
  window.quickSendChip = function(type) {
    if (isDrillFinishedLock) {
      alert('🔒 演练已结束，操作已锁定！');
      return;
    }
    if (!isCombatActive) {
      alert('⏳ 作战尚未开始！PC作战室未开启作战时，H5端只能查看当前身份还不能作战。请等待PC作战室开启实战！');
      return;
    }
    if (!window.drillEngine) return;
    let title = '';
    let content = '';
    let delta = 10;

    if (type === 'casualty') {
      title = '【前线伤亡核实】现场彻底搜救完毕，实核死5伤12人';
      content = '报告指挥部！现场搜救全部完毕，经与定点医院对接，死亡5人、轻伤12人，绝非网传30人！';
      delta = 10;
    } else if (type === 'cause') {
      title = '【起火原因勘验】电动车违规飞线爆燃';
      content = '技术勘验证实：系1单元违规私拉电线为电动车蓄电池充电引发热失控爆燃，监控已提取。';
      delta = 10;
    } else if (type === 'passage') {
      title = '【通道排障通报】占道私家车已全部拖离';
      content = '交警铁骑已强制拖离违停阻碍车辆3台，现场救援通道已全面恢复畅通。';
      delta = 10;
    } else if (type === 'doc') {
      title = '【官方通报发布】《火灾搜救与基本情况通报》';
      content = '选用附件一通报模板对外正式发布，权威公布伤亡数据与处置进展。';
      delta = 15;
    }

    window.drillEngine.executeBlueMeasure({
      id: 'BM-' + Date.now(),
      role: myCurrentSeat ? myCurrentSeat.name : '区消防救援大队',
      roleId: myCurrentSeat ? myCurrentSeat.id : 'blue_fire',
      title: title,
      statement: content,
      delta: delta,
      branchName: '正向有效应对'
    });

    alert('✅ 处置措施已报送并同步推入作战室！公信力恢复 +' + delta + '分。');
  };
}

// ==================== 6. 演练结束全盘锁定与结果弹窗 ====================

function checkDrillEndStatus(state) {
  if (!state) return;
  const status = state.drillStatus;
  const score = state.battle?.credibilityScore !== undefined ? state.battle.credibilityScore : 100;

  const isEnded = status === 'ENDED' || status === 'SUCCESS' || status === 'FAILED' || score < 60;

  const modal = document.getElementById('modalDrillEndedResult');
  const dialog = document.getElementById('mResultDialogBox');
  const badgeIcon = document.getElementById('mResultBadgeIcon');
  const titleEl = document.getElementById('mResultTitle');
  const scoreVal = document.getElementById('mResultScoreVal');
  const descEl = document.getElementById('mResultDesc');

  if (isEnded) {
    isDrillFinishedLock = true;

    // 锁定页面所有操作按钮
    document.querySelectorAll('.action-executable-btn, .m-action-btn, #mPublishSocialBtn, #mSendChatBtn, .m-chip-btn').forEach(btn => {
      btn.disabled = true;
      btn.classList.add('disabled-locked');
    });
    document.querySelectorAll('textarea, input').forEach(inp => {
      inp.disabled = true;
    });

    // 判断是成功还是失败
    const isSuccess = (status === 'SUCCESS' || (status === 'ENDED' && score >= 80)) && score >= 60;

    if (modal && modal.style.display !== 'flex') {
      modal.style.display = 'flex';
    }

    if (dialog) {
      dialog.className = `m-result-dialog ${isSuccess ? 'success' : 'failed'}`;
    }
    if (badgeIcon) {
      badgeIcon.textContent = isSuccess ? '🏆' : '💥';
    }
    if (titleEl) {
      titleEl.className = `m-result-title ${isSuccess ? 'success' : 'failed'}`;
      titleEl.textContent = isSuccess ? '实战推演圆满结束 · 演练成功！' : '实战推演遗憾结束 · 演练失败！';
    }
    if (scoreVal) {
      scoreVal.textContent = `${score} 分`;
      scoreVal.style.color = isSuccess ? '#00f0ff' : '#ff2a5f';
    }
    if (descEl) {
      if (isSuccess) {
        descEl.innerHTML = `
          <strong>【演练平稳着陆】</strong> 蓝方应急响应迅捷，网信联合各部门30分钟内完成伤亡初核，权威发布官方公函驳斥谣言，拘留造谣账号，成功化解突发火灾舆情危机！
        `;
      } else {
        descEl.innerHTML = `
          <strong>【公信力崩塌】</strong> 舆情发生后部分单位推诿迟滞，谣言虚构重大伤亡并在社交网络产生海啸级发酵，政府公信力跌破安全警戒红线！
        `;
      }
    }
  } else {
    // 处于正常推演或大厅态，解除锁定
    isDrillFinishedLock = false;
    if (modal) modal.style.display = 'none';
    document.querySelectorAll('.action-executable-btn, .m-action-btn, #mPublishSocialBtn, #mSendChatBtn, .m-chip-btn').forEach(btn => {
      btn.disabled = false;
      btn.classList.remove('disabled-locked');
    });
    document.querySelectorAll('textarea, input').forEach(inp => {
      inp.disabled = false;
    });
  }
}

function closeDrillResultModal() {
  const modal = document.getElementById('modalDrillEndedResult');
  if (modal) modal.style.display = 'none';
}

// ==================== 7. 全局消息流与动态渲染 ====================

function renderMobileView(state) {
  if (!state) return;

  const currentStatus = state.drillStatus;
  const isRunning = currentStatus === 'RUNNING';

  // 1. 监测 PC 作战室开启作战的瞬间唤醒
  if (prevDrillStatus !== 'RUNNING' && isRunning) {
    isCombatActive = true;
    showToastNotice('⚔️ PC作战室已下达作战指令！实战推演正式开启，所有角色立即开始作战！');

    // 自动切回作战行动主舱
    const actionTab = document.getElementById('mtab_stage_actions');
    if (actionTab) actionTab.click();
  } else if (!isRunning) {
    isCombatActive = false;
  }
  prevDrillStatus = currentStatus;

  // 2. 更新身份与态势线索卡中的作战状态指示
  updateDrillStatusPrompt(state);

  // 3. 攻防卡片渲染
  renderCurrentStageCombatCards(state);

  // 4. 演练结束判定与锁定
  checkDrillEndStatus(state);

  // 5. 点点密信消息流渲染 (仅蓝方)
  const msgContainer = document.getElementById('mIMMsgList');
  if (msgContainer && state.chatMessages) {
    msgContainer.innerHTML = state.chatMessages.map(m => {
      const isMine = myCurrentSeat && m.senderId === myCurrentSeat.id;
      const isBot = m.role === 'BOT';

      return `
        <div class="m-msg-item ${isMine ? 'mine' : ''}" style="${isBot ? 'background:rgba(255,42,95,0.12); border:1px solid rgba(255,42,95,0.3); border-radius:6px; padding:6px;' : ''}">
          <div style="font-size:22px;">${m.avatar || '👤'}</div>
          <div style="flex:1;">
            <div style="font-size:10px; color:${isBot ? '#ff6b8b' : '#788aa6'}; margin-bottom:2px; ${isMine ? 'text-align:right;' : ''}">
              ${m.senderName} ${m.time || ''}
            </div>
            <div class="m-bubble" style="${isBot ? 'background:transparent; color:#ffccd5;' : ''}">${m.content}</div>
          </div>
        </div>
      `;
    }).join('');
    msgContainer.scrollTop = msgContainer.scrollHeight;
  }

  // 6. 攻防社交动态列表 (自由发帖流)
  const socialList = document.getElementById('mSocialPostList');
  if (socialList && state.timelineConfrontations) {
    socialList.innerHTML = state.timelineConfrontations.map(c => {
      const red = c.red || {};
      return `
        <div class="social-card">
          <div class="social-meta">
            <div class="social-avatar">${red.avatar || '📱'}</div>
            <div style="flex:1;">
              <div style="font-size:13px; font-weight:bold; color:#ff6b8b;">${red.role || '网络发酵账号'}</div>
              <div style="font-size:10px; color:#687b96;">${c.time || '18:57'} · ${red.platform || '网络'}</div>
            </div>
            <span style="font-size:11px; color:#ff2a5f; font-weight:700;">${red.penalty || -15}分</span>
          </div>
          <div style="font-size:13px; color:#e0e8f5; line-height:1.5; margin-bottom:8px;">${red.content || ''}</div>
          ${red.assetName ? `<div style="font-size:11px; color:#ff99ab; margin-bottom:6px;">🎬 ${red.assetName}</div>` : ''}
        </div>
      `;
    }).join('');
  }
}

// 更新身份与态势页面中的作战状态卡片
function updateDrillStatusPrompt(state) {
  const card = document.getElementById('mDrillStatusPromptCard');
  const icon = document.getElementById('mDrillStatusPromptIcon');
  const title = document.getElementById('mDrillStatusPromptTitle');
  const desc = document.getElementById('mDrillStatusPromptDesc');
  if (!card || !title || !desc) return;

  const status = state?.drillStatus;
  const isRunning = status === 'RUNNING';
  const score = state?.battle?.credibilityScore !== undefined ? state.battle.credibilityScore : 100;
  const isEnded = status === 'ENDED' || status === 'SUCCESS' || status === 'FAILED' || score < 60;

  if (isEnded) {
    card.style.background = 'rgba(255, 42, 95, 0.12)';
    card.style.borderColor = 'rgba(255, 42, 95, 0.5)';
    if (icon) icon.textContent = '🔒';
    title.textContent = '实战推演已结束 · 操作已锁定';
    title.style.color = '#ff2a5f';
    desc.textContent = '本场演练已圆满结束或终局归档，全员手机端进入只读回顾模式，操作权限已全面锁定。';
  } else if (isRunning) {
    card.style.background = 'rgba(0, 230, 118, 0.12)';
    card.style.borderColor = 'rgba(0, 230, 118, 0.5)';
    if (icon) icon.textContent = '⚔️';
    title.textContent = '实战推演进行中 · 攻防权限已激活';
    title.style.color = '#00e676';
    desc.textContent = 'PC指挥作战室已下达实战指令！请迅速前往【阶段攻防行动】发起攻势或执行防守应对！';
  } else {
    card.style.background = 'rgba(255, 184, 0, 0.12)';
    card.style.borderColor = 'rgba(255, 184, 0, 0.5)';
    if (icon) icon.textContent = '⏳';
    title.textContent = '作战室待命就绪 · 暂未开启作战';
    title.style.color = '#ffb800';
    desc.textContent = `您已成功就绪席位【${myCurrentSeat?.name || '当前角色'}】。当前PC作战室未开启作战，您只能查看当前身份与准则，还不能作战。作战室点击【开始演练】后将自动激活！`;
  }
}

// 手机端赛博轻提示 (Toast)
function showToastNotice(msg) {
  let toast = document.getElementById('mToastNotice');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'mToastNotice';
    toast.style.position = 'fixed';
    toast.style.top = '50px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.background = 'linear-gradient(135deg, rgba(0,240,255,0.92), rgba(0,119,255,0.95))';
    toast.style.color = '#000';
    toast.style.fontWeight = '800';
    toast.style.fontSize = '12px';
    toast.style.padding = '8px 16px';
    toast.style.borderRadius = '20px';
    toast.style.boxShadow = '0 0 25px rgba(0,240,255,0.8)';
    toast.style.zIndex = '99999';
    toast.style.transition = 'all 0.3s ease';
    toast.style.pointerEvents = 'none';
    toast.style.whiteSpace = 'nowrap';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  toast.style.top = '55px';

  clearTimeout(window._toastTimeout);
  window._toastTimeout = setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.top = '30px';
  }, 3500);
}
