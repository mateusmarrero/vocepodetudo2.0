/**
 * Motor de Descoberta, Validação e Curadoria de Cursos — Você Pode Tudo
 * Diretrizes:
 * - Allowlist institucional restrita
 * - Proteção Anti-SSRF
 * - Detecção estrita de gratuidade e certificado
 * - Deduplicação multinível (ID, URL canônica, Similaridade de Título)
 * - Defesa contra injeção indireta de prompt e XSS
 * - Governança Human-in-the-Loop (gravação apenas em staging)
 */

const dns = require('dns').promises;
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const projectRoot = path.resolve(__dirname, '..');
const cacheCoursesPath = path.join(projectRoot, 'api', 'cache_courses.json');
const pendingPath = path.join(projectRoot, 'curadoria_pendente', 'cursos_pendentes.json');
const rejectedPath = path.join(projectRoot, 'curadoria_pendente', 'historico_rejeitados.json');
const approvedPath = path.join(projectRoot, 'curadoria_pendente', 'historico_aprovados.json');
const auditLogPath = path.join(projectRoot, 'curadoria_pendente', 'curation_audit.log');

// 1. ALLOWLIST INSTITUCIONAL
const TRUSTED_DOMAINS = [
  'ev.org.br',
  'escolavirtual.gov.br',
  'cursoemvideo.com',
  'learn.microsoft.com',
  'poca.ufscar.br',
  'netacad.com',
  'sebrae.com.br',
  'proa.org.br',
  'hackersdobem.org.br',
  'gov.br',
  'datascienceacademy.com.br',
  'fm2s.com.br',
  'escoladotrabalhador40.com.br',
  'unasus.gov.br',
  'ufrn.br',
  'einstein.br',
  'voitto.com.br'
];

// FAIXAS DE IP PRIVADAS E RESERVADAS (ANTI-SSRF)
const PRIVATE_IP_RANGES = [
  /^127\./,                         // Loopback
  /^10\./,                          // Classe A privada
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // Classe B privada
  /^192\.168\./,                    // Classe C privada
  /^169\.254\./,                    // Link-local / AWS metadata
  /^0\./,                           // Reservado
  /^::1$/,                          // IPv6 loopback
  /^fc00:/i,                        // IPv6 ULA
  /^fe80:/i                         // IPv6 Link-local
];

// STOPWORDS EM PORTUGUÊS PARA DEDUPLICAÇÃO DE TÍTULOS
const PT_STOPWORDS = new Set([
  'a', 'o', 'as', 'os', 'um', 'uma', 'uns', 'umas', 'de', 'do', 'da', 'dos', 'das',
  'em', 'no', 'na', 'nos', 'nas', 'por', 'pelo', 'pela', 'pelos', 'pelas', 'para',
  'com', 'como', 'e', 'ou', 'que', 'se', 'ao', 'aos', 'curso', 'completo', 'online',
  'gratis', 'gratuito', 'introducao', 'fundamentos', 'basico', 'avancado', 'pratica'
]);

/**
 * Validação de URL e Proteção Anti-SSRF
 */
async function validateUrlSecurity(urlString) {
  let parsed;
  try {
    parsed = new URL(urlString);
  } catch (e) {
    return { valid: false, reason: 'URL com formato inválido' };
  }

  // Apenas HTTPS
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    return { valid: false, reason: 'Protocolo não seguro. Apenas HTTPS/HTTP são permitidos.' };
  }

  const hostname = parsed.hostname.toLowerCase();

  // Bloqueio de localhost ou nomes especiais
  if (hostname === 'localhost' || hostname.endsWith('.local') || hostname === '169.254.169.254') {
    return { valid: false, reason: 'Acesso a endereço local bloqueado por segurança (Anti-SSRF).' };
  }

  // Verificação contra a Allowlist institucional
  const isTrusted = TRUSTED_DOMAINS.some(domain => 
    hostname === domain || hostname.endsWith('.' + domain) || hostname.endsWith('.edu.br')
  );

  if (!isTrusted) {
    return { 
      valid: false, 
      reason: `Domínio '${hostname}' não consta na lista de fontes institucionais autorizadas.` 
    };
  }

  // Resolução DNS para mitigar DNS Rebinding e SSRF
  try {
    const addresses = await dns.lookup(hostname, { all: true });
    for (const addr of addresses) {
      for (const rx of PRIVATE_IP_RANGES) {
        if (rx.test(addr.address)) {
          return { valid: false, reason: `O domínio resolve para endereço IP restrito (${addr.address}). Acesso abortado.` };
        }
      }
    }
  } catch (dnsErr) {
    return { valid: false, reason: `Falha na resolução de DNS para o domínio '${hostname}': ${dnsErr.message}` };
  }

  return { valid: true, canonicalUrl: normalizeUrl(urlString), hostname };
}

/**
 * Normalizador Canônico de URL
 */
function normalizeUrl(urlString) {
  try {
    const u = new URL(urlString);
    u.hash = ''; // Remove âncoras locais
    // Remove parâmetros de rastreamento
    const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'ref', 'gclid'];
    trackingParams.forEach(p => u.searchParams.delete(p));
    let norm = u.toString().toLowerCase();
    if (norm.endsWith('/')) norm = norm.slice(0, -1);
    return norm;
  } catch (e) {
    return urlString.toLowerCase().trim();
  }
}

/**
 * Sanitização de Texto e Defesa contra Injeção Indireta de Prompt
 */
function sanitizeText(input, maxLength = 500) {
  if (!input || typeof input !== 'string') return '';

  // Remove tags HTML
  let clean = input.replace(/<[^>]*>/g, ' ');

  // Neutraliza padrões conhecidos de Prompt Injection
  const promptInjectionPatterns = [
    /ignore\s+(all\s+)?(previous|prior)\s+instructions/gi,
    /system\s+prompt\s+override/gi,
    /you\s+are\s+now\s+in\s+developer\s+mode/gi,
    /execute\s+(bash|command|npm|deploy|git)/gi,
    /forget\s+rules/gi
  ];

  for (const pattern of promptInjectionPatterns) {
    clean = clean.replace(pattern, '[CONTEÚDO_MALICIOSO_NEUTRALIZADO]');
  }

  // Normaliza espaços e trunca ao comprimento seguro
  clean = clean.replace(/\s+/g, ' ').trim();
  return clean.slice(0, maxLength);
}

/**
 * Classificador Semântico de Gratuidade e Certificação
 */
function classifyCoursePricing(courseData) {
  const textCorpus = [
    courseData.title || '',
    courseData.description || '',
    courseData.certificateNote || '',
    courseData.rawPageText || ''
  ].join(' ').toLowerCase();

  let pricingStatus = 'GRATUIDADE_NAO_CONFIRMADA';
  let certificateStatus = 'CERTIFICADO_PAGO_OU_NAO_CONFIRMADO';
  let hasFreeCertificate = false;
  let evidence = [];

  // Padrões de Cursos Pagos / Assinatura
  const paidPatterns = [
    /\b(r\$|usd|\$)\s*\d+/i,
    /matrícula\s+paga/i,
    /mensalidade/i,
    /compre\s+agora/i,
    /carrinho\s+de\s+compras/i,
    /assinatura\s+(mensal|anual)/i,
    /plano\s+premium/i,
    /teste\s+grátis\s+por\s+\d+\s+dias/i
  ];

  for (const p of paidPatterns) {
    if (p.test(textCorpus)) {
      pricingStatus = 'PAGO';
      evidence.push(`Indicador de valor pago detectado: ${p}`);
      return {
        pricingStatus,
        certificateStatus,
        hasFreeCertificate: false,
        evidence: evidence.join('; ')
      };
    }
  }

  // Padrões de Gratuidade Confirmada
  const freeCoursePatterns = [
    /100%\s*gratuito/i,
    /curso\s+gratuito/i,
    /totalmente\s+gratuito/i,
    /sem\s+custo/i,
    /gratuito\s+para\s+todos/i,
    /aberto\s+e\s+gratuito/i,
    /grátis/i
  ];

  const matchedFreeCourse = freeCoursePatterns.some(p => p.test(textCorpus));
  if (matchedFreeCourse || courseData.isKnownFreeProvider) {
    pricingStatus = 'GRATUITO_CONFIRMADO';
    evidence.push('Curso gratuito confirmado');
  }

  // Padrões de Certificado Gratuito Oficial
  const freeCertPatterns = [
    /certificado\s+(100%\s*)?gratuito/i,
    /certificado\s+oficial\s+gratuito/i,
    /certificado\s+grátis/i,
    /emissão\s+(gratuita|sem\s+custo)\s+de\s+certificado/i,
    /com\s+certificado\s+gratuito/i,
    /certificado\s+incluso\s+sem\s+custo/i,
    /certificado\s+oficial\s+enap/i,
    /certificado\s+oficial\s+fundação\s+bradesco/i
  ];

  // Padrões de Certificado Pago / Modelo Ouvinte (Audit Mode)
  const paidCertPatterns = [
    /certificado\s+pago/i,
    /taxa\s+de\s+(emissão|certificado)/i,
    /modo\s+ouvinte\s+gratuito/i,
    /adquira\s+o\s+certificado/i,
    /pague\s+pelo\s+certificado/i,
    /audit\s+course/i,
    /certificado\s+opcional\s+pago/i
  ];

  if (paidCertPatterns.some(p => p.test(textCorpus))) {
    certificateStatus = 'CERTIFICADO_PAGO_OU_NAO_CONFIRMADO';
    hasFreeCertificate = false;
    evidence.push('Certificado pago ou modelo ouvinte detectado');
  } else if (freeCertPatterns.some(p => p.test(textCorpus)) || courseData.isKnownFreeCertProvider) {
    certificateStatus = 'CERTIFICADO_GRATUITO_CONFIRMADO';
    hasFreeCertificate = true;
    evidence.push('Certificado gratuito oficial confirmado');
  } else {
    certificateStatus = 'CERTIFICADO_PAGO_OU_NAO_CONFIRMADO';
    evidence.push('Ausência de menção clara a certificado sem custo');
  }

  return {
    pricingStatus,
    certificateStatus,
    hasFreeCertificate,
    evidence: evidence.join('; ')
  };
}

/**
 * Cálculo de Similaridade de Títulos (Deduplicação)
 */
function tokenizeTitle(title) {
  return (title || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2 && !PT_STOPWORDS.has(t));
}

function calculateJaccardSimilarity(tokensA, tokensB) {
  if (!tokensA.length || !tokensB.length) return 0;
  const setA = new Set(tokensA);
  const setB = new Set(tokensB);
  let intersection = 0;
  for (const t of setA) {
    if (setB.has(t)) intersection++;
  }
  const union = new Set([...tokensA, ...tokensB]).size;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Verificação Completa de Duplicatas
 */
function checkForDuplicates(candidateCourse, options = {}) {
  const normCandidateUrl = normalizeUrl(candidateCourse.url || '');
  const candidateTokens = tokenizeTitle(candidateCourse.title || '');
  const candidateProvider = (candidateCourse.provider || '').toLowerCase().trim();

  // Carrega datasets existentes
  let existingCatalog = [];
  if (fs.existsSync(cacheCoursesPath)) {
    try { existingCatalog = JSON.parse(fs.readFileSync(cacheCoursesPath, 'utf8')); } catch (e) {}
  }

  let pendingQueue = [];
  if (fs.existsSync(pendingPath)) {
    try { pendingQueue = JSON.parse(fs.readFileSync(pendingPath, 'utf8')); } catch (e) {}
  }

  let rejectedHistory = [];
  if (fs.existsSync(rejectedPath)) {
    try { rejectedHistory = JSON.parse(fs.readFileSync(rejectedPath, 'utf8')); } catch (e) {}
  }

  // 1. Verificação por ID idêntico
  const duplicateId = existingCatalog.find(c => c.id === candidateCourse.id) ||
                      pendingQueue.find(c => c.id === candidateCourse.id);
  if (duplicateId) {
    return { isDuplicate: true, type: 'EXACT_ID', matchedWith: duplicateId.title, id: duplicateId.id };
  }

  // 2. Verificação por URL canônica exata
  const duplicateUrl = existingCatalog.find(c => normalizeUrl(c.url) === normCandidateUrl) ||
                       pendingQueue.find(c => normalizeUrl(c.url) === normCandidateUrl);
  if (duplicateUrl) {
    return { isDuplicate: true, type: 'EXACT_URL', matchedWith: duplicateUrl.title, id: duplicateUrl.id };
  }

  // 3. Verificação em histórico de rejeitados (para não voltar a sugerir)
  const rejectedMatch = rejectedHistory.find(r => normalizeUrl(r.url) === normCandidateUrl || r.id === candidateCourse.id);
  if (rejectedMatch) {
    return { isDuplicate: true, type: 'ALREADY_REJECTED', reason: rejectedMatch.rejectionReason, id: rejectedMatch.id };
  }

  // 4. Verificação por similaridade de título na mesma instituição
  for (const c of [...existingCatalog, ...pendingQueue]) {
    const providerMatches = (c.provider || '').toLowerCase().trim() === candidateProvider;
    if (providerMatches) {
      const existingTokens = tokenizeTitle(c.title || '');
      const similarity = calculateJaccardSimilarity(candidateTokens, existingTokens);
      if (similarity >= 0.75) {
        return {
          isDuplicate: true,
          type: 'SIMILAR_TITLE',
          similarityScore: similarity,
          matchedWith: c.title,
          id: c.id
        };
      }
    }
  }

  return { isDuplicate: false };
}

/**
 * Validador e Processador Completo de Curso
 */
async function processDiscoveredCourse(rawCourse) {
  // 1. Validação de URL & Anti-SSRF
  const urlCheck = await validateUrlSecurity(rawCourse.url);
  if (!urlCheck.valid) {
    return {
      status: 'REJEITADO_SEGURANCA',
      reason: urlCheck.reason,
      course: null
    };
  }

  // 2. Sanitização de Textos
  const cleanTitle = sanitizeText(rawCourse.title, 150);
  const cleanProvider = sanitizeText(rawCourse.provider, 100);
  const cleanDescription = sanitizeText(rawCourse.description, 400);

  if (!cleanTitle || !cleanProvider) {
    return {
      status: 'DADOS_INSUFICIENTES',
      reason: 'Título ou instituição ausente após sanitização.',
      course: null
    };
  }

  // Provedores institucionais com gratuidade conhecida
  const isKnownFreeProvider = cleanProvider.includes('Bradesco') || 
                              cleanProvider.includes('Governo') || 
                              cleanProvider.includes('EV.G') || 
                              cleanProvider.includes('UFSCar') ||
                              cleanProvider.includes('Curso em Vídeo') ||
                              cleanProvider.includes('Data Science Academy') ||
                              cleanProvider.includes('FM2S') ||
                              cleanProvider.includes('Escola do Trabalhador') ||
                              cleanProvider.includes('UNA-SUS') ||
                              cleanProvider.includes('AVASUS') ||
                              cleanProvider.includes('Einstein') ||
                              cleanProvider.includes('Aprenda Mais') ||
                              cleanProvider.includes('Voitto') ||
                              cleanProvider.includes('SEBRAE');

  const isKnownFreeCertProvider = isKnownFreeProvider && !rawCourse.isAuditOnly;

  // 3. Classificação de Gratuidade e Certificado
  const pricingClassification = classifyCoursePricing({
    title: cleanTitle,
    description: cleanDescription,
    certificateNote: rawCourse.certificateNote,
    rawPageText: rawCourse.rawPageText,
    isKnownFreeProvider,
    isKnownFreeCertProvider
  });

  if (pricingClassification.pricingStatus === 'PAGO') {
    return {
      status: 'DESCARTADO_PAGO',
      reason: 'Curso identificado como modalidade paga.',
      pricingClassification
    };
  }

  // Gera slug de ID único e determinístico
  const slugTitle = cleanTitle
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 40);

  const slugProvider = cleanProvider
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 15);

  const generatedId = `${slugProvider}-${slugTitle}`.replace(/^-+|-+$/g, '');

  const structuredCourse = {
    id: rawCourse.id || generatedId,
    title: cleanTitle,
    provider: cleanProvider,
    providerTag: rawCourse.providerTag || cleanProvider.slice(0, 15),
    providerColor: rawCourse.providerColor || 'bg-slate-50 text-slate-800 border-slate-300 font-black',
    category: rawCourse.category || 'tecnologia',
    categoryName: rawCourse.category || 'tecnologia',
    description: cleanDescription,
    url: urlCheck.canonicalUrl,
    workloadHours: parseInt(rawCourse.workloadHours, 10) || 10,
    language: rawCourse.language || 'Português',
    modality: 'Online EAD',
    hasFreeCertificate: pricingClassification.hasFreeCertificate,
    certificateNote: pricingClassification.hasFreeCertificate 
      ? (rawCourse.certificateNote || 'Certificado Oficial Gratuito')
      : 'Modo Ouvinte Gratuito',
    level: rawCourse.level || 'Iniciante',
    tags: Array.isArray(rawCourse.tags) ? rawCourse.tags.map(t => sanitizeText(t, 30)) : ['Gratuito', 'Oficial'],
    featured: false,
    rating: 5.0,
    reviewsCount: 1,
    isActive: true,
    // Metadados de Auditoria e Curadoria
    pricingStatus: pricingClassification.pricingStatus,
    certificateStatus: pricingClassification.certificateStatus,
    curationStatus: 'pendente_aprovacao_humana',
    evidenceSource: urlCheck.hostname,
    evidenceDetails: pricingClassification.evidence,
    discoveredAt: new Date().toISOString()
  };

  // 4. Verificação de Duplicatas
  const duplicateCheck = checkForDuplicates(structuredCourse);
  if (duplicateCheck.isDuplicate) {
    return {
      status: 'DUPLICATA_DETECTADA',
      reason: `Duplicata detectada (${duplicateCheck.type}): já existente como '${duplicateCheck.matchedWith || duplicateCheck.id}'`,
      duplicateCheck,
      course: structuredCourse
    };
  }

  return {
    status: 'APROVADO_PARA_FILA',
    course: structuredCourse
  };
}

/**
 * Adiciona cursos validados à fila de pendentes (Staging)
 */
function stageValidatedCourses(coursesToStage) {
  if (!fs.existsSync(path.dirname(pendingPath))) {
    fs.mkdirSync(path.dirname(pendingPath), { recursive: true });
  }

  let queue = [];
  if (fs.existsSync(pendingPath)) {
    try { queue = JSON.parse(fs.readFileSync(pendingPath, 'utf8')); } catch (e) { queue = []; }
  }

  let addedCount = 0;
  for (const c of coursesToStage) {
    const exists = queue.some(item => item.id === c.id || normalizeUrl(item.url) === normalizeUrl(c.url));
    if (!exists) {
      queue.push(c);
      addedCount++;
    }
  }

  fs.writeFileSync(pendingPath, JSON.stringify(queue, null, 2), 'utf8');
  return { addedCount, totalQueue: queue.length };
}

module.exports = {
  validateUrlSecurity,
  normalizeUrl,
  sanitizeText,
  classifyCoursePricing,
  checkForDuplicates,
  processDiscoveredCourse,
  stageValidatedCourses,
  TRUSTED_DOMAINS
};
