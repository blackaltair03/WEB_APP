"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Mail, Lock, ShieldCheck, RefreshCw } from "lucide-react";
import { toast } from "sonner";

type LoginStep = "email" | "code";

export default function LoginForm() {
  const router = useRouter();
  const [step, setStep] = useState<LoginStep>("email");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [codeSent, setCodeSent] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer para reenviar código
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Enfocar siguiente input cuando se escribe un dígito
  const handleCodeInput = (index: number, value: string) => {
    if (value.length > 0 && index < 4) {
      inputRefs.current[index + 1]?.focus();
    }
    
    const newCode = code.split("");
    newCode[index] = value.slice(-1);
    const finalCode = newCode.join("");
    setCode(finalCode);
    
    // Cuando se completa el código, verificar automáticamente
    if (finalCode.length === 5) {
      verifyCode(email, finalCode);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Enviar código de verificación
  const sendVerificationCode = async () => {
    if (!email) {
      toast.error("Ingresa tu correo electrónico");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Ingresa un correo válido");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/verification/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Error al enviar el código");
        return;
      }

      // Si es modo desarrollo, mostrar el código
      if (data.devCode) {
        console.log("🔐 Código de verificación (DESARROLLO):", data.devCode);
        toast.info(`Código de desarrollo: ${data.devCode}`, {
          duration: 10000,
        });
      }

      setCodeSent(true);
      setStep("code");
      setResendTimer(60); // 60 segundos para reenviar
      toast.success("Código enviado a tu correo");
    } catch {
      toast.error("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  // Verificar código
  const verifyCode = async (emailToVerify: string, codeToVerify: string) => {
    if (codeToVerify.length !== 5) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/verification/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailToVerify, code: codeToVerify }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Código incorrecto");
        return;
      }

      toast.success("¡Bienvenido al sistema!");
      
      // Redireccionar según el rol
      const roleRoutes: Record<string, string> = {
        SUPER_ADMIN: "/admin/dashboard",
        COORDINADOR: "/coordinador/dashboard",
        TECNICO: "/tecnico/dashboard",
      };

      router.push(roleRoutes[data.data.user.rol] ?? "/");
      router.refresh();
    } catch {
      toast.error("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  // Manejar reenvío de código
  const handleResendCode = () => {
    if (resendTimer > 0) return;
    setCode("");
    sendVerificationCode();
  };

  // Volver a email
  const handleBackToEmail = () => {
    setStep("email");
    setCode("");
    setCodeSent(false);
  };

  return (
    <div className="space-y-6">
      {step === "email" ? (
        // Paso 1: Ingresar email
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-guinda-900 mb-1.5 font-display">
              Correo institucional
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="usuario@saderh.gob.mx"
                value={email}
                onChange={(e) => setEmail(e.target.value.toLowerCase())}
                onKeyDown={(e) => e.key === "Enter" && sendVerificationCode()}
                className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-guinda-700 focus:border-transparent text-sm transition-shadow"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={sendVerificationCode}
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-guinda-700 text-white font-semibold text-sm hover:bg-guinda-800 focus:outline-none focus:ring-2 focus:ring-guinda-700 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 font-display"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                Continuar con verificación
              </>
            )}
          </button>
        </div>
      ) : (
        // Paso 2: Ingresar código de verificación
        <div className="space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-guinda-100 mb-4">
              <ShieldCheck className="w-8 h-8 text-guinda-700" />
            </div>
            <h3 className="text-lg font-semibold text-guinda-900 font-display">
              Verificación de seguridad
            </h3>
            <p className="text-sm text-gray-600 mt-2">
              Ingresa el código de 5 dígitos enviado a<br />
              <span className="font-medium text-guinda-700">{email}</span>
            </p>
          </div>

          {/* Inputs del código */}
          <div className="flex justify-center gap-2">
            {[0, 1, 2, 3, 4].map((index) => (
              <input
                key={index}
                ref={(el: HTMLInputElement | null) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={code[index] || ""}
                onChange={(e) => handleCodeInput(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                disabled={loading}
                className="w-12 h-14 text-center text-xl font-bold rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-guinda-700 focus:border-guinda-700 transition-all disabled:opacity-50"
              />
            ))}
          </div>

          {loading && (
            <div className="flex items-center justify-center gap-2 text-gray-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Verificando...</span>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => verifyCode(email, code)}
              disabled={code.length !== 5 || loading}
              className="w-full py-2.5 rounded-lg bg-guinda-700 text-white font-semibold text-sm hover:bg-guinda-800 focus:outline-none focus:ring-2 focus:ring-guinda-700 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 font-display"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                "Verificar código"
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-sm">
              {resendTimer > 0 ? (
                <span className="text-gray-500">
                  Reenviar código en {resendTimer}s
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendCode}
                  className="flex items-center gap-1 text-guinda-700 hover:text-guinda-800 font-medium"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reenviar código
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleBackToEmail}
              className="text-sm text-gray-600 hover:text-guinda-700 font-medium"
            >
              ← Cambiar correo electrónico
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
