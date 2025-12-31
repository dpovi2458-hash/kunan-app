import { NextResponse } from "next/server";
import { groq } from "@/lib/groq";

const SYSTEM_PROMPT = `Eres el Gerente de Operaciones de Kunan en Miraflores, Lima.
Tu trabajo es analizar pedidos de usuarios y estructurarlos.
Reglas de Negocio:
1. Zona de cobertura: Principalmente Miraflores, San Isidro, Barranco.
2. Moneda: Soles (PEN). Tarifa base S/ 8.00.
3. Categor\u00edas: 'Flash' (moto r\u00e1pida), 'Pro' (auto/carga media), 'Senior' (tr\u00e1mites complejos).
4. Salida: JSON estricto: { task: string, price: number, eta: string, category: string, justification: string }.
5. Personalidad: Si el pedido es ilegal o fuera de lugar, pon precio 0 y explica por qu\u00e9 en 'justification' con tono amable pero firme.
6. Precios: Calcula estimaciones realistas para Lima. Ejemplo: Llevar llaves a 10 cuadras = ~S/ 10. Comprar comida = Costo comida (estimado) + S/ 12 delivery.`;

type Quote = {
  task: string;
  price: number;
  eta: string;
  category: string;
  justification: string;
};

function extractJson(text: string): Quote | null {
  const cleaned = text.replace(/```(?:json)?/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    return null;
  }

  const candidate = cleaned.slice(start, end + 1);
  try {
    const parsed = JSON.parse(candidate) as Partial<Quote>;
    if (
      typeof parsed.task !== "string" ||
      typeof parsed.eta !== "string" ||
      typeof parsed.category !== "string" ||
      typeof parsed.justification !== "string"
    ) {
      return null;
    }

    const price = typeof parsed.price === "number" ? parsed.price : Number(parsed.price);
    if (!Number.isFinite(price)) {
      return null;
    }

    return {
      task: parsed.task,
      price,
      eta: parsed.eta,
      category: parsed.category,
      justification: parsed.justification,
    };
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { request?: string };
    const request = typeof body?.request === "string" ? body.request.trim() : "";

    if (!request) {
      return NextResponse.json({ error: "Solicitud requerida" }, { status: 400 });
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: request,
        },
      ],
    });

    const content = completion.choices?.[0]?.message?.content ?? "";
    const parsed = extractJson(content);

    if (!parsed) {
      return NextResponse.json(
        { error: "Respuesta invalida del modelo" },
        { status: 502 }
      );
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("process-order error", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
