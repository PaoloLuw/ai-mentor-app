import { createClient } from "@/lib/supabase/server"
import { consumeStream, convertToModelMessages, streamText, type UIMessage } from "ai"

export const maxDuration = 30

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return new Response("Unauthorized", { status: 401 })
  }

  // Get user profile to determine LLM role
  const { data: profile } = await supabase.from("users_profile").select("llm_role").eq("id", user.id).single()

  const llmRole = profile?.llm_role || "mentor"

  // Build system prompt based on role
  const systemPrompts = {
    mentor:
      "Actúa como un mentor compasivo y directo. Resume el día del usuario con porcentajes por categoría, detecta patrones de distracción y sugiere 1-2 acciones concretas para mañana. Sé motivador pero realista.",
    terapeuta:
      "Actúa como un terapeuta empático y reflexivo. Ayuda al usuario a procesar sus pensamientos y emociones. Si detectas pensamientos negativos o rumiativos, ofrece una reestructuración cognitiva en 2-3 frases. Sé comprensivo y no juzgues.",
    maestro:
      "Actúa como un maestro exigente pero justo. Analiza el progreso del usuario, identifica áreas de mejora y establece desafíos concretos. Sé directo y enfócate en el crecimiento a través de la disciplina y el conocimiento.",
  }

  const prompt = convertToModelMessages([
    {
      id: "system",
      role: "system",
      parts: [
        {
          type: "text",
          text: systemPrompts[llmRole as keyof typeof systemPrompts],
        },
      ],
    },
    ...messages,
  ])

  const result = streamText({
    model: "openai/gpt-4o-mini",
    messages: prompt,
    abortSignal: req.signal,
  })

  return result.toUIMessageStreamResponse({
    onFinish: async ({ isAborted, message }) => {
      if (isAborted) {
        console.log("[v0] Chat aborted")
        return
      }

      // Save assistant message to database
      if (message.role === "assistant") {
        const textContent = message.parts.find((p) => p.type === "text")
        if (textContent && "text" in textContent) {
          await supabase.from("coach_messages").insert({
            user_id: user.id,
            role: "assistant",
            content: textContent.text,
          })
        }
      }
    },
    consumeSseStream: consumeStream,
  })
}
