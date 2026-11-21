const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database.sql');
let sql = fs.readFileSync(dbPath, 'utf8');

const targetStr = `('networking-efetivo', 'Networking Estratégico no Mercado de Trabalho', 'Governo Federal (EV.G / ENAP)', 'Gov.br (EV.G)', 'bg-blue-50 text-blue-900 border-blue-300 font-black', 'profissionalizacao', 'Desenvolvimento de conexões profissionais genuínas, abordagem ética a recrutadores, participação em comunidades e feiras de oportunidades.', 'https://www.escolavirtual.gov.br', 10, 1, 'Certificado 100% Gratuito', 'Iniciante', '["Networking","Contatos","Gov.br","Carreira"]', 0, 4.8, 1980, 1);`;

const newRows = `('networking-efetivo', 'Networking Estratégico no Mercado de Trabalho', 'Governo Federal (EV.G / ENAP)', 'Gov.br (EV.G)', 'bg-blue-50 text-blue-900 border-blue-300 font-black', 'profissionalizacao', 'Desenvolvimento de conexões profissionais genuínas, abordagem ética a recrutadores, participação em comunidades e feiras de oportunidades.', 'https://www.escolavirtual.gov.br', 10, 1, 'Certificado 100% Gratuito', 'Iniciante', '["Networking","Contatos","Gov.br","Carreira"]', 0, 4.8, 1980, 1),
('unasus-cuidados-paliativos-aps', 'Cuidados Paliativos na Atenção Primária à Saúde', 'UNA-SUS / Fiocruz', 'UNA-SUS / Fiocruz', 'bg-teal-50 text-teal-900 border-teal-300 font-black', 'saude', 'Princípios de controle e alívio da dor, acolhimento biopsicossocial do paciente e familiares, comunicação de notícias difíceis e plano terapêutico singular no SUS.', 'https://www.unasus.gov.br/cursos/busca', 30, 1, 'Certificado 100% Gratuito', 'Intermediário', '["Saúde","Fiocruz","Cuidados Paliativos","Enfermagem"]', 1, 4.9, 3820, 1),
('anvisa-biosseguranca-controle-infeccao', 'Biossegurança e Controle de Infecções em Serviços de Saúde', 'Escola Virtual de Governo (EV.G / Anvisa)', 'Anvisa / EV.G', 'bg-blue-50 text-blue-900 border-blue-300 font-black', 'saude', 'Normas técnicas da Anvisa para higienização das mãos, precauções padrão e de contato, uso correto de EPIs, descarte de perfurocortantes e prevenção de infecções hospitalares.', 'https://www.escolavirtual.gov.br/curso/307', 40, 1, 'Certificado 100% Gratuito', 'Iniciante', '["Saúde","Anvisa","Biossegurança","Enfermagem"]', 1, 4.9, 5410, 1),
('avasus-atencao-saude-mulher-prenatal', 'Saúde da Mulher e Acolhimento Humanizado no Pré-Natal', 'AVASUS (Ministério da Saúde / UFRN)', 'AVASUS / Ministério da Saúde', 'bg-teal-50 text-teal-900 border-teal-300 font-black', 'saude', 'Diretrizes nacionais para o acompanhamento pré-natal de baixo risco na Atenção Básica, rastreamento de intercorrências, vacinação da gestante e incentivo ao parto humanizado.', 'https://avasus.ufrn.br/', 30, 1, 'Certificado 100% Gratuito', 'Iniciante', '["Saúde","AVASUS","Pré-Natal","Saúde da Mulher","SUS"]', 0, 4.8, 4150, 1),
('fiocruz-vigilancia-epidemiologica-imunizacoes', 'Vigilância Epidemiológica e Imunizações no SUS', 'Fiocruz', 'Fiocruz', 'bg-teal-50 text-teal-900 border-teal-300 font-black', 'saude', 'Capacitação sobre o Programa Nacional de Imunizações (PNI), conservação em cadeia de frio, busca ativa de faltosos, notificação compulsória de agravos e acolhimento em salas de vacina.', 'https://campusvirtual.fiocruz.br/portal/', 40, 1, 'Certificado 100% Gratuito', 'Intermediário', '["Saúde","Fiocruz","Vacinas","Vigilância","Epidemiologia"]', 1, 4.9, 6200, 1),
('unasus-acolhimento-recepcao-unidades-saude', 'Acolhimento com Classificação de Risco e Humanização na Recepção', 'UNA-SUS / UFMA', 'UNA-SUS / UFMA', 'bg-teal-50 text-teal-900 border-teal-300 font-black', 'saude', 'Práticas de recepção humanizada em UPAs e UBSs, organização de filas, escuta atenta, comunicação não-violenta e protocolos de prioridade assistencial conforme a Política Nacional de Humanização.', 'https://www.unasus.gov.br/cursos/busca', 30, 1, 'Certificado 100% Gratuito', 'Iniciante', '["Saúde","UNA-SUS","Recepção","Humanização","Atendimento"]', 0, 4.8, 3540, 1),
('poca-farmacologia-uso-racional-medicamentos', 'Noções de Farmacologia e Uso Racional de Medicamentos', 'PoCA (UFSCar)', 'UFSCar', 'bg-emerald-50 text-emerald-900 border-emerald-300 font-black', 'saude', 'Conceitos fundamentais de posologia, interações medicamentosas frequentes, cuidados no armazenamento, perigos da automedicação e orientação correta ao paciente no balcão e no domicílio.', 'https://cursos.poca.ufscar.br/', 20, 1, 'Certificado 100% Gratuito', 'Iniciante', '["Saúde","UFSCar","Farmácia","Medicamentos","Cuidados"]', 0, 4.9, 4210, 1);`;

if (sql.includes(targetStr)) {
  sql = sql.replace(targetStr, newRows);
  fs.writeFileSync(dbPath, sql, 'utf8');
  console.log('✅ database.sql atualizado com os novos 6 cursos de saúde (LF)!');
} else if (sql.includes(targetStr.replace(/\n/g, '\r\n'))) {
  sql = sql.replace(targetStr.replace(/\n/g, '\r\n'), newRows.replace(/\n/g, '\r\n'));
  fs.writeFileSync(dbPath, sql, 'utf8');
  console.log('✅ database.sql atualizado com os novos 6 cursos de saúde (CRLF)!');
} else {
  console.warn('⚠️ Não foi possível localizar a linha final em database.sql');
}
