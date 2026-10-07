import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function InvalidData({ errors }) {
  return (
    <main className="app flex items-center justify-center p-4" role="alert" aria-live="assertive">
      <Card className="max-w-md w-full border-destructive/40 shadow-md">
        <CardHeader>
          <div className="size-10 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center mb-2" aria-hidden="true">
            <AlertTriangle className="size-5" />
          </div>
          <CardTitle className="text-lg font-bold text-destructive">Question data needs attention</CardTitle>
          <CardDescription>
            Please resolve these formatting issues in <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">src/assets/data.json</code> before starting a quiz.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-1.5 text-sm text-muted-foreground">
            {errors.map((error) => (
              <li key={error} className="text-foreground/90">{error}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </main>
  );
}
