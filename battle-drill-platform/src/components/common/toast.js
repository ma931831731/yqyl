/**
 * 赛博轻提示 Toast 组件 (Cyber Toast)
 */

export function showToast(message, type = 'info', duration = 2500) {
  let toastEl = document.getElementById('globalToast');
  if (!toastEl) {
    toastEl = document.createElement('div');
    toastEl.id = 'globalToast';
    toastEl.className = 'global-toast';
    document.body.appendChild(toastEl);
  }

  const icons = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌'
  };

  toastEl.innerHTML = `<span>${icons[type] || 'ℹ️'}</span> <span>${message}</span>`;
  toastEl.className = `global-toast toast-${type} toast-show`;
  toastEl.style.display = 'flex';

  clearTimeout(toastEl._timer);
  toastEl._timer = setTimeout(() => {
    toastEl.classList.remove('toast-show');
    setTimeout(() => {
      toastEl.style.display = 'none';
    }, 200);
  }, duration);
}

if (typeof window !== 'undefined') {
  window.showToast = showToast;
}
