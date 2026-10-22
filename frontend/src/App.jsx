import React, { useState, useEffect } from 'react';
import { Vote, CheckCircle2, Send, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import api from './services/api';

function App() {
  const [enquete, setEnquete] = useState(null);
  const [opcaoSelecionada, setOpcaoSelecionada] = useState(null);
  const [votoEnviado, setVotoEnviado] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  // Buscar enquete do backend FastAPI ao carregar a página
  useEffect(() => {
    async function carregarEnquete() {
      try {
        setCarregando(true);
        // Exemplo de endpoint no FastAPI (ajustar conforme as tuas rotas)
        const response = await api.get('/enquetes/ativa');
        setEnquete(response.data);
        setErro(null);
      } catch (err) {
        console.error("Erro ao carregar enquete:", err);
        setErro("Não foi possível carregar a enquete. Verifica se o backend está a rodar.");
      } finally {
        setCarregando(false);
      }
    }

    carregarEnquete();
  }, []);

  const handleVotar = async () => {
    if (!opcaoSelecionada || !enquete) return;

    try {
      // Enviar voto para o backend
      await api.post(`/enquetes/${enquete.id}/votar`, {
        opcao_id: opcaoSelecionada,
      });
      setVotoEnviado(true);
    } catch (err) {
      console.error("Erro ao enviar voto:", err);
      alert("Ocorreu um erro ao registar o teu voto. Tenta novamente.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans">
      {/* Cabeçalho */}
      <header className="bg-blue-700 text-white shadow-md py-4 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Vote className="w-8 h-8 text-yellow-400" />
            <h1 className="text-xl font-bold tracking-wide">Enquete Comunidade Senac</h1>
          </div>
          <span className="text-xs bg-blue-800 px-3 py-1 rounded-full border border-blue-600 font-medium">
            Comunidade Dev
          </span>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-2xl mx-auto mt-10 px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          
          {/* Indicador de Carregamento */}
          {carregando && (
            <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <p className="text-sm font-medium">A carregar enquete...</p>
            </div>
          )}

          {/* Mensagem de Erro (se o backend estiver offline) */}
          {erro && !carregando && (
            <div className="p-8 text-center text-rose-600 flex flex-col items-center gap-2">
              <AlertCircle className="w-10 h-10 text-rose-500" />
              <p className="font-semibold">{erro}</p>
              <p className="text-xs text-slate-500 mt-1">
                Certifica-te de que executaste `uvicorn backend.main:app --reload`.
              </p>
            </div>
          )}

          {/* Exibição da Enquete */}
          {!carregando && !erro && enquete && (
            <>
              {/* Cabeçalho da Enquete */}
              <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-100">
                <div className="flex items-center gap-2 text-blue-700 text-sm font-semibold mb-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Enquete Ativa</span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 leading-snug">
                  {enquete.titulo}
                </h2>
                {enquete.descricao && (
                  <p className="text-slate-600 text-sm mt-1">{enquete.descricao}</p>
                )}
              </div>

              {/* Opções de Voto */}
              <div className="p-6 space-y-3">
                {!votoEnviado ? (
                  <>
                    {enquete.opcoes?.map((opcao) => (
                      <button
                        key={opcao.id}
                        onClick={() => setOpcaoSelecionada(opcao.id)}
                        className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between ${
                          opcaoSelecionada === opcao.id
                            ? 'border-blue-600 bg-blue-50/60 text-blue-900 font-medium shadow-sm'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span>{opcao.texto}</span>
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            opcaoSelecionada === opcao.id
                              ? 'border-blue-600 bg-blue-600'
                              : 'border-slate-300'
                          }`}
                        >
                          {opcaoSelecionada === opcao.id && (
                            <div className="w-2 h-2 rounded-full bg-white" />
                          )}
                        </div>
                      </button>
                    ))}

                    <button
                      onClick={handleVotar}
                      disabled={!opcaoSelecionada}
                      className={`w-full mt-4 py-3 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                        opcaoSelecionada
                          ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <Send className="w-4 h-4" />
                      Confirmar Voto
                    </button>
                  </>
                ) : (
                  /* Tela de Agradecimento */
                  <div className="text-center py-8">
                    <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-3" />
                    <h3 className="text-2xl font-bold text-slate-800">Obrigado pelo seu voto!</h3>
                    <p className="text-slate-600 mt-1">
                      A sua opinião é fundamental para a comunidade Senac.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}

        </div>
      </main>
    </div>
  );
}

export default App;