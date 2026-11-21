/**
 * Calculadoras Trabalhistas Oficiais 2026 — Você Pode Tudo
 * Cálculos precisos com tabelas progressivas de INSS e IRRF atualizadas.
 */

(function () {
  'use strict';

  // ==========================================
  // PARÂMETROS E TABELAS PROGRESSIVAS 2026
  // ==========================================
  const INSS_FAIXAS_2026 = [
    { limite: 1518.00, aliq: 0.075, deducao: 0 },
    { limite: 2793.88, aliq: 0.090, deducao: 22.77 },
    { limite: 4190.83, aliq: 0.120, deducao: 106.59 },
    { limite: 8157.41, aliq: 0.140, deducao: 190.40 }
  ];
  const TETO_INSS_2026 = 951.63;
  const DEDUCAO_DEPENDENTE_IRRF = 189.59;
  const DESCONTO_SIMPLIFICADO_IRRF = 564.80;

  const IRRF_FAIXAS_2026 = [
    { limite: 2259.20, aliq: 0.000, deducao: 0.00 },
    { limite: 2826.65, aliq: 0.075, deducao: 169.44 },
    { limite: 3751.05, aliq: 0.150, deducao: 381.44 },
    { limite: 4664.68, aliq: 0.225, deducao: 662.77 },
    { limite: Infinity, aliq: 0.275, deducao: 896.00 }
  ];

  // ==========================================
  // FUNÇÕES AUXILIARES DE CÁLCULO
  // ==========================================
  function calcularINSS(salarioBruto) {
    if (salarioBruto <= 0) return 0;
    if (salarioBruto > 8157.41) return TETO_INSS_2026;

    let inss = 0;
    if (salarioBruto <= 1518.00) {
      inss = salarioBruto * 0.075;
    } else if (salarioBruto <= 2793.88) {
      inss = (salarioBruto * 0.09) - 22.77;
    } else if (salarioBruto <= 4190.83) {
      inss = (salarioBruto * 0.12) - 106.59;
    } else {
      inss = (salarioBruto * 0.14) - 190.40;
    }
    return Math.max(0, Math.min(inss, TETO_INSS_2026));
  }

  function calcularIRRF(salarioBruto, inss, dependentes = 0, pensao = 0) {
    if (salarioBruto <= 0) return { irrf: 0, aliqEfetiva: 0, isento: true };

    const deducaoDependentes = dependentes * DEDUCAO_DEPENDENTE_IRRF;
    
    // Regra legal: calcula com deduções legais e compara com o desconto simplificado
    const baseLegal = Math.max(0, salarioBruto - inss - deducaoDependentes - pensao);
    const baseSimplificada = Math.max(0, salarioBruto - DESCONTO_SIMPLIFICADO_IRRF);

    function calcTabela(base) {
      if (base <= 2259.20) return 0;
      let imposto = 0;
      for (const faixa of IRRF_FAIXAS_2026) {
        if (base <= faixa.limite) {
          imposto = (base * faixa.aliq) - faixa.deducao;
          break;
        }
      }
      return Math.max(0, imposto);
    }

    const impostoLegal = calcTabela(baseLegal);
    const impostoSimplificado = calcTabela(baseSimplificada);

    const irrfFinal = Math.min(impostoLegal, impostoSimplificado);
    return {
      irrf: irrfFinal,
      aliqEfetiva: (irrfFinal / salarioBruto) * 100,
      isento: irrfFinal === 0
    };
  }

  function formatBRL(val) {
    return Number(val || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  // ==========================================
  // INICIALIZAÇÃO E CONTROLE DAS 4 ABAS
  // ==========================================
  function initTabs() {
    const tabButtons = document.querySelectorAll('.calc-tab-btn');
    const tabPanels = document.querySelectorAll('.calc-panel');

    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.target;
        tabButtons.forEach(b => {
          b.classList.remove('bg-emerald-600', 'text-white', 'shadow-sm');
          b.classList.add('bg-slate-100', 'dark:bg-slate-800', 'text-slate-600', 'dark:text-slate-300');
        });
        btn.classList.add('bg-emerald-600', 'text-white', 'shadow-sm');
        btn.classList.remove('bg-slate-100', 'dark:bg-slate-800', 'text-slate-600', 'dark:text-slate-300');

        tabPanels.forEach(panel => {
          if (panel.id === target) {
            panel.classList.remove('hidden');
          } else {
            panel.classList.add('hidden');
          }
        });
      });
    });
  }

  // ==========================================
  // 1. CALCULADORA DE SALÁRIO LÍQUIDO
  // ==========================================
  function initSalarioLiquido() {
    const form = document.getElementById('form-calc-salario');
    if (!form) return;

    form.addEventListener('input', () => {
      const bruto = parseFloat(document.getElementById('sal-bruto')?.value || 0);
      const dependentes = parseInt(document.getElementById('sal-dependentes')?.value || 0, 10);
      const pensao = parseFloat(document.getElementById('sal-pensao')?.value || 0);
      const outrosDescontos = parseFloat(document.getElementById('sal-outros')?.value || 0);
      const vtCheck = document.getElementById('sal-vt-check')?.checked;

      const vtDesconto = vtCheck ? Math.min(bruto * 0.06, bruto) : 0;
      const inss = calcularINSS(bruto);
      const irrfData = calcularIRRF(bruto, inss, dependentes, pensao);
      const totalDescontos = inss + irrfData.irrf + pensao + outrosDescontos + vtDesconto;
      const liquido = Math.max(0, bruto - totalDescontos);

      // Renderizar valores
      document.getElementById('res-sal-bruto').textContent = formatBRL(bruto);
      document.getElementById('res-sal-inss').textContent = `-${formatBRL(inss)}`;
      document.getElementById('res-sal-irrf').textContent = irrfData.irrf > 0 ? `-${formatBRL(irrfData.irrf)}` : 'Isento';
      document.getElementById('res-sal-outros').textContent = `-${formatBRL(outrosDescontos + pensao + vtDesconto)}`;
      document.getElementById('res-sal-liquido').textContent = formatBRL(liquido);

      const percLiquido = bruto > 0 ? ((liquido / bruto) * 100).toFixed(1) : 0;
      document.getElementById('res-sal-percentual').textContent = `${percLiquido}% do salário bruto`;

      // Barra de distribuição visual
      const barLiquido = document.getElementById('bar-sal-liquido');
      const barInss = document.getElementById('bar-sal-inss');
      const barIrrf = document.getElementById('bar-sal-irrf');
      if (barLiquido && bruto > 0) {
        barLiquido.style.width = `${(liquido / bruto) * 100}%`;
        barInss.style.width = `${(inss / bruto) * 100}%`;
        barIrrf.style.width = `${(irrfData.irrf / bruto) * 100}%`;
      }
    });
  }

  // ==========================================
  // 2. CALCULADORA DE FÉRIAS
  // ==========================================
  function initFerias() {
    const form = document.getElementById('form-calc-ferias');
    if (!form) return;

    form.addEventListener('input', () => {
      const salario = parseFloat(document.getElementById('ferias-salario')?.value || 0);
      const dias = parseInt(document.getElementById('ferias-dias')?.value || 30, 10);
      const vender10 = document.getElementById('ferias-abono-check')?.checked;
      const dependentes = parseInt(document.getElementById('ferias-dependentes')?.value || 0, 10);

      const valorPorDia = salario / 30;
      const diasGozados = vender10 ? Math.max(0, dias - 10) : dias;
      const valorFerias = valorPorDia * diasGozados;
      const tercoConstitucional = valorFerias / 3;
      const totalBrutoFerias = valorFerias + tercoConstitucional;

      let abonoValor = 0;
      let abonoTerco = 0;
      if (vender10) {
        abonoValor = valorPorDia * 10;
        abonoTerco = abonoValor / 3;
      }

      // INSS e IRRF incidem apenas sobre o período de férias gozadas (o abono é isento por lei)
      const inss = calcularINSS(totalBrutoFerias);
      const irrfData = calcularIRRF(totalBrutoFerias, inss, dependentes, 0);

      const totalReceber = totalBrutoFerias - inss - irrfData.irrf + abonoValor + abonoTerco;

      document.getElementById('res-ferias-bruto').textContent = formatBRL(totalBrutoFerias);
      document.getElementById('res-ferias-terco').textContent = formatBRL(tercoConstitucional);
      document.getElementById('res-ferias-abono').textContent = vender10 ? formatBRL(abonoValor + abonoTerco) : 'R$ 0,00';
      document.getElementById('res-ferias-inss').textContent = `-${formatBRL(inss)}`;
      document.getElementById('res-ferias-irrf').textContent = irrfData.irrf > 0 ? `-${formatBRL(irrfData.irrf)}` : 'Isento';
      document.getElementById('res-ferias-liquido').textContent = formatBRL(totalReceber);
    });
  }

  // ==========================================
  // 3. CALCULADORA DE 13º SALÁRIO
  // ==========================================
  function initDecimoTerceiro() {
    const form = document.getElementById('form-calc-13');
    if (!form) return;

    form.addEventListener('input', () => {
      const salario = parseFloat(document.getElementById('dec-salario')?.value || 0);
      const meses = parseInt(document.getElementById('dec-meses')?.value || 12, 10);
      const dependentes = parseInt(document.getElementById('dec-dependentes')?.value || 0, 10);

      const valorProporcional = (salario / 12) * meses;
      const primeiraParcela = valorProporcional / 2; // Sem descontos (paga até 30 de novembro)

      const inssTotal = calcularINSS(valorProporcional);
      const irrfData = calcularIRRF(valorProporcional, inssTotal, dependentes, 0);

      // Segunda parcela sofre todos os descontos
      const segundaParcela = Math.max(0, (valorProporcional / 2) - inssTotal - irrfData.irrf);
      const totalLiquido = primeiraParcela + segundaParcela;

      document.getElementById('res-dec-integral').textContent = formatBRL(valorProporcional);
      document.getElementById('res-dec-p1').textContent = formatBRL(primeiraParcela);
      document.getElementById('res-dec-p2').textContent = formatBRL(segundaParcela);
      document.getElementById('res-dec-descontos').textContent = `-${formatBRL(inssTotal + irrfData.irrf)}`;
      document.getElementById('res-dec-total').textContent = formatBRL(totalLiquido);
    });
  }

  // ==========================================
  // 4. SIMULADOR DE RESCISÃO DE CONTRATO
  // ==========================================
  function initRescisao() {
    const form = document.getElementById('form-calc-rescisao');
    if (!form) return;

    form.addEventListener('input', () => {
      const salario = parseFloat(document.getElementById('rescisao-salario')?.value || 0);
      const motivo = document.getElementById('rescisao-motivo')?.value || 'sem_justa_causa';
      const mesesTrabalhados = parseInt(document.getElementById('rescisao-meses')?.value || 12, 10);
      const diasSaldo = parseInt(document.getElementById('rescisao-dias-saldo')?.value || 15, 10);
      const saldoFgts = parseFloat(document.getElementById('rescisao-fgts')?.value || (salario * 0.08 * mesesTrabalhados));
      const avisoIndenizado = document.getElementById('rescisao-aviso-indenizado')?.checked;

      const valorDia = salario / 30;
      const saldoSalario = valorDia * diasSaldo;

      // 13º proporcional
      const mesesAnoAtual = Math.min(12, mesesTrabalhados % 12 || 12);
      const decimoProporcional = (salario / 12) * mesesAnoAtual;

      // Férias proporcionais + 1/3
      const feriasProporcionais = (salario / 12) * mesesAnoAtual;
      const feriasTerco = feriasProporcionais / 3;

      let avisoValor = 0;
      let multaFgts = 0;
      let podeSacarFgts = false;

      if (motivo === 'sem_justa_causa') {
        podeSacarFgts = true;
        multaFgts = saldoFgts * 0.40;
        if (avisoIndenizado) {
          // Aviso prévio proporcional (30 dias + 3 dias por ano de serviço)
          const anos = Math.floor(mesesTrabalhados / 12);
          const diasAviso = Math.min(90, 30 + (anos * 3));
          avisoValor = valorDia * diasAviso;
        }
      } else if (motivo === 'pedido_demissao') {
        podeSacarFgts = false;
        multaFgts = 0;
      } else if (motivo === 'justa_causa') {
        podeSacarFgts = false;
        multaFgts = 0;
      }

      let subtotalRescisao = saldoSalario;
      if (motivo !== 'justa_causa') {
        subtotalRescisao += decimoProporcional + feriasProporcionais + feriasTerco + avisoValor;
      }

      const totalGeral = subtotalRescisao + (podeSacarFgts ? (saldoFgts + multaFgts) : 0);

      document.getElementById('res-rescisao-saldo').textContent = formatBRL(saldoSalario);
      document.getElementById('res-rescisao-13').textContent = motivo === 'justa_causa' ? 'R$ 0,00' : formatBRL(decimoProporcional);
      document.getElementById('res-rescisao-ferias').textContent = motivo === 'justa_causa' ? 'R$ 0,00' : formatBRL(feriasProporcionais + feriasTerco);
      document.getElementById('res-rescisao-aviso').textContent = formatBRL(avisoValor);
      document.getElementById('res-rescisao-multa-fgts').textContent = podeSacarFgts ? formatBRL(multaFgts) : 'Sem direito (não aplicável)';
      document.getElementById('res-rescisao-saque-fgts').textContent = podeSacarFgts ? formatBRL(saldoFgts) : 'Bloqueado no fundo';
      document.getElementById('res-rescisao-total').textContent = formatBRL(totalGeral);
    });
  }

  // ==========================================
  // DISPARO GLOBAL
  // ==========================================
  
  // ==========================================
  // CALCULADORA 5: HORAS EXTRAS & NOTURNO
  // ==========================================
  function initHorasExtras() {
    const form = document.getElementById('form-horas-extras');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const salario = parseFloat(document.getElementById('he-salario-bruto').value) || 0;
      const jornada = parseFloat(document.getElementById('he-jornada').value) || 220;
      const qtd50 = parseFloat(document.getElementById('he-qtd-50').value) || 0;
      const qtd100 = parseFloat(document.getElementById('he-qtd-100').value) || 0;
      const qtdNoturnas = parseFloat(document.getElementById('he-qtd-noturnas').value) || 0;

      if (salario <= 0) return;

      const valorHora = salario / jornada;
      const valorHora50 = valorHora * 1.5;
      const valorHora100 = valorHora * 2.0;

      const total50 = qtd50 * valorHora50;
      const total100 = qtd100 * valorHora100;

      // Adicional Noturno: 20% sobre a hora base (ou hora reduzida noturna)
      const valorHoraNoturna = valorHora * 0.20;
      const totalNoturno = qtdNoturnas * valorHoraNoturna;

      // DSR estimado: (Total Horas Extras / 25 dias uteis) * 5 domingos e feriados
      const totalHE = total50 + total100;
      const totalDSR = totalHE > 0 ? (totalHE / 25) * 5 : 0;

      const totalGeral = total50 + total100 + totalNoturno + totalDSR;

      document.getElementById('res-he-total').textContent = formatBRL(totalGeral);
      document.getElementById('res-he-valor-hora').textContent = formatBRL(valorHora);
      document.getElementById('res-he-valor-hora-50').textContent = formatBRL(valorHora50);
      document.getElementById('res-he-total-50').textContent = formatBRL(total50);
      document.getElementById('res-he-total-100').textContent = formatBRL(total100);
      document.getElementById('res-he-total-noturno').textContent = formatBRL(totalNoturno);
      document.getElementById('res-he-total-dsr').textContent = formatBRL(totalDSR);
    });
  }

  
  // ==========================================
  // CALCULADORA 6: SEGURO-DESEMPREGO 2026
  // ==========================================
  function initSeguroDesemprego() {
    const form = document.getElementById('form-seguro');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const solicitacoes = parseInt(document.getElementById('seg-solicitacoes').value, 10) || 1;
      const meses = parseInt(document.getElementById('seg-meses').value, 10) || 0;
      const s1 = parseFloat(document.getElementById('seg-sal1').value) || 0;
      const s2 = parseFloat(document.getElementById('seg-sal2').value) || 0;
      const s3 = parseFloat(document.getElementById('seg-sal3').value) || 0;

      const media = (s1 + s2 + s3) / 3;

      if (media <= 0) return;

      // Cálculo do valor da parcela (Tabela CODEFAT 2026)
      // Piso: 1.518,00 | Teto: 2.351,48
      let parcela = 0;
      if (media <= 2074.67) {
        parcela = media * 0.80;
      } else if (media <= 3458.15) {
        parcela = 1659.74 + ((media - 2074.67) * 0.50);
      } else {
        parcela = 2351.48;
      }

      // Garantir piso do salário mínimo nacional
      if (parcela < 1518.00) {
        parcela = 1518.00;
      }

      // Cálculo da quantidade de parcelas
      let qtdParcelas = 0;
      let elegivel = true;

      if (solicitacoes === 1) {
        if (meses < 12) {
          elegivel = false;
        } else if (meses <= 23) {
          qtdParcelas = 4;
        } else {
          qtdParcelas = 5;
        }
      } else if (solicitacoes === 2) {
        if (meses < 9) {
          elegivel = false;
        } else if (meses <= 11) {
          qtdParcelas = 3;
        } else if (meses <= 23) {
          qtdParcelas = 4;
        } else {
          qtdParcelas = 5;
        }
      } else {
        if (meses < 6) {
          elegivel = false;
        } else if (meses <= 11) {
          qtdParcelas = 3;
        } else if (meses <= 23) {
          qtdParcelas = 4;
        } else {
          qtdParcelas = 5;
        }
      }

      if (!elegivel) {
        document.getElementById('res-seg-total').textContent = 'Ineligível';
        document.getElementById('res-seg-subtitulo').textContent = 'Tempo trabalhado insuficiente para esta solicitação';
        document.getElementById('res-seg-media').textContent = formatBRL(media);
        document.getElementById('res-seg-parcelas').textContent = '0 parcelas (Mínimo exigido não atingido)';
        document.getElementById('res-seg-valor-parcela').textContent = 'R$ 0,00';
        return;
      }

      const totalBeneficio = parcela * qtdParcelas;

      document.getElementById('res-seg-total').textContent = formatBRL(totalBeneficio);
      document.getElementById('res-seg-subtitulo').textContent = `${qtdParcelas} parcelas de ${formatBRL(parcela)}`;
      document.getElementById('res-seg-media').textContent = formatBRL(media);
      document.getElementById('res-seg-parcelas').textContent = `${qtdParcelas} parcelas mensais`;
      document.getElementById('res-seg-valor-parcela').textContent = formatBRL(parcela);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    initSalarioLiquido();
    initFerias();
    initDecimoTerceiro();
    initRescisao();
    initHorasExtras();
    initSeguroDesemprego();
    initCltPj();

    // Disparar cálculos iniciais
    document.getElementById('form-calc-salario')?.dispatchEvent(new Event('input'));
    document.getElementById('form-calc-ferias')?.dispatchEvent(new Event('input'));
    document.getElementById('form-calc-13')?.dispatchEvent(new Event('input'));
    document.getElementById('form-calc-rescisao')?.dispatchEvent(new Event('input'));
  });
})();


  // ===========================================================================
  // COMPARADOR CLT VS PJ
  // ===========================================================================
  function initCltPj() {
    const btn = document.getElementById('btn-calc-clt-pj');
    if (!btn) return;

    btn.addEventListener('click', () => {
      const salarioClt = parseFloat(document.getElementById('cltpj-salario-clt')?.value) || 0;
      const beneficiosClt = parseFloat(document.getElementById('cltpj-beneficios-clt')?.value) || 0;
      let propostaPj = parseFloat(document.getElementById('cltpj-proposta-pj')?.value) || 0;
      const aliquotaPj = parseFloat(document.getElementById('cltpj-imposto-pj')?.value) || 0.06;

      if (salarioClt <= 0 && propostaPj <= 0) {
        alert('Por favor, informe ao menos o Salário CLT ou a Proposta PJ.');
        return;
      }

      // Cálculos CLT
      const inssClt = calcularINSS(salarioClt);
      const baseIrrfClt = Math.max(0, salarioClt - inssClt);
      const irrfClt = calcularIRRF(baseIrrfClt);
      const salarioLiquidoClt = Math.max(0, salarioClt - inssClt - irrfClt);
      const fgtsMensal = salarioClt * 0.08;
      // Proporção de 13º (8.33%) e Férias com 1/3 (11.11%)
      const decimoMensal = salarioClt / 12;
      const feriasMensal = (salarioClt * (4/3)) / 12;
      const pacoteTotalClt = salarioLiquidoClt + fgtsMensal + decimoMensal + feriasMensal + beneficiosClt;

      // Sugestão de PJ equivalente (cobre pacote CLT + impostos PJ + R$ 150 contabilidade)
      const custoContabilidade = 150;
      const pjEquivalenteSugerido = (pacoteTotalClt + custoContabilidade) / (1 - aliquotaPj);

      // Se usuário não digitou PJ, usar a sugestão equivalente
      if (propostaPj <= 0) {
        propostaPj = pjEquivalenteSugerido;
      }

      // Cálculos PJ
      const impostosPj = propostaPj * aliquotaPj;
      const liquidoPj = Math.max(0, propostaPj - impostosPj - custoContabilidade);

      // Renderizar valores
      document.getElementById('cltpj-clt-liquido').textContent = formatBRL(salarioLiquidoClt);
      document.getElementById('cltpj-clt-fgts').textContent = formatBRL(fgtsMensal);
      document.getElementById('cltpj-clt-direitos').textContent = formatBRL(decimoMensal + feriasMensal);
      document.getElementById('cltpj-clt-beneficios').textContent = formatBRL(beneficiosClt);
      document.getElementById('cltpj-clt-total').textContent = formatBRL(pacoteTotalClt);

      document.getElementById('cltpj-pj-bruto').textContent = formatBRL(propostaPj);
      document.getElementById('cltpj-pj-impostos').textContent = '- ' + formatBRL(impostosPj);
      document.getElementById('cltpj-pj-total').textContent = formatBRL(liquidoPj);
      document.getElementById('cltpj-pj-sugerido').textContent = formatBRL(pjEquivalenteSugerido);

      // Veredito
      const card = document.getElementById('cltpj-veredito-card');
      const title = document.getElementById('cltpj-veredito-title');
      const desc = document.getElementById('cltpj-veredito-desc');
      const badge = document.getElementById('cltpj-veredito-badge');

      const diff = liquidoPj - pacoteTotalClt;

      if (diff > 500) {
        card.className = 'p-5 rounded-2xl border bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-center';
        badge.className = 'text-xs font-black uppercase tracking-wider block mb-1 text-emerald-800 dark:text-emerald-300';
        badge.textContent = 'Veredito: Regime PJ Mais Vantajoso';
        title.className = 'text-lg sm:text-xl font-black text-emerald-900 dark:text-white';
        title.textContent = 'A proposta PJ oferece ganho financeiro superior';
        desc.textContent = `Você ganha aproximadamente ${formatBRL(diff)} a mais por mês mesmo após pagar impostos e contabilidade.`;
      } else if (diff < -500) {
        card.className = 'p-5 rounded-2xl border bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700 text-center';
        badge.className = 'text-xs font-black uppercase tracking-wider block mb-1 text-[#002776] dark:text-blue-300';
        badge.textContent = 'Veredito: Regime CLT Mais Seguro e Vantajoso';
        title.className = 'text-lg sm:text-xl font-black text-[#002776] dark:text-white';
        title.textContent = 'O pacote CLT compensa mais';
        desc.textContent = `A proposta PJ está abaixo do necessário. Com FGTS, 13º e benefícios, a CLT entrega cerca de ${formatBRL(Math.abs(diff))} a mais de valor.`;
      } else {
        card.className = 'p-5 rounded-2xl border bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-center';
        badge.className = 'text-xs font-black uppercase tracking-wider block mb-1 text-amber-800 dark:text-amber-300';
        badge.textContent = 'Veredito: Empate Financeiro Técnico';
        title.className = 'text-lg sm:text-xl font-black text-amber-900 dark:text-white';
        title.textContent = 'Ambas as propostas entregam poder de compra similar';
        desc.textContent = 'A decisão deve considerar outros fatores: estabilidade e direitos (CLT) versus flexibilidade e autonomia (PJ).';
      }

      document.getElementById('result-clt-pj')?.classList.remove('hidden');
      if (window.lucide) window.lucide.createIcons();
    });
  }
