"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { authenticateUser, initializeStore, getSettings, type Settings } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Scissors, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<Settings | null>(null);
  const router = useRouter();

  useEffect(() => {
    initializeStore();
    setSettings(getSettings());
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-white selection:bg-stone-100">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[320px] px-6"
      >
        <div className="mb-12 flex flex-col items-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            {settings?.logoUrl ? (
              <div className="w-16 h-16 bg-white rounded-xl shadow-sm border border-stone-100 flex items-center justify-center overflow-hidden p-3">
                <img src={settings.logoUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
              </div>
            ) : (
              <Scissors className="w-5 h-5 text-stone-400" />
            )}
          </motion.div>
          <h1 className="text-sm uppercase tracking-[0.4em] text-stone-800 font-light mb-1">
            {settings?.companyName || "Bespoke"}
          </h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-medium">
            Atelier Management
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="space-y-6">
            <div className="space-y-1 group">
              <Label htmlFor="username" className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-medium transition-colors group-focus-within:text-stone-600">
                Identifier
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-10 bg-transparent border-0 border-b border-stone-100 focus:border-stone-900 focus:ring-0 text-stone-900 text-sm font-light transition-all rounded-none px-0 placeholder:text-stone-300"
                placeholder="Username"
                required
              />
            </div>

            <div className="space-y-1 group">
              <Label htmlFor="password" className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-medium transition-colors group-focus-within:text-stone-600">
                Key
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-10 bg-transparent border-0 border-b border-stone-100 focus:border-stone-900 focus:ring-0 text-stone-900 text-sm font-light transition-all rounded-none px-0 placeholder:text-stone-300"
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
                <AlertCircle className="w-3 h-3 text-red-500" />
                <p className="text-[10px] uppercase tracking-[0.1em] text-red-500">
                  {error}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 bg-stone-900 hover:bg-black text-white text-[10px] uppercase tracking-[0.3em] font-bold transition-all duration-300 rounded-none disabled:opacity-50"
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-3 h-3 border border-white border-t-transparent rounded-full"
              />
            ) : (
              "Authorize"
            )}
          </Button>

          <div className="pt-4 flex justify-center">
            <button 
              type="button"
              className="text-[9px] uppercase tracking-[0.2em] text-stone-400 hover:text-stone-600 transition-colors"
            >
              Reset Access
            </button>
          </div>
        </form>

        <footer className="mt-24 text-center">
          <p className="text-[9px] uppercase tracking-[0.2em] text-stone-400 font-light">
            © {new Date().getFullYear()} {settings?.companyName || "House"}. Precision Built.
          </p>
        </footer>
      </motion.div>
    </div>
  );
}
