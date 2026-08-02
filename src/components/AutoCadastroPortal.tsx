import React, { useState, useMemo } from "react";
import { User, Phone, MapPin, Award, CheckCircle2, ChevronRight, Send, Copy, Sparkles, Map, Briefcase } from "lucide-react";
import { AMAPA_MUNICIPIOS } from "../data/mockData";

interface AutoCadastroPortalProps {
  coordId: string;
  coordNome: string;
  municipio: string;
  coordWhatsapp?: string;
}

export default function AutoCadastroPortal({
  coordId,
  coordNome,
  municipio,
  coordWhatsapp = "",
}: AutoCadastroPortalProps) {
  // FORM STATE
  const [lidNome, setLidNome] = useState("");
  const [lidTelefone, setLidTelefone] = useState("");
  const [lidBairro, setLidBairro] = useState("");
  const [lidOcupacao, setLidOcupacao] = useState("");
  const [writeBairroMode, setWriteBairroMode] = useState(false);
  const [lidMeta, setLidMeta] = useState<number>(50);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Retrieve current neighborhoods for this municipality
  const bairrosList = useMemo(() => {
    const matchedMunObj = AMAPA_MUNICIPIOS.find(
      (m) => m.nome.toLowerCase() === municipio.toLowerCase()
    );
    return matchedMunObj ? matchedMunObj.bairros : ["Centro"];
  }, [municipio]);

  // Set default neighborhood
  React.useEffect(() => {
    if (bairrosList.length > 0 && !lidBairro) {
      setLidBairro(bairrosList[0]);
    }
  }, [bairrosList, lidBairro]);

  // Format phone number utility
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let cleanVal = e.target.value.replace(/\D/g, "");
    if (cleanVal.length > 11) {
      cleanVal = cleanVal.slice(0, 11);
    }
    
    // Apply (XX) XXXXX-XXXX mask
    if (cleanVal.length > 6) {
      setLidTelefone(`(${cleanVal.slice(0, 2)}) ${cleanVal.slice(2, 7)}-${cleanVal.slice(7)}`);
    } else if (cleanVal.length > 2) {
      setLidTelefone(`(${cleanVal.slice(0, 2)}) ${cleanVal.slice(2)}`);
    } else {
      setLidTelefone(cleanVal);
    }
  };

  // Submit Handler: transitions to WhatsApp payload setup
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lidNome.trim()) return;
    setIsSubmitted(true);
  };

  // Format dynamic WhatsApp message for coordinator sync
  const getWhatsAppMessageText = () => {
    const formattedDate = new Date().toLocaleDateString("pt-BR");
    const appBaseUrl = window.location.origin + window.location.pathname;
    
    // Auto import token construction
    const importUrl = `${appBaseUrl}?importLideranca=true&nome=${encodeURIComponent(lidNome.trim())}&tel=${encodeURIComponent(lidTelefone.trim())}&mun=${encodeURIComponent(municipio)}&bairro=${encodeURIComponent(lidBairro)}&votos=${lidMeta}&ocupacao=${encodeURIComponent(lidOcupacao)}&coordIdVal=${coordId}`;

    return `*GEO SCAN | Nova Liderança Focal* 🚀

Olá! Uma nova liderança acaba de se auto-cadastrar na nossa rede.

📌 *DADOS DO VÍNCULO:*
• *Município:* ${municipio.toUpperCase()} (Amapá)
• *Coordenador Responsável:* ${coordNome.toUpperCase()}
• *Bairro:* ${lidBairro}

👥 *DADOS DA LIDERANÇA FOCAL:*
• *Nome:* ${lidNome.trim()}
• *Ocupação/Segmento:* ${lidOcupacao || "Geral"}
• *WhatsApp:* ${lidTelefone || "Não informado"}
• *Meta Macro (Estimativa):* ${lidMeta} votos

📥 *PARA HOMOLOGAR E IMPORTAR IMEDIATAMENTE:*
Se você é o Coordenador da campanha, clique no link abaixo para validar e inserir a liderança diretamente no painel digital:
${importUrl}

_Registrado em ${formattedDate} via GEO SCAN Auto-Cadastro_`;
  };

  const handleSendWhatsApp = () => {
    const message = getWhatsAppMessageText();
    let phoneParam = "";
    if (coordWhatsapp) {
      const cleaned = coordWhatsapp.replace(/\D/g, "");
      if (cleaned) {
        phoneParam = (cleaned.length === 10 || cleaned.length === 11) ? `55${cleaned}` : cleaned;
      }
    }
    const whatsappUrl = phoneParam
      ? `https://api.whatsapp.com/send?phone=${phoneParam}&text=${encodeURIComponent(message)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  const handleCopyValidationMessage = () => {
    const message = getWhatsAppMessageText();
    navigator.clipboard.writeText(message);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between py-10 px-4 select-none relative font-sans">
      
      {/* Visual background lights */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-950/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-950/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Branded Navigation Header */}
      <header className="max-w-md w-full mx-auto text-center mb-6 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-full mb-3 shadow-md">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-[10px] font-mono font-extrabold tracking-widest text-slate-400 uppercase">
            GEO SCAN | Painel do Líder Focal
          </span>
        </div>
        <h2 className="text-xl font-black text-white uppercase tracking-tight">
          Liderança Territorial
        </h2>
      </header>

      {/* Core Form Card */}
      <main className="max-w-md w-full mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl relative z-10 flex-1 flex flex-col justify-center">
        
        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="text-center pb-4 border-b border-slate-800">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Coordenador Responsável
              </p>
              <h3 className="text-lg font-black text-amber-500 mt-1 uppercase">
                {coordNome}
              </h3>
              <p className="text-xs text-slate-500 mt-1 font-semibold flex items-center justify-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>Base Territorial: <strong>{municipio}</strong></span>
              </p>
            </div>

            <div className="space-y-4 pt-2">
              {/* Leader Name */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-extrabold uppercase tracking-wider">
                  Nome da Liderança
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3.5 text-slate-500">
                    <User className="w-4.5 h-4.5" />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="Nome completo"
                    value={lidNome}
                    onChange={(e) => setLidNome(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl p-3.5 pl-11 text-sm text-white placeholder-slate-600 outline-none transition font-semibold"
                  />
                </div>
              </div>

              {/* Ocupacao */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-extrabold uppercase tracking-wider">
                  Ocupação ou Segmento (Opcional)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3.5 text-slate-500">
                    <Briefcase className="w-4.5 h-4.5" />
                  </span>
                  <input
                    type="text"
                    placeholder="Ex: Pastor, Professor, Servidor..."
                    value={lidOcupacao}
                    onChange={(e) => setLidOcupacao(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl p-3.5 pl-11 text-sm text-white placeholder-slate-600 outline-none transition font-semibold"
                  />
                </div>
              </div>

              {/* Leader Telephone */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-extrabold uppercase tracking-wider">
                  WhatsApp / Telefone
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3.5 text-slate-500">
                    <Phone className="w-4.5 h-4.5" />
                  </span>
                  <input
                    type="tel"
                    placeholder="(96) 99999-9999"
                    value={lidTelefone}
                    onChange={handlePhoneChange}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl p-3.5 pl-11 text-sm font-bold font-mono text-amber-500 placeholder-slate-700 outline-none transition"
                  />
                </div>
              </div>

              {/* Neighborhood */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-slate-300 font-extrabold uppercase tracking-wider flex items-center gap-1">
                    <Map className="w-3.5 h-3.5 text-slate-400" />
                    <span>Bairro de Atuação</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setWriteBairroMode(!writeBairroMode);
                      if (!writeBairroMode) {
                        setLidBairro("");
                      } else if (bairrosList.length > 0) {
                        setLidBairro(bairrosList[0]);
                      }
                    }}
                    className="text-[10px] text-amber-500 font-extrabold hover:text-amber-400 transition cursor-pointer uppercase tracking-widest"
                  >
                    {writeBairroMode ? "⚡ Selecionar Lista" : "✍️ Escrever Bairro"}
                  </button>
                </div>
                {writeBairroMode ? (
                  <input
                    type="text"
                    required
                    placeholder="Digite seu bairro"
                    value={lidBairro}
                    onChange={(e) => setLidBairro(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl p-3.5 text-sm text-white font-bold placeholder-slate-655 outline-none transition"
                  />
                ) : (
                  <select
                    value={lidBairro}
                    onChange={(e) => setLidBairro(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl p-3.5 text-sm text-white font-bold outline-none transition cursor-pointer"
                  >
                    {bairrosList.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Auto Meta */}
              <div className="space-y-2">
                <label className="text-xs text-slate-300 font-extrabold uppercase tracking-wider flex items-center justify-between">
                  <span>Meta de Votos Expandida (Estimativa Macro)</span>
                  <span className="text-xs font-mono font-bold text-amber-500">{lidMeta} votos</span>
                </label>
                
                {/* Visual Number selection with friendly Tap values */}
                <div className="grid grid-cols-4 gap-2">
                  {[25, 50, 100, 200].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setLidMeta(val)}
                      className={`py-2 rounded-lg font-mono font-bold text-xs transition border cursor-pointer ${
                        lidMeta === val
                          ? "bg-amber-500 text-slate-950 border-amber-400 font-extrabold scale-102 shadow-lg shadow-amber-500/10"
                          : "bg-slate-950 hover:bg-slate-850 hover:text-white text-slate-400 border-slate-800"
                      }`}
                    >
                      +{val} v.
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="range"
                    min={1}
                    max={500}
                    value={lidMeta}
                    onChange={(e) => setLidMeta(Number(e.target.value))}
                    className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                  <input
                    type="number"
                    min={1}
                    value={lidMeta}
                    onChange={(e) => setLidMeta(e.target.value === "" ? 1 : Math.max(1, Number(e.target.value)))}
                    className="w-16 bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-center text-xs font-mono font-bold text-amber-500"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-450 text-slate-950 font-black py-4 px-5 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer active:scale-98 shadow-xl shadow-amber-500/10 flex items-center justify-center gap-2 mt-2"
            >
              <span>Gerar Confirmação</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <div className="space-y-6 text-center py-4">
            <div className="inline-flex p-3 bg-amber-950/40 border border-amber-500/20 text-amber-500 rounded-2xl animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-black text-white uppercase tracking-tight">
                Cadastro Preparado!
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
                Para transferir sua liderança <strong className="text-amber-500">{lidNome}</strong> para o painel de apuração do Coordenador Geral, conclua o envio abaixo.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl text-left space-y-2 font-mono text-[11px] text-slate-400 relative">
              <div className="absolute top-2 right-2 text-amber-500 flex items-center gap-1 text-[9px] font-bold bg-amber-950/50 px-2 py-0.5 rounded border border-amber-900/40 uppercase">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Link Seguro</span>
              </div>
              <p className="font-sans text-[10px] text-slate-500 uppercase font-black tracking-wider mb-1">Dados do vínculo seguindo esta ordem:</p>
              <p>&bull; Liderança focal</p>
              <p>&bull; Apoiadores</p>
              <p>&bull; Eleitores finais</p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={handleSendWhatsApp}
                className="w-full bg-amber-500 hover:bg-amber-450 text-slate-950 font-black py-4 px-5 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2 shadow-xl shadow-amber-500/15"
              >
                <Send className="w-4.5 h-4.5" />
                <span>Enviar p/ Coordenador</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleCopyValidationMessage}
                  className="py-2.5 px-3 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5 border border-slate-700/50"
                >
                  <Copy className="w-4 h-4" />
                  <span>{copiedLink ? "Copiado!" : "Copiar Texto"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsSubmitted(false)}
                  className="py-2.5 px-3 bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-slate-300 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer border border-slate-850/60"
                >
                  Voltar e Editar
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Styled Branded Footer */}
      <footer className="mt-6 text-center relative z-10">
        <p className="text-[10px] text-slate-650 font-mono tracking-wider uppercase">
          GEO SCAN &bull; TECNOLOGIA ELEITORAL EM CASCATA DE DADOS
        </p>
      </footer>
    </div>
  );
}
