import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function App() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:py-16">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Website generator
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Describe a contractor business and generate an SEO-optimised,
          multi-page website document.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Business context</CardTitle>
          <CardDescription>
            The form lands in the next phase. This card exists to prove the
            theme tokens render.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="preview">Business name</Label>
            <Input id="preview" placeholder="BuildCo" />
          </div>
          <div className="flex items-center gap-2">
            <Button>Generate</Button>
            <Badge variant="secondary">idle</Badge>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
