import { Link } from '@tanstack/react-router'

import { formatDate } from '#/lib/format'
import type { PostSummary } from '#/lib/posts'

/**
 * The single featured post at the top of the index. This is the only place on
 * the homepage that carries an image — everything below it is typographic, so
 * the lead has to do the visual work on its own.
 */
export function FeaturedPost({ post }: { post: PostSummary }) {
  return (
    <article className="group relative grid gap-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] sm:items-center">
      {post.cover ? (
        <div className="overflow-hidden rounded-[--radius-lg] border border-rule">
          <img
            src={post.cover}
            alt=""
            /* Above the fold — must not be lazy, it's the LCP element. */
            fetchPriority="high"
            decoding="async"
            className="aspect-[16/10] w-full object-cover object-top"
          />
        </div>
      ) : (
        <div
          aria-hidden
          className="flex aspect-[16/10] items-end rounded-[--radius-lg] border border-rule bg-paper-2 p-5"
        >
          <span className="font-mono text-5xl font-medium text-accent/25 tabular-nums">
            #{post.number}
          </span>
        </div>
      )}

      <div className="min-w-0 space-y-3">
        <Meta post={post} />

        <h3 className="font-display text-2xl leading-tight font-semibold sm:text-[1.75rem]">
          <Link
            to="/posts/$number"
            params={{ number: String(post.number) }}
            className="link-underline before:absolute before:inset-0"
          >
            {post.title}
          </Link>
        </h3>

        <p className="line-clamp-3 leading-relaxed text-ink-2">{post.excerpt}</p>
      </div>
    </article>
  )
}

function Meta({ post }: { post: PostSummary }) {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-xs text-ink-3 tabular-nums">
      <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
      <span aria-hidden>·</span>
      <span>{post.readingMinutes} 分钟</span>
      {post.tags.map((tag) => (
        <span key={tag} className="text-accent">
          #{tag}
        </span>
      ))}
    </div>
  )
}
