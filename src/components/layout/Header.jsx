import { FileCheck2 } from "lucide-react";

export default function Header() {
  return (
    <header className="border-b border-ink-100 bg-paper">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5 sm:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-ink-900 text-gold-400">
            <FileCheck2 size={20} strokeWidth={2} />
          </div>
          <div>
            <h1 className="font-display text-lg font-semibold leading-tight tracking-tight text-ink-900">
              ATS CV Scanner
            </h1>
            <p className="text-xs leading-tight text-ink-400">
              Score, then rebuild in Harvard format
            </p>
          </div>
        </div>
        <a href="https://en.wikipedia.org/wiki/R%C3%A9sum%C3%A9" target="_blank" rel="noreferrer" className="hidden font-mono text-xs uppercase tracking-[0.12em] text-ink-400 transition-colors hover:text-gold-600 sm:block">
          Harvard format ↗
        </a>
      </div>
    </header>
  );
}