/**
 * Banner de Consentimento de Cookies & LGPD com Google Consent Mode v2 — Você Pode Tudo
 * Totalmente compatível com as diretrizes do Google AdSense e LGPD (Lei nº 13.709/2018).
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'vpt_lgpd_consent';

  // 1. Inicializar dataLayer e definir estado padrão do Google Consent Mode v2
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;

  let currentConsent = null;
  try {
    currentConsent = localStorage.getItem(STORAGE_KEY);
  } catch (e) {}

  if (currentConsent === 'all') {
    gtag('consent', 'default', {
      'ad_storage': 'granted',
      'ad_user_data': 'granted',
      'ad_personalization': 'granted',
      'analytics_storage': 'granted'
    });
  } else if (currentConsent === 'essential') {
    gtag('consent', 'default', {
      'ad_storage': 'denied',
      'ad_user_data': 'denied',
      'ad_personalization': 'denied',
      'analytics_storage': 'denied'
    });
  } else {
    // Padrão defensivo conforme LGPD até interação explícita do usuário
    gtag('consent', 'default', {
      'ad_storage': 'denied',
      'ad_user_data': 'denied',
      'ad_personalization': 'denied',
      'analytics_storage': 'denied',
      'wait_for_update': 500
    });
  }

  // Se já consentiu ou se estiver na página inicial (onde já existe banner nativo), não duplicar
  if (currentConsent || document.getElementById('lgpd-consent-banner')) {
    return;
  }

  function createBanner() {
    if (document.getElementById('vcpd-cookie-banner')) return;

    const banner = document.createElement('div');
    banner.id = 'vcpd-cookie-banner';
    banner.className = 'fixed bottom-0 inset-x-0 z-50 p-3 sm:p-4 transition-all duration-300 transform translate-y-0';
    banner.innerHTML = `
      <div class="max-w-5xl mx-auto bg-white/98 text-slate-800 border-2 border-[#009639] rounded-2xl p-4 sm:p-5 shadow-2xl shadow-emerald-950/20 backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div class="space-y-1.5 flex-1 pr-2">
          <div class="flex items-center gap-2">
            <span class="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-emerald-100 text-[#00702a] text-sm font-black shadow-xs">
              🍪
            </span>
            <h3 class="text-sm font-black text-slate-900">Privacidade & Cookies no Você Pode Tudo</h3>
          </div>
          <p class="text-xs text-slate-600 leading-relaxed font-medium">
            Utilizamos cookies essenciais e tecnologias de parceiros confiáveis como o <strong>Google AdSense</strong> para manter nossa plataforma, cursos e ferramentas 100% gratuitos e exibir conteúdos relevantes. Consulte nossa 
            <a href="politica-privacidade" class="text-[#00702a] hover:text-[#005e24] underline font-bold transition-colors">Política de Privacidade</a> e 
            <a href="termos-de-uso" class="text-[#00702a] hover:text-[#005e24] underline font-bold transition-colors">Termos de Uso</a>.
          </p>
        </div>
        <div class="flex items-center gap-2.5 w-full md:w-auto flex-wrap sm:flex-nowrap flex-shrink-0">
          <button 
            type="button" 
            id="vcpd-cookie-accept" 
            class="flex-1 md:flex-initial px-4 py-2.5 bg-[#009639] hover:bg-[#00702a] text-white text-xs font-black rounded-xl shadow-md shadow-emerald-700/20 transition-all cursor-pointer text-center"
          >
            Aceitar Todos
          </button>
          <button 
            type="button" 
            id="vcpd-cookie-essential" 
            class="flex-1 md:flex-initial px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 transition-colors cursor-pointer text-center"
          >
            Apenas Essenciais
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(banner);

    // Handlers
    document.getElementById('vcpd-cookie-accept').addEventListener('click', function () {
      try {
        localStorage.setItem(STORAGE_KEY, 'all');
      } catch (e) {}
      gtag('consent', 'update', {
        'ad_storage': 'granted',
        'ad_user_data': 'granted',
        'ad_personalization': 'granted',
        'analytics_storage': 'granted'
      });
      dismissBanner(banner);
    });

    document.getElementById('vcpd-cookie-essential').addEventListener('click', function () {
      try {
        localStorage.setItem(STORAGE_KEY, 'essential');
      } catch (e) {}
      gtag('consent', 'update', {
        'ad_storage': 'denied',
        'ad_user_data': 'denied',
        'ad_personalization': 'denied',
        'analytics_storage': 'denied'
      });
      dismissBanner(banner);
    });
  }

  function dismissBanner(banner) {
    banner.classList.add('translate-y-full', 'opacity-0');
    setTimeout(() => {
      if (banner.parentNode) {
        banner.parentNode.removeChild(banner);
      }
    }, 350);
  }

  // Inicializar quando o DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createBanner);
  } else {
    createBanner();
  }
})();
