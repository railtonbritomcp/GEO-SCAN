import React, { useState, useMemo } from "react";
import { Lideranca, MunicipioDefinition, CandidateInfo, CoordenadorRegional, Eleitor } from "../types";
import { Filter, Award, TrendingUp, Users, Target, ShieldCheck, MapPin, Landmark, CheckCircle, FileDown, Lock, KeyRound } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import CascadingHierarchyList from "./CascadingHierarchyList";

interface DashboardTabProps {
  municipios: MunicipioDefinition[];
  liderancas: Lideranca[];
  eleitores?: Eleitor[];
  coordenadoresRegionais?: CoordenadorRegional[];
  globalGoal: number;
  onSetGlobalGoal: (goal: number) => void;
  candidateInfo?: CandidateInfo | null;
  coordinatorWhatsapp?: string;
  onSetCoordinatorWhatsapp?: (num: string) => void;
}

export default function DashboardTab({
  municipios,
  liderancas,
  eleitores = [],
  coordenadoresRegionais = [],
  globalGoal,
  onSetGlobalGoal,
  candidateInfo,
  coordinatorWhatsapp = "",
  onSetCoordinatorWhatsapp,
}: DashboardTabProps) {
  // CONFIG COORDINATOR WHATSAPP STATE
  const [isEditingCoordWhatsapp, setIsEditingCoordWhatsapp] = useState(false);
  const [tempCoordWhatsapp, setTempCoordWhatsapp] = useState<string>(coordinatorWhatsapp);

  // CHANGE ADMIN PASSWORD STATE
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [confirmAdminPassword, setConfirmAdminPassword] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (newAdminPassword.length < 6) {
      setPasswordError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (newAdminPassword !== confirmAdminPassword) {
      setPasswordError("As senhas não coincidem.");
      return;
    }

    try {
      const activeSessionStr = localStorage.getItem("geoscan_user_session");
      if (!activeSessionStr) {
        setPasswordError("Sessão expirada. Faça login novamente.");
        return;
      }
      const activeSession = JSON.parse(activeSessionStr);
      const email = activeSession.email;

      const storedUsers = JSON.parse(localStorage.getItem("geoscan_users") || "{}");
      if (!storedUsers[email]) {
        storedUsers[email] = { password: "" };
      }
      storedUsers[email].password = newAdminPassword;
      localStorage.setItem("geoscan_users", JSON.stringify(storedUsers));
      
      setPasswordSuccess("Senha alterada com sucesso!");
      setNewAdminPassword("");
      setConfirmAdminPassword("");
      setTimeout(() => {
        setPasswordSuccess("");
        setIsEditingPassword(false);
      }, 3000);
    } catch (err) {
      setPasswordError("Erro ao salvar nova senha.");
    }
  };

  const handleSaveCoordWhatsapp = () => {
    if (onSetCoordinatorWhatsapp) {
      onSetCoordinatorWhatsapp(tempCoordWhatsapp.trim());
    }
    setIsEditingCoordWhatsapp(false);
  };

  const handlePhoneInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let cleanVal = e.target.value.replace(/\D/g, "");
    if (cleanVal.length > 11) {
      cleanVal = cleanVal.slice(0, 11);
    }
    
    // Apply (XX) XXXXX-XXXX mask
    if (cleanVal.length > 6) {
      setTempCoordWhatsapp(`(${cleanVal.slice(0, 2)}) ${cleanVal.slice(2, 7)}-${cleanVal.slice(7)}`);
    } else if (cleanVal.length > 2) {
      setTempCoordWhatsapp(`(${cleanVal.slice(0, 2)}) ${cleanVal.slice(2)}`);
    } else {
      setTempCoordWhatsapp(cleanVal);
    }
  };

  const totalStatewideSupportersVotes = useMemo(() => {
    return eleitores.length + liderancas.length;
  }, [eleitores, liderancas]);

  const globalProgressPct = useMemo(() => {
    return globalGoal > 0 ? Math.round((totalStatewideSupportersVotes / globalGoal) * 100) : 0;
  }, [totalStatewideSupportersVotes, globalGoal]);

  // FILTERS STATE
  const [filterMunicipio, setFilterMunicipio] = useState<string>("ALL");
  const [filterLider, setFilterLider] = useState<string>("ALL");

  // Reset Leader filter when Municipality filter changes
  const handleMunicipioFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterMunicipio(e.target.value);
    setFilterLider("ALL"); // Reset leader filter
  };

  // Dynamically filter leaders shown in the dropdown selector based on selected Municipality
  const availableLeadersInFilter = useMemo(() => {
    if (filterMunicipio === "ALL") {
      return liderancas;
    }
    return liderancas.filter((l) => l.municipio === filterMunicipio);
  }, [filterMunicipio, liderancas]);

  // CALCULATION RESULTS based on filters
  const metrics = useMemo(() => {
    // 1. Filtered Lideranças
    let activeLeaders = liderancas;
    if (filterMunicipio !== "ALL") {
      activeLeaders = activeLeaders.filter((l) => l.municipio === filterMunicipio);
    }
    if (filterLider !== "ALL") {
      activeLeaders = activeLeaders.filter((l) => l.id === filterLider);
    }

    // Sum of Macro Goals for filtered leaders, taking care of Lider vs Eleitor setup setting
    const metaLiderTotal = activeLeaders.reduce((sum, l) => {
      if (l.calculoMeta === "eleitor") {
        const leaderEleitoresSum = eleitores
          .filter((el) => el.liderancaId === l.id).length + 1; // Each leadership counts as a voter with 1 personal vote
        return sum + leaderEleitoresSum;
      }
      return sum + l.metaMacro;
    }, 0);

    // 2. Filtered Eleitores
    // Eleitores are linked to the filtered leaders
    const filteredLeaderIds = new Set(activeLeaders.map((l) => l.id));
    const activeEleitores = eleitores.filter((el) => filteredLeaderIds.has(el.liderancaId));

    // Sum of eleitores plus 1 personal vote for each active leader
    const votosGantidosTotal = activeEleitores.length + activeLeaders.length;

    // Percentage Progress
    const progressoMetaPct = metaLiderTotal > 0 ? (votosGantidosTotal / metaLiderTotal) * 100 : 0;

    return {
      activeLeaders,
      activeEleitores,
      metaLiderTotal,
      votosGantidosTotal,
      progressoMetaPct: Math.round(progressoMetaPct * 10) / 10, // 1 decimal place
    };
  }, [filterMunicipio, filterLider, liderancas, eleitores]);

  // Aggregate results by neighborhood for visual breakdown
  const neighborhoodBreakdown = useMemo(() => {
    const breakdown: Record<string, { supportersCount: number; commitmentSum: number; metaSum: number }> = {};
    metrics.activeEleitores.forEach((el) => {
      const leader = metrics.activeLeaders.find(l => l.id === el.liderancaId);
      if(!leader) return;
      const key = `${leader.municipio} - ${leader.bairro}`;
      if (!breakdown[key]) {
        breakdown[key] = { supportersCount: 0, commitmentSum: 0, metaSum: 0 };
      }
      breakdown[key].supportersCount += 1;
      breakdown[key].commitmentSum += 1;
    });

    metrics.activeLeaders.forEach((l) => {
      const key = `${l.municipio} - ${l.bairro}`;
      if (!breakdown[key]) {
        breakdown[key] = { supportersCount: 0, commitmentSum: 0, metaSum: 0 };
      }
      breakdown[key].supportersCount += 1;
      breakdown[key].commitmentSum += 1; // 1 personal vote as leader
      
      const leaderEleitoresSum = metrics.activeEleitores.filter((el) => el.liderancaId === l.id).length + 1;
      breakdown[key].metaSum += l.calculoMeta === "eleitor" ? leaderEleitoresSum : l.metaMacro;
    });

    return Object.entries(breakdown).map(([bairro, stats]) => ({
      bairro,
      ...stats,
    })).sort((a, b) => b.commitmentSum - a.commitmentSum);
  }, [metrics.activeEleitores, metrics.activeLeaders]);

  const municipalityBreakdown = useMemo(() => {
    const breakdown: Record<string, { supportersCount: number; commitmentSum: number; metaSum: number }> = {};
    
    // Sum supporters
    metrics.activeEleitores.forEach((el) => {
      const leader = metrics.activeLeaders.find(l => l.id === el.liderancaId);
      if(!leader) return;
      const key = leader.municipio;
      if (!breakdown[key]) breakdown[key] = { supportersCount: 0, commitmentSum: 0, metaSum: 0 };
      breakdown[key].supportersCount += 1;
      breakdown[key].commitmentSum += 1;
    });

    metrics.activeLeaders.forEach((l) => {
      const key = l.municipio;
      if (!breakdown[key]) breakdown[key] = { supportersCount: 0, commitmentSum: 0, metaSum: 0 };
      breakdown[key].supportersCount += 1;
      breakdown[key].commitmentSum += 1;
    });

    // We can define the metaSum from the newly configured municipios, or fallback to 0
    return Object.entries(breakdown).map(([municipioName, stats]) => {
      const munDef = municipios.find(m => m.nome === municipioName);
      const metaIndividualizada = munDef?.metaVotos || 0;
      return {
        municipio: municipioName,
        ...stats,
        metaSum: metaIndividualizada
      };
    }).sort((a, b) => b.commitmentSum - a.commitmentSum);
  }, [metrics.activeEleitores, metrics.activeLeaders, municipios]);

  // Determine critical alert or praise based on progress
  const progressStatusMessage = useMemo(() => {
    const pct = metrics.progressoMetaPct;
    if (pct === 0) return { text: "Sem metas definidas para os filtros atuais.", color: "text-slate-400", bg: "bg-slate-900/50" };
    if (pct < 50) return { text: "Atenção: Eleitores cobrem menos de 50% da meta macro acordada nesta região. Intensificar mobilização!", color: "text-red-400", bg: "bg-red-950/20 border-red-500/10" };
    if (pct < 90) return { text: "Bom progresso. Continuidade no engajamento para fechar compromissos pendentes com eleitores.", color: "text-blue-400", bg: "bg-blue-950/25 border-blue-500/10" };
    if (pct < 100) return { text: "Excelente cobertura territorial! Quase atingindo o limite total das metas estabelecidas.", color: "text-teal-400", bg: "bg-teal-950/20 border-teal-500/10" };
    return { text: "Alvo territorial atingido ou superado! Metas 100% amparadas por eleitores nominais.", color: "text-emerald-400", bg: "bg-emerald-950/30 border-emerald-500/15" };
  }, [metrics.progressoMetaPct]);

  const handleExportPDF = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    const candidateName = candidateInfo?.candidateName || "Não Ativado";
    const ballotNumber = candidateInfo?.ballotNumber || "---";
    const timestampStr = new Date().toLocaleString("pt-BR");

    // Corporate Header of GEO SCAN Amapá
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, 210, 42, "F");

    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("GEO SCAN | Inteligência Territorial", 14, 16);

    // Subtitle
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text("SISTEMA DE MONITORAMENTO DE CAMPANHA ELEITORAL", 14, 23);

    // Golden / Emerald bar
    doc.setFillColor(16, 185, 129); // emerald-500
    doc.rect(14, 26, 182, 1, "F");

    // Candidate details
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text(`Candidato: ${candidateName.toUpperCase()} (Nº ${ballotNumber})`, 14, 34);

    // Extraction Date
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(203, 213, 225); // slate-300
    doc.text(`Emissão: ${timestampStr} | UF: Amapá (AP)`, 145, 34);

    let currentY = 52;

    // Filters Summary Panel in PDF
    doc.setFillColor(248, 250, 252); // slate-50
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.rect(14, currentY, 182, 38, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text("DELIMITAÇÃO TERRITORIAL E RESPONSÁVEIS (FILTRO SELECIONADO)", 18, currentY + 5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105); // slate-600
    doc.text(`Municipio: ${filterMunicipio === "ALL" ? "TODOS OS MUNICÍPIOS" : filterMunicipio.toUpperCase()}`, 18, currentY + 11);
    doc.text(`Apoiador: ${filterLider === "ALL" ? "TODOS OS APOIADORES" : (metrics.activeLeaders.find(l => l.id === filterLider)?.nome.toUpperCase() || "SELECIONADO")}`, 18, currentY + 16);
    
    // Active Lideranças Focais
    const activeCoordIds = new Set(metrics.activeLeaders.map(l => l.coordenadorRegionalId).filter(id => !!id));
    const activeCoords = coordenadoresRegionais.filter(c => activeCoordIds.has(c.id));
    const coordNames = activeCoords.length > 0 ? activeCoords.map(c => c.nome).join(", ") : "NENHUMA LIDERANÇA VINCULADA";
    doc.text(`Lideranças Focais: ${coordNames.toUpperCase()}`, 18, currentY + 21);
    doc.text(`Data Extracao: ${timestampStr}`, 18, currentY + 26);
    doc.text(`Meta Estadual Geral: ${globalGoal} votos`, 18, currentY + 31);
    
    // Overview Stats
    currentY += 40; // Shifted overview stats below the now-taller filter box

    const totLeaders = metrics.activeLeaders.length;
    const totSupporters = metrics.activeEleitores.length;
    const totalMacro = metrics.metaLiderTotal;
    const totalMicro = metrics.votosGantidosTotal;
    const progressPercent = metrics.progressoMetaPct;

    doc.setFont("helvetica", "bold");
    doc.text(`Apoiadores Atendidos: ${totLeaders}`, 14, currentY); // Repositioned
    doc.text(`Eleitores Cadastrados: ${totSupporters}`, 14, currentY + 5);
    currentY += 10;


    // Compilated metrics cards (Draw two boxes)
    // Box 1: Meta Macro do Filtro
    doc.setFillColor(241, 245, 249); // slate-100
    doc.rect(14, currentY, 88, 14, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text("META MACRO PACTUADA (Filtro)", 18, currentY + 4);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(`${totalMacro} votos`, 18, currentY + 10);

    // Box 2: Compromisso Micro
    doc.setFillColor(241, 245, 249); // slate-100
    doc.rect(108, currentY, 88, 14, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text("COMPROMISSO GARANTIDO (Eleitores e Líderes)", 112, currentY + 4);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(16, 185, 129); // emerald-500
    doc.text(`${totalMicro} votos (${progressPercent}%)`, 112, currentY + 10);

    currentY += 20;

    // Heading for cascading data
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    doc.text("MAPEAMENTO EM CASCATA (UF -> MUNICÍPIO -> APOIADOR -> ELEITORES)", 14, currentY);
    currentY += 5;

    doc.setDrawColor(203, 213, 225); // slate-300
    doc.line(14, currentY, 196, currentY);
    currentY += 8;

    // Table Generation based on requested order: Municipio -> Lideranca Focal -> Apoiador -> Eleitor
    const tableBody: any[] = [];
    
    // Sort logic to maintain cascading order in the flat table
    const sortedLeaders = [...metrics.activeLeaders].sort((a, b) => {
      // Sort by Municipality first
      if (a.municipio !== b.municipio) return a.municipio.localeCompare(b.municipio);
      
      // Then by Focal Leader (Coordenador)
      const coordA = (coordenadoresRegionais.find(c => c.id === a.coordenadorRegionalId)?.nome || "ZZZ").toUpperCase();
      const coordB = (coordenadoresRegionais.find(c => c.id === b.coordenadorRegionalId)?.nome || "ZZZ").toUpperCase();
      if (coordA !== coordB) return coordA.localeCompare(coordB);
      
      // Finally by Apoiador (Lideranca)
      return a.nome.localeCompare(b.nome);
    });

    sortedLeaders.forEach((lid) => {
      const muni = lid.municipio.toUpperCase();
      const bairro = lid.bairro.toUpperCase();
      const coordMatch = coordenadoresRegionais.find((c) => c.id === lid.coordenadorRegionalId);
      const focal = coordMatch ? coordMatch.nome.toUpperCase() : "NÃO VINCULADO";
      const apoiador = lid.nome.toUpperCase();
      
      const leaderVoters = metrics.activeEleitores.filter((e) => e.liderancaId === lid.id);
      
      if (leaderVoters.length === 0) {
        // Even without voters, the Apoiador counts as a committed vote
        tableBody.push([
          muni,
          bairro,
          focal,
          apoiador,
          "(Voto Próprio do Apoiador)",
          lid.telefone || "N/A"
        ]);
      } else {
        leaderVoters.forEach((v) => {
          tableBody.push([
            muni,
            bairro,
            focal,
            apoiador,
            v.nome.toUpperCase(),
            v.telefone || "N/A"
          ]);
        });
      }
    });

    if (tableBody.length === 0) {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184);
      doc.text("Nenhum dado encontrado com os filtros ativos para gerar a tabela.", 14, currentY);
    } else {
      autoTable(doc, {
        startY: currentY,
        head: [["MUNICÍPIO", "BAIRRO", "LIDERANÇA FOCAL", "APOIADOR ELEITORAL", "ELEITOR CADASTRADO", "CONTATO"]],
        body: tableBody,
        theme: "striped",
        styles: { fontSize: 6.5, cellPadding: 1.2 },
        headStyles: { 
          fillColor: [15, 23, 42], 
          textColor: [255, 255, 255], 
          fontStyle: "bold",
          halign: "left"
        },
        columnStyles: {
          0: { cellWidth: 24 },
          1: { cellWidth: 24 },
          2: { cellWidth: 34 },
          3: { cellWidth: 34 },
          4: { cellWidth: 40 },
          5: { cellWidth: 24 }
        },
        margin: { left: 14, right: 14 },
      });
    }

    currentY = (doc as any).lastAutoTable?.finalY + 15 || currentY + 20;

    // Header and footers on all pages
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      // Footer text
      const footerText = `GEO SCAN | Inteligência Territorial — Página ${i} de ${pageCount}`;
      doc.text(footerText, 14, 287);
      
      const watermarkText = "CONFIDENCIAL — MONITORAMENTO INTERNO";
      doc.text(watermarkText, 210 - 14 - doc.getTextWidth(watermarkText), 287);
    }

    // Save filename
    const dateFormatted = new Date().toISOString().split("T")[0];
    const cleanCandidate = candidateName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "_").toLowerCase();
    const cleanMun = filterMunicipio.replace(/\s+/g, "_").toLowerCase();
    const filename = `geoscan_relatorio_${cleanCandidate}_${cleanMun}_${dateFormatted}.pdf`;

    doc.save(filename);
  };

  return (
    <div className="space-y-6 select-none">
      
      {/* GLOBAL CAMPAIGN GOAL CARD & CONFIG BUTTON */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-900/40 border border-slate-800 rounded-xl p-6 relative overflow-hidden" id="card-global-goal">
        {/* Glow hint */}
        <div className="absolute top-[-50%] right-[-10%] w-[150px] h-[150px] bg-emerald-500/5 rounded-full blur-[40px] pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs bg-emerald-950/80 text-emerald-400 font-mono font-bold px-2.5 py-1 rounded tracking-widest border border-emerald-900/30">
                Pactuação Geral Unificada
              </span>
              <h2 className="text-sm md:text-base font-black text-white uppercase tracking-wider">
                Meta Global da Campanha
              </h2>
            </div>
            <p className="text-slate-300 text-xs md:text-sm leading-relaxed max-w-3xl">
              Compare a volumetria de votos nominais amparados por todos os eleitores estaduais do Amapá com a meta de consolidação geral de vitória definida para o candidato. Use o botão Configurar ao lado para estabelecer o alvo geral de votos.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-950 border border-slate-850 p-4 rounded-xl shrink-0">
            {/* View Only Global Goal */}
            <div className="flex items-center gap-5">
              <div className="text-right">
                <p className="text-[10px] text-slate-450 font-mono uppercase tracking-widest font-extrabold mb-0.5">Alvo de Vitória Acumulado</p>
                <p className="text-lg md:text-xl font-black text-emerald-400 font-mono">
                  {globalGoal} <span className="text-xs text-slate-400 font-sans font-normal">votos</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Cobertura Nominal Progress Bar */}
        <div className="mt-5 pt-4.5 border-t border-slate-850/60 space-y-2">
          <div className="flex justify-between items-baseline text-xs md:text-sm">
            <span className="text-slate-300 font-bold">🚀 Progresso Acumulado Estadual (Eleitores e Lideranças)</span>
            <span className="font-mono text-white">
              <strong className="text-emerald-400 font-black text-sm md:text-base">{totalStatewideSupportersVotes}</strong> <span className="text-slate-500 text-xs">de</span> <strong className="font-bold text-sm md:text-base">{globalGoal} v.</strong> ({globalProgressPct}%)
            </span>
          </div>

          <div className="relative w-full h-3 bg-slate-950 rounded-full border border-slate-850/60 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-blue-550 rounded-full transition-all duration-1000"
              style={{ width: `${Math.min(globalProgressPct, 100)}%` }}
            />
          </div>

          <div className="flex justify-between text-[11px] text-slate-400 font-mono uppercase font-bold">
            <span>Déficit para meta geral: <span className="text-white font-extrabold">{Math.max(0, globalGoal - totalStatewideSupportersVotes)}</span> apoios</span>
            <span className="text-emerald-400/95">Eficácia Absoluta do Estado</span>
          </div>
        </div>
      </div>

      {/* COORDINATOR WHATSAPP FOR FEEDBACK CARD */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-900/40 border border-slate-800 rounded-xl p-5 md:p-6 shadow-sm overflow-hidden" id="card-coordinator-whatsapp">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-xs bg-emerald-950/80 text-emerald-400 font-mono font-bold px-2.5 py-1 rounded tracking-widest border border-emerald-900/30 uppercase">
                Feedback de Homologação
              </span>
              <span className="text-xs bg-blue-950/80 text-blue-400 font-mono font-bold px-2.5 py-1 rounded tracking-widest border border-blue-900/30 uppercase">
                Integração WhatsApp
              </span>
            </div>
            <h3 className="text-sm md:text-base font-black text-white uppercase tracking-wider">
              WhatsApp da Coordenação Geral
            </h3>
            <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
              Defina o número de WhatsApp do Coordenador de Campanha. Quando os apoiadores executarem o auto-cadastro territorial a partir do link do líder, o sistema direcionará o comprovante de homologação com o link seguro de 1 clique diretamente para este número!
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl shrink-0 w-full md:w-auto">
            {isEditingCoordWhatsapp ? (
              <form onSubmit={(e) => { e.preventDefault(); handleSaveCoordWhatsapp(); }} className="flex flex-col sm:flex-row items-center gap-2">
                <div className="relative w-full sm:w-56">
                  <input
                    type="text"
                    className="w-full bg-slate-900 border border-slate-800 text-white text-sm font-mono font-bold rounded-lg p-2.5 outline-none focus:border-emerald-500 pl-3"
                    value={tempCoordWhatsapp}
                    onChange={handlePhoneInputChange}
                    placeholder="Ex: (96) 99123-4567"
                    maxLength={15}
                    autoFocus
                  />
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    type="submit"
                    className="flex-1 sm:flex-initial px-4 py-2.5 bg-emerald-500 hover:bg-emerald-450 text-slate-950 font-black rounded-lg text-xs transition cursor-pointer font-sans uppercase tracking-wider"
                  >
                    Salvar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingCoordWhatsapp(false);
                      setTempCoordWhatsapp(coordinatorWhatsapp || "");
                    }}
                    className="flex-1 sm:flex-initial px-4 py-2.5 bg-slate-800 text-slate-300 rounded-lg text-xs transition cursor-pointer font-sans uppercase tracking-wider"
                  >
                    Sair
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-950/50 border border-emerald-900/30 text-emerald-400 rounded-lg">
                    <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                    </svg>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-450 font-mono uppercase tracking-widest font-extrabold block">WhatsApp Registrado</span>
                    <strong className="text-sm md:text-base font-mono font-bold text-slate-200">
                      {coordinatorWhatsapp ? coordinatorWhatsapp : <span className="text-red-400 font-sans italic font-normal text-xs uppercase tracking-wide">⚠️ Nenhum cadastrado</span>}
                    </strong>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setTempCoordWhatsapp(coordinatorWhatsapp || "");
                    setIsEditingCoordWhatsapp(true);
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-805 hover:border-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-black uppercase transition tracking-wider cursor-pointer font-sans"
                >
                  {coordinatorWhatsapp ? "Alterar Número" : "Cadastrar Número"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* SECURITY / PASSWORD ALTERATION CARD */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-900/40 border border-slate-800 rounded-xl p-5 md:p-6 shadow-sm overflow-hidden" id="card-security-settings">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-xs bg-amber-950/80 text-amber-400 font-mono font-bold px-2.5 py-1 rounded tracking-widest border border-amber-900/30 uppercase">
                Segurança do Sistema
              </span>
              <span className="text-xs bg-slate-950 border border-slate-800 text-slate-400 font-mono font-bold px-2.5 py-1 rounded tracking-widest uppercase">
                Administrador
              </span>
            </div>
            <h3 className="text-sm md:text-base font-black text-white uppercase tracking-wider">
              Configurações de Credenciais do Administrador
            </h3>
            <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
              Altere a sua senha de acesso administrativo ao sistema GEO SCAN. Mantenha suas credenciais seguras para proteger as metas e dados de monitoramento da sua campanha eleitoral no Amapá.
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl shrink-0 w-full md:w-auto">
            {isEditingPassword ? (
              <form onSubmit={handleSavePassword} className="space-y-3 w-full sm:w-72">
                {passwordError && (
                  <p className="text-[10.5px] font-bold text-red-400 uppercase tracking-wide bg-red-950/20 p-2 rounded-lg border border-red-900/30 text-center">
                    ⚠️ {passwordError}
                  </p>
                )}
                {passwordSuccess && (
                  <p className="text-[10.5px] font-bold text-emerald-400 uppercase tracking-wide bg-emerald-950/20 p-2 rounded-lg border border-emerald-500/20 text-center">
                    🎉 {passwordSuccess}
                  </p>
                )}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-mono uppercase tracking-widest font-extrabold block">Nova Senha</label>
                  <input
                    type="password"
                    required
                    placeholder="Mínimo 6 caracteres"
                    value={newAdminPassword}
                    onChange={(e) => setNewAdminPassword(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-white text-xs font-mono rounded-lg p-2.5 outline-none focus:border-amber-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-mono uppercase tracking-widest font-extrabold block">Confirmar Nova Senha</label>
                  <input
                    type="password"
                    required
                    placeholder="Repita a senha"
                    value={confirmAdminPassword}
                    onChange={(e) => setConfirmAdminPassword(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-white text-xs font-mono rounded-lg p-2.5 outline-none focus:border-amber-500"
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    className="flex-1 px-3 py-2 bg-amber-500 hover:bg-amber-450 text-slate-950 font-black rounded-lg text-xs transition cursor-pointer uppercase tracking-wider"
                  >
                    Salvar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingPassword(false);
                      setNewAdminPassword("");
                      setConfirmAdminPassword("");
                      setPasswordError("");
                    }}
                    className="flex-1 px-3 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg text-xs transition cursor-pointer uppercase tracking-wider"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-950/40 border border-amber-900/30 text-amber-500 rounded-lg">
                    <KeyRound className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-450 font-mono uppercase tracking-widest font-extrabold block">Senha de Acesso</span>
                    <strong className="text-xs font-mono font-bold text-slate-300 uppercase">
                      ••••••••••••••••
                    </strong>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditingPassword(true)}
                  className="w-full sm:w-auto px-4 py-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-805 hover:border-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-black uppercase transition tracking-wider cursor-pointer font-sans"
                >
                  Alterar Senha
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* FILTER PANEL */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 md:p-6 shadow-sm" id="dashboard-filters">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-450">
              <Filter className="w-5 h-5 text-emerald-400" />
            </span>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-200">Isolamento Territorial</h3>
              <p className="text-xs text-slate-450">Selecione os filtros em cascata para isolar os dados do monitoramento</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            {/* MUNICIPIO FILTER */}
            <div className="flex flex-col gap-1.5 w-full sm:w-56">
              <span className="text-xs uppercase font-extrabold text-slate-400 font-mono">Filtrar por Município</span>
              <select
                id="filter-select-municipio"
                value={filterMunicipio}
                onChange={handleMunicipioFilterChange}
                className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 rounded-lg px-3.5 py-2.5 text-sm font-bold text-white outline-none transition cursor-pointer"
              >
                <option value="ALL">📍 Todos os Municípios</option>
                {municipios.map((m) => (
                  <option key={m.nome} value={m.nome}>
                    {m.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* LIDERANCA FILTER */}
            <div className="flex flex-col gap-1.5 w-full sm:w-64">
              <span className="text-xs uppercase font-extrabold text-slate-400 font-mono">Filtrar por Apoiador</span>
              <select
                id="filter-select-lider"
                value={filterLider}
                onChange={(e) => setFilterLider(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 rounded-lg px-3.5 py-2.5 text-sm font-bold text-white outline-none transition cursor-pointer"
              >
                <option value="ALL">👤 Todos os Apoiadores</option>
                {availableLeadersInFilter.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.nome} ({l.bairro})
                  </option>
                ))}
              </select>
            </div>

            {/* BUTTON EXPORT PDF */}
            <div className="flex flex-col gap-1.5 w-full sm:w-auto justify-end">
              <span className="text-xs uppercase font-extrabold text-slate-400 font-mono opacity-0 select-none hidden sm:inline">Relatório</span>
              <button
                type="button"
                onClick={handleExportPDF}
                className="w-full sm:w-auto bg-slate-950 hover:bg-slate-850 hover:text-emerald-400 border border-slate-800 hover:border-emerald-500/30 text-emerald-500 font-black px-4 py-2.5 h-[42px] rounded-lg text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2"
                title="Exportar Relatório PDF com Base no Isomento Territorial Atual"
              >
                <FileDown className="w-4 h-4" />
                <span>Exportar PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* THREE REQUIRED CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5" id="dashboard-metrics-summary">
        
        {/* CARD 1: META DO APOIADOR */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 md:p-8 relative overflow-hidden" id="metric-card-meta-macro">
          <div className="absolute right-3 top-3 opacity-10">
            <Target className="w-14 h-14 text-emerald-450" />
          </div>
          <p className="text-xs uppercase font-mono tracking-widest font-extrabold text-slate-400 mb-1">
            Meta do Apoiador
          </p>
          <div className="flex items-baseline gap-2.5 mt-3">
            <span className="text-4xl md:text-5xl font-black text-white font-mono">{metrics.metaLiderTotal}</span>
            <span className="text-xs md:text-sm text-slate-400 font-bold block">votos pactuados (Macro)</span>
          </div>
          <p className="text-xs text-slate-300 mt-4 pt-3 border-t border-slate-800/60 leading-relaxed">
            Metas macros estabelecidas pelos apoiadores sob filtro corrente. Representa o alvo contratado para compromisso de votos.
          </p>
        </div>

        {/* CARD 2: VOTOS GARANTIDOS PELOS ELEITORES */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 md:p-8 relative overflow-hidden" id="metric-card-meta-micro">
          <div className="absolute right-3 top-3 opacity-10">
            <Users className="w-14 h-14 text-blue-400" />
          </div>
          <p className="text-xs uppercase font-mono tracking-widest font-extrabold text-slate-400 mb-1">
            Votos Garantidos (Eleitores e Apoiadores)
          </p>
          <div className="flex items-baseline gap-2.5 mt-3">
            <span className="text-4xl md:text-5xl font-black text-slate-100 font-mono">{metrics.votosGantidosTotal}</span>
            <span className="text-xs md:text-sm text-slate-400 font-bold block">eleitores nominais</span>
          </div>
          <p className="text-xs text-slate-300 mt-4 pt-3 border-t border-slate-800/60 leading-relaxed">
            Somatório de compromissos individuais garantidos nominalmente por cada eleitor e apoiador cadastrado sob filtros selecionados.
          </p>
        </div>

        {/* CARD 3: PROGRESSO DA META */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 md:p-8 relative overflow-hidden" id="metric-card-percentage-progress">
          <div className="absolute right-3 top-3 opacity-10">
            <TrendingUp className="w-14 h-14 text-teal-400" />
          </div>
          <p className="text-xs uppercase font-mono tracking-widest font-extrabold text-slate-400 mb-1">
            Progresso da Meta
          </p>
          
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-4xl md:text-5xl font-black text-teal-400 font-mono">
              {metrics.progressoMetaPct}%
            </span>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Alcançado</span>
          </div>

          {/* Progress bar */}
          <div className="mt-5 w-full bg-slate-950 rounded-full h-3.5 p-1 border border-slate-905">
            <div
              className={`h-1.5 rounded-full transition-all duration-700 ${
                metrics.progressoMetaPct >= 100
                  ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                  : metrics.progressoMetaPct >= 75
                  ? "bg-gradient-to-r from-blue-500 to-teal-400"
                  : metrics.progressoMetaPct >= 50
                  ? "bg-gradient-to-r from-amber-500 to-blue-400"
                  : "bg-red-500"
              }`}
              style={{ width: `${Math.min(metrics.progressoMetaPct, 100)}%` }}
            ></div>
          </div>

          <div className="mt-4 pt-2.5 flex items-center justify-between text-xs text-slate-400 font-bold uppercase font-mono">
            <span>Déficit: <span className="text-slate-100 font-bold">{Math.max(0, metrics.metaLiderTotal - metrics.votosGantidosTotal)}</span> apoios</span>
            <span className="text-emerald-400/90 text-[10px]">EFICÁCIA</span>
          </div>
        </div>

      </div>

      {/* METRIC ANALYSIS/Praise Alert */}
      {metrics.metaLiderTotal > 0 && (
        <div className={`p-4 border rounded-xl text-sm flex items-center gap-3 font-bold transition duration-200 ${progressStatusMessage.bg} ${progressStatusMessage.color}`} id="dashboard-status-alert">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span>{progressStatusMessage.text}</span>
        </div>
      )}

      {/* BOTTOM BREAKDOWNS CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* NEIGHBORHOOD BARS (lg:col-span-6) */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-5 md:p-6" id="breakdown-by-bairros">
          <h4 className="text-sm font-black text-white uppercase tracking-wider mb-5 flex items-center gap-2 border-b border-slate-800 pb-3">
            <MapPin className="w-5 h-5 text-emerald-400" />
            Votos por Bairro do Amapá
          </h4>

          {neighborhoodBreakdown.length === 0 ? (
            <p className="text-sm text-slate-500 py-12 text-center font-bold">Nenhum eleitor cadastrado com os filtros correntes.</p>
          ) : (
            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
              {neighborhoodBreakdown.map((item, idx) => {
                const achievedPct = item.metaSum > 0 
                  ? (item.commitmentSum / item.metaSum) * 100 
                  : (item.commitmentSum > 0 ? 100 : 0);
                  
                const visualPct = Math.min(achievedPct, 100);

                return (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between items-end text-sm font-bold">
                      <div className="flex flex-col gap-0.5">
                         <span className="text-slate-100 font-sans">{item.bairro}</span>
                         <span className="text-[10px] text-slate-500 font-mono tracking-wider">
                           META: {item.metaSum} VOTOS
                         </span>
                      </div>
                      <div className="flex items-center gap-2.5 text-slate-400 font-mono">
                        <span className="text-xs bg-slate-950 px-2 rounded border border-slate-850 text-slate-300">
                           {item.supportersCount} {item.supportersCount === 1 ? "eleitor" : "eleitores"}
                         </span>
                         <strong className="text-emerald-450 text-sm font-black">{item.commitmentSum} v.</strong>
                         <span className={`text-xs px-2 py-0.5 rounded-md font-black min-w-[50px] text-center ${
                           visualPct < 25 ? "bg-amber-100/10 text-amber-200" : 
                           visualPct < 50 ? "bg-amber-400/10 text-amber-400" : 
                           visualPct < 80 ? "bg-lime-400/10 text-lime-400" :
                           "bg-emerald-500/10 text-emerald-400"
                         }`}>
                           {achievedPct.toFixed(1)}%
                         </span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          visualPct < 25 ? "bg-amber-200" : 
                          visualPct < 50 ? "bg-amber-400" : 
                          visualPct < 80 ? "bg-lime-400" :
                          visualPct < 100 ? "bg-green-400" :
                          "bg-gradient-to-r from-emerald-500 to-teal-400"
                        }`}
                        style={{ width: `${visualPct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* MUNICIPALITY BARS (lg:col-span-6) */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-5 md:p-6" id="breakdown-by-municipios">
          <h4 className="text-sm font-black text-white uppercase tracking-wider mb-5 flex items-center gap-2 border-b border-slate-800 pb-3">
            <Landmark className="w-5 h-5 text-blue-400" />
            Votos por Município (Meta Individualizada)
          </h4>

          {municipalityBreakdown.length === 0 ? (
            <p className="text-sm text-slate-500 py-12 text-center font-bold">Nenhum eleitor cadastrado com os filtros correntes.</p>
          ) : (
            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
              {municipalityBreakdown.map((item, idx) => {
                const achievedPct = item.metaSum > 0 
                  ? (item.commitmentSum / item.metaSum) * 100 
                  : (item.commitmentSum > 0 ? 100 : 0);
                  
                const visualPct = Math.min(achievedPct, 100);

                return (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between items-end text-sm font-bold">
                      <div className="flex flex-col gap-0.5">
                         <span className="text-slate-100 font-sans">{item.municipio}</span>
                         <span className="text-[10px] text-slate-500 font-mono tracking-wider">
                           META: {item.metaSum} VOTOS
                         </span>
                      </div>
                      <div className="flex items-center gap-2.5 text-slate-400 font-mono">
                        <span className="text-xs bg-slate-950 px-2 rounded border border-slate-850 text-slate-300">
                           {item.supportersCount} {item.supportersCount === 1 ? "eleitor" : "eleitores"}
                         </span>
                         <strong className="text-emerald-450 text-sm font-black">{item.commitmentSum} v.</strong>
                         <span className={`text-xs px-2 py-0.5 rounded-md font-black min-w-[50px] text-center ${
                           visualPct < 25 ? "bg-amber-100/10 text-amber-200" : 
                           visualPct < 50 ? "bg-amber-400/10 text-amber-400" : 
                           visualPct < 80 ? "bg-lime-400/10 text-lime-400" :
                           "bg-emerald-500/10 text-emerald-400"
                         }`}>
                           {achievedPct.toFixed(1)}%
                         </span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          visualPct < 25 ? "bg-amber-200" : 
                          visualPct < 50 ? "bg-amber-400" : 
                          visualPct < 80 ? "bg-lime-400" :
                          visualPct < 100 ? "bg-green-400" :
                          "bg-gradient-to-r from-emerald-500 to-teal-400"
                        }`}
                        style={{ width: `${visualPct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6">
        <CascadingHierarchyList
          coordenadoresRegionais={coordenadoresRegionais || []}
          liderancas={metrics.activeLeaders}
          eleitores={metrics.activeEleitores}
        />
      </div>

    </div>
  );
}
