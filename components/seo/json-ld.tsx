import React from 'react';
import { CalculatorDefinition } from '@/calculators/core/calculator-types';
import { CalculatorRegistry } from '@/calculators/core/calculator-registry';

export function JsonLd({ data }: { data: any }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function getHomepageJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': 'https://www.hesapera.com.tr/#website',
        url: 'https://www.hesapera.com.tr/',
        name: 'Hesapera',
        description: 'Türkiye\'nin en gelişmiş, ücretsiz ve modern hesaplama platformu.',
        publisher: {
          '@id': 'https://www.hesapera.com.tr/#organization'
        },
        inLanguage: 'tr-TR'
      },
      {
        '@type': 'Organization',
        '@id': 'https://www.hesapera.com.tr/#organization',
        name: 'Hesapera',
        url: 'https://www.hesapera.com.tr/',
        logo: {
          '@type': 'ImageObject',
          url: 'https://www.hesapera.com.tr/logo.png'
        }
      }
    ]
  };
}

export function getCalculatorJsonLd(calculator: CalculatorDefinition) {
  const url = `https://www.hesapera.com.tr/hesaplama/${calculator.slug}`;
  
  // Resolve category info for BreadcrumbList
  const uiCategoryId = CalculatorRegistry.getUiCategory(calculator.slug, calculator.category);
  const categoryName = uiCategoryId === 'matematik' ? 'Matematik' 
                     : uiCategoryId === 'kredi' ? 'Kredi'
                     : uiCategoryId === 'finans' ? 'Finans'
                     : uiCategoryId === 'saglik' ? 'Sağlık'
                     : uiCategoryId === 'egitim-sinav' ? 'Eğitim & Sınav'
                     : uiCategoryId === 'emlak' ? 'Emlak'
                     : 'Hesaplama'; // fallback (We can hardcode or just do simple lookup)
  
  const graph: any[] = [
    {
      '@type': 'WebApplication',
      '@id': `${url}#webapplication`,
      name: calculator.name,
      url: url,
      description: calculator.shortDescription,
      applicationCategory: 'UtilityApplication',
      operatingSystem: 'All',
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${url}#breadcrumb`,
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Ana Sayfa',
          item: 'https://www.hesapera.com.tr/'
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: categoryName,
          item: `https://www.hesapera.com.tr/kategoriler/${uiCategoryId}`
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: calculator.name,
          item: url
        }
      ]
    }
  ];

  if (calculator.metadata?.faq && calculator.metadata.faq.length > 0) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${url}#faq`,
      mainEntity: calculator.metadata.faq.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer
        }
      }))
    });
  }

  return {
    '@context': 'https://schema.org',
    '@graph': graph
  };
}
