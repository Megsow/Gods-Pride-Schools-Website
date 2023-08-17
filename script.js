document.getElementById("contact-form").addEventListener("submit", function(event) {
    event.preventDefault();
  
    // Fetch form data
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const phone_number = document.getElementById("phone_number").value;
    const message = document.getElementById("message").value;
  
    // You can perform actions with the form data here (e.g., send it to a server)
    console.log("Name:", name);
    console.log("Email:", email);
    console.log("Phone Number:", phone_number);
    console.log("Message:", message);
  
    // Optionally, you can display a success message or reset the form
    alert("Form submitted successfully!");
    document.getElementById("contactForm").reset();
  });
  
  document.addEventListener('DOMContentLoaded', function () {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
  
    navToggle.addEventListener('click', function () {
      navMenu.classList.toggle('active');
    });
  });
  
  document.addEventListener('DOMContentLoaded', function () {
    const carousel = document.querySelector('.image-carousel');
    const images = carousel.querySelectorAll('img');
    let currentImageIndex = 0;
  
    function showNextImage() {
      images[currentImageIndex].style.display = 'none';
      currentImageIndex = (currentImageIndex + 1) % images.length;
      images[currentImageIndex].style.display = 'block';
    }
  
    // Initial display
    images[currentImageIndex].style.display = 'block';
  
    // Automatically change images every 5 seconds
    setInterval(showNextImage, 5000);
  });
  
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
  });
  
  document.addEventListener('DOMContentLoaded', function () {
    const announcementCards = document.querySelectorAll('.announcement-card');
  
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
  
    // Read More functionality
    const readMoreLinks = document.querySelectorAll('.read-more-link');
  
    readMoreLinks.forEach(link => {
      link.addEventListener('click', function (event) {
        event.preventDefault();
        const card = this.closest('.announcement-card');
        card.classList.toggle('expanded');
      });
    });
  });
  
  document.addEventListener('DOMContentLoaded', function () {
    const announcementCards = document.querySelectorAll('.announcement-card');
  
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
  });
  
 
  
  document.addEventListener('DOMContentLoaded', function () {
    const announcementCards = document.querySelectorAll('.announcement-card');
  
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
  
    function animateAboutSections() {
      const aboutSections = document.querySelectorAll('.about-section');
      aboutSections.forEach(section => {
        if (isInViewport(section)) {
          section.classList.add('show');
        }
      });
    }
  
    window.addEventListener('scroll', animateAnnouncementCards);
    window.addEventListener('scroll', animateAboutSections);
  });
  
  $(document).ready(function() {
    $('.carousel').slick({
      arrows: true,
      dots: true,
      infinite: true,
      speed: 1000,
      slidesToShow: 1,
      slidesToScroll: 1,
      autoplay: true,
      autoplaySpeed: 5000
    });
  });
  
  $(document).ready(function() {
    $('.gallery').flickity({
      cellAlign: 'left',
      contain: true,
      wrapAround: true,
      autoPlay: 15000, // Autoplay interval in milliseconds (15 seconds)
      pauseAutoPlayOnHover: true
    });
  
    // Function to shuffle images
    function shuffleImages() {
      const galleryCells = $('.gallery-cell');
      for (let i = galleryCells.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        galleryCells[i].before(galleryCells[j]);
      }
    }
  
    // Shuffle images initially
    shuffleImages();
  
    // Shuffle images every 15 seconds
    setInterval(shuffleImages, 15000);
  });
  