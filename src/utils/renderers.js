function createElement(tag, className, { text, html } = {}) {
  const element = document.createElement(tag);
  if (className) {
    element.className = className;
  }
  if (html !== undefined) {
    element.innerHTML = html;
  } else if (text !== undefined) {
    element.textContent = text;
  }
  return element;
}

export function renderAnnouncementCard(item) {
  const card = createElement('div', 'announcement-card');

  if (item.image?.url) {
    const img = document.createElement('img');
    img.src = item.image.url;
    img.alt = item.image.alt || item.title || 'Announcement';
    card.appendChild(img);
  }

  if (item.title) {
    card.appendChild(createElement('h3', null, { text: item.title }));
  }

  const scrolling = createElement('div', 'scrolling-text');
  const strongText = item.summary || '';
  const summary = createElement('p', null, { html: `<strong>${strongText}</strong>` });
  scrolling.appendChild(summary);
  card.appendChild(scrolling);

  const readMore = createElement('a', 'read-more-link', { text: 'Read More' });
  readMore.href = '#';
  card.appendChild(readMore);

  const expanded = createElement('div', 'expanded-content', {
    html: item.body || '',
  });
  card.appendChild(expanded);

  return card;
}

export function renderTestimonialCard(item) {
  const card = createElement('div', 'testimonial-card');
  const content = createElement('div', 'testimonial-content');
  if (item.quote) {
    content.appendChild(createElement('p', null, { text: item.quote }));
  }
  if (item.author) {
    content.appendChild(createElement('cite', null, { text: item.author }));
  }
  card.appendChild(content);
  return card;
}

export function renderNewsCard(item) {
  const card = createElement('div', 'news-card');
  if (item.image?.url) {
    const img = document.createElement('img');
    img.src = item.image.url;
    img.alt = item.image.alt || item.title || 'News image';
    card.appendChild(img);
  }
  const body = createElement('div', 'news-card-body');
  if (item.title) {
    body.appendChild(createElement('h3', null, { text: item.title }));
  }
  if (item.summary) {
    body.appendChild(createElement('p', null, { text: item.summary }));
  }
  if (item.publishedAt) {
    const date = new Date(item.publishedAt.seconds ? item.publishedAt.seconds * 1000 : item.publishedAt);
    if (!Number.isNaN(date.getTime())) {
      body.appendChild(createElement('p', 'news-date', { text: date.toLocaleDateString() }));
    }
  }
  if (item.body) {
    const link = createElement('a', 'news-read-more', { text: 'Read More' });
    link.href = item.link || '#';
    body.appendChild(link);
  }
  card.appendChild(body);
  return card;
}

export function renderGalleryItem(item) {
  const wrapper = createElement('div', 'media-item');
  const img = document.createElement('img');
  img.loading = 'lazy';
  img.src = item.url || item.image?.url || '';
  img.alt = item.alt || item.caption || 'Gallery image';
  img.className = 'responsive-image';
  wrapper.appendChild(img);
  if (item.caption) {
    wrapper.appendChild(createElement('p', 'media-caption', { text: item.caption }));
  }
  return wrapper;
}

export function renderCarouselSlide(item, { active } = {}) {
  const slide = createElement('div', `carousel-item${active ? ' active' : ''}`);
  const img = document.createElement('img');
  img.className = 'd-block w-100';
  img.src = item.url || item.image?.url || '';
  img.alt = item.alt || item.caption || 'Carousel slide';
  slide.appendChild(img);
  if (item.caption || item.description) {
    const caption = createElement('div', 'carousel-caption', {
      html: `<h5>${item.caption || ''}</h5><p>${item.description || ''}</p>`,
    });
    slide.appendChild(caption);
  }
  return slide;
}

export function renderCarouselIndicator(index, { active } = {}) {
  const li = document.createElement('li');
  li.setAttribute('data-target', '#myCarousel');
  li.setAttribute('data-slide-to', index.toString());
  if (active) {
    li.classList.add('active');
  }
  return li;
}
