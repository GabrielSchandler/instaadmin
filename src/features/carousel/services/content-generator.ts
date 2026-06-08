import { getAnthropicClient, MODELS } from "@/lib/anthropic";
import { selectTemplateForTopic } from "@/features/templates/registry";
import { logger } from "@/lib/logger";

export interface GeneratedSlide {
  position: number;
  slide_type: "cover" | "content" | "cta";
  headline: string;
  subheadline?: string;
  body?: string;
  cta_text?: string;
}

export interface GeneratedCarousel {
  title: string;
  caption: string;
  hashtags: string[];
  template_id: string;
  slides: GeneratedSlide[];
  ai_metadata: {
    model: string;
    prompt_tokens: number;
    completion_tokens: number;
    topic: string;
    tone: string;
  };
}

const SYSTEM_PROMPT = `Você é um especialista em criação de conteúdo para Instagram.
Crie carrosséis profissionais, envolventes e informativos em português do Brasil.
Responda SEMPRE com JSON válido, sem markdown ou texto adicional.`;

function buildUserPrompt(topic: string, tone: string, slideCount: number): string {
  return `Crie um carrossel completo para Instagram sobre: "${topic}"

Tom: ${tone}
Número de slides de conteúdo: ${slideCount - 2} (além da capa e CTA)

Retorne um JSON com este formato exato:
{
  "title": "Título interno do post",
  "caption": "Legenda completa para o Instagram (2-3 parágrafos, engajante)",
  "hashtags": ["hashtag1", "hashtag2", ...] (15-20 hashtags relevantes sem #),
  "slides": [
    {
      "position": 1,
      "slide_type": "cover",
      "headline": "Título impactante da capa (máx 8 palavras)",
      "subheadline": "Subtítulo complementar (máx 12 palavras)"
    },
    {
      "position": 2,
      "slide_type": "content",
      "headline": "Título do slide 2",
      "body": "Conteúdo do slide 2 (2-3 frases curtas, diretas)"
    },
    ...slides 3 a ${slideCount - 1} com mesmo formato de content...
    {
      "position": ${slideCount},
      "slide_type": "cta",
      "headline": "Call to action final (frase de impacto)",
      "cta_text": "Texto do botão CTA (3-5 palavras)"
    }
  ]
}`;
}

export async function generateCarouselContent(
  topic: string,
  tone: string = "professional",
  slideCount: number = 7
): Promise<GeneratedCarousel> {
  const client = getAnthropicClient();
  const startTime = Date.now();

  logger.info("Generating carousel content", { topic, tone, slideCount });

  const message = await client.messages.create({
    model: MODELS.default,
    max_tokens: 2000,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildUserPrompt(topic, tone, slideCount) }],
  });

  const content = message.content[0];
  if (content.type !== "text") throw new Error("Unexpected response type from Claude");

  let parsed: Omit<GeneratedCarousel, "template_id" | "ai_metadata">;
  try {
    parsed = JSON.parse(content.text);
  } catch {
    throw new Error("Failed to parse AI response as JSON");
  }

  const template_id = selectTemplateForTopic(topic);

  logger.info("Carousel generated", {
    duration: Date.now() - startTime,
    tokens: message.usage.input_tokens + message.usage.output_tokens,
  });

  return {
    ...parsed,
    template_id,
    ai_metadata: {
      model: MODELS.default,
      prompt_tokens: message.usage.input_tokens,
      completion_tokens: message.usage.output_tokens,
      topic,
      tone,
    },
  };
}
