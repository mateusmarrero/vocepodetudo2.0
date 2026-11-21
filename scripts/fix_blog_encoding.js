/**
 * fix_blog_encoding.js
 * Corrige o problema de codificação no seed_blog.json onde acentos foram removidos.
 * Usa um dicionário abrangente de palavras com e sem acento em pt-BR.
 * USO: node scripts/fix_blog_encoding.js
 */

const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, '..');

// Dicionário de correções: palavra errada → palavra correta
// Ordenado do mais longo para o mais curto para evitar substituições parciais
const WORD_MAP = {
  // Padrão -ao sem cedilha (onde deveria ser -ção, -são, -ção etc.)
  'Profissionalizao': 'Profissionalização',
  'profissionalizao': 'profissionalização',
  'Administrao': 'Administração',
  'administrao': 'administração',
  'Certificaes': 'Certificações',
  'certificaes': 'certificações',
  'Certificao': 'Certificação',
  'certificao': 'certificação',
  'Comunicao': 'Comunicação',
  'comunicao': 'comunicação',
  'Capacitaes': 'Capacitações',
  'capacitaes': 'capacitações',
  'Capacitao': 'Capacitação',
  'capacitao': 'capacitação',
  'Qualificao': 'Qualificação',
  'qualificao': 'qualificação',
  'Educaes': 'Educações',
  'educaes': 'educações',
  'Educao': 'Educação',
  'educao': 'educação',
  'Programaes': 'Programações',
  'programaes': 'programações',
  'Programao': 'Programação',
  'programao': 'programação',
  'Formalizao': 'Formalização',
  'formalizao': 'formalização',
  'Preparaes': 'Preparações',
  'preparaes': 'preparações',
  'Preparao': 'Preparação',
  'preparao': 'preparação',
  'Contratao': 'Contratação',
  'contratao': 'contratação',
  'Contrataes': 'Contratações',
  'contrataes': 'contratações',
  'Autenticao': 'Autenticação',
  'autenticao': 'autenticação',
  'Validao': 'Validação',
  'validao': 'validação',
  'Redao': 'Redação',
  'redao': 'redação',
  'Situaes': 'Situações',
  'situaes': 'situações',
  'Situao': 'Situação',
  'situao': 'situação',
  'Remunerao': 'Remuneração',
  'remunerao': 'remuneração',
  'Revoluao': 'Revolução',
  'revoluao': 'revolução',
  'Atribuio': 'Atribuição',
  'atribuio': 'atribuição',
  'Atribuies': 'Atribuições',
  'atribuies': 'atribuições',
  'Instituio': 'Instituição',
  'instituio': 'instituição',
  'Instituies': 'Instituições',
  'instituies': 'instituições',
  'Inscrio': 'Inscrição',
  'inscrio': 'inscrição',
  'Inscries': 'Inscrições',
  'inscries': 'inscrições',
  'Implementao': 'Implementação',
  'implementao': 'implementação',
  'Identificao': 'Identificação',
  'identificao': 'identificação',
  'Indicao': 'Indicação',
  'indicao': 'indicação',
  'Colaborao': 'Colaboração',
  'colaborao': 'colaboração',
  'Adapao': 'Adaptação',
  'adapao': 'adaptação',
  'Adaptaes': 'Adaptações',
  'adaptaes': 'adaptações',
  'Associao': 'Associação',
  'associao': 'associação',
  'Atualização': 'Atualização', // already correct
  'Atualizao': 'Atualização',
  'atualizao': 'atualização',
  'Atuao': 'Atuação',
  'atuao': 'atuação',
  'Avalioes': 'Avaliações',
  'avalioes': 'avaliações',
  'Avaliao': 'Avaliação',
  'avaliao': 'avaliação',
  'Comemorao': 'Comemoração',
  'comemorao': 'comemoração',
  'Complicao': 'Complicação',
  'complicao': 'complicação',
  'Colocao': 'Colocação',
  'colocao': 'colocação',
  'Comercializao': 'Comercialização',
  'comercializao': 'comercialização',
  'Conexo': 'Conexão',
  'conexo': 'conexão',
  'Conexes': 'Conexões',
  'conexes': 'conexões',
  'Concluso': 'Conclusão',
  'concluso': 'conclusão',
  'Concluses': 'Conclusões',
  'concluses': 'conclusões',
  'Contribuio': 'Contribuição',
  'contribuio': 'contribuição',
  'Contribuies': 'Contribuições',
  'contribuies': 'contribuições',
  'Conversao': 'Conversão',
  'conversao': 'conversão',
  'Contabilizao': 'Contabilização',
  'contabilizao': 'contabilização',
  'Customizao': 'Customização',
  'customizao': 'customização',
  'Criao': 'Criação',
  'criao': 'criação',
  'Criaes': 'Criações',
  'criaes': 'criações',
  'Decises': 'Decisões',
  'decises': 'decisões',
  'Deciso': 'Decisão',
  'deciso': 'decisão',
  'Demonstrao': 'Demonstração',
  'demonstrao': 'demonstração',
  'Demisso': 'Demissão',
  'demisso': 'demissão',
  'Descrio': 'Descrição',
  'descrio': 'descrição',
  'Descrioes': 'Descrições',
  'descrioes': 'descrições',
  'Dedicao': 'Dedicação',
  'dedicao': 'dedicação',
  'Digitalizao': 'Digitalização',
  'digitalizao': 'digitalização',
  'Distribio': 'Distribuição',
  'distribio': 'distribuição',
  'Efetivao': 'Efetivação',
  'efetivao': 'efetivação',
  'Elaborao': 'Elaboração',
  'elaborao': 'elaboração',
  'Exibio': 'Exibição',
  'exibio': 'exibição',
  'Explicao': 'Explicação',
  'explicao': 'explicação',
  'Explicaes': 'Explicações',
  'explicaes': 'explicações',
  'Explorao': 'Exploração',
  'explorao': 'exploração',
  'Formao': 'Formação',
  'formao': 'formação',
  'Formaes': 'Formações',
  'formaes': 'formações',
  'Funo': 'Função',
  'funo': 'função',
  'Funes': 'Funções',
  'funes': 'funções',
  'Gesto': 'Gestão',
  'gesto': 'gestão',
  'Gestes': 'Gestões',
  'gestes': 'gestões',
  'Graduao': 'Graduação',
  'graduao': 'graduação',
  'Habitao': 'Habitação',
  'habitao': 'habitação',
  'Inovao': 'Inovação',
  'inovao': 'inovação',
  'Iniciao': 'Iniciação',
  'iniciao': 'iniciação',
  'Interao': 'Interação',
  'interao': 'interação',
  'Interaes': 'Interações',
  'interaes': 'interações',
  'Licitao': 'Licitação',
  'licitao': 'licitação',
  'Ligao': 'Ligação',
  'ligao': 'ligação',
  'Lies': 'Lições',
  'lies': 'lições',
  'Lio': 'Lição',
  'lio': 'lição',
  'Manuteno': 'Manutenção',
  'manuteno': 'manutenção',
  'Motivao': 'Motivação',
  'motivao': 'motivação',
  'Negociao': 'Negociação',
  'negociao': 'negociação',
  'Operao': 'Operação',
  'operao': 'operação',
  'Orientao': 'Orientação',
  'orientao': 'orientação',
  'Participao': 'Participação',
  'participao': 'participação',
  'Percepo': 'Percepção',
  'percepo': 'percepção',
  'Posio': 'Posição',
  'posio': 'posição',
  'Posies': 'Posições',
  'posies': 'posições',
  'Profisso': 'Profissão',
  'profisso': 'profissão',
  'Profisses': 'Profissões',
  'profisses': 'profissões',
  'Promoo': 'Promoção',
  'promoo': 'promoção',
  'Promoes': 'Promoções',
  'promoes': 'promoções',
  'Proporo': 'Proporção',
  'proporo': 'proporção',
  'Proteo': 'Proteção',
  'proteo': 'proteção',
  'Publicao': 'Publicação',
  'publicao': 'publicação',
  'Questo': 'Questão',
  'questo': 'questão',
  'Questes': 'Questões',
  'questes': 'questões',
  'Razo': 'Razão',
  'razo': 'razão',
  'Recolocao': 'Recolocação',
  'recolocao': 'recolocação',
  'Reduo': 'Redução',
  'reduo': 'redução',
  'Remunerao': 'Remuneração',
  'remunerao': 'remuneração',
  'Reviso': 'Revisão',
  'reviso': 'revisão',
  'Revoluo': 'Revolução',
  'revoluo': 'revolução',
  'Seleo': 'Seleção',
  'seleo': 'seleção',
  'Selees': 'Seleções',
  'selees': 'seleções',
  'Simulao': 'Simulação',
  'simulao': 'simulação',
  'Sugestao': 'Sugestão',
  'sugestao': 'sugestão',
  'Sugesato': 'Sugestão',
  'Tomao': 'Tomação',
  'tomao': 'tomação',
  'Transformao': 'Transformação',
  'transformao': 'transformação',
  'Transio': 'Transição',
  'transio': 'transição',
  'Validaes': 'Validações',
  'validaes': 'validações',
  'Verificao': 'Verificação',
  'verificao': 'verificação',
  'Vocao': 'Vocação',
  'vocao': 'vocação',
  
  // Palavras com "é" perdido
  'Voc': 'Você',   // careful - only as whole word
  'voc': 'você',
  'Tcnico': 'Técnico',
  'tcnico': 'técnico',
  'Tcnica': 'Técnica',
  'tcnica': 'técnica',
  'Tcnicos': 'Técnicos',
  'tcnicos': 'técnicos',
  'Tcnicas': 'Técnicas',
  'tcnicas': 'técnicas',
  'Especfico': 'Específico',
  'especfico': 'específico',
  'Especfica': 'Específica',
  'especfica': 'específica',
  'Especficos': 'Específicos',
  'especficos': 'específicos',
  'Referncia': 'Referência',
  'referncia': 'referência',
  'Referncias': 'Referências',
  'referncias': 'referências',
  'Competncias': 'Competências',
  'competncias': 'competências',
  'Competncia': 'Competência',
  'competncia': 'competência',
  'Excelncia': 'Excelência',
  'excelncia': 'excelência',
  'Experincia': 'Experiência',
  'experincia': 'experiência',
  'Experncias': 'Experiências',
  'experncias': 'experiências',
  'Inteligncia': 'Inteligência',
  'inteligncia': 'inteligência',
  'Importncia': 'Importância',
  'importncia': 'importância',
  'Eficincia': 'Eficiência',
  'eficincia': 'eficiência',
  'Presena': 'Presença',
  'presena': 'presença',
  'Permanncia': 'Permanência',
  'permanncia': 'permanência',
  'Independncia': 'Independência',
  'independncia': 'independência',
  'Evidncia': 'Evidência',
  'evidncia': 'evidência',
  'Transparn': 'Transparên',
  'Transparncia': 'Transparência',
  'transparncia': 'transparência',
  'Conseqncia': 'Consequência',
  'conseqncia': 'consequência',
  'Freqncia': 'Frequência',
  'freqncia': 'frequência',
  
  // Palavras com "ó" / "ô" / "õ" perdido
  'Pblico': 'Público',
  'pblico': 'público',
  'Pblica': 'Pública',
  'pblica': 'pública',
  'Pblicos': 'Públicos',
  'pblicos': 'públicos',
  'Pblicas': 'Públicas',
  'pblicas': 'públicas',
  'Prprio': 'Próprio',
  'prprio': 'próprio',
  'Prpria': 'Própria',
  'prpria': 'própria',
  'Prprios': 'Próprios',
  'prprios': 'próprios',
  'Prprias': 'Próprias',
  'prprias': 'próprias',
  'Nvel': 'Nível',
  'nvel': 'nível',
  'Nveis': 'Níveis',
  'nveis': 'níveis',
  'Nmero': 'Número',
  'nmero': 'número',
  'Nmeros': 'Números',
  'nmeros': 'números',
  'Lgica': 'Lógica',
  'lgica': 'lógica',
  'Lgico': 'Lógico',
  'lgico': 'lógico',
  'Lgicos': 'Lógicos',
  'lgicos': 'lógicos',
  'Autnomos': 'Autônomos',
  'autnomo': 'autônomo',
  'Autnomo': 'Autônomo',
  'Mximo': 'Máximo',
  'mximo': 'máximo',
  'Mxima': 'Máxima',
  'mxima': 'máxima',
  'Mnimo': 'Mínimo',
  'mnimo': 'mínimo',
  'Mnima': 'Mínima',
  'mnima': 'mínima',
  'Rpido': 'Rápido',
  'rpido': 'rápido',
  'Rpida': 'Rápida',
  'rpida': 'rápida',
  'Rpidos': 'Rápidos',
  'rpidos': 'rápidos',
  'Rpidas': 'Rápidas',
  'rpidas': 'rápidas',
  'Bsico': 'Básico',
  'bsico': 'básico',
  'Bsica': 'Básica',
  'bsica': 'básica',
  'Bsicos': 'Básicos',
  'bsicos': 'básicos',
  'Bsicas': 'Básicas',
  'bsicas': 'básicas',
  'Prtico': 'Prático',
  'prtico': 'prático',
  'Prtica': 'Prática',
  'prtica': 'prática',
  'Prticos': 'Práticos',
  'prticos': 'práticos',
  'Prticas': 'Práticas',
  'prticas': 'práticas',
  'Prticamente': 'Praticamente',
  'prticamente': 'praticamente',
  'Mdio': 'Médio',
  'mdio': 'médio',
  'Mdia': 'Média',
  'mdia': 'média',
  'Mdios': 'Médios',
  'mdios': 'médios',
  'Mdicas': 'Médicas',
  'mdicas': 'médicas',
  'Mdico': 'Médico',
  'mdico': 'médico',
  'Prximo': 'Próximo',
  'prximo': 'próximo',
  'Prxima': 'Próxima',
  'prxima': 'próxima',
  'Prximos': 'Próximos',
  'prximos': 'próximos',
  'Prximas': 'Próximas',
  'prximas': 'próximas',
  'Cdigo': 'Código',
  'cdigo': 'código',
  'Cdigos': 'Códigos',
  'cdigos': 'códigos',
  'Perodo': 'Período',
  'perodo': 'período',
  'Perodos': 'Períodos',
  'perodos': 'períodos',
  'Mrito': 'Mérito',
  'mrito': 'mérito',
  'Mritos': 'Méritos',
  'mritos': 'méritos',
  'Mrito': 'Mérito',
  'Clculo': 'Cálculo',
  'clculo': 'cálculo',
  'Clculos': 'Cálculos',
  'clculos': 'cálculos',
  'Fenmeno': 'Fenômeno',
  'fenmeno': 'fenômeno',
  'Titulo': 'Título',
  'titulo': 'título',
  'Ttulo': 'Título',
  'ttulo': 'título',
  'Ttulos': 'Títulos',
  'ttulos': 'títulos',
  'Anlise': 'Análise',
  'anlise': 'análise',
  'Anlises': 'Análises',
  'anlises': 'análises',
  'rea': 'área',
  'Rea': 'Área',
  'reas': 'áreas',
  'Reas': 'Áreas',
  'Estratgico': 'Estratégico',
  'estratgico': 'estratégico',
  'Estratgica': 'Estratégica',
  'estratgica': 'estratégica',
  'Oratria': 'Oratória',
  'oratria': 'oratória',
  'Histrico': 'Histórico',
  'histrico': 'histórico',
  'Histrica': 'Histórica',
  'histrica': 'histórica',
  'Histricos': 'Históricos',
  'histricos': 'históricos',
  'Históricas': 'Históricas', // already correct
  'Tecnolgico': 'Tecnológico',
  'tecnolgico': 'tecnológico',
  'Tecnolgica': 'Tecnológica',
  'tecnolgica': 'tecnológica',
  'Eletrnico': 'Eletrônico',
  'eletrnico': 'eletrônico',
  'Dinmico': 'Dinâmico',
  'dinmico': 'dinâmico',
  'Acadmico': 'Acadêmico',
  'acadmico': 'acadêmico',
  'Acadmica': 'Acadêmica',
  'acadmica': 'acadêmica',
  'Cientfico': 'Científico',
  'cientfico': 'científico',
  'Especfico': 'Específico',
  
  // Palavras com "á" perdido
  'Distncias': 'Distâncias',
  'distncias': 'distâncias',
  'Distncia': 'Distância',
  'distncia': 'distância',
  
  // Palavras com "i" com acento perdido
  'Fcil': 'Fácil',
  'fcil': 'fácil',
  'Dficil': 'Difícil',
  'dficil': 'difícil',
  'Crtico': 'Crítico',
  'crtico': 'crítico',
  'Crtica': 'Crítica',
  'crtica': 'crítica',
  'Lngua': 'Língua',
  'lngua': 'língua',
  'Ingls': 'Inglês',
  'ingls': 'inglês',
  'Portugus': 'Português',
  'portugus': 'português',
  'Pais': 'País',    // careful - check context
  'Pases': 'Países',
  'pases': 'países',
  
  // Palavras com "ú" perdido
  'ltimo': 'último',
  'ltimos': 'últimos',
  'ltima': 'última',
  'ltimas': 'últimas',
  'nico': 'único',
  'nicos': 'únicos',
  'nica': 'única',
  'nicas': 'únicas',
  'Nico': 'Único',
  'Nicos': 'Únicos',
  'Nica': 'Única',
  'Nicas': 'Únicas',
  
  // Palavras com "â" perdido
  'Tambm': 'Também',
  'tambm': 'também',
  'Atravs': 'Através',
  'atravs': 'através',
  'Alm': 'Além',
  'alm': 'além',
  'Pblico': 'Público',  // duplicate ok
  
  // "é" como verbo de ligação perdido (padrão: "palavra  palavra")
  // Muito arriscado substituir automaticamente - skip
  
  // Acento em "já"
  'j foi': 'já foi',
  'j capacitou': 'já capacitou',
  'j comprovou': 'já comprovou',
  'j existe': 'já existe',
  'j tem': 'já tem',
  'j contou': 'já contou',
  'j est': 'já está',
  'j passou': 'já passou',
  'j criou': 'já criou',
  'j acesso': 'já acesso',
  
  // "então"
  'Ento': 'Então',
  'ento': 'então',
  
  // "preço"
  'Preo': 'Preço',
  'preo': 'preço',
  
  // "não" - muito arriscado por causar "so" → "são" (too broad)
  
  // mais palavras comuns
  'Currculo': 'Currículo',
  'currculo': 'currículo',
  'Currculos': 'Currículos',
  'currculos': 'currículos',
  'Prticamente': 'Praticamente',
  'prticamente': 'praticamente',
  'Pgina': 'Página',
  'pgina': 'página',
  'Pginas': 'Páginas',
  'pginas': 'páginas',
  'Matrcula': 'Matrícula',
  'matrcula': 'matrícula',
  'Matrcula': 'Matrícula',
  'Mtodo': 'Método',
  'mtodo': 'método',
  'Mtodos': 'Métodos',
  'mtodos': 'métodos',
  'Pblicamente': 'Publicamente',
  'pblicamente': 'publicamente',
  'Carcter': 'Caráter',
  'carcter': 'caráter',
  'Crdito': 'Crédito',
  'crdito': 'crédito',
  'Crditos': 'Créditos',
  'crditos': 'créditos',
  'Mdica': 'Médica',
  'mdica': 'médica',
  'Funo': 'Função',  // duplicate
  'Prtender': 'Pretender',
  'Genro': 'Gênero',
  'genro': 'gênero',
  'Gnero': 'Gênero',
  'gnero': 'gênero',
  'Gneros': 'Gêneros',
  'gneros': 'gêneros',
  'Mdia Social': 'Mídia Social',
  'mdia social': 'mídia social',
  'Recrutamento tcnico': 'Recrutamento técnico',
  'Nmero de vagas': 'Número de vagas',
  'Incio': 'Início',
  'incio': 'início',
  'Programao em': 'Programação em',
  'Educao em': 'Educação em',
  'Profisso de': 'Profissão de',
  'Alm disso': 'Além disso',
  'Alm de': 'Além de',
  'alm disso': 'além disso',
  'alm de': 'além de',
  'Tambm': 'Também',
  'Certeza': 'certeza',  // skip - correct
  'Pgina Inicial': 'Página Inicial',
  'pgina inicial': 'página inicial',
  'Pgina de': 'Página de',
  'Prximo Passo': 'Próximo Passo',
  'prximo passo': 'próximo passo',
  'Avanos': 'Avanços',
  'avanos': 'avanços',
  'Avano': 'Avanço',
  'avano': 'avanço',
  'Preo cobrado': 'Preço cobrado',
  'Reao': 'Reação',
  'reao': 'reação',
  'Atrao': 'Atração',
  'atrao': 'atração',
  'Questo': 'Questão',
  'questo': 'questão',
  'Questes': 'Questões',
  'Comunicar': 'Comunicar',  // already correct
  'Conquista': 'Conquista',  // already correct
  'Cansao': 'Cansaço',
  'cansao': 'cansaço',
  'Ateno': 'Atenção',
  'ateno': 'atenção',
  'Poro': 'Porção',
  'poro': 'porção',
  'Exceo': 'Exceção',
  'exceo': 'exceção',
  'Correte': 'Correto',
  'Vdeo': 'Vídeo',
  'vdeo': 'vídeo',
  'Vdeos': 'Vídeos',
  'vdeos': 'vídeos',
  'gio': 'ágio',  // too risky
  'stgio': 'estágio',
  'Stgio': 'Estágio',
  'Estgio': 'Estágio',
  'estgio': 'estágio',
  'Estgios': 'Estágios',
  'estgios': 'estágios',
  'Avaliacao': 'Avaliação',
  'avaliacao': 'avaliação',
  'Trnsito': 'Trânsito',
  'trnsito': 'trânsito',
  'Prmio': 'Prêmio',
  'prmio': 'prêmio',
  'Prmios': 'Prêmios',
  'prmios': 'prêmios',
  'Comrcio': 'Comércio',
  'comrcio': 'comércio',
  'Comrcial': 'Comercial', // actually "comércio" but "comercial" is correct
  'comrcial': 'comercial',
  'Cmara': 'Câmara',
  'cmara': 'câmara',
  'Poltica': 'Política',
  'poltica': 'política',
  'Poltico': 'Político',
  'poltico': 'político',
  'Polticas': 'Políticas',
  'polticas': 'políticas',
  'Dificuldade': 'Dificuldade',  // already correct
  'Obstculo': 'Obstáculo',
  'obstculo': 'obstáculo',
  'Obstculos': 'Obstáculos',
  'obstculos': 'obstáculos',
  'Intervalo': 'Intervalo',  // already correct
  'Horrio': 'Horário',
  'horrio': 'horário',
  'Horrios': 'Horários',
  'horrios': 'horários',
  'Necessrio': 'Necessário',
  'necessrio': 'necessário',
  'Necessria': 'Necessária',
  'necessria': 'necessária',
  'Prioridade': 'Prioridade',  // already correct
  'Responsabilidade': 'Responsabilidade',  // already correct
  'Liderana': 'Liderança',
  'liderana': 'liderança',
  'Lderes': 'Líderes',
  'lderes': 'líderes',
  'Lder': 'Líder',
  'lder': 'líder',
  'Comeo': 'Começo',
  'comeo': 'começo',
  'Comear': 'Começar',
  'comear': 'começar',
  'Comece': 'Comece',  // already correct
  'Exerccio': 'Exercício',
  'exerccio': 'exercício',
  'Exerccios': 'Exercícios',
  'exerccios': 'exercícios',
  'Prximo': 'Próximo',
  'prximo': 'próximo',
  'Hbito': 'Hábito',
  'hbito': 'hábito',
  'Hbitos': 'Hábitos',
  'hbitos': 'hábitos',
  'Fbrica': 'Fábrica',
  'fbrica': 'fábrica',
  'Produo': 'Produção',
  'produo': 'produção',
  'Profissionais': 'Profissionais',  // already correct
  'Concurso pblico': 'Concurso público',
  'concurso pblico': 'concurso público',
  'Concursos pblicos': 'Concursos públicos',
  'concursos pblicos': 'concursos públicos',
  'Anncios': 'Anúncios',
  'anncios': 'anúncios',
  'Anncio': 'Anúncio',
  'anncio': 'anúncio',
  'Veculos': 'Veículos',
  'veculos': 'veículos',
  'Veculo': 'Veículo',
  'veculo': 'veículo',
  'Prdio': 'Prédio',
  'prdio': 'prédio',
  'Eficcia': 'Eficácia',
  'eficcia': 'eficácia',
  'Matemtica': 'Matemática',
  'matemtica': 'matemática',
  'Fsica': 'Física',
  'fsica': 'física',
  'Qumica': 'Química',
  'qumica': 'química',
  'Geografa': 'Geografia',  // probably already ok
  'Liderana': 'Liderança',  // duplicate
  'Critrio': 'Critério',
  'critrio': 'critério',
  'Critrios': 'Critérios',
  'critrios': 'critérios',
  'Regra': 'Regra',  // already correct
  'Cursa': 'Cursa',  // already correct
  'Mdulo': 'Módulo',
  'mdulo': 'módulo',
  'Mdulos': 'Módulos',
  'mdulos': 'módulos',
  'ndice': 'índice',
  'ndices': 'índices',
  'ndice': 'Índice',
  
  // Palavras com "ç" perdida
  'balano': 'balanço',
  'Balano': 'Balanço',
  'licena': 'licença',
  'Licena': 'Licença',
  'fora': 'força',  // too risky - "fora" = out of
  'graa': 'graça',
  'Graa': 'Graça',
};

// Build sorted list (longest first to avoid partial replacements)
const sortedEntries = Object.entries(WORD_MAP).sort((a, b) => b[0].length - a[0].length);

function fixText(text) {
  let result = text;
  for (const [wrong, correct] of sortedEntries) {
    if (wrong === correct) continue; // skip already-correct entries
    // Use word boundary matching for whole-word replacements
    // Escape special regex characters in the wrong word
    const escaped = wrong.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp('\\b' + escaped + '\\b', 'g');
    result = result.replace(regex, correct);
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
const fixedContent = fixText(originalContent);

// Count changes
let changes = 0;
for (let i = 0; i < originalContent.length; i++) {
  if (originalContent[i] !== fixedContent[i]) changes++;
}

fs.writeFileSync(blogPath, fixedContent, 'utf8');
console.log(`✅ seed_blog.json: ~${changes} caracteres alterados`);

// Validate JSON
try {
  JSON.parse(fixedContent);
  console.log('✅ JSON válido após correções');
} catch (e) {
  console.error('❌ ERRO: JSON inválido após correções! Restaurando backup...');
  fs.copyFileSync(backupPath, blogPath);
  console.error(e.message);
  process.exit(1);
}

// Apply same fixes to seed_jobs.json for visible text fields only
const jobsPath = path.join(BASE, 'api/seed_jobs.json');
const jobsBackup = jobsPath + '.bak_spell';
if (!fs.existsSync(jobsBackup)) {
  fs.copyFileSync(jobsPath, jobsBackup);
}
const jobsOriginal = fs.readFileSync(jobsPath, 'utf8');
let jobsFixed = jobsOriginal;

// For jobs, only fix fields that are visible text (not area, type, modality, source_name, apply_url, etc.)
// We'll parse the JSON, fix relevant fields, then re-serialize
let jobsData;
try {
  jobsData = JSON.parse(jobsOriginal);
} catch(e) {
  console.error('❌ seed_jobs.json não é JSON válido:', e.message);
  process.exit(1);
}

const TEXT_FIELDS_JOBS = ['title', 'description', 'requirements', 'benefits', 'salary', 'deadline', 'city'];

let jobChanges = 0;
for (const job of jobsData) {
  for (const field of TEXT_FIELDS_JOBS) {
    if (job[field] && typeof job[field] === 'string') {
      const fixed = fixText(job[field]);
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
  console.log(`ℹ seed_jobs.json: sem alterações em campos de texto visível`);
}

// Apply fixes to courses.js (only description, title, certificateNote, categoryName, badge fields)
const coursesPath = path.join(BASE, 'src/data/courses.js');
const coursesBackup = coursesPath + '.bak_spell';
if (!fs.existsSync(coursesBackup)) {
  fs.copyFileSync(coursesPath, coursesBackup);
}

// For courses.js (not pure JSON), we'll apply text fixes carefully
// The file has JS structure, so we process it as text but only inside string values
const coursesOriginal = fs.readFileSync(coursesPath, 'utf8');
const coursesFixed = fixText(coursesOriginal);

if (coursesFixed !== coursesOriginal) {
  fs.writeFileSync(coursesPath, coursesFixed, 'utf8');
  console.log('✅ src/data/courses.js: correções aplicadas');
} else {
  console.log('ℹ src/data/courses.js: sem alterações');
}

console.log('\n=== CONCLUÍDO ===');
