# Enquete Comunidade Senac 🗳️

Aplicação web desenvolvida para criar e gerir enquetes interativas para a comunidade Senac, permitindo votação em tempo real e visualização de resultados. Este projeto tem como principal objetivo o **aprendizado prático do desenvolvimento full stack**, documentando cada decisão e evolução técnica.

---

## 🚀 Stack Tecnológica

### **Backend**
* **Python / FastAPI:** Framework web de alta performance para a construção da API.
* **Supabase / PostgreSQL:** Base de dados relacional na nuvem para persistência dos dados.
* **SQLAlchemy:** ORM (Object-Relational Mapping) para a gestão das tabelas e consultas.

### **Frontend**
* **React + Vite:** Biblioteca moderna para construção de componentes de interface rápidos e leves.
* **Tailwind CSS:** Framework de estilização baseada em utilitários para um design limpo e responsivo.
* **Axios:** Cliente HTTP para gerir a comunicação assíncrona entre o frontend e a API.
* **Lucide React:** Biblioteca de ícones modernos e minimalistas.

---

## 📂 Estrutura do Projeto

```text
enquete-comunidade-senac/
├── backend/          # API FastAPI, modelos e conexão com base de dados
├── frontend/         # Aplicação React + Vite (Componentes, UI e Serviços)
└── README.md         # Documentação e histórico de evolução do projeto
```

---

## ⏳ Linha do Tempo e Histórico de Desenvolvimento

> *Este registo serve como um diário de bordo para consulta, revisão de conceitos e aprendizado contínuo.*

### **Fase 1: Configuração do Backend e Base de Dados**
* **Objetivo:** Estabelecer a fundação do projeto no lado do servidor e ligar à base de dados.
* **Ações Executadas:**
  * Criação do ambiente virtual Python (`.venv`) e instalação do FastAPI e SQLAlchemy.
  * Configuração da conexão com o **Supabase (PostgreSQL)**.
  * Estruturação inicial do repositório Git com controlo de versões e resolução de conflitos de credenciais via PAT (Personal Access Token).

### **Fase 2: Estruturação e Inicialização do Frontend**
* **Objetivo:** Criar a interface de utilizador utilizando ferramentas modernas de mercado.
* **Ações Executadas:**
  * Instalação do **Node.js** e inicialização do projeto React utilizando o **Vite**.
  * Instalação e configuração do **Tailwind CSS** para estilização rápida e responsiva.
  * Instalação de pacotes auxiliares: **Lucide React** (para ícones) e **Axios** (para requisições HTTP).
  * Resolução de erros comuns de resolução de módulos e dependências do ambiente Node.

### **Fase 3: Desenvolvimento de Componentes e Design da UI**
* **Objetivo:** Desenvolver a experiência visual com base no layout planeado para as enquetes.
* **Ações Executadas:**
  * Criação do componente principal com cabeçalho institucional, cartão de perguntas e opções de voto dinâmicas.
  * Implementação de estados locais em React (`useState`) para gerir a seleção visual das opções e a transição para a tela de agradecimento pós-voto.

### **Fase 4: Integração Frontend & Backend (Em Desenvolvimento)**
* **Objetivo:** Ligar a interface criada à API do FastAPI.
* **Ações Executadas:**
  * Criação do serviço centralizado de API (`src/services/api.js`) com o Axios configurado para apontar para `http://127.0.0.1:8000`.
  * Preparação dos hooks de ciclo de vida (`useEffect`) para consumo dinâmico dos dados da enquete diretamente da base de dados.

---

## ⚙️ Como Executar o Projeto Localmente

### **1. Executar o Backend**
1. Ativa o ambiente virtual do Python:
   ```powershell
   .venv\Scripts\Activate
   ```
2. Inicia o servidor FastAPI com recarregamento automático:
   ```powershell
   uvicorn backend.main:app --reload
   ```

### **2. Executar o Frontend**
1. Abre um novo terminal e navega até à pasta do frontend:
   ```powershell
   cd frontend
   ```
2. Inicia o servidor de desenvolvimento do Vite:
   ```powershell
   npm run dev
   ```
3. Acede no navegador através do endereço: `http://localhost:5173/`