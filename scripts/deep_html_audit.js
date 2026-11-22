const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');

// Dicionário ampliado de checagem
const EXPANDED_DICT = {
  // Acentuação e cedilha
  'portugues': 'português',
  'ingles': 'inglês',
  'frances': 'francês',
  'alemao': 'alemão',
  'visao': 'visão',
  'visoes': 'visões',
  'padrao': 'padrão',
  'padroes': 'padrões',
  'cartao': 'cartão',
  'cartoes': 'cartões',
  'botoes': 'botões',
  'botao': 'botão',
  'razao': 'razão',
  'razoes': 'razões',
  'uniao': 'união',
  'reuniao': 'reunião',
  'reunioes': 'reuniões',
  'opiniao': 'opinião',
  'opinioes': 'opiniões',
  'regiao': 'região',
  'regioes': 'regiões',
  'orgao': 'órgão',
  'orgaos': 'órgãos',
  'bencao': 'bênção',
  'bencaos': 'bênçãos',
  'acao': 'ação',
  'acoes': 'ações',
  'reacao': 'reação',
  'solucao': 'solução',
  'solucoes': 'soluções',
  'geracao': 'geração',
  'atencao': 'atenção',
  'intencao': 'intenção',
  'direcao': 'direção',
  'secao': 'seção',
  'secoes': 'seções',
  'opcao': 'opção',
  'opcoes': 'opções',
  'protecao': 'proteção',
  'selecao': 'seleção',
  'selecoes': 'seleções',
  'situacao': 'situação',
  'situacoes': 'situações',
  'funcao': 'função',
  'funcoes': 'funções',
  'instituicao': 'instituição',
  'instituicoes': 'instituições',
  'distribuicao': 'distribuição',
  'atribuicao': 'atribuição',
  'contribuicao': 'contribuição',
  'contribuicoes': 'contribuições',
  'evolucao': 'evolução',
  'resolucao': 'resolução',
  'resolucoes': 'resoluções',
  'execucao': 'execução',
  'traducao': 'tradução',
  'producao': 'produção',
  'producoes': 'produções',
  'introducao': 'introdução',
  'reducao': 'redução',
  'reducoes': 'reduções',
  'instrucao': 'instrução',
  'instrucoes': 'instruções',
  'construcao': 'construção',
  'construcoes': 'construções',
  'posicao': 'posição',
  'posicoes': 'posições',
  'disposicao': 'disposição',
  'proposicao': 'proposição',
  'composicao': 'composição',
  'precisao': 'precisão',
  'decisao': 'decisão',
  'decisoes': 'decisões',
  'divisao': 'divisão',
  'divisoes': 'divisões',
  'previsao': 'previsão',
  'revisao': 'revisão',
  'revisoes': 'revisões',
  'inclusao': 'inclusão',
  'exclusao': 'exclusão',
  'conclusao': 'conclusão',
  'conclusoes': 'conclusões',
  'adesao': 'adesão',
  'extensao': 'extensão',
  'dimensao': 'dimensão',
  'dimensoes': 'dimensões',
  'expansao': 'expansão',
  'missao': 'missão',
  'missoes': 'missões',
  'emissao': 'emissão',
  'admissao': 'admissão',
  'demissao': 'demissão',
  'permissao': 'permissão',
  'transmissao': 'transmissão',
  'comissao': 'comissão',
  'sessao': 'sessão',
  'sessoes': 'sessões',
  'pressao': 'pressão',
  'impressao': 'impressão',
  'expressao': 'expressão',
  'profissao': 'profissão',
  'profissoes': 'profissões',
  'discussao': 'discussão',
  'discussoes': 'discussões',
  'gratidao': 'gratidão',
  'cidadao': 'cidadão',
  'cidadaos': 'cidadãos',
  'irmao': 'irmão',
  'irmaos': 'irmãos',

  // Outras oxítonas / paroxítonas / proparoxítonas
  'voce': 'você',
  'voces': 'vocês',
  'curriculo': 'currículo',
  'curriculos': 'currículos',
  'conteudo': 'conteúdo',
  'conteudos': 'conteúdos',
  'modulo': 'módulo',
  'modulos': 'módulos',
  'periodo': 'período',
  'periodos': 'períodos',
  'numero': 'número',
  'numeros': 'números',
  'duvida': 'dúvida',
  'duvidas': 'dúvidas',
  'facil': 'fácil',
  'faceis': 'fáceis',
  'dificil': 'difícil',
  'dificeis': 'difíceis',
  'util': 'útil',
  'uteis': 'úteis',
  'pagina': 'página',
  'paginas': 'páginas',
  'tecnico': 'técnico',
  'tecnicos': 'técnicos',
  'tecnica': 'técnica',
  'tecnicas': 'técnicas',
  'matricula': 'matrícula',
  'matriculas': 'matrículas',
  'historico': 'histórico',
  'historicos': 'históricos',
  'historica': 'histórica',
  'historicas': 'históricas',
  'especifico': 'específico',
  'especificos': 'específicos',
  'especifica': 'específica',
  'especificas': 'específicas',
  'exercicio': 'exercício',
  'exercicios': 'exercícios',
  'genero': 'gênero',
  'generos': 'gêneros',
  'critico': 'crítico',
  'criticos': 'críticos',
  'critica': 'crítica',
  'criticas': 'críticas',
  'identico': 'idêntico',
  'identicos': 'idênticos',
  'especie': 'espécie',
  'especies': 'espécies',
  'indice': 'índice',
  'indices': 'índices',
  'inicio': 'início',
  'inicios': 'inícios',
  'publico': 'público',
  'publicos': 'públicos',
  'publica': 'pública',
  'publicas': 'públicas',
  'pratico': 'prático',
  'praticos': 'práticos',
  'pratica': 'prática',
  'praticas': 'práticas',
  'anuncio': 'anúncio',
  'anuncios': 'anúncios',
  'usuario': 'usuário',
  'usuarios': 'usuários',
  'usuaria': 'usuária',
  'usuarias': 'usuárias',
  'relatorio': 'relatório',
  'relatorios': 'relatórios',
  'horario': 'horário',
  'horarios': 'horários',
  'salario': 'salário',
  'salarios': 'salários',
  'beneficio': 'benefício',
  'beneficios': 'benefícios',
  'experiencia': 'experiência',
  'experiencias': 'experiências',
  'frequencia': 'frequência',
  'referencia': 'referência',
  'referencias': 'referências',
  'agencia': 'agência',
  'agencias': 'agências',
  'urgencia': 'urgência',
  'ciencia': 'ciência',
  'ciencias': 'ciências',
  'inteligencia': 'inteligência',
  'negocio': 'negócio',
  'negocios': 'negócios',
  'proprio': 'próprio',
  'proprios': 'próprios',
  'propria': 'própria',
  'proprias': 'próprias',
  'necessario': 'necessário',
  'necessarios': 'necessários',
  'necessaria': 'necessária',
  'necessarias': 'necessárias',
  'comentario': 'comentário',
  'comentarios': 'comentários',
  'termino': 'término',
  'proximo': 'próximo',
  'proximos': 'próximos',
  'proxima': 'próxima',
  'proximas': 'próximas',
  'area': 'área',
  'areas': 'áreas',
  'nivel': 'nível',
  'niveis': 'níveis',
  'disponivel': 'disponível',
  'disponiveis': 'disponíveis',
  'responsavel': 'responsável',
  'responsaveis': 'responsáveis',
  'sustentavel': 'sustentável',
  'acessivel': 'acessível',
  'acessiveis': 'acessíveis',
  'automatico': 'automático',
  'automatica': 'automática',
  'automaticos': 'automáticos',
  'automaticas': 'automáticas',
  'eletronico': 'eletrônico',
  'eletronica': 'eletrônica',
  'eletronicos': 'eletrônicos',
  'eletronicas': 'eletrônicas',
  'basico': 'básico',
  'basica': 'básica',
  'basicos': 'básicos',
  'basicas': 'básicas',
  'dinamico': 'dinâmico',
  'dinamica': 'dinâmica',
  'dinamicos': 'dinâmicos',
  'dinamicas': 'dinâmicas',
  'academico': 'acadêmico',
  'academica': 'acadêmica',
  'grafico': 'gráfico',
  'graficos': 'gráficos',
  'grafica': 'gráfica',
  'graficas': 'gráficas',
  'economico': 'econômico',
  'economica': 'econômica',
  'economicos': 'econômicos',
  'logistica': 'logística',
  'logistico': 'logístico',
  'pedagogico': 'pedagógico',
  'pedagogica': 'pedagógica',
  'estatistica': 'estatística',
  'estatistico': 'estatístico',
  'politica': 'política',
  'politico': 'político',
  'politicas': 'políticas',
  'politicos': 'políticos',
  'juridico': 'jurídico',
  'juridica': 'jurídica',
  'previdenciario': 'previdenciário',
  'previdenciaria': 'previdenciária',
  'bancario': 'bancário',
  'bancaria': 'bancária',
  'universitario': 'universitário',
  'universitaria': 'universitária',
  'tributario': 'tributário',
  'tributaria': 'tributária',
  'diario': 'diário',
  'diaria': 'diária',
  'diarios': 'diários',
  'diarias': 'diárias',
  'obrigatorio': 'obrigatório',
  'obrigatoria': 'obrigatória',
  'obrigatorios': 'obrigatórios',
  'obrigatorias': 'obrigatórias',
  'sanitario': 'sanitário',
  'sanitaria': 'sanitária',
  'voluntario': 'voluntário',
  'voluntaria': 'voluntária',
  'extraordinario': 'extraordinário',
  'intermediario': 'intermediário',
  'intermediaria': 'intermediária',
  'comunitario': 'comunitário',
  'comunitaria': 'comunitária',
  'prioritario': 'prioritário',
  'prioritaria': 'prioritária',
  'imobiliario': 'imobiliário',
  'imobiliaria': 'imobiliária',
  'saude': 'saúde',
  'ate': 'até',
  'tambem': 'também',
  'alem': 'além',
  'porem': 'porém',
  'atraves': 'através',
  'apos': 'após',
  'atras': 'atrás',
  'parabens': 'parabéns',
  'estao': 'estão',
  'serao': 'serão',
  'farao': 'farão',
  'contem': 'contém',
  'mantem': 'mantém',
  'obtem': 'obtém',
  'educacao': 'educação',
  'comunicacao': 'comunicação',
  'programacao': 'programação',
  'informacao': 'informação',
  'formacao': 'formação',
  'capacitacao': 'capacitação',
  'qualificacao': 'qualificação',
  'profissionalizacao': 'profissionalização',
  'administracao': 'administração',
  'organizacao': 'organização',
  'inscricao': 'inscrição',
  'atualizacao': 'atualização',
  'apresentacao': 'apresentação',
  'duracao': 'duração',
  'gestao': 'gestão',
  'orientacao': 'orientação',
  'computacao': 'computação',
  'redacao': 'redação',
  'validacao': 'validação',
  'formalizacao': 'formalização',
  'fundacao': 'fundação',
  'vocacao': 'vocação',
  'efetivacao': 'efetivação',
  'indicacao': 'indicação',
  'procrastinacao': 'procrastinação',
  'transicao': 'transição',
  'descricao': 'descrição',
  'simplificacao': 'simplificação',
  'automacao': 'automação',
  'certificacao': 'certificação',
  'remuneracao': 'remuneração',
  'contratacao': 'contratação',
  'localizacao': 'localização',
  'solicitacao': 'solicitação',
  'visualizacao': 'visualização',
  'interacao': 'interação',
  'inovacao': 'inovação',
  'integracao': 'integração',
  'atuacao': 'atuação',
  'gratificacao': 'gratificação',
  'participacao': 'participação',
  'seguranca': 'segurança',
  'lideranca': 'liderança',
  'diferenca': 'diferença',
  'avancado': 'avançado',
  'avancada': 'avançada',
  'avancar': 'avançar',
  'comecar': 'começar',
  'recomecar': 'recomeçar',

  // Erros ortográficos e palavras com letras erradas/trocadas
  'gratúito': 'gratuito',
  'gratúita': 'gratuita',
  'gratúitos': 'gratuitos',
  'gratúitas': 'gratuitas',
  'ítem': 'item',
  'ítens': 'itens',
  'previlegio': 'privilégio',
  'beneficiente': 'beneficente',
  'concerteza': 'com certeza',
  'derrepente': 'de repente',
  'porisso': 'por isso',
  'paralizar': 'paralisar',
  'analizar': 'analisar',
  'pesquizar': 'pesquisar',
  'excessão': 'exceção',
  'pretenção': 'pretensão',
  'ascenção': 'ascensão',
  'extenção': 'extensão',
  'compreenção': 'compreensão',
  'suspenção': 'suspensão',
  'discução': 'discussão',
  'reivindicar': 'reivindicar',
  'reinvidicar': 'reivindicar',
  'compania': 'companhia'
};

const words = Object.keys(EXPANDED_DICT);
words.sort((a, b) => b.length - a.length);

const REGEX_LIST = words.map(w => ({
  word: w,
  rx: new RegExp(`(?<!\\p{L})${w}(?!\\p{L})`, 'gui'),
  replace: EXPANDED_DICT[w]
}));

const htmlFiles = fs.readdirSync(projectRoot).filter(f => f.endsWith('.html'));

console.log('Varrendo todos os arquivos HTML em busca de erros...');
let totalHtmlIssues = 0;
const results = {};

htmlFiles.forEach(file => {
  const p = path.join(projectRoot, file);
  const content = fs.readFileSync(p, 'utf8');

  // Ignorar tags <script> e <style>
  const stripped = content
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ');

  // Checar textos visíveis
  const matches = stripped.match(/>([^<]+)</g) || [];
  matches.forEach(m => {
    const text = m.substring(1, m.length - 1).trim();
    if (!text || text.length < 2) return;
    if (text.startsWith('http') || text.includes('.css') || text.includes('.js')) return;

    REGEX_LIST.forEach(item => {
      let match;
      const rx = new RegExp(item.rx.source, 'gui');
      while ((match = rx.exec(text)) !== null) {
        const snippet = text.substring(Math.max(0, match.index - 20), Math.min(text.length, match.index + match[0].length + 20)).replace(/\s+/g, ' ');
        if (!snippet.includes('.html') && !snippet.includes('http') && !snippet.includes('class=')) {
          results[file] = results[file] || [];
          results[file].push({
            type: 'HTML Text',
            found: match[0],
            correct: item.replace,
            snippet
          });
          totalHtmlIssues++;
        }
      }
    });
  });

  // Checar meta description / keywords
  const metaRegex = /<meta[^>]+(?:description|keywords|title)[^>]+content=["']([^"']+)["']/gi;
  let mm;
  while ((mm = metaRegex.exec(content)) !== null) {
    const text = mm[1];
    REGEX_LIST.forEach(item => {
      let match;
      const rx = new RegExp(item.rx.source, 'gui');
      while ((match = rx.exec(text)) !== null) {
        const snippet = text.substring(Math.max(0, match.index - 20), Math.min(text.length, match.index + match[0].length + 20)).replace(/\s+/g, ' ');
        results[file] = results[file] || [];
        results[file].push({
          type: 'Meta Tag',
          found: match[0],
          correct: item.replace,
          snippet
        });
        totalHtmlIssues++;
      }
    });
  }

  // Checar placeholders e aria-labels
  const attrRegex = /(?:placeholder|title|aria-label)=["']([^"']+)["']/gi;
  let am;
  while ((am = attrRegex.exec(content)) !== null) {
    const text = am[1];
    if (text.startsWith('http') || text.includes('.html')) continue;
    REGEX_LIST.forEach(item => {
      let match;
      const rx = new RegExp(item.rx.source, 'gui');
      while ((match = rx.exec(text)) !== null) {
        const snippet = text.substring(Math.max(0, match.index - 20), Math.min(text.length, match.index + match[0].length + 20)).replace(/\s+/g, ' ');
        results[file] = results[file] || [];
        results[file].push({
          type: 'Attribute',
          found: match[0],
          correct: item.replace,
          snippet
        });
        totalHtmlIssues++;
      }
    });
  }
});

console.log(`Total de problemas encontrados em arquivos HTML: ${totalHtmlIssues}`);
Object.keys(results).forEach(f => {
  console.log(`\n📄 ${f} (${results[f].length}):`);
  results[f].forEach(iss => {
    console.log(`  - [${iss.type}] "${iss.found}" -> "${iss.correct}" | "${iss.snippet}"`);
  });
});
