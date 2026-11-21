/**
 * src/simulador.js - Simulador Inteligente de Entrevistas de Emprego
 * Portal Você Pode Tudo — Preparação Real para Processos Seletivos
 * Versão 4.72.0 - 9 Trilhas, Modo Cronometrado Real, Avaliação Multidimensional STAR & Exportação PDF A4 Timbrado
 */

(function () {
  'use strict';

  // Banco de Dados das Áreas e Perguntas Reais de RH
  const INTERVIEW_DATA = {
    // 1. Jovem Aprendiz & Primeiro Emprego
    aprendiz: {
      id: 'aprendiz',
      title: 'Jovem Aprendiz & Primeiro Emprego',
      badge: 'Início de Carreira',
      icon: 'graduation-cap',
      color: 'emerald',
      description: 'Perguntas clássicas e comportamentais para candidatos sem experiência formal prévia.',
      questions: [
        {
          id: 1,
          question: 'Conte um pouco sobre você, sua rotina de estudos e por que busca sua primeira oportunidade agora.',
          hint: 'Destaque sua pontualidade na escola, vontade de aprender e cursos extracurriculares que já fez.',
          keywords: ['estudo', 'escola', 'aprender', 'pontual', 'responsabilidade', 'futuro', 'curso', 'compromisso', 'dedicação', 'família'],
          starType: 'context',
          idealAnswer: 'Tenho 17 anos, estou no 3º ano do Ensino Médio no período matutino e sou muito dedicado aos meus estudos. No contraturno, busco me qualificar com cursos livres gratuitos na área de informática e rotinas de escritório. Busco a vaga de Jovem Aprendiz porque quero colocar meus conhecimentos em prática, ajudar minha família e construir uma trajetória profissional sólida dentro da empresa.',
          recommendedCourses: [
            { title: 'Fundamentos de Informática', url: 'cursos-gratis-informatica.html' },
            { title: 'Comunicação Empresarial', url: 'cursos-gratis-administracao.html' }
          ]
        },
        {
          id: 2,
          question: 'Qual você considera seu maior ponto forte e algo que você sabe que precisa melhorar?',
          hint: 'Evite clichês como "sou perfeccionista". Seja autêntico e mostre como você já está trabalhando para melhorar.',
          keywords: ['organização', 'vontade', 'melhorar', 'aprender', 'ouvir', 'comunicação', 'prática', 'foco', 'atenção'],
          starType: 'self_awareness',
          idealAnswer: 'Meu maior ponto forte é a facilidade para aprender coisas novas e a pontualidade com horários. Um ponto que estou desenvolvendo ativamente é falar em público diante de grupos grandes; para vencer a timidez, tenho me voluntariado para apresentar trabalhos em sala de aula e assistido a videoaulas de oratória e comunicação.',
          recommendedCourses: [
            { title: 'Comunicação e Redação Oficial', url: 'cursos-gratis-administracao.html' }
          ]
        },
        {
          id: 3,
          question: 'Conte uma situação na escola ou em família em que você teve que trabalhar em equipe para resolver um problema.',
          hint: 'Aplique o Método STAR: Situação, Tarefa, Ação que você tomou e o Resultado alcançado.',
          keywords: ['equipe', 'grupo', 'trabalho', 'ajudei', 'conversamos', 'solução', 'nota', 'projeto', 'resultado', 'divisão'],
          starType: 'star_method',
          idealAnswer: 'No último semestre, nosso grupo escolar precisava entregar uma feira de ciências, mas um dos colegas não pôde comparecer na véspera (Situação). Como líder da apresentação (Tarefa), reuni os colegas restantes, reorganizamos a divisão das falas e montei os cartazes principais (Ação). O trabalho foi entregue no prazo e nosso grupo tirou nota 9,5 (Resultado).',
          recommendedCourses: [
            { title: 'Gestão de Projetos e Trabalho em Equipe', url: 'cursos-gratis-administracao.html' }
          ]
        },
        {
          id: 4,
          question: 'Por que você escolheu se candidatar a esta empresa e não a qualquer outra?',
          hint: 'Mostre que você pesquisou sobre os valores da empresa e como ela ajuda no crescimento dos funcionários.',
          keywords: ['empresa', 'admiro', 'crescimento', 'valores', 'oportunidade', 'mercado', 'aprender', 'qualidade', 'referência'],
          starType: 'motivation',
          idealAnswer: 'Pesquisei sobre a história da empresa e me identifico muito com a seriedade no atendimento e o programa de desenvolvimento de talentos internos. Sei de aprendizes que foram efetivados como assistentes e supervisores aqui, e meu grande objetivo é me dedicar ao máximo para também construir uma história de longo prazo na instituição.',
          recommendedCourses: [
            { title: 'Excel Básico e Intermediário', url: 'cursos-gratis-excel.html' }
          ]
        },
        {
          id: 5,
          question: 'Como você pretende conciliar o trabalho de aprendiz com seus horários escolares e provas?',
          hint: 'Mostre organização prática e disciplina para cumprir os dois compromissos com excelência.',
          keywords: ['horário', 'agenda', 'escola', 'estudo', 'planejamento', 'responsabilidade', 'prioridade', 'descanso', 'foco'],
          starType: 'organization',
          idealAnswer: 'Minhas aulas terminam às 12h20 e reservei o período da tarde exclusivamente para o expediente de 4 horas do contrato de aprendizagem. Costumo organizar minhas tarefas escolares com antecedência nos finais de semana e no início da noite, garantindo que nem minhas notas caiam nem haja atrasos no trabalho.',
          recommendedCourses: [
            { title: 'Gestão do Tempo e Produtividade', url: 'cursos-gratis-administracao.html' }
          ]
        }
      ]
    },

    // 2. Administrativo, Escritório & Financeiro
    administracao: {
      id: 'administracao',
      title: 'Administrativo, Escritório & Financeiro',
      badge: 'Rotinas Corporativas',
      icon: 'briefcase',
      color: 'blue',
      description: 'Focado em processos organizacionais, planilhas, controle e atendimento a clientes internos.',
      questions: [
        {
          id: 1,
          question: 'Como você organiza suas tarefas diárias quando chegam várias demandas urgentes ao mesmo tempo?',
          hint: 'Fale sobre listas de prioridades, ferramentas como Excel/Trello e comunicação com seu gestor.',
          keywords: ['prioridade', 'urgente', 'importante', 'organização', 'lista', 'planilha', 'alinhamento', 'gestor', 'prazo', 'foco'],
          starType: 'prioritization',
          idealAnswer: 'Costumo classificar as tarefas entre urgentes e importantes. Listo tudo em uma planilha ou bloco de notas, resolvo primeiro as que travam o trabalho de outros colegas e, havendo conflito de horários, alinho imediatamente com o supervisor para confirmar a prioridade do dia.',
          recommendedCourses: [
            { title: 'Excel Intermediário e Avançado', url: 'cursos-gratis-excel.html' },
            { title: 'Rotinas Administrativas', url: 'cursos-gratis-administracao.html' }
          ]
        },
        {
          id: 2,
          question: 'Qual é o seu nível de domínio em Excel e como você já utilizou planilhas na prática?',
          hint: 'Mencione fórmulas concretas (PROCV, SE, SOMA, CONT.SE) ou como você controla dados e relatórios.',
          keywords: ['excel', 'fórmulas', 'procv', 'se', 'soma', 'tabela', 'dinâmica', 'relatório', 'dados', 'gráficos', 'office'],
          starType: 'technical',
          idealAnswer: 'Tenho domínio intermediário em Excel. Utilizo funções como SE, PROCV, CONT.SE e formatação condicional para controle de entradas e saídas, além de gerar gráficos e tabelas para relatórios visuais claros.',
          recommendedCourses: [
            { title: 'Excel do Básico ao Avançado', url: 'cursos-gratis-excel.html' }
          ]
        },
        {
          id: 3,
          question: 'Conte uma ocasião em que você identificou um erro em um documento ou relatório e como você lidou com isso.',
          hint: 'Destaque sua atenção aos detalhes, discrição e iniciativa para corrigir o problema.',
          keywords: ['atenção', 'erro', 'conferi', 'corrigi', 'avisei', 'detalhe', 'solução', 'cuidado', 'qualidade'],
          starType: 'star_method',
          idealAnswer: 'Ao revisar uma planilha de notas fiscais, notei uma divergência de valores em relação ao espelho de compras (Situação). Antes de fechar o arquivo mensal (Tarefa), recalculei as alíquotas e levei o apontamento com a sugestão de correção ao responsável (Ação). O ajuste evitou um retrabalho contábil posterior (Resultado).',
          recommendedCourses: [
            { title: 'Contabilidade e Noções Financeiras', url: 'cursos-gratis-administracao.html' }
          ]
        },
        {
          id: 4,
          question: 'Como você lida com o sigilo e a privacidade de documentos confidenciais na rotina da empresa?',
          hint: 'Demonstre conhecimento sobre ética profissional e princípios básicos da LGPD.',
          keywords: ['sigilo', 'lgpd', 'confidencial', 'ética', 'privacidade', 'dados', 'segurança', 'cuidado', 'proteção'],
          starType: 'compliance',
          idealAnswer: 'Trato a confidencialidade como princípio inegociável. Não compartilho senhas, bloqueio o computador ao me afastar e garanto que documentos com dados pessoais e fiscais circulem apenas pelos canais formais da empresa, em total conformidade com a LGPD.',
          recommendedCourses: [
            { title: 'LGPD e Segurança da Informação', url: 'cursos-gratis-informatica.html' }
          ]
        },
        {
          id: 5,
          question: 'Onde você se vê profissionalmente daqui a dois anos nesta área?',
          hint: 'Mostre ambição saudável de aprendizado contínuo, especialização técnica e compromisso.',
          keywords: ['crescimento', 'estudo', 'especialização', 'efetivação', 'responsabilidade', 'evoluir', 'contribuir'],
          starType: 'vision',
          idealAnswer: 'Pretendo estar consolidado na equipe, dominando os processos internos do setor e avançando em certificações em gestão e análise de dados. Meu objetivo é me tornar um profissional de referência e confiança para a liderança.',
          recommendedCourses: [
            { title: 'Gestão de Processos e Liderança', url: 'cursos-gratis-administracao.html' }
          ]
        }
      ]
    },

    // 3. Atendimento ao Cliente, SAC & Suporte
    atendimento: {
      id: 'atendimento',
      title: 'Atendimento ao Cliente, SAC & Relacionamento',
      badge: 'Comunicação & Empatia',
      icon: 'headphones',
      color: 'purple',
      description: 'Perguntas voltadas à empatia, inteligência emocional, paciência e persuasão ética.',
      questions: [
        {
          id: 1,
          question: 'Como você atende um cliente que entra em contato extremamente irritado ou reclamando de um serviço?',
          hint: 'Fale de escuta ativa, empatia, tom de voz calmo e foco em resolver a dor dele com agilidade.',
          keywords: ['ouvir', 'calma', 'empatia', 'entender', 'solução', 'respeito', 'resolver', 'agilidade', 'educação'],
          starType: 'emotional_intelligence',
          idealAnswer: 'O primeiro passo é manter a calma e praticar a escuta ativa, deixando o cliente desabafar sem interrompê-lo. Demonstro empatia dizendo que compreendo a frustração dele e assumo a responsabilidade por buscar uma solução imediata dentro dos procedimentos da empresa.',
          recommendedCourses: [
            { title: 'Atendimento ao Cliente com Excelência', url: 'cursos-gratis-administracao.html' }
          ]
        },
        {
          id: 2,
          question: 'O que a palavra empatia significa para você no ambiente de atendimento?',
          hint: 'Mostre que empatia é se colocar verdadeiramente no lugar do outro e agir para ajudar.',
          keywords: ['outro', 'compreensão', 'ajudar', 'sentimento', 'cuidado', 'atenção', 'respeito', 'humano'],
          starType: 'definition',
          idealAnswer: 'Empatia no atendimento é não tratar o cliente como mais um número de protocolo. É entender o momento dele, responder com clareza e dedicação como eu gostaria de ser atendido se estivesse do outro lado da linha.',
          recommendedCourses: [
            { title: 'Inteligência Emocional no Trabalho', url: 'cursos-gratis-administracao.html' }
          ]
        },
        {
          id: 3,
          question: 'Conte uma situação em que você superou as expectativas de alguém com seu atendimento ou ajuda.',
          hint: 'Aplique o Método STAR: descreva a situação, a atitude proativa e a satisfação gerada.',
          keywords: ['cliente', 'ajudei', 'problema', 'satisfeito', 'agradeceu', 'superou', 'rápido', 'solução'],
          starType: 'star_method',
          idealAnswer: 'Um cliente procurava um produto específico que estava esgotado na prateleira física (Situação). Em vez de apenas dizer que acabou (Tarefa), verifiquei o sistema central, contatei a filial mais próxima e reservei a peça no nome dele (Ação). O cliente elogiou o atendimento e se tornou fiel à loja (Resultado).',
          recommendedCourses: [
            { title: 'Técnicas de Vendas e Negociação', url: 'cursos-gratis-administracao.html' }
          ]
        },
        {
          id: 4,
          question: 'Como você lida com metas de ligações, chamados ou atendimentos diários sem perder a qualidade?',
          hint: 'Equilíbrio entre produtividade e atenção cuidadosa aos detalhes.',
          keywords: ['meta', 'qualidade', 'ritmo', 'organização', 'foco', 'tempo', 'resultado', 'consistência'],
          starType: 'performance',
          idealAnswer: 'Entendo que a meta é um direcionador. Mantenho o foco no processo: fazendo atendimentos claros e assertivos na primeira tentativa, evito que o cliente precise retornar, o que naturalmente aumenta o número de atendimentos diários com qualidade.',
          recommendedCourses: [
            { title: 'Comunicação Assertiva e Persuasão', url: 'cursos-gratis-administracao.html' }
          ]
        },
        {
          id: 5,
          question: 'O que você faz quando não sabe a resposta para uma dúvida difícil do cliente?',
          hint: 'Nunca invente respostas. Seja honesto, peça um momento e busque a informação correta.',
          keywords: ['honesto', 'verifico', 'pesquiso', 'suporte', 'retorno', 'procedimento', 'certeza'],
          starType: 'integrity',
          idealAnswer: 'Sou transparente: informo que vou checar a informação com a equipe técnica para garantir precisão, peço um breve instante ou o contato dele e retorno imediatamente com a resposta correta e validada.',
          recommendedCourses: [
            { title: 'Comunicação Empresarial e Redação', url: 'cursos-gratis-administracao.html' }
          ]
        }
      ]
    },

    // 4. Tecnologia, Suporte & TI
    tecnologia: {
      id: 'tecnologia',
      title: 'Tecnologia, Suporte & Programação',
      badge: 'Sistemas & Digital',
      icon: 'code',
      color: 'cyan',
      description: 'Lógica, postura técnica diante de falhas de sistemas, curiosidade e método estruturado.',
      questions: [
        {
          id: 1,
          question: 'Quando um usuário ou sistema relata uma falha técnica (bug/erro), qual é o seu passo a passo para diagnosticar o problema?',
          hint: 'Descreva a reprodução do erro, análise de logs, isolamento da causa-raiz e testes de validação.',
          keywords: ['diagnóstico', 'reproduzir', 'erro', 'log', 'causa', 'isolamento', 'teste', 'solução', 'documentação'],
          starType: 'troubleshooting',
          idealAnswer: 'Primeiro, tento reproduzir o erro exatamente como o usuário descreveu. Em seguida, verifico logs e mensagens de erro no console ou sistema operacional para isolar a causa-raiz (rede, permissão, código ou hardware). Após aplicar a correção, testo novamente antes de liberar o sistema e documento a solução para a equipe.',
          recommendedCourses: [
            { title: 'Redes e Suporte de TI', url: 'cursos-gratis-informatica.html' },
            { title: 'Lógica de Programação e Algoritmos', url: 'cursos-gratis-programacao.html' }
          ]
        },
        {
          id: 2,
          question: 'Como você explica um problema técnico complexo para uma pessoa leiga ou cliente que não entende de tecnologia?',
          hint: 'Demonstre capacidade didática usando analogias simples sem termos herméticos.',
          keywords: ['analogia', 'didática', 'simples', 'leigo', 'paciência', 'clareza', 'explicar', 'compreensão'],
          starType: 'communication',
          idealAnswer: 'Evito jargões técnicos excessivos. Uso analogias do cotidiano: por exemplo, explico largura de banda como faixas de uma rodovia ou memória RAM como uma mesa de trabalho física. O essencial é que a pessoa entenda o impacto no dia a dia dela e como o problema foi resolvido.',
          recommendedCourses: [
            { title: 'Comunicação e Redação Técnica', url: 'cursos-gratis-administracao.html' }
          ]
        },
        {
          id: 3,
          question: 'Conte sobre algum projeto, script, página ou laboratório prático que você desenvolveu recentemente.',
          hint: 'Fale das tecnologias utilizadas (HTML, Python, GitHub, etc.), o propósito e o que aprendeu.',
          keywords: ['projeto', 'código', 'desenvolvi', 'github', 'python', 'html', 'aprendi', 'prática', 'teste'],
          starType: 'portfolio',
          idealAnswer: 'Desenvolvi recentemente uma página web responsiva com formulário e validação de campos em JavaScript puro, hospedada no GitHub Pages. Foi uma experiência muito enriquecedora para praticar manipulação do DOM e boas práticas de versionamento no Git.',
          recommendedCourses: [
            { title: 'Programação Web Front-End (HTML/CSS/JS)', url: 'cursos-gratis-programacao.html' }
          ]
        },
        {
          id: 4,
          question: 'A área de TI muda a cada mês. Como você se mantém atualizado sobre novas tecnologias e ferramentas?',
          hint: 'Mencione canais de documentação oficial, bootcamps gratuitos, artigos e leitura contínua.',
          keywords: ['atualização', 'cursos', 'documentação', 'comunidade', 'estudo', 'leitura', 'github', 'prática'],
          starType: 'continuous_learning',
          idealAnswer: 'Acompanho fóruns como GitHub e Stack Overflow, leio documentações oficiais e realizo cursos livres em plataformas abertas como Cisco, Microsoft Learn e Você Pode Tudo. Reservo cerca de 30 minutos diários para estudos práticos.',
          recommendedCourses: [
            { title: 'Inteligência Artificial e Nuvem', url: 'cursos-gratis-ia.html' }
          ]
        },
        {
          id: 5,
          question: 'Como você reage quando seu código não funciona ou quando você não sabe como resolver um desafio técnico?',
          hint: 'Mostre persistência, capacidade de pesquisar e maturidade para pedir ajuda quando necessário.',
          keywords: ['pesquisa', 'documentação', 'calma', 'persistência', 'ajuda', 'equipe', 'resolver', 'aprender'],
          starType: 'resilience',
          idealAnswer: 'Mantenho a serenidade. Quando o código trava, divido o problema em partes menores, testo linha por linha e consulto a documentação oficial. Se esgotar minhas hipóteses razoáveis, peço orientação a um colega mais experiente com perguntas específicas e bem formuladas.',
          recommendedCourses: [
            { title: 'Lógica de Programação do Zero', url: 'cursos-gratis-programacao.html' }
          ]
        }
      ]
    },

    // 5. Saúde, Enfermagem & Cuidadores
    saude: {
      id: 'saude',
      title: 'Saúde, Enfermagem & Cuidadores',
      badge: 'Cuidado & Clínica',
      icon: 'heart-pulse',
      color: 'rose',
      description: 'Humanização no acolhimento, biossegurança, checagem medicamentosa e protocolos sob pressão.',
      questions: [
        {
          id: 1,
          question: 'Como você procede ao acolher um paciente em estado de extrema ansiedade, agitação ou dor intensa?',
          hint: 'Destaque a escuta ativa, empatia, checagem rápida de sinais vitais e postura humanizada para tranquilizar o paciente e a família.',
          keywords: ['sinais vitais', 'humanização', 'empatia', 'escuta', 'calma', 'acolhimento', 'procedimento', 'equipe', 'segurança', 'tranquilizar', 'anamnese'],
          starType: 'star_method',
          idealAnswer: 'No meu último estágio em pronto-socorro, acolhi uma paciente idosa extremamente angustiada e hiperventilando (Situação). Minha responsabilidade imediata era aferir os sinais vitais e garantir a estabilização emocional para a conduta médica (Tarefa). Aproximei-me mantendo contato visual no mesmo nível, expliquei calmamente cada passo da triagem, validei a dor que sentia e ofereci apoio contínuo (Ação). A paciente se acalmou, permitiu a coleta de exames e o médico elogiou a abordagem humanizada que preveniu uma crise de pânico (Resultado).',
          recommendedCourses: [
            { title: 'Noções de Primeiros Socorros e Saúde', url: 'cursos-gratis-administracao.html' },
            { title: 'Inteligência Emocional no Trabalho', url: 'cursos-gratis-administracao.html' }
          ]
        },
        {
          id: 2,
          question: 'Qual é o seu protocolo de conferência antes de administrar qualquer medicamento ou realizar punção/curativo?',
          hint: 'Mencione a regra de ouro dos certos da enfermagem (paciente certo, medicamento certo, dose, via e horário) e dupla checagem.',
          keywords: ['certos', 'prescrição', 'dosagem', 'via', 'horário', 'conferência', 'segurança', 'alergia', 'identificação', 'prontuário'],
          starType: 'compliance',
          idealAnswer: 'Sigo rigorosamente o protocolo dos 9 certos da segurança na administração de medicamentos. Confiro o nome completo e data de nascimento na pulseira de identificação, checo duas vezes a prescrição médica contra a etiqueta da ampola, calculo a dosagem e confirmo se o paciente possui histórico de alergias antes de qualquer aplicação. Esse rigor técnico é inegociável para garantir zero incidentes.',
          recommendedCourses: [
            { title: 'Biossegurança e Segurança do Paciente', url: 'cursos-gratis-administracao.html' }
          ]
        },
        {
          id: 3,
          question: 'Como você gerencia o estresse e a tomada de decisão rápida em situações de emergência ou quando múltiplos leitos demandam atenção simultânea?',
          hint: 'Fale sobre protocolos de triagem clínica (Manchester), priorização pela gravidade e comunicação em equipe multidisciplinar.',
          keywords: ['priorização', 'gravidade', 'triagem', 'equipe', 'estabilidade', 'respiração', 'urgência', 'organização', 'foco', 'comunicação'],
          starType: 'prioritization',
          idealAnswer: 'Utilizo o protocolo de priorização clínica e a metodologia de triagem Manchester. Diante de múltiplas demandas, avalio imediatamente a estabilidade respiratória e hemodinâmica dos pacientes para priorizar os casos graves. Mantenho a comunicação clara em alça fechada com a equipe médica e técnica, delegando cuidados secundários e mantendo a calma para preservar a precisão assistencial.',
          recommendedCourses: [
            { title: 'Gestão do Tempo e Liderança em Saúde', url: 'cursos-gratis-administracao.html' }
          ]
        },
        {
          id: 4,
          question: 'Como você comunica orientações difíceis ou acolhe familiares apreensivos mantendo a ética e o sigilo profissional?',
          hint: 'Demonstre equilíbrio entre acolhimento emocional, clareza nas orientações e respeito aos limites da sua alçada e ao sigilo médico.',
          keywords: ['acolhimento', 'clareza', 'respeito', 'sigilo', 'empatia', 'família', 'transparência', 'ética', 'escuta'],
          starType: 'communication',
          idealAnswer: 'Conduzo a conversa em um espaço reservado, sem interrupções. Pratico a escuta empática, transmito as informações de enfermagem de maneira acessível e transparente, sem gerar falsas expectativas e sempre respeitando a autonomia médica para diagnósticos conclusivos. Garantir que a família se sinta ouvida e amparada reduz conflitos e fortalece a confiança no tratamento.',
          recommendedCourses: [
            { title: 'Comunicação Assertiva e Inteligência Emocional', url: 'cursos-gratis-administracao.html' }
          ]
        },
        {
          id: 5,
          question: 'Quais cuidados você adota rigorosamente em relação ao uso de EPIs, controle de infecção hospitalar e descarte de perfurocortantes?',
          hint: 'Mencione higienização das mãos (5 momentos da OMS), uso correto de EPIs e descarte em coletor rígido sem reencapar agulhas.',
          keywords: ['higienização', 'epi', 'descarte', 'perfurocortante', 'caixa rígida', 'não reencapar', 'biossegurança', 'nr-32', 'prevenção'],
          starType: 'safety',
          idealAnswer: 'Cumpro estritamente as diretrizes da NR-32 e os 5 momentos da higienização das mãos preconizados pela OMS. Utilizo sempre os EPIs adequados ao nível de precaução (luvas, máscara N95, óculos e avental) e jamais reencapo agulhas após procedimentos, descartando perfurocortantes imediatamente na caixa rígida coletora até o limite de 2/3 da capacidade para eliminar riscos de acidentes biológicos.',
          recommendedCourses: [
            { title: 'Biossegurança e Boas Práticas em Saúde', url: 'cursos-gratis-administracao.html' }
          ]
        }
      ]
    },

    // 6. Vendas, Comercial & Atendimento Consultivo
    vendas: {
      id: 'vendas',
      title: 'Vendas, Comercial & Atendimento Consultivo',
      badge: 'Negociação & Metas',
      icon: 'trending-up',
      color: 'emerald',
      description: 'Superação de objeções, vendas consultivas (SPIN), relacionamento duradouro e foco em metas.',
      questions: [
        {
          id: 1,
          question: 'Como você aborda um cliente em potencial que afirma categoricamente que já está satisfeito com o fornecedor concorrente?',
          hint: 'Fale sobre respeito à escolha atual, perguntas consultivas sobre dores não atendidas e oferta de valor sem desmerecer o concorrente.',
          keywords: ['concorrente', 'diferencial', 'perguntas abertas', 'escuta', 'valor agregado', 'relacionamento', 'proposta', 'confiança', 'sem pressão'],
          starType: 'star_method',
          idealAnswer: 'Parabenizo o cliente por já contar com uma solução no mercado e respeito a parceria dele (Situação). Em vez de pressionar ou criticar o concorrente, pergunto se existe algum ponto específico de pós-venda, integração ou custo que ele gostaria que fosse mais eficiente (Tarefa e Ação). Em uma prospecção recente, identifiquei um gargalo de tempo na entrega que o fornecedor dele não cobria; apresentei nossa solução e ganhei um teste piloto que resultou em um contrato anual de alto ticket (Resultado).',
          recommendedCourses: [
            { title: 'Técnicas de Vendas e Negociação Avançada', url: 'cursos-gratis-administracao.html' },
            { title: 'Comunicação e Persuasão', url: 'cursos-gratis-administracao.html' }
          ]
        },
        {
          id: 2,
          question: 'Quando o cliente diz "o produto de vocês é muito caro", qual é a sua estratégia para contornar a objeção sem dar desconto de imediato?',
          hint: 'Diferencie preço de valor, mostre retorno sobre o investimento (ROI) e investigue o que está por trás da objeção.',
          keywords: ['preço', 'valor', 'retorno', 'investimento', 'roi', 'benefício', 'comparação', 'durabilidade', 'custo-benefício'],
          starType: 'negotiation',
          idealAnswer: 'Investigo a objeção com tranquilidade: pergunto "caro em relação a quê?" para entender o referencial do cliente. Em seguida, desvio o foco de preço para valor agregado e retorno sobre o investimento (ROI), demonstrando a durabilidade, o suporte técnico especializado e a economia de tempo gerada a médio prazo. O desconto só entra como última cartada em troca de contrapartidas contratuais, como maior prazo ou maior volume.',
          recommendedCourses: [
            { title: 'Técnicas de Fechamento e Contorno de Objeções', url: 'cursos-gratis-administracao.html' }
          ]
        },
        {
          id: 3,
          question: 'Conte sobre uma venda difícil ou negociação complexa que parecia perdida e como você conseguiu fechar o negócio.',
          hint: 'Estruture pelo Método STAR: o cliente indeciso, o risco de perda, a sua ação estratégica e o fechamento do contrato.',
          keywords: ['negociação', 'cliente indeciso', 'objeção', 'estratégia', 'reunião', 'fechamento', 'meta', 'resultado', 'personalização'],
          starType: 'star_method',
          idealAnswer: 'Um cliente corporativo cancelaria a compra devido a uma reestruturação orçamentária interna (Situação). Para evitar a perda (Tarefa), solicitei uma conversa presencial, mapeei com ele os módulos indispensáveis para o primeiro trimestre e reestruturei o plano de pagamento em fases vinculadas às entregas (Ação). O cliente aprovou a readequação, manteve a contratação conosco e atingimos 115% da meta comercial do mês (Resultado).',
          recommendedCourses: [
            { title: 'Negociação Estratégica e Gestão Comercial', url: 'cursos-gratis-administracao.html' }
          ]
        },
        {
          id: 4,
          question: 'Como você organiza seu pipeline/funil de vendas e realiza o follow-up diário sem se tornar invasivo para os leads?',
          hint: 'Fale sobre CRM, qualificação de leads, agendamento de próximos passos com consentimento e entrega de conteúdo de valor.',
          keywords: ['crm', 'funil', 'pipeline', 'follow-up', 'qualificação', 'agenda', 'conteúdo', 'organização', 'próximo passo', 'lead'],
          starType: 'organization',
          idealAnswer: 'Utilizo CRM para gerenciar todas as etapas do funil de vendas, registrando histórico de conversas, prazos de retorno e nível de maturidade do lead. Todo contato de follow-up é precedido de um alinhamento prévio ("podemos falar na próxima quinta às 14h?") e sempre levo um elemento útil de valor — como um case de sucesso ou cálculo de economia — em vez de apenas cobrar uma decisão.',
          recommendedCourses: [
            { title: 'Gestão de CRM e Ferramentas Comerciais', url: 'cursos-gratis-administracao.html' }
          ]
        },
        {
          id: 5,
          question: 'Como você reage quando não atinge a meta estipulada em um mês e qual o seu plano de ação para recuperar os números?',
          hint: 'Mostre maturidade emocional, análise fria dos dados do funil (taxa de conversão, ligações) e estratégia de ação rápida.',
          keywords: ['análise de dados', 'conversão', 'resiliência', 'plano de ação', 'prospecção', 'melhoria', 'foco', 'motivação', 'números'],
          starType: 'resilience',
          idealAnswer: 'Encaro o não atingimento como uma oportunidade de diagnóstico analítico. Reviso minhas taxas de conversão por etapa do funil para identificar onde houve perda: no volume de prospecção, na qualificação ou no fechamento. A partir disso, monto um plano de recuperação intensificando contatos com base de clientes inativos e participando de mentorias com colegas de alto desempenho para virar o jogo no mês seguinte.',
          recommendedCourses: [
            { title: 'Análise de Métricas e Produtividade em Vendas', url: 'cursos-gratis-administracao.html' }
          ]
        }
      ]
    },

    // 7. Logística, Operações & Estoque
    logistica: {
      id: 'logistica',
      title: 'Logística, Operações & Estoque',
      badge: 'Armazém & Expedição',
      icon: 'truck',
      color: 'amber',
      description: 'Inventário cíclico, PEPS/FIFO, WMS, conferência fiscal, expedição e segurança operacional.',
      questions: [
        {
          id: 1,
          question: 'Como você realiza o controle de estoque para evitar perdas, produtos vencidos (FIFO/PEPS) e divergências de inventário?',
          hint: 'Mencione a regra PEPS/FIFO (Primeiro que Entra, Primeiro que Sai), inventários cíclicos e auditoria de endereçamento.',
          keywords: ['peps', 'fifo', 'inventário cíclico', 'curva abc', 'endereçamento', 'perdas', 'armazenagem', 'conferência', 'validade', 'wms'],
          starType: 'organization',
          idealAnswer: 'Aplico rigorosamente o conceito PEPS/FIFO (Primeiro que Entra, Primeiro que Sai), posicionando lotes mais antigos à frente nas gôndolas e no sistema WMS. Além disso, realizo contagens cíclicas semanais baseadas na Curva ABC dos itens de maior giro e valor, o que mantém a acurácia de estoque acima de 98% e zera perdas por obsolescência ou vencimento.',
          recommendedCourses: [
            { title: 'Logística Integrada e Gestão de Estoques', url: 'cursos-gratis-administracao.html' }
          ]
        },
        {
          id: 2,
          question: 'Se um caminhão de entrega sofre um imprevisto na rota e corre o risco de atrasar uma carga crítica, quais medidas você toma?',
          hint: 'Fale sobre rastreamento de frota, acionamento de contingência/transbordo e comunicação proativa com o cliente final.',
          keywords: ['rastreamento', 'contingência', 'transbordo', 'comunicação proativa', 'alinhamento', 'cliente', 'prazo', 'plano b', 'rotas'],
          starType: 'star_method',
          idealAnswer: 'Primeiro checo a telemetria e o contato com o motorista para entender a gravidade do incidente (Situação). Minha obrigação é proteger a pontualidade da entrega e a integridade da carga (Tarefa). Aciono imediatamente o plano de contingência para transbordo ou redirecionamento de rota e aviso proativamente o cliente sobre a previsão recalculada (Ação). A transparência e agilidade evitam multas contratuais e mantêm a confiança na nossa operação (Resultado).',
          recommendedCourses: [
            { title: 'Gestão de Frotas e Roteirização', url: 'cursos-gratis-administracao.html' }
          ]
        },
        {
          id: 3,
          question: 'Conte uma ocasião em que você encontrou uma divergência grave no picking/separação ou na nota fiscal e como solucionou.',
          hint: 'Estruture em STAR: a divergência encontrada, o risco evitado, sua conferência e a padronização do processo.',
          keywords: ['picking', 'conferência', 'nota fiscal', 'leitor código de barras', 'divergência', 'correção', 'qualidade', 'processo'],
          starType: 'star_method',
          idealAnswer: 'Durante a expedição de um pedido fracionado de alto valor, o leitor de código de barras acusou uma variação de SKU entre o lote físico e o espelho da nota fiscal (Situação). Paralisei a liberação antes do carregamento (Tarefa), conferi manualmente cada volume, acionei o faturamento para emitir a carta de correção e regularizei o lote no sistema (Ação). Evitamos uma devolução com frete duplicado e insatisfação do cliente corporativo (Resultado).',
          recommendedCourses: [
            { title: 'Expedição, Picking e Packing no Armazém', url: 'cursos-gratis-administracao.html' }
          ]
        },
        {
          id: 4,
          question: 'Quais são suas prioridades diárias em relação às normas de segurança do trabalho (EPIs, empilhadeiras e ergonomia) no armazém?',
          hint: 'Ressalte o uso de botina com biqueira, colete refletivo, respeito às faixas de pedestre e checklist diário de maquinário.',
          keywords: ['epi', 'segurança do trabalho', 'botina', 'colete refletivo', 'faixa de pedestre', 'checklist', 'empilhadeira', 'nr-11', 'nr-12', 'ergonomia'],
          starType: 'safety',
          idealAnswer: 'A integridade física da equipe é o pilar número um. Não permito a entrada na área operacional sem bota de proteção com biqueira, luvas e colete refletivo. Asseguro o respeito às faixas exclusivas de pedestres e realizo checklist prévio diário em empilhadeiras e paleteiras elétricas (freios, buzina e garfos), respeitando todas as diretrizes das NRs 11 e 12.',
          recommendedCourses: [
            { title: 'Segurança no Trabalho e Normas Regulamentadoras', url: 'cursos-gratis-administracao.html' }
          ]
        },
        {
          id: 5,
          question: 'Qual é a sua experiência prática com sistemas WMS, leitores coletores e rotinas de cubagem e expedição?',
          hint: 'Fale sobre familiaridade com tecnologia operacional, bipagem de produtos e organização espacial de cargas.',
          keywords: ['wms', 'coletor rfid', 'código de barras', 'cubagem', 'paletização', 'sistema erp', 'expedição', 'tecnologia'],
          starType: 'technical',
          idealAnswer: 'Tenho vivência prática com leitores coletores de dados e módulos WMS para recebimento, guarda, separação e expedição. Compreendo o cálculo de cubagem para melhor aproveitamento do espaço volumétrico em carretas e paletização padrão, minimizando avarias durante o transporte e agilizando o carregamento.',
          recommendedCourses: [
            { title: 'Excel Aplicado à Logística e Estoque', url: 'cursos-gratis-excel.html' }
          ]
        }
      ]
    },

    // 8. Liderança, Coordenação & Gestão
    lideranca: {
      id: 'lideranca',
      title: 'Liderança, Coordenação & Gestão',
      badge: 'Estratégia & Pessoas',
      icon: 'shield-check',
      color: 'indigo',
      description: 'Gestão de conflitos, feedbacks construtivos, engajamento em metas e autonomia sem microgestão.',
      questions: [
        {
          id: 1,
          question: 'Como você lida com conflitos diretos de opiniões ou personalidades entre colaboradores da sua equipe?',
          hint: 'Fale sobre escuta individual neutra, alinhamento conjunto com foco no objetivo comum e estabelecimento de regras claras de convivência.',
          keywords: ['conflito', 'escuta individual', 'mediação', 'imparcialidade', 'objetivo comum', 'respeito', 'clima organizacional', 'acordo', 'diálogo'],
          starType: 'star_method',
          idealAnswer: 'Dois analistas seniores discordavam agressivamente sobre a arquitetura de um projeto, gerando atritos na equipe (Situação). Como gestor, chamei cada um individualmente para uma conversa empática e neutra para compreender as frustrações (Tarefa). Em seguida, reuni ambos em uma sessão técnica com foco exclusivamente nos requisitos do cliente e nos dados objetivos, definindo os papéis de cada um (Ação). O atrito cessou, o projeto foi entregue com excelência e ambos passaram a colaborar mutuamente (Resultado).',
          recommendedCourses: [
            { title: 'Liderança Comportamental e Gestão de Conflitos', url: 'cursos-gratis-administracao.html' }
          ]
        },
        {
          id: 2,
          question: 'Conte como você estrutura uma conversa de feedback difícil ou necessária sobre baixo desempenho de um liderado.',
          hint: 'Mencione feedbacks baseados em fatos concretos (não em julgamentos), espaço para o liderado falar e plano de ação estruturado com prazo de revisão.',
          keywords: ['feedback', 'fatos concretos', 'plano de desenvolvimento', 'pdi', 'respeito', 'ouvir', 'acompanhamento', 'evolução', 'empatia'],
          starType: 'communication',
          idealAnswer: 'Conduzo feedbacks difíceis sempre em particular e com antecedência. Inicio destacando os pontos positivos para gerar segurança psicológica, apresento com dados e fatos documentados as entregas que ficaram aquém do esperado e ouço as dificuldades que o colaborador está enfrentando. Ao final, construímos juntos um Plano de Desenvolvimento Individual (PDI) com metas claras e revisões quinzenais para viabilizar a recuperação do desempenho.',
          recommendedCourses: [
            { title: 'Comunicação Assertiva para Líderes e Gestores', url: 'cursos-gratis-administracao.html' }
          ]
        },
        {
          id: 3,
          question: 'Como você delega responsabilidades estratégicas sem cair no microgerenciamento nem perder o controle da qualidade?',
          hint: 'Fale sobre alinhar o "o quê" e o "porquê" com clareza, dar autonomia no "como", e estabelecer pontos de checagem (checkpoints).',
          keywords: ['delegação', 'autonomia', 'checkpoints', 'alinhamento de expectativas', 'confiança', 'acompanhamento', 'qualidade', 'clareza'],
          starType: 'management',
          idealAnswer: 'Delegar não é delargar. Ao transferir uma responsabilidade, explico com clareza o objetivo final, o impacto estratégico e os critérios de qualidade esperados, dando liberdade para o profissional definir o método de execução. Estabeleço marcos intermediários de checagem (checkpoints) pré-acordados, mantendo-me disponível para destravar impedimentos sem sufocar a iniciativa do time.',
          recommendedCourses: [
            { title: 'Gestão Ágil de Projetos e Equipes', url: 'cursos-gratis-administracao.html' }
          ]
        },
        {
          id: 4,
          question: 'Quando a diretoria define metas extremamente desafiadoras ou mudanças bruscas de estratégia, como você engaja seu time?',
          hint: 'Demonstre inteligência emocional, tradução da visão corporativa para o dia a dia do time e valorização das conquistas.',
          keywords: ['motivação', 'engajamento', 'tradução de metas', 'clareza', 'propósito', 'resiliência', 'comemoração', 'estratégia', 'apoio'],
          starType: 'engagement',
          idealAnswer: 'Primeiro assimilo a estratégia e esclareço todas as dúvidas com a diretoria para me apropriar dos motivos da mudança. Diante do time, transmito a meta não como um fardo, mas como um desafio com propósito claro, dividindo a meta macro em vitórias parciais alcançáveis semana a semana. Reconheço e celebro publicamente cada avanço para manter a moral elevada mesmo sob pressão.',
          recommendedCourses: [
            { title: 'Gestão de Mudanças e Cultura Organizacional', url: 'cursos-gratis-administracao.html' }
          ]
        },
        {
          id: 5,
          question: 'Qual indicador ou KPI de gestão de pessoas você considera mais crítico para acompanhar a saúde de uma equipe?',
          hint: 'Mencione turnover (rotatividade), clima organizacional/eNPS, absenteísmo e produtividade sustentável.',
          keywords: ['turnover', 'enps', 'clima organizacional', 'absenteísmo', 'kpis', 'produtividade', 'saúde emocional', 'desenvolvimento'],
          starType: 'technical',
          idealAnswer: 'Acompanho o turnover voluntário somado ao eNPS (Employee Net Promoter Score) e absenteísmo. Índices elevados de rotatividade drenam o conhecimento da empresa e aumentam custos de contratação. Uma liderança saudável se mede pela retenção dos melhores talentos, satisfação do time e capacidade contínua de promoção interna com sustentabilidade emocional.',
          recommendedCourses: [
            { title: 'Métricas de RH e People Analytics', url: 'cursos-gratis-administracao.html' }
          ]
        }
      ]
    },

    // 9. Perguntas Difíceis & Pegadinhas de RH
    pegadinhas: {
      id: 'pegadinhas',
      title: 'Perguntas Difíceis & Pegadinhas de RH',
      badge: 'Desafio Máximo RH',
      icon: 'help-circle',
      color: 'orange',
      description: 'Maior defeito, pretensão salarial, motivos de saída e erros passados tratados com maestria.',
      questions: [
        {
          id: 1,
          question: '"Qual é o seu maior defeito ou ponto a desenvolver?" Como você responde a essa clássica pergunta sem usar clichês como perfeccionismo?',
          hint: 'Escolha uma habilidade real que não comprometa o núcleo da vaga, mostre autoconsciência sincera e detalhe o plano prático que você já adotou para evoluir.',
          keywords: ['ponto fraco', 'autocrítica', 'evolução', 'prática', 'curso', 'melhoria', 'ação concreta', 'sinceridade', 'amadurecimento'],
          starType: 'star_method',
          idealAnswer: 'Historicamente, eu tinha dificuldade em delegar tarefas por receio de perder o padrão dos detalhes (Situação). Reconheci que esse comportamento sobrecarregava minha rotina e limitava o crescimento dos meus colegas (Tarefa). Para corrigir isso, passei a utilizar quadros visuais no Trello e estabeleci reuniões breves de alinhamento semanal (Ação). Hoje consigo distribuir demandas com segurança e acompanho os prazos sem ansiedade (Resultado).',
          recommendedCourses: [
            { title: 'Inteligência Emocional e Autoconhecimento Profissional', url: 'cursos-gratis-administracao.html' }
          ]
        },
        {
          id: 2,
          question: '"Por que você deseja sair do seu emprego atual (ou por que foi desligado da última empresa)?"',
          hint: 'Mantenha postura ética inabalável, jamais critique gestores ou empresas anteriores, e foque na busca por novos desafios e alinhamento com a vaga.',
          keywords: ['ética', 'novos desafios', 'gratidão', 'crescimento', 'alinhamento', 'propósito', 'evolução profissional', 'respeito'],
          starType: 'ethics',
          idealAnswer: 'Sou muito grato por todo o aprendizado e pelas oportunidades que tive na minha empresa anterior, onde construí relações de muito respeito e conquistei resultados sólidos. No entanto, sinto que cheguei a um momento de maturidade profissional em que busco novos desafios em um segmento com maior dinamismo e oportunidade de expansão, exatamente como os projetos que esta empresa desenvolve.',
          recommendedCourses: [
            { title: 'Ética Corporativa e Marca Pessoal', url: 'cursos-gratis-administracao.html' }
          ]
        },
        {
          id: 3,
          question: '"Qual é a sua pretensão salarial e como você calculou esse valor?"',
          hint: 'Mostre que você pesquisou faixas salariais de mercado, mencione uma faixa negociável e destaque o pacote total de benefícios.',
          keywords: ['pretensão salarial', 'pesquisa de mercado', 'faixa salarial', 'benefícios', 'flexibilidade', 'valor agregado', 'negociação'],
          starType: 'salary_negotiation',
          idealAnswer: 'Com base nas minhas pesquisas sobre a média praticada pelo mercado para essa função no nosso estado e considerando meu histórico de qualificações e resultados, minha pretensão está na faixa entre R$ 3.200 e R$ 3.800. Estou totalmente aberto a compreender a política interna da empresa, a grade de cargos e salários e o pacote global de benefícios oferecidos.',
          recommendedCourses: [
            { title: 'Planejamento de Carreira e Negociação Salarial', url: 'cursos-gratis-administracao.html' }
          ]
        },
        {
          id: 4,
          question: '"Por que nós deveríamos contratar você e não os outros candidatos que também possuem um bom currículo?"',
          hint: 'Combine humildade com diferenciais reais: compromisso com resultados, fit cultural com a empresa e velocidade de aprendizado.',
          keywords: ['diferencial', 'fit cultural', 'compromisso', 'humildade', 'resultados', 'dedicação', 'solução de problemas', 'agregação de valor'],
          starType: 'pitch',
          idealAnswer: 'Certamente os outros candidatos possuem excelentes qualificações e eu respeito muito isso. O meu diferencial reside na combinação de sólida disciplina técnica com uma rápida capacidade de aprendizado e adaptação. Não trago apenas a execução de tarefas diárias, mas o compromisso em encontrar soluções que otimizem custos e tempo, somado a um alinhamento genuíno com os valores de transparência desta organização.',
          recommendedCourses: [
            { title: 'Marketing Pessoal e Empregabilidade', url: 'cursos-gratis-administracao.html' }
          ]
        },
        {
          id: 5,
          question: '"Conte sobre um erro relevante que você cometeu no trabalho e como você lidou com as consequências."',
          hint: 'Mostre coragem para assumir o erro imediatamente, sem culpar terceiros ou o sistema, e detalhe a solução implementada e o aprendizado consolidado.',
          keywords: ['assumi o erro', 'transparência', 'solução imediata', 'sem desculpas', 'aprendizado', 'prevenção', 'maturidade', 'reparo'],
          starType: 'star_method',
          idealAnswer: 'No fechamento de um lote fiscal, inverti o dígito do código de um cliente, gerando uma guia com tributação incorreta (Situação). Assim que identifiquei o equívoco, não tentei ocultar: procurei imediatamente meu supervisor, assumi a responsabilidade e apresentei a guia retificadora já preenchida (Tarefa e Ação). O ajuste foi homologado a tempo sem penalidades e criei uma rotina de dupla checagem que evitou novas falhas (Resultado).',
          recommendedCourses: [
            { title: 'Gestão de Riscos e Tomada de Decisão', url: 'cursos-gratis-administracao.html' }
          ]
        }
      ]
    }
  };

  // Suporte a alias 'ti' redirecionando para 'tecnologia'
  INTERVIEW_DATA.ti = INTERVIEW_DATA.tecnologia;

  // Lista de Padrões de Vícios de Linguagem Corporativos
  const FILLER_PATTERNS = [
    { term: 'tipo assim', regex: /\btipo\s+assim\b/gi },
    { term: 'tá entendendo', regex: /\bt[aá]\s+entendendo\b/gi },
    { term: 'tá ligado', regex: /\bt[aá]\s+ligado\b/gi },
    { term: 'meio que', regex: /\bmeio\s+que\b/gi },
    { term: 'sabe tipo', regex: /\bsabe\s+tipo\b/gi },
    { term: 'tipo que', regex: /\btipo\s+que\b/gi },
    { term: 'né', regex: /(^|[\s,;:\.!?])n[eé]([\s,;:\.!?]|$)/gi },
    { term: 'tipo', regex: /(^|[\s,;:\.!?])tipo([\s,;:\.!?]|$)/gi },
    { term: 'aí', regex: /(^|[\s,;:\.!?])a[ií]([\s,;:\.!?]|$)/gi },
    { term: 'daí', regex: /(^|[\s,;:\.!?])da[ií]([\s,;:\.!?]|$)/gi },
    { term: 'entendeu', regex: /(^|[\s,;:\.!?])entendeu([\s,;:\.!?]|$)/gi },
    { term: 'sabe', regex: /(^|[\s,;:\.!?])sabe([\s,;:\.!?]|$)/gi }
  ];

  // Marcadores Estruturais do Método STAR
  const STAR_MARKERS = {
    situation: [
      'quando', 'em um momento', 'na época', 'no meu último', 'em uma situação', 'no projeto', 
      'na empresa', 'durante', 'o cenário', 'enfrentávamos', 'havia um problema', 'no estágio', 
      'na faculdade', 'na escola', 'no setor', 'certa vez', 'no armazém', 'no hospital', 'no plantão',
      'no atendimento', 'ao receber'
    ],
    task: [
      'meu papel', 'minha meta', 'minha responsabilidade', 'era necessário', 'precisávamos', 
      'o objetivo era', 'fui encarregado', 'a demanda era', 'o desafio era', 'precisava', 
      'minha função era', 'o prazo era', 'minha obrigação', 'para resolver'
    ],
    action: [
      'desenvolvi', 'conversei', 'organizei', 'implementei', 'reuni', 'estruturei', 'analisei', 
      'propus', 'elaborei', 'assumi', 'apliquei', 'conferi', 'pesquisei', 'solucionei', 'liderei', 
      'chamei', 'ajudei', 'criei', 'iniciei', 'fiz', 'adotei', 'alinhei', 'reestruturei', 'monitorei'
    ],
    result: [
      'resultado', 'conseguimos', 'atingimos', 'gerou', 'aumentou', 'reduziu', 'elogiado', 
      'otimizou', 'aprendizado', 'superamos', 'aprovado', 'sucesso', 'evitou', 'entregamos', 
      'consegui', 'garantindo', 'eficiência', 'reconhecimento', 'ganhamos', 'evitamos', 'conquistamos'
    ]
  };

  // Vocabulário Profissional Corporativo de Alto Valor
  const PROFESSIONAL_TERMS = [
    'estratégia', 'processo', 'procedimento', 'qualidade', 'desempenho', 'comunicação', 
    'eficiência', 'gestão', 'alinhamento', 'planejamento', 'método', 'análise', 'otimização', 
    'ética', 'conformidade', 'produtividade', 'solução', 'desenvolvimento', 'responsabilidade', 
    'organização', 'foco', 'cliente', 'meta', 'equipe', 'protocolo', 'segurança', 'prioridade',
    'respeito', 'colaboração', 'compromisso', 'aprendizado', 'resultado'
  ];

  // Gírias Informais a Evitar em Entrevistas
  const SLANG_TERMS = [
    'mano', 'parça', 'bagulho', 'troço', 'trampo', 'véio', 'cara', 'mermão', 'tá ligado'
  ];

  // Estado da Sessão Atual do Candidato
  let currentSession = {
    area: 'aprendiz',
    questionIndex: 0,
    answers: [],
    speechRecognition: null,
    isListening: false,
    timerMode: 0, // 0 = Livre, 60 = 60s, 90 = 90s, 120 = 120s
    timeRemaining: 0,
    timerInterval: null,
    isTimerRunning: false,
    userName: ''
  };

  /**
   * Detector de Vícios de Linguagem
   */
  function detectFillerWords(text) {
    let workingText = text.toLowerCase();
    const detected = [];
    let totalCount = 0;

    for (const item of FILLER_PATTERNS) {
      const matches = workingText.match(item.regex);
      if (matches && matches.length > 0) {
        detected.push({ term: item.term, count: matches.length });
        totalCount += matches.length;
        // Substitui ocorrências processadas para evitar duplicidade em sub-expressões
        workingText = workingText.replace(item.regex, ' ');
      }
    }

    let advice = '';
    if (totalCount === 0) {
      advice = 'Parabéns! Nenhum vício de linguagem recorrente foi detectado na sua fala.';
    } else if (totalCount <= 2) {
      advice = 'Boa dicção! Foram detectados apenas pequenos vícios pontuais. Treine substituir essas palavras por uma breve respiração.';
    } else {
      advice = 'Dica de Ouro do RH: Substitua repetições como "tipo", "né" ou "aí" por pausas silenciosas de 1 segundo. O silêncio transmite autoconfiança e ponderação.';
    }

    return { count: totalCount, detected, advice };
  }

  /**
   * Avaliação da Aderência ao Método STAR (Situação, Tarefa, Ação, Resultado)
   */
  function evaluateSTAR(lowerText) {
    const hasS = STAR_MARKERS.situation.some(m => lowerText.includes(m));
    const hasT = STAR_MARKERS.task.some(m => lowerText.includes(m));
    const hasA = STAR_MARKERS.action.some(m => lowerText.includes(m));
    const hasR = STAR_MARKERS.result.some(m => lowerText.includes(m));

    let starScore = 0;
    if (hasS) starScore += 25;
    if (hasT) starScore += 25;
    if (hasA) starScore += 25;
    if (hasR) starScore += 25;

    // Se o texto for longo e tiver verbos de ação mas não palavras exatas, concede pontuação proporcional
    if (starScore === 0 && lowerText.split(/\s+/).length >= 40) {
      starScore = 30; // Estrutura narrativa básica
    }

    return {
      score: starScore,
      breakdown: { s: hasS, t: hasT, a: hasA, r: hasR }
    };
  }

  /**
   * Motor de Avaliação Multidimensional da Resposta
   */
  function evaluateAnswer(userAnswer, question) {
    const text = (userAnswer || '').trim();
    const words = text.split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const lower = text.toLowerCase();

    // 1. Clareza & Objetividade (0 - 100)
    let clarityBase = 0;
    if (wordCount >= 40 && wordCount <= 130) {
      clarityBase = 95; // Extensão exemplar
    } else if (wordCount >= 25 && wordCount < 40) {
      clarityBase = 70; // Um pouco curta
    } else if (wordCount > 130 && wordCount <= 200) {
      clarityBase = 75; // Um pouco prolixa
    } else if (wordCount > 200) {
      clarityBase = 55; // Excessivamente longa
    } else {
      clarityBase = 35; // Muito curta
    }

    // Presença de conectivos discursivos lógicos
    const connectors = ['porque', 'quando', 'como', 'portanto', 'além disso', 'dessa forma', 'assim', 'primeiro', 'exemplo', 'então', 'consequentemente'];
    const matchedConnectors = connectors.filter(c => lower.includes(c));
    const connectorBonus = Math.min(15, matchedConnectors.length * 5);
    let clarityScore = Math.min(100, clarityBase + connectorBonus);

    // 2. Aderência ao Método STAR (0 - 100)
    const starResult = evaluateSTAR(lower);
    const starScore = starResult.score;

    // 3. Vocabulário Profissional (0 - 100)
    const matchedProfTerms = PROFESSIONAL_TERMS.filter(term => lower.includes(term));
    const matchedSlang = SLANG_TERMS.filter(slang => lower.includes(slang));
    let vocabScore = Math.min(100, Math.max(25, 40 + (matchedProfTerms.length * 10) - (matchedSlang.length * 15)));

    // 4. Relevância para a Vaga (0 - 100)
    const matchedKeywords = question.keywords.filter(kw => lower.includes(kw));
    let relevanceScore = 0;
    if (matchedKeywords.length >= 3) {
      relevanceScore = 100;
    } else if (matchedKeywords.length === 2) {
      relevanceScore = 80;
    } else if (matchedKeywords.length === 1) {
      relevanceScore = 60;
    } else {
      relevanceScore = 35;
    }

    // 5. Detector de Vícios de Linguagem
    const fillerWords = detectFillerWords(text);
    const fillerPenalty = Math.min(15, fillerWords.count * 3);

    // Nota Geral Ponderada (0 a 100)
    // Pesos: STAR (30%), Clareza (25%), Relevância (25%), Vocabulário (20%) - Penalidade de Vícios
    const weightedScore = (starScore * 0.30) + (clarityScore * 0.25) + (relevanceScore * 0.25) + (vocabScore * 0.20);
    const finalScore = Math.max(15, Math.min(100, Math.round(weightedScore - fillerPenalty)));

    // Diagnóstico Qualitativo
    const strengths = [];
    const improvements = [];

    // Pontos Fortes
    if (wordCount >= 40 && wordCount <= 130) {
      strengths.push('Extensão excelente: resposta com volume ideal para uma fala de 1 a 2 minutos em entrevista.');
    }
    if (starScore >= 75) {
      strengths.push('Excelente aderência ao Método STAR: você narrou contexto, ações e resultados com clareza executiva.');
    } else if (starScore >= 50) {
      strengths.push('Boa estrutura narrativa com encadeamento de fatos bem posicionados.');
    }
    if (matchedKeywords.length >= 2) {
      strengths.push(`Vocabulário assertivo: você empregou termos-chave do cargo como "${matchedKeywords.slice(0, 3).join(', ')}".`);
    }
    if (fillerWords.count === 0) {
      strengths.push('Dicção limpa: nenhum vício de linguagem repetitivo ("né", "tipo", "aí") foi encontrado.');
    }

    // Oportunidades de Melhoria
    if (wordCount < 35) {
      improvements.push('Resposta breve demais: adicione um exemplo prático com detalhes de como você agiu na situação.');
    } else if (wordCount > 140) {
      improvements.push('Cuidado com prolixidade: seja mais direto ao ponto para não cansar o recrutador.');
    }
    if (!starResult.breakdown.r) {
      improvements.push('Conclua sempre com o Resultado: termine a fala contando o impacto positivo gerado pela sua ação.');
    }
    if (!starResult.breakdown.a) {
      improvements.push('Destaque sua Ação Individual: use verbos em primeira pessoa ("eu analisei", "eu propus", "eu organizei").');
    }
    if (matchedKeywords.length < 2) {
      improvements.push(`Enriqueça com palavras da área: experimente citar termos como "${question.keywords.slice(0, 3).join(', ')}".`);
    }
    if (fillerWords.count >= 2) {
      improvements.push(`Atenção aos vícios de linguagem: foram identificados ${fillerWords.count} vícios (ex: ${fillerWords.detected.map(f => `"${f.term}" x${f.count}`).join(', ')}).`);
    }

    let statusText = '';
    let statusColor = '';
    if (finalScore >= 80) {
      statusText = 'Excelente! Nível Aprovado';
      statusColor = 'text-emerald-700 bg-emerald-100 border-emerald-300';
    } else if (finalScore >= 60) {
      statusText = 'Bom desempenho! Pronto com pequenos ajustes';
      statusColor = 'text-blue-700 bg-blue-100 border-blue-300';
    } else {
      statusText = 'Em desenvolvimento: Pratique mais uma vez';
      statusColor = 'text-amber-800 bg-amber-100 border-amber-300';
    }

    return {
      score: finalScore,
      criteria: {
        clarity: { score: clarityScore, label: 'Clareza & Objetividade' },
        star: { score: starScore, breakdown: starResult.breakdown, label: 'Método STAR' },
        vocabulary: { score: vocabScore, label: 'Vocabulário Profissional' },
        relevance: { score: relevanceScore, label: 'Relevância para a Vaga' }
      },
      fillerWords: fillerWords,
      wordCount: wordCount,
      matchedKeywords: matchedKeywords,
      strengths: strengths,
      improvements: improvements,
      statusText: statusText,
      statusColor: statusColor,
      idealAnswer: question.idealAnswer,
      recommendedCourses: question.recommendedCourses
    };
  }

  /**
   * Sintetizador de Som Sutil via Web Audio API (para término do cronômetro)
   */
  function playTimerBeep() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // Tom Ré
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // Tom Lá
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {
      // Falha silenciosa em navegadores com restrições
    }
  }

  /**
   * Gerenciador do Modo Cronometrado Real
   */
  function setupTimer() {
    const modeButtons = document.querySelectorAll('.sim-time-btn');
    const toggleBtn = document.getElementById('sim-timer-toggle-btn');
    const resetBtn = document.getElementById('sim-timer-reset-btn');

    modeButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const time = parseInt(e.currentTarget.dataset.time, 10);
        currentSession.timerMode = time;

        modeButtons.forEach(b => {
          b.classList.remove('bg-white', 'dark:bg-slate-800', 'text-slate-900', 'dark:text-white', 'shadow-xs');
          b.classList.add('text-slate-600', 'dark:text-slate-300');
        });
        e.currentTarget.classList.add('bg-white', 'dark:bg-slate-800', 'text-slate-900', 'dark:text-white', 'shadow-xs');
        e.currentTarget.classList.remove('text-slate-600', 'dark:text-slate-300');

        resetTimer();
        if (time > 0) {
          startTimer();
        }
      });
    });

    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        if (currentSession.isTimerRunning) {
          pauseTimer();
        } else {
          startTimer();
        }
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        resetTimer();
        if (currentSession.timerMode > 0) {
          startTimer();
        }
      });
    }
  }

  function startTimer() {
    if (currentSession.timerMode <= 0) return;
    if (currentSession.timerInterval) clearInterval(currentSession.timerInterval);

    currentSession.isTimerRunning = true;
    updateTimerControlsUI();

    currentSession.timerInterval = setInterval(() => {
      if (currentSession.timeRemaining > 0) {
        currentSession.timeRemaining--;
        updateTimerDisplay();

        if (currentSession.timeRemaining === 0) {
          clearInterval(currentSession.timerInterval);
          currentSession.isTimerRunning = false;
          updateTimerDisplay();
          updateTimerControlsUI();
          playTimerBeep();

          // Alerta sutil de tempo esgotado
          const timerBadge = document.getElementById('sim-timer-badge');
          if (timerBadge) {
            timerBadge.classList.add('animate-bounce');
            setTimeout(() => timerBadge.classList.remove('animate-bounce'), 3000);
          }
        }
      }
    }, 1000);
  }

  function pauseTimer() {
    if (currentSession.timerInterval) {
      clearInterval(currentSession.timerInterval);
      currentSession.timerInterval = null;
    }
    currentSession.isTimerRunning = false;
    updateTimerControlsUI();
  }

  function resetTimer() {
    pauseTimer();
    currentSession.timeRemaining = currentSession.timerMode;
    updateTimerDisplay();
    updateTimerControlsUI();
  }

  function updateTimerControlsUI() {
    const toggleBtn = document.getElementById('sim-timer-toggle-btn');
    const resetBtn = document.getElementById('sim-timer-reset-btn');
    const timerBarWrap = document.getElementById('sim-timer-bar-wrap');
    const btnLabel = document.getElementById('sim-timer-btn-label');
    const btnIcon = document.getElementById('sim-timer-icon');

    if (currentSession.timerMode > 0) {
      if (toggleBtn) toggleBtn.classList.remove('hidden');
      if (resetBtn) resetBtn.classList.remove('hidden');
      if (timerBarWrap) timerBarWrap.classList.remove('hidden');

      if (btnLabel) btnLabel.textContent = currentSession.isTimerRunning ? 'Pausar' : 'Continuar';
      if (btnIcon) btnIcon.setAttribute('data-lucide', currentSession.isTimerRunning ? 'pause' : 'play');
    } else {
      if (toggleBtn) toggleBtn.classList.add('hidden');
      if (resetBtn) resetBtn.classList.add('hidden');
      if (timerBarWrap) timerBarWrap.classList.add('hidden');
    }

    if (window.lucide) window.lucide.createIcons();
  }

  function updateTimerDisplay() {
    const timerText = document.getElementById('sim-timer-text');
    const timerBadge = document.getElementById('sim-timer-badge');
    const timerBar = document.getElementById('sim-timer-bar');

    if (currentSession.timerMode <= 0) {
      if (timerText) timerText.textContent = 'Sem Limite';
      if (timerBadge) {
        timerBadge.className = 'px-3.5 py-1.5 rounded-xl text-xs font-black font-mono tracking-wider bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-2';
      }
      return;
    }

    const mins = Math.floor(currentSession.timeRemaining / 60);
    const secs = currentSession.timeRemaining % 60;
    const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    if (timerText) timerText.textContent = formatted;

    const percent = Math.max(0, (currentSession.timeRemaining / currentSession.timerMode) * 100);
    if (timerBar) {
      timerBar.style.width = `${percent}%`;
    }

    if (timerBadge && timerBar) {
      if (currentSession.timeRemaining <= 15) {
        timerBadge.className = 'px-3.5 py-1.5 rounded-xl text-xs font-black font-mono tracking-wider bg-rose-600 text-white flex items-center gap-2 animate-pulse';
        timerBar.className = 'h-full bg-rose-600 rounded-full transition-all duration-300 ease-linear';
      } else if (percent <= 40) {
        timerBadge.className = 'px-3.5 py-1.5 rounded-xl text-xs font-black font-mono tracking-wider bg-amber-500 text-slate-900 flex items-center gap-2';
        timerBar.className = 'h-full bg-amber-500 rounded-full transition-all duration-300 ease-linear';
      } else {
        timerBadge.className = 'px-3.5 py-1.5 rounded-xl text-xs font-black font-mono tracking-wider bg-emerald-600 text-white flex items-center gap-2';
        timerBar.className = 'h-full bg-emerald-500 rounded-full transition-all duration-300 ease-linear';
      }
    }
  }

  /**
   * Monitoramento em Tempo Real do Textarea (Palavras & Vícios de Linguagem)
   */
  function setupLiveTextFeedback() {
    const textarea = document.getElementById('sim-user-answer');
    const wordCounter = document.getElementById('sim-word-counter');
    const liveFillerBadge = document.getElementById('sim-live-filler-badge');

    if (!textarea) return;

    textarea.addEventListener('input', () => {
      const text = textarea.value.trim();
      const count = text ? text.split(/\s+/).filter(Boolean).length : 0;

      if (wordCounter) {
        wordCounter.textContent = `${count} ${count === 1 ? 'palavra' : 'palavras'} (ideal: 40-120)`;
        if (count >= 40 && count <= 120) {
          wordCounter.className = 'text-[11px] font-bold text-emerald-600 dark:text-emerald-400';
        } else if (count > 120) {
          wordCounter.className = 'text-[11px] font-semibold text-amber-600 dark:text-amber-400';
        } else {
          wordCounter.className = 'text-[11px] font-semibold text-slate-400';
        }
      }

      if (liveFillerBadge) {
        const fillers = detectFillerWords(text);
        if (fillers.count > 0) {
          liveFillerBadge.textContent = `⚠️ ${fillers.count} ${fillers.count === 1 ? 'vício' : 'vícios'} detectado(s)`;
          liveFillerBadge.classList.remove('hidden');
        } else {
          liveFillerBadge.classList.add('hidden');
        }
      }

      // Se o usuário começar a digitar e o timer não estiver rodando no modo cronometrado, inicia
      if (currentSession.timerMode > 0 && !currentSession.isTimerRunning && currentSession.timeRemaining > 0 && text.length > 5) {
        startTimer();
      }
    });
  }

  /**
   * Inicialização da Interface
   */
  function init() {
    setupAreaSelector();
    setupSpeechRecognition();
    setupTimer();
    setupLiveTextFeedback();
    setupEventListeners();
    renderCurrentQuestion();
  }

  function setupAreaSelector() {
    const selectorButtons = document.querySelectorAll('.simulator-area-btn');
    selectorButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        let targetArea = e.currentTarget.dataset.area;
        if (targetArea === 'ti') targetArea = 'tecnologia';

        if (INTERVIEW_DATA[targetArea]) {
          currentSession.area = targetArea;
          currentSession.questionIndex = 0;
          currentSession.answers = [];

          selectorButtons.forEach(b => {
            b.classList.remove('border-emerald-600', 'bg-emerald-50', 'dark:bg-emerald-950', 'text-emerald-900', 'dark:text-emerald-200');
            b.classList.add('border-slate-200', 'dark:border-slate-700');
          });
          e.currentTarget.classList.add('border-emerald-600', 'bg-emerald-50', 'dark:bg-emerald-950', 'text-emerald-900', 'dark:text-emerald-200');
          e.currentTarget.classList.remove('border-slate-200', 'dark:border-slate-700');

          renderCurrentQuestion();
        }
      });
    });
  }

  function renderCurrentQuestion() {
    const areaData = INTERVIEW_DATA[currentSession.area];
    const q = areaData.questions[currentSession.questionIndex];
    if (!q) return;

    // Atualizar Contadores e Títulos
    const progressEl = document.getElementById('sim-progress-indicator');
    const questionTextEl = document.getElementById('sim-question-text');
    const questionHintEl = document.getElementById('sim-question-hint');
    const answerInput = document.getElementById('sim-user-answer');
    const feedbackBox = document.getElementById('sim-feedback-container');
    const evaluateBtn = document.getElementById('sim-evaluate-btn');
    const nextBtn = document.getElementById('sim-next-btn');
    const wordCounter = document.getElementById('sim-word-counter');
    const liveFillerBadge = document.getElementById('sim-live-filler-badge');

    if (progressEl) {
      progressEl.textContent = `Pergunta ${currentSession.questionIndex + 1} de ${areaData.questions.length} • ${areaData.title}`;
    }
    if (questionTextEl) {
      questionTextEl.textContent = q.question;
    }
    if (questionHintEl) {
      questionHintEl.textContent = `Dica do Recrutador: ${q.hint}`;
    }
    if (answerInput) {
      answerInput.value = '';
      answerInput.disabled = false;
      answerInput.focus();
    }
    if (wordCounter) {
      wordCounter.textContent = '0 palavras (ideal: 40-120)';
      wordCounter.className = 'text-[11px] font-semibold text-slate-400';
    }
    if (liveFillerBadge) {
      liveFillerBadge.classList.add('hidden');
    }
    if (feedbackBox) {
      feedbackBox.classList.add('hidden');
      feedbackBox.innerHTML = '';
    }
    if (evaluateBtn) {
      evaluateBtn.classList.remove('hidden');
    }
    if (nextBtn) {
      nextBtn.classList.add('hidden');
    }

    // Reinicia o cronômetro para a nova pergunta
    resetTimer();
    if (currentSession.timerMode > 0) {
      startTimer();
    }

    if (window.lucide) window.lucide.createIcons();
  }

  function setupSpeechRecognition() {
    const micBtn = document.getElementById('sim-mic-btn');
    if (!micBtn) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      micBtn.style.display = 'none';
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      const answerInput = document.getElementById('sim-user-answer');
      if (answerInput) {
        answerInput.value = (answerInput.value + ' ' + transcript).trim();
        // Dispara evento de input para contadores
        answerInput.dispatchEvent(new Event('input'));
      }
    };

    recognition.onerror = () => {
      currentSession.isListening = false;
      micBtn.classList.remove('bg-rose-600', 'text-white', 'animate-pulse');
      micBtn.classList.add('bg-slate-100');
    };

    recognition.onend = () => {
      currentSession.isListening = false;
      micBtn.classList.remove('bg-rose-600', 'text-white', 'animate-pulse');
      micBtn.classList.add('bg-slate-100');
    };

    micBtn.addEventListener('click', () => {
      if (!currentSession.isListening) {
        try {
          recognition.start();
          currentSession.isListening = true;
          micBtn.classList.add('bg-rose-600', 'text-white', 'animate-pulse');
          micBtn.classList.remove('bg-slate-100');
          if (currentSession.timerMode > 0 && !currentSession.isTimerRunning) {
            startTimer();
          }
        } catch (e) {}
      } else {
        recognition.stop();
        currentSession.isListening = false;
        micBtn.classList.remove('bg-rose-600', 'text-white', 'animate-pulse');
        micBtn.classList.add('bg-slate-100');
      }
    });

    currentSession.speechRecognition = recognition;
  }

  function setupEventListeners() {
    const evaluateBtn = document.getElementById('sim-evaluate-btn');
    const nextBtn = document.getElementById('sim-next-btn');

    if (evaluateBtn) {
      evaluateBtn.addEventListener('click', () => {
        const areaData = INTERVIEW_DATA[currentSession.area];
        const q = areaData.questions[currentSession.questionIndex];
        const answerInput = document.getElementById('sim-user-answer');
        const text = answerInput ? answerInput.value.trim() : '';

        if (text.length < 15) {
          alert('Por favor, elabore sua resposta com pelo menos uma frase completa antes de solicitar a avaliação do RH.');
          return;
        }

        // Para o cronômetro durante a leitura do feedback
        pauseTimer();

        const result = evaluateAnswer(text, q);
        currentSession.answers.push({
          questionIndex: currentSession.questionIndex + 1,
          question: q.question,
          answer: text,
          result: result
        });

        displayFeedback(result);

        if (answerInput) answerInput.disabled = true;
        evaluateBtn.classList.add('hidden');
        if (nextBtn) {
          nextBtn.classList.remove('hidden');
          nextBtn.textContent = currentSession.questionIndex < areaData.questions.length - 1
            ? 'Próxima Pergunta →'
            : 'Ver Relatório Geral da Entrevista 🏆';
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        const areaData = INTERVIEW_DATA[currentSession.area];
        if (currentSession.questionIndex < areaData.questions.length - 1) {
          currentSession.questionIndex++;
          renderCurrentQuestion();
        } else {
          renderFinalSummary();
        }
      });
    }
  }

  /**
   * Exibição do Diagnóstico Multidimensional em Tempo Real
   */
  function displayFeedback(result) {
    const feedbackBox = document.getElementById('sim-feedback-container');
    if (!feedbackBox) return;

    const star = result.criteria.star.breakdown;

    feedbackBox.innerHTML = `
      <div class="p-6 sm:p-8 rounded-3xl border-2 ${result.score >= 70 ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/30' : 'border-amber-500 bg-amber-50/40 dark:bg-amber-950/30'} space-y-6 animate-fade-in shadow-lg">
        
        <!-- Cabeçalho do Feedback -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
          <div>
            <span class="inline-block px-3.5 py-1 rounded-full text-xs font-black border ${result.statusColor}">
              ${result.statusText}
            </span>
            <h4 class="text-xl font-black text-slate-900 dark:text-white mt-2">
              Diagnóstico de Entrevista: ${result.score}% de Prontidão Profissional
            </h4>
            <span class="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
              Avaliação algorítmica multidimensional baseada nos critérios de Recrutamento & Seleção (STAR)
            </span>
          </div>
          <div class="text-right sm:text-right bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            <span class="text-3xl font-black ${result.score >= 70 ? 'text-emerald-600' : 'text-amber-600'}">
              ${result.score}/100
            </span>
            <span class="text-xs text-slate-500 block font-bold">${result.wordCount} palavras analisadas</span>
          </div>
        </div>

        <!-- Painel dos 4 Critérios Multidimensionais -->
        <div>
          <h5 class="text-xs font-black uppercase text-slate-700 dark:text-slate-300 tracking-wider mb-3 flex items-center gap-2">
            <i data-lucide="bar-chart-2" class="w-4 h-4 text-[#002776] dark:text-blue-400"></i>
            <span>Desempenho nos 4 Pilares da Resposta</span>
          </h5>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            
            <!-- Critério 1: Clareza -->
            <div class="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <span class="text-[11px] font-black uppercase text-slate-400 block mb-1">Pilar 1</span>
              <span class="text-xs font-black text-slate-800 dark:text-slate-200 block">Clareza & Objetividade</span>
              <div class="text-xl font-black text-slate-900 dark:text-white my-1.5">${result.criteria.clarity.score}%</div>
              <div class="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div class="bg-blue-600 h-full rounded-full" style="width: ${result.criteria.clarity.score}%;"></div>
              </div>
            </div>

            <!-- Critério 2: Método STAR -->
            <div class="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <span class="text-[11px] font-black uppercase text-slate-400 block mb-1">Pilar 2</span>
              <span class="text-xs font-black text-slate-800 dark:text-slate-200 block">Aderência ao STAR</span>
              <div class="text-xl font-black text-slate-900 dark:text-white my-1.5">${result.criteria.star.score}%</div>
              <!-- Badges STAR -->
              <div class="flex items-center gap-1 mt-1 text-[10px] font-black">
                <span class="px-1.5 py-0.5 rounded ${star.s ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-slate-100 text-slate-400'}" title="Situação">S</span>
                <span class="px-1.5 py-0.5 rounded ${star.t ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-slate-100 text-slate-400'}" title="Tarefa">T</span>
                <span class="px-1.5 py-0.5 rounded ${star.a ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-slate-100 text-slate-400'}" title="Ação">A</span>
                <span class="px-1.5 py-0.5 rounded ${star.r ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-slate-100 text-slate-400'}" title="Resultado">R</span>
              </div>
            </div>

            <!-- Critério 3: Vocabulário Profissional -->
            <div class="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <span class="text-[11px] font-black uppercase text-slate-400 block mb-1">Pilar 3</span>
              <span class="text-xs font-black text-slate-800 dark:text-slate-200 block">Vocabulário Técnico</span>
              <div class="text-xl font-black text-slate-900 dark:text-white my-1.5">${result.criteria.vocabulary.score}%</div>
              <div class="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div class="bg-indigo-600 h-full rounded-full" style="width: ${result.criteria.vocabulary.score}%;"></div>
              </div>
            </div>

            <!-- Critério 4: Relevância -->
            <div class="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <span class="text-[11px] font-black uppercase text-slate-400 block mb-1">Pilar 4</span>
              <span class="text-xs font-black text-slate-800 dark:text-slate-200 block">Relevância para a Vaga</span>
              <div class="text-xl font-black text-slate-900 dark:text-white my-1.5">${result.criteria.relevance.score}%</div>
              <div class="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div class="bg-emerald-600 h-full rounded-full" style="width: ${result.criteria.relevance.score}%;"></div>
              </div>
            </div>

          </div>
        </div>

        <!-- Box do Detector de Vícios de Linguagem -->
        <div class="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div class="flex items-center justify-between gap-2 flex-wrap mb-2">
            <h5 class="text-xs font-black uppercase text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <i data-lucide="sparkles" class="w-4 h-4 text-amber-500"></i>
              <span>Detector de Vícios de Linguagem e Postura Oral</span>
            </h5>
            <span class="text-xs font-bold ${result.fillerWords.count === 0 ? 'text-emerald-600' : 'text-amber-600'}">
              ${result.fillerWords.count === 0 ? '✓ Dicção 100% limpa' : `${result.fillerWords.count} vício(s) detectado(s)`}
            </span>
          </div>
          <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            ${result.fillerWords.advice}
          </p>
          ${result.fillerWords.detected.length > 0 ? `
            <div class="flex flex-wrap gap-1.5 mt-3">
              ${result.fillerWords.detected.map(f => `
                <span class="px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-[11px] font-black">
                  "${f.term}": ${f.count}x
                </span>
              `).join('')}
            </div>
          ` : ''}
        </div>

        <!-- Pontos Fortes e Oportunidades de Melhoria -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Pontos Fortes -->
          <div class="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <h5 class="text-xs font-black uppercase text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5 mb-3">
              <i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-600"></i>
              <span>Pontos Fortes Identificados pelo RH</span>
            </h5>
            <ul class="text-xs text-slate-700 dark:text-slate-300 space-y-2 list-disc pl-4">
              ${result.strengths.map(s => `<li>${s}</li>`).join('')}
            </ul>
          </div>

          <!-- Oportunidades de Melhoria -->
          <div class="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <h5 class="text-xs font-black uppercase text-amber-800 dark:text-amber-400 flex items-center gap-1.5 mb-3">
              <i data-lucide="alert-triangle" class="w-4 h-4 text-amber-600"></i>
              <span>Como Tornar Sua Resposta Nota 10</span>
            </h5>
            <ul class="text-xs text-slate-700 dark:text-slate-300 space-y-2 list-disc pl-4">
              ${result.improvements.map(i => `<li>${i}</li>`).join('')}
            </ul>
          </div>
        </div>

        <!-- Exemplo de Resposta Modelo (Padrão RH - Método STAR) -->
        <div class="bg-blue-50/80 dark:bg-blue-950/50 p-5 rounded-2xl border border-blue-200 dark:border-blue-900 space-y-2">
          <h5 class="text-xs font-black uppercase text-[#002776] dark:text-blue-300 flex items-center gap-2">
            <i data-lucide="award" class="w-4 h-4 text-amber-500"></i>
            <span>Exemplo de Resposta Modelo Nota 10 (Estruturada no Método STAR)</span>
          </h5>
          <p class="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic bg-white/70 dark:bg-slate-900/70 p-4 rounded-xl border border-blue-100 dark:border-slate-800">
            "${result.idealAnswer}"
          </p>
        </div>

        <!-- Cursos Recomendados -->
        ${result.recommendedCourses && result.recommendedCourses.length > 0 ? `
          <div class="pt-2">
            <span class="text-[11px] font-black uppercase text-slate-500 tracking-wider block mb-2">
              Cursos Livres Gratuitos Recomendados para Fortalecer Este Tópico:
            </span>
            <div class="flex flex-wrap gap-2">
              ${result.recommendedCourses.map(c => `
                <a href="${c.url}" target="_blank" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 text-[#002776] dark:text-blue-300 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 transition-colors shadow-xs">
                  <i data-lucide="book-open" class="w-3.5 h-3.5 text-emerald-600"></i>
                  <span>${c.title}</span>
                </a>
              `).join('')}
            </div>
          </div>
        ` : ''}

      </div>
    `;

    feedbackBox.classList.remove('hidden');
    if (window.lucide) window.lucide.createIcons();
    feedbackBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /**
   * Renderização do Relatório Geral de Desempenho
   */
  function renderFinalSummary() {
    const container = document.getElementById('sim-interactive-area');
    if (!container) return;

    const areaData = INTERVIEW_DATA[currentSession.area];
    const totalAnswers = currentSession.answers.length;
    const avgScore = Math.round(
      currentSession.answers.reduce((acc, curr) => acc + curr.result.score, 0) / (totalAnswers || 1)
    );

    const avgClarity = Math.round(
      currentSession.answers.reduce((acc, curr) => acc + curr.result.criteria.clarity.score, 0) / (totalAnswers || 1)
    );
    const avgStar = Math.round(
      currentSession.answers.reduce((acc, curr) => acc + curr.result.criteria.star.score, 0) / (totalAnswers || 1)
    );
    const avgVocab = Math.round(
      currentSession.answers.reduce((acc, curr) => acc + curr.result.criteria.vocabulary.score, 0) / (totalAnswers || 1)
    );
    const avgRelevance = Math.round(
      currentSession.answers.reduce((acc, curr) => acc + curr.result.criteria.relevance.score, 0) / (totalAnswers || 1)
    );

    const totalWords = currentSession.answers.reduce((acc, curr) => acc + curr.result.wordCount, 0);
    const totalFillers = currentSession.answers.reduce((acc, curr) => acc + curr.result.fillerWords.count, 0);

    container.innerHTML = `
      <div id="sim-final-report-wrapper" class="bg-white dark:bg-slate-900 border-2 border-emerald-500 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8 animate-fade-in">
        
        <!-- Cabeçalho do Relatório -->
        <div class="text-center space-y-3">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 mb-1 shadow-inner">
            <i data-lucide="award" class="w-8 h-8"></i>
          </div>
          <span class="text-xs font-black uppercase tracking-widest text-[#002776] dark:text-blue-400 block">
            Portal Você Pode Tudo • Relatório Oficial de Simulação
          </span>
          <h3 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Parabéns! Simulação Concluída com Sucesso
          </h3>
          <p class="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            Você respondeu às ${totalAnswers} perguntas do simulador para a trilha profissional de <strong>${areaData.title}</strong>.
          </p>
        </div>

        <!-- Placar Geral & Nível de Prontidão -->
        <div class="p-6 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-blue-500/10 to-transparent border border-emerald-500/30 text-center space-y-2">
          <span class="text-xs font-black uppercase text-slate-500 tracking-wider">Média Geral de Prontidão para Entrevistas</span>
          <div class="text-6xl font-black text-slate-900 dark:text-white my-2">${avgScore}%</div>
          <div class="inline-block px-4 py-1.5 rounded-full text-xs font-black ${avgScore >= 75 ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300'}">
            ${avgScore >= 75 ? '🌟 Nível Alto • Pronto para Aprovação' : '💡 Nível em Desenvolvimento • Recomendado Reforço'}
          </div>
          <p class="text-xs text-slate-600 dark:text-slate-300 max-w-lg mx-auto pt-2">
            ${avgScore >= 75 
              ? 'Você articulou suas respostas com excelente fundamentação no Método STAR, vocabulário corporativo adequado e clareza de ideias.' 
              : 'Você deu ótimos passos iniciais! Com pequenas correções na estruturação do Método STAR e eliminação de vícios, sua aprovação será garantida.'}
          </p>
        </div>

        <!-- Breakdown dos 4 Pilares -->
        <div>
          <h4 class="text-xs font-black uppercase text-slate-700 dark:text-slate-300 tracking-wider mb-3 flex items-center gap-2">
            <i data-lucide="pie-chart" class="w-4 h-4 text-emerald-600"></i>
            <span>Desempenho Consolidado por Dimensão Avaliada</span>
          </h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
              <span class="text-[11px] font-bold text-slate-500 block">Clareza & Objetividade</span>
              <div class="text-2xl font-black text-blue-600 my-1">${avgClarity}%</div>
              <span class="text-[10px] text-slate-400">Ritmo & Conectivos</span>
            </div>
            <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
              <span class="text-[11px] font-bold text-slate-500 block">Método STAR</span>
              <div class="text-2xl font-black text-emerald-600 my-1">${avgStar}%</div>
              <span class="text-[10px] text-slate-400">Contexto & Resultado</span>
            </div>
            <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
              <span class="text-[11px] font-bold text-slate-500 block">Vocabulário Técnico</span>
              <div class="text-2xl font-black text-indigo-600 my-1">${avgVocab}%</div>
              <span class="text-[10px] text-slate-400">Terminologia da Área</span>
            </div>
            <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
              <span class="text-[11px] font-bold text-slate-500 block">Relevância para a Vaga</span>
              <div class="text-2xl font-black text-purple-600 my-1">${avgRelevance}%</div>
              <span class="text-[10px] text-slate-400">Aderência Temática</span>
            </div>
          </div>
        </div>

        <!-- Estatísticas Globais -->
        <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-around gap-4 text-center">
          <div>
            <span class="text-xs text-slate-500 block">Total de Palavras Articuladas</span>
            <span class="text-lg font-black text-slate-900 dark:text-white">${totalWords} palavras</span>
          </div>
          <div>
            <span class="text-xs text-slate-500 block">Vícios de Linguagem Detectados</span>
            <span class="text-lg font-black ${totalFillers === 0 ? 'text-emerald-600' : 'text-amber-600'}">${totalFillers} no total</span>
          </div>
          <div>
            <span class="text-xs text-slate-500 block">Perguntas Respondidas</span>
            <span class="text-lg font-black text-[#002776] dark:text-blue-400">${totalAnswers} de ${areaData.questions.length}</span>
          </div>
        </div>

        <!-- Campo Opcional para o Nome do Candidato no PDF -->
        <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
          <label for="sim-candidate-name-input" class="text-xs font-black uppercase text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <i data-lucide="user" class="w-3.5 h-3.5 text-emerald-600"></i>
            <span>Seu Nome Completo (para personalização do Relatório PDF Timbrado):</span>
          </label>
          <input 
            type="text" 
            id="sim-candidate-name-input" 
            placeholder="Ex: Maria Silva Santos" 
            class="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-bold focus:border-emerald-500 focus:outline-hidden"
          >
        </div>

        <!-- Botões de Ação Executiva: Exportar PDF & WhatsApp -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          
          <!-- Botão PDF -->
          <button 
            type="button" 
            id="sim-btn-export-pdf" 
            class="px-6 py-3.5 rounded-2xl bg-[#002776] hover:bg-[#001f5c] text-white font-black text-xs sm:text-sm transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2"
          >
            <i data-lucide="file-down" class="w-4 h-4 text-[#ffdf00]"></i>
            <span>Baixar Relatório em PDF (A4 Timbrado)</span>
          </button>

          <!-- Botão WhatsApp -->
          <button 
            type="button" 
            id="sim-btn-share-whatsapp" 
            class="px-6 py-3.5 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-white font-black text-xs sm:text-sm transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2"
          >
            <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
            <span>Compartilhar Desempenho no WhatsApp</span>
          </button>

        </div>

        <!-- Próximos Passos da Jornada do Aluno -->
        <div class="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <h4 class="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <i data-lucide="compass" class="w-4 h-4 text-[#002776] dark:text-blue-400"></i>
            <span>Próximos Passos na Sua Jornada de Empregabilidade</span>
          </h4>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <a href="curriculo.html" class="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 bg-slate-50 dark:bg-slate-800/50 transition-all text-center group shadow-2xs">
              <i data-lucide="file-text" class="w-6 h-6 text-emerald-600 mx-auto mb-2"></i>
              <span class="text-xs font-black text-slate-900 dark:text-white block group-hover:text-emerald-600">Criar Currículo ATS</span>
              <span class="text-[11px] text-slate-500 mt-1 block">Modelo gratuito e aprovado</span>
            </a>
            <a href="vagas.html" class="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 bg-slate-50 dark:bg-slate-800/50 transition-all text-center group shadow-2xs">
              <i data-lucide="briefcase" class="w-6 h-6 text-blue-600 mx-auto mb-2"></i>
              <span class="text-xs font-black text-slate-900 dark:text-white block group-hover:text-blue-600">Mural de Vagas</span>
              <span class="text-[11px] text-slate-500 mt-1 block">Oportunidades em todo o Brasil</span>
            </a>
            <a href="/" class="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-purple-500 bg-slate-50 dark:bg-slate-800/50 transition-all text-center group shadow-2xs">
              <i data-lucide="graduation-cap" class="w-6 h-6 text-purple-600 mx-auto mb-2"></i>
              <span class="text-xs font-black text-slate-900 dark:text-white block group-hover:text-purple-600">Cursos Gratuitos</span>
              <span class="text-[11px] text-slate-500 mt-1 block">Certificados oficiais gratuitos</span>
            </a>
          </div>
        </div>

        <div class="text-center pt-2">
          <button 
            type="button" 
            onclick="window.location.reload()" 
            class="px-8 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-black transition-all shadow-md cursor-pointer"
          >
            Treinar Outra Trilha Profissional ↺
          </button>
        </div>

      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    // Eventos dos botões PDF e WhatsApp
    setupReportActionButtons(avgScore, avgClarity, avgStar, avgVocab, avgRelevance, areaData);

    container.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /**
   * Configuração dos Botões de Compartilhamento e Download de PDF
   */
  function setupReportActionButtons(avgScore, avgClarity, avgStar, avgVocab, avgRelevance, areaData) {
    const pdfBtn = document.getElementById('sim-btn-export-pdf');
    const waBtn = document.getElementById('sim-btn-share-whatsapp');
    const nameInput = document.getElementById('sim-candidate-name-input');

    if (waBtn) {
      waBtn.addEventListener('click', () => {
        const candidateName = nameInput && nameInput.value.trim() ? nameInput.value.trim() : 'Candidato(a)';
        const textMsg = 
          `🎯 *Meu Desempenho no Simulador de Entrevistas de Emprego*\n` +
          `👤 *Nome:* ${candidateName}\n` +
          `🏢 *Área:* ${areaData.title}\n` +
          `⭐ *Nota Geral:* ${avgScore}/100 (${avgScore >= 75 ? 'Nível Aprovado 🌟' : 'Em Evolução 💡'})\n\n` +
          `📊 *Critérios Avaliados (Método STAR):*\n` +
          `• Clareza & Objetividade: ${avgClarity}%\n` +
          `• Aderência ao Método STAR: ${avgStar}%\n` +
          `• Vocabulário Profissional: ${avgVocab}%\n` +
          `• Relevância para a Vaga: ${avgRelevance}%\n\n` +
          `Treine você também gratuitamente para entrevistas com perguntas reais de RH:\n` +
          `👉 https://vocepodetudo.com/simulador-entrevista`;

        const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(textMsg)}`;
        window.open(waUrl, '_blank');
      });
    }

    if (pdfBtn) {
      pdfBtn.addEventListener('click', () => {
        const candidateName = nameInput && nameInput.value.trim() ? nameInput.value.trim() : 'Candidato(a) Você Pode Tudo';
        exportReportToPDF(candidateName, avgScore, avgClarity, avgStar, avgVocab, avgRelevance, areaData);
      });
    }
  }

  /**
   * Exportação do Relatório Oficial Timbrado A4 via html2pdf.js
   */
  function exportReportToPDF(candidateName, avgScore, avgClarity, avgStar, avgVocab, avgRelevance, areaData) {
    const pdfBtn = document.getElementById('sim-btn-export-pdf');
    if (pdfBtn) {
      pdfBtn.disabled = true;
      pdfBtn.innerHTML = `<span>Gerando PDF A4 Timbrado...</span>`;
    }

    const today = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });

    // Criação do Elemento HTML Timbrado A4 Estruturado
    const printElement = document.createElement('div');
    printElement.id = 'sim-pdf-timbrado-container';
    printElement.style.width = '794px'; // Largura aproximada A4 a 96 DPI
    printElement.style.padding = '35px 40px';
    printElement.style.fontFamily = 'Helvetica, Arial, sans-serif';
    printElement.style.color = '#1e293b';
    printElement.style.backgroundColor = '#ffffff';
    printElement.style.boxSizing = 'border-box';

    printElement.innerHTML = `
      <!-- Cabeçalho Timbrado Oficial -->
      <div style="border-bottom: 3px solid #002776; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <div style="font-size: 22px; font-weight: 900; color: #002776; text-transform: uppercase; letter-spacing: 0.5px;">
            Você Pode <span style="color: #009639;">Tudo</span>
          </div>
          <div style="font-size: 11px; font-weight: bold; color: #64748b; margin-top: 2px;">
            Plataforma Nacional de Empregabilidade e Qualificação Profissional Gratuita
          </div>
        </div>
        <div style="text-align: right;">
          <span style="font-size: 10px; font-weight: bold; background-color: #f1f5f9; padding: 4px 10px; border-radius: 6px; color: #334155; border: 1px solid #cbd5e1; text-transform: uppercase;">
            Relatório Oficial de Entrevista
          </span>
          <div style="font-size: 10px; color: #94a3b8; margin-top: 4px;">Emissão: ${today}</div>
        </div>
      </div>

      <!-- Dados do Candidato e da Trilha -->
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 18px; margin-bottom: 20px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
          <tr>
            <td style="padding: 3px 0; color: #64748b; width: 25%;"><strong>Candidato(a):</strong></td>
            <td style="padding: 3px 0; color: #0f172a; font-weight: bold;">${candidateName}</td>
            <td style="padding: 3px 0; color: #64748b; width: 20%;"><strong>Trilha de Vaga:</strong></td>
            <td style="padding: 3px 0; color: #002776; font-weight: bold;">${areaData.title}</td>
          </tr>
          <tr>
            <td style="padding: 3px 0; color: #64748b;"><strong>Critério Avaliativo:</strong></td>
            <td style="padding: 3px 0; color: #0f172a;">Método STAR (Situação, Tarefa, Ação, Resultado)</td>
            <td style="padding: 3px 0; color: #64748b;"><strong>Status de Prontidão:</strong></td>
            <td style="padding: 3px 0; color: ${avgScore >= 75 ? '#009639' : '#d97706'}; font-weight: bold;">
              ${avgScore >= 75 ? 'APROVADO (Nível Alto)' : 'EM DESENVOLVIMENTO'}
            </td>
          </tr>
        </table>
      </div>

      <!-- Resumo do Desempenho e Média Geral -->
      <div style="display: flex; gap: 15px; margin-bottom: 22px;">
        <!-- Card Nota Geral -->
        <div style="flex: 1; background: linear-gradient(135deg, #002776, #001f5c); color: #ffffff; padding: 16px; border-radius: 12px; text-align: center;">
          <div style="font-size: 10px; text-transform: uppercase; font-weight: bold; color: #ffdf00; letter-spacing: 0.5px;">Nota Geral de Entrevista</div>
          <div style="font-size: 42px; font-weight: 900; line-height: 1.1; margin: 6px 0;">${avgScore}%</div>
          <div style="font-size: 10px; color: #e2e8f0;">Base de 0 a 100 pontos</div>
        </div>

        <!-- Grade dos 4 Pilares -->
        <div style="flex: 2.2; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px 16px; background-color: #ffffff;">
          <div style="font-size: 11px; font-weight: 900; text-transform: uppercase; color: #334155; margin-bottom: 8px;">
            Desempenho por Critério STAR & Linguagem
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
            <tr>
              <td style="padding: 4px 0; color: #475569;">Clareza & Objetividade da Fala:</td>
              <td style="padding: 4px 0; font-weight: bold; text-align: right; color: #002776;">${avgClarity}%</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #475569;">Aderência à Estrutura STAR:</td>
              <td style="padding: 4px 0; font-weight: bold; text-align: right; color: #009639;">${avgStar}%</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #475569;">Vocabulário Técnico & Postura:</td>
              <td style="padding: 4px 0; font-weight: bold; text-align: right; color: #4f46e5;">${avgVocab}%</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #475569;">Relevância para a Função:</td>
              <td style="padding: 4px 0; font-weight: bold; text-align: right; color: #7c3aed;">${avgRelevance}%</td>
            </tr>
          </table>
        </div>
      </div>

      <!-- Detalhamento das Questões e Respostas -->
      <div style="margin-bottom: 20px;">
        <div style="font-size: 12px; font-weight: 900; text-transform: uppercase; color: #002776; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 12px;">
          Síntese das Respostas Avaliadas
        </div>

        ${currentSession.answers.map((item, idx) => `
          <div style="margin-bottom: 12px; border-left: 3px solid ${item.result.score >= 70 ? '#009639' : '#d97706'}; padding-left: 10px;">
            <div style="font-size: 11px; font-weight: bold; color: #0f172a;">
              Q${idx + 1}: ${item.question}
            </div>
            <div style="font-size: 10px; color: #475569; font-style: italic; margin-top: 3px; line-height: 1.3;">
              " ${item.answer.length > 180 ? item.answer.substring(0, 180) + '...' : item.answer} "
            </div>
            <div style="font-size: 10px; color: #64748b; margin-top: 3px;">
              <strong>Nota:</strong> ${item.result.score}/100 • <strong>STAR:</strong> ${item.result.criteria.star.score}% • <strong>Palavras:</strong> ${item.result.wordCount}
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Parecer Conclusivo Institucional -->
      <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 12px 15px; margin-bottom: 22px;">
        <div style="font-size: 11px; font-weight: 900; color: #166534; text-transform: uppercase; margin-bottom: 4px;">
          Parecer Pedagógico de Empregabilidade
        </div>
        <p style="font-size: 10px; color: #14532d; line-height: 1.4; margin: 0;">
          O candidato completou o treinamento no Simulador Você Pode Tudo, demonstrando prontidão para processos seletivos formais. Recomenda-se a continuidade nos cursos livres gratuitos de qualificação do portal para constante enriquecimento curricular.
        </p>
      </div>

      <!-- Rodapé Timbrado Oficial -->
      <div style="border-top: 1px solid #cbd5e1; padding-top: 10px; display: flex; justify-content: space-between; align-items: center; font-size: 9px; color: #94a3b8;">
        <div>Você Pode Tudo — Plataforma Gratuita • vocepodetudo.com</div>
        <div>Código de Validação da Simulação: VPT-${Math.random().toString(36).substring(2, 9).toUpperCase()}</div>
      </div>
    `;

    document.body.appendChild(printElement);

    const opt = {
      margin: [10, 10, 10, 10],
      filename: `Relatorio_Entrevista_${areaData.id}_${candidateName.replace(/\s+/g, '_')}_VocePodeTudo.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    if (window.html2pdf) {
      window.html2pdf().set(opt).from(printElement).save().then(() => {
        document.body.removeChild(printElement);
        if (pdfBtn) {
          pdfBtn.disabled = false;
          pdfBtn.innerHTML = `
            <i data-lucide="file-down" class="w-4 h-4 text-[#ffdf00]"></i>
            <span>Baixar Relatório em PDF (A4 Timbrado)</span>
          `;
          if (window.lucide) window.lucide.createIcons();
        }
      }).catch(err => {
        console.error('Falha ao gerar PDF via html2pdf:', err);
        document.body.removeChild(printElement);
        // Fallback nativo
        window.print();
        if (pdfBtn) {
          pdfBtn.disabled = false;
          pdfBtn.innerHTML = `
            <i data-lucide="file-down" class="w-4 h-4 text-[#ffdf00]"></i>
            <span>Baixar Relatório em PDF (A4 Timbrado)</span>
          `;
          if (window.lucide) window.lucide.createIcons();
        }
      });
    } else {
      // Fallback se biblioteca não carregada
      window.print();
      document.body.removeChild(printElement);
      if (pdfBtn) {
        pdfBtn.disabled = false;
        pdfBtn.innerHTML = `
          <i data-lucide="file-down" class="w-4 h-4 text-[#ffdf00]"></i>
          <span>Baixar Relatório em PDF (A4 Timbrado)</span>
        `;
        if (window.lucide) window.lucide.createIcons();
      }
    }
  }

  // Executar após o carregamento do DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
