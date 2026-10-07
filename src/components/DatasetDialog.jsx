import { useRef, useState } from "react";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Copy,
  FileJson,
  FileText,
  FolderOpen,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const PDF_PROMPT = `Extract all multiple-choice questions from the attached assignment PDF(s) into a JSON array matching this exact schema:

[
  {
    "question": "In which year was the Earth Summit held?",
    "options": [
      "1982",
      "1992",
      "2002",
      "2012"
    ],
    "correctAnswer": "1992"
  }
]

### Rules:
1. Extract every multiple-choice question from the assignment.
2. Each item must contain ONLY three keys: "question", "options", and "correctAnswer". Do NOT include any extra keys like "topic", "explanation", or "id".
3. Clean question numbering: remove prefixes like "1.", "Q1:", "Question 1 -" from the question text.
4. Clean option labels: remove prefixes like "a)", "b)", "A.", "B.", "(a)" from the option choices.
5. "correctAnswer" must contain the EXACT text of the correct option matching one of the options word-for-word.
6. Output ONLY the raw JSON array (valid, parseable JSON).`;

export default function DatasetDialog({
  open,
  onOpenChange,
  datasets,
  activeDatasetId,
  onSelectDataset,
  onUploadDataset,
  onDeleteDataset,
}) {
  const [activeTab, setActiveTab] = useState("quizzes");
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(PDF_PROMPT);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn("Failed to copy", err);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    setSuccessMsg(null);
    setIsUploading(true);

    try {
      const text = await file.text();
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch {
        setErrorMsg("Invalid JSON file. Please ensure syntax is correct.");
        setIsUploading(false);
        return;
      }

      if (!Array.isArray(parsed)) {
        setErrorMsg("JSON must be an array of questions: `[ { question, options, correctAnswer }, ... ]`");
        setIsUploading(false);
        return;
      }

      const res = onUploadDataset(file.name, parsed);
      if (!res.success) {
        setErrorMsg(res.errors.slice(0, 3).join(" · "));
      } else {
        setSuccessMsg(`Imported "${file.name}" with ${res.count} questions!`);
      }
    } catch (err) {
      setErrorMsg(err.message || "Failed to read file.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-5/6 flex flex-col">
        <DialogHeader className="gap-3 sm:gap-3.5">
          <div className="flex items-start gap-3 sm:gap-3.5">
            <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20 mt-0.5">
              <FolderOpen className="size-5" />
            </div>
            <div className="space-y-1 text-left min-w-0">
              <DialogTitle className="text-base font-semibold tracking-tight text-foreground">
                Quizzes & Assignment Importer
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed text-pretty">
                Switch between quizzes, upload custom assignment JSONs, or grab the LLM prompt.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-2 mb-2">
            <TabsTrigger value="quizzes" className="text-xs font-semibold gap-1.5">
              <FileJson className="size-3.5" />
              <span className="tabular-nums">Saved Quizzes ({datasets.length})</span>
            </TabsTrigger>
            <TabsTrigger value="prompt" className="text-xs font-semibold gap-1.5">
              <FileText className="size-3.5" />
              <span>PDF to JSON Prompt</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {activeTab === "quizzes" && (
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            <label
              htmlFor="dataset-file-input"
              tabIndex={0}
              role="button"
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              className="group cursor-pointer rounded-xl border border-dashed border-border hover:border-emerald-500/70 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-none bg-muted/20 hover:bg-muted/40 p-4 transition-all flex flex-col items-center justify-center text-center gap-1.5"
            >
              <input
                id="dataset-file-input"
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                className="sr-only"
                onChange={handleFileChange}
                disabled={isUploading}
                aria-label="Upload assignment JSON file"
              />
              <div
                className="size-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform"
                aria-hidden="true"
              >
                <UploadCloud className="size-4" />
              </div>
              <div className="text-xs sm:text-sm font-semibold text-foreground">
                {isUploading ? "Validating & importing..." : "Upload Assignment JSON"}
              </div>
              <p className="text-xs text-muted-foreground">
                Click or press Enter to select a JSON file containing assignment questions
              </p>
            </label>

            {errorMsg && (
              <div
                role="alert"
                aria-live="assertive"
                className="p-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2"
              >
                <AlertTriangle className="size-4 shrink-0" aria-hidden="true" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div
                role="status"
                aria-live="polite"
                className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2"
              >
                <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
                <span className="font-medium">{successMsg}</span>
              </div>
            )}

            <div className="space-y-1.5">
              {datasets.map((dataset) => {
                const isActive = dataset.id === activeDatasetId;

                return (
                  <Card
                    key={dataset.id}
                    className={cn(
                      "transition-all border-border/80",
                      isActive && "border-emerald-500/60 ring-1 ring-emerald-500/30 bg-emerald-500/5",
                    )}
                  >
                    <CardContent className="p-3 flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-foreground truncate">{dataset.name}</span>
                          {isActive && (
                            <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-xs font-bold py-0 px-1.5 h-5 gap-0.5">
                              <Check className="size-2.5" aria-hidden="true" /> Active
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5 tabular-nums">
                          {dataset.questionCount} questions {dataset.isDefault && "· Default"}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {!isActive && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onSelectDataset(dataset.id)}
                            aria-label={`Use quiz: ${dataset.name}`}
                            className="text-xs font-semibold h-7 px-2.5"
                          >
                            Use quiz
                          </Button>
                        )}

                        {!dataset.isDefault && (
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => onDeleteDataset(dataset.id)}
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            aria-label={`Delete quiz: ${dataset.name}`}
                          >
                            <Trash2 className="size-3.5" aria-hidden="true" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "prompt" && (
          <div className="flex flex-col gap-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <p className="text-xs text-muted-foreground leading-normal">
                Attach assignment PDFs to ChatGPT, Claude, or Gemini with this prompt:
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopyPrompt}
                className="gap-1.5 text-xs font-semibold h-7 px-2.5 shrink-0 w-full sm:w-auto"
              >
                {copied ? (
                  <>
                    <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="size-3.5" />
                    <span>Copy prompt</span>
                  </>
                )}
              </Button>
            </div>

            <div className="rounded-xl border border-border/80 bg-muted/30 p-3 font-mono text-xs leading-relaxed text-foreground/90 whitespace-pre-wrap max-h-64 overflow-y-auto">
              {PDF_PROMPT}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
