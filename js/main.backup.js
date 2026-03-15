/* ============================================
   CLÍNICA CARLOS MORILLO - Main JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ---- Navbar Scroll Effect ----
  const navbar = document.querySelector('.navbar');
  const handleNavScroll = () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
      navbar.classList.remove('transparent');
    } else {
      navbar.classList.remove('scrolled');
      if (navbar.dataset.transparent === 'true') {
        navbar.classList.add('transparent');
      }
    }
  };
  handleNavScroll();
  window.addEventListener('scroll', handleNavScroll);

  // ---- Mobile Menu ----
  const hamburger = document.querySelector('.nav-hamburger');
  const mobileMenu = document.querySelector('.nav-mobile');
  const mobileLinks = document.querySelectorAll('.nav-mobile .nav-link');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      mobileMenu.classList.toggle('active');
      document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });

    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  // ---- Scroll Reveal Animations ----
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach(el => {
    revealObserver.observe(el);
  });

  // ---- Stagger children with delay ----
  document.querySelectorAll('[data-stagger]').forEach(parent => {
    const children = parent.querySelectorAll('.reveal, .reveal-scale');
    children.forEach((child, i) => {
      child.style.transitionDelay = `${i * 0.1}s`;
    });
  });

  // ---- Smooth Scroll for anchor links ----
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = parseInt(navbar.offsetHeight) + 20;
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // ---- Active Nav Link ----
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const linkPage = link.getAttribute('href')?.split('/').pop();
    if (linkPage === currentPage || (currentPage === '' && linkPage === 'index.html')) {
      link.classList.add('active');
    }
  });

  // ---- Counter Animation ----
  const counters = document.querySelectorAll('[data-counter]');
  if (counters.length) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = parseInt(entry.target.dataset.counter);
          const suffix = entry.target.dataset.suffix || '';
          const prefix = entry.target.dataset.prefix || '';
          let current = 0;
          const increment = target / 60;
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              current = target;
              clearInterval(timer);
            }
            entry.target.textContent = prefix + Math.floor(current) + suffix;
          }, 16);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(counter => counterObserver.observe(counter));
  }

  // ---- Form Handling ----
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const formData = new FormData(contactForm);
      const name = formData.get('name');
      const phone = formData.get('phone');
      const message = formData.get('message');
      
      // Show success silently (Simulate backend submission)
      const btn = contactForm.querySelector('.btn');
      const originalHTML = btn.innerHTML;
      btn.textContent = '¡Solicitud enviada!';
      btn.style.background = '#25D366';
      
      contactForm.reset();
      
      setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.style.background = '';
      }, 4000);
    });
  }
  // ---- Reviews Carousel ----
  const reviewsCarousel = document.querySelector('.reviews-carousel');
  if (reviewsCarousel) {
    const slides = document.querySelectorAll('.review-slide');
    const dots = document.querySelectorAll('.reviews-dot');
    const prevBtn = document.getElementById('reviews-prev');
    const nextBtn = document.getElementById('reviews-next');
    let currentSlide = 0;
    const maxSlide = slides.length - 1;

    const updateSlider = (index) => {
      slides.forEach((slide) => {
        slide.classList.remove('active');
        slide.style.transform = `translateX(-${index * 100}%)`;
      });
      if (dots.length > 0) {
        dots.forEach(dot => dot.classList.remove('active'));
      }
      
      slides[index].classList.add('active');
      if (dots[index]) {
        dots[index].classList.add('active');
      }
    };

    // Inicializar posiciones
    updateSlider(0);

    if (prevBtn && nextBtn) {
      prevBtn.addEventListener('click', () => {
        currentSlide = currentSlide === 0 ? maxSlide : currentSlide - 1;
        updateSlider(currentSlide);
      });

      nextBtn.addEventListener('click', () => {
        currentSlide = currentSlide === maxSlide ? 0 : currentSlide + 1;
        updateSlider(currentSlide);
      });
    }

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        currentSlide = index;
        updateSlider(currentSlide);
      });
    });
    
    // Auto advance
    let autoplayInterval = setInterval(() => {
      currentSlide = currentSlide === maxSlide ? 0 : currentSlide + 1;
      updateSlider(currentSlide);
    }, 6000);
    
    reviewsCarousel.addEventListener('mouseenter', () => clearInterval(autoplayInterval));
    reviewsCarousel.addEventListener('mouseleave', () => {
      autoplayInterval = setInterval(() => {
        currentSlide = currentSlide === maxSlide ? 0 : currentSlide + 1;
        updateSlider(currentSlide);
      }, 6000);
    });
  }

  // ---- Parallax subtle effect on hero ----
  const hero = document.querySelector('.hero');
  if (hero) {
    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY;
      if (scrolled < window.innerHeight) {
        hero.style.setProperty('--scroll', scrolled * 0.3 + 'px');
      }
    });
  }

});
