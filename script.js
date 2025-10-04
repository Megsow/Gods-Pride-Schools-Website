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

// Initialize Bootstrap carousel
$(document).ready(function () {
    if ($('#myCarousel').length > 0) {
        $('#myCarousel').carousel({
            interval: 5000,
            pause: 'hover',
            wrap: true
        });
    }
});
