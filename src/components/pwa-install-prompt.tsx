import { useEffect, useState } from "react";
import { Download, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check if dismissed recently
    const dismissed = localStorage.getItem("engineeros_pwa_dismissed");
    if (dismissed && Date.now() - Number(dismissed) < 7 * 24 * 60 * 60 * 1000) {
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Register service worker if supported
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => console.log("[EngineerOS] PWA Service Worker registered"))
        .catch((err) => console.warn("[EngineerOS] SW registration warning:", err));
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem("engineeros_pwa_dismissed", String(Date.now()));
  };

  if (!visible) return null;

  return (
    <aside
      aria-label="Install EngineerOS application"
      className="fixed bottom-4 right-4 z-50 max-w-sm rounded-xl border border-primary/30 bg-card/95 p-4 shadow-xl backdrop-blur-md transition-all animate-in fade-in slide-in-from-bottom-5 font-sans"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary">
            <Download className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-foreground flex items-center gap-1.5">
              Install EngineerOS <Sparkles className="h-3 w-3 text-primary" />
            </h4>
            <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
              Install as an app for fast offline lesson reading, code execution, and daily streak
              alerts.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          className="text-muted-foreground hover:text-foreground p-1"
          aria-label="Dismiss install banner"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mt-3 flex items-center justify-end gap-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={handleDismiss}
          className="h-7 text-xs text-muted-foreground"
        >
          Maybe Later
        </Button>
        <Button
          size="sm"
          onClick={handleInstall}
          className="h-7 text-xs bg-primary text-primary-foreground font-medium"
        >
          Install App
        </Button>
      </div>
    </aside>
  );
}
