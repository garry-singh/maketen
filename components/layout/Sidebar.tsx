"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

const gameLinks = [
  {
    title: "Make 10",
    href: "/",
    description: "Classic mode",
  },
  {
    title: "Make X",
    href: "/make-x",
    description: "Challenge mode",
  },
  {
    title: "Make Exact Operations",
    href: "/make-exact-operations",
    description: "Find the operators",
  },
];

const Sidebar = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50 hover:bg-muted"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px] p-6">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-3xl font-bold">Game Modes</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-3">
          {gameLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "relative p-4 rounded-lg transition-all duration-200",
                  isActive
                    ? [
                        "bg-primary/10 dark:bg-primary/20",
                        "border border-primary/20 dark:border-primary/30",
                        "hover:bg-primary/20 dark:hover:bg-primary/30",
                        "text-foreground dark:text-foreground",
                      ]
                    : [
                        "bg-background hover:bg-accent",
                        "border border-border hover:border-accent",
                        "text-foreground dark:text-foreground",
                      ]
                )}
              >
                <h3 className="font-semibold text-lg mb-1">{link.title}</h3>
                <p
                  className={cn(
                    "text-sm",
                    isActive
                      ? "text-foreground/70 dark:text-foreground/70"
                      : "text-muted-foreground"
                  )}
                >
                  {link.description}
                </p>
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
};

export default Sidebar;
