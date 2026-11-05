/**
 * Clean reusable modal to inform customers that orders are temporarily unavailable (Developer Mode).
 * Uses robust DOM injection with smooth animations and avoids duplicate popups.
 */
export const showOrdersUnavailableModal = () => {
  if (typeof document === 'undefined') return;

  const existingModal = document.getElementById('temp-order-modal');
  if (existingModal) return;

  const modal = document.createElement('div');
  modal.id = 'temp-order-modal';
  modal.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(26,35,50,0.4);backdrop-filter:blur(8px);z-index:999999;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity 0.3s ease;padding:20px;';
  
  modal.innerHTML = `
    <div style="background:#fff;padding:40px;border-radius:24px;max-width:440px;width:100%;text-align:center;box-shadow:0 24px 64px rgba(0,0,0,0.12);transform:translateY(20px);transition:transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
      <div style="width:72px;height:72px;background:#fff0f0;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 24px;">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </div>
      <h2 style="font-family:var(--font-outfit), sans-serif;font-size:22px;font-weight:800;color:#1a2332;margin-bottom:12px;letter-spacing:-0.5px;">Orders Temporarily Unavailable</h2>
      <p style="font-size:15px;color:#64748b;line-height:1.6;margin-bottom:32px;">We're currently not accepting orders at the moment. Please check back soon. We apologize for the inconvenience and appreciate your patience.</p>
      <button id="temp-order-close" style="background:#3BAE56;color:#fff;border:none;padding:16px 32px;font-size:15px;font-weight:700;border-radius:14px;cursor:pointer;width:100%;transition:all 0.2s ease;box-shadow:0 8px 16px rgba(59,174,86,0.2);">Okay, I Understand</button>
    </div>
  `;

  document.body.appendChild(modal);

  const btn = document.getElementById('temp-order-close');
  if (btn) {
    btn.onmouseover = () => { btn.style.transform = 'translateY(-2px)'; };
    btn.onmouseout = () => { btn.style.transform = 'translateY(0)'; };
    btn.onclick = () => {
      modal.style.opacity = '0';
      if (modal.children[0]) {
        modal.children[0].style.transform = 'translateY(20px)';
      }
      setTimeout(() => {
        if (modal.parentNode) {
          modal.parentNode.removeChild(modal);
        }
      }, 300);
    };
  }

  // Click on backdrop to dismiss as well
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.opacity = '0';
      if (modal.children[0]) {
        modal.children[0].style.transform = 'translateY(20px)';
      }
      setTimeout(() => {
        if (modal.parentNode) {
          modal.parentNode.removeChild(modal);
        }
      }, 300);
    }
  });

  requestAnimationFrame(() => {
    modal.style.opacity = '1';
    if (modal.children[0]) {
      modal.children[0].style.transform = 'translateY(0)';
    }
  });
};

