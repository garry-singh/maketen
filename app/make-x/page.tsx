import MakeX from "@/components/make-x/MakeX";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Make X",
  description: "A daily arithmetic puzzle game",
};

export default function MakeXPage() {
  return <MakeX />;
}
