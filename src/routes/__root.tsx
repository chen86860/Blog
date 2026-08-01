import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import type { ReactNode } from 'react'

import { ThemeToggle, themeInitScript } from '#/components/theme'
import { fetchSite } from '#/lib/posts'
import appCss from '#/styles.css?url'

export const Route = createRootRouteWithContext<Record<never, never>>()({
  loader: async () => ({ site: await fetchSite() }),
  head: ({ loaderData }) => {
    const site = loaderData?.site
    return {
      meta: [
        { charSet: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { title: site?.title ?? "Jack's Blog" },
        { name: 'description', content: site?.description ?? '' },
        /* Matches --c-paper in each band (tokens.css). */
        {
          name: 'theme-color',
          content: 'oklch(98.5% 0.004 250)',
          media: '(prefers-color-scheme: light)',
        },
        {
          name: 'theme-color',
          content: 'oklch(17% 0.012 260)',
          media: '(prefers-color-scheme: dark)',
        },
        { property: 'og:site_name', content: site?.title ?? "Jack's Blog" },
        { property: 'og:type', content: 'website' },
        { name: 'twitter:card', content: 'summary_large_image' },
      ],
      links: [
        { rel: 'stylesheet', href: appCss },
        { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
        {
          rel: 'alternate',
          type: 'application/rss+xml',
          title: site?.title ?? "Jack's Blog",
          href: '/rss.xml',
        },
        { rel: 'preconnect', href: 'https://avatars.githubusercontent.com' },
      ],
      scripts: [{ children: themeInitScript }],
    }
  },
  component: RootComponent,
  notFoundComponent: NotFound,
})

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  )
}

function RootDocument({ children }: { children: ReactNode }) {
  const { site } = Route.useLoaderData()

  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen font-sans">
        <div className="mx-auto flex min-h-screen max-w-4xl flex-col px-5 sm:px-8">
          <Header title={site.title} />
          <main className="flex-1 pb-20">{children}</main>
          <Footer owner={site.owner} repo={site.repo} />
        </div>
        <Scripts />
      </body>
    </html>
  )
}

function Header({ title }: { title: string }) {
  return (
    /* N1a minimal — this site genuinely has two destinations. */
    <header className="sticky top-0 z-20 -mx-5 flex items-center justify-between gap-4 border-b border-rule bg-[--c-paper-blur] px-5 py-4 backdrop-blur-md sm:-mx-8 sm:px-8">
      <Link
        to="/"
        className="flex items-center gap-2 font-display text-[15px] font-semibold tracking-tight"
      >
        <span className="size-1.5 rounded-full bg-accent" />
        {title}
      </Link>
      <nav className="flex items-center gap-4 font-mono text-xs text-ink-3">
        <a href="/rss.xml" className="link-underline hover:text-ink">
          RSS
        </a>
        <ThemeToggle />
      </nav>
    </header>
  )
}

function Footer({ owner, repo }: { owner: string; repo: string }) {
  return (
    /* Ft2 inline single line — matches emmmm.dev's footer voice. */
    <footer className="border-t border-rule py-8 font-mono text-xs text-ink-3">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <span className="tabular-nums">
          © {new Date().getFullYear()} {owner}
        </span>
        <a
          href={`https://github.com/${owner}/${repo}/issues`}
          target="_blank"
          rel="noreferrer"
          className="link-underline whitespace-nowrap hover:text-ink"
        >
          写于 GitHub Issues ↗
        </a>
      </div>
    </footer>
  )
}

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-32 text-center">
      <p className="font-mono text-6xl font-medium text-accent tabular-nums">404</p>
      <p className="text-ink-2">这里没有文章。</p>
      <Link
        to="/"
        className="link-underline font-mono text-xs whitespace-nowrap text-ink-3 hover:text-ink"
      >
        回到首页
      </Link>
    </div>
  )
}
