/**
 * Você Pode Tudo — Teste de Perfil e Aptidão Profissional
 * Módulo de Perguntas, Áreas Profissionais, Algoritmo de Pontuação e Recomendações
 */

const CAREER_AREAS = {
  tecnologia: {
    id: 'tecnologia',
    title: 'Tecnologia & Informática',
    shortName: 'Tecnologia',
    icon: 'code',
    color: '#002776',
    badge: 'Inovação & Sistemas Digitais',
    tagline: 'Construindo o futuro com código, dados e inteligência digital.',
    description: 'Você possui forte afinidade com raciocínio lógico, curiosidade por novas tecnologias e facilidade para entender ferramentas digitais. Pessoas com este perfil têm grande potencial para criar softwares, automatizar processos, proteger dados e desenvolver soluções que impactam milhares de pessoas.',
    marketContext: 'A área de tecnologia continua sendo uma das mais aquecidas no Brasil, com alta demanda por profissionais de programação, inteligência artificial, suporte e computação em nuvem.',
    trackTitle: 'TRILHA: PRIMEIROS PASSOS NA TECNOLOGIA & PROGRAMAÇÃO',
    trackStepCourses: [
      { step: 1, id: 'windows-basico', label: 'Fundamentos de Informática & Uso do Computador' },
      { step: 2, id: 'logica-programacao', label: 'Lógica de Programação & Algoritmos do Zero' },
      { step: 3, id: 'html-css', label: 'Criação de Sites e Interfaces Web Modernas' },
      { step: 4, id: 'javascript-basico', label: 'Interatividade & Programação Web Prática' },
      { step: 5, id: 'python-basico', label: 'Programação em Python & Automação Inteligente' }
    ]
  },
  administracao: {
    id: 'administracao',
    title: 'Administração & Rotinas de Escritório',
    shortName: 'Administração',
    icon: 'briefcase',
    color: '#00702a',
    badge: 'Organização & Eficiência Corporativa',
    tagline: 'A espinha dorsal das empresas: método, clareza e controle.',
    description: 'Você se destaca pela atenção aos detalhes, facilidade com organização de rotinas, processos claros e controle financeiro. Profissionais deste perfil garantem que empresas, escritórios e órgãos públicos funcionem de forma eficiente, sem falhas e com relatórios rigorosamente em dia.',
    marketContext: 'Rotinas administrativas, secretariado, gestão de departamento pessoal e domínio avançado de planilhas são requisitos presentes em praticamente todas as empresas do país.',
    trackTitle: 'TRILHA: ROTINAS ADMINISTRATIVAS & ESCRITÓRIO DIGITAL',
    trackStepCourses: [
      { step: 1, id: 'windows-basico', label: 'Ambiente Operacional & Organização de Arquivos' },
      { step: 2, id: 'word-basico', label: 'Redação de Ofícios, Atas e Documentos no Word' },
      { step: 3, id: 'excel-basico', label: 'Planilhas, Fórmulas Essenciais & Controles no Excel' },
      { step: 4, id: 'fb-excel-completo', label: 'Tabelas Dinâmicas & Relatórios Gerenciais Avançados' },
      { step: 5, id: 'administracao-fgv', label: 'Fundamentos da Administração Moderna & Finanças' }
    ]
  },
  comunicacao: {
    id: 'comunicacao',
    title: 'Atendimento ao Cliente & Comunicação',
    shortName: 'Atendimento & Comunicação',
    icon: 'message-circle',
    color: '#009639',
    badge: 'Relacionamento & Encantamento',
    tagline: 'Conectando pessoas através da escuta, empatia e clareza.',
    description: 'Sua maior força está na capacidade de ouvir com atenção, dialogar com empatia, acalmar ânimos e transmitir informações com clareza. Pessoas com este perfil brilham em setores de atendimento humanizado, suporte resolutivo, ouvidoria, recepção e comunicação corporativa.',
    marketContext: 'Empresas valorizam cada vez mais profissionais com inteligência emocional, excelente comunicação oral e escrita, e habilidade para transformar clientes em defensores da marca.',
    trackTitle: 'TRILHA: EXCELÊNCIA EM COMUNICAÇÃO & ATENDIMENTO AO CLIENTE',
    trackStepCourses: [
      { step: 1, id: 'comunicacao-profissional', label: 'Comunicação Clara & Postura no Ambiente de Trabalho' },
      { step: 2, id: 'vendas-atendimento', label: 'Atendimento Resolutivo & Encantamento de Clientes' },
      { step: 3, id: 'fb-comunicacao-escrita', label: 'Redação Corporativa, Clareza & Mensagens Profissionais' },
      { step: 4, id: 'ingles-basico', label: 'Vocabulário Essencial para Atendimento Bilíngue' },
      { step: 5, id: 'libras-basico', label: 'Comunicação Inclusiva & Atendimento Humanizado em Libras' }
    ]
  },
  criatividade: {
    id: 'criatividade',
    title: 'Design, Criatividade & Conteúdo Digital',
    shortName: 'Design & Criatividade',
    icon: 'palette',
    color: '#d97706',
    badge: 'Criação Visual & Narrativas',
    tagline: 'Dando forma e emoção a ideias, marcas e histórias.',
    description: 'Você possui um olhar estético diferenciado, imaginação fértil e paixão por transformar ideias em peças visuais, vídeos e mensagens marcantes. Seu perfil é ideal para criar artes, produzir vídeos, gerenciar mídias sociais e construir identidades visuais memoráveis.',
    marketContext: 'Com o avanço do comércio eletrônico e redes sociais, a busca por criadores de conteúdo que dominem edição de vídeo no celular, design gráfico e storytelling continua em forte expansão.',
    trackTitle: 'TRILHA: DESIGN, CRIATIVIDADE & PRODUÇÃO DE CONTEÚDO DIGITAL',
    trackStepCourses: [
      { step: 1, id: 'producao-video', label: 'Gravação & Edição de Vídeos Usando o Próprio Celular' },
      { step: 2, id: 'fotografia', label: 'Conceitos de Enquadramento, Iluminação & Estética' },
      { step: 3, id: 'desenho', label: 'Desenho Básico, Proporção & Expressão Visual' },
      { step: 4, id: 'google-marketing-digital', label: 'Marketing Digital & Presença Estratégica na Web' },
      { step: 5, id: 'canvas-negocio', label: 'Transformação de Ideias Criativas em Projetos Estruturados' }
    ]
  },
  vendas: {
    id: 'vendas',
    title: 'Empreendedorismo & Vendas',
    shortName: 'Empreendedorismo & Vendas',
    icon: 'trending-up',
    color: '#b45309',
    badge: 'Visão Comercial & Negócios',
    tagline: 'Identificando oportunidades e transformando ideias em resultados.',
    description: 'Você tem espírito de iniciativa, energia para negociar, gosto por desafios e determinação para alcançar metas. Pessoas com este perfil têm vocação para abrir seu próprio negócio (MEI), liderar vendas, negociar com fornecedores e prosperar no comércio e serviços.',
    marketContext: 'O empreendedorismo é um dos principais motores do Brasil. Dominar formalização, precificação, marketing digital e técnicas de vendas permite construir independência financeira sólida.',
    trackTitle: 'TRILHA: DO ZERO AO NEGÓCIO: EMPREENDEDORISMO & VENDAS',
    trackStepCourses: [
      { step: 1, id: 'validacao-ideia', label: 'Validação da Ideia de Negócio & Pesquisa de Mercado' },
      { step: 2, id: 'canvas-negocio', label: 'Desenho Prático do Modelo de Negócios com Canvas' },
      { step: 3, id: 'sebrae-mei', label: 'Abertura, Formalização & Benefícios do MEI' },
      { step: 4, id: 'financas-empreendedor', label: 'Gestão Financeira, Fluxo de Caixa & Lucratividade' },
      { step: 5, id: 'vendas-atendimento', label: 'Técnicas Modernas de Prospecção, Negociação & Fechamento' }
    ]
  },
  tecnica: {
    id: 'tecnica',
    title: 'Atividades Técnicas & Práticas Operacionais',
    shortName: 'Técnica & Prática',
    icon: 'wrench',
    color: '#0369a1',
    badge: 'Precisão Prática & Segurança',
    tagline: 'Garantindo a operação segura e o funcionamento do mundo real.',
    description: 'Você prefere o trabalho prático, gosta de colocar a mão na massa e valoriza procedimentos bem executados, normas de segurança e o funcionamento correto de máquinas e ferramentas. Profissionais deste perfil são essenciais na indústria, no agronegócio e na manutenção técnica.',
    marketContext: 'Habilidades técnicas práticas e conhecimento de normas de segurança do trabalho (NRs) e primeiros socorros são cruciais e muito demandados em indústrias, cooperativas e prestadoras de serviços.',
    trackTitle: 'TRILHA: FORMAÇÃO TÉCNICA PRÁTICA & OPERAÇÃO SEGURA',
    trackStepCourses: [
      { step: 1, id: 'senai-seguranca', label: 'Segurança no Trabalho & Normas Regulamentadoras (NRs)' },
      { step: 2, id: 'windows-basico', label: 'Operação Prática de Computadores & Sistemas de Apoio' },
      { step: 3, id: 'primeiros-socorros', label: 'Primeiros Socorros Fundamentais para a Vida e o Trabalho' },
      { step: 4, id: 'senar-ia-agro', label: 'Inovação Tecnológica Aplicada ao Campo e Agro' },
      { step: 5, id: 'senar-irrigacao', label: 'Gestão de Recursos Hídricos & Práticas Sustentáveis' }
    ]
  },
  gestao: {
    id: 'gestao',
    title: 'Gestão, Liderança & Organização',
    shortName: 'Gestão & Liderança',
    icon: 'compass',
    color: '#1e3a8a',
    badge: 'Estratégia & Liderança de Equipes',
    tagline: 'Unindo pessoas, prazos e estratégias para alcançar grandes metas.',
    description: 'Você possui visão ampla, capacidade de planejamento estratégico, liderança natural e facilidade para coordenar o esforço de várias pessoas. Profissionais deste perfil se destacam organizando projetos, gerenciando o tempo com disciplina e motivando equipes a superar desafios.',
    marketContext: 'Cargos de coordenação, supervisão e gestão de projetos continuam entre os mais valorizados pelas empresas, que buscam líderes éticos e focados em produtividade saudável.',
    trackTitle: 'TRILHA: LIDERANÇA ESTRATÉGICA & GESTÃO DE PROJETOS',
    trackStepCourses: [
      { step: 1, id: 'evg-gestao-tempo', label: 'Gestão do Tempo, Foco & Produtividade Pessoal' },
      { step: 2, id: 'lideranca-sebrae', label: 'Liderança Inspiradora & Gestão de Pessoas no Dia a Dia' },
      { step: 3, id: 'gestao-projetos-fgv', label: 'Metodologia de Gestão de Projetos, Prazos & Entregas' },
      { step: 4, id: 'administracao-fgv', label: 'Visão Estratégica Empresarial & Tomada de Decisão' },
      { step: 5, id: 'planejamento-carreira', label: 'Planejamento de Carreira & Crescimento Contínuo' }
    ]
  },
  educacao: {
    id: 'educacao',
    title: 'Educação & Desenvolvimento Humano',
    shortName: 'Educação & Inclusão',
    icon: 'book-open',
    color: '#047857',
    badge: 'Ensino, Inclusão & Mentoria',
    tagline: 'Capacitando vidas e gerando oportunidades através do aprendizado.',
    description: 'Sua grande vocação é compartilhar conhecimento, ajudar pessoas a superarem obstáculos e promover a inclusão social. Pessoas deste perfil encontram realização atuando em treinamentos corporativos, ensino, mentoria, inclusão de pessoas com deficiência e desenvolvimento humano.',
    marketContext: 'A educação digital, a acessibilidade e a inclusão social ganharam prioridade no Brasil, exigindo profissionais sensíveis e preparados para formar e orientar outras pessoas.',
    trackTitle: 'TRILHA: DESENVOLVIMENTO HUMANO, EDUCAÇÃO & INCLUSÃO',
    trackStepCourses: [
      { step: 1, id: 'como-fazer-curriculo', label: 'Diagnóstico de Competências & Planejamento Profissional' },
      { step: 2, id: 'libras-basico', label: 'Comunicação Inclusiva & Língua Brasileira de Sinais (Libras)' },
      { step: 3, id: 'avamec-tecnologia-educacao', label: 'Tecnologias Digitais & Metodologias Ativas de Ensino' },
      { step: 4, id: 'tecnologia-assistiva', label: 'Tecnologias Assistivas & Acessibilidade para Todos' },
      { step: 5, id: 'planejamento-carreira', label: 'Mentoria & Desenvolvimento de Trajetórias de Sucesso' }
    ]
  }
};

const CAREER_QUESTIONS = [
  {
    id: 1,
    category: 'Interesses & Desafios',
    title: 'Que tipo de desafio você mais tem prazer em resolver no dia a dia?',
    subtitle: 'Pense nas atividades que fazem seu tempo passar rápido e geram satisfação.',
    options: [
      {
        id: '1a',
        letter: 'A',
        icon: 'terminal',
        text: 'Construir ou consertar coisas com lógica, computadores, aplicativos ou sistemas digitais.',
        weights: { tecnologia: 4, tecnica: 1 }
      },
      {
        id: '1b',
        letter: 'B',
        icon: 'folder-check',
        text: 'Organizar documentos, controlar rotinas, planilhas e manter o escritório em perfeita ordem.',
        weights: { administracao: 4, gestao: 1 }
      },
      {
        id: '1c',
        letter: 'C',
        icon: 'message-square',
        text: 'Conversar com pessoas, ouvir suas dúvidas, atender com atenção e comunicar ideias com clareza.',
        weights: { comunicacao: 4, educacao: 1 }
      },
      {
        id: '1d',
        letter: 'D',
        icon: 'sparkles',
        text: 'Criar artes, fotos, vídeos, textos ou materiais visuais com imaginação e originalidade.',
        weights: { criatividade: 4, comunicacao: 1 }
      }
    ]
  },
  {
    id: 2,
    category: 'Ambiente de Trabalho',
    title: 'Em qual destes ambientes de trabalho você se sentiria mais motivado e realizado?',
    subtitle: 'Imagine o seu dia a dia profissional ideal.',
    options: [
      {
        id: '2a',
        letter: 'A',
        icon: 'shopping-bag',
        text: 'No comércio ou área comercial, negociando com clientes, fechando vendas e superando metas.',
        weights: { vendas: 4, comunicacao: 1 }
      },
      {
        id: '2b',
        letter: 'B',
        icon: 'hard-hat',
        text: 'Na área técnica ou operacional, aplicando normas de segurança, processos práticos e equipamentos.',
        weights: { tecnica: 4, gestao: 1 }
      },
      {
        id: '2c',
        letter: 'C',
        icon: 'users',
        text: 'Em um cargo de coordenação, organizando tarefas, liderando reuniões e acompanhando prazos.',
        weights: { gestao: 4, administracao: 1 }
      },
      {
        id: '2d',
        letter: 'D',
        icon: 'graduation-cap',
        text: 'Em salas de aula, treinamentos ou consultorias, ensinando e capacitando outras pessoas.',
        weights: { educacao: 4, comunicacao: 1 }
      }
    ]
  },
  {
    id: 3,
    category: 'Habilidades Naturais',
    title: 'Qual destas habilidades pessoais as pessoas costumam reconhecer em você?',
    subtitle: 'Pense em elogios ou pontos fortes que você demonstra naturalmente.',
    options: [
      {
        id: '3a',
        letter: 'A',
        icon: 'cpu',
        text: 'Facilidade para mexer em computadores, aprender softwares novos ou resolver enigmas lógicos.',
        weights: { tecnologia: 4, educacao: 1 }
      },
      {
        id: '3b',
        letter: 'B',
        icon: 'clipboard-list',
        text: 'Paciência para conferir detalhes, preencher formulários, organizar arquivos e fazer contas com precisão.',
        weights: { administracao: 4, tecnica: 1 }
      },
      {
        id: '3c',
        letter: 'C',
        icon: 'smile',
        text: 'Facilidade de expressão verbal, simpatia, empatia e capacidade de acolher bem as pessoas.',
        weights: { comunicacao: 4, vendas: 1 }
      },
      {
        id: '3d',
        letter: 'D',
        icon: 'paint-brush',
        text: 'Olhar estético apurado, bom gosto visual e facilidade para criar coisas bonitas e atraentes.',
        weights: { criatividade: 4, educacao: 1 }
      }
    ]
  },
  {
    id: 4,
    category: 'Iniciativa & Projetos',
    title: 'Se você pudesse iniciar um projeto profissional importante hoje, qual escolheria?',
    subtitle: 'Escolha aquele que desperta mais vontade de colocar em prática.',
    options: [
      {
        id: '4a',
        letter: 'A',
        icon: 'rocket',
        text: 'Lançar meu próprio negócio ou MEI, criar uma marca, atrair clientes e vender produtos ou serviços.',
        weights: { vendas: 4, gestao: 1 }
      },
      {
        id: '4b',
        letter: 'B',
        icon: 'tool',
        text: 'Aprender uma profissão técnica qualificada para realizar manutenções, inspeções e serviços práticos.',
        weights: { tecnica: 4, administracao: 1 }
      },
      {
        id: '4c',
        letter: 'C',
        icon: 'kanban',
        text: 'Assumir a liderança de um projeto, planejando etapas, metas claras e integrando toda a equipe.',
        weights: { gestao: 4, vendas: 1 }
      },
      {
        id: '4d',
        letter: 'D',
        icon: 'heart-handshake',
        text: 'Desenvolver um programa de inclusão, acessibilidade ou curso para formar quem precisa de apoio.',
        weights: { educacao: 4, comunicacao: 1 }
      }
    ]
  },
  {
    id: 5,
    category: 'Resolução de Problemas',
    title: 'Quando surge um problema imprevisto ou urgente, qual é a sua reação imediata?',
    subtitle: 'Qual é o seu método preferido para buscar uma solução?',
    options: [
      {
        id: '5a',
        letter: 'A',
        icon: 'search-code',
        text: 'Pesquisar a lógica do problema e encontrar uma solução tecnológica, digital ou automatizada.',
        weights: { tecnologia: 4, criatividade: 1 }
      },
      {
        id: '5b',
        letter: 'B',
        icon: 'check-square',
        text: 'Consultar os registros, conferir dados em planilhas e assegurar que tudo segue as regras estabelecidas.',
        weights: { administracao: 4, gestao: 1 }
      },
      {
        id: '5c',
        letter: 'C',
        icon: 'messages-square',
        text: 'Conversar com as pessoas envolvidas para alinhar a comunicação e evitar desentendimentos.',
        weights: { comunicacao: 4, gestao: 1 }
      },
      {
        id: '5d',
        letter: 'D',
        icon: 'lightbulb',
        text: 'Pensar em uma saída criativa, fora do padrão comum, que ninguém havia tentado antes.',
        weights: { criatividade: 4, vendas: 1 }
      }
    ]
  },
  {
    id: 6,
    category: 'Objetivos de Carreira',
    title: 'Qual área de aprendizado desperta mais a sua curiosidade neste momento?',
    subtitle: 'O que você gostaria de colocar no seu currículo para se destacar?',
    options: [
      {
        id: '6a',
        letter: 'A',
        icon: 'badge-percent',
        text: 'Técnicas de negociação, estratégias de vendas, marketing e formalização de MEI.',
        weights: { vendas: 4, administracao: 1 }
      },
      {
        id: '6b',
        letter: 'B',
        icon: 'shield-check',
        text: 'Normas de segurança do trabalho (NRs), procedimentos operacionais e ferramentas técnicas.',
        weights: { tecnica: 4, tecnologia: 1 }
      },
      {
        id: '6c',
        letter: 'C',
        icon: 'clock',
        text: 'Produtividade, gestão do tempo, liderança de pessoas e planejamento estratégico de metas.',
        weights: { gestao: 4, educacao: 1 }
      },
      {
        id: '6d',
        letter: 'D',
        icon: 'book-open-check',
        text: 'Didática, metodologias de ensino, tecnologia na educação e comunicação inclusiva em Libras.',
        weights: { educacao: 4, tecnica: 1 }
      }
    ]
  },
  {
    id: 7,
    category: 'Realização & Propósito',
    title: 'Ao final de uma semana de dedicação, o que te dá mais orgulho de ter realizado?',
    subtitle: 'Qual resultado te faz sentir que o esforço valeu a pena?',
    options: [
      {
        id: '7a',
        letter: 'A',
        icon: 'binary',
        text: 'Ter construído um código funcional, configurado um sistema ou solucionado um enigma digital.',
        weights: { tecnologia: 4, tecnica: 1 }
      },
      {
        id: '7b',
        letter: 'B',
        icon: 'file-spreadsheet',
        text: 'Ter deixado todas as pendências administrativas, relatórios e tarefas rigorosamente em dia.',
        weights: { administracao: 4, gestao: 1 }
      },
      {
        id: '7c',
        letter: 'C',
        icon: 'video',
        text: 'Ter produzido uma arte, vídeo, apresentação visual ou postagem que chamou a atenção de todos.',
        weights: { criatividade: 4, vendas: 1 }
      },
      {
        id: '7d',
        letter: 'D',
        icon: 'handshake',
        text: 'Ter fechado bons negócios, conquistado novos clientes e visto os números de vendas subirem.',
        weights: { vendas: 4, comunicacao: 1 }
      }
    ]
  },
  {
    id: 8,
    category: 'Trabalho em Equipe',
    title: 'Em um trabalho colaborativo com várias pessoas, em qual papel você rende melhor?',
    subtitle: 'Qual posição combina mais com o seu estilo de atuação?',
    options: [
      {
        id: '8a',
        letter: 'A',
        icon: 'mic',
        text: 'O articulador: que apresenta os resultados para fora, dialoga e representa o grupo perante terceiros.',
        weights: { comunicacao: 4, vendas: 1 }
      },
      {
        id: '8b',
        letter: 'B',
        icon: 'cog',
        text: 'O executor técnico: que cuida da parte prática e garante que ferramentas e materiais funcionem bem.',
        weights: { tecnica: 4, administracao: 1 }
      },
      {
        id: '8c',
        letter: 'C',
        icon: 'calendar-check',
        text: 'O coordenador: que divide tarefas, acompanha cronogramas e mantém todos focados no objetivo.',
        weights: { gestao: 4, administracao: 1 }
      },
      {
        id: '8d',
        letter: 'D',
        icon: 'user-check',
        text: 'O mentor: que ajuda colegas com dúvidas, explica conceitos com paciência e apoia o aprendizado.',
        weights: { educacao: 4, comunicacao: 1 }
      }
    ]
  },
  {
    id: 9,
    category: 'Preferências Pessoais',
    title: 'Sobre quais destes assuntos você gosta de ler notícias, ver vídeos ou conversar?',
    subtitle: 'Os temas que despertam seu interesse espontâneo revelam suas verdadeiras afinidades.',
    options: [
      {
        id: '9a',
        letter: 'A',
        icon: 'sparkle',
        text: 'Inteligência artificial, inovações da internet, computadores e o futuro da tecnologia.',
        weights: { tecnologia: 4, criatividade: 1 }
      },
      {
        id: '9b',
        letter: 'B',
        icon: 'pie-chart',
        text: 'Organização da vida financeira, controle de gastos, planilhas inteligentes e investimentos.',
        weights: { administracao: 4, gestao: 1 }
      },
      {
        id: '9c',
        letter: 'C',
        icon: 'image',
        text: 'Design gráfico, fotografia, edição de vídeo no celular e tendências visuais nas redes sociais.',
        weights: { criatividade: 4, comunicacao: 1 }
      },
      {
        id: '9d',
        letter: 'D',
        icon: 'store',
        text: 'Casos de sucesso de empreendedores, novas ideias de negócios, marcas e técnicas de vendas.',
        weights: { vendas: 4, gestao: 1 }
      }
    ]
  },
  {
    id: 10,
    category: 'Visão de Futuro',
    title: 'Pensando no longo prazo, como você mais gostaria de ser lembrado profissionalmente?',
    subtitle: 'O impacto que você quer gerar no mercado e na sociedade.',
    options: [
      {
        id: '10a',
        letter: 'A',
        icon: 'award',
        text: 'Como um especialista técnico confiável, que dominava procedimentos essenciais com segurança.',
        weights: { tecnica: 4, tecnologia: 1 }
      },
      {
        id: '10b',
        letter: 'B',
        icon: 'crown',
        text: 'Como um líder competente e ético, capaz de conduzir grandes projetos e inspirar equipes.',
        weights: { gestao: 4, administracao: 1 }
      },
      {
        id: '10c',
        letter: 'C',
        icon: 'heart',
        text: 'Como alguém que transformou vidas através do ensino, da mentoria e da inclusão social.',
        weights: { educacao: 4, comunicacao: 1 }
      },
      {
        id: '10d',
        letter: 'D',
        icon: 'code-2',
        text: 'Como um criador de soluções digitais inovadoras que facilitaram a vida de milhares de pessoas.',
        weights: { tecnologia: 4, criatividade: 1 }
      }
    ]
  },
  {
    id: 11,
    isOptional: true,
    category: 'Seus Recursos de Estudo',
    title: 'Por qual aparelho você pretende estudar a maior parte do tempo?',
    subtitle: 'Pergunta opcional. Usaremos essa informação para priorizar cursos 100% confortáveis no seu aparelho.',
    options: [
      {
        id: '11a',
        letter: 'A',
        icon: 'smartphone',
        text: 'Apenas pelo Celular',
        description: 'Priorizaremos cursos com videoaulas dinâmicas, leituras em PDF e plataformas totalmente responsivas.',
        preference: { device: 'mobile' }
      },
      {
        id: '11b',
        letter: 'B',
        icon: 'monitor',
        text: 'Computador ou Notebook',
        description: 'Acesso pleno com teclado físico, ideal para praticar programação, planilhas avançadas e editores.',
        preference: { device: 'pc' }
      },
      {
        id: '11c',
        letter: 'C',
        icon: 'laptop',
        text: 'Celular e Computador',
        description: 'Máxima flexibilidade para acompanhar aulas no celular no dia a dia e praticar no computador.',
        preference: { device: 'both' }
      }
    ]
  },
  {
    id: 12,
    isOptional: true,
    category: 'Sua Rotina de Estudos',
    title: 'Quanto tempo por semana você pretende dedicar aos seus estudos gratuitos?',
    subtitle: 'Pergunta opcional. Usaremos essa resposta para calibrar a carga horária recomendada na sua trilha.',
    options: [
      {
        id: '12a',
        letter: 'A',
        icon: 'clock-3',
        text: 'Até 2 horas por semana (Ritmo Leve)',
        description: 'Cursos diretos e objetivos, com módulos curtos perfeitos para pequenas pausas no dia a dia.',
        preference: { hours: 'short' }
      },
      {
        id: '12b',
        letter: 'B',
        icon: 'calendar',
        text: 'De 3 a 5 horas por semana (Ritmo Equilibrado)',
        description: 'Dedicação consistente: permite avançar com segurança e conquistar certificações valorizadas.',
        preference: { hours: 'medium' }
      },
      {
        id: '12c',
        letter: 'C',
        icon: 'zap',
        text: 'Mais de 5 horas por semana (Ritmo Intensivo)',
        description: 'Formação acelerada: ideal para quem busca recolocação rápida ou transição de carreira.',
        preference: { hours: 'long' }
      }
    ]
  }
];

// Pontuações máximas teóricas por área para normalização percentual (0 a 100%)
const MAX_THEORETICAL_SCORES = {
  tecnologia: 25,
  administracao: 25,
  comunicacao: 21,
  criatividade: 21,
  vendas: 23,
  tecnica: 23,
  gestao: 24,
  educacao: 22
};

/**
 * Calcula os resultados do teste com base nas respostas selecionadas
 * @param {Object} userAnswers - Mapa com { [questionId]: optionId }
 * @param {Array} catalogCourses - Lista viva de cursos do catálogo (state.allCourses)
 * @returns {Object} Resultado completo formatado
 */
function calculateCareerTestResults(userAnswers = {}, catalogCourses = []) {
  const scores = {
    tecnologia: 0,
    administracao: 0,
    comunicacao: 0,
    criatividade: 0,
    vendas: 0,
    tecnica: 0,
    gestao: 0,
    educacao: 0
  };

  let devicePreference = 'both';
  let hoursPreference = 'medium';

  // Processar cada resposta
  CAREER_QUESTIONS.forEach(question => {
    const chosenOptionId = userAnswers[question.id];
    if (!chosenOptionId) return;

    const option = question.options.find(opt => opt.id === chosenOptionId);
    if (!option) return;

    // Se for pergunta de pontuação vocacional
    if (option.weights) {
      for (const [areaKey, pts] of Object.entries(option.weights)) {
        if (typeof scores[areaKey] === 'number') {
          scores[areaKey] += pts;
        }
      }
    }

    // Se for pergunta prática
    if (option.preference) {
      if (option.preference.device) devicePreference = option.preference.device;
      if (option.preference.hours) hoursPreference = option.preference.hours;
    }
  });

  // Calcular afinidades percentuais (0% a 100%)
  const affinityList = Object.keys(scores).map(areaKey => {
    const rawScore = scores[areaKey];
    const maxScore = MAX_THEORETICAL_SCORES[areaKey] || 25;
    const percent = Math.min(100, Math.round((rawScore / maxScore) * 100));
    return {
      areaKey,
      area: CAREER_AREAS[areaKey],
      rawScore,
      percent
    };
  }).sort((a, b) => b.percent - a.percent || b.rawScore - a.rawScore);

  // Perfil Principal
  const primary = affinityList[0] || {
    areaKey: 'tecnologia',
    area: CAREER_AREAS.tecnologia,
    percent: 100,
    rawScore: 20
  };

  // Perfil Secundário (se houver pontuação expressiva ou empate)
  let secondary = null;
  if (affinityList.length > 1 && affinityList[1].percent >= 30) {
    secondary = affinityList[1];
  }

  // Verificar se há empate no topo (diferença menor ou igual a 3%)
  const isTie = affinityList.length > 1 && Math.abs(affinityList[0].percent - affinityList[1].percent) <= 3;

  // Montar a Trilha Personalizada com cursos reais do catálogo
  const primaryAreaInfo = CAREER_AREAS[primary.areaKey];
  const stepCoursesDetailed = (primaryAreaInfo.trackStepCourses || []).map(stepDef => {
    const courseObj = (catalogCourses || []).find(c => c.id === stepDef.id) || {
      id: stepDef.id,
      title: stepDef.label,
      provider: 'Instituição Parceira Oficial',
      workloadHours: 20,
      hasFreeCertificate: true,
      certificateNote: 'Certificado 100% Gratuito',
      url: '#'
    };
    return {
      step: stepDef.step,
      label: stepDef.label,
      course: courseObj
    };
  });

  // Buscar cursos complementares reais do catálogo nessa área
  const relatedCourses = (catalogCourses || []).filter(c => {
    // Evitar duplicar os cursos já destacados nas etapas
    const inStepTrack = primaryAreaInfo.trackStepCourses.some(st => st.id === c.id);
    if (inStepTrack) return false;

    const areaKey = primary.areaKey;
    const cat = (c.category || '').toLowerCase();
    const title = (c.title || '').toLowerCase();
    const desc = (c.description || '').toLowerCase();
    const tags = Array.isArray(c.tags) ? c.tags.join(' ').toLowerCase() : '';

    if (areaKey === 'tecnologia') {
      return cat === 'tecnologia' || cat === 'ia' || cat === 'nuvem' || tags.includes('programação');
    }
    if (areaKey === 'administracao') {
      return cat === 'gestao' || cat === 'profissionalizacao' || title.includes('excel') || title.includes('administração');
    }
    if (areaKey === 'comunicacao') {
      return cat === 'profissionalizacao' || cat === 'outros' || title.includes('comunicação') || title.includes('atendimento');
    }
    if (areaKey === 'criatividade') {
      return cat === 'artes' || cat === 'negocios' || title.includes('vídeo') || title.includes('marketing') || title.includes('design');
    }
    if (areaKey === 'vendas') {
      return cat === 'empreendedorismo' || cat === 'negocios' || title.includes('vendas') || title.includes('mei');
    }
    if (areaKey === 'tecnica') {
      return cat === 'saude' || cat === 'agro' || title.includes('segurança') || title.includes('técnico');
    }
    if (areaKey === 'gestao') {
      return cat === 'gestao' || cat === 'produtividade' || title.includes('liderança') || title.includes('projetos');
    }
    if (areaKey === 'educacao') {
      return cat === 'acessibilidade' || cat === 'educacao' || title.includes('libras') || title.includes('ensino');
    }
    return false;
  }).slice(0, 6);

  return {
    completedAt: new Date().toISOString(),
    primary,
    secondary,
    isTie,
    affinities: affinityList,
    devicePreference,
    hoursPreference,
    stepCourses: stepCoursesDetailed,
    relatedCourses,
    answersSnapshot: userAnswers
  };
}

if (typeof window !== 'undefined') {
  window.CAREER_QUIZ = {
    areas: CAREER_AREAS,
    questions: CAREER_QUESTIONS,
    maxTheoreticalScores: MAX_THEORETICAL_SCORES,
    calculateResults: calculateCareerTestResults
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    CAREER_AREAS,
    CAREER_QUESTIONS,
    MAX_THEORETICAL_SCORES,
    calculateCareerTestResults
  };
}
