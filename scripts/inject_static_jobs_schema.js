const fs = require('fs');
const path = require('path');

const projectDir = path.resolve(__dirname, '..');
const seedJobsPath = path.join(projectDir, 'api', 'seed_jobs.json');
const vagasHtmlPath = path.join(projectDir, 'vagas.html');

const jobs = JSON.parse(fs.readFileSync(seedJobsPath, 'utf8'));
let vagasHtml = fs.readFileSync(vagasHtmlPath, 'utf8');

const empTypeMap = {
  'jovem_aprendiz': 'PART_TIME',
  'estagio': 'INTERN',
  'junior': 'FULL_TIME',
  'trainee': 'FULL_TIME'
};

const structuredJobs = jobs.slice(0, 15).map((j, idx) => {
  const isRemote = j.modality === 'remoto';
  const city = j.city || 'São Paulo';
  const state = j.state || 'SP';
  const datePosted = j.date || '2026-11-10';

  const posting = {
    '@context': 'https://schema.org/',
    '@type': 'JobPosting',
    'title': j.title,
    'description': (j.description || j.title) + ' - Inscrição e processo seletivo gratuito no Portal Você Pode Tudo.',
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

  if (j.salary && j.salary.includes('R$')) {
    const numSalary = parseFloat(j.salary.replace(/[^0-9,]/g, '').replace(',', '.'));
    if (!isNaN(numSalary) && numSalary > 0) {
      posting.baseSalary = {
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

  return posting;
});

const jsonLdBlock = `
  <!-- Google for Jobs: Dados Estruturados Oficiais Schema.org/JobPosting -->
  <script id="google-jobs-schema-jsonld" type="application/ld+json">
  ${JSON.stringify(structuredJobs, null, 2)}
  </script>
`;

if (!vagasHtml.includes('Google for Jobs: Dados Estruturados') && vagasHtml.includes('</head>')) {
  vagasHtml = vagasHtml.replace('</head>', jsonLdBlock + '\n</head>');
  fs.writeFileSync(vagasHtmlPath, vagasHtml, 'utf8');
  console.log('✅ Google for Jobs Schema.org injetado com 15 vagas no <head> de vagas.html');
} else {
  console.log('Schema já presente no <head> de vagas.html');
}
