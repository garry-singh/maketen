import React from "react";
import { Button } from "@/components/ui/button";
import { FaXTwitter } from "react-icons/fa6";
import { toast } from "sonner";
import { SOCIAL_LINKS } from "@/lib/make-ten/constants";
import { Streaks } from "@/lib/make-ten/types";

interface ShareOptionsProps {
  userInput: string;
  solveTime: number | null;
  streaks: Streaks;
}

/**
 * Component to handle sharing solutions
 */
const ShareOptions: React.FC<ShareOptionsProps> = ({
  userInput,
  solveTime,
  streaks,
}) => {
  const copyToClipboard = async () => {
    if (!userInput || !solveTime) return;

    const formattedTime = solveTime.toFixed(2);
    const streakText =
      streaks.streak > 0 ? `\n🔥 ${streaks.streak} day streak!` : "";

    const maskedSolution = userInput
      .replace(/[0-9]/g, "⬛")
      .replace(/[\(\)]/g, "⬜");

    const coloredOperators = maskedSolution
      .replace(/[+]/g, "➕")
      .replace(/[-]/g, "➖")
      .replace(/[*]/g, "✖️")
      .replace(/[/]/g, "➗");

    const shareText = `Make 10 Puzzle\n\n⏱️ ${formattedTime}s${streakText}\n\n${coloredOperators}\n\n Play now: https://maketen.vercel.app/`;

    // Try Web Share API first
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Make 10",
          text: shareText,
        });
        toast.success("Shared successfully!");
        return;
      } catch (err) {
        // If user cancelled sharing, don't show error
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }
        // Fall back to clipboard
        console.warn("Web Share API failed:", err);
      }
    }

    // Fallback to clipboard
    try {
      await navigator.clipboard.writeText(shareText);
      toast.success("Copied to clipboard! Ready to share!");
    } catch (err) {
      console.error("Clipboard write failed:", err);

      // Final fallback - create temporary textarea
      try {
        const textarea = document.createElement("textarea");
        textarea.value = shareText;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        toast.success("Copied to clipboard! Ready to share!");
      } catch (finalErr) {
        console.error("All sharing methods failed:", finalErr);
        toast.error("Unable to share. Please try again.");
      }
    }
  };

  return (
    <div className="flex justify-center gap-4 mt-6 pb-12">
      <Button variant="outline" asChild size="lg" className="gap-2">
        <a
          href={SOCIAL_LINKS.twitter}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on X"
        >
          <FaXTwitter className="h-5 w-5" />
          Twitter/X
        </a>
      </Button>
      <Button
        onClick={copyToClipboard}
        variant="outline"
        size="lg"
        className="gap-2"
        aria-label="Copy solution to clipboard"
      >
        📤 Share
      </Button>
    </div>
  );
};

export default ShareOptions;
