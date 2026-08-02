import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ArrowRight, Layers, LogIn, UserPlus, Mail, Lock, Eye, EyeOff, ShieldCheck, KeyRound } from "lucide-react";

interface ActivationPortalProps {
  onActivate: (session: { email: string }) => void;
}

export default function ActivationPortal({ onActivate }: ActivationPortalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgot, setIsForgot] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  // Recovery State
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [activationCode, setActivationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Ensure railton.brito.mcp@gmail.com is auto-registered as a helpful admin login fallback
  useEffect(() => {
    try {
      const storedUsers = JSON.parse(localStorage.getItem("geoscan_users") || "{}");
      if (!storedUsers["railton.brito.mcp@gmail.com"]) {
        storedUsers["railton.brito.mcp@gmail.com"] = { password: "123456" };
        localStorage.setItem("geoscan_users", JSON.stringify(storedUsers));
      }
    } catch (e) {
      console.error("Error auto-registering default admin", e);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      setError("Por favor, digite um email válido.");
      return;
    }
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setError("");
    
    // Simulate login/registration (saving to local storage handled in App)
    let storedUsers: Record<string, { password: string }>;
    try {
      storedUsers = JSON.parse(localStorage.getItem("geoscan_users") || "{}");
    } catch {
      storedUsers = {};
    }

    if (!isLogin) {
      // Simulate registering new credentials (would be an API call)
      if (storedUsers[email]) {
        setError("Este email já está cadastrado. Tente fazer login.");
        return;
      }
      storedUsers[email] = { password };
      localStorage.setItem("geoscan_users", JSON.stringify(storedUsers));
    } else {
      // Simulate login
      if (!storedUsers[email] || storedUsers[email].password !== password) {
        setError("Email ou senha incorretos.");
        return;
      }
    }

    onActivate({ email: email.trim() });
  };

  const handleRecoverSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryEmail.trim() || !recoveryEmail.includes("@")) {
      setError("Por favor, digite um email válido.");
      return;
    }
    if (activationCode.trim() !== "GEOSCAN-AP-2026") {
      setError("Código de Ativação incorreto. Verifique o código enviado no seu contrato comercial.");
      return;
    }
    if (newPassword.length < 6) {
      setError("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    try {
      const storedUsers = JSON.parse(localStorage.getItem("geoscan_users") || "{}");
      storedUsers[recoveryEmail.trim()] = { password: newPassword };
      localStorage.setItem("geoscan_users", JSON.stringify(storedUsers));
      setError("");
      setSuccessMessage("Senha de Administrador alterada com sucesso!");
      setTimeout(() => {
        setIsForgot(false);
        setSuccessMessage("");
        setEmail(recoveryEmail);
        setPassword(newPassword);
      }, 2500);
    } catch {
      setError("Erro ao redefinir senha.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden select-none">
      {/* Decorative Amapá Accent Background Glows */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-emerald-950/40 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-amber-950/30 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute top-[30%] right-[10%] w-[250px] h-[250px] bg-blue-950/20 rounded-full blur-[90px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md bg-slate-900/80 border border-slate-800 rounded-2xl shadow-2xl p-6 md:p-8 backdrop-blur-xl relative z-10"
      >
        {/* State and Brand Badging */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="flex items-center space-x-2 bg-emerald-900/30 border border-emerald-500/30 px-3.5 py-1.5 rounded-full text-sm text-emerald-400 mb-4 tracking-wider uppercase font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Acesso Seguro</span>
          </div>

          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2.5 bg-gradient-to-tr from-emerald-600 to-teal-500 rounded-xl text-slate-950 font-bold shadow-lg shadow-emerald-500/10">
              <Layers className="w-7 h-7" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white font-sans">
              GEO SCAN
            </h1>
          </div>
          <p className="text-slate-400 text-xs tracking-wider uppercase font-medium">
            Inteligência Territorial Eleitoral
          </p>
        </div>

        {/* Informative helper block for Railton (Default credentials) */}
        {!isForgot && (
          <div className="mb-5 bg-emerald-950/40 border border-emerald-500/20 rounded-xl p-3.5 text-xs text-emerald-400 leading-relaxed font-sans font-medium text-center">
            <p className="font-bold mb-1">🛡️ Administrador Habilitado:</p>
            Seu email <strong className="text-white font-black underline">railton.brito.mcp@gmail.com</strong> foi configurado como administrador. Use a senha padrão <strong className="text-white font-black">123456</strong> para acessar imediatamente ou redefina-a a seguir.
          </div>
        )}

        {isForgot ? (
          /* FORGOT / RECOVER ACCESS PASSWORD FORM */
          <div className="space-y-4">
            <div className="pb-2 border-b border-slate-800">
              <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <KeyRound className="w-4.5 h-4.5 text-amber-500" />
                Redefinir Senha de Acesso
              </h2>
              <p className="text-[11px] text-slate-400 mt-1">
                Utilize o Código de Ativação do seu contrato comercial da licença Amapá para definir uma nova senha administrativa.
              </p>
            </div>

            <form onSubmit={handleRecoverSubmit} className="space-y-4">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="bg-red-950/40 border border-red-500/30 text-red-300 text-[11px] p-3 rounded-lg text-center font-bold uppercase tracking-wider font-sans"
                >
                  {error}
                </motion.div>
              )}

              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-[11px] p-3 rounded-lg text-center font-bold uppercase tracking-wider font-sans"
                >
                  🎉 {successMessage}
                </motion.div>
              )}

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 ml-1">
                  <Mail className="w-3.5 h-3.5 text-blue-400" />
                  Seu Email Cadastrado
                </label>
                <input
                  type="email"
                  required
                  placeholder="ex: railton.brito.mcp@gmail.com"
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-blue-500 rounded-xl py-2.5 px-4 text-xs text-slate-100 placeholder-slate-600 outline-none transition duration-150"
                />
              </div>

              {/* Activation Code */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 ml-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                  Código de Ativação (Licença AP)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: GEOSCAN-AP-2026"
                  value={activationCode}
                  onChange={(e) => setActivationCode(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-amber-500 rounded-xl py-2.5 px-4 text-xs text-slate-100 placeholder-slate-600 outline-none transition duration-150 font-mono font-bold"
                />
              </div>

              {/* New Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 ml-1">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  Nova Senha Administrativa
                </label>
                <input
                  type="password"
                  required
                  placeholder="Mínimo 6 caracteres"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-emerald-500 rounded-xl py-2.5 px-4 text-xs text-slate-100 placeholder-slate-600 outline-none transition duration-150"
                />
              </div>

              {/* Confirm New Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 ml-1">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  Confirmar Nova Senha
                </label>
                <input
                  type="password"
                  required
                  placeholder="Repita a nova senha"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-emerald-500 rounded-xl py-2.5 px-4 text-xs text-slate-100 placeholder-slate-600 outline-none transition duration-150"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsForgot(false);
                    setError("");
                  }}
                  className="flex-1 py-3 bg-slate-850 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold rounded-xl text-xs uppercase tracking-wider transition cursor-pointer text-center"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition cursor-pointer text-center shadow-lg shadow-emerald-500/10"
                >
                  Salvar Nova Senha
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* STANDARD LOGIN AND FIRST ACCESS FORMS */
          <>
            {/* Auth Toggle */}
            <div className="flex bg-slate-950 p-1.5 rounded-xl border border-slate-800 mb-5 relative">
              <motion.div
                className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-slate-800 rounded-lg shadow"
                animate={{ left: isLogin ? "6px" : "calc(50% + 0px)" }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              />
              <button
                type="button"
                onClick={() => { setIsLogin(true); setError("") }}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider text-center relative z-10 transition-colors ${isLogin ? 'text-white' : 'text-slate-400 hover:text-slate-300'}`}
              >
                Entrar
              </button>
              <button
                type="button"
                onClick={() => { setIsLogin(false); setError("") }}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider text-center relative z-10 transition-colors ${!isLogin ? 'text-white' : 'text-slate-400 hover:text-slate-300'}`}
              >
                Primeiro Acesso
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="bg-red-950/40 border border-red-500/30 text-red-300 text-[11px] p-3 rounded-lg text-center font-bold uppercase tracking-wider font-sans"
                >
                  {error}
                </motion.div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 ml-1">
                  <Mail className="w-3.5 h-3.5 text-blue-400" />
                  Email do Administrador
                </label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="seunome@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-800 focus:border-blue-500 rounded-xl py-3 px-4 text-sm text-slate-100 placeholder-slate-600 outline-none transition duration-150 shadow-inner font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                    Senha de Acesso
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgot(true);
                      setError("");
                      setRecoveryEmail(email || "railton.brito.mcp@gmail.com");
                    }}
                    className="text-[10px] text-blue-400 hover:text-blue-300 hover:underline font-bold uppercase tracking-wider transition duration-150 cursor-pointer"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-800 focus:border-emerald-500 rounded-xl py-3 pl-4 pr-12 text-sm text-slate-100 placeholder-slate-600 outline-none transition duration-150 shadow-inner font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-emerald-400 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold py-4 px-4 rounded-xl text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 cursor-pointer transition-all active:scale-[0.98]"
              >
                {isLogin ? (
                  <>
                    <LogIn className="w-4.5 h-4.5" />
                    Acessar Sistema
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4.5 h-4.5" />
                    Cadastrar Acesso
                  </>
                )}
              </button>
            </form>
          </>
        )}

        <div className="mt-6 pt-5 border-t border-slate-800/60 flex items-center justify-center text-xs text-slate-400 font-medium">
          <span>Licença Amapá Ativa &bull; v2.8 Comercial</span>
        </div>
      </motion.div>

      <p className="text-xs text-slate-600 mt-6 relative z-10 font-mono tracking-wider">
        GEO SCAN INTELIGÊNCIA © 2026
      </p>
    </div>
  );
}
