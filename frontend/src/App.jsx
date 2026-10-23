import React, { useState, useEffect } from 'react';
import { 
  Vote, 
  BarChart3, 
  Send, 
  ThumbsUp, 
  Users, 
  Sparkles, 
  CheckCircle2, 
  MapPin, 
  GraduationCap, 
  Lightbulb, 
  ShieldAlert, 
  Bus, 
  HeartPulse, 
  Trees, 
  BookOpen, 
  ShoppingBag, 
  HelpCircle,
  Filter,
  TrendingUp,
  Award,
  Loader2,
  AlertCircle
} from 'lucide-react';
import api from './services/api';

// Configuração de Categorias com Ícones e Cores
const CATEGORIES = [
  { id: 'Infraestrutura', label: 'Infraestrutura', icon: Bus, color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { id: 'Tecnologia', label: 'Tecnologia & Sistemas', icon: ShieldAlert, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { id: 'Cursos e Capacitação', label: 'Cursos e Capacitação', icon: BookOpen, color: 'text-purple-600 bg-purple-50 border-purple-200' },
  { id: 'Segurança', label: 'Segurança', icon: HeartPulse, color: 'text-rose-600 bg-rose-50 border-rose-200' },
  { id: 'Mobilidade', label: 'Mobilidade Urbana', icon: Trees, color: 'text-green-600 bg-green-50 border-green-200' },
  { id: 'Outros', label: 'Outros Assuntos', icon: HelpCircle, color: 'text-slate-600 bg-slate-50 border-slate-200' },
];

export default function App() {
  // Estados de Dados da API
  const [enquetes, setEnquetes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState(null);
  const [votosRealizados, setVotosRealizados] = useState({});

  // Estados da Interface
  const [activeTab, setActiveTab] = useState('survey'); // 'survey', 'dashboard', 'about'
  const [filterCategory, setFilterCategory] = useState('Todas');
  const [toastMessage, setToastMessage] = useState(null);

  // Estado do Formulário (Mapeado para a tabela do Supabase)
  const [formData, setFormData] = useState({
    bairro: '',
    perfil: 'Morador',
    categoria: 'Infraestrutura',
    frequencia: 'Diariamente',
    descricao: '',
    sugestao_sistema: ''
  });

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Carregar enquetes do backend FastAPI (Supabase)
  const carregarEnquetes = async () => {
    try {
      setCarregando(true);
      const response = await api.get('/api/enquetes');
      setEnquetes(response.data);
      setErro(null);
    } catch (err) {
      console.error("Erro ao carregar enquetes:", err);
      setErro("Não foi possível carregar as demandas do servidor FastAPI.");
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarEnquetes();
  }, []);

  // Envio do Formulário para a API
    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!formData.bairro || !formData.descricao) {
        showToast('⚠️ Por favor, preencha os campos obrigatórios (*).');
        return;
      }

      try {
        setEnviando(true);
        await api.post('/api/enquetes', formData);

        // Limpar formulário
        setFormData({
          bairro: '',
          perfil: 'Morador',
          categoria: 'Infraestrutura',
          frequencia: 'Diariamente',
          descricao: '',
          sugestao_sistema: ''
        });

        showToast('🎉 Sua demanda foi cadastrada com sucesso no Supabase!');
        await carregarEnquetes();
        
        // Direciona para o Painel & Ideias e rola a página para o topo
        setActiveTab('dashboard');
        window.scrollTo({ top: 0, behavior: 'smooth' });

      } catch (err) {
        console.error("Erro ao enviar demanda:", err);
        showToast('❌ Erro ao enviar proposta. Verifique a conexão.');
      } finally {
        setEnviando(false);
      }
    };

  // Votar em uma demanda (Upvote no Supabase)
  const handleVotar = async (id) => {
    try {
      await api.post(`/api/enquetes/${id}/votar`);
      setVotosRealizados(prev => ({ ...prev, [id]: true }));
      carregarEnquetes();
      showToast('👍 Voto registrado com sucesso!');
    } catch (err) {
      console.error("Erro ao registrar voto:", err);
      showToast('❌ Erro ao registrar voto.');
    }
  };

  // Cálculo de Estatísticas Dinâmicas vindas do Supabase
  const totalSubmissions = enquetes.length;
  const totalVotes = enquetes.reduce((acc, curr) => acc + (curr.votos || 0), 0);

  const categoryCounts = CATEGORIES.map(cat => {
    const count = enquetes.filter(p => p.categoria === cat.id).length;
    return {
      ...cat,
      count,
      percentage: totalSubmissions > 0 ? Math.round((count / totalSubmissions) * 100) : 0
    };
  });

  // Filtro de Demandas
  const filteredProblems = filterCategory === 'Todas' 
    ? [...enquetes].sort((a,b) => (b.votos || 0) - (a.votos || 0))
    : [...enquetes].filter(p => p.categoria === filterCategory).sort((a,b) => (b.votos || 0) - (a.votos || 0));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col justify-between selection:bg-orange-500 selection:text-white">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 max-w-md bg-slate-900 text-white p-4 rounded-xl shadow-2xl border border-slate-700 flex items-start space-x-3 animate-bounce">
          <Sparkles className="w-6 h-6 text-orange-400 shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{toastMessage}</p>
        </div>
      )}

      {/* HEADER INSTITUCIONAL SENAC */}
      <header className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white sticky top-0 z-40 shadow-lg border-b border-orange-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Branding SENAC MG */}
            <div className="flex items-center space-x-3">
              <div className="bg-orange-500 text-white p-2.5 rounded-lg font-black text-xl tracking-wider shadow-md">
                SENAC
              </div>
              <div>
                <h1 className="font-bold text-lg sm:text-xl leading-tight text-white flex items-center gap-2">
                  Enquete Comunidade
                  <span className="text-xs bg-orange-500/20 text-orange-300 border border-orange-400/30 px-2 py-0.5 rounded-full hidden md:inline-block">MG</span>
                </h1>
                <p className="text-xs text-blue-200">Projeto Integrador: Soluções Tecnológicas</p>
              </div>
            </div>

            {/* Nav Buttons */}
            <nav className="hidden md:flex items-center space-x-1 bg-blue-950/50 p-1.5 rounded-xl border border-blue-700/50">
              <button
                onClick={() => setActiveTab('survey')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  activeTab === 'survey'
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'text-blue-100 hover:text-white hover:bg-blue-800/50'
                }`}
              >
                <Vote className="w-4 h-4" />
                Responder Enquete
              </button>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  activeTab === 'dashboard'
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'text-blue-100 hover:text-white hover:bg-blue-800/50'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                Painel & Ideias ({totalSubmissions})
              </button>
              <button
                onClick={() => setActiveTab('about')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  activeTab === 'about'
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'text-blue-100 hover:text-white hover:bg-blue-800/50'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                Sobre o Curso
              </button>
            </nav>

          </div>

          {/* Mobile Navigation */}
          <div className="flex md:hidden border-t border-blue-800/60 py-2 justify-around text-xs">
            <button
              onClick={() => setActiveTab('survey')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 font-medium ${
                activeTab === 'survey' ? 'bg-orange-500 text-white' : 'text-blue-200'
              }`}
            >
              <Vote className="w-3.5 h-3.5" /> Enquete
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 font-medium ${
                activeTab === 'dashboard' ? 'bg-orange-500 text-white' : 'text-blue-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" /> Resultados
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 font-medium ${
                activeTab === 'about' ? 'bg-orange-500 text-white' : 'text-blue-200'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" /> Sobre
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="bg-gradient-to-b from-blue-900 via-blue-800 to-slate-900 text-white py-12 px-4 sm:px-6 relative overflow-hidden border-b border-orange-500/20">
        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-400/40 px-3.5 py-1.5 rounded-full text-orange-300 text-xs sm:text-sm font-semibold tracking-wide">
            <Sparkles className="w-4 h-4 text-orange-400" />
            Voz da Comunidade & SENAC-MG Conectados
          </div>
          
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Qual problema social ou empresarial você enfrenta no seu cotidiano que pode ser <span className="text-orange-400 underline decoration-orange-500/50 underline-offset-4">resolvido com tecnologia?</span>
          </h2>
          
          <p className="text-blue-100 text-base sm:text-lg max-w-2xl mx-auto font-normal leading-relaxed">
            Os estudantes do curso **Técnico em Desenvolvimento de Sistemas do SENAC MG** querem ouvir você! Cadastre sua demanda abaixo e ela será armazenada diretamente no nosso banco de dados.
          </p>
        </div>
      </section>

      {/* CONTEÚDO PRINCIPAL (TABS) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow w-full">
        
        {/* TAB 1: FORMULÁRIO DE CADASTRO */}
        {activeTab === 'survey' && (
          <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 p-6 text-white border-b border-orange-500">
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <Vote className="w-6 h-6 text-orange-400" />
                Formulário de Mapeamento de Necessidades
              </h3>
              <p className="text-blue-200 text-sm mt-1">
                Sua resposta vai direto para o banco de dados do projeto.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
              
              {/* Seção 1: Identificação */}
              <div>
                <h4 className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-4 flex items-center gap-2 border-b pb-2 border-slate-100">
                  <Users className="w-4 h-4 text-orange-500" /> 1. Identificação e Localização:
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                      Bairro / Região <span className="text-orange-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Centro, Porto, Barra..."
                      value={formData.bairro}
                      onChange={(e) => setFormData({...formData, bairro: e.target.value})}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 text-sm outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                      Seu Perfil
                    </label>
                    <select
                      value={formData.perfil}
                      onChange={(e) => setFormData({...formData, perfil: e.target.value})}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 text-sm bg-white"
                    >
                      {['Morador', 'Comerciante', 'Estudante', 'Trabalhador', 'Outro'].map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Seção 2: O Problema */}
              <div>
                <h4 className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-4 flex items-center gap-2 border-b pb-2 border-slate-100">
                  <ShieldAlert className="w-4 h-4 text-orange-500" /> 2. O Problema Enfrentado:
                </h4>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-2">
                      Categoria Principal <span className="text-orange-600">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {CATEGORIES.map((cat) => {
                        const Icon = cat.icon;
                        const isSelected = formData.categoria === cat.id;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setFormData({...formData, categoria: cat.id})}
                            className={`p-3 rounded-xl border text-left flex items-center gap-3 transition ${
                              isSelected
                                ? 'bg-orange-500 text-white border-orange-600 font-semibold shadow-md'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                            }`}
                          >
                            <Icon className={`w-5 h-5 shrink-0 ${isSelected ? 'text-white' : 'text-blue-900'}`} />
                            <span className="text-xs">{cat.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                      Descreva o problema com detalhes: <span className="text-orange-600">*</span>
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Descreva a necessidade ou problema identificado no seu bairro..."
                      value={formData.descricao}
                      onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 text-sm outline-none transition"
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                      Com qual frequência ocorre?
                    </label>
                    <select
                      value={formData.frequencia}
                      onChange={(e) => setFormData({...formData, frequencia: e.target.value})}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 text-sm bg-white"
                    >
                      <option value="Diariamente">Diariamente</option>
                      <option value="Semanal">Semanalmente</option>
                      <option value="Mensal">Mensalmente</option>
                      <option value="Raramente">Raramente / Eventual</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Seção 3: Sugestão */}
              <div>
                <h4 className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-4 flex items-center gap-2 border-b pb-2 border-slate-100">
                  <Lightbulb className="w-4 h-4 text-orange-500" /> 3. Sugestão de Solução Digital:
                </h4>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Como a tecnologia poderia ajudar a resolver isso?
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Ex: Criar um aplicativo web para mapear e notificar o problema..."
                    value={formData.sugestao_sistema}
                    onChange={(e) => setFormData({...formData, sugestao_sistema: e.target.value})}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 text-sm outline-none transition"
                  ></textarea>
                </div>
              </div>

              {/* Botão de Envio */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={enviando}
                  className={`w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg transition flex items-center justify-center gap-2 text-base ${
                    enviando ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {enviando ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" /> A Enviar para o Banco de Dados...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" /> Salvar Formulário
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        )}

        {/* TAB 2: DASHBOARD & FEED REAL DO SUPABASE */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            
            {/* Header do Painel */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div>
                <h3 className="text-2xl font-bold text-blue-950 flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-orange-500" />
                  Painel de Demandas
                </h3>
                <p className="text-slate-600 text-sm">
                  Dados em tempo real extraídos do banco de dados via FastAPI.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2 text-center">
                  <span className="block text-2xl font-extrabold text-blue-900">{totalSubmissions}</span>
                  <span className="text-xs text-blue-700 font-medium uppercase tracking-wider">Registros</span>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-2 text-center">
                  <span className="block text-2xl font-extrabold text-orange-600">{totalVotes}</span>
                  <span className="text-xs text-orange-700 font-medium uppercase tracking-wider">Apoiadores</span>
                </div>
              </div>
            </div>

            {/* Gráfico por Categoria */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h4 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-900" />
                Distribuição por Categoria
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categoryCounts.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <div key={cat.id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col justify-between space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-xs font-bold text-slate-700">
                          <span className={`p-1.5 rounded-md ${cat.color}`}>
                            <Icon className="w-4 h-4" />
                          </span>
                          {cat.label}
                        </span>
                        <span className="text-xs font-bold text-slate-500">{cat.count} registo(s) ({cat.percentage}%)</span>
                      </div>
                      
                      <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-orange-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${cat.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Feed de Problemas do Supabase */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
                <h4 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-orange-500" />
                  Demandas Cadastradas para Votação
                </h4>

                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-500" />
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="text-xs bg-white border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-orange-500 font-medium"
                  >
                    <option value="Todas">Todas as Categorias</option>
                    {CATEGORIES.map(c => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {carregando ? (
                <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500 space-y-2 flex flex-col items-center">
                  <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                  <p>A carregar dados do banco de dados...</p>
                </div>
              ) : filteredProblems.length === 0 ? (
                <div className="bg-white p-8 text-center rounded-2xl border border-slate-200 text-slate-500">
                  <p>Nenhuma demanda encontrada para esta categoria.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredProblems.map((prob) => (
                    <div 
                      key={prob.id} 
                      className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4 relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-orange-500"></div>

                      <div>
                        <div className="flex items-center justify-between text-xs mb-2 gap-2">
                          <span className="bg-blue-50 text-blue-900 border border-blue-200 font-semibold px-2.5 py-0.5 rounded-full">
                            {prob.categoria}
                          </span>
                          <span className="bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded">
                            Freq: {prob.frequencia}
                          </span>
                        </div>

                        <h5 className="font-bold text-slate-900 text-sm mb-1 leading-snug">
                          "{prob.descricao}"
                        </h5>

                        {prob.sugestao_sistema && (
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-700 space-y-1 my-2">
                            <span className="font-bold text-orange-600 flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5" /> Sugestão de Solução:
                            </span>
                            <p>{prob.sugestao_sistema}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{prob.bairro} ({prob.perfil})</span>
                        </div>

                        <button
                          onClick={() => handleVotar(prob.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-bold transition ${
                            votosRealizados[prob.id]
                              ? 'bg-emerald-600 text-white border-emerald-700'
                              : 'bg-orange-500 text-white border-orange-600 hover:bg-orange-600'
                          }`}
                        >
                          <ThumbsUp className="w-3.5 h-3.5 fill-white" />
                          <span>{prob.votos || 0}</span>
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 3: SOBRE O CURSO */}
        {activeTab === 'about' && (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 text-white p-8 rounded-3xl shadow-lg relative overflow-hidden">
              <div className="relative z-10 space-y-4">
                <div className="inline-block bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Projeto Integrador
                </div>
                <h3 className="text-3xl font-extrabold">
                  Técnico em Desenvolvimento de Sistemas — SENAC MG
                </h3>
                <p className="text-blue-100 leading-relaxed text-sm sm:text-base">
                  Através da metodologia do Projeto Integrador, os alunos desenvolvem soluções de software completas (React, FastAPI, PostgreSQL) para resolver problemas reais da comunidade.
                </p>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-8 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="bg-orange-500 text-white px-2 py-0.5 rounded font-black text-xs">SENAC</span>
            <span>Serviço Nacional de Aprendizagem Comercial — MG</span>
          </div>
          <p>© 2026 — Projeto Integrador do Curso Técnico em Desenvolvimento de Sistemas.</p>
        </div>
      </footer>

    </div>
  );
}