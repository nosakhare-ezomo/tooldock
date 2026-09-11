import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://tooldock.com' // Placeholder for real domain

  // All routes that should be indexed
  const routes = [
    '',
    '/pricing',
    '/privacy',
    '/terms',
    '/pdf/merge',
    '/pdf/split',
    '/pdf/compress',
    '/pdf-to-jpg',
    '/img-to-pdf',
    '/image/compress',
    '/image/resize',
    '/image/convert',
    '/qr-code-generator',
    '/password-generator',
    '/word-counter',
    '/percentage-calculator'
  ]

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: route === '' ? 1 : 0.8,
  }))
}
