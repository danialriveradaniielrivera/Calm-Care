// Calm Care Website JavaScript
// Handles mobile navigation, form validation, scroll animations, and accessibility features

(function() {
  'use strict';

  // DOM Elements
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const contactForm = document.getElementById('contactForm');
  const formSuccess = document.getElementById('form-success');

  // Initialize all functionality when DOM is loaded
  document.addEventListener('DOMContentLoaded', function() {
    initMobileNavigation();
    initSmoothScroll();
    initScrollAnimations();
    initContactForm();
    initFAQAccordions();
    initAccessibility();
  });

  // Mobile Navigation
  function initMobileNavigation() {
    if (!navToggle || !navMenu) return;

    navToggle.addEventListener('click', function() {
      const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
      
      navToggle.setAttribute('aria-expanded', !isOpen);
      navMenu.classList.toggle('open');
      
      // Trap focus in mobile menu when open
      if (!isOpen) {
        trapFocus(navMenu);
      } else {
        restoreFocus();
      }
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
      if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
        navToggle.setAttribute('aria-expanded', 'false');
        navMenu.classList.remove('open');
        restoreFocus();
      }
    });

    // Close mobile menu when pressing Escape
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && navMenu.classList.contains('open')) {
        navToggle.setAttribute('aria-expanded', 'false');
        navMenu.classList.remove('open');
        navToggle.focus();
        restoreFocus();
      }
    });

    // Close mobile menu when window resizes to desktop
    window.addEventListener('resize', function() {
      if (window.innerWidth > 768) {
        navToggle.setAttribute('aria-expanded', 'false');
        navMenu.classList.remove('open');
        restoreFocus();
      }
    });
  }

  // Smooth Scroll for anchor links
  function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
      link.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
          e.preventDefault();
          
          const headerHeight = document.querySelector('.header').offsetHeight;
          const targetPosition = targetElement.offsetTop - headerHeight - 20;
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
          
          // Focus the target element for accessibility
          setTimeout(() => {
            targetElement.focus();
          }, 800);
        }
      });
    });

    // Smooth scroll for CTA buttons to contact page
    const ctaButtons = document.querySelectorAll('.btn[href*="contact"]');
    ctaButtons.forEach(button => {
      button.addEventListener('click', function(e) {
        // Only prevent default if we're on the same page
        if (window.location.pathname === '/contact.html' || 
            window.location.pathname.endsWith('contact.html')) {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    });
  }

  // Scroll-triggered animations using Intersection Observer
  function initScrollAnimations() {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal');
          // Stop observing once revealed to improve performance
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Elements to animate on scroll
    const animatedElements = document.querySelectorAll(
      '.feature-card, .article-content, .sidebar-card, .timeline-item, .treatment-card'
    );

    animatedElements.forEach((el, index) => {
      // Add staggered delay for multiple elements
      el.style.transitionDelay = `${index * 0.1}s`;
      observer.observe(el);
    });
  }

  // Contact Form Handling
  function initContactForm() {
    if (!contactForm) return;

    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      if (validateForm()) {
        simulateFormSubmission();
      }
    });

    // Real-time validation
    const inputs = contactForm.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      input.addEventListener('blur', () => validateField(input));
      input.addEventListener('input', () => clearError(input));
    });
  }

  function validateForm() {
    let isValid = true;
    
    // Required fields
    const requiredFields = contactForm.querySelectorAll('[required]');
    requiredFields.forEach(field => {
      if (!validateField(field)) {
        isValid = false;
      }
    });

    return isValid;
  }

  function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name;
    let errorMessage = '';

    // Clear previous error
    clearError(field);

    // Check required fields
    if (field.hasAttribute('required') && !value) {
      errorMessage = `${getFieldLabel(field)} is required.`;
    }
    // Email validation
    else if (fieldName === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        errorMessage = 'Please enter a valid email address.';
      }
    }
    // Phone validation (optional but if provided should be valid)
    else if (fieldName === 'phone' && value) {
      const phoneRegex = /^[\d\s\-\+\(\)]+$/;
      if (value.length < 10 || !phoneRegex.test(value)) {
        errorMessage = 'Please enter a valid phone number.';
      }
    }
    // Message minimum length
    else if (fieldName === 'message' && value && value.length < 10) {
      errorMessage = 'Please provide a more detailed message (at least 10 characters).';
    }

    if (errorMessage) {
      showError(field, errorMessage);
      return false;
    }

    return true;
  }

  function getFieldLabel(field) {
    const label = document.querySelector(`label[for="${field.id}"]`);
    if (label) {
      return label.textContent.replace('*', '').trim();
    }
    return field.name.charAt(0).toUpperCase() + field.name.slice(1);
  }

  function showError(field, message) {
    field.setAttribute('aria-invalid', 'true');
    field.classList.add('error');
    
    const errorElement = document.getElementById(`${field.name}-error`);
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.setAttribute('aria-live', 'polite');
    }
  }

  function clearError(field) {
    field.removeAttribute('aria-invalid');
    field.classList.remove('error');
    
    const errorElement = document.getElementById(`${field.name}-error`);
    if (errorElement) {
      errorElement.textContent = '';
    }
  }

  function simulateFormSubmission() {
    const submitButton = contactForm.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    
    // Show loading state
    submitButton.textContent = 'Sending...';
    submitButton.disabled = true;
    
    // Simulate API call delay
    setTimeout(() => {
      // Hide form and show success message
      contactForm.style.display = 'none';
      formSuccess.style.display = 'block';
      
      // Scroll to success message
      formSuccess.scrollIntoView({ behavior: 'smooth', block: 'start' });
      
      // Focus on success message for accessibility
      const successHeading = formSuccess.querySelector('h3');
      if (successHeading) {
        successHeading.setAttribute('tabindex', '-1');
        successHeading.focus();
      }

      // Generate mailto link with form data
      generateMailtoLink();
      
    }, 1500);
  }

  function generateMailtoLink() {
    const formData = new FormData(contactForm);
    const name = formData.get('name');
    const email = formData.get('email');
    const phone = formData.get('phone');
    const subject = formData.get('subject');
    const message = formData.get('message');
    const preferredContact = formData.get('preferred-contact');

    let emailBody = `Name: ${name}\n`;
    emailBody += `Email: ${email}\n`;
    if (phone) emailBody += `Phone: ${phone}\n`;
    emailBody += `Preferred Contact Method: ${preferredContact}\n`;
    emailBody += `Subject: ${subject}\n\n`;
    emailBody += `Message:\n${message}`;

    const mailtoLink = `mailto:contact@calmcaredental.com?subject=Website Contact - ${subject}&body=${encodeURIComponent(emailBody)}`;
    
    // Update the mailto link in success message
    const successMailtoLink = formSuccess.querySelector('.success-contact a');
    if (successMailtoLink) {
      successMailtoLink.href = mailtoLink;
    }
  }

  // FAQ Accordions
  function initFAQAccordions() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
      const summary = item.querySelector('summary');
      if (summary) {
        summary.addEventListener('click', function(e) {
          // Let the browser handle the default details/summary behavior
          // but add ARIA attributes for better accessibility
          setTimeout(() => {
            const isOpen = item.hasAttribute('open');
            summary.setAttribute('aria-expanded', isOpen);
          }, 10);
        });

        // Keyboard support
        summary.addEventListener('keydown', function(e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            summary.click();
          }
        });

        // Set initial ARIA state
        summary.setAttribute('aria-expanded', item.hasAttribute('open'));
      }
    });
  }

  // Accessibility improvements
  function initAccessibility() {
    // Add skip link functionality
    const skipLink = document.querySelector('.skip-link');
    if (skipLink) {
      skipLink.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.setAttribute('tabindex', '-1');
          target.focus();
        }
      });
    }

    // Improve focus management for modal-like interactions
    document.addEventListener('keydown', function(e) {
      // Handle Escape key for closing modals
      if (e.key === 'Escape') {
        const openMenu = document.querySelector('.nav-menu.open');
        if (openMenu) {
          const toggle = document.querySelector('.nav-toggle');
          toggle.click();
        }
      }
    });

    // Announce page changes for screen readers
    announcePageChange();
  }

  function announcePageChange() {
    const pageTitle = document.title;
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = `Page loaded: ${pageTitle}`;
    
    document.body.appendChild(announcement);
    
    // Remove announcement after screen readers have processed it
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }

  // Focus trap utility for mobile menu
  function trapFocus(element) {
    const focusableElements = element.querySelectorAll(
      'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length === 0) return;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    // Focus first element
    firstElement.focus();
    
    function handleTab(e) {
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }
    
    document.addEventListener('keydown', handleTab);
    
    // Store cleanup function
    element._focusTrapCleanup = () => {
      document.removeEventListener('keydown', handleTab);
    };
  }

  function restoreFocus() {
    const menuElement = document.querySelector('.nav-menu');
    if (menuElement && menuElement._focusTrapCleanup) {
      menuElement._focusTrapCleanup();
      delete menuElement._focusTrapCleanup;
    }
  }

  // Utility function for debouncing
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Performance optimization: throttle scroll events
  let ticking = false;
  function requestTick() {
    if (!ticking) {
      requestAnimationFrame(updateScrollState);
      ticking = true;
    }
  }

  function updateScrollState() {
    // Add header background on scroll
    const header = document.querySelector('.header');
    if (header) {
      if (window.scrollY > 100) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
    ticking = false;
  }

  // Listen for scroll events
  window.addEventListener('scroll', requestTick);

  // Handle resize events
  window.addEventListener('resize', debounce(() => {
    // Reset mobile menu state on resize
    if (window.innerWidth > 768) {
      const navToggle = document.querySelector('.nav-toggle');
      const navMenu = document.querySelector('.nav-menu');
      if (navToggle && navMenu) {
        navToggle.setAttribute('aria-expanded', 'false');
        navMenu.classList.remove('open');
        restoreFocus();
      }
    }
  }, 250));

  // Handle visibility changes (tab switching)
  document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
      // Page is now hidden - pause any animations or timers
    } else {
      // Page is now visible - resume any paused activities
    }
  });

  // Error handling for async operations
  window.addEventListener('error', function(e) {
    console.error('JavaScript error:', e.error);
    // Could implement user-friendly error messages here
  });

  // Service worker registration (if needed for PWA features)
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      // Register service worker if available
      // navigator.serviceWorker.register('/sw.js');
    });
  }

})();
