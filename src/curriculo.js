/**
 * ==============================================================================
 * Criador de Currículos Profissional — Você Pode Tudo
 * src/curriculo.js — Motor Reativo, 12 Modelos, 9 Etapas, Assistente e Exportação
 * ==============================================================================
 */

(function() {
  'use strict';

  // Chaves do LocalStorage
  const STORAGE_KEY = 'vpt_curriculo_draft_v1';
  const STORAGE_SETTINGS_KEY = 'vpt_curriculo_settings_v1';

  // Estado Inicial dos Dados do Currículo
  const initialCurriculoData = {
    // Etapa 1: Contato
    nome: '',
    foto: '', // Data URL em base64 (opcional)
    cidade: '',
    estado: '',
    telefone: '',
    email: '',
    linkedin: '',
    portfolio: '',
    github: '',
    adaptacaoAcessibilidade: '', // Opcional (para PCD ou adaptações de trabalho)

    // Etapa 2: Objetivo
    cargoDesejado: '',
    areaProfissional: 'administrativo', // default
    tipoOportunidade: 'CLT',
    objetivoProfissional: '',

    // Etapa 3: Resumo Profissional
    resumoProfissional: '',

    // Etapa 4: Experiências Profissionais
    experiencias: [
      /* { id, empresa, cargo, localidade, dataInicio, dataTermino, atual: false, descricao, resultados } */
    ],

    // Etapa 5: Formação Acadêmica
    formacoes: [
      /* { id, instituicao, curso, grau, dataInicio, dataConclusao, status } */
    ],

    // Etapa 6: Cursos e Certificações
    cursos: [
      /* { id, nome, instituicao, cargaHoraria, anoConclusao, linkCertificado } */
    ],

    // Etapa 7: Habilidades
    habilidades: [
      /* { id, nome, categoria } */
    ],

    // Etapa 8: Projetos e Atividades Complementares
    projetos: [
      /* { id, titulo, tipo, descricao, link } */
    ]
  };

  // Estado Geral da Interface
  const state = {
    curriculo: JSON.parse(JSON.stringify(initialCurriculoData)),
    activeTemplate: 1,      // 1 a 12
    currentStep: 1,         // 1 a 9
    primaryColor: '#002776',// Cor de destaque
    fontScale: 1,           // 0.9, 1.0, 1.1
    hideEmptySections: true,
    viewMode: 'editor',     // 'editor' | 'preview' (para telas pequenas)
    catalogCourses: []      // Cursos carregados do portal Você Pode Tudo
  };

  // Cores de Destaque Profissionais Disponíveis
  const COLOR_PALETTES = [
    { name: 'Azul Institucional', hex: '#002776' },
    { name: 'Verde Você Pode Tudo', hex: '#009B3A' },
    { name: 'Grafite Elegante', hex: '#1e293b' },
    { name: 'Bordô Clássico', hex: '#881337' },
    { name: 'Azul Petróleo', hex: '#0f766e' },
    { name: 'Preto Puro', hex: '#000000' }
  ];

  // ==============================================================================
  // METADADOS DOS 12 MODELOS
  // ==============================================================================
  const TEMPLATES_CATALOG = [
    {
      id: 1,
      name: 'Clássico Profissional',
      tag: 'Tradicional',
      desc: 'Estrutura tradicional com tipografia serifada limpa, divisores discretos e ordem cronológica impecável.',
      targetProfile: 'Administração, Comércio, Indústria, Serviços e Vagas Corporativas Gerais.',
      colorSupport: true
    },
    {
      id: 2,
      name: 'Moderno Executivo',
      tag: 'Executivo',
      desc: 'Cabeçalho impactante com resumo estratégico em destaque e apresentação refinada de conquistas e resultados.',
      targetProfile: 'Profissionais Experientes, Coordenadores, Supervisores e Cargos de Gestão.',
      colorSupport: true
    },
    {
      id: 3,
      name: 'Primeiro Emprego',
      tag: 'Iniciante',
      desc: 'Estrutura inteligente para quem nunca trabalhou formalmente. Valoriza objetivo, formação, cursos e habilidades sem inventar dados.',
      targetProfile: 'Jovens Aprendizes, Estudantes e pessoas em busca da primeira oportunidade.',
      colorSupport: true
    },
    {
      id: 4,
      name: 'Tecnologia e TI',
      tag: 'Tech',
      desc: 'Design moderno com destaque para linguagens de programação, ferramentas, projetos práticos, GitHub e certificações.',
      targetProfile: 'Desenvolvedores, Suporte, Infraestrutura, Segurança da Informação e Especialistas de TI.',
      colorSupport: true
    },
    {
      id: 5,
      name: 'Administração e Finanças',
      tag: 'Corporativo',
      desc: 'Layout altamente estruturado com destaque para organização, ERPs, planilhas avançadas e rotinas administrativas.',
      targetProfile: 'Assistentes Administrativos, Auxiliares Financeiros, Analistas e Cargos de Escritório.',
      colorSupport: true
    },
    {
      id: 6,
      name: 'Comercial e Vendas',
      tag: 'Vendas',
      desc: 'Visual dinâmico com destaque para relacionamento, negociação, atendimento a clientes e metas atingidas informadas.',
      targetProfile: 'Vendedores, Representantes Comerciais, Atendentes e Consultores de Negócios.',
      colorSupport: true
    },
    {
      id: 7,
      name: 'Acadêmico e Estágio',
      tag: 'Acadêmico',
      desc: 'Formação acadêmica no topo, iniciação científica, projetos universitários, monitorias e publicações em evidência.',
      targetProfile: 'Estudantes Universitários, Pesquisadores Iniciantes e Candidatos a Estágio.',
      colorSupport: true
    },
    {
      id: 8,
      name: 'Criativo e Design',
      tag: 'Criativo',
      desc: 'Layout contemporâneo com tipografia expressiva e espaço para portfólio. Continua 100% legível em preto e branco.',
      targetProfile: 'Designers, Marketing, Publicidade, Audiovisual e Criadores de Conteúdo.',
      colorSupport: false
    },
    {
      id: 9,
      name: 'Operacional e Industrial',
      tag: 'Operacional',
      desc: 'Formato prático e objetivo com destaque para capacitações técnicas, normas regulamentadoras (NRs), ferramentas e prontidão.',
      targetProfile: 'Operadores, Auxiliares de Produção, Manutenção, Logística e Serviços Gerais.',
      colorSupport: true
    },
    {
      id: 10,
      name: 'Atendimento e Serviços',
      tag: 'Atendimento',
      desc: 'Apresentação humana e clara enfatizando comunicação, empatia, resolução ágil de problemas e sistemas de suporte.',
      targetProfile: 'Recepcionistas, Atendentes, Operadores de Telemarketing e Profissionais de Hotelaria/Serviços.',
      colorSupport: true
    },
    {
      id: 11,
      name: 'Profissional Experiente',
      tag: 'Sênior',
      desc: 'Painel sênior com síntese de carreira marcante, histórico consolidado e visão estratégica de liderança.',
      targetProfile: 'Profissionais com longa trajetória, especialistas de mercado ou pessoas em recolocação.',
      colorSupport: true
    },
    {
      id: 12,
      name: 'Acessível e Inclusivo',
      tag: 'Inclusivo',
      desc: 'Tipografia com alto contraste, estrutura estritamente linear sem tabelas complexas, acessível a leitores de tela e impressão perfeita.',
      targetProfile: 'Qualquer pessoa que valorize máxima legibilidade, inclusive profissionais com deficiência (PCD).',
      colorSupport: false
    }
  ];

  // ==============================================================================
  // BASE DE CONHECIMENTO DO ASSISTENTE DE ESCRITA ("Melhore seu currículo")
  // 100% Offline, sem chamadas externas, sem custos
  // ==============================================================================
  const WRITING_ASSISTANT_DATA = {
    actionVerbs: {
      'Saúde e Cuidados': ['Assistiu', 'Ministrou', 'Aferiu', 'Acolheu', 'Higienizou', 'Monitorou', 'Mobilizou', 'Orientou', 'Triou', 'Preveniu'],
      'Educação e Ensino': ['Lecionou', 'Ministrou', 'Planejou', 'Avaliou', 'Coordenou', 'Orientou', 'Mediou', 'Incentivou', 'Facilitou'],
      'Liderança e Gestão': ['Coordenou', 'Gerenciou', 'Liderou', 'Supervisionou', 'Direcionou', 'Estruturou', 'Delegou', 'Planejou'],
      'Organização e Execução': ['Organizou', 'Elaborou', 'Executou', 'Implementou', 'Administrou', 'Padronizou', 'Monitorou', 'Registrou'],
      'Melhoria e Resultados': ['Otimizou', 'Aumentou', 'Reduziu', 'Acelerou', 'Maximizou', 'Aprimorou', 'Solucionou', 'Consolidou'],
      'Atendimento e Comunicação': ['Atendeu', 'Negociou', 'Acolheu', 'Orientou', 'Mediou', 'Apresentou', 'Esclareceu', 'Recepcionou'],
      'Técnico e Análise': ['Desenvolveu', 'Programou', 'Testou', 'Mapeou', 'Configurou', 'Audita', 'Diagnosticou', 'Parametrizou'],
      'Segurança e Vigilância': ['Fiscalizou', 'Inspecionou', 'Controlou', 'Rondeou', 'Registrou', 'Preservou', 'Acionou', 'Interveio']
    },

    objectiveTemplates: {
      'Saúde e Cuidados': 'Atuar na área da saúde como [Cargo], prestando assistência humanizada, responsável e atenta aos pacientes, com rigor técnico e observância estrita às normas de biossegurança.',
      'Técnico(a) de Enfermagem': 'Atuar como Técnico(a) de Enfermagem, prestando assistência qualificada, aferição de sinais vitais, administração correta de prescrições e dedicação integral ao bem-estar e recuperação dos pacientes.',
      'Cuidador(a) de Idosos': 'Desempenhar a função de Cuidador(a), garantindo suporte diário com paciência, carinho, controle de medicação prescrita, alimentação balanceada e estímulo à autonomia e qualidade de vida.',
      'Recepção Clínica / Hospitalar': 'Atuar na recepção e atendimento ambulatorial em clínicas, consultórios ou hospitais, acolhendo pacientes com empatia, agilizando cadastros, triagem e agendamento de consultas.',
      'Farmácia e Drogaria': 'Atuar em atendimento farmacêutico e drogaria, auxiliando na dispensação de medicamentos, controle de validades, organização de prateleiras e orientação cordial aos clientes.',
      'Educação e Pedagogia': 'Atuar na área educacional como [Cargo/Docente], mediando o processo de ensino-aprendizagem com didática inclusiva, empatia e compromisso com o desenvolvimento integral dos alunos.',
      'Recursos Humanos / DP': 'Atuar em Recursos Humanos / Departamento Pessoal, contribuindo nos processos de recrutamento e seleção, admissão, rotinas de ponto e promoção de um clima organizacional acolhedor.',
      'Primeiro Emprego': 'Buscar minha primeira oportunidade profissional como [Cargo ou Área], com foco em aprender com dedicação, colaborar com a equipe e contribuir ativamente para o crescimento da organização.',
      'Administrativo': 'Atuar na área administrativa, aplicando organização, domínio de rotinas de escritório e controle documental para garantir a eficiência dos processos internos.',
      'Tecnologia': 'Atuar como Desenvolvedor/Analista de Tecnologia, aplicando conhecimentos técnicos na criação de soluções robustas, boas práticas de código e entrega de valor aos usuários.',
      'Comercial e Vendas': 'Contribuir com metas comerciais através de atendimento focado nas necessidades do cliente, negociação consultiva e fidelização de parcerias.',
      'Operacional e Logística': 'Desempenhar funções operacionais com compromisso, atenção rigorosa às normas de segurança e foco em produtividade e qualidade do fluxo de trabalho.',
      'Atendimento ao Cliente': 'Oferecer atendimento empático e resolutivo aos clientes, assegurando agilidade na comunicação e alto padrão de satisfação.',
      'Gastronomia e Cozinha': 'Atuar no preparo e manipulação de alimentos com padrão de excelência, atenção aos procedimentos higiênico-sanitários (ANVISA) e respeito ao ritmo da cozinha.',
      'Segurança e Portaria': 'Atuar no controle de acesso de pedestres e veículos, zelar pela segurança das dependências com discrição, atenção contínua e cordialidade no trato diário.'
    },

    summaryTemplates: {
      'Saúde e Enfermagem': 'Profissional da área de saúde e cuidados com sólido preparo técnico em acolhimento humanizado a pacientes, aferição de sinais vitais, administração de rotinas assistenciais e respeito rigoroso às normas de biossegurança (ANVISA).',
      'Cuidador(a) de Idosos': 'Cuidador(a) com experiência em assistência e acompanhamento a pessoas idosas e pacientes em recuperação, zelando por higiene, alimentação, medicação no horário correto e bem-estar físico e emocional.',
      'Educação e Ensino': 'Educador(a) comprometido(a) com práticas pedagógicas dinâmicas, mediação de aprendizagem, planejamento de aulas participativas e acompanhamento do progresso integral dos estudantes.',
      'Recursos Humanos': 'Profissional com vivência em processos de recrutamento, seleção, integração de colaboradores e suporte a rotinas de departamento pessoal, com excelente relacionamento interpessoal.',
      'Primeiro Emprego': 'Estudante dedicado, em busca de ingresso no mercado de trabalho. Possuo facilidade de comunicação, excelente disposição para aprender novas rotinas e domínio de ferramentas básicas de informática e colaboração.',
      'Experiente': 'Profissional com sólida trajetória na área de [Sua Área], com histórico comprovado de responsabilidade, cumprimento de metas e implementação de melhorias de processos internos.',
      'Transição de Carreira': 'Profissional em transição para a área de [Nova Área], aliando sólida bagagem prévia em organização e relacionamento interpessoal aos conhecimentos recentes adquiridos em capacitações específicas.',
      'Estágio': 'Estudante de [Seu Curso], buscando oportunidade de estágio para colocar em prática os conhecimentos teóricos adquiridos, colaborar com as demandas da equipe e desenvolver competências profissionais sólidas.'
    },

    textImprovements: [
      {
        pattern: /cuidava de idoso|cuidar de idosos|cuidando de idoso/i,
        suggestion: 'Assistência integral e acompanhamento nos cuidados diários, rotinas de medicação prescrita, higiene, bem-estar e estímulo à autonomia do paciente.'
      },
      {
        pattern: /trabalhava no hospital|trabalhava no posto|trabalhava na clinica/i,
        suggestion: 'Atendimento humanizado em ambiente de saúde, triagem inicial, acolhimento de pacientes e cumprimento rigoroso das normas de biossegurança.'
      },
      {
        pattern: /aplicava injecao|dava remedio/i,
        suggestion: 'Administração de medicamentos e procedimentos de apoio assistencial sob rigorosa prescrição médica e protocolos técnicos de enfermagem.'
      },
      {
        pattern: /trabalhava na farmacia|auxiliava na farmacia/i,
        suggestion: 'Atendimento ao cliente em drogaria, organização de medicamentos, controle de validades e suporte à rotina de dispensação farmacêutica.'
      },
      {
        pattern: /dava aulas|ensinei criancas/i,
        suggestion: 'Planejamento e mediação pedagógica, desenvolvimento de atividades didáticas e acompanhamento contínuo da aprendizagem.'
      },
      {
        pattern: /ficava na portaria|cuidava da portaria/i,
        suggestion: 'Controle de acesso rigoroso de pedestres e veículos, recepção de visitantes, conferência de entregas e monitoramento preventivo do local.'
      },
      {
        pattern: /atendia clientes|atendendo clientes/i,
        suggestion: 'Atendimento consultivo e humanizado aos clientes, identificando necessidades e prestando orientações claras.'
      },
      {
        pattern: /arrumava as coisas|arrumar coisas/i,
        suggestion: 'Organização de estoque, reposição de produtos e manutenção do layout do ambiente de trabalho.'
      },
      {
        pattern: /mexia com excel|fazia planilhas/i,
        suggestion: 'Elaboração e alimentação de planilhas de controle, consolidação de relatórios e conferência de dados operacionais.'
      },
      {
        pattern: /trabalhava no caixa|mexia no caixa/i,
        suggestion: 'Operação de caixa, registro de vendas, conferência de numerário e fechamento financeiro de turno.'
      },
      {
        pattern: /ajudava em tudo|fazia um pouco de tudo/i,
        suggestion: 'Suporte multifuncional às rotinas operacionais e administrativas, auxiliando a equipe nas demandas diárias com prontidão.'
      }
    ]
  };

  // ==============================================================================
  // UTILITÁRIOS E SEGURANÇA
  // ==============================================================================
  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function sanitizeFilename(name) {
    if (!name || !name.trim()) return 'curriculo_vocepodetudo';
    const clean = name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
    return `curriculo_${clean || 'profissional'}`;
  }

  function generateId() {
    return 'id_' + Math.random().toString(36).substring(2, 9);
  }

  // ==============================================================================
  // CARREGAMENTO DO CATÁLOGO DE CURSOS (Integração sem duplicar dados)
  // ==============================================================================
  async function loadCoursesCatalog() {
    try {
      if (typeof window.localCourses !== 'undefined' && Array.isArray(window.localCourses)) {
        state.catalogCourses = window.localCourses;
        return;
      }
      if (window.PORTAL_DATA && Array.isArray(window.PORTAL_DATA.courses)) {
        state.catalogCourses = window.PORTAL_DATA.courses;
        return;
      }
      const res = await fetch('./api/courses.php?action=list');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          state.catalogCourses = data;
          return;
        } else if (data && Array.isArray(data.courses)) {
          state.catalogCourses = data.courses;
          return;
        }
      }
    } catch (e) {
      console.warn('Catálogo de cursos carregado via fallback local.');
      if (typeof localCourses !== 'undefined') {
        state.catalogCourses = localCourses;
      }
    }
  }

  // ==============================================================================
  // GERADORES DE HTML PARA OS 12 MODELOS
  // Cada um possui layout próprio e estrutura semântica distinta
  // ==============================================================================

  // Helper para formatar dados de contato
  function renderContactsLine(data, separator = '•') {
    const parts = [];
    const loc = [data.cidade, data.estado].filter(Boolean).join(' - ');
    if (loc) parts.push(`<span>${escapeHtml(loc)}</span>`);
    if (data.telefone) parts.push(`<span>${escapeHtml(data.telefone)}</span>`);
    if (data.email) parts.push(`<a href="mailto:${escapeHtml(data.email)}" class="hover:underline">${escapeHtml(data.email)}</a>`);
    if (data.linkedin) parts.push(`<a href="${escapeHtml(data.linkedin)}" target="_blank" rel="noopener" class="hover:underline">LinkedIn</a>`);
    if (data.portfolio) parts.push(`<a href="${escapeHtml(data.portfolio)}" target="_blank" rel="noopener" class="hover:underline">Portfólio</a>`);
    if (data.github) parts.push(`<a href="${escapeHtml(data.github)}" target="_blank" rel="noopener" class="hover:underline">GitHub</a>`);
    return parts.join(` <span class="text-slate-400 mx-1">${separator}</span> `);
  }


  // Helper para renderizar a foto profissional (opcional)
  function renderCvPhoto(data, extraClass = '') {
    if (!data.foto) return '';
    return `
      <div class="cv-photo-container ${extraClass}">
        <img src="${data.foto}" alt="Foto de ${escapeHtml(data.nome || 'Candidato')}" class="cv-photo-img">
      </div>
    `;
  }

  // MODELO 1: Clássico Profissional (Coluna única, fontes serifadas elegantes, divisores)
  function renderTemplate1(d, color) {
    return `
      <div class="cv-tpl-1" style="--cv-primary: ${color}">
        <header class="text-center mb-6">
          ${d.foto ? `<div class="flex justify-center mb-3">${renderCvPhoto(d)}</div>` : ''}
          <h1 class="cv-name">${escapeHtml(d.nome || 'Seu Nome Completo')}</h1>
          ${d.cargoDesejado ? `<div class="text-base font-semibold text-slate-700 tracking-wide mb-2">${escapeHtml(d.cargoDesejado)}</div>` : ''}
          <div class="cv-contact-bar justify-center">${renderContactsLine(d, '|')}</div>
        </header>

        ${d.objetivoProfissional ? `
          <section class="cv-section mb-5">
            <h2 class="cv-sec-title">Objetivo Profissional</h2>
            <p class="cv-desc">${escapeHtml(d.objetivoProfissional)}</p>
          </section>
        ` : ''}

        ${d.resumoProfissional ? `
          <section class="cv-section mb-5">
            <h2 class="cv-sec-title">Resumo Profissional</h2>
            <p class="cv-desc">${escapeHtml(d.resumoProfissional)}</p>
          </section>
        ` : ''}

        ${d.experiencias && d.experiencias.length ? `
          <section class="cv-section mb-5">
            <h2 class="cv-sec-title">Experiência Profissional</h2>
            <div class="space-y-4">
              ${d.experiencias.map(exp => `
                <div class="cv-item">
                  <div class="flex justify-between items-baseline">
                    <span class="cv-item-title">${escapeHtml(exp.cargo)}</span>
                    <span class="text-xs text-slate-500">${escapeHtml(exp.dataInicio)} — ${exp.atual ? 'Presente' : escapeHtml(exp.dataTermino || 'Atual')}</span>
                  </div>
                  <div class="cv-item-subtitle mb-1">${escapeHtml(exp.empresa)}${exp.localidade ? ` • ${escapeHtml(exp.localidade)}` : ''}</div>
                  ${exp.descricao ? `<p class="cv-desc mb-1">${escapeHtml(exp.descricao)}</p>` : ''}
                  ${exp.resultados ? `<p class="cv-desc text-xs text-slate-600"><strong>Principais resultados:</strong> ${escapeHtml(exp.resultados)}</p>` : ''}
                </div>
              `).join('')}
            </div>
          </section>
        ` : ''}

        ${d.formacoes && d.formacoes.length ? `
          <section class="cv-section mb-5">
            <h2 class="cv-sec-title">Formação Acadêmica</h2>
            <div class="space-y-3">
              ${d.formacoes.map(f => `
                <div class="cv-item">
                  <div class="flex justify-between items-baseline">
                    <span class="cv-item-title">${escapeHtml(f.curso)}</span>
                    <span class="text-xs text-slate-500">${escapeHtml(f.dataConclusao || '')}</span>
                  </div>
                  <div class="cv-item-subtitle">${escapeHtml(f.instituicao)}${f.grau ? ` (${escapeHtml(f.grau)})` : ''}</div>
                </div>
              `).join('')}
            </div>
          </section>
        ` : ''}

        ${d.cursos && d.cursos.length ? `
          <section class="cv-section mb-5">
            <h2 class="cv-sec-title">Cursos Complementares e Certificações</h2>
            <ul class="list-disc list-inside space-y-1 cv-desc">
              ${d.cursos.map(c => `
                <li>
                  <strong>${escapeHtml(c.nome)}</strong> — ${escapeHtml(c.instituicao)}
                  ${c.cargaHoraria ? `(${escapeHtml(c.cargaHoraria)}h)` : ''}
                  ${c.anoConclusao ? `• ${escapeHtml(c.anoConclusao)}` : ''}
                </li>
              `).join('')}
            </ul>
          </section>
        ` : ''}

        ${d.habilidades && d.habilidades.length ? `
          <section class="cv-section mb-4">
            <h2 class="cv-sec-title">Competências e Habilidades</h2>
            <div class="flex flex-wrap gap-1.5 pt-1">
              ${d.habilidades.map(h => `
                <span class="px-2.5 py-1 bg-slate-100 text-slate-800 text-xs rounded border border-slate-300 font-medium">
                  ${escapeHtml(h.nome)}
                </span>
              `).join('')}
            </div>
          </section>
        ` : ''}

        ${d.projetos && d.projetos.length ? `
          <section class="cv-section">
            <h2 class="cv-sec-title">Projetos e Atividades Complementares</h2>
            <div class="space-y-2">
              ${d.projetos.map(p => `
                <div class="cv-item">
                  <span class="font-bold text-xs text-slate-900">${escapeHtml(p.titulo)}</span>
                  ${p.tipo ? `<span class="text-[11px] text-slate-500"> (${escapeHtml(p.tipo)})</span>` : ''}
                  ${p.descricao ? `<p class="cv-desc text-xs mt-0.5">${escapeHtml(p.descricao)}</p>` : ''}
                </div>
              `).join('')}
            </div>
          </section>
        ` : ''}
      </div>
    `;
  }

  // MODELO 2: Moderno Executivo (Banner de topo refinado, tipografia sans moderna, hierarquia forte)
  function renderTemplate2(d, color) {
    return `
      <div class="cv-tpl-2" style="--cv-primary: ${color}">
        <div class="cv-exec-banner">
          <div class="flex items-center justify-between gap-4">
            <div class="flex-1">
              <h1 class="cv-name">${escapeHtml(d.nome || 'Seu Nome Completo')}</h1>
              <div class="cv-headline">${escapeHtml(d.cargoDesejado || 'Posição Pretendida')}</div>
              <div class="cv-contact-bar">${renderContactsLine(d, '•')}</div>
            </div>
            ${renderCvPhoto(d, 'border-white shadow-md')}
          </div>
        </div>

        ${d.resumoProfissional ? `
          <section class="cv-section mb-5">
            <h2 class="cv-sec-title">Síntese de Qualificações</h2>
            <p class="cv-desc leading-relaxed">${escapeHtml(d.resumoProfissional)}</p>
          </section>
        ` : ''}

        ${d.experiencias && d.experiencias.length ? `
          <section class="cv-section mb-5">
            <h2 class="cv-sec-title">Trajetória Profissional</h2>
            <div class="space-y-4">
              ${d.experiencias.map(exp => `
                <div class="cv-item border-l-2 border-slate-200 pl-3.5 ml-1">
                  <div class="flex justify-between items-baseline">
                    <span class="cv-item-title">${escapeHtml(exp.cargo)}</span>
                    <span class="text-xs font-bold text-slate-500">${escapeHtml(exp.dataInicio)} — ${exp.atual ? 'Atual' : escapeHtml(exp.dataTermino || '')}</span>
                  </div>
                  <div class="cv-item-subtitle mb-1.5">${escapeHtml(exp.empresa)}${exp.localidade ? ` • ${escapeHtml(exp.localidade)}` : ''}</div>
                  ${exp.descricao ? `<p class="cv-desc mb-1">${escapeHtml(exp.descricao)}</p>` : ''}
                  ${exp.resultados ? `
                    <div class="bg-blue-50/50 p-2 rounded text-xs text-slate-700 mt-1 border border-blue-100">
                      <strong>Conquistas:</strong> ${escapeHtml(exp.resultados)}
                    </div>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          </section>
        ` : ''}

        <div class="grid grid-cols-2 gap-4">
          ${d.formacoes && d.formacoes.length ? `
            <section class="cv-section">
              <h2 class="cv-sec-title">Formação</h2>
              <div class="space-y-2">
                ${d.formacoes.map(f => `
                  <div class="cv-item">
                    <div class="cv-item-title text-xs">${escapeHtml(f.curso)}</div>
                    <div class="text-xs text-slate-600">${escapeHtml(f.instituicao)}</div>
                    <div class="text-[11px] text-slate-400">${escapeHtml(f.dataConclusao || '')}</div>
                  </div>
                `).join('')}
              </div>
            </section>
          ` : ''}

          ${d.cursos && d.cursos.length ? `
            <section class="cv-section">
              <h2 class="cv-sec-title">Certificações</h2>
              <div class="space-y-2 text-xs">
                ${d.cursos.map(c => `
                  <div>
                    <span class="font-bold text-slate-800">${escapeHtml(c.nome)}</span>
                    <span class="text-slate-500 block text-[11px]">${escapeHtml(c.instituicao)} ${c.cargaHoraria ? `(${escapeHtml(c.cargaHoraria)}h)` : ''}</span>
                  </div>
                `).join('')}
              </div>
            </section>
          ` : ''}
        </div>

        ${d.habilidades && d.habilidades.length ? `
          <section class="cv-section mt-5">
            <h2 class="cv-sec-title">Competências Essenciais</h2>
            <div class="flex flex-wrap gap-2">
              ${d.habilidades.map(h => `
                <span class="px-2.5 py-1 bg-slate-800 text-white text-xs font-semibold rounded">
                  ${escapeHtml(h.nome)}
                </span>
              `).join('')}
            </div>
          </section>
        ` : ''}
      </div>
    `;
  }

  // MODELO 3: Primeiro Emprego (Sem experiência prévia, valorizando dedicação, formação e cursos)
  function renderTemplate3(d, color) {
    return `
      <div class="cv-tpl-3" style="--cv-secondary: ${color || '#009B3A'}">
        <header class="cv-header flex items-center justify-between gap-4">
          <div class="flex-1">
            <h1 class="cv-name">${escapeHtml(d.nome || 'Seu Nome Completo')}</h1>
            <div class="text-sm font-bold text-slate-600 mt-1">Primeira Oportunidade Profissional</div>
            <div class="text-xs text-slate-500 mt-2 flex flex-wrap gap-3">${renderContactsLine(d, '•')}</div>
          </div>
          ${renderCvPhoto(d)}
        </header>

        ${d.objetivoProfissional ? `
          <div class="cv-objective-highlight">
            <div class="text-xs font-extrabold text-[#00702a] uppercase tracking-wider mb-1">Objetivo Profissional</div>
            <p class="text-sm text-slate-800 leading-relaxed font-medium">${escapeHtml(d.objetivoProfissional)}</p>
          </div>
        ` : ''}

        ${d.resumoProfissional ? `
          <section class="cv-section mb-5">
            <h2 class="cv-sec-title">Apresentação Pessoal</h2>
            <p class="cv-desc">${escapeHtml(d.resumoProfissional)}</p>
          </section>
        ` : ''}

        ${d.formacoes && d.formacoes.length ? `
          <section class="cv-section mb-5">
            <h2 class="cv-sec-title">Escolaridade / Formação</h2>
            <div class="space-y-3">
              ${d.formacoes.map(f => `
                <div class="cv-item bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <div class="font-bold text-sm text-slate-900">${escapeHtml(f.curso)}</div>
                  <div class="text-xs text-slate-600">${escapeHtml(f.instituicao)} ${f.status ? `• Status: ${escapeHtml(f.status)}` : ''}</div>
                  ${f.dataConclusao ? `<div class="text-[11px] text-slate-400 mt-0.5">Previsão / Conclusão: ${escapeHtml(f.dataConclusao)}</div>` : ''}
                </div>
              `).join('')}
            </div>
          </section>
        ` : ''}

        ${d.cursos && d.cursos.length ? `
          <section class="cv-section mb-5">
            <h2 class="cv-sec-title">Cursos de Qualificação e Aperfeiçoamento</h2>
            <div class="grid grid-cols-2 gap-2.5">
              ${d.cursos.map(c => `
                <div class="border border-emerald-200 bg-emerald-50/40 p-2.5 rounded-lg">
                  <div class="font-bold text-xs text-slate-900">${escapeHtml(c.nome)}</div>
                  <div class="text-[11px] text-slate-600">${escapeHtml(c.instituicao)}</div>
                  ${c.cargaHoraria ? `<div class="text-[10px] text-emerald-700 font-bold mt-1">Carga Horária: ${escapeHtml(c.cargaHoraria)}h</div>` : ''}
                </div>
              `).join('')}
            </div>
          </section>
        ` : ''}

        ${d.habilidades && d.habilidades.length ? `
          <section class="cv-section mb-5">
            <h2 class="cv-sec-title">Habilidades e Conhecimentos</h2>
            <div class="flex flex-wrap gap-2">
              ${d.habilidades.map(h => `
                <span class="px-3 py-1 bg-white border-2 border-emerald-400 text-slate-800 text-xs font-bold rounded-full shadow-sm">
                  ✓ ${escapeHtml(h.nome)}
                </span>
              `).join('')}
            </div>
          </section>
        ` : ''}

        ${d.projetos && d.projetos.length ? `
          <section class="cv-section">
            <h2 class="cv-sec-title">Projetos, Voluntariado e Atividades Extracurriculares</h2>
            <div class="space-y-2.5">
              ${d.projetos.map(p => `
                <div class="text-xs">
                  <span class="font-bold text-slate-900">${escapeHtml(p.titulo)}</span>
                  ${p.tipo ? `<span class="text-slate-500"> (${escapeHtml(p.tipo)})</span>` : ''}
                  ${p.descricao ? `<p class="cv-desc text-slate-600 mt-0.5">${escapeHtml(p.descricao)}</p>` : ''}
                </div>
              `).join('')}
            </div>
          </section>
        ` : ''}
      </div>
    `;
  }

  // MODELO 4: Tecnologia e TI (Monospace, tech tags, links para GitHub, repositórios e certificações)
  function renderTemplate4(d, color) {
    return `
      <div class="cv-tpl-4" style="--cv-primary: ${color}">
        <header class="border-b-2 border-slate-900 pb-3 mb-5 flex items-center justify-between gap-4">
          <div class="flex-1">
            <h1 class="cv-name">${escapeHtml(d.nome || 'Seu Nome Completo')}</h1>
            <div class="font-mono text-xs text-blue-600 mt-1 font-bold">${escapeHtml(d.cargoDesejado || 'Software Engineer / TI')}</div>
            <div class="text-xs text-slate-600 font-mono mt-2 flex flex-wrap gap-2.5">
              ${renderContactsLine(d, '//')}
            </div>
          </div>
          ${renderCvPhoto(d, 'cv-photo-rounded border-slate-800')}
        </header>

        ${d.resumoProfissional ? `
          <section class="cv-section mb-5">
            <h2 class="cv-sec-title">01. Sobre mim</h2>
            <p class="cv-desc leading-relaxed">${escapeHtml(d.resumoProfissional)}</p>
          </section>
        ` : ''}

        ${d.habilidades && d.habilidades.length ? `
          <section class="cv-section mb-5">
            <h2 class="cv-sec-title">02. Stack Tecnológico e Linguagens</h2>
            <div class="flex flex-wrap gap-1">
              ${d.habilidades.map(h => `<span class="cv-tech-badge">${escapeHtml(h.nome)}</span>`).join('')}
            </div>
          </section>
        ` : ''}

        ${d.experiencias && d.experiencias.length ? `
          <section class="cv-section mb-5">
            <h2 class="cv-sec-title">03. Experiência Prática</h2>
            <div class="space-y-4">
              ${d.experiencias.map(exp => `
                <div class="cv-item">
                  <div class="flex justify-between items-baseline font-mono text-xs">
                    <span class="font-bold text-slate-900">${escapeHtml(exp.cargo)} @ ${escapeHtml(exp.empresa)}</span>
                    <span class="text-slate-500">${escapeHtml(exp.dataInicio)} ~ ${exp.atual ? 'now()' : escapeHtml(exp.dataTermino || '')}</span>
                  </div>
                  ${exp.descricao ? `<p class="cv-desc text-xs mt-1 text-slate-700">${escapeHtml(exp.descricao)}</p>` : ''}
                  ${exp.resultados ? `<p class="cv-desc text-[11px] text-blue-800 font-mono mt-0.5">> Impacto: ${escapeHtml(exp.resultados)}</p>` : ''}
                </div>
              `).join('')}
            </div>
          </section>
        ` : ''}

        ${d.projetos && d.projetos.length ? `
          <section class="cv-section mb-5">
            <h2 class="cv-sec-title">04. Projetos & Repositórios</h2>
            <div class="space-y-2">
              ${d.projetos.map(p => `
                <div class="p-2 bg-slate-50 rounded border border-slate-200">
                  <div class="flex justify-between items-center">
                    <span class="font-mono text-xs font-bold text-slate-900">${escapeHtml(p.titulo)}</span>
                    ${p.link ? `<a href="${escapeHtml(p.link)}" target="_blank" class="cv-link-repo">[Ver Código/Demo]</a>` : ''}
                  </div>
                  ${p.descricao ? `<p class="cv-desc text-xs mt-1 text-slate-600">${escapeHtml(p.descricao)}</p>` : ''}
                </div>
              `).join('')}
            </div>
          </section>
        ` : ''}

        <div class="grid grid-cols-2 gap-4">
          ${d.formacoes && d.formacoes.length ? `
            <section class="cv-section">
              <h2 class="cv-sec-title">05. Formação</h2>
              <div class="space-y-2">
                ${d.formacoes.map(f => `
                  <div class="text-xs">
                    <div class="font-bold text-slate-900">${escapeHtml(f.curso)}</div>
                    <div class="text-slate-600 font-mono text-[11px]">${escapeHtml(f.instituicao)}</div>
                  </div>
                `).join('')}
              </div>
            </section>
          ` : ''}

          ${d.cursos && d.cursos.length ? `
            <section class="cv-section">
              <h2 class="cv-sec-title">06. Certificações</h2>
              <div class="space-y-2 text-xs">
                ${d.cursos.map(c => `
                  <div>
                    <span class="font-bold text-slate-900">${escapeHtml(c.nome)}</span>
                    <span class="text-slate-500 font-mono block text-[11px]">${escapeHtml(c.instituicao)}</span>
                  </div>
                `).join('')}
              </div>
            </section>
          ` : ''}
        </div>
      </div>
    `;
  }

  // MODELO 5: Administração e Finanças (Layout corporativo estruturado, tabular, ênfase em ERPs e rotinas)
  function renderTemplate5(d, color) {
    return `
      <div class="cv-tpl-5" style="--cv-primary: ${color}">
        <header class="cv-header">
          <div class="flex justify-between items-center flex-wrap gap-3">
            <div class="flex-1 min-w-[200px]">
              <h1 class="cv-name">${escapeHtml(d.nome || 'Seu Nome Completo')}</h1>
              <div class="text-xs font-bold uppercase tracking-wider text-slate-600 mt-1">${escapeHtml(d.cargoDesejado || 'Área Administrativa e Financeira')}</div>
            </div>
            ${renderCvPhoto(d)}
            <div class="text-right text-xs text-slate-600 space-y-0.5">
              ${d.telefone ? `<div>${escapeHtml(d.telefone)}</div>` : ''}
              ${d.email ? `<div>${escapeHtml(d.email)}</div>` : ''}
              ${d.cidade ? `<div>${escapeHtml(d.cidade)} - ${escapeHtml(d.estado)}</div>` : ''}
            </div>
          </div>
        </header>

        ${d.resumoProfissional ? `
          <section class="cv-section mb-4">
            <h2 class="cv-sec-title">Resumo de Qualificações Administrativas</h2>
            <p class="cv-desc text-justify">${escapeHtml(d.resumoProfissional)}</p>
          </section>
        ` : ''}

        ${d.experiencias && d.experiencias.length ? `
          <section class="cv-section mb-4">
            <h2 class="cv-sec-title">Experiência Profissional</h2>
            <div class="space-y-3.5">
              ${d.experiencias.map(exp => `
                <div class="cv-item border-b border-slate-200 pb-2.5">
                  <div class="flex justify-between items-baseline font-bold text-xs text-slate-900">
                    <span>${escapeHtml(exp.cargo)} — ${escapeHtml(exp.empresa)}</span>
                    <span class="text-slate-500 font-normal">${escapeHtml(exp.dataInicio)} a ${exp.atual ? 'Atual' : escapeHtml(exp.dataTermino || '')}</span>
                  </div>
                  ${exp.descricao ? `<p class="cv-desc text-xs mt-1">${escapeHtml(exp.descricao)}</p>` : ''}
                  ${exp.resultados ? `<p class="cv-desc text-xs mt-1 text-slate-600"><strong>Resultados:</strong> ${escapeHtml(exp.resultados)}</p>` : ''}
                </div>
              `).join('')}
            </div>
          </section>
        ` : ''}

        <div class="cv-grid-two">
          ${d.formacoes && d.formacoes.length ? `
            <section class="cv-section">
              <h2 class="cv-sec-title">Formação Superior / Técnica</h2>
              <div class="space-y-2">
                ${d.formacoes.map(f => `
                  <div class="text-xs">
                    <div class="font-bold text-slate-900">${escapeHtml(f.curso)}</div>
                    <div class="text-slate-600">${escapeHtml(f.instituicao)} ${f.dataConclusao ? `(${escapeHtml(f.dataConclusao)})` : ''}</div>
                  </div>
                `).join('')}
              </div>
            </section>
          ` : ''}

          ${d.cursos && d.cursos.length ? `
            <section class="cv-section">
              <h2 class="cv-sec-title">Sistemas e Certificações</h2>
              <div class="space-y-1.5 text-xs">
                ${d.cursos.map(c => `
                  <div>
                    <span class="font-bold text-slate-900">${escapeHtml(c.nome)}</span>
                    <span class="text-slate-500 block text-[11px]">${escapeHtml(c.instituicao)}</span>
                  </div>
                `).join('')}
              </div>
            </section>
          ` : ''}
        </div>

        ${d.habilidades && d.habilidades.length ? `
          <section class="cv-section mt-4">
            <h2 class="cv-sec-title">Competências Profissionais</h2>
            <div class="flex flex-wrap gap-1.5">
              ${d.habilidades.map(h => `
                <span class="px-2 py-0.5 bg-slate-100 text-slate-800 text-xs font-semibold rounded border border-slate-300">
                  ${escapeHtml(h.nome)}
                </span>
              `).join('')}
            </div>
          </section>
        ` : ''}
      </div>
    `;
  }

  // MODELO 6: Comercial e Vendas (Visual dinâmico, foco em resultados mensuráveis, metas e negociação)
  function renderTemplate6(d, color) {
    return `
      <div class="cv-tpl-6" style="--cv-primary: ${color}">
        <header class="cv-header flex items-center justify-between gap-4">
          <div class="flex-1">
            <h1 class="cv-name">${escapeHtml(d.nome || 'Seu Nome Completo')}</h1>
            <div class="text-sm font-bold text-slate-700 mt-0.5">${escapeHtml(d.cargoDesejado || 'Especialista em Vendas / Comercial')}</div>
            <div class="text-xs text-slate-500 mt-2">${renderContactsLine(d, '•')}</div>
          </div>
          <div class="flex items-center gap-3 flex-shrink-0">
            <span class="cv-sales-tag hidden sm:inline-block">Foco em Resultados</span>
            ${renderCvPhoto(d)}
          </div>
        </header>

        ${d.resumoProfissional ? `
          <section class="cv-section mb-5">
            <h2 class="cv-sec-title">Perfil Comercial</h2>
            <p class="cv-desc">${escapeHtml(d.resumoProfissional)}</p>
          </section>
        ` : ''}

        ${d.experiencias && d.experiencias.length ? `
          <section class="cv-section mb-5">
            <h2 class="cv-sec-title">Histórico de Atuação e Vendas</h2>
            <div class="space-y-4">
              ${d.experiencias.map(exp => `
                <div class="cv-item border-l-3 border-amber-400 pl-3">
                  <div class="flex justify-between items-baseline">
                    <span class="font-bold text-sm text-slate-900">${escapeHtml(exp.cargo)}</span>
                    <span class="text-xs text-slate-500 font-semibold">${escapeHtml(exp.dataInicio)} — ${exp.atual ? 'Atual' : escapeHtml(exp.dataTermino || '')}</span>
                  </div>
                  <div class="text-xs font-semibold text-slate-600 mb-1">${escapeHtml(exp.empresa)}</div>
                  ${exp.descricao ? `<p class="cv-desc text-xs mb-1">${escapeHtml(exp.descricao)}</p>` : ''}
                  ${exp.resultados ? `
                    <div class="bg-amber-50 text-amber-900 p-2 rounded text-xs font-medium border border-amber-200 mt-1">
                      ★ <strong>Resultados/Metas:</strong> ${escapeHtml(exp.resultados)}
                    </div>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          </section>
        ` : ''}

        <div class="grid grid-cols-2 gap-4">
          ${d.habilidades && d.habilidades.length ? `
            <section class="cv-section">
              <h2 class="cv-sec-title">Competências Comerciais</h2>
              <div class="flex flex-wrap gap-1.5">
                ${d.habilidades.map(h => `
                  <span class="px-2.5 py-1 bg-slate-100 text-slate-800 text-xs font-bold rounded-lg border border-slate-200">
                    ${escapeHtml(h.nome)}
                  </span>
                `).join('')}
              </div>
            </section>
          ` : ''}

          ${d.cursos && d.cursos.length ? `
            <section class="cv-section">
              <h2 class="cv-sec-title">Cursos de Vendas & CRM</h2>
              <div class="space-y-2 text-xs">
                ${d.cursos.map(c => `
                  <div>
                    <span class="font-bold text-slate-900">${escapeHtml(c.nome)}</span>
                    <span class="text-slate-500 block text-[11px]">${escapeHtml(c.instituicao)}</span>
                  </div>
                `).join('')}
              </div>
            </section>
          ` : ''}
        </div>

        ${d.formacoes && d.formacoes.length ? `
          <section class="cv-section mt-4">
            <h2 class="cv-sec-title">Formação Acadêmica</h2>
            <div class="space-y-2">
              ${d.formacoes.map(f => `
                <div class="text-xs">
                  <span class="font-bold text-slate-900">${escapeHtml(f.curso)}</span>
                  <span class="text-slate-600"> — ${escapeHtml(f.instituicao)} (${escapeHtml(f.dataConclusao || '')})</span>
                </div>
              `).join('')}
            </div>
          </section>
        ` : ''}
      </div>
    `;
  }

  // MODELO 7: Acadêmico e Estágio (Formação em primeiro plano, iniciação científica, pesquisa e idiomas)
  function renderTemplate7(d, color) {
    return `
      <div class="cv-tpl-7" style="--cv-primary: ${color}">
        <header class="text-center mb-5">
          ${d.foto ? `<div class="flex justify-center mb-3">${renderCvPhoto(d)}</div>` : ''}
          <h1 class="cv-name">${escapeHtml(d.nome || 'Seu Nome Completo')}</h1>
          <div class="text-xs text-slate-600 mb-2">${escapeHtml(d.cargoDesejado || 'Candidato a Estágio / Pesquisa Acadêmica')}</div>
          <div class="cv-contact-bar">${renderContactsLine(d, '•')}</div>
        </header>

        ${d.objetivoProfissional ? `
          <section class="cv-section mb-4">
            <h2 class="cv-sec-title">Objetivo</h2>
            <p class="cv-desc text-xs leading-relaxed">${escapeHtml(d.objetivoProfissional)}</p>
          </section>
        ` : ''}

        ${d.formacoes && d.formacoes.length ? `
          <section class="cv-section mb-5">
            <h2 class="cv-sec-title">Formação Acadêmica</h2>
            <div class="space-y-3">
              ${d.formacoes.map(f => `
                <div class="cv-item">
                  <div class="flex justify-between items-baseline font-bold text-xs text-slate-900">
                    <span>${escapeHtml(f.curso)}</span>
                    <span class="text-slate-500 font-normal">${escapeHtml(f.dataInicio || '')} — ${escapeHtml(f.dataConclusao || 'Previsão')}</span>
                  </div>
                  <div class="text-xs text-slate-700 italic">${escapeHtml(f.instituicao)} ${f.grau ? `(${escapeHtml(f.grau)})` : ''}</div>
                  ${f.status ? `<div class="text-[11px] text-slate-500">Situação: ${escapeHtml(f.status)}</div>` : ''}
                </div>
              `).join('')}
            </div>
          </section>
        ` : ''}

        ${d.projetos && d.projetos.length ? `
          <section class="cv-section mb-5">
            <h2 class="cv-sec-title">Iniciação Científica, Projetos & Extensão</h2>
            <div class="space-y-3">
              ${d.projetos.map(p => `
                <div class="cv-item text-xs">
                  <div class="font-bold text-slate-900">${escapeHtml(p.titulo)} ${p.tipo ? `(${escapeHtml(p.tipo)})` : ''}</div>
                  ${p.descricao ? `<p class="cv-desc text-xs mt-0.5">${escapeHtml(p.descricao)}</p>` : ''}
                </div>
              `).join('')}
            </div>
          </section>
        ` : ''}

        ${d.experiencias && d.experiencias.length ? `
          <section class="cv-section mb-4">
            <h2 class="cv-sec-title">Experiências e Estágios Anteriores</h2>
            <div class="space-y-3">
              ${d.experiencias.map(exp => `
                <div class="cv-item text-xs">
                  <div class="flex justify-between font-bold text-slate-900">
                    <span>${escapeHtml(exp.cargo)} — ${escapeHtml(exp.empresa)}</span>
                    <span class="text-slate-500 font-normal">${escapeHtml(exp.dataInicio)} a ${exp.atual ? 'Atual' : escapeHtml(exp.dataTermino || '')}</span>
                  </div>
                  ${exp.descricao ? `<p class="cv-desc text-xs mt-0.5">${escapeHtml(exp.descricao)}</p>` : ''}
                </div>
              `).join('')}
            </div>
          </section>
        ` : ''}

        <div class="grid grid-cols-2 gap-4">
          ${d.cursos && d.cursos.length ? `
            <section class="cv-section">
              <h2 class="cv-sec-title">Cursos Complementares</h2>
              <ul class="list-disc list-inside text-xs space-y-1">
                ${d.cursos.map(c => `<li>${escapeHtml(c.nome)} (${escapeHtml(c.instituicao)})</li>`).join('')}
              </ul>
            </section>
          ` : ''}

          ${d.habilidades && d.habilidades.length ? `
            <section class="cv-section">
              <h2 class="cv-sec-title">Idiomas & Ferramentas</h2>
              <div class="flex flex-wrap gap-1">
                ${d.habilidades.map(h => `<span class="px-2 py-0.5 bg-slate-100 rounded text-xs">${escapeHtml(h.nome)}</span>`).join('')}
              </div>
            </section>
          ` : ''}
        </div>
      </div>
    `;
  }

  // MODELO 8: Criativo e Design (Tipografia expressiva contemporânea, funcional em preto e branco)
  function renderTemplate8(d) {
    return `
      <div class="cv-tpl-8">
        <header class="cv-creative-header flex items-center justify-between gap-4">
          <div class="flex-1">
            <h1 class="cv-name">${escapeHtml(d.nome || 'Seu Nome Completo')}</h1>
            <div class="text-xs font-black uppercase tracking-widest text-slate-600 mt-1">${escapeHtml(d.cargoDesejado || 'Diretor de Arte / Criativo')}</div>
            <div class="text-xs text-slate-500 font-medium mt-2 flex flex-wrap gap-3">${renderContactsLine(d, '•')}</div>
          </div>
          ${renderCvPhoto(d, 'border-pink-500 shadow-md')}
        </header>

        ${d.resumoProfissional ? `
          <section class="cv-section mb-6">
            <h2 class="cv-sec-title"><span class="number">01</span> Manifest / Bio</h2>
            <p class="cv-desc text-sm leading-relaxed text-slate-800 font-medium">${escapeHtml(d.resumoProfissional)}</p>
          </section>
        ` : ''}

        ${d.projetos && d.projetos.length ? `
          <section class="cv-section mb-6">
            <h2 class="cv-sec-title"><span class="number">02</span> Portfólio & Cases Selecionados</h2>
            <div class="space-y-3">
              ${d.projetos.map(p => `
                <div class="border-2 border-slate-900 p-3 rounded-lg">
                  <div class="flex justify-between items-center">
                    <span class="font-black text-sm text-slate-900">${escapeHtml(p.titulo)}</span>
                    ${p.link ? `<a href="${escapeHtml(p.link)}" target="_blank" class="text-xs font-bold underline">Acessar Case ↗</a>` : ''}
                  </div>
                  ${p.descricao ? `<p class="cv-desc text-xs mt-1 text-slate-700">${escapeHtml(p.descricao)}</p>` : ''}
                </div>
              `).join('')}
            </div>
          </section>
        ` : ''}

        ${d.experiencias && d.experiencias.length ? `
          <section class="cv-section mb-6">
            <h2 class="cv-sec-title"><span class="number">03</span> Experiência de Trabalho</h2>
            <div class="space-y-3.5">
              ${d.experiencias.map(exp => `
                <div class="cv-item">
                  <div class="flex justify-between font-black text-xs text-slate-900">
                    <span>${escapeHtml(exp.cargo)} @ ${escapeHtml(exp.empresa)}</span>
                    <span class="font-normal text-slate-500">${escapeHtml(exp.dataInicio)} — ${exp.atual ? 'Presente' : escapeHtml(exp.dataTermino || '')}</span>
                  </div>
                  ${exp.descricao ? `<p class="cv-desc text-xs mt-1">${escapeHtml(exp.descricao)}</p>` : ''}
                </div>
              `).join('')}
            </div>
          </section>
        ` : ''}

        <div class="grid grid-cols-2 gap-4">
          ${d.habilidades && d.habilidades.length ? `
            <section class="cv-section">
              <h2 class="cv-sec-title"><span class="number">04</span> Ferramentas</h2>
              <div class="flex flex-wrap gap-1.5">
                ${d.habilidades.map(h => `<span class="px-2.5 py-1 bg-slate-900 text-white font-bold text-xs rounded">${escapeHtml(h.nome)}</span>`).join('')}
              </div>
            </section>
          ` : ''}

          ${d.formacoes && d.formacoes.length ? `
            <section class="cv-section">
              <h2 class="cv-sec-title"><span class="number">05</span> Educação</h2>
              <div class="space-y-1.5 text-xs">
                ${d.formacoes.map(f => `
                  <div>
                    <span class="font-bold text-slate-900">${escapeHtml(f.curso)}</span>
                    <span class="text-slate-500 block text-[11px]">${escapeHtml(f.instituicao)}</span>
                  </div>
                `).join('')}
              </div>
            </section>
          ` : ''}
        </div>
      </div>
    `;
  }

  // MODELO 9: Operacional e Industrial (Layout direto, técnico, destaque em NRs e segurança)
  function renderTemplate9(d) {
    return `
      <div class="cv-tpl-9">
        <header class="cv-header">
          <div class="flex justify-between items-center flex-wrap gap-3">
            <div class="flex-1 min-w-[200px]">
              <h1 class="cv-name">${escapeHtml(d.nome || 'Seu Nome Completo')}</h1>
              <div class="text-xs font-bold text-slate-700 uppercase mt-0.5">${escapeHtml(d.cargoDesejado || 'Área Operacional / Produção / Manutenção')}</div>
            </div>
            ${renderCvPhoto(d, 'border-slate-400')}
            <div class="text-xs text-slate-600 font-semibold space-y-0.5">
              ${d.telefone ? `<div>📞 ${escapeHtml(d.telefone)}</div>` : ''}
              ${d.cidade ? `<div>📍 ${escapeHtml(d.cidade)} - ${escapeHtml(d.estado)}</div>` : ''}
              ${d.email ? `<div>✉️ ${escapeHtml(d.email)}</div>` : ''}
            </div>
          </div>
        </header>

        ${d.objetivoProfissional ? `
          <section class="cv-section mb-4">
            <h2 class="cv-sec-title">Objetivo e Disponibilidade</h2>
            <p class="cv-desc text-xs font-medium">${escapeHtml(d.objetivoProfissional)}</p>
          </section>
        ` : ''}

        ${d.experiencias && d.experiencias.length ? `
          <section class="cv-section mb-4">
            <h2 class="cv-sec-title">Experiência Profissional</h2>
            <div class="space-y-3">
              ${d.experiencias.map(exp => `
                <div class="cv-item border-b border-slate-200 pb-2">
                  <div class="flex justify-between font-bold text-xs text-slate-900">
                    <span>${escapeHtml(exp.cargo)} — ${escapeHtml(exp.empresa)}</span>
                    <span class="font-normal text-slate-500">${escapeHtml(exp.dataInicio)} a ${exp.atual ? 'Atual' : escapeHtml(exp.dataTermino || '')}</span>
                  </div>
                  ${exp.descricao ? `<p class="cv-desc text-xs mt-1">${escapeHtml(exp.descricao)}</p>` : ''}
                  ${exp.resultados ? `<p class="cv-desc text-xs mt-0.5 text-slate-600"><strong>Equipamentos / Rotinas:</strong> ${escapeHtml(exp.resultados)}</p>` : ''}
                </div>
              `).join('')}
            </div>
          </section>
        ` : ''}

        ${d.cursos && d.cursos.length ? `
          <section class="cv-section mb-4">
            <h2 class="cv-sec-title">Capacitações Técnicas e Normas (NRs)</h2>
            <div class="grid grid-cols-2 gap-2 text-xs">
              ${d.cursos.map(c => `
                <div class="bg-slate-100 p-2 rounded border border-slate-300">
                  <div class="font-bold text-slate-900">${escapeHtml(c.nome)}</div>
                  <div class="text-[11px] text-slate-600">${escapeHtml(c.instituicao)} ${c.anoConclusao ? `(${escapeHtml(c.anoConclusao)})` : ''}</div>
                </div>
              `).join('')}
            </div>
          </section>
        ` : ''}

        <div class="grid grid-cols-2 gap-4">
          ${d.formacoes && d.formacoes.length ? `
            <section class="cv-section">
              <h2 class="cv-sec-title">Escolaridade</h2>
              <div class="space-y-1 text-xs">
                ${d.formacoes.map(f => `
                  <div>
                    <span class="font-bold text-slate-900">${escapeHtml(f.curso)}</span>
                    <span class="text-slate-600 block text-[11px]">${escapeHtml(f.instituicao)}</span>
                  </div>
                `).join('')}
              </div>
            </section>
          ` : ''}

          ${d.habilidades && d.habilidades.length ? `
            <section class="cv-section">
              <h2 class="cv-sec-title">Habilidades Práticas</h2>
              <div class="flex flex-wrap gap-1">
                ${d.habilidades.map(h => `<span class="px-2 py-0.5 bg-slate-200 text-slate-900 font-bold text-xs rounded">${escapeHtml(h.nome)}</span>`).join('')}
              </div>
            </section>
          ` : ''}
        </div>
      </div>
    `;
  }

  // MODELO 10: Atendimento e Serviços (Apresentação humana, comunicação clara, resolução ágil de problemas)
  function renderTemplate10(d, color) {
    return `
      <div class="cv-tpl-10" style="--cv-primary: ${color}">
        <header class="cv-header text-center">
          ${d.foto ? `<div class="flex justify-center mb-3">${renderCvPhoto(d)}</div>` : ''}
          <h1 class="cv-name">${escapeHtml(d.nome || 'Seu Nome Completo')}</h1>
          <div class="text-sm font-bold text-slate-700 mt-1">${escapeHtml(d.cargoDesejado || 'Atendimento ao Cliente / Recepção')}</div>
          <div class="text-xs text-slate-500 mt-2 flex justify-center flex-wrap gap-3">${renderContactsLine(d, '•')}</div>
        </header>

        ${d.resumoProfissional ? `
          <section class="cv-section mb-4">
            <h2 class="cv-sec-title">Perfil e Diferenciais</h2>
            <p class="cv-desc leading-relaxed">${escapeHtml(d.resumoProfissional)}</p>
          </section>
        ` : ''}

        ${d.experiencias && d.experiencias.length ? `
          <section class="cv-section mb-4">
            <h2 class="cv-sec-title">Experiência em Atendimento</h2>
            <div class="space-y-3">
              ${d.experiencias.map(exp => `
                <div class="cv-item">
                  <div class="flex justify-between items-baseline font-bold text-xs text-slate-900">
                    <span>${escapeHtml(exp.cargo)} — ${escapeHtml(exp.empresa)}</span>
                    <span class="font-normal text-slate-500">${escapeHtml(exp.dataInicio)} — ${exp.atual ? 'Atual' : escapeHtml(exp.dataTermino || '')}</span>
                  </div>
                  ${exp.descricao ? `<p class="cv-desc text-xs mt-1">${escapeHtml(exp.descricao)}</p>` : ''}
                </div>
              `).join('')}
            </div>
          </section>
        ` : ''}

        <div class="grid grid-cols-2 gap-4">
          ${d.habilidades && d.habilidades.length ? `
            <section class="cv-section">
              <h2 class="cv-sec-title">Competências de Atendimento</h2>
              <div class="flex flex-wrap gap-1.5">
                ${d.habilidades.map(h => `<span class="px-2.5 py-1 bg-blue-50 text-blue-950 font-bold text-xs rounded border border-blue-200">${escapeHtml(h.nome)}</span>`).join('')}
              </div>
            </section>
          ` : ''}

          ${d.cursos && d.cursos.length ? `
            <section class="cv-section">
              <h2 class="cv-sec-title">Cursos de Comunicação & Serviços</h2>
              <div class="space-y-1.5 text-xs">
                ${d.cursos.map(c => `
                  <div>
                    <span class="font-bold text-slate-900">${escapeHtml(c.nome)}</span>
                    <span class="text-slate-500 block text-[11px]">${escapeHtml(c.instituicao)}</span>
                  </div>
                `).join('')}
              </div>
            </section>
          ` : ''}
        </div>

        ${d.formacoes && d.formacoes.length ? `
          <section class="cv-section mt-4">
            <h2 class="cv-sec-title">Formação</h2>
            <div class="space-y-1 text-xs">
              ${d.formacoes.map(f => `
                <div>
                  <span class="font-bold text-slate-900">${escapeHtml(f.curso)}</span>
                  <span class="text-slate-600"> — ${escapeHtml(f.instituicao)} (${escapeHtml(f.dataConclusao || '')})</span>
                </div>
              `).join('')}
            </div>
          </section>
        ` : ''}
      </div>
    `;
  }

  // MODELO 11: Profissional Experiente (Destaque para longevidade, trajetória consolidada e liderança)
  function renderTemplate11(d, color) {
    return `
      <div class="cv-tpl-11" style="--cv-primary: ${color}">
        <div class="cv-senior-card flex items-center justify-between gap-4">
          <div class="flex-1">
            <h1 class="cv-name">${escapeHtml(d.nome || 'Seu Nome Completo')}</h1>
            <div class="text-sm font-extrabold text-slate-700 tracking-wide mt-1">${escapeHtml(d.cargoDesejado || 'Especialista / Consultor')}</div>
            <div class="text-xs text-slate-500 font-semibold mt-2">${renderContactsLine(d, '•')}</div>
          </div>
          ${renderCvPhoto(d, 'border-amber-600 shadow-md')}
        </div>

        ${d.resumoProfissional ? `
          <section class="cv-section mb-5">
            <h2 class="cv-sec-title">Síntese Profissional e Liderança</h2>
            <p class="cv-desc leading-relaxed">${escapeHtml(d.resumoProfissional)}</p>
          </section>
        ` : ''}

        ${d.experiencias && d.experiencias.length ? `
          <section class="cv-section mb-5">
            <h2 class="cv-sec-title">Histórico de Carreira e Realizações</h2>
            <div class="space-y-4">
              ${d.experiencias.map(exp => `
                <div class="cv-item">
                  <div class="flex justify-between items-baseline font-bold text-xs text-slate-900">
                    <span class="text-sm">${escapeHtml(exp.cargo)}</span>
                    <span class="text-slate-500 font-normal">${escapeHtml(exp.dataInicio)} — ${exp.atual ? 'Presente' : escapeHtml(exp.dataTermino || '')}</span>
                  </div>
                  <div class="text-xs font-semibold text-slate-600 mb-1">${escapeHtml(exp.empresa)}${exp.localidade ? ` • ${escapeHtml(exp.localidade)}` : ''}</div>
                  ${exp.descricao ? `<p class="cv-desc text-xs mb-1">${escapeHtml(exp.descricao)}</p>` : ''}
                  ${exp.resultados ? `<p class="cv-desc text-xs text-slate-800"><strong>Principais Entregas:</strong> ${escapeHtml(exp.resultados)}</p>` : ''}
                </div>
              `).join('')}
            </div>
          </section>
        ` : ''}

        <div class="grid grid-cols-2 gap-4">
          ${d.formacoes && d.formacoes.length ? `
            <section class="cv-section">
              <h2 class="cv-sec-title">Formação Superior / Pós</h2>
              <div class="space-y-2 text-xs">
                ${d.formacoes.map(f => `
                  <div>
                    <div class="font-bold text-slate-900">${escapeHtml(f.curso)}</div>
                    <div class="text-slate-600">${escapeHtml(f.instituicao)} (${escapeHtml(f.dataConclusao || '')})</div>
                  </div>
                `).join('')}
              </div>
            </section>
          ` : ''}

          ${d.cursos && d.cursos.length ? `
            <section class="cv-section">
              <h2 class="cv-sec-title">Especializações & Cursos</h2>
              <div class="space-y-1.5 text-xs">
                ${d.cursos.map(c => `
                  <div>
                    <span class="font-bold text-slate-900">${escapeHtml(c.nome)}</span>
                    <span class="text-slate-500 block text-[11px]">${escapeHtml(c.instituicao)}</span>
                  </div>
                `).join('')}
              </div>
            </section>
          ` : ''}
        </div>

        ${d.habilidades && d.habilidades.length ? `
          <section class="cv-section mt-4">
            <h2 class="cv-sec-title">Domínios Estratégicos & Competências</h2>
            <div class="flex flex-wrap gap-1.5">
              ${d.habilidades.map(h => `<span class="px-2.5 py-1 bg-slate-100 text-slate-900 font-bold text-xs rounded border border-slate-300">${escapeHtml(h.nome)}</span>`).join('')}
            </div>
          </section>
        ` : ''}
      </div>
    `;
  }

  // MODELO 12: Acessível e Inclusivo (Alto contraste, tipografia ampliada, 100% linear, compatível com leitores de tela)
  function renderTemplate12(d) {
    return `
      <div class="cv-tpl-12" role="document" aria-label="Currículo Acessível de ${escapeHtml(d.nome || 'Candidato')}">
        <header class="flex items-center justify-between gap-4">
          <div class="flex-1">
            <h1 class="cv-name">${escapeHtml(d.nome || 'Seu Nome Completo')}</h1>
            ${d.cargoDesejado ? `<div class="text-base font-bold text-black mb-2">Objetivo / Cargo: ${escapeHtml(d.cargoDesejado)}</div>` : ''}
            <div class="cv-contact-bar">
            ${d.telefone ? `<div>Telefone: ${escapeHtml(d.telefone)}</div>` : ''}
            ${d.email ? `<div>E-mail: ${escapeHtml(d.email)}</div>` : ''}
            ${d.cidade ? `<div>Localidade: ${escapeHtml(d.cidade)} - ${escapeHtml(d.estado)}</div>` : ''}
            ${d.linkedin ? `<div>LinkedIn: ${escapeHtml(d.linkedin)}</div>` : ''}
            ${d.portfolio ? `<div>Portfólio: ${escapeHtml(d.portfolio)}</div>` : ''}
          </div>
          </div>
          ${renderCvPhoto(d, 'border-black')}
        </header>

        ${d.adaptacaoAcessibilidade ? `
          <section class="cv-section mb-5" aria-label="Adaptações Profissionais">
            <h2 class="cv-sec-title">Adaptações ou Condições Profissionais</h2>
            <p class="cv-desc font-medium">${escapeHtml(d.adaptacaoAcessibilidade)}</p>
          </section>
        ` : ''}

        ${d.resumoProfissional ? `
          <section class="cv-section mb-5" aria-label="Resumo Profissional">
            <h2 class="cv-sec-title">Resumo Profissional</h2>
            <p class="cv-desc leading-relaxed">${escapeHtml(d.resumoProfissional)}</p>
          </section>
        ` : ''}

        ${d.experiencias && d.experiencias.length ? `
          <section class="cv-section mb-5" aria-label="Experiências Profissionais">
            <h2 class="cv-sec-title">Experiências Profissionais</h2>
            <div class="space-y-4">
              ${d.experiencias.map(exp => `
                <div class="cv-item">
                  <div class="cv-item-title">${escapeHtml(exp.cargo)} na empresa ${escapeHtml(exp.empresa)}</div>
                  <div class="cv-item-subtitle">Período: ${escapeHtml(exp.dataInicio)} até ${exp.atual ? 'o momento atual' : escapeHtml(exp.dataTermino || '')}</div>
                  ${exp.descricao ? `<p class="cv-desc mt-1">${escapeHtml(exp.descricao)}</p>` : ''}
                  ${exp.resultados ? `<p class="cv-desc mt-1"><strong>Resultados:</strong> ${escapeHtml(exp.resultados)}</p>` : ''}
                </div>
              `).join('')}
            </div>
          </section>
        ` : ''}

        ${d.formacoes && d.formacoes.length ? `
          <section class="cv-section mb-5" aria-label="Formação Acadêmica">
            <h2 class="cv-sec-title">Formação Acadêmica</h2>
            <div class="space-y-3">
              ${d.formacoes.map(f => `
                <div class="cv-item">
                  <div class="cv-item-title">${escapeHtml(f.curso)}</div>
                  <div class="cv-item-subtitle">${escapeHtml(f.instituicao)} ${f.dataConclusao ? `— Conclusão: ${escapeHtml(f.dataConclusao)}` : ''}</div>
                </div>
              `).join('')}
            </div>
          </section>
        ` : ''}

        ${d.cursos && d.cursos.length ? `
          <section class="cv-section mb-5" aria-label="Cursos e Certificações">
            <h2 class="cv-sec-title">Cursos e Certificações</h2>
            <ul class="space-y-1.5 list-disc list-inside cv-desc">
              ${d.cursos.map(c => `
                <li>
                  <strong>${escapeHtml(c.nome)}</strong>, oferecido por ${escapeHtml(c.instituicao)}
                  ${c.cargaHoraria ? ` (${escapeHtml(c.cargaHoraria)} horas)` : ''}
                  ${c.anoConclusao ? ` em ${escapeHtml(c.anoConclusao)}` : ''}
                </li>
              `).join('')}
            </ul>
          </section>
        ` : ''}

        ${d.habilidades && d.habilidades.length ? `
          <section class="cv-section" aria-label="Competências">
            <h2 class="cv-sec-title">Competências</h2>
            <div class="flex flex-wrap gap-2">
              ${d.habilidades.map(h => `<span class="px-3 py-1 bg-black text-white font-bold text-sm rounded">${escapeHtml(h.nome)}</span>`).join('')}
            </div>
          </section>
        ` : ''}
      </div>
    `;
  }

  // Tabela Mestra de Renderização dos 12 Modelos
  const TEMPLATE_RENDERERS = {
    1: renderTemplate1,
    2: renderTemplate2,
    3: renderTemplate3,
    4: renderTemplate4,
    5: renderTemplate5,
    6: renderTemplate6,
    7: renderTemplate7,
    8: renderTemplate8,
    9: renderTemplate9,
    10: renderTemplate10,
    11: renderTemplate11,
    12: renderTemplate12
  };

  function renderCurriculoHtml(data, templateId, color) {
    const renderer = TEMPLATE_RENDERERS[templateId] || renderTemplate1;
    return renderer(data, color);
  }

  // ==============================================================================
  // VERIFICADOR DE CURRÍCULO (Checklist e Auditoria Não-Discriminatória)
  // ==============================================================================
  function auditCurriculo(d) {
    const checks = [
      {
        id: 'nome',
        label: 'Nome completo informado',
        ok: Boolean(d.nome && d.nome.trim().length >= 3),
        importance: 'obrigatorio',
        tip: 'Seu nome é essencial para identificação no topo do currículo.'
      },
      {
        id: 'email',
        label: 'E-mail em formato válido',
        ok: Boolean(d.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email.trim())),
        importance: 'obrigatorio',
        tip: 'Recrutadores utilizam o e-mail como canal prioritário para agendamento de entrevistas.'
      },
      {
        id: 'telefone',
        label: 'Telefone de contato preenchido',
        ok: Boolean(d.telefone && d.telefone.trim().length >= 8),
        importance: 'recomendado',
        tip: 'Informe com DDD e WhatsApp para agilizar o primeiro contato.'
      },
      {
        id: 'cidade',
        label: 'Cidade e Estado informados',
        ok: Boolean(d.cidade && d.cidade.trim()),
        importance: 'recomendado',
        tip: 'Ajuda recrutadores a verificar a compatibilidade de deslocamento ou modalidade remota.'
      },
      {
        id: 'objetivo',
        label: 'Objetivo ou Cargo pretendido',
        ok: Boolean(d.cargoDesejado || d.objetivoProfissional),
        importance: 'recomendado',
        tip: 'Ter um foco claro evita que seu currículo seja descartado por falta de direcionamento.'
      },
      {
        id: 'resumo',
        label: 'Resumo / Apresentação profissional',
        ok: Boolean(d.resumoProfissional && d.resumoProfissional.trim().length >= 30),
        importance: 'sugestao',
        tip: 'Um resumo de 2 a 4 linhas resume seus pontos fortes e chama atenção imediata.'
      },
      {
        id: 'formacao',
        label: 'Formação acadêmica adicionada',
        ok: Boolean(d.formacoes && d.formacoes.length > 0),
        importance: 'recomendado',
        tip: 'Informe sua escolaridade básica, curso técnico ou graduação.'
      },
      {
        id: 'experiencia_ou_projeto',
        label: 'Experiências ou Projetos informados',
        ok: Boolean((d.experiencias && d.experiencias.length > 0) || (d.projetos && d.projetos.length > 0)),
        importance: 'recomendado',
        tip: 'Se não tiver experiência formal CLT, inclua trabalhos voluntários ou projetos práticos.'
      },
      {
        id: 'cursos',
        label: 'Cursos complementares para valorizar o perfil',
        ok: Boolean(d.cursos && d.cursos.length > 0),
        importance: 'sugestao',
        tip: 'Adicione cursos gratuitos do catálogo Você Pode Tudo para comprovar aprendizado contínuo.'
      },
      {
        id: 'habilidades',
        label: 'Habilidades preenchidas',
        ok: Boolean(d.habilidades && d.habilidades.length >= 3),
        importance: 'recomendado',
        tip: 'Liste pelo menos 3 habilidades técnicas ou interpessoais.'
      }
    ];

    const completed = checks.filter(c => c.ok).length;
    const total = checks.length;
    const score = Math.round((completed / total) * 100);

    return { checks, completed, total, score };
  }

  // ==============================================================================
  // INTEGRAÇÃO COM CURSOS DO PORTAL POR ÁREA PROFISSIONAL
  // ==============================================================================
  function getSuggestedCoursesForProfile(area) {
    if (!state.catalogCourses || state.catalogCourses.length === 0) return [];

    const normArea = (area || 'administrativo').toLowerCase();
    
    // Mapeamento de termos de busca por área
    const areaKeywords = {
      saude: ['saúde', 'cuidador', 'idoso', 'primeiros socorros', 'enfermagem', 'hospital', 'biossegurança', 'nutrição', 'psicologia', 'farmácia', 'vigilância', 'sanitária', 'medicamentos', 'upa', 'sus', 'acolhimento', 'sinais vitais'],
      educacao: ['educação', 'pedagogia', 'ensino', 'professor', 'didática', 'aprendizagem', 'escola', 'libras', 'inclusão', 'bncc', 'comunicação'],
      rh: ['recursos humanos', 'rh', 'departamento pessoal', 'liderança', 'gestão de pessoas', 'recrutamento', 'seleção', 'feedback', 'comunicação'],
      tecnologia: ['programação', 'python', 'java', 'web', 'dados', 'ia', 'segurança', 'ti', 'nuvem', 'lógica'],
      administrativo: ['excel', 'administração', 'gestão', 'finanças', 'office', 'comunicação', 'documentos'],
      comercial: ['vendas', 'atendimento', 'comunicação', 'negociação', 'marketing', 'cliente', 'relacionamento'],
      marketing: ['marketing', 'mídias', 'social media', 'conteúdo', 'publicidade', 'design', 'vendas', 'comunicação', 'canva'],
      operacional: ['segurança', 'logística', 'operação', 'informática', 'qualidade', 'senai', 'nr'],
      atendimento: ['atendimento', 'recepção', 'comunicação', 'cliente', 'telemarketing', 'orónia'],
      hotelaria_gastronomia: ['gastronomia', 'alimentos', 'cozinha', 'hotelaria', 'garçom', 'boas práticas', 'higiene', 'senac'],
      seguranca: ['segurança', 'vigilância', 'portaria', 'patrimonial', 'primeiros socorros', 'combate a incêndio', 'nr'],
      estetica_beleza: ['estética', 'beleza', 'maquiagem', 'cabelo', 'atendimento', 'cuidados', 'pele'],
      construcao_manutencao: ['elétrica', 'manutenção', 'predial', 'construção', 'senai', 'nr-10', 'nr-35', 'segurança do trabalho'],
      juridico: ['direito', 'jurídico', 'legislação', 'lgpd', 'contratos', 'público', 'compliance', 'processos'],
      primeiro_emprego: ['informática', 'currículo', 'entrevista', 'comunicação', 'office', 'básico']
    };

    const keywords = areaKeywords[normArea] || areaKeywords.saude || areaKeywords.administrativo;

    return state.catalogCourses
      .filter(c => {
        if (!c.isActive) return false;
        const text = `${c.title} ${c.description} ${(c.tags || []).join(' ')} ${c.category || ''}`.toLowerCase();
        return keywords.some(k => text.includes(k));
      })
      .slice(0, 6);
  }

  // ==============================================================================
  // PERSISTÊNCIA LOCAL (LOCALSTORAGE) E EXPORTAÇÃO JSON
  // ==============================================================================
  function saveToLocalStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.curriculo));
      localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify({
        activeTemplate: state.activeTemplate,
        primaryColor: state.primaryColor,
        fontScale: state.fontScale,
        hideEmptySections: state.hideEmptySections
      }));
    } catch (e) {
      console.error('Erro ao salvar rascunho no LocalStorage:', e);
    }
  }

  function loadFromLocalStorage() {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        state.curriculo = Object.assign({}, initialCurriculoData, parsed);
      }
      const savedSettings = localStorage.getItem(STORAGE_SETTINGS_KEY);
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        if (settings.activeTemplate) state.activeTemplate = settings.activeTemplate;
        if (settings.primaryColor) state.primaryColor = settings.primaryColor;
        if (settings.fontScale) state.fontScale = settings.fontScale;
        if (typeof settings.hideEmptySections === 'boolean') state.hideEmptySections = settings.hideEmptySections;
      }
    } catch (e) {
      console.warn('Não foi possível restaurar dados salvos no navegador.', e);
    }
  }

  function clearAllData() {
    if (confirm('Tem certeza de que deseja apagar todos os dados preenchidos deste currículo? Esta ação não pode ser desfeita.')) {
      localStorage.removeItem(STORAGE_KEY);
      state.curriculo = JSON.parse(JSON.stringify(initialCurriculoData));
      renderCurrentStep();
      updateLivePreview();
      updateAuditView();
      alert('Dados limpos com sucesso.');
    }
  }

  function exportAsJson() {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({
      version: '1.0',
      portal: 'Você Pode Tudo',
      savedAt: new Date().toISOString(),
      templateId: state.activeTemplate,
      curriculo: state.curriculo
    }, null, 2));

    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${sanitizeFilename(state.curriculo.nome)}_dados.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  function importFromJson(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const imported = JSON.parse(e.target.result);
        if (imported && imported.curriculo) {
          state.curriculo = Object.assign({}, initialCurriculoData, imported.curriculo);
          if (imported.templateId) state.activeTemplate = imported.templateId;
        } else if (imported && typeof imported === 'object') {
          state.curriculo = Object.assign({}, initialCurriculoData, imported);
        }
        saveToLocalStorage();
        renderCurrentStep();
        updateLivePreview();
        updateAuditView();
        alert('Currículo importado com sucesso!');
      } catch (err) {
        alert('Erro ao importar arquivo JSON. Certifique-se de que é um arquivo válido exportado anteriormente.');
      }
    };
    reader.readAsText(file);
  }

  // ==============================================================================

  // ==============================================================================
  // SINCRONIZAÇÃO AUTOMÁTICA DO CURRÍCULO COM A ADMINISTRAÇÃO
  // ==============================================================================
  async function syncGeneratedResumeToBackend() {
    try {
      if (!state.curriculo || !state.curriculo.nome || state.curriculo.nome.trim().length < 2) {
        return; // Só sincroniza se tiver nome preenchido
      }

      const studentToken = localStorage.getItem('vpt_student_token') || sessionStorage.getItem('vpt_student_token') || '';
      const headers = { 'Content-Type': 'application/json' };
      if (studentToken) {
        headers['Authorization'] = `Bearer ${studentToken}`;
      }

      const payload = {
        templateId: String(state.activeTemplate || '1'),
        primaryColor: state.primaryColor || '#002776',
        fontScale: state.fontScale || 1,
        curriculo: state.curriculo
      };

      const res = await fetch('./api/resumes.php?action=save', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.success && data.id) {
          sessionStorage.setItem('vpt_last_saved_resume_id', String(data.id));
        }
      }
    } catch (err) {
      console.warn('[Curriculo] Aviso na sincronização com backend:', err);
    }
  }

    // EXPORTAÇÃO REAL DE PDF (html2pdf.js + Fallback Nativo Window.print)
  // ==============================================================================
  function exportCurriculoToPdf() {
    syncGeneratedResumeToBackend();
    const element = document.getElementById('cv-paper-preview');
    if (!element) return;

    const originalScale = state.fontScale;
    const filename = `${sanitizeFilename(state.curriculo.nome)}.pdf`;

    // Botão de loading visual
    const exportBtn = document.getElementById('btn-export-pdf');
    const originalText = exportBtn ? exportBtn.innerHTML : '';
    if (exportBtn) {
      exportBtn.disabled = true;
      exportBtn.innerHTML = `
        <span class="inline-block animate-spin mr-2">⚙</span>
        <span>Gerando PDF Profissional...</span>
      `;
    }

    if (typeof window.html2pdf !== 'undefined') {
      const opt = {
        margin: [10, 10, 10, 10], // mm
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      window.html2pdf().set(opt).from(element).save().then(() => {
        if (exportBtn) {
          exportBtn.disabled = false;
          exportBtn.innerHTML = originalText;
        }
      }).catch(err => {
        console.error('Falha ao gerar PDF via html2pdf:', err);
        fallbackPrintPdf();
      });
    } else {
      fallbackPrintPdf();
    }

    function fallbackPrintPdf() {
      if (exportBtn) {
        exportBtn.disabled = false;
        exportBtn.innerHTML = originalText;
      }
      alert('Abrindo caixa de diálogo de impressão. Selecione a opção "Salvar como PDF" no destino para salvar seu currículo.');
      window.print();
    }
  }

  // ==============================================================================
  // ATUALIZAÇÃO DA PRÉ-VISUALIZAÇÃO AO VIVO
  // ==============================================================================
  function updateLivePreview() {
    const container = document.getElementById('cv-paper-preview');
    if (!container) return;

    container.innerHTML = renderCurriculoHtml(state.curriculo, state.activeTemplate, state.primaryColor);
    container.style.fontSize = `${state.fontScale * 100}%`;
    
    // Atualizar badge do modelo atual
    const currentTplBadge = document.getElementById('current-template-name');
    if (currentTplBadge) {
      const tpl = TEMPLATES_CATALOG.find(t => t.id === state.activeTemplate);
      currentTplBadge.textContent = tpl ? tpl.name : 'Modelo 1';
    }
  }

  // ==============================================================================
  // RENDERIZAÇÃO DO FORMULÁRIO DE 9 ETAPAS
  // ==============================================================================
  function renderCurrentStep() {
    const stepContainer = document.getElementById('form-step-container');
    if (!stepContainer) return;

    // Atualizar barra de progresso visual
    updateStepProgressUI();

    const d = state.curriculo;

    switch (state.currentStep) {
      case 1:
        stepContainer.innerHTML = renderStep1(d);
        break;
      case 2:
        stepContainer.innerHTML = renderStep2(d);
        break;
      case 3:
        stepContainer.innerHTML = renderStep3(d);
        break;
      case 4:
        stepContainer.innerHTML = renderStep4(d);
        break;
      case 5:
        stepContainer.innerHTML = renderStep5(d);
        break;
      case 6:
        stepContainer.innerHTML = renderStep6(d);
        break;
      case 7:
        syncGeneratedResumeToBackend();
        stepContainer.innerHTML = renderStep7(d);
        break;
      case 8:
        stepContainer.innerHTML = renderStep8(d);
        break;
      case 9:
        stepContainer.innerHTML = renderStep9(d);
        break;
      default:
        stepContainer.innerHTML = renderStep1(d);
    }

    // Inicializar ícones lucide dentro dos novos elementos
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  function updateStepProgressUI() {
    const stepButtons = document.querySelectorAll('.step-tab-btn');
    stepButtons.forEach((btn, index) => {
      const stepNum = index + 1;
      if (stepNum === state.currentStep) {
        btn.classList.add('bg-[#009B3A]', 'text-white', 'shadow-sm');
        btn.classList.remove('bg-slate-100', 'text-slate-700', 'hover:bg-slate-200');
      } else if (stepNum < state.currentStep) {
        btn.classList.add('bg-emerald-50', 'text-emerald-800', 'border-emerald-200');
        btn.classList.remove('bg-[#009B3A]', 'text-white');
      } else {
        btn.classList.add('bg-slate-100', 'text-slate-700');
        btn.classList.remove('bg-[#009B3A]', 'text-white', 'bg-emerald-50');
      }
    });

    const stepTitle = document.getElementById('step-header-title');
    const stepSubtitle = document.getElementById('step-header-subtitle');
    const titles = [
      ['Etapa 1 de 9 — Dados de Contato', 'Informações essenciais para que recrutadores entrem em contato com você.'],
      ['Etapa 2 de 9 — Objetivo Profissional', 'Defina com clareza o cargo e a área em que deseja atuar.'],
      ['Etapa 3 de 9 — Resumo Profissional', 'Apresente seus principais pontos fortes de forma atrativa.'],
      ['Etapa 4 de 9 — Experiência Profissional', 'Liste suas trajetórias de trabalho (ou pule caso seja seu primeiro emprego).'],
      ['Etapa 5 de 9 — Formação Acadêmica', 'Informe sua escolaridade, graduação ou ensino médio.'],
      ['Etapa 6 de 9 — Cursos e Certificações', 'Acrescente certificados para comprovar seu aprendizado contínuo.'],
      ['Etapa 7 de 9 — Habilidades', 'Destaque competências práticas, técnicas e interpessoais.'],
      ['Etapa 8 de 9 — Projetos e Complementares', 'Projetos pessoais, voluntariado ou publicações.'],
      ['Etapa 9 de 9 — Revisão Final e Download', 'Confira todos os dados e exporte seu currículo em PDF.']
    ];
    if (stepTitle && titles[state.currentStep - 1]) {
      stepTitle.textContent = titles[state.currentStep - 1][0];
      stepSubtitle.textContent = titles[state.currentStep - 1][1];
    }
  }

  // ------------------------------------------------------------------------------
  // ETAPA 1: CONTATO
  // ------------------------------------------------------------------------------
  function renderStep1(d) {
    return `
      <div class="space-y-4">
        <!-- Inclusão de Foto Profissional (Opcional) -->
        <div class="p-3.5 bg-white border border-slate-200 rounded-2xl shadow-2xs flex items-center gap-4">
          <div class="relative w-16 h-16 sm:w-18 sm:h-18 rounded-full overflow-hidden bg-slate-100 border-2 ${d.foto ? 'border-[#009B3A]' : 'border-slate-300'} flex items-center justify-center flex-shrink-0 shadow-inner">
            ${d.foto ? `
              <img src="${d.foto}" alt="Foto de ${escapeHtml(d.nome || 'Candidato')}" class="w-full h-full object-cover">
            ` : `
              <div class="flex flex-col items-center justify-center text-slate-400">
                <i data-lucide="user" class="w-7 h-7"></i>
              </div>
            `}
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-0.5">
              <span class="text-xs font-black text-slate-800">Foto para o Currículo</span>
              <span class="text-[9px] font-black uppercase px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">Opcional</span>
            </div>
            <p class="text-[11px] text-slate-500 mb-2 leading-tight">
              Recomendado para lojas de roupas, comércio, vendas, recepção e atendimento.
            </p>
            <div class="flex items-center gap-2 flex-wrap">
              <label class="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-[#009B3A] hover:bg-emerald-100 border border-emerald-200 cursor-pointer inline-flex items-center gap-1.5 transition-colors shadow-2xs">
                <i data-lucide="${d.foto ? 'refresh-cw' : 'camera'}" class="w-3.5 h-3.5"></i>
                <span>${d.foto ? 'Trocar Foto' : 'Adicionar Foto'}</span>
                <input type="file" id="input-foto" accept="image/png, image/jpeg, image/webp" class="hidden" onchange="window.cvApp.handlePhotoUpload(this)">
              </label>
              ${d.foto ? `
                <button type="button" onclick="window.cvApp.removePhoto()" class="px-2.5 py-1.5 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 inline-flex items-center gap-1 transition-colors cursor-pointer">
                  <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                  <span>Remover</span>
                </button>
              ` : ''}
            </div>
          </div>
        </div>

        <div>
          <label for="input-nome" class="block text-xs font-bold text-slate-800 mb-1">Nome Completo <span class="text-rose-500">*</span></label>
          <input 
            type="text" 
            id="input-nome" 
            value="${escapeHtml(d.nome)}" 
            placeholder="Ex: Carlos Eduardo de Oliveira" 
            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-[#009B3A] focus:ring-2 focus:ring-[#009B3A]/20 outline-none"
            oninput="window.cvApp.updateField('nome', this.value)"
          >
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label for="input-cidade" class="block text-xs font-bold text-slate-800 mb-1">Cidade</label>
            <input 
              type="text" 
              id="input-cidade" 
              value="${escapeHtml(d.cidade)}" 
              placeholder="Ex: São Paulo" 
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-[#009B3A] focus:ring-2 focus:ring-[#009B3A]/20 outline-none"
              oninput="window.cvApp.updateField('cidade', this.value)"
            >
          </div>
          <div>
            <label for="input-estado" class="block text-xs font-bold text-slate-800 mb-1">Estado (UF)</label>
            <input 
              type="text" 
              id="input-estado" 
              value="${escapeHtml(d.estado)}" 
              placeholder="Ex: SP" 
              maxlength="2"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-[#009B3A] focus:ring-2 focus:ring-[#009B3A]/20 outline-none uppercase"
              oninput="window.cvApp.updateField('estado', this.value)"
            >
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label for="input-telefone" class="block text-xs font-bold text-slate-800 mb-1">Telefone / WhatsApp</label>
            <input 
              type="tel" 
              id="input-telefone" 
              value="${escapeHtml(d.telefone)}" 
              placeholder="Ex: (11) 98765-4321" 
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-[#009B3A] focus:ring-2 focus:ring-[#009B3A]/20 outline-none"
              oninput="window.cvApp.updateField('telefone', this.value)"
            >
          </div>
          <div>
            <label for="input-email" class="block text-xs font-bold text-slate-800 mb-1">E-mail <span class="text-rose-500">*</span></label>
            <input 
              type="email" 
              id="input-email" 
              value="${escapeHtml(d.email)}" 
              placeholder="Ex: carlos.oliveira@email.com" 
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-[#009B3A] focus:ring-2 focus:ring-[#009B3A]/20 outline-none"
              oninput="window.cvApp.updateField('email', this.value)"
            >
          </div>
        </div>

        <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
          <div class="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
            <i data-lucide="link" class="w-3.5 h-3.5 text-[#002776]"></i>
            <span>Links Profissionais (Opcionais)</span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label for="input-linkedin" class="block text-[11px] font-bold text-slate-600 mb-0.5">LinkedIn</label>
              <input 
                type="url" 
                id="input-linkedin" 
                value="${escapeHtml(d.linkedin)}" 
                placeholder="linkedin.com/in/seu-perfil" 
                class="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs focus:border-[#009B3A] outline-none"
                oninput="window.cvApp.updateField('linkedin', this.value)"
              >
            </div>
            <div>
              <label for="input-portfolio" class="block text-[11px] font-bold text-slate-600 mb-0.5">Portfólio / Site</label>
              <input 
                type="url" 
                id="input-portfolio" 
                value="${escapeHtml(d.portfolio)}" 
                placeholder="seusite.com.br" 
                class="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs focus:border-[#009B3A] outline-none"
                oninput="window.cvApp.updateField('portfolio', this.value)"
              >
            </div>
            <div>
              <label for="input-github" class="block text-[11px] font-bold text-slate-600 mb-0.5">GitHub</label>
              <input 
                type="url" 
                id="input-github" 
                value="${escapeHtml(d.github)}" 
                placeholder="github.com/usuario" 
                class="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs focus:border-[#009B3A] outline-none"
                oninput="window.cvApp.updateField('github', this.value)"
              >
            </div>
          </div>
        </div>

        <div class="p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl">
          <div class="flex items-start gap-2">
            <i data-lucide="shield-check" class="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5"></i>
            <div class="text-xs text-slate-700">
              <strong>Privacidade Garantida:</strong> Nunca solicitamos CPF, RG, endereço residencial com número ou dados bancários. Seus dados ficam salvos unicamente no seu próprio navegador.
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // ------------------------------------------------------------------------------
  // ETAPA 2: OBJETIVO PROFISSIONAL
  // ------------------------------------------------------------------------------
  function renderStep2(d) {
    return `
      <div class="space-y-4">
        <div>
          <label for="input-cargo-desejado" class="block text-xs font-bold text-slate-800 mb-1">Cargo ou Posição Pretendida</label>
          <input 
            type="text" 
            id="input-cargo-desejado" 
            value="${escapeHtml(d.cargoDesejado)}" 
            placeholder="Ex: Assistente Administrativo / Desenvolvedor Front-end / Vendedor" 
            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-[#009B3A] focus:ring-2 focus:ring-[#009B3A]/20 outline-none"
            oninput="window.cvApp.updateField('cargoDesejado', this.value)"
          >
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label for="select-area" class="block text-xs font-bold text-slate-800 mb-1">Área Profissional</label>
            <select 
              id="select-area" 
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-[#009B3A] outline-none bg-white font-medium"
              onchange="window.cvApp.updateField('areaProfissional', this.value)"
            >
              <option value="saude" ${d.areaProfissional === 'saude' ? 'selected' : ''}>🏥 Saúde, Enfermagem e Cuidados</option>
              <option value="administrativo" ${d.areaProfissional === 'administrativo' ? 'selected' : ''}>💼 Administração e Finanças</option>
              <option value="tecnologia" ${d.areaProfissional === 'tecnologia' ? 'selected' : ''}>💻 Tecnologia e Informática</option>
              <option value="educacao" ${d.areaProfissional === 'educacao' ? 'selected' : ''}>📚 Educação, Docência e Pedagogia</option>
              <option value="comercial" ${d.areaProfissional === 'comercial' ? 'selected' : ''}>🛍️ Comercial e Vendas</option>
              <option value="atendimento" ${d.areaProfissional === 'atendimento' ? 'selected' : ''}>📞 Atendimento e Recepção</option>
              <option value="rh" ${d.areaProfissional === 'rh' ? 'selected' : ''}>👥 Recursos Humanos e Gestão de Pessoas</option>
              <option value="operacional" ${d.areaProfissional === 'operacional' ? 'selected' : ''}>📦 Operacional e Logística</option>
              <option value="hotelaria_gastronomia" ${d.areaProfissional === 'hotelaria_gastronomia' ? 'selected' : ''}>🍳 Gastronomia, Hotelaria e Eventos</option>
              <option value="seguranca" ${d.areaProfissional === 'seguranca' ? 'selected' : ''}>🛡️ Segurança, Portaria e Vigilância</option>
              <option value="marketing" ${d.areaProfissional === 'marketing' ? 'selected' : ''}>📱 Marketing e Mídias Digitais</option>
              <option value="estetica_beleza" ${d.areaProfissional === 'estetica_beleza' ? 'selected' : ''}>✨ Estética, Beleza e Bem-Estar</option>
              <option value="construcao_manutencao" ${d.areaProfissional === 'construcao_manutencao' ? 'selected' : ''}>🔨 Construção e Manutenção Técnica</option>
              <option value="juridico" ${d.areaProfissional === 'juridico' ? 'selected' : ''}>⚖️ Jurídico e Serviços Notariais</option>
              <option value="primeiro_emprego" ${d.areaProfissional === 'primeiro_emprego' ? 'selected' : ''}>🌟 Primeiro Emprego / Jovem Aprendiz</option>
            </select>
          </div>
          <div>
            <label for="select-tipo-oportunidade" class="block text-xs font-bold text-slate-800 mb-1">Tipo de Vaga Pretendida</label>
            <select 
              id="select-tipo-oportunidade" 
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-[#009B3A] outline-none bg-white"
              onchange="window.cvApp.updateField('tipoOportunidade', this.value)"
            >
              <option value="CLT" ${d.tipoOportunidade === 'CLT' ? 'selected' : ''}>Efetivo (CLT)</option>
              <option value="Estágio" ${d.tipoOportunidade === 'Estágio' ? 'selected' : ''}>Estágio</option>
              <option value="Jovem Aprendiz" ${d.tipoOportunidade === 'Jovem Aprendiz' ? 'selected' : ''}>Jovem Aprendiz</option>
              <option value="PJ / Autônomo" ${d.tipoOportunidade === 'PJ / Autônomo' ? 'selected' : ''}>Prestador de Serviços (PJ / Autônomo)</option>
            </select>
          </div>
        </div>

        <div>
          <div class="flex justify-between items-center mb-1">
            <label for="textarea-objetivo" class="block text-xs font-bold text-slate-800">Texto do Objetivo Profissional</label>
            <span class="text-[11px] text-slate-500">1 a 3 linhas são suficientes</span>
          </div>
          <textarea 
            id="textarea-objetivo" 
            rows="3" 
            placeholder="Ex: Atuar na área administrativa, aplicando organização e domínio de ferramentas de informática para otimizar rotinas da equipe." 
            class="w-full p-3 rounded-xl border border-slate-300 text-sm focus:border-[#009B3A] focus:ring-2 focus:ring-[#009B3A]/20 outline-none leading-relaxed"
            oninput="window.cvApp.updateField('objetivoProfissional', this.value)"
          >${escapeHtml(d.objetivoProfissional)}</textarea>
        </div>

        <!-- Assistente de Sugestões de Objetivo em 1 Clique -->
        <div class="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
          <div class="text-xs font-extrabold text-[#002776] flex items-center gap-1.5">
            <i data-lucide="sparkles" class="w-3.5 h-3.5 text-amber-500"></i>
            <span>Sugestões Prontas para Inserir em 1 Clique:</span>
          </div>
          <div class="flex flex-wrap gap-1.5">
            ${Object.entries(WRITING_ASSISTANT_DATA.objectiveTemplates).map(([label, text]) => `
              <button 
                type="button" 
                class="px-2.5 py-1 bg-white hover:bg-blue-100 text-[#002776] text-xs font-bold rounded-lg border border-blue-200 transition-colors cursor-pointer text-left"
                onclick="window.cvApp.setObjectiveSuggestion('${label}')"
              >
                + ${escapeHtml(label)}
              </button>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  // ------------------------------------------------------------------------------
  // ETAPA 3: RESUMO PROFISSIONAL
  // ------------------------------------------------------------------------------
  function renderStep3(d) {
    return `
      <div class="space-y-4">
        <div>
          <div class="flex justify-between items-center mb-1">
            <label for="textarea-resumo" class="block text-xs font-bold text-slate-800">Apresentação Profissional</label>
            <span class="text-[11px] text-slate-500">Destaque sua experiência ou sua dedicação</span>
          </div>
          <textarea 
            id="textarea-resumo" 
            rows="4" 
            placeholder="Ex: Profissional focado em rotinas administrativas e atendimento a clientes, com facilidade no manuseio de planilhas e boa comunicação interpessoal..." 
            class="w-full p-3 rounded-xl border border-slate-300 text-sm focus:border-[#009B3A] focus:ring-2 focus:ring-[#009B3A]/20 outline-none leading-relaxed"
            oninput="window.cvApp.updateField('resumoProfissional', this.value)"
          >${escapeHtml(d.resumoProfissional)}</textarea>
        </div>

        <!-- Sugestões de Resumo por Perfil -->
        <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
          <div class="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
            <i data-lucide="edit-3" class="w-3.5 h-3.5 text-[#009B3A]"></i>
            <span>Modelos Prontos para Adaptar com Seus Dados:</span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            ${Object.entries(WRITING_ASSISTANT_DATA.summaryTemplates).map(([label, text]) => `
              <div class="p-2.5 bg-white border border-slate-200 rounded-lg hover:border-[#009B3A] transition-all">
                <div class="flex justify-between items-center mb-1">
                  <span class="text-[11px] font-bold text-[#002776] uppercase">${escapeHtml(label)}</span>
                  <button 
                    type="button" 
                    class="text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer"
                    onclick="window.cvApp.setSummarySuggestion('${label}')"
                  >
                    Usar este ↗
                  </button>
                </div>
                <p class="text-xs text-slate-600 line-clamp-2">${escapeHtml(text)}</p>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Dicas de Redação -->
        <div class="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-slate-700 space-y-1">
          <div class="font-bold text-amber-900 flex items-center gap-1">
            <i data-lucide="lightbulb" class="w-3.5 h-3.5 text-amber-600"></i>
            <span>Dica do Você Pode Tudo:</span>
          </div>
          <p>Nunca invente cursos ou experiências que não realizou. Recrutadores valorizam sinceridade, pontualidade e disposição para aprender.</p>
        </div>
      </div>
    `;
  }

  // ------------------------------------------------------------------------------
  // ETAPA 4: EXPERIÊNCIA PROFISSIONAL
  // ------------------------------------------------------------------------------
  function renderStep4(d) {
    return `
      <div class="space-y-4">
        <div class="flex justify-between items-center">
          <div>
            <h3 class="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Histórico de Experiências</h3>
            <p class="text-[11px] text-slate-500">Se nunca trabalhou com carteira assinada, pode avançar para a próxima etapa.</p>
          </div>
          <button 
            type="button" 
            class="inline-flex items-center gap-1 px-3 py-1.5 bg-[#009B3A] hover:bg-[#00702a] text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer"
            onclick="window.cvApp.addExperience()"
          >
            <i data-lucide="plus" class="w-3.5 h-3.5"></i>
            <span>Adicionar Experiência</span>
          </button>
        </div>

        <div id="experiences-list" class="space-y-3">
          ${(!d.experiencias || d.experiencias.length === 0) ? `
            <div class="p-6 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
              <i data-lucide="briefcase" class="w-8 h-8 text-slate-300 mx-auto mb-2"></i>
              <div class="text-xs font-bold text-slate-700">Nenhuma experiência cadastrada ainda</div>
              <p class="text-[11px] text-slate-500 mt-1">Clique no botão verde acima para adicionar uma experiência, ou avance caso busque o primeiro emprego.</p>
            </div>
          ` : d.experiencias.map((exp, index) => `
            <div class="p-4 bg-white border border-slate-200 rounded-xl shadow-sm space-y-3 relative group">
              <div class="flex justify-between items-center border-b border-slate-100 pb-2">
                <span class="text-xs font-extrabold text-slate-800">Experiência #${index + 1}</span>
                <div class="flex items-center gap-1">
                  ${index > 0 ? `
                    <button type="button" class="p-1 text-slate-400 hover:text-slate-700" onclick="window.cvApp.moveExperience(${index}, -1)" title="Mover para cima">
                      <i data-lucide="arrow-up" class="w-3.5 h-3.5"></i>
                    </button>
                  ` : ''}
                  ${index < d.experiencias.length - 1 ? `
                    <button type="button" class="p-1 text-slate-400 hover:text-slate-700" onclick="window.cvApp.moveExperience(${index}, 1)" title="Mover para baixo">
                      <i data-lucide="arrow-down" class="w-3.5 h-3.5"></i>
                    </button>
                  ` : ''}
                  <button type="button" class="p-1 text-rose-500 hover:text-rose-700" onclick="window.cvApp.removeExperience(${index})" title="Remover experiência">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                  </button>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block text-[11px] font-bold text-slate-700 mb-0.5">Empresa / Organização</label>
                  <input 
                    type="text" 
                    value="${escapeHtml(exp.empresa)}" 
                    placeholder="Ex: Magazine Luiza, Padaria Estrela..." 
                    class="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:border-[#009B3A] outline-none"
                    oninput="window.cvApp.updateExperienceField(${index}, 'empresa', this.value)"
                  >
                </div>
                <div>
                  <label class="block text-[11px] font-bold text-slate-700 mb-0.5">Cargo / Função</label>
                  <input 
                    type="text" 
                    value="${escapeHtml(exp.cargo)}" 
                    placeholder="Ex: Operador de Caixa / Atendente..." 
                    class="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:border-[#009B3A] outline-none"
                    oninput="window.cvApp.updateExperienceField(${index}, 'cargo', this.value)"
                  >
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label class="block text-[11px] font-bold text-slate-700 mb-0.5">Data Início</label>
                  <input 
                    type="text" 
                    value="${escapeHtml(exp.dataInicio)}" 
                    placeholder="Ex: Jan/2022 ou 2022" 
                    class="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:border-[#009B3A] outline-none"
                    oninput="window.cvApp.updateExperienceField(${index}, 'dataInicio', this.value)"
                  >
                </div>
                <div>
                  <label class="block text-[11px] font-bold text-slate-700 mb-0.5">Data Término</label>
                  <input 
                    type="text" 
                    value="${escapeHtml(exp.dataTermino)}" 
                    placeholder="Ex: Mar/2024" 
                    ${exp.atual ? 'disabled' : ''}
                    class="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:border-[#009B3A] outline-none disabled:bg-slate-100 disabled:text-slate-400"
                    oninput="window.cvApp.updateExperienceField(${index}, 'dataTermino', this.value)"
                  >
                </div>
                <div class="flex items-center pt-4">
                  <label class="inline-flex items-center gap-1.5 cursor-pointer text-xs font-bold text-slate-700">
                    <input 
                      type="checkbox" 
                      ${exp.atual ? 'checked' : ''}
                      class="rounded text-[#009B3A] focus:ring-[#009B3A]"
                      onchange="window.cvApp.updateExperienceField(${index}, 'atual', this.checked)"
                    >
                    <span>Trabalho atualmente aqui</span>
                  </label>
                </div>
              </div>

              <div>
                <label class="block text-[11px] font-bold text-slate-700 mb-0.5">Descrição das Atividades Principais</label>
                <textarea 
                  rows="2" 
                  placeholder="Descreva o que você realizava no dia a dia..." 
                  class="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:border-[#009B3A] outline-none"
                  oninput="window.cvApp.updateExperienceField(${index}, 'descricao', this.value)"
                >${escapeHtml(exp.descricao)}</textarea>
              </div>

              <div>
                <label class="block text-[11px] font-bold text-slate-700 mb-0.5">Resultados Alcançados ou Diferenciais (Opcional)</label>
                <input 
                  type="text" 
                  value="${escapeHtml(exp.resultados || '')}" 
                  placeholder="Ex: Redução de 20% no tempo de atendimento ou destaque do mês" 
                  class="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:border-[#009B3A] outline-none"
                  oninput="window.cvApp.updateExperienceField(${index}, 'resultados', this.value)"
                >
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // ------------------------------------------------------------------------------
  // ETAPA 5: FORMAÇÃO ACADÊMICA
  // ------------------------------------------------------------------------------
  function renderStep5(d) {
    return `
      <div class="space-y-4">
        <div class="flex justify-between items-center">
          <div>
            <h3 class="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Escolaridade e Formações</h3>
            <p class="text-[11px] text-slate-500">Adicione ensino médio, curso técnico ou graduação superior.</p>
          </div>
          <button 
            type="button" 
            class="inline-flex items-center gap-1 px-3 py-1.5 bg-[#009B3A] hover:bg-[#00702a] text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer"
            onclick="window.cvApp.addEducation()"
          >
            <i data-lucide="plus" class="w-3.5 h-3.5"></i>
            <span>Adicionar Formação</span>
          </button>
        </div>

        <div id="education-list" class="space-y-3">
          ${(!d.formacoes || d.formacoes.length === 0) ? `
            <div class="p-6 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
              <i data-lucide="graduation-cap" class="w-8 h-8 text-slate-300 mx-auto mb-2"></i>
              <div class="text-xs font-bold text-slate-700">Nenhuma formação cadastrada</div>
              <p class="text-[11px] text-slate-500 mt-1">Adicione ao menos o Ensino Médio ou curso em andamento.</p>
            </div>
          ` : d.formacoes.map((f, index) => `
            <div class="p-4 bg-white border border-slate-200 rounded-xl shadow-sm space-y-3">
              <div class="flex justify-between items-center border-b border-slate-100 pb-2">
                <span class="text-xs font-extrabold text-slate-800">Formação #${index + 1}</span>
                <button type="button" class="p-1 text-rose-500 hover:text-rose-700" onclick="window.cvApp.removeEducation(${index})" title="Remover formação">
                  <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block text-[11px] font-bold text-slate-700 mb-0.5">Instituição de Ensino</label>
                  <input 
                    type="text" 
                    value="${escapeHtml(f.instituicao)}" 
                    placeholder="Ex: E.E. Santos Dumont, Senai, USP, Anhembi..." 
                    class="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:border-[#009B3A] outline-none"
                    oninput="window.cvApp.updateEducationField(${index}, 'instituicao', this.value)"
                  >
                </div>
                <div>
                  <label class="block text-[11px] font-bold text-slate-700 mb-0.5">Curso / Nível</label>
                  <input 
                    type="text" 
                    value="${escapeHtml(f.curso)}" 
                    placeholder="Ex: Ensino Médio Completo / Administração..." 
                    class="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:border-[#009B3A] outline-none"
                    oninput="window.cvApp.updateEducationField(${index}, 'curso', this.value)"
                  >
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label class="block text-[11px] font-bold text-slate-700 mb-0.5">Grau</label>
                  <select 
                    class="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:border-[#009B3A] outline-none bg-white"
                    onchange="window.cvApp.updateEducationField(${index}, 'grau', this.value)"
                  >
                    <option value="Ensino Médio" ${f.grau === 'Ensino Médio' ? 'selected' : ''}>Ensino Médio</option>
                    <option value="Técnico" ${f.grau === 'Técnico' ? 'selected' : ''}>Técnico</option>
                    <option value="Tecnólogo" ${f.grau === 'Tecnólogo' ? 'selected' : ''}>Tecnólogo</option>
                    <option value="Graduação" ${f.grau === 'Graduação' ? 'selected' : ''}>Graduação / Bacharelado</option>
                    <option value="Pós-Graduação" ${f.grau === 'Pós-Graduação' ? 'selected' : ''}>Pós-Graduação / Especialização</option>
                  </select>
                </div>
                <div>
                  <label class="block text-[11px] font-bold text-slate-700 mb-0.5">Status</label>
                  <select 
                    class="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:border-[#009B3A] outline-none bg-white"
                    onchange="window.cvApp.updateEducationField(${index}, 'status', this.value)"
                  >
                    <option value="Concluído" ${f.status === 'Concluído' ? 'selected' : ''}>Concluído</option>
                    <option value="Cursando" ${f.status === 'Cursando' ? 'selected' : ''}>Cursando</option>
                    <option value="Interrompido" ${f.status === 'Interrompido' ? 'selected' : ''}>Interrompido</option>
                  </select>
                </div>
                <div>
                  <label class="block text-[11px] font-bold text-slate-700 mb-0.5">Ano Conclusão / Previsão</label>
                  <input 
                    type="text" 
                    value="${escapeHtml(f.dataConclusao || '')}" 
                    placeholder="Ex: 2023 ou Dez/2025" 
                    class="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:border-[#009B3A] outline-none"
                    oninput="window.cvApp.updateEducationField(${index}, 'dataConclusao', this.value)"
                  >
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // ------------------------------------------------------------------------------
  // ETAPA 6: CURSOS E CERTIFICAÇÕES (+ INTEGRAÇÃO COM VOCÊ PODE TUDO)
  // ------------------------------------------------------------------------------
  function renderStep6(d) {
    const suggestedCourses = getSuggestedCoursesForProfile(d.areaProfissional);

    return `
      <div class="space-y-5">
        <div class="flex justify-between items-center">
          <div>
            <h3 class="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Cursos Complementares</h3>
            <p class="text-[11px] text-slate-500">Certificados mostram atualização e proatividade para recrutadores.</p>
          </div>
          <button 
            type="button" 
            class="inline-flex items-center gap-1 px-3 py-1.5 bg-[#009B3A] hover:bg-[#00702a] text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer"
            onclick="window.cvApp.addCourse()"
          >
            <i data-lucide="plus" class="w-3.5 h-3.5"></i>
            <span>Adicionar Curso Manualmente</span>
          </button>
        </div>

        <!-- Seção Integrada: Melhore seu currículo com cursos gratuitos Você Pode Tudo -->
        <div class="p-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200 rounded-2xl shadow-sm space-y-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="w-6 h-6 rounded-lg bg-[#009B3A] text-white flex items-center justify-center text-xs font-black">✓</span>
              <div>
                <h4 class="text-xs font-black text-slate-900">Melhore seu currículo com cursos gratuitos oficiais</h4>
                <p class="text-[11px] text-slate-600">Recomendados especificamente para a área de <strong class="text-emerald-800">${escapeHtml(d.areaProfissional)}</strong>:</p>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            ${suggestedCourses.length === 0 ? `
              <div class="col-span-2 text-xs text-slate-500 italic py-2">
                Conectando ao catálogo de cursos do Você Pode Tudo... Você também pode adicionar cursos manualmente no botão acima.
              </div>
            ` : suggestedCourses.map(sc => `
              <div class="p-2.5 bg-white border border-emerald-100 rounded-xl shadow-xs flex flex-col justify-between">
                <div>
                  <div class="text-xs font-bold text-slate-900 line-clamp-1">${escapeHtml(sc.title)}</div>
                  <div class="text-[11px] text-slate-500 mt-0.5">${escapeHtml(sc.provider)} ${sc.workloadHours ? `• ${sc.workloadHours}h` : ''}</div>
                  ${sc.hasFreeCertificate ? `
                    <span class="inline-block mt-1 px-1.5 py-0.2 rounded text-[10px] font-black bg-emerald-100 text-emerald-800">
                      Certificado Gratuito
                    </span>
                  ` : ''}
                </div>
                <div class="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <a href="${escapeHtml(sc.url)}" target="_blank" rel="noopener" class="text-[11px] text-blue-600 hover:underline flex items-center gap-1">
                    <span>Ver curso</span>
                    <i data-lucide="external-link" class="w-3 h-3"></i>
                  </a>
                  <button 
                    type="button" 
                    class="text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded-md transition-colors cursor-pointer"
                    onclick="window.cvApp.addCatalogCourseToCurriculo('${escapeHtml(sc.title).replace(/'/g, "\\'")}', '${escapeHtml(sc.provider).replace(/'/g, "\\'")}', ${sc.workloadHours || 0})"
                  >
                    + Adicionar ao Currículo
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Lista de Cursos Cadastrados -->
        <div id="courses-list" class="space-y-3">
          ${(!d.cursos || d.cursos.length === 0) ? `
            <div class="p-5 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50">
              <span class="text-xs font-bold text-slate-600">Nenhum curso cadastrado ainda.</span>
              <span class="text-xs text-slate-500 block mt-0.5">Use as sugestões gratuitas acima ou adicione manualmente.</span>
            </div>
          ` : d.cursos.map((c, index) => `
            <div class="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm space-y-2.5">
              <div class="flex justify-between items-center border-b border-slate-100 pb-1.5">
                <span class="text-xs font-bold text-slate-800">Curso #${index + 1}</span>
                <button type="button" class="p-1 text-rose-500 hover:text-rose-700" onclick="window.cvApp.removeCourse(${index})" title="Remover curso">
                  <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label class="block text-[11px] font-bold text-slate-700 mb-0.5">Nome do Curso</label>
                  <input 
                    type="text" 
                    value="${escapeHtml(c.nome)}" 
                    placeholder="Ex: Excel do Básico ao Avançado" 
                    class="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:border-[#009B3A] outline-none"
                    oninput="window.cvApp.updateCourseField(${index}, 'nome', this.value)"
                  >
                </div>
                <div>
                  <label class="block text-[11px] font-bold text-slate-700 mb-0.5">Instituição / Plataforma</label>
                  <input 
                    type="text" 
                    value="${escapeHtml(c.instituicao)}" 
                    placeholder="Ex: Fundação Bradesco, SENAI..." 
                    class="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:border-[#009B3A] outline-none"
                    oninput="window.cvApp.updateCourseField(${index}, 'instituicao', this.value)"
                  >
                </div>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label class="block text-[11px] font-bold text-slate-700 mb-0.5">Carga Horária (horas)</label>
                  <input 
                    type="number" 
                    value="${c.cargaHoraria || ''}" 
                    placeholder="Ex: 40" 
                    class="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:border-[#009B3A] outline-none"
                    oninput="window.cvApp.updateCourseField(${index}, 'cargaHoraria', this.value)"
                  >
                </div>
                <div>
                  <label class="block text-[11px] font-bold text-slate-700 mb-0.5">Ano de Conclusão</label>
                  <input 
                    type="text" 
                    value="${escapeHtml(c.anoConclusao || '')}" 
                    placeholder="Ex: 2024" 
                    class="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:border-[#009B3A] outline-none"
                    oninput="window.cvApp.updateCourseField(${index}, 'anoConclusao', this.value)"
                  >
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // ------------------------------------------------------------------------------
  // ETAPA 7: HABILIDADES E COMPETÊNCIAS
  // ------------------------------------------------------------------------------
  function renderStep7(d) {
    const AREA_SPECIFIC_SKILLS = {
      saude: [
        'Aferição de Sinais Vitais (PA/Glicemia)', 'Primeiros Socorros', 'Acolhimento Humanizado',
        'Normas de Biossegurança (ANVISA)', 'Cuidados com Idosos e Acamados', 'Administração de Medicamentos',
        'Controle de Prontuários e Fichas', 'Higienização e Assepsia', 'Curativos Básicos', 'Empatia e Escuta Ativa'
      ],
      educacao: [
        'Planejamento Pedagógico', 'Didática em Sala de Aula', 'Mediação de Conflitos',
        'Inclusão Escolar (Libras/AEE)', 'Tecnologia Educacional', 'BNCC e Metodologias Ativas', 'Comunicação Empática'
      ],
      rh: [
        'Recrutamento e Seleção', 'Entrevistas por Competência', 'Rotinas de DP e Ponto',
        'eSocial Básico', 'Integração de Novos Colaboradores', 'Comunicação Interna', 'Gestão de Clima'
      ],
      marketing: [
        'Gestão de Redes Sociais', 'Criação de Conteúdo (Canva)', 'Copywriting e Redação',
        'Marketing Digital', 'Google Ads / Meta Ads', 'Edição de Vídeo Mobile', 'Análise de Métricas'
      ],
      hotelaria_gastronomia: [
        'Boas Práticas de Manipulação (RDC 216)', 'Preparo de Alimentos e Mise en Place',
        'Atendimento de Salão e Balcão', 'Controle de Validades (PEPS)', 'Higiene e Sanitização'
      ],
      seguranca: [
        'Controle de Acesso de Pedestres e Veículos', 'CFTV e Monitoramento', 'Rondas Preventivas',
        'Prevenção e Combate a Incêndios', 'Comunicação via Rádio HT', 'Atendimento Cordial e Firme'
      ],
      tecnologia: [
        'Lógica de Programação', 'JavaScript / TypeScript', 'Python', 'Git e GitHub',
        'Bancos de Dados SQL', 'Suporte Técnico e Redes', 'HTML5 / CSS3'
      ],
      administrativo: [
        'Microsoft Excel Avançado', 'Pacote Office Completo', 'Controle Financeiro e Fluxo de Caixa',
        'Emissão de Notas Fiscais', 'Organização de Arquivos e Documentos', 'Comunicação Assertiva'
      ],
      comercial: [
        'Vendas Consultivas', 'Negociação e Fechamento', 'Atendimento ao Cliente',
        'Pós-venda e Fidelização', 'CRM e Gestão de Carteira', 'Comunicação Persuasiva'
      ],
      operacional: [
        'Organização de Estoque e Almoxarifado', 'Logística e Expedição', 'Normas Regulamentadoras (NRs)',
        'Operação de Equipamentos', 'Foco em Qualidade e Segurança', 'Trabalho em Equipe'
      ],
      primeiro_emprego: [
        'Pacote Office Básico', 'Comunicação Interpessoal', 'Vontade e Facilidade de Aprender',
        'Pontualidade e Responsabilidade', 'Trabalho em Equipe', 'Organização Pessoal'
      ]
    };

    const areaSkills = AREA_SPECIFIC_SKILLS[d.areaProfissional] || AREA_SPECIFIC_SKILLS.saude || AREA_SPECIFIC_SKILLS.administrativo;
    const universalSkills = ['Trabalho em Equipe', 'Comunicação Clara', 'Pontualidade', 'Resolução de Problemas', 'Ética Profissional', 'Microsoft Excel'];

    return `
      <div class="space-y-4">
        <div>
          <label for="input-nova-habilidade" class="block text-xs font-bold text-slate-800 mb-1">Adicionar Nova Habilidade</label>
          <div class="flex gap-2">
            <input 
              type="text" 
              id="input-nova-habilidade" 
              placeholder="Digite uma competência e aperte Enter..." 
              class="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-[#009B3A] focus:ring-2 focus:ring-[#009B3A]/20 outline-none"
              onkeydown="if(event.key === 'Enter'){ event.preventDefault(); window.cvApp.addSkillFromInput(); }"
            >
            <button 
              type="button" 
              class="px-4 py-2.5 bg-[#009B3A] text-white text-xs font-bold rounded-xl shadow-sm hover:bg-[#00702a] transition-all cursor-pointer"
              onclick="window.cvApp.addSkillFromInput()"
            >
              Adicionar
            </button>
          </div>
        </div>

        <!-- Habilidades Atuais -->
        <div>
          <h4 class="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">Habilidades no Currículo (${d.habilidades.length})</h4>
          <div class="flex flex-wrap gap-2 min-h-[48px] p-3 bg-slate-50 border border-slate-200 rounded-xl">
            ${(!d.habilidades || d.habilidades.length === 0) ? `
              <span class="text-xs text-slate-400 italic">Nenhuma habilidade adicionada ainda. Clique nas sugestões abaixo para adicionar rapidamente.</span>
            ` : d.habilidades.map((h, index) => `
              <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-300 text-slate-800 text-xs font-bold rounded-lg shadow-2xs">
                <span>${escapeHtml(h.nome)}</span>
                <button type="button" class="text-slate-400 hover:text-rose-500 font-black cursor-pointer" onclick="window.cvApp.removeSkill(${index})">×</button>
              </span>
            `).join('')}
          </div>
        </div>

        <!-- Sugestões em 1 Clique Específicas da Área Selecionada -->
        <div class="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
          <div class="text-xs font-extrabold text-[#005e24] flex items-center justify-between">
            <span class="flex items-center gap-1.5">
              <i data-lucide="sparkles" class="w-3.5 h-3.5 text-[#009639]"></i>
              <span>Sugestões Fortes para a sua Área (${escapeHtml(d.areaProfissional)}):</span>
            </span>
            <span class="text-[10px] text-emerald-800 font-bold">1 Clique para Inserir</span>
          </div>
          <div class="flex flex-wrap gap-1.5">
            ${areaSkills.map(s => `
              <button 
                type="button" 
                class="px-2.5 py-1 bg-white hover:bg-emerald-100 text-[#005e24] text-xs font-bold rounded-lg border border-emerald-300 transition-colors cursor-pointer"
                onclick="window.cvApp.addSkill('${s}')"
              >
                + ${s}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Sugestões Gerais Universais -->
        <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <div class="text-xs font-bold text-slate-700">Competências Gerais mais valorizadas pelo RH:</div>
          <div class="flex flex-wrap gap-1.5">
            ${universalSkills.map(s => `
              <button 
                type="button" 
                class="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition-colors cursor-pointer"
                onclick="window.cvApp.addSkill('${s}')"
              >
                + ${s}
              </button>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  // ------------------------------------------------------------------------------
  // ETAPA 8: PROJETOS E ATIVIDADES COMPLEMENTARES
  // ------------------------------------------------------------------------------
  function renderStep8(d) {
    return `
      <div class="space-y-4">
        <div class="flex justify-between items-center">
          <div>
            <h3 class="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Projetos, Voluntariado e Portfólio</h3>
            <p class="text-[11px] text-slate-500">Destaque atividades práticas, projetos acadêmicos ou serviços voluntários.</p>
          </div>
          <button 
            type="button" 
            class="inline-flex items-center gap-1 px-3 py-1.5 bg-[#009B3A] hover:bg-[#00702a] text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer"
            onclick="window.cvApp.addProject()"
          >
            <i data-lucide="plus" class="w-3.5 h-3.5"></i>
            <span>Adicionar Projeto</span>
          </button>
        </div>

        <div id="projects-list" class="space-y-3">
          ${(!d.projetos || d.projetos.length === 0) ? `
            <div class="p-6 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
              <i data-lucide="folder-git-2" class="w-8 h-8 text-slate-300 mx-auto mb-2"></i>
              <div class="text-xs font-bold text-slate-700">Nenhum projeto cadastrado (Opcional)</div>
              <p class="text-[11px] text-slate-500 mt-1">Se você não tem projetos complementares, pode avançar para a revisão final.</p>
            </div>
          ` : d.projetos.map((p, index) => `
            <div class="p-4 bg-white border border-slate-200 rounded-xl shadow-sm space-y-3">
              <div class="flex justify-between items-center border-b border-slate-100 pb-2">
                <span class="text-xs font-extrabold text-slate-800">Item #${index + 1}</span>
                <button type="button" class="p-1 text-rose-500 hover:text-rose-700" onclick="window.cvApp.removeProject(${index})">
                  <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block text-[11px] font-bold text-slate-700 mb-0.5">Título do Projeto / Atividade</label>
                  <input 
                    type="text" 
                    value="${escapeHtml(p.titulo)}" 
                    placeholder="Ex: Trabalho Voluntário na Cruz Vermelha" 
                    class="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:border-[#009B3A] outline-none"
                    oninput="window.cvApp.updateProjectField(${index}, 'titulo', this.value)"
                  >
                </div>
                <div>
                  <label class="block text-[11px] font-bold text-slate-700 mb-0.5">Tipo</label>
                  <select 
                    class="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:border-[#009B3A] outline-none bg-white"
                    onchange="window.cvApp.updateProjectField(${index}, 'tipo', this.value)"
                  >
                    <option value="Voluntariado" ${p.tipo === 'Voluntariado' ? 'selected' : ''}>Voluntariado</option>
                    <option value="Projeto Pessoal" ${p.tipo === 'Projeto Pessoal' ? 'selected' : ''}>Projeto Pessoal / Freelancer</option>
                    <option value="Acadêmico" ${p.tipo === 'Acadêmico' ? 'selected' : ''}>Projeto Acadêmico / Extensão</option>
                    <option value="Publicação" ${p.tipo === 'Publicação' ? 'selected' : ''}>Publicação / Artigo</option>
                  </select>
                </div>
              </div>

              <div>
                <label class="block text-[11px] font-bold text-slate-700 mb-0.5">Descrição</label>
                <textarea 
                  rows="2" 
                  placeholder="Explique o que você fez e qual foi o resultado..." 
                  class="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:border-[#009B3A] outline-none"
                  oninput="window.cvApp.updateProjectField(${index}, 'descricao', this.value)"
                >${escapeHtml(p.descricao)}</textarea>
              </div>

              <div>
                <label class="block text-[11px] font-bold text-slate-700 mb-0.5">Link / Evidência (Opcional)</label>
                <input 
                  type="url" 
                  value="${escapeHtml(p.link || '')}" 
                  placeholder="https://..." 
                  class="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:border-[#009B3A] outline-none"
                  oninput="window.cvApp.updateProjectField(${index}, 'link', this.value)"
                >
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Campo Opcional de Acessibilidade / PCD -->
        <div class="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 mt-4">
          <div class="flex items-center gap-2">
            <i data-lucide="accessibility" class="w-4 h-4 text-[#002776]"></i>
            <span class="text-xs font-extrabold text-slate-800">Adaptações Profissionais ou Acessibilidade (Opcional)</span>
          </div>
          <p class="text-[11px] text-slate-600">
            Totalmente opcional. Caso necessite de alguma adaptação de trabalho (ex: leitor de tela, rampa de acesso, trabalho remoto), você pode mencionar aqui de forma sucinta.
          </p>
          <input 
            type="text" 
            value="${escapeHtml(d.adaptacaoAcessibilidade || '')}" 
            placeholder="Ex: Usuário de leitor de tela NVDA / Preferência por comunicação acessível..." 
            class="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:border-[#009B3A] outline-none"
            oninput="window.cvApp.updateField('adaptacaoAcessibilidade', this.value)"
          >
        </div>
      </div>
    `;
  }

  // ------------------------------------------------------------------------------
  // ETAPA 9: REVISÃO FINAL E EXPORTAÇÃO
  // ------------------------------------------------------------------------------
  function renderStep9(d) {
    const audit = auditCurriculo(d);

    return `
      <div class="space-y-5">
        <!-- Card de Qualidade / Auditoria -->
        <div class="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-xs font-black text-slate-900 uppercase tracking-wider">Verificador de Currículo — Você Pode Tudo</h3>
              <p class="text-[11px] text-slate-500">Auditoria orientativa de completude e legibilidade profissional.</p>
            </div>
            <div class="text-right">
              <span class="text-2xl font-black ${audit.score >= 80 ? 'text-[#009B3A]' : 'text-amber-600'}">${audit.score}%</span>
              <span class="text-[10px] text-slate-400 block font-bold">Completo</span>
            </div>
          </div>

          <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div class="bg-[#009B3A] h-2 rounded-full transition-all duration-500" style="width: ${audit.score}%"></div>
          </div>

          <div class="space-y-1.5 pt-2">
            ${audit.checks.map(c => `
              <div class="flex items-start gap-2 text-xs">
                <span class="${c.ok ? 'text-emerald-600 font-bold' : 'text-amber-500 font-bold'}">
                  ${c.ok ? '✓' : '○'}
                </span>
                <div class="flex-1">
                  <span class="${c.ok ? 'text-slate-800 font-medium' : 'text-slate-600 font-semibold'}">${escapeHtml(c.label)}</span>
                  ${!c.ok ? `<p class="text-[11px] text-amber-700 mt-0.5">${escapeHtml(c.tip)}</p>` : ''}
                </div>
              </div>
            `).join('')}
          </div>

          <div class="p-2.5 bg-slate-50 rounded-xl text-[11px] text-slate-500">
            * Nota: A verificação analisa apenas a estrutura e presença de informações essenciais. Nunca garantimos contratação, mas um currículo organizado abre portas!
          </div>
        </div>

        <!-- Botões de Ação Principal -->
        <div class="p-4 bg-gradient-to-br from-emerald-500 to-[#009B3A] text-white rounded-2xl shadow-md space-y-3">
          <div class="flex items-center gap-2">
            <i data-lucide="download" class="w-5 h-5 text-[#FFDF00]"></i>
            <div>
              <h4 class="text-sm font-black text-white">Seu currículo está pronto para baixar!</h4>
              <p class="text-xs text-emerald-100">Sem marcas-d'água, sem cobrança e pronto para envio em processos seletivos.</p>
            </div>
          </div>

          <button 
            type="button" 
            id="btn-export-pdf" 
            class="w-full py-3 px-4 bg-white hover:bg-slate-50 text-[#002776] hover:text-black font-black text-sm rounded-xl shadow transition-all cursor-pointer flex items-center justify-center gap-2"
            onclick="window.cvApp.exportCurriculoToPdf()"
          >
            <i data-lucide="file-down" class="w-4 h-4 text-emerald-600"></i>
            <span>Baixar Meu Currículo em PDF Grátis</span>
          </button>

          <button 
            type="button" 
            id="btn-whatsapp-export" 
            class="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-xl shadow transition-all cursor-pointer flex items-center justify-center gap-2"
            onclick="window.cvApp.shareCurriculoWhatsApp()"
          >
            <svg class="w-4 h-4 fill-current text-white" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            <span>Enviar Resumo do Currículo no WhatsApp</span>
          </button>

          <div class="flex justify-between items-center text-xs text-emerald-100 pt-1">
            <button type="button" class="hover:underline flex items-center gap-1 cursor-pointer" onclick="window.print()">
              <i data-lucide="printer" class="w-3.5 h-3.5"></i>
              <span>Imprimir diretamente</span>
            </button>
            <button type="button" class="hover:underline flex items-center gap-1 cursor-pointer" onclick="window.cvApp.exportAsJson()">
              <i data-lucide="save" class="w-3.5 h-3.5"></i>
              <span>Salvar Backup (.JSON)</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // ==============================================================================
  // GALERIA DE MODELOS MODAL / SELECTOR
  // ==============================================================================
  function renderGalleryModal() {
    const galleryGrid = document.getElementById('gallery-cards-grid');
    if (!galleryGrid) return;

    galleryGrid.innerHTML = TEMPLATES_CATALOG.map(tpl => `
      <div class="border ${tpl.id === state.activeTemplate ? 'border-[#009B3A] ring-2 ring-[#009B3A]/20' : 'border-slate-200'} bg-white rounded-2xl p-3.5 flex flex-col justify-between hover:shadow-md transition-all">
        <div>
          <!-- Miniatura Fiel do Layout -->
          <div class="tpl-mini-card mb-3 cursor-pointer" onclick="window.cvApp.previewTemplateSample(${tpl.id})">
            ${renderMiniaturePreview(tpl.id)}
          </div>
          <div class="flex items-center justify-between mb-1">
            <span class="text-xs font-black text-slate-900">${escapeHtml(tpl.name)}</span>
            <span class="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-slate-100 text-slate-700">${escapeHtml(tpl.tag)}</span>
          </div>
          <p class="text-[11px] text-slate-500 line-clamp-2 mb-2">${escapeHtml(tpl.desc)}</p>
          <div class="text-[10px] text-slate-400 font-semibold mb-3">
            <strong>Indicado para:</strong> ${escapeHtml(tpl.targetProfile)}
          </div>
        </div>

        <div class="flex gap-2 pt-2 border-t border-slate-100">
          <button 
            type="button" 
            class="flex-1 py-1.5 px-2 rounded-lg text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            onclick="window.cvApp.previewTemplateSample(${tpl.id})"
          >
            Visualizar
          </button>
          <button 
            type="button" 
            class="flex-1 py-1.5 px-2 rounded-lg text-xs font-bold ${tpl.id === state.activeTemplate ? 'bg-[#009B3A] text-white' : 'bg-[#002776] text-white hover:bg-blue-950'} transition-colors cursor-pointer"
            onclick="window.cvApp.selectTemplate(${tpl.id})"
          >
            ${tpl.id === state.activeTemplate ? 'Selecionado' : 'Usar este'}
          </button>
        </div>
      </div>
    `).join('');
  }

  function renderMiniaturePreview(id) {
    switch (id) {
      case 1:
        return `
          <div class="tpl-mini-line primary w-1/2 mx-auto"></div>
          <div class="tpl-mini-line w-2/3 mx-auto mb-3"></div>
          <div class="tpl-mini-line dark w-1/3"></div>
          <div class="tpl-mini-line w-full"></div>
          <div class="tpl-mini-line w-4/5 mb-3"></div>
          <div class="tpl-mini-line dark w-1/3"></div>
          <div class="tpl-mini-line w-full"></div>
          <div class="tpl-mini-line w-3/4"></div>
        `;
      case 2:
        return `
          <div class="bg-blue-900 p-1 rounded mb-2">
            <div class="tpl-mini-line w-2/3" style="background:#fff"></div>
            <div class="tpl-mini-line w-1/2" style="background:#93c5fd"></div>
          </div>
          <div class="tpl-mini-line primary w-1/4"></div>
          <div class="tpl-mini-line w-full"></div>
          <div class="tpl-mini-line w-5/6 mb-2"></div>
          <div class="tpl-mini-line primary w-1/4"></div>
          <div class="tpl-mini-line w-full"></div>
        `;
      case 3:
        return `
          <div class="tpl-mini-line secondary w-1/2"></div>
          <div class="bg-emerald-50 border-l-2 border-emerald-500 p-1 mb-2">
            <div class="tpl-mini-line w-full" style="background:#10b981"></div>
          </div>
          <div class="tpl-mini-line secondary w-1/3"></div>
          <div class="tpl-mini-line w-full"></div>
          <div class="tpl-mini-line w-4/5 mb-2"></div>
          <div class="flex gap-1"><span class="tpl-mini-line w-1/4"></span><span class="tpl-mini-line w-1/4"></span></div>
        `;
      case 4:
        return `
          <div class="font-mono text-[6px] font-bold text-slate-800">> dev_name</div>
          <div class="tpl-mini-line w-1/3 mb-2" style="background:#2563eb"></div>
          <div class="flex gap-0.5 mb-2"><span class="bg-slate-200 px-1 rounded text-[5px]">code</span><span class="bg-slate-200 px-1 rounded text-[5px]">git</span></div>
          <div class="tpl-mini-line w-full"></div>
          <div class="tpl-mini-line w-3/4"></div>
        `;
      case 8:
        return `
          <div class="border-l-2 border-black pl-1 mb-2">
            <div class="text-[8px] font-black">DESIGN</div>
          </div>
          <div class="border border-black p-1 mb-2">
            <div class="tpl-mini-line dark w-1/2"></div>
          </div>
          <div class="tpl-mini-line dark w-full"></div>
        `;
      case 12:
        return `
          <div class="text-[7px] font-black border-b-2 border-black pb-0.5 mb-1">NOME</div>
          <div class="tpl-mini-line dark w-1/2 mb-2"></div>
          <div class="border-l-2 border-black pl-1 mb-1 font-bold text-[5px]">EXPERIÊNCIA</div>
          <div class="tpl-mini-line dark w-full"></div>
          <div class="tpl-mini-line dark w-4/5"></div>
        `;
      default:
        return `
          <div class="tpl-mini-line dark w-1/2 mb-2"></div>
          <div class="tpl-mini-line w-full"></div>
          <div class="tpl-mini-line w-4/5 mb-2"></div>
          <div class="tpl-mini-line primary w-1/3"></div>
          <div class="tpl-mini-line w-full"></div>
        `;
    }
  }

  // ==============================================================================
  // DADOS DE EXEMPLO (1-CLIQUE PARA DEMONSTRAÇÃO E TESTES)
  // ==============================================================================
  function loadSampleData(chosenArea) {
    const area = chosenArea || state.curriculo.areaProfissional || 'saude';

    if (area === 'saude') {
      state.curriculo = {
        nome: 'Camila Fernandes de Oliveira',
        cidade: 'São Paulo',
        estado: 'SP',
        telefone: '(11) 98765-4321',
        email: 'camila.enfermagem@email.com',
        linkedin: 'https://linkedin.com/in/camila-oliveira-saude',
        portfolio: '',
        github: '',
        adaptacaoAcessibilidade: '',
        cargoDesejado: 'Técnica de Enfermagem / Cuidadora de Idosos',
        areaProfissional: 'saude',
        tipoOportunidade: 'CLT',
        objetivoProfissional: 'Atuar na área da saúde como Técnica de Enfermagem ou Cuidadora, prestando assistência humanizada, aferição precisa de sinais vitais, administração responsável de cuidados prescritos e rigorosa observância às normas de biossegurança.',
        resumoProfissional: 'Profissional com formação técnica em Enfermagem (COREN ativo) e mais de 3 anos de vivência no acolhimento de pacientes, rotinas de enfermagem, cuidados geriátricos diários, controle de medicação e suporte à equipe multiprofissional. Postura empática, ética e facilidade de atuação em equipe.',
        experiencias: [
          {
            id: generateId(),
            empresa: 'Residencial Terapêutico & Cuidados Viva Bem',
            cargo: 'Técnica de Enfermagem e Cuidadora',
            localidade: 'São Paulo - SP',
            dataInicio: 'Mar/2023',
            dataTermino: '',
            atual: true,
            descricao: 'Acompanhamento assistencial a pacientes idosos e acamados, administração de medicações prescritas, aferição de sinais vitais (PA, glicemia e oximetria), higienização e auxílio na mobilidade e alimentação.',
            resultados: 'Elogiada pela coordenação e familiares pelo acolhimento caloroso e redução a zero de incidentes de medicação no turno.'
          },
          {
            id: generateId(),
            empresa: 'Hospital e Maternidade São Lucas',
            cargo: 'Estagiária Técnica de Enfermagem',
            localidade: 'São Paulo - SP',
            dataInicio: 'Jan/2022',
            dataTermino: 'Dez/2022',
            atual: false,
            descricao: 'Apoio à triagem de pacientes no pronto atendimento, realização de curativos simples, checagem e organização de prontuários médicos e reposição de insumos hospitalares.',
            resultados: 'Concluiu o estágio com nota máxima na avaliação de desempenho do corpo de enfermagem.'
          }
        ],
        formacoes: [
          {
            id: generateId(),
            instituicao: 'Escola Técnica Estadual de Saúde',
            curso: 'Técnico em Enfermagem (COREN Ativo)',
            grau: 'Técnico',
            dataInicio: '2021',
            dataConclusao: '2022',
            status: 'Concluído'
          },
          {
            id: generateId(),
            instituicao: 'E.E. Cecília Meireles',
            curso: 'Ensino Médio Regular',
            grau: 'Ensino Médio',
            dataInicio: '2018',
            dataConclusao: '2020',
            status: 'Concluído'
          }
        ],
        cursos: [
          {
            id: generateId(),
            nome: 'Primeiros Socorros e Suporte Básico de Vida (BLS)',
            instituicao: 'Fundação Oswaldo Cruz (Fiocruz / SUS)',
            cargaHoraria: 40,
            anoConclusao: '2023',
            linkCertificado: ''
          },
          {
            id: generateId(),
            nome: 'Cuidados com a Pessoa Idosa e Biossegurança Hospitalar',
            instituicao: 'Fundação Bradesco (Escola Virtual)',
            cargaHoraria: 30,
            anoConclusao: '2024',
            linkCertificado: ''
          }
        ],
        habilidades: [
          { id: generateId(), nome: 'Aferição de Sinais Vitais (PA/Glicemia)' },
          { id: generateId(), nome: 'Acolhimento Humanizado' },
          { id: generateId(), nome: 'Normas de Biossegurança (ANVISA)' },
          { id: generateId(), nome: 'Cuidados com Idosos e Acamados' },
          { id: generateId(), nome: 'Administração de Medicamentos' },
          { id: generateId(), nome: 'Controle de Prontuários' },
          { id: generateId(), nome: 'Empatia e Escuta Ativa' }
        ],
        projetos: [
          {
            id: generateId(),
            titulo: 'Campanha Comunitária de Vacinação e Triagem de Hipertensão',
            tipo: 'Voluntariado',
            descricao: 'Apoio na aferição de pressão arterial e orientação preventiva de saúde para mais de 300 moradores do bairro.',
            link: ''
          }
        ]
      };
    } else {
      // Exemplo Administrativo Padrão
      state.curriculo = {
        nome: 'Mariana Ribeiro dos Santos',
        cidade: 'São Paulo',
        estado: 'SP',
        telefone: '(11) 98765-4321',
        email: 'mariana.santos@email.com',
        linkedin: 'https://linkedin.com/in/mariana-santos-exemplo',
        portfolio: 'https://marianasantos.dev.br',
        github: 'https://github.com/marianasantos',
        adaptacaoAcessibilidade: '',
        cargoDesejado: 'Assistente Administrativa e de Atendimento',
        areaProfissional: 'administrativo',
        tipoOportunidade: 'CLT',
        objetivoProfissional: 'Atuar na área administrativa, aplicando organização, domínio de rotinas de escritório e controle documental para garantir a eficiência dos processos internos da empresa.',
        resumoProfissional: 'Profissional com mais de 3 anos de experiência em atendimento ao público, conferência e organização de planilhas em Excel e rotinas administrativas. Excelente comunicação interpessoal e foco no aprendizado contínuo.',
        experiencias: [
          {
            id: generateId(),
            empresa: 'Comércio e Distribuidora Paulistana Ltda.',
            cargo: 'Auxiliar Administrativa',
            localidade: 'São Paulo - SP',
            dataInicio: 'Jan/2023',
            dataTermino: '',
            atual: true,
            descricao: 'Emissão e conferência de notas fiscais, elaboração de relatórios semanais de vendas e conciliação de pagamentos com fornecedores.',
            resultados: 'Otimizou em 30% o tempo de fechamento dos relatórios através de automação de planilhas.'
          },
          {
            id: generateId(),
            empresa: 'Drogaria e Perfumaria Central',
            cargo: 'Atendente e Operadora de Caixa',
            localidade: 'São Paulo - SP',
            dataInicio: 'Fev/2021',
            dataTermino: 'Dez/2022',
            atual: false,
            descricao: 'Atendimento humanizado aos clientes, registro de compras, controle de estoque básico e fechamento diário do caixa.',
            resultados: 'Elogiada repetidamente na pesquisa de satisfação dos clientes da unidade.'
          }
        ],
        formacoes: [
          {
            id: generateId(),
            instituicao: 'Universidade Cidade de São Paulo',
            curso: 'Processos Gerenciais (Tecnólogo)',
            grau: 'Tecnólogo',
            dataInicio: '2022',
            dataConclusao: '2024',
            status: 'Concluído'
          },
          {
            id: generateId(),
            instituicao: 'E.E. Padre Anchieta',
            curso: 'Ensino Médio Regular',
            grau: 'Ensino Médio',
            dataInicio: '2018',
            dataConclusao: '2020',
            status: 'Concluído'
          }
        ],
        cursos: [
          {
            id: generateId(),
            nome: 'Excel do Básico ao Avançado',
            instituicao: 'Fundação Bradesco (Escola Virtual)',
            cargaHoraria: 40,
            anoConclusao: '2023',
            linkCertificado: ''
          },
          {
            id: generateId(),
            nome: 'Comunicação Empresarial e Redação Oficial',
            instituicao: 'Escola Virtual de Governo (EV.G)',
            cargaHoraria: 20,
            anoConclusao: '2024',
            linkCertificado: ''
          }
        ],
        habilidades: [
          { id: generateId(), nome: 'Microsoft Excel Avançado' },
          { id: generateId(), nome: 'Atendimento ao Cliente' },
          { id: generateId(), nome: 'Rotinas Administrativas' },
          { id: generateId(), nome: 'Emissão de Notas Fiscais' },
          { id: generateId(), nome: 'Comunicação Assertiva' },
          { id: generateId(), nome: 'Organização de Arquivos' }
        ],
        projetos: [
          {
            id: generateId(),
            titulo: 'Campanha de Arrecadação de Agasalhos Comunitária',
            tipo: 'Voluntariado',
            descricao: 'Coordenação logística de arrecadação e triagem de mais de 500 peças de roupas para famílias vulneráveis.',
            link: ''
          }
        ]
      };
    }

    saveToLocalStorage();
    renderCurrentStep();
    updateLivePreview();
    updateAuditView();
    alert('Exemplo profissional (' + (area === 'saude' ? 'Área da Saúde' : 'Administração') + ') carregado com sucesso! Você pode editar qualquer informação nas etapas.');
  }

  function updateAuditView() {
    const audit = auditCurriculo(state.curriculo);
    const scoreBadges = document.querySelectorAll('.cv-score-badge');
    scoreBadges.forEach(b => {
      b.textContent = `${audit.score}%`;
    });

    // Atualização em Tempo Real do Card de Força do Currículo (ATS Score)
    const atsBadge = document.getElementById('ats-score-badge');
    const atsBar = document.getElementById('ats-score-bar');
    const atsTipText = document.getElementById('ats-score-tip-text');

    if (atsBadge && atsBar) {
      let levelLabel = 'Básico';
      let badgeClasses = 'bg-rose-100 text-rose-800 border border-rose-300';
      let barClasses = 'bg-gradient-to-r from-rose-500 to-rose-600 h-2.5 rounded-full transition-all duration-500';

      if (audit.score >= 80) {
        levelLabel = 'Excelente (ATS Ready)';
        badgeClasses = 'bg-emerald-100 text-[#00702a] border border-emerald-300';
        barClasses = 'bg-gradient-to-r from-emerald-500 to-[#009639] h-2.5 rounded-full transition-all duration-500';
      } else if (audit.score >= 50) {
        levelLabel = 'Bom (Intermediário)';
        badgeClasses = 'bg-amber-100 text-amber-900 border border-amber-300';
        barClasses = 'bg-gradient-to-r from-amber-500 to-amber-600 h-2.5 rounded-full transition-all duration-500';
      }

      atsBadge.textContent = `${audit.score}% • ${levelLabel}`;
      atsBadge.className = `px-2.5 py-0.5 rounded-full text-xs font-black transition-colors ${badgeClasses}`;
      atsBar.className = barClasses;
      atsBar.style.width = `${audit.score}%`;

      if (atsTipText) {
        const pendingCheck = audit.checks.find(c => !c.ok);
        if (pendingCheck) {
          atsTipText.textContent = `Dica: ${pendingCheck.tip}`;
        } else {
          atsTipText.textContent = 'Parabéns! Seu currículo atinge 100% dos critérios recomendados para passar nos filtros ATS.';
        }
      }
    }
  }

  // ==============================================================================
  // GERADOR AUTOMÁTICO DE CARTA DE APRESENTAÇÃO PROFISSIONAL
  // ==============================================================================
  let currentCoverLetterType = 'formal';

  function generateCoverLetterText(type = currentCoverLetterType) {
    const c = state.curriculo || {};
    const nome = c.nome ? c.nome.trim() : 'Candidato';
    const cargo = c.cargoDesejado ? c.cargoDesejado.trim() : (c.objetivoProfissional ? c.objetivoProfissional.trim() : 'Oportunidade Profissional');
    const cidade = (c.cidade && c.estado) ? `${c.cidade} - ${c.estado}` : (c.cidade || 'Brasil');
    const email = c.email || '';
    const telefone = c.telefone || '';
    const resumo = c.resumoProfissional ? c.resumoProfissional.trim() : '';

    const skillsText = (c.habilidades && c.habilidades.length > 0) 
      ? c.habilidades.slice(0, 5).join(', ') 
      : 'comunicação assertiva, foco em resultados e colaboração em equipe';

    const cursosText = (c.cursos && c.cursos.length > 0)
      ? c.cursos.slice(0, 3).map(k => `${k.nome} (${k.instituicao})`).join(', ')
      : '';

    const expRecente = (c.experiencias && c.experiencias.length > 0) ? c.experiencias[0] : null;

    let corpoExp = '';
    if (expRecente && expRecente.cargo) {
      corpoExp = `Em minha atuação como ${expRecente.cargo} na empresa ${expRecente.empresa || 'empresa de referência'}, desenvolvi competências sólidas e compromisso com entregas de qualidade. `;
    }

    let corpoCursos = '';
    if (cursosText) {
      corpoCursos = `Buscando aperfeiçoamento constante, realizei qualificações em: ${cursosText}. `;
    }

    const hoje = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });

    // 1. Mensagem para WhatsApp do Recrutador
    if (type === 'whatsapp') {
      return `Olá! Tudo bem? Me chamo ${nome}.

Vi a oportunidade aberta para a posição de *${cargo}* e gostaria muito de me apresentar.

📌 *Resumo do Perfil:*
${resumo ? '• ' + resumo.substring(0, 180) + '...' : '• Profissional dedicado com foco em aprendizado rápido e resultados.'}
• Competências: ${skillsText}
${corpoExp ? '• ' + corpoExp.trim() : ''}

Estou anexando meu currículo completo em PDF para sua avaliação e fico à disposição para uma conversa.

Muito obrigado(a) pela atenção!
${nome}
📱 ${telefone}
✉️ ${email}`;
    }

    // 2. Abordagem para Conexão / Mensagem LinkedIn
    if (type === 'linkedin') {
      return `Olá! Espero que este momento o(a) encontre bem.

Acompanho sua trajetória e o trabalho exemplar de sua organização. Gostaria de me conectar para acompanhar novidades na área de ${cargo}.

Tenho dedicado minha atuação e estudos a ${skillsText}${cursosText ? ' e certificações em ' + cursosText : ''}. Acredito que posso somar à equipe com entusiasmo, proatividade e entrega de valor.

Será uma honra fazer parte da sua rede profissional.

Um abraço cordial,
${nome}`;
    }

    // 3. Modelo Oficial de Carta de Recomendação
    if (type === 'recommendation') {
      return `${cidade}, ${hoje}

CARTA DE RECOMENDAÇÃO PROFISSIONAL

A quem possa interessar,

É com satisfação que apresento esta carta de recomendação em favor de ${nome}, portador(a) dos contatos informados abaixo, que atuou com excelência e dedicação na função de ${expRecente && expRecente.cargo ? expRecente.cargo : cargo}.

Durante o período em que convivemos profissionalmente, ${nome} demonstrou elevado senso de responsabilidade, pontualidade, facilidade de trabalho em equipe e rápida curva de aprendizado, destacando-se em competências como: ${skillsText}.

${corpoExp}Seu comprometimento com o autoaperfeiçoamento e integridade profissional o(a) credenciam como um(a) colaborador(a) de valor para qualquer organização que busque qualidade e dedicação.

Portanto, recomendo seus serviços e postura profissional com total convicção, colocando-me à disposição para prestar esclarecimentos adicionais se necessário.

Atenciosamente,

[Nome do Gestor / Recomendante]
[Cargo / Empresa / Telefone de Contato]

Candidato(a) Recomendado(a):
${nome} - ${cargo}
E-mail: ${email} | Telefone: ${telefone}`;
    }

    // 4. Carta Formal Padrão (E-mail / Anexo Oficial)
    return `${cidade}, ${hoje}

À Equipe de Recrutamento & Seleção,

Assunto: Candidatura à posição de ${cargo}

Prezados(as) Senhores(as),

Apresento meu currículo para expressar meu grande interesse em integrar sua equipe na função de ${cargo}. Acredito que meu perfil profissional, dedicação e facilidade de adaptação podem contribuir diretamente com o alcance das metas da organização.

${resumo ? resumo + '\n\n' : ''}${corpoExp}${corpoCursos}Possuo facilidade para atuar com ${skillsText}, buscando sempre qualidade, responsabilidade e foco no trabalho em equipe.

Coloco-me à disposição para uma entrevista e agradeço antecipadamente pela oportunidade e atenção.

Atenciosamente,

${nome}
${cargo}
Telefone: ${telefone}
E-mail: ${email}`;
  }

  function switchCoverLetterType(type) {
    currentCoverLetterType = type;
    const btnIds = {
      'formal': 'tab-cl-formal',
      'whatsapp': 'tab-cl-whatsapp',
      'linkedin': 'tab-cl-linkedin',
      'recommendation': 'tab-cl-recommendation'
    };

    const indicators = {
      'formal': 'Formatada para e-mail profissional ou anexo oficial',
      'whatsapp': 'Mensagem direta e objetiva para envio no WhatsApp',
      'linkedin': 'Pitch de abordagem para conexão no LinkedIn',
      'recommendation': 'Modelo timbrado para impressão ou envio a recrutador'
    };

    Object.keys(btnIds).forEach(k => {
      const btn = document.getElementById(btnIds[k]);
      if (btn) {
        if (k === type) {
          btn.className = 'cl-type-btn active flex-1 py-1.5 px-2.5 rounded-lg bg-white text-[#002776] shadow-xs cursor-pointer text-center font-black';
        } else {
          btn.className = 'cl-type-btn flex-1 py-1.5 px-2.5 rounded-lg text-slate-600 hover:text-slate-900 cursor-pointer text-center font-bold';
        }
      }
    });

    const indicator = document.getElementById('cl-type-indicator');
    if (indicator && indicators[type]) {
      indicator.textContent = indicators[type];
    }

    const textarea = document.getElementById('cover-letter-text');
    if (textarea) {
      textarea.value = generateCoverLetterText(type);
    }
  }

  function openCoverLetterModal() {
    const modal = document.getElementById('cover-letter-modal');
    if (!modal) return;
    switchCoverLetterType(currentCoverLetterType || 'formal');
    modal.classList.remove('hidden');
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  function closeCoverLetterModal() {
    const modal = document.getElementById('cover-letter-modal');
    if (modal) modal.classList.add('hidden');
  }

  function copyCoverLetterText() {
    const textarea = document.getElementById('cover-letter-text');
    const btn = document.getElementById('btn-copy-cover-letter');
    if (!textarea) return;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textarea.value).then(() => {
        if (btn) {
          const oldHtml = btn.innerHTML;
          btn.innerHTML = `<i data-lucide="check" class="w-3.5 h-3.5"></i><span>Copiada!</span>`;
          if (window.lucide) window.lucide.createIcons();
          setTimeout(() => {
            btn.innerHTML = oldHtml;
            if (window.lucide) window.lucide.createIcons();
          }, 2500);
        }
      }).catch(() => {
        fallbackCopy(textarea);
      });
    } else {
      fallbackCopy(textarea);
    }
  }

  function fallbackCopy(textarea) {
    textarea.select();
    document.execCommand('copy');
    alert('Texto da carta copiado para a área de transferência!');
  }

  function downloadCoverLetterTxt() {
    const textarea = document.getElementById('cover-letter-text');
    if (!textarea) return;
    const nome = sanitizeFilename(state.curriculo.nome || 'Carta_Apresentacao');
    const blob = new Blob([textarea.value], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Carta_${currentCoverLetterType}_${nome}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function downloadCoverLetterPdf() {
    const textarea = document.getElementById('cover-letter-text');
    if (!textarea) return;
    const textContent = textarea.value || '';
    const nome = sanitizeFilename(state.curriculo.nome || 'Profissional');
    const tituloDoc = currentCoverLetterType === 'recommendation' ? 'CARTA DE RECOMENDAÇÃO' : 'CARTA DE APRESENTAÇÃO';

    // Seletor ou fallback de biblioteca html2pdf
    if (typeof window.html2pdf === 'undefined') {
      alert('Biblioteca de PDF indisponível no momento. Use a opção Baixar .TXT.');
      return;
    }

    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '210mm';
    container.style.padding = '20mm 20mm 20mm 20mm';
    container.style.background = '#ffffff';
    container.style.color = '#1e293b';
    container.style.fontFamily = "'Inter', Arial, sans-serif";
    container.style.fontSize = '12pt';
    container.style.lineHeight = '1.6';
    container.style.boxSizing = 'border-box';

    const paragraphs = textContent.split('\n').map(p => {
      const trimmed = p.trim();
      if (!trimmed) return '<div style="height: 10px;"></div>';
      return `<p style="margin: 0 0 12px 0; text-align: justify; word-break: break-word;">${escapeHtml(trimmed)}</p>`;
    }).join('');

    container.innerHTML = `
      <div style="border-bottom: 2px solid #002776; padding-bottom: 12px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end;">
        <div>
          <h1 style="font-size: 16pt; font-weight: 800; color: #002776; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">${tituloDoc}</h1>
          <p style="font-size: 9pt; color: #64748b; margin: 4px 0 0 0; font-weight: 600;">PORTAL VOCÊ PODE TUDO • QUALIFICAÇÃO & EMPREGABILIDADE</p>
        </div>
        <div style="font-size: 8pt; color: #94a3b8; text-align: right; font-weight: bold;">
          DOC OFICIAL<br>A4 FORMAT
        </div>
      </div>
      <div style="min-height: 220mm;">
        ${paragraphs}
      </div>
      <div style="border-top: 1px solid #e2e8f0; padding-top: 10px; margin-top: 20px; font-size: 8pt; color: #94a3b8; text-align: center;">
        Documento gerado gratuitamente pelo Portal Você Pode Tudo (vocepodetudo.com) — Formato A4
      </div>
    `;

    document.body.appendChild(container);

    const opt = {
      margin: 0,
      filename: `${tituloDoc.replace(/\s+/g, '_')}_${nome}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    window.html2pdf().set(opt).from(container).save().then(() => {
      container.remove();
    }).catch(err => {
      console.error('Erro ao gerar PDF da carta:', err);
      container.remove();
      alert('Não foi possível gerar o PDF. Recomendamos copiar o texto ou baixar em .TXT.');
    });
  }

  // GERENCIAMENTO DE UPLOAD E RECORTE DE FOTO PROFISSIONAL
  // ==============================================================================
  function handlePhotoUpload(input) {
    if (!input.files || !input.files[0]) return;
    const file = input.files[0];

    // Validação de tipo de arquivo de imagem
    if (!file.type.match(/^image\/(jpeg|png|webp|jpg)$/i)) {
      alert('Por favor, selecione uma imagem válida (JPG, PNG ou WebP).');
      input.value = '';
      return;
    }

    // Limite de 8MB antes da compressão
    if (file.size > 8 * 1024 * 1024) {
      alert('A foto selecionada é muito grande. Escolha uma foto de até 8MB.');
      input.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
      const img = new Image();
      img.onload = function() {
        try {
          // Canvas inteligente de recorte e compressão
          const canvas = document.createElement('canvas');
          const targetSize = 360; // 360x360 px quadrado perfeito com ~35KB
          canvas.width = targetSize;
          canvas.height = targetSize;
          const ctx = canvas.getContext('2d');

          let sWidth = img.width;
          let sHeight = img.height;
          let sx = 0;
          let sy = 0;

          if (sWidth > sHeight) {
            sx = (sWidth - sHeight) / 2;
            sWidth = sHeight;
          } else if (sHeight > sWidth) {
            sy = (sHeight - sWidth) / 2;
            sHeight = sWidth;
          }

          ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, targetSize, targetSize);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

          state.curriculo.foto = dataUrl;
          saveToLocalStorage();
          renderCurrentStep();
          updateLivePreview();

          if (window.lucide && typeof window.lucide.createIcons === 'function') {
            window.lucide.createIcons();
          }
        } catch (err) {
          console.error('[Foto] Erro ao processar:', err);
          alert('Erro ao processar imagem no navegador.');
        }
      };
      img.onerror = function() {
        alert('Não foi possível ler a imagem selecionada.');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function removePhoto() {
    state.curriculo.foto = '';
    saveToLocalStorage();
    renderCurrentStep();
    updateLivePreview();

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  // ==============================================================================
  // INTERFACE PÚBLICA (WINDOW.CVAPP)
  // ==============================================================================
  window.cvApp = {
    state,
    TEMPLATES_CATALOG,
    WRITING_ASSISTANT_DATA,
    escapeHtml,
    sanitizeFilename,
    auditCurriculo,
    renderCurriculoHtml,
    syncGeneratedResumeToBackend,

    // Navegação de Etapas
    goToStep(stepNumber) {
      if (stepNumber >= 1 && stepNumber <= 9) {
        state.currentStep = stepNumber;
        saveToLocalStorage();
        renderCurrentStep();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    nextStep() {
      if (state.currentStep < 9) {
        this.goToStep(state.currentStep + 1);
      }
    },
    prevStep() {
      if (state.currentStep > 1) {
        this.goToStep(state.currentStep - 1);
      }
    },

    // Atualização de Campos Primitivos
    updateField(fieldName, value) {
      state.curriculo[fieldName] = value;
      saveToLocalStorage();
      updateLivePreview();
      updateAuditView();
    },

    // Assistente de Escrita
    setObjectiveSuggestion(category) {
      const template = WRITING_ASSISTANT_DATA.objectiveTemplates[category];
      if (template) {
        state.curriculo.objetivoProfissional = template;
        const textarea = document.getElementById('textarea-objetivo');
        if (textarea) textarea.value = template;
        saveToLocalStorage();
        updateLivePreview();
        updateAuditView();
      }
    },
    setSummarySuggestion(category) {
      const template = WRITING_ASSISTANT_DATA.summaryTemplates[category];
      if (template) {
        state.curriculo.resumoProfissional = template;
        const textarea = document.getElementById('textarea-resumo');
        if (textarea) textarea.value = template;
        saveToLocalStorage();
        updateLivePreview();
        updateAuditView();
      }
    },

    // Experiências
    addExperience() {
      state.curriculo.experiencias.push({
        id: generateId(),
        empresa: '',
        cargo: '',
        localidade: '',
        dataInicio: '',
        dataTermino: '',
        atual: false,
        descricao: '',
        resultados: ''
      });
      saveToLocalStorage();
      renderCurrentStep();
      updateLivePreview();
    },
    removeExperience(index) {
      state.curriculo.experiencias.splice(index, 1);
      saveToLocalStorage();
      renderCurrentStep();
      updateLivePreview();
    },
    moveExperience(index, direction) {
      const targetIndex = index + direction;
      if (targetIndex >= 0 && targetIndex < state.curriculo.experiencias.length) {
        const item = state.curriculo.experiencias.splice(index, 1)[0];
        state.curriculo.experiencias.splice(targetIndex, 0, item);
        saveToLocalStorage();
        renderCurrentStep();
        updateLivePreview();
      }
    },
    updateExperienceField(index, field, value) {
      if (state.curriculo.experiencias[index]) {
        state.curriculo.experiencias[index][field] = value;
        saveToLocalStorage();
        updateLivePreview();
      }
    },

    // Formação
    addEducation() {
      state.curriculo.formacoes.push({
        id: generateId(),
        instituicao: '',
        curso: '',
        grau: 'Ensino Médio',
        dataInicio: '',
        dataConclusao: '',
        status: 'Concluído'
      });
      saveToLocalStorage();
      renderCurrentStep();
      updateLivePreview();
    },
    removeEducation(index) {
      state.curriculo.formacoes.splice(index, 1);
      saveToLocalStorage();
      renderCurrentStep();
      updateLivePreview();
    },
    updateEducationField(index, field, value) {
      if (state.curriculo.formacoes[index]) {
        state.curriculo.formacoes[index][field] = value;
        saveToLocalStorage();
        updateLivePreview();
      }
    },

    // Cursos
    addCourse() {
      state.curriculo.cursos.push({
        id: generateId(),
        nome: '',
        instituicao: '',
        cargaHoraria: '',
        anoConclusao: '',
        linkCertificado: ''
      });
      saveToLocalStorage();
      renderCurrentStep();
      updateLivePreview();
    },
    addCatalogCourseToCurriculo(title, provider, hours) {
      state.curriculo.cursos.push({
        id: generateId(),
        nome: title,
        instituicao: provider,
        cargaHoraria: hours || '',
        anoConclusao: new Date().getFullYear().toString(),
        linkCertificado: ''
      });
      saveToLocalStorage();
      renderCurrentStep();
      updateLivePreview();
      alert(`Curso "${title}" adicionado ao seu currículo com sucesso!`);
    },
    removeCourse(index) {
      state.curriculo.cursos.splice(index, 1);
      saveToLocalStorage();
      renderCurrentStep();
      updateLivePreview();
    },
    updateCourseField(index, field, value) {
      if (state.curriculo.cursos[index]) {
        state.curriculo.cursos[index][field] = value;
        saveToLocalStorage();
        updateLivePreview();
      }
    },

    // Habilidades
    addSkill(name) {
      if (!name || !name.trim()) return;
      const clean = name.trim();
      if (!state.curriculo.habilidades.some(h => h.nome.toLowerCase() === clean.toLowerCase())) {
        state.curriculo.habilidades.push({ id: generateId(), nome: clean });
        saveToLocalStorage();
        renderCurrentStep();
        updateLivePreview();
      }
    },
    addSkillFromInput() {
      const input = document.getElementById('input-nova-habilidade');
      if (input && input.value) {
        this.addSkill(input.value);
        input.value = '';
      }
    },
    removeSkill(index) {
      state.curriculo.habilidades.splice(index, 1);
      saveToLocalStorage();
      renderCurrentStep();
      updateLivePreview();
    },

    // Projetos
    addProject() {
      state.curriculo.projetos.push({
        id: generateId(),
        titulo: '',
        tipo: 'Projeto Pessoal',
        descricao: '',
        link: ''
      });
      saveToLocalStorage();
      renderCurrentStep();
      updateLivePreview();
    },
    removeProject(index) {
      state.curriculo.projetos.splice(index, 1);
      saveToLocalStorage();
      renderCurrentStep();
      updateLivePreview();
    },
    updateProjectField(index, field, value) {
      if (state.curriculo.projetos[index]) {
        state.curriculo.projetos[index][field] = value;
        saveToLocalStorage();
        updateLivePreview();
      }
    },

    // Seleção de Modelo
    selectTemplate(templateId) {
      state.activeTemplate = templateId;
      saveToLocalStorage();
      updateLivePreview();
      renderGalleryModal();
      this.closeGalleryModal();
    },
    previewTemplateSample(templateId) {
      state.activeTemplate = templateId;
      updateLivePreview();
    },
    openGalleryModal() {
      const modal = document.getElementById('gallery-modal');
      if (modal) {
        modal.classList.remove('hidden');
        renderGalleryModal();
      }
    },
    closeGalleryModal() {
      const modal = document.getElementById('gallery-modal');
      if (modal) modal.classList.add('hidden');
    },

    // Ajustes de Visualização
    setPrimaryColor(hex) {
      state.primaryColor = hex;
      saveToLocalStorage();
      updateLivePreview();
    },
    setFontScale(scale) {
      state.fontScale = Math.max(0.85, Math.min(1.15, scale));
      saveToLocalStorage();
      updateLivePreview();
    },
    toggleViewMode(mode) {
      state.viewMode = mode;
      const editorCol = document.getElementById('editor-column');
      const previewCol = document.getElementById('preview-column');
      const btnEdit = document.getElementById('mobile-btn-edit');
      const btnPreview = document.getElementById('mobile-btn-preview');

      if (editorCol && previewCol) {
        if (mode === 'preview') {
          editorCol.classList.add('hidden');
          previewCol.classList.remove('hidden');
          previewCol.classList.add('block');
          if (btnEdit) {
            btnEdit.classList.remove('bg-white', 'dark:bg-slate-700', 'text-[#002776]', 'dark:text-emerald-400', 'shadow-xs', 'font-black');
            btnEdit.classList.add('text-slate-600', 'dark:text-slate-400', 'font-bold');
          }
          if (btnPreview) {
            btnPreview.classList.add('bg-white', 'dark:bg-slate-700', 'text-[#002776]', 'dark:text-emerald-400', 'shadow-xs', 'font-black');
            btnPreview.classList.remove('text-slate-600', 'dark:text-slate-400', 'font-bold');
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          editorCol.classList.remove('hidden');
          previewCol.classList.add('hidden');
          previewCol.classList.add('lg:block');
          if (btnEdit) {
            btnEdit.classList.add('bg-white', 'dark:bg-slate-700', 'text-[#002776]', 'dark:text-emerald-400', 'shadow-xs', 'font-black');
            btnEdit.classList.remove('text-slate-600', 'dark:text-slate-400', 'font-bold');
          }
          if (btnPreview) {
            btnPreview.classList.remove('bg-white', 'dark:bg-slate-700', 'text-[#002776]', 'dark:text-emerald-400', 'shadow-xs', 'font-black');
            btnPreview.classList.add('text-slate-600', 'dark:text-slate-400', 'font-bold');
          }
        }
      }
    },

    // Exportações e Limpeza
    exportCurriculoToPdf,
    exportAsJson,
    importFromJson,
    clearAllData,
    loadSampleData,
    handlePhotoUpload,
    removePhoto,
    openCoverLetterModal,
    closeCoverLetterModal,
    generateCoverLetterText,
    copyCoverLetterText,
    downloadCoverLetterTxt,
    switchCoverLetterType,
    downloadCoverLetterPdf,
    updateAuditView
  };

  // ==============================================================================
  // CONTROLE DE MODO ESCURO (DARK MODE) NO CRIADOR DE CURRÍCULOS
  // ==============================================================================
  function initCurriculoDarkMode() {
    const savedTheme = localStorage.getItem('vpt_theme');
    const isDark = savedTheme === 'dark';

    applyCurriculoTheme(isDark);

    const toggleBtn = document.getElementById('cv-dark-mode-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const currentlyDark = document.documentElement.classList.contains('dark');
        applyCurriculoTheme(!currentlyDark);
      });
    }
  }

  function applyCurriculoTheme(isDark) {
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      localStorage.setItem('vpt_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      localStorage.setItem('vpt_theme', 'light');
    }
    const toggleBtn = document.getElementById('cv-dark-mode-toggle');
    if (toggleBtn) {
      toggleBtn.innerHTML = isDark
        ? '<i data-lucide="sun" id="cv-dark-mode-icon" class="w-4 h-4 text-amber-400"></i>'
        : '<i data-lucide="moon" id="cv-dark-mode-icon" class="w-4 h-4 text-slate-700"></i>';
      toggleBtn.title = isDark ? 'Alternar para Modo Claro' : 'Alternar para Modo Escuro (Noturno)';
    }
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  // ==============================================================================
  // INICIALIZAÇÃO NA CARGA DO DOM
  // ==============================================================================
  document.addEventListener('DOMContentLoaded', async () => {
    initCurriculoDarkMode();

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js?v=5.02.0')
        .then(reg => reg.update())
        .catch(() => {});
    }

    loadFromLocalStorage();
    await loadCoursesCatalog();
    renderCurrentStep();
    updateLivePreview();
    updateAuditView();
    renderGalleryModal();

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  });

})();

// Exportação para ambientes Node.js (necessário para a suíte de testes automatizados)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    // Será preenchido ou testado diretamente pelo script de testes
  };
}
