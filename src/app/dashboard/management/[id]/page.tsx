"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  getUserById,
  getClients,
  saveUser,
  type User,
  type Client,
} from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Shield, 
  UserCircle, 
  ArrowLeft,
  Calendar,
  Briefcase,
  Users as ClientsIcon,
  ExternalLink,
  Camera,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [assignedClients, setAssignedClients] = useState<Client[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const userId = params.id as string;
    const userData = getUserById(userId);
    if (userData) {
      setUser(userData);
      const allClients = getClients();
      setAssignedClients(allClients.filter(c => c.assignedStaffId === userId));
    } else {
      router.push("/dashboard/management");
    }
  }, [params.id, router]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const updatedUser = { ...user, avatarUrl: publicUrl };
      saveUser(updatedUser);
      setUser(updatedUser);
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Failed to upload photo. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => router.back()}
          className="rounded-full hover:bg-stone-100"
        >
          <ArrowLeft className="w-5 h-5 text-stone-600" />
        </Button>
        <div>
          <h1 className="text-4xl font-serif text-stone-900">Team Profile</h1>
          <p className="text-stone-500 font-display">View detailed information and assignments</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Info Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-stone-200 bg-white overflow-hidden">
            <div className={`h-24 ${user.role === 'admin' ? 'bg-amber-900' : 'bg-stone-900'}`} />
            <CardHeader className="relative pt-12 pb-6">
              <div className="absolute -top-12 left-6 group">
                <div className="relative w-24 h-24 bg-white rounded-3xl shadow-xl border border-stone-100 overflow-hidden flex items-center justify-center">
                  {user.avatarUrl ? (
                    <img 
                      src={user.avatarUrl} 
                      alt={user.name} 
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full bg-stone-50">
                      {user.role === 'admin' ? (
                        <Shield className="w-12 h-12 text-amber-600" />
                      ) : (
                        <UserCircle className="w-12 h-12 text-blue-600" />
                      )}
                    </div>
                  )}
                  
                  <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                    {isUploading ? (
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                    ) : (
                      <Camera className="w-8 h-8 text-white" />
                    )}
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      disabled={isUploading}
                    />
                  </label>
                </div>
              </div>
              <CardTitle className="text-3xl font-serif text-stone-900">{user.name}</CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm font-display tracking-widest uppercase text-stone-400">@{user.username}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter ${
                  user.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {user.role}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4 pt-4 border-t border-stone-100">
                <div className="flex items-center gap-4 group">
                  <div className="p-2 bg-stone-50 rounded-xl group-hover:bg-stone-100 transition-colors">
                    <Mail className="w-4 h-4 text-stone-400" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-stone-400 font-display font-bold">Email</p>
                    <p className="text-stone-700 font-display">{user.email || "Not provided"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 group">
                  <div className="p-2 bg-stone-50 rounded-xl group-hover:bg-stone-100 transition-colors">
                    <Phone className="w-4 h-4 text-stone-400" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-stone-400 font-display font-bold">Telephone</p>
                    <p className="text-stone-700 font-display">{user.phone || "Not provided"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 group">
                  <div className="p-2 bg-stone-50 rounded-xl group-hover:bg-stone-100 transition-colors">
                    <MapPin className="w-4 h-4 text-stone-400" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-stone-400 font-display font-bold">Address</p>
                    <p className="text-stone-700 font-display leading-relaxed">{user.address || "Not provided"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 group">
                  <div className="p-2 bg-stone-50 rounded-xl group-hover:bg-stone-100 transition-colors">
                    <Calendar className="w-4 h-4 text-stone-400" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-stone-400 font-display font-bold">Joined</p>
                    <p className="text-stone-700 font-display">
                      {new Date(user.createdAt).toLocaleDateString(undefined, { 
                        month: 'long', 
                        day: 'numeric',
                        year: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assignments and Activity */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-stone-200 bg-white">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-serif text-stone-900">Assigned Clients</CardTitle>
                <CardDescription className="font-display">Current portfolio of clients managed by {user.name.split(' ')[0]}</CardDescription>
              </div>
              <div className="p-3 bg-stone-50 rounded-2xl">
                <ClientsIcon className="w-6 h-6 text-stone-400" />
              </div>
            </CardHeader>
            <CardContent>
              {assignedClients.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {assignedClients.map((client) => (
                    <motion.div
                      key={client.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link href={`/dashboard/clients/${client.id}`}>
                        <div className="p-4 rounded-2xl border border-stone-100 bg-stone-50/50 hover:bg-stone-100 hover:border-stone-200 transition-all group flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-stone-200 flex items-center justify-center text-stone-500 font-serif text-lg group-hover:bg-stone-900 group-hover:text-stone-50 transition-colors">
                              {client.name[0]}
                            </div>
                            <div>
                              <p className="font-serif text-stone-900">{client.name}</p>
                              <p className="text-xs text-stone-500 font-display">{client.email}</p>
                            </div>
                          </div>
                          <ExternalLink className="w-4 h-4 text-stone-300 group-hover:text-stone-900 transition-colors" />
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center border-2 border-dashed border-stone-100 rounded-3xl">
                  <Briefcase className="w-12 h-12 text-stone-200 mx-auto mb-4" />
                  <p className="text-stone-400 font-display">No clients assigned yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
