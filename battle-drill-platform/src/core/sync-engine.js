/**
 * 舆情百战演练平台 · 赛博红蓝核心跨端同步状态机
 * 基于 BroadcastChannel 与 LocalStorage 保证大屏端、PC作战台、H5移动端、后台管理端毫秒级实时同步
 */
import { SYNC_CHANNEL_NAME } from './constants.js';
import { DEFAULT_STATE } from '../data/initial-state.js';
import { globalEventBus } from './event-bus.js';


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
    globalEventBus.emit(action, { state: this.state, payload });
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

export const drillEngine = window.drillEngine || (window.drillEngine = new DrillSyncEngine());
export { DrillSyncEngine };
export default drillEngine;
