/**
 * 舆情百战演练平台 · 赛博红蓝核心跨端同步状态机
 * 基于 BroadcastChannel 与 LocalStorage 保证大屏端、PC作战台、H5移动端、后台管理端毫秒级实时同步
 */

const SYNC_CHANNEL_NAME = 'cyber_battle_drill_sync';

// 初始默认业务状态
const DEFAULT_STATE = {
  activeScriptId: 'JB-FIRE-20250408',
  drillStatus: 'LOBBY', // 'LOBBY' | 'ROSTER' | 'RUNNING' | 'PAUSED' | 'SUCCESS' | 'FAILED' | 'ENDED'
  room: {
    id: 'ROOM-8821',
    name: 'K市P区某居民楼突发火灾爆燃与网络造谣处置演练',
    stageIndex: 0,
    stageId: 'STAGE-01',
    stageName: '阶段一：初发舆情发现与核实',
    speed: 24, // 24.0x 倍速 (1小时=1天)
    virtualTime: '2026-04-08 18:57',
    realRemainingSeconds: 5400, // 90分钟 = 5400秒
    realTotalSeconds: 5400,
    alertLevel: 'BLUE'
  },
  // 红蓝博弈对抗核心指标
  battle: {
    credibilityScore: 100, // 政府公信力 (0~100)
    redPower: 35,
    bluePower: 65,
    redVolume: 8200,
    blueVolume: 15400
  },
  // 角色席位认领状态
  seats: {
    // 蓝方席位
    'blue_commander': {
      id: 'blue_commander',
      name: '网信办指挥长·李主任',
      camp: 'blue',
      role: '市委网信办指挥长',
      department: '市委网信办监测专班',
      isCommander: true,
      assigned: false,
      user: '',
      avatar: '👑'
    },
    'blue_emergency': {
      id: 'blue_emergency',
      name: '区应急管理局·王科长',
      camp: 'blue',
      role: '区应急管理局指挥调度席',
      department: '区应急管理局',
      isCommander: false,
      assigned: false,
      user: '',
      avatar: '🛡️'
    },
    'blue_fire': {
      id: 'blue_fire',
      name: '区消防救援大队·陈大队长',
      camp: 'blue',
      role: '区消防救援大队大队长',
      department: 'P区消防救援大队',
      isCommander: false,
      assigned: false,
      user: '',
      avatar: '🚒'
    },
    'blue_police': {
      id: 'blue_police',
      name: '区公安分局·张警官',
      camp: 'blue',
      role: 'K市公安局P区分局 (网安/治安)',
      department: '区公安分局',
      isCommander: false,
      assigned: false,
      user: '',
      avatar: '👮'
    },
    'blue_health': {
      id: 'blue_health',
      name: '市卫健委·刘主任',
      camp: 'blue',
      role: '市卫健委医疗救治组',
      department: '市卫健委',
      isCommander: false,
      assigned: false,
      user: '',
      avatar: '🏥'
    },
    'blue_housing': {
      id: 'blue_housing',
      name: '区住建局·周站长',
      camp: 'blue',
      role: '区住建局与安监站',
      department: '区住建局',
      isCommander: false,
      assigned: false,
      user: '',
      avatar: '🏗️'
    },
    'blue_street': {
      id: 'blue_street',
      name: 'X街道办·赵书记',
      camp: 'blue',
      role: 'X街道善后维稳专班',
      department: 'X街道办事处',
      isCommander: false,
      assigned: false,
      user: '',
      avatar: '🤝'
    },
    'blue_spokesman': {
      id: 'blue_spokesman',
      name: '联合调查组·新闻发言人',
      camp: 'blue',
      role: '区联合调查组新闻发言人 (常务副区长)',
      department: '区委宣传部',
      isCommander: false,
      assigned: false,
      user: '',
      avatar: '📢'
    },

    // 红方角色
    'red_cloud': {
      id: 'red_cloud',
      name: '抖音网民“云朵儿”',
      camp: 'red',
      role: '抖音网民“云朵儿”',
      platform: '抖音短视频',
      assigned: false,
      user: '',
      avatar: '📱'
    },
    'red_xiaofei': {
      id: 'red_xiaofei',
      name: '造谣网民“小飞飞”',
      camp: 'red',
      role: '抖音造谣网民“小飞飞”',
      platform: '抖音短视频',
      assigned: false,
      user: '',
      avatar: '🚨'
    },
    'red_huahua': {
      id: 'red_huahua',
      name: '造谣大V“花花的世界”',
      camp: 'red',
      role: '微博造谣大V“花花的世界”',
      platform: '新浪微博',
      assigned: false,
      user: '',
      avatar: '⚡'
    },
    'red_live': {
      id: 'red_live',
      name: '快手“@直击K市现场”',
      camp: 'red',
      role: '快手账号“@直击K市现场”',
      platform: '快手平台',
      assigned: false,
      user: '',
      avatar: '📹'
    },
    'red_reporter': {
      id: 'red_reporter',
      name: '《红星新闻》驻市记者',
      camp: 'red',
      role: '《红星新闻》记者团队',
      platform: '主流深度媒体',
      assigned: false,
      user: '',
      avatar: '🎙️'
    },
    'red_parents': {
      id: 'red_parents',
      name: '“@正义家长联盟”',
      camp: 'red',
      role: '微博组织“@正义家长联盟”',
      platform: '新浪微博',
      assigned: false,
      user: '',
      avatar: '👥'
    },
    'red_owner': {
      id: 'red_owner',
      name: '涉事小区业主代表',
      camp: 'red',
      role: '涉事小区业主代表',
      platform: '微信业主群',
      assigned: false,
      user: '',
      avatar: '🏢'
    },
    'red_family': {
      id: 'red_family',
      name: '遇难伤者家属代表',
      camp: 'red',
      role: '遇难伤者家属代表',
      platform: '抖音 / 现场聚集',
      assigned: false,
      user: '',
      avatar: '⚠️'
    }
  },

  // 实时热搜榜 TOP 5 (依据公信力动态升降)
  trendingList: [
    { id: 1, rank: 1, tag: '爆', title: '#P区高层住宅突发大火浓烟滚滚视频曝光#', heat: '298万', isIncident: true, isRumor: false },
    { id: 2, rank: 2, tag: '沸', title: '#网传爆燃事故担架抬出20多人官方失语#', heat: '245万', isIncident: true, isRumor: true },
    { id: 3, rank: 3, tag: '热', title: '#消防通道疑似被多辆私家车堵死#', heat: '168万', isIncident: true, isRumor: false },
    { id: 4, rank: 4, tag: '新', title: '#红星新闻记者赶赴现场遇阻引发推搡#', heat: '115万', isIncident: true, isRumor: false },
    { id: 5, rank: 5, tag: '荐', title: '#高层住宅火灾逃生自救科普指引#', heat: '82万', isIncident: false, isRumor: false }
  ],

  // 点点密信内部应急指挥群消息记录
  chatMessages: [
    {
      id: 'm1',
      senderId: 'system',
      senderName: '系统通知',
      avatar: '🛡️',
      role: 'SYSTEM',
      content: '【应急预警】已启动网络舆情二级战备响应！点点密信应急专班群已自动建群，指挥长及协同部门进入双工在线。',
      time: '18:57',
      isCard: false
    },
    {
      id: 'm2',
      senderId: 'sentinel_bot',
      senderName: '🤖 舆情监测哨兵机器人',
      avatar: '🤖',
      role: 'BOT',
      content: '【⚠️ 舆情预警机器人】全网监测捕获：抖音网民“云朵儿”首发花园居爆燃逃生视频，公信力 -15 分！已触发网络热搜 TOP 1，请专班核查！',
      time: '18:58',
      isCard: false
    },
    {
      id: 'm3',
      senderId: 'blue_commander',
      senderName: '网信办指挥长·李主任',
      avatar: '👑',
      role: 'BLUE',
      content: '@区消防救援大队 @区应急管理局 请火速查实真实伤亡！外网正在疯狂发酵，30分钟内务必反馈初核情况！',
      time: '19:00',
      isCard: false
    }
  ],

  // 横向时间轴攻防对抗记录 (以时间从左往右排列，支持左右拖拽查看)
  timelineConfrontations: [
    {
      id: 'CF-101',
      time: '18:57',
      stageId: 'STAGE-01',
      red: {
        id: 'RP-101',
        role: '抖音网民“云朵儿”',
        author: '云朵儿',
        avatar: '📱',
        platform: '抖音短视频',
        content: '“P区X街道花园居小区高层突发爆燃事故！” 浓烟遮天蔽日，逃生居民中见十余名穿着校服哭泣的学生。(获8000点赞、560条评论)',
        penalty: -15,
        assetName: '火灾现场实况视频.mp4',
        trendingRank: 'Top 1 (爆)'
      },
      blues: [
        {
          id: 'BM-1A1',
          role: '市委网信办监测专班',
          avatar: '👑',
          category: 'diandian_dispatch',
          title: '【点点密信指令】调度应急消防30分钟内核实现场伤亡',
          statement: '指令区应急局与消防大队紧密协同，30分钟内精准报送现场火势控制、死伤底数与现场搜救第一手材料。',
          branchName: '走向 A (协同核实)',
          delta: 10
        }
      ]
    },
    {
      id: 'CF-102',
      time: '19:10',
      stageId: 'STAGE-01',
      red: {
        id: 'RP-102',
        role: '涉事小区业主代表',
        author: '业主维权群',
        avatar: '🏢',
        platform: '微信业主群 / 微博',
        content: '“起火23楼连个消火栓水带都没有！楼下私家车把消防通道全堵死了，消防车在路口干着急！” 业主群内怨声沸腾。',
        penalty: -10,
        assetName: '消防通道违停监控照片.jpg',
        trendingRank: 'Top 3 (热)'
      },
      blues: [
        {
          id: 'BM-1A2',
          role: 'P区消防救援大队 & 交警',
          avatar: '🚒',
          category: 'field_operation',
          title: '【线下处置与辟谣】高喷车就位内攻 + 交警强制拖离违停',
          statement: '出动120名官兵与8台高喷车内攻灭火，交警铁骑强制拖移违停占道车辆3台，生命通道全面恢复畅通。',
          branchName: '走向 A (破障攻坚)',
          delta: 10
        }
      ]
    }
  ],

  // 社交平台（仿微博广场）动态
  socialPosts: [
    {
      id: 'p1',
      author: '云朵儿 (抖音网民)',
      role: 'RED',
      avatar: '📱',
      time: '18:57',
      content: '一声巨响火光冲天！现场太惨了！听说楼里至少死了30多个人，消防车进不来被堵在路口，相关部门到底在干嘛？！',
      likes: 12450,
      comments: 1820,
      shares: 980
    }
  ]
};

class DrillSyncEngine {
  constructor() {
    this.channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(SYNC_CHANNEL_NAME) : null;
    this.listeners = [];
    this.state = this.loadState();

    if (this.channel) {
      this.channel.onmessage = (event) => {
        if (event.data && event.data.type === 'STATE_UPDATE') {
          this.state = event.data.state;
          this.notifyListeners(event.data.action, event.data.payload);
        }
      };
    }

    // 跨页面 storage 兜底监听
    window.addEventListener('storage', (e) => {
      if (e.key === SYNC_CHANNEL_NAME) {
        this.state = this.loadState();
        this.notifyListeners('STORAGE_SYNC', null);
      }
    });
  }

  loadState() {
    try {
      const saved = localStorage.getItem(SYNC_CHANNEL_NAME);
      if (saved) {
        const parsed = JSON.parse(saved);
        // 合并补全新字段保证向前兼容
        return Object.assign({}, DEFAULT_STATE, parsed, {
          room: Object.assign({}, DEFAULT_STATE.room, parsed.room || {}),
          battle: Object.assign({}, DEFAULT_STATE.battle, parsed.battle || {}),
          seats: Object.assign({}, DEFAULT_STATE.seats, parsed.seats || {})
        });
      }
    } catch (e) {
      console.warn('Load state error:', e);
    }
    this.saveState(DEFAULT_STATE);
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }

  saveState(state) {
    try {
      localStorage.setItem(SYNC_CHANNEL_NAME, JSON.stringify(state));
    } catch (e) {
      console.error('Save state error:', e);
    }
  }

  getState() {
    return this.state;
  }

  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  notifyListeners(action, payload) {
    this.listeners.forEach(cb => {
      try {
        cb(this.state, action, payload);
      } catch (err) {
        console.error('Listener callback error:', err);
      }
    });
  }

  broadcast(actionName, payload = null) {
    this.saveState(this.state);
    if (this.channel) {
      this.channel.postMessage({
        type: 'STATE_UPDATE',
        action: actionName,
        payload: payload,
        state: this.state
      });
    }
    this.notifyListeners(actionName, payload);
  }

  // === 1. 席位认领与全员就位 ===

  claimRole(seatId, userName = '学员参演', userAvatar = '') {
    if (!this.state.seats[seatId]) return false;
    const seat = this.state.seats[seatId];
    seat.assigned = true;
    seat.user = userName;
    if (userAvatar) seat.avatar = userAvatar;
    this.broadcast('ROLE_CLAIMED', { seatId, seat });
    return true;
  }

  unclaimRole(seatId) {
    if (!this.state.seats[seatId]) return false;
    const seat = this.state.seats[seatId];
    seat.assigned = false;
    seat.user = '';
    this.broadcast('ROLE_UNCLAIMED', { seatId, seat });
    return true;
  }

  claimAllSeats() {
    const mockNames = {
      blue_commander: '李主任 (PC就位)',
      blue_emergency: '王科长 (手机H5)',
      blue_fire: '陈队长 (手机H5)',
      blue_police: '张警官 (手机H5)',
      blue_health: '刘主任 (手机H5)',
      blue_housing: '周站长 (手机H5)',
      blue_street: '赵书记 (手机H5)',
      blue_spokesman: '孙副区长 (手机H5)',
      red_cloud: '网民·云朵儿',
      red_xiaofei: '网民·小飞飞',
      red_huahua: '大V·花花的世界',
      red_live: '快手·现场目击',
      red_reporter: '红星新闻记者团队',
      red_parents: '正义家长联盟',
      red_owner: '23栋业主代表',
      red_family: '家属代表·张某'
    };

    Object.keys(this.state.seats).forEach(key => {
      this.state.seats[key].assigned = true;
      this.state.seats[key].user = mockNames[key] || '学员在线';
    });

    this.broadcast('ALL_ROLES_CLAIMED', {});
  }

  // === 2. 演练生命周期与状态控制 ===

  startDrill(scriptId = null) {
    if (scriptId) this.state.activeScriptId = scriptId;
    this.state.drillStatus = 'RUNNING';
    this.broadcast('DRILL_STARTED', { scriptId: this.state.activeScriptId });
  }

  pauseDrill() {
    this.state.drillStatus = 'PAUSED';
    this.broadcast('DRILL_PAUSED', {});
  }

  resumeDrill() {
    this.state.drillStatus = 'RUNNING';
    this.broadcast('DRILL_RESUMED', {});
  }

  endDrill(reason = 'MANUAL') {
    this.state.drillStatus = 'ENDED';
    this.broadcast('DRILL_ENDED', { reason });
  }

  setDrillStatus(status) {
    this.state.drillStatus = status;
    this.broadcast('STATUS_CHANGED', { status });
  }

  // === 3. 攻防对抗与公信力核算 ===

  postRedCombat(postData) {
    const penalty = Number(postData.penalty || -15);
    const newScore = Math.max(0, Math.min(100, this.state.battle.credibilityScore + penalty));
    this.state.battle.credibilityScore = newScore;
    this.state.battle.redVolume += 3800;

    const cfId = 'CF-' + Date.now();
    const newCf = {
      id: cfId,
      time: this.state.room.virtualTime,
      stageId: this.state.room.stageId,
      red: Object.assign({}, postData, { penalty }),
      blues: []
    };

    if (!this.state.timelineConfrontations) this.state.timelineConfrontations = [];
    this.state.timelineConfrontations.push(newCf);

    // 机器人自动播报红方攻击
    this.sendChatMessage(
      'sentinel_bot',
      '🤖 舆情监测哨兵机器人',
      '🤖',
      'BOT',
      `【⚠️ 红方突发舆情告警】${postData.role || '网络造谣账号'} 发布攻防贴文：“${(postData.content || '').slice(0, 36)}...” 公信力 ${penalty} 分！请各专班立即组织处置核实！`
    );

    // 动态刷新榜单
    this.updateTrendingList();

    this.broadcast('RED_POST_CREATED', { cf: newCf, newScore });
    return newCf;
  }

  executeBlueMeasure(measureData, targetCfId = null) {
    const delta = Number(measureData.delta || 10);
    const newScore = Math.max(0, Math.min(100, this.state.battle.credibilityScore + delta));
    this.state.battle.credibilityScore = newScore;
    this.state.battle.blueVolume += 4500;

    let targetCf = null;
    if (targetCfId) {
      targetCf = this.state.timelineConfrontations.find(c => c.id === targetCfId);
    }
    if (!targetCf && this.state.timelineConfrontations.length > 0) {
      // 优先配对没有防守的红方攻防项
      targetCf = this.state.timelineConfrontations.find(c => !c.blues || c.blues.length === 0);
      if (!targetCf) targetCf = this.state.timelineConfrontations[this.state.timelineConfrontations.length - 1];
    }

    const defenseItem = Object.assign({}, measureData, { delta });
    if (targetCf) {
      if (!targetCf.blues) targetCf.blues = [];
      targetCf.blues.push(defenseItem);
    }

    // 在点点密信中发出处置反馈
    this.sendChatMessage(
      measureData.roleId || 'blue_unit',
      measureData.role || '处置席位',
      '🏛️',
      'BLUE',
      `【处置响应】${measureData.title}：${(measureData.statement || '').slice(0, 48)} (公信力 +${delta}分)`
    );

    this.updateTrendingList();
    this.broadcast('BLUE_MEASURE_EXECUTED', { defenseItem, newScore, targetCfId: targetCf?.id });
    return defenseItem;
  }

  updateTrendingList() {
    const score = this.state.battle.credibilityScore;
    // 根据公信力动态渲染榜单：
    // 当公信力 >= 80 时，该事件一直在榜单上并高亮闪动
    // 60~80 时，谣言词条变多并严重警报
    // < 60 时，全榜被负面攻占
    if (score >= 80) {
      this.state.trendingList = [
        { id: 1, rank: 1, tag: '爆', title: '#P区高层住宅突发火灾官方权威搜救通报#', heat: '385万', isIncident: true, isRumor: false, isHighlighted: true },
        { id: 2, rank: 2, tag: '沸', title: '#抢险救援生命通道已全面恢复畅通#', heat: '290万', isIncident: true, isRumor: false, isHighlighted: true },
        { id: 3, rank: 3, tag: '热', title: '#网警依法查处多起火灾伤亡网络谣言#', heat: '195万', isIncident: true, isRumor: false, isHighlighted: false },
        { id: 4, rank: 4, tag: '新', title: '#高层住宅逃生自救科普手册指南#', heat: '142万', isIncident: false, isRumor: false, isHighlighted: false },
        { id: 5, rank: 5, tag: '荐', title: '#省市联合调查组迅速进驻现场调查#', heat: '98万', isIncident: true, isRumor: false, isHighlighted: false }
      ];
    } else if (score >= 60) {
      this.state.trendingList = [
        { id: 1, rank: 1, tag: '爆', title: '#网传P区爆燃事故担架抬出20多具官方失语#', heat: '460万', isIncident: true, isRumor: true, isHighlighted: true },
        { id: 2, rank: 2, tag: '沸', title: '#起火居民楼消火栓无水消防通道堵死现场曝光#', heat: '390万', isIncident: true, isRumor: false, isHighlighted: true },
        { id: 3, rank: 3, tag: '沸', title: '#红星新闻记者探访现场遇阻遭粗暴推搡#', heat: '320万', isIncident: true, isRumor: false, isHighlighted: true },
        { id: 4, rank: 4, tag: '热', title: '#居民楼内疑似存在违规补课黑作坊培训班#', heat: '250万', isIncident: true, isRumor: true, isHighlighted: true },
        { id: 5, rank: 5, tag: '热', title: '#遇难伤者家属聚集街道讨要事实说法#', heat: '180万', isIncident: true, isRumor: false, isHighlighted: false }
      ];
    } else {
      this.state.trendingList = [
        { id: 1, rank: 1, tag: '爆', title: '#P区火灾真相隐瞒谎报引发舆情海啸#', heat: '680万', isIncident: true, isRumor: true, isHighlighted: true },
        { id: 2, rank: 2, tag: '爆', title: '#官方谎称无伤亡惨遭家属视频实名打脸#', heat: '590万', isIncident: true, isRumor: true, isHighlighted: true },
        { id: 3, rank: 3, tag: '沸', title: '#全网联名追责官方处置迟滞失职#', heat: '480万', isIncident: true, isRumor: false, isHighlighted: true },
        { id: 4, rank: 4, tag: '沸', title: '#抢夺记者摄像机现场视频疯传失控#', heat: '390万', isIncident: true, isRumor: false, isHighlighted: true },
        { id: 5, rank: 5, tag: '沸', title: '#各级监管责任彻底失守引爆全网信任危机#', heat: '310万', isIncident: true, isRumor: false, isHighlighted: true }
      ];
    }
  }

  // === 4. 点点密信消息交互 ===

  sendChatMessage(senderId, senderName, avatar, role, content, isCard = false, cardMeta = null) {
    const msg = {
      id: 'm_' + Date.now(),
      senderId,
      senderName,
      avatar,
      role,
      content,
      isCard,
      cardMeta,
      time: this.state.room.virtualTime ? this.state.room.virtualTime.slice(-5) : '19:15'
    };
    this.state.chatMessages.push(msg);
    this.broadcast('NEW_CHAT_MESSAGE', { msg });
    return msg;
  }

  // 重置演练场景
  resetScenario() {
    this.state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    this.broadcast('SCENARIO_RESET', {});
  }
}

window.drillEngine = new DrillSyncEngine();
