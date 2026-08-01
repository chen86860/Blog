import { Link, createFileRoute, notFound } from '@tanstack/react-router'

import { formatDate } from '#/lib/format'
import { fetchPost, fetchPosts, type PostSummary } from '#/lib/posts'

export const Route = createFileRoute('/posts/$number')({
  loader: async ({ params }) => {
    const number = Number(params.number)
    if (!Number.isInteger(number) || number <= 0) throw notFound()

    const [post, index] = await Promise.all([
      fetchPost({ data: number }),
      fetchPosts(),
    ])
    if (!post) throw notFound()

    // Posts come back newest-first, so "next" is the older neighbour.
    const at = index.posts.findIndex((item) => item.number === number)
    return {
      post,
      site: index.site,
      newer: at > 0 ? index.posts[at - 1] : null,
      older: at >= 0 && at < index.posts.length - 1 ? index.posts[at + 1] : null,
    }
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {}
    const { post, site } = loaderData
    const url = `${site.url}/posts/${post.number}`
    return {
      meta: [
        { title: `${post.title} · ${site.title}` },
        { name: 'description', content: post.excerpt },
        { property: 'og:type', content: 'article' },
        { property: 'og:title', content: post.title },
        { property: 'og:description', content: post.excerpt },
        { property: 'og:url', content: url },
        ...(post.cover ? [{ property: 'og:image', content: post.cover }] : []),
        { property: 'article:published_time', content: post.createdAt },
        { property: 'article:modified_time', content: post.updatedAt },
      ],
      links: [{ rel: 'canonical', href: url }],
    }
  },
  component: PostPage,
})

function PostPage() {
  const { post, site, newer, older } = Route.useLoaderData()

  return (
    <article className="mx-auto max-w-2xl py-10">
      <Link
        to="/"
        className="link-underline font-mono text-xs whitespace-nowrap text-ink-3 hover:text-ink"
      >
        <span aria-hidden>←</span> 所有文章
      </Link>

      <header className="mt-6 mb-10 space-y-4">
        <h1 className="text-3xl leading-tight font-bold tracking-tight sm:text-4xl">
          {post.title}
        </h1>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-xs text-ink-3 tabular-nums">
          <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
          <span aria-hidden>·</span>
          <span>{post.readingMinutes} 分钟阅读</span>
          <span aria-hidden>·</span>
          <a
            href={post.githubUrl}
            target="_blank"
            rel="noreferrer"
            className="link-underline hover:text-ink"
          >
            #{post.number}
          </a>
        </div>

        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <Link
                key={tag}
                to="/"
                search={{ tag }}
                className="link-underline font-mono text-xs text-accent"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* GitHub sanitises issue HTML server-side before returning body_html. */}
      <div
        className="prose-issue"
        dangerouslySetInnerHTML={{ __html: post.bodyHtml }}
      />

      <div className="mt-14 rounded-[--radius-md] border border-rule bg-paper-2 p-5 text-sm">
        <p className="text-ink-2">
          这篇文章写在 GitHub Issue 里
          {post.comments > 0 && `，已有 ${post.comments} 条讨论`}。
        </p>
        <a
          href={post.githubUrl}
          target="_blank"
          rel="noreferrer"
          className="link-underline mt-3 inline-flex items-center gap-1.5 font-medium text-accent"
        >
          在 GitHub 上参与讨论 ↗
        </a>
      </div>

      <nav className="mt-8 grid gap-3 sm:grid-cols-2">
        <NeighbourLink post={newer} direction="newer" />
        <NeighbourLink post={older} direction="older" />
      </nav>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.title,
            description: post.excerpt,
            datePublished: post.createdAt,
            dateModified: post.updatedAt,
            author: { '@type': 'Person', name: site.owner },
            mainEntityOfPage: `${site.url}/posts/${post.number}`,
            ...(post.cover ? { image: post.cover } : {}),
          }),
        }}
      />
    </article>
  )
}

function NeighbourLink({
  post,
  direction,
}: {
  post: PostSummary | null
  direction: 'newer' | 'older'
}) {
  if (!post) return <div className="hidden sm:block" />

  const isNewer = direction === 'newer'
  return (
    <Link
      to="/posts/$number"
      params={{ number: String(post.number) }}
      className={`index-row group rounded-[--radius-md] border border-rule p-4 ${
        isNewer ? '' : 'sm:text-right'
      }`}
    >
      <span className="font-mono text-xs text-ink-3">
        {isNewer ? '← 更新的一篇' : '更早的一篇 →'}
      </span>
      <span className="mt-1 block font-display text-sm font-medium">
        {post.title}
      </span>
    </Link>
  )
}
