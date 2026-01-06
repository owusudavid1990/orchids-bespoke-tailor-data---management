"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  getClients,
  getMeasurementsByClient,
  getOrdersByClient,
  getAlterationsByClient,
  getAppointmentsByClient,
  type Client,
  type Measurement,
  type SuitOrder,
  type Alteration,
  type Appointment,
} from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Ruler,
  ShoppingBag,
  Scissors,
  Calendar,
  FileText,
  Pencil,
} from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

const upperBodyFields = [
  { key: "chest", label: "Chest" },
  { key: "waist", label: "Waist" },
  { key: "hips", label: "Hips" },
  { key: "shoulders", label: "Shoulders" },
  { key: "neck", label: "Neck" },
  { key: "sleeveLength", label: "Sleeve Length" },
  { key: "armhole", label: "Armhole" },
  { key: "bicep", label: "Bicep" },
  { key: "wrist", label: "Wrist" },
  { key: "jacketLength", label: "Jacket Length" },
  { key: "backLength", label: "Back Length" },
  { key: "frontLength", label: "Front Length" },
];

const lowerBodyFields = [
  { key: "trouserLength", label: "Trouser Length" },
  { key: "inseam", label: "Inseam" },
  { key: "outseam", label: "Outseam" },
  { key: "thigh", label: "Thigh" },
  { key: "knee", label: "Knee" },
  { key: "calf", label: "Calf" },
  { key: "ankle", label: "Ankle" },
  { key: "rise", label: "Rise" },
];

export default function ClientProfilePage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [orders, setOrders] = useState<SuitOrder[]>([]);
  const [alterations, setAlterations] = useState<Alteration[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    const clients = getClients();
    const foundClient = clients.find((c) => c.id === id);
    if (foundClient) {
      setClient(foundClient);
      setMeasurements(getMeasurementsByClient(id));
      setOrders(getOrdersByClient(id));
      setAlterations(getAlterationsByClient(id));
      setAppointments(getAppointmentsByClient(id));
    }
  }, [id]);

  if (!client) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <User className="w-16 h-16 text-stone-300 mx-auto mb-4" />
          <h2 className="text-xl text-stone-700">Client not found</h2>
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="mt-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const latestMeasurement = measurements[measurements.length - 1];

  const orderStatusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    "in-progress": "bg-blue-100 text-blue-800",
    fitting: "bg-purple-100 text-purple-800",
    alterations: "bg-orange-100 text-orange-800",
    completed: "bg-green-100 text-green-800",
    delivered: "bg-stone-100 text-stone-800",
  };

  const alterationStatusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    "in-progress": "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    "picked-up": "bg-stone-100 text-stone-800",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => router.push("/dashboard/clients")}
          className="font-display"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Clients
        </Button>
        <Link href={`/dashboard/clients`}>
          <Button variant="outline" className="font-display">
            <Pencil className="w-4 h-4 mr-2" />
            Edit Client
          </Button>
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm"
      >
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-stone-200 to-stone-300 flex items-center justify-center flex-shrink-0">
            <span className="text-3xl text-stone-600">
              {client.name.charAt(0)}
            </span>
          </div>
          <div className="flex-1">
            <h1 className="text-3xl text-stone-900">{client.name}</h1>
            <p className="text-stone-500 mt-1">
              Client since {new Date(client.createdAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
            <div className="flex flex-wrap gap-4 mt-4">
              {client.phone && (
                <div className="flex items-center gap-2 text-sm text-stone-600">
                  <Phone className="w-4 h-4 text-stone-400" />
                  <span className="font-display">{client.phone}</span>
                </div>
              )}
              {client.email && (
                <div className="flex items-center gap-2 text-sm text-stone-600">
                  <Mail className="w-4 h-4 text-stone-400" />
                  <span className="font-display">{client.email}</span>
                </div>
              )}
              {client.address && (
                <div className="flex items-center gap-2 text-sm text-stone-600">
                  <MapPin className="w-4 h-4 text-stone-400" />
                  <span className="font-display">{client.address}</span>
                </div>
              )}
            </div>
            {client.notes && (
              <p className="text-sm text-stone-500 mt-4 p-3 bg-stone-50 rounded-lg">
                {client.notes}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-stone-200">
          <div className="text-center p-4 bg-stone-50 rounded-lg">
            <Ruler className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl text-stone-900">{measurements.length}</p>
            <p className="text-xs text-stone-500">Measurements</p>
          </div>
          <div className="text-center p-4 bg-stone-50 rounded-lg">
            <ShoppingBag className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl text-stone-900">{orders.length}</p>
            <p className="text-xs text-stone-500">Orders</p>
          </div>
          <div className="text-center p-4 bg-stone-50 rounded-lg">
            <Scissors className="w-6 h-6 text-amber-600 mx-auto mb-2" />
            <p className="text-2xl text-stone-900">{alterations.length}</p>
            <p className="text-xs text-stone-500">Alterations</p>
          </div>
          <div className="text-center p-4 bg-stone-50 rounded-lg">
            <Calendar className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <p className="text-2xl text-stone-900">{appointments.length}</p>
            <p className="text-xs text-stone-500">Appointments</p>
          </div>
        </div>
      </motion.div>

      <Tabs defaultValue="measurements" className="w-full">
        <TabsList className="grid w-full grid-cols-4 h-12">
          <TabsTrigger value="measurements" className="font-display">
            <Ruler className="w-4 h-4 mr-2" />
            Measurements
          </TabsTrigger>
          <TabsTrigger value="orders" className="font-display">
            <ShoppingBag className="w-4 h-4 mr-2" />
            Orders
          </TabsTrigger>
          <TabsTrigger value="alterations" className="font-display">
            <Scissors className="w-4 h-4 mr-2" />
            Alterations
          </TabsTrigger>
          <TabsTrigger value="appointments" className="font-display">
            <Calendar className="w-4 h-4 mr-2" />
            Appointments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="measurements" className="mt-6">
          {latestMeasurement ? (
            <Card className="border-stone-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Latest Measurements</CardTitle>
                  <span className="text-sm text-stone-500">
                    {new Date(latestMeasurement.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm text-stone-500 uppercase tracking-wider mb-3">
                      Upper Body
                    </h4>
                    <div className="grid grid-cols-3 gap-3">
                        {upperBodyFields.map((field) => {
                          const value = (latestMeasurement as unknown as Record<string, string>)[field.key];
                          if (!value) return null;
                        return (
                          <div key={field.key} className="text-center p-2 bg-stone-50 rounded">
                            <p className="text-xs text-stone-500">{field.label}</p>
                            <p className="text-stone-900">{value}&quot;</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm text-stone-500 uppercase tracking-wider mb-3">
                      Lower Body
                    </h4>
                      <div className="grid grid-cols-3 gap-3">
                        {lowerBodyFields.map((field) => {
                          const value = (latestMeasurement as unknown as Record<string, string>)[field.key];
                          if (!value) return null;
                        return (
                          <div key={field.key} className="text-center p-2 bg-stone-50 rounded">
                            <p className="text-xs text-stone-500">{field.label}</p>
                            <p className="text-stone-900">{value}&quot;</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-stone-100 flex flex-wrap gap-2">
                  <Badge variant="outline" className="capitalize">
                    {latestMeasurement.bodyStructure} build
                  </Badge>
                  <Badge variant="outline" className="capitalize">
                    {latestMeasurement.posture} posture
                  </Badge>
                  <Badge variant="outline" className="capitalize">
                    {latestMeasurement.slopeShoulders} shoulders
                  </Badge>
                </div>
                {latestMeasurement.notes && (
                  <p className="mt-4 text-sm text-stone-500 p-3 bg-yellow-50 rounded-lg">
                    {latestMeasurement.notes}
                  </p>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="text-center py-12 bg-stone-50 rounded-xl">
              <Ruler className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <p className="text-stone-500">No measurements recorded yet</p>
              <Link href="/dashboard/measurements">
                <Button className="mt-4 bg-stone-900 hover:bg-stone-800">
                  Add Measurement
                </Button>
              </Link>
            </div>
          )}
        </TabsContent>

        <TabsContent value="orders" className="mt-6">
          {orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order) => (
                <Card key={order.id} className="border-stone-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-3">
                          <h4 className="text-lg text-stone-900 capitalize">
                            {order.suitStyle.replace("-", " ")} Suit
                          </h4>
                          <Badge className={`${orderStatusColors[order.status]} capitalize`}>
                            {order.status.replace("-", " ")}
                          </Badge>
                        </div>
                        <p className="text-sm text-stone-500 mt-1">
                          {order.lapelStyle} lapel • {order.buttons} buttons • {order.ventStyle} vent
                        </p>
                        <p className="text-xs text-stone-400 mt-2">
                          Due: {order.dueDate ? new Date(order.dueDate).toLocaleDateString() : "Not set"}
                        </p>
                      </div>
                      <Link href="/dashboard/orders">
                        <Button variant="ghost" size="sm" className="font-display">
                          View
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-stone-50 rounded-xl">
              <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <p className="text-stone-500">No orders placed yet</p>
              <Link href="/dashboard/orders">
                <Button className="mt-4 bg-stone-900 hover:bg-stone-800">
                  Create Order
                </Button>
              </Link>
            </div>
          )}
        </TabsContent>

        <TabsContent value="alterations" className="mt-6">
          {alterations.length > 0 ? (
            <div className="space-y-4">
              {alterations.map((alteration) => (
                <Card key={alteration.id} className="border-stone-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-3">
                          <h4 className="text-lg text-stone-900">
                            {alteration.garmentType}
                          </h4>
                          <Badge className={`${alterationStatusColors[alteration.status]} capitalize`}>
                            {alteration.status.replace("-", " ")}
                          </Badge>
                        </div>
                        <p className="text-sm text-stone-500 mt-1">
                          {alteration.alterations.slice(0, 3).join(", ")}
                          {alteration.alterations.length > 3 && ` +${alteration.alterations.length - 3} more`}
                        </p>
                        <p className="text-xs text-stone-400 mt-2">
                          Due: {alteration.dueDate ? new Date(alteration.dueDate).toLocaleDateString() : "Not set"}
                          {alteration.price && ` • ${alteration.price}`}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/dashboard/alterations/docket/${alteration.id}`}>
                          <Button variant="ghost" size="sm" className="font-display">
                            <FileText className="w-4 h-4 mr-1" />
                            Docket
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-stone-50 rounded-xl">
              <Scissors className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <p className="text-stone-500">No alterations recorded yet</p>
              <Link href="/dashboard/alterations">
                <Button className="mt-4 bg-stone-900 hover:bg-stone-800">
                  Add Alteration
                </Button>
              </Link>
            </div>
          )}
        </TabsContent>

        <TabsContent value="appointments" className="mt-6">
          {appointments.length > 0 ? (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <Card key={appointment.id} className="border-stone-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-3">
                          <h4 className="text-lg text-stone-900 capitalize">
                            {appointment.type}
                          </h4>
                          <Badge
                            variant="outline"
                            className={`capitalize ${
                              appointment.status === "completed"
                                ? "border-green-200 text-green-700"
                                : appointment.status === "cancelled"
                                ? "border-red-200 text-red-700"
                                : "border-blue-200 text-blue-700"
                            }`}
                          >
                            {appointment.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-stone-500 mt-1">
                          {new Date(appointment.date).toLocaleDateString("en-GB", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                          })} at {appointment.time}
                        </p>
                        {appointment.notes && (
                          <p className="text-xs text-stone-400 mt-2">
                            {appointment.notes}
                          </p>
                        )}
                      </div>
                      <Link href="/dashboard/appointments">
                        <Button variant="ghost" size="sm" className="font-display">
                          View
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-stone-50 rounded-xl">
              <Calendar className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <p className="text-stone-500">No appointments scheduled</p>
              <Link href="/dashboard/appointments">
                <Button className="mt-4 bg-stone-900 hover:bg-stone-800">
                  Schedule Appointment
                </Button>
              </Link>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
