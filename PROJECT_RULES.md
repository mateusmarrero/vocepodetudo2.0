# 📌 Diretrizes e Regras Permanentes — Portal Você Pode Tudo (VCPDTD)

Este arquivo define os requisitos fundamentais do projeto que devem ser mantidos e preservados em qualquer desenvolvimento futuro.

---

### 1. 🔒 Credenciais Administrativas Oficiais
* **Usuário:** `admin`
* **Senha Oficial:** `Rx178gpo2@1985`
* **Hash BCRYPT de Referência:** `$2b$10$X.fiIOTfTyCr1XsA7Na5A.Uqi.EfRRIfiqCNLfuexDCmxN9DNsoDG`
* **Regra Fundamental:** Esta senha deve se manter ativa, permanente e imutável em qualquer alteração futura do site, migrações de banco, atualizações de scripts PHP, `.sql` ou fallbacks de autenticação, até que o proprietário solicite expressamente a sua alteração.
* **Proibição:** Nunca reverter para `admin123` ou qualquer senha de exemplo.

---

### 2. 📚 Integridade do Catálogo de Cursos
* A base oficial completa do portal é composta por **155 cursos gratuitos com certificado** das maiores instituições do Brasil e do mundo (Fundação Bradesco, EV.G/Gov.br, Hackers do Bem, Microsoft, Oracle, Cisco, PoCA UFSCar, FGV e USP).
* Toda e qualquer sincronização com banco ou API deve sempre preservar a integridade dos 155 cursos oficiais, nunca permitindo que o catálogo seja truncado por arquivos de teste ou respostas parciais.
