"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getClients,
  saveClient,
  deleteClient,
  generateId,
  getCurrentUser,
  getUsers,
  type Client,
  type User as AppUser,
} from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, Search, Pencil, Trash2, User, Phone, Mail, MapPin, Eye, Shield } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [allUsers, setAllUsers] = useState<AppUser[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
    assignedStaffId: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const user = getCurrentUser();
    setCurrentUser(user);
    const allClients = getClients();
    
    if (user?.role === "staff") {
      setClients(allClients.filter(c => c.assignedStaffId === user.id));
    } else {
      setClients(allClients);
      setAllUsers(getUsers());
    }
  };

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.phone.includes(searchQuery)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date().toISOString();
    
    // Auto-assign to current staff if they are creating the client
    const assignedStaffId = currentUser?.role === "staff" && !editingClient 
      ? currentUser.id 
      : formData.assignedStaffId;

    const client: Client = {
      id: editingClient?.id || generateId(),
      ...formData,
      assignedStaffId,
      createdAt: editingClient?.createdAt || now,
      updatedAt: now,
    };
    saveClient(client);
    loadData();
    resetForm();
    setIsDialogOpen(false);
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      email: client.email,
      phone: client.phone,
      address: client.address,
      notes: client.notes,
      assignedStaffId: client.assignedStaffId || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteClient(id);
    loadData();
  };

  const resetForm = () => {
    setEditingClient(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      notes: "",
      assignedStaffId: "",
    });
  };

  const getStaffName = (id?: string) => {
    if (!id) return null;
    return allUsers.find(u => u.id === id)?.name || "Unknown Staff";
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-serif text-stone-900"
          >
            Clients
          </motion.h1>
          <p className="text-stone-500 font-display mt-1">
            Manage your client database
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-stone-900 hover:bg-stone-800 font-display">
              <Plus className="w-4 h-4 mr-2" />
              Add Client
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-xl font-serif">
                {editingClient ? "Edit Client" : "New Client"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="font-display">
                  Full Name *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="font-display"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="font-display">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="font-display"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="font-display">
                    Phone *
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="font-display"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address" className="font-display">
                  Address
                </Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="resize-none"
                  rows={2}
                />
              </div>
                <div className="space-y-2">
                  <Label htmlFor="notes" className="font-display">
                    Notes
                  </Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    className="resize-none"
                    rows={3}
                    placeholder="Any special preferences or notes..."
                  />
                </div>

                {currentUser?.role === "admin" && (
                  <div className="space-y-2">
                    <Label htmlFor="assignedStaff" className="font-display">
                      Assign Staff Member
                    </Label>
                    <Select
                      value={formData.assignedStaffId}
                      onValueChange={(value) => setFormData({ ...formData, assignedStaffId: value })}
                    >
                      <SelectTrigger id="assignedStaff">
                        <SelectValue placeholder="Select staff member" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Assignment</SelectItem>
                        {allUsers.filter(u => u.role === "staff").map(user => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    resetForm();
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-stone-900 hover:bg-stone-800"
                >
                  {editingClient ? "Update" : "Save"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
          <Input
            placeholder="Search clients by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 font-display"
          />
        </div>

        <AnimatePresence mode="popLayout">
          {filteredClients.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <User className="w-16 h-16 text-stone-300 mx-auto mb-4" />
              <h3 className="text-xl font-serif text-stone-700 mb-2">
                {searchQuery ? "No clients found" : "No clients yet"}
              </h3>
              <p className="text-stone-500 font-display">
                {searchQuery
                  ? "Try a different search term"
                  : "Add your first client to get started"}
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredClients.map((client, index) => (
                <motion.div
                  key={client.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  layout
                >
                  <Card className="border-stone-200 hover:shadow-lg transition-all duration-300">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center">
                            <span className="text-xl font-serif text-stone-600">
                              {client.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <CardTitle className="text-lg font-serif text-stone-900">
                              {client.name}
                            </CardTitle>
                            <p className="text-sm text-stone-500 font-display">
                              Added {new Date(client.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
<div className="flex gap-1">
                          <Link href={`/dashboard/clients/${client.id}`}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-stone-500 hover:text-blue-600"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(client)}
                            className="h-8 w-8 text-stone-500 hover:text-stone-900"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-stone-500 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle className="font-serif">
                                Delete Client?
                              </AlertDialogTitle>
                              <AlertDialogDescription className="font-display">
                                This will permanently delete {client.name} and all
                                associated data. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="font-display">
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(client.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {client.phone && (
                      <div className="flex items-center gap-2 text-sm text-stone-600">
                        <Phone className="w-4 h-4 text-stone-400" />
                        <span className="font-display">{client.phone}</span>
                      </div>
                    )}
                    {client.email && (
                      <div className="flex items-center gap-2 text-sm text-stone-600">
                        <Mail className="w-4 h-4 text-stone-400" />
                        <span className="truncate">{client.email}</span>
                      </div>
                    )}
                    {client.address && (
                      <div className="flex items-start gap-2 text-sm text-stone-600">
                        <MapPin className="w-4 h-4 text-stone-400 mt-0.5" />
                        <span className="line-clamp-2">
                          {client.address}
                        </span>
                      </div>
                    )}
                    {client.notes && (
                      <p className="text-sm text-stone-500 pt-2 border-t border-stone-100 line-clamp-2">
                        {client.notes}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
