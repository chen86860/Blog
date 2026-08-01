import { Link } from '@tanstack/react-router'

import type { PostSummary } from '#/lib/posts'

const monthDay = new Intl.DateTimeFormat('zh-CN', {
  month: '2-digit',
  day: '2-digit',
  timeZone: 'Asia/Shanghai',
})

/**
 * One line in the archive index. Deliberately image-free: at this density a
 * thumbnail column would be decoration, and the titles are what people scan.
 */
export function PostRow({
  post,
  hiddenTags,
}: {
  post: PostSummary
  /** Tags carried by nearly every post — shown in the filter rail, not here. */
  hiddenTags?: ReadonlySet<string>
}) {
  const tags = post.tags.filter((tag) => !hiddenTags?.has(tag))

  return (
    <li className="index-row relative -mx-3 rounded-[--radius-sm]">
      <div className="grid gap-x-4 gap-y-1 px-3 py-3 sm:grid-cols-[4.5rem_minmax(0,1fr)_auto] sm:items-baseline">
        <time
          dateTime={post.createdAt}
          className="font-mono text-xs text-ink-3 tabular-nums"
        >
          {monthDay.format(new Date(post.createdAt))}
        </time>

        <h3 className="min-w-0 font-display text-[1.0625rem] leading-snug font-medium">
          <Link
            to="/posts/$number"
            params={{ number: String(post.number) }}
            className="link-underline before:absolute before:inset-0"
          >
            {post.title}
          </Link>
        </h3>

        <div className="flex flex-wrap items-center gap-x-2 font-mono text-xs text-ink-3 tabular-nums sm:justify-end">
          {tags.map((tag) => (
            <span key={tag} className="text-accent">
              #{tag}
            </span>
          ))}
          <span>{post.readingMinutes} 分钟</span>
        </div>
      </div>
    </li>
  )
}
