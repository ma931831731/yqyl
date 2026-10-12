/**
 * 通用模态弹窗管理器
 */

export function openModal(modalId) {
  const el = document.getElementById(modalId);
  if (el) {
    el.style.display = 'flex';
  }
}

export function closeModal(modalId) {
  const el = document.getElementById(modalId);
  if (el) {
    el.style.display = 'none';
  }
}

if (typeof window !== 'undefined') {
  window.openModal = openModal;
  window.closeModal = closeModal;
}
