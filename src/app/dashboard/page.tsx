"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  getClients,
  getOrders,
  getAlterations,
  getMeasurements,
  getAppointments,
  type Client,
  type SuitOrder,
  type Alteration,
  type Appointment,
} from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Shirt, Scissors, Ruler, TrendingUp, Clock, CalendarDays } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [orders, setOrders] = useState<SuitOrder[]>([]);
  const [alterations, setAlterations] = useState<Alteration[]>([]);
  const [measurements, setMeasurements] = useState<number>(0);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    setClients(getClients());
    setOrders(getOrders());
    setAlterations(getAlterations());
    setMeasurements(getMeasurements().length);
    setAppointments(getAppointments());
  }, []);

  const pendingOrders = orders.filter(
    (o) => o.status !== "completed" && o.status !== "delivered"
  );
  const pendingAlterations = alterations.filter(
    (a) => a.status !== "completed" && a.status !== "picked-up"
  );
  const upcomingAppointments = appointments.filter(
    (a) => new Date(a.date) >= new Date() && a.status !== "cancelled" && a.status !== "completed"
  );

  const stats = [
    {
      title: "Total Clients",
      value: clients.length,
      icon: Users,
      color: "bg-blue-50 text-blue-600",
      href: "/dashboard/clients",
    },
    {
      title: "Appointments",
      value: upcomingAppointments.length,
      icon: CalendarDays,
      color: "bg-teal-50 text-teal-600",
      href: "/dashboard/appointments",
    },
      {
        title: "Pending Alterations",
        value: pendingAlterations.length,
        icon: Scissors,
        color: "bg-emerald-50 text-emerald-600",
        href: "/dashboard/alterations",
      },
    ];

    const recentClients = clients.slice(-5).reverse();

    return (
    <div className="space-y-8">
      <div>
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-serif text-stone-900"
        >
          Dashboard
        </motion.h1>
        <p className="text-stone-500 font-display mt-1">
          Overview of your tailoring business
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={stat.href}>
                <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer border-stone-200">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-stone-500 font-display uppercase tracking-wider">
                            {stat.title}
                          </p>
                          <p className="text-3xl font-serif text-stone-900 mt-1">
                            {stat.value}
                          </p>
                        </div>
                      <div className={`p-3 rounded-full ${stat.color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <Card className="border-stone-200">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-serif text-xl text-stone-900">
                Recent Clients
              </CardTitle>
              <TrendingUp className="w-5 h-5 text-stone-400" />
            </CardHeader>
            <CardContent>
              {recentClients.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                  <p className="text-stone-500">No clients yet</p>
                  <Link
                    href="/dashboard/clients"
                    className="text-sm text-stone-900 hover:underline mt-2 inline-block"
                  >
                    Add your first client
                  </Link>
                </div>
              ) : (
                <ul className="space-y-3">
                  {recentClients.map((client) => (
                    <li
                      key={client.id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-stone-50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center">
                        <span className="font-serif text-stone-600">
                          {client.name.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-display text-stone-900 truncate">
                          {client.name}
                        </p>
                        <p className="text-sm text-stone-500 truncate">
                          {client.email || client.phone}
                        </p>
                      </div>
                      <Link
                        href={`/dashboard/clients`}
                        className="text-sm text-stone-600 hover:text-stone-900"
                      >
                        View
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="border-stone-200 bg-gradient-to-br from-stone-900 to-stone-800 text-white">
          <CardContent className="py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="text-2xl font-serif mb-2">
                    Quick Actions
                  </h3>
                  <p className="text-stone-300 font-display">
                    Get started with common tasks
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/dashboard/appointments"
                    className="px-5 py-2.5 bg-white text-stone-900 rounded text-sm font-display hover:bg-stone-100 transition-colors"
                  >
                    Book Appointment
                  </Link>
                  <Link
                    href="/dashboard/clients"
                    className="px-5 py-2.5 bg-stone-700 text-white rounded text-sm font-display hover:bg-stone-600 transition-colors"
                  >
                    Add Client
                  </Link>
                    <Link
                      href="/dashboard/measurements"
                      className="px-5 py-2.5 bg-stone-700 text-white rounded text-sm font-display hover:bg-stone-600 transition-colors"
                    >
                      New Measurement
                    </Link>
                  </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
  );
}
