import React, { useState, useMemo } from "react";
import { PlusCircle, Users, Target, ShieldPlus, Landmark, MapPin, Phone, HelpCircle, CheckCircle2, Sliders, ToggleLeft, ToggleRight, Edit2, Share2, Copy, Send, Vote, Search, KeyRound, ShieldCheck, UserCheck } from "lucide-react";
import { Lideranca, MunicipioDefinition, CoordenadorRegional, Eleitor, CandidateInfo } from "../types";
import { AMAPA_MUNICIPIOS } from "../data/mockData";
import CoordenadoresForm from "./CoordenadoresForm";
import CoordenadoresList from "./CoordenadoresList";

interface CadastrosTabProps {
  municipios: MunicipioDefinition[];
  liderancas: Lideranca[];
  eleitores?: Eleitor[];
  coordenadoresRegionais?: CoordenadorRegional[];
  onAddLideranca: (lid: Omit<Lideranca, "id" | "createdAt">) => void;
  onAddEleitor?: (el: Omit<Eleitor, "id" | "createdAt">) => void;
  onAddCoordenador?: (coord: Omit<CoordenadorRegional, "id" | "createdAt">) => void;
  onDeleteLideranca?: (id: string) => void;
  onDeleteEleitor?: (id: string) => void;
  onDeleteCoordenador?: (id: string) => void;
  onUpdateLideranca?: (id: string, updatedFields: Partial<Lideranca>) => void;
  onUpdateEleitor?: (id: string, updatedFields: Partial<Eleitor>) => void;
  onUpdateCoordenador?: (id: string, updatedFields: Partial<CoordenadorRegional>) => void;
  coordinatorWhatsapp?: string;
  candidateInfo?: CandidateInfo;
  onUpdateCandidateInfo?: (info: Partial<CandidateInfo>) => void;
  onUpdateMunicipioMeta?: (nome: string, meta: number) => void;
}

export default function CadastrosTab({
  municipios,
  liderancas,
  eleitores = [],
  coordenadoresRegionais = [],
  onAddLideranca,
  onAddEleitor,
  onAddCoordenador,
  onDeleteLideranca,
  onDeleteEleitor,
  onDeleteCoordenador,
  onUpdateLideranca,
  onUpdateEleitor,
  onUpdateCoordenador,
  coordinatorWhatsapp = "",
  candidateInfo,
  onUpdateCandidateInfo,
  onUpdateMunicipioMeta
}: CadastrosTabProps) {
  // STEPS OR SUB-TABS MANAGER FOR REGISTRATION IN CASCADE
  const [activeStep, setActiveStep] = useState<"coordenadores" | "liderancas" | "eleitores">("coordenadores");

  // FORM COORDENADOR REGIONAL STATE
  const [coordNome, setCoordNome] = useState("");
  const [coordMunicipio, setCoordMunicipio] = useState("Macapá");
  const [coordTelefone, setCoordTelefone] = useState("");
  const [coordSuccess, setCoordSuccess] = useState(false);

  // EDIT COORDENADOR MODAL STATE
  const [editingCoord, setEditingCoord] = useState<CoordenadorRegional | null>(null);
  const [editCoordNome, setEditCoordNome] = useState("");
  const [editCoordMunicipio, setEditCoordMunicipio] = useState("Macapá");
  const [editCoordBairro, setEditCoordBairro] = useState("");
  const [editCoordWriteBairroMode, setEditCoordWriteBairroMode] = useState(false);
  const [editCoordTelefone, setEditCoordTelefone] = useState("");
  const [editCoordMetaVotos, setEditCoordMetaVotos] = useState<number>(0);

  const editCoordBairrosList = useMemo(() => {
    const munic = municipios.find((m) => m.nome === editCoordMunicipio);
    return munic ? munic.bairros : [];
  }, [editCoordMunicipio, municipios]);

  // FORM ELEITOR STATE
  const [elNome, setElNome] = useState("");
  const [elLiderancaId, setElLiderancaId] = useState("");
  const [elTelefone, setElTelefone] = useState("");
  const [elZonaEleitoral, setElZonaEleitoral] = useState("");
  const [elSuccess, setElSuccess] = useState(false);

  // SHARING AUTO-CADASTRO STATE
  const [sharingCoord, setSharingCoord] = useState<CoordenadorRegional | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // LOCAL STATE FOR NESTED ELEITOR REGISTRATION INSIDE LIDERANÇA
  const [expandLidId, setExpandLidId] = useState<string | null>(null);
  const [nestElNome, setNestElNome] = useState("");
  const [nestElTelefone, setNestElTelefone] = useState("");
  const [nestElZona, setNestElZona] = useState("");
  const [sharingLider, setSharingLider] = useState<Lideranca | null>(null);

  // EDIT ELEITOR MODAL STATE
  const [editingEleitor, setEditingEleitor] = useState<Eleitor | null>(null);
  const [editElNome, setEditElNome] = useState("");
  const [editElLiderancaId, setEditElLiderancaId] = useState("");
  const [editElTelefone, setEditElTelefone] = useState("");
  const [editElZonaEleitoral, setEditElZonaEleitoral] = useState("");

  const handleStartEditEleitor = (el: Eleitor) => {
    setEditingEleitor(el);
    setEditElNome(el.nome);
    setEditElLiderancaId(el.liderancaId);
    setEditElTelefone(el.telefone || "");
    setEditElZonaEleitoral(el.zonaEleitoral || "");
  };

  const handleSaveEditEleitor = () => {
    if (!editingEleitor || !onUpdateEleitor) return;
    onUpdateEleitor(editingEleitor.id, {
      nome: editElNome.trim(),
      liderancaId: editElLiderancaId,
      telefone: editElTelefone.trim() || undefined,
      zonaEleitoral: editElZonaEleitoral.trim() || undefined,
    });
    setEditingEleitor(null);
  };

  // EDIT LIDERANÇA STRUCT MODAL STATE
  const [editingLider, setEditingLider] = useState<Lideranca | null>(null);
  const [editLidNome, setEditLidNome] = useState("");
  const [editLidOcupacao, setEditLidOcupacao] = useState("Líder de Comunidade");
  const [editLidOcupacaoCustom, setEditLidOcupacaoCustom] = useState("");
  const [editLidMunicipio, setEditLidMunicipio] = useState("Macapá");
  const [editLidBairro, setEditLidBairro] = useState("Laguinho");
  const [editLidWriteBairroMode, setEditLidWriteBairroMode] = useState(false);
  const [editLidTelefone, setEditLidTelefone] = useState("");
  const [editLidCoordenadorId, setEditLidCoordenadorId] = useState("");

  // EDIT LIDERANÇA STRUCT MODAL STATE
  const [lidNome, setLidNome] = useState("");
  const [lidOcupacao, setLidOcupacao] = useState("Líder de Comunidade");
  const [lidOcupacaoCustom, setLidOcupacaoCustom] = useState("");
  const [lidMunicipio, setLidMunicipio] = useState("Macapá");
  const [lidBairro, setLidBairro] = useState("Laguinho");
  const [lidWriteBairroMode, setLidWriteBairroMode] = useState(false);
  const [lidMetaMacro, setLidMetaMacro] = useState<number | "">("");
  const [lidCalculoMeta, setLidCalculoMeta] = useState<"lider" | "eleitor">("lider");
  const [lidTelefone, setLidTelefone] = useState("");
  const [lidCoordenadorId, setLidCoordenadorId] = useState("");
  const [lidSuccess, setLidSuccess] = useState(false);
  const [searchLidQuery, setSearchLidQuery] = useState("");

  // Inline edit state for Liderança goal
  const [editingLidId, setEditingLidId] = useState<string | null>(null);
  const [editingGoalValue, setEditingGoalValue] = useState<number | "">("");

  // CASCADE FILTERS: Coordenadores Regionais
  const availableCoordenadoresForLider = useMemo(() => {
    return coordenadoresRegionais.filter((c) => c.municipio === lidMunicipio);
  }, [lidMunicipio, coordenadoresRegionais]);

  const editLidAvailableCoordenadores = useMemo(() => {
    return coordenadoresRegionais.filter((c) => c.municipio === editLidMunicipio);
  }, [editLidMunicipio, coordenadoresRegionais]);

  // CASCADE HANDLERS: Coordenador Regional
  const handleCoordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!coordNome.trim()) return;
    if (onAddCoordenador) {
      onAddCoordenador({
        nome: coordNome.trim(),
        municipio: coordMunicipio,
        telefone: coordTelefone.trim() || undefined
      });
    }
    setCoordNome("");
    setCoordTelefone("");
    setCoordSuccess(true);
    setTimeout(() => setCoordSuccess(false), 3000);
  };

  const handleStartEditCoord = (coord: CoordenadorRegional) => {
    setEditingCoord(coord);
    setEditCoordNome(coord.nome);
    setEditCoordMunicipio(coord.municipio);
    setEditCoordBairro(coord.bairro || "");
    setEditCoordWriteBairroMode(false);
    setEditCoordTelefone(coord.telefone || "");
    setEditCoordMetaVotos(coord.metaVotos || 0);
  };

  const handleSaveEditCoord = () => {
    if (!editingCoord || !onUpdateCoordenador) return;
    onUpdateCoordenador(editingCoord.id, {
      nome: editCoordNome.trim(),
      municipio: editCoordMunicipio,
      bairro: editCoordBairro.trim() || undefined,
      telefone: editCoordTelefone.trim() || undefined,
      metaVotos: editCoordMetaVotos > 0 ? editCoordMetaVotos : undefined,
    });
    setEditingCoord(null);
  };

  // CASCADE HANDLERS: Liderança
  const lidBairrosList = useMemo(() => {
    const munic = municipios.find((m) => m.nome === lidMunicipio);
    return munic ? munic.bairros : [];
  }, [lidMunicipio, municipios]);

  const handleLidMunicipioChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setLidMunicipio(value);
    const munic = municipios.find((m) => m.nome === value);
    if (munic && munic.bairros.length > 0) {
      setLidBairro(munic.bairros[0]);
    }
    // Auto-select first coordinator in that municipality
    const coordsInMunic = coordenadoresRegionais.filter((c) => c.municipio === value);
    if (coordsInMunic.length > 0) {
      setLidCoordenadorId(coordsInMunic[0].id);
    } else {
      setLidCoordenadorId("");
    }
  };

  // Handle Liderança submitting
  const handleLidSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lidNome.trim()) return;

    const isBySupporters = lidCalculoMeta === "eleitor";
    if (!isBySupporters && (lidMetaMacro === "" || Number(lidMetaMacro) <= 0)) {
      return;
    }

    const finalOcupacao = lidOcupacao === "Outro" ? (lidOcupacaoCustom.trim() || "Outro") : lidOcupacao;

    onAddLideranca({
      nome: lidNome.trim(),
      ocupacao: finalOcupacao || undefined,
      municipio: lidMunicipio,
      bairro: lidBairro,
      metaMacro: isBySupporters ? 0 : Number(lidMetaMacro),
      calculoMeta: lidCalculoMeta,
      telefone: lidTelefone.trim() || undefined,
      coordenadorRegionalId: lidCoordenadorId || undefined,
    });

    // Reset Form
    setLidNome("");
    setLidOcupacao("Líder de Comunidade");
    setLidOcupacaoCustom("");
    setLidMetaMacro("");
    setLidTelefone("");
    setLidCoordenadorId("");
    setLidCalculoMeta("lider");
    setLidSuccess(true);
    setTimeout(() => setLidSuccess(false), 3005);
  };

  // Handle Eleitor submitting
  const handleElSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!elNome.trim() || !elLiderancaId) return;

    if (onAddEleitor) {
      onAddEleitor({
        nome: elNome.trim(),
        liderancaId: elLiderancaId,
        zonaEleitoral: elZonaEleitoral.trim() || undefined,
        telefone: elTelefone.trim() || undefined,
      });
    }

    setElNome("");
    setElTelefone("");
    setElZonaEleitoral("");
    setElSuccess(true);
    setTimeout(() => setElSuccess(false), 3000);
  };

  // Switch goal calculation setting for an active leader
  const handleToggleLeaderMetaMode = (id: string, currentMode: "lider" | "eleitor") => {
    if (!onUpdateLideranca) return;
    const nextMode = currentMode === "lider" ? "eleitor" : "lider";
    onUpdateLideranca(id, { calculoMeta: nextMode });
  };

  // Edit manual goal targets directly for registered leaders inline
  const handleStartEditGoal = (id: string, currentGoal: number) => {
    setEditingLidId(id);
    setEditingGoalValue(currentGoal);
  };

  const handleSaveGoalInline = (id: string) => {
    if (!onUpdateLideranca || editingGoalValue === "" || Number(editingGoalValue) <= 0) {
      setEditingLidId(null);
      return;
    }
    onUpdateLideranca(id, { metaMacro: Number(editingGoalValue) });
    setEditingLidId(null);
  };

  // EDIT HOOKS FOR LIDERANÇA IN MODAL
  const editLidBairrosList = useMemo(() => {
    const munic = municipios.find((m) => m.nome === editLidMunicipio);
    return munic ? munic.bairros : [];
  }, [editLidMunicipio, municipios]);

  const handleEditLidMunicipioChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setEditLidMunicipio(value);
    const munic = municipios.find((m) => m.nome === value);
    if (munic && munic.bairros.length > 0) {
      setEditLidBairro(munic.bairros[0]);
    }
  };

  const handleStartEditLider = (lid: Lideranca) => {
    setEditingLider(lid);
    setEditLidNome(lid.nome);
    const initialOcupacao = lid.ocupacao || "Líder de Comunidade";
    const standardOptions = ["Líder de Comunidade", "Líder de Associação", "Presidente", "Representante", "Coordenador"];
    if (standardOptions.includes(initialOcupacao)) {
      setEditLidOcupacao(initialOcupacao);
      setEditLidOcupacaoCustom("");
    } else {
      setEditLidOcupacao("Outro");
      setEditLidOcupacaoCustom(initialOcupacao);
    }
    setEditLidMunicipio(lid.municipio);
    setEditLidBairro(lid.bairro);
    // Determine whether initial neighborhood was from the matched list or not
    const matchedMunObj = municipios.find((m) => m.nome === lid.municipio);
    const hasInList = matchedMunObj ? matchedMunObj.bairros.includes(lid.bairro) : false;
    setEditLidWriteBairroMode(!hasInList);
    setEditLidTelefone(lid.telefone || "");
    setEditLidCoordenadorId(lid.coordenadorRegionalId || "");
  };

  const handleSaveEditLider = () => {
    if (!editingLider || !onUpdateLideranca) return;
    const finalOcupacao = editLidOcupacao === "Outro" ? (editLidOcupacaoCustom.trim() || "Outro") : editLidOcupacao;
    onUpdateLideranca(editingLider.id, {
      nome: editLidNome.trim(),
      ocupacao: finalOcupacao || undefined,
      municipio: editLidMunicipio,
      bairro: editLidBairro,
      telefone: editLidTelefone.trim() || undefined,
      coordenadorRegionalId: editLidCoordenadorId || undefined
    });
    setEditingLider(null);
  };

  // Handle direct manual supporter registration from leader card
  const handleRegisterApoiadorManual = (coord: CoordenadorRegional) => {
    setActiveStep("liderancas");
    setLidMunicipio(coord.municipio);
    setLidCoordenadorId(coord.id);
    
    // Smooth scroll to the registration card
    setTimeout(() => {
      const cardEl = document.getElementById("card-cadastrar-lideranca");
      if (cardEl) {
        cardEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      const focusEl = document.getElementById("lid-input-nome");
      focusEl?.focus();
    }, 100);
  };

  return (
    <div className="space-y-6 select-none animate-fadeIn">
      
      {/* CAMPAIGN MOUNTING SEQUENCE TRACKER */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 md:p-6 shadow-xl">
        <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-4 text-center md:text-left">
          Fluxo de Cadastro em Cascata (Sequência Obrigatória)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          <button
            onClick={() => setActiveStep("coordenadores")}
            className={`p-4 rounded-xl border transition text-left relative flex flex-col justify-between cursor-pointer group ${
              activeStep === "coordenadores"
                ? "bg-slate-950 border-amber-500 shadow-lg shadow-amber-500/5 text-slate-100"
                : "bg-slate-900/40 border-slate-800 hover:border-slate-700 text-slate-400"
            }`}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold ${
                activeStep === "coordenadores" ? "bg-amber-400 text-slate-950" : "bg-slate-800 text-slate-400 group-hover:bg-slate-700"
              }`}>
                1
              </span>
              <span className={`text-[11px] font-black uppercase tracking-wider ${
                activeStep === "coordenadores" ? "text-amber-400" : "text-slate-500"
              }`}>
                Etapa Territorial
              </span>
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-slate-200">Lideranças Focais</h4>
              <p className="text-[11.5px] text-slate-400 mt-0.5 leading-snug">Vincule líderes e suas metas estratégicas.</p>
            </div>
          </button>

          <button
            onClick={() => {
              if (coordenadoresRegionais.length > 0) setActiveStep("liderancas")
            }}
            disabled={coordenadoresRegionais.length === 0}
            className={`p-4 rounded-xl border transition text-left relative flex flex-col justify-between cursor-pointer group ${
              coordenadoresRegionais.length === 0 ? "opacity-50 grayscale cursor-not-allowed" : ""
            } ${
              activeStep === "liderancas"
                ? "bg-slate-950 border-emerald-500 shadow-lg shadow-emerald-500/5 text-slate-100"
                : "bg-slate-900/40 border-slate-800 hover:border-slate-700 text-slate-400"
            }`}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold ${
                activeStep === "liderancas" ? "bg-emerald-500 text-slate-950" : "bg-slate-800 text-slate-400 group-hover:bg-slate-700"
              }`}>
                2
              </span>
              <span className={`text-[11px] font-black uppercase tracking-wider ${
                activeStep === "liderancas" ? "text-emerald-400" : "text-slate-500"
              }`}>
                Etapa Comunidade
              </span>
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-slate-200">Apoiadores Eleitorais</h4>
              <p className="text-[11.5px] text-slate-400 mt-0.5 leading-snug">Registros de apoiadores locais da comunidade.</p>
            </div>
          </button>

          <button
            onClick={() => {
              if (liderancas.length > 0) setActiveStep("eleitores")
            }}
            disabled={liderancas.length === 0}
            className={`p-4 rounded-xl border transition text-left relative flex flex-col justify-between cursor-pointer group ${
              liderancas.length === 0 ? "opacity-50 grayscale cursor-not-allowed" : ""
            } ${
              activeStep === "eleitores"
                ? "bg-slate-950 border-pink-500 shadow-lg shadow-pink-500/5 text-slate-100"
                : "bg-slate-900/40 border-slate-800 hover:border-slate-700 text-slate-400"
            }`}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold ${
                activeStep === "eleitores" ? "bg-pink-500 text-slate-950" : "bg-slate-800 text-slate-400 group-hover:bg-slate-700"
              }`}>
                3
              </span>
              <span className={`text-[11px] font-black uppercase tracking-wider ${
                activeStep === "eleitores" ? "text-pink-400" : "text-slate-500"
              }`}>
                Etapa Voto
              </span>
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-slate-200">Eleitores Finais</h4>
              <p className="text-[11.5px] text-slate-400 mt-0.5 leading-snug">Zonas eleitorais e votos confirmados.</p>
            </div>
          </button>
        </div>

        {/* CONFIGURAÇÃO GLOBAL DA OCORRÊNCIA */}
        <div className="lg:col-span-12 space-y-6 mt-2">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
            <h3 className="font-extrabold text-white text-base md:text-lg border-b border-slate-800 pb-4 mb-5 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-blue-400" />
              Configurações da Campanha
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 ml-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                  Administrador Coordenador
                </label>
                <input
                  type="text"
                  placeholder="Nome do responsável"
                  value={candidateInfo?.adminCoordinatorName || ""}
                  onChange={(e) => onUpdateCandidateInfo && onUpdateCandidateInfo({ adminCoordinatorName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-lg p-3 text-sm text-slate-100 placeholder-slate-600 outline-none transition"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 ml-1">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Nome do Candidato(a)
                </label>
                <input
                  type="text"
                  placeholder="Nome do Candidato"
                  value={candidateInfo?.candidateName || ""}
                  onChange={(e) => onUpdateCandidateInfo && onUpdateCandidateInfo({ candidateName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg p-3 text-sm text-slate-100 placeholder-slate-600 outline-none transition"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 ml-1">
                  <Landmark className="w-3.5 h-3.5 text-amber-400" />
                  Número da Urna (Candidato)
                </label>
                <input
                  type="text"
                  placeholder="Número de Urna"
                  value={candidateInfo?.ballotNumber || ""}
                  onChange={(e) => onUpdateCandidateInfo && onUpdateCandidateInfo({ ballotNumber: e.target.value.replace(/\D/g, "") })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg p-3 text-sm font-mono tracking-widest text-amber-400 placeholder-slate-600 outline-none transition"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: REGISTRATION FORMS (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* BRAND PROMO HEADER INFO */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
            <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none">
              <Landmark className="w-48 h-48" />
            </div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 mb-3 font-sans">
              <ShieldPlus className="w-6 h-6 text-emerald-450" />
              Cadastros Territoriais de Lançamento
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Cadastre os blocos de influência de forma isolada e inteligente. Estruture o seu colégio eleitoral vinculando eleitores diretamente a líderes municipais do Amapá. A meta macro é o compromisso geral do líder, e o compromisso micro é a soma nominal detalhada trazida por seus eleitores.
            </p>
          </div>

          {activeStep === "coordenadores" && (
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 md:p-6" id="card-metas-municipios">
                <h3 className="font-extrabold text-white text-base border-b border-slate-800 pb-3 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-emerald-400" />
                  Metas Individualizadas por Município
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  Defina o teto da meta macro de votos projetados diretamente para cada município.
                </p>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                  {municipios.map((m) => (
                    <div key={m.nome} className="space-y-1.5 flex flex-col justify-end bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/80">
                      <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{m.nome}</label>
                      <input
                        type="text"
                        placeholder="0 votos"
                        value={m.metaVotos || ""}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "");
                          if (onUpdateMunicipioMeta) {
                            onUpdateMunicipioMeta(m.nome, Number(val));
                          }
                        }}
                        className="w-full bg-slate-950 border border-slate-700/50 focus:border-emerald-500 rounded p-2 text-sm text-emerald-400 placeholder-slate-600 outline-none transition font-mono font-bold"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <CoordenadoresForm
                municipios={municipios}
                onAddCoordenador={onAddCoordenador || (() => {})}
              />
            </div>
          )}

          {activeStep === "liderancas" && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 md:p-8 relative" id="card-cadastrar-lideranca">
          <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <span className="p-2 bg-emerald-950/60 text-emerald-400 rounded-lg border border-emerald-500/20">
                <Target className="w-6 h-6" />
              </span>
              <div>
                <h3 className="font-extrabold text-white text-base md:text-lg">2. Cadastrar Apoiador Eleitoral</h3>
                <p className="text-xs text-slate-400">Compromisso micro de votos vinculado à Liderança Territorial</p>
              </div>
            </div>
            {lidSuccess && (
              <span className="text-sm text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-3.5 py-1.5 rounded-full flex items-center gap-1.5 animate-bounce font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-450" />
                Apoiador Salvo!
              </span>
            )}
          </div>

          <form onSubmit={handleLidSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Nome */}
              <div className="space-y-1.5">
                <label className="text-sm text-slate-300 font-extrabold flex items-center gap-1">
                  <span>Nome do Apoiador</span>
                  <span className="text-red-500">*</span>
                </label>
                <input
                  id="lid-input-nome"
                  type="text"
                  required
                  placeholder="Ex: Pastor Francisco"
                  value={lidNome}
                  onChange={(e) => setLidNome(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg p-3.5 text-sm text-white placeholder-slate-600 outline-none transition"
                />
              </div>

              {/* Ocupação / Função */}
              <div className="space-y-1.5">
                <label className="text-sm text-slate-300 font-extrabold flex items-center justify-between">
                  <span>Ocupação / Função</span>
                  <span className="text-xs text-slate-500 font-normal">Papel que assume</span>
                </label>
                <div className="space-y-2">
                  <select
                    id="lid-select-ocupacao"
                    value={lidOcupacao}
                    onChange={(e) => setLidOcupacao(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg p-3.5 text-sm text-white outline-none transition cursor-pointer font-semibold"
                  >
                    <option value="Líder de Comunidade">Líder de Comunidade</option>
                    <option value="Líder de Associação">Líder de Associação</option>
                    <option value="Presidente">Presidente</option>
                    <option value="Representante">Representante</option>
                    <option value="Coordenador">Coordenador</option>
                    <option value="Outro">Outro (Digitar customizado...)</option>
                  </select>

                  {lidOcupacao === "Outro" && (
                    <input
                      id="lid-input-ocupacao-custom"
                      type="text"
                      required
                      placeholder="Ex: Delegado Sindical, etc."
                      value={lidOcupacaoCustom}
                      onChange={(e) => setLidOcupacaoCustom(e.target.value)}
                      className="w-full bg-slate-950 border border-emerald-500/50 focus:border-emerald-500 rounded-lg p-3.5 text-xs text-white placeholder-slate-600 outline-none transition font-semibold"
                    />
                  )}
                </div>
              </div>

              {/* Telefone */}
              <div className="space-y-1.5">
                <label className="text-sm text-slate-300 font-extrabold">WhatsApp / Telefone (Opcional)</label>
                <input
                  id="lid-input-tel"
                  type="text"
                  placeholder="Ex: (96) 99112-9900"
                  value={lidTelefone}
                  onChange={(e) => setLidTelefone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg p-3.5 text-sm text-white placeholder-slate-600 outline-none transition"
                />
              </div>

              {/* Municipio Cascata */}
              <div className="space-y-1.5 font-sans">
                <label className="text-sm text-slate-300 font-extrabold">Município (AP)</label>
                <select
                  id="lid-select-municipio"
                  value={lidMunicipio}
                  onChange={handleLidMunicipioChange}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg p-3.5 text-sm text-white outline-none transition cursor-pointer"
                >
                  {municipios.map((m) => (
                    <option key={m.nome} value={m.nome}>
                      {m.nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* Coordenador Regional Cascata */}
              <div className="space-y-1.5 md:col-span-2 font-sans">
                <label className="text-sm text-slate-300 font-extrabold flex items-center justify-between">
                  <span>Liderança Territorial Responsável</span>
                  <span className="text-xs bg-emerald-950/60 text-emerald-400 px-2 py-0.5 rounded font-mono font-bold uppercase border border-emerald-900/30">Filtro por Município</span>
                </label>
                <select
                  id="lid-select-coordenador"
                  required
                  value={lidCoordenadorId}
                  onChange={(e) => setLidCoordenadorId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg p-3.5 text-sm text-white outline-none transition cursor-pointer font-bold"
                >
                  <option value="">-- Selecione a Liderança ativa em {lidMunicipio} --</option>
                  {availableCoordenadoresForLider.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome} (Territorial {c.municipio})
                    </option>
                  ))}
                </select>
                {availableCoordenadoresForLider.length === 0 && (
                  <p className="text-xs text-amber-500 mt-2 font-bold bg-amber-950/20 border border-amber-900/25 p-3 rounded-lg leading-relaxed">
                    ⚠️ Não há lideranças territoriais cadastradas em <strong>{lidMunicipio}</strong> neste momento. Por favor, cadastre a liderança territorial para {lidMunicipio} primeiro na <strong>Etapa 1: Territorial</strong>.
                  </p>
                )}
              </div>

              {/* Bairro Cascata */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-slate-300 font-extrabold">Bairro</label>
                  <button
                    type="button"
                    onClick={() => {
                      setLidWriteBairroMode(!lidWriteBairroMode);
                      if (!lidWriteBairroMode) {
                        setLidBairro("");
                      } else if (lidBairrosList.length > 0) {
                        setLidBairro(lidBairrosList[0]);
                      }
                    }}
                    className="text-[11px] text-emerald-400 font-extrabold hover:text-emerald-350 transition cursor-pointer uppercase tracking-wider"
                  >
                    {lidWriteBairroMode ? "⚡ Selecionar Lista" : "✍️ Escrever Bairro"}
                  </button>
                </div>
                {lidWriteBairroMode ? (
                  <input
                    id="lid-input-bairro-escrever"
                    type="text"
                    required
                    placeholder="Digite o nome do bairro"
                    value={lidBairro}
                    onChange={(e) => setLidBairro(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg p-3.5 text-sm text-white placeholder-slate-650 outline-none transition font-semibold"
                  />
                ) : (
                  <select
                    id="lid-select-bairro"
                    value={lidBairro}
                    onChange={(e) => setLidBairro(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg p-3.5 text-sm text-white outline-none transition cursor-pointer"
                  >
                    {lidBairrosList.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Escolha do Método de Meta */}
              <div className="space-y-2 md:col-span-2 bg-slate-950/40 border border-slate-850 p-4 rounded-xl">
                <label className="text-sm text-slate-300 font-extrabold block mb-1">Cálculo de Meta Preferencial</label>
                <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                  Escolha se a meta de votos deste apoiador será firmada por acordo macro manual ou somando dinamicamente os eleitores vinculados diretamente.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setLidCalculoMeta("lider")}
                    className={`py-3 px-4 rounded-lg text-sm font-bold border transition text-center flex items-center justify-center gap-2 cursor-pointer ${
                      lidCalculoMeta === "lider"
                        ? "bg-emerald-950/60 border-emerald-500 text-emerald-400 font-extrabold shadow-sm"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300"
                    }`}
                  >
                    👤 Por Apoiador (Manual)
                  </button>
                  <button
                    type="button"
                    onClick={() => setLidCalculoMeta("eleitor")}
                    className={`py-3 px-4 rounded-lg text-sm font-bold border transition text-center flex items-center justify-center gap-2 cursor-pointer ${
                      lidCalculoMeta === "eleitor"
                        ? "bg-blue-950/60 border-blue-500 text-blue-400 font-extrabold shadow-sm"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300"
                    }`}
                  >
                    👥 Por Eleitor (Soma)
                  </button>
                </div>
              </div>

              {/* Meta Macro Input (Conditional display based on selection) */}
              {lidCalculoMeta === "lider" ? (
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm text-slate-300 font-extrabold flex items-center justify-between">
                    <span>Meta Macro (Alvo de votos acordado com o Apoiador)</span>
                    <span className="text-xs bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded font-mono uppercase font-bold tracking-wider border border-emerald-900/30">Manual</span>
                  </label>
                  <input
                    id="lid-input-meta"
                    type="number"
                    required
                    min={1}
                    placeholder="Ex: 400"
                    value={lidMetaMacro}
                    onChange={(e) => setLidMetaMacro(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg p-3.5 text-sm font-bold font-mono text-emerald-400 placeholder-slate-700 outline-none transition"
                  />
                </div>
              ) : (
                <div className="p-4 bg-blue-955/20 border border-blue-900/30 rounded-lg text-sm text-blue-300 md:col-span-2 leading-relaxed">
                  📢 <strong>Meta Dinâmica Ativada:</strong> O compromisso macro deste apoiador será determinado <strong>automaticamente</strong> pela soma de todos os eleitores vinculados diretos.
                </div>
              )}
            </div>

            <button
              id="lid-submit-btn"
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-4 px-5 rounded-lg text-sm flex items-center justify-center gap-2 transition cursor-pointer active:scale-98 shadow-md shadow-emerald-500/10"
            >
              <PlusCircle className="w-5 h-5 animate-pulse" />
              Salvar Apoiador Eleitoral
            </button>
          </form>
        </div>
        )}

        {/* FORM 3: ELEITOR */}
        {activeStep === "eleitores" && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 md:p-8 relative" id="card-cadastrar-eleitor">
          <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <span className="p-2 bg-pink-950/60 text-pink-400 rounded-lg border border-pink-500/20">
                <Vote className="w-6 h-6" />
              </span>
              <div>
                <h3 className="font-extrabold text-white text-base md:text-lg">3. Cadastrar Eleitor</h3>
                <p className="text-xs text-slate-400">Voto vinculado ao Apoiador Eleitoral</p>
              </div>
            </div>
            {elSuccess && (
              <span className="text-sm text-pink-400 bg-pink-950/80 border border-pink-500/30 px-3.5 py-1.5 rounded-full flex items-center gap-1.5 animate-bounce font-bold">
                <CheckCircle2 className="w-4 h-4 text-pink-400" />
                Eleitor Salvo!
              </span>
            )}
          </div>

          {liderancas.length === 0 ? (
            <div className="bg-amber-955/20 border border-amber-500/20 text-amber-305 text-sm p-6 rounded-lg text-center font-bold leading-relaxed">
              ⚠️ Você precisa ter pelo menos uma Liderança cadastrada no território para poder associar Eleitores no sistema.
            </div>
          ) : (
            <form onSubmit={handleElSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm text-slate-300 font-extrabold flex items-center gap-1">
                  <span>Nome do Eleitor</span>
                  <span className="text-red-500">*</span>
                </label>
                <input
                  id="el-input-nome"
                  type="text"
                  required
                  placeholder="Ex: João Batista"
                  value={elNome}
                  onChange={(e) => setElNome(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-pink-500 rounded-lg p-3.5 text-sm text-white placeholder-slate-600 outline-none transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm text-slate-300 font-extrabold">WhatsApp / Telefone (Opcional)</label>
                <input
                  id="el-input-tel"
                  type="text"
                  placeholder="Ex: (96) 99999-9999"
                  value={elTelefone}
                  onChange={(e) => setElTelefone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-pink-500 rounded-lg p-3.5 text-sm text-white placeholder-slate-600 outline-none transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm text-slate-300 font-extrabold flex items-center gap-1">
                  <span>Zona Eleitoral (Opcional)</span>
                </label>
                <input
                  id="el-input-zona"
                  type="text"
                  placeholder="Ex: 10ª Zona - Macapá"
                  value={elZonaEleitoral}
                  onChange={(e) => setElZonaEleitoral(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-pink-500 rounded-lg p-3.5 text-sm text-white placeholder-slate-600 outline-none transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm text-slate-300 font-extrabold flex items-center justify-between">
                  <span>Apoiador Eleitoral Responsável</span>
                </label>
                <select
                  id="el-select-lideranca"
                  required
                  value={elLiderancaId}
                  onChange={(e) => setElLiderancaId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-pink-500 rounded-lg p-3.5 text-sm text-white outline-none transition cursor-pointer font-bold"
                >
                  <option value="">-- Selecione o Apoiador --</option>
                  {liderancas.map((lid) => (
                     <option key={lid.id} value={lid.id}>
                        {lid.nome} ({lid.municipio} - {lid.bairro})
                     </option>
                  ))}
                </select>
              </div>

              <button
                id="el-submit-btn"
                type="submit"
                disabled={!elLiderancaId}
                className={`w-full text-slate-955 font-black py-4 px-5 rounded-lg text-sm flex items-center justify-center gap-2 transition ${
                  elLiderancaId
                    ? "bg-pink-500 hover:bg-pink-400 cursor-pointer active:scale-98 shadow-md shadow-pink-500/10"
                    : "bg-slate-800 text-slate-550 cursor-not-allowed opacity-50"
                }`}
              >
                <PlusCircle className="w-5 h-5 animate-pulse" />
                Vincular Eleitor à Liderança
              </button>
            </form>
          )}
        </div>
        )}

      </div>

      {/* RIGHT COLUMN: REGISTRATION SUMMARY & DELETIONS (lg:col-span-5) */}
      <div className="lg:col-span-5 space-y-6">

        {activeStep === "coordenadores" && (
          <CoordenadoresList
            coordenadoresRegionais={coordenadoresRegionais || []}
            liderancas={liderancas}
            onDeleteCoordenador={onDeleteCoordenador}
            onStartEditCoord={(coord) => {
              setEditingCoord(coord);
              setEditCoordNome(coord.nome);
              setEditCoordTelefone(coord.telefone || "");
              setEditCoordMunicipio(coord.municipio);
              setEditCoordMetaVotos(coord.metaVotos || 0);
            }}
            onShareCoord={(coord) => {
              setSharingCoord(coord);
              setCopiedLink(false);
            }}
            onAddApoiadorManual={handleRegisterApoiadorManual}
          />
        )}

        {/* LIDERANÇAS LIST & TELEMETRY */}
        {activeStep === "liderancas" && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5" id="card-liderancas-registradas">
      <div className="flex flex-col gap-2 mb-4 pb-3 border-b border-slate-800">
            <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-400" />
              Apoiadores Eleitorais Ativos ({liderancas.length})
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Apoiadores locais registrados. Eles estão vinculados às Lideranças Focais do território.
            </p>
          </div>

          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-500" />
            </div>
            <input
              type="text"
              placeholder="Pesquisar apoiador por nome..."
              value={searchLidQuery}
              onChange={(e) => setSearchLidQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-850 focus:border-emerald-500/50 rounded-lg pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-600 outline-none transition"
            />
          </div>

          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1 select-text">
            {(() => {
              const filteredLids = liderancas.filter((lid) =>
                lid.nome.toLowerCase().includes(searchLidQuery.toLowerCase())
              );

              if (filteredLids.length === 0) {
                return (
                  <p className="text-sm text-slate-500 text-center py-10 font-bold">
                    {searchLidQuery ? "Nenhum apoiador encontrado." : "Nenhuma liderança cadastrada."}
                  </p>
                );
              }

              return filteredLids.map((lid) => {
                // Calculate how much micro progress they have (including 1 vote from the leader themselves)
                const progressSum = eleitores.filter((e) => e.liderancaId === lid.id).length + 1;
                
                // Effective Meta depends on calculation settings
                const effectiveMeta = lid.calculoMeta === "eleitor" ? progressSum : lid.metaMacro;
                const progressPct = effectiveMeta > 0 ? Math.round((progressSum / effectiveMeta) * 100) : 0;

                return (
                  <div
                    key={lid.id}
                    className="bg-slate-950 border border-slate-850/80 rounded-xl p-4 hover:border-slate-800 transition flex flex-col justify-between gap-3 relative"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-sm font-black text-slate-100">{lid.nome}</p>
                          <button
                            type="button"
                            onClick={() => handleStartEditLider(lid)}
                            className="bg-slate-900 border border-slate-800 p-1 rounded-md text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30 transition cursor-pointer"
                            title="Corrigir dados cadastrais do líder (Nome, Telefone, Ocupação, Localidade)"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
                            lid.calculoMeta === "eleitor" 
                              ? "bg-blue-950/40 text-blue-400 border-blue-900/30" 
                              : "bg-emerald-950/40 text-emerald-400 border-emerald-900/30"
                          }`}>
                            {lid.calculoMeta === "eleitor" ? "Por Eleitor" : "Manual"}
                          </span>
                        </div>
                        {lid.ocupacao && (
                          <div className="mt-1 text-[10.5px] text-emerald-400 font-extrabold uppercase tracking-wider flex items-center gap-1">
                            <span className="text-slate-500 font-sans font-normal text-[10px]">Ocupação:</span>
                            <span>{lid.ocupacao}</span>
                          </div>
                        )}
                        {/* Linked Coordenador Regional */}
                        {(() => {
                          const coordMatch = (coordenadoresRegionais || []).find((c) => c.id === lid.coordenadorRegionalId);
                          return coordMatch ? (
                            <p className="text-[10.5px] text-amber-450 font-extrabold uppercase tracking-wider flex items-center gap-1.5 mt-1">
                              <span className="text-slate-500 font-sans font-normal text-[10px]">Liderança Territorial:</span>
                              <span>{coordMatch.nome} ({coordMatch.municipio})</span>
                            </p>
                          ) : (
                            <p className="text-[10px] text-amber-500/80 font-bold uppercase tracking-wider flex items-center gap-1 mt-1">
                              ⚠️ Sem Liderança Territorial vinculada!
                            </p>
                          );
                        })()}
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-1 font-semibold">
                          <span>{lid.municipio}</span> &bull; <span>{lid.bairro}</span>
                        </p>
                        {lid.telefone && (
                          <p className="text-xs text-slate-400 font-mono mt-1 bg-slate-900/50 py-0.5 px-2 rounded w-fit">{lid.telefone}</p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        {editingLidId === lid.id ? (
                          <div className="flex flex-col items-end gap-1 bg-slate-900 p-2 rounded-lg border border-slate-800">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Editar Meta</span>
                            <div className="flex gap-1.5">
                              <input
                                type="number"
                                min={1}
                                className="w-16 bg-slate-950 border border-slate-700 rounded p-1 text-xs text-emerald-400 font-mono font-bold outline-none text-center"
                                value={editingGoalValue}
                                onChange={(e) => setEditingGoalValue(e.target.value === "" ? "" : Number(e.target.value))}
                              />
                              <button
                                type="button"
                                onClick={() => handleSaveGoalInline(lid.id)}
                                className="bg-emerald-500 hover:bg-emerald-450 text-slate-950 px-2 py-1 rounded text-[11px] font-black cursor-pointer uppercase"
                              >
                                OK
                              </button>
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm font-mono text-emerald-405 font-black bg-emerald-950/70 px-3 py-1.5 rounded-lg border border-emerald-900/35">
                            Meta: {effectiveMeta} v.
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Progress details */}
                    <div className="space-y-2 bg-slate-900/40 p-3 rounded-xl border border-slate-850/600">
                      <div className="flex justify-between items-center text-xs text-slate-300 font-bold">
                        <span>Eleitores Vinculados: {eleitores.filter((e) => e.liderancaId === lid.id).length}</span>
                        <span>Compromissos: {progressSum} / {effectiveMeta} ({progressPct}%)</span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(progressPct, 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Meta configuration and action operations directly on each Leader card */}
                    <div className="flex flex-col gap-2 border-t border-slate-900 pt-3 mt-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleLeaderMetaMode(lid.id, lid.calculoMeta)}
                            className="text-[11px] text-blue-400 hover:text-blue-300 font-extrabold flex items-center gap-1 bg-slate-900 hover:bg-slate-850 border border-slate-800 px-2.5 py-1.5 rounded-lg transition cursor-pointer"
                            title="Alternar entre Meta Manual e soma automática de Eleitores"
                          >
                            🔄 {lid.calculoMeta === "lider" ? "Para: Eleitores" : "Para: Manual"}
                          </button>

                          {lid.calculoMeta === "lider" && editingLidId !== lid.id && (
                            <button
                              type="button"
                              onClick={() => handleStartEditGoal(lid.id, lid.metaMacro)}
                              className="text-[11px] text-amber-400 hover:text-amber-305 font-extrabold flex items-center gap-1 bg-slate-900 hover:bg-slate-850 border border-slate-800 px-2.5 py-1.5 rounded-lg transition cursor-pointer"
                              title="Alterar o número macro pactuado na meta com este líder"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-amber-450" /> Valor
                            </button>
                          )}
                        </div>

                        {onDeleteLideranca && (
                          <button
                            onClick={() => onDeleteLideranca(lid.id)}
                            className="text-[10px] text-red-400 hover:text-red-305 hover:underline transition font-bold"
                          >
                            Excluir
                          </button>
                        )}
                      </div>
                      
                      <div className="flex gap-2 mt-1">
                        <button
                          type="button"
                          onClick={() => {
                            if (expandLidId === lid.id) {
                              setExpandLidId(null);
                            } else {
                              setExpandLidId(lid.id);
                              setNestElNome("");
                              setNestElTelefone("");
                              setNestElZona("");
                            }
                          }}
                          className={`flex-1 text-[11px] font-extrabold flex justify-center items-center gap-1 px-2.5 py-1.5 rounded-lg transition cursor-pointer uppercase ${
                            expandLidId === lid.id 
                              ? "bg-slate-850 text-slate-300 border border-slate-700"
                              : "bg-emerald-950/40 text-emerald-450 border border-emerald-900/30 hover:bg-emerald-900/40"
                          }`}
                        >
                          <Users className="w-3.5 h-3.5" />
                          {expandLidId === lid.id ? "Cancelar" : "+ Cadastrar Eleitor"}
                        </button>

                        <button
                          type="button"
                          onClick={() => setSharingLider(lid)}
                          className="text-[11px] bg-emerald-950/20 text-emerald-500 hover:bg-emerald-900/30 font-extrabold flex items-center justify-center gap-1 border border-emerald-500/20 px-2.5 py-1.5 rounded-lg transition cursor-pointer uppercase"
                          title="Gerar link de auto-cadastro para eleitores desta liderança"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          Link Auto-Cadastro
                        </button>
                      </div>

                      {/* NESTED FORM TO ADD ELEITOR FOR THIS LIDERANÇA */}
                      {expandLidId === lid.id && (
                        <div className="mt-2 bg-slate-900 border border-slate-800 rounded-lg p-3 w-full">
                          <h5 className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider mb-2 border-b border-emerald-900/30 pb-1">Adicionar Eleitor Focal</h5>
                          <div className="space-y-2">
                            <input
                              type="text"
                              placeholder="Nome do eleitor"
                              value={nestElNome}
                              onChange={(e) => setNestElNome(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-slate-200 outline-none focus:border-emerald-500"
                            />
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Zona Eleitoral (Opcional)"
                                value={nestElZona}
                                onChange={(e) => setNestElZona(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-slate-200 outline-none focus:border-emerald-500"
                              />
                              <input
                                type="tel"
                                placeholder="WhatsApp"
                                value={nestElTelefone}
                                onChange={(e) => setNestElTelefone(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs font-mono text-emerald-400 outline-none focus:border-emerald-500"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                if (!nestElNome.trim()) {
                                  alert("Preencha o nome do eleitor.");
                                  return;
                                }
                                if(onAddEleitor) {
                                  onAddEleitor({
                                    nome: nestElNome,
                                    liderancaId: lid.id,
                                    zonaEleitoral: nestElZona.trim() || undefined,
                                    telefone: nestElTelefone,
                                  });
                                }
                                setExpandLidId(null);
                                setNestElNome("");
                                setNestElZona("");
                                setNestElTelefone("");
                              }}
                              className="w-full bg-emerald-500 hover:bg-emerald-450 text-slate-950 font-black py-2 rounded text-xs uppercase tracking-wider transition cursor-pointer"
                            >
                              Salvar Eleitor
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>
        )}

        {/* ELEITORES LIST */}
        {activeStep === "eleitores" && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5" id="card-eleitores-registrados">
          <div className="flex flex-col gap-1 mb-4 pb-3 border-b border-slate-800">
            <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Vote className="w-5 h-5 text-pink-400" />
              Eleitores Cadastrados
            </h4>
            <div className="flex items-center gap-2 text-xs font-bold font-mono">
              <span className="text-pink-400 bg-pink-950/40 border border-pink-500/20 px-2 py-0.5 rounded uppercase font-bold tracking-wider">{eleitores.length} Total</span>
            </div>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[500px] pr-1 styled-scrollbar">
            {eleitores.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6 font-semibold">Nenhum eleitor final cadastrado ainda.</p>
            ) : (
              eleitores.map((el) => {
                const liderancaMatch = liderancas.find((a) => a.id === el.liderancaId);
                return (
                  <div key={el.id} className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3.5 hover:border-pink-500/30 transition group flex flex-col gap-2 relative">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <strong className="text-sm text-slate-200">{el.nome}</strong>
                          <span className="text-[9px] bg-slate-850 text-slate-400 px-1.5 py-0.5 rounded font-mono border border-slate-750">ID: {el.id.replace("el-", "")}</span>
                        </div>
                        {el.telefone && (
                          <div className="text-[10.5px] text-slate-400 flex items-center gap-1 font-semibold">
                            <Phone className="w-3 h-3 text-pink-500/50" /> {el.telefone}
                          </div>
                        )}
                        <p className="text-[10.5px] text-pink-400 font-extrabold uppercase tracking-wider flex items-center gap-1.5 mt-1">
                          <span className="text-slate-500 font-sans font-normal text-[10px]">Liderança:</span>
                          <span>{liderancaMatch ? liderancaMatch.nome : "Desconhecido"}</span>
                        </p>
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-1 font-semibold">
                          <span>{el.zonaEleitoral}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleStartEditEleitor(el)}
                          className="text-[10px] text-slate-400 hover:text-emerald-400 hover:underline transition font-bold cursor-pointer uppercase tracking-wider"
                        >
                          Editar
                        </button>
                        {onDeleteEleitor && (
                          <button
                            onClick={() => onDeleteEleitor(el.id)}
                            className="text-[10px] text-red-500 hover:text-red-400 hover:underline transition font-bold cursor-pointer uppercase tracking-wider"
                          >
                            Excluir
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
        )}

      </div>

    </div>

      {/* sharingCoord Auto-Cadastro Link sharing overlay dialog */}
      {sharingCoord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm select-none">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Share2 className="w-4.5 h-4.5 text-amber-500" />
                Auto-Cadastro do Coordenador
              </h3>
              <button
                type="button"
                onClick={() => {
                  setSharingCoord(null);
                  setCopiedLink(false);
                }}
                className="text-slate-500 hover:text-slate-300 transition text-xs font-black uppercase tracking-wider cursor-pointer"
              >
                Fechar
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-850">
                <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider font-mono">Coordenador Regional</span>
                <strong className="text-sm text-amber-500 uppercase font-black">{sharingCoord.nome}</strong>
                <span className="text-xs text-slate-400 block mt-1 font-semibold">📍 Base: {sharingCoord.municipio}</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-extrabold uppercase tracking-wider block">Link Seguro de Auto-Cadastro</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-300 font-mono outline-none select-all font-semibold"
                    value={`${window.location.origin}${window.location.pathname}?coordId=${sharingCoord.id}&coordNome=${encodeURIComponent(sharingCoord.nome)}&municipio=${encodeURIComponent(sharingCoord.municipio)}${coordinatorWhatsapp ? `&coordWhatsapp=${encodeURIComponent(coordinatorWhatsapp)}` : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const u = `${window.location.origin}${window.location.pathname}?coordId=${sharingCoord.id}&coordNome=${encodeURIComponent(sharingCoord.nome)}&municipio=${encodeURIComponent(sharingCoord.municipio)}${coordinatorWhatsapp ? `&coordWhatsapp=${encodeURIComponent(coordinatorWhatsapp)}` : ""}`;
                      navigator.clipboard.writeText(u);
                      setCopiedLink(true);
                      setTimeout(() => setCopiedLink(false), 2000);
                    }}
                    className={`px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition cursor-pointer shrink-0 ${
                      copiedLink
                        ? "bg-amber-950 text-amber-500 border border-amber-850"
                        : "bg-amber-500 hover:bg-amber-450 text-slate-950"
                    }`}
                  >
                    {copiedLink ? "Copiado!" : "Copiar"}
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 space-y-3">
                <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                  Envie este link para o coordenador <strong className="text-white">{sharingCoord.nome}</strong>. Ele poderá repassar para as Lideranças Focais do seu território, permitindo que elas realizem o auto-cadastro diretamente pelo celular.
                </p>

                <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800/80">
                  <p className="font-sans text-xs text-emerald-400 font-black mb-1">Dados do vínculo seguindo esta ordem:</p>
                  <div className="flex flex-col text-[11px] text-slate-400 font-mono space-y-1">
                    <p>&bull; Liderança focal</p>
                    <p>&bull; Apoiadores</p>
                    <p>&bull; Eleitores finais</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const u = `${window.location.origin}${window.location.pathname}?coordId=${sharingCoord.id}&coordNome=${encodeURIComponent(sharingCoord.nome)}&municipio=${encodeURIComponent(sharingCoord.municipio)}${coordinatorWhatsapp ? `&coordWhatsapp=${encodeURIComponent(coordinatorWhatsapp)}` : ""}`;
                    const msg = `Olá, *${sharingCoord.nome}*! Aqui está o seu link exclusivo do GEO SCAN para auto-cadastro.\n\nDados do vínculo seguindo esta ordem: Liderança focal, apoiadores e eleitores finais.\n\n🔗 *Link:* ${u}`;
                    
                    let phoneParam = "";
                    if (sharingCoord.telefone) {
                      const cleaned = sharingCoord.telefone.replace(/\D/g, "");
                      if (cleaned) {
                        phoneParam = (cleaned.length === 10 || cleaned.length === 11) ? `55${cleaned}` : cleaned;
                      }
                    }

                    const url = phoneParam 
                      ? `https://api.whatsapp.com/send?phone=${phoneParam}&text=${encodeURIComponent(msg)}`
                      : `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
                    
                    window.open(url, "_blank", "noopener,noreferrer");
                  }}
                  className="w-full bg-slate-950 hover:bg-slate-850 hover:text-amber-500 border border-slate-800 hover:border-amber-500/20 text-amber-500 font-black py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4 text-amber-500" />
                  <span>Compartilhar via WhatsApp{sharingCoord.telefone ? ` (${sharingCoord.telefone})` : ""}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* sharingLider Auto-Cadastro Link sharing overlay dialog */}
      {sharingLider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm select-none">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Share2 className="w-4.5 h-4.5 text-emerald-450" />
                Auto-Cadastro do Líder
              </h3>
              <button
                type="button"
                onClick={() => {
                  setSharingLider(null);
                  setCopiedLink(false);
                }}
                className="text-slate-500 hover:text-slate-300 transition text-xs font-black uppercase tracking-wider cursor-pointer"
              >
                Fechar
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-850">
                <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider font-mono">Liderança territorial</span>
                <strong className="text-sm text-emerald-400 uppercase font-black">{sharingLider.nome}</strong>
                <span className="text-xs text-slate-400 block mt-1 font-semibold">📍 Base: {sharingLider.municipio} &bull; {sharingLider.bairro}</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-extrabold uppercase tracking-wider block">Link Seguro de Auto-Cadastro</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-300 font-mono outline-none select-all font-semibold"
                    value={`${window.location.origin}${window.location.pathname}?liderId=${sharingLider.id}&liderNome=${encodeURIComponent(sharingLider.nome)}&municipio=${encodeURIComponent(sharingLider.municipio)}${sharingLider.telefone ? `&liderWhatsapp=${encodeURIComponent(sharingLider.telefone)}` : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const u = `${window.location.origin}${window.location.pathname}?liderId=${sharingLider.id}&liderNome=${encodeURIComponent(sharingLider.nome)}&municipio=${encodeURIComponent(sharingLider.municipio)}${sharingLider.telefone ? `&liderWhatsapp=${encodeURIComponent(sharingLider.telefone)}` : ""}`;
                      navigator.clipboard.writeText(u);
                      setCopiedLink(true);
                      setTimeout(() => setCopiedLink(false), 2000);
                    }}
                    className={`px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition cursor-pointer shrink-0 ${
                      copiedLink
                        ? "bg-emerald-950 text-emerald-400 border border-emerald-850"
                        : "bg-emerald-505 hover:bg-emerald-500 text-slate-950"
                    }`}
                  >
                    {copiedLink ? "Copiado!" : "Copiar"}
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 space-y-3">
                <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                  Envie este link para <strong className="text-white">{sharingLider.nome}</strong>. Ele poderá repassar para seus eleitores da Etapa 3.
                </p>

                <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800/80">
                  <p className="font-sans text-xs text-emerald-400 font-black mb-1">Dados do vínculo seguindo esta ordem:</p>
                  <div className="flex flex-col text-[11px] text-slate-400 font-mono space-y-1">
                    <p>&bull; Liderança focal</p>
                    <p>&bull; Apoiadores</p>
                    <p>&bull; Eleitores finais</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const u = `${window.location.origin}${window.location.pathname}?liderId=${sharingLider.id}&liderNome=${encodeURIComponent(sharingLider.nome)}&municipio=${encodeURIComponent(sharingLider.municipio)}${sharingLider.telefone ? `&liderWhatsapp=${encodeURIComponent(sharingLider.telefone)}` : ""}`;
                    const msg = `Olá, *${sharingLider.nome}*! Aqui está o seu link exclusivo do GEO SCAN para auto-cadastro (Etapa 3).\n\nDados do vínculo seguindo esta ordem: Liderança focal, apoiadores e eleitores finais.\n\n🔗 *Link:* ${u}`;
                    
                    let phoneParam = "";
                    if (sharingLider.telefone) {
                      const cleaned = sharingLider.telefone.replace(/\D/g, "");
                      if (cleaned) {
                        phoneParam = (cleaned.length === 10 || cleaned.length === 11) ? `55${cleaned}` : cleaned;
                      }
                    }

                    const url = phoneParam 
                      ? `https://api.whatsapp.com/send?phone=${phoneParam}&text=${encodeURIComponent(msg)}`
                      : `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
                    
                    window.open(url, "_blank", "noopener,noreferrer");
                  }}
                  className="w-full bg-slate-950 hover:bg-slate-850 hover:text-emerald-400 border border-slate-800 hover:border-emerald-500/20 text-emerald-500 font-black py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4 text-emerald-450" />
                  <span>Compartilhar via WhatsApp{sharingLider.telefone ? ` (${sharingLider.telefone})` : ""}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT LIDERANÇA OVERLAY MODAL */}
      {editingLider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm select-none">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveEditLider();
            }}
            className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Edit2 className="w-4.5 h-4.5 text-emerald-450" />
                Corrigir Dados da Liderança
              </h3>
              <button
                type="button"
                onClick={() => setEditingLider(null)}
                className="text-slate-500 hover:text-slate-300 transition text-xs font-black uppercase tracking-wider cursor-pointer"
              >
                Cancelar
              </button>
            </div>

            <div className="space-y-4 font-sans text-left">
              {/* Nome */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-extrabold uppercase tracking-wider block">Nome do Líder</label>
                <input
                  type="text"
                  required
                  value={editLidNome}
                  onChange={(e) => setEditLidNome(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg p-3.5 text-sm text-slate-200 outline-none transition font-semibold"
                />
              </div>

              {/* Ocupação / Função */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-extrabold uppercase tracking-wider block">Ocupação / Função</label>
                <div className="space-y-2">
                  <select
                    value={editLidOcupacao}
                    onChange={(e) => setEditLidOcupacao(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg p-3.5 text-sm text-slate-200 outline-none transition cursor-pointer font-semibold"
                  >
                    <option value="Líder de Comunidade">Líder de Comunidade</option>
                    <option value="Líder de Associação">Líder de Associação</option>
                    <option value="Presidente">Presidente</option>
                    <option value="Representante">Representante</option>
                    <option value="Coordenador">Coordenador</option>
                    <option value="Outro">Outro (Digitar customizado...)</option>
                  </select>

                  {editLidOcupacao === "Outro" && (
                    <input
                      type="text"
                      required
                      placeholder="Ex: Delegado Sindical, etc."
                      value={editLidOcupacaoCustom}
                      onChange={(e) => setEditLidOcupacaoCustom(e.target.value)}
                      className="w-full bg-slate-950 border border-emerald-500/50 focus:border-emerald-500 rounded-lg p-3.5 text-xs text-white placeholder-slate-600 outline-none transition font-semibold"
                    />
                  )}
                </div>
              </div>

              {/* Telefone */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-extrabold uppercase tracking-wider block">WhatsApp / Telefone (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ex: (96) 99123-4567"
                  value={editLidTelefone}
                  onChange={(e) => setEditLidTelefone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg p-3.5 text-sm text-slate-200 outline-none transition font-semibold"
                />
              </div>

              {/* Município Cascata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300 font-extrabold uppercase tracking-wider block">Município</label>
                  <select
                    value={editLidMunicipio}
                    onChange={handleEditLidMunicipioChange}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg p-3.5 text-sm text-slate-200 outline-none transition cursor-pointer font-semibold"
                  >
                    {municipios.map((m) => (
                      <option key={m.nome} value={m.nome}>
                        {m.nome}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Bairro Cascata */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-slate-300 font-extrabold uppercase tracking-wider block">Bairro de Atuação</label>
                    <button
                      type="button"
                      onClick={() => {
                        setEditLidWriteBairroMode(!editLidWriteBairroMode);
                        if (!editLidWriteBairroMode) {
                          setEditLidBairro("");
                        } else if (editLidBairrosList.length > 0) {
                          setEditLidBairro(editLidBairrosList[0]);
                        }
                      }}
                      className="text-[10px] text-emerald-440 font-bold hover:text-emerald-400 hover:underline transition uppercase tracking-wider"
                    >
                      {editLidWriteBairroMode ? "⚡ Lista" : "✍️ Digitar"}
                    </button>
                  </div>
                  {editLidWriteBairroMode ? (
                    <input
                      type="text"
                      required
                      placeholder="Nome do bairro"
                      value={editLidBairro}
                      onChange={(e) => setEditLidBairro(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg p-3.5 text-sm text-white placeholder-slate-600 outline-none transition font-semibold"
                    />
                  ) : (
                    <select
                      value={editLidBairro}
                      onChange={(e) => setEditLidBairro(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg p-3.5 text-sm text-slate-200 outline-none transition cursor-pointer font-semibold"
                    >
                      {editLidBairrosList.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Coordenador Regional Responsável */}
              <div className="space-y-1.5 font-sans">
                <label className="text-xs text-slate-300 font-extrabold uppercase tracking-wider block">Coordenador Regional Responsável</label>
                <select
                  value={editLidCoordenadorId}
                  onChange={(e) => setEditLidCoordenadorId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg p-3.5 text-sm text-slate-200 outline-none transition cursor-pointer font-semibold"
                >
                  <option value="">-- Selecione o Coordenador ativo em {editLidMunicipio} --</option>
                  {(coordenadoresRegionais || [])
                    .filter((c) => c.municipio === editLidMunicipio)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nome} (Regional {c.municipio})
                      </option>
                    ))}
                </select>
                {(coordenadoresRegionais || []).filter((c) => c.municipio === editLidMunicipio).length === 0 && (
                  <p className="text-[10.5px] text-amber-500 font-bold bg-amber-950/20 p-2.5 rounded-lg border border-amber-900/20 leading-relaxed">
                    ⚠️ Não há coordenadores cadastrados em <strong>{editLidMunicipio}</strong> no momento.
                  </p>
                )}
              </div>

              {/* Save & Cancel buttons */}
              <div className="pt-3 border-t border-slate-800 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingLider(null)}
                  className="flex-1 py-3 bg-slate-950 border border-slate-800 text-slate-300 font-extrabold rounded-lg text-xs uppercase tracking-wider hover:bg-slate-850 cursor-pointer transition text-center"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-emerald-500 text-slate-950 font-black rounded-lg text-xs uppercase tracking-wider hover:bg-emerald-450 cursor-pointer transition text-center shadow-lg shadow-emerald-500/10"
                >
                  Confirmar Correção
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* EDIT ELEITOR OVERLAY MODAL */}
      {editingEleitor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm select-none">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveEditEleitor();
            }}
            className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Edit2 className="w-4.5 h-4.5 text-emerald-450" />
                Corrigir Dados do Eleitor
              </h3>
              <button
                type="button"
                onClick={() => setEditingEleitor(null)}
                className="text-slate-500 hover:text-slate-300 transition text-xs font-black uppercase tracking-wider cursor-pointer"
              >
                Cancelar
              </button>
            </div>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 flex items-center gap-1 uppercase tracking-widest ml-1">
                  Nome do Eleitor <span className="text-emerald-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editElNome}
                  onChange={(e) => setEditElNome(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg p-3 text-sm text-slate-100 placeholder-slate-600 outline-none transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 flex items-center gap-1 uppercase tracking-widest ml-1">
                  Celular / WhatsApp (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="(00) 00000-0000"
                  value={editElTelefone}
                  onChange={(e) => setEditElTelefone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg p-3 text-sm text-slate-100 placeholder-slate-600 outline-none transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 flex items-center gap-1 uppercase tracking-widest ml-1">
                  Zona / Seção (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Zona 02 / Seção 144"
                  value={editElZonaEleitoral}
                  onChange={(e) => setEditElZonaEleitoral(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg p-3 text-sm text-slate-100 placeholder-slate-600 outline-none transition"
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                  Liderança de Vínculo <span className="text-emerald-400">*</span>
                </label>
                <select
                  required
                  value={editElLiderancaId}
                  onChange={(e) => setEditElLiderancaId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg p-3 text-sm text-slate-100 outline-none transition cursor-pointer"
                >
                  <option value="" disabled>Selecione uma liderança...</option>
                  {liderancas.map((l) => (
                    <option key={l.id} value={l.id}>{l.nome} ({l.municipio} - {l.bairro})</option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-slate-800 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingEleitor(null)}
                  className="flex-1 py-3 bg-slate-950 border border-slate-800 text-slate-300 font-extrabold rounded-lg text-xs uppercase tracking-wider hover:bg-slate-850 cursor-pointer transition text-center"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-emerald-500 text-slate-950 font-black rounded-lg text-xs uppercase tracking-wider hover:bg-emerald-450 cursor-pointer transition text-center shadow-lg shadow-emerald-500/10"
                >
                  Confirmar Correção
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* EDIT COORDENADOR REGIONAL OVERLAY MODAL */}
      {editingCoord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm select-none">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveEditCoord();
            }}
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 font-sans text-left"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Edit2 className="w-4.5 h-4.5 text-amber-500" />
                Corrigir Dados do Coordenador Regional
              </h3>
              <button
                type="button"
                onClick={() => setEditingCoord(null)}
                className="text-slate-500 hover:text-slate-300 transition text-xs font-black uppercase tracking-wider cursor-pointer"
              >
                Cancelar
              </button>
            </div>

            <div className="space-y-4">
              {/* Nome */}
              <div className="space-y-1.5 font-sans">
                <label className="text-xs text-slate-300 font-extrabold uppercase tracking-wider block">Nome do Coordenador</label>
                <input
                  type="text"
                  required
                  value={editCoordNome}
                  onChange={(e) => setEditCoordNome(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg p-3.5 text-sm text-slate-200 outline-none transition font-semibold"
                />
              </div>

              {/* Município */}
              <div className="space-y-1.5 font-sans">
                <label className="text-xs text-slate-300 font-extrabold uppercase tracking-wider block">Município Responsável</label>
                <select
                  value={editCoordMunicipio}
                  onChange={(e) => {
                    const value = e.target.value;
                    setEditCoordMunicipio(value);
                    const munic = municipios.find((m) => m.nome === value);
                    if (munic && munic.bairros.length > 0) {
                      setEditCoordBairro(munic.bairros[0]);
                    } else {
                      setEditCoordBairro("");
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg p-3.5 text-sm text-slate-200 outline-none transition font-semibold"
                >
                  {municipios.map((m) => (
                    <option key={m.nome} value={m.nome}>
                      {m.nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* Bairro Cascata */}
              <div className="space-y-1.5 font-sans">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-slate-300 font-extrabold uppercase tracking-wider block">Bairro (Opcional)</label>
                  <button
                    type="button"
                    onClick={() => {
                      setEditCoordWriteBairroMode(!editCoordWriteBairroMode);
                      if (!editCoordWriteBairroMode) {
                        setEditCoordBairro("");
                      } else if (editCoordBairrosList.length > 0) {
                        setEditCoordBairro(editCoordBairrosList[0]);
                      }
                    }}
                    className="text-[10px] text-amber-500 font-extrabold hover:text-amber-450 transition cursor-pointer uppercase tracking-wider"
                  >
                    {editCoordWriteBairroMode ? "⚡ Selecionar Lista" : "✍️ Escrever Bairro"}
                  </button>
                </div>
                {editCoordWriteBairroMode ? (
                  <input
                    type="text"
                    placeholder="Digite o nome do bairro"
                    value={editCoordBairro}
                    onChange={(e) => setEditCoordBairro(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg p-3.5 text-sm text-slate-200 placeholder-slate-650 outline-none transition font-semibold"
                  />
                ) : (
                  <select
                    value={editCoordBairro}
                    onChange={(e) => setEditCoordBairro(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg p-3.5 text-sm text-slate-200 outline-none transition cursor-pointer"
                  >
                    {editCoordBairrosList.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Telefone */}
              <div className="space-y-1.5 font-sans">
                <label className="text-xs text-slate-300 font-extrabold uppercase tracking-wider block">WhatsApp / Telefone (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ex: (96) 99123-4567"
                  value={editCoordTelefone}
                  onChange={(e) => setEditCoordTelefone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg p-3.5 text-sm text-slate-200 outline-none transition font-semibold"
                />
              </div>

              {/* Meta de Votos */}
              <div className="space-y-1.5 font-sans">
                <label className="text-xs text-slate-300 font-extrabold uppercase tracking-wider block">Meta de Votos (Opcional)</label>
                <input
                  type="number"
                  min={0}
                  placeholder="Ex: 5000"
                  value={editCoordMetaVotos || ""}
                  onChange={(e) => setEditCoordMetaVotos(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg p-3.5 text-sm text-amber-400 outline-none transition font-semibold font-mono"
                />
              </div>

              {/* Município */}
              <div className="space-y-1.5 font-sans">
                <label className="text-xs text-slate-300 font-extrabold uppercase tracking-wider block">Município de Atuação</label>
                <select
                  value={editCoordMunicipio}
                  onChange={(e) => setEditCoordMunicipio(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg p-3.5 text-sm text-slate-200 outline-none transition cursor-pointer font-semibold"
                >
                  {municipios.map((m) => (
                    <option key={m.nome} value={m.nome}>
                      {m.nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action buttons */}
              <div className="pt-3 border-t border-slate-800 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingCoord(null)}
                  className="flex-1 py-3 bg-slate-950 border border-slate-800 text-slate-300 font-extrabold rounded-lg text-xs uppercase tracking-wider hover:bg-slate-850 cursor-pointer transition text-center"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-amber-500 text-slate-950 font-black rounded-lg text-xs uppercase tracking-wider hover:bg-amber-450 cursor-pointer transition text-center shadow-lg shadow-amber-500/10"
                >
                  Confirmar Correção
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
