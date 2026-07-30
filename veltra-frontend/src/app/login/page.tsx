"use client";

import { Button } from "@/components/ui/button";
import { AuthProvider, useAuth } from "@/hooks/use-auth";

function LoginContent() {
  const { signIn } = useAuth();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-surface p-6">
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/hero-bg.svg')" }}
      />
      <div className="absolute inset-0 z-0 hero-gradient hidden md:block" />
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-surface via-surface/40 to-transparent md:hidden" />

      <div className="relative z-10 flex flex-col items-center max-w-sm w-full text-center">
        <img src="/images/logo.svg" alt="Veltra" className="h-14 w-auto mb-6" />

        <span className="inline-flex items-center gap-2 rounded-full bg-primary-container/20 px-3 py-1 text-on-primary-container font-geist text-xs font-semibold uppercase tracking-widest mb-4">
          <svg viewBox="0 0 24 24" fill="#aa3000" className="h-3.5 w-3.5">
            <path d="M13 2L3 14h8l-2 8 10-12h-8l2-8z" />
          </svg>
          Kinetic Precision AI
        </span>

        <h1 className="font-sora text-4xl font-extrabold text-on-surface tracking-tight leading-tight">
          Transforme cada <span className="text-primary">passada</span> em pura performance.
        </h1>
        <p className="font-geist text-base text-on-surface-variant mt-3 mb-8 max-w-md">
          Analisamos seus dados Strava com precisão para otimizar seu treino.
        </p>

        <Button size="lg" className="w-full gap-3" onClick={signIn}>
          <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M15.387 17.944l-2.089-4.116h-3.065l2.089 4.116h3.065zM10.237 3.5c-2.443 0-4.424 1.981-4.424 4.424 0 2.443 1.981 4.424 4.424 4.424 2.443 0 4.424-1.981 4.424-4.424 0-2.443-1.981-4.424-4.424-4.424z" />
          </svg>
          Entrar com Strava
        </Button>

        <p className="font-geist text-xs text-on-surface-variant mt-4 max-w-xs">
          Ao entrar, você autoriza o Veltra a acessar seus dados de corrida do Strava.
        </p>

        <footer className="flex items-center gap-6 mt-10 opacity-60">
          <div>
            <p className="font-geist text-lg font-semibold text-on-surface">12k+</p>
            <p className="font-geist text-xs text-on-surface-variant">Atletas Elite</p>
          </div>
          <div className="h-8 w-px bg-outline-variant" />
          <div>
            <p className="font-geist text-lg font-semibold text-on-surface">99.8%</p>
            <p className="font-geist text-xs text-on-surface-variant">Precisão de IA</p>
          </div>
          <div className="h-8 w-px bg-outline-variant" />
          <div>
            <p className="font-geist text-lg font-semibold text-on-surface">500TB</p>
            <p className="font-geist text-xs text-on-surface-variant">Dados Analisados</p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <AuthProvider>
      <LoginContent />
    </AuthProvider>
  );
}
