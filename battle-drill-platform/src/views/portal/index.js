/**
 * 舆情百战演练平台 · 数字战境总控门户入口逻辑
 */

import '../../styles/common/cyber-base.css';
import { drillEngine } from '../../core/sync-engine.js';
import { getDrillCartridges } from '../../data/cartridges/index.js';

document.addEventListener('DOMContentLoaded', () => {
  const cartridges = getDrillCartridges();
  const state = drillEngine.getState();
  console.log('🚀 [Portal] 演练总控演示中心就绪，当前载入剧本数:', cartridges.length, '房间状态:', state.drillStatus);

  // 暴露重置方法至全局
  window.handleResetAllDrillData = () => {
    if (confirm('确认重置所有终端数据并恢复至初始剧本状态？')) {
      drillEngine.resetScenario();
      alert('所有终端演练数据已恢复初始状态！');
      location.reload();
    }
  };
});
