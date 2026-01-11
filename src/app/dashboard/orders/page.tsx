"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
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
  type User } from
"@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger } from
"@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger } from
"@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from
"@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger } from
"@/components/ui/alert-dialog";
import { Plus, Search, Pencil, Trash2, Shirt, Calendar, User as UserIcon, Scissors, FileText, Settings, Layers } from "lucide-react";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700",
  "in-progress": "bg-blue-50 text-blue-700",
  fitting: "bg-purple-50 text-purple-700",
  alterations: "bg-orange-50 text-orange-700",
  completed: "bg-green-50 text-green-700",
  delivered: "bg-stone-100 text-stone-600"
};

const defaultOrder: Omit<SuitOrder, "id" | "createdAt" | "updatedAt"> = {
  clientId: "",
  orderName: "",
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
  assignedStaffId: "",
  dueDate: ""
};

function OrdersPageContent() {
  const searchParams = useSearchParams();
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

    const preClientId = searchParams.get("clientId");
    const shouldOpenNew = searchParams.get("new") === "true";

    if (preClientId) {
      setFormData((prev) => ({ ...prev, clientId: preClientId }));
      if (shouldOpenNew) {
        setIsDialogOpen(true);
      }
    }
  }, [searchParams]);

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

  const clientMeasurements = formData.clientId ?
  measurements.filter((m) => m.clientId === formData.clientId) :
  [];

  const clientFabrics = formData.clientId ?
  fabrics.filter((f) => f.clientId === formData.clientId) :
  [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientId) return;

    const now = new Date().toISOString();
    const order: SuitOrder = {
      id: editingOrder?.id || generateId(),
      ...formData,
      assignedStaffId: formData.assignedStaffId === "unassigned" ? "" : formData.assignedStaffId,
      createdAt: editingOrder?.createdAt || now,
      updatedAt: now
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
      orderName: order.orderName || "",
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
      assignedStaffId: order.assignedStaffId || "unassigned",
      dueDate: order.dueDate
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
            className="text-3xl text-stone-900">

            Orders
          </motion.h1>
          <p className="text-stone-500 mt-1">
            Manage your orders
          </p>
        </div>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>

          <DialogTrigger asChild>
            <Button className="bg-stone-900 hover:bg-stone-800">
              <Plus className="w-4 h-4 mr-2" />
              New Order
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0 border-stone-200">
            <DialogHeader className="px-6 pt-6 pb-2">
              <DialogTitle className="text-2xl font-display flex items-center gap-2 text-stone-900">
                {editingOrder ? <Pencil className="w-5 h-5 text-stone-500" /> : <Plus className="w-5 h-5 text-stone-500" />}
                {editingOrder ? "Edit Order" : "New Order"}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
              <Tabs defaultValue="general" className="flex-1 flex flex-col overflow-hidden">
                <div className="px-6 border-b border-stone-100">
                  <TabsList className="w-full justify-start h-12 bg-transparent gap-6 p-0">
                    <TabsTrigger 
                      value="general" 
                      className="data-[state=active]:border-b-2 data-[state=active]:border-stone-900 data-[state=active]:text-stone-900 rounded-none bg-transparent px-2 h-12 text-stone-500 font-medium transition-all"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      General
                    </TabsTrigger>
                    <TabsTrigger 
                      value="jacket" 
                      className="data-[state=active]:border-b-2 data-[state=active]:border-stone-900 data-[state=active]:text-stone-900 rounded-none bg-transparent px-2 h-12 text-stone-500 font-medium transition-all"
                    >
                      <Shirt className="w-4 h-4 mr-2" />
                      Jacket
                    </TabsTrigger>
                    <TabsTrigger 
                      value="trousers" 
                      className="data-[state=active]:border-b-2 data-[state=active]:border-stone-900 data-[state=active]:text-stone-900 rounded-none bg-transparent px-2 h-12 text-stone-500 font-medium transition-all"
                    >
                      <Layers className="w-4 h-4 mr-2" />
                      Trousers
                    </TabsTrigger>
                    <TabsTrigger 
                      value="notes" 
                      className="data-[state=active]:border-b-2 data-[state=active]:border-stone-900 data-[state=active]:text-stone-900 rounded-none bg-transparent px-2 h-12 text-stone-500 font-medium transition-all"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Notes
                    </TabsTrigger>
                  </TabsList>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
                  <TabsContent value="general" className="space-y-8 mt-0 animate-in fade-in-50 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="font-display flex items-center gap-2 text-stone-600">
                          <UserIcon className="w-4 h-4 text-stone-400" />
                          Select Client *
                        </Label>
                        <Select
                          value={formData.clientId}
                          onValueChange={(value) => {
                            updateField("clientId", value);
                            updateField("measurementId", "");
                            updateField("fabricSelectionId", "");
                          }}>
                          <SelectTrigger className="font-display h-11 border-stone-200 focus:ring-stone-200">
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
                        <Label className="font-display flex items-center gap-2 text-stone-600">
                          <Shirt className="w-4 h-4 text-stone-400" />
                          Order Name *
                        </Label>
                        <Input
                          value={formData.orderName}
                          onChange={(e) => updateField("orderName", e.target.value)}
                          placeholder="e.g., Wedding Suit, Business Suit"
                          className="h-11 border-stone-200 focus:ring-stone-200"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="font-display flex items-center gap-2 text-stone-600">
                          <Calendar className="w-4 h-4 text-stone-400" />
                          Due Date
                        </Label>
                        <Input
                          type="date"
                          value={formData.dueDate}
                          onChange={(e) => updateField("dueDate", e.target.value)}
                          className="font-display h-11 border-stone-200 focus:ring-stone-200"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="font-display flex items-center gap-2 text-stone-600">
                          <UserIcon className="w-4 h-4 text-stone-400" />
                          Assign To
                        </Label>
                        <Select
                          value={formData.assignedStaffId}
                          onValueChange={(value) => updateField("assignedStaffId", value)}>
                          <SelectTrigger className="font-display h-11 border-stone-200 focus:ring-stone-200">
                            <SelectValue placeholder="Select staff member" />
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

                      {editingOrder && (
                        <div className="space-y-2">
                          <Label className="font-display flex items-center gap-2 text-stone-600">
                            <Settings className="w-4 h-4 text-stone-400" />
                            Status
                          </Label>
                          <Select
                            value={formData.status}
                            onValueChange={(value) => updateField("status", value)}>
                            <SelectTrigger className="font-display h-11 border-stone-200 focus:ring-stone-200">
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
                    </div>

                    <div className="space-y-6 pt-6 border-t border-stone-100">
                      <h4 className="text-sm font-semibold text-stone-900 uppercase tracking-wider">Associated Records</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="font-display flex items-center gap-2 text-stone-600">
                            <Scissors className="w-4 h-4 text-stone-400" />
                            Measurement Profile
                          </Label>
                          <Select
                            value={formData.measurementId}
                            onValueChange={(value) => updateField("measurementId", value)}
                            disabled={!formData.clientId}>
                            <SelectTrigger className="font-display h-11 border-stone-200 focus:ring-stone-200">
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
                          <Label className="font-display flex items-center gap-2 text-stone-600">
                            <Layers className="w-4 h-4 text-stone-400" />
                            Fabric Selection
                          </Label>
                          <Select
                            value={formData.fabricSelectionId}
                            onValueChange={(value) => updateField("fabricSelectionId", value)}
                            disabled={!formData.clientId}>
                            <SelectTrigger className="font-display h-11 border-stone-200 focus:ring-stone-200">
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
                    </div>
                  </TabsContent>

                  <TabsContent value="jacket" className="space-y-8 mt-0 animate-in fade-in-50 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label className="font-display text-stone-600">Suit Style</Label>
                        <Select
                          value={formData.suitStyle}
                          onValueChange={(value) => updateField("suitStyle", value)}>
                          <SelectTrigger className="font-display h-11 border-stone-200 focus:ring-stone-200">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="single-breasted">Single Breasted</SelectItem>
                            <SelectItem value="double-breasted">Double Breasted</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="font-display text-stone-600">Lapel Style</Label>
                        <Select
                          value={formData.lapelStyle}
                          onValueChange={(value) => updateField("lapelStyle", value)}>
                          <SelectTrigger className="font-display h-11 border-stone-200 focus:ring-stone-200">
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
                        <Label className="font-display text-stone-600">Buttons</Label>
                        <Select
                          value={formData.buttons}
                          onValueChange={(value) => updateField("buttons", value)}>
                          <SelectTrigger className="font-display h-11 border-stone-200 focus:ring-stone-200">
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
                        <Label className="font-display text-stone-600">Vent Style</Label>
                        <Select
                          value={formData.ventStyle}
                          onValueChange={(value) => updateField("ventStyle", value)}>
                          <SelectTrigger className="font-display h-11 border-stone-200 focus:ring-stone-200">
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
                        <Label className="font-display text-stone-600">Pocket Style</Label>
                        <Select
                          value={formData.pocketStyle}
                          onValueChange={(value) => updateField("pocketStyle", value)}>
                          <SelectTrigger className="font-display h-11 border-stone-200 focus:ring-stone-200">
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

                    <div className="space-y-6 pt-6 border-t border-stone-100">
                      <h4 className="text-sm font-semibold text-stone-900 uppercase tracking-wider">Lining & Interiors</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="font-display text-stone-600">Lining Type</Label>
                          <Input
                            value={formData.liningType}
                            onChange={(e) => updateField("liningType", e.target.value)}
                            className="font-display h-11 border-stone-200 focus:ring-stone-200"
                            placeholder="e.g., Full, Half, Quarter"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="font-display text-stone-600">Lining Color</Label>
                          <Input
                            value={formData.liningColor}
                            onChange={(e) => updateField("liningColor", e.target.value)}
                            className="font-display h-11 border-stone-200 focus:ring-stone-200"
                            placeholder="e.g., Burgundy"
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="trousers" className="space-y-8 mt-0 animate-in fade-in-50 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <Label className="font-display text-stone-600">Trouser Style</Label>
                        <Select
                          value={formData.trouserStyle}
                          onValueChange={(value) => updateField("trouserStyle", value)}>
                          <SelectTrigger className="font-display h-11 border-stone-200 focus:ring-stone-200">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="flat-front">Flat Front</SelectItem>
                            <SelectItem value="pleated">Pleated</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="font-display text-stone-600">Trouser Cuff</Label>
                        <Select
                          value={formData.trouserCuff}
                          onValueChange={(value) => updateField("trouserCuff", value)}>
                          <SelectTrigger className="font-display h-11 border-stone-200 focus:ring-stone-200">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cuffed">Cuffed</SelectItem>
                            <SelectItem value="uncuffed">Uncuffed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="notes" className="space-y-6 mt-0 animate-in fade-in-50 duration-300">
                    <div className="space-y-2">
                      <Label className="font-display flex items-center gap-2 text-stone-600">
                        <FileText className="w-4 h-4 text-stone-400" />
                        Special Instructions
                      </Label>
                      <Textarea
                        value={formData.specialInstructions}
                        onChange={(e) => updateField("specialInstructions", e.target.value)}
                        className="min-h-[250px] resize-none p-4 border-stone-200 focus:ring-stone-200"
                        placeholder="Any special requirements, fitting notes, or custom requests..."
                      />
                    </div>
                  </TabsContent>
                </div>

                <div className="px-6 py-4 border-t border-stone-100 bg-stone-50/50 flex gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setIsDialogOpen(false);
                      resetForm();
                    }}
                    className="flex-1 h-11 hover:bg-stone-100 text-stone-600"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={!formData.clientId}
                    className="flex-1 h-11 bg-stone-900 hover:bg-stone-800 text-white shadow-lg shadow-stone-200 transition-all active:scale-[0.98]"
                  >
                    {editingOrder ? "Update Order" : "Create Order"}
                  </Button>
                </div>
              </Tabs>
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
            className="pl-10 h-12" />

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredOrders.map((order) =>
          <motion.div
            key={order.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}>

              <Card className="border-stone-200 hover:border-stone-300 transition-colors group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Shirt className="w-4 h-4 text-stone-400" />
                        <span className="text-xs text-stone-500 uppercase tracking-wider font-medium">
                          Order #{order.id.slice(-6).toUpperCase()}
                        </span>
                      </div>
                      <h3 className="text-xl text-stone-900 font-display">
                        {order.orderName || `${order.suitStyle.replace("-", " ")} Suit`}
                      </h3>
                      <p className="text-stone-500 font-display">
                        {getClientName(order.clientId)}
                      </p>
                    </div>
                    <Badge className={`${statusColors[order.status]} border-none capitalize`}>
                      {order.status.replace("-", " ")}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="space-y-1">
                        <p className="text-stone-400 text-xs uppercase tracking-wider">Style</p>
                        <p className="text-stone-700 capitalize">{order.suitStyle.replace("-", " ")}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-stone-400 text-xs uppercase tracking-wider">Due Date</p>
                        <div className="flex items-center gap-1.5 text-stone-700">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{order.dueDate ? new Date(order.dueDate).toLocaleDateString() : "Not set"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                      <div className="flex gap-2">
                        <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(order)}
                        className="h-8 w-8 p-0">

                          <Pencil className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50">

                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Order</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this order? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                              onClick={() => handleDelete(order.id)}
                              className="bg-red-600 hover:bg-red-700">

                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                      <Link href={`/dashboard/measurements/docket/${order.measurementId}`}>
                        <Button variant="outline" size="sm" className="h-8 text-xs uppercase tracking-wider">
                          View Docket
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {filteredOrders.length === 0 &&
      <div className="text-center py-24 bg-stone-50 rounded-2xl border-2 border-dashed border-stone-200">
          <Shirt className="w-12 h-12 text-stone-300 mx-auto mb-4" />
          <h3 className="text-lg text-stone-900">No orders found</h3>
          <p className="text-stone-500 max-w-xs mx-auto mt-2">
            Try adjusting your search or filters, or create a new order to get started.
          </p>
        </div>
      }
    </div>);

}

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]">Loading...</div>}>
      <OrdersPageContent />
    </Suspense>);

}