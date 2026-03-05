"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, Shield } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al iniciar sesión");
        return;
      }

      // Redirect based on role
      const role = data.rol?.toLowerCase() || "admin";
      router.push(`/${role === "super_admin" ? "admin" : role}/dashboard`);
    } catch (err) {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Left Panel — Branding */}
      <div className="login-left">
        {/* Logo */}
        <div className="login-brand">
          <div className="logo">
            <span className="logo-text">SADERH</span>
          </div>
        </div>

        {/* Hero */}
        <div className="login-hero">
          <h1>Impulsando el campo hidalguense</h1>
          <p>Gestión eficiente, transparente y segura para el desarrollo agrícola del estado de Hidalgo.</p>
        </div>

        {/* Footer */}
        <div className="login-footer">
          <p>© 2026 Secretaría de Agricultura y Desarrollo Rural de Hidalgo</p>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="login-right">
        <div className="login-form-container">
          {/* Header */}
          <div className="login-header">
            <h2>Bienvenido al Sistema</h2>
            <p>Ingresa tus credenciales institucionales para acceder al sistema de reportes.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <div className="p-3 mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Email */}
            <div className="form-group">
              <label className="form-label">Correo Institucional</label>
              <div className="input-with-icon">
                <Mail className="input-icon" size={16} />
                <input
                  type="email"
                  className="form-input"
                  placeholder="usuario@hidalgo.gob.mx"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <div className="input-with-icon">
                <Lock className="input-icon" size={16} />
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="form-options">
              <a href="mailto:soporte@saderh.gob.mx?subject=Recuperación%20de%20acceso%20SADERH" className="forgot-password">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary btn-full"
            >
              {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </button>
          </form>

          {/* Help Links */}
          <div className="login-help">
            <div className="help-links">
              <a href="mailto:soporte@saderh.gob.mx?subject=Soporte%20Técnico%20SADERH" className="help-link">
                <span>🎧</span>
                Soporte Técnico
              </a>
              <a href="https://www.hidalgo.gob.mx" className="help-link" target="_blank" rel="noreferrer">
                <span>🔒</span>
                Privacidad
              </a>
            </div>

            <div className="security-badge">
              <Shield size={12} />
              Sistema Seguro SSL 256-bit
            </div>

            <p className="copyright">
              © 2026 Secretaría de Agricultura y Desarrollo Rural de Hidalgo. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
