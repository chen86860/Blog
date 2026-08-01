const dateFormatter = new Intl.DateTimeFormat('zh-CN', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  timeZone: 'Asia/Shanghai',
})

export const formatDate = (iso: string) => dateFormatter.format(new Date(iso))

export const yearOf = (iso: string) =>
  new Date(iso).toLocaleDateString('zh-CN', {
    year: 'numeric',
    timeZone: 'Asia/Shanghai',
  })

/**
 * Deterministic hue per post, so the placeholder cover of a given post is
 * always the same colour without storing anything.
 */
export const hueFor = (seed: number) => (seed * 47) % 360
