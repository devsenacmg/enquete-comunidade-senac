# 📊 Enquete Comunidade Senac

Aplicação web desenvolvida para a realização e gestão de enquetes com a comunidade do Senac.

---

## 🛠️ Tecnologias Utilizadas

### **Backend**
* **Python 3.14**
* **FastAPI** — Framework web moderno para construção de APIs RESTful.
* **SQLAlchemy** — ORM para mapeamento objeto-relacional e comunicação com o banco de dados.
* **PostgreSQL / Supabase** — Banco de dados relacional e infraestrutura em nuvem.
* **Uvicorn** — Servidor ASGI de alta performance.

### **Frontend** *(Próxima Etapa)*
* **React**

### **Ferramentas & Versionamento**
* **Git & GitHub**
* **VS Code**

---

## 📂 Estrutura do Projeto

```text
enquete-comunidade-senac/
├── .venv/               # Ambiente virtual Python (ignorado pelo Git)
├── .gitignore           # Configuração de arquivos ignorados no versionamento
├── requirements.txt     # Dependências do projeto Python
├── README.md            # Documentação técnica do repositório
└── backend/             # Código-fonte da API em FastAPI
    └── main.py          # Ponto de entrada e rotas da aplicação
```

---

## 🚀 O Que Foi Realizado Até Agora

### 1. **Estrutura Backend e Banco de Dados**
* Configuração do ambiente virtual (`.venv`) e instalação das dependências essenciais.
* Criação e estruturação da API com **FastAPI**.
* Integração e configuração do **SQLAlchemy** conectado à instância PostgreSQL no **Supabase**.
* Mapeamento de rotas e criação do arquivo de dependências `requirements.txt`.

### 2. **Versionamento e Repositório GitHub**
* Inicialização do repositório Git local e aplicação do `.gitignore` para exclusão de ambientes virtuais e arquivos sensíveis.
* Resolução de permissões via **Personal Access Token (PAT)** no Git Credentials.
* Publicação do repositório no repositório remoto: [`devsenacmg/enquete-comunidade-senac`](https://github.com/devsenacmg/enquete-comunidade-senac).

---

## 💻 Como Rodar o Projeto Localmente

### **Prerequisites**
* Python 3.10+ instalado.
* Git instalado.

### **Passos para execução:**

1. **Clonar o repositório:**
   ```bash
   git clone https://github.com/devsenacmg/enquete-comunidade-senac.git
   cd enquete-comunidade-senac
   ```

2. **Criar e ativar o ambiente virtual:**
   * **Windows (PowerShell):**
     ```powershell
     python -m venv .venv
     .\.venv\Scripts\Activate.ps1
     ```
   * **Linux / macOS:**
     ```bash
     python3 -m venv .venv
     source .venv/bin/activate
     ```

3. **Instalar as dependências:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Executar a API com Uvicorn:**
   ```bash
   uvicorn backend.main:app --reload
   ```
   A API estará acessível em `http://127.0.0.1:8000` e a documentação interativa Swagger em `http://127.0.0.1:8000/docs`.

---

## 📌 Próximos Passos
* [ ] Inicialização da aplicação **React** no diretório do projeto.
* [ ] Criação dos componentes de interface da enquete.
* [ ] Integração do Frontend React com as rotas do Backend FastAPI.