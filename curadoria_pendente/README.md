# Diretório de Curadoria Semanal com Human-in-the-Loop (Você Pode Tudo)

Este diretório armazena os rascunhos de novos cursos pesquisados pela curadoria editorial do Você Pode Tudo.

## Fluxo Seguro de Publicação:
1. **Pesquisa Curada:** A equipe pesquisa cursos 100% gratuitos com certificado oficial em instituições públicas e oficiais (Fundação Bradesco, EV.G, PoCA UFSCar, Microsoft Learn, Cisco, SEBRAE).
2. **Staging Local:** Os cursos identificados são salvos em `cursos_pendentes.json` com status `"pendente_aprovacao_humana"`. **Nenhum deploy para a produção é executado automaticamente.**
3. **Revisão Humana:** O administrador do Você Pode Tudo analisa a lista, testa as URLs e verifica a gratuidade do certificado.
4. **Publicação Controlada:** Após aprovação humana, os cursos são inseridos no banco MariaDB remoto e os arquivos estáticos de cache são sincronizados.

---

## Cursos Atualmente em Fila de Aprovação (EV.G / Gov.br):

### 1. Segurança da Informação para Todos
- **ID:** `evg-seguranca-informacao-todos`
- **Instituição:** Escola Virtual de Governo (EV.G / RNP)
- **URL:** https://www.escolavirtual.gov.br/curso/307
- **Carga Horária:** 24h
- **Certificado:** Gratuito (Oficial Enap / Gov.br)
- **SQL para inserção (após aprovação):**
```sql
INSERT INTO courses (id, title, provider, provider_tag, provider_color, category, description, url, workload_hours, has_free_certificate, certificate_note, level, tags, featured, rating, reviews_count, is_active)
VALUES (
  'evg-seguranca-informacao-todos',
  'Segurança da Informação para Todos',
  'Escola Virtual de Governo (EV.G / RNP)',
  'Gov.br / EV.G',
  'bg-blue-50 text-[#002776] border-blue-200 font-black',
  'tecnologia',
  'Privacidade, proteção de dados pessoais, identificação de malwares, navegação segura e diretrizes de cibersegurança do Governo Federal.',
  'https://www.escolavirtual.gov.br/curso/307',
  24,
  1,
  'Certificado Oficial Enap / Gov.br',
  'Iniciante',
  '["Gov.br","Cibersegurança","Certificado Oficial"]',
  1,
  4.9,
  3420,
  1
);
```

### 2. Inteligência Artificial Generativa
- **ID:** `evg-ia-generativa-microsoft`
- **Instituição:** Escola Virtual de Governo (EV.G / Microsoft)
- **URL:** https://www.escolavirtual.gov.br/curso/1094
- **Carga Horária:** 2h
- **Certificado:** Gratuito (Oficial Enap / Microsoft)
- **SQL para inserção (após aprovação):**
```sql
INSERT INTO courses (id, title, provider, provider_tag, provider_color, category, description, url, workload_hours, has_free_certificate, certificate_note, level, tags, featured, rating, reviews_count, is_active)
VALUES (
  'evg-ia-generativa-microsoft',
  'Inteligência Artificial Generativa',
  'Escola Virtual de Governo (EV.G / Microsoft)',
  'Microsoft / Enap',
  'bg-emerald-50 text-emerald-900 border-emerald-300 font-black',
  'tecnologia',
  'Conceitos essenciais de IA generativa, modelos de linguagem natural, criação de imagens e aplicação prática com certificação oficial Enap.',
  'https://www.escolavirtual.gov.br/curso/1094',
  2,
  1,
  'Certificado Oficial Enap / Microsoft',
  'Iniciante',
  '["Inteligência Artificial","Microsoft","Certificado Oficial"]',
  1,
  4.9,
  5180,
  1
);
```
