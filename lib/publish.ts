import { createHmac } from "crypto";
import { supabaseAdmin } from "./supabase/admin";
import { getPlanForUser } from "./billing";
import { shouldStamp, stampHtml, stampMarkdown } from "./stamp";
import { decryptJSON } from "./crypto";

// Publishes a drafted article through the project's active integration.
// Supported kinds and their config shapes:
//   wordpress: { site_url, username, app_password }        (Application Passwords)
//   webflow:   { api_token, collection_id, title_field?, body_field?, slug_field? }
//   shopify:   { shop, access_token, blog_id }             (Admin API token)
//   ghost:     { api_url, admin_api_key }                  (Admin API key "id:secret")
//   webhook:   { url, secret? }                            (POSTs full article JSON)

// Ghost Admin API auth: short-lived HS256 JWT signed with the hex secret.
function ghostToken(adminApiKey: string): string {
  const [id, secret] = adminApiKey.split(":");
  if (!id || !secret) throw new Error("Ghost Admin API key must look like id:secret");
  const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const iat = Math.floor(Date.now() / 1000);
  const unsigned = `${b64({ alg: "HS256", typ: "JWT", kid: id })}.${b64({ iat, exp: iat + 300, aud: "/admin/" })}`;
  const sig = createHmac("sha256", Buffer.from(secret, "hex")).update(unsigned).digest("base64url");
  return `${unsigned}.${sig}`;
}
export async function publishArticle(articleId: string) {
  const db = supabaseAdmin();
  const { data: article } = await db.from("articles").select("*").eq("id", articleId).single();
  if (!article) throw new Error("Article not found");
  if (!article.content_html) throw new Error("Article has no content yet — generate it first.");

  const { data: integration } = await db
    .from("integrations")
    .select("*")
    .eq("project_id", article.project_id)
    .eq("active", true)
    .limit(1)
    .maybeSingle();

  // No CMS connected? Publish to the Seedsy-hosted blog instead.
  if (!integration) {
    const hostedUrl = `${process.env.NEXT_PUBLIC_APP_URL}/b/${article.project_id}/${article.slug}`;
    await db
      .from("articles")
      .update({ status: "published", published_url: hostedUrl, published_at: new Date().toISOString() })
      .eq("id", articleId);
    return { url: hostedUrl };
  }

  // Attribution: computed at publish time, never stored in the DB — upgrading
  // to pro removes it from all future publishes and hosted pages at once.
  const { data: owner } = await db
    .from("projects").select("user_id").eq("id", article.project_id).single();
  const plan = owner ? await getPlanForUser(owner.user_id) : "free";
  const stamped = shouldStamp(plan);

  // Embed JSON-LD schema at the top of the body.
  const html =
    `<script type="application/ld+json">${JSON.stringify(article.schema_markup)}</script>\n` +
    article.content_html +
    (stamped ? `\n${stampHtml()}` : "");

  let url: string;
  const c = decryptJSON<any>(integration.config);

  switch (integration.kind) {
    case "wordpress": {
      const auth = Buffer.from(`${c.username}:${c.app_password}`).toString("base64");
      const res = await fetch(`${c.site_url.replace(/\/$/, "")}/wp-json/wp/v2/posts`, {
        method: "POST",
        headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          title: article.title,
          slug: article.slug,
          content: html,
          excerpt: article.meta_description,
          status: "publish",
        }),
      });
      const data = await ok(res, "WordPress");
      url = data.link;
      break;
    }
    case "webflow": {
      const res = await fetch(
        `https://api.webflow.com/v2/collections/${c.collection_id}/items/live`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${c.api_token}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            isDraft: false,
            isArchived: false,
            fieldData: {
              [c.title_field || "name"]: article.title,
              [c.slug_field || "slug"]: article.slug,
              [c.body_field || "post-body"]: html,
            },
          }),
        }
      );
      const data = await ok(res, "Webflow");
      url = data?.fieldData?.slug ? `slug:${data.fieldData.slug}` : "published-to-webflow";
      break;
    }
    case "shopify": {
      const res = await fetch(
        `https://${c.shop}.myshopify.com/admin/api/2024-10/blogs/${c.blog_id}/articles.json`,
        {
          method: "POST",
          headers: { "X-Shopify-Access-Token": c.access_token, "Content-Type": "application/json" },
          body: JSON.stringify({
            article: {
              title: article.title,
              body_html: html,
              summary_html: article.meta_description,
              published: true,
            },
          }),
        }
      );
      const data = await ok(res, "Shopify");
      url = `https://${c.shop}.myshopify.com/blogs/${c.blog_id}/${data.article?.handle || article.slug}`;
      break;
    }
    case "ghost": {
      const base = String(c.api_url).replace(/\/$/, "");
      const res = await fetch(`${base}/ghost/api/admin/posts/?source=html`, {
        method: "POST",
        headers: {
          Authorization: `Ghost ${ghostToken(c.admin_api_key)}`,
          "Content-Type": "application/json",
          "Accept-Version": "v5.0",
        },
        body: JSON.stringify({
          posts: [{
            title: article.title,
            slug: article.slug,
            html,
            custom_excerpt: article.meta_description?.slice(0, 300),
            status: "published",
          }],
        }),
      });
      const data = await ok(res, "Ghost");
      url = data.posts?.[0]?.url || `${base}/${article.slug}/`;
      break;
    }
    case "webhook": {
      const res = await fetch(c.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(c.secret ? { "X-Seedsy-Secret": c.secret } : {}),
        },
        body: JSON.stringify({
          title: article.title,
          slug: article.slug,
          html,
          markdown: article.content_md + (stamped ? stampMarkdown() : ""),
          meta_description: article.meta_description,
          schema: article.schema_markup,
        }),
      });
      await ok(res, "Webhook");
      url = c.url;
      break;
    }
    default:
      throw new Error(`Unknown integration kind: ${integration.kind}`);
  }

  await db
    .from("articles")
    .update({ status: "published", published_url: url, published_at: new Date().toISOString() })
    .eq("id", articleId);

  return { url };
}

async function ok(res: Response, label: string): Promise<any> {
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${label} publish failed (${res.status}): ${body.slice(0, 300)}`);
  }
  return res.json().catch(() => ({}));
}
