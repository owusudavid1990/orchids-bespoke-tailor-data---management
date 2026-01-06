"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { authenticateUser, initializeStore, getSettings, type Settings } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Scissors } from "lucide-react";
import Image from "next/image";

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
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {settings?.backgroundImageUrl ? (
          <>
            <img
              src={settings.backgroundImageUrl}
              alt="Background"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-[2px]" />
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900" />
            <div 
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D4AF37' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            />
          </>
        )}
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl font-semibold mb-4 tracking-tight">
              The Art of
              <br />
              <span className="text-gold">Bespoke Tailoring</span>
            </h1>
            <p className="text-stone-300 text-xl leading-relaxed max-w-md">
              Where precision meets elegance. Every stitch tells a story of craftsmanship 
              and dedication to perfection.
            </p>
          </motion.div>
          <motion.div 
            className="mt-16 flex items-center gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            <div className="text-center">
              <div className="text-4xl text-gold">25+</div>
              <div className="text-sm text-stone-400 tracking-wider uppercase">Years</div>
            </div>
            <div className="w-px h-12 bg-stone-600" />
            <div className="text-center">
              <div className="text-4xl text-gold">5000+</div>
              <div className="text-sm text-stone-400 tracking-wider uppercase">Clients</div>
            </div>
            <div className="w-px h-12 bg-stone-600" />
            <div className="text-center">
              <div className="text-4xl text-gold">100%</div>
              <div className="text-sm text-stone-400 tracking-wider uppercase">Handcrafted</div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center bg-stone-50 px-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-12">
            {settings?.logoUrl ? (
              <Image
                src={settings.logoUrl}
                alt="Logo"
                width={80}
                height={80}
                className="mx-auto mb-6 object-contain"
              />
            ) : (
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-stone-900 flex items-center justify-center">
                <Scissors className="w-10 h-10 text-gold" />
              </div>
            )}
            <h2 className="text-3xl text-stone-900 mb-2">
              {settings?.companyName || "Bespoke Tailoring House"}
            </h2>
            <p className="text-stone-500 text-lg">
              Tailoring Management System
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-stone-700 text-base">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-12 bg-white border-stone-200 focus:border-gold focus:ring-gold text-lg"
                placeholder="Enter your username"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-stone-700 text-base">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 bg-white border-stone-200 focus:border-gold focus:ring-gold text-lg"
                placeholder="Enter your password"
                required
              />
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-600 text-sm text-center"
              >
                {error}
              </motion.p>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-stone-900 hover:bg-stone-800 text-white text-lg tracking-wide transition-all duration-300"
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t border-stone-200">
            <p className="text-center text-stone-400 text-sm">
              Default credentials
            </p>
            <div className="mt-3 grid grid-cols-2 gap-4 text-center">
              <div className="p-3 bg-white rounded border border-stone-200">
                <p className="text-xs text-stone-400 uppercase tracking-wider">Admin</p>
                <p className="text-sm text-stone-600 mt-1">admin / admin123</p>
              </div>
              <div className="p-3 bg-white rounded border border-stone-200">
                <p className="text-xs text-stone-400 uppercase tracking-wider">Staff</p>
                <p className="text-sm text-stone-600 mt-1">staff / staff123</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
