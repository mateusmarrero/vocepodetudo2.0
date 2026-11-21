/**
 * fix_spelling.js
 * Corrige ortografia e acentuação em arquivos do portal Você Pode Tudo.
 * - Corrige meta keywords sem acento em arquivos HTML
 * - Corrige palavras sem acento no seed_blog.json (encoding issue)
 * - Corrige palavras sem acento no seed_jobs.json (apenas texto visível)
 * USO: node scripts/fix_spelling.js
 */

const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, '..');

// ============================================================
// CORREÇÕES ESPECÍFICAS PARA TEXTOS VISÍVEIS AO USUÁRIO
// ============================================================

/**
 * Dicionário de substituições para palavras com problemas de codificação.
 * Essas correções aplicam-se APENAS ao conteúdo textual visível,
 * NÃO a IDs, classes, atributos técnicos, slugs, URLs, etc.
 * 
 * Formato: [regex, substituição]
 * A regex deve ser escrita para evitar falsos positivos.
 */
const TEXT_CORRECTIONS = [
  // Palavras sem til/cedilha (padrão -ao sem acento que deveria ser -ção)
  // Essas só aparecem em contexto de texto corrompido
  [/\bComunicao\b/g, 'Comunicação'],
  [/\bcomunicao\b/g, 'comunicação'],
  [/\bEducao\b/g, 'Educação'],
  [/\beducao\b/g, 'educação'],
  [/\bQualificao\b/g, 'Qualificação'],
  [/\bqualificao\b/g, 'qualificação'],
  [/\bCapacitao\b/g, 'Capacitação'],
  [/\bcapacitao\b/g, 'capacitação'],
  [/\bFormao\b/g, 'Formação'],
  [/\bformao\b/g, 'formação'],
  [/\bAdministrao\b/g, 'Administração'],
  [/\badministrao\b/g, 'administração'],
  [/\bCertificao\b/g, 'Certificação'],
  [/\bcertificao\b/g, 'certificação'],
  [/\bIdentificao\b/g, 'Identificação'],
  [/\bidentificao\b/g, 'identificação'],
  [/\bIndicao\b/g, 'Indicação'],
  [/\bindicao\b/g, 'indicação'],
  [/\bComplicao\b/g, 'Complicação'],
  [/\bcomplicao\b/g, 'complicação'],
  [/\bProgramao\b/g, 'Programação'],
  [/\bprogramao\b/g, 'programação'],
  [/\bPublicao\b/g, 'Publicação'],
  [/\bpublicao\b/g, 'publicação'],
  [/\bContratao\b/g, 'Contratação'],
  [/\bcontratao\b/g, 'contratação'],
  [/\bPromoao\b/g, 'Promoção'],
  [/\bpromoao\b/g, 'promoção'],
  [/\bPromoo\b/g, 'Promoção'],
  [/\bpromoo\b/g, 'promoção'],
  [/\bSelecao\b/g, 'Seleção'],
  [/\bselecao\b/g, 'seleção'],
  [/\bEfetivao\b/g, 'Efetivação'],
  [/\befetivao\b/g, 'efetivação'],
  [/\bVocao\b/g, 'Vocação'],
  [/\bvocao\b/g, 'vocação'],
  [/\bProcrastinaao\b/g, 'Procrastinação'],
  [/\bprocrastinaao\b/g, 'procrastinação'],
  [/\bConversao\b/g, 'Conversão'],
  [/\bconversao\b/g, 'conversão'],
  [/\bContratao\b/g, 'Contratação'],
  [/\bcontratao\b/g, 'contratação'],
  [/\bContratao\b/g, 'Contratação'],
  [/\bcontratao\b/g, 'contratação'],
  [/\bRevoluao\b/g, 'Revolução'],
  [/\brevoluao\b/g, 'revolução'],
  [/\bRevolo\b/g, 'Revolução'],
  [/\brevolo\b/g, 'revolução'],
  [/\bSoluo\b/g, 'Solução'],
  [/\bsoluo\b/g, 'solução'],
  [/\bGesto\b(?!\s+de)/g, 'Gestão'],
  [/\bgesto\b(?!\s+de)/g, 'gestão'],
  [/\bPrestao\b/g, 'Prestação'],
  [/\bprestao\b/g, 'prestação'],
  [/\bPresentao\b/g, 'Apresentação'],
  [/\bpresentao\b/g, 'apresentação'],
  [/\bColaborao\b/g, 'Colaboração'],
  [/\bcolaborao\b/g, 'colaboração'],
  [/\bColocao\b/g, 'Colocação'],
  [/\bcolocao\b/g, 'colocação'],
  [/\bEmoao\b/g, 'Emoção'],
  [/\bemoao\b/g, 'emoção'],
  [/\bImplementao\b/g, 'Implementação'],
  [/\bimplementao\b/g, 'implementação'],
  [/\bOrientao\b/g, 'Orientação'],
  [/\borientao\b/g, 'orientação'],
  [/\bAdaptao\b/g, 'Adaptação'],
  [/\badaptao\b/g, 'adaptação'],
  [/\bAvaliacao\b/g, 'Avaliação'],
  [/\bavaliacao\b/g, 'avaliação'],
  [/\bPresentao\b/g, 'Apresentação'],
  [/\bpresentao\b/g, 'apresentação'],
  [/\bContratao\b/g, 'Contratação'],
  [/\bcontratao\b/g, 'contratação'],
  
  // Palavras com acento agudo/circunflexo perdido
  [/\bInteligncia\b/g, 'Inteligência'],
  [/\binteligncia\b/g, 'inteligência'],
  [/\bCompetncia\b/g, 'Competência'],
  [/\bcompetncia\b/g, 'competência'],
  [/\bCompetncias\b/g, 'Competências'],
  [/\bcompetncias\b/g, 'competências'],
  [/\bExcelncia\b/g, 'Excelência'],
  [/\bexcelncia\b/g, 'excelência'],
  [/\bExperncia\b/g, 'Experiência'],
  [/\bexperncia\b/g, 'experiência'],
  [/\bExperncias\b/g, 'Experiências'],
  [/\bexperncias\b/g, 'experiências'],
  [/\bPermanncia\b/g, 'Permanência'],
  [/\bpermanncia\b/g, 'permanência'],
  [/\bEvidncia\b/g, 'Evidência'],
  [/\bevidncia\b/g, 'evidência'],
  [/\bNvel\b/g, 'Nível'],
  [/\bnvel\b/g, 'nível'],
  [/\bNveis\b/g, 'Níveis'],
  [/\bnveis\b/g, 'níveis'],
  [/\bTcnico\b/g, 'Técnico'],
  [/\btcnico\b/g, 'técnico'],
  [/\bTcnica\b/g, 'Técnica'],
  [/\btcnica\b/g, 'técnica'],
  [/\bTcnicos\b/g, 'Técnicos'],
  [/\btcnicos\b/g, 'técnicos'],
  [/\bTcnicas\b/g, 'Técnicas'],
  [/\btcnicas\b/g, 'técnicas'],
  [/\bPblico\b/g, 'Público'],
  [/\bpblico\b/g, 'público'],
  [/\bPblicos\b/g, 'Públicos'],
  [/\bpblicos\b/g, 'públicos'],
  [/\bPblica\b/g, 'Pública'],
  [/\bpblica\b/g, 'pública'],
  [/\bPblicas\b/g, 'Públicas'],
  [/\bpblicas\b/g, 'públicas'],
  [/\bCurrculo\b/g, 'Currículo'],
  [/\bcurrculo\b/g, 'currículo'],
  [/\bCurrculos\b/g, 'Currículos'],
  [/\bcurrculos\b/g, 'currículos'],
  [/\bLgica\b/g, 'Lógica'],
  [/\blgica\b/g, 'lógica'],
  [/\bLgico\b/g, 'Lógico'],
  [/\blgico\b/g, 'lógico'],
  [/\bEconmica\b/g, 'Econômica'],
  [/\beconmica\b/g, 'econômica'],
  [/\bEconmico\b/g, 'Econômico'],
  [/\beconmico\b/g, 'econômico'],
  [/\bPrprio\b/g, 'Próprio'],
  [/\bprprio\b/g, 'próprio'],
  [/\bPrpria\b/g, 'Própria'],
  [/\bprpria\b/g, 'própria'],
  [/\bCrebro\b/g, 'Cérebro'],
  [/\bcrebro\b/g, 'cérebro'],
  [/\bPrioridade\b/g, 'Prioridade'],  // already correct
  [/\bRpido\b/g, 'Rápido'],
  [/\brpido\b/g, 'rápido'],
  [/\bRpida\b/g, 'Rápida'],
  [/\brpida\b/g, 'rápida'],
  [/\bEspecfico\b/g, 'Específico'],
  [/\bespecfico\b/g, 'específico'],
  [/\bEspecfica\b/g, 'Específica'],
  [/\bespecfica\b/g, 'específica'],
  [/\bPrtico\b/g, 'Prático'],
  [/\bprtico\b/g, 'prático'],
  [/\bPrtica\b/g, 'Prática'],
  [/\bprtica\b/g, 'prática'],
  [/\bPrticos\b/g, 'Práticos'],
  [/\bprticos\b/g, 'práticos'],
  [/\bPrticas\b/g, 'Práticas'],
  [/\bprticas\b/g, 'práticas'],
  [/\bBsico\b/g, 'Básico'],
  [/\bbsico\b/g, 'básico'],
  [/\bBsica\b/g, 'Básica'],
  [/\bbsica\b/g, 'básica'],
  [/\bBsicos\b/g, 'Básicos'],
  [/\bbsicos\b/g, 'básicos'],
  [/\bMximo\b/g, 'Máximo'],
  [/\bmximo\b/g, 'máximo'],
  [/\bMnimo\b/g, 'Mínimo'],
  [/\bmnimo\b/g, 'mínimo'],
  [/\bMnima\b/g, 'Mínima'],
  [/\bmnima\b/g, 'mínima'],
  [/\bltimo\b/g, 'Último'],
  [/\bltimo\b/g, 'último'],
  [/\bltima\b/g, 'Última'],
  [/\bltima\b/g, 'última'],
  [/\bltimos\b/g, 'Últimos'],
  [/\bltimos\b/g, 'últimos'],
  [/\bnico\b/g, 'único'],
  [/\bnica\b/g, 'única'],
  [/\bNico\b/g, 'Único'],
  [/\bNica\b/g, 'Única'],
  [/\bNicos\b/g, 'Únicos'],
  [/\bnicos\b/g, 'únicos'],
  
  // "Voc" sem acento (Você)
  [/\bVoc\b(?!\s*[êe])/g, 'Você'],
  [/\bvoc\b(?!\s*[êe])/g, 'você'],
  
  // "é" perdido (tricky - " a" como cópula vs. "é")
  // These patterns appear as space-then-letter at start of clause
  // Specific patterns from the seed_blog content
  [/ a pioneira\b/g, ' é pioneira'],
  [/ o portal\b/g, ' é o portal'],
  [/ a plataforma\b/g, ' é a plataforma'],
  [/ a maior\b/g, ' é a maior'],
  [/ o maior\b/g, ' é o maior'],
  [/ o melhor\b/g, ' é o melhor'],
  [/ a melhor\b/g, ' é a melhor'],
  [/ um\b/g, 'é um'],  // too broad, skip
  [/ uma\b/g, 'é uma'],  // too broad, skip
  
  // "são" (they are) written as "so"
  // Very risky - "so" is also a valid word (preposition)
  // Skip automated fix for "são"
  
  // Oratória
  [/\bOratria\b/g, 'Oratória'],
  [/\boratria\b/g, 'oratória'],
  
  // Tecnológica
  [/\bTecnolgica\b/g, 'Tecnológica'],
  [/\btecnolgica\b/g, 'tecnológica'],
  [/\bTecnolgico\b/g, 'Tecnológico'],
  [/\btecnolgico\b/g, 'tecnológico'],
  
  // Histórico
  [/\bHistrico\b/g, 'Histórico'],
  [/\bhistrico\b/g, 'histórico'],
  [/\bHistrica\b/g, 'Histórica'],
  [/\bhistrica\b/g, 'histórica'],
  
  // Eletrônico
  [/\bEletrnico\b/g, 'Eletrônico'],
  [/\beletrnico\b/g, 'eletrônico'],
  
  // Autônomo
  [/\bAutnomo\b/g, 'Autônomo'],
  [/\bautnomo\b/g, 'autônomo'],
  
  // Dinâmico
  [/\bDinmico\b/g, 'Dinâmico'],
  [/\bdinmico\b/g, 'dinâmico'],
  
  // Acadêmico
  [/\bAcadmico\b/g, 'Acadêmico'],
  [/\bacadmico\b/g, 'acadêmico'],
  
  // Estratégico
  [/\bEstratgico\b/g, 'Estratégico'],
  [/\bestratgico\b/g, 'estratégico'],
  
  // Científico
  [/\bCientfico\b/g, 'Científico'],
  [/\bcientfico\b/g, 'científico'],
  
  // Código
  [/\bCdigo\b/g, 'Código'],
  [/\bcdigo\b/g, 'código'],
  
  // Período
  [/\bPerodo\b/g, 'Período'],
  [/\bperodo\b/g, 'período'],
  
  // Número
  [/\bNmero\b/g, 'Número'],
  [/\bnmero\b/g, 'número'],
  [/\bNmeros\b/g, 'Números'],
  [/\bnmeros\b/g, 'números'],
  
  // Fácil / Difícil
  [/\bFcil\b/g, 'Fácil'],
  [/\bfcil\b/g, 'fácil'],
  [/\bDifcil\b/g, 'Difícil'],
  [/\bdifcil\b/g, 'difícil'],
  
  // Análise
  [/\bAnlise\b/g, 'Análise'],
  [/\banlise\b/g, 'análise'],
  
  // Título
  [/\bTtulo\b/g, 'Título'],
  [/\bttulo\b/g, 'título'],
  
  // Língua
  [/\bLngua\b/g, 'Língua'],
  [/\blngua\b/g, 'língua'],
  
  // Próximo
  [/\bPrximo\b/g, 'Próximo'],
  [/\bprximo\b/g, 'próximo'],
  
  // Função
  [/\bFuno\b/g, 'Função'],
  [/\bfuno\b/g, 'função'],
  
  // Referência
  [/\bReferncia\b/g, 'Referência'],
  [/\breferncia\b/g, 'referência'],
  
  // Importância
  [/\bImportncia\b/g, 'Importância'],
  [/\bimportncia\b/g, 'importância'],
  
  // Eficiência
  [/\bEficincia\b/g, 'Eficiência'],
  [/\beficincia\b/g, 'eficiência'],
  
  // Presença
  [/\bPresena\b/g, 'Presença'],
  [/\bpresena\b/g, 'presença'],
  
  // Distância
  [/\bDistncias\b/g, 'Distâncias'],
  [/\bdistncias\b/g, 'distâncias'],
  [/\bDistncias\b/g, 'Distâncias'],
  [/\bdistncia\b/g, 'distância'],
  [/\bDistncias\b/g, 'Distâncias'],
  
  // Já
  // "j" without accent - very risky to replace broadly
  
  // Através
  [/\bAtravs\b/g, 'Através'],
  [/\batravs\b/g, 'através'],
  
  // Também
  [/\bTambm\b/g, 'Também'],
  [/\btambm\b/g, 'também'],
  
  // Além
  [/\bAlm\b/g, 'Além'],
  [/\balm\b/g, 'além'],
  
  // Então
  [/\bEnto\b/g, 'Então'],
  [/\bento\b/g, 'então'],
  
  // Ação
  [/\bAo\b(?!\s*de)/g, null],  // too risky
  
  // Questão
  [/\bQuesto\b/g, 'Questão'],
  [/\bquesto\b/g, 'questão'],
  [/\bQuestos\b/g, 'Questões'],
  [/\bquestos\b/g, 'questões'],
  
  // Situação
  [/\bSituao\b/g, 'Situação'],
  [/\bsituao\b/g, 'situação'],
  
  // Lição
  [/\bLio\b/g, 'Lição'],
  [/\blio\b/g, 'lição'],
  
  // Razão
  [/\bRazo\b/g, 'Razão'],
  [/\brazo\b/g, 'razão'],
  
  // Descrição
  [/\bDescrio\b/g, 'Descrição'],
  [/\bdescrio\b/g, 'descrição'],
  
  // Avaliação
  [/\bAvaliao\b/g, 'Avaliação'],
  [/\bavaliao\b/g, 'avaliação'],
  
  // Associação
  [/\bAssociao\b/g, 'Associação'],
  [/\bassociao\b/g, 'associação'],
  
  // Iniciação / Iniciativa
  [/\bIniciao\b/g, 'Iniciação'],
  [/\biniciao\b/g, 'iniciação'],
  
  // Redação
  [/\bRedao\b/g, 'Redação'],
  [/\bredao\b/g, 'redação'],
  
  // Validação
  [/\bValidao\b/g, 'Validação'],
  [/\bvalidao\b/g, 'validação'],
  
  // Formalização
  [/\bFormalizao\b/g, 'Formalização'],
  [/\bformalizao\b/g, 'formalização'],
  
  // Preparação
  [/\bPreparao\b/g, 'Preparação'],
  [/\bpreparao\b/g, 'preparação'],
  
  // Contabilização / Comercialização
  [/\bComercializao\b/g, 'Comercialização'],
  [/\bcomercializao\b/g, 'comercialização'],
  
  // Análise
  [/\bAnlises\b/g, 'Análises'],
  [/\banlises\b/g, 'análises'],
  
  // Mês
  [/\bMs\b/g, 'Mês'],
  [/\bms\b/g, 'mês'],
  [/\bMeses\b/g, 'Meses'],  // already correct
  
  // Pré
  [/\bPr-\b/g, 'Pré-'],
  [/\bpr-\b/g, 'pré-'],
  
  // Língua / Inglês / Francês / Português
  [/\bIngls\b/g, 'Inglês'],
  [/\bingls\b/g, 'inglês'],
  [/\bPortugus\b/g, 'Português'],
  [/\bportugus\b/g, 'português'],
  
  // Já
  [/\bJ\b(?=\s)/g, null],  // too risky
  
  // Através / Área
  [/\brea\b/g, 'área'],
  [/\bRea\b/g, 'Área'],
  [/\breas\b/g, 'áreas'],
  [/\bReas\b/g, 'Áreas'],
  
  // Gênero
  [/\bGnero\b/g, 'Gênero'],
  [/\bgnero\b/g, 'gênero'],
  
  // Céu
  // skip
  
  // Função
  [/\bFunes\b/g, 'Funções'],
  [/\bfunes\b/g, 'funções'],
  
  // Posição
  [/\bPosio\b/g, 'Posição'],
  [/\bposio\b/g, 'posição'],
  
  // Eficiência
  [/\bEficicia\b/g, 'Eficácia'],
  [/\beficicia\b/g, 'eficácia'],
  
  // Claro / Inglês / Países etc
  [/\bPases\b/g, 'Países'],
  [/\bpases\b/g, 'países'],
  [/\bPas\b/g, 'País'],
  [/\bpas\b/g, 'país'],
  
  // Já
  [/\bJ foi\b/g, 'Já foi'],
  [/\bj foi\b/g, 'já foi'],
  [/\bJ que\b/g, 'Já que'],
  [/\bj que\b/g, 'já que'],
  [/\bJ existe\b/g, 'Já existe'],
  [/\bj existe\b/g, 'já existe'],
  [/\bj capacitou\b/g, 'já capacitou'],
  [/\bJ capacitou\b/g, 'Já capacitou'],
  [/\bj comprovou\b/g, 'já comprovou'],
  [/\bj passados\b/g, 'já passados'],
  
  // Preo (preço)
  [/\bPrero\b/g, 'Preço'],
  [/\bprero\b/g, 'preço'],
  [/\bPreo\b/g, 'Preço'],
  [/\bpreo\b/g, 'preço'],
  
  // Médio
  [/\bMdio\b/g, 'Médio'],
  [/\bmdio\b/g, 'médio'],
  
  // Lógico
  [/\bLgicos\b/g, 'Lógicos'],
  [/\blgicos\b/g, 'lógicos'],
  
  // Programação
  [/\bProgramaes\b/g, 'Programações'],
  
  // Gratuitamente
  // already correct
  
  // Cálculos
  [/\bClculos\b/g, 'Cálculos'],
  [/\bclculos\b/g, 'cálculos'],
  [/\bClculo\b/g, 'Cálculo'],
  [/\bclculo\b/g, 'cálculo'],
  
  // Autenticação
  [/\bAutenticao\b/g, 'Autenticação'],
  [/\bautenticao\b/g, 'autenticação'],
  
  // Certificados
  // already correct mostly
  
  // Universidade
  // already correct
  
  // Recrutadores / Recrutamento
  // already correct
  
  // Desenvolvimento
  // already correct
  
  // Rápidas / Urgentes
  [/\bRpidas\b/g, 'Rápidas'],
  [/\brpidas\b/g, 'rápidas'],
  [/\bRpidos\b/g, 'Rápidos'],
  [/\brpidos\b/g, 'rápidos'],
  
  // Mérito / Méritos
  [/\bMritos\b/g, 'Méritos'],
  [/\bmritos\b/g, 'méritos'],
  [/\bMrito\b/g, 'Mérito'],
  [/\bmrito\b/g, 'mérito'],
  
  // Crítico / Crítica
  [/\bCrtico\b/g, 'Crítico'],
  [/\bcrtico\b/g, 'crítico'],
  
  // Análise de dados
  [/\bdados;\b/g, 'dados;'],  // skip - ok
  
  // Demissão
  [/\bDemisso\b/g, 'Demissão'],
  [/\bdemisso\b/g, 'demissão'],
  
  // Seleção (processos seletivos)
  [/\bprocessos seletivos\b/g, 'processos seletivos'],  // already correct
  
  // Atualização
  [/\bAtualizao\b/g, 'Atualização'],
  [/\batualizao\b/g, 'atualização'],
  
  // Atuação
  [/\bAtuao\b/g, 'Atuação'],
  [/\batuao\b/g, 'atuação'],
  
  // Revisão
  [/\bReviso\b/g, 'Revisão'],
  [/\breviso\b/g, 'revisão'],
  
  // Contabilidade
  // already correct
  
  // ções → ções
  // Lições
  [/\bLies\b/g, 'Lições'],
  [/\blies\b/g, 'lições'],
  
  // Situações
  [/\bSituaes\b/g, 'Situações'],
  [/\bsituaes\b/g, 'situações'],
  
  // Interações
  [/\bInteraes\b/g, 'Interações'],
  [/\binteraes\b/g, 'interações'],
  
  // Avaliações
  [/\bAvalaes\b/g, 'Avaliações'],
  [/\bavalaes\b/g, 'avaliações'],
  
  // Contrataes (Contratações)
  [/\bContrataes\b/g, 'Contratações'],
  [/\bcontrataes\b/g, 'contratações'],
  
  // Barreiras
  // already correct
  
  // Já foi -> already handled above
  
  // "o" with caret needed in certain words
  [/\bFenomeno\b/g, 'Fenômeno'],
  [/\bfenomeno\b/g, 'fenômeno'],
  [/\bFenmeno\b/g, 'Fenômeno'],
  [/\bfenmeno\b/g, 'fenômeno'],
  
  // Autônomo
  [/\bAutnomos\b/g, 'Autônomos'],
  [/\bautnomas\b/g, 'autônomas'],
  
  // Neuroplasticidade - correct
  
  // Profissão
  [/\bProfisso\b/g, 'Profissão'],
  [/\bprofisso\b/g, 'profissão'],
  
  // Decisão
  [/\bDeciso\b/g, 'Decisão'],
  [/\bdeciso\b/g, 'decisão'],
  [/\bDecises\b/g, 'Decisões'],
  [/\bdecises\b/g, 'decisões'],
  
  // Efetivo / Efetivação
  [/\bEfetivao\b/g, 'Efetivação'],
  [/\befetivao\b/g, 'efetivação'],
];

// Filter out null replacements (skipped items)
const ACTIVE_CORRECTIONS = TEXT_CORRECTIONS.filter(([, rep]) => rep !== null);

/**
 * Apply text corrections to a string, only affecting visible text content
 * and not technical attributes.
 * Returns the corrected string and count of replacements.
 */
function applyCorrections(content, corrections) {
  let result = content;
  let totalChanges = 0;
  
  for (const [pattern, replacement] of corrections) {
    const before = result;
    result = result.replace(pattern, replacement);
    if (result !== before) {
      // Count approximate changes
      const matches = before.match(pattern);
      if (matches) totalChanges += matches.length;
    }
  }
  
  return { content: result, changes: totalChanges };
}

/**
 * Fix meta keywords in HTML files - add accents to keywords in meta[name=keywords]
 */
function fixMetaKeywords(content) {
  // Fix keywords attribute content
  return content.replace(
    /(<meta\s+name="keywords"\s+content=")(.*?)(")/gs,
    (match, before, keywords, after) => {
      let fixed = keywords;
      // Fix common unaccented words in SEO keywords
      fixed = fixed.replace(/\bvoce pode tudo\b/gi, 'você pode tudo');
      fixed = fixed.replace(/\bqualificacao\b/gi, 'qualificação');
      fixed = fixed.replace(/\btransicao\b/gi, 'transição');
      fixed = fixed.replace(/\beducacao\b/gi, 'educação');
      fixed = fixed.replace(/\bselecao\b/gi, 'seleção');
      fixed = fixed.replace(/\borientacao\b/gi, 'orientação');
      fixed = fixed.replace(/\bconcurso publico\b/gi, 'concurso público');
      return before + fixed + after;
    }
  );
}

// ============================================================
// MAIN
// ============================================================

const FILES_TO_FIX = {
  'api/seed_blog.json': { type: 'json', fixEncoding: true },
  'api/seed_jobs.json': { type: 'json', fixEncoding: false },
  'src/data/courses.js': { type: 'js', fixEncoding: false },
};

const HTML_FILES_TO_FIX = [
  'index.html', 'curriculo.html', 'vagas.html', 'blog.html',
  'calculadora-trabalhista.html', 'downloads.html', 'sobre.html',
  'contato.html', 'politica-privacidade.html', 'termos-de-uso.html',
  'teste-vocacional.html', '404.html', 'vagas-jovem-aprendiz-2026.html',
  'cursos-gratis-administracao.html', 'cursos-gratis-excel.html',
  'cursos-gratis-ia.html', 'cursos-gratis-informatica.html',
  'cursos-gratis-ingles.html', 'cursos-gratis-programacao.html',
  'simulador-entrevista.html', 'materiais-gratuitos.html',
];

const report = {
  generated: new Date().toISOString(),
  files: {},
  totalChanges: 0,
};

function processFile(filePath, { fixEncoding, type }) {
  const fullPath = path.join(BASE, filePath);
  if (!fs.existsSync(fullPath)) {
    console.warn(`⚠ Arquivo não encontrado: ${fullPath}`);
    return 0;
  }
  
  // Create backup
  const backupPath = fullPath + '.bak_spell';
  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(fullPath, backupPath);
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  const original = content;
  
  // Apply fixes
  if (fixEncoding) {
    const { content: fixed, changes } = applyCorrections(content, ACTIVE_CORRECTIONS);
    content = fixed;
    report.files[filePath] = { changes };
    report.totalChanges += changes;
  }
  
  if (type === 'html') {
    content = fixMetaKeywords(content);
  }
  
  if (content !== original) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ ${filePath}: alterações aplicadas`);
  } else {
    console.log(`ℹ ${filePath}: sem alterações`);
  }
  
  return content !== original ? 1 : 0;
}

// Process JSON/JS files  
console.log('\n=== CORRIGINDO ARQUIVOS DE DADOS ===\n');
for (const [filePath, options] of Object.entries(FILES_TO_FIX)) {
  processFile(filePath, options);
}

// Process HTML files (only meta keywords fix for now)
console.log('\n=== CORRIGINDO ARQUIVOS HTML ===\n');
for (const htmlFile of HTML_FILES_TO_FIX) {
  const fullPath = path.join(BASE, htmlFile);
  if (!fs.existsSync(fullPath)) {
    console.warn(`⚠ Não encontrado: ${htmlFile}`);
    continue;
  }
  
  // Backup
  const backupPath = fullPath + '.bak_spell';
  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(fullPath, backupPath);
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  const original = content;
  
  content = fixMetaKeywords(content);
  
  if (content !== original) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ ${htmlFile}: meta keywords corrigidos`);
  } else {
    console.log(`ℹ ${htmlFile}: sem alterações`);
  }
}

// Save report
const reportPath = path.join(__dirname, 'spelling_fix_report.json');
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
console.log(`\nRelatório salvo em: ${reportPath}`);
console.log(`Total de alterações: ${report.totalChanges}`);
