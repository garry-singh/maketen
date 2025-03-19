import MakeTen from "@/components/make-ten/MakeTen";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Make Ten",
  description: "A daily number puzzle game where you make 10",
};

export default function Home() {
  return <MakeTen />;
}
