"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Clock, Copy, CreditCard, MapPin } from "lucide-react";
import { ID } from "appwrite";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/input";
import { databases } from "@/lib/appwrite";

type Stage = "idle" | "loading" | "quote" | "confirm";

type Quote = {
  task: string;
  price: number;
  eta: string;
  category: string;
  justification: string;
};

const examples = [
  "Llevar llaves a 10 cuadras en Miraflores",
  "Comprar almuerzo y llevarlo a oficina en San Isidro",
  "Tr\u00e1mite simple en municipio de Barranco",
];
const paymentNumber = "944507095";
const paymentNumberLabel = "944 507 095";

const fadeVariant = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

const fadeTransition = { duration: 0.35 };

function formatPrice(value: number) {
  return value.toFixed(2);
}

function categoryTone(category: string) {
  const normalized = category.toLowerCase();
  if (normalized.includes("flash")) {
    return "bg-[#0057FF]/10 text-[#0057FF]";
  }
  if (normalized.includes("senior")) {
    return "bg-amber-100 text-amber-700";
  }
  if (normalized.includes("pro")) {
    return "bg-slate-100 text-slate-600";
  }
  return "bg-slate-100 text-slate-600";
}

export default function Home() {
  const [requestText, setRequestText] = useState("");
  const [stage, setStage] = useState<Stage>("idle");
  const [quote, setQuote] = useState<Quote | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  const canSubmit = requestText.trim().length > 6 && stage !== "loading";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!requestText.trim()) {
      setError("Describe tu pedido para cotizar.");
      return;
    }

    setStage("loading");
    setError(null);
    setQuote(null);

    try {
      const response = await fetch("/api/process-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ request: requestText.trim() }),
      });

      const data = (await response.json()) as Quote & { error?: string };

      if (!response.ok || !data?.task) {
        throw new Error(data?.error ?? "No pudimos procesar el pedido.");
      }

      setQuote(data);
      setStage("quote");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Algo sali\u00f3 mal.");
      setStage("idle");
    }
  };

  const handleOpenPayment = () => {
    if (!quote) {
      return;
    }

    setError(null);
    setCopied(false);
    setShowPayment(true);
  };

  const handleConfirmPayment = async () => {
    if (!quote || isSaving) {
      return;
    }

    const order = quote;
    const payload = {
      task: order.task,
      price: parseFloat(String(order.price)),
      eta: order.eta,
      category: order.category,
      justification: order.justification,
      status: "pending",
    };

    setIsSaving(true);
    setError(null);

    try {
      console.log("Payload enviado:", payload);
      await databases.createDocument("kunan_db", "orders", ID.unique(), payload);

      setStage("confirm");
      setShowPayment(false);
      setCopied(false);
    } catch (err) {
      setError("No pudimos guardar el pedido. Intenta otra vez.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyNumber = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(paymentNumber);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = paymentNumber;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
    } catch {}

    setCopied(true);
    if (copyTimeoutRef.current) {
      clearTimeout(copyTimeoutRef.current);
    }
    copyTimeoutRef.current = setTimeout(() => setCopied(false), 1600);
  };

  const activeQuote = stage === "quote" || stage === "confirm" ? quote : null;

  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,87,255,0.12),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(0,194,255,0.12),transparent_55%)]" />
      <div className="pointer-events-none absolute -top-24 right-[-120px] h-72 w-72 rounded-full bg-[#0057FF]/10 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-[-140px] left-[-120px] h-80 w-80 rounded-full bg-[#00C2FF]/10 blur-[110px]" />

      <main
        className={`relative mx-auto flex min-h-screen max-w-xl flex-col gap-8 px-6 pb-16 pt-10 ${
          showPayment ? "pointer-events-none blur-sm" : ""
        }`}
      >
        <header className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0057FF] text-lg font-semibold text-white">
              K
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-slate-400">KUNAN</p>
              <h1 className="text-2xl font-[var(--font-heading)] text-slate-900">
                {"Log\u00edstica on-demand"}
              </h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1">
              <MapPin className="h-3.5 w-3.5 text-[#0057FF]" />
              Miraflores - San Isidro - Barranco
            </span>
            <span className="rounded-full bg-[#0057FF]/10 px-3 py-1 text-[#0057FF]">
              Base S/ 8.00
            </span>
          </div>
          <p className="text-sm text-slate-500">
            {"Pedidos express, compras y tr\u00e1mites en minutos. Kunan coordina el resto."}
          </p>
        </header>

        <AnimatePresence mode="wait">
          {stage === "idle" && (
            <motion.form
              key="idle"
              onSubmit={handleSubmit}
              className="space-y-4"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={fadeVariant}
              transition={fadeTransition}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-[var(--font-heading)]">
                    {"\u00bfQu\u00e9 necesitas hoy?"}
                  </CardTitle>
                  <p className="text-sm text-slate-500">
                    {"Cu\u00e9ntanos el pedido y lo cotizamos con IA en segundos."}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    value={requestText}
                    onChange={(event) => setRequestText(event.target.value)}
                    placeholder={"Entrega urgente, compra, tr\u00e1mite o recojo..."}
                    maxLength={280}
                  />
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Respuesta en segundos</span>
                    <span>{requestText.trim().length}/280</span>
                  </div>
                  <Button type="submit" size="lg" disabled={!canSubmit}>
                    Cotizar ahora
                  </Button>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {examples.map((example) => (
                      <button
                        key={example}
                        type="button"
                        onClick={() => setRequestText(example)}
                        className="rounded-full border border-slate-200 px-3 py-1 text-slate-500 transition hover:border-[#0057FF]/40 hover:text-[#0057FF]"
                      >
                        {example}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.form>
          )}

          {stage === "loading" && (
            <motion.div
              key="loading"
              className="rounded-3xl border border-slate-100 bg-white/90 p-6 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.45)]"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={fadeVariant}
              transition={fadeTransition}
            >
              <div className="flex items-center gap-4">
                <motion.div
                  className="h-11 w-11 rounded-full border-2 border-slate-200 border-t-[#0057FF]"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                />
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {"Calculando tu cotizaci\u00f3n"}
                  </p>
                  <p className="text-xs text-slate-500">
                    Ajustando rutas y tiempos en Lima.
                  </p>
                </div>
              </div>
              <div className="mt-6 space-y-3">
                <div className="h-3 w-2/3 rounded-full bg-slate-100" />
                <div className="h-3 w-1/2 rounded-full bg-slate-100" />
                <div className="h-3 w-3/4 rounded-full bg-slate-100" />
              </div>
            </motion.div>
          )}

          {activeQuote && (
            <motion.div
              key="quote"
              className="space-y-4"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={fadeVariant}
              transition={fadeTransition}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-[0.3em] text-slate-400">
                      {"Cotizaci\u00f3n"}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${categoryTone(
                        activeQuote.category
                      )}`}
                    >
                      {activeQuote.category}
                    </span>
                  </div>
                  <CardTitle className="text-xl font-[var(--font-heading)] leading-snug">
                    {activeQuote.task}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Total</p>
                      <p className="text-4xl font-[var(--font-heading)] text-[#0057FF]">
                        S/ {formatPrice(activeQuote.price)}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-500">
                      Estimado IA
                    </div>
                  </div>
                  <div className="grid gap-3 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-[#0057FF]" />
                      <span>{activeQuote.eta}</span>
                    </div>
                    <p>{activeQuote.justification}</p>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button
                      type="button"
                      size="lg"
                      onClick={handleOpenPayment}
                      disabled={isSaving || stage === "confirm"}
                    >
                      {isSaving
                        ? "Guardando..."
                        : stage === "confirm"
                        ? "Pago confirmado"
                        : "Confirmar y Yapear"}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="lg"
                      disabled={isSaving}
                      onClick={() => setStage("idle")}
                    >
                      Editar pedido
                    </Button>
                  </div>
                  {stage === "confirm" && (
                    <div className="rounded-2xl border border-[#0057FF]/20 bg-[#0057FF]/5 px-4 py-3 text-xs text-[#0057FF]">
                      Pago confirmado. Estamos asignando un aliado Kunan.
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <motion.div
            className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.div>
        )}
      </main>

      <AnimatePresence>
        {showPayment && activeQuote && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-[0_30px_80px_-50px_rgba(15,23,42,0.9)]"
              initial={{ y: 20, scale: 0.96 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 20, scale: 0.96 }}
              transition={fadeTransition}
              role="dialog"
              aria-modal="true"
            >
              <div className="space-y-5 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#0057FF]/10 text-[#0057FF]">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-[var(--font-heading)] text-slate-900">
                    Pago con Yape
                  </h3>
                  <p className="text-sm text-slate-500">
                    Total a pagar:{" "}
                    <span className="font-semibold text-[#0057FF]">
                      S/ {formatPrice(activeQuote.price)}
                    </span>
                  </p>
                </div>
                <img
                  src="/yape-qr.png"
                  alt="QR de pago Yape"
                  className="mx-auto w-[250px] rounded-xl shadow-sm"
                />
                <p className="text-sm text-slate-500">
                  Escanea o yapea directamente al:
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleCopyNumber}
                    className="text-2xl font-bold text-slate-900 tracking-wide"
                    aria-label="Copiar numero"
                  >
                    {paymentNumberLabel}
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyNumber}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-[#0057FF]/40 hover:text-[#0057FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0057FF]/40"
                    aria-label={copied ? "Numero copiado" : "Copiar numero"}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    <span className={copied ? "text-emerald-600" : undefined}>
                      {copied ? "\u00a1Copiado!" : "Copiar"}
                    </span>
                  </button>
                </div>
                <Button size="lg" onClick={handleConfirmPayment} disabled={isSaving}>
                  {isSaving ? "Confirmando..." : "Confirmar Pago"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
