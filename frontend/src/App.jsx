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

  // Rola a página para o topo sempre que mudar de aba
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'auto'
    });
  }, [activeTab]);

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

  // Votar em uma demanda com proteção contra múltiplos cliques no mesmo navegador
  const handleVotar = async (id) => {
    // 1. Verifica se já votou nesta demanda nesta sessão/navegador
    const votosSalvosLocalmente = JSON.parse(localStorage.getItem('votos_senac') || '{}');
    
    if (votosSalvosLocalmente[id] || votosRealizados[id]) {
      showToast('⚠️ Você já votou nesta demanda anteriormente!');
      return;
    }

    try {
      await api.post(`/api/enquetes/${id}/votar`);
      
      // 2. Marca localmente como votado para impedir novos cliques
      const novosVotos = { ...votosSalvosLocalmente, [id]: true };
      localStorage.setItem('votos_senac', JSON.stringify(novosVotos));
      
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
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Branding SENAC MG com Fundo Claro */}
            <div className="flex items-center space-x-3">
              {/* Logo Oficial do Senac em Imagem */}
              <img 
                src="https://www.mg.senac.br/image/company_logo?img_id=33792" 
                alt="Senac em Minas" 
                className="h-10 w-auto object-contain"
              />

              {/* Divisor vertical discreto */}
              <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>

              {/* Textos em Azul */}
              <div>
                <h1 className="font-bold text-lg sm:text-xl leading-tight text-slate-900 flex items-center gap-2">
                  Enquete Comunidade
                  <span className="text-xs bg-blue-100 text-blue-900 border border-blue-200 px-2 py-0.5 rounded-full hidden md:inline-block font-semibold">
                    MG
                  </span>
                </h1>
                <p className="text-xs text-blue-700 font-medium">
                  Projeto Integrador: Soluções Tecnológicas
                </p>
              </div>
            </div>

            {/* Nav Buttons */}
            <nav className="hidden md:flex items-center space-x-1 bg-blue-950 p-1.5 rounded-xl border border-blue-900 shadow-inner">
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
                          disabled={votosRealizados[prob.id] || JSON.parse(localStorage.getItem('votos_senac') || '{}')[prob.id]}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-bold transition ${
                            votosRealizados[prob.id] || JSON.parse(localStorage.getItem('votos_senac') || '{}')[prob.id]
                              ? 'bg-emerald-600 text-white border-emerald-700 cursor-not-allowed opacity-90'
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
            
            {/* 1. CARD SUPERIOR: PROJETO INTEGRADOR */}
            <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 text-white p-8 rounded-3xl shadow-lg relative overflow-hidden border border-blue-700/50">
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

            {/* 2. CARD INFERIOR: SENAC MINAS (Igual ao padrão do primeiro card) */}
            <a 
              href="https://mg.senac.br/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 text-white p-8 sm:p-10 rounded-3xl shadow-lg relative overflow-hidden border border-blue-700/50 text-center space-y-6 transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl hover:border-orange-400 group cursor-pointer"
            >
              
              {/* Badge no canto esquerdo */}
              <div className="flex justify-start">
                <span className="bg-orange-500 text-white text-xs font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
                  CONHEÇA O SENAC-MG
                </span>
              </div>

              {/* Logo SVG Oficial (Branco) e Assinatura Institucional */}
              <div className="flex flex-col items-center justify-center space-y-3 pt-2">
                
                <svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" version="1.1" viewBox="0 0 620.92 388.4" className="w-36 h-auto drop-shadow-md">
                  <style>{`.st0 { fill: #ffffff; }`}</style>
                  <path className="st0" d="M298.55,97.3c-12.57,4.14-24.72,9.01-36.37,14.54,6.13,7.81,12.7,15.38,19.69,22.7,4.38-12.87,9.98-25.32,16.68-37.25h0Z"></path>
                  <path className="st0" d="M497.36,84.43c-27.26-18.77-60.13-33.56-96.23-42.41-8.93-2.1-17.89-4.1-27.17-5.45-.34-.05-.74-.07-1.08-.13-13.17,9.73-25.3,20.46-36.22,31.99,12.1-1.77,24.44-2.9,37.04-3.35,44.03-1.62,85.88,5.59,123.66,19.34h0Z"></path>
                  <path className="st0" d="M325.42,172.45c17.12-12.66,35.86-23.95,56.08-33.51,49.83-23.52,102-33.44,151.21-31.28-42.37-18.71-91-28.56-142.41-26.7-25.35.93-49.82,4.66-73,10.79-11.57,15.53-21.12,32.24-28.38,49.81,11.18,10.99,23.38,21.35,36.5,30.89h0Z"></path>
                  <path className="st0" d="M272.8,221.45c13.52-15.88,29.03-30.6,46.21-44-11.88-8.52-22.98-17.68-33.31-27.38-8.27,22.65-12.83,46.6-12.9,71.38h0Z"></path>
                  <path className="st0" d="M285.48,129.61c5.73-11.88,12.06-23.23,18.91-34.03-14.6,4.5-28.71,9.88-42.11,16.24,6.36,8.11,13.24,15.95,20.54,23.52.88-1.91,1.75-3.83,2.66-5.73h0Z"></path>
                  <path className="st0" d="M573.25,324.34c-.61.01-1.22.03-1.84.03-25.29,0-43.63-16.18-43.63-38.49v-.49c0-21.34,18.38-38.05,41.83-38.05,1.25,0,2.47.04,3.64.11v-25.63c-1.09-.04-2.21-.04-3.34-.04-45.94,0-80.62,27.54-80.62,64.1v.47c0,35.67,35.15,63.62,80.03,63.62,1.37,0,2.62-.04,3.93-.07v-25.56h0Z"></path>
                  <path className="st0" d="M108.75,270.63c-27.11-5.78-30.93-8.56-30.93-17.13v-.39c0-6.32,6.96-11.34,20.17-11.34,6.74,0,15.54,1.83,21.72,4.12v-27.34c-5.74-.99-14.56-2.13-21.26-2.13-32.05,0-54.88,15.66-54.88,39.34v.35c0,25.89,20.36,33.15,51.97,39.86,26.21,5.59,28.69,9.32,28.69,16.59v.37c0,7.64-8.52,12.29-22.64,12.29-17.92,0-29.8-6.14-43.91-15.84l-20.4,20.31c18.82,13.97,39.89,20.87,63.64,20.87,33.84,0,57.59-14.53,57.59-40.42v-.37c0-22.73-17.94-32.24-49.75-39.13h0Z"></path>
                  <path className="st0" d="M187.8,282.18c2.71-13.77,11.96-22.76,26.18-22.76s23.45,9.18,25.49,22.76h-51.67ZM213.98,235.09h0c-35.19,0-59.77,25.14-59.77,55.65v.39c0,32.71,26.83,55.25,63.15,55.25,1.04,0,4.42-.14,5.46-.16v-24.37c-.86.03-4.12.19-5.03.19-15.35,0-26.16-7.17-29.56-20.93h83.41c.2-2.81.43-4.59.43-7.6v-.38c0-30.32-17.74-58.04-58.1-58.04h.01Z"></path>
                  <path className="st0" d="M380.85,287.8c0-28.92-17.68-51.49-55.08-51.49s-55.13,22.57-55.13,51.49v56.6h34.65v-58.68c.63-10.71,4.83-23.36,20.48-23.36s20.15,12.65,20.76,23.36v58.68h34.33v-56.6h-.01Z"></path>
                  <path className="st0" d="M437.2,235.7c-1.52,0-6.76.02-8.2.06v25.87c6.68.07,15.82,1.19,19.9,3.34,5.98,3.15,9.09,8.46,9.24,15.65-8.16-.95-17.42-1.6-25.44-1.81-32.74-.84-48.92,9.98-52.17,27.31-.07.32-.12.65-.18.98-.02.11-.03.22-.05.33-.25,1.65-.4,3.39-.4,5.24v.39c0,21.18,18.72,32.73,41.48,32.73,16.71,0,28.22-5.41,36.54-13.57v12.32h33.16v-62.78c0-28.93-16.47-46.06-53.87-46.06h-.01ZM458.25,306.36h0c-2.98,15.63-19.11,17.97-22.77,18.16-26.09,1.37-27.01-16.46-18.25-21.9,11.79-7.3,41.12-3.2,41.12-3.2,0,1.05.28,3.72-.11,6.94h.01Z"></path>
                </svg>

                <p className="text-[11px] sm:text-xs text-blue-200 tracking-wide font-medium">
                  CNC | Fecomércio MG | Sindicatos Empresariais | Sesc
                </p>
              </div>

              {/* Frase Institucional */}
              <div className="max-w-2xl mx-auto pt-2">
                <p className="text-sm sm:text-base text-blue-100 leading-relaxed font-normal italic">
                  "No Senac Minas, educar é transformar, e é isso que fazemos todos os dias: inspirar pessoas, impulsionar carreiras e contribuir para o desenvolvimento de todo o nosso estado."
                </p>
              </div>

              {/* Indicador de Link */}
              <div className="pt-2 text-xs font-semibold text-orange-400 flex items-center justify-center gap-1 opacity-90 group-hover:underline">
                Visitar site oficial do Senac MG →
              </div>

            </a>

          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-8 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" version="1.1" viewBox="0 0 620.92 388.4" className="w-16 h-auto">
              <style>{`.st0 { fill: #ffffff; }`}</style>
              <path className="st0" d="M298.55,97.3c-12.57,4.14-24.72,9.01-36.37,14.54,6.13,7.81,12.7,15.38,19.69,22.7,4.38-12.87,9.98-25.32,16.68-37.25h0Z"></path>
              <path className="st0" d="M497.36,84.43c-27.26-18.77-60.13-33.56-96.23-42.41-8.93-2.1-17.89-4.1-27.17-5.45-.34-.05-.74-.07-1.08-.13-13.17,9.73-25.3,20.46-36.22,31.99,12.1-1.77,24.44-2.9,37.04-3.35,44.03-1.62,85.88,5.59,123.66,19.34h0Z"></path>
              <path className="st0" d="M325.42,172.45c17.12-12.66,35.86-23.95,56.08-33.51,49.83-23.52,102-33.44,151.21-31.28-42.37-18.71-91-28.56-142.41-26.7-25.35.93-49.82,4.66-73,10.79-11.57,15.53-21.12,32.24-28.38,49.81,11.18,10.99,23.38,21.35,36.5,30.89h0Z"></path>
              <path className="st0" d="M272.8,221.45c13.52-15.88,29.03-30.6,46.21-44-11.88-8.52-22.98-17.68-33.31-27.38-8.27,22.65-12.83,46.6-12.9,71.38h0Z"></path>
              <path className="st0" d="M285.48,129.61c5.73-11.88,12.06-23.23,18.91-34.03-14.6,4.5-28.71,9.88-42.11,16.24,6.36,8.11,13.24,15.95,20.54,23.52.88-1.91,1.75-3.83,2.66-5.73h0Z"></path>
              <path className="st0" d="M573.25,324.34c-.61.01-1.22.03-1.84.03-25.29,0-43.63-16.18-43.63-38.49v-.49c0-21.34,18.38-38.05,41.83-38.05,1.25,0,2.47.04,3.64.11v-25.63c-1.09-.04-2.21-.04-3.34-.04-45.94,0-80.62,27.54-80.62,64.1v.47c0,35.67,35.15,63.62,80.03,63.62,1.37,0,2.62-.04,3.93-.07v-25.56h0Z"></path>
              <path className="st0" d="M108.75,270.63c-27.11-5.78-30.93-8.56-30.93-17.13v-.39c0-6.32,6.96-11.34,20.17-11.34,6.74,0,15.54,1.83,21.72,4.12v-27.34c-5.74-.99-14.56-2.13-21.26-2.13-32.05,0-54.88,15.66-54.88,39.34v.35c0,25.89,20.36,33.15,51.97,39.86,26.21,5.59,28.69,9.32,28.69,16.59v.37c0,7.64-8.52,12.29-22.64,12.29-17.92,0-29.8-6.14-43.91-15.84l-20.4,20.31c18.82,13.97,39.89,20.87,63.64,20.87,33.84,0,57.59-14.53,57.59-40.42v-.37c0-22.73-17.94-32.24-49.75-39.13h0Z"></path>
              <path className="st0" d="M187.8,282.18c2.71-13.77,11.96-22.76,26.18-22.76s23.45,9.18,25.49,22.76h-51.67ZM213.98,235.09h0c-35.19,0-59.77,25.14-59.77,55.65v.39c0,32.71,26.83,55.25,63.15,55.25,1.04,0,4.42-.14,5.46-.16v-24.37c-.86.03-4.12.19-5.03.19-15.35,0-26.16-7.17-29.56-20.93h83.41c.2-2.81.43-4.59.43-7.6v-.38c0-30.32-17.74-58.04-58.1-58.04h.01Z"></path>
              <path className="st0" d="M380.85,287.8c0-28.92-17.68-51.49-55.08-51.49s-55.13,22.57-55.13,51.49v56.6h34.65v-58.68c.63-10.71,4.83-23.36,20.48-23.36s20.15,12.65,20.76,23.36v58.68h34.33v-56.6h-.01Z"></path>
              <path className="st0" d="M437.2,235.7c-1.52,0-6.76.02-8.2.06v25.87c6.68.07,15.82,1.19,19.9,3.34,5.98,3.15,9.09,8.46,9.24,15.65-8.16-.95-17.42-1.6-25.44-1.81-32.74-.84-48.92,9.98-52.17,27.31-.07.32-.12.65-.18.98-.02.11-.03.22-.05.33-.25,1.65-.4,3.39-.4,5.24v.39c0,21.18,18.72,32.73,41.48,32.73,16.71,0,28.22-5.41,36.54-13.57v12.32h33.16v-62.78c0-28.93-16.47-46.06-53.87-46.06h-.01ZM458.25,306.36h0c-2.98,15.63-19.11,17.97-22.77,18.16-26.09,1.37-27.01-16.46-18.25-21.9,11.79-7.3,41.12-3.2,41.12-3.2,0,1.05.28,3.72-.11,6.94h.01Z"></path>
            </svg>
            <span>Serviço Nacional de Aprendizagem Comercial — MG</span>
          </div>
          <p>© 2026 — Projeto Integrador do Curso Técnico em Desenvolvimento de Sistemas.</p>
        </div>
      </footer>

    </div>
  );
}