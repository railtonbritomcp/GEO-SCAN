import React, { useState } from "react";
import { CoordenadorRegional, Lideranca, Eleitor } from "../types";
import { ChevronDown, ChevronRight, ShieldPlus, Component, Users, FileText } from "lucide-react";

interface CascadingHierarchyListProps {
  coordenadoresRegionais: CoordenadorRegional[];
  liderancas: Lideranca[];
  eleitores: Eleitor[];
}

export default function CascadingHierarchyList({
  coordenadoresRegionais,
  liderancas,
  eleitores,
}: CascadingHierarchyListProps) {
  const [expandedCoords, setExpandedCoords] = useState<Record<string, boolean>>({});
  const [expandedLiders, setExpandedLiders] = useState<Record<string, boolean>>({});

  const toggleCoord = (id: string) => setExpandedCoords((prev) => ({ ...prev, [id]: !prev[id] }));
  const toggleLider = (id: string) => setExpandedLiders((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 md:p-6 mb-6">
      <h4 className="text-sm font-black text-white uppercase tracking-wider mb-5 border-b border-slate-800 pb-3 flex items-center gap-2">
        <ShieldPlus className="w-5 h-5 text-amber-500" />
        Visão Estrutural Aglutinada (Cascata)
      </h4>

      {coordenadoresRegionais.length === 0 ? (
        <p className="text-sm text-slate-500 py-12 text-center font-bold">Nenhuma liderança focal encontrada.</p>
      ) : (
        <div className="space-y-3">
          {coordenadoresRegionais.map((coord) => {
            const coordLiderancas = liderancas.filter((l) => l.coordenadorRegionalId === coord.id);
            const isExpandedCoord = expandedCoords[coord.id];

            return (
              <div key={coord.id} className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950/30">
                {/* COORDENADOR HEADER */}
                <button
                  onClick={() => toggleCoord(coord.id)}
                  className="w-full flex items-center justify-between p-3.5 bg-slate-900 hover:bg-slate-850 transition text-left cursor-pointer border-b border-slate-800/50"
                  aria-expanded={isExpandedCoord}
                >
                  <div className="flex items-center gap-3">
                    {isExpandedCoord ? <ChevronDown className="w-4 h-4 text-amber-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono px-2 py-0.5 bg-amber-950/40 text-amber-500 border border-amber-900/30 rounded uppercase font-bold tracking-wider">
                          Lid. Focal
                        </span>
                        <span className="font-black text-slate-100 text-sm">{coord.nome}</span>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-400 mt-0.5 block ml-0.5">
                        📍 {coord.municipio} {coord.telefone ? `• 📞 ${coord.telefone}` : ""}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="text-xs font-bold font-mono text-slate-500 px-2 py-1 bg-slate-950 rounded">
                      {coordLiderancas.length} Apoiadores
                    </span>
                    {coord.metaVotos && coord.metaVotos > 0 && (
                      <span className="text-[10px] font-black font-mono text-amber-500 bg-amber-950/20 px-2 py-0.5 rounded border border-amber-900/10 uppercase tracking-tighter">
                        Meta: {coord.metaVotos}
                      </span>
                    )}
                  </div>
                </button>

                {/* APOIADORES NESTED */}
                {isExpandedCoord && (
                  <div className="bg-slate-950/60 p-2 md:pl-6 space-y-2 border-l-2 border-slate-800 border-l-amber-900/30">
                    {coordLiderancas.length === 0 ? (
                      <p className="text-xs text-slate-500 py-3 pl-4 font-bold">Nenhum apoiador associado.</p>
                    ) : (
                      coordLiderancas.map((lid) => {
                        const liderEleitores = eleitores.filter((e) => e.liderancaId === lid.id);
                        const isExpandedLider = expandedLiders[lid.id];

                        return (
                          <div key={lid.id} className="border border-slate-800/80 rounded-lg overflow-hidden">
                            {/* APOIADOR HEADER */}
                            <button
                              onClick={() => toggleLider(lid.id)}
                              className="w-full flex items-center justify-between p-3 bg-slate-900/60 hover:bg-slate-850/80 transition text-left cursor-pointer border-b border-slate-800/30"
                              aria-expanded={isExpandedLider}
                            >
                              <div className="flex items-center gap-3">
                                {isExpandedLider ? <ChevronDown className="w-3.5 h-3.5 text-emerald-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-mono px-1.5 py-0.5 bg-emerald-950/40 text-emerald-400 border border-emerald-900/30 rounded uppercase font-bold tracking-wider">
                                      Apoiador
                                    </span>
                                    <span className="font-bold text-slate-200 text-sm">{lid.nome}</span>
                                  </div>
                                  <span className="text-[11px] text-slate-450 mt-0.5 block ml-0.5">
                                    {lid.bairro} ({lid.municipio})
                                  </span>
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-1.5">
                                <span className="text-xs font-bold font-mono text-slate-500 px-2 py-1 bg-slate-950 rounded">
                                  {liderEleitores.length} Eleitores
                                </span>
                                {lid.metaMacro > 0 && (
                                  <span className="text-[9px] font-black font-mono text-emerald-500 bg-emerald-950/20 px-1.5 py-0.5 rounded border border-emerald-900/10 uppercase tracking-tighter">
                                    Meta: {lid.metaMacro}
                                  </span>
                                )}
                              </div>
                            </button>

                            {/* ELEITORES NESTED */}
                            {isExpandedLider && (
                              <div className="bg-slate-950/80 p-2 md:pl-6 space-y-1.5 border-l-2 border-slate-800/30 border-blue-900/10">
                                {liderEleitores.length === 0 ? (
                                  <p className="text-[10px] text-slate-600 py-2 pl-4 font-bold">Nenhum eleitor mapeado.</p>
                                ) : (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-1">
                                    {liderEleitores.map((el) => (
                                      <div key={el.id} className="flex items-center justify-between bg-slate-900/50 p-2 rounded border border-slate-800/40">
                                        <div className="flex items-center gap-2">
                                          <FileText className="w-3 h-3 text-pink-500/80" />
                                          <span className="text-[11px] font-medium text-slate-300">{el.nome}</span>
                                        </div>
                                        {el.zonaEleitoral && (
                                          <span className="text-[9px] bg-slate-950 px-1.5 py-0.5 rounded font-mono text-slate-500 border border-slate-800">
                                            {el.zonaEleitoral}
                                          </span>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
