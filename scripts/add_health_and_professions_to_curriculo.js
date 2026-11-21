const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const curriculoJsPath = path.join(ROOT_DIR, 'src', 'curriculo.js');
const curriculoHtmlPath = path.join(ROOT_DIR, 'curriculo.html');

console.log('🚀 Iniciando inclusão de Opções Profissionais (Saúde, Educação, RH, Gastronomia, etc.) no Criador de Currículos...');

// 1. ATUALIZAR src/curriculo.js
let jsContent = fs.readFileSync(curriculoJsPath, 'utf8');

// A. Atualizar WRITING_ASSISTANT_DATA
const oldWritingAssistantRegex = /const WRITING_ASSISTANT_DATA = \{[\s\S]*?textImprovements: \[[\s\S]*?\]\s*\};/;

const newWritingAssistantCode = `const WRITING_ASSISTANT_DATA = {
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
  };`;

jsContent = jsContent.replace(oldWritingAssistantRegex, newWritingAssistantCode);
console.log('✅ WRITING_ASSISTANT_DATA atualizado com Área da Saúde, Educação, RH e mais!');

// B. Atualizar palavras-chave de Cursos do Portal por Área
const oldKeywordsRegex = /const areaKeywords = \{[\s\S]*?\};\s*const keywords = areaKeywords\[normArea\] \|\| areaKeywords\.administrativo;/;

const newKeywordsCode = `const areaKeywords = {
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

    const keywords = areaKeywords[normArea] || areaKeywords.saude || areaKeywords.administrativo;`;

jsContent = jsContent.replace(oldKeywordsRegex, newKeywordsCode);
console.log('✅ areaKeywords atualizado para mapear cursos de Saúde, Educação, RH, Gastronomia, etc.!');

// C. Atualizar o <select id="select-area"> na Etapa 2
const oldSelectAreaRegex = /<select\s+id="select-area"[\s\S]*?<\/select>/;

const newSelectAreaCode = `<select 
              id="select-area" 
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-[#009B3A] outline-none bg-white font-medium"
              onchange="window.cvApp.updateField('areaProfissional', this.value)"
            >
              <option value="saude" \${d.areaProfissional === 'saude' ? 'selected' : ''}>🏥 Saúde, Enfermagem e Cuidados</option>
              <option value="administrativo" \${d.areaProfissional === 'administrativo' ? 'selected' : ''}>💼 Administração e Finanças</option>
              <option value="tecnologia" \${d.areaProfissional === 'tecnologia' ? 'selected' : ''}>💻 Tecnologia e Informática</option>
              <option value="educacao" \${d.areaProfissional === 'educacao' ? 'selected' : ''}>📚 Educação, Docência e Pedagogia</option>
              <option value="comercial" \${d.areaProfissional === 'comercial' ? 'selected' : ''}>🛍️ Comercial e Vendas</option>
              <option value="atendimento" \${d.areaProfissional === 'atendimento' ? 'selected' : ''}>📞 Atendimento e Recepção</option>
              <option value="rh" \${d.areaProfissional === 'rh' ? 'selected' : ''}>👥 Recursos Humanos e Gestão de Pessoas</option>
              <option value="operacional" \${d.areaProfissional === 'operacional' ? 'selected' : ''}>📦 Operacional e Logística</option>
              <option value="hotelaria_gastronomia" \${d.areaProfissional === 'hotelaria_gastronomia' ? 'selected' : ''}>🍳 Gastronomia, Hotelaria e Eventos</option>
              <option value="seguranca" \${d.areaProfissional === 'seguranca' ? 'selected' : ''}>🛡️ Segurança, Portaria e Vigilância</option>
              <option value="marketing" \${d.areaProfissional === 'marketing' ? 'selected' : ''}>📱 Marketing e Mídias Digitais</option>
              <option value="estetica_beleza" \${d.areaProfissional === 'estetica_beleza' ? 'selected' : ''}>✨ Estética, Beleza e Bem-Estar</option>
              <option value="construcao_manutencao" \${d.areaProfissional === 'construcao_manutencao' ? 'selected' : ''}>🔨 Construção e Manutenção Técnica</option>
              <option value="juridico" \${d.areaProfissional === 'juridico' ? 'selected' : ''}>⚖️ Jurídico e Serviços Notariais</option>
              <option value="primeiro_emprego" \${d.areaProfissional === 'primeiro_emprego' ? 'selected' : ''}>🌟 Primeiro Emprego / Jovem Aprendiz</option>
            </select>`;

jsContent = jsContent.replace(oldSelectAreaRegex, newSelectAreaCode);
console.log('✅ Seletor de Área Profissional atualizado com 15 opções completas!');

// D. Atualizar renderStep7 (Habilidades) para Sugestões Contextuais por Área
const oldStep7Regex = /function renderStep7\(d\) \{[\s\S]*?const quickSkills = \[[\s\S]*?\];\s*return `[\s\S]*?<!-- Sugestões em 1 Clique -->[\s\S]*?<\/div>\s*<\/div>\s*`;\s*\}/;

const newStep7Code = `function renderStep7(d) {
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

    return \`
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
          <h4 class="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">Habilidades no Currículo (\${d.habilidades.length})</h4>
          <div class="flex flex-wrap gap-2 min-h-[48px] p-3 bg-slate-50 border border-slate-200 rounded-xl">
            \${(!d.habilidades || d.habilidades.length === 0) ? \`
              <span class="text-xs text-slate-400 italic">Nenhuma habilidade adicionada ainda. Clique nas sugestões abaixo para adicionar rapidamente.</span>
            \` : d.habilidades.map((h, index) => \`
              <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-300 text-slate-800 text-xs font-bold rounded-lg shadow-2xs">
                <span>\${escapeHtml(h.nome)}</span>
                <button type="button" class="text-slate-400 hover:text-rose-500 font-black cursor-pointer" onclick="window.cvApp.removeSkill(\${index})">×</button>
              </span>
            \`).join('')}
          </div>
        </div>

        <!-- Sugestões em 1 Clique Específicas da Área Selecionada -->
        <div class="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
          <div class="text-xs font-extrabold text-[#005e24] flex items-center justify-between">
            <span class="flex items-center gap-1.5">
              <i data-lucide="sparkles" class="w-3.5 h-3.5 text-[#009639]"></i>
              <span>Sugestões Fortes para a sua Área (\${escapeHtml(d.areaProfissional)}):</span>
            </span>
            <span class="text-[10px] text-emerald-800 font-bold">1 Clique para Inserir</span>
          </div>
          <div class="flex flex-wrap gap-1.5">
            \${areaSkills.map(s => \`
              <button 
                type="button" 
                class="px-2.5 py-1 bg-white hover:bg-emerald-100 text-[#005e24] text-xs font-bold rounded-lg border border-emerald-300 transition-colors cursor-pointer"
                onclick="window.cvApp.addSkill('\${s}')"
              >
                + \${s}
              </button>
            \`).join('')}
          </div>
        </div>

        <!-- Sugestões Gerais Universais -->
        <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <div class="text-xs font-bold text-slate-700">Competências Gerais mais valorizadas pelo RH:</div>
          <div class="flex flex-wrap gap-1.5">
            \${universalSkills.map(s => \`
              <button 
                type="button" 
                class="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition-colors cursor-pointer"
                onclick="window.cvApp.addSkill('\${s}')"
              >
                + \${s}
              </button>
            \`).join('')}
          </div>
        </div>
      </div>
    \`;
  }`;

jsContent = jsContent.replace(oldStep7Regex, newStep7Code);
console.log('✅ renderStep7 atualizado com habilidades contextuais por área e gerais!');

// E. Atualizar loadSampleData para aceitar área (saude, administrativo, tecnologia, primeiro_emprego)
const oldLoadSampleRegex = /function loadSampleData\(\) \{[\s\S]*?alert\('Exemplo completo carregado! Navegue pelas etapas ou visualize a pré-visualização ao vivo\.'\);\s*\}/;

const newLoadSampleCode = `function loadSampleData(chosenArea) {
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
  }`;

jsContent = jsContent.replace(oldLoadSampleRegex, newLoadSampleCode);
console.log('✅ loadSampleData atualizado com suporte completo a Área de Saúde e Administração!');

fs.writeFileSync(curriculoJsPath, jsContent, 'utf8');
console.log('✅ src/curriculo.js salvo com sucesso!');

// 2. ATUALIZAR curriculo.html para Menu Suspenso de Exemplos
let htmlContent = fs.readFileSync(curriculoHtmlPath, 'utf8');

const oldSampleBtnRegex = /<!-- Botão Carregar Exemplo -->\s*<button[\s\S]*?<\/button>/;

const newSampleBtnCode = `<!-- Menu Carregar Exemplo por Área -->
        <div class="relative inline-block text-left" id="sample-dropdown-container">
          <button 
            type="button" 
            class="font-bold text-[#ffdf00] hover:text-white underline cursor-pointer inline-flex items-center gap-1"
            onclick="document.getElementById('sample-dropdown-menu').classList.toggle('hidden')"
            title="Preenche o formulário com dados de exemplo da sua área para testar"
          >
            <span>Carregar Exemplo</span>
            <i data-lucide="chevron-down" class="w-3 h-3 text-[#ffdf00]"></i>
          </button>
          <div id="sample-dropdown-menu" class="hidden absolute left-0 mt-1.5 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 p-1.5 z-50 text-slate-800 text-xs space-y-1">
            <div class="px-2 py-1 text-[10px] font-black uppercase text-slate-400 border-b border-slate-100">Escolha o exemplo:</div>
            <button type="button" onclick="window.cvApp.loadSampleData('saude'); document.getElementById('sample-dropdown-menu').classList.add('hidden')" class="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-emerald-50 text-slate-800 hover:text-[#009B3A] font-bold flex items-center gap-2 cursor-pointer transition-colors">
              <span class="text-sm">🏥</span>
              <div>
                <span class="block leading-tight">Área da Saúde & Cuidados</span>
                <span class="text-[10px] text-slate-500 font-normal">Téc. Enfermagem / Cuidador(a)</span>
              </div>
            </button>
            <button type="button" onclick="window.cvApp.loadSampleData('administrativo'); document.getElementById('sample-dropdown-menu').classList.add('hidden')" class="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-emerald-50 text-slate-800 hover:text-[#009B3A] font-bold flex items-center gap-2 cursor-pointer transition-colors">
              <span class="text-sm">💼</span>
              <div>
                <span class="block leading-tight">Administração & Escritório</span>
                <span class="text-[10px] text-slate-500 font-normal">Assistente / Financeiro / Atendimento</span>
              </div>
            </button>
          </div>
        </div>`;

htmlContent = htmlContent.replace(oldSampleBtnRegex, newSampleBtnCode);
fs.writeFileSync(curriculoHtmlPath, htmlContent, 'utf8');
console.log('✅ curriculo.html atualizado com menu de exemplos!');

console.log('\n✨ Sucesso total na inclusão das opções profissionais!');
