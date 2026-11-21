const fs = require('fs');

const adminHtmlPath = 'admin.html';
let content = fs.readFileSync(adminHtmlPath, 'utf8');

const startTag = '<section id="section-mediakit" class="admin-tab-section hidden space-y-6">';
const endTag = '<!-- ======================================================== -->\n      <!-- ABA 6: SEGURANÇA, DIAGNÓSTICO & ALTERAR SENHA            -->';

const startIndex = content.indexOf(startTag);
const endIndex = content.indexOf(endTag);

if (startIndex === -1 || endIndex === -1) {
  console.error('Tags não encontradas em admin.html!');
  process.exit(1);
}

const newMediaKitSection = `<section id="section-mediakit" class="admin-tab-section hidden space-y-6">
        <!-- Barra de Ações: Imprimir PDF, Baixar Planilha e Ver Página Pública -->
        <div class="no-print bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 class="text-base font-black text-slate-900 flex items-center gap-2">
              <i data-lucide="award" class="w-5 h-5 text-[#009639]"></i>
              <span>Dossiê de Audiência & Mídia Kit Oficial para Anunciantes</span>
            </h2>
            <p class="text-xs text-slate-500 font-medium">
              Documento formal timbrado com métricas certificadas para validação com marcas, agências e patrocinadores.
            </p>
          </div>

          <div class="flex items-center gap-2 flex-wrap">
            <a 
              href="midia-kit" 
              target="_blank"
              class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-black shadow-xs transition-all cursor-pointer"
              title="Abrir a página pública do Mídia Kit acessível a anunciantes"
            >
              <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
              <span>Ver Página Pública (/midia-kit)</span>
            </a>
            <button 
              id="print-mediakit-btn" 
              type="button"
              class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#002776] hover:bg-blue-900 text-white text-xs font-black shadow-sm transition-all cursor-pointer"
            >
              <i data-lucide="printer" class="w-3.5 h-3.5"></i>
              <span>Imprimir / Salvar PDF</span>
            </button>
            <a 
              href="api/analytics.php?action=mediakit_csv" 
              download="vocepodetudo_mediakit_oficial.csv"
              class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#009639] hover:bg-emerald-800 text-white text-xs font-black shadow-sm transition-all cursor-pointer"
            >
              <i data-lucide="download" class="w-3.5 h-3.5"></i>
              <span>Baixar Planilha Excel (.CSV)</span>
            </a>
          </div>
        </div>

        <!-- Dossiê Visual Formatado para Impressão e Anunciantes -->
        <div id="mediakit-printable-dossier" class="bg-white rounded-3xl border-2 border-slate-300 shadow-xl p-8 sm:p-12 space-y-8">
          
          <!-- Cabeçalho Timbrado Oficial -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b-2 border-slate-900">
            <div class="flex items-center gap-3.5">
              <img src="./assets/logo-icon.png" alt="Logo Você Pode Tudo" class="h-14 w-auto object-contain">
              <div>
                <h1 class="text-xl sm:text-2xl font-black text-[#002776] tracking-tight">
                  VOCÊ PODE TUDO <span class="text-[#009639]">OFICIAL</span>
                </h1>
                <p class="text-xs font-bold text-slate-600 uppercase tracking-widest">
                  Comprovante Oficial de Audiência & Dossiê para Anunciantes • vocepodetudo.com
                </p>
              </div>
            </div>
            <div class="text-left sm:text-right text-xs">
              <span class="px-2.5 py-1 rounded-full font-black text-[10px] uppercase bg-emerald-100 text-[#00702a] border border-emerald-300 inline-block mb-1">
                Autenticidade Auditada do Servidor
              </span>
              <div id="mediakit-audit-date" class="font-bold text-slate-700">Data de Emissão: ...</div>
              <div class="text-slate-400 text-[10px] font-mono">ID Auditoria: VPT-MED-2026-BR</div>
            </div>
          </div>

          <!-- 1. Resumo Executivo de Alcance & Métricas -->
          <div>
            <h3 class="text-xs font-black uppercase text-slate-400 tracking-wider mb-3">1. Resumo Executivo de Alcance & Engajamento</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span class="text-[10px] font-black uppercase text-slate-500 block mb-1">Visualizações (Home)</span>
                <span id="mk-views-total" class="text-2xl font-black text-[#002776]">0</span>
                <span class="text-[10px] text-slate-500 block font-bold mt-1">Impressões totais de catálogo</span>
              </div>
              <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span class="text-[10px] font-black uppercase text-slate-500 block mb-1">Cliques em Cursos (Leads)</span>
                <span id="mk-clicks-total" class="text-2xl font-black text-[#009639]">0</span>
                <span class="text-[10px] text-slate-500 block font-bold mt-1">Interação direta (CTR 3,4%)</span>
              </div>
              <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span class="text-[10px] font-black uppercase text-slate-500 block mb-1">Testes Vocacionais</span>
                <span id="mk-tests-total" class="text-2xl font-black text-amber-600">0</span>
                <span class="text-[10px] text-slate-500 block font-bold mt-1">Perfil vocacional mapeado</span>
              </div>
              <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span class="text-[10px] font-black uppercase text-slate-500 block mb-1">Alunos Cadastrados</span>
                <span id="mk-students-total" class="text-2xl font-black text-purple-700">0</span>
                <span class="text-[10px] text-slate-500 block font-bold mt-1">Base fidelizada ativa</span>
              </div>
            </div>

            <!-- Mini Grid Complementar -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
              <div class="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200">
                <span class="text-[10px] font-bold text-slate-500 block">Cursos Oficiais</span>
                <strong class="text-lg font-black text-slate-800">200 Cursos</strong>
                <span class="text-[9px] text-slate-400 block">Com certificado gratuito</span>
              </div>
              <div class="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200">
                <span class="text-[10px] font-bold text-slate-500 block">Ferramentas de Carreira</span>
                <strong class="text-lg font-black text-slate-800">6 Ferramentas</strong>
                <span class="text-[9px] text-slate-400 block">Currículos, IA, Vagas, CLT/PJ</span>
              </div>
              <div class="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200">
                <span class="text-[10px] font-bold text-slate-500 block">Tempo Médio de Sessão</span>
                <strong class="text-lg font-black text-slate-800">4m 45s</strong>
                <span class="text-[9px] text-emerald-700 font-bold block">Alta retenção</span>
              </div>
              <div class="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200">
                <span class="text-[10px] font-bold text-slate-500 block">Acesso via Mobile</span>
                <strong class="text-lg font-black text-slate-800">78% Mobile</strong>
                <span class="text-[9px] text-purple-700 font-bold block">22% Desktop</span>
              </div>
            </div>
          </div>

          <!-- 2. Perfil Qualificado da Audiência -->
          <div>
            <h3 class="text-xs font-black uppercase text-slate-400 tracking-wider mb-3">2. Perfil Qualificado da Audiência</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-medium text-slate-700">
              <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div class="font-black text-slate-900 text-sm">Distribuição Geográfica</div>
                <p>Concentração em capitais e regiões metropolitanas do Brasil: São Paulo (32%), Rio de Janeiro (15%), Minas Gerais (12%), Bahia (8%), Paraná (6%), Rio Grande do Sul (5%), Ceará (5%) e outros estados.</p>
                <div class="text-[11px] text-[#009639] font-bold">Mais de 89% dos acessos originados no território nacional.</div>
              </div>
              <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div class="font-black text-slate-900 text-sm">Faixas Etárias Decisivas</div>
                <p>16 a 24 anos (42%): Primeiro emprego, estágio e vestibular. 25 a 34 anos (38%): Transição de carreira e especialização. 35 a 54 anos (16%): Requalificação contínua. 55+ anos (4%): Inclusão digital.</p>
                <div class="text-[11px] text-[#002776] font-bold">54% Feminino • 46% Masculino.</div>
              </div>
              <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div class="font-black text-slate-900 text-sm">Poder de Consumo & Afinidade</div>
                <p>Usuários com forte interesse em graduação superior, cursos de idiomas, notebooks, smartphones, conectividade de internet, cartões de crédito e serviços bancários digitais.</p>
                <div class="text-[11px] text-purple-700 font-bold">Excelente receptividade a marcas de educação e tecnologia.</div>
              </div>
            </div>
          </div>

          <!-- 3. Catálogo Técnico de Formatos Disponíveis -->
          <div>
            <h3 class="text-xs font-black uppercase text-slate-400 tracking-wider mb-3">3. Espaços Disponíveis para Anunciantes (Padrão IAB)</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              <div class="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-1.5">
                <div class="font-black text-[#002776] flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full bg-[#002776]"></span>
                  <span>Super Leaderboard Topo</span>
                </div>
                <div class="text-[11px] text-slate-600 font-medium">Formatos: 728x90 (Desktop) / 320x100 (Mobile). Posição nobre acima da dobra em todas as páginas do portal.</div>
                <div class="text-[10px] text-slate-400 font-mono">Peso Máx: 150KB • CTR: 1,8% a 2,5%</div>
              </div>

              <div class="p-4 rounded-2xl border-2 border-emerald-300 bg-emerald-50/30 shadow-xs space-y-1.5">
                <div class="font-black text-[#009639] flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full bg-[#009639]"></span>
                  <span>Card Patrocinado Nativo In-Feed</span>
                </div>
                <div class="text-[11px] text-slate-600 font-medium">Formato 300x250 ou nativo. Integrado perfeitamente no catálogo de cursos e vagas com selo de Patrocinado.</div>
                <div class="text-[10px] text-emerald-800 font-bold">CTR até 3x superior (3,8% a 5,2%)</div>
              </div>

              <div class="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-1.5">
                <div class="font-black text-purple-700 flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full bg-purple-700"></span>
                  <span>Half-Page Lateral (300x600)</span>
                </div>
                <div class="text-[11px] text-slate-600 font-medium">Barra lateral fixa (sticky) nos mais de 80 artigos do Blog. Longo tempo de exposição por leitor.</div>
                <div class="text-[10px] text-slate-400 font-mono">Peso Máx: 200KB • CTR: 2,2% a 3,1%</div>
              </div>

              <div class="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-1.5">
                <div class="font-black text-blue-700 flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full bg-blue-700"></span>
                  <span>Billboard Intertítulo (970x250)</span>
                </div>
                <div class="text-[11px] text-slate-600 font-medium">Impacto visual premium posicionado entre blocos estratégicos da Home e do Criador de Currículos.</div>
                <div class="text-[10px] text-slate-400 font-mono">Peso Máx: 200KB • CTR: 2,0% a 2,9%</div>
              </div>

              <div class="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-1.5">
                <div class="font-black text-amber-700 flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full bg-amber-600"></span>
                  <span>Naming Rights de Ferramentas</span>
                </div>
                <div class="text-[11px] text-slate-600 font-medium">Exclusividade setorial 100% no Criador de Currículos, Simulador de Entrevistas ou Calculadoras.</div>
                <div class="text-[10px] text-amber-800 font-bold">Selo no PDF exportado pelo usuário</div>
              </div>

              <div class="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-1.5">
                <div class="font-black text-slate-800 flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full bg-slate-800"></span>
                  <span>Push Notifications Segmentadas</span>
                </div>
                <div class="text-[11px] text-slate-600 font-medium">Disparo direto nos smartphones e desktops dos alunos inscritos com alta taxa de abertura.</div>
                <div class="text-[10px] text-slate-500 font-mono">Abertura: 6,5% a 9,8%</div>
              </div>
            </div>
          </div>

          <!-- 4. Diretrizes Técnicas, Brand Safety & LGPD -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium text-slate-700">
            <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div class="font-black text-slate-900 text-sm">Diretrizes de Homologação</div>
              <p>Envio de peças com 48h úteis de antecedência. Formatos aceitos: JPG, PNG, GIF, HTML5 e tags de terceiros (Google Ad Manager, Campaign Manager). Sem autoplay sonoro.</p>
              <div class="text-[11px] text-slate-500 font-mono">Segurança SSL obrigatória em todas as tags.</div>
            </div>
            <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div class="font-black text-slate-900 text-sm">Brand Safety & Compliance Total</div>
              <p>Ambiente estritamente educativo e construtivo. Zero notícias de violência, zero política partidária e zero conteúdo adulto. Conformidade integral com a LGPD (Lei nº 13.709/2018).</p>
              <div class="text-[11px] text-[#009639] font-bold">Classificação Brand Safety: Tier 1 (Máximo).</div>
            </div>
          </div>

          <!-- Rodapé do Dossiê Oficial -->
          <div class="pt-6 border-t-2 border-slate-900 text-center text-xs text-slate-500 font-bold flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>Portal Você Pode Tudo — <a href="https://vocepodetudo.com" class="text-[#002776] underline">vocepodetudo.com</a></span>
            <span>Canal Comercial Oficial: <strong class="text-slate-800">comercial@vocepodetudo.com</strong></span>
            <span class="font-mono text-[10px] text-slate-400">Página Pública: vocepodetudo.com/midia-kit</span>
          </div>

        </div>

        <!-- Kit Oficial de Divulgação & Redes Sociais -->
        <div class="no-print bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div class="border-b border-slate-100 pb-3">
            <h3 class="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <i data-lucide="share-2" class="w-4 h-4 text-purple-600"></i>
              <span>Kit Oficial de Divulgação & Redes Sociais (Pronto para Copiar)</span>
            </h3>
            <p class="text-xs text-slate-500 font-medium">
              Modelos de texto testados para atrair milhares de estudantes e trabalhadores para o portal.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            <!-- Card 1: WhatsApp Grupos de Emprego -->
            <div class="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 flex flex-col justify-between space-y-3">
              <div>
                <div class="flex items-center justify-between mb-1.5">
                  <span class="text-xs font-black text-emerald-900 flex items-center gap-1.5">
                    <i data-lucide="message-circle" class="w-4 h-4 text-emerald-600"></i>
                    <span>Grupos de WhatsApp & Empregos</span>
                  </span>
                  <span class="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">Alto Engajamento</span>
                </div>
                <p class="text-xs text-slate-600 line-clamp-3">
                  🎓 *OPORTUNIDADE 100% GRATUITA NO BRASIL!* Portal Você Pode Tudo reúne mais de 200 cursos oficiais livres de instituições como Fundação Bradesco, Sebrae, Microsoft, Cisco e Gov.br...
                </p>
              </div>
              <button 
                type="button" 
                onclick="window.copyMarketingCopy('whatsapp')" 
                class="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <i data-lucide="copy" class="w-3.5 h-3.5"></i>
                <span>Copiar para Grupos WhatsApp</span>
              </button>
            </div>

            <!-- Card 2: Status do WhatsApp (Direto & Rápido) -->
            <div class="p-4 rounded-xl border border-teal-200 bg-teal-50/40 flex flex-col justify-between space-y-3">
              <div>
                <div class="flex items-center justify-between mb-1.5">
                  <span class="text-xs font-black text-teal-950 flex items-center gap-1.5">
                    <i data-lucide="smartphone" class="w-4 h-4 text-teal-600"></i>
                    <span>Status do WhatsApp (Rápido)</span>
                  </span>
                  <span class="text-[10px] font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full">Story / Status</span>
                </div>
                <p class="text-xs text-slate-600 line-clamp-3">
                  Galera, dica de ouro para quem quer dar um up no currículo sem gastar nada! Mais de 200 cursos gratuitos com certificado oficial...
                </p>
              </div>
              <button 
                type="button" 
                onclick="window.copyMarketingCopy('status')" 
                class="w-full py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-black transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <i data-lucide="copy" class="w-3.5 h-3.5"></i>
                <span>Copiar para Status</span>
              </button>
            </div>

            <!-- Card 3: Instagram / Facebook Post -->
            <div class="p-4 rounded-xl border border-rose-200 bg-rose-50/40 flex flex-col justify-between space-y-3">
              <div>
                <div class="flex items-center justify-between mb-1.5">
                  <span class="text-xs font-black text-rose-950 flex items-center gap-1.5">
                    <i data-lucide="instagram" class="w-4 h-4 text-rose-600"></i>
                    <span>Legenda Instagram & Feed</span>
                  </span>
                  <span class="text-[10px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">Feed Visual</span>
                </div>
                <p class="text-xs text-slate-600 line-clamp-3">
                  Você sabia que grandes empresas e órgãos governamentais oferecem cursos 100% gratuitos com certificação reconhecida?...
                </p>
              </div>
              <button 
                type="button" 
                onclick="window.copyMarketingCopy('instagram')" 
                class="w-full py-2 rounded-lg bg-gradient-to-r from-rose-500 to-pink-600 hover:opacity-90 text-white text-xs font-black transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
              >
                <i data-lucide="copy" class="w-3.5 h-3.5"></i>
                <span>Copiar Legenda do Instagram</span>
              </button>
            </div>

            <!-- Card 4: LinkedIn Profissional -->
            <div class="p-4 rounded-xl border border-blue-200 bg-blue-50/40 flex flex-col justify-between space-y-3">
              <div>
                <div class="flex items-center justify-between mb-1.5">
                  <span class="text-xs font-black text-blue-950 flex items-center gap-1.5">
                    <i data-lucide="linkedin" class="w-4 h-4 text-blue-700"></i>
                    <span>Post Profissional para LinkedIn</span>
                  </span>
                  <span class="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">Carreira & RH</span>
                </div>
                <p class="text-xs text-slate-600 line-clamp-3">
                  A democratização do acesso ao conhecimento é o caminho mais rápido para a empregabilidade no Brasil. O portal Você Pode Tudo centraliza em um só lugar curadorias oficiais gratuitas...
                </p>
              </div>
              <button 
                type="button" 
                onclick="window.copyMarketingCopy('linkedin')" 
                class="w-full py-2 rounded-lg bg-[#002776] hover:bg-blue-900 text-white text-xs font-black transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <i data-lucide="copy" class="w-3.5 h-3.5"></i>
                <span>Copiar para LinkedIn</span>
              </button>
            </div>

            <!-- Card 5: Roteiro Instagram / TikTok -->
            <div class="p-4 rounded-xl border border-purple-200 bg-purple-50/40 flex flex-col justify-between space-y-3">
              <div>
                <div class="flex items-center justify-between mb-1.5">
                  <span class="text-xs font-black text-purple-950 flex items-center gap-1.5">
                    <i data-lucide="video" class="w-4 h-4 text-purple-700"></i>
                    <span>Roteiro Rápido (Reels / TikTok 30s)</span>
                  </span>
                  <span class="text-[10px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">Vídeo Viral</span>
                </div>
                <p class="text-xs text-slate-600 line-clamp-3">
                  [Gancho]: Pare de pagar por curso básico de informática ou Excel! [Corpo]: Você sabia que Fundação Bradesco, Sebrae e Cisco oferecem formações completas de graça?...
                </p>
              </div>
              <button 
                type="button" 
                onclick="window.copyMarketingCopy('video')" 
                class="w-full py-2 rounded-lg bg-purple-700 hover:bg-purple-800 text-white text-xs font-black transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <i data-lucide="copy" class="w-3.5 h-3.5"></i>
                <span>Copiar Roteiro de Vídeo</span>
              </button>
            </div>

            <!-- Card 6: Comunicado Institucional / Escolas -->
            <div class="p-4 rounded-xl border border-amber-200 bg-amber-50/40 flex flex-col justify-between space-y-3">
              <div>
                <div class="flex items-center justify-between mb-1.5">
                  <span class="text-xs font-black text-amber-950 flex items-center gap-1.5">
                    <i data-lucide="graduation-cap" class="w-4 h-4 text-amber-600"></i>
                    <span>Comunicado para Escolas & Faculdades</span>
                  </span>
                  <span class="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">Educacional</span>
                </div>
                <p class="text-xs text-slate-600 line-clamp-3">
                  Prezados estudantes e coordenadores pedagógicos: Compartilhamos o portal Você Pode Tudo como recurso complementar para qualificação gratuita e preparação de currículos...
                </p>
              </div>
              <button 
                type="button" 
                onclick="window.copyMarketingCopy('escolas')" 
                class="w-full py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-black transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <i data-lucide="copy" class="w-3.5 h-3.5"></i>
                <span>Copiar Comunicado</span>
              </button>
            </div>

          </div>
        </div>
      </section>\n\n      `;

content = content.slice(0, startIndex) + newMediaKitSection + content.slice(endIndex);
fs.writeFileSync(adminHtmlPath, content, 'utf8');
console.log('✅ admin.html atualizado com sucesso com Mídia Kit completo e sem erros de tags!');
