import { IS_CLOUD, CLOUD_URL } from "./mode";
import type { Plan } from "./billing";

// "Published with Seedsy" attribution.
// Cloud: stamped on the free plan, removed on pro (the upsell).
// Self-hosted: on by default; operators may set SEEDSY_ATTRIBUTION=false.
// We don't pretend to enforce it — leaving it on supports the project.
export function shouldStamp(plan: Plan): boolean {
  if (IS_CLOUD) return plan === "free";
  return process.env.SEEDSY_ATTRIBUTION !== "false";
}

const STAMP_URL = `${CLOUD_URL}?utm_source=stamp&utm_medium=article`;

export function stampHtml(): string {
  return `<p style="font-size:12px;opacity:.65;margin-top:32px">Published with <a href="${STAMP_URL}">Seedsy</a>, the open-source SEO &amp; GEO autopilot.</p>`;
}

export function stampMarkdown(): string {
  return `\n\n---\n\nPublished with [Seedsy](${STAMP_URL}), the open-source SEO & GEO autopilot.`;
}
