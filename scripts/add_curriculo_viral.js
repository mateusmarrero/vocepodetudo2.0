const fs = require('fs');
const path = require('path');

const curriculoHtmlPath = path.join(__dirname, '..', 'curriculo.html');
let html = fs.readFileSync(curriculoHtmlPath, 'utf8');

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
          href="https://api.whatsapp.com/send?text=%F0%9F%93%84%20*Criador%20de%20Curr%C3%ADculos%20Profissionais%20100%25%20Gr%C3%A1tis*%20%F0%9F%9A%80%0A%0AFiz%20meu%20curr%C3%ADculo%20em%20PDF%20direto%20no%20celular%20com%2012%20modelos%20modernos,%20sem%20marcas-d'água%20e%20sem%20precisar%20de%20cadastro!%0A%0ACrie%20o%20seu%20gr%C3%A1tis%20aqui:%0A%F0%9F%91%89%20https://vocepodetudo.com/curriculo.html" 
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

const marker = '<!-- Rodapé Institucional em 4 Colunas Modernas -->';
if (html.includes(marker) && !html.includes('Gostou do Criador de Currículos?')) {
  html = html.replace(marker, viralCurriculoBlock + '\n  ' + marker);
  fs.writeFileSync(curriculoHtmlPath, html, 'utf8');
  console.log('✅ Bloco viral de indicação inserido em curriculo.html');
} else {
  console.log('Condição não atendida ou já inserido');
}
