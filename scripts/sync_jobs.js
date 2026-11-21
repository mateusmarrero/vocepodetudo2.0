const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const cacheJobsPath = path.join(projectRoot, 'api', 'cache_jobs.json');
const seedJobsPath = path.join(projectRoot, 'api', 'seed_jobs.json');

async function syncJobs() {
  console.log('🤖 Iniciando robô de agregação e busca automática de vagas...');

  let existingJobs = [];
  try {
    existingJobs = JSON.parse(fs.readFileSync(cacheJobsPath, 'utf8'));
  } catch (e) {
    existingJobs = [];
  }

  const existingUrls = new Set(existingJobs.map(j => (j.apply_url || '').toLowerCase().trim()));
  const existingKeys = new Set(existingJobs.map(j => `${(j.title || '').toLowerCase().trim()}|${(j.company || '').toLowerCase().trim()}`));

  console.log(`📊 Total de vagas atuais no mural: ${existingJobs.length}`);

  try {
    const res = await fetch('https://remotive.com/api/remote-jobs?limit=30');
    if (!res.ok) {
      throw new Error(`Erro na API Remotive: ${res.statusText}`);
    }

    const data = await res.json();
    const jobs = data.jobs || [];
    console.log(`🌐 Vagas recebidas da API Remotive: ${jobs.length}`);

    const newJobs = [];
    let duplicates = 0;

    for (const rj of jobs) {
      const url = (rj.url || '').trim();
      const title = (rj.title || '').trim();
      const company = (rj.company_name || 'Empresa Internacional').trim();

      if (!url || !title) continue;

      const urlKey = url.toLowerCase();
      const key = `${title.toLowerCase()}|${company.toLowerCase()}`;

      if (existingUrls.has(urlKey) || existingKeys.has(key)) {
        duplicates++;
        continue;
      }

      // Área
      const cat = (rj.category || '').toLowerCase();
      const titleLower = title.toLowerCase();
      let area = 'tecnologia';
      if (cat.includes('customer') || titleLower.includes('support') || titleLower.includes('success')) {
        area = 'atendimento';
      } else if (cat.includes('marketing') || titleLower.includes('content') || titleLower.includes('seo')) {
        area = 'marketing';
      } else if (cat.includes('design') || titleLower.includes('ux') || titleLower.includes('ui')) {
        area = 'design';
      } else if (cat.includes('sales') || titleLower.includes('sdr') || titleLower.includes('commercial')) {
        area = 'comercial';
      } else if (cat.includes('hr') || cat.includes('business') || titleLower.includes('admin')) {
        area = 'administracao';
      }

      // Tipo
      let jobType = 'junior';
      if (titleLower.includes('intern') || titleLower.includes('estágio') || titleLower.includes('estagio')) {
        jobType = 'estagio';
      } else if (titleLower.includes('trainee')) {
        jobType = 'trainee';
      }

      // Limpar descrição
      let cleanDesc = (rj.description || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      if (cleanDesc.length > 320) cleanDesc = cleanDesc.slice(0, 317) + '...';

      const tags = Array.isArray(rj.tags) ? rj.tags.slice(0, 5).join(', ') : '';
      const location = (rj.candidate_required_location || '100% Remoto (Home Office)').trim();
      const salary = (rj.salary || 'A combinar / Salário competitivo internacional').trim();

      const item = {
        id: Date.now() + newJobs.length + Math.floor(Math.random() * 500),
        title,
        company,
        company_logo: rj.company_logo || 'remote',
        type: jobType,
        modality: 'remoto',
        area,
        state: 'BR',
        city: location,
        salary,
        description: cleanDesc || 'Oportunidade remota com horários flexíveis e atuação em time global.',
        requirements: tags ? `Habilidades e Tecnologias: ${tags}. Inglês para comunicação técnica ou fluente dependendo da função.` : 'Comunicação assertiva, organização para trabalho remoto e vontade de crescer.',
        benefits: 'Trabalho 100% Home Office, remuneração em moeda forte ou equivalente CLT/PJ, equipamento e horários flexíveis.',
        apply_url: url,
        source_name: 'Remotive API Oficial',
        deadline: 'Inscrições Abertas',
        is_active: 1,
        views_count: Math.floor(Math.random() * 150) + 40,
        clicks_count: Math.floor(Math.random() * 40) + 10,
        created_at: new Date().toISOString().replace('T', ' ').slice(0, 19)
      };

      newJobs.push(item);
      existingUrls.add(urlKey);
      existingKeys.add(key);
    }

    if (newJobs.length > 0) {
      const merged = [...newJobs, ...existingJobs];
      fs.writeFileSync(cacheJobsPath, JSON.stringify(merged, null, 2), 'utf8');
      fs.writeFileSync(seedJobsPath, JSON.stringify(merged, null, 2), 'utf8');
      console.log(`✅ Adicionadas ${newJobs.length} novas vagas ao mural! Total acumulado: ${merged.length}`);
    } else {
      console.log(`ℹ️ Nenhuma vaga inédita encontrada nesta rodada. Duplicatas ignoradas: ${duplicates}`);
    }

    console.log(`🎉 Sincronização de vagas concluída com sucesso!`);
  } catch (err) {
    console.error('❌ Erro na sincronização:', err.message);
  }
}

if (require.main === module) {
  syncJobs();
}

module.exports = { syncJobs };
