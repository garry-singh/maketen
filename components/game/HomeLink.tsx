import React from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

/** Replaces the old hamburger: the way back to the mode list. */
const HomeLink = () => (
  <Link
    href="/"
    className="fixed top-4 left-4 z-50 flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
  >
    <ChevronLeft className="h-4 w-4" />
    All games
  </Link>
);

export default HomeLink;
