const fs = require('fs');
const path = require('path');
const baseDir = path.resolve(__dirname, '..');

// Atualizar rss.xml adicionando os 3 novos artigos no topo do canal
const rssPath = path.join(baseDir, 'rss.xml');
let rss = fs.readFileSync(rssPath, 'utf-8');

const newRssItems = `    <item>
      <title>Seguro-Desemprego 2026: Quem Tem Direito, Tabela Oficial de Valores e Como Pedir pelo Celular</title>
      <link>https://www.vocepodetudo.com/blog.html?slug=seguro-desemprego-2026-regras-tabela-como-pedir</link>
      <description>Confira as faixas salariais, quantidade de parcelas (de 3 a 5), piso garantido de R$ 1.518,00 e o passo a passo para solicitar o benefício no Gov.br.</description>
      <pubDate>Sun, 01 Nov 2026 15:10:00 -0300</pubDate>
      <guid>https://www.vocepodetudo.com/blog.html?slug=seguro-desemprego-2026-regras-tabela-como-pedir</guid>
    </item>
    <item>
      <title>Como Fazer uma Carta de Apresentação que Conquista Entrevistas na Gupy e LinkedIn (Com Modelos)</title>
      <link>https://www.vocepodetudo.com/blog.html?slug=carta-de-apresentacao-para-gupy-linkedin-modelos</link>
      <description>Aprenda a preencher o campo de carta de apresentação em plataformas de vagas para destacar seu perfil logo na triagem inicial.</description>
      <pubDate>Sun, 01 Nov 2026 15:15:00 -0300</pubDate>
      <guid>https://www.vocepodetudo.com/blog.html?slug=carta-de-apresentacao-para-gupy-linkedin-modelos</guid>
    </item>
    <item>
      <title>Concursos Federais e Bancários 2026: Cronograma de Estudos para Passar na Caixa e Correios</title>
      <link>https://www.vocepodetudo.com/blog.html?slug=concursos-publicos-2026-bancos-correios-como-estudar</link>
      <description>Estratégia completa de estudos por ciclos, disciplinas com maior peso e modelo de planilha de acompanhamento semanal de questões.</description>
      <pubDate>Sun, 01 Nov 2026 15:20:00 -0300</pubDate>
      <guid>https://www.vocepodetudo.com/blog.html?slug=concursos-publicos-2026-bancos-correios-como-estudar</guid>
    </item>`;

rss = rss.replace('<channel>', '<channel>\n' + newRssItems);
fs.writeFileSync(rssPath, rss, 'utf-8');
console.log('[OK] rss.xml atualizado com os novos artigos!');

// Atualizar sw.js para v4.45.0
const swPath = path.join(baseDir, 'sw.js');
let sw = fs.readFileSync(swPath, 'utf-8');
sw = sw.replace(/vocepodetudo-pwa-v\d+\.\d+\.\d+/g, 'vocepodetudo-pwa-v4.45.0');
fs.writeFileSync(swPath, sw, 'utf-8');
console.log('[OK] sw.js atualizado para v4.45.0!');
