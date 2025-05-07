// Handle form submission
document.getElementById("contact-form")?.addEventListener("submit", function(event) {
    event.preventDefault();
  
    // Fetch form data
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const message = document.getElementById("message").value;
  
    // Log form data
    console.log("Name:", name);
    console.log("Email:", email);
    console.log("Message:", message);
  
    // Optionally, display a success message or reset the form
    alert("Form submitted successfully!");
    this.reset(); // Reset form directly using 'this'
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
});

// Animate testimonials when they come into view
document.addEventListener('DOMContentLoaded', function () {
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    
    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)
        );
    }
  
    function animateTestimonials() {
        testimonialCards.forEach(card => {
            if (isInViewport(card)) {
                card.classList.add('show');
            }
        });
    }
  
    window.addEventListener('scroll', animateTestimonials);
    animateTestimonials(); // Run on page load
});

// Animate announcement cards when they come into view and handle "Read More" functionality
document.addEventListener('DOMContentLoaded', function () {
    const announcementCards = document.querySelectorAll('.announcement-card');
    const readMoreLinks = document.querySelectorAll('.read-more-link');
  
    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)
        );
    }
  
    function animateAnnouncementCards() {
        announcementCards.forEach(card => {
            if (isInViewport(card)) {
                card.classList.add('show');
            }
        });
    }
  
    window.addEventListener('scroll', animateAnnouncementCards);
    animateAnnouncementCards(); // Run on page load
  
    // Handle "Read More" functionality
    readMoreLinks.forEach(link => {
        link.addEventListener('click', function (event) {
            event.preventDefault();
            const card = this.closest('.announcement-card');
            const expandedContent = card.querySelector('.expanded-content');

            if (expandedContent) {
                expandedContent.classList.toggle('show');
                this.textContent = expandedContent.classList.contains('show') ? 'Read Less' : 'Read More';
            }
        });
    });
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
