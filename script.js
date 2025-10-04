// Handle form submission
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', event => {
    event.preventDefault();

    const formData = new FormData(contactForm);
    console.log('Name:', formData.get('name'));
    console.log('Email:', formData.get('email'));
    console.log('Message:', formData.get('message'));

    alert('Form submitted successfully!');
    contactForm.reset();
  });
}

function initNavToggle() {
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });
  }
}

function setupRevealAnimation(selector, revealClass) {
  const elements = Array.from(document.querySelectorAll(selector));
  if (!elements.length) {
    return;
  }
  function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return rect.top >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight);
  }
  function animate() {
    elements.forEach(element => {
      if (isInViewport(element)) {
        element.classList.add(revealClass);
      }
    });
  }
  window.addEventListener('scroll', animate);
  animate();
}

function initReadMoreDelegation() {
  document.addEventListener('click', event => {
    const trigger = event.target.closest('.read-more-link');
    if (!trigger) {
      return;
    }
    event.preventDefault();
    const card = trigger.closest('.announcement-card');
    const expandedContent = card?.querySelector('.expanded-content');
    if (!expandedContent) {
      return;
    }
    expandedContent.classList.toggle('show');
    trigger.textContent = expandedContent.classList.contains('show') ? 'Read Less' : 'Read More';
  });
}

function initialiseTestimonialCarousel() {
  if (typeof window.$ !== 'function') {
    return;
  }
  const $carousel = window.$('.testimonial-carousel');
  if (!$carousel.length) {
    return;
  }
  if ($carousel.hasClass('slick-initialized')) {
    $carousel.slick('unslick');
  }
  $carousel.slick({
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

function injectSiteCredit() {
  if (document.querySelector('.site-credit')) {
    return;
  }

  const wrapper = document.createElement('div');
  wrapper.className = 'site-credit';

  const inner = document.createElement('div');
  inner.className = 'site-credit__inner';

  const logo = document.createElement('img');
  logo.src = 'megsow-nation-logo.svg';
  logo.alt = 'Megsow Nation logo';
  logo.className = 'site-credit__logo';
  logo.loading = 'lazy';

  const label = document.createElement('span');
  label.className = 'site-credit__label';
  label.innerHTML = 'Website by <strong>Megsow</strong>';

  inner.append(logo, label);
  wrapper.append(inner);
  document.body?.appendChild(wrapper);
}

document.addEventListener('DOMContentLoaded', () => {
  initNavToggle();
  setupRevealAnimation('.testimonial-card', 'show');
  setupRevealAnimation('.announcement-card', 'show');
  initReadMoreDelegation();
  initialiseTestimonialCarousel();
  injectSiteCredit();
});

// Handle navigation toggle for mobile view
document.addEventListener('DOMContentLoaded', function () {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function () {
            navMenu.classList.toggle('active');
        });
    }

    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)
        );
    }

    function animateTestimonials() {
        document.querySelectorAll('.testimonial-card').forEach(card => {
            if (isInViewport(card)) {
                card.classList.add('show');
            }
        });
    }

    function animateAnnouncementCards() {
        document.querySelectorAll('.announcement-card').forEach(card => {
            if (isInViewport(card)) {
                card.classList.add('show');
            }
        });
    }

    window.addEventListener('scroll', animateTestimonials);
    window.addEventListener('scroll', animateAnnouncementCards);

    animateTestimonials();
    animateAnnouncementCards();
});

document.addEventListener('collection:hydrated', event => {
  if (event.detail?.key === 'announcements') {
    setupRevealAnimation('.announcement-card', 'show');
  }
  if (event.detail?.key === 'testimonials') {
    initialiseTestimonialCarousel();
    setupRevealAnimation('.testimonial-card', 'show');
  }
});
