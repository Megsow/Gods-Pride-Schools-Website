import { hydrateDocumentFields, hydrateCollections } from './utils/bindings.js';
import {
  renderAnnouncementCard,
  renderTestimonialCard,
  renderNewsCard,
  renderGalleryItem,
} from './utils/renderers.js';

const pageName = document.body?.dataset?.page || null;

const collectionRenderers = {
  default: {},
  home: {
    announcements: renderAnnouncementCard,
    testimonials: renderTestimonialCard,
  },
  news: {
    announcements: renderAnnouncementCard,
    news: renderNewsCard,
  },
  gallery: {
    gallery: renderGalleryItem,
  },
};

const pageModules = {
  home: () => import('./pages/home.js'),
  about: () => import('./pages/about.js'),
  admission: () => import('./pages/admission.js'),
  contact: () => import('./pages/contact.js'),
  news: () => import('./pages/news.js'),
  gallery: () => import('./pages/gallery.js'),
  schools: () => import('./pages/schools.js'),
  nurseryPrimary: () => import('./pages/nurseryPrimary.js'),
  secondary: () => import('./pages/secondary.js'),
};

async function bootstrap() {
  await hydrateDocumentFields();
  const renderers = { ...(collectionRenderers.default || {}), ...(collectionRenderers[pageName] || {}) };
  const collectionData = await hydrateCollections(renderers);

  if (pageName && pageModules[pageName]) {
    try {
      const module = await pageModules[pageName]();
      if (module?.renderPage) {
        await module.renderPage({ collections: collectionData });
      }
    } catch (error) {
      console.warn(`Failed to load page module for ${pageName}:`, error);
    }
  }
}

bootstrap();
