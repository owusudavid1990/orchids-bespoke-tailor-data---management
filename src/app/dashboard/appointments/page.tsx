"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getAppointments,
  getClients,
  saveAppointment,
  deleteAppointment,
  saveClient,
    getCurrentUser,
    getUsers,
    generateId,
    type Appointment,
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
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  CalendarDays,
  Clock,
    ChevronLeft,
    ChevronRight,
    User as LucideUser,
    UserPlus,
  } from "lucide-react";

const appointmentTypes = [
  { value: "consultation", label: "Consultation", color: "bg-blue-50 text-blue-700" },
  { value: "measurement", label: "Measurement", color: "bg-purple-50 text-purple-700" },
  { value: "fitting", label: "Fitting", color: "bg-amber-50 text-amber-700" },
  { value: "pickup", label: "Pickup", color: "bg-green-50 text-green-700" },
  { value: "alteration", label: "Alteration", color: "bg-orange-50 text-orange-700" },
];

const statusColors: Record<string, string> = {
  scheduled: "bg-yellow-50 text-yellow-700",
  confirmed: "bg-blue-50 text-blue-700",
  completed: "bg-green-50 text-green-700",
  cancelled: "bg-red-50 text-red-700",
};

const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
];

const defaultAppointment: Omit<Appointment, "id" | "createdAt" | "updatedAt"> = {
  clientId: "",
  type: "consultation",
  date: "",
  time: "10:00",
  duration: 60,
  assignedStaffId: "",
  notes: "",
  status: "scheduled",
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [formData, setFormData] = useState<Omit<Appointment, "id" | "createdAt" | "updatedAt">>(defaultAppointment);
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [newClientData, setNewClientData] = useState({ name: "", email: "", phone: "" });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const user = getCurrentUser();
    setCurrentUser(user);
    const allAppointments = getAppointments();
    const allClients = getClients();

    if (user?.role === "staff") {
      setAppointments(allAppointments.filter(a => a.assignedStaffId === user.id));
      setClients(allClients.filter(c => c.assignedStaffId === user.id));
    } else {
      setAppointments(allAppointments);
      setClients(allClients);
    }
    setUsers(getUsers());
  };

  const getClientName = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    return client?.name || "Unknown Client";
  };

  const getTypeInfo = (type: string) => {
    return appointmentTypes.find((t) => t.value === type) || appointmentTypes[0];
  };

  const filteredAppointments = appointments.filter((a) => {
    const clientName = getClientName(a.clientId).toLowerCase();
    return clientName.includes(searchQuery.toLowerCase());
  });

  const getWeekDays = () => {
    const days = [];
    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(day.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getAppointmentsForDate = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return filteredAppointments.filter((a) => a.date === dateStr);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientId || !formData.date) return;

    const now = new Date().toISOString();
    
    // Auto-assign to current staff if they are creating the appointment
    const assignedStaffId = (currentUser?.role === "staff" && !editingAppointment)
      ? currentUser.id
      : formData.assignedStaffId;

    const appointment: Appointment = {
      id: editingAppointment?.id || generateId(),
      ...formData,
      assignedStaffId,
      createdAt: editingAppointment?.createdAt || now,
      updatedAt: now,
    };
    saveAppointment(appointment);
    loadData();
    resetForm();
    setIsDialogOpen(false);
  };

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setFormData({
      clientId: appointment.clientId,
      type: appointment.type,
      date: appointment.date,
      time: appointment.time,
      duration: appointment.duration,
      notes: appointment.notes,
      status: appointment.status,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteAppointment(id);
    loadData();
  };

  const handleStatusChange = (appointmentId: string, newStatus: Appointment["status"]) => {
    const appointment = appointments.find((a) => a.id === appointmentId);
    if (appointment) {
      saveAppointment({ ...appointment, status: newStatus, updatedAt: new Date().toISOString() });
      loadData();
    }
  };

  const resetForm = () => {
    setEditingAppointment(null);
    setFormData(defaultAppointment);
    setShowNewClientForm(false);
    setNewClientData({ name: "", email: "", phone: "" });
  };

  const updateField = (key: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
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
    setFormData((prev) => ({ ...prev, clientId: newClient.id }));
    setShowNewClientForm(false);
    setNewClientData({ name: "", email: "", phone: "" });
  };

  const navigateWeek = (direction: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + direction * 7);
    setSelectedDate(newDate);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const weekDays = getWeekDays();

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-serif text-stone-900 tracking-tight"
          >
            Appointments
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-stone-500 font-display mt-2 tracking-wide uppercase text-[10px]"
          >
            Schedule and manage client appointments
          </motion.p>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button className="bg-stone-900 hover:bg-stone-800 text-stone-50 rounded-xl px-8 h-12 font-display shadow-lg shadow-stone-900/20 transition-all hover:scale-105 active:scale-95">
                <Plus className="w-4 h-4 mr-2" />
                Book Appointment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg rounded-2xl border-none shadow-2xl">
              <DialogHeader className="p-2">
                <DialogTitle className="font-serif text-2xl text-stone-900">
                  {editingAppointment ? "Edit Appointment" : "Book Appointment"}
                </DialogTitle>
                <p className="text-sm text-stone-500 font-display">Manage your time with precision and elegance.</p>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6 mt-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="font-display text-xs uppercase tracking-widest text-stone-400">Select Client *</Label>
                    {!showNewClientForm && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowNewClientForm(true)}
                        className="text-[10px] text-stone-400 hover:text-stone-900 font-display h-auto p-0 uppercase tracking-widest"
                      >
                        <UserPlus className="w-3.5 h-3.5 mr-1" />
                        New Client
                      </Button>
                    )}
                  </div>
                  
                  {showNewClientForm ? (
                    <div className="space-y-4 p-4 rounded-2xl bg-stone-50 border border-stone-100">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-display font-medium text-stone-500 uppercase tracking-widest">Create New Client</p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setShowNewClientForm(false);
                            setNewClientData({ name: "", email: "", phone: "" });
                          }}
                          className="h-auto p-0 text-[10px] text-stone-400 uppercase tracking-widest hover:text-red-500"
                        >
                          Cancel
                        </Button>
                      </div>
                      <Input
                        placeholder="Client name *"
                        value={newClientData.name}
                        onChange={(e) => setNewClientData((prev) => ({ ...prev, name: e.target.value }))}
                        className="font-display h-11 bg-white border-stone-200 rounded-xl"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          placeholder="Email"
                          type="email"
                          value={newClientData.email}
                          onChange={(e) => setNewClientData((prev) => ({ ...prev, email: e.target.value }))}
                          className="font-display h-11 bg-white border-stone-200 rounded-xl"
                        />
                        <Input
                          placeholder="Phone"
                          value={newClientData.phone}
                          onChange={(e) => setNewClientData((prev) => ({ ...prev, phone: e.target.value }))}
                          className="font-display h-11 bg-white border-stone-200 rounded-xl"
                        />
                      </div>
                      <Button
                        type="button"
                        onClick={handleCreateNewClient}
                        disabled={!newClientData.name.trim()}
                        className="w-full h-10 text-xs bg-stone-900 hover:bg-stone-800 text-stone-50 font-display rounded-xl"
                      >
                        <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                        Add & Select Client
                      </Button>
                    </div>
                  ) : (
                    <Select
                      value={formData.clientId}
                      onValueChange={(value) => updateField("clientId", value)}
                    >
                      <SelectTrigger className="font-display h-12 rounded-xl bg-stone-50 border-stone-200 focus:ring-stone-900">
                        <SelectValue placeholder="Choose a client" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-stone-100 shadow-xl">
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id} className="font-display">
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="font-display text-xs uppercase tracking-widest text-stone-400">Appointment Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => updateField("type", value)}
                  >
                    <SelectTrigger className="font-display h-12 rounded-xl bg-stone-50 border-stone-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-stone-100 shadow-xl">
                      {appointmentTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value} className="font-display capitalize">
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-display text-xs uppercase tracking-widest text-stone-400">Date *</Label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => updateField("date", e.target.value)}
                      className="font-display h-12 rounded-xl bg-stone-50 border-stone-200"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-display text-xs uppercase tracking-widest text-stone-400">Time *</Label>
                    <Select
                      value={formData.time}
                      onValueChange={(value) => updateField("time", value)}
                    >
                      <SelectTrigger className="font-display h-12 rounded-xl bg-stone-50 border-stone-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-stone-100 shadow-xl">
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time} className="font-display">
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                  <div className="space-y-2">
                    <Label className="font-display text-xs uppercase tracking-widest text-stone-400">Duration</Label>
                    <Select
                      value={formData.duration.toString()}
                      onValueChange={(value) => updateField("duration", parseInt(value))}
                    >
                      <SelectTrigger className="font-display h-12 rounded-xl bg-stone-50 border-stone-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-stone-100 shadow-xl">
                        <SelectItem value="30" className="font-display">30 minutes</SelectItem>
                        <SelectItem value="60" className="font-display">1 hour</SelectItem>
                        <SelectItem value="90" className="font-display">1.5 hours</SelectItem>
                        <SelectItem value="120" className="font-display">2 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {currentUser?.role === "admin" && (
                    <div className="space-y-2">
                      <Label className="font-display text-xs uppercase tracking-widest text-stone-400">Assign To</Label>
                      <Select
                        value={formData.assignedStaffId || "unassigned"}
                        onValueChange={(value) => updateField("assignedStaffId", value === "unassigned" ? "" : value)}
                      >
                        <SelectTrigger className="font-display h-12 rounded-xl bg-stone-50 border-stone-200">
                          <SelectValue placeholder="Select staff member" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-stone-100 shadow-xl">
                          <SelectItem value="unassigned" className="font-display">Unassigned</SelectItem>
                          {users.filter(u => u.role === "staff").map((staff) => (
                            <SelectItem key={staff.id} value={staff.id} className="font-display">
                              {staff.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}


                <div className="space-y-2">
                  <Label className="font-display text-xs uppercase tracking-widest text-stone-400">Notes</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => updateField("notes", e.target.value)}
                    className="font-display resize-none rounded-xl bg-stone-50 border-stone-200 focus:bg-white transition-colors p-4"
                    rows={3}
                    placeholder="Add any specific requirements or details..."
                  />
                </div>

                {editingAppointment && (
                  <div className="space-y-2">
                    <Label className="font-display text-xs uppercase tracking-widest text-stone-400">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => updateField("status", value)}
                    >
                      <SelectTrigger className="font-display h-12 rounded-xl bg-stone-50 border-stone-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-stone-100 shadow-xl">
                        <SelectItem value="scheduled" className="font-display">Scheduled</SelectItem>
                        <SelectItem value="confirmed" className="font-display">Confirmed</SelectItem>
                        <SelectItem value="completed" className="font-display">Completed</SelectItem>
                        <SelectItem value="cancelled" className="font-display">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-stone-100">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setIsDialogOpen(false);
                      resetForm();
                    }}
                    className="flex-1 font-display rounded-xl text-stone-400 hover:text-stone-900 h-12"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={!formData.clientId || !formData.date}
                    className="flex-1 bg-stone-900 hover:bg-stone-800 text-stone-50 font-display rounded-xl h-12 shadow-lg shadow-stone-900/10"
                  >
                    {editingAppointment ? "Update Session" : "Confirm Booking"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </motion.div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-center bg-white p-2 rounded-2xl shadow-sm border border-stone-100">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" />
          <Input
            placeholder="Search by client name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-14 font-display bg-transparent border-none focus-visible:ring-0 text-stone-900 placeholder:text-stone-300"
          />
        </div>
        <div className="h-8 w-px bg-stone-100 hidden lg:block" />
        <div className="flex items-center gap-2 p-1 bg-stone-50 rounded-xl">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode("calendar")}
            className={`font-display text-[10px] uppercase tracking-widest px-4 h-10 rounded-lg transition-all ${
              viewMode === "calendar" 
                ? "bg-white text-stone-900 shadow-sm" 
                : "text-stone-400 hover:text-stone-600"
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5 mr-2" />
            Calendar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode("list")}
            className={`font-display text-[10px] uppercase tracking-widest px-4 h-10 rounded-lg transition-all ${
              viewMode === "list" 
                ? "bg-white text-stone-900 shadow-sm" 
                : "text-stone-400 hover:text-stone-600"
            }`}
          >
            <Clock className="w-3.5 h-3.5 mr-2" />
            Timeline
          </Button>
        </div>
      </div>

      {viewMode === "calendar" ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-none shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] bg-white rounded-3xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between p-8 pb-4">
              <div className="flex items-center gap-6">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigateWeek(-1)}
                  className="rounded-xl border border-stone-100 hover:bg-stone-50 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <h2 className="font-serif text-2xl text-stone-900 tracking-tight">
                  {weekDays[0].toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigateWeek(1)}
                  className="rounded-xl border border-stone-100 hover:bg-stone-50 transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              <Button
                variant="outline"
                onClick={() => setSelectedDate(new Date())}
                className="font-display text-[10px] uppercase tracking-widest px-6 h-10 rounded-xl border-stone-200 text-stone-600 hover:text-stone-900 hover:border-stone-900 transition-all"
              >
                Today
              </Button>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-7 gap-px bg-stone-100 rounded-2xl overflow-hidden border border-stone-100 shadow-sm">
                {weekDays.map((day) => (
                  <div key={day.toISOString()} className="bg-white min-h-[200px] flex flex-col">
                    <div
                      className={`p-4 text-center border-b border-stone-50 transition-colors ${
                        isToday(day) ? "bg-stone-900 text-stone-50" : "bg-stone-50/50"
                      }`}
                    >
                      <p className={`text-[9px] font-display uppercase tracking-[0.2em] mb-1 ${isToday(day) ? "text-stone-400" : "text-stone-400"}`}>
                        {day.toLocaleDateString("en-US", { weekday: "short" })}
                      </p>
                      <p className="text-xl font-serif tracking-tight">{day.getDate()}</p>
                    </div>
                    <div className="p-2 space-y-2 flex-1 overflow-y-auto no-scrollbar">
                      {getAppointmentsForDate(day).map((appointment) => {
                        const typeInfo = getTypeInfo(appointment.type);
                        return (
                          <motion.button
                            key={appointment.id}
                            whileHover={{ y: -2 }}
                            onClick={() => handleEdit(appointment)}
                            className={`w-full text-left p-2.5 rounded-xl text-[10px] ${typeInfo.color} border border-transparent hover:shadow-md transition-all duration-300 group`}
                          >
                            <p className="font-display font-bold uppercase tracking-widest mb-1">
                              {appointment.time}
                            </p>
                            <p className="font-serif text-xs mb-1 truncate">
                              {getClientName(appointment.clientId)}
                            </p>
                            <p className="opacity-60 uppercase tracking-tighter truncate">{typeInfo.label}</p>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <AnimatePresence mode="popLayout">
          {filteredAppointments.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-32 text-center"
            >
              <div className="w-24 h-24 rounded-full bg-stone-50 flex items-center justify-center mb-8">
                <CalendarDays className="w-10 h-10 text-stone-200" />
              </div>
              <h3 className="text-2xl font-serif text-stone-900 mb-3">
                {searchQuery ? "No matching sessions found" : "No appointments yet"}
              </h3>
              <p className="text-stone-400 font-display max-w-xs mx-auto text-sm leading-relaxed">
                {clients.length === 0
                  ? "Register a client to begin scheduling bespoke sessions."
                  : "Begin organizing your schedule by booking your first appointment."}
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredAppointments
                .sort((a, b) => new Date(a.date + "T" + a.time).getTime() - new Date(b.date + "T" + b.time).getTime())
                .map((appointment, index) => {
                  const typeInfo = getTypeInfo(appointment.type);
                  return (
                    <motion.div
                      key={appointment.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
                      layout
                    >
                      <Card className="group border-none shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] bg-white rounded-3xl overflow-hidden hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] transition-all duration-500">
                        <div className={`h-2 w-full transition-opacity duration-500 opacity-60 group-hover:opacity-100 ${typeInfo.color.split(" ")[0].replace("bg-", "bg-").replace("-50", "-900")}`} />
                        <CardContent className="p-8">
                          <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center gap-4">
                              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors duration-500 ${typeInfo.color}`}>
                                <CalendarDays className="w-6 h-6" />
                              </div>
                              <div>
                                <h3 className="font-serif text-xl text-stone-900 truncate max-w-[150px]">
                                  {getClientName(appointment.clientId)}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className={`text-[9px] px-2.5 py-1 rounded-full font-display uppercase tracking-widest ${typeInfo.color}`}>
                                    {typeInfo.label}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex bg-stone-50 p-1 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(appointment)}
                                className="h-8 w-8 text-stone-400 hover:text-stone-900"
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-stone-400 hover:text-red-500"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="rounded-2xl border-none shadow-2xl">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="font-serif text-xl">
                                      Cancel Appointment?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription className="font-display text-stone-500">
                                      This will permanently delete this scheduled session. This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter className="mt-6">
                                    <AlertDialogCancel className="font-display rounded-xl">
                                      Keep
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(appointment.id)}
                                      className="bg-red-500 hover:bg-red-600 text-stone-50 font-display rounded-xl"
                                    >
                                      Cancel Session
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-stone-50 rounded-2xl group-hover:bg-white border border-transparent group-hover:border-stone-100 transition-all duration-500">
                              <p className="text-[10px] text-stone-400 font-display uppercase tracking-widest mb-1">Schedule</p>
                              <p className="font-serif text-sm text-stone-900">
                                {new Date(appointment.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                              </p>
                            </div>
                            <div className="p-4 bg-stone-50 rounded-2xl group-hover:bg-white border border-transparent group-hover:border-stone-100 transition-all duration-500">
                              <p className="text-[10px] text-stone-400 font-display uppercase tracking-widest mb-1">Time</p>
                              <p className="font-serif text-sm text-stone-900">{appointment.time}</p>
                            </div>
                          </div>

                          <div className="mt-6 flex items-center justify-between border-t border-stone-50 pt-6">
                            <Select
                              value={appointment.status}
                              onValueChange={(value) =>
                                handleStatusChange(appointment.id, value as Appointment["status"])
                              }
                            >
                              <SelectTrigger
                                className={`h-8 w-auto px-4 text-[10px] font-display uppercase tracking-widest rounded-full border-none shadow-none focus:ring-0 transition-colors ${statusColors[appointment.status]}`}
                              >
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl border-stone-100 shadow-xl">
                                <SelectItem value="scheduled" className="text-[10px] font-display uppercase">Scheduled</SelectItem>
                                <SelectItem value="confirmed" className="text-[10px] font-display uppercase">Confirmed</SelectItem>
                                <SelectItem value="completed" className="text-[10px] font-display uppercase">Completed</SelectItem>
                                <SelectItem value="cancelled" className="text-[10px] font-display uppercase">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                            <span className="text-[9px] font-display text-stone-400 uppercase tracking-widest">
                              {appointment.duration} Minutes
                            </span>
                          </div>

                          {appointment.notes && (
                            <p className="text-[11px] text-stone-500 font-display mt-6 pt-6 border-t border-stone-50 leading-relaxed italic line-clamp-2">
                              &ldquo;{appointment.notes}&rdquo;
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
            </div>
          )}
        </AnimatePresence>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border-none shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] bg-white rounded-3xl overflow-hidden p-8">
          <CardHeader className="px-0 pt-0 flex flex-row items-center justify-between">
            <CardTitle className="font-serif text-xl text-stone-900">Upcoming Agenda</CardTitle>
            <CalendarDays className="w-5 h-5 text-stone-200" />
          </CardHeader>
          <CardContent className="px-0 pb-0">
            {filteredAppointments.filter(
              (a) => new Date(a.date) >= new Date() && a.status !== "cancelled" && a.status !== "completed"
            ).length === 0 ? (
                <div className="text-center py-12 bg-stone-50 rounded-2xl border border-stone-100">
                  <LucideUser className="w-10 h-10 text-stone-200 mx-auto mb-4" />
                  <p className="text-stone-400 font-display uppercase tracking-widest text-xs">
                  Your agenda is clear
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAppointments
                  .filter(
                    (a) => new Date(a.date) >= new Date() && a.status !== "cancelled" && a.status !== "completed"
                  )
                  .sort((a, b) => new Date(a.date + "T" + a.time).getTime() - new Date(b.date + "T" + b.time).getTime())
                  .slice(0, 5)
                  .map((appointment) => {
                    const typeInfo = getTypeInfo(appointment.type);
                    return (
                      <div
                        key={appointment.id}
                        className="flex items-center gap-6 p-4 rounded-2xl bg-stone-50/50 hover:bg-stone-50 transition-colors group"
                      >
                        <div className={`w-1 h-10 rounded-full ${typeInfo.color.split(" ")[0].replace("bg-", "bg-").replace("-50", "-500")}`} />
                        <div className="flex-1 min-w-0">
                          <p className="font-serif text-stone-900 truncate group-hover:text-stone-600 transition-colors">
                            {getClientName(appointment.clientId)}
                          </p>
                          <p className="text-[10px] text-stone-400 font-display uppercase tracking-widest mt-1">
                            {new Date(appointment.date).toLocaleDateString(undefined, {
                              weekday: 'long',
                              month: 'short',
                              day: 'numeric',
                            })} • {appointment.time}
                          </p>
                        </div>
                        <span className={`text-[9px] px-3 py-1.5 rounded-full font-display uppercase tracking-widest ${typeInfo.color}`}>
                          {typeInfo.label}
                        </span>
                      </div>
                    );
                  })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
