/**
 * fix_blog_encoding_v3.js
 * Versão 3 - corrige encoding em seed_blog.json usando lookbehind/lookahead Unicode.
 * Não altera palavras que já têm acentos corretos.
 * USO: node scripts/fix_blog_encoding_v3.js
 */

const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, '..');

// Conjunto completo de caracteres de letras (incluindo acentuados) para lookbehind/ahead
const LETTER = '[a-záéíóúâêîôûãõàüçÁÉÍÓÚÂÊÎÔÛÃÕÀÜÇ]';

/**
 * Cria uma regex Unicode-aware que só faz match quando a palavra não é precedida
 * nem seguida por letras (incluindo acentuadas).
 */
function wordRegex(word, flags = 'g') {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?<!${LETTER})${escaped}(?!${LETTER})`, flags);
}

// Dicionário de correções: [padrão sem acento, correção com acento]
// Apenas palavras que podem aparecer isoladas (sem serem prefixo/sufixo de palavra maior acentuada)
const CORRECTIONS = [
  // ======= Sufixo -ao → -ção/-são ========
  ['Comunicao', 'Comunicação'],
  ['comunicao', 'comunicação'],
  ['Educao', 'Educação'],
  ['educao', 'educação'],
  ['Qualificao', 'Qualificação'],
  ['qualificao', 'qualificação'],
  ['Capacitao', 'Capacitação'],
  ['capacitao', 'capacitação'],
  ['Formao', 'Formação'],
  ['formao', 'formação'],
  ['Administrao', 'Administração'],
  ['administrao', 'administração'],
  ['Certificao', 'Certificação'],
  ['certificao', 'certificação'],
  ['Contratao', 'Contratação'],
  ['contratao', 'contratação'],
  ['Autenticao', 'Autenticação'],
  ['autenticao', 'autenticação'],
  ['Validao', 'Validação'],
  ['validao', 'validação'],
  ['Redao', 'Redação'],
  ['redao', 'redação'],
  ['Situao', 'Situação'],
  ['situao', 'situação'],
  ['Revoluao', 'Revolução'],
  ['revoluao', 'revolução'],
  ['Revoluo', 'Revolução'],
  ['revoluo', 'revolução'],
  ['Atribuio', 'Atribuição'],
  ['atribuio', 'atribuição'],
  ['Instituio', 'Instituição'],
  ['instituio', 'instituição'],
  ['Inscrio', 'Inscrição'],
  ['inscrio', 'inscrição'],
  ['Implementao', 'Implementação'],
  ['implementao', 'implementação'],
  ['Identificao', 'Identificação'],
  ['identificao', 'identificação'],
  ['Indicao', 'Indicação'],
  ['indicao', 'indicação'],
  ['Colaborao', 'Colaboração'],
  ['colaborao', 'colaboração'],
  ['Associao', 'Associação'],
  ['associao', 'associação'],
  ['Atualizao', 'Atualização'],
  ['atualizao', 'atualização'],
  ['Atuao', 'Atuação'],
  ['atuao', 'atuação'],
  ['Avaliao', 'Avaliação'],
  ['avaliao', 'avaliação'],
  ['Comemorao', 'Comemoração'],
  ['comemorao', 'comemoração'],
  ['Complicao', 'Complicação'],
  ['complicao', 'complicação'],
  ['Colocao', 'Colocação'],
  ['colocao', 'colocação'],
  ['Comercializao', 'Comercialização'],
  ['comercializao', 'comercialização'],
  ['Conexo', 'Conexão'],
  ['conexo', 'conexão'],
  ['Concluso', 'Conclusão'],
  ['concluso', 'conclusão'],
  ['Contribuio', 'Contribuição'],
  ['contribuio', 'contribuição'],
  ['Conversao', 'Conversão'],
  ['conversao', 'conversão'],
  ['Criao', 'Criação'],
  ['criao', 'criação'],
  ['Deciso', 'Decisão'],
  ['deciso', 'decisão'],
  ['Demonstrao', 'Demonstração'],
  ['demonstrao', 'demonstração'],
  ['Demisso', 'Demissão'],
  ['demisso', 'demissão'],
  ['Descrio', 'Descrição'],
  ['descrio', 'descrição'],
  ['Dedicao', 'Dedicação'],
  ['dedicao', 'dedicação'],
  ['Digitalizao', 'Digitalização'],
  ['digitalizao', 'digitalização'],
  ['Efetivao', 'Efetivação'],
  ['efetivao', 'efetivação'],
  ['Elaborao', 'Elaboração'],
  ['elaborao', 'elaboração'],
  ['Exibio', 'Exibição'],
  ['exibio', 'exibição'],
  ['Explicao', 'Explicação'],
  ['explicao', 'explicação'],
  ['Explorao', 'Exploração'],
  ['explorao', 'exploração'],
  ['Funo', 'Função'],
  ['funo', 'função'],
  ['Gesto', 'Gestão'],
  ['gesto', 'gestão'],
  ['Graduao', 'Graduação'],
  ['graduao', 'graduação'],
  ['Inovao', 'Inovação'],
  ['inovao', 'inovação'],
  ['Iniciao', 'Iniciação'],
  ['iniciao', 'iniciação'],
  ['Interao', 'Interação'],
  ['interao', 'interação'],
  ['Ligao', 'Ligação'],
  ['ligao', 'ligação'],
  ['Manuteno', 'Manutenção'],
  ['manuteno', 'manutenção'],
  ['Motivao', 'Motivação'],
  ['motivao', 'motivação'],
  ['Negociao', 'Negociação'],
  ['negociao', 'negociação'],
  ['Operao', 'Operação'],
  ['operao', 'operação'],
  ['Orientao', 'Orientação'],
  ['orientao', 'orientação'],
  ['Participao', 'Participação'],
  ['participao', 'participação'],
  ['Percepo', 'Percepção'],
  ['percepo', 'percepção'],
  ['Posio', 'Posição'],
  ['posio', 'posição'],
  ['Profisso', 'Profissão'],
  ['profisso', 'profissão'],
  ['Promoo', 'Promoção'],
  ['promoo', 'promoção'],
  ['Proporo', 'Proporção'],
  ['proporo', 'proporção'],
  ['Proteo', 'Proteção'],
  ['proteo', 'proteção'],
  ['Publicao', 'Publicação'],
  ['publicao', 'publicação'],
  ['Questo', 'Questão'],
  ['questo', 'questão'],
  ['Razo', 'Razão'],
  ['razo', 'razão'],
  ['Recolocao', 'Recolocação'],
  ['recolocao', 'recolocação'],
  ['Reduo', 'Redução'],
  ['reduo', 'redução'],
  ['Reviso', 'Revisão'],
  ['reviso', 'revisão'],
  ['Seleo', 'Seleção'],
  ['seleo', 'seleção'],
  ['Simulao', 'Simulação'],
  ['simulao', 'simulação'],
  ['Transformao', 'Transformação'],
  ['transformao', 'transformação'],
  ['Transio', 'Transição'],
  ['transio', 'transição'],
  ['Verificao', 'Verificação'],
  ['verificao', 'verificação'],
  ['Vocao', 'Vocação'],
  ['vocao', 'vocação'],
  ['Profissionalizao', 'Profissionalização'],
  ['profissionalizao', 'profissionalização'],
  ['Formalrizao', 'Formalização'],
  ['formalizao', 'formalização'],
  ['Preparao', 'Preparação'],
  ['preparao', 'preparação'],
  ['Adaptao', 'Adaptação'],
  ['adaptao', 'adaptação'],
  ['Avancao', 'Avançando'], // skip risky
  ['Avano', 'Avanço'],
  ['avano', 'avanço'],
  ['Ateno', 'Atenção'],
  ['ateno', 'atenção'],
  ['Exceo', 'Exceção'],
  ['exceo', 'exceção'],
  ['Cansao', 'Cansaço'],
  ['cansao', 'cansaço'],
  ['Reao', 'Reação'],
  ['reao', 'reação'],
  ['Atrao', 'Atração'],
  ['atrao', 'atração'],
  ['Licitao', 'Licitação'],
  ['licitao', 'licitação'],
  ['Produo', 'Produção'],
  ['produo', 'produção'],
  ['Obsevao', 'Observação'],
  ['Populao', 'População'],
  ['populao', 'população'],
  ['Autorizao', 'Autorização'],
  ['autorizao', 'autorização'],
  ['Indenizao', 'Indenização'],
  ['indenizao', 'indenização'],
  ['Privatizao', 'Privatização'],
  ['privatizao', 'privatização'],
  ['Relocao', 'Realocação'],
  ['Recisao', 'Rescisão'],
  ['recisao', 'rescisão'],
  ['Rescisao', 'Rescisão'],
  ['rescisao', 'rescisão'],
  ['Integrao', 'Integração'],
  ['integrao', 'integração'],
  ['Aplicao', 'Aplicação'],
  ['aplicao', 'aplicação'],
  ['Automao', 'Automação'],
  ['automao', 'automação'],
  ['Construo', 'Construção'],
  ['construo', 'construção'],
  ['Gerao', 'Geração'],
  ['gerao', 'geração'],
  ['Obrigao', 'Obrigação'],
  ['obrigao', 'obrigação'],
  ['Introduo', 'Introdução'],
  ['introduo', 'introdução'],
  ['Especificao', 'Especificação'],
  ['especificao', 'especificação'],
  ['Correntao', 'Correção'], // typo
  ['Correo', 'Correção'],
  ['correo', 'correção'],
  ['Prevenao', 'Prevenção'],
  ['preveno', 'prevenção'],
  ['Variacao', 'Variação'],
  ['variacao', 'variação'],
  ['Variao', 'Variação'],
  ['variao', 'variação'],
  ['Permisso', 'Permissão'],
  ['permisso', 'permissão'],
  ['Misso', 'Missão'],
  ['misso', 'missão'],
  ['Emisso', 'Emissão'],
  ['emisso', 'emissão'],
  ['Declarao', 'Declaração'],
  ['declarao', 'declaração'],
  ['Separao', 'Separação'],
  ['separao', 'separação'],
  ['Acelerao', 'Aceleração'],
  ['acelerao', 'aceleração'],
  ['Aspirao', 'Aspiração'],
  ['aspirao', 'aspiração'],
  ['Consolidao', 'Consolidação'],
  ['consolidao', 'consolidação'],
  ['Assimilao', 'Assimilação'],
  ['assimilao', 'assimilação'],
  ['Fixao', 'Fixação'],
  ['fixao', 'fixação'],
  ['Customizao', 'Customização'],
  ['customizao', 'customização'],
  ['Contabilizao', 'Contabilização'],
  ['contabilizao', 'contabilização'],
  ['Executao', 'Execução'],
  ['execuo', 'execução'],
  ['Execuo', 'Execução'],
  ['Remunerao', 'Remuneração'],
  ['remunerao', 'remuneração'],
  ['Fiscalizao', 'Fiscalização'],
  ['fiscalizao', 'fiscalização'],
  ['Organizao', 'Organização'],
  ['organizao', 'organização'],
  ['Profisses', 'Profissões'],
  ['profisses', 'profissões'],
  ['Instituies', 'Instituições'],
  ['instituies', 'instituições'],
  ['Inscries', 'Inscrições'],
  ['inscries', 'inscrições'],
  ['Certificaes', 'Certificações'],
  ['certificaes', 'certificações'],
  ['Contrataes', 'Contratações'],
  ['contrataes', 'contratações'],
  ['Situaes', 'Situações'],
  ['situaes', 'situações'],
  ['Questes', 'Questões'],
  ['questes', 'questões'],
  ['Lies', 'Lições'],
  ['lies', 'lições'],
  ['Decisoes', 'Decisões'],
  ['decisoes', 'decisões'],
  ['Decises', 'Decisões'],
  ['decises', 'decisões'],
  ['Posies', 'Posições'],
  ['posies', 'posições'],
  ['Funes', 'Funções'],
  ['funes', 'funções'],
  ['Conexes', 'Conexões'],
  ['conexes', 'conexões'],
  ['Concluses', 'Conclusões'],
  ['concluses', 'conclusões'],
  ['Contribuies', 'Contribuições'],
  ['contribuies', 'contribuições'],
  ['Criaes', 'Criações'],
  ['criaes', 'criações'],
  ['Atribuies', 'Atribuições'],
  ['atribuies', 'atribuições'],
  ['Formaes', 'Formações'],
  ['formaes', 'formações'],
  ['Selaes', 'Seleções'],
  ['selees', 'seleções'],
  ['Interaes', 'Interações'],
  ['interaes', 'interações'],
  ['Relaes', 'Relações'],
  ['relaes', 'relações'],
  ['Geraes', 'Gerações'],
  ['geraes', 'gerações'],
  ['Varioes', 'Variações'],
  ['varioes', 'variações'],
  ['Aplicaes', 'Aplicações'],
  ['aplicaes', 'aplicações'],
  ['Correes', 'Correções'],
  ['correes', 'correções'],
  ['Especificaes', 'Especificações'],
  ['especificaes', 'especificações'],
  ['Automaes', 'Automações'],
  ['automaes', 'automações'],
  ['Avalaes', 'Avaliações'],
  ['avalaes', 'avaliações'],
  ['Avaloes', 'Avaliações'],
  ['avaloes', 'avaliações'],
  ['Instrues', 'Instruções'],
  ['instrues', 'instruções'],
  ['Condies', 'Condições'],
  ['condies', 'condições'],
  ['Profisses', 'Profissões'],
  
  // ======= Palavras com "é" perdido =======
  ['Voc', 'Você'],
  ['voc', 'você'],
  ['Tcnico', 'Técnico'],
  ['tcnico', 'técnico'],
  ['Tcnica', 'Técnica'],
  ['tcnica', 'técnica'],
  ['Tcnicos', 'Técnicos'],
  ['tcnicos', 'técnicos'],
  ['Tcnicas', 'Técnicas'],
  ['tcnicas', 'técnicas'],
  ['Especfico', 'Específico'],
  ['especfico', 'específico'],
  ['Especfica', 'Específica'],
  ['especfica', 'específica'],
  ['Especficos', 'Específicos'],
  ['especficos', 'específicos'],
  ['Referncia', 'Referência'],
  ['referncia', 'referência'],
  ['Referncias', 'Referências'],
  ['referncias', 'referências'],
  ['Competncias', 'Competências'],
  ['competncias', 'competências'],
  ['Competncia', 'Competência'],
  ['competncia', 'competência'],
  ['Excelncia', 'Excelência'],
  ['excelncia', 'excelência'],
  ['Experincia', 'Experiência'],
  ['experincia', 'experiência'],
  ['Experncias', 'Experiências'],
  ['experncias', 'experiências'],
  ['Inteligncia', 'Inteligência'],
  ['inteligncia', 'inteligência'],
  ['Importncia', 'Importância'],
  ['importncia', 'importância'],
  ['Eficincia', 'Eficiência'],
  ['eficincia', 'eficiência'],
  ['Presena', 'Presença'],
  ['presena', 'presença'],
  ['Permanncia', 'Permanência'],
  ['permanncia', 'permanência'],
  ['Independncia', 'Independência'],
  ['independncia', 'independência'],
  ['Transparncia', 'Transparência'],
  ['transparncia', 'transparência'],
  ['Freqncia', 'Frequência'],
  ['freqncia', 'frequência'],
  ['Fluncia', 'Fluência'],
  ['fluncia', 'fluência'],
  ['Estratgico', 'Estratégico'],
  ['estratgico', 'estratégico'],
  ['Estratgica', 'Estratégica'],
  ['estratgica', 'estratégica'],
  ['Histrico', 'Histórico'],
  ['histrico', 'histórico'],
  ['Histrica', 'Histórica'],
  ['histrica', 'histórica'],
  ['Histricos', 'Históricos'],
  ['histricos', 'históricos'],
  ['Oratria', 'Oratória'],
  ['oratria', 'oratória'],
  ['Dinmico', 'Dinâmico'],
  ['dinmico', 'dinâmico'],
  ['Acadmico', 'Acadêmico'],
  ['acadmico', 'acadêmico'],
  ['Acadmica', 'Acadêmica'],
  ['acadmica', 'acadêmica'],
  ['Cientfico', 'Científico'],
  ['cientfico', 'científico'],
  ['Mtodo', 'Método'],
  ['mtodo', 'método'],
  ['Mtodos', 'Métodos'],
  ['mtodos', 'métodos'],
  ['Crtico', 'Crítico'],
  ['crtico', 'crítico'],
  ['Crtica', 'Crítica'],
  ['crtica', 'crítica'],
  ['Mdio', 'Médio'],
  ['mdio', 'médio'],
  ['Mdia', 'Média'],
  ['mdia', 'média'],
  ['Mdicos', 'Médicos'],
  ['mdicos', 'médicos'],
  ['Mdica', 'Médica'],
  ['mdica', 'médica'],
  ['Mdico', 'Médico'],
  ['mdico', 'médico'],
  ['Eficcia', 'Eficácia'],
  ['eficcia', 'eficácia'],
  ['Fenmeno', 'Fenômeno'],
  ['fenmeno', 'fenômeno'],
  ['Stgio', 'Estágio'],
  ['stgio', 'estágio'],
  ['Estgio', 'Estágio'],
  ['estgio', 'estágio'],
  ['Estgios', 'Estágios'],
  ['estgios', 'estágios'],
  ['Prmio', 'Prêmio'],
  ['prmio', 'prêmio'],
  ['Prmios', 'Prêmios'],
  ['prmios', 'prêmios'],
  ['Comrcio', 'Comércio'],
  ['comrcio', 'comércio'],
  ['Poltica', 'Política'],
  ['poltica', 'política'],
  ['Poltico', 'Político'],
  ['poltico', 'político'],
  ['Polticas', 'Políticas'],
  ['polticas', 'políticas'],
  ['Critrio', 'Critério'],
  ['critrio', 'critério'],
  ['Critrios', 'Critérios'],
  ['critrios', 'critérios'],
  ['Exerccio', 'Exercício'],
  ['exerccio', 'exercício'],
  ['Exerccios', 'Exercícios'],
  ['exerccios', 'exercícios'],
  ['Obstculo', 'Obstáculo'],
  ['obstculo', 'obstáculo'],
  ['Horrio', 'Horário'],
  ['horrio', 'horário'],
  ['Horrios', 'Horários'],
  ['horrios', 'horários'],
  ['Necessrio', 'Necessário'],
  ['necessrio', 'necessário'],
  ['Necessria', 'Necessária'],
  ['necessria', 'necessária'],
  ['Liderana', 'Liderança'],
  ['liderana', 'liderança'],
  ['Lderes', 'Líderes'],
  ['lderes', 'líderes'],
  ['Lder', 'Líder'],
  ['lder', 'líder'],
  ['Hbito', 'Hábito'],
  ['hbito', 'hábito'],
  ['Hbitos', 'Hábitos'],
  ['hbitos', 'hábitos'],
  ['Prdio', 'Prédio'],
  ['prdio', 'prédio'],
  ['Crdito', 'Crédito'],
  ['crdito', 'crédito'],
  ['Crditos', 'Créditos'],
  ['crditos', 'créditos'],
  ['Mrito', 'Mérito'],
  ['mrito', 'mérito'],
  ['Mritos', 'Méritos'],
  ['mritos', 'méritos'],
  ['Mdulo', 'Módulo'],
  ['mdulo', 'módulo'],
  ['Mdulos', 'Módulos'],
  ['mdulos', 'módulos'],
  ['Anlise', 'Análise'],
  ['anlise', 'análise'],
  ['Anlises', 'Análises'],
  ['anlises', 'análises'],
  ['Ttulo', 'Título'],
  ['ttulo', 'título'],
  ['Ttulos', 'Títulos'],
  ['ttulos', 'títulos'],
  ['Vdeo', 'Vídeo'],
  ['vdeo', 'vídeo'],
  ['Vdeos', 'Vídeos'],
  ['vdeos', 'vídeos'],
  ['Trnsito', 'Trânsito'],
  ['trnsito', 'trânsito'],
  ['Matemtica', 'Matemática'],
  ['matemtica', 'matemática'],
  ['Fsica', 'Física'],
  ['fsica', 'física'],
  ['Qumica', 'Química'],
  ['qumica', 'química'],
  
  // ======= Palavras com "ó/ô/õ" perdido =======
  ['Pblico', 'Público'],
  ['pblico', 'público'],
  ['Pblica', 'Pública'],
  ['pblica', 'pública'],
  ['Pblicos', 'Públicos'],
  ['pblicos', 'públicos'],
  ['Pblicas', 'Públicas'],
  ['pblicas', 'públicas'],
  ['Prprio', 'Próprio'],
  ['prprio', 'próprio'],
  ['Prpria', 'Própria'],
  ['prpria', 'própria'],
  ['Prprios', 'Próprios'],
  ['prprios', 'próprios'],
  ['Lgica', 'Lógica'],
  ['lgica', 'lógica'],
  ['Lgico', 'Lógico'],
  ['lgico', 'lógico'],
  ['Lgicos', 'Lógicos'],
  ['lgicos', 'lógicos'],
  ['Lgicas', 'Lógicas'],
  ['lgicas', 'lógicas'],
  ['Autnomo', 'Autônomo'],
  ['autnomo', 'autônomo'],
  ['Autnomas', 'Autônomas'],
  ['autnomas', 'autônomas'],
  ['Cdigo', 'Código'],
  ['cdigo', 'código'],
  ['Cdigos', 'Códigos'],
  ['cdigos', 'códigos'],
  ['Perodo', 'Período'],
  ['perodo', 'período'],
  ['Perodos', 'Períodos'],
  ['perodos', 'períodos'],
  ['Clculo', 'Cálculo'],
  ['clculo', 'cálculo'],
  ['Clculos', 'Cálculos'],
  ['clculos', 'cálculos'],
  ['Gnero', 'Gênero'],
  ['gnero', 'gênero'],
  ['Gneros', 'Gêneros'],
  ['gneros', 'gêneros'],
  ['Prximo', 'Próximo'],
  ['prximo', 'próximo'],
  ['Prxima', 'Próxima'],
  ['prxima', 'próxima'],
  ['Incio', 'Início'],
  ['incio', 'início'],
  ['Vcio', 'Vício'],
  ['vcio', 'vício'],
  ['Vcios', 'Vícios'],
  ['vcios', 'vícios'],
  ['Anncios', 'Anúncios'],
  ['anncios', 'anúncios'],
  ['Anncio', 'Anúncio'],
  ['anncio', 'anúncio'],
  ['Veculos', 'Veículos'],
  ['veculos', 'veículos'],
  ['Veculo', 'Veículo'],
  ['veculo', 'veículo'],
  
  // ======= Palavras com "á" perdido =======
  ['Distncia', 'Distância'],
  ['distncia', 'distância'],
  ['Distncias', 'Distâncias'],
  ['distncias', 'distâncias'],
  ['Mximo', 'Máximo'],
  ['mximo', 'máximo'],
  ['Mxima', 'Máxima'],
  ['mxima', 'máxima'],
  ['Mnimo', 'Mínimo'],
  ['mnimo', 'mínimo'],
  ['Mnima', 'Mínima'],
  ['mnima', 'mínima'],
  ['Rpido', 'Rápido'],
  ['rpido', 'rápido'],
  ['Rpida', 'Rápida'],
  ['rpida', 'rápida'],
  ['Rpidos', 'Rápidos'],
  ['rpidos', 'rápidos'],
  ['Rpidas', 'Rápidas'],
  ['rpidas', 'rápidas'],
  ['Bsico', 'Básico'],
  ['bsico', 'básico'],
  ['Bsica', 'Básica'],
  ['bsica', 'básica'],
  ['Bsicos', 'Básicos'],
  ['bsicos', 'básicos'],
  ['Bsicas', 'Básicas'],
  ['bsicas', 'básicas'],
  ['Prtico', 'Prático'],
  ['prtico', 'prático'],
  ['Prtica', 'Prática'],
  ['prtica', 'prática'],
  ['Prticos', 'Práticos'],
  ['prticos', 'práticos'],
  ['Prticas', 'Práticas'],
  ['prticas', 'práticas'],
  ['Pgina', 'Página'],
  ['pgina', 'página'],
  ['Pginas', 'Páginas'],
  ['pginas', 'páginas'],
  ['Matrcula', 'Matrícula'],
  ['matrcula', 'matrícula'],
  ['Matrcula', 'Matrícula'],
  ['Fbrica', 'Fábrica'],
  ['fbrica', 'fábrica'],
  ['Obstculo', 'Obstáculo'],
  ['obstculo', 'obstáculo'],
  ['Obstculos', 'Obstáculos'],
  ['obstculos', 'obstáculos'],
  ['Lngua', 'Língua'],
  ['lngua', 'língua'],
  ['Tambm', 'Também'],
  ['tambm', 'também'],
  ['Atravs', 'Através'],
  ['atravs', 'através'],
  ['Alm', 'Além'],
  ['alm', 'além'],
  ['Ento', 'Então'],
  ['ento', 'então'],
  ['Preo', 'Preço'],
  ['preo', 'preço'],
  ['Pases', 'Países'],
  ['pases', 'países'],
  ['Ingls', 'Inglês'],
  ['ingls', 'inglês'],
  ['Portugus', 'Português'],
  ['portugus', 'português'],
  ['Nmero', 'Número'],
  ['nmero', 'número'],
  ['Nmeros', 'Números'],
  ['nmeros', 'números'],
  ['Nvel', 'Nível'],
  ['nvel', 'nível'],
  ['Nveis', 'Níveis'],
  ['nveis', 'níveis'],
  
  // ======= Palavras com "ú" perdido =======
  ['ltimo', 'último'],
  ['ltimos', 'últimos'],
  ['ltima', 'última'],
  ['ltimas', 'últimas'],
  
  // ======= Palavras com "â/ê" perdido =======
  ['sequncia', 'sequência'],
  ['Sequncia', 'Sequência'],
  ['mquina', 'máquina'],
  ['Mquina', 'Máquina'],
  ['mquinas', 'máquinas'],
  ['Mquinas', 'Máquinas'],
  ['Pnlti', 'Penúlti'], // skip
  
  // ======= "estão" escrito como "esto" =======
  ['esto', 'estão'],
  
  // ======= "já" =======
  // Skip - too risky (j would become já everywhere)
  
  // ======= Palavras compostas/expressões =======
  ['Concurso pblico', 'Concurso público'],
  ['concurso pblico', 'concurso público'],
  ['Concursos pblicos', 'Concursos públicos'],
  ['concursos pblicos', 'concursos públicos'],
  ['Liderana', 'Liderança'], // duplicate ok
  ['Comeo', 'Começo'],
  ['comeo', 'começo'],
];

// Specific phrase fixes for cases where simple word replacement would be risky
const PHRASE_FIXES = [
  [/nada mais  do que/g, 'nada mais é do que'],
  [/ nada mais  /g, ' nada mais é '],
  [/para no perder/g, 'para não perder'],
  [/para no conseguir/g, 'para não conseguir'],
  [/para no ter/g, 'para não ter'],
  [/para no cair/g, 'para não cair'],
];

function buildRegex(word) {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?<![a-záéíóúâêîôûãõàüçÁÉÍÓÚÂÊÎÔÛÃÕÀÜÇ])${escaped}(?![a-záéíóúâêîôûãõàüçÁÉÍÓÚÂÊÎÔÛÃÕÀÜÇ])`, 'g');
}

function applyCorrections(content) {
  let result = content;
  
  // Apply word corrections
  for (const correction of CORRECTIONS) {
    if (!Array.isArray(correction) || correction.length < 2) continue;
    const [wrong, correct] = correction;
    if (!wrong || !correct) continue;
    const regex = buildRegex(wrong);
    result = result.replace(regex, correct);
  }
  
  // Apply phrase fixes
  for (const [pattern, replacement] of PHRASE_FIXES) {
    result = result.replace(pattern, replacement);
  }
  
  return result;
}

// Process seed_blog.json
const blogPath = path.join(BASE, 'api/seed_blog.json');
const backupPath = blogPath + '.bak_spell';

if (!fs.existsSync(backupPath)) {
  fs.copyFileSync(blogPath, backupPath);
  console.log('Backup criado: seed_blog.json.bak_spell');
}

const originalContent = fs.readFileSync(blogPath, 'utf8');
const fixedContent = applyCorrections(originalContent);

// Count character changes
let charChanges = 0;
const minLen = Math.min(originalContent.length, fixedContent.length);
for (let i = 0; i < minLen; i++) {
  if (originalContent[i] !== fixedContent[i]) charChanges++;
}
charChanges += Math.abs(originalContent.length - fixedContent.length);

try {
  JSON.parse(fixedContent);
  fs.writeFileSync(blogPath, fixedContent, 'utf8');
  console.log(`✅ seed_blog.json: ~${charChanges} posições alteradas`);
} catch (e) {
  console.error('❌ JSON inválido! Não aplicando. Erro:', e.message);
  // Find the error location
  const errMsg = e.message;
  const posMatch = errMsg.match(/position (\d+)/);
  if (posMatch) {
    const pos = parseInt(posMatch[1]);
    console.error('Contexto:', fixedContent.substring(Math.max(0, pos-50), pos+50));
  }
  process.exit(1);
}

// Validate no double accents introduced
const doubleAccent = fixedContent.match(/[àáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸ]{2}/g);
if (doubleAccent) {
  const unique = [...new Set(doubleAccent)].filter(d => d !== 'éé' && d !== 'çã' && d !== 'çõ'); // Allow intentional ones
  if (unique.length > 0) {
    console.warn('⚠ Possíveis acentos duplos encontrados:', unique.slice(0, 20));
  }
}

// Process seed_jobs.json
const jobsPath = path.join(BASE, 'api/seed_jobs.json');
const jobsBackup = jobsPath + '.bak_spell';
if (!fs.existsSync(jobsBackup)) {
  fs.copyFileSync(jobsPath, jobsBackup);
}
let jobsData = JSON.parse(fs.readFileSync(jobsPath, 'utf8'));
const TEXT_FIELDS_JOBS = ['title', 'description', 'requirements', 'benefits', 'salary', 'deadline', 'city'];

let jobChanges = 0;
for (const job of jobsData) {
  for (const field of TEXT_FIELDS_JOBS) {
    if (job[field] && typeof job[field] === 'string') {
      const fixed = applyCorrections(job[field]);
      if (fixed !== job[field]) {
        jobChanges++;
        job[field] = fixed;
      }
    }
  }
}

if (jobChanges > 0) {
  fs.writeFileSync(jobsPath, JSON.stringify(jobsData, null, 2), 'utf8');
  console.log(`✅ seed_jobs.json: ${jobChanges} campos alterados`);
} else {
  console.log('ℹ seed_jobs.json: sem alterações em texto visível');
}

// Process courses.js (only string values, not IDs)
const coursesPath = path.join(BASE, 'src/data/courses.js');
const coursesBackup = coursesPath + '.bak_spell';
if (!fs.existsSync(coursesBackup)) {
  fs.copyFileSync(coursesPath, coursesBackup);
}
const coursesOriginal = fs.readFileSync(coursesPath, 'utf8');
const coursesFixed = applyCorrections(coursesOriginal);

if (coursesFixed !== coursesOriginal) {
  fs.writeFileSync(coursesPath, coursesFixed, 'utf8');
  console.log('✅ src/data/courses.js: correções aplicadas');
} else {
  console.log('ℹ src/data/courses.js: sem alterações');
}

console.log('\n=== CONCLUÍDO ===');
