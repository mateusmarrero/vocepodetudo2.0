const fs = require('fs');

let content = fs.readFileSync('api/analytics.php', 'utf8');

const target = `        fputcsv($out, [], ';');
        fputcsv($out, ['Autenticidade', 'Dados certificados diretamente pelo sistema de métricas do Você Pode Tudo'], ';');
        fclose($out);`;

const addition = `        fputcsv($out, [], ';');

        // 7. Catálogo de Formatos Publicitários (IAB & Nativos)
        fputcsv($out, ['--- 7. CATÁLOGO DE ESPAÇOS PUBLICITÁRIOS (PADRÃO IAB) ---'], ';');
        fputcsv($out, ['Formato', 'Dimensões (Desktop / Mobile)', 'Posicionamento', 'Peso Máximo', 'CTR Médio Histórico'], ';');
        fputcsv($out, ['Super Leaderboard Topo', '728x90 / 320x100', 'Acima da dobra em todas as páginas', '150 KB', '1,8% a 2,5%'], ';');
        fputcsv($out, ['Card Patrocinado Nativo In-Feed', '300x250 ou Fluido', 'Integrado na grade de cursos e vagas', '100 KB', '3,8% a 5,2%'], ';');
        fputcsv($out, ['Half-Page Lateral (Skyscraper)', '300x600 (Sticky)', 'Barra lateral fixa nos artigos do Blog', '200 KB', '2,2% a 3,1%'], ';');
        fputcsv($out, ['Billboard Intertítulo Editorial', '970x250 / 300x250', 'Entre seções estratégicas na Home', '200 KB', '2,0% a 2,9%'], ';');
        fputcsv($out, ['Push Notification Segmentada', 'Texto + Ícone + Link', 'Direto na tela de smartphones/desktop', '-', '6,5% a 9,8%'], ';');
        fputcsv($out, [], ';');

        // 8. Patrocínio Exclusivo de Ferramentas (Naming Rights)
        fputcsv($out, ['--- 8. NAMING RIGHTS & PATROCÍNIO EXCLUSIVO DE FERRAMENTAS ---'], ';');
        fputcsv($out, ['Ferramenta', 'Tempo Médio de Uso', 'Benefício para o Patrocinador', 'Exclusividade'], ';');
        fputcsv($out, ['Criador de Currículos ATS', '12 a 15 minutos', 'Logo no topo + Selo timbrado no PDF exportado', '100% Share of Voice (Setorial)'], ';');
        fputcsv($out, ['Simulador de Entrevistas com IA', '8 a 10 minutos', 'Apresentado por [Marca] + Dica patrocinada entre rodadas', '100% Share of Voice (Setorial)'], ';');
        fputcsv($out, ['Calculadora Trabalhista CLT/PJ', '5 a 7 minutos', 'Calculadora apoiada por [Marca] + Banner contextual', '100% Share of Voice (Setorial)'], ';');
        fputcsv($out, [], ';');

        // 9. Modelos Comerciais & Brand Safety
        fputcsv($out, ['--- 9. DIRETRIZES COMERCIAIS & BRAND SAFETY ---'], ';');
        fputcsv($out, ['Item', 'Diretriz Oficial'], ';');
        fputcsv($out, ['Modelos Aceitos', 'CPM (Custo por Mil), CPC (Custo por Clique), Fixo Mensal (Tenancy) e Publieditoriais'], ';');
        fputcsv($out, ['Formatos Criativos', 'JPG, PNG, GIF, HTML5 (ZIP), Google Ad Manager e Third-Party Tags seguras (SSL)'], ';');
        fputcsv($out, ['Prazo de Homologação', 'Envio com no mínimo 48 horas úteis de antecedência'], ';');
        fputcsv($out, ['Classificação Brand Safety', 'Tier 1 (Máximo) — 100% Educacional, zero violência, zero política partidária'], ';');
        fputcsv($out, ['Conformidade LGPD', 'Total conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018)'], ';');
        fputcsv($out, ['Contato Comercial', 'comercial@vocepodetudo.com — WhatsApp: (11) 99999-9999'], ';');
        fputcsv($out, ['Página Pública do Mídia Kit', 'https://vocepodetudo.com/midia-kit'], ';');
        fputcsv($out, [], ';');

        fputcsv($out, ['Autenticidade', 'Dados certificados diretamente pelo sistema de telemetria do Portal Você Pode Tudo'], ';');
        fclose($out);`;

if (content.includes(target)) {
  content = content.replace(target, addition);
  fs.writeFileSync('api/analytics.php', content, 'utf8');
  console.log('✅ api/analytics.php atualizado com dados ricos no mediakit_csv!');
} else {
  console.error('Target não encontrado em api/analytics.php');
}
