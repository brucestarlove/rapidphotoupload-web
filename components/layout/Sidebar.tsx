"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Plus, Folder, Image, Clock, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { useUpload } from "@/hooks/useUpload";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { label: "My Files", href: "/", icon: Folder },
  { label: "Photos", href: "/photos", icon: Image },
  { label: "Recent", href: "/recent", icon: Clock },
  { label: "Trash", href: "/trash", icon: Trash2 },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFiles } = useUpload();

  const handleNewClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFiles(Array.from(e.target.files));
      // Reset input
      e.target.value = "";
    }
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r border-border bg-sidebar transition-all duration-300",
        collapsed ? "w-16" : "w-60"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Collapse button */}
        <div className="flex items-center justify-end p-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* New button */}
        <div className="px-4 pb-4">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <Button
            className="w-full bg-primary hover:bg-primary/90"
            size="lg"
            onClick={handleNewClick}
          >
            <Plus className="mr-2 h-4 w-4" />
            {!collapsed && "New"}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || 
                           (item.href === "/" && pathname === "/");

            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground border-l-4 border-primary"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Storage indicator */}
        {!collapsed && (
          <div className="border-t border-sidebar-border p-4">
            <div className="text-xs text-muted-foreground">
              <div className="flex justify-between mb-1">
                <span>Storage</span>
                <span>136.63 GB / 530.00 GB</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted">
                <div className="h-2 rounded-full bg-primary" style={{ width: "25.8%" }} />
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

