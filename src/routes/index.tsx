import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useMemo } from 'react';

import { FeaturedPost } from '#/components/PostCard';
import { PostRow } from '#/components/PostRow';
import { fetchPosts, type PostSummary } from '#/lib/posts';

interface HomeSearch {
  tag?: string;
  q?: string;
}

export const Route = createFileRoute('/')({
  validateSearch: (search: Record<string, unknown>): HomeSearch => ({
    tag: typeof search.tag === 'string' && search.tag ? search.tag : undefined,
    q: typeof search.q === 'string' && search.q ? search.q : undefined,
  }),
  loader: () => fetchPosts(),
  head: ({ loaderData }) => {
    const site = loaderData?.site;
    const title = site?.title ?? "Jack's Blog";
    return {
      meta: [
        { title },
        { property: 'og:title', content: title },
        { property: 'og:description', content: site?.description ?? '' },
        { property: 'og:url', content: site ? `${site.url}/` : '' },
        {
          property: 'og:image',
          content: site
            ? `https://avatars.githubusercontent.com/${site.owner}?s=460`
            : '',
        },
      ],
      links: [
        /* Also collapses the ?tag= / ?q= filter URLs, which serve the same
           document, onto one indexable address. */
        { rel: 'canonical', href: site ? `${site.url}/` : '' },
      ],
    };
  },
  component: Home,
});

function Home() {
  const { posts, site } = Route.useLoaderData();
  const { tag, q } = Route.useSearch();
  const navigate = useNavigate({ from: '/' });

  const tags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const post of posts) {
      for (const name of post.tags) {
        counts.set(name, (counts.get(name) ?? 0) + 1);
      }
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [posts]);

  /**
   * A label carried by almost every post (`blog`) is a publishing marker, not a
   * topic. It still belongs in the filter rail, but repeating it on every row
   * is noise — so the index suppresses it per-row.
   */
  const ubiquitousTags = useMemo(() => {
    const threshold = posts.length * 0.6;
    return new Set(tags.filter(([, count]) => count > threshold).map(([name]) => name));
  }, [tags, posts.length]);

  const visible = useMemo(() => {
    const needle = q?.toLowerCase().trim();
    return posts.filter((post) => {
      if (tag && !post.tags.includes(tag)) return false;
      if (!needle) return true;
      return (
        post.title.toLowerCase().includes(needle) ||
        post.excerpt.toLowerCase().includes(needle) ||
        post.tags.some((name) => name.toLowerCase().includes(needle))
      );
    });
  }, [posts, tag, q]);

  // Group the archive by year — the index's only structural device.
  const byYear = useMemo(() => {
    const groups = new Map<string, PostSummary[]>();
    for (const post of visible) {
      const year = post.createdAt.slice(0, 4);
      const bucket = groups.get(year);
      if (bucket) bucket.push(post);
      else groups.set(year, [post]);
    }
    return [...groups.entries()];
  }, [visible]);

  const setSearch = (next: HomeSearch) => navigate({ search: (prev) => ({ ...prev, ...next }), replace: true });

  const isFiltered = Boolean(tag || q);
  const [featured] = posts;

  return (
    <>
      {/* The index is a list of titles, so there is no visible page heading to
          promote. Search engines and screen readers still need one h1 as the
          document's root — this is the real site name, not keyword stuffing. */}
      <h1 className="sr-only">
        {site.title} — {site.description}
      </h1>

      {/* Surface 1 · the lead. Hidden while filtering — a "featured" post that
          ignores your filter is noise. */}
      {featured && !isFiltered && (
        <section className="border-t border-rule py-10">
          <RailHead title="最新" />
          <FeaturedPost post={featured} />
        </section>
      )}

      {/* Surface 2 · the archive index, with the tag + search rail. */}
      <section className="border-t border-rule py-10">
        <RailHead title="全部文章" trailing={`${visible.length} / ${posts.length}`} />

        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-x-4 gap-y-2 font-mono text-xs">
            <FilterLink active={!tag} onClick={() => setSearch({ tag: undefined })}>
              全部
            </FilterLink>
            {tags.map(([name, count]) => (
              <FilterLink
                key={name}
                active={tag === name}
                onClick={() => setSearch({ tag: tag === name ? undefined : name })}
              >
                #{name}
                {/* A token colour, not opacity — opacity halves the contrast
                    ratio and drops the count below AA. */}
                <span className="ml-1 text-ink-3 tabular-nums">{count}</span>
              </FilterLink>
            ))}
          </div>

          <label className="relative sm:w-52">
            <SearchIcon />
            <input
              type="search"
              value={q ?? ''}
              onChange={(event) => setSearch({ q: event.target.value || undefined })}
              placeholder="搜索标题、摘要"
              aria-label="搜索文章"
              className="w-full rounded-[--radius-sm] border border-rule bg-paper-2 py-1.5 pr-3 pl-8 font-mono text-xs outline-none placeholder:text-ink-3 focus-visible:border-accent"
            />
          </label>
        </div>

        {byYear.length === 0 ? (
          <p className="py-16 text-center text-sm text-ink-3">没有匹配的文章。</p>
        ) : (
          <div className="space-y-8">
            {byYear.map(([year, group]) => (
              <div key={year}>
                <div className="mb-1 flex items-baseline gap-3 border-b border-rule pb-1">
                  <h3 className="font-mono text-xs text-ink-3 tabular-nums">{year}</h3>
                  <span className="font-mono text-xs text-ink-3 tabular-nums">{group.length}</span>
                </div>
                <ul>
                  {group.map((post) => (
                    <PostRow key={post.number} post={post} hiddenTags={ubiquitousTags} />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Blog',
            name: site.title,
            description: site.description,
            url: `${site.url}/`,
            inLanguage: 'zh-CN',
            author: {
              '@type': 'Person',
              name: site.owner,
              url: `https://github.com/${site.owner}`,
            },
            blogPost: posts.map((post) => ({
              '@type': 'BlogPosting',
              headline: post.title,
              url: `${site.url}/posts/${post.number}`,
              datePublished: post.createdAt,
              dateModified: post.updatedAt,
            })),
          }),
        }}
      />
    </>
  );
}

/** Rail-titled band — vertical stack only, never a tag-left/title-right grid. */
function RailHead({ title, trailing }: { title: string; trailing?: string }) {
  return (
    <div className="mb-6 flex items-baseline justify-between gap-4">
      <h2 className="font-display text-sm font-medium tracking-tight">{title}</h2>
      {trailing && <span className="font-mono text-xs text-ink-3 tabular-nums">{trailing}</span>}
    </div>
  );
}

function FilterLink({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      /* One signal: colour. No pill, no border, no transform. */
      className={`whitespace-nowrap ${
        active ? 'text-accent underline underline-offset-4' : 'text-ink-3 hover:text-ink'
      }`}
    >
      {children}
    </button>
  );
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
      className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-ink-3"
    >
      <circle cx="11" cy="11" r="7" />
      <path strokeLinecap="round" d="M20 20l-3.5-3.5" />
    </svg>
  );
}
