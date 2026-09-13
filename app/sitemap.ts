import { MetadataRoute } from 'next';
import { CalculatorRegistry } from '@/calculators/core/calculator-registry';
import '@/calculators/core/init';
import { categories } from '@/lib/data/categories';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://hesapera.com.tr';

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
    }
  ];

  // Categories routes
  const categoryRoutes: MetadataRoute.Sitemap = categories.map((cat) => ({
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
