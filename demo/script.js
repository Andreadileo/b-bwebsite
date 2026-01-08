/**
 * B&B La Piazzetta Del Sole
 * Premium Interactive Features
 */

// ========================================
// NAVBAR - Scroll Effect & Transparency
// ========================================

const navbar = document.querySelector('.navbar');
let lastScroll = 0;

if (navbar) {
  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;

    // Add/remove scrolled class
    if (currentScroll > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Hide navbar on scroll down, show on scroll up (optional, disabled by default)
    // Uncomment below for this behavior
    /*
    if (currentScroll > lastScroll && currentScroll > 400) {
      navbar.style.transform = 'translateY(-100%)';
    } else {
      navbar.style.transform = 'translateY(0)';
    }
    */

    lastScroll = currentScroll;
  });
}

// ========================================
// HAMBURGER MENU - Mobile Navigation
// ========================================

const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');

if (hamburger && navMenu) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');

    // Prevent body scroll when menu is open
    document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
  });

  // Close menu when clicking a link
  document.querySelectorAll('#nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navMenu.classList.remove('active');
      document.body.style.overflow = '';
    });
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
      hamburger.classList.remove('active');
      navMenu.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
}

// ========================================
// FADE-IN ANIMATIONS - Intersection Observer
// ========================================

const faders = document.querySelectorAll('.fade-in');

const fadeOptions = {
  threshold: 0.15,
  rootMargin: '0px 0px -50px 0px'
};

const fadeObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target); // Stop observing once visible
    }
  });
}, fadeOptions);

faders.forEach(el => fadeObserver.observe(el));

// ========================================
// SMOOTH SCROLL - For anchor links
// ========================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');

    if (targetId === '#') return;

    const target = document.querySelector(targetId);

    if (target) {
      e.preventDefault();

      const navHeight = navbar ? navbar.offsetHeight : 0;
      const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight - 20;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  });
});

// ========================================
// BOOKING BAR - Date Defaults
// ========================================

const checkinInput = document.getElementById('checkin');
const checkoutInput = document.getElementById('checkout');

if (checkinInput && checkoutInput) {
  // Set default dates
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date(today);
  dayAfter.setDate(dayAfter.getDate() + 2);

  // Format dates as YYYY-MM-DD
  const formatDate = (date) => date.toISOString().split('T')[0];

  checkinInput.value = formatDate(tomorrow);
  checkinInput.min = formatDate(today);

  checkoutInput.value = formatDate(dayAfter);
  checkoutInput.min = formatDate(tomorrow);

  // Update checkout min date when checkin changes
  checkinInput.addEventListener('change', () => {
    const checkinDate = new Date(checkinInput.value);
    const minCheckout = new Date(checkinDate);
    minCheckout.setDate(minCheckout.getDate() + 1);

    checkoutInput.min = formatDate(minCheckout);

    // If current checkout is before new min, update it
    if (new Date(checkoutInput.value) <= checkinDate) {
      checkoutInput.value = formatDate(minCheckout);
    }
  });
}

// ========================================
// IMAGE LAZY LOADING - Performance
// ========================================

if ('loading' in HTMLImageElement.prototype) {
  // Browser supports native lazy loading
  document.querySelectorAll('img[data-src]').forEach(img => {
    img.src = img.dataset.src;
  });
} else {
  // Fallback for older browsers
  const lazyImages = document.querySelectorAll('img[data-src]');

  const lazyLoad = (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        observer.unobserve(img);
      }
    });
  };

  const lazyObserver = new IntersectionObserver(lazyLoad, {
    rootMargin: '100px'
  });

  lazyImages.forEach(img => lazyObserver.observe(img));
}

// ========================================
// PARALLAX EFFECT - Subtle hero movement
// ========================================

const hero = document.querySelector('.hero');

if (hero && window.innerWidth > 768) {
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const heroHeight = hero.offsetHeight;

    if (scrolled < heroHeight) {
      // Subtle parallax on hero background
      hero.style.backgroundPositionY = `${scrolled * 0.3}px`;
    }
  });
}

// ========================================
// BUTTON RIPPLE EFFECT
// ========================================

document.querySelectorAll('.btn-primary, .btn-secondary, .btn-booking').forEach(button => {
  button.addEventListener('click', function (e) {
    const rect = this.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ripple = document.createElement('span');
    ripple.style.cssText = `
      position: absolute;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      transform: scale(0);
      animation: ripple 0.6s linear;
      left: ${x}px;
      top: ${y}px;
      width: 100px;
      height: 100px;
      margin-left: -50px;
      margin-top: -50px;
      pointer-events: none;
    `;

    this.style.position = 'relative';
    this.style.overflow = 'hidden';
    this.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);
  });
});

// Add ripple keyframes dynamically
const style = document.createElement('style');
style.textContent = `
  @keyframes ripple {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// ========================================
// CONSOLE BRANDING
// ========================================

console.log('%c🏡 B&B La Piazzetta Del Sole', 'font-size: 20px; font-weight: bold; color: #C9A961;');
console.log('%cBenvenuto! Sito realizzato con ❤️', 'font-size: 12px; color: #666;');