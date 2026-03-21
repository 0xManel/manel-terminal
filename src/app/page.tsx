"use client"
import Link from "next/link"
import MatrixBackground from "@/components/MatrixBackground"

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col relative">
      <MatrixBackground />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="border-b border-terminal-green/20 p-4 bg-terminal-bg/80 backdrop-blur-sm">
          <div className="flex justify-between items-center max-w-4xl mx-auto">
            <h1 className="font-display text-xl md:text-2xl font-black glow">
              MANEL_TERMINAL
            </h1>
            <span className="flex items-center gap-2 text-xs px-3 py-1 bg-terminal-green/10 border border-terminal-green/30 rounded pulse-border">
              <span className="w-2 h-2 bg-terminal-green rounded-full animate-pulse"></span>
              ONLINE
            </span>
          </div>
        </header>

        {/* Hero */}
        <section className="flex-1 flex flex-col items-center justify-center p-6 md:p-8">
          <div className="w-full max-w-md text-center space-y-6">
            {/* Title with animation */}
            <div className="space-y-1 fade-in-up">
              <h2 className="font-display text-3xl md:text-5xl font-black leading-tight">
                <span className="text-terminal-cyan float">COMPITA.</span>
              </h2>
              <h2 className="font-display text-3xl md:text-5xl font-black leading-tight fade-in-up delay-1">
                <span className="text-terminal-green glow">NEGOCIE.</span>
              </h2>
              <h2 className="font-display text-3xl md:text-5xl font-black leading-tight fade-in-up delay-2">
                <span className="text-terminal-magenta">VENCA.</span>
              </h2>
            </div>
            
            {/* Description */}
            <p className="text-terminal-green/60 text-sm md:text-base fade-in-up delay-3 max-w-sm mx-auto">
              Plataforma de competicao de trading simulado. 
              Siga sinais reais do Polymarket, compita com outros traders e suba no ranking.
            </p>

            {/* Auth Buttons */}
            <div className="space-y-3 pt-4 fade-in-up delay-4">
              <Link href="/login" className="block w-full btn-terminal py-4 text-center font-bold rounded text-lg glitch">
                ENTRAR
              </Link>
              <Link href="/register" className="block w-full py-3 text-center border border-terminal-green/30 hover:border-terminal-green hover:bg-terminal-green/5 rounded transition-all text-sm">
                CRIAR CONTA GRATIS
              </Link>
            </div>

            {/* How it works */}
            <div className="pt-8 space-y-4 fade-in-up delay-5">
              <h3 className="text-xs text-terminal-green/50 tracking-widest">COMO FUNCIONA</h3>
              <div className="grid grid-cols-1 gap-3 text-left">
                <div className="p-3 bg-terminal-bg/80 border border-terminal-green/10 rounded flex items-start gap-3 hover:border-terminal-green/30 transition-all">
                  <span className="text-terminal-cyan font-display text-lg">01</span>
                  <div>
                    <div className="text-sm font-bold text-terminal-green">Crie sua conta</div>
                    <div className="text-xs text-terminal-green/50">Escolha seu saldo inicial ($25-$100) e perfil de risco</div>
                  </div>
                </div>
                <div className="p-3 bg-terminal-bg/80 border border-terminal-green/10 rounded flex items-start gap-3 hover:border-terminal-green/30 transition-all">
                  <span className="text-terminal-yellow font-display text-lg">02</span>
                  <div>
                    <div className="text-sm font-bold text-terminal-green">Receba sinais</div>
                    <div className="text-xs text-terminal-green/50">Sinais automaticos de traders profissionais do Polymarket</div>
                  </div>
                </div>
                <div className="p-3 bg-terminal-bg/80 border border-terminal-green/10 rounded flex items-start gap-3 hover:border-terminal-green/30 transition-all">
                  <span className="text-terminal-magenta font-display text-lg">03</span>
                  <div>
                    <div className="text-sm font-bold text-terminal-green">Compita no ranking</div>
                    <div className="text-xs text-terminal-green/50">Suba no leaderboard e prove suas habilidades</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats preview */}
            <div className="pt-6 grid grid-cols-3 gap-2 text-center fade-in-up delay-5">
              <div className="p-2 bg-terminal-bg/60 border border-terminal-green/10 rounded">
                <div className="font-display text-lg text-terminal-cyan">100%</div>
                <div className="text-xs text-terminal-green/40">GRATIS</div>
              </div>
              <div className="p-2 bg-terminal-bg/60 border border-terminal-green/10 rounded">
                <div className="font-display text-lg text-terminal-yellow">24/7</div>
                <div className="text-xs text-terminal-green/40">ATIVO</div>
              </div>
              <div className="p-2 bg-terminal-bg/60 border border-terminal-green/10 rounded">
                <div className="font-display text-lg text-terminal-green">$0</div>
                <div className="text-xs text-terminal-green/40">RISCO</div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-terminal-green/10 p-3 text-center text-xs text-terminal-green/30 bg-terminal-bg/80 backdrop-blur-sm">
          <span className="glitch">MANEL_TERMINAL</span> v0.1 | Simulacao Polymarket | Sem dinheiro real
        </footer>
      </div>
    </main>
  )
}
