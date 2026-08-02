import React, { useState, useEffect, useMemo } from "react";
import { CandidateInfo, Lideranca, CoordenadorRegional, Eleitor, UserSession, MunicipioDefinition } from "./types";
import { AMAPA_MUNICIPIOS, INITIAL_COORDENADORES, INITIAL_LIDERANCAS, INITIAL_ELEITORES } from "./data/mockData";
import ActivationPortal from "./components/ActivationPortal";
import Sidebar from "./components/Sidebar";
import CadastrosTab from "./components/CadastrosTab";
import DashboardTab from "./components/DashboardTab";
import AutoCadastroPortal from "./components/AutoCadastroPortal";
import { motion, AnimatePresence } from "motion/react";
import { Layers, Landmark, ShieldCheck, CheckCircle2, UserCheck } from "lucide-react";

export default function App() {
  // State for confirming WhatsApp self-registration import
  const [importData, setImportData] = useState<{
    isOpen: boolean;
    nome: string;
    tel: string;
    mun: string;
    bairro: string;
    votos: number;
    ocupacao?: string;
    coordIdVal?: string;
    isApoiadorMode?: boolean;
    liderIdVal?: string;
  } | null>(null);

  // Parse URL query parameter on init
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      
      const isLideranca = params.get("importLideranca") === "true";

      if (isLideranca) {
        const nome = params.get("nome") || "";
        const tel = params.get("tel") || "";
        const mun = params.get("mun") || "";
        const bairro = params.get("bairro") || "";
        const votos = Number(params.get("votos") || "10");
        
        let coordIdVal = "";
        let ocupacao = "";

        if (isLideranca) {
          coordIdVal = params.get("coordIdVal") || "";
          ocupacao = params.get("ocupacao") || "";
          if (nome && coordIdVal) {
            setImportData({
              isOpen: true,
              nome, tel, mun, bairro, votos, ocupacao, coordIdVal
            });
          }
        }
      }
    }
  }, []);

  // Use session state to control login/activation portal
  const [userSession, setUserSession] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem("geoscan_user_session");
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Candidate Info Config State Saved in LocalStorage
  const [candidateInfo, setCandidateInfo] = useState<CandidateInfo>(() => {
    const saved = localStorage.getItem("geoscan_candidate_info");
    const defaultInfo = {
      adminCoordinatorName: "",
      candidateName: "",
      ballotNumber: "",
      activationCode: "GEOSCAN-AP-2026",
    };
    try {
      return saved ? JSON.parse(saved) : defaultInfo;
    } catch {
      return defaultInfo;
    }
  });

  const handleUpdateCandidateInfo = (info: Partial<CandidateInfo>) => {
    const updated = { ...candidateInfo, ...info };
    setCandidateInfo(updated);
    localStorage.setItem("geoscan_candidate_info", JSON.stringify(updated));
  };

  // Main UI Nav Tab state
  const [activeTab, setActiveTab] = useState<"cadastros" | "dashboard">("dashboard");

  // Mobile navigation open/close state
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Safe State Confirmation and Toast Notification Dialogs
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant: "danger" | "warning" | "info";
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    variant: "info",
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Lideranças State (Persisted in LocalStorage)
  const [liderancas, setLiderancas] = useState<Lideranca[]>(() => {
    const saved = localStorage.getItem("geoscan_liderancas");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fallback below
      }
    }
    // If empty storage, default to INITIAL_LIDERANCAS so the system starts populated with of Amapá's sample network
    return INITIAL_LIDERANCAS;
  });

  // Coordenadores Regionais State (Persisted in LocalStorage)
  const [coordenadoresRegionais, setCoordenadoresRegionais] = useState<CoordenadorRegional[]>(() => {
    const saved = localStorage.getItem("geoscan_coordenadores");
    try {
      return saved ? JSON.parse(saved) : INITIAL_COORDENADORES;
    } catch {
      return INITIAL_COORDENADORES;
    }
  });

  // Municipios State (Persisted in LocalStorage)
  const [municipios, setMunicipios] = useState<MunicipioDefinition[]>(() => {
    const saved = localStorage.getItem("geoscan_municipios");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fallback
      }
    }
    return AMAPA_MUNICIPIOS;
  });

  const handleUpdateMunicipioMeta = (nome: string, metaVotos: number) => {
    const updated = municipios.map(m => 
      m.nome === nome ? { ...m, metaVotos } : m
    );
    setMunicipios(updated);
    localStorage.setItem("geoscan_municipios", JSON.stringify(updated));
  };

  // Eleitores State (Persisted in LocalStorage)
  const [eleitores, setEleitores] = useState<Eleitor[]>(() => {
    const saved = localStorage.getItem("geoscan_eleitores");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fallback below
      }
    }
    return INITIAL_ELEITORES;
  });

  // Global Goal Campaign State (Computed from Municipios)
  const computedGlobalGoal = useMemo(() => {
    return municipios.reduce((acc, current) => acc + (current.metaVotos || 0), 0);
  }, [municipios]);

  // Coordinator's registered WhatsApp phone number (Persisted in LocalStorage)
  const [coordinatorWhatsapp, setCoordinatorWhatsapp] = useState<string>(() => {
    return localStorage.getItem("geoscan_coordinator_whatsapp") || "";
  });

  const handleSetCoordinatorWhatsapp = (number: string) => {
    setCoordinatorWhatsapp(number);
    localStorage.setItem("geoscan_coordinator_whatsapp", number);
  };

  // Sync state to local storage when changed
  useEffect(() => {
    localStorage.setItem("geoscan_liderancas", JSON.stringify(liderancas));
  }, [liderancas]);

  useEffect(() => {
    localStorage.setItem("geoscan_coordenadores", JSON.stringify(coordenadoresRegionais));
  }, [coordenadoresRegionais]);

  useEffect(() => {
    localStorage.setItem("geoscan_eleitores", JSON.stringify(eleitores));
  }, [eleitores]);

  // Handle system login/activation
  const handleActivate = (session: UserSession) => {
    setUserSession(session);
    localStorage.setItem("geoscan_user_session", JSON.stringify(session));
    setActiveTab("dashboard"); // Go straight to the visual dashboard after activation
  };

  // Handle system deactivation/logout
  const handleDeactivate = () => {
    setModalConfig({
      isOpen: true,
      title: "Sair do Sistema",
      message: "Deseja realmente desconectar e sair do sistema? Suas lideranças ficarão salvas com segurança neste navegador.",
      variant: "warning",
      onConfirm: () => {
        setUserSession(null);
        localStorage.removeItem("geoscan_user_session");
        setModalConfig((prev) => ({ ...prev, isOpen: false }));
        showToast("Sessão encerrada com sucesso.");
      }
    });
  };

  // Clear ALL data back to default Mocks (useful helper button in UI for sandbox prototyping)
  const handleResetToMocks = () => {
    setModalConfig({
      isOpen: true,
      title: "Carregar Exemplo de Campanha?",
      message: "Isso carregará dados de demonstração originais de regiões do Amapá para testes rápidos (Coordenadores, Líderes e Apoiadores fictícios). Deseja continuar?",
      variant: "info",
      onConfirm: () => {
        setCoordenadoresRegionais(INITIAL_COORDENADORES);
        setLiderancas(INITIAL_LIDERANCAS);
        setEleitores(INITIAL_ELEITORES);
        setModalConfig((prev) => ({ ...prev, isOpen: false }));
        showToast("Campanha modelo carregada com sucesso!");
      }
    });
  };

  // Completely wipe data to empty arrays (requested by developer)
  const handleWipeData = () => {
    setModalConfig({
      isOpen: true,
      title: "Limpar Todo o Sistema!",
      message: "Tem certeza de que deseja LIMPAR COMPLETAMENTE todos os coordenadores e líderes do sistema? Esta ação deixará o banco de dados vazio para que você possa iniciar cadastros do zero absoluto.",
      variant: "danger",
      onConfirm: () => {
        setCoordenadoresRegionais([]);
        setLiderancas([]);
        setEleitores([]);
        localStorage.removeItem("geoscan_coordenadores");
        localStorage.removeItem("geoscan_liderancas");
        localStorage.removeItem("geoscan_eleitores");
        setModalConfig((prev) => ({ ...prev, isOpen: false }));
        showToast("Sistema de base limpo com sucesso!");
      }
    });
  };

  // Creation logic for Coordenadores Regionais
  const handleAddCoordenador = (coordData: Omit<CoordenadorRegional, "id" | "createdAt">) => {
    const newCoord: CoordenadorRegional = {
      ...coordData,
      id: `coord-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setCoordenadoresRegionais((prev) => [newCoord, ...prev]);
  };

  // Update logic for Coordenadores Regionais
  const handleUpdateCoordenador = (id: string, updatedFields: Partial<CoordenadorRegional>) => {
    setCoordenadoresRegionais((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updatedFields } : c))
    );
  };

  // Deletion logic for Coordenadores Regionais
  const handleDeleteCoordenador = (id: string) => {
    const coord = coordenadoresRegionais.find((c) => c.id === id);
    if (!coord) return;

    const countLiders = liderancas.filter((l) => l.coordenadorRegionalId === id).length;
    let message = `Deseja realmente remover o coordenador regional "${coord.nome}" do sistema de monitoramento?`;
    if (countLiders > 0) {
      message = `O coordenador regional "${coord.nome}" coordena atualmente ${countLiders} liderança(s) focal(is). Se você remover este coordenador, essas lideranças ficarão registradas mas sem coordenação direta. Deseja prosseguir?`;
    }

    setModalConfig({
      isOpen: true,
      title: "Remover Coordenador Regional",
      message: message,
      variant: "danger",
      onConfirm: () => {
        setCoordenadoresRegionais((prev) => prev.filter((c) => c.id !== id));
        // Soft unlink leaders
        setLiderancas((prev) => prev.map((l) => l.coordenadorRegionalId === id ? { ...l, coordenadorRegionalId: undefined } : l));
        setModalConfig((prev) => ({ ...prev, isOpen: false }));
        showToast(`Coordenador regional "${coord.nome}" removido.`);
      }
    });
  };

  // Creation logic for Lideranças
  const handleAddLideranca = (lidData: Omit<Lideranca, "id" | "createdAt">) => {
    const newLid: Lideranca = {
      ...lidData,
      id: `lid-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setLiderancas((prev) => [newLid, ...prev]);
  };

  // Update logic for Lideranças (enables toggling goal setting modes on already active leaders)
  const handleUpdateLideranca = (id: string, updatedFields: Partial<Lideranca>) => {
    setLiderancas((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...updatedFields } : l))
    );
  };

  // Deletion logic for Liderança & cascading deletions of linked voters
  const handleDeleteLideranca = (id: string) => {
    const leader = liderancas.find((l) => l.id === id);
    if (!leader) return;

    setModalConfig({
      isOpen: true,
      title: "Excluir Liderança Territorial",
      message: `Deseja realmente excluir a liderança "${leader.nome}"? Esta ação é permanente e pode afetar os eleitores vinculados.`,
      variant: "danger",
      onConfirm: () => {
        setLiderancas((prev) => prev.filter((l) => l.id !== id));
        setModalConfig((prev) => ({ ...prev, isOpen: false }));
        showToast(`Liderança "${leader.nome}" decolada.`);
      }
    });
  };

  // Creation logic for Eleitores
  const handleAddEleitor = (elData: Omit<Eleitor, "id" | "createdAt">) => {
    const newEl: Eleitor = {
      ...elData,
      id: `el-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setEleitores((prev) => [newEl, ...prev]);
  };

  // Update logic for Eleitores
  const handleUpdateEleitor = (id: string, updatedFields: Partial<Eleitor>) => {
    setEleitores((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updatedFields } : e))
    );
  };

  // Deletion logic for Eleitores
  const handleDeleteEleitor = (id: string) => {
    const eleitor = eleitores.find((e) => e.id === id);
    if (!eleitor) return;

    setModalConfig({
      isOpen: true,
      title: "Remover Eleitor",
      message: `Deseja realmente remover o eleitor "${eleitor.nome}" do sistema?`,
      variant: "danger",
      onConfirm: () => {
        setEleitores((prev) => prev.filter((e) => e.id !== id));
        setModalConfig((prev) => ({ ...prev, isOpen: false }));
        showToast(`Eleitor "${eleitor.nome}" removido.`);
      }
    });
  };

  // Check for public guest leader self-registration link
  const queryParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const urlCoordId = queryParams?.get("coordId");
  const urlCoordNome = queryParams?.get("coordNome");
  const urlCoordMun = queryParams?.get("municipio");
  const urlCoordWhatsapp = queryParams?.get("coordWhatsapp") || "";

  if (urlCoordId && urlCoordNome && urlCoordMun && queryParams?.get("importLideranca") !== "true") {
    return (
      <AutoCadastroPortal
        coordId={urlCoordId}
        coordNome={urlCoordNome}
        municipio={urlCoordMun}
        coordWhatsapp={urlCoordWhatsapp}
      />
    );
  }

  // Render Activation Screen if no license acts
  if (!userSession) {
    return (
      <ActivationPortal onActivate={handleActivate} />
    );
  }

  return (
    <div className="h-screen bg-slate-950 flex flex-col lg:flex-row text-slate-100 overflow-hidden relative font-sans">
      
      {/* Decorative Blur Backdrops */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-950/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none" />

      {/* FIXED SIDEBAR MENU (collapses to hamburger on mobile) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        candidateInfo={candidateInfo}
        onDeactivate={handleDeactivate}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* VIEWPORT CONTROLLER CONTAINER */}
      <main className="flex-1 flex flex-col overflow-hidden min-h-screen pt-16 lg:pt-0">
        
        {/* VIEWPORT HEADER SECTION */}
        <header className="hidden lg:flex h-20 border-b border-slate-850/80 items-center justify-between px-8 bg-slate-900/40 backdrop-blur-md relative z-10 select-none">
          <div className="flex items-center space-x-4">
            <span className="text-xs bg-slate-950 border border-slate-800 text-slate-400 font-mono font-bold px-3 py-1 rounded tracking-widest">
              GEO SCAN v2.8
            </span>
            <span className="text-slate-650">|</span>
            <p className="text-sm md:text-base text-slate-300">
              Admin: <strong className="text-blue-400 font-bold">{candidateInfo?.adminCoordinatorName || "Não Informado"}</strong>
              <span className="mx-3 text-slate-650">|</span>
              Candidato(a): <strong className="text-white text-base md:text-lg">{candidateInfo?.candidateName || "Não Informado"}</strong> (Nº <span className="text-amber-400 font-bold font-mono">{candidateInfo?.ballotNumber || "---"}</span>)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleWipeData}
              id="btn-wipe-data-header"
              className="px-4 py-2 bg-red-950/40 hover:bg-red-900/40 border border-red-500/30 hover:border-red-500/50 text-red-300 rounded-lg text-xs font-bold uppercase tracking-wider transition shrink-0 cursor-pointer"
              title="Limpar todos os líderes para testes do zero"
            >
              🧹 Limpar Sistema
            </button>
            <button
              onClick={handleResetToMocks}
              id="btn-restore-mocks-header"
              className="px-4 py-2 bg-slate-950/60 hover:bg-slate-950/90 border border-slate-850 hover:border-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-bold uppercase tracking-wider transition shrink-0 cursor-pointer"
              title="Carrega os dados fictícios do Amapá para demonstração rápida"
            >
              📊 Carregar Exemplo
            </button>
            <div className="flex items-center gap-1.5 text-sm text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-3 py-1.5 rounded-full font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Sincronia Ativa</span>
            </div>
          </div>
        </header>

        {/* SCROLLABLE SCREEN CONTENT WRAPPER */}
        <div id="applet-content-viewport" className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10">
          
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* COMPOSITE TABBED SCREEN VIEW */}
            <AnimatePresence mode="wait">
              {activeTab === "cadastros" ? (
                <motion.div
                  key="cadastros"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                >
                  <CadastrosTab
                    municipios={municipios}
                    liderancas={liderancas}
                    eleitores={eleitores}
                    coordenadoresRegionais={coordenadoresRegionais}
                    onAddLideranca={handleAddLideranca}
                    onAddEleitor={handleAddEleitor}
                    onAddCoordenador={handleAddCoordenador}
                    onDeleteLideranca={handleDeleteLideranca}
                    onDeleteEleitor={handleDeleteEleitor}
                    onDeleteCoordenador={handleDeleteCoordenador}
                    onUpdateLideranca={handleUpdateLideranca}
                    onUpdateEleitor={handleUpdateEleitor}
                    onUpdateCoordenador={handleUpdateCoordenador}
                    coordinatorWhatsapp={coordinatorWhatsapp}
                    candidateInfo={candidateInfo}
                    onUpdateCandidateInfo={handleUpdateCandidateInfo}
                    onUpdateMunicipioMeta={handleUpdateMunicipioMeta}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                >
                  <DashboardTab
                    municipios={municipios}
                    liderancas={liderancas}
                    eleitores={eleitores}
                    coordenadoresRegionais={coordenadoresRegionais}
                    globalGoal={computedGlobalGoal}
                    onSetGlobalGoal={() => {}} // No-op as it's computed now
                    candidateInfo={candidateInfo}
                    coordinatorWhatsapp={coordinatorWhatsapp}
                    onSetCoordinatorWhatsapp={handleSetCoordinatorWhatsapp}
                  />
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>

        {/* BOTTOM TELEMETRY BAR ON HIGH DENSITY OR SMALL DEVICES */}
        <footer className="bg-slate-900/30 border-t border-slate-850/60 py-2.5 px-4 h-12 flex lg:hidden items-center justify-between text-xs text-slate-400 font-mono select-none">
          <span>AP COORDENAÇÃO © 2026</span>
          <div className="flex gap-4">
            <button
              onClick={handleWipeData}
              id="btn-wipe-data-footer"
              className="text-red-400 hover:underline font-bold"
            >
              Limpar Sistema
            </button>
            <button
              onClick={handleResetToMocks}
              id="btn-restore-mocks-footer"
              className="text-emerald-450 hover:underline hover:text-emerald-400 font-bold"
            >
              Carregar Exemplo
            </button>
          </div>
        </footer>

      </main>

      {/* State Confirmation Modal popup */}
      <AnimatePresence>
        {modalConfig.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm select-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4"
            >
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                {modalConfig.variant === "danger" ? "🚨" : modalConfig.variant === "warning" ? "⚠️" : "ℹ️"} {modalConfig.title}
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">{modalConfig.message}</p>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-350 rounded-lg text-xs font-bold uppercase transition tracking-wider cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={modalConfig.onConfirm}
                  className={`px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition cursor-pointer ${
                    modalConfig.variant === "danger"
                      ? "bg-red-650 hover:bg-red-500 text-white"
                      : modalConfig.variant === "warning"
                      ? "bg-yellow-600 hover:bg-yellow-550 text-slate-950"
                      : "bg-emerald-500 hover:bg-emerald-450 text-slate-950"
                  }`}
                >
                  Confirmar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Autocadastro Import Confirmation Modal */}
      <AnimatePresence>
        {importData && importData.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm select-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-lg bg-slate-900 border rounded-2xl p-6 shadow-2xl space-y-5 ${importData.isApoiadorMode ? 'border-emerald-500/30' : 'border-amber-500/30'}`}
            >
              <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                <span className="text-2xl">📥</span>
                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-tight">
                    {importData.isApoiadorMode ? 'Homologar Apoiador Nominal' : 'Homologar Liderança Focal'}
                  </h3>
                  <p className="text-xs text-slate-400 font-semibold">
                    Solicitação de auto-cadastro recebida com sucesso via WhatsApp!
                  </p>
                </div>
              </div>

              <div className="space-y-3 bg-slate-950/80 p-4 rounded-xl border border-slate-850">
                <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                  <div>
                    <span className="text-slate-500 block uppercase font-bold text-[9px]">{importData.isApoiadorMode ? 'Apoiador Nominal (Etapa 3)' : 'Liderança Focal'}</span>
                    <span className="text-slate-100 font-bold font-sans text-sm">{importData.nome}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase font-bold text-[9px]">WhatsApp / Contato</span>
                    <span className={`${importData.isApoiadorMode ? 'text-emerald-400' : 'text-amber-400'} font-bold font-sans text-sm`}>{importData.tel || "Não Informado"}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-mono pt-2 border-t border-slate-900">
                  <div>
                    <span className="text-slate-500 block uppercase font-bold text-[9px]">Município & Bairro</span>
                    <span className="text-slate-200 font-bold font-sans text-[11px]">{importData.mun} &bull; {importData.bairro}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase font-bold text-[9px]">{importData.isApoiadorMode ? 'Liderança de Vínculo' : 'Coordenador de Vínculo'}</span>
                    <span className="text-blue-400 font-bold font-sans text-[11.5px]">
                      {importData.isApoiadorMode
                        ? liderancas.find(l => l.id === importData.liderIdVal)?.nome || `Não encontrado (ID ${importData.liderIdVal})`
                        : coordenadoresRegionais.find(c => c.id === importData.coordIdVal)?.nome || `Não encontrado (ID ${importData.coordIdVal})`}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-850/60 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-sans font-bold uppercase">{importData.isApoiadorMode ? 'Compromisso de Votos (Micro)' : 'Meta de Votos (Estimativa Macro)'}</span>
                  <span className={`${importData.isApoiadorMode ? 'text-emerald-500 bg-emerald-950/60 border-emerald-900/40' : 'text-amber-500 bg-amber-950/60 border-amber-900/40'} font-black font-sans text-base px-3 py-1.5 rounded-lg border`}>
                    +{importData.votos} votos
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed text-center font-sans font-semibold">
                {importData.isApoiadorMode 
                  ? 'Ao homologar, o apoiador e seu compromisso de votos serão indexados à referida liderança territorial.'
                  : 'Ao homologar, a liderança e sua respectiva meta macro de votos serão indexadas no painel do coordenador.'}
              </p>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setImportData(null);
                    // Clean up URL query parameters safely
                    const cleanUrl = window.location.origin + window.location.pathname;
                    window.history.replaceState({}, document.title, cleanUrl);
                    showToast("Importação descartada.");
                  }}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-755 text-slate-300 font-bold rounded-xl text-xs uppercase tracking-wider transition cursor-pointer text-center"
                >
                  Descartar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (importData.isApoiadorMode) {
                      if (!importData.liderIdVal) {
                        showToast("Erro: ID da liderança não encontrado.");
                        return;
                      }
                      // handleAddApoiador({
                      //   nome: importData.nome,
                      //   liderancaId: importData.liderIdVal,
                      //   municipio: importData.mun,
                      //   bairro: importData.bairro,
                      //   telefone: importData.tel || undefined,
                      //   compromissoMicro: importData.votos,
                      // });
                      // showToast(`Apoiador focal "${importData.nome}" homologado com sucesso!`);
                      showToast(`Apoiador focal "${importData.nome}" processado.`);
                      setActiveTab("cadastros");
                    } else {
                      if (!importData.coordIdVal) {
                        showToast("Erro: ID do coordenador não encontrado.");
                        return;
                      }
                      handleAddLideranca({
                        nome: importData.nome,
                        coordenadorRegionalId: importData.coordIdVal,
                        municipio: importData.mun,
                        bairro: importData.bairro,
                        metaMacro: importData.votos,
                        calculoMeta: "lider",
                        telefone: importData.tel || undefined,
                        ocupacao: importData.ocupacao || undefined,
                      });
                      showToast(`Liderança focal "${importData.nome}" homologada com sucesso!`);
                      setActiveTab("cadastros");
                    }
                    
                    setImportData(null);
                    // Clean up URL query parameters safely
                    const cleanUrl = window.location.origin + window.location.pathname;
                    window.history.replaceState({}, document.title, cleanUrl);
                  }}
                  className={`flex-1 py-3 font-black rounded-xl text-xs uppercase tracking-wider transition cursor-pointer text-center shadow-lg flex items-center justify-center gap-2 ${
                    importData.isApoiadorMode 
                      ? 'bg-emerald-500 hover:bg-emerald-450 text-slate-950 shadow-emerald-500/10'
                      : 'bg-amber-500 hover:bg-amber-450 text-slate-950 shadow-amber-500/10'
                  }`}
                >
                  Homologar Registro
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* State Toasts */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-emerald-500/20 text-emerald-400 px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-bold"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-450" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
