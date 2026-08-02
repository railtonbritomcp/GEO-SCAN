import React, { useState } from "react";
import { PlusCircle, ShieldPlus, CheckCircle2 } from "lucide-react";
import { MunicipioDefinition, CoordenadorRegional } from "../types";

interface CoordenadoresFormProps {
  municipios: MunicipioDefinition[];
  onAddCoordenador: (coord: Omit<CoordenadorRegional, "id" | "createdAt">) => void;
}

export default function CoordenadoresForm({
  municipios,
  onAddCoordenador,
}: CoordenadoresFormProps) {
  const [coordNome, setCoordNome] = useState("");
  const [coordMunicipio, setCoordMunicipio] = useState("Macapá");
  const [coordBairro, setCoordBairro] = useState("");
  const [writeBairroMode, setWriteBairroMode] = useState(false);
  const [coordTelefone, setCoordTelefone] = useState("");
  const [coordMetaVotos, setCoordMetaVotos] = useState<number>(0);
  const [coordSuccess, setCoordSuccess] = useState(false);

  // Initialize first bairro on mount or when default Macapá is set
  React.useEffect(() => {
    const munic = municipios.find((m) => m.nome === coordMunicipio);
    if (munic && munic.bairros.length > 0 && !coordBairro) {
      setCoordBairro(munic.bairros[0]);
    }
  }, [municipios, coordMunicipio, coordBairro]);

  const bairrosList = React.useMemo(() => {
    const munic = municipios.find((m) => m.nome === coordMunicipio);
    return munic ? munic.bairros : [];
  }, [coordMunicipio, municipios]);

  const handleMunicipioChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setCoordMunicipio(value);
    const munic = municipios.find((m) => m.nome === value);
    if (munic && munic.bairros.length > 0) {
      setCoordBairro(munic.bairros[0]);
    } else {
      setCoordBairro("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!coordNome.trim()) return;

    onAddCoordenador({
      nome: coordNome.trim(),
      municipio: coordMunicipio,
      bairro: coordBairro.trim() || undefined,
      telefone: coordTelefone.trim() || undefined,
      metaVotos: coordMetaVotos > 0 ? coordMetaVotos : undefined,
    });

    setCoordNome("");
    setCoordTelefone("");
    setCoordMetaVotos(0);
    setCoordSuccess(true);
    setTimeout(() => setCoordSuccess(false), 3000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 md:p-8 relative" id="card-registrar-coordenador">
      <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <span className="p-2 bg-amber-950/60 text-amber-400 rounded-lg border border-amber-500/20">
            <ShieldPlus className="w-6 h-6" />
          </span>
          <div>
            <h3 className="font-extrabold text-white text-base md:text-lg">Cadastrar Liderança Focal</h3>
            <p className="text-xs text-slate-400">Etapa 1: Territorial - Líder principal por município</p>
          </div>
        </div>
        {coordSuccess && (
          <span className="text-sm text-amber-450 bg-amber-955/60 border border-amber-500/30 px-3.5 py-1.5 rounded-full flex items-center gap-1.5 animate-bounce font-bold select-none">
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
            Liderança Salva!
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Nome */}
          <div className="space-y-1.5">
            <label className="text-sm text-slate-300 font-extrabold flex items-center gap-1">
              <span>Nome da Liderança Focal</span>
              <span className="text-red-500">*</span>
            </label>
            <input
              id="coord-input-nome"
              type="text"
              required
              placeholder="Ex: Alberto Góes"
              value={coordNome}
              onChange={(e) => setCoordNome(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg p-3.5 text-sm text-white placeholder-slate-650 outline-none transition"
            />
          </div>

          {/* Telefone */}
          <div className="space-y-1.5">
            <label className="text-sm text-slate-300 font-extrabold flex items-center gap-1">
              <span>WhatsApp / Telefone</span>
              <span className="text-slate-550 font-normal">(Opcional)</span>
            </label>
            <input
              id="coord-input-tel"
              type="text"
              placeholder="Ex: (96) 99112-3344"
              value={coordTelefone}
              onChange={(e) => setCoordTelefone(e.target.value)}
              className="w-full bg-slate-950 border border-slate-850 focus:border-amber-500 rounded-lg p-3.5 text-sm text-white placeholder-slate-650 outline-none transition font-mono"
            />
          </div>

          {/* Município */}
          <div className="space-y-1.5 md:col-span-1">
            <label className="text-sm text-slate-300 font-extrabold">Município Responsável</label>
            <select
              id="coord-select-municipio"
              value={coordMunicipio}
              onChange={handleMunicipioChange}
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg p-3.5 text-sm text-white outline-none transition cursor-pointer font-bold"
            >
              {municipios.map((m) => (
                <option key={m.nome} value={m.nome}>
                  {m.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Bairro Cascata */}
          <div className="space-y-1.5 md:col-span-1">
            <div className="flex items-center justify-between">
              <label className="text-sm text-slate-300 font-extrabold flex items-center gap-1">
                <span>Bairro</span>
                <span className="text-slate-550 font-normal">(Opcional)</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  setWriteBairroMode(!writeBairroMode);
                  if (!writeBairroMode) {
                    setCoordBairro("");
                  } else if (bairrosList.length > 0) {
                    setCoordBairro(bairrosList[0]);
                  }
                }}
                className="text-[11px] text-amber-500 font-extrabold hover:text-amber-450 transition cursor-pointer uppercase tracking-wider"
              >
                {writeBairroMode ? "⚡ Selecionar Lista" : "✍️ Escrever Bairro"}
              </button>
            </div>
            {writeBairroMode ? (
              <input
                id="coord-input-bairro-escrever"
                type="text"
                placeholder="Digite o nome do bairro"
                value={coordBairro}
                onChange={(e) => setCoordBairro(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg p-3.5 text-sm text-white placeholder-slate-650 outline-none transition font-semibold"
              />
            ) : (
              <select
                id="coord-select-bairro"
                value={coordBairro}
                onChange={(e) => setCoordBairro(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg p-3.5 text-sm text-white outline-none transition cursor-pointer"
              >
                {bairrosList.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Meta de Votos */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-sm text-slate-300 font-extrabold flex items-center gap-1">
              <span>Meta de Votos (Macro Territory)</span>
              <span className="text-slate-550 font-normal">(Opcional)</span>
            </label>
            <input
              id="coord-input-meta"
              type="number"
              min={0}
              placeholder="Ex: 5000"
              value={coordMetaVotos || ""}
              onChange={(e) => setCoordMetaVotos(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-850 focus:border-amber-500 rounded-lg p-3.5 text-sm text-amber-400 placeholder-slate-650 outline-none transition font-mono font-bold"
            />
          </div>
        </div>

        <button
          id="coord-submit-btn"
          type="submit"
          className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-4 px-5 rounded-lg text-sm flex items-center justify-center gap-2 transition cursor-pointer active:scale-98 shadow-md shadow-amber-500/10"
        >
          <PlusCircle className="w-5 h-5 animate-pulse" />
          Salvar Liderança Focal
        </button>
      </form>
    </div>
  );
}
