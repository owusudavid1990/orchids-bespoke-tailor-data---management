"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getMeasurements,
  getClients,
  getUsers,
  saveMeasurement,
  deleteMeasurement,
  getTemplates,
  saveTemplate,
  deleteTemplate,
  generateId,
  type Measurement,
  type Client,
  type User,
  type MeasurementTemplate,
  type MeasurementField,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Pencil, Trash2, Ruler, User as UserIcon, Camera, Image as ImageIcon, ArrowUp, ArrowDown, Save, FileText, UserCheck, Shirt, Scissors } from "lucide-react";
import Link from "next/link";
import { PhotoUpload } from "@/components/PhotoUpload";

const defaultMeasurement: Omit<Measurement, "id" | "createdAt" | "updatedAt"> = {
  clientId: "",
  chest: "",
  waist: "",
  hips: "",
  shoulders: "",
  sleeveLength: "",
  armhole: "",
  bicep: "",
  wrist: "",
  neck: "",
  jacketLength: "",
  trouserLength: "",
  inseam: "",
  outseam: "",
  thigh: "",
  knee: "",
  calf: "",
  ankle: "",
  rise: "",
  backLength: "",
  frontLength: "",
  bodyStructure: "regular",
  posture: "normal",
  slopeShoulders: "normal",
  lapelStyle: "notch",
  buttonStyle: "single-breasted-2",
  jacketLengthOption: "regular",
  pocketStyle: "flap",
  ventStyle: "double",
  liningType: "full",
  trouserStyle: "flat-front",
  trouserFit: "regular",
  cuffStyle: "plain",
  photos: [],
  customFields: [],
  templateId: "",
  assignedStaffId: "",
  notes: "",
};

const upperBodyFields = [
  { key: "chest", label: "Chest", unit: "in" },
  { key: "waist", label: "Waist", unit: "in" },
  { key: "hips", label: "Hips", unit: "in" },
  { key: "shoulders", label: "Shoulders", unit: "in" },
  { key: "neck", label: "Neck", unit: "in" },
  { key: "sleeveLength", label: "Sleeve Length", unit: "in" },
  { key: "armhole", label: "Armhole", unit: "in" },
  { key: "bicep", label: "Bicep", unit: "in" },
  { key: "wrist", label: "Wrist", unit: "in" },
  { key: "jacketLength", label: "Jacket Length", unit: "in" },
  { key: "backLength", label: "Back Length", unit: "in" },
  { key: "frontLength", label: "Front Length", unit: "in" },
];

const lowerBodyFields = [
  { key: "trouserLength", label: "Trouser Length", unit: "in" },
  { key: "inseam", label: "Inseam", unit: "in" },
  { key: "outseam", label: "Outseam", unit: "in" },
  { key: "thigh", label: "Thigh", unit: "in" },
  { key: "knee", label: "Knee", unit: "in" },
  { key: "calf", label: "Calf", unit: "in" },
  { key: "ankle", label: "Ankle", unit: "in" },
  { key: "rise", label: "Rise", unit: "in" },
];

export default function MeasurementsPage() {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [templates, setTemplates] = useState<MeasurementTemplate[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClient, setSelectedClient] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMeasurement, setEditingMeasurement] = useState<Measurement | null>(null);
  const [formData, setFormData] = useState<Omit<Measurement, "id" | "createdAt" | "updatedAt">>(defaultMeasurement);
  const [newTemplateName, setNewTemplateName] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setMeasurements(getMeasurements());
    setClients(getClients());
    setTemplates(getTemplates());
    setUsers(getUsers());
  };

  const staffMembers = users.filter((u) => u.role === "staff" || u.role === "admin");

  const getClientName = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    return client?.name || "Unknown Client";
  };

  const filteredMeasurements = measurements.filter((m) => {
    const clientName = getClientName(m.clientId).toLowerCase();
    const matchesSearch = clientName.includes(searchQuery.toLowerCase());
    const matchesClient = selectedClient === "all" || m.clientId === selectedClient;
    return matchesSearch && matchesClient;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientId) return;

    const now = new Date().toISOString();
    const measurement: Measurement = {
      id: editingMeasurement?.id || generateId(),
      ...formData,
      createdAt: editingMeasurement?.createdAt || now,
      updatedAt: now,
    };
    saveMeasurement(measurement);
    loadData();
    resetForm();
    setIsDialogOpen(false);
  };

  const handleEdit = (measurement: Measurement) => {
    setEditingMeasurement(measurement);
    setFormData({
      clientId: measurement.clientId,
      chest: measurement.chest,
      waist: measurement.waist,
      hips: measurement.hips,
      shoulders: measurement.shoulders,
      sleeveLength: measurement.sleeveLength,
      armhole: measurement.armhole,
      bicep: measurement.bicep,
      wrist: measurement.wrist,
      neck: measurement.neck,
      jacketLength: measurement.jacketLength,
      trouserLength: measurement.trouserLength,
      inseam: measurement.inseam,
      outseam: measurement.outseam,
      thigh: measurement.thigh,
      knee: measurement.knee,
      calf: measurement.calf,
      ankle: measurement.ankle,
      rise: measurement.rise,
      backLength: measurement.backLength,
      frontLength: measurement.frontLength,
      bodyStructure: measurement.bodyStructure,
      posture: measurement.posture,
      slopeShoulders: measurement.slopeShoulders,
      lapelStyle: measurement.lapelStyle || "notch",
      buttonStyle: measurement.buttonStyle || "single-breasted-2",
      jacketLengthOption: measurement.jacketLengthOption || "regular",
      pocketStyle: measurement.pocketStyle || "flap",
      ventStyle: measurement.ventStyle || "double",
      liningType: measurement.liningType || "full",
      trouserStyle: measurement.trouserStyle || "flat-front",
      trouserFit: measurement.trouserFit || "regular",
      cuffStyle: measurement.cuffStyle || "plain",
      photos: measurement.photos || [],
      customFields: measurement.customFields || [],
      templateId: measurement.templateId || "",
      assignedStaffId: measurement.assignedStaffId || "",
      notes: measurement.notes,
    });
    setIsDialogOpen(true);
  };

  const handleStaffAssign = (measurementId: string, staffId: string) => {
    const measurement = measurements.find((m) => m.id === measurementId);
    if (measurement) {
      saveMeasurement({ ...measurement, assignedStaffId: staffId || undefined, updatedAt: new Date().toISOString() });
      loadData();
    }
  };

  const addCustomField = () => {
    const newField: MeasurementField = {
      id: generateId(),
      label: "New Measurement",
      value: "",
      unit: "in",
      notes: "",
      order: formData.customFields?.length || 0,
    };
    setFormData(prev => ({
      ...prev,
      customFields: [...(prev.customFields || []), newField],
    }));
  };

  const updateCustomField = (id: string, updates: Partial<MeasurementField>) => {
    setFormData(prev => ({
      ...prev,
      customFields: prev.customFields?.map(f => f.id === id ? { ...f, ...updates } : f) || [],
    }));
  };

  const removeCustomField = (id: string) => {
    setFormData(prev => ({
      ...prev,
      customFields: prev.customFields?.filter(f => f.id !== id) || [],
    }));
  };

  const moveCustomField = (id: string, direction: 'up' | 'down') => {
    const fields = [...(formData.customFields || [])];
    const index = fields.findIndex(f => f.id === id);
    if (direction === 'up' && index > 0) {
      [fields[index], fields[index - 1]] = [fields[index - 1], fields[index]];
    } else if (direction === 'down' && index < fields.length - 1) {
      [fields[index], fields[index + 1]] = [fields[index + 1], fields[index]];
    }
    setFormData(prev => ({ ...prev, customFields: fields.map((f, i) => ({ ...f, order: i })) }));
  };

  const handleSaveTemplate = () => {
    if (!newTemplateName) return;
    const template: MeasurementTemplate = {
      id: generateId(),
      name: newTemplateName,
      fields: (formData.customFields || []).map((f, i) => ({ label: f.label, unit: f.unit, order: i })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveTemplate(template);
    setTemplates(getTemplates());
    setNewTemplateName("");
  };

  const applyTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;
    
    const templateFields: MeasurementField[] = template.fields.map(f => ({
      id: generateId(),
      label: f.label,
      value: "",
      unit: f.unit,
      order: f.order,
    }));

    setFormData(prev => ({
      ...prev,
      templateId: template.id,
      customFields: templateFields,
    }));
  };

  const handleDelete = (id: string) => {
    deleteMeasurement(id);
    loadData();
  };

  const resetForm = () => {
    setEditingMeasurement(null);
    setFormData(defaultMeasurement);
  };

  const updateField = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-serif text-stone-900 tracking-tight"
          >
            Measurements
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-stone-500 font-display mt-2 tracking-wide uppercase text-[10px]"
          >
            Bespoke Client Specification Repository
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
                New Measurement
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border-none shadow-2xl">
              <DialogHeader className="p-2">
                <DialogTitle className="font-serif text-2xl text-stone-900">
                  {editingMeasurement ? "Refine Measurement" : "Capture New Measurement"}
                </DialogTitle>
                <p className="text-sm text-stone-500 font-display">Precision is the hallmark of excellence.</p>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-8 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="font-display text-xs uppercase tracking-widest text-stone-400">Client *</Label>
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
                  </div>

                  <div className="space-y-2">
                    <Label className="font-display text-xs uppercase tracking-widest text-stone-400">Assigned Artisan</Label>
                    <Select
                      value={formData.assignedStaffId || "unassigned"}
                      onValueChange={(value) => updateField("assignedStaffId", value === "unassigned" ? "" : value)}
                    >
                      <SelectTrigger className="font-display h-12 rounded-xl bg-stone-50 border-stone-200">
                        <SelectValue placeholder="Select staff member" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-stone-100 shadow-xl">
                        <SelectItem value="unassigned" className="font-display">Unassigned</SelectItem>
                        {staffMembers.map((staff) => (
                          <SelectItem key={staff.id} value={staff.id} className="font-display">
                            {staff.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Tabs defaultValue="upper" className="w-full">
                  <TabsList className="flex flex-wrap h-auto gap-2 p-1 bg-stone-100 rounded-xl w-fit">
                    {["upper", "lower", "custom", "structure", "features", "photos"].map((tab) => (
                      <TabsTrigger 
                        key={tab}
                        value={tab} 
                        className="font-display text-xs px-4 py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:text-stone-900 data-[state=active]:shadow-sm transition-all capitalize"
                      >
                        {tab}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  <TabsContent value="upper" className="mt-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      {upperBodyFields.map((field) => (
                        <div key={field.key} className="space-y-1.5">
                          <Label className="font-display text-[10px] uppercase tracking-widest text-stone-400">{field.label}</Label>
                          <div className="relative group">
                            <Input
                              type="text"
                              value={(formData as Record<string, string>)[field.key] || ""}
                              onChange={(e) => updateField(field.key, e.target.value)}
                              className="font-display h-11 bg-stone-50 border-stone-200 rounded-xl pr-10 focus:bg-white transition-colors"
                              placeholder="0.0"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-300 text-[10px] font-display uppercase tracking-tighter">
                              {field.unit}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="lower" className="mt-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      {lowerBodyFields.map((field) => (
                        <div key={field.key} className="space-y-1.5">
                          <Label className="font-display text-[10px] uppercase tracking-widest text-stone-400">{field.label}</Label>
                          <div className="relative group">
                            <Input
                              type="text"
                              value={(formData as Record<string, string>)[field.key] || ""}
                              onChange={(e) => updateField(field.key, e.target.value)}
                              className="font-display h-11 bg-stone-50 border-stone-200 rounded-xl pr-10 focus:bg-white transition-colors"
                              placeholder="0.0"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-300 text-[10px] font-display uppercase tracking-tighter">
                              {field.unit}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="custom" className="mt-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end p-6 bg-stone-50 rounded-2xl border border-stone-100">
                      <div className="space-y-3">
                        <Label className="font-display text-xs uppercase tracking-widest text-stone-500">Industry Templates</Label>
                        <Select
                          value={formData.templateId}
                          onValueChange={applyTemplate}
                        >
                          <SelectTrigger className="font-display bg-white rounded-xl border-stone-200">
                            <SelectValue placeholder="Select a template..." />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-stone-100 shadow-xl">
                            {templates.map((t) => (
                              <SelectItem key={t.id} value={t.id} className="font-display">{t.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-3">
                        <Label className="font-display text-xs uppercase tracking-widest text-stone-500">Define New Template</Label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Template name..."
                            value={newTemplateName}
                            onChange={(e) => setNewTemplateName(e.target.value)}
                            className="font-display rounded-xl border-stone-200 bg-white"
                          />
                          <Button
                            type="button"
                            size="icon"
                            onClick={handleSaveTemplate}
                            disabled={!newTemplateName || !formData.customFields?.length}
                            className="bg-stone-900 text-stone-50 hover:bg-stone-800 rounded-xl w-11 h-11 flex-shrink-0"
                          >
                            <Save className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="font-serif text-xl text-stone-900">Special Measurements</h3>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addCustomField}
                          className="font-display rounded-lg border-stone-200 text-stone-600 hover:text-stone-900"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Unique Field
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        {(formData.customFields || []).map((field, index) => (
                          <motion.div
                            key={field.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <Card className="border-stone-100 shadow-sm bg-white rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                              <CardContent className="p-4">
                                <div className="flex flex-col md:flex-row gap-4 items-center">
                                  <div className="flex gap-1">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-stone-300 hover:text-stone-900"
                                      onClick={() => moveCustomField(field.id, 'up')}
                                      disabled={index === 0}
                                    >
                                      <ArrowUp className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-stone-300 hover:text-stone-900"
                                      onClick={() => moveCustomField(field.id, 'down')}
                                      disabled={index === (formData.customFields?.length || 0) - 1}
                                    >
                                      <ArrowDown className="w-3 h-3" />
                                    </Button>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 flex-1">
                                    <div className="md:col-span-5">
                                      <Input
                                        placeholder="e.g., Shoulder to Cuff"
                                        value={field.label}
                                        onChange={(e) => updateCustomField(field.id, { label: e.target.value })}
                                        className="font-display bg-stone-50 border-stone-100 rounded-lg text-sm"
                                      />
                                    </div>
                                    <div className="md:col-span-3 relative">
                                      <Input
                                        placeholder="0.0"
                                        value={field.value}
                                        onChange={(e) => updateCustomField(field.id, { value: e.target.value })}
                                        className="font-display bg-stone-50 border-stone-100 rounded-lg pr-8 text-sm text-center"
                                      />
                                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-300 text-[10px] uppercase font-display">
                                        {field.unit}
                                      </span>
                                    </div>
                                    <div className="md:col-span-3 flex gap-2">
                                      <Select
                                        value={field.unit}
                                        onValueChange={(val) => updateCustomField(field.id, { unit: val })}
                                      >
                                        <SelectTrigger className="font-display bg-stone-50 border-stone-100 rounded-lg h-9 w-[60px] text-xs">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="in">in</SelectItem>
                                          <SelectItem value="cm">cm</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <Input
                                        placeholder="Notes..."
                                        value={field.notes || ""}
                                        onChange={(e) => updateCustomField(field.id, { notes: e.target.value })}
                                        className="font-display bg-stone-50 border-stone-100 rounded-lg text-xs"
                                      />
                                    </div>
                                    <div className="md:col-span-1 flex justify-end">
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeCustomField(field.id)}
                                        className="text-stone-300 hover:text-red-500 transition-colors h-9 w-9"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}

                        {(!formData.customFields || formData.customFields.length === 0) && (
                          <div className="text-center py-12 border-2 border-dashed border-stone-100 rounded-2xl bg-stone-50/50">
                            <FileText className="w-10 h-10 text-stone-200 mx-auto mb-3" />
                            <p className="text-sm text-stone-400 font-display uppercase tracking-widest">No custom parameters defined</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="structure" className="mt-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="space-y-3">
                        <Label className="font-display text-xs uppercase tracking-widest text-stone-400">Body Architecture</Label>
                        <Select
                          value={formData.bodyStructure}
                          onValueChange={(value) => updateField("bodyStructure", value)}
                        >
                          <SelectTrigger className="font-display h-12 rounded-xl bg-stone-50 border-stone-200">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-stone-100 shadow-xl">
                            <SelectItem value="slim" className="font-display">Slim</SelectItem>
                            <SelectItem value="regular" className="font-display">Regular</SelectItem>
                            <SelectItem value="athletic" className="font-display">Athletic</SelectItem>
                            <SelectItem value="muscular" className="font-display">Muscular</SelectItem>
                            <SelectItem value="heavy" className="font-display">Heavy</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <Label className="font-display text-xs uppercase tracking-widest text-stone-400">Physiological Posture</Label>
                        <Select
                          value={formData.posture}
                          onValueChange={(value) => updateField("posture", value)}
                        >
                          <SelectTrigger className="font-display h-12 rounded-xl bg-stone-50 border-stone-200">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-stone-100 shadow-xl">
                            <SelectItem value="normal" className="font-display">Normal</SelectItem>
                            <SelectItem value="erect" className="font-display">Erect</SelectItem>
                            <SelectItem value="stooped" className="font-display">Stooped</SelectItem>
                            <SelectItem value="forward" className="font-display">Forward</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <Label className="font-display text-xs uppercase tracking-widest text-stone-400">Shoulder Inclination</Label>
                        <Select
                          value={formData.slopeShoulders}
                          onValueChange={(value) => updateField("slopeShoulders", value)}
                        >
                          <SelectTrigger className="font-display h-12 rounded-xl bg-stone-50 border-stone-200">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-stone-100 shadow-xl">
                            <SelectItem value="normal" className="font-display">Normal</SelectItem>
                            <SelectItem value="square" className="font-display">Square</SelectItem>
                            <SelectItem value="sloped" className="font-display">Sloped</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="font-display text-xs uppercase tracking-widest text-stone-400">Artisan Notes & Observations</Label>
                      <Textarea
                        value={formData.notes}
                        onChange={(e) => updateField("notes", e.target.value)}
                        className="font-display resize-none rounded-xl bg-stone-50 border-stone-200 focus:bg-white transition-colors p-4"
                        rows={4}
                        placeholder="Detail any unique physical traits or client preferences..."
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="features" className="mt-8 space-y-12">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                      <div className="space-y-6">
                        <div className="flex items-center gap-3 border-b border-stone-100 pb-3">
                          <Shirt className="w-5 h-5 text-stone-400" />
                          <h3 className="font-serif text-xl text-stone-900">Jacket Architecture</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {[
                            { key: "lapelStyle", label: "Lapel", options: ["notch", "peak", "shawl"] },
                            { key: "buttonStyle", label: "Closure", options: ["single-breasted-1", "single-breasted-2", "single-breasted-3", "double-breasted-4", "double-breasted-6"] },
                            { key: "jacketLengthOption", label: "Length", options: ["short", "regular", "long"] },
                            { key: "pocketStyle", label: "Pockets", options: ["flap", "patch", "jetted"] },
                            { key: "ventStyle", label: "Vents", options: ["single", "double", "none"] },
                            { key: "liningType", label: "Lining", options: ["full", "half", "unlined"] },
                          ].map((item) => (
                            <div key={item.key} className="space-y-2">
                              <Label className="font-display text-[10px] uppercase tracking-widest text-stone-400">{item.label}</Label>
                              <Select
                                value={(formData as any)[item.key]}
                                onValueChange={(value) => updateField(item.key, value)}
                              >
                                <SelectTrigger className="font-display h-10 rounded-lg bg-stone-50 border-stone-200 text-sm">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-stone-100 shadow-xl">
                                  {item.options.map((opt) => (
                                    <SelectItem key={opt} value={opt} className="font-display text-sm capitalize">
                                      {opt.replace(/-/g, ' ')}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="flex items-center gap-3 border-b border-stone-100 pb-3">
                          <Scissors className="w-5 h-5 text-stone-400" />
                          <h3 className="font-serif text-xl text-stone-900">Trouser Specification</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {[
                            { key: "trouserStyle", label: "Waist", options: ["flat-front", "pleated"] },
                            { key: "trouserFit", label: "Silhouette", options: ["slim", "regular", "relaxed"] },
                            { key: "cuffStyle", label: "Finishing", options: ["plain", "turn-up"] },
                          ].map((item) => (
                            <div key={item.key} className="space-y-2">
                              <Label className="font-display text-[10px] uppercase tracking-widest text-stone-400">{item.label}</Label>
                              <Select
                                value={(formData as any)[item.key]}
                                onValueChange={(value) => updateField(item.key, value)}
                              >
                                <SelectTrigger className="font-display h-10 rounded-lg bg-stone-50 border-stone-200 text-sm">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-stone-100 shadow-xl">
                                  {item.options.map((opt) => (
                                    <SelectItem key={opt} value={opt} className="font-display text-sm capitalize">
                                      {opt.replace(/-/g, ' ')}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="photos" className="mt-8">
                    <div className="p-8 border-2 border-dashed border-stone-200 rounded-3xl bg-stone-50/30">
                      <PhotoUpload
                        photos={formData.photos || []}
                        onChange={(photos) => setFormData((prev) => ({ ...prev, photos }))}
                      />
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-stone-100">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setIsDialogOpen(false);
                      resetForm();
                    }}
                    className="flex-1 font-display rounded-xl text-stone-400 hover:text-stone-900 h-12"
                  >
                    Discard Changes
                  </Button>
                  <Button
                    type="submit"
                    disabled={!formData.clientId}
                    className="flex-1 bg-stone-900 hover:bg-stone-800 text-stone-50 font-display rounded-xl h-12 shadow-lg shadow-stone-900/10"
                  >
                    {editingMeasurement ? "Commit Changes" : "Finalize Record"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </motion.div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center bg-white p-2 rounded-2xl shadow-sm border border-stone-100">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" />
          <Input
            placeholder="Search by client name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-14 font-display bg-transparent border-none focus-visible:ring-0 text-stone-900 placeholder:text-stone-300"
          />
        </div>
        <div className="h-8 w-px bg-stone-100 hidden sm:block" />
        <Select value={selectedClient} onValueChange={setSelectedClient}>
          <SelectTrigger className="w-full sm:w-[240px] h-14 font-display border-none bg-transparent focus:ring-0 text-stone-600">
            <SelectValue placeholder="All Clients" />
          </SelectTrigger>
          <SelectContent className="rounded-xl shadow-2xl border-stone-100">
            <SelectItem value="all" className="font-display">All Clients</SelectItem>
            {clients.map((client) => (
              <SelectItem key={client.id} value={client.id} className="font-display">
                {client.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <AnimatePresence mode="popLayout">
        {filteredMeasurements.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-32 text-center"
          >
            <div className="w-24 h-24 rounded-full bg-stone-50 flex items-center justify-center mb-8">
              <Ruler className="w-10 h-10 text-stone-200" />
            </div>
            <h3 className="text-2xl font-serif text-stone-900 mb-3">
              {searchQuery || selectedClient !== "all"
                ? "No matching records found"
                : "No measurement records yet"}
            </h3>
            <p className="text-stone-400 font-display max-w-xs mx-auto text-sm leading-relaxed">
              {clients.length === 0
                ? "Please register a client before capturing body measurements."
                : "Begin your bespoke journey by recording a client's unique silhouette."}
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredMeasurements.map((measurement, index) => (
              <motion.div
                key={measurement.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5, delay: index * 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
                layout
              >
                <Card className="group border-none shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] bg-white rounded-3xl overflow-hidden hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] transition-all duration-500">
                  <div className="h-2 w-full bg-stone-900 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <CardHeader className="p-8 pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-stone-50 flex items-center justify-center group-hover:bg-stone-900 group-hover:text-stone-50 transition-colors duration-500">
                          <Ruler className="w-6 h-6" />
                        </div>
                        <div>
                          <Link href={`/dashboard/clients/${measurement.clientId}`}>
                            <CardTitle className="font-serif text-xl text-stone-900 hover:text-stone-500 transition-colors cursor-pointer">
                              {getClientName(measurement.clientId)}
                            </CardTitle>
                          </Link>
                          <p className="text-[10px] text-stone-400 font-display mt-1 tracking-widest uppercase">
                            Recorded {new Date(measurement.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                         <div className="flex bg-stone-50 p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                            <Link href={`/dashboard/measurements/docket/${measurement.id}`}>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-stone-400 hover:text-stone-900"
                                title="View Docket"
                              >
                                <FileText className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(measurement)}
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
                                    Delete Record?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription className="font-display text-stone-500">
                                    This will permanently remove this client's measurement specification from the system.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="mt-6">
                                  <AlertDialogCancel className="font-display rounded-xl">
                                    Keep Record
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(measurement.id)}
                                    className="bg-red-500 hover:bg-red-600 text-stone-50 font-display rounded-xl"
                                  >
                                    Delete Permanently
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8 pt-0">
                      <div className="grid grid-cols-2 gap-4 mt-6">
                        {[
                          { label: "Chest", val: measurement.chest },
                          { label: "Waist", val: measurement.waist },
                          { label: "Shoulders", val: measurement.shoulders },
                          { label: "Sleeve", val: measurement.sleeveLength }
                        ].map((m) => m.val && (
                          <div key={m.label} className="p-4 bg-stone-50 rounded-2xl group-hover:bg-white border border-transparent group-hover:border-stone-100 transition-all duration-500">
                            <p className="text-[10px] text-stone-400 font-display uppercase tracking-widest mb-1">{m.label}</p>
                            <p className="font-serif text-lg text-stone-900">{m.val}&quot;</p>
                          </div>
                        ))}
                      </div>

                      <div className="mt-8 flex items-center justify-between border-t border-stone-50 pt-6">
                        <div className="flex items-center gap-2 group/assign cursor-pointer">
                          <UserCheck className="w-4 h-4 text-stone-300 group-hover/assign:text-stone-900 transition-colors" />
                          <Select
                            value={measurement.assignedStaffId || "unassigned"}
                            onValueChange={(value) => handleStaffAssign(measurement.id, value === "unassigned" ? "" : value)}
                          >
                            <SelectTrigger className="h-6 w-auto px-0 text-[10px] font-display uppercase tracking-widest border-none bg-transparent hover:text-stone-900 text-stone-400 shadow-none focus:ring-0">
                              <SelectValue placeholder="No Artisan" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-stone-100 shadow-xl">
                              <SelectItem value="unassigned" className="text-[10px] font-display uppercase">Unassigned</SelectItem>
                              {staffMembers.map((staff) => (
                                <SelectItem key={staff.id} value={staff.id} className="text-[10px] font-display uppercase">
                                  {staff.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="flex -space-x-2 overflow-hidden">
                          {measurement.photos?.slice(0, 3).map((photo) => (
                            <div key={photo.id} className="inline-block h-8 w-8 rounded-full ring-2 ring-white overflow-hidden">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={photo.url} alt={photo.label} className="h-full w-full object-cover" />
                            </div>
                          ))}
                          {measurement.photos && measurement.photos.length > 3 && (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 ring-2 ring-white text-[10px] font-display text-stone-400">
                              +{measurement.photos.length - 3}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-6 flex flex-wrap gap-2">
                        {[
                          measurement.bodyStructure,
                          `${measurement.posture} posture`,
                          `${measurement.slopeShoulders} shoulders`
                        ].map((tag) => (
                          <span key={tag} className="text-[9px] px-3 py-1.5 rounded-full bg-stone-50 text-stone-400 font-display uppercase tracking-tighter group-hover:bg-stone-900 group-hover:text-stone-50 transition-all duration-500">
                            {tag}
                          </span>
                        ))}
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
