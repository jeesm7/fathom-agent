"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  Upload,
  Settings,
  ScrollText,
  LogOut,
} from "lucide-react";
// import { signOut } from "next-auth/react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/integrations", label: "Integrations", icon: Settings },
  { href: "/prompts", label: "Prompts", icon: FileText },
  { href: "/examples", label: "Examples", icon: Upload },
  { href: "/logs", label: "Logs", icon: ScrollText },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <motion.nav
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      className="fixed left-0 top-0 h-full w-64 border-r border-gray-800/50 bg-gray-950/90 backdrop-blur-xl p-6 shadow-2xl"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent pointer-events-none" />
      <div className="mb-8 relative">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mb-3 shadow-lg shadow-purple-500/30">
          <span className="text-2xl">🤖</span>
        </div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          Fathom Agent
        </h1>
        <p className="text-xs text-gray-500 mt-1">AI Document Generator</p>
      </div>

      <div className="space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                  isActive
                    ? "bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-purple-400 border border-purple-500/30"
                    : "text-gray-400 hover:bg-gray-800/50 hover:text-gray-100"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="absolute bottom-6 left-6 right-6">
        <div className="p-3 rounded-xl bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/30 mb-3">
          <p className="text-xs text-gray-400 mb-1">Quick Stats</p>
          <p className="text-sm font-semibold text-purple-300">Demo Mode</p>
        </div>
      </div>
    </motion.nav>
  );
}

