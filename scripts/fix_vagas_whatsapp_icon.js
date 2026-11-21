const fs = require('fs');
const path = require('path');

const vagasJsPath = path.join(__dirname, '..', 'src', 'vagas.js');
let js = fs.readFileSync(vagasJsPath, 'utf8');

const isCRLF = js.includes('\r\n');
if (isCRLF) js = js.replace(/\r\n/g, '\n');

// 1. Substituir o ícone do botão pelo SVG oficial do WhatsApp
const targetBtn = `<i data-lucide="share-2" class="w-4 h-4"></i>`;
const whatsappSvg = `<svg class="w-4 h-4 fill-white shrink-0" viewBox="0 0 24 24" aria-hidden="true"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>`;

if (js.includes(targetBtn)) {
  js = js.replace(targetBtn, whatsappSvg);
  console.log('✅ Ícone oficial do WhatsApp substituído com sucesso em src/vagas.js');
}

// 2. Garantir renderização dos ícones Lucide no grid de vagas e limpeza do return antecipado
const oldEndMarker = `    grid.innerHTML = jobCardsHtml.join('');

    try {
      if (location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
        const ads = grid.querySelectorAll('.adsbygoogle:not([data-adsbygoogle-status])');
        ads.forEach(ad => {
          ad.setAttribute('data-adsbygoogle-status', 'pending');
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        });
      }
    } catch (e) {
      // Bloqueador de anúncio ativo
    }
    return;
    const _ignoredOldLoop = filteredJobs.map(job => {`;

const newEndMarker = `    grid.innerHTML = jobCardsHtml.join('');

    // Renderizar ícones do Lucide no grid
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons({ root: grid });
    }

    // Injetar dados estruturados Schema.org JobPosting para Google for Jobs
    updateGoogleJobsSchema(filteredJobs);

    try {
      if (location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
        const ads = grid.querySelectorAll('.adsbygoogle:not([data-adsbygoogle-status])');
        ads.forEach(ad => {
          ad.setAttribute('data-adsbygoogle-status', 'pending');
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        });
      }
    } catch (e) {
      // Bloqueador de anúncio ativo
    }
    return;
    const _ignoredOldLoop = filteredJobs.map(job => {`;

if (js.includes(oldEndMarker)) {
  js = js.replace(oldEndMarker, newEndMarker);
  console.log('✅ Chamada lucide.createIcons e updateGoogleJobsSchema adicionadas ao final do grid');
}

// 3. Adicionar função updateGoogleJobsSchema
const schemaFunction = `
  // ============================================================================
  // GOOGLE FOR JOBS (SCHEMA.ORG / JOBPOSTING) - ESTRUTURAÇÃO OFICIAL DE DADOS
  // ============================================================================
  function updateGoogleJobsSchema(jobs) {
    let scriptTag = document.getElementById('google-jobs-schema-jsonld');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'google-jobs-schema-jsonld';
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }

    if (!jobs || jobs.length === 0) {
      scriptTag.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        'itemListElement': []
      });
      return;
    }

    // Gerar até 20 vagas estruturadas para o Google for Jobs
    const jobPostings = jobs.slice(0, 20).map((j, idx) => {
      const isRemote = j.modality === 'remoto';
      const city = j.city || 'São Paulo';
      const state = j.state || 'SP';
      const datePosted = j.date || new Date().toISOString().split('T')[0];
      
      const empTypeMap = {
        'jovem_aprendiz': 'PART_TIME',
        'estagio': 'INTERN',
        'junior': 'FULL_TIME',
        'trainee': 'FULL_TIME'
      };

      const basePosting = {
        '@context': 'https://schema.org/',
        '@type': 'JobPosting',
        'title': j.title || 'Vaga de Emprego',
        'description': (j.description || j.title) + ' - Candidatura e informações completas no Portal Você Pode Tudo.',
        'identifier': {
          '@type': 'PropertyValue',
          'name': j.company || 'Empresa Parceira',
          'value': 'vpt-job-' + (j.id || idx)
        },
        'datePosted': datePosted,
        'validThrough': '2026-12-31T23:59:59Z',
        'employmentType': empTypeMap[j.type] || 'FULL_TIME',
        'hiringOrganization': {
          '@type': 'Organization',
          'name': j.company || 'Empresa Confidencial',
          'sameAs': 'https://vocepodetudo.com/vagas.html'
        },
        'directApply': true
      };

      if (isRemote) {
        basePosting.jobLocationType = 'TELECOMMUTE';
        basePosting.applicantLocationRequirements = {
          '@type': 'Country',
          'name': 'BR'
        };
      } else {
        basePosting.jobLocation = {
          '@type': 'Place',
          'address': {
            '@type': 'PostalAddress',
            'streetAddress': 'Centro',
            'addressLocality': city,
            'addressRegion': state,
            'addressCountry': 'BR'
          }
        };
      }

      if (j.salary && j.salary.includes('R$')) {
        const numSalary = parseFloat(j.salary.replace(/[^0-9,]/g, '').replace(',', '.'));
        if (!isNaN(numSalary) && numSalary > 0) {
          basePosting.baseSalary = {
            '@type': 'MonetaryAmount',
            'currency': 'BRL',
            'value': {
              '@type': 'QuantitativeValue',
              'value': numSalary,
              'unitText': 'MONTH'
            }
          };
        }
      }

      return basePosting;
    });

    scriptTag.textContent = JSON.stringify(jobPostings);
  }
`;

if (!js.includes('function updateGoogleJobsSchema')) {
  // Inserir antes de function renderJobsGrid
  const rStart = 'function renderJobsGrid() {';
  js = js.replace(rStart, schemaFunction + '\n' + rStart);
  console.log('✅ Função updateGoogleJobsSchema implementada com sucesso');
}

if (isCRLF) js = js.replace(/\n/g, '\r\n');
fs.writeFileSync(vagasJsPath, js, 'utf8');
console.log('src/vagas.js atualizado com sucesso.');
