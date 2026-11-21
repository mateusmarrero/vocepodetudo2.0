const fs = require('fs');
const path = require('path');

const vagasJsPath = path.join(__dirname, '..', 'src', 'vagas.js');
let js = fs.readFileSync(vagasJsPath, 'utf8');

// Localizar o trecho quebrado
const startMarker = 'function updateGoogleJobsSchema(jobs) {';
const endMarker = 'function renderJobsGrid() {';

const startIdx = js.indexOf(startMarker);
const endIdx = js.indexOf(endMarker, startIdx);

if (startIdx !== -1 && endIdx !== -1) {
  const cleanFunction = `function updateGoogleJobsSchema(jobs) {
    let scriptTag = document.getElementById('google-jobs-schema-jsonld');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'google-jobs-schema-jsonld';
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }

    if (!jobs || jobs.length === 0) {
      return;
    }

    const empTypeMap = {
      'jovem_aprendiz': 'PART_TIME',
      'estagio': 'INTERN',
      'junior': 'FULL_TIME',
      'trainee': 'FULL_TIME'
    };

    const structured = jobs.slice(0, 15).map(function(j, idx) {
      var isRemote = j.modality === 'remoto';
      var city = j.city || 'São Paulo';
      var state = j.state || 'SP';
      var datePosted = j.date || '2026-11-10';

      var posting = {
        '@context': 'https://schema.org/',
        '@type': 'JobPosting',
        'title': j.title,
        'description': (j.description || j.title) + ' - Inscrição gratuita no Portal Você Pode Tudo.',
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
        posting.jobLocationType = 'TELECOMMUTE';
        posting.applicantLocationRequirements = {
          '@type': 'Country',
          'name': 'BR'
        };
      } else {
        posting.jobLocation = {
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

      return posting;
    });

    scriptTag.textContent = JSON.stringify(structured);
  }

  `;

  js = js.substring(0, startIdx) + cleanFunction + js.substring(endIdx);
  fs.writeFileSync(vagasJsPath, js, 'utf8');
  console.log('✅ updateGoogleJobsSchema corrigido e restaurado em src/vagas.js');
} else {
  console.error('Marcadores não localizados');
}
