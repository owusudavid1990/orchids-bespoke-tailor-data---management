"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getAlterations,
  getClients,
  getUsers,
  saveAlteration,
  deleteAlteration,
  saveClient,
  generateId,
  type Alteration,
  type AlterationMeasurement,
  type Client,
  type User,
} from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Plus, Search, Pencil, Trash2, Scissors, Calendar, UserCheck, UserPlus, FileText, Minus } from "lucide-react";
import Link from "next/link";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700",
  "in-progress": "bg-blue-50 text-blue-700",
  completed: "bg-green-50 text-green-700",
  "picked-up": "bg-stone-100 text-stone-600",
};

const garmentTypes = [
  "Suit Jacket",
  "Trousers",
  "Waistcoat",
  "Shirt",
  "Overcoat",
  "Dress",
  "Skirt",
  "Other",
];

const commonAlterations = [
  "Shorten sleeves",
  "Lengthen sleeves",
  "Take in waist",
  "Let out waist",
  "Take in sides",
  "Let out sides",
  "Shorten hem",
  "Lengthen hem",
  "Adjust shoulders",
  "Taper legs",
  "Take up inseam",
  "Adjust collar",
  "Replace buttons",
  "Replace lining",
  "Repair seams",
  "Repair zipper",
];

const defaultMeasurements: AlterationMeasurement[] = [
  { label: "Chest", original: null, altered: null },
  { label: "Waist", original: null, altered: null },
  { label: "Hips", original: null, altered: null },
  { label: "Shoulders", original: null, altered: null },
  { label: "Sleeve Length", original: null, altered: null },
  { label: "Jacket Length", original: null, altered: null },
  { label: "Trouser Length", original: null, altered: null },
  { label: "Inseam", original: null, altered: null },
];

const defaultAlteration: Omit<Alteration, "id" | "createdAt" | "updatedAt"> = {
  clientId: "",
  orderId: "",
  garmentType: "",
  description: "",
  alterations: [],
  measurements: defaultMeasurements,
  status: "pending",
  assignedStaffId: "",
  price: "",
  dueDate: "",
  notes: "",
};

export default function AlterationsPage() {
  const [alterations, setAlterations] = useState<Alteration[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAlteration, setEditingAlteration] = useState<Alteration | null>(null);
  const [formData, setFormData] = useState<Omit<Alteration, "id" | "createdAt" | "updatedAt">>(defaultAlteration);
  const [isNewClientDialogOpen, setIsNewClientDialogOpen] = useState(false);
  const [newClientData, setNewClientData] = useState({ name: "", email: "", phone: "" });
  const [newMeasurementLabel, setNewMeasurementLabel] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setAlterations(getAlterations());
    setClients(getClients());
    setUsers(getUsers());
  };

  const staffMembers = users.filter((u) => u.role === "staff" || u.role === "admin");

  const getClientName = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    return client?.name || "Unknown Client";
  };

  const getStaffName = (staffId?: string) => {
    if (!staffId) return "Unassigned";
    const staff = users.find((u) => u.id === staffId);
    return staff?.name || "Unknown";
  };

  const filteredAlterations = alterations.filter((a) => {
    const clientName = getClientName(a.clientId).toLowerCase();
    const matchesSearch =
      clientName.includes(searchQuery.toLowerCase()) ||
      a.garmentType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientId || !formData.garmentType) return;

    const now = new Date().toISOString();
    const alteration: Alteration = {
      id: editingAlteration?.id || generateId(),
      ...formData,
      createdAt: editingAlteration?.createdAt || now,
      updatedAt: now,
    };
    saveAlteration(alteration);
    loadData();
    resetForm();
    setIsDialogOpen(false);
  };

  const handleEdit = (alteration: Alteration) => {
    setEditingAlteration(alteration);
    setFormData({
      clientId: alteration.clientId,
      orderId: alteration.orderId,
      garmentType: alteration.garmentType,
      description: alteration.description,
      alterations: alteration.alterations,
      measurements: alteration.measurements || defaultMeasurements,
      status: alteration.status,
      assignedStaffId: alteration.assignedStaffId || "",
      price: alteration.price,
      dueDate: alteration.dueDate,
      notes: alteration.notes,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteAlteration(id);
    loadData();
  };

  const handleStatusChange = (alterationId: string, newStatus: Alteration["status"]) => {
    const alteration = alterations.find((a) => a.id === alterationId);
    if (alteration) {
      saveAlteration({ ...alteration, status: newStatus, updatedAt: new Date().toISOString() });
      loadData();
    }
  };

  const handleStaffAssign = (alterationId: string, staffId: string) => {
    const alteration = alterations.find((a) => a.id === alterationId);
    if (alteration) {
      saveAlteration({ ...alteration, assignedStaffId: staffId || undefined, updatedAt: new Date().toISOString() });
      loadData();
    }
  };

  const resetForm = () => {
    setEditingAlteration(null);
    setFormData(defaultAlteration);
  };

  const updateField = (key: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const toggleAlteration = (alteration: string) => {
    const current = formData.alterations;
    if (current.includes(alteration)) {
      updateField("alterations", current.filter((a) => a !== alteration));
    } else {
      updateField("alterations", [...current, alteration]);
    }
  };

  const updateMeasurement = (index: number, field: "original" | "altered", value: number | null) => {
    const updated = [...formData.measurements];
    updated[index] = { ...updated[index], [field]: value };
    setFormData((prev) => ({ ...prev, measurements: updated }));
  };

  const adjustMeasurement = (index: number, field: "original" | "altered", delta: number) => {
    const current = formData.measurements[index][field] || 0;
    updateMeasurement(index, field, Math.max(0, current + delta));
  };

  const addCustomMeasurement = () => {
    if (!newMeasurementLabel.trim()) return;
    const newMeasurement: AlterationMeasurement = {
      label: newMeasurementLabel.trim(),
      original: null,
      altered: null,
    };
    setFormData((prev) => ({ ...prev, measurements: [...prev.measurements, newMeasurement] }));
    setNewMeasurementLabel("");
  };

  const removeMeasurement = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      measurements: prev.measurements.filter((_, i) => i !== index),
    }));
  };

  const handleCreateNewClient = () => {
    if (!newClientData.name.trim()) return;
    
    const now = new Date().toISOString();
    const newClient: Client = {
      id: generateId(),
      name: newClientData.name.trim(),
      email: newClientData.email.trim(),
      phone: newClientData.phone.trim(),
      address: "",
      notes: "",
      createdAt: now,
      updatedAt: now,
    };
    
    saveClient(newClient);
    loadData();
    updateField("clientId", newClient.id);
    setNewClientData({ name: "", email: "", phone: "" });
    setIsNewClientDialogOpen(false);
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
            Alterations
          </motion.h1>
          <p className="text-stone-500 font-display mt-1">
            Manage alteration services
          </p>
        </div>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button className="bg-stone-900 hover:bg-stone-800 font-display">
              <Plus className="w-4 h-4 mr-2" />
              New Alteration
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-serif">
                {editingAlteration ? "Edit Alteration" : "New Alteration"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-display">Select Client *</Label>
                  <div className="flex gap-2">
                    <Select
                      value={formData.clientId}
                      onValueChange={(value) => updateField("clientId", value)}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Choose a client" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Dialog open={isNewClientDialogOpen} onOpenChange={setIsNewClientDialogOpen}>
                      <DialogTrigger asChild>
                        <Button type="button" variant="outline" size="icon" className="shrink-0">
                          <UserPlus className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle className="text-xl">New Client</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                          <div className="space-y-2">
                            <Label className="font-display">Name *</Label>
                            <Input
                              value={newClientData.name}
                              onChange={(e) => setNewClientData(prev => ({ ...prev, name: e.target.value }))}
                              className="font-display"
                              placeholder="Client name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="font-display">Email</Label>
                            <Input
                              type="email"
                              value={newClientData.email}
                              onChange={(e) => setNewClientData(prev => ({ ...prev, email: e.target.value }))}
                              className="font-display"
                              placeholder="client@email.com"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="font-display">Phone</Label>
                            <Input
                              value={newClientData.phone}
                              onChange={(e) => setNewClientData(prev => ({ ...prev, phone: e.target.value }))}
                              className="font-display"
                              placeholder="Phone number"
                            />
                          </div>
                          <div className="flex gap-3 pt-4 border-t">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setIsNewClientDialogOpen(false);
                                setNewClientData({ name: "", email: "", phone: "" });
                              }}
                              className="flex-1"
                            >
                              Cancel
                            </Button>
                            <Button
                              type="button"
                              onClick={handleCreateNewClient}
                              disabled={!newClientData.name.trim()}
                              className="flex-1 bg-stone-900 hover:bg-stone-800"
                            >
                              Create Client
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-display">Garment Type *</Label>
                  <Select
                    value={formData.garmentType}
                    onValueChange={(value) => updateField("garmentType", value)}
                  >
                    <SelectTrigger className="font-display">
                      <SelectValue placeholder="Select garment" />
                    </SelectTrigger>
                    <SelectContent>
                      {garmentTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-display">Description</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  className="font-display"
                  placeholder="Brief description of the item..."
                />
              </div>

              <div className="space-y-2">
                <Label className="font-display">Measurements</Label>
                <div className="border border-stone-200 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-stone-100">
                      <tr>
                        <th className="text-left px-3 py-2 font-medium text-stone-700">Part</th>
                        <th className="text-center px-3 py-2 font-medium text-stone-700">Original</th>
                        <th className="text-center px-3 py-2 font-medium text-stone-700">Altered</th>
                        <th className="w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {formData.measurements.map((m, index) => (
                        <tr key={index} className="hover:bg-stone-50">
                          <td className="px-3 py-2 text-stone-700">{m.label}</td>
                          <td className="px-3 py-1">
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-stone-500 hover:text-stone-900"
                                onClick={() => adjustMeasurement(index, "original", -0.5)}
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <Input
                                type="number"
                                step="0.5"
                                value={m.original ?? ""}
                                onChange={(e) => updateMeasurement(index, "original", e.target.value ? parseFloat(e.target.value) : null)}
                                className="w-16 h-7 text-center text-sm px-1"
                                placeholder="-"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-stone-500 hover:text-stone-900"
                                onClick={() => adjustMeasurement(index, "original", 0.5)}
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                          </td>
                          <td className="px-3 py-1">
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-stone-500 hover:text-stone-900"
                                onClick={() => adjustMeasurement(index, "altered", -0.5)}
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <Input
                                type="number"
                                step="0.5"
                                value={m.altered ?? ""}
                                onChange={(e) => updateMeasurement(index, "altered", e.target.value ? parseFloat(e.target.value) : null)}
                                className="w-16 h-7 text-center text-sm px-1"
                                placeholder="-"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-stone-500 hover:text-stone-900"
                                onClick={() => adjustMeasurement(index, "altered", 0.5)}
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                          </td>
                          <td className="px-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-stone-400 hover:text-red-600"
                              onClick={() => removeMeasurement(index)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="p-2 bg-stone-50 border-t border-stone-200">
                    <div className="flex gap-2">
                      <Input
                        value={newMeasurementLabel}
                        onChange={(e) => setNewMeasurementLabel(e.target.value)}
                        placeholder="Add custom measurement..."
                        className="h-8 text-sm"
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomMeasurement())}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addCustomMeasurement}
                        disabled={!newMeasurementLabel.trim()}
                        className="font-display"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-display">Alterations Required</Label>
                <div className="grid grid-cols-2 gap-2 p-3 bg-stone-50 rounded-lg max-h-48 overflow-y-auto">
                  {commonAlterations.map((alteration) => (
                    <div key={alteration} className="flex items-center space-x-2">
                      <Checkbox
                        id={alteration}
                        checked={formData.alterations.includes(alteration)}
                        onCheckedChange={() => toggleAlteration(alteration)}
                      />
                      <label
                        htmlFor={alteration}
                        className="text-sm text-stone-700 cursor-pointer"
                      >
                        {alteration}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-display">Price</Label>
                  <Input
                    value={formData.price}
                    onChange={(e) => updateField("price", e.target.value)}
                    className="font-display"
                    placeholder="e.g., $75"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-display">Due Date</Label>
                  <Input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => updateField("dueDate", e.target.value)}
                    className="font-display"
                  />
                </div>
              </div>

<div className="space-y-2">
                  <Label className="font-display">Notes</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => updateField("notes", e.target.value)}
                    className="resize-none"
                    rows={2}
                    placeholder="Additional notes..."
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-display">Assign Staff</Label>
<Select
                      value={formData.assignedStaffId || "unassigned"}
                      onValueChange={(value) => updateField("assignedStaffId", value === "unassigned" ? "" : value)}
                    >
                      <SelectTrigger className="font-display">
                        <SelectValue placeholder="Select staff member" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {staffMembers.map((staff) => (
                          <SelectItem key={staff.id} value={staff.id}>
                            {staff.name} ({staff.role})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                </div>

                {editingAlteration && (
                <div className="space-y-2">
                  <Label className="font-display">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => updateField("status", value)}
                  >
                    <SelectTrigger className="font-display">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="picked-up">Picked Up</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t">
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
                  disabled={!formData.clientId || !formData.garmentType}
                  className="flex-1 bg-stone-900 hover:bg-stone-800"
                >
                  {editingAlteration ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
          <Input
            placeholder="Search by client or garment type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px] h-12">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="picked-up">Picked Up</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <AnimatePresence mode="popLayout">
        {filteredAlterations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Scissors className="w-16 h-16 text-stone-300 mx-auto mb-4" />
            <h3 className="text-xl text-stone-700 mb-2">
              {searchQuery || statusFilter !== "all"
                ? "No alterations found"
                : "No alterations yet"}
            </h3>
            <p className="text-stone-500">
              {clients.length === 0
                ? "Add a client first to create alterations"
                : "Create your first alteration request to get started"}
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAlterations.map((alteration, index) => (
              <motion.div
                key={alteration.id}
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
                        <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
                          <Scissors className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg text-stone-900">
                            {alteration.garmentType}
                          </CardTitle>
                          <p className="text-sm text-stone-500">
                            {getClientName(alteration.clientId)}
                          </p>
                        </div>
                      </div>
<div className="flex gap-1">
                          <Link href={`/dashboard/alterations/docket/${alteration.id}`}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-stone-500 hover:text-emerald-600"
                            >
                              <FileText className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(alteration)}
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
                                Delete Alteration?
                              </AlertDialogTitle>
                              <AlertDialogDescription className="font-display">
                                This will permanently delete this alteration request.
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="font-display">
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(alteration.id)}
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
                  <CardContent className="space-y-3">
                    {alteration.description && (
                      <p className="text-sm text-stone-600">
                        {alteration.description}
                      </p>
                    )}

                    {alteration.alterations.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {alteration.alterations.slice(0, 3).map((alt) => (
                          <span
                            key={alt}
                            className="text-xs px-2 py-1 rounded-full bg-stone-100 text-stone-600"
                          >
                            {alt}
                          </span>
                        ))}
                        {alteration.alterations.length > 3 && (
                          <span className="text-xs px-2 py-1 rounded-full bg-stone-100 text-stone-600">
                            +{alteration.alterations.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm">
                      <UserCheck className="w-4 h-4 text-stone-400" />
                      <Select
                        value={alteration.assignedStaffId || "unassigned"}
                        onValueChange={(value) => handleStaffAssign(alteration.id, value === "unassigned" ? "" : value)}
                      >
                        <SelectTrigger className="h-7 w-auto px-2 text-xs border-stone-200">
                          <SelectValue placeholder="Assign staff" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unassigned">Unassigned</SelectItem>
                          {staffMembers.map((staff) => (
                            <SelectItem key={staff.id} value={staff.id}>
                              {staff.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                      <div className="flex items-center gap-4">
                        {alteration.price && (
                          <span className="text-sm font-medium text-stone-900">
                            {alteration.price}
                          </span>
                        )}
                        {alteration.dueDate && (
                          <div className="flex items-center gap-1 text-sm text-stone-500">
                            <Calendar className="w-4 h-4" />
                            <span className="font-display">
                              {new Date(alteration.dueDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                      <Select
                        value={alteration.status}
                        onValueChange={(value) =>
                          handleStatusChange(alteration.id, value as Alteration["status"])
                        }
                      >
                        <SelectTrigger
                          className={`w-auto h-8 px-3 text-xs border-0 ${statusColors[alteration.status]}`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="picked-up">Picked Up</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
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
