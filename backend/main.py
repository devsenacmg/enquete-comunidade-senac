import os
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from pydantic import BaseModel
from datetime import datetime

# ------------------------------------------------------------------
# CONFIGURAÇÃO DO BANCO DE DADOS (Supabase / PostgreSQL)
# ------------------------------------------------------------------
# Substitua a string abaixo pela sua URI do Supabase (com a senha real)

DATABASE_URL = "postgresql://postgres.ybwvwjeifiukpthmmtcn:pupilosSenac2027@aws-0-us-east-1.pooler.supabase.com:5432/postgres"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# ------------------------------------------------------------------
# MODELO DA TABELA POSTGRESQL
# ------------------------------------------------------------------
class RespostaBD(Base):
    __tablename__ = "respostas_enquete"

    id = Column(Integer, primary_key=True, index=True)
    bairro = Column(String(100), nullable=False)
    perfil = Column(String(100), nullable=False)
    categoria = Column(String(100), nullable=False)
    frequencia = Column(String(50), nullable=False)
    descricao = Column(Text, nullable=False)
    sugestao_sistema = Column(Text, nullable=True)
    votos = Column(Integer, default=0)
    data_criacao = Column(DateTime, default=datetime.utcnow)

# Cria a tabela automaticamente no Supabase
Base.metadata.create_all(bind=engine)

# ------------------------------------------------------------------
# INICIALIZAÇÃO DA API
# ------------------------------------------------------------------
app = FastAPI(
    title="API Enquete Comunidade - SENAC MG",
    description="Backend para levantamento de demandas da comunidade."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class RespostaCreate(BaseModel):
    bairro: str
    perfil: str
    categoria: str
    frequencia: str
    descricao: str
    sugestao_sistema: str | None = None

# ------------------------------------------------------------------
# ROTAS DA API
# ------------------------------------------------------------------
@app.get("/")
def home():
    return {"mensagem": "API do Projeto Integrador SENAC MG ativa com Supabase!"}

@app.post("/api/enquetes")
def criar_resposta(dados: RespostaCreate, db: Session = Depends(get_db)):
    nova_resposta = RespostaBD(**dados.model_dump())
    db.add(nova_resposta)
    db.commit()
    db.refresh(nova_resposta)
    return {"status": "sucesso", "dados": nova_resposta}

@app.get("/api/enquetes")
def listar_respostas(db: Session = Depends(get_db)):
    return db.query(RespostaBD).order_by(RespostaBD.votos.desc()).all()

@app.post("/api/enquetes/{item_id}/votar")
def votar_resposta(item_id: int, db: Session = Depends(get_db)):
    item = db.query(RespostaBD).filter(RespostaBD.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item não encontrado")
    item.votos += 1
    db.commit()
    return {"status": "sucesso", "votos_atualizados": item.votos}