"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import * as XLSX from 'xlsx';
import {
  getSettings,
  saveSettings,
  getCurrentUser,
  getAllData,
  getUsers,
  saveUser,
  deleteUser,
  generateId,
  getOrders,
  getAlterations,
  getClients,
  type Settings,
  type User,
  type SuitOrder,
  type Alteration,
  type Client,
} from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Upload,
  Trash2,
  ImageIcon,
  Save,
  Download,
  Cloud,
  AlertCircle,
  Users,
  UserPlus,
  Shield,
  UserCheck,
  MoreVertical,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Briefcase,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Link from "next/link";

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    companyName: "",
    logoUrl: "",
    address: "",
    phone: "",
    email: "",
  });

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isAssignedModalOpen, setIsAssignedModalOpen] = useState(false);
  const [selectedStaffAssignments, setSelectedStaffAssignments] = useState<{
    staffName: string;
    orders: SuitOrder[];
    alterations: Alteration[];
    clients: Client[];
  }>({ staffName: "", orders: [], alterations: [], clients: [] });

  const [newUser, setNewUser] = useState<Partial<User>>({
    username: "",
    password: "",
    name: "",
    role: "staff",
    email: "",
    phone: "",
    address: "",
    staffId: "",
    department: "",
    notes: "",
    isActive: true,
  });

  useEffect(() => {
    setSettings(getSettings());
    setCurrentUser(getCurrentUser());
    setUsers(getUsers());
  }, []);

  const handleExportData = () => {
    const data = getAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tailoring_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportExcel = () => {
    const data = getAllData();
    const wb = XLSX.utils.book_new();

    const sheetMap: Record<string, string> = {
      CLIENTS: 'Clients',
      ORDERS: 'Suit Orders',
      ALTERATIONS: 'Alterations',
      MEASUREMENTS: 'Measurements',
      APPOINTMENTS: 'Appointments',
      FABRICS: 'Fabrics',
      USERS: 'Staff & Users',
      TEMPLATES: 'Measurement Templates'
    };

    Object.entries(data).forEach(([key, storageKey]) => {
      const value = data[key];
      if (Array.isArray(value) && value.length > 0 && sheetMap[key]) {
        // Flatten nested structures if necessary for Excel
        const flattenedData = value.map(item => {
          const newItem = { ...item };
          // Stringify any arrays or objects for Excel cell compatibility
          Object.keys(newItem).forEach(k => {
            if (typeof newItem[k] === 'object' && newItem[k] !== null) {
              newItem[k] = JSON.stringify(newItem[k]);
            }
          });
          return newItem;
        });
        const ws = XLSX.utils.json_to_sheet(flattenedData);
        XLSX.utils.book_append_sheet(wb, ws, sheetMap[key]);
      }
    });

    XLSX.writeFile(wb, `tailoring_database_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success("Excel database generated successfully");
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings((prev) => ({ ...prev, logoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".svg", ".webp"],
    },
    maxFiles: 1,
  });

  const handleSaveSettings = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    saveSettings(settings);
    setIsSaving(false);
    toast.success("Settings saved successfully");
  };

  const removeLogo = () => {
    setSettings((prev) => ({ ...prev, logoUrl: "" }));
  };

  const handleSaveUser = () => {
    if (!newUser.username || !newUser.name || (!editingUser && !newUser.password)) {
      toast.error("Please fill in all required fields");
      return;
    }

    const userToSave: User = {
      id: editingUser?.id || generateId(),
      username: newUser.username!,
      password: newUser.password || editingUser?.password || "",
      name: newUser.name!,
      role: newUser.role as "admin" | "staff",
      email: newUser.email,
      phone: newUser.phone,
      address: newUser.address,
      staffId: newUser.staffId,
      department: newUser.department,
      notes: newUser.notes,
      isActive: newUser.isActive ?? true,
      createdAt: editingUser?.createdAt || new Date().toISOString(),
    };

    saveUser(userToSave);
    setUsers(getUsers());
    setIsUserModalOpen(false);
    setEditingUser(null);
    setNewUser({
      username: "",
      password: "",
      name: "",
      role: "staff",
      email: "",
      phone: "",
      address: "",
      staffId: "",
      department: "",
      notes: "",
      isActive: true,
    });
    toast.success(editingUser ? "User updated" : "User added");
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setNewUser({ ...user });
    setIsUserModalOpen(true);
  };

  const handleToggleUserStatus = (user: User) => {
    const updatedUser = { ...user, isActive: !user.isActive };
    saveUser(updatedUser);
    setUsers(getUsers());
    toast.success(`User ${updatedUser.isActive ? "activated" : "deactivated"}`);
  };

  const handleViewAssignments = (staff: User) => {
    const allOrders = getOrders();
    const allAlterations = getAlterations();
    const allClients = getClients();

    const staffOrders = allOrders.filter(o => o.assignedStaffId === staff.id);
    const staffAlterations = allAlterations.filter(a => a.assignedStaffId === staff.id);
    
    // Find unique clients associated with these orders/alterations
    const clientIds = new Set([
      ...staffOrders.map(o => o.clientId),
      ...staffAlterations.map(a => a.clientId)
    ]);
    
    const staffClients = allClients.filter(c => clientIds.has(c.id));

    setSelectedStaffAssignments({
      staffName: staff.name,
      orders: staffOrders,
      alterations: staffAlterations,
      clients: staffClients
    });
    setIsAssignedModalOpen(true);
  };

  if (!currentUser || currentUser.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <Shield className="w-16 h-16 text-stone-300 mb-4" />
        <h2 className="text-2xl font-light text-stone-900">Access Restricted</h2>
        <p className="text-stone-500 mt-2 max-w-md">
          Only administrators can access the system settings and user management.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl text-stone-900"
          >
            Settings & Management
          </motion.h1>
          <p className="text-stone-500 mt-1">
            Manage your tailoring house and staff profiles
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* User Management Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-stone-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    User Management
                  </CardTitle>
                  <CardDescription className="font-display">
                    Manage system administrators and staff members
                  </CardDescription>
                </div>
                <Button 
                  onClick={() => {
                    setEditingUser(null);
                    setNewUser({
                      username: "",
                      password: "",
                      name: "",
                      role: "staff",
                      email: "",
                      phone: "",
                      address: "",
                      staffId: "",
                      department: "",
                      notes: "",
                      isActive: true,
                    });
                    setIsUserModalOpen(true);
                  }}
                  className="bg-stone-900 hover:bg-stone-800"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add User
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {users.map((user) => (
                    <motion.div
                      key={user.id}
                      layout
                      className={`p-4 rounded-xl border transition-all ${
                        user.isActive 
                          ? "bg-white border-stone-200" 
                          : "bg-stone-50 border-stone-100 opacity-60"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-medium ${
                            user.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-stone-100 text-stone-700'
                          }`}>
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-stone-900">{user.name}</h3>
                              <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="text-[10px] uppercase tracking-wider h-4">
                                {user.role}
                              </Badge>
                            </div>
                            <p className="text-xs text-stone-500">@{user.username}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-stone-400 hover:text-stone-900"
                            onClick={() => handleEditUser(user)}
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        {user.email && (
                          <div className="flex items-center gap-2 text-xs text-stone-600">
                            <Mail className="w-3 h-3 text-stone-400" />
                            {user.email}
                          </div>
                        )}
                        {user.phone && (
                          <div className="flex items-center gap-2 text-xs text-stone-600">
                            <Phone className="w-3 h-3 text-stone-400" />
                            {user.phone}
                          </div>
                        )}
                        {user.address && (
                          <div className="flex items-center gap-2 text-xs text-stone-600">
                            <MapPin className="w-3 h-3 text-stone-400" />
                            <span className="truncate">{user.address}</span>
                          </div>
                        )}
                        {user.staffId && (
                          <div className="flex items-center gap-2 text-xs text-stone-600">
                            <Shield className="w-3 h-3 text-stone-400" />
                            <span>ID: {user.staffId}</span>
                          </div>
                        )}
                        {user.department && (
                          <div className="flex items-center gap-2 text-xs text-stone-600">
                            <Briefcase className="w-3 h-3 text-stone-400" />
                            <span>{user.department}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-stone-500 hover:text-stone-900 h-7 text-xs px-2"
                          onClick={() => handleViewAssignments(user)}
                        >
                          <Briefcase className="w-3 h-3 mr-1" />
                          View Assigned
                        </Button>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`h-7 text-xs px-2 ${user.isActive ? 'text-red-500 hover:text-red-600 hover:bg-red-50' : 'text-green-600 hover:text-green-700 hover:bg-green-50'}`}
                            onClick={() => handleToggleUserStatus(user)}
                          >
                            {user.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Company Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-stone-200">
              <CardHeader>
                <CardTitle className="text-xl">Company Information</CardTitle>
                <CardDescription className="font-display">
                  Update your tailoring house details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-display">Company Name</Label>
                    <Input
                      value={settings.companyName}
                      onChange={(e) =>
                        setSettings((prev) => ({ ...prev, companyName: e.target.value }))
                      }
                      className="font-display border-stone-200 focus:border-stone-400"
                      placeholder="Your Tailoring House"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-display">Phone</Label>
                    <Input
                      value={settings.phone}
                      onChange={(e) =>
                        setSettings((prev) => ({ ...prev, phone: e.target.value }))
                      }
                      className="font-display border-stone-200 focus:border-stone-400"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-display">Email Address</Label>
                  <Input
                    type="email"
                    value={settings.email}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, email: e.target.value }))
                    }
                    className="font-display border-stone-200 focus:border-stone-400"
                    placeholder="contact@yourtailoringhouse.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-display">Physical Address</Label>
                  <Input
                    value={settings.address}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, address: e.target.value }))
                    }
                    className="font-display border-stone-200 focus:border-stone-400"
                    placeholder="123 Fashion Street, New York, NY 10001"
                  />
                </div>

                <Button
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                  className="bg-stone-900 hover:bg-stone-800"
                >
                  {isSaving ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                      />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="space-y-8">
          {/* Logo Upload */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-stone-200">
              <CardHeader>
                <CardTitle className="text-xl">Branding</CardTitle>
                <CardDescription className="font-display">
                  Official company logo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                    isDragActive
                      ? "border-stone-400 bg-stone-50"
                      : "border-stone-200 hover:border-stone-300"
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                  <p className="text-xs text-stone-600">
                    {isDragActive ? "Drop here" : "Click to upload logo"}
                  </p>
                </div>

                {settings.logoUrl ? (
                  <div className="relative w-full aspect-video rounded-lg border border-stone-200 overflow-hidden bg-white flex items-center justify-center">
                    <img
                      src={settings.logoUrl}
                      alt="Company Logo"
                      className="max-w-full max-h-full object-contain p-4"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={removeLogo}
                      className="absolute top-2 right-2 h-8 w-8"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="w-full aspect-video rounded-lg border border-stone-200 bg-stone-50 flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-stone-200" />
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Data & Backup */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-stone-200">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  System Health
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-stone-50 rounded-lg border border-stone-100">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-stone-900 font-medium text-sm">Cloud Sync</p>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-[10px] text-green-700 font-semibold uppercase">Active</span>
                    </div>
                  </div>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    All data is synchronized with your cloud database in real-time.
                  </p>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Backup Operations</h4>
                  <Button
                    variant="outline"
                    onClick={handleExportData}
                    className="w-full border-stone-200 hover:bg-stone-100 justify-start"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Complete Database (JSON)
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleExportExcel}
                    className="w-full border-stone-200 hover:bg-stone-100 justify-start"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Complete Database (Excel)
                  </Button>
                  <p className="text-[10px] text-stone-400 text-center">
                    Last backup performed: Today
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Add/Edit User Dialog */}
      <Dialog open={isUserModalOpen} onOpenChange={setIsUserModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingUser ? "Edit User Profile" : "Add New User"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Select
                  value={newUser.role}
                  onValueChange={(value) => setNewUser({ ...newUser, role: value as any })}
                >
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrator</SelectItem>
                    <SelectItem value="staff">Staff Member</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  placeholder="jdoe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{editingUser ? "New Password (optional)" : "Password *"}</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="john@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Physical Address</Label>
              <Input
                id="address"
                value={newUser.address}
                onChange={(e) => setNewUser({ ...newUser, address: e.target.value })}
                placeholder="123 Staff Lane, City, State"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="staffId">Staff ID</Label>
                <Input
                  id="staffId"
                  value={newUser.staffId}
                  onChange={(e) => setNewUser({ ...newUser, staffId: e.target.value })}
                  placeholder="EMP-001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={newUser.department}
                  onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                  placeholder="Tailoring"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Internal Notes</Label>
              <Input
                id="notes"
                value={newUser.notes}
                onChange={(e) => setNewUser({ ...newUser, notes: e.target.value })}
                placeholder="Specializes in alterations..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUserModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveUser} className="bg-stone-900 hover:bg-stone-800">
              {editingUser ? "Update User" : "Create User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Assignments Dialog */}
      <Dialog open={isAssignedModalOpen} onOpenChange={setIsAssignedModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Assigned to {selectedStaffAssignments.staffName}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto pr-2 space-y-6 py-4">
            {selectedStaffAssignments.clients.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-stone-500" />
                  Associated Clients
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {selectedStaffAssignments.clients.map(client => (
                    <Link 
                      key={client.id} 
                      href={`/dashboard/clients/${client.id}`}
                      className="flex items-center justify-between p-3 rounded-lg border border-stone-100 bg-stone-50 hover:bg-stone-100 transition-colors group"
                    >
                      <span className="font-medium text-stone-900">{client.name}</span>
                      <ExternalLink className="w-4 h-4 text-stone-300 group-hover:text-stone-600 transition-colors" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {selectedStaffAssignments.orders.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-stone-500" />
                  Active Suit Orders
                </h4>
                <div className="space-y-2">
                  {selectedStaffAssignments.orders.map(order => (
                    <div key={order.id} className="p-3 rounded-lg border border-stone-100 bg-white">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-stone-900">{order.orderName}</span>
                        <Badge variant="outline" className="text-[10px]">{order.status}</Badge>
                      </div>
                      <p className="text-xs text-stone-500">Due: {new Date(order.dueDate).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedStaffAssignments.alterations.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-stone-500" />
                  Alteration Jobs
                </h4>
                <div className="space-y-2">
                  {selectedStaffAssignments.alterations.map(alt => (
                    <div key={alt.id} className="p-3 rounded-lg border border-stone-100 bg-white">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-stone-900">{alt.garmentType}</span>
                        <Badge variant="outline" className="text-[10px]">{alt.status}</Badge>
                      </div>
                      <p className="text-xs text-stone-500">{alt.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedStaffAssignments.clients.length === 0 && 
             selectedStaffAssignments.orders.length === 0 && 
             selectedStaffAssignments.alterations.length === 0 && (
              <div className="py-12 text-center">
                <Briefcase className="w-12 h-12 text-stone-200 mx-auto mb-3" />
                <p className="text-stone-500">No active assignments found for this staff member.</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsAssignedModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
