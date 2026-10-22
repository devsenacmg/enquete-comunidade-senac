import React, { useState, useEffect } from 'react';
import { Vote, CheckCircle2, ThumbsUp, Sparkles, Loader2, AlertCircle, PlusCircle, Send } from 'lucide-react';
import api from './services/api';

function App() {
  const [enquetes, setEnquetes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState(null);
  const [votosRealizados, setVotosRealizados] = useState({});
  const [mensagemSucesso, setMensagemSucesso] = useState('');

  // Estado do Formulário
  const [formData, setFormData] = useState({
    bairro: '',
    perfil: 'Estudante',
    categoria: 'Infraestrutura',
    frequencia: 'Diário',
    descricao: '',
    sugestao_sistema: ''
  });

  // Opções para os campos de seleção (Dropdowns)
  const perfis = ['Estudante', 'Docente', 'Colaborador', 'Comerciante', 'Morador/Comunidade'];
  const categorias = ['Infraestrutura', 'Tecnologia', 'Cursos e Capacitação', 'Segurança', 'Mobilidade', 'Outros'];
  const frequencias = ['Diário', 'Semanal', 'Mensal', 'Raramente'];

  // Carregar enquetes do backend (FastAPI + Supabase)
  const carregarEnquetes = async () => {
    try {
      setCarregando(true);
      const response = await api.get('/api/enquetes');
      setEnquetes(response.data);
      setErro(null);
    } catch (err) {
      console.error("Erro ao carregar enquetes:", err);
      setErro("Não foi possível carregar as enquetes do servidor.");
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarEnquetes();
  }, []);

  // Manipular mudanças nos campos do formulário
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Enviar nova demanda/sugestão para a API
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.bairro || !formData.descricao) {
      alert("Por favor, preencha o Bairro e a Descrição da sua demanda.");
      return;
    }

    try {
      setEnviando(true);
      await api.post('/api/enquetes', formData);
      setMensagemSucesso('Sua demanda/sugestão foi cadastrada com sucesso!');
      
      // Limpar formulário
      setFormData({
        bairro: '',
        perfil: 'Estudante',
        categoria: 'Infraestrutura',
        frequencia: 'Diário',
        descricao: '',
        sugestao_sistema: ''
      });

      // Recarregar lista de demandas
      carregarEnquetes();

      // Ocultar mensagem após 4 segundos
      setTimeout(() => setMensagemSucesso(''), 4000);
    } catch (err) {
      console.error("Erro ao enviar demanda:", err);
      alert("Erro ao cadastrar demanda. Verifique sua conexão.");
    } finally {
      setEnviando(false);
    }
  };

  // Votar em uma demanda existente
  const handleVotar = async (id) => {
    try {
      await api.post(`/api/enquetes/${id}/votar`);
      setVotosRealizados(prev => ({ ...prev, [id]: true }));
      carregarEnquetes();
    } catch (err) {
      console.error("Erro ao registrar voto:", err);
      alert("Erro ao registrar o voto. Tente novamente.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans pb-16">
      
      {/* Cabeçalho Institucional SENAC */}
      <header className="bg-blue-800 text-white shadow-md py-4 px-6 border-b-4 border-amber-400">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Vote className="w-8 h-8 text-amber-400" />
            <div>
              <h1 className="text-xl font-bold tracking-wide">Enquete Comunidade - SENAC MG</h1>
              <p className="text-xs text-blue-200">Plataforma de Diagnóstico e Demandas Locais</p>
            </div>
          </div>
          <span className="hidden sm:inline-block text-xs bg-blue-900 text-amber-300 font-semibold px-3 py-1 rounded-full border border-blue-700">
            Muriaé e Região
          </span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto mt-8 px-4 space-y-8">
        
        {/* SECÇÃO 1: FORMULÁRIO DE CADASTRO DE DEMANDAS */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-700 to-blue-800 text-white p-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-amber-400" />
              Cadastrar Nova Demanda ou Sugestão
            </h2>
            <p className="text-blue-100 text-sm mt-1">
              Participe do levantamento do SENAC enviando suas necessidades e ideias de melhorias para a comunidade.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            
            {mensagemSucesso && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>{mensagemSucesso}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Bairro */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Bairro / Região <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="bairro"
                  value={formData.bairro}
                  onChange={handleChange}
                  placeholder="Ex: Centro, Barra, Porto..."
                  required
                  className="w-full p-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              {/* Perfil */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Seu Perfil
                </label>
                <select
                  name="perfil"
                  value={formData.perfil}
                  onChange={handleChange}
                  className="w-full p-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white"
                >
                  {perfis.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              {/* Categoria */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Categoria da Demanda
                </label>
                <select
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleChange}
                  className="w-full p-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white"
                >
                  {categorias.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Frequência */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Frequência do Problema/Necessidade
                </label>
                <select
                  name="frequencia"
                  value={formData.frequencia}
                  onChange={handleChange}
                  className="w-full p-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white"
                >
                  {frequencias.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Descrição Detalhada <span className="text-rose-500">*</span>
              </label>
              <textarea
                name="descricao"
                rows="3"
                value={formData.descricao}
                onChange={handleChange}
                placeholder="Descreva a necessidade, problema ou oportunidade identificada..."
                required
                className="w-full p-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
              ></textarea>
            </div>

            {/* Sugestão de Sistema / Solução */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Sugestão de Solução ou Ação (Opcional)
              </label>
              <input
                type="text"
                name="sugestao_sistema"
                value={formData.sugestao_sistema}
                onChange={handleChange}
                placeholder="Como o SENAC ou a tecnologia poderiam ajudar a resolver?"
                className="w-full p-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            {/* Botão de Envio */}
            <button
              type="submit"
              disabled={enviando}
              className={`w-full py-3 px-6 rounded-xl font-bold text-white flex items-center justify-center gap-2 shadow-sm transition-all ${
                enviando ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-700 hover:bg-blue-800'
              }`}
            >
              {enviando ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  A Enviar...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 text-amber-400" />
                  Enviar Demanda para o Banco de Dados
                </>
              )}
            </button>
          </form>
        </section>

        {/* SECÇÃO 2: PAINEL DE VOTAÇÃO E LISTAGEM */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                Demandas Cadastradas para Votação
              </h2>
              <p className="text-slate-600 text-xs mt-0.5">
                Acompanhe e apoie as propostas enviadas pela comunidade.
              </p>
            </div>
            <button
              onClick={carregarEnquetes}
              className="text-xs font-semibold text-blue-700 hover:underline"
            >
              Atualizar Lista
            </button>
          </div>

          {/* Estado de Carregamento */}
          {carregando && (
            <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-3 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <Loader2 className="w-8 h-8 animate-spin text-blue-700" />
              <p className="text-sm font-medium">Sincronizando com o Supabase...</p>
            </div>
          )}

          {/* Mensagem de Erro */}
          {erro && !carregando && (
            <div className="p-8 text-center text-rose-600 flex flex-col items-center gap-2 bg-white rounded-2xl border border-slate-200">
              <AlertCircle className="w-10 h-10 text-rose-500" />
              <p className="font-semibold">{erro}</p>
              <p className="text-xs text-slate-500">
                Certifique-se de que o backend FastAPI está rodando em `http://127.0.0.1:8000`.
              </p>
            </div>
          )}

          {/* Lista de Demandas */}
          {!carregando && !erro && (
            <div className="space-y-4">
              {enquetes.length === 0 ? (
                <div className="p-8 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 shadow-sm">
                  <p>Nenhuma demanda cadastrada no momento. Seja o primeiro a enviar acima!</p>
                </div>
              ) : (
                enquetes.map((item) => (
                  <div key={item.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all hover:shadow-md">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2.5 py-0.5 rounded-full">
                          {item.categoria}
                        </span>
                        <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-medium">
                          {item.bairro} ({item.perfil})
                        </span>
                        <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md border border-amber-200">
                          Freq: {item.frequencia}
                        </span>
                      </div>
                      <p className="text-slate-800 font-medium text-sm leading-relaxed">
                        {item.descricao}
                      </p>
                      {item.sugestao_sistema && (
                        <p className="text-xs text-slate-500 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                          <strong className="text-slate-700">Sugestão:</strong> {item.sugestao_sistema}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-4 self-end sm:self-center border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="text-right">
                        <span className="text-2xl font-bold text-blue-700">{item.votos}</span>
                        <p className="text-xs text-slate-400 font-medium">votos</p>
                      </div>

                      <button
                        onClick={() => handleVotar(item.id)}
                        className={`py-2 px-4 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-sm ${
                          votosRealizados[item.id]
                            ? 'bg-emerald-600 text-white'
                            : 'bg-blue-700 hover:bg-blue-800 text-white'
                        }`}
                      >
                        {votosRealizados[item.id] ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            Votado
                          </>
                        ) : (
                          <>
                            <ThumbsUp className="w-4 h-4 text-amber-400" />
                            Apoiar
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}

export default App;