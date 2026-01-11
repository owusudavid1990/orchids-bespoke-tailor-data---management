"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { signUp, getSettings, type Settings } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Scissors, AlertCircle, UserPlus, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    name: "",
    email: "",
    role: "staff" as const
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<Settings | null>(null);
  const router = useRouter();

  useEffect(() => {
    setSettings(getSettings());
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      await signUp({
        username: formData.username,
        password: formData.password,
        name: formData.name,
        email: formData.email,
        role: formData.role
      });
      setSuccess(true);
      setTimeout(() => router.push("/"), 2000);
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white selection:bg-stone-100">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[360px] px-6 py-12"
      >
        <div className="mb-10 flex flex-col items-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <Scissors className="w-5 h-5 text-stone-400" />
          </motion.div>
          <h1 className="text-sm uppercase tracking-[0.4em] text-stone-800 font-light mb-1">
            {settings?.companyName || "Bespoke"}
          </h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-medium">
            Join the Atelier
          </p>
        </div>

        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h2 className="text-stone-900 font-medium mb-2">Registration Successful</h2>
              <p className="text-xs text-stone-500">Redirecting to login...</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-1 group">
                  <Label className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-medium">Full Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="h-9 bg-transparent border-0 border-b border-stone-100 focus:border-stone-900 focus:ring-0 text-stone-900 text-sm font-light transition-all rounded-none px-0"
                    placeholder="Elias Thorne"
                    required
                  />
                </div>

                <div className="space-y-1 group">
                  <Label className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-medium">Username</Label>
                  <Input
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="h-9 bg-transparent border-0 border-b border-stone-100 focus:border-stone-900 focus:ring-0 text-stone-900 text-sm font-light transition-all rounded-none px-0"
                    placeholder="ethorne"
                    required
                  />
                </div>

                <div className="space-y-1 group">
                  <Label className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-medium">Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="h-9 bg-transparent border-0 border-b border-stone-100 focus:border-stone-900 focus:ring-0 text-stone-900 text-sm font-light transition-all rounded-none px-0"
                    placeholder="elias@atelier.com"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1 group">
                    <Label className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-medium">Key</Label>
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="h-9 bg-transparent border-0 border-b border-stone-100 focus:border-stone-900 focus:ring-0 text-stone-900 text-sm font-light transition-all rounded-none px-0"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <div className="space-y-1 group">
                    <Label className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-medium">Confirm</Label>
                    <Input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="h-9 bg-transparent border-0 border-b border-stone-100 focus:border-stone-900 focus:ring-0 text-stone-900 text-sm font-light transition-all rounded-none px-0"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2"
                >
                  <AlertCircle className="w-3 h-3 text-red-500" />
                  <p className="text-[10px] uppercase tracking-[0.1em] text-red-500">{error}</p>
                </motion.div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-stone-900 hover:bg-black text-white text-[10px] uppercase tracking-[0.3em] font-bold transition-all duration-300 rounded-none"
              >
                {isLoading ? "Processing..." : "Register Profile"}
              </Button>

              <div className="pt-4 text-center">
                <Link 
                  href="/"
                  className="text-[9px] uppercase tracking-[0.2em] text-stone-400 hover:text-stone-900 transition-colors"
                >
                  Back to Authorization
                </Link>
              </div>
            </form>
          )}
        </AnimatePresence>

        <footer className="mt-16 text-center">
          <p className="text-[9px] uppercase tracking-[0.2em] text-stone-400 font-light">
            © {new Date().getFullYear()} Precision Built.
          </p>
        </footer>
      </motion.div>
    </div>
  );
}
