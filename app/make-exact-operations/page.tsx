import MakeExactOps from "@/app/components/make-exact-operations/MakeExactOps";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Make Exact Operations",
  description:
    "A daily arithmetic puzzle game where you need to find the correct operators",
};

export default function MakeExactOpsPage() {
  return <MakeExactOps />;
}
