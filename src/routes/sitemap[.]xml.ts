import { createFileRoute } from '@tanstack/react-router'
import { env } from 'cloudflare:workers'

import { listPosts, readSiteConfig } from '#/lib/github'

export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: async () => {
        const site = readSiteConfig(env)
        const posts = await listPosts(env)

        const urls = [
          /* Trailing slash so this matches the homepage's canonical exactly. */
          `  <url><loc>${site.url}/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>`,
          ...posts.map(
            (post) =>
              `  <url><loc>${site.url}/posts/${post.number}</loc><lastmod>${
                post.updatedAt.split('T')[0]
              }</lastmod></url>`,
          ),
        ].join('\n')

        return new Response(
          `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`,
          {
            headers: {
              'Content-Type': 'application/xml; charset=utf-8',
              'Cache-Control': 'public, max-age=3600, s-maxage=3600',
            },
          },
        )
      },
    },
  },
})
