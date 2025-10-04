import { useCollection } from '../hooks/useFirestore.js';
import { setLoadingHTML, restoreHTMLFallback } from '../utils/dom.js';
import { renderCarouselSlide, renderCarouselIndicator } from '../utils/renderers.js';

async function hydrateCarousel() {
  const carousel = document.querySelector('[data-carousel="home"]');
  if (!carousel) {
    return;
  }
  const inner = carousel.querySelector('.carousel-inner');
  const indicators = carousel.querySelector('.carousel-indicators');
  if (!inner) {
    return;
  }

  setLoadingHTML(inner);
  if (indicators) {
    setLoadingHTML(indicators);
  }

  const { data, error } = await useCollection('media/homeCarousel', {
    orderBy: ['order', 'asc'],
  });

  if (error || !data.length) {
    restoreHTMLFallback(inner);
    if (indicators) {
      restoreHTMLFallback(indicators);
    }
    return;
  }

  inner.innerHTML = '';
  if (indicators) {
    indicators.innerHTML = '';
  }

  data.forEach((item, index) => {
    inner.appendChild(renderCarouselSlide(item, { active: index === 0 }));
    if (indicators) {
      indicators.appendChild(renderCarouselIndicator(index, { active: index === 0 }));
    }
  });
}

function reinitialiseTestimonialCarousel() {
  const container = document.querySelector('.testimonial-carousel');
  if (!container || typeof window.$ !== 'function') {
    return;
  }
  const $container = window.$(container);
  if ($container.hasClass('slick-initialized')) {
    $container.slick('unslick');
  }
  $container.slick({
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  });
}

export async function renderPage() {
  await hydrateCarousel();
  document.addEventListener('collection:hydrated', event => {
    if (event.detail?.key === 'testimonials') {
      reinitialiseTestimonialCarousel();
    }
  });
}
