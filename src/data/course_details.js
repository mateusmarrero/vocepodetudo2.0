/**
 * course_details.js
 * Gerador e Curador Inteligente de Detalhes Expandidos de Cursos
 * Portal Você Pode Tudo — Parceria com Cursos Oficiais (Aprenda Mais MEC, Sebrae, Bradesco, etc.)
 *
 * Estrutura de Informações:
 * 1. Módulos & Ementa do Curso (3 a 5 módulos estruturados com competências)
 * 2. Pré-requisitos & Público-Alvo (escolaridade, requisitos, equipamentos)
 * 3. Metodologia de Ensino & Avaliação (100% online, autoinstrucional, nota mínima 60% ou 70%)
 * 4. Certificação Gratuita (PDF oficial, autenticação eletrônica, horas complementares MEC/LDB)
 * 5. Como destacar no Currículo (seção do CV, texto pronto para copiar, palavras-chave ATS, dica de entrevista)
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    var exp = factory();
    root.CourseDetailsModule = exp;
    root.getCourseExpandedDetails = exp.getCourseExpandedDetails;
    root.getCourseExpandedDetailsHtml = exp.getCourseExpandedDetailsHtml;
  }
})(typeof self !== 'undefined' ? self : this, function () {

  // Base curricular de cursos com curadoria específica
  const SPECIFIC_COURSE_SYLLABUS = {
    // Cursos Oficiais do Aprenda Mais MEC
    'aprendamais-biosseguranca-estetica': {
      syllabus: [
        {
          number: 1,
          title: 'Introdução à Biossegurança e Legislação Sanitária',
          description: 'Conceitos fundamentais de biossegurança, normas da Anvisa (RDC 15/2012) e classificação dos riscos biológicos em estabelecimentos de beleza.',
          topics: ['História e importância da biossegurança', 'Normas sanitárias vigentes', 'Responsabilidade técnica e jurídica']
        },
        {
          number: 2,
          title: 'Higienização, Assepsia e Paramentação Profissional',
          description: 'Protocolos de higienização das mãos, uso obrigatório de Equipamentos de Proteção Individual (EPIs) e desinfecção de bancadas.',
          topics: ['Lavagem correta e antissepsia das mãos', 'Uso de luvas, máscaras e aventais descartáveis', 'Soluções desinfetantes hospitalares']
        },
        {
          number: 3,
          title: 'Limpeza, Desinfecção e Esterilização em Autoclave',
          description: 'Processamento de artigos críticos e semicríticos: lavagem com detergente enzimático, embalagem em papel grau cirúrgico e ciclo térmico na autoclave.',
          topics: ['Tipos de instrumentais metálicos', 'Envelopamento e selagem cirúrgica', 'Monitoramento biológico e químico da autoclave']
        },
        {
          number: 4,
          title: 'Gerenciamento de Resíduos e Descarte Seguro de Perfurocortantes',
          description: 'Manejo de resíduos de serviços de saúde (PGRSS), acondicionamento adequado em caixas Descarpack e prevenção de acidentes com agulhas e lâminas.',
          topics: ['Classificação de resíduos da Anvisa (Grupos A, B, D e E)', 'Descarte correto de agulhas e lâminas', 'Protocolo pós-exposição a material biológico']
        },
        {
          number: 5,
          title: 'Protocolos de Atendimento Seguro e Prontuário de Clientes',
          description: 'Ficha de anamnese, termo de consentimento livre e esclarecido, identificação de contraindicações e postura ética profissional.',
          topics: ['Elaboração da ficha de anamnese estética', 'Identificação de patologias da pele e unhas', 'Relação de confiança e segurança com a cliente']
        }
      ],
      learningOutcomes: [
        'Dominar a esterilização correta de alicates, pinças e instrumentais em autoclave',
        'Aplicar as normas da Anvisa e evitar interdições e multas sanitárias',
        'Garantir proteção contra hepatites virais, HIV e fungos para clientes e profissionais',
        'Montar a ficha de anamnese e gerenciar o descarte seguro de perfurocortantes'
      ],
      passingScorePercent: 60,
      minEducation: 'Ensino Fundamental II ou Médio em andamento',
      targetAudience: 'Manicures, pedicures, maquiadores, esteticistas, micropigmentadores, depiladoras, cabeleireiros e proprietários de salões de beleza.'
    },

    'aprendamais-drenagem-massoterapia-estetica': {
      syllabus: [
        {
          number: 1,
          title: 'Bases Anatômicas e Fisiológicas do Sistema Linfático',
          description: 'Compreensão da circulação linfática, capilares, linfonodos regionais, ducto torácico e a fisiologia da retenção hídrica.',
          topics: ['Estrutura dos vasos linfáticos', 'Localização dos principais gânglios linfáticos', 'Mecanismos de formação do edema']
        },
        {
          number: 2,
          title: 'Princípios e Manobras Clássicas de Drenagem Linfática Manual',
          description: 'Métodos Leduc e Vodder: pressão suave, direção do fluxo linfático, ritmo constante e desobstrução de linfonodos.',
          topics: ['Toque sutil e pressão adequada (30 a 40 mmHg)', 'Manobras de bombeamento e círculos fixos', 'Sequência de evacuação e captação']
        },
        {
          number: 3,
          title: 'Técnicas de Massagem Relaxante e Massagem Modeladora',
          description: 'Diferenciação entre relaxamento muscular profundo e manobras vigorosas modeladoras para contorno corporal.',
          topics: ['Deslizamento superficial e profundo', 'Fricção, amassamento e pinçamento estético', 'Indicações para celulite e adiposidade localizada']
        },
        {
          number: 4,
          title: 'Indicações, Contraindicações e Cuidados Clínicos',
          description: 'Identificação de quadros permitidos (retenção de líquidos, pós-operatório liberado) e contraindicações absolutas (trombose, infecções agudas).',
          topics: ['Contraindicações relativas e absolutas', 'Avaliação corporal pré-massagem', 'Orientações pós-procedimento ao paciente']
        },
        {
          number: 5,
          title: 'Ergonomia do Terapeuta e Atendimento de Excelência',
          description: 'Postura corporal para evitar lesões por esforço repetitivo (LER/DORT), biossegurança no atendimento e acolhimento profissional.',
          topics: ['Posicionamento na maca e conservação de energia', 'Uso adequado de toalhas e lençóis descartáveis', 'Atendimento humanizado e fidelização de clientes']
        }
      ],
      learningOutcomes: [
        'Executar drenagem linfática manual seguindo a anatomia correta dos gânglios',
        'Aplicar manobras de massagem modeladora e relaxante com ergonomia',
        'Saber identificar com precisão as contraindicações clínicas de massagens',
        'Oferecer tratamentos com padrão profissional em clínicas, spas ou atendimento a domicílio'
      ],
      passingScorePercent: 60,
      minEducation: 'Ensino Médio em andamento ou completo',
      targetAudience: 'Massoterapeutas, esteticistas, biomédicos, fisioterapeutas e pessoas interessadas em ingressar no mercado de bem-estar corporal.'
    },

    'aprendamais-saude-coletiva-epidemiologia': {
      syllabus: [
        {
          number: 1,
          title: 'História, Princípios e Diretrizes do Sistema Único de Saúde (SUS)',
          description: 'Universalidade, equidade, integralidade e organização dos níveis de atenção primária, secundária e terciária.',
          topics: ['Constituição de 1988 e Leis 8.080 e 8.142', 'Estratégia Saúde da Família (ESF)', 'Participação popular e controle social']
        },
        {
          number: 2,
          title: 'Bases da Vigilância Epidemiológica e Indicadores de Saúde',
          description: 'Medidas de morbimortalidade, incidência, prevalência, taxas de letalidade e sistemas de notificação obrigatória (SINAN).',
          topics: ['Conceito de epidemia, endemia e pandemia', 'Cálculo de taxas epidemiológicas', 'Notificação de agravos e investigação de surtos']
        },
        {
          number: 3,
          title: 'Doenças Transmissíveis e Controle Sanitário',
          description: 'Vigilância de arboviroses (Dengue, Zika, Chikungunya), tuberculose, hanseníase, ISTs e infecções respiratórias.',
          topics: ['Cadeia de transmissão de doenças infecciosas', 'Estratégias de vacinação e bloqueio', 'Ações de saneamento básico e meio ambiente']
        },
        {
          number: 4,
          title: 'Doenças Crônicas Não Transmissíveis e Promoção da Saúde',
          description: 'Fatores de risco modificáveis (hipertensão, diabetes, tabagismo e sedentarismo) e campanhas de prevenção coletiva.',
          topics: ['Transição epidemiológica e demográfica no Brasil', 'Políticas de alimentação saudável e atividade física', 'Planejamento de ações de saúde na comunidade']
        }
      ],
      learningOutcomes: [
        'Compreender a estrutura de funcionamento e os programas prioritários do SUS',
        'Interpretar gráficos, dados epidemiológicos e relatórios de vigilância em saúde',
        'Atuar em equipes multidisciplinares de atenção básica e saúde coletiva',
        'Preparar-se com excelência para concursos públicos das áreas de saúde e enfermagem'
      ],
      passingScorePercent: 60,
      minEducation: 'Ensino Médio em andamento ou completo',
      targetAudience: 'Estudantes e profissionais de enfermagem, agentes comunitários de saúde (ACS), agentes de endemias (ACE) e concurseiros do SUS.'
    },

    'aprendamais-desenvolvimento-saude-crianca': {
      syllabus: [
        {
          number: 1,
          title: 'Acompanhamento do Crescimento e Desenvolvimento Infantil',
          description: 'Uso da Caderneta de Saúde da Criança, curvas de peso e altura, marcos motores, cognitivos e socioafetivos.',
          topics: ['Parâmetros antropométricos do Ministério da Saúde', 'Marcos neuropsicomotores mês a mês', 'Sinais de alerta de atraso no desenvolvimento']
        },
        {
          number: 2,
          title: 'Aleitamento Materno e Introdução Alimentar Saudável',
          description: 'Vantagens do leite materno, pega correta, manejo de fissuras e introdução de alimentos sólidos aos 6 meses.',
          topics: ['Fisiologia da lactação e livre demanda', 'Técnicas de ordenha e armazenamento de leite', 'Alimentos in natura e prevenção do consumo de ultraprocessados']
        },
        {
          number: 3,
          title: 'Calendário Nacional de Imunização e Prevenção de Doenças',
          description: 'Vacinas obrigatórias da primeira infância (BCG, Pentavalente, Poliomielite, Tríplice Viral), prevenção de acidentes domésticos.',
          topics: ['Esquema vacinal do nascimento aos 5 anos', 'Prevenção de engasgos, quedas e queimaduras', 'Identificação precoce de sinais de gravidade em febre e desidratação']
        },
        {
          number: 4,
          title: 'Direitos da Criança e Atenção Integral na Primeira Infância',
          description: 'Estatuto da Criança e do Adolescente (ECA), estímulo ao brincar, vínculo afetivo familiar e identificação de vulnerabilidades.',
          topics: ['Importância dos primeiros 1000 dias de vida', 'Saúde emocional infantil e parentalidade positiva', 'Rede de proteção social e conselho tutelar']
        }
      ],
      learningOutcomes: [
        'Utilizar a Caderneta de Saúde da Criança de forma completa e técnica',
        'Orientar famílias sobre aleitamento materno e alimentação complementar saudável',
        'Compreender o calendário oficial de vacinas e protocolos de segurança pediátrica',
        'Aplicar conhecimentos em creches, escolas, postos de saúde ou no cuidado familiar'
      ],
      passingScorePercent: 60,
      minEducation: 'Ensino Médio ou Fundamental completo',
      targetAudience: 'Cuidadores infantis, babás, técnicos de enfermagem, professores de educação infantil, mães, pais e agentes de saúde.'
    },

    'avamec-tecnologia-educação': {
      syllabus: [
        {
          number: 1,
          title: 'Cultura Digital e as Competências Gerais da BNCC',
          description: 'Integração de recursos digitais ao currículo escolar conforme as diretrizes pedagógicas do Ministério da Educação.',
          topics: ['Letramento digital crítico', 'Cidadania digital e segurança na internet', 'Competência 5 da BNCC']
        },
        {
          number: 2,
          title: 'Metodologias Ativas: Sala de Aula Invertida e Gamificação',
          description: 'Estratégias de ensino centradas no estudante, projetos colaborativos, resolução de problemas e dinâmicas de jogo.',
          topics: ['Fundamentos das metodologias ativas', 'Planejamento de sala de aula invertida', 'Ferramentas de quiz e gamificação pedagógica']
        },
        {
          number: 3,
          title: 'Recursos Educacionais Abertos (REA) e Produção de Conteúdo',
          description: 'Uso de plataformas digitais interativas, criação de videoaulas, apresentações dinâmicas e curadoria de materiais.',
          topics: ['Direitos autorais e licenças Creative Commons', 'Softwares livres para produção de materiais', 'Ambientes virtuais de aprendizagem']
        },
        {
          number: 4,
          title: 'Avaliação da Aprendizagem Mediada por Tecnologias',
          description: 'Instrumentos avaliativos formativos e somativos digitais, feedback imediato e acompanhamento da evolução da turma.',
          topics: ['Formulários e rubricas digitais', 'Análise de engajamento discente', 'Inclusão e acessibilidade digital no ensino']
        }
      ],
      learningOutcomes: [
        'Aplicar recursos tecnológicos e softwares educacionais em sala de aula',
        'Elaborar planos de aula inovadores com foco em metodologias ativas',
        'Aumentar o engajamento e a participação dos alunos nos estudos',
        'Utilizar o certificado oficial MEC para pontuação e progressão funcional na carreira docente'
      ],
      passingScorePercent: 60,
      minEducation: 'Ensino Médio completo ou Superior (Licenciatura/Pedagogia)',
      targetAudience: 'Professores da rede pública e privada, coordenadores pedagógicos, pedagogos e estudantes de licenciatura.'
    }
  };

  // Matriz de Ementas Temáticas Inteligentes por Categoria / Palavras-chave
  const THEMATIC_TEMPLATES = {
    beleza_estetica: {
      match: ['estetica', 'beleza', 'maquiagem', 'unhas', 'cabelo', 'barbearia', 'design de sobrancelhas', 'depilacao', 'massagem'],
      syllabus: [
        {
          number: 1,
          title: 'Fundamentos da Pele, Cabelo e Anatomia Aplicada',
          description: 'Estruturas biológicas, identificação de tipos de pele e fios, condições dermatológicas comuns e condutas profissionais.',
          topics: ['Tipologia cutânea e capilar', 'Fisiologia e renovação celular', 'Critérios de avaliação inicial']
        },
        {
          number: 2,
          title: 'Materiais, Ferramentas e Técnicas Passo a Passo',
          description: 'Seleção adequada de cosméticos, produtos hipoalergênicos, manuseio seguro de instrumentos e aplicação prática.',
          topics: ['Equipamentos profissionais essenciais', 'Técnicas de aplicação e modelagem', 'Tendências modernas de procedimentos']
        },
        {
          number: 3,
          title: 'Biossegurança, Higienização e Normas Sanitárias',
          description: 'Desinfecção de bancadas, assepsia, descarte ecológico de resíduos e uso de descartáveis conforme as normas da Anvisa.',
          topics: ['Esterilização e antissepsia', 'Uso de EPIs obrigatórios', 'Evitando contaminações cruzadas']
        },
        {
          number: 4,
          title: 'Atendimento ao Cliente, Precificação e Gestão do Negócio',
          description: 'Como calcular custos de produtos, definir preço do serviço, encantar a cliente e divulgar os trabalhos nas redes sociais.',
          topics: ['Precificação lucrativa de serviços', 'Fidelização e atendimento humanizado', 'Fotografia profissional e marketing no Instagram']
        }
      ],
      learningOutcomes: [
        'Executar procedimentos com segurança e técnica padronizada',
        'Trabalhar em conformidade total com as normas da vigilância sanitária',
        'Calcular preços corretos para garantir rentabilidade em cada atendimento',
        'Conquistar e fidelizar clientes particulares ou em salões e clínicas'
      ],
      passingScorePercent: 70,
      minEducation: 'Ensino Fundamental II ou Médio em andamento',
      targetAudience: 'Profissionais de estética, manicures, cabeleireiros, maquiadores, micropigmentadores e empreendedores da área da beleza.'
    },

    saude_cuidados: {
      match: ['saude', 'enfermagem', 'idoso', 'primeiros socorros', 'cuidador', 'hospital', 'farmacia', 'nutricao', 'sus', 'vigilancia'],
      syllabus: [
        {
          number: 1,
          title: 'Princípios Éticos, Bioética e Legislação em Saúde',
          description: 'Deveres do profissional, sigilo de informações, direitos do paciente e diretrizes fundamentais do Sistema Único de Saúde.',
          topics: ['Código de ética profissional', 'Humanização na assistência à saúde', 'Legislação e segurança do paciente']
        },
        {
          number: 2,
          title: 'Sinais Vitais, Higiene e Procedimentos Básicos de Cuidado',
          description: 'Aferição de pressão arterial, temperatura, frequência cardíaca, auxílio na locomoção, alimentação e administração preventiva de rotinas.',
          topics: ['Técnicas de verificação de sinais vitais', 'Higiene e conforto do paciente acamado', 'Prevenção de lesões por pressão (escaras)']
        },
        {
          number: 3,
          title: 'Biossegurança, Controle de Infecções e Paramentação',
          description: 'Protocolos de lavagem de mãos, isolamento de contato, uso de EPIs e cuidados na prevenção de infecções comunitárias e hospitalares.',
          topics: ['Cadeia epidemiológica de transmissão', 'Higienização de equipamentos e superfícies', 'Manejo correto de materiais biológicos']
        },
        {
          number: 4,
          title: 'Comunicação Empática, Acolhimento e Suporte Familiar',
          description: 'Técnicas de comunicação com familiares e equipe multidisciplinar, empatia no trato com pacientes fragilizados e registros em prontuário.',
          topics: ['Comunicação assertiva e escuta ativa', 'Relato e evolução diária no prontuário', 'Cuidado com a saúde mental do profissional']
        }
      ],
      learningOutcomes: [
        'Aferir sinais vitais e prestar assistência com segurança e humanização',
        'Executar rotinas de controle de infecção e biossegurança rigorosa',
        'Registrar com clareza a evolução e o estado de saúde do assistido',
        'Possuir formação complementar valorizada em hospitais, clínicas e lares de idosos'
      ],
      passingScorePercent: 60,
      minEducation: 'Ensino Médio em andamento ou completo',
      targetAudience: 'Técnicos e auxiliares de enfermagem, cuidadores de idosos, agentes de saúde, socorristas e estudantes de graduação em saúde.'
    },

    programacao_dev: {
      match: ['programacao', 'python', 'javascript', 'java', 'react', 'node', 'web', 'html', 'css', 'backend', 'frontend', 'software', 'git', 'desenvolvimento', 'algoritmo', 'codigo'],
      syllabus: [
        {
          number: 1,
          title: 'Lógica Computacional e Fundamentos da Linguagem',
          description: 'Variáveis, tipos de dados primitivos, estruturas condicionais (if/else), laços de repetição (for/while) e resolução algorítmica.',
          topics: ['Configuração do ambiente e IDE (VS Code)', 'Tipos de dados, operadores e variáveis', 'Estruturas lógicas de controle de fluxo']
        },
        {
          number: 2,
          title: 'Funções, Modularização e Estruturas de Dados',
          description: 'Criação de funções reutilizáveis, escopo, coleções (arrays, listas, dicionários/objetos) e manipulação eficiente de dados.',
          topics: ['Declaração de funções e parâmetros', 'Manipulação de listas e matrizes', 'Tratamento de exceções e erros comuns']
        },
        {
          number: 3,
          title: 'Programação Orientada a Objetos e Boas Práticas',
          description: 'Classes, objetos, encapsulamento, herança, modularização e princípios de código limpo (Clean Code).',
          topics: ['Modelagem orientada a objetos', 'Organização de arquivos e módulos', 'Padrões de nomenclatura e legibilidade']
        },
        {
          number: 4,
          title: 'Projeto Prático, Integração e Versionamento com Git',
          description: 'Desenvolvimento de uma aplicação real do zero, versionamento com Git/GitHub e publicação de projeto para portfólio.',
          topics: ['Comandos essenciais do Git (commit, push, branch)', 'Construção do projeto prático final', 'Documentação em README profissional']
        }
      ],
      learningOutcomes: [
        'Escrever código funcional, limpo e estruturado para solucionar problemas reais',
        'Construir projetos completos para publicar no GitHub pessoal',
        'Dominar a sintaxe fundamental da tecnologia e ferramentas do mercado',
        'Preparar-se para vagas júnior, estágios de TI e desafios técnicos'
      ],
      passingScorePercent: 70,
      minEducation: 'Ensino Fundamental II ou Médio em andamento',
      targetAudience: 'Iniciantes em tecnologia, estudantes de computação, profissionais em transição de carreira e desenvolvedores em busca de reciclagem.'
    },

    dados_ia: {
      match: ['dados', 'data', 'ia', 'inteligencia artificial', 'machine learning', 'sql', 'power bi', 'analise de dados', 'deep learning'],
      syllabus: [
        {
          number: 1,
          title: 'Fundamentos de Análise de Dados e Inteligência Artificial',
          description: 'Conceitos essenciais de dados brutos versus dados estruturados, ciclo de vida dos dados e panorama das soluções de IA.',
          topics: ['Tipos de dados e métricas de negócio', 'Diferença entre análise preditiva e descritiva', 'Ética e responsabilidade no uso de IA']
        },
        {
          number: 2,
          title: 'Extração, Limpeza e Tratamento de Bases (ETL)',
          description: 'Importação de dados de planilhas e bancos relacionais, remoção de duplicatas, tratamento de valores nulos e padronização.',
          topics: ['Conexão com fontes de dados', 'Transformação e enriquecimento de bases', 'Tratamento de outliers e inconsistências']
        },
        {
          number: 3,
          title: 'Modelagem, Consultas e Cálculos Estratégicos',
          description: 'Relacionamento entre tabelas, criação de métricas de negócio (KPIs), consultas estruturadas e formulações analíticas.',
          topics: ['Modelagem dimensional', 'Consultas estruturadas e filtros lógicos', 'Criação de indicadores-chave de desempenho']
        },
        {
          number: 4,
          title: 'Visualização de Dados, Dashboards e Tomada de Decisão',
          description: 'Construção de painéis interativos, contação de histórias com dados (Data Storytelling) e geração de relatórios executivos.',
          topics: ['Escolha correta dos tipos de gráficos', 'Design visual de relatórios corporativos', 'Apresentação de insights para tomadores de decisão']
        }
      ],
      learningOutcomes: [
        'Transformar dados brutos em relatórios gerenciais claros e impactantes',
        'Construir dashboards dinâmicos para acompanhamento de metas da empresa',
        'Utilizar ferramentas de IA para aumentar a produtividade analítica',
        'Destacar-se para posições disputadas em Business Intelligence e Análise de Dados'
      ],
      passingScorePercent: 70,
      minEducation: 'Ensino Médio em andamento ou completo',
      targetAudience: 'Analistas, assistentes administrativos, estudantes de TI, gestores e profissionais que trabalham com métricas e relatórios.'
    },

    escritorio_excel: {
      match: ['excel', 'word', 'office', 'planilha', 'powerpoint', 'google docs', 'google sheets', 'produtividade'],
      syllabus: [
        {
          number: 1,
          title: 'Navegação, Formatação de Células e Estrutura de Pastas',
          description: 'Conhecendo a interface, atalhos indispensáveis do teclado, formatação de valores, datas, texto e formatação condicional.',
          topics: ['Atalhos rápidos para ganho de produtividade', 'Configuração de tipos de dados numéricos e moedas', 'Regras de formatação condicional visual']
        },
        {
          number: 2,
          title: 'Fórmulas e Funções Matemáticas e Lógicas Fundamentais',
          description: 'Aplicação de SOMA, MÉDIA, MÍNIMO, MÁXIMO, função SE, E/OU, CONT.SE e SOMASE para automatizar checagens.',
          topics: ['Sintaxe de fórmulas e operadores de cálculo', 'Construção de lógicas condicionais com SE composto', 'Funções estatísticas e de contagem']
        },
        {
          number: 3,
          title: 'Funções de Procura e Referência Avançadas',
          description: 'Cruzamento dinâmico de dados entre tabelas usando PROCV, PROCX, ÍNDICE e CORRESP para evitar digitação manual.',
          topics: ['Mapeamento de referências absolutas e relativas ($)', 'Buscas exatas e aproximadas com PROCV e PROCX', 'Validação de dados e criação de menus suspensos']
        },
        {
          number: 4,
          title: 'Tabelas Dinâmicas, Gráficos Interativos e Relatórios',
          description: 'Agrupamento em massa com Tabelas Dinâmicas, segmentação de dados (filtros visuais) e criação de gráficos elegantes.',
          topics: ['Criação e atualização de Tabelas Dinâmicas', 'Gráficos de barras, linhas e setores corporativos', 'Configuração de layout para impressão e exportação em PDF']
        }
      ],
      learningOutcomes: [
        'Criar planilhas profissionais automatizadas sem erros de fórmulas',
        'Dominar PROCV, PROCX e Tabelas Dinâmicas solicitados em testes de seleção',
        'Reduzir horas de trabalho manual em tarefas administrativas rotineiras',
        'Elevar o nível técnico do currículo para vagas em escritórios e empresas'
      ],
      passingScorePercent: 70,
      minEducation: 'Ensino Fundamental II ou Médio em andamento',
      targetAudience: 'Auxiliares administrativos, recepcionistas, secretárias, estudantes, estagiários e qualquer pessoa que utilize planilhas.'
    },

    empreendedorismo_vendas: {
      match: ['empreendedorismo', 'vendas', 'marketing', 'mei', 'negocios', 'comercial', 'negociacao', 'atendimento', 'cliente'],
      syllabus: [
        {
          number: 1,
          title: 'Mentalidade Empreendedora e Oportunidades de Mercado',
          description: 'Identificação de dores do cliente, proposta única de valor, modelo Canvas e estruturação formal do negócio (MEI).',
          topics: ['Pesquisa de público-alvo e concorrentes', 'Vantagens e tributação do MEI', 'Definição de produtos e serviços viáveis']
        },
        {
          number: 2,
          title: 'Marketing Digital e Atração de Clientes na Internet',
          description: 'Criação de presença no Google Meu Negócio, Instagram profissional, WhatsApp Business e estratégias de conteúdo orgânico.',
          topics: ['Configuração de catálogo no WhatsApp Business', 'Produção de postagens e vídeos que engajam', 'Estratégias para atrair clientes locais']
        },
        {
          number: 3,
          title: 'Técnicas de Vendas, Negociação e Contorno de Objeções',
          description: 'Funil de vendas, abordagem consultiva, perguntas investigativas (Spin Selling) e técnicas para fechamento de contratos.',
          topics: ['Etapas do funil comercial', 'Como responder ao "está caro" sem dar descontos desnecessários', 'Técnicas práticas de fechamento rápido']
        },
        {
          number: 4,
          title: 'Gestão Financeira, Controle de Caixa e Pós-Venda',
          description: 'Separação de finanças pessoais e empresariais, fluxo de caixa diário, margem de lucro e estratégias de fidelização.',
          topics: ['Controle de entradas e saídas no caixa', 'Cálculo de ponto de equilíbrio', 'Pesquisa de satisfação e recompra']
        }
      ],
      learningOutcomes: [
        'Estruturar um plano comercial prático para aumentar o faturamento',
        'Atrair clientes compradores utilizando ferramentas gratuitas da internet',
        'Negociar com confiança e fechar vendas com maior margem de lucro',
        'Gerenciar o caixa da empresa evitando endividamento'
      ],
      passingScorePercent: 70,
      minEducation: 'Ensino Fundamental completo ou Médio',
      targetAudience: 'Microempreendedores, autônomos, vendedores, consultores, lojistas e interessados em abrir seu próprio negócio.'
    },

    financas_gestao: {
      match: ['financas', 'gestao', 'financeiro', 'investimento', 'contabilidade', 'dinheiro', 'orcamento', 'economia', 'fluxo de caixa'],
      syllabus: [
        {
          number: 1,
          title: 'Diagnóstico Financeiro e Orçamento Consciente',
          description: 'Mapeamento detalhado de receitas e despesas fixas/variáveis, identificação de vazamentos no orçamento e métodos de corte.',
          topics: ['Elaboração da planilha orçamentária pessoal/familiar', 'Método 50-30-20 de divisão financeira', 'Identificação de despesas invisíveis']
        },
        {
          number: 2,
          title: 'Controle de Endividamento e Recuperação de Crédito',
          description: 'Estratégias de negociação de dívidas com bancos e credores, cálculo de juros compostos no rotativo e saída do cheque especial.',
          topics: ['Priorização do pagamento de dívidas caras', 'Como negociar nos Feirões Limpa Nome (Serasa)', 'Reorganização do Score de crédito']
        },
        {
          number: 3,
          title: 'Reserva de Emergência e Renda Fixa Segura',
          description: 'Onde guardar a reserva de emergência, liquidez diária, diferença entre Poupança, Tesouro Selic, CDBs com FGC e LCI/LCA.',
          topics: ['Cálculo de quantos meses compõem a reserva', 'Funcionamento do Fundo Garantidor de Créditos (FGC)', 'Aplicação prática no Tesouro Direto']
        },
        {
          number: 4,
          title: 'Planejamento de Longo Prazo e Metas Patrimoniais',
          description: 'Proteção contra a inflação (IPCA+), previdência e investimentos para independência financeira com segurança.',
          topics: ['Impacto da inflação no poder de compra', 'Paciência e efeito multiplicador dos juros compostos', 'Estabelecendo metas financeiras de curto, médio e longo prazo']
        }
      ],
      learningOutcomes: [
        'Organizar as finanças e eliminar o estresse do endividamento mensal',
        'Construir uma reserva de emergência segura e rentável',
        'Compreender investimentos básicos sem cair em promessas enganosas',
        'Gerenciar orçamentos com visão analítica e estratégica'
      ],
      passingScorePercent: 70,
      minEducation: 'Ensino Fundamental II ou Médio em andamento',
      targetAudience: 'Estudantes, trabalhadores assalariados, famílias, autônomos e qualquer pessoa que deseja organizar o próprio dinheiro.'
    },

    idiomas_ingles: {
      match: ['ingles', 'english', 'idiomas', 'espanhol', 'frances', 'linguagens'],
      syllabus: [
        {
          number: 1,
          title: 'Vocabulário Cotidiano e Expressões de Cumprimento',
          description: 'Saudações, apresentações pessoais, numerais, dias da semana, nacionalidades e conversação introdutória.',
          topics: ['Greetings and polite introductions', 'Alphabet and pronunciation basics', 'Personal pronouns and verb to be']
        },
        {
          number: 2,
          title: 'Rotina, Família, Trabalho e Descrições',
          description: 'Uso do presente simples, advérbios de frequência, hobbies, profissões e descrição de pessoas e ambientes.',
          topics: ['Present Simple for daily routines', 'Questions with Do and Does', 'Adjectives and possessives']
        },
        {
          number: 3,
          title: 'Situações Práticas: Compras, Viagens e Restaurantes',
          description: 'Como fazer pedidos, pedir direções na rua, compras no supermercado e vocabulário essencial de emergência em viagens.',
          topics: ['Ordering food and asking prices', 'Giving and following directions', 'Modal verbs for polite requests (Could, Would)']
        },
        {
          number: 4,
          title: 'Comunicação Profissional Básica e Entrevistas',
          description: 'Como responder perguntas simples em inglês em processos seletivos, escrever e-mails curtos e falar sobre sua experiência.',
          topics: ['Job interview questions in English', 'Writing simple professional e-mails', 'Listening comprehension with native speakers']
        }
      ],
      learningOutcomes: [
        'Compreender diálogos cotidianos e responder com clareza em inglês básico',
        'Ler instruções técnicas, termos de trabalho e mensagens em plataformas digitais',
        'Apresentar-se com segurança em entrevistas de seleção que exigem noções do idioma',
        'Destacar o idioma oficial no currículo com certificação institucional'
      ],
      passingScorePercent: 60,
      minEducation: 'Ensino Fundamental II ou Médio',
      targetAudience: 'Iniciantes que nunca estudaram inglês, profissionais que precisam do idioma para crescer na carreira e viajantes.'
    },

    acessibilidade_libras: {
      match: ['libras', 'acessibilidade', 'inclusao', 'surdos', 'deficiencia', 'braille', 'audiodescricao'],
      syllabus: [
        {
          number: 1,
          title: 'Cultura Surda, Identidade e Legislação da Libras',
          description: 'História da comunidade surda no Brasil, Lei nº 10.436/2002 e Decreto nº 5.626/2005 que oficializaram a Língua Brasileira de Sinais.',
          topics: ['Mitos e verdades sobre a comunidade surda', 'Identidades e diversidade linguística', 'Acessibilidade como direito fundamental']
        },
        {
          number: 2,
          title: 'Parâmetros Fonológicos da Libras e Alfabeto Manual',
          description: 'Configurações de mão, pontos de articulação, movimento, orientação da palma e expressões faciais/corporais não-manuais.',
          topics: ['Datilologia (alfabeto manual e numerais)', 'Os 5 parâmetros estruturantes dos sinais', 'Expressão facial como marcador gramatical']
        },
        {
          number: 3,
          title: 'Vocabulário para Atendimento Inclusivo ao Público',
          description: 'Cumprimentos, pedidos de informação, família, profissões, sinais de saúde e direcionamentos essenciais de acolhimento.',
          topics: ['Saudações e apresentação pessoal em Libras', 'Sinais voltados ao atendimento em recepções e lojas', 'Classificadores básicos']
        },
        {
          number: 4,
          title: 'Diálogos Práticos e Práticas Inclusivas no Trabalho',
          description: 'Simulações de conversação, atendimento humanizado a pessoas com deficiência e eliminação de barreiras atitudinais.',
          topics: ['Simulação de atendimento em serviços públicos e comércio', 'Adaptação de ambientes e materiais comunicacionais', 'Ética na interação com a comunidade surda']
        }
      ],
      learningOutcomes: [
        'Comunicar-se em Libras básica com segurança em recepções, lojas e serviços públicos',
        'Compreender os parâmetros gramaticais da Língua Brasileira de Sinais',
        'Promover ambientes de trabalho verdadeiramente acessíveis e inclusivos',
        'Obter diferencial competitivo raro e valorizado em processos seletivos e editais públicos'
      ],
      passingScorePercent: 60,
      minEducation: 'Ensino Fundamental II ou Médio em andamento',
      targetAudience: 'Atendentes, recepcionistas, professores, profissionais de RH, servidores públicos e pessoas interessadas em inclusão social.'
    },

    concursos_direito: {
      match: ['concursos', 'direito', 'legislacao', 'constitucional', 'administrativo', 'servico publico', 'etica', 'consumidor'],
      syllabus: [
        {
          number: 1,
          title: 'Fundamentos Constitucionais e Direitos e Garantias Fundamentais',
          description: 'Artigo 5º da CF/88, direitos individuais e coletivos, remédios constitucionais (Habeas Corpus, Mandado de Segurança) e princípios.',
          topics: ['Princípios fundamentais da República', 'Direitos e deveres individuais e coletivos', 'Garantias processuais constitucionais']
        },
        {
          number: 2,
          title: 'Princípios da Administração Pública e Regime Jurídico',
          description: 'Princípios do LIMPE (Legalidade, Impessoalidade, Moralidade, Publicidade, Eficiência), poderes administrativos e atos públicos.',
          topics: ['Princípios expressos e implícitos da administração', 'Atributos e elementos do ato administrativo', 'Poder de polícia e poder disciplinar']
        },
        {
          number: 3,
          title: 'Ética Pública, Probidade e Lei de Acesso à Informação (LAI)',
          description: 'Deveres e vedações ao servidor público, Lei de Improbidade Administrativa (Lei nº 8.429/92) e transparência governamental.',
          topics: ['Normas de conduta no serviço público', 'Atos de improbidade e suas penalidades', 'Direito à informação e transparência pública']
        },
        {
          number: 4,
          title: 'Resolução Prática de Questões e Técnicas de Prova',
          description: 'Análise de pegadinhas frequentes de bancas examinadoras (Cebraspe, FGV, FCC, Vunesp) e fixação dos temas mais cobrados.',
          topics: ['Interpretação precisa de enunciados jurídicos', 'Mapeamento de jurisprudência sumulada recorrente', 'Estratégias de gestão de tempo durante a prova']
        }
      ],
      learningOutcomes: [
        'Dominar os conceitos de Direito e Legislação mais cobrados em concursos públicos',
        'Compreender o funcionamento prático da administração pública brasileira',
        'Resolver questões de concursos com rapidez e alta taxa de acerto',
        'Utilizar a carga horária para prova de títulos em certames públicos oficiais'
      ],
      passingScorePercent: 60,
      minEducation: 'Ensino Médio em andamento ou completo',
      targetAudience: 'Concurseiros em preparação para certames federais, estaduais e municipais, estudantes de direito e servidores públicos.'
    }
  };

  /**
   * Helper que normaliza texto para busca insensível a acentos
   */
  function normalizeText(str) {
    if (!str) return '';
    return str
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  /**
   * Identifica se uma instituição exige 60% ou 70% para certificação
   */
  function getPassingScoreForCourse(course) {
    const provider = normalizeText(course.provider || '');
    const provTag = normalizeText(course.providerTag || '');
    const url = normalizeText(course.url || '');

    // Cursos federais, MEC, EV.G, AVASUS, AVAMEC utilizam 60% por padrão
    if (
      provider.includes('mec') ||
      provTag.includes('mec') ||
      url.includes('mec.gov.br') ||
      provider.includes('aprenda mais') ||
      provider.includes('avamec') ||
      provider.includes('enap') ||
      provider.includes('ev.g') ||
      provider.includes('ifrs') ||
      provider.includes('ifsp') ||
      provider.includes('federal') ||
      provider.includes('fiocruz') ||
      provider.includes('una-sus') ||
      provider.includes('avasus') ||
      provider.includes('banco central') ||
      provider.includes('gov.br')
    ) {
      return 60;
    }

    // Sebrae, Fundação Bradesco, Senai, Senac, ITA, Microsoft costumam usar 70%
    return 70;
  }

  /**
   * Gerador dinâmico de ementa caso o curso não tenha template exato
   */
  function generateDynamicSyllabus(course) {
    const title = course.title || 'Capacitação Profissional';
    const desc = course.description || '';
    const tags = Array.isArray(course.tags) ? course.tags : [];
    const workload = Number(course.workloadHours) || 20;

    // Extrair termos-chave
    const tag1 = tags[0] || 'Conceitos Iniciais';
    const tag2 = tags[1] || 'Práticas Essenciais';
    const tag3 = tags[2] || 'Aplicação no Trabalho';

    const modules = [
      {
        number: 1,
        title: `Introdução e Fundamentos de ${title}`,
        description: `Visão geral dos conceitos fundamentais, terminologia técnica, cenário de aplicação e primeiros passos essenciais.`,
        topics: [
          `Conceituação básica e panorama geral`,
          `Preparação do ambiente de estudos e ferramentas`,
          `Principais diretrizes e normas de referência`
        ]
      },
      {
        number: 2,
        title: `Técnicas, Métodos e Ferramentas Práticas (${tag1})`,
        description: `Aprofundamento nas metodologias aplicadas, operação de recursos práticos e execução de procedimentos recomendados.`,
        topics: [
          `Metodologias recomendadas passo a passo`,
          `Uso de ferramentas e técnicas aplicadas`,
          `Exercícios práticos de fixação do conhecimento`
        ]
      },
      {
        number: 3,
        title: `Boas Práticas, Estudos de Caso e Resolução de Problemas (${tag2})`,
        description: `Análise de situações reais do mercado de trabalho, resolução de erros frequentes e condutas profissionais para excelência.`,
        topics: [
          `Estudos de casos reais do ambiente profissional`,
          `Prevenção e correção de falhas comuns`,
          `Otimização de rotinas e aumento de eficiência`
        ]
      },
      {
        number: 4,
        title: `Projeto Prático, Aplicação no Mercado e Tendências (${tag3})`,
        description: `Consolidação dos aprendizados em um projeto prático ou plano de ação direcionado para atuação profissional imediata.`,
        topics: [
          `Desenvolvimento de atividade prática integradora`,
          `Tendências e inovações no mercado de trabalho`,
          `Diretrizes para continuidade dos estudos`
        ]
      }
    ];

    // Se o curso tiver carga horária robusta (> 40h), adiciona um 5º módulo
    if (workload >= 40) {
      modules.push({
        number: 5,
        title: 'Gestão, Inovação e Aplicação Avançada',
        description: 'Tópicos avançados de gestão, planejamento estratégico e implementação em larga escala no ambiente corporativo.',
        topics: [
          'Gestão de processos e melhoria contínua',
          'Liderança e trabalho em equipe no setor',
          'Avaliação final integradora de competências'
        ]
      });
    }

    return modules;
  }

  /**
   * Gera competências práticas de saída (learning outcomes) dinamicamente
   */
  function generateDynamicOutcomes(course) {
    const title = course.title || 'este curso';
    const provider = course.provider || 'instituição oficial parceira';
    const tags = Array.isArray(course.tags) ? course.tags : [];

    const outcomes = [
      `Dominar os fundamentos teóricos e práticos de ${title}`,
      `Executar rotinas e processos com padrão de qualidade exigido pelo mercado`,
      `Solucionar desafios cotidianos da área aplicando as melhores práticas atuais`
    ];

    if (tags.length > 0) {
      outcomes.push(`Aplicar conhecimentos específicos em ${tags.slice(0, 3).join(', ')}`);
    } else {
      outcomes.push(`Comprovar capacitação oficial reconhecida emitida por ${provider}`);
    }

    return outcomes;
  }

  /**
   * Gera a dica prática de currículo personalizada e formatada
   */
  function generateResumeTips(course) {
    const year = new Date().getFullYear();
    const workload = course.workloadHours || 20;
    const provider = course.provider || 'Plataforma Oficial';
    const title = course.title || 'Curso de Capacitação';
    const category = course.categoryName || course.category || 'Geral';
    const tags = Array.isArray(course.tags) ? course.tags : [];

    // Formatação pronta para copiar
    const formattedEntry = `${title} – ${provider} (${workload}h, ${year})`;

    // Palavras-chave estratégicas para ATS (Gupy, Kenoby, LinkedIn)
    const baseKeywords = [title, provider, category, `${workload}h`, 'Certificado Oficial'];
    const atsKeywords = Array.from(new Set([...baseKeywords, ...tags])).slice(0, 7);

    // Dica para entrevista (Pitch de Empregabilidade)
    const interviewPitch = `Na entrevista de emprego, cite que concluiu a capacitação de ${workload} horas em "${title}" pela ${provider}. Explique como os conhecimentos práticos adquiridos nesta formação tornam você apto a executar as atividades exigidas pela vaga desde o primeiro dia de trabalho.`;

    return {
      recommendedSection: 'Cursos e Capacitações / Formação Complementar',
      formattedEntry: formattedEntry,
      atsKeywords: atsKeywords,
      interviewPitch: interviewPitch,
      practicalAdvice: 'Adicione este curso no seu currículo em papel e no seu perfil do LinkedIn. No LinkedIn, insira a certificação oficial no campo "Licenças e Certificados", informando a instituição emissora para passar nos filtros de busca dos recrutadores de RH.'
    };
  }

  /**
   * FUNÇÃO PRINCIPAL: getCourseExpandedDetails(course)
   * Retorna o objeto completo com os 5 eixos de informação exigidos para o aluno decidir
   */
  function getCourseExpandedDetails(course) {
    if (!course || typeof course !== 'object') {
      return null;
    }

    const courseId = course.id || '';
    const title = course.title || 'Curso Gratuito';
    const provider = course.provider || 'Instituição Oficial';
    const workload = Number(course.workloadHours) || 20;
    const level = course.level || 'Iniciante';
    const category = course.category || 'geral';
    const hasFreeCert = course.hasFreeCertificate !== false;
    const certNote = course.certificateNote || (hasFreeCert ? 'Certificado 100% Gratuito Oficial' : 'Aulas Gratuitas • Certificado Opcional');
    const url = course.url || 'https://vocepodetudo.com';

    // 1. Verificar se existe curadoria específica por ID
    let specificData = SPECIFIC_COURSE_SYLLABUS[courseId];

    // 2. Se não encontrar por ID, verificar se encaixa em algum template temático
    if (!specificData) {
      const searchHaystack = normalizeText(`${title} ${course.description || ''} ${(course.tags || []).join(' ')} ${category}`);
      for (const [key, tpl] of Object.entries(THEMATIC_TEMPLATES)) {
        const matches = tpl.match.some(keyword => searchHaystack.includes(normalizeText(keyword)));
        if (matches) {
          specificData = tpl;
          break;
        }
      }
    }

    // 3. Montar Ementa e Módulos
    const syllabus = specificData && specificData.syllabus ? specificData.syllabus : generateDynamicSyllabus(course);
    const learningOutcomes = specificData && specificData.learningOutcomes ? specificData.learningOutcomes : generateDynamicOutcomes(course);
    const passingScore = specificData && specificData.passingScorePercent ? specificData.passingScorePercent : getPassingScoreForCourse(course);

    // 4. Pré-requisitos & Público-Alvo
    let minEducation = 'Ensino Fundamental II ou Médio em andamento';
    if (level === 'Intermediário') {
      minEducation = 'Ensino Médio em andamento ou completo';
    } else if (level === 'Avançado') {
      minEducation = 'Ensino Médio completo ou Superior em andamento';
    }
    if (specificData && specificData.minEducation) {
      minEducation = specificData.minEducation;
    }

    let targetAudience = `Estudantes, profissionais em busca de qualificação para o mercado de trabalho e qualquer pessoa interessada em dominar ${title}.`;
    if (specificData && specificData.targetAudience) {
      targetAudience = specificData.targetAudience;
    }

    const prerequisites = {
      recommendedEducation: minEducation,
      targetAudience: targetAudience,
      requiredKnowledge: level === 'Iniciante' 
        ? 'Nenhum conhecimento prévio na área é exigido. Você aprenderá tudo do absoluto zero.'
        : 'Conhecimentos básicos de informática e noções introdutórias do assunto.',
      equipment: [
        'Computador (Desktop ou Notebook) ou Smartphone (celular Android / iOS)',
        'Navegador web moderno (Google Chrome, Edge, Safari ou Firefox)',
        'Conexão estável com a internet para assistir videoaulas e responder avaliações'
      ]
    };

    // 5. Metodologia de Ensino & Avaliação
    const isMec = normalizeText(provider).includes('mec') || normalizeText(url).includes('mec.gov.br') || normalizeText(provider).includes('aprenda mais');
    const methodology = {
      modality: '100% Online, Gratuito e Autoinstrucional (MOOC)',
      schedule: 'Estude no seu próprio ritmo, sem horários fixos de aula e com acesso 24 horas por dia.',
      learningResources: [
        'Videoaulas didáticas e explicativas',
        'Material didático complementar em PDF para leitura e download',
        'Questionários práticos de autoavaliação ao longo dos módulos',
        'Estudos de casos e exemplos práticos voltados ao mercado'
      ],
      assessment: 'Avaliação final online com questões objetivas de múltipla escolha sobre o conteúdo estudado.',
      passingScorePercent: passingScore,
      passingScoreDescription: `Aproveitamento mínimo de ${passingScore}% para aprovação e liberação imediata do certificado.`,
      attempts: 'Múltiplas tentativas permitidas com correção imediata para reforço e fixação do aprendizado.'
    };

    // 6. Certificação Gratuita
    const certification = {
      isFree: hasFreeCert,
      title: hasFreeCert ? 'Certificado Digital Oficial em PDF' : 'Atestado de Participação / Certificado Opcional',
      issuer: provider,
      hours: workload,
      howToIssue: hasFreeCert
        ? `Após concluir os módulos e atingir nota igual ou superior a ${passingScore}%, o certificado em PDF é gerado e disponibilizado para download imediato na própria plataforma oficial do curso.`
        : 'As aulas são de livre acesso gratuito em modo ouvinte. A certificação pode exigir taxa opcional de verificação na plataforma de origem.',
      authenticityCode: 'Contém código de autenticação eletrônica (hash verificador) e/ou QR Code público no verso para conferência instantânea de validade por empresas e faculdades.',
      legalValidity: isMec
        ? 'Emitido pelo Ministério da Educação (MEC) / Rede Federal de Educação Profissional, Científica e Tecnológica, respaldado pela Lei de Diretrizes e Bases da Educação Nacional (Lei nº 9.394/96).'
        : `Emitido oficialmente por ${provider}, respaldado pela legislação brasileira de Cursos Livres de Capacitação e Aperfeiçoamento Profissional (Lei nº 9.394/96 e Decreto nº 5.154/04).`,
      complementaryHours: 'Totalmente válido como Atividades Curriculares Complementares (ACC / Horas Complementares) em faculdades, universidades e cursos técnicos em todo o Brasil, além de prova de títulos em concursos públicos (conforme as regras de cada edital).'
    };

    // 7. Como destacar no Currículo
    const resumeTips = generateResumeTips(course);

    return {
      id: courseId,
      title: title,
      provider: provider,
      category: category,
      categoryName: course.categoryName || category,
      workloadHours: workload,
      level: level,
      hasFreeCertificate: hasFreeCert,
      certificateNote: certNote,
      url: url,
      totalModules: syllabus.length,
      syllabus: syllabus,
      learningOutcomes: learningOutcomes,
      prerequisites: prerequisites,
      methodology: methodology,
      certification: certification,
      resumeTips: resumeTips
    };
  }

  /**
   * Helper opcional para gerar a estrutura HTML semântica e elegante
   * para inclusão imediata no contêiner expansível do card.
   */
  function getCourseExpandedDetailsHtml(course) {
    const details = getCourseExpandedDetails(course);
    if (!details) return '';

    // Módulos resumidos e diretos (máximo 4 tópicos em lista enxuta)
    const modulesCompactHtml = (details.syllabus || []).slice(0, 4).map(m => `
      <li class="flex items-center gap-1.5 py-0.5 text-[11px] text-slate-700 leading-tight">
        <span class="w-3.5 h-3.5 rounded-full bg-emerald-100 text-[#00702a] text-[9px] font-black flex items-center justify-center flex-shrink-0">
          ${m.number}
        </span>
        <span class="truncate font-medium">${escapeHtml(m.title)}</span>
      </li>
    `).join('');

    // Tags ATS compactas (máximo 3)
    const atsTagsCompact = (details.resumeTips?.atsKeywords || []).slice(0, 3).map(kw => `
      <span class="inline-block px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-medium">
        #${escapeHtml(kw)}
      </span>
    `).join('');

    return `
      <div class="course-expanded-content text-left space-y-2 pt-2 border-t border-slate-200 text-slate-800">
        
        <!-- Bloco 1: Ementa Rápida -->
        <div class="p-2 rounded-xl bg-slate-50 border border-slate-200/90">
          <div class="flex items-center justify-between mb-1">
            <span class="text-[11px] font-bold text-slate-900 flex items-center gap-1">
              <span>📖</span> Conteúdo (${details.totalModules} Módulos)
            </span>
            <span class="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              ${details.workloadHours}h oficiais
            </span>
          </div>
          <ul class="space-y-0.5">
            ${modulesCompactHtml}
          </ul>
        </div>

        <!-- Bloco 2: 4 Pílulas de Informações Importantes em Grid 2x2 -->
        <div class="grid grid-cols-2 gap-1.5 text-xs">
          <!-- Certificado -->
          <div class="p-1.5 rounded-lg bg-emerald-50/70 border border-emerald-200 flex items-center gap-1.5">
            <i data-lucide="file-badge" class="w-3.5 h-3.5 text-emerald-600 flex-shrink-0"></i>
            <div class="min-w-0">
              <span class="block text-[9.5px] font-bold text-emerald-900 uppercase tracking-wide leading-none">Certificado</span>
              <span class="text-[10.5px] font-semibold text-slate-700 truncate block">100% Grátis (PDF)</span>
            </div>
          </div>

          <!-- Avaliação -->
          <div class="p-1.5 rounded-lg bg-amber-50/70 border border-amber-200 flex items-center gap-1.5">
            <i data-lucide="clipboard-check" class="w-3.5 h-3.5 text-amber-600 flex-shrink-0"></i>
            <div class="min-w-0">
              <span class="block text-[9.5px] font-bold text-amber-900 uppercase tracking-wide leading-none">Avaliação</span>
              <span class="text-[10.5px] font-semibold text-slate-700 truncate block">Nota mín. ${escapeHtml(details.methodology?.passingScore || '60%')}</span>
            </div>
          </div>

          <!-- Formato / Pré-requisitos -->
          <div class="p-1.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center gap-1.5">
            <i data-lucide="users" class="w-3.5 h-3.5 text-[#002776] flex-shrink-0"></i>
            <div class="min-w-0">
              <span class="block text-[9.5px] font-bold text-slate-600 uppercase tracking-wide leading-none">Pré-requisito</span>
              <span class="text-[10.5px] font-semibold text-slate-700 truncate block">${escapeHtml(details.prerequisites?.recommendedEducation || 'Livre')}</span>
            </div>
          </div>

          <!-- Metodologia / Formato -->
          <div class="p-1.5 rounded-lg bg-blue-50/70 border border-blue-200 flex items-center gap-1.5">
            <i data-lucide="award" class="w-3.5 h-3.5 text-blue-600 flex-shrink-0"></i>
            <div class="min-w-0">
              <span class="block text-[9.5px] font-bold text-blue-900 uppercase tracking-wide leading-none">Metodologia</span>
              <span class="text-[10.5px] font-semibold text-slate-700 truncate block">100% Online</span>
            </div>
          </div>
        </div>

        <!-- Bloco 3: Destaque no Currículo (Linha Única) -->
        <div class="flex items-center gap-1 overflow-hidden text-[10px] text-slate-500 pt-0.5">
          <span class="font-bold text-slate-600 flex-shrink-0">No Currículo:</span>
          <div class="flex items-center gap-1 truncate">
            ${atsTagsCompact}
          </div>
        </div>

      </div>
    `;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  return {
    getCourseExpandedDetails: getCourseExpandedDetails,
    getCourseExpandedDetailsHtml: getCourseExpandedDetailsHtml,
    escapeHtml: escapeHtml
  };
});
