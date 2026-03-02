import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  // Si en el futuro tienes rutas dinámicas, aquí harías un:
  // const posts = await getPosts(); 

  return [
    {
      url: 'https://lab.villaarreola.com',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: 'https://lab.villaarreola.com/architecture',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9, 
    },
    {
      url: 'https://lab.villaarreola.com/llms.txt',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4, 
    },
    {
      url: 'https://lab.villaarreola.com/terms',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.1,
    },
  ]
}