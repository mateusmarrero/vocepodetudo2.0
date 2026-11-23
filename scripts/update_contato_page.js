const fs = require('fs');

const contatoPath = 'contato.html';
let content = fs.readFileSync(contatoPath, 'utf8');

const mainSection = `  <!-- Conteúdo Principal -->
  <main class="flex-1 max-w-6xl w-full mx-auto px-4 py-10 space-y-10">
    
    <!-- Hero Section -->
    <div class="text-center space-y-3 max-w-2xl mx-auto">
      <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-[#00702a] border border-emerald-200">
        <i data-lucide="headset" class="w-3.5 h-3.5"></i>
        <span>Canal Aberto & Direto</span>
      </span>
      <h1 class="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
        Fale Conosco — Você Pode Tudo
      </h1>
      <p class="text-slate-600 text-xs sm:text-sm leading-relaxed">
        Envie sua mensagem, sugestão de novos cursos gratuitos, reporte de links indisponíveis ou solicitações de privacidade sob a LGPD.
      </p>
    </div>

    <!-- Cards de Canais Rápidos -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-[#009639] transition-all flex flex-col justify-between">
        <div class="flex items-center gap-3 mb-2">
          <div class="w-10 h-10 rounded-xl bg-emerald-50 text-[#009639] border border-emerald-200 flex items-center justify-center flex-shrink-0">
            <i data-lucide="mail" class="w-5 h-5"></i>
          </div>
          <div>
            <span class="text-xs font-black uppercase text-slate-400 block tracking-wider">E-mail Oficial</span>
            <span class="text-sm font-black text-slate-900 break-all">contato@vocepodetudo.com</span>
          </div>
        </div>
        <div class="pt-2 border-t border-slate-100 flex items-center justify-between">
          <a href="mailto:contato@vocepodetudo.com" class="text-xs font-bold text-[#009639] hover:underline flex items-center gap-1">
            <span>Enviar e-mail</span>
            <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
          </a>
          <button type="button" onclick="navigator.clipboard.writeText('contato@vocepodetudo.com'); alert('E-mail copiado: contato@vocepodetudo.com');" class="text-[11px] font-bold text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-md transition-colors cursor-pointer">
            Copiar
          </button>
        </div>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
        <div class="flex items-center gap-3 mb-2">
          <div class="w-10 h-10 rounded-xl bg-blue-50 text-[#002776] border border-blue-200 flex items-center justify-center flex-shrink-0">
            <i data-lucide="clock" class="w-5 h-5"></i>
          </div>
          <div>
            <span class="text-xs font-black uppercase text-slate-400 block tracking-wider">Tempo de Resposta</span>
            <span class="text-sm font-black text-slate-900">Até 24h úteis</span>
          </div>
        </div>
        <p class="text-xs text-slate-500 leading-relaxed pt-2 border-t border-slate-100">
          Nossa equipe editorial analisa cada sugestão e solicitação individualmente com agilidade.
        </p>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
        <div class="flex items-center gap-3 mb-2">
          <div class="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center flex-shrink-0">
            <i data-lucide="shield-check" class="w-5 h-5"></i>
          </div>
          <div>
            <span class="text-xs font-black uppercase text-slate-400 block tracking-wider">Privacidade & LGPD</span>
            <span class="text-sm font-black text-slate-900">Canal do DPO</span>
          </div>
        </div>
        <p class="text-xs text-slate-500 leading-relaxed pt-2 border-t border-slate-100">
          Atendimento a direitos do titular previstos na Lei Federal nº 13.709/2018.
        </p>
      </div>
    </div>

    <!-- Seção Principal com Formulário e Painel Lateral -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      <!-- Coluna 1: Formulário Oficial (7 colunas) -->
      <div class="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div>
          <h2 class="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
            <i data-lucide="send" class="w-5 h-5 text-[#009639]"></i>
            <span>Envie sua Mensagem</span>
          </h2>
          <p class="text-xs text-slate-500 font-medium mt-1">
            Preencha os campos abaixo. Retornaremos diretamente no seu e-mail informado.
          </p>
        </div>

        <form id="contact-form" class="space-y-4">
          <div>
            <label for="contact-name" class="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
              Nome Completo *
            </label>
            <input 
              type="text" 
              id="contact-name" 
              required 
              placeholder="Ex: Maria Silva"
              class="w-full px-4 py-3 rounded-xl border border-slate-300 font-medium text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-[#009639] focus:ring-1 focus:ring-[#009639] transition-all bg-slate-50/50"
            >
          </div>

          <div>
            <label for="contact-email" class="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
              Seu E-mail para Contato *
            </label>
            <input 
              type="email" 
              id="contact-email" 
              required 
              placeholder="Ex: maria.silva@email.com"
              class="w-full px-4 py-3 rounded-xl border border-slate-300 font-medium text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-[#009639] focus:ring-1 focus:ring-[#009639] transition-all bg-slate-50/50"
            >
          </div>

          <div>
            <label for="contact-subject" class="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
              Assunto Principal *
            </label>
            <select 
              id="contact-subject" 
              required
              class="w-full px-4 py-3 rounded-xl border border-slate-300 font-bold text-slate-800 text-xs sm:text-sm focus:outline-none focus:border-[#009639] focus:ring-1 focus:ring-[#009639] transition-all bg-white"
            >
              <option value="Dúvidas sobre Cursos Gratuitos">🎓 Dúvidas sobre Cursos Gratuitos</option>
              <option value="Sugestão de Novo Curso Oficial">💡 Sugestão de Novo Curso Gratuito</option>
              <option value="Reportar Link com Problemas">⚠️ Reportar Link Fora do Ar ou com Problema</option>
              <option value="Mural de Vagas & Empresas">💼 Mural de Vagas / Parcerias de RH</option>
              <option value="Privacidade & Direitos LGPD">🔒 Privacidade & Direitos do Titular (LGPD)</option>
              <option value="Outros Assuntos">💬 Outros Assuntos Gerais</option>
            </select>
          </div>

          <div>
            <label for="contact-message" class="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
              Sua Mensagem *
            </label>
            <textarea 
              id="contact-message" 
              rows="5" 
              required 
              placeholder="Escreva sua mensagem com o máximo de detalhes para que possamos ajudá-lo melhor..."
              class="w-full px-4 py-3 rounded-xl border border-slate-300 font-medium text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-[#009639] focus:ring-1 focus:ring-[#009639] transition-all bg-slate-50/50 resize-y"
            ></textarea>
          </div>

          <div id="contact-alert" class="hidden text-xs font-bold p-3.5 rounded-xl border transition-all"></div>

          <button 
            type="submit" 
            id="contact-submit-btn" 
            class="w-full py-3.5 px-6 rounded-xl bg-[#009639] hover:bg-[#00702a] text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <i data-lucide="send" class="w-4 h-4"></i>
            <span>Enviar Mensagem</span>
          </button>
        </form>
      </div>

      <!-- Coluna 2: Informações de Apoio & FAQ (5 colunas) -->
      <div class="lg:col-span-5 space-y-5">
        
        <!-- Card de Atendimento Direto -->
        <div class="bg-gradient-to-br from-[#002776] to-[#001744] text-white p-6 rounded-3xl border border-blue-900 shadow-sm space-y-4">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
              <i data-lucide="inbox" class="w-5 h-5 text-[#ffcc29]"></i>
            </div>
            <div>
              <span class="text-[10px] font-black uppercase tracking-wider text-blue-200 block">Canal Oficial Direto</span>
              <h3 class="text-base font-black text-white">Prefere enviar por e-mail?</h3>
            </div>
          </div>
          <p class="text-xs text-blue-100 leading-relaxed font-normal">
            Você também pode nos escrever diretamente do seu cliente de e-mail favorito (Gmail, Outlook, Yahoo) para:
          </p>
          <div class="p-3 bg-white/10 rounded-xl border border-white/20 text-center">
            <span class="font-mono text-sm font-black text-[#ffdf00] select-all">contato@vocepodetudo.com</span>
          </div>
        </div>

        <!-- Dúvidas Frequentes Rápidas -->
        <div class="bg-emerald-50 rounded-3xl p-6 border border-emerald-100 shadow-sm space-y-3">
          <h3 class="text-sm font-black text-emerald-900 flex items-center gap-2">
            <i data-lucide="help-circle" class="w-4 h-4 text-emerald-600"></i>
            <span>Dúvidas Frequentes Rápidas</span>
          </h3>
          <ul class="text-xs text-emerald-950 space-y-2.5">
            <li class="flex items-start gap-2">
              <i data-lucide="check-circle-2" class="w-4 h-4 text-[#009639] flex-shrink-0 mt-0.5"></i>
              <div>
                <strong>Os cursos são realmente gratuitos?</strong>
                <p class="text-slate-600 mt-0.5">Sim! Todos os cursos indexados possuem acesso e certificação sem custo na instituição parceira oficial.</p>
              </div>
            </li>
            <li class="flex items-start gap-2">
              <i data-lucide="check-circle-2" class="w-4 h-4 text-[#009639] flex-shrink-0 mt-0.5"></i>
              <div>
                <strong>Como recebo o certificado?</strong>
                <p class="text-slate-600 mt-0.5">O certificado é emitido diretamente pela instituição oficial após você concluir as aulas na plataforma indicada.</p>
              </div>
            </li>
            <li class="flex items-start gap-2">
              <i data-lucide="check-circle-2" class="w-4 h-4 text-[#009639] flex-shrink-0 mt-0.5"></i>
              <div>
                <strong>Vocês cobram alguma taxa?</strong>
                <p class="text-slate-600 mt-0.5">Nenhuma. Nosso portal é 100% gratuito e mantido por publicidade digital do Google AdSense.</p>
              </div>
            </li>
          </ul>
        </div>

      </div>

    </div>

  </main>`;

const mainStart = content.indexOf('  <!-- Conteúdo Principal -->');
const mainEnd = content.indexOf('  <!-- Rodapé Institucional em 4 Colunas Modernas -->');

if (mainStart !== -1 && mainEnd !== -1) {
  content = content.substring(0, mainStart) + mainSection + '\n\n' + content.substring(mainEnd);
  fs.writeFileSync(contatoPath, content, 'utf8');
  console.log('✅ contato.html: seção principal e formulário completo restaurados com sucesso.');
} else {
  console.error('❌ Não foi possível localizar tags de delimitação em contato.html');
}
