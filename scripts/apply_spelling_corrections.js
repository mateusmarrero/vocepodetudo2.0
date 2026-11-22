const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');

console.log('=== APLICANDO CORREÇÕES ORTOGRÁFICAS E ACENTUAÇÃO ===\n');

// 1. Corrigir admin.html
const adminPath = path.join(projectRoot, 'admin.html');
let adminHtml = fs.readFileSync(adminPath, 'utf8');
const originalAdmin = adminHtml;

adminHtml = adminHtml.replace(
  'Controle em tempo real a faixa de aviso exibida no topo de todas as paginas para os visitantes do Você Pode Tudo.',
  'Controle em tempo real a faixa de aviso exibida no topo de todas as páginas para os visitantes do Você Pode Tudo.'
);

adminHtml = adminHtml.replace(
  'Previa Visual em Tempo Real (Como o Visitante Ve no Topo do Site)',
  'Prévia Visual em Tempo Real (Como o Visitante Vê no Topo do Site)'
);

adminHtml = adminHtml.replace(
  'Configuracoes do Banner no Topo',
  'Configurações do Banner no Topo'
);

adminHtml = adminHtml.replace(
  '<span class="font-black text-slate-900 block text-sm">Status de Exibicao no Portal</span>',
  '<span class="font-black text-slate-900 block text-sm">Status de Exibição no Portal</span>'
);

adminHtml = adminHtml.replace(
  'O aviso esta atualmente visivel para todos os visitantes do site.',
  'O aviso está atualmente visível para todos os visitantes do site.'
);

adminHtml = adminHtml.replace(
  'Modelos de Texto Rapidos (Clique para preencher):',
  'Modelos de Texto Rápidos (Clique para preencher):'
);

adminHtml = adminHtml.replace(
  'data-msg="🎓 Bem-vindo ao portal de curadoria Voce Pode Tudo! Cursos 100% gratuitos direcionados as instituicoes oficiais."',
  'data-msg="🎓 Bem-vindo ao portal de curadoria Você Pode Tudo! Cursos 100% gratuitos direcionados às instituições oficiais."'
);

adminHtml = adminHtml.replace(
  'data-msg="📢 Novos cursos gratuitos da Fundacao Bradesco, Cisco, Sebrae e EV.G Gov adicionados esta semana!"',
  'data-msg="📢 Novos cursos gratuitos da Fundação Bradesco, Cisco, Sebrae e EV.G Gov adicionados esta semana!"'
);

adminHtml = adminHtml.replace(
  'data-msg="🎯 Vagas abertas para Jovem Aprendiz 2026 e estagio! Monte seu curriculo gratuito no portal."',
  'data-msg="🎯 Vagas abertas para Jovem Aprendiz 2026 e estágio! Monte seu currículo gratuito no portal."'
);

adminHtml = adminHtml.replace(
  '🎯 Vagas & Estagio',
  '🎯 Vagas & Estágio'
);

adminHtml = adminHtml.replace(
  'placeholder="Ex: 📢 Bem-vindo ao portal oficial Você Pode Tudo! Cursos 100% gratuitos das maiores instituicoes do Brasil."',
  'placeholder="Ex: 📢 Bem-vindo ao portal oficial Você Pode Tudo! Cursos 100% gratuitos das maiores instituições do Brasil."'
);

adminHtml = adminHtml.replace(
  '<option value="danger">Alerta Critico / Urgente (Vermelho)</option>',
  '<option value="danger">Alerta Crítico / Urgente (Vermelho)</option>'
);

adminHtml = adminHtml.replace(
  '<label for="announcement-link-input" class="block font-black text-slate-700 mb-1">Link de Acao (Opcional)</label>',
  '<label for="announcement-link-input" class="block font-black text-slate-700 mb-1">Link de Ação (Opcional)</label>'
);

adminHtml = adminHtml.replace(
  '<label for="announcement-linktext-input" class="block font-black text-slate-700 mb-1">Texto do Botao (Opcional)</label>',
  '<label for="announcement-linktext-input" class="block font-black text-slate-700 mb-1">Texto do Botão (Opcional)</label>'
);

if (adminHtml !== originalAdmin) {
  fs.writeFileSync(adminPath, adminHtml, 'utf8');
  console.log('✅ admin.html: textos e labels acentuados corretamente.');
} else {
  console.log('ℹ️ admin.html já estava corrigido.');
}

// 2. Corrigir meta tags em arquivos HTML específicos
const META_FIXES = {
  'calculadora-trabalhista.html': [
    ['salario liquido', 'salário líquido']
  ],
  'central-de-ajuda.html': [
    ['duvidas', 'dúvidas']
  ],
  'cursos-gratis-administracao.html': [
    ['gestao financeira', 'gestão financeira']
  ],
  'cursos-gratis-excel.html': [
    ['excel basico ao avancado', 'excel básico ao avançado'],
    ['formulas excel', 'fórmulas excel'],
    ['procv gratis', 'procv grátis'],
    ['tabela dinamica', 'tabela dinâmica']
  ],
  'cursos-gratis-ia.html': [
    ['cursos gratis de inteligencia artificial', 'cursos grátis de inteligência artificial']
  ],
  'cursos-gratis-informatica.html': [
    ['curso de informatica basica', 'curso de informática básica'],
    ['aprender computador gratis', 'aprender computador grátis'],
    ['inclusao digital', 'inclusão digital']
  ],
  'cursos-gratis-ingles.html': [
    ['curso de ingles gratis', 'curso de inglês grátis'],
    ['ingles para iniciantes', 'inglês para iniciantes'],
    ['ingles mercado de trabalho', 'inglês mercado de trabalho'],
    ['aprender ingles online gratis', 'aprender inglês online grátis'],
    ['ingles mec aprenda mais', 'inglês mec aprenda mais'],
    ['ingles fundação bradesco', 'inglês fundação bradesco']
  ],
  'funcionalidades.html': [
    ['gerador de curriculo gratis', 'gerador de currículo grátis']
  ],
  'index.html': [
    ['concurso publico cursos gratis', 'concurso público cursos grátis']
  ],
  'parcerias.html': [
    ['responsabilidade social educacao brasil', 'responsabilidade social educação brasil']
  ],
  'planos.html': [
    ['gerador de curriculo gratis', 'gerador de currículo grátis']
  ],
  'politica-de-cookies.html': [
    ['politica de cookies você pode tudo', 'política de cookies você pode tudo']
  ],
  'recursos.html': [
    ['gerador curriculo pdf', 'gerador currículo pdf']
  ],
  'vagas-jovem-aprendiz-2026.html': [
    ['jovem aprendiz salario', 'jovem aprendiz salário']
  ]
};

Object.keys(META_FIXES).forEach(f => {
  const filePath = path.join(projectRoot, f);
  if (!fs.existsSync(filePath)) return;
  let html = fs.readFileSync(filePath, 'utf8');
  let orig = html;
  META_FIXES[f].forEach(([search, rep]) => {
    html = html.split(search).join(rep);
  });
  if (html !== orig) {
    fs.writeFileSync(filePath, html, 'utf8');
    console.log(`✅ ${f}: meta tags e termos atualizados com acentuação.`);
  }
});

// 3. Corrigir categoryName em src/data/courses.js
const coursesJsPath = path.join(projectRoot, 'src', 'data', 'courses.js');
if (fs.existsSync(coursesJsPath)) {
  let code = fs.readFileSync(coursesJsPath, 'utf8');
  let orig = code;

  const CATEGORY_NAME_MAP = {
    '"categoryName": "saude"': '"categoryName": "Saúde"',
    '"categoryName": "gestao"': '"categoryName": "Gestão"',
    '"categoryName": "negocios"': '"categoryName": "Negócios"',
    '"categoryName": "financas"': '"categoryName": "Finanças"',
    '"categoryName": "tecnologia"': '"categoryName": "Tecnologia"',
    '"categoryName": "ia"': '"categoryName": "Inteligência Artificial"',
    '"categoryName": "empreendedorismo"': '"categoryName": "Empreendedorismo"',
    '"categoryName": "concursos"': '"categoryName": "Concursos Públicos"',
    '"categoryName": "idiomas"': '"categoryName": "Idiomas"',
    '"categoryName": "acessibilidade"': '"categoryName": "Acessibilidade"',
    '"categoryName": "educação"': '"categoryName": "Educação"',
    '"categoryName": "artes"': '"categoryName": "Artes & Design"',
    '"categoryName": "produtividade"': '"categoryName": "Produtividade"',
    '"categoryName": "nuvem"': '"categoryName": "Computação em Nuvem"',
    '"categoryName": "agro"': '"categoryName": "Agronegócio"',
    '"categoryName": "outros"': '"categoryName": "Geral"',
    '"categoryName": "profissionalização"': '"categoryName": "Profissionalização"'
  };

  Object.keys(CATEGORY_NAME_MAP).forEach(k => {
    code = code.split(k).join(CATEGORY_NAME_MAP[k]);
  });

  if (code !== orig) {
    fs.writeFileSync(coursesJsPath, code, 'utf8');
    console.log('✅ src/data/courses.js: categoryName de todos os cursos devidamente capitalizados e acentuados.');
  }
}

// 4. Corrigir api/seed_courses.json e api/cache_courses.json
const CAT_JSON_MAP = {
  'saude': 'Saúde',
  'gestao': 'Gestão',
  'negocios': 'Negócios',
  'financas': 'Finanças',
  'tecnologia': 'Tecnologia',
  'ia': 'Inteligência Artificial',
  'empreendedorismo': 'Empreendedorismo',
  'concursos': 'Concursos Públicos',
  'idiomas': 'Idiomas',
  'acessibilidade': 'Acessibilidade',
  'educacao': 'Educação',
  'educação': 'Educação',
  'artes': 'Artes & Design',
  'produtividade': 'Produtividade',
  'nuvem': 'Computação em Nuvem',
  'agro': 'Agronegócio',
  'outros': 'Geral',
  'profissionalizacao': 'Profissionalização',
  'profissionalização': 'Profissionalização'
};

['seed_courses.json', 'cache_courses.json'].forEach(cf => {
  const cPath = path.join(projectRoot, 'api', cf);
  if (fs.existsSync(cPath)) {
    const courses = JSON.parse(fs.readFileSync(cPath, 'utf8'));
    let changed = false;
    courses.forEach(c => {
      if (c.categoryName && CAT_JSON_MAP[c.categoryName]) {
        c.categoryName = CAT_JSON_MAP[c.categoryName];
        changed = true;
      }
    });
    if (changed) {
      fs.writeFileSync(cPath, JSON.stringify(courses, null, 2), 'utf8');
      console.log(`✅ api/${cf}: categoryName atualizados com acentuação oficial.`);
    }
  }
});

// 5. Corrigir api/seed_jobs.json e api/cache_jobs.json (area: "saude" -> "Saúde")
['seed_jobs.json', 'cache_jobs.json'].forEach(jf => {
  const jPath = path.join(projectRoot, 'api', jf);
  if (fs.existsSync(jPath)) {
    const jobs = JSON.parse(fs.readFileSync(jPath, 'utf8'));
    let changed = false;
    jobs.forEach(j => {
      if (j.area === 'saude') {
        j.area = 'Saúde';
        changed = true;
      }
      if (j.area === 'administração') {
        j.area = 'Administração';
        changed = true;
      }
      if (j.area === 'operacoes') {
        j.area = 'Operações';
        changed = true;
      }
      if (j.area === 'tecnologia') {
        j.area = 'Tecnologia';
        changed = true;
      }
      if (j.area === 'marketing') {
        j.area = 'Marketing';
        changed = true;
      }
      if (j.area === 'comercial') {
        j.area = 'Comercial';
        changed = true;
      }
      if (j.area === 'atendimento') {
        j.area = 'Atendimento';
        changed = true;
      }
      if (j.area === 'geral') {
        j.area = 'Geral';
        changed = true;
      }
    });
    if (changed) {
      fs.writeFileSync(jPath, JSON.stringify(jobs, null, 2), 'utf8');
      console.log(`✅ api/${jf}: áreas de vagas devidamente acentuadas e capitalizadas.`);
    }
  }
});

console.log('\n=== CORREÇÕES ORTOGRÁFICAS CONCLUÍDAS COM SUCESSO ===');
