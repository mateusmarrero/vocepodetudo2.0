/**
 * Google Analytics 4 (GA4) & Tracking Centralizado — Você Pode Tudo
 * Compatível com LGPD / Consent Mode e Google AdSense
 */

(function () {
  'use strict';

  // ID da Métrica do Google Analytics 4 (Substitua por seu ID G-XXXXXXXXXX)
  const GA_MEASUREMENT_ID = window.VCPD_GA_ID || 'G-XXXXXXXXXX';

  // Inicializa gtag se ainda não existir
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;

  // Carrega o script oficial do Google Analytics se o ID for válido
  if (GA_MEASUREMENT_ID && GA_MEASUREMENT_ID !== 'G-XXXXXXXXXX') {
    gtag('js', new Date());

    // Configuração com anonimização de IP e conformidade LGPD
    gtag('config', GA_MEASUREMENT_ID, {
      anonymize_ip: true,
      send_page_view: true
    });

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);
    console.log(`[Analytics] Google Analytics 4 inicializado com ID: ${GA_MEASUREMENT_ID}`);
  }

  // Função utilitária para disparo de eventos personalizados
  window.vcpdTrackEvent = function (eventName, eventParams = {}) {
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, eventParams);
    }
  };

  // Rastreamento automático de cliques e downloads de interesse
  document.addEventListener('DOMContentLoaded', function () {
    // Rastrear cliques em download de APK
    document.querySelectorAll('a[href*="vocepodetudo.apk"]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        window.vcpdTrackEvent('download_apk', {
          item_name: 'vocepodetudo.apk',
          app_version: '4.48.0'
        });
      });
    });

    // Rastrear downloads de modelos na Central de Downloads
    document.querySelectorAll('[id^="btn-download-"]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        window.vcpdTrackEvent('download_material', {
          material_id: btn.id
        });
      });
    });
  });
})();
