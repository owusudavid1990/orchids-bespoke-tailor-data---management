"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  getUsers,
  getClients,
  type User,
  type Client,
} from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Shield, 
  UserCircle, 
  Mail, 
  Phone, 
  Briefcase,
  ExternalLink
} from "lucide-react";
import Link from "next/link";

export default function ManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    setUsers(getUsers());
    setClients(getClients());
  }, []);

  const getAssignedClientsCount = (userId: string) => {
    return clients.filter(c => c.assignedStaffId === userId).length;
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-serif text-stone-900">Team Management</h1>
        <p className="text-stone-500 font-display mt-2">Manage your staff and administrators</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user, index) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link href={`/dashboard/management/${user.id}`}>
              <Card className="group hover:shadow-2xl transition-all duration-500 border-stone-200 overflow-hidden bg-white cursor-pointer h-full">
                <div className={`h-2 ${user.role === 'admin' ? 'bg-amber-600' : 'bg-stone-900'}`} />
                <CardHeader className="relative pt-8 pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-stone-50 border border-stone-100 flex items-center justify-center shadow-sm overflow-hidden relative group-hover:scale-110 transition-transform duration-500">
                      {user.avatarUrl ? (
                        <img 
                          src={user.avatarUrl} 
                          alt={user.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : user.role === 'admin' ? (
                        <Shield className="w-8 h-8 text-amber-600" />
                      ) : (
                        <UserCircle className="w-8 h-8 text-stone-400" />
                      )}
                    </div>
                    <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-widest ${
                      user.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-stone-100 text-stone-700'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                  <CardTitle className="text-2xl font-serif text-stone-900 group-hover:text-stone-700 transition-colors">
                    {user.name}
                  </CardTitle>
                  <CardDescription className="font-display text-xs tracking-widest uppercase text-stone-400">
                    @{user.username}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm text-stone-500">
                      <Mail className="w-4 h-4 text-stone-300" />
                      <span className="truncate">{user.email || "No email provided"}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-stone-500">
                      <Briefcase className="w-4 h-4 text-stone-300" />
                      <span>{getAssignedClientsCount(user.id)} Assigned Clients</span>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-stone-50 flex items-center justify-between group-hover:border-stone-100 transition-colors">
                    <span className="text-[10px] uppercase font-bold tracking-tighter text-stone-300 group-hover:text-stone-900 transition-colors flex items-center gap-2">
                      View Profile <ExternalLink className="w-3 h-3" />
                    </span>
                    <span className="text-[10px] text-stone-300 font-display">
                      Joined {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
