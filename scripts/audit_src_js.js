const fs = require('fs');
const path = require('path');

const srcDir = path.resolve(__dirname, '..', 'src');
const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.js'));

const TARGET_WORDS = [
  'voce', 'curriculo', 'curriculos', 'conteudo', 'conteudos', 'modulo', 'modulos',
  'periodo', 'numero', 'numeros', 'duvida', 'duvidas', 'facil', 'dificil', 'util', 'uteis',
  'pagina', 'paginas', 'tecnico', 'tecnica', 'matricula', 'historico', 'especifico',
  'exercicio', 'genero', 'critico', 'indice', 'inicio', 'publico', 'publica',
  'pratico', 'pratica', 'anuncio', 'usuario', 'usuarios', 'relatorio', 'horario',
  'salario', 'salarios', 'beneficio', 'beneficios', 'experiencia', 'frequencia',
  'referencia', 'agencia', 'urgencia', 'ciencia', 'inteligencia', 'negocio', 'negocios',
  'proprio', 'necessario', 'comentario', 'proximo', 'proxima', 'area', 'areas',
  'nivel', 'niveis', 'disponivel', 'disponiveis', 'responsavel', 'sustentavel',
  'automatico', 'automatica', 'eletronico', 'eletronica', 'basico', 'basica',
  'dinamico', 'dinamica', 'grafico', 'economico', 'logistica', 'politica', 'juridico',
  'saude', 'tambem', 'alem', 'porem', 'atraves', 'apos', 'atras', 'parabens',
  'educacao', 'comunicacao', 'programacao', 'informacao', 'formacao', 'capacitacao',
  'qualificacao', 'administracao', 'organizacao', 'inscricao', 'producao', 'criacao',
  'avaliacao', 'publicacao', 'atualizacao', 'apresentacao', 'duracao', 'introducao',
  'conclusao', 'situacao', 'atencao', 'gestao', 'funcao', 'opcao', 'solucao',
  'orientacao', 'redacao', 'validacao', 'selecao', 'descricao', 'simplificacao',
  'automacao', 'certificacao', 'localizacao', 'solicitacao', 'visualizacao',
  'interacao', 'inovacao', 'evolucao', 'gratificacao', 'seguranca', 'lideranca',
  'avancado', 'avancada', 'comecar', 'recomecar', 'gratúito', 'gratúita', 'ítem', 'ítens'
];

const regexList = TARGET_WORDS.map(w => ({
  word: w,
  rx: new RegExp(`(?<!\\p{L})${w}(?!\\p{L})`, 'gui')
}));

console.log('Auditing src/*.js user strings...');
files.forEach(f => {
  const filePath = path.join(srcDir, f);
  const code = fs.readFileSync(filePath, 'utf8');

  // Pegar literais de string (aspas simples, duplas ou template strings)
  const stringLiterals = code.match(/(['"`])(?:(?=(\\?))\2.)*?\1/g) || [];
  
  let foundCount = 0;
  stringLiterals.forEach(lit => {
    // Ignorar strings que são seletores CSS, URLs, caminhos de arquivo, regexes ou identificadores técnicos
    const val = lit.slice(1, -1);
    if (!val || val.length < 3) return;
    if (val.startsWith('#') || val.startsWith('.') || val.startsWith('/') || val.startsWith('http') || val.includes('px') || val.includes('xmlns') || val.includes('aria-')) return;
    if (/^[a-zA-Z0-9_-]+$/.test(val) && !val.includes(' ') && val.length < 15) {
      // Provável ID ou classe simples ou chave
      return;
    }

    regexList.forEach(item => {
      let match;
      const rx = new RegExp(item.rx.source, 'gui');
      while ((match = rx.exec(val)) !== null) {
        // Verificar se é texto de UI
        const snippet = val.substring(Math.max(0, match.index - 20), Math.min(val.length, match.index + match[0].length + 20)).replace(/\s+/g, ' ');
        if (!snippet.includes('.js') && !snippet.includes('.php') && !snippet.includes('.html') && !snippet.includes('api/')) {
          console.log(`[${f}] "${match[0]}" no contexto: "${snippet}"`);
          foundCount++;
        }
      }
    });
  });
  if (foundCount > 0) {
    console.log(`==> Total em ${f}: ${foundCount}\n`);
  }
});
