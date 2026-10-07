import { Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const SHORTCUTS = [
  { label: "Select option 1 through 4", keys: ["1", "2", "3", "4"] },
  { label: "Next question / Advance", keys: ["→"], alt: "D" },
  { label: "Previous question", keys: ["←"], alt: "A" },
  { label: "Restart quiz & reshuffle", keys: ["R"] },
];

export default function ShortcutsDialog({ open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="gap-3 sm:gap-3.5">
          <div className="flex items-start gap-3 sm:gap-3.5">
            <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20 mt-0.5" aria-hidden="true">
              <Keyboard className="size-5" />
            </div>
            <div className="space-y-1 text-left min-w-0">
              <DialogTitle className="text-base font-semibold text-foreground tracking-tight">
                Keyboard Shortcuts
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed text-pretty">
                Speed through practice sessions with your keyboard.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid gap-2 py-1 text-sm">
          {SHORTCUTS.map((item) => (
            <div key={item.label} className="flex items-center justify-between p-2 sm:p-2.5 rounded-xl bg-muted/40 border border-border/50">
              <span className="text-muted-foreground text-xs sm:text-sm font-medium">{item.label}</span>
              <div className="flex items-center gap-1 shrink-0">
                {item.keys.map((k) => (
                  <kbd
                    key={k}
                    aria-label={k === "→" ? "Right Arrow" : k === "←" ? "Left Arrow" : `Key ${k}`}
                    className="px-1.5 py-0.5 text-xs font-mono font-medium rounded-md bg-card border border-border shadow-xs"
                  >
                    {k}
                  </kbd>
                ))}
                {item.alt && (
                  <>
                    <span className="text-muted-foreground text-xs self-center px-0.5" aria-hidden="true">or</span>
                    <kbd
                      aria-label={`Key ${item.alt}`}
                      className="px-1.5 py-0.5 text-xs font-mono font-medium rounded-md bg-card border border-border shadow-xs"
                    >
                      {item.alt}
                    </kbd>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
