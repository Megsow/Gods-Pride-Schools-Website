import {
  fetchCollection,
  fetchDocument,
  resolveImage,
} from "./firebase/contentService.js";
import {
  announcementsFallback,
  carouselFallback,
  heroFallback,
  mediaFallback,
  testimonialsFallback,
} from "./firebase/fallbackData.js";

const CAROUSEL_COLLECTION = "siteContent/carouselSlides";
const ANNOUNCEMENTS_COLLECTION = "siteContent/announcements";
const TESTIMONIALS_COLLECTION = "siteContent/testimonials";
const MEDIA_COLLECTION = "siteContent/mediaGallery";
const HERO_DOCUMENT = "siteContent/homeHero";

const loadingClass = "content-loading";
const errorClass = "content-error";
const TRANSPARENT_PIXEL = "data:image/gif;base64,R0lGODlhAQABAAAAACw=";

function toggleState(element, { loading = false, message = "" } = {}) {
  if (!element) return;

  element.textContent = message;
  element.hidden = !loading && !message;
  element.classList.toggle(loadingClass, loading);
  element.classList.toggle(errorClass, !loading && Boolean(message));
}

function setImageSource(image, { imageUrl, storagePath }) {
  if (!image) return;

  if (imageUrl) {
    image.src = imageUrl;
    image.dataset.loaded = "true";
    return;
  }

  if (storagePath) {
    image.dataset.storagePath = storagePath;
    image.src = TRANSPARENT_PIXEL;
  }
}

async function renderHeroSection() {
  const heroTitle = document.querySelector("[data-firestore-field='hero-title']");
  const heroSubtitle = document.querySelector("[data-firestore-field='hero-subtitle']");
  const heroSlogan = document.querySelector("[data-firestore-field='hero-slogan']");
  const heroTagline = document.querySelector("[data-firestore-field='hero-tagline']");
  const leftLogo = document.querySelector("[data-storage-field='leftLogoPath']");
  const rightLogo = document.querySelector("[data-storage-field='rightLogoPath']");
  const loading = document.querySelector("#hero-loading");
  const error = document.querySelector("#hero-error");

  [leftLogo, rightLogo].forEach((image) => {
    if (image && !image.src && image.dataset.placeholder) {
      image.src = image.dataset.placeholder;
    }
  });

  toggleState(loading, { loading: true, message: "Loading school profile..." });
  toggleState(error);

  let heroDoc = null;

  try {
    heroDoc = await fetchDocument(HERO_DOCUMENT);
  } catch (heroError) {
    console.error("Failed to fetch hero document:", heroError);
  }

  const heroData = { ...heroFallback, ...(heroDoc || {}) };

  if (heroTitle) {
    heroTitle.textContent = heroData.title;
  }
  if (heroSubtitle) {
    heroSubtitle.textContent = heroData.subtitle;
  }
  if (heroSlogan) {
    heroSlogan.textContent = heroData.slogan;
  }
  if (heroTagline) {
    heroTagline.textContent = heroData.tagline;
  }

  const logos = [
    { element: leftLogo, storagePath: heroData.leftLogoPath, imageUrl: heroData.leftLogoUrl },
    { element: rightLogo, storagePath: heroData.rightLogoPath, imageUrl: heroData.rightLogoUrl },
  ];

  await Promise.all(
    logos.map(async ({ element, storagePath, imageUrl }) => {
      if (!element) {
        return;
      }

      if (imageUrl) {
        element.src = imageUrl;
        element.dataset.loaded = "true";
        return;
      }

      if (!storagePath) {
        return;
      }

      try {
        const url = await resolveImage(storagePath);
        element.src = url;
        element.dataset.loaded = "true";
      } catch (logoError) {
        console.error(`Failed to load storage asset for ${storagePath}:`, logoError);
        element.alt = "Image unavailable";
      }
    })
  );

  toggleState(loading);
}

function createAnnouncementCard({ title, summary, content, imagePath, imageUrl, ctaLabel, ctaLink }) {
  const card = document.createElement("div");
  card.className = "announcement-card";

  const image = document.createElement("img");
  image.alt = title || "Announcement";
  setImageSource(image, { imageUrl, storagePath: imagePath });
  if (!image.dataset.loaded) {
    if (!image.src) {
      image.src = TRANSPARENT_PIXEL;
    }
  }
  card.appendChild(image);

  if (title) {
    const heading = document.createElement("h3");
    heading.textContent = title;
    card.appendChild(heading);
  }

  if (summary) {
    const summaryContainer = document.createElement("div");
    summaryContainer.className = "scrolling-text";
    summaryContainer.innerHTML = `<p><strong>${summary}</strong></p>`;
    card.appendChild(summaryContainer);
  }

  const hasContent = Boolean(content);
  const effectiveCtaLabel = ctaLabel || (hasContent ? "Read More" : "");

  if (effectiveCtaLabel) {
    const link = document.createElement("a");
    link.className = "read-more-link";
    link.href = ctaLink || "#";
    link.textContent = effectiveCtaLabel;
    card.appendChild(link);
  }

  if (hasContent) {
    const expanded = document.createElement("div");
    expanded.className = "expanded-content";
    expanded.innerHTML = content;
    card.appendChild(expanded);
  }

  return card;
}

async function renderAnnouncements() {
  const container = document.querySelector("[data-content='announcements']");
  const loading = container?.querySelector("[data-role='loading']");
  const error = container?.querySelector("[data-role='error']");

  toggleState(loading, { loading: true, message: "Loading announcements..." });
  toggleState(error);

  container?.querySelectorAll(".announcement-card").forEach((card) => card.remove());

  let announcements = [];
  let usedFallback = false;

  try {
    announcements = await fetchCollection(ANNOUNCEMENTS_COLLECTION, {
      orderByField: "priority",
      orderDirection: "desc",
    });
  } catch (announcementError) {
    console.error("Failed to fetch announcements:", announcementError);
    announcements = announcementsFallback;
    usedFallback = true;
  }

  if (!announcements.length) {
    const message = usedFallback
      ? "Announcements are temporarily unavailable."
      : "No announcements available yet. Please check back soon.";
    toggleState(error, { message });
    toggleState(loading);
    return;
  }

  const fragment = document.createDocumentFragment();

  for (const announcement of announcements) {
    fragment.appendChild(createAnnouncementCard(announcement));
  }

  container?.appendChild(fragment);

  const images = container?.querySelectorAll("img[data-storage-path]") ?? [];
  await loadStorageImages(images);

  toggleState(loading);
}

function createCarouselItem({ title, caption, imagePath, imageUrl }, index) {
  const item = document.createElement("div");
  item.className = "carousel-item";
  if (index === 0) {
    item.classList.add("active");
  }

  const image = document.createElement("img");
  image.className = "d-block w-100";
  image.alt = title || `Slide ${index + 1}`;
  setImageSource(image, { imageUrl, storagePath: imagePath });
  if (!image.dataset.loaded) {
    if (!image.src) {
      image.src = TRANSPARENT_PIXEL;
    }
  }
  item.appendChild(image);

  if (title || caption) {
    const captionContainer = document.createElement("div");
    captionContainer.className = "carousel-caption d-none d-md-block";
    if (title) {
      const heading = document.createElement("h5");
      heading.textContent = title;
      captionContainer.appendChild(heading);
    }
    if (caption) {
      const paragraph = document.createElement("p");
      paragraph.textContent = caption;
      captionContainer.appendChild(paragraph);
    }
    item.appendChild(captionContainer);
  }

  return item;
}

async function renderCarousel() {
  const indicators = document.querySelector("#myCarousel .carousel-indicators");
  const inner = document.querySelector("#myCarousel .carousel-inner");
  const loading = document.querySelector("#carousel-loading");
  const error = document.querySelector("#carousel-error");

  toggleState(loading, { loading: true, message: "Loading highlights..." });
  toggleState(error);

  let slides = [];
  let usedFallback = false;

  try {
    slides = await fetchCollection(CAROUSEL_COLLECTION, {
      orderByField: "order",
      orderDirection: "asc",
    });
  } catch (carouselError) {
    console.error("Failed to fetch carousel slides:", carouselError);
    slides = carouselFallback;
    usedFallback = true;
  }

  if (!slides.length) {
    const message = usedFallback ? "Highlights are temporarily unavailable." : "No highlights available yet.";
    toggleState(error, { message });
    toggleState(loading);
    return;
  }

  indicators.innerHTML = "";
  inner.innerHTML = "";

  const indicatorFragment = document.createDocumentFragment();
  const slideFragment = document.createDocumentFragment();

  slides.forEach((slide, index) => {
    const indicator = document.createElement("li");
    indicator.dataset.target = "#myCarousel";
    indicator.dataset.slideTo = index;
    if (index === 0) {
      indicator.classList.add("active");
    }
    indicatorFragment.appendChild(indicator);

    const item = createCarouselItem(slide, index);
    slideFragment.appendChild(item);
  });

  indicators.appendChild(indicatorFragment);
  inner.appendChild(slideFragment);

  const images = inner.querySelectorAll("img[data-storage-path]");
  await loadStorageImages(images);

  if (window.jQuery && window.jQuery.fn && window.jQuery.fn.carousel) {
    window.jQuery("#myCarousel").carousel({ interval: 5000, pause: "hover", wrap: true });
  }

  toggleState(loading);
}

function createTestimonialCard({ quote, author }) {
  const card = document.createElement("div");
  card.className = "testimonial-card";

  const content = document.createElement("div");
  content.className = "testimonial-content";

  if (quote) {
    const paragraph = document.createElement("p");
    paragraph.textContent = quote;
    content.appendChild(paragraph);
  }

  if (author) {
    const cite = document.createElement("cite");
    cite.textContent = author;
    content.appendChild(cite);
  }

  card.appendChild(content);
  return card;
}

function initTestimonialCarousel(container) {
  if (!(window.jQuery && window.jQuery.fn && window.jQuery.fn.slick)) {
    return;
  }

  const $container = window.jQuery(container);
  if ($container.hasClass("slick-initialized")) {
    $container.slick("unslick");
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

async function renderTestimonials() {
  const container = document.querySelector("[data-content='testimonials']");
  const loading = container?.querySelector("[data-role='loading']");
  const error = container?.querySelector("[data-role='error']");

  toggleState(loading, { loading: true, message: "Loading testimonials..." });
  toggleState(error);

  container?.querySelectorAll(".testimonial-card").forEach((card) => card.remove());

  let testimonials = [];
  let usedFallback = false;

  try {
    testimonials = await fetchCollection(TESTIMONIALS_COLLECTION, {
      orderByField: "order",
    });
  } catch (testimonialError) {
    console.error("Failed to fetch testimonials:", testimonialError);
    testimonials = testimonialsFallback;
    usedFallback = true;
  }

  if (!testimonials.length) {
    const message = usedFallback
      ? "Testimonials are temporarily unavailable."
      : "Testimonials will be available soon.";
    toggleState(error, { message });
    toggleState(loading);
    return;
  }

  const fragment = document.createDocumentFragment();
  testimonials.forEach((testimonial) => {
    fragment.appendChild(createTestimonialCard(testimonial));
  });

  container?.appendChild(fragment);
  initTestimonialCarousel(container);

  toggleState(loading);
}

function createMediaCard({ title, imagePath, imageUrl, link }) {
  const wrapper = document.createElement("div");
  wrapper.className = "media-item";

  const anchor = document.createElement("a");
  anchor.href = link || "#";

  const image = document.createElement("img");
  image.alt = title || "Media";
  setImageSource(image, { imageUrl, storagePath: imagePath });
  if (!image.dataset.loaded) {
    if (!image.src) {
      image.src = TRANSPARENT_PIXEL;
    }
  }

  anchor.appendChild(image);
  wrapper.appendChild(anchor);

  if (title) {
    const info = document.createElement("div");
    info.className = "media-info";
    const heading = document.createElement("h3");
    heading.textContent = title;
    info.appendChild(heading);
    wrapper.appendChild(info);
  }

  return wrapper;
}

async function renderMediaGallery() {
  const container = document.querySelector("[data-content='media-gallery']");
  const loading = container?.querySelector("[data-role='loading']");
  const error = container?.querySelector("[data-role='error']");

  toggleState(loading, { loading: true, message: "Loading gallery..." });
  toggleState(error);

  container?.querySelectorAll(".media-item").forEach((item) => item.remove());

  let mediaItems = [];
  let usedFallback = false;

  try {
    mediaItems = await fetchCollection(MEDIA_COLLECTION, {
      orderByField: "order",
    });
  } catch (mediaError) {
    console.error("Failed to fetch media gallery:", mediaError);
    mediaItems = mediaFallback;
    usedFallback = true;
  }

  if (!mediaItems.length) {
    const message = usedFallback
      ? "Media gallery is temporarily unavailable."
      : "Gallery will be updated soon.";
    toggleState(error, { message });
    toggleState(loading);
    return;
  }

  const fragment = document.createDocumentFragment();
  mediaItems.forEach((item) => fragment.appendChild(createMediaCard(item)));
  container?.appendChild(fragment);

  const images = container?.querySelectorAll("img[data-storage-path]") ?? [];
  await loadStorageImages(images);

  toggleState(loading);
}

async function loadStorageImages(images) {
  await Promise.all(
    Array.from(images).map(async (image) => {
      if (image.dataset.loaded === "true") {
        return;
      }

      const storagePath = image.dataset.storagePath || image.dataset.storageField;
      if (!storagePath) {
        return;
      }

      try {
        const url = await resolveImage(storagePath);
        image.src = url;
        image.dataset.loaded = "true";
      } catch (storageError) {
        console.error(`Failed to load image at ${storagePath}`, storageError);
        image.alt = "Image unavailable";
      }
    })
  );
}

function hydrateReadMoreLinks(container) {
  container.querySelectorAll(".read-more-link").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const card = link.closest(".announcement-card");
      const expandedContent = card?.querySelector(".expanded-content");

      if (expandedContent) {
        expandedContent.classList.toggle("show");
        link.textContent = expandedContent.classList.contains("show")
          ? "Read Less"
          : "Read More";
      }
    });
  });
}

async function bootstrapDynamicContent() {
  await Promise.all([
    renderHeroSection(),
    renderCarousel(),
    renderAnnouncements(),
    renderTestimonials(),
    renderMediaGallery(),
  ]);

  const announcementsContainer = document.querySelector("[data-content='announcements']");
  if (announcementsContainer) {
    hydrateReadMoreLinks(announcementsContainer);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  bootstrapDynamicContent().catch((error) => {
    console.error("Failed to bootstrap dynamic content", error);
  });
});
