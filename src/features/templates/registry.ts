import { premiumBlackTemplate } from "./designs/premium-black";
import { corporateBlueTemplate } from "./designs/corporate-blue";
import { minimalCleanTemplate } from "./designs/minimal-clean";
import { modernGradientTemplate } from "./designs/modern-gradient";
import { darkPremiumTemplate } from "./designs/dark-premium";
import type { TemplateConfig } from "./types";

const templates: TemplateConfig[] = [
  premiumBlackTemplate,
  corporateBlueTemplate,
  minimalCleanTemplate,
  modernGradientTemplate,
  darkPremiumTemplate,
];

export const templateRegistry = new Map<string, TemplateConfig>(
  templates.map((t) => [t.id, t])
);

export function getTemplate(id: string): TemplateConfig {
  const tmpl = templateRegistry.get(id);
  if (!tmpl) throw new Error(`Template "${id}" not found`);
  return tmpl;
}

export function getAllTemplates(): TemplateConfig[] {
  return templates;
}

export function selectTemplateForTopic(topic: string): string {
  const lower = topic.toLowerCase();
  if (lower.match(/finan|invest|banco|conta|crédit|dívid/)) return "corporate-blue";
  if (lower.match(/design|minimal|art|foto|lifestyle|moda/)) return "minimal-clean";
  if (lower.match(/market|tech|startup|product|app|digital/)) return "modern-gradient";
  if (lower.match(/empreend|negóci|business|lucro|vendas|receita/)) return "dark-premium";
  return "premium-black";
}
