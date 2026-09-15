import { MetadataRoute } from 'next';
import { CalculatorRegistry } from '@/calculators/core/calculator-registry';
import '@/calculators/core/init';
import { categories } from '@/lib/data/categories';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.hesapera.com.tr';

  // Base routes
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/rehber`,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/kategoriler`,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/hakkimizda`,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/iletisim`,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/gizlilik`,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/kvkk`,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/cerez`,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/kullanim-kosullari`,
      changeFrequency: 'monthly',
      priority: 0.3,
    }
  ];

  // Categories routes (only categories with at least 1 published calculator)
  const categoryRoutes: MetadataRoute.Sitemap = categories
    .filter((cat) => CalculatorRegistry.getPublishedByCategory(cat.id).length > 0)
    .map((cat) => ({
      url: `${baseUrl}/kategoriler/${cat.id}`,
      changeFrequency: 'weekly',
      priority: 0.6,
    }));

  // Calculators routes (only published)
  const publishedCalculators = CalculatorRegistry.getPublishedAll();
  
  const calculatorRoutes: MetadataRoute.Sitemap = publishedCalculators.map((calc) => ({
    url: `${baseUrl}/hesaplama/${calc.slug}`,
    changeFrequency: 'monthly',
    priority: 0.9,
  }));

  return [...routes, ...categoryRoutes, ...calculatorRoutes];
}
