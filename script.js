document.addEventListener('DOMContentLoaded', () => {
  // Form submission
  const form = document.getElementById('contact-form');
  form?.addEventListener('submit', function(e) {
    e.preventDefault();
    const name    = (document.getElementById('name') as HTMLInputElement)?.value;
    const email   = (document.getElementById('email') as HTMLInputElement)?.value;
    const message = (document.getElementById('message') as HTMLInputElement)?.value;

    console.log({ name, email, message });
    alert('Form submitted successfully!');
    this.reset();
  });

  // Nav toggle
  const navToggle = document.querySelector<HTMLButtonElement>('.nav-toggle');
  const navMenu   = document.querySelector<HTMLUListElement>('.nav-menu');
  navToggle && navMenu && navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
  });

  // Utility to check if element is fully in viewport
  const isInViewport = (el: Element) => {
    const rect = el.getBoundingClientRect();
    return (
      rect.top   >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)
    );
  };

  // Animate testimonials and announcements on scroll
  const onScrollAnimate = () => {
    document.querySelectorAll<HTMLElement>('.testimonial-card, .announcement-card').forEach(card => {
      if (isInViewport(card)) card.classList.add('show');
    });
  };
  window.addEventListener('scroll', onScrollAnimate, { passive: true });
  onScrollAnimate();

  // “Read more” links
  document.querySelectorAll<HTMLAnchorElement>('.read-more-link').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const card = link.closest('.announcement-card');
      const extra = card?.querySelector<HTMLElement>('.expanded-content');
      if (!extra) return;
      extra.classList.toggle('show');
      link.textContent = extra.classList.contains('show') ? 'Read Less' : 'Read More';
    });
  });

  // Bootstrap carousel (if using jQuery/Bootstrap)
  if (window.jQuery && $('#myCarousel').length) {
    $('#myCarousel').carousel({ interval: 5000, pause: 'hover', wrap: true });
  }
});
