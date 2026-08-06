import React from "react";
import { CandidateInfo } from "../types";
import {
  Layers,
  LayoutDashboard,
  Users,
  LogOut,
  Menu,
  X,
  UserCheck,
  Award,
  BookOpen
} from "lucide-react";

interface SidebarProps {
  activeTab: "cadastros" | "dashboard";
  setActiveTab: (tab: "cadastros" | "dashboard") => void;
  candidateInfo: CandidateInfo | null;
  onDeactivate: () => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  candidateInfo,
  onDeactivate,
  isMobileOpen,
  setIsMobileOpen
}: SidebarProps) {
  // Navigation tabs
  const items = [
    {
      id: "cadastros" as const,
      label: "Cadastros",
      description: "Coordenadores e Lideranças",
      icon: Users,
    },
    {
      id: "dashboard" as const,
      label: "Dashboard",
      description: "Painel Visual & Indicadores",
      icon: LayoutDashboard,
    }
  ];

  return (
    <>
      {/* MOBILE HEADER BAR - ONLY VISIBLE ON MOBILE BAR */}
      <header className="lg:hidden h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 fixed top-0 left-0 right-0 z-35 select-none">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-gradient-to-tr from-emerald-600 to-teal-500 rounded-lg text-slate-950 font-bold">
            <Layers className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-white text-base tracking-tight">GEO SCAN</span>
          <span className="text-[9px] bg-emerald-950 border border-emerald-500/30 text-emerald-400 px-1.5 py-0.5 rounded-full font-mono uppercase font-bold">
            AP
          </span>
        </div>

        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 text-slate-350 hover:text-white hover:bg-slate-800 rounded-lg transition"
          id="btn-mobile-hamburger"
        >
          {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* MOBILE DRAWER OVERLAY */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* CORE SIDEBAR MODULE (Desktop sticky sidebar & Mobile Offcanvas Drawer) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 bg-slate-900 border-r border-slate-850 flex flex-col z-40 w-72 transition-transform duration-300 ease-in-out lg:translate-x-0 select-none overflow-y-auto scrollbar-none ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        } lg:sticky lg:h-screen`}
      >
        {/* LOGO & TITLE */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-850/80">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-tr from-emerald-600 to-teal-500 rounded-lg text-slate-950 font-bold shadow-sm shadow-emerald-500/5">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <span className="font-black text-white text-lg tracking-tight block">GEO SCAN</span>
              <span className="text-xs text-slate-400 font-mono tracking-wider block uppercase">Inteligência Territorial</span>
            </div>
          </div>

          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ACTIVE LICENSED CANDIDATE BAR */}
        {candidateInfo && (
          <div className="m-4 p-5 bg-slate-950/80 border border-slate-850 rounded-xl relative overflow-hidden">
            {/* Tiny AP Flag Accent Colors */}
            <div className="absolute top-0 left-0 right-0 h-[2px] flex">
              <div className="w-1/3 h-full bg-emerald-500"></div>
              <div className="w-1/3 h-full bg-amber-500"></div>
              <div className="w-1/3 h-full bg-blue-500"></div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-slate-900 rounded-lg mt-0.5 border border-slate-800">
                <UserCheck className="w-5 h-5 text-emerald-450" />
              </div>
              <div className="overflow-hidden min-w-0">
                <p className="text-[9px] text-slate-500 uppercase tracking-widest font-black mb-0.5">Gestão de Dados</p>
                <p className="text-xs font-bold text-slate-300 truncate mb-1.5">{candidateInfo.adminCoordinatorName || "Não Informado"}</p>
                
                <p className="text-[9px] text-slate-500 uppercase tracking-widest font-black mb-0.5">Candidato(a)</p>
                <p className="text-sm font-black text-white truncate leading-tight">{candidateInfo.candidateName || "Não Informado"}</p>
                
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] font-mono text-amber-400 font-bold shrink-0 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/20">
                    Nº {candidateInfo.ballotNumber || "---"}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* NAVIGATION MENUS */}
        <nav className="flex-1 px-4 py-4 space-y-2">
          {items.map((tab) => {
            const IconComponent = tab.icon;
            const isTabActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                id={`sidebar-link-${tab.id}`}
                onClick={() => {
                  setActiveTab(tab.id);
                  setIsMobileOpen(false); // Close mobile drawer on selection
                }}
                className={`w-full flex items-center space-x-3.5 px-4 py-3.5 rounded-xl text-left transition relative cursor-pointer ${
                  isTabActive
                    ? "bg-gradient-to-r from-emerald-600/10 to-teal-600/5 text-emerald-350 border-l-4 border-emerald-500 block font-bold"
                    : "text-slate-400 hover:bg-slate-850 hover:text-slate-200"
                }`}
              >
                <IconComponent className={`w-5 h-5 shrink-0 ${isTabActive ? "text-emerald-450" : "text-slate-555"}`} />
                <div>
                  <span className="text-sm tracking-widest block font-bold uppercase">{tab.label}</span>
                  <span className="text-xs text-slate-400 truncate block font-medium max-w-[170px] mt-0.5">{tab.description}</span>
                </div>
              </button>
            );
          })}
        </nav>

        {/* SYSTEM STATS OR LOCAL LEGEND */}
        <div className="px-6 py-5 border-t border-slate-850 bg-slate-950/20 text-xs text-slate-400 leading-relaxed font-mono space-y-2" id="sidebar-legend">
          <div className="flex justify-between items-center text-slate-350">
            <span className="font-bold">CONEXÃO</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
              SINC AP
            </span>
          </div>
          <p>ESTADO: Amapá (AP)</p>
          <p>MÉTODO: Filtros Isolados</p>
        </div>

        {/* DISMISS / LICENSE DEACTIVATION ACTION */}
        <div className="p-4 border-t border-slate-850 bg-slate-950/40">
          <button
            onClick={onDeactivate}
            id="btn-deactivate-license"
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-slate-900 border border-slate-800 hover:border-red-500/30 hover:bg-red-950/20 text-slate-350 hover:text-red-400 text-sm font-bold rounded-xl transition cursor-pointer"
          >
            <LogOut className="w-4.5 h-4.5 shrink-0 text-slate-400 hover:text-red-400" />
            <span>Sair do Sistema</span>
          </button>
        </div>

        {/* Rar_b CODING CREDITS LOGO */}
        <RarbCodingLogo />
      </aside>
    </>
  );
}

const RarbCodingLogo = () => (
  <div className="flex flex-col items-center opacity-50 hover:opacity-100 transition-opacity pb-8 mt-4 mb-4">
    <div className="flex items-center space-x-3 group transform scale-75 origin-top">
      <svg className="w-12 h-12 transition-transform duration-300 group-hover:scale-105" viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 12 L10 88 L52 88 C72 88 84 74 84 50 C84 26 72 12 52 12 Z" fill="none" stroke="#FFFFFF" strokeWidth="6" strokeLinejoin="round" />
        <path d="M17 42 C12 42 12 49 8 50 C12 51 12 58 17 58" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
        <path d="M30 64 L30 36 L54 36 C64 36 68 42 68 49 C68 56 61 60 52 60 L30 60" fill="none" stroke="#00F2FE" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M48 58 L72 90 L108 34" fill="none" stroke="#00F2FE" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        <polygon points="108,24 94,40 116,44" fill="#FFFFFF" />
      </svg>
      <div className="flex flex-col text-left">
        <span className="text-[9px] text-white/80 uppercase tracking-[0.3em] mb-0.5">Desenvolvido por</span>
        <span className="text-xl font-extrabold tracking-wider font-mono text-white leading-none">
          Rar<span className="text-[#00F2FE]">b</span><span className="relative inline-block border-b-2 border-[#00F2FE] pb-0.5">_CODING</span>
        </span>
        <span className="text-[8px] tracking-[0.25em] uppercase text-gray-400 font-mono font-bold mt-1">Software Development</span>
      </div>
    </div>
  </div>
);

