"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getOrders,
  getAlterations,
  getClients,
  getUsers,
  saveOrder,
  saveAlteration,
  type SuitOrder,
  type Alteration,
  type Client,
  type User,
} from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Shirt,
  Scissors,
  Calendar,
  UserCheck,
  Clock,
  Filter,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const orderStatusColors: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  "in-progress": "bg-blue-50 text-blue-700 border-blue-200",
  fitting: "bg-purple-50 text-purple-700 border-purple-200",
  alterations: "bg-orange-50 text-orange-700 border-orange-200",
  completed: "bg-green-50 text-green-700 border-green-200",
  delivered: "bg-stone-100 text-stone-600 border-stone-200",
};

const alterationStatusColors: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  "in-progress": "bg-blue-50 text-blue-700 border-blue-200",
  completed: "bg-green-50 text-green-700 border-green-200",
  "picked-up": "bg-stone-100 text-stone-600 border-stone-200",
};

type JobType = "all" | "orders" | "alterations";
type AssignmentFilter = "all" | "assigned" | "unassigned";

export default function JobsPage() {
  const [orders, setOrders] = useState<SuitOrder[]>([]);
  const [alterations, setAlterations] = useState<Alteration[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [staffFilter, setStaffFilter] = useState<string>("all");
  const [assignmentFilter, setAssignmentFilter] = useState<AssignmentFilter>("all");
  const [jobType, setJobType] = useState<JobType>("all");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setOrders(getOrders());
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

  const handleOrderStaffAssign = (orderId: string, staffId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (order) {
      saveOrder({ ...order, assignedStaffId: staffId || undefined, updatedAt: new Date().toISOString() });
      loadData();
    }
  };

  const handleAlterationStaffAssign = (alterationId: string, staffId: string) => {
    const alteration = alterations.find((a) => a.id === alterationId);
    if (alteration) {
      saveAlteration({ ...alteration, assignedStaffId: staffId || undefined, updatedAt: new Date().toISOString() });
      loadData();
    }
  };

  const handleOrderStatusChange = (orderId: string, newStatus: SuitOrder["status"]) => {
    const order = orders.find((o) => o.id === orderId);
    if (order) {
      saveOrder({ ...order, status: newStatus, updatedAt: new Date().toISOString() });
      loadData();
    }
  };

  const handleAlterationStatusChange = (alterationId: string, newStatus: Alteration["status"]) => {
    const alteration = alterations.find((a) => a.id === alterationId);
    if (alteration) {
      saveAlteration({ ...alteration, status: newStatus, updatedAt: new Date().toISOString() });
      loadData();
    }
  };

  const filteredOrders = orders.filter((o) => {
    const clientName = getClientName(o.clientId).toLowerCase();
    const matchesSearch = clientName.includes(searchQuery.toLowerCase());
    const matchesStaff = staffFilter === "all" || o.assignedStaffId === staffFilter;
    const matchesAssignment =
      assignmentFilter === "all" ||
      (assignmentFilter === "assigned" && o.assignedStaffId) ||
      (assignmentFilter === "unassigned" && !o.assignedStaffId);
    return matchesSearch && matchesStaff && matchesAssignment;
  });

  const filteredAlterations = alterations.filter((a) => {
    const clientName = getClientName(a.clientId).toLowerCase();
    const matchesSearch =
      clientName.includes(searchQuery.toLowerCase()) ||
      a.garmentType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStaff = staffFilter === "all" || a.assignedStaffId === staffFilter;
    const matchesAssignment =
      assignmentFilter === "all" ||
      (assignmentFilter === "assigned" && a.assignedStaffId) ||
      (assignmentFilter === "unassigned" && !a.assignedStaffId);
    return matchesSearch && matchesStaff && matchesAssignment;
  });

  const activeOrders = filteredOrders.filter(
    (o) => o.status !== "completed" && o.status !== "delivered"
  );
  const activeAlterations = filteredAlterations.filter(
    (a) => a.status !== "completed" && a.status !== "picked-up"
  );

  const totalJobs = orders.length + alterations.length;
  const assignedJobs =
    orders.filter((o) => o.assignedStaffId).length +
    alterations.filter((a) => a.assignedStaffId).length;
  const pendingJobs =
    orders.filter((o) => o.status === "pending").length +
    alterations.filter((a) => a.status === "pending").length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-serif text-stone-900"
          >
            Job Tracking
          </motion.h1>
          <p className="text-stone-500 font-display mt-1">
            Track and manage all assigned work
          </p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        <Card className="border-stone-200">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-stone-900">{totalJobs}</p>
              <p className="text-sm text-stone-500">Total Jobs</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-stone-200">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-stone-900">{assignedJobs}</p>
              <p className="text-sm text-stone-500">Assigned</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-stone-200">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-yellow-50 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-stone-900">{pendingJobs}</p>
              <p className="text-sm text-stone-500">Pending</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
          <Input
            placeholder="Search by client name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={staffFilter} onValueChange={setStaffFilter}>
            <SelectTrigger className="w-[160px] h-12">
              <UserCheck className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by staff" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Staff</SelectItem>
              {staffMembers.map((staff) => (
                <SelectItem key={staff.id} value={staff.id}>
                  {staff.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={assignmentFilter} onValueChange={(v) => setAssignmentFilter(v as AssignmentFilter)}>
            <SelectTrigger className="w-[160px] h-12">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Assignment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Jobs</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="unassigned">Unassigned</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="all" onValueChange={(v) => setJobType(v as JobType)}>
        <TabsList className="font-display">
          <TabsTrigger value="all">
            All Jobs ({activeOrders.length + activeAlterations.length})
          </TabsTrigger>
          <TabsTrigger value="orders">
            Orders ({activeOrders.length})
          </TabsTrigger>
          <TabsTrigger value="alterations">
            Alterations ({activeAlterations.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="space-y-6">
              {(jobType === "all" || jobType === "orders") && activeOrders.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-serif text-lg text-stone-900 flex items-center gap-2">
                    <Shirt className="w-5 h-5" /> Orders
                  </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {activeOrders.map((order, index) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="border-stone-200 hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
                                <Shirt className="w-5 h-5 text-amber-600" />
                              </div>
                              <div>
                                <h4 className="font-serif text-stone-900">
                                  {getClientName(order.clientId)}
                                </h4>
                                <p className="text-sm text-stone-500 capitalize">
                                  {order.suitStyle} • {order.lapelStyle} Lapel
                                </p>
                              </div>
                            </div>
                            <Select
                              value={order.status}
                              onValueChange={(value) =>
                                handleOrderStatusChange(order.id, value as SuitOrder["status"])
                              }
                            >
                              <SelectTrigger
                                className={`w-auto h-7 px-2 text-xs border ${orderStatusColors[order.status]}`}
                              >
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
                          <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {order.dueDate && (
                                <div className="flex items-center gap-1 text-sm text-stone-500">
                                  <Calendar className="w-4 h-4" />
                                  <span className="font-display">
                                    {new Date(order.dueDate).toLocaleDateString()}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <UserCheck className="w-4 h-4 text-stone-400" />
<Select
                                  value={order.assignedStaffId || "unassigned"}
                                  onValueChange={(value) => handleOrderStaffAssign(order.id, value === "unassigned" ? "" : value)}
                                >
                                  <SelectTrigger className="h-7 w-auto min-w-[120px] px-2 text-xs border-stone-200">
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
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {(jobType === "all" || jobType === "alterations") && activeAlterations.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-serif text-lg text-stone-900 flex items-center gap-2">
                  <Scissors className="w-5 h-5" /> Alterations
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {activeAlterations.map((alteration, index) => (
                    <motion.div
                      key={alteration.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="border-stone-200 hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                                <Scissors className="w-5 h-5 text-emerald-600" />
                              </div>
                              <div>
                                <h4 className="font-serif text-stone-900">
                                  {alteration.garmentType}
                                </h4>
                                <p className="text-sm text-stone-500">
                                  {getClientName(alteration.clientId)}
                                </p>
                              </div>
                            </div>
                            <Select
                              value={alteration.status}
                              onValueChange={(value) =>
                                handleAlterationStatusChange(alteration.id, value as Alteration["status"])
                              }
                            >
                              <SelectTrigger
                                className={`w-auto h-7 px-2 text-xs border ${alterationStatusColors[alteration.status]}`}
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
                          {alteration.alterations.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {alteration.alterations.slice(0, 2).map((alt) => (
                                <span
                                  key={alt}
                                  className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-600"
                                >
                                  {alt}
                                </span>
                              ))}
                              {alteration.alterations.length > 2 && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                                  +{alteration.alterations.length - 2} more
                                </span>
                              )}
                            </div>
                          )}
                          <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
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
<div className="flex items-center gap-2">
                                <UserCheck className="w-4 h-4 text-stone-400" />
                                <Select
                                  value={alteration.assignedStaffId || "unassigned"}
                                  onValueChange={(value) => handleAlterationStaffAssign(alteration.id, value === "unassigned" ? "" : value)}
                                >
                                  <SelectTrigger className="h-7 w-auto min-w-[120px] px-2 text-xs border-stone-200">
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
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {activeOrders.length === 0 && activeAlterations.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <CheckCircle2 className="w-16 h-16 text-stone-300 mx-auto mb-4" />
                <h3 className="text-xl text-stone-700 mb-2">
                  {searchQuery || staffFilter !== "all" || assignmentFilter !== "all"
                    ? "No matching jobs found"
                    : "All caught up!"}
                </h3>
                <p className="text-stone-500">
                  {searchQuery || staffFilter !== "all" || assignmentFilter !== "all"
                    ? "Try adjusting your filters"
                    : "No active jobs at the moment"}
                </p>
              </motion.div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="orders" className="mt-6">
          {activeOrders.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {activeOrders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="border-stone-200 hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
                            <Shirt className="w-5 h-5 text-amber-600" />
                          </div>
                          <div>
                            <h4 className="font-serif text-stone-900">
                              {getClientName(order.clientId)}
                            </h4>
                            <p className="text-sm text-stone-500 capitalize">
                              {order.suitStyle} • {order.lapelStyle} Lapel
                            </p>
                          </div>
                        </div>
                        <Select
                          value={order.status}
                          onValueChange={(value) =>
                            handleOrderStatusChange(order.id, value as SuitOrder["status"])
                          }
                        >
                          <SelectTrigger
                            className={`w-auto h-7 px-2 text-xs border ${orderStatusColors[order.status]}`}
                          >
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
                      <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {order.dueDate && (
                            <div className="flex items-center gap-1 text-sm text-stone-500">
                              <Calendar className="w-4 h-4" />
                              <span className="font-display">
                                {new Date(order.dueDate).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
<div className="flex items-center gap-2">
                            <UserCheck className="w-4 h-4 text-stone-400" />
                            <Select
                              value={order.assignedStaffId || "unassigned"}
                              onValueChange={(value) => handleOrderStaffAssign(order.id, value === "unassigned" ? "" : value)}
                            >
                              <SelectTrigger className="h-7 w-auto min-w-[120px] px-2 text-xs border-stone-200">
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
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Shirt className="w-16 h-16 text-stone-300 mx-auto mb-4" />
              <h3 className="text-xl text-stone-700 mb-2">No active orders</h3>
              <p className="text-stone-500">All orders have been completed</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="alterations" className="mt-6">
          {activeAlterations.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {activeAlterations.map((alteration, index) => (
                <motion.div
                  key={alteration.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="border-stone-200 hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                            <Scissors className="w-5 h-5 text-emerald-600" />
                          </div>
                          <div>
                            <h4 className="font-serif text-stone-900">
                              {alteration.garmentType}
                            </h4>
                            <p className="text-sm text-stone-500">
                              {getClientName(alteration.clientId)}
                            </p>
                          </div>
                        </div>
                        <Select
                          value={alteration.status}
                          onValueChange={(value) =>
                            handleAlterationStatusChange(alteration.id, value as Alteration["status"])
                          }
                        >
                          <SelectTrigger
                            className={`w-auto h-7 px-2 text-xs border ${alterationStatusColors[alteration.status]}`}
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
                      {alteration.alterations.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {alteration.alterations.slice(0, 2).map((alt) => (
                            <span
                              key={alt}
                              className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-600"
                            >
                              {alt}
                            </span>
                          ))}
                          {alteration.alterations.length > 2 && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                              +{alteration.alterations.length - 2} more
                            </span>
                          )}
                        </div>
                      )}
                      <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
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
<div className="flex items-center gap-2">
                            <UserCheck className="w-4 h-4 text-stone-400" />
                            <Select
                              value={alteration.assignedStaffId || "unassigned"}
                              onValueChange={(value) => handleAlterationStaffAssign(alteration.id, value === "unassigned" ? "" : value)}
                            >
                              <SelectTrigger className="h-7 w-auto min-w-[120px] px-2 text-xs border-stone-200">
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
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Scissors className="w-16 h-16 text-stone-300 mx-auto mb-4" />
              <h3 className="text-xl text-stone-700 mb-2">No active alterations</h3>
              <p className="text-stone-500">All alterations have been completed</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
