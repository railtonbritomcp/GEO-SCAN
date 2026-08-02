import React, { useState } from "react";
import { ShieldPlus, MapPin, Edit2, Share2, PlusCircle, Search } from "lucide-react";
import { CoordenadorRegional, Lideranca } from "../types";

interface CoordenadoresListProps {
  coordenadoresRegionais: CoordenadorRegional[];
  liderancas: Lideranca[];
  onDeleteCoordenador?: (id: string) => void;
  onStartEditCoord: (coord: CoordenadorRegional) => void;
  onShareCoord: (coord: CoordenadorRegional) => void;
  onAddApoiadorManual?: (coord: CoordenadorRegional) => void;
}

export default function CoordenadoresList({
  coordenadoresRegionais,
  liderancas,
  onDeleteCoordenador,
  onStartEditCoord,
  onShareCoord,
  onAddApoiadorManual,
}: CoordenadoresListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCoordenadores = coordenadoresRegionais.filter((c) =>
    c.nome.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5" id="card-coordenadores-registrados">
      <div className="flex flex-col gap-2 mb-4 pb-3 border-b border-slate-800">
        <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
          <ShieldPlus className="w-5 h-5 text-amber-400" />
          Lideranças Focais Ativas ({coordenadoresRegionais.length})
        </h4>
        <p className="text-xs text-slate-400 leading-relaxed">
          Lideranças territoriais de primeiro escalão. Eles gerenciam os apoiadores eleitorais na comunidade.
        </p>
      </div>

      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-slate-500" />
        </div>
        <input
          type="text"
          placeholder="Pesquisar liderança focal por nome..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-950 border border-slate-850 focus:border-amber-500/50 rounded-lg pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-600 outline-none transition"
        />
      </div>

      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
        {filteredCoordenadores.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-10 font-bold">
            {searchQuery ? "Nenhum resultado encontrado para sua pesquisa." : "Nenhuma liderança focal cadastrada."}
          </p>
        ) : (
          filteredCoordenadores.map((coord) => {
            const associatedLidCount = liderancas.filter((l) => l.coordenadorRegionalId === coord.id).length;
            return (
              <div
                key={coord.id}
                className="bg-slate-950 border border-slate-850/80 rounded-xl p-4 hover:border-slate-800 transition flex flex-col gap-3 relative group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-sm font-black text-slate-100">{coord.nome}</p>
                      <button
                        type="button"
                        onClick={() => onStartEditCoord(coord)}
                        className="bg-slate-900 border border-slate-800 p-1 rounded-md text-slate-400 hover:text-amber-400 hover:border-amber-500/30 transition cursor-pointer"
                        title="Corrigir dados cadastrais da liderança"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 font-bold flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-500/40" />
                      <span>{coord.bairro ? `${coord.bairro}, ${coord.municipio}` : coord.municipio}</span>
                    </p>
                    {coord.telefone && (
                      <p className="text-xs text-slate-400 font-mono mt-1 bg-slate-900/50 py-0.5 px-2 rounded w-fit">{coord.telefone}</p>
                    )}
                    {coord.metaVotos && coord.metaVotos > 0 ? (
                      <p className="text-[11px] text-amber-500 font-bold mt-1.5 flex items-center gap-1 uppercase tracking-wider">
                        ➤ Meta Territorial: <span className="text-amber-400 font-mono">{coord.metaVotos} votos</span>
                      </p>
                    ) : null}
                  </div>
                  <span className="text-[10.5px] font-mono text-amber-300 font-bold bg-amber-950/50 px-2.5 py-1 px-2 border border-amber-950 rounded">
                    {associatedLidCount} apoiador(es)
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => onShareCoord(coord)}
                    className="bg-amber-950/40 border border-amber-500/20 px-3 py-1.5 rounded-lg text-amber-400 font-bold hover:bg-amber-950/60 transition cursor-pointer flex items-center justify-center text-[9.5px] uppercase tracking-wider"
                  >
                    <Share2 className="w-3 h-3 mr-1.5" />
                    AutoCadastro
                  </button>
                  {onAddApoiadorManual && (
                    <button
                      type="button"
                      onClick={() => onAddApoiadorManual(coord)}
                      className="bg-emerald-950/40 border border-emerald-500/20 px-3 py-1.5 rounded-lg text-emerald-400 font-bold hover:bg-emerald-950/60 transition cursor-pointer flex items-center justify-center text-[9.5px] uppercase tracking-wider"
                    >
                      <PlusCircle className="w-3 h-3 mr-1.5" />
                      Manualmente
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-slate-900/80 pt-3 mt-1 text-xs">
                  <span className="text-slate-500 text-[10px] uppercase font-mono">DADOS CONSOLIDADOS</span>
                  {onDeleteCoordenador && (
                    <button
                      onClick={() => onDeleteCoordenador(coord.id)}
                      className="text-[10px] text-red-450 hover:text-red-300 transition font-bold"
                    >
                      Remover Liderança
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
