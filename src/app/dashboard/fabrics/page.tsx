"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getFabrics,
  getClients,
  saveFabric,
  deleteFabric,
  generateId,
  type FabricSelection,
  type Client,
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
import { Plus, Search, Pencil, Trash2, Palette, ImageIcon, Upload, Loader2 } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { supabase } from "@/lib/supabase";

const fabricTypes = [
  "Wool",
  "Cashmere",
  "Silk",
  "Linen",
  "Cotton",
  "Tweed",
  "Flannel",
  "Mohair",
  "Blend",
];

const patterns = [
  "Solid",
  "Pinstripe",
  "Chalk Stripe",
  "Herringbone",
  "Houndstooth",
  "Glen Plaid",
  "Windowpane",
  "Check",
  "Birdseye",
];

const defaultFabric: Omit<FabricSelection, "id" | "createdAt"> = {
  clientId: "",
  fabricCode: "",
  fabricName: "",
  fabricType: "",
  color: "",
  pattern: "",
  composition: "",
  weight: "",
  price: "",
  imageUrl: "",
  notes: "",
};

export default function FabricsPage() {
  const [fabrics, setFabrics] = useState<FabricSelection[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClient, setSelectedClient] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFabric, setEditingFabric] = useState<FabricSelection | null>(null);
  const [formData, setFormData] = useState<Omit<FabricSelection, "id" | "createdAt">>(defaultFabric);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    setIsUploading(true);
    const file = acceptedFiles[0];
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from("fabrics")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("fabrics").getPublicUrl(filePath);

      updateField("imageUrl", publicUrl);
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setFabrics(getFabrics());
    setClients(getClients());
  };

  const getClientName = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    return client?.name || "Unknown Client";
  };

  const filteredFabrics = fabrics.filter((f) => {
    const matchesSearch =
      f.fabricCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.fabricName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getClientName(f.clientId).toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClient = selectedClient === "all" || f.clientId === selectedClient;
    return matchesSearch && matchesClient;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientId || !formData.fabricCode) return;

    const fabric: FabricSelection = {
      id: editingFabric?.id || generateId(),
      ...formData,
      createdAt: editingFabric?.createdAt || new Date().toISOString(),
    };
    saveFabric(fabric);
    loadData();
    resetForm();
    setIsDialogOpen(false);
  };

  const handleEdit = (fabric: FabricSelection) => {
    setEditingFabric(fabric);
    setFormData({
      clientId: fabric.clientId,
      fabricCode: fabric.fabricCode,
      fabricName: fabric.fabricName,
      fabricType: fabric.fabricType,
      color: fabric.color,
      pattern: fabric.pattern,
      composition: fabric.composition,
      weight: fabric.weight,
      price: fabric.price,
      imageUrl: fabric.imageUrl,
      notes: fabric.notes,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteFabric(id);
    loadData();
  };

  const resetForm = () => {
    setEditingFabric(null);
    setFormData(defaultFabric);
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
            className="text-3xl font-serif text-stone-900"
          >
            Fabric Selections
          </motion.h1>
          <p className="text-stone-500 font-display mt-1">
            Manage fabric choices for your clients
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
              Add Fabric Selection
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-serif">
                {editingFabric ? "Edit Fabric Selection" : "New Fabric Selection"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label className="font-display">Select Client *</Label>
                <Select
                  value={formData.clientId}
                  onValueChange={(value) => updateField("clientId", value)}
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-display">Fabric Code *</Label>
                  <Input
                    value={formData.fabricCode}
                    onChange={(e) => updateField("fabricCode", e.target.value)}
                    className="font-display"
                    placeholder="e.g., WL-2024-001"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-display">Fabric Name</Label>
                  <Input
                    value={formData.fabricName}
                    onChange={(e) => updateField("fabricName", e.target.value)}
                    className="font-display"
                    placeholder="e.g., Super 150s Navy"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-display">Fabric Type</Label>
                  <Select
                    value={formData.fabricType}
                    onValueChange={(value) => updateField("fabricType", value)}
                  >
                    <SelectTrigger className="font-display">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {fabricTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="font-display">Pattern</Label>
                  <Select
                    value={formData.pattern}
                    onValueChange={(value) => updateField("pattern", value)}
                  >
                    <SelectTrigger className="font-display">
                      <SelectValue placeholder="Select pattern" />
                    </SelectTrigger>
                    <SelectContent>
                      {patterns.map((pattern) => (
                        <SelectItem key={pattern} value={pattern}>
                          {pattern}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-display">Color</Label>
                  <Input
                    value={formData.color}
                    onChange={(e) => updateField("color", e.target.value)}
                    className="font-display"
                    placeholder="e.g., Navy Blue"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-display">Weight (oz/yd)</Label>
                  <Input
                    value={formData.weight}
                    onChange={(e) => updateField("weight", e.target.value)}
                    className="font-display"
                    placeholder="e.g., 11oz"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-display">Composition</Label>
                <Input
                  value={formData.composition}
                  onChange={(e) => updateField("composition", e.target.value)}
                  className="font-display"
                  placeholder="e.g., 100% Wool, Super 150s"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-display">Price</Label>
                  <Input
                    value={formData.price}
                    onChange={(e) => updateField("price", e.target.value)}
                    className="font-display"
                    placeholder="e.g., $150/m"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-display">Fabric Image</Label>
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-xl p-4 transition-colors cursor-pointer flex flex-col items-center justify-center gap-2 min-h-[120px] ${
                      isDragActive
                        ? "border-stone-900 bg-stone-50"
                        : "border-stone-200 hover:border-stone-400"
                    }`}
                  >
                    <input {...getInputProps()} />
                    {isUploading ? (
                      <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
                    ) : formData.imageUrl ? (
                      <div className="relative w-full aspect-video">
                        <img
                          src={formData.imageUrl}
                          alt="Preview"
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                          <p className="text-white text-sm font-display">
                            Change Image
                          </p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-stone-400" />
                        <p className="text-sm text-stone-500 font-display text-center">
                          {isDragActive
                            ? "Drop image here"
                            : "Click or drag to upload fabric image"}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-display">Notes</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => updateField("notes", e.target.value)}
                  className="resize-none"
                  rows={2}
                  placeholder="Any special notes about this fabric..."
                />
              </div>

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
                  disabled={!formData.clientId || !formData.fabricCode}
                  className="flex-1 bg-stone-900 hover:bg-stone-800"
                >
                  {editingFabric ? "Update" : "Save"}
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
            placeholder="Search by fabric code, name, or client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 font-display"
          />
        </div>
        <Select value={selectedClient} onValueChange={setSelectedClient}>
          <SelectTrigger className="w-full sm:w-[200px] h-12 font-display">
            <SelectValue placeholder="Filter by client" />
          </SelectTrigger>
          <SelectContent>
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
        {filteredFabrics.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Palette className="w-16 h-16 text-stone-300 mx-auto mb-4" />
            <h3 className="text-xl font-serif text-stone-700 mb-2">
              {searchQuery || selectedClient !== "all"
                ? "No fabric selections found"
                : "No fabric selections yet"}
            </h3>
            <p className="text-stone-500 font-display">
              {clients.length === 0
                ? "Add a client first to create fabric selections"
                : "Add your first fabric selection to get started"}
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFabrics.map((fabric, index) => (
              <motion.div
                key={fabric.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                layout
              >
                <Card className="border-stone-200 hover:shadow-lg transition-all duration-300 overflow-hidden">
                  {fabric.imageUrl && (
                    <div className="h-32 bg-stone-100 relative">
                      <img
                        src={fabric.imageUrl}
                        alt={fabric.fabricName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  {!fabric.imageUrl && (
                    <div className="h-32 bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-stone-300" />
                    </div>
                  )}
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs text-stone-500 uppercase font-display tracking-wider mb-1">
                          {fabric.fabricCode}
                        </p>
                        <CardTitle className="text-lg font-serif text-stone-900">
                          {fabric.fabricName || "Unnamed Fabric"}
                        </CardTitle>
                        <p className="text-sm text-stone-500 font-display mt-1">
                          For {getClientName(fabric.clientId)}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(fabric)}
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
                                Delete Fabric Selection?
                              </AlertDialogTitle>
                              <AlertDialogDescription className="font-display">
                                This will permanently delete this fabric selection.
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="font-display">
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(fabric.id)}
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
                    <div className="flex flex-wrap gap-2">
                      {fabric.fabricType && (
                        <span className="text-xs px-2 py-1 rounded-full bg-amber-50 text-amber-700">
                          {fabric.fabricType}
                        </span>
                      )}
                      {fabric.pattern && (
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700">
                          {fabric.pattern}
                        </span>
                      )}
                      {fabric.color && (
                        <span className="text-xs px-2 py-1 rounded-full bg-stone-100 text-stone-600">
                          {fabric.color}
                        </span>
                      )}
                    </div>
                    {fabric.composition && (
                      <p className="text-sm text-stone-600">
                        {fabric.composition}
                      </p>
                    )}
                    {(fabric.weight || fabric.price) && (
                      <div className="flex gap-4 text-sm pt-2 border-t border-stone-100">
                        {fabric.weight && (
                          <span className="text-stone-600">
                            {fabric.weight}
                          </span>
                        )}
                        {fabric.price && (
                          <span className="text-stone-900 font-medium">
                            {fabric.price}
                          </span>
                        )}
                      </div>
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
