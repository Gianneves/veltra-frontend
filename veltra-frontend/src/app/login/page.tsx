"use client";

import { Button } from "@/components/ui/button";
import { AuthProvider, useAuth } from "@/hooks/use-auth";

function LoginContent() {
  const { signIn } = useAuth();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-surface p-6">
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/veltra-login-bg.png')" }}
      />

      <div className="relative z-10 flex flex-col items-center max-w-sm w-full text-center">
        <img
          src="/images/veltra-wordmark-only.svg?v=2"
          alt="Veltra"
          className="mx-auto block h-20 w-auto max-w-full mb-6"
        />

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
