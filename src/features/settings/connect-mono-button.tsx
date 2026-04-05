"use client";

import { useState, useTransition } from "react";
import MonoConnect from "@mono.co/connect.js";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function ConnectMonoButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [widgetOpen, setWidgetOpen] = useState(false);
  const publicKey = process.env.NEXT_PUBLIC_MONO_PUBLIC_KEY;

  async function saveConnection(code: string) {
    const response = await fetch("/api/mono/exchange", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ code }),
    });

    const payload = (await response.json().catch(() => null)) as
      | { error?: string }
      | null;

    if (!response.ok) {
      throw new Error(payload?.error ?? "Unable to link Mono account.");
    }
  }

  function openWidget() {
    if (!publicKey) {
      toast.error("Add NEXT_PUBLIC_MONO_PUBLIC_KEY before connecting Mono.");
      return;
    }

    const monoConnect = new MonoConnect({
      key: publicKey,
      onClose: () => setWidgetOpen(false),
      onLoad: () => setWidgetOpen(true),
      onSuccess: ({ code }) => {
        setWidgetOpen(false);
        startTransition(async () => {
          try {
            await saveConnection(code);
            toast.success("Mono account connected.");
            router.refresh();
          } catch (error) {
            toast.error(
              error instanceof Error
                ? error.message
                : "Unable to link Mono account.",
            );
          }
        });
      },
    });

    monoConnect.setup();
    monoConnect.open();
  }

  return (
    <Button onClick={openWidget} disabled={pending || widgetOpen}>
      {pending ? "Linking..." : widgetOpen ? "Mono open..." : "Connect with Mono"}
    </Button>
  );
}
