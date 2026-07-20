// Open-core deployment switch.
// "self_hosted" (default): billing off (everyone is pro), backlink network off.
// "cloud": the commercial hosted instance — Stripe billing + backlink network on.
export type DeploymentMode = "cloud" | "self_hosted";

export const MODE: DeploymentMode =
  process.env.NEXT_PUBLIC_DEPLOYMENT_MODE === "cloud" ? "cloud" : "self_hosted";

export const IS_CLOUD = MODE === "cloud";

// Where the hosted cloud lives — used for attribution links and
// "this feature is cloud-only" pointers in the self-hosted UI.
export const CLOUD_URL =
  process.env.NEXT_PUBLIC_CLOUD_URL || "https://seedsy.example.com";
