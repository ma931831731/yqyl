/**
 * 演练系统常量定义与业务枚举
 */

export const SYNC_CHANNEL_NAME = 'cyber_battle_drill_sync';

export const STORAGE_KEYS = {
  STATE: 'battle_drill_state',
  CARTRIDGES: 'battle_drill_cartridges'
};

export const DRILL_STATUS = {
  LOBBY: 'LOBBY',         // 剧本大厅
  ROSTER: 'ROSTER',       // 席位集结
  RUNNING: 'RUNNING',     // 演练推演中
  PAUSED: 'PAUSED',       // 暂停推演
  SUCCESS: 'SUCCESS',     // 处置成功 (公信力维持)
  FAILED: 'FAILED',       // 处置失败 (公信力崩盘)
  ENDED: 'ENDED'          // 演练归档结束
};

export const ALERT_LEVEL = {
  BLUE: 'BLUE',
  YELLOW: 'YELLOW',
  ORANGE: 'ORANGE',
  RED: 'RED'
};

export const CAMP_TYPE = {
  RED: 'red',
  BLUE: 'blue'
};
