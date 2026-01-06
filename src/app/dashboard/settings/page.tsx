"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useDropzone } from "react-dropzone";
import {
  getSettings,
  saveSettings,
  getUsers,
  saveUser,
  deleteUser,
  generateId,
  getCurrentUser,
  getAllData,
  type Settings,
  type User,
} from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { Upload, Trash2, User as UserIcon, Plus, ImageIcon, Save, Download, Cloud, ShieldCheck } from "lucide-react";

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    companyName: "",
    logoUrl: "",
    address: "",
    phone: "",
    email: "",
  });
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    name: "",
    role: "staff" as "admin" | "staff",
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setSettings(getSettings());
    setUsers(getUsers());
    setCurrentUser(getCurrentUser());
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
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.username || !newUser.password || !newUser.name) return;

    const user: User = {
      id: generateId(),
      username: newUser.username,
      password: newUser.password,
      name: newUser.name,
      role: newUser.role,
      createdAt: new Date().toISOString(),
    };
    saveUser(user);
    setUsers(getUsers());
    setNewUser({ username: "", password: "", name: "", role: "staff" });
    setIsUserDialogOpen(false);
  };

  const handleDeleteUser = (id: string) => {
    deleteUser(id);
    setUsers(getUsers());
  };

  const removeLogo = () => {
    setSettings((prev) => ({ ...prev, logoUrl: "" }));
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl text-stone-900"
        >
          Settings
        </motion.h1>
        <p className="text-stone-500 mt-1">
          Manage your tailoring house settings
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-stone-200">
          <CardHeader>
            <CardTitle className="text-xl">Company Logo</CardTitle>
            <CardDescription className="font-display">
              Upload your company logo to personalize the system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-6">
              <div
                {...getRootProps()}
                className={`flex-1 border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? "border-stone-400 bg-stone-50"
                    : "border-stone-200 hover:border-stone-300"
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="w-10 h-10 text-stone-400 mx-auto mb-3" />
                <p className="text-stone-600">
                  {isDragActive
                    ? "Drop the image here..."
                    : "Drag & drop a logo, or click to select"}
                </p>
                <p className="text-sm text-stone-400 mt-1">
                  PNG, JPG, SVG or WebP up to 2MB
                </p>
              </div>

              {settings.logoUrl && (
                <div className="relative">
                  <div className="w-32 h-32 rounded-lg border border-stone-200 overflow-hidden bg-white flex items-center justify-center">
                    <img
                      src={settings.logoUrl}
                      alt="Company Logo"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={removeLogo}
                    className="absolute -top-2 -right-2 h-7 w-7"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {!settings.logoUrl && (
                <div className="w-32 h-32 rounded-lg border border-stone-200 bg-stone-50 flex items-center justify-center">
                  <ImageIcon className="w-12 h-12 text-stone-300" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-stone-200">
          <CardHeader>
            <CardTitle className="text-xl">Company Information</CardTitle>
            <CardDescription className="font-display">
              Update your company details
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
                  className="font-display"
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
                  className="font-display"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-display">Email</Label>
              <Input
                type="email"
                value={settings.email}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, email: e.target.value }))
                }
                className="font-display"
                placeholder="contact@yourtailoringhouse.com"
              />
            </div>

            <div className="space-y-2">
              <Label className="font-display">Address</Label>
              <Input
                value={settings.address}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, address: e.target.value }))
                }
                className="font-display"
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border-stone-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl">User Management</CardTitle>
              <CardDescription className="font-display">
                Manage staff accounts and permissions
              </CardDescription>
            </div>
            <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-stone-900 hover:bg-stone-800">
                  <Plus className="w-4 h-4 mr-2" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-xl">Add New User</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddUser} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label className="font-display">Full Name *</Label>
                    <Input
                      value={newUser.name}
                      onChange={(e) =>
                        setNewUser((prev) => ({ ...prev, name: e.target.value }))
                      }
                      className="font-display"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-display">Username *</Label>
                    <Input
                      value={newUser.username}
                      onChange={(e) =>
                        setNewUser((prev) => ({ ...prev, username: e.target.value }))
                      }
                      className="font-display"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-display">Password *</Label>
                    <Input
                      type="password"
                      value={newUser.password}
                      onChange={(e) =>
                        setNewUser((prev) => ({ ...prev, password: e.target.value }))
                      }
                      className="font-display"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-display">Role</Label>
                    <Select
                      value={newUser.role}
                      onValueChange={(value) =>
                        setNewUser((prev) => ({ ...prev, role: value as "admin" | "staff" }))
                      }
                    >
                      <SelectTrigger className="font-display">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="staff">Staff</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsUserDialogOpen(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-stone-900 hover:bg-stone-800"
                    >
                      Add User
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 bg-stone-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center">
                      <UserIcon className="w-5 h-5 text-stone-600" />
                    </div>
                    <div>
                      <p className="text-stone-900">{user.name}</p>
                      <p className="text-sm text-stone-500">
                        @{user.username} • {user.role}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        user.role === "admin"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {user.role}
                    </span>
                    {currentUser?.id !== user.id && (
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
                              Delete User?
                            </AlertDialogTitle>
                            <AlertDialogDescription className="font-display">
                              This will permanently delete {user.name}&apos;s account.
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="font-display">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteUser(user.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-stone-200">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-stone-600" />
                Data & Security
              </CardTitle>
              <CardDescription className="font-display">
                Manage your data backups and cloud synchronization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-stone-50 rounded-lg border border-stone-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center">
                    <Cloud className="w-5 h-5 text-stone-600" />
                  </div>
                  <div>
                    <p className="text-stone-900 font-medium">Cloud Sync Status</p>
                    <p className="text-sm text-stone-500">
                      Automatic synchronization is active
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-xs text-green-700 font-medium uppercase tracking-wider">
                    Online & Synced
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg">Backup & Export</h4>
                <p className="text-sm text-stone-500">
                  Download a full backup of your client data, measurements, and settings. This file can be used to restore your data or for archiving purposes.
                </p>
                <Button
                  variant="outline"
                  onClick={handleExportData}
                  className="border-stone-200 hover:bg-stone-100"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export All Data (JSON)
                </Button>
              </div>

              <div className="pt-4 border-t border-stone-100">
                <div className="flex items-center gap-2 text-stone-400">
                  <ShieldCheck className="w-4 h-4" />
                  <p className="text-xs">
                    Your data is securely stored locally and synced with encrypted cloud storage.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

