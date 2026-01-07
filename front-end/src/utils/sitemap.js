/**
 * Sitemap Generator Utility
 * Generates sitemap.xml for SEO
 * Safe implementation that doesn't break anything
 */

/**
 * Generate sitemap XML string
 */
export const generateSitemap = (routes = [], baseUrl = 'https://triplink.com') => {
  const currentDate = new Date().toISOString().split('T')[0];
  
  const defaultRoutes = [
    { path: '/', priority: '1.0', changefreq: 'daily' },
    { path: '/destinations', priority: '0.9', changefreq: 'daily' },
    { path: '/collections', priority: '0.8', changefreq: 'weekly' },
    { path: '/help', priority: '0.7', changefreq: 'monthly' },
  ];

  const allRoutes = [...defaultRoutes, ...routes];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes.map(route => `  <url>
    <loc>${baseUrl}${route.path}</loc>
    <lastmod>${route.lastmod || currentDate}</lastmod>
    <changefreq>${route.changefreq || 'weekly'}</changefreq>
    <priority>${route.priority || '0.5'}</priority>
  </url>`).join('\n')}
</urlset>`;

  return sitemap;
};

/**
 * Download sitemap as file (for development)
 */
export const downloadSitemap = (routes, baseUrl) => {
  const sitemap = generateSitemap(routes, baseUrl);
  const blob = new Blob([sitemap], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'sitemap.xml';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export default {
  generateSitemap,
  downloadSitemap,
};

