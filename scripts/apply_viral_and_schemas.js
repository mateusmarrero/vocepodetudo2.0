const fs = require('fs');
const path = require('path');

const projectDir = path.resolve(__dirname, '..');

// ==============================================================================
// 1. Inserir Gatilho Viral WhatsApp em vagas.html
// ==============================================================================
const vagasHtmlPath = path.join(projectDir, 'vagas.html');
let vagasHtml = fs.readFileSync(vagasHtmlPath, 'utf8');

const viralVagasBlock = `
    <!-- Bloco Viral: Indicar Vagas para um Amigo no WhatsApp -->
    <section class="mt-8 mb-4 bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
      <div class="space-y-2 text-center md:text-left">
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-xs text-white">
          <svg class="w-3.5 h-3.5 fill-white shrink-0" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
          Ajude um Amigo
        </span>
        <h3 class="text-xl sm:text-2xl font-black">Conhece alguém procurando emprego ou estágio?</h3>
        <p class="text-xs sm:text-sm text-emerald-100 max-w-xl">
          Compartilhe este Mural de Vagas gratuito nos seus grupos do WhatsApp e ajude amigos e familiares a conquistarem uma oportunidade!
        </p>
      </div>
      <a 
        href="https://api.whatsapp.com/send?text=%F0%9F%9A%A8%20*Mural%20de%20Vagas%20e%20Est%C3%A1gios%20Abertos%202026*%20%F0%9F%92%BC%0A%0AConfira%20oportunidades%20abertas%20de%20Jovem%20Aprendiz,%20Est%C3%A1gio%20e%20Primeiro%20Emprego%20com%20inscri%C3%A7%C3%A3o%20100%25%20gratuita:%0A%F0%9F%91%89%20https://vocepodetudo.com/vagas.html" 
        target="_blank" 
        rel="noopener noreferrer" 
        class="px-6 py-3.5 rounded-2xl font-black text-xs sm:text-sm bg-white text-emerald-700 hover:bg-emerald-50 transition-all shadow-lg flex items-center gap-2 flex-shrink-0"
      >
        <svg class="w-4 h-4 fill-emerald-600 shrink-0" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
        <span>Indicar no WhatsApp</span>
      </a>
    </section>
`;

if (!vagasHtml.includes('Ajude um Amigo') && vagasHtml.includes('</main>')) {
  vagasHtml = vagasHtml.replace('</main>', viralVagasBlock + '\n  </main>');
  fs.writeFileSync(vagasHtmlPath, vagasHtml, 'utf8');
  console.log('✅ Bloco viral de indicação inserido em vagas.html');
}

// ==============================================================================
// 2. Inserir Gatilho Viral WhatsApp em curriculo.html
// ==============================================================================
const curriculoHtmlPath = path.join(projectDir, 'curriculo.html');
let curriculoHtml = fs.readFileSync(curriculoHtmlPath, 'utf8');

const viralCurriculoBlock = `
    <!-- Bloco Viral: Indicar Criador de Currículos no WhatsApp -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 mb-8">
      <div class="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div class="space-y-2 text-center md:text-left">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-xs text-white">
            <svg class="w-3.5 h-3.5 fill-white shrink-0" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
            Compartilhe Conhecimento
          </span>
          <h3 class="text-xl sm:text-2xl font-black">Gostou do Criador de Currículos?</h3>
          <p class="text-xs sm:text-sm text-emerald-100 max-w-xl">
            Ajude um amigo ou familiar que precisa fazer um currículo profissional em PDF sem pagar nada e sem cadastro!
          </p>
        </div>
        <a 
          href="https://api.whatsapp.com/send?text=%F0%9F%93%84%20*Criador%20de%20Curr%C3%ADculos%20Profissionais%20100%25%20Gr%C3%A1tis*%20%F0%9F%9A%80%0A%0AFiz%20meu%20curr%C3%ADculo%20em%20PDF%20direto%20no%20celular%20com%2012%20modelos%20modernos,%20sem%20marcas-d'%C3%A1gua%20e%20sem%20precisar%20de%20cadastro!%0A%0ACrie%20o%20seu%20gr%C3%A1tis%20aqui:%0A%F0%9F%91%89%20https://vocepodetudo.com/curriculo.html" 
          target="_blank" 
          rel="noopener noreferrer" 
          class="px-6 py-3.5 rounded-2xl font-black text-xs sm:text-sm bg-white text-emerald-800 hover:bg-emerald-50 transition-all shadow-lg flex items-center gap-2 flex-shrink-0"
        >
          <svg class="w-4 h-4 fill-emerald-700 shrink-0" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
          <span>Compartilhar no WhatsApp</span>
        </a>
      </div>
    </section>
`;

if (!curriculoHtml.includes('Gostou do Criador de Currículos?') && curriculoHtml.includes('<!-- Footer Oficial Completo -->')) {
  curriculoHtml = curriculoHtml.replace('<!-- Footer Oficial Completo -->', viralCurriculoBlock + '\n    <!-- Footer Oficial Completo -->');
  fs.writeFileSync(curriculoHtmlPath, curriculoHtml, 'utf8');
  console.log('✅ Bloco viral de indicação inserido em curriculo.html');
}

// ==============================================================================
// 3. Inserir Dados Estruturados Schema.org Course em index.html
// ==============================================================================
const indexHtmlPath = path.join(projectDir, 'index.html');
let indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');

const courseSchemaJsonLd = `
  <!-- Google Rich Snippets: Schema.org Course Catalog -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Catálogo de Cursos Gratuitos com Certificado - Você Pode Tudo",
    "description": "Cursos online gratuitos oferecidos pelas maiores instituições do Brasil e do mundo com certificado reconhecido.",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "item": {
          "@type": "Course",
          "name": "Curso Gratuito de Inteligência Artificial para Todos",
          "description": "Aprenda fundamentos práticos de IA generativa, ChatGPT e ferramentas de produtividade para o mercado de trabalho com certificado gratuito.",
          "provider": {
            "@type": "Organization",
            "name": "Fundação Bradesco & Você Pode Tudo",
            "sameAs": "https://vocepodetudo.com"
          },
          "offers": {
            "@type": "Offer",
            "category": "Free",
            "price": "0",
            "priceCurrency": "BRL"
          },
          "hasCourseInstance": {
            "@type": "CourseInstance",
            "courseMode": "online",
            "courseWorkload": "PT20H"
          },
          "educationalCredentialAwarded": "Certificado de Conclusão Reconhecido"
        }
      },
      {
        "@type": "ListItem",
        "position": 2,
        "item": {
          "@type": "Course",
          "name": "Curso de Excel do Básico ao Avançado",
          "description": "Domine fórmulas, planilhas inteligentes, PROCV, tabelas dinâmicas e dashboards para áreas administrativas e financeiras.",
          "provider": {
            "@type": "Organization",
            "name": "Fundação Bradesco",
            "sameAs": "https://vocepodetudo.com"
          },
          "offers": {
            "@type": "Offer",
            "category": "Free",
            "price": "0",
            "priceCurrency": "BRL"
          },
          "hasCourseInstance": {
            "@type": "CourseInstance",
            "courseMode": "online",
            "courseWorkload": "PT30H"
          },
          "educationalCredentialAwarded": "Certificado Gratuito Válido em Todo Brasil"
        }
      },
      {
        "@type": "ListItem",
        "position": 3,
        "item": {
          "@type": "Course",
          "name": "Programação Web e Desenvolvimento Full Stack",
          "description": "Formação em HTML5, CSS3, JavaScript e lógica de programação para ingressar na área de tecnologia e desenvolvimento de software.",
          "provider": {
            "@type": "Organization",
            "name": "SENAI & Você Pode Tudo",
            "sameAs": "https://vocepodetudo.com"
          },
          "offers": {
            "@type": "Offer",
            "category": "Free",
            "price": "0",
            "priceCurrency": "BRL"
          },
          "hasCourseInstance": {
            "@type": "CourseInstance",
            "courseMode": "online",
            "courseWorkload": "PT60H"
          },
          "educationalCredentialAwarded": "Certificado Técnico de Capacitação"
        }
      }
    ]
  }
  </script>
`;

if (!indexHtml.includes('Schema.org Course Catalog') && indexHtml.includes('</head>')) {
  indexHtml = indexHtml.replace('</head>', courseSchemaJsonLd + '\n</head>');
  fs.writeFileSync(indexHtmlPath, indexHtml, 'utf8');
  console.log('✅ Schema.org Course inserido em index.html');
}

console.log('Concluído com sucesso.');
