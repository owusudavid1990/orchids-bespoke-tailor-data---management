"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { authenticateUser, initializeStore, getSettings, type Settings } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Scissors, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    initializeStore();
    setSettings(getSettings());
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 800));

    const user = authenticateUser(username, password);
    if (user) {
      router.push("/dashboard");
    } else {
      setError("Invalid credentials");
      setIsLoading(false);
    }
  };

  // Prevent hydration mismatch by returning a consistent shell during server-side rendering
  if (!mounted) {
    return (
      <div className="light min-h-screen bg-white" />
    );
  }

  return (
    <div className="light">
      <div className={`min-h-screen flex items-center justify-center relative overflow-hidden transition-colors duration-500 ${settings?.backgroundUrl ? 'bg-black' : 'bg-white'} selection:bg-stone-800 text-stone-900`}>
        {settings?.backgroundUrl && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 z-0"
          >
            <img 
              src={settings.backgroundUrl} 
              alt="Background" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[320px] px-6 relative z-10"
        >
          <div className="mb-12 flex flex-col items-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <Scissors className={`w-5 h-5 ${settings?.backgroundUrl ? 'text-stone-400' : 'text-stone-500'}`} />
            </motion.div>
            <h1 className={`text-sm uppercase tracking-[0.4em] font-light mb-1 ${settings?.backgroundUrl ? 'text-white' : 'text-stone-900'}`}>
              {settings?.companyName || "Bespoke"}
            </h1>
            <p className={`text-[10px] uppercase tracking-[0.2em] font-medium ${settings?.backgroundUrl ? 'text-stone-400' : 'text-stone-500'}`}>
              Atelier Management
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="space-y-6">
              <div className="space-y-1 group">
                <Label htmlFor="username" className={`text-[10px] uppercase tracking-[0.2em] font-medium transition-colors ${settings?.backgroundUrl ? 'text-stone-400 group-focus-within:text-white' : 'text-stone-500 group-focus-within:text-stone-900'}`}>
                  Identifier
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`h-10 bg-transparent border-0 border-b focus:ring-0 text-sm font-light transition-all rounded-none px-0 ${settings?.backgroundUrl ? 'border-stone-800 focus:border-white text-white placeholder:text-stone-800' : 'border-stone-200 focus:border-stone-900 text-stone-900 placeholder:text-stone-200'}`}
                  placeholder="Username"
                  required
                />
              </div>

              <div className="space-y-1 group">
                <Label htmlFor="password" className={`text-[10px] uppercase tracking-[0.2em] font-medium transition-colors ${settings?.backgroundUrl ? 'text-stone-400 group-focus-within:text-white' : 'text-stone-500 group-focus-within:text-stone-900'}`}>
                  Key
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`h-10 bg-transparent border-0 border-b focus:ring-0 text-sm font-light transition-all rounded-none px-0 ${settings?.backgroundUrl ? 'border-stone-800 focus:border-white text-white placeholder:text-stone-800' : 'border-stone-200 focus:border-stone-900 text-stone-900 placeholder:text-stone-200'}`}
                  placeholder="Password"
                  required
                />
              </div>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-3 h-3 text-stone-600" />
                  <p className="text-[10px] uppercase tracking-[0.1em] text-stone-600">
                    {error}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              type="submit"
              disabled={isLoading}
              className={`w-full h-11 text-[10px] uppercase tracking-[0.3em] font-bold transition-all duration-300 rounded-none disabled:opacity-50 ${settings?.backgroundUrl ? 'bg-white hover:bg-stone-200 text-black' : 'bg-stone-900 hover:bg-stone-800 text-white'}`}
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-3 h-3 border border-current border-t-transparent rounded-full"
                />
              ) : (
                "Authorize"
              )}
            </Button>

            <div className="pt-4 flex justify-center">
              <button 
                type="button"
                className={`text-[9px] uppercase tracking-[0.2em] transition-colors ${settings?.backgroundUrl ? 'text-stone-500 hover:text-white' : 'text-stone-400 hover:text-stone-900'}`}
              >
                Reset Access
              </button>
            </div>
          </form>

          <footer className="mt-24 text-center">
            <p className={`text-[9px] uppercase tracking-[0.2em] font-light ${settings?.backgroundUrl ? 'text-stone-700' : 'text-stone-300'}`}>
              © {new Date().getFullYear()} {settings?.companyName || "House"}. Precision Built.
            </p>
          </footer>
        </motion.div>
      </div>
    </div>
  );
}
