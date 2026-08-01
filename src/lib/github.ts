/**
 * GitHub Issues -> blog posts.
 *
 * We ask for the `full+json` media type so a single request returns `body`,
 * `body_text` (for excerpts / reading time) and `body_html` (already rendered
 * by GitHub, so we don't ship a markdown pipeline to the Worker).
 *
 * Responses go through the Workers Cache API. Unauthenticated GitHub requests
 * are limited to 60/hour *per IP*, and Workers egress IPs are shared — so a
 * token is effectively required in production.
 */

const GITHUB_API = 'https://api.github.com'
const USER_AGENT = 'blog.emmmm.dev (+https://github.com/chen86860/blog)'

/** How long a GitHub response stays fresh in the edge cache. */
const CACHE_TTL_SECONDS = 300

export interface SiteConfig {
  owner: string
  repo: string
  url: string
  title: string
  description: string
  /** Only include issues carrying this label. Empty = every issue by the owner. */
  label?: string
}

export interface Post {
  number: number
  title: string
  /** GitHub-rendered HTML of the issue body. */
  bodyHtml: string
  /** Plain-text excerpt for cards and meta descriptions. */
  excerpt: string
  tags: string[]
  createdAt: string
  updatedAt: string
  comments: number
  reactions: number
  githubUrl: string
  /** First image in the body, used as the card cover when present. */
  cover: string | null
  readingMinutes: number
}

interface GitHubLabel {
  name: string
}

interface GitHubIssue {
  number: number
  title: string
  body: string | null
  body_text: string | null
  body_html: string | null
  labels: Array<GitHubLabel | string>
  created_at: string
  updated_at: string
  comments: number
  html_url: string
  pull_request?: unknown
  draft?: boolean
  reactions?: { total_count?: number }
}

export function readSiteConfig(env: Env): SiteConfig {
  return {
    owner: env.GITHUB_OWNER,
    repo: env.GITHUB_REPO,
    url: env.SITE_URL,
    title: env.SITE_TITLE,
    description: env.SITE_DESCRIPTION,
    label: env.GITHUB_LABEL || undefined,
  }
}

async function fetchGitHub(path: string, env: Env): Promise<Response> {
  const url = `${GITHUB_API}${path}`
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.full+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': USER_AGENT,
  }
  if (env.GITHUB_TOKEN) headers.Authorization = `Bearer ${env.GITHUB_TOKEN}`

  // `caches` is unavailable outside the Workers runtime (e.g. `vite dev` on
  // Node), so fall back to a plain fetch there. The cast is needed because the
  // DOM lib's CacheStorage has no `default` — that one is Workers-specific.
  const cacheStorage = globalThis.caches as unknown as
    | { default: Cache }
    | undefined
  const cache = cacheStorage?.default
  const cacheKey = new Request(url, { headers: { Accept: headers.Accept } })

  if (cache) {
    const hit = await cache.match(cacheKey)
    if (hit) return hit
  }

  const res = await fetch(url, { headers })
  if (!res.ok) {
    throw new Error(
      `GitHub API ${res.status} ${res.statusText} for ${path}` +
        (res.status === 403 ? ' (rate limited — is GITHUB_TOKEN set?)' : ''),
    )
  }

  const cacheable = new Response(res.body, res)
  cacheable.headers.set('Cache-Control', `public, max-age=${CACHE_TTL_SECONDS}`)
  if (cache) await cache.put(cacheKey, cacheable.clone())
  return cacheable
}

const labelName = (label: GitHubLabel | string) =>
  typeof label === 'string' ? label : label.name

function firstImage(bodyHtml: string): string | null {
  // The leading \s and the lazy quantifier matter: GitHub also emits
  // `data-canonical-src` on proxied images, and a greedy `[^>]+src="` would
  // backtrack onto *that* attribute. The canonical URL often blocks
  // hotlinking, while the camo `src` is served by GitHub and always loads.
  const match = bodyHtml.match(/<img\b[^>]*?\ssrc="([^"]+)"/i)
  return match ? match[1] : null
}

function excerptOf(text: string, max = 160): string {
  const flat = text
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  if (flat.length <= max) return flat
  return `${flat.slice(0, max).trimEnd()}…`
}

/**
 * CJK has no spaces, so word counting undercounts badly. Count CJK codepoints
 * at ~350/min and latin words at ~220/min, then combine.
 */
function readingMinutes(text: string): number {
  const cjk = (text.match(/[㐀-鿿぀-ヿ가-힯]/g) ?? []).length
  const latin = text.replace(/[㐀-鿿぀-ヿ가-힯]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length
  return Math.max(1, Math.round(cjk / 350 + latin / 220))
}

/**
 * Issue bodies usually repeat the title as a top-level `# heading`, so the
 * rendered page ends up with two <h1>s — the page title and the body's. Demote
 * every heading in the body one level so the document has exactly one <h1>
 * and a well-formed outline underneath it.
 */
function demoteHeadings(html: string): string {
  return html.replace(
    /(<\/?h)([1-5])\b/gi,
    (_match, prefix: string, level: string) => `${prefix}${Number(level) + 1}`,
  )
}

const textOf = (html: string) =>
  html
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim()

/**
 * Drop a leading heading that just restates the issue title — the page already
 * renders the title above the body, so it would show twice.
 */
function stripRedundantTitle(html: string, title: string): string {
  const match = html.match(/^\s*<h1\b[^>]*>([\s\S]*?)<\/h1>/i)
  if (!match) return html
  const heading = textOf(match[1]).replace(/\.$/, '')
  return heading === title ? html.slice(match[0].length) : html
}

function toPost(issue: GitHubIssue, label?: string): Post {
  const title = issue.title.replace(/\.$/, '')
  const bodyHtml = demoteHeadings(
    stripRedundantTitle(issue.body_html ?? '', title),
  )
  const text = issue.body_text ?? issue.body ?? ''
  const tags = issue.labels
    .map(labelName)
    .filter((name) => name !== label)

  return {
    number: issue.number,
    title,
    bodyHtml,
    excerpt: excerptOf(text),
    tags,
    createdAt: issue.created_at,
    updatedAt: issue.updated_at,
    comments: issue.comments,
    reactions: issue.reactions?.total_count ?? 0,
    githubUrl: issue.html_url,
    cover: firstImage(bodyHtml),
    readingMinutes: readingMinutes(text),
  }
}

/** Every published post, newest first. */
export async function listPosts(env: Env): Promise<Post[]> {
  const config = readSiteConfig(env)
  const params = new URLSearchParams({
    state: 'open',
    creator: config.owner,
    sort: 'created',
    direction: 'desc',
    per_page: '100',
  })
  if (config.label) params.set('labels', config.label)

  const res = await fetchGitHub(
    `/repos/${config.owner}/${config.repo}/issues?${params}`,
    env,
  )
  const issues = (await res.json()) as GitHubIssue[]

  return issues
    // The issues endpoint also returns pull requests; drop them.
    .filter((issue) => !issue.pull_request && !issue.draft)
    .map((issue) => toPost(issue, config.label))
}

/** A single post, or null when the issue doesn't exist / isn't a post. */
export async function getPost(env: Env, number: number): Promise<Post | null> {
  const config = readSiteConfig(env)
  try {
    const res = await fetchGitHub(
      `/repos/${config.owner}/${config.repo}/issues/${number}`,
      env,
    )
    const issue = (await res.json()) as GitHubIssue
    if (issue.pull_request) return null
    return toPost(issue, config.label)
  } catch {
    return null
  }
}
