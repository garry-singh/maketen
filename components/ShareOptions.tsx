import React from "react";
import { Button } from "@/components/ui/button";
import { FaXTwitter } from "react-icons/fa6";
import { toast } from "sonner";
import { DEBUG_MODE, SOCIAL_LINKS } from "@/lib/constants";

interface ShareOptionsProps {
  userInput: string;
  solveTime: number;
  shareText: string;
}

/**
 * Component to handle sharing solutions
 */
const ShareOptions: React.FC<ShareOptionsProps> = ({
  userInput,
  solveTime,
  shareText,
}) => {
  const copyToClipboard = async () => {
    if (!userInput || !solveTime) {
      if (DEBUG_MODE)
        console.log("Cannot share - missing solution or time", {
          userInput,
          solveTime,
        });
      toast.error("Solution details not available");
      return;
    }

    // Try Web Share API first
    if (navigator.share) {
      try {
        await navigator.share({
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
        if (DEBUG_MODE) console.warn("Web Share API failed:", err);
      }
    }

    // Fallback to clipboard
    try {
      await navigator.clipboard.writeText(shareText);
      toast.success("Copied to clipboard! Ready to share!");
    } catch (err) {
      if (DEBUG_MODE) console.error("Clipboard write failed:", err);

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
        if (DEBUG_MODE) console.error("All sharing methods failed:", finalErr);
        toast.error("Unable to share. Please try again.");
      }
    }
  };

  // If we don't have a solution or time, show disabled buttons
  const isShareDisabled = !userInput || !solveTime;

  // Prefill the post rather than sending the player to our profile page
  const tweetUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(
    shareText
  )}&via=${SOCIAL_LINKS.twitterHandle}`;

  if (isShareDisabled && DEBUG_MODE) {
    console.log("Share buttons disabled - missing data", {
      userInput,
      solveTime,
    });
  }

  return (
    <div className="flex justify-center gap-4 mt-6 pb-12">
      <Button
        variant="outline"
        asChild
        size="lg"
        className="gap-2"
        disabled={isShareDisabled}
      >
        <a
          href={isShareDisabled ? undefined : tweetUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on X"
          onClick={(e) => {
            if (isShareDisabled) {
              e.preventDefault();
              toast.error("Solution details not available");
            }
          }}
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
        disabled={isShareDisabled}
      >
        📤 Share
      </Button>
    </div>
  );
};

export default ShareOptions;
