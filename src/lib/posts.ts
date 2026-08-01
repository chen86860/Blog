import { createServerFn } from '@tanstack/react-start'
import { env } from 'cloudflare:workers'

import { getPost, listPosts, readSiteConfig, type Post } from '#/lib/github'

/** Card-sized post: everything the list needs, without the (large) body HTML. */
export type PostSummary = Omit<Post, 'bodyHtml'>

const summarize = ({ bodyHtml: _bodyHtml, ...rest }: Post): PostSummary => rest

export const fetchPosts = createServerFn({ method: 'GET' }).handler(
  async (): Promise<{ posts: PostSummary[]; site: ReturnType<typeof readSiteConfig> }> => ({
    posts: (await listPosts(env)).map(summarize),
    site: readSiteConfig(env),
  }),
)

export const fetchPost = createServerFn({ method: 'GET' })
  .validator((number: number) => number)
  .handler(async ({ data }): Promise<Post | null> => getPost(env, data))

export const fetchSite = createServerFn({ method: 'GET' }).handler(async () =>
  readSiteConfig(env),
)
