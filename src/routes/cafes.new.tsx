import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader, Hint, PermissionDenied } from "@/components/head/primitives";
import { useSession } from "@/components/head/session";

export const Route = createFileRoute("/cafes/new")({
  head: () => ({
    meta: [
      { title: "Onboard a cafe — AiravotoHead" },
      {
        name: "description",
        content: "Create a new isolated cafe tenant, reserve its public slug and issue the first Airavoto POS license.",
      },
      { property: "og:title", content: "Onboard a cafe — AiravotoHead" },
      { property: "og:description", content: "Create a cafe tenant, reserve a slug and issue its first license." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NewCafe,
});

function NewCafe() {
  const session = useSession();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [owner, setOwner] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [plan, setPlan] = useState("Growth");

  if (!session.can("cafe.create")) return <PermissionDenied what="onboard new cafes" />;

  const slugValue = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const ready = name.trim().length > 2 && slugValue.length > 2 && owner.trim() && email.includes("@");

  return (
    <>
      <PageHeader
        title="Onboard a cafe"
        description="Creates an isolated tenant. No POS data is copied between cafes, and the public page stays hidden until the owner completes their profile."
      />

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Cafe details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">Cafe name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Brew & Byte Gaming Cafe" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="slug">Public slug</Label>
              <Input id="slug" value={slugValue} onChange={(e) => setSlug(e.target.value)} placeholder="brew-and-byte" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="owner">Owner name</Label>
              <Input id="owner" value={owner} onChange={(e) => setOwner(e.target.value)} placeholder="Full name" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Owner email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="owner@cafe.in" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="city">City</Label>
              <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Bengaluru" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="plan">Plan</Label>
              <Select value={plan} onValueChange={setPlan}>
                <SelectTrigger id="plan">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Starter", "Growth", "Pro", "Enterprise"].map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Hint text="The slug is permanent once the public page goes live: changing it later breaks existing booking links and QR codes." />

          <div className="flex gap-2">
            <Button
              disabled={!ready}
              onClick={() => {
                toast.success(`Cafe ${name} created`, {
                  description: "Trial license issued. An onboarding invite was emailed to the owner.",
                });
                navigate({ to: "/cafes" });
              }}
            >
              Create cafe and issue trial license
            </Button>
            <Button variant="ghost" onClick={() => navigate({ to: "/cafes" })}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
