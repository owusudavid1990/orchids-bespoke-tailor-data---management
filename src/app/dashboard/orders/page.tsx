"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getOrders,
  getClients,
  getMeasurements,
  getFabrics,
  getUsers,
  saveOrder,
  deleteOrder,
  generateId,
  type SuitOrder,
  type Client,
  type Measurement,
  type FabricSelection,
  type User,
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
import { Plus, Search, Pencil, Trash2, Shirt, Calendar } from "lucide-react";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700",
  "in-progress": "bg-blue-50 text-blue-700",
  fitting: "bg-purple-50 text-purple-700",
  alterations: "bg-orange-50 text-orange-700",
  completed: "bg-green-50 text-green-700",
  delivered: "bg-stone-100 text-stone-600",
};

const defaultOrder: Omit<SuitOrder, "id" | "createdAt" | "updatedAt"> = {
  clientId: "",
  measurementId: "",
  fabricSelectionId: "",
  suitStyle: "single-breasted",
  lapelStyle: "notch",
  ventStyle: "single",
  buttons: "2",
  pocketStyle: "flap",
  liningType: "",
  liningColor: "",
  trouserStyle: "flat-front",
  trouserCuff: "uncuffed",
  specialInstructions: "",
  status: "pending",
  dueDate: "",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<SuitOrder[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [fabrics, setFabrics] = useState<FabricSelection[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<SuitOrder | null>(null);
  const [formData, setFormData] = useState<Omit<SuitOrder, "id" | "createdAt" | "updatedAt">>(defaultOrder);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setOrders(getOrders());
    setClients(getClients());
    setMeasurements(getMeasurements());
    setFabrics(getFabrics());
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

  const getFabricName = (fabricId: string) => {
    const fabric = fabrics.find((f) => f.id === fabricId);
    return fabric?.fabricName || fabric?.fabricCode || "Unknown Fabric";
  };

  const filteredOrders = orders.filter((o) => {
    const clientName = getClientName(o.clientId).toLowerCase();
    const matchesSearch = clientName.includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const clientMeasurements = formData.clientId
    ? measurements.filter((m) => m.clientId === formData.clientId)
    : [];

  const clientFabrics = formData.clientId
    ? fabrics.filter((f) => f.clientId === formData.clientId)
    : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientId) return;

    const now = new Date().toISOString();
    const order: SuitOrder = {
      id: editingOrder?.id || generateId(),
      ...formData,
      createdAt: editingOrder?.createdAt || now,
      updatedAt: now,
    };
    saveOrder(order);
    loadData();
    resetForm();
    setIsDialogOpen(false);
  };

  const handleEdit = (order: SuitOrder) => {
    setEditingOrder(order);
    setFormData({
      clientId: order.clientId,
      measurementId: order.measurementId,
      fabricSelectionId: order.fabricSelectionId,
      suitStyle: order.suitStyle,
      lapelStyle: order.lapelStyle,
      ventStyle: order.ventStyle,
      buttons: order.buttons,
      pocketStyle: order.pocketStyle,
      liningType: order.liningType,
      liningColor: order.liningColor,
      trouserStyle: order.trouserStyle,
      trouserCuff: order.trouserCuff,
      specialInstructions: order.specialInstructions,
      status: order.status,
      assignedStaffId: order.assignedStaffId || "",
      dueDate: order.dueDate,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteOrder(id);
    loadData();
  };

  const handleStatusChange = (orderId: string, newStatus: SuitOrder["status"]) => {
    const order = orders.find((o) => o.id === orderId);
    if (order) {
      saveOrder({ ...order, status: newStatus, updatedAt: new Date().toISOString() });
      loadData();
    }
  };

  const handleStaffAssign = (orderId: string, staffId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (order) {
      saveOrder({ ...order, assignedStaffId: staffId || undefined, updatedAt: new Date().toISOString() });
      loadData();
    }
  };

  const resetForm = () => {
    setEditingOrder(null);
    setFormData(defaultOrder);
  };

  const updateField = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl text-stone-900"
          >
            Suit Orders
          </motion.h1>
          <p className="text-stone-500 mt-1">
            Manage bespoke suit orders
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
            <Button className="bg-stone-900 hover:bg-stone-800">
              <Plus className="w-4 h-4 mr-2" />
              New Order
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">
                {editingOrder ? "Edit Order" : "New Suit Order"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-display">Select Client *</Label>
                  <Select
                    value={formData.clientId}
                    onValueChange={(value) => {
                      updateField("clientId", value);
                      updateField("measurementId", "");
                      updateField("fabricSelectionId", "");
                    }}
                  >
                    <SelectTrigger className="font-display">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-display">Measurement</Label>
                  <Select
                    value={formData.measurementId}
                    onValueChange={(value) => updateField("measurementId", value)}
                    disabled={!formData.clientId}
                  >
                    <SelectTrigger className="font-display">
                      <SelectValue placeholder="Select measurement" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientMeasurements.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {new Date(m.createdAt).toLocaleDateString()} - {m.bodyStructure}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="font-display">Fabric</Label>
                  <Select
                    value={formData.fabricSelectionId}
                    onValueChange={(value) => updateField("fabricSelectionId", value)}
                    disabled={!formData.clientId}
                  >
                    <SelectTrigger className="font-display">
                      <SelectValue placeholder="Select fabric" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientFabrics.map((f) => (
                        <SelectItem key={f.id} value={f.id}>
                          {f.fabricCode} - {f.fabricName || f.color}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="border-t border-stone-200 pt-4">
                <h3 className="text-lg text-stone-900 mb-4">Jacket Details</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="font-display">Style</Label>
                    <Select
                      value={formData.suitStyle}
                      onValueChange={(value) => updateField("suitStyle", value)}
                    >
                      <SelectTrigger className="font-display">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single-breasted">Single Breasted</SelectItem>
                        <SelectItem value="double-breasted">Double Breasted</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-display">Lapel</Label>
                    <Select
                      value={formData.lapelStyle}
                      onValueChange={(value) => updateField("lapelStyle", value)}
                    >
                      <SelectTrigger className="font-display">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="notch">Notch</SelectItem>
                        <SelectItem value="peak">Peak</SelectItem>
                        <SelectItem value="shawl">Shawl</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-display">Buttons</Label>
                    <Select
                      value={formData.buttons}
                      onValueChange={(value) => updateField("buttons", value)}
                    >
                      <SelectTrigger className="font-display">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Button</SelectItem>
                        <SelectItem value="2">2 Buttons</SelectItem>
                        <SelectItem value="3">3 Buttons</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-display">Vent</Label>
                    <Select
                      value={formData.ventStyle}
                      onValueChange={(value) => updateField("ventStyle", value)}
                    >
                      <SelectTrigger className="font-display">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">Single</SelectItem>
                        <SelectItem value="double">Double</SelectItem>
                        <SelectItem value="none">No Vent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-display">Pockets</Label>
                    <Select
                      value={formData.pocketStyle}
                      onValueChange={(value) => updateField("pocketStyle", value)}
                    >
                      <SelectTrigger className="font-display">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="flap">Flap</SelectItem>
                        <SelectItem value="jetted">Jetted</SelectItem>
                        <SelectItem value="patch">Patch</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label className="font-display">Lining Type</Label>
                    <Input
                      value={formData.liningType}
                      onChange={(e) => updateField("liningType", e.target.value)}
                      className="font-display"
                      placeholder="e.g., Full, Half, Quarter"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-display">Lining Color</Label>
                    <Input
                      value={formData.liningColor}
                      onChange={(e) => updateField("liningColor", e.target.value)}
                      className="font-display"
                      placeholder="e.g., Burgundy"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-stone-200 pt-4">
                <h3 className="text-lg text-stone-900 mb-4">Trouser Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-display">Style</Label>
                    <Select
                      value={formData.trouserStyle}
                      onValueChange={(value) => updateField("trouserStyle", value)}
                    >
                      <SelectTrigger className="font-display">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="flat-front">Flat Front</SelectItem>
                        <SelectItem value="pleated">Pleated</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-display">Cuff</Label>
                    <Select
                      value={formData.trouserCuff}
                      onValueChange={(value) => updateField("trouserCuff", value)}
                    >
                      <SelectTrigger className="font-display">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cuffed">Cuffed</SelectItem>
                        <SelectItem value="uncuffed">Uncuffed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

<div className="space-y-2">
                  <Label className="font-display">Special Instructions</Label>
                  <Textarea
                    value={formData.specialInstructions}
                    onChange={(e) => updateField("specialInstructions", e.target.value)}
                    className="resize-none"
                    rows={3}
                    placeholder="Any special requirements or instructions..."
                  />
                </div>

                {editingOrder && (
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
                      <SelectItem value="fitting">Fitting</SelectItem>
                      <SelectItem value="alterations">Alterations</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
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
                  disabled={!formData.clientId}
                  className="flex-1 bg-stone-900 hover:bg-stone-800"
                >
                  {editingOrder ? "Update" : "Create Order"}
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
            placeholder="Search by client name..."
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
            <SelectItem value="fitting">Fitting</SelectItem>
            <SelectItem value="alterations">Alterations</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
