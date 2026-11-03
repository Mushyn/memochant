// Vérification du Service Worker publiée, sans changer la stratégie cache-first.
export async function initUpdates() {
  if (!('serviceWorker' in navigator) || !location.protocol.startsWith('http')) return;
  const banner = document.getElementById('updateBanner');
  const apply = document.getElementById('applyUpdate');
  const later = document.getElementById('laterUpdate');
  let registration;
  let applying = false;
  const offer = () => {
    if (registration?.waiting && navigator.serviceWorker.controller) banner.hidden = false;
  };
  try {
    registration = await navigator.serviceWorker.register('./sw.js', {updateViaCache:'none'});
    offer();
    registration.addEventListener('updatefound', () => {
      const worker = registration.installing;
      worker?.addEventListener('statechange', () => {
        if (worker.state === 'installed') offer();
      });
    });
    apply.addEventListener('click', () => {
      if (!registration.waiting) return;
      applying = true;
      apply.disabled = true;
      apply.textContent = 'Mise à jour…';
      registration.waiting.postMessage('SKIP_WAITING');
    });
    later.addEventListener('click', () => { banner.hidden = true; });
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (applying) location.reload();
    });
    // Contrôle réseau au lancement, au retour au premier plan et périodiquement.
    const check = () => { if (navigator.onLine) registration.update().catch(() => {}); };
    check();
    document.addEventListener('visibilitychange', () => { if (!document.hidden) check(); });
    window.addEventListener('online', check);
    setInterval(check, 60 * 60 * 1000);
  } catch (err) { console.warn('Mise à jour PWA indisponible', err); }
}
