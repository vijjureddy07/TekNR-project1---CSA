/* =============================================================================
   PURE FIELDS - MAIN JAVASCRIPT
   =============================================================================

   Project: Local Farm & Community Supported Agriculture (CSA) Website
   Description: A responsive, accessible, and SEO-friendly website for organic farms
   Version: 1.0.0

   Table of Contents:
   ------------------
   1. Dark Mode Toggle - Handles light/dark theme switching with localStorage
   2. RTL Toggle - Handles right-to-left layout direction switching
   3. Hamburger Menu Toggle - Mobile navigation menu functionality
   4. Smooth Scrolling - Animated scroll to anchor links
   5. Legacy About Section Animation - Intersection Observer for the older homepage about block
   6. Testimonial Slider (Home Page 1) - Client testimonials carousel
   7. Testimonial Slider (Home Page 2) - Horizontal testimonial track
   8. Transparency Tabs - Tabbed content interface for Home Page 1
   9. Newsletter Form Validation - Newsletter signup validation
   10. Keyboard Navigation - Enhanced keyboard accessibility
   11. Loading States - Skeleton loaders and lazy loading images
   12. Contact Form Validation - Full contact form validation
   13. Product Details Seasonal Tabs - Accessible seasonal switcher for the detail page
   14. Product Details Content Hydration - Reusable single-page content for all box types

   Dependencies:
   - Google Material Icons (loaded in HTML)
   - Font Awesome 6.5.1 (loaded in HTML)
   - Google Fonts: Poppins & Lora (loaded in HTML)

   Browser Support: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+

================================================================================ */

/* =============================================================================
   PRODUCTS PAGE NOTE
   =============================================================================
   The products page does not require page-specific JavaScript right now.
   Accessibility and behavior are handled with:
   - native <details>/<summary> for the FAQ accordion
   - standard anchor links for CTAs and section jumps
   - shared theme, RTL, and navigation logic from this file
================================================================================ */

/* =============================================================================
   1. DARK MODE TOGGLE
   =============================================================================
   Purpose: Toggle between light and dark themes
   Storage: Saves preference to localStorage for persistence
   Features:
   - Respects system preference on first visit
   - Toggles CSS class on html element
   - Updates theme icon dynamically
   - Listens for system theme changes

   Usage:
   <button id="theme-toggle" aria-label="Toggle dark/light theme">
     <i class="material-icons">light_mode</i>
   </button>
*/

document.addEventListener('DOMContentLoaded', function() {
    // Remove skeleton prefetch state on load
    document.body.classList.remove('prefetch-loading');


    const themeToggle = document.getElementById('theme-toggle');
    const html = document.documentElement;

    // Check for system preference
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

    // Initialize theme based on localStorage or system preference
    if (localStorage.theme === 'dark' || (!localStorage.theme && prefersDarkScheme.matches)) {
        html.classList.add('dark');
    } else {
        html.classList.remove('dark');
    }

    /**
     * Updates the theme toggle icon based on current theme
     * @function updateThemeIcon
     * @returns {void}
     */
    function syncThemeControl(button, isDark) {
        if (!button) return;

        const icon = button.querySelector('i');
        button.setAttribute('aria-pressed', String(isDark));

        if (icon) {
            icon.textContent = isDark ? 'dark_mode' : 'light_mode';
        }
    }

    function updateThemeControls() {
        const isDark = html.classList.contains('dark');

        document.querySelectorAll('#theme-toggle, [data-theme-proxy]').forEach(function(button) {
            syncThemeControl(button, isDark);
        });

        document.dispatchEvent(new CustomEvent('themecontrolchange', { detail: { isDark: isDark } }));
    }

    // Initial icon update
    updateThemeControls();

    // Theme toggle click handler
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const isDark = html.classList.toggle('dark');
            localStorage.theme = isDark ? 'dark' : 'light';
            updateThemeControls();
        });
    }

    // Listen for system theme changes
    prefersDarkScheme.addEventListener('change', function(e) {
        if (!localStorage.theme) {
            html.classList.toggle('dark', e.matches);
            updateThemeControls();
        }
    });
});

/* =============================================================================
   2. RTL TOGGLE
   =============================================================================
   Purpose: Toggle between left-to-right and right-to-left layouts
   Storage: Saves preference to localStorage
   Features:
   - Switches dir attribute on html element
   - Works with CSS for RTL layout adjustments

   Usage:
   <button id="rtl-toggle" aria-label="Toggle right-to-left layout">
     <span class="nav-btn__label">RTL</span>
   </button>

   Note: Add rtl.css stylesheet for complete RTL support
*/

document.addEventListener('DOMContentLoaded', function() {
    const rtlToggle = document.getElementById('rtl-toggle');
    const html = document.documentElement;

    function ensureDirectionLabel(button) {
        if (!button) return null;

        button.classList.add('nav-btn--text');

        let label = button.querySelector('.nav-btn__label');
        if (!label) {
            button.innerHTML = '<span class="nav-btn__label">RTL</span>';
            label = button.querySelector('.nav-btn__label');
        }

        return label;
    }

    /**
     * Syncs the RTL toggle state with the current document direction.
     * @function updateDirectionState
     * @returns {void}
     */
    function syncDirectionControl(button, isRtl) {
        if (!button) return;
        const label = ensureDirectionLabel(button);
        button.setAttribute('aria-pressed', String(isRtl));

        if (label) {
            label.textContent = isRtl ? 'LTR' : 'RTL';
        }
    }

    function updateDirectionState() {
        const isRtl = html.getAttribute('dir') === 'rtl';

        document.querySelectorAll('#rtl-toggle, [data-rtl-proxy]').forEach(function(button) {
            syncDirectionControl(button, isRtl);
        });
    }

    // Restore saved direction preference
    const savedDirection = localStorage.getItem('direction');
    if (savedDirection) {
        html.setAttribute('dir', savedDirection);
    }
    updateDirectionState();

    // RTL toggle click handler
    if (rtlToggle) {
        rtlToggle.addEventListener('click', function() {
            const currentDir = html.getAttribute('dir');
            const newDir = currentDir === 'rtl' ? 'ltr' : 'rtl';
            html.setAttribute('dir', newDir);
            localStorage.setItem('direction', newDir);
            updateDirectionState();
            document.dispatchEvent(new CustomEvent('directionchange', { detail: { dir: newDir } }));
        });
    }
});

/* =============================================================================
   3. HAMBURGER MENU TOGGLE
   =============================================================================
   Purpose: Toggle mobile navigation menu
   Features:
   - Shows/hides mobile menu on click
   - Closes menu when clicking outside
   - Closes menu when clicking a menu link
   - Updates toggle icon between menu and close icons

   Usage:
   <button id="mobile-menu-toggle" aria-label="Toggle mobile menu">
     <i class="material-icons">menu</i>
   </button>
   <ul id="mobile-menu" class="mobile-menu hidden">...</ul>
*/

document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('mobile-menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const dropdowns = document.querySelectorAll('.dropdown');
    const nav = document.querySelector('.site-nav');
    const themeToggle = document.getElementById('theme-toggle');
    const rtlToggle = document.getElementById('rtl-toggle');
    const navCart = nav ? nav.querySelector('.nav-cart') : null;
    const loginLink = nav ? nav.querySelector('.login-btn') : null;
    const html = document.documentElement;

    function syncUtilityButtons() {
        const isDark = html.classList.contains('dark');
        const isRtl = html.getAttribute('dir') === 'rtl';

        document.querySelectorAll('[data-theme-proxy]').forEach(function(button) {
            button.setAttribute('aria-pressed', String(isDark));
            const icon = button.querySelector('i');
            if (icon) {
                icon.textContent = isDark ? 'dark_mode' : 'light_mode';
            }
        });

        document.querySelectorAll('[data-rtl-proxy]').forEach(function(button) {
            button.classList.add('nav-btn--text');
            button.setAttribute('aria-pressed', String(isRtl));
            const label = button.querySelector('.nav-btn__label');
            if (label) {
                label.textContent = isRtl ? 'LTR' : 'RTL';
            }
        });
    }

    function buildMobileUtilityMenu() {
        if (!mobileMenu) return;

        mobileMenu.querySelectorAll('a[href*="login.html"]').forEach(function(anchor) {
            const listItem = anchor.parentElement;
            if (listItem && listItem.parentElement === mobileMenu) {
                listItem.remove();
            }
        });

        let utilityItem = mobileMenu.querySelector('.mobile-menu__utility-item');
        if (!utilityItem) {
            utilityItem = document.createElement('li');
            utilityItem.className = 'mobile-menu__utility-item';
            utilityItem.setAttribute('role', 'none');
            utilityItem.innerHTML = [
                '<div class="mobile-menu__utility">',
                '  <div class="mobile-menu__utility-buttons">',
                '    <button type="button" class="nav-btn mobile-menu__utility-btn" data-theme-proxy aria-label="Toggle dark/light theme" aria-pressed="false">',
                '      <i class="material-icons" aria-hidden="true">light_mode</i>',
                '    </button>',
                '    <button type="button" class="nav-btn mobile-menu__utility-btn nav-btn--text" data-rtl-proxy aria-label="Toggle right-to-left layout" aria-pressed="false">',
                '      <span class="nav-btn__label">RTL</span>',
                '    </button>',
                '  </div>',
                '</div>'
            ].join('');
            mobileMenu.appendChild(utilityItem);
        }

        const utility = utilityItem.querySelector('.mobile-menu__utility');
        if (!utility) return;

        let cartItem = mobileMenu.querySelector('.mobile-menu__cart-item');
        if (!cartItem && navCart) {
            cartItem = document.createElement('li');
            cartItem.className = 'mobile-menu__cart-item';
            cartItem.setAttribute('role', 'none');
            cartItem.innerHTML = '<a href="' + (navCart.getAttribute('href') || '#') + '" role="menuitem">Cart</a>';
            mobileMenu.appendChild(cartItem);
        }

        let loginItem = mobileMenu.querySelector('.mobile-menu__login-item');
        if (!loginItem && loginLink) {
            loginItem = document.createElement('li');
            loginItem.className = 'mobile-menu__login-item';
            loginItem.setAttribute('role', 'none');
            loginItem.innerHTML = '<a href="' + (loginLink.getAttribute('href') || '#') + '" role="menuitem">' + (loginLink.textContent.trim() || 'Login') + '</a>';
            mobileMenu.appendChild(loginItem);
        }

        utility.querySelectorAll('[data-theme-proxy]').forEach(function(button) {
            button.addEventListener('click', function() {
                if (themeToggle) {
                    themeToggle.click();
                }
            });
        });

        utility.querySelectorAll('[data-rtl-proxy]').forEach(function(button) {
            button.addEventListener('click', function() {
                if (rtlToggle) {
                    rtlToggle.click();
                }
            });
        });

        syncUtilityButtons();
    }

    function closeDropdowns() {
        dropdowns.forEach(function(dropdown) {
            dropdown.classList.remove('is-open');
            const trigger = dropdown.querySelector('a[aria-haspopup="true"]');
            if (trigger) {
                trigger.setAttribute('aria-expanded', 'false');
            }
        });
    }

    if (menuToggle && mobileMenu) {
        buildMobileUtilityMenu();

        menuToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            mobileMenu.classList.toggle('hidden');
            const expanded = !mobileMenu.classList.contains('hidden');
            menuToggle.setAttribute('aria-expanded', String(expanded));

            const icon = menuToggle.querySelector('i');
            if (icon) {
                icon.textContent = expanded ? 'close' : 'menu';
            }
        });

        // Close when clicking outside
        document.addEventListener('click', function(e) {
            if (!menuToggle.contains(e.target) && !mobileMenu.contains(e.target)) {
                if (!mobileMenu.classList.contains('hidden')) {
                    mobileMenu.classList.add('hidden');
                    menuToggle.setAttribute('aria-expanded', 'false');
                    closeDropdowns();
                    const icon = menuToggle.querySelector('i');
                    if (icon) {
                        icon.textContent = 'menu';
                    }
                }
            }
        });

        // Close when clicking menu link
        const menuLinks = mobileMenu.querySelectorAll('a:not([aria-haspopup="true"])');
        menuLinks.forEach(function(link) {
            link.addEventListener('click', function() {
                mobileMenu.classList.add('hidden');
                menuToggle.setAttribute('aria-expanded', 'false');
                closeDropdowns();
                const icon = menuToggle.querySelector('i');
                if (icon) {
                    icon.textContent = 'menu';
                }
            });
        });
    }

    dropdowns.forEach(function(dropdown) {
        const trigger = dropdown.querySelector('a[aria-haspopup="true"]');
        if (!trigger) return;

        trigger.addEventListener('click', function(e) {
            if (trigger.getAttribute('href') === '#') {
                e.preventDefault();
            }

            const isMobileDropdown = Boolean(trigger.closest('#mobile-menu'));
            if (!isMobileDropdown) return;

            const isOpen = dropdown.classList.contains('is-open');
            closeDropdowns();
            dropdown.classList.toggle('is-open', !isOpen);
            trigger.setAttribute('aria-expanded', String(!isOpen));
        });
    });

    document.addEventListener('themecontrolchange', syncUtilityButtons);
    document.addEventListener('directionchange', syncUtilityButtons);
});

/* =============================================================================
   3A. SHARED FOOTER LINK ENHANCEMENTS
   =============================================================================
   Purpose: Keep legal links consistent across repeated static footers.
============================================================================= */

document.addEventListener('DOMContentLoaded', function() {
    const supportColumns = Array.from(document.querySelectorAll('.farm-footer .links-col')).filter(function(column) {
        const heading = column.querySelector('h3');
        return heading && heading.textContent.trim().toLowerCase() === 'support';
    });

    if (supportColumns.length === 0) return;

    const isPublicPage = window.location.pathname.indexOf('/pages/public/') !== -1;
    const publicPrefix = isPublicPage ? '' : '../public/';
    const legalLinks = [
        { href: publicPrefix + 'privacy-policy.html', label: 'Privacy Policy' },
        { href: publicPrefix + 'terms-and-conditions.html', label: 'Terms & Conditions' }
    ];

    supportColumns.forEach(function(column) {
        const list = column.querySelector('ul');
        if (!list) return;

        legalLinks.forEach(function(linkData) {
            const existingLink = Array.from(list.querySelectorAll('a')).find(function(anchor) {
                return anchor.textContent.trim() === linkData.label;
            });

            if (existingLink) return;

            const item = document.createElement('li');
            const anchor = document.createElement('a');
            anchor.href = linkData.href;
            anchor.textContent = linkData.label;
            item.appendChild(anchor);
            list.appendChild(item);
        });
    });
});

/* =============================================================================
   4. SMOOTH SCROLLING
=============================================================================
   Purpose: Animate scroll to anchor links
   Features:
   - Smooth scroll behavior for internal links
   - Closes mobile menu when navigating

   Usage:
   <a href="#section-id">Scroll to Section</a>
*/

document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
        anchor.addEventListener('click', function(e) {
            const targetSelector = this.getAttribute('href');
            if (!targetSelector || targetSelector === '#') {
                return;
            }

            const target = document.querySelector(targetSelector);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                const mobileMenu = document.getElementById('mobile-menu');
                if (mobileMenu) {
                    mobileMenu.classList.add('hidden');
                }
            }
        });
    });
});

/* =============================================================================
   4A. FORM VALIDATION HELPERS
   =============================================================================
   Purpose: Provide friendly inline validation for newsletter and contact forms.
   Features:
   - Prevents submit when invalid
   - Surfaces the native validation message in a nearby error span
   - Adds aria-live updates for screen readers
============================================================================= */

document.addEventListener('DOMContentLoaded', function() {
    const forms = document.querySelectorAll('.newsletter-form, .contact-form, .auth-form');

    forms.forEach(function(form) {
        const emailInput = form.querySelector('input[type="email"]');
        const errorEl =
            form.querySelector('.error-message') ||
            form.querySelector('.form-error') ||
            form.querySelector('[aria-live]');

        function showError(message) {
            if (!errorEl) return;
            errorEl.textContent = message;
            errorEl.classList.toggle('is-visible', Boolean(message));
        }

        if (emailInput) {
            emailInput.addEventListener('input', function() {
                if (this.validity.valid) {
                    showError('');
                    this.classList.remove('input-error');
                }
            });
        }

        form.addEventListener('submit', function(e) {
            if (emailInput && !emailInput.checkValidity()) {
                e.preventDefault();
                emailInput.classList.add('input-error');
                showError(emailInput.validationMessage || 'Please enter a valid email.');
                emailInput.focus();
            } else {
                showError('');
            }
        });
    });
});

/* =============================================================================
   5. LEGACY ABOUT SECTION ANIMATION
=============================================================================
   Purpose: Animate the older homepage-style about block when it scrolls into view
   Features:
   - Uses Intersection Observer API
   - Triggers animations with staggered delays
   - Only animates once (no repeat on scroll up)

   Note:
   - The current about.html page uses static semantic sections and does not require
     page-specific JavaScript.

   Usage:
   <section class="about-section">
     <img class="about-img-1">
     <img class="about-img-2">
     <div class="about-content">...</div>
   </section>
*/

document.addEventListener('DOMContentLoaded', function() {
    const aboutSection = document.querySelector('.about-section');
    const animatedItems = aboutSection ? aboutSection.querySelectorAll(
        '.about-img-1, .about-img-2, .about-img-3, .about-content'
    ) : [];

    if (aboutSection && animatedItems.length > 0) {
        const observer = new IntersectionObserver(
            function(entries) {
                entries.forEach(function(entry) {
                    if (!entry.isIntersecting) {
                        return;
                    }

                    animatedItems.forEach(function(item, index) {
                        setTimeout(function() {
                            item.classList.add('is-visible');
                        }, index * 120);
                    });

                    observer.unobserve(entry.target);
                });
            },
            {
                threshold: 0.2
            }
        );

        observer.observe(aboutSection);
    }
});

/* =============================================================================
   6. TESTIMONIAL SLIDER (Home Page 1)
   =============================================================================
   Purpose: Client testimonials carousel for Home Page 1
   Features:
   - Previous/Next navigation buttons
   - Wraps around at first/last slide
   - Keyboard accessible

   Usage:
   <div class="testimonial-slider">
     <div class="testimonial-slide active">Slide 1</div>
     <div class="testimonial-slide">Slide 2</div>
     <div class="testimonial-slide">Slide 3</div>
   </div>
   <button class="testimonial-prev">Previous</button>
   <button class="testimonial-next">Next</button>
*/

document.addEventListener('DOMContentLoaded', function() {
    const testimonialSlides = document.querySelectorAll('.testimonial-slide');
    const prevBtns = document.querySelectorAll('.testimonial-prev');
    const nextBtns = document.querySelectorAll('.testimonial-next');

    if (testimonialSlides.length > 0) {
        let currentSlide = 0;

        /**
         * Displays the slide at the specified index
         * @function showSlide
         * @param {number} index - Index of the slide to show
         * @returns {void}
         */
        function showSlide(index) {
            // Wrap around
            if (index < 0) index = testimonialSlides.length - 1;
            if (index >= testimonialSlides.length) index = 0;

            testimonialSlides.forEach(function(slide) {
                slide.classList.remove('active');
            });

            testimonialSlides[index].classList.add('active');
            currentSlide = index;
        }

        prevBtns.forEach(function(btn) {
            btn.addEventListener('click', function() {
                showSlide(currentSlide - 1);
            });
        });

        nextBtns.forEach(function(btn) {
            btn.addEventListener('click', function() {
                showSlide(currentSlide + 1);
            });
        });
    }
});

/* =============================================================================
   7. TESTIMONIAL SLIDER (Home Page 2)
   =============================================================================
   Purpose: Client testimonials carousel for Home Page 2
   Features:
   - Horizontal sliding track
   - Previous/Next navigation buttons
   - Auto-wraps at ends

   Usage:
   <div data-testimonial-slider>
     <div class="testimonials-slider__track">
       <div class="testimonial-card">...</div>
     </div>
   </div>
*/

document.addEventListener('DOMContentLoaded', function() {
    const slider = document.querySelector('[data-testimonial-slider]');
    if (!slider) return;

    const track = slider.querySelector('.testimonials-slider__track');
    const slides = track ? Array.from(track.children) : [];
    const nextButton = document.querySelector('.testimonials-section__arrow--next');
    const prevButton = document.querySelector('.testimonials-section__arrow--prev');

    if (slides.length === 0) return;

    let currentIndex = 0;

    /**
     * Update slider position
     * @function updateSlider
     * @returns {void}
     */
    function updateSlider() {
        if (track) {
            const isRTL = document.documentElement.getAttribute('dir') === 'rtl';
            const offset = currentIndex * 100;
            track.style.transform = isRTL
                ? 'translateX(' + offset + '%)'
                : 'translateX(-' + offset + '%)';
        }
    }

    /**
     * Go to next slide
     * @function goToNext
     * @returns {void}
     */
    function goToNext() {
        currentIndex = (currentIndex + 1) % slides.length;
        updateSlider();
    }

    /**
     * Go to previous slide
     * @function goToPrev
     * @returns {void}
     */
    function goToPrev() {
        currentIndex = (currentIndex - 1 + slides.length) % slides.length;
        updateSlider();
    }

    // Attach event listeners
    if (nextButton) {
        nextButton.addEventListener('click', goToNext);
    }
    if (prevButton) {
        prevButton.addEventListener('click', goToPrev);
    }

    document.addEventListener('directionchange', updateSlider);
});

/* =============================================================================
   8. TRANSPARENCY TABS
   =============================================================================
   Purpose: Tabbed interface for transparency section (Home Page 1)
   Features:
   - Click to switch tabs
   - Updates aria-selected for accessibility
   - Keyboard navigation support

   Usage:
   <div class="transparency-tabs">
     <button class="tab-btn active" data-tab="1">Tab 1</button>
     <button class="tab-btn" data-tab="2">Tab 2</button>
   </div>
   <div class="tab-pane active" data-content="1">Content 1</div>
   <div class="tab-pane" data-content="2">Content 2</div>
*/

document.addEventListener('DOMContentLoaded', function() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    if (tabBtns.length > 0 && tabPanes.length > 0) {
        tabBtns.forEach(function(btn) {
            btn.addEventListener('click', function() {
                const tabId = this.getAttribute('data-tab');

                // Remove active class from all buttons and panes
                tabBtns.forEach(function(b) {
                    b.classList.remove('active');
                    b.setAttribute('aria-selected', 'false');
                });
                tabPanes.forEach(function(p) {
                    p.classList.remove('active');
                });

                // Add active class to clicked button and corresponding pane
                this.classList.add('active');
                this.setAttribute('aria-selected', 'true');

                const targetPane = document.querySelector('.tab-pane[data-content="' + tabId + '"]');
                if (targetPane) {
                    targetPane.classList.add('active');
                }
            });
        });
    }
});

/* =============================================================================
   9. NEWSLETTER FORM VALIDATION
   =============================================================================
   Purpose: Validate newsletter signup form
   Features:
   - Real-time email validation on input
   - Form submission validation
   - Visual feedback (success/error states)
   - Accessible error messages with ARIA

   Usage:
   <form id="newsletter-form">
     <input type="email" id="newsletter-email" required>
     <span id="email-error" role="alert"></span>
     <button type="submit">Subscribe</button>
   </form>
*/

document.addEventListener('DOMContentLoaded', function() {
    const newsletterForm = document.getElementById('newsletter-form');
    const emailInput = document.getElementById('newsletter-email');
    const emailError = document.getElementById('email-error');

    // Email validation regex - RFC 5322 compliant pattern
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    /**
     * Validates an email address format
     * @function validateEmail
     * @param {string} email - Email address to validate
     * @returns {boolean} - True if valid, false otherwise
     */
    function validateEmail(email) {
        return emailRegex.test(email);
    }

    /**
     * Shows error state and message
     * @function showError
     * @param {string} message - Error message to display
     * @returns {void}
     */
    function showError(message) {
        if (emailError) {
            emailError.textContent = message;
        }
        if (emailInput) {
            emailInput.classList.add('error');
            emailInput.classList.remove('valid');
        }
    }

    /**
     * Shows success state
     * @function showSuccess
     * @returns {void}
     */
    function showSuccess() {
        if (emailError) {
            emailError.textContent = '';
        }
        if (emailInput) {
            emailInput.classList.remove('error');
            emailInput.classList.add('valid');
        }
    }

    /**
     * Clears all validation states
     * @function clearValidation
     * @returns {void}
     */
    function clearValidation() {
        if (emailError) {
            emailError.textContent = '';
        }
        if (emailInput) {
            emailInput.classList.remove('error', 'valid');
        }
    }

    if (newsletterForm && emailInput) {
        // Real-time validation on input
        emailInput.addEventListener('input', function() {
            const email = this.value.trim();

            if (email === '') {
                clearValidation();
                return;
            }

            if (validateEmail(email)) {
                showSuccess();
            } else {
                showError('Please enter a valid email address');
            }
        });

        // Form submission validation
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const email = emailInput.value.trim();

            if (email === '') {
                showError('Email is required');
                emailInput.focus();
                return;
            }

            if (!validateEmail(email)) {
                showError('Please enter a valid email address (e.g., name@example.com)');
                emailInput.focus();
                return;
            }

            // If validation passes, show success message
            showSuccess();

            const formWrapper = newsletterForm.parentElement;
            const successMsg = document.createElement('div');
            successMsg.className = 'form-success';
            successMsg.setAttribute('role', 'alert');
            successMsg.innerHTML = '<i class="material-icons" aria-hidden="true">check_circle</i> Thank you for subscribing! You will receive our latest updates.';

            // Remove any existing success messages
            const existingSuccess = formWrapper.querySelector('.form-success');
            if (existingSuccess) {
                existingSuccess.remove();
            }

            formWrapper.appendChild(successMsg);

            // Reset form
            newsletterForm.reset();

            // Remove success message after 5 seconds
            setTimeout(function() {
                successMsg.remove();
                clearValidation();
            }, 5000);
        });

        // Clear error when user starts typing again
        emailInput.addEventListener('keydown', function() {
            if (emailInput.classList.contains('error')) {
                clearValidation();
            }
        });
    }
});

/* =============================================================================
   10. KEYBOARD NAVIGATION
   =============================================================================
   Purpose: Enhanced keyboard accessibility
   Features:
   - Dropdown menus open on Enter/Space
   - Dropdown menus close on Escape
   - Tab navigation with arrow keys for tabs
   - Home/End key support for tab list

   Usage: Automatically applied to elements with proper ARIA attributes
*/

document.addEventListener('DOMContentLoaded', function() {
    // Make dropdowns keyboard accessible
    const dropdowns = document.querySelectorAll('.dropdown');

    dropdowns.forEach(function(dropdown) {
        const link = dropdown.querySelector('a[aria-haspopup="true"]');
        const menu = dropdown.querySelector('.dropdown-menu');

        if (link && menu) {
            // Open dropdown on Enter or Space
            link.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const isExpanded = link.getAttribute('aria-expanded') === 'true';
                    dropdown.classList.toggle('is-open', !isExpanded);
                    link.setAttribute('aria-expanded', String(!isExpanded));
                }
            });

            // Close dropdown on Escape
            menu.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') {
                    dropdown.classList.remove('is-open');
                    link.setAttribute('aria-expanded', 'false');
                    link.focus();
                }
            });
        }
    });

    // Add keyboard support for tabs
    const tabs = document.querySelectorAll('.tab-btn');

    tabs.forEach(function(tab) {
        tab.addEventListener('keydown', function(e) {
            const tabList = this.closest('.transparency-tabs');
            if (!tabList) return;

            const allTabs = Array.from(tabList.querySelectorAll('.tab-btn'));
            const currentIndex = allTabs.indexOf(this);

            let newIndex;

            switch (e.key) {
                case 'ArrowRight':
                case 'ArrowDown':
                    e.preventDefault();
                    newIndex = (currentIndex + 1) % allTabs.length;
                    allTabs[newIndex].focus();
                    allTabs[newIndex].click();
                    break;
                case 'ArrowLeft':
                case 'ArrowUp':
                    e.preventDefault();
                    newIndex = (currentIndex - 1 + allTabs.length) % allTabs.length;
                    allTabs[newIndex].focus();
                    allTabs[newIndex].click();
                    break;
                case 'Home':
                    e.preventDefault();
                    allTabs[0].focus();
                    allTabs[0].click();
                    break;
                case 'End':
                    e.preventDefault();
                    allTabs[allTabs.length - 1].focus();
                    allTabs[allTabs.length - 1].click();
                    break;
            }
        });
    });
});

/* =============================================================================
   11. LOADING STATES & LAZY LOADING
   =============================================================================
   Purpose: Handle loading states and lazy loading
   Features:
   - Button loading states on form submit
   - Lazy loading images with Intersection Observer
   - Skeleton loader ready (CSS classes available)

   Usage - Lazy Loading Images:
   <img data-src="image.jpg" src="placeholder.jpg" alt="Description">

   Usage - Loading Button:
   <button type="submit">Submit</button>
*/

document.addEventListener('DOMContentLoaded', function() {
    // Add loading state to buttons on form submit
    const forms = document.querySelectorAll('form');

    forms.forEach(function(form) {
        form.addEventListener('submit', function() {
            const submitBtn = this.querySelector('button[type="submit"]');
            if (submitBtn) {
                const originalText = submitBtn.innerHTML;
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="material-icons" aria-hidden="true">hourglass_empty</i> Submitting...';

                // Re-enable after 3 seconds (for demo purposes)
                setTimeout(function() {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalText;
                }, 3000);
            }
        });
    });

    // Lazy load images with Intersection Observer
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver(function(entries, observer) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                    }
                    img.classList.add('loaded');
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.01
        });

        // Observe images with data-src attribute
        document.querySelectorAll('img[data-src]').forEach(function(img) {
            imageObserver.observe(img);
        });
    }
});

/* =============================================================================
   12. CONTACT FORM VALIDATION
   =============================================================================
   Purpose: Full validation for contact form
   Features:
   - Name validation (required, min length)
   - Email validation (required, format)
   - Phone validation (optional, format)
   - Message validation (required, min length)
   - Real-time validation feedback

   Usage:
   <form id="contact-form">
     <input type="text" id="contact-name" required>
     <input type="email" id="contact-email" required>
     <input type="tel" id="contact-phone">
     <textarea id="contact-message" required></textarea>
     <button type="submit">Send Message</button>
   </form>
*/

document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contact-form');
    const contactName = document.getElementById('contact-name');
    const contactEmail = document.getElementById('contact-email');
    const contactPhone = document.getElementById('contact-phone');
    const contactMessage = document.getElementById('contact-message');

    // Email validation regex
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    // Phone regex - accepts various formats
    const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;

    /**
     * Validates email address format
     * @function validateEmail
     * @param {string} email - Email to validate
     * @returns {boolean}
     */
    function validateEmail(email) {
        return emailRegex.test(email);
    }

    /**
     * Validates phone number format
     * @function validatePhone
     * @param {string} phone - Phone to validate
     * @returns {boolean}
     */
    function validatePhone(phone) {
        if (!phone || phone.trim() === '') return true; // Phone is optional
        return phoneRegex.test(phone);
    }

    if (contactForm) {
        // Validate on input for real-time feedback
        const contactInputs = [contactName, contactEmail, contactPhone, contactMessage];

        contactInputs.forEach(function(input) {
            if (input) {
                input.addEventListener('input', function() {
                    // Clear error when user starts typing
                    this.classList.remove('error');
                    const errorSpan = document.getElementById(this.id + '-error');
                    if (errorSpan) errorSpan.textContent = '';
                });
            }
        });

        // Form submission handler
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            let isValid = true;

            // Validate Name
            if (contactName) {
                const nameValue = contactName.value.trim();
                const nameError = document.getElementById('contact-name-error');

                if (nameValue === '') {
                    if (nameError) nameError.textContent = 'Name is required';
                    contactName.classList.add('error');
                    isValid = false;
                } else if (nameValue.length < 2) {
                    if (nameError) nameError.textContent = 'Name must be at least 2 characters';
                    contactName.classList.add('error');
                    isValid = false;
                }
            }

            // Validate Email
            if (contactEmail) {
                const emailValue = contactEmail.value.trim();
                const emailErrorEl = document.getElementById('contact-email-error');

                if (emailValue === '') {
                    if (emailErrorEl) emailErrorEl.textContent = 'Email is required';
                    contactEmail.classList.add('error');
                    isValid = false;
                } else if (!validateEmail(emailValue)) {
                    if (emailErrorEl) emailErrorEl.textContent = 'Please enter a valid email address';
                    contactEmail.classList.add('error');
                    isValid = false;
                }
            }

            // Validate Phone (optional but if provided, must be valid)
            if (contactPhone) {
                const phoneValue = contactPhone.value.trim();
                const phoneError = document.getElementById('contact-phone-error');

                if (phoneValue !== '' && !validatePhone(phoneValue)) {
                    if (phoneError) phoneError.textContent = 'Please enter a valid phone number';
                    contactPhone.classList.add('error');
                    isValid = false;
                }
            }

            // Validate Message
            if (contactMessage) {
                const messageValue = contactMessage.value.trim();
                const messageError = document.getElementById('contact-message-error');

                if (messageValue === '') {
                    if (messageError) messageError.textContent = 'Message is required';
                    contactMessage.classList.add('error');
                    isValid = false;
                } else if (messageValue.length < 10) {
                    if (messageError) messageError.textContent = 'Message must be at least 10 characters';
                    contactMessage.classList.add('error');
                    isValid = false;
                }
            }

            // If form is valid, show success message
            if (isValid) {
                // Create success message element
                const successMessage = document.createElement('div');
                successMessage.className = 'form-success';
                successMessage.setAttribute('role', 'alert');
                successMessage.innerHTML = '<i class="material-icons" aria-hidden="true">check_circle</i> Thank you! Your message has been sent successfully.';

                // Remove any existing success/error messages
                const existingMessage = contactForm.querySelector('.form-success, .form-error');
                if (existingMessage) existingMessage.remove();

                // Insert success message
                contactForm.insertBefore(successMessage, contactForm.firstChild);

                // Reset form
                contactForm.reset();

                // Remove success message after 5 seconds
                setTimeout(function() {
                    successMessage.remove();
                }, 5000);

                // Focus first field for accessibility
                if (contactName) contactName.focus();
            }
        });
    }
});

/* =============================================================================
   13. PRODUCT DETAILS SEASONAL TABS
   =============================================================================
   Purpose: Switch seasonal harvest examples on the product details page
   Features:
   - Click to switch seasonal panels
   - Updates aria-selected, tabindex, and hidden states
   - Supports Arrow, Home, and End keyboard navigation

   Usage:
   <div data-season-tabs>
     <button data-season-tab="spring" role="tab">Spring</button>
     <section data-season-panel="spring" role="tabpanel">...</section>
   </div>
*/

document.addEventListener('DOMContentLoaded', function() {
    const seasonTabsRoot = document.querySelector('[data-season-tabs]');
    if (!seasonTabsRoot) return;

    const tabs = Array.from(seasonTabsRoot.querySelectorAll('[data-season-tab]'));
    const panels = Array.from(seasonTabsRoot.querySelectorAll('[data-season-panel]'));

    if (tabs.length === 0 || panels.length === 0) return;

    /**
     * Activates the requested seasonal tab and panel.
     * @function activateSeasonTab
     * @param {HTMLElement} targetTab - Tab button to activate
     * @param {boolean} moveFocus - Whether focus should move to the activated tab
     * @returns {void}
     */
    function activateSeasonTab(targetTab, moveFocus) {
        const targetKey = targetTab.getAttribute('data-season-tab');

        tabs.forEach(function(tab) {
            const isActive = tab === targetTab;
            tab.classList.toggle('is-active', isActive);
            tab.setAttribute('aria-selected', String(isActive));
            tab.setAttribute('tabindex', isActive ? '0' : '-1');
        });

        panels.forEach(function(panel) {
            const isActive = panel.getAttribute('data-season-panel') === targetKey;
            panel.classList.toggle('is-active', isActive);
            panel.hidden = !isActive;
        });

        if (moveFocus) {
            targetTab.focus();
        }
    }

    tabs.forEach(function(tab, index) {
        tab.addEventListener('click', function() {
            activateSeasonTab(tab, false);
        });

        tab.addEventListener('keydown', function(event) {
            const isRTL = document.documentElement.getAttribute('dir') === 'rtl';
            const previousKey = isRTL ? 'ArrowRight' : 'ArrowLeft';
            const nextKey = isRTL ? 'ArrowLeft' : 'ArrowRight';
            let targetIndex = index;

            if (event.key === nextKey) {
                targetIndex = (index + 1) % tabs.length;
            } else if (event.key === previousKey) {
                targetIndex = (index - 1 + tabs.length) % tabs.length;
            } else if (event.key === 'Home') {
                targetIndex = 0;
            } else if (event.key === 'End') {
                targetIndex = tabs.length - 1;
            } else {
                return;
            }

            event.preventDefault();
            activateSeasonTab(tabs[targetIndex], true);
        });
    });

    activateSeasonTab(
        tabs.find(function(tab) {
            return tab.classList.contains('is-active');
        }) || tabs[0],
        false
    );
});

/* =============================================================================
   14. PRODUCT DETAILS CONTENT HYDRATION
   =============================================================================
   Purpose: Reuse one product details page for multiple box types
   Features:
   - Reads the active plan from ?plan=small|family|fruit|vegetable
   - Updates hero, overview, seasonal copy, policies, add-ons, and FAQ
   - Keeps Family Box as the default when no plan is provided

   Usage:
   products-details.html?plan=small
   products-details.html?plan=family
   products-details.html?plan=fruit
   products-details.html?plan=vegetable
*/

document.addEventListener('DOMContentLoaded', function() {
    const productDetailRoot = document.querySelector('.product-details-page .product-detail-main');
    if (!productDetailRoot) return;

    const commonAddons = [
        { badge: 'EG', title: 'Pasture Eggs', description: 'One dozen from nearby free-range flocks.', price: '+$6' },
        { badge: 'BR', title: 'Sourdough Bread', description: 'Fresh weekly loaves baked for route morning.', price: '+$7' },
        { badge: 'HY', title: 'Wildflower Honey', description: 'Raw small-batch jars from regional hives.', price: '+$9' },
        { badge: 'JM', title: 'Seasonal Jam', description: 'Small-batch preserves made from peak fruit.', price: '+$8' }
    ];

    const planContent = {
        small: {
            pageTitle: 'Small Box | Pure Fields Product Details',
            metaDescription: 'View the Small Box details, including price, seasonal box contents, subscription terms, delivery options, add-ons, and FAQ.',
            name: 'Small Box',
            heroImage: {
                src: '../../assets/images/Products details imgs/pexels-kampus-7658815.jpg',
                alt: 'Small basket prepared for a light weekly produce share'
            },
            secondaryImage: {
                src: '../../assets/images/Products details imgs/pexels-kampus-7658816.jpg',
                alt: 'Compact produce basket carried through a garden plot'
            },
            sourceImages: {
                large: {
                    src: '../../assets/images/Products details imgs/pexels-pixabay-248489.jpg',
                    alt: 'Mixed vegetables prepared for a small weekly box'
                },
                small: {
                    src: '../../assets/images/Products details imgs/pexels-wadimoo-17926549.jpg',
                    alt: 'Freshly harvested radishes from a nearby field'
                }
            },
            highlight: {
                label: 'Right-sized weekly prep',
                value: '6-8 items each drop',
                copy: 'Designed for smaller kitchens and households that want fresh produce without overbuying.'
            },
            priceValue: '$18',
            priceSuffix: 'per box',
            summary: 'A compact CSA plan for one or two people who cook a few nights each week and want a manageable fridge footprint.',
            boxSize: '6-8 seasonal items',
            frequency: 'Weekly or biweekly',
            bestFor: '1-2 people',
            startWindow: 'Next Tuesday or Thursday',
            notes: [
                'Flexible biweekly option for lighter use',
                'Easy fit for apartment kitchens and smaller fridges',
                'Still eligible for all recurring add-ons'
            ],
            overviewTitle: 'Made for lighter cooking routines and smaller households.',
            overviewCopy: 'The Small Box keeps the CSA experience practical. It covers produce basics, supports meal prep, and avoids the waste that comes from oversized weekly shares.',
            overviewCards: [
                {
                    label: 'Who it is for',
                    title: 'Best for 1-2 people',
                    description: 'A good fit for singles, couples, or households that cook a few evenings a week.'
                },
                {
                    label: 'Household fit',
                    title: 'Low-waste weekly volume',
                    description: 'Enough variety to feel fresh without crowding the fridge or forcing meal planning around excess.'
                },
                {
                    label: 'Buying pattern',
                    title: 'Strong starter plan',
                    description: 'Often chosen by first-time CSA members who want to ease into recurring produce delivery.'
                }
            ],
            includedTitle: 'A typical Small Box covers the basics for a few solid meals.',
            quantities: [
                { amount: '1 bunch', item: 'leafy greens' },
                { amount: '1-2 lbs', item: 'staple vegetables' },
                { amount: '1 lb', item: 'seasonal fruit' },
                { amount: '1 bunch', item: 'herbs or aromatics' },
                { amount: '1 item', item: 'specialty produce' }
            ],
            sampleHeading: 'Sample weekly contents',
            sampleHeadingBadge: 'Smaller share',
            sampleItems: ['Spinach', 'Baby lettuce', 'Carrots', 'Green onions', 'Potatoes', 'Strawberries', 'Parsley'],
            sampleCopy: 'This plan keeps the mix focused and practical, with enough variation to keep weeknight meals interesting.',
            seasonalTitle: 'The Small Box follows the season with a tighter, more practical mix.',
            seasonalAside: 'It favors staple items and a few seasonal highlights so smaller households can use the box fully each week.',
            seasons: {
                spring: {
                    title: 'Spring mix',
                    description: 'Tender greens and early fruit dominate the box when fields first open up.',
                    items: ['Spinach', 'Lettuce', 'Radishes', 'Peas', 'Strawberries', 'Chives']
                },
                summer: {
                    title: 'Summer mix',
                    description: 'Warmer weeks bring lighter salad vegetables and snack-ready fruit in smaller quantities.',
                    items: ['Tomatoes', 'Cucumbers', 'Peaches', 'Basil', 'Zucchini', 'Sweet peppers']
                },
                fall: {
                    title: 'Fall mix',
                    description: 'Autumn shifts the box toward roast-friendly staples and cooler-weather produce.',
                    items: ['Apples', 'Squash', 'Kale', 'Beets', 'Broccoli', 'Pears']
                },
                winter: {
                    title: 'Winter mix',
                    description: 'Winter keeps the box steady with hardy greens, roots, and citrus.',
                    items: ['Oranges', 'Carrots', 'Potatoes', 'Onions', 'Chard', 'Cabbage']
                }
            },
            subscriptionTitle: 'A flexible recurring plan for smaller households.',
            subscriptionItems: [
                { label: 'Billing cycle', value: 'Weekly or biweekly' },
                { label: 'Recurring payment', value: 'Automatic renewal until paused or canceled' },
                { label: 'Start date', value: 'Next available Tuesday or Thursday route' },
                { label: 'Renewal', value: 'Renews at the close of each billing cycle' },
                { label: 'Minimum commitment', value: 'Initial 2-week starter cycle' }
            ],
            deliveryTitle: 'Delivery and pickup stay the same whichever cadence you choose.',
            deliveryItems: [
                { label: 'Delivery days', value: 'Tuesday and Thursday afternoons' },
                { label: 'Service area', value: 'Within 20 miles of the central packing hub' },
                { label: 'Pickup locations', value: 'Farm stand, downtown market, westside co-op, and neighborhood hosts' },
                { label: 'Address changes', value: 'Update the route address from your dashboard before Friday at 5:00 PM' }
            ],
            policyTitle: 'Small plans are just as manageable after checkout.',
            policyAside: 'Members can still pause, skip, or stop renewals from the dashboard without needing support to intervene.',
            addonsTitle: 'Popular extras for the Small Box.',
            addonsAside: 'Smaller households often use add-ons to turn a lighter produce box into a fuller weekly grocery drop.',
            sourceTitle: 'Sourced from nearby growers with compact weekly packing in mind.',
            sourceCopy1: 'The Small Box pulls from the same partner farm network as larger plans but is packed with a tighter selection of high-use items.',
            sourceCopy2: 'Produce is harvested close to route day and packed in smaller shares that travel well and store cleanly in limited kitchen space.',
            sourceStats: [
                { value: '30+', label: 'farm partners contributing across the season' },
                { value: '24 hrs', label: 'target window from harvest to packing' },
                { value: '2', label: 'supported delivery cadences for this plan' }
            ],
            faqTitle: 'Questions members ask before starting the Small Box.',
            faqAside: 'Answers focus on portion size, substitutions, billing, and scaling up later.',
            faqItems: [
                {
                    question: 'Will the Small Box be enough for two people?',
                    answer: 'For most couples, yes, especially if you cook a few nights each week and supplement with pantry staples.'
                },
                {
                    question: 'Can I switch from biweekly to weekly later?',
                    answer: 'Yes. Delivery frequency can be adjusted from the dashboard before the next billing cutoff.'
                },
                {
                    question: 'Can I upgrade to a larger box if I need more?',
                    answer: 'Yes. Plan changes can be made from the dashboard before the next renewal, subject to availability.'
                },
                {
                    question: 'Do substitutions work the same way on the Small Box?',
                    answer: 'Yes. Eligible swaps and dislike preferences are still available whenever alternate inventory exists.'
                },
                {
                    question: 'What if I skip a week often?',
                    answer: 'That is exactly what the pause and skip controls are for. You can manage them directly from the dashboard.'
                }
            ]
        },
        family: {
            pageTitle: 'Family Box | Pure Fields Product Details',
            metaDescription: 'View the Family Box details, including price, box contents, seasonal variation, subscription terms, delivery options, add-ons, and FAQ.',
            name: 'Family Box',
            heroImage: {
                src: '../../assets/images/Products details imgs/pexels-kayla-perry-122441854-29851450.jpg',
                alt: 'Family box basket filled with tomatoes and peppers'
            },
            secondaryImage: {
                src: '../../assets/images/Products details imgs/pexels-nc-farm-bureau-mark-2255920.jpg',
                alt: 'Bushel basket packed with family box staples'
            },
            sourceImages: {
                large: {
                    src: '../../assets/images/Products details imgs/pexels-nc-farm-bureau-mark-2255924.jpg',
                    alt: 'Seasonal basket filled for a full family route'
                },
                small: {
                    src: '../../assets/images/Products details imgs/pexels-helenalopes-27177504.jpg',
                    alt: 'Harvest basket filled with fresh greens'
                }
            },
            highlight: {
                label: 'Picked and packed',
                value: 'within 24 hours',
                copy: 'Boxes are built to route so freshness stays high and waste stays low.'
            },
            priceValue: '$34',
            priceSuffix: 'per weekly box',
            summary: 'A balanced CSA plan for households that cook most nights and want enough variety for dinners, lunch prep, and a few pantry staples.',
            boxSize: '10-12 seasonal items',
            frequency: 'Weekly',
            bestFor: 'Families of 3-5',
            startWindow: 'Next Tuesday or Thursday',
            notes: [
                'Flexible skips and pauses from your dashboard',
                'Delivery and pickup routes available',
                'Add-ons can be attached at checkout or later'
            ],
            overviewTitle: 'Built for families who want a dependable weekly mix.',
            overviewCopy: 'The Family Box is the most balanced plan in the lineup. It works well for shared dinners, mixed eaters, and members who want a solid produce baseline before adding eggs, bread, or pantry extras.',
            overviewCards: [
                {
                    label: 'Who it is for',
                    title: 'Best for 3-5 people',
                    description: 'Enough volume for households that cook most evenings and want leftovers for lunch or snacks.'
                },
                {
                    label: 'Household fit',
                    title: 'Works for mixed diets',
                    description: 'A balanced mix of staple vegetables, seasonal fruit, and recipe-friendly herbs.'
                },
                {
                    label: 'Buying pattern',
                    title: 'Pairs well with add-ons',
                    description: 'Members often attach eggs, milk, or bread to turn the box into a fuller weekly grocery base.'
                }
            ],
            includedTitle: 'A typical Family Box arrives with enough range for several meals.',
            quantities: [
                { amount: '2 bunches', item: 'leafy greens' },
                { amount: '2-3 lbs', item: 'staple vegetables' },
                { amount: '1-2 lbs', item: 'seasonal fruit' },
                { amount: '1 bunch', item: 'herbs or aromatics' },
                { amount: '1-2 items', item: 'specialty produce' },
                { amount: '1 recipe note', item: 'storage and prep guidance' }
            ],
            sampleHeading: 'Sample weekly contents',
            sampleHeadingBadge: 'Approximate mix',
            sampleItems: ['Butter lettuce', 'Spinach', 'Rainbow carrots', 'Spring onions', 'Red potatoes', 'Snap peas', 'Strawberries', 'Valencia oranges', 'Parsley', 'Asparagus'],
            sampleCopy: 'Quantities are approximate because field conditions, weather, and harvest timing shift week to week.',
            seasonalTitle: 'The Family Box changes with the harvest, not a fixed SKU list.',
            seasonalAside: 'Seasonal rotation keeps the box fresh and gives growers room to pack what is strongest in the field that week.',
            seasons: {
                spring: {
                    title: 'Spring mix',
                    description: 'Tender greens, herbs, peas, strawberries, and early roots dominate the box in late spring.',
                    items: ['Spinach', 'Butter lettuce', 'Radishes', 'Snap peas', 'Strawberries', 'Asparagus']
                },
                summer: {
                    title: 'Summer mix',
                    description: 'Peak season shifts the box toward tomatoes, cucumbers, stone fruit, sweet corn, and high-volume cooking staples.',
                    items: ['Tomatoes', 'Cucumbers', 'Sweet corn', 'Peaches', 'Basil', 'Zucchini']
                },
                fall: {
                    title: 'Fall mix',
                    description: 'Autumn boxes lean into apples, squash, brassicas, and cooler-weather greens for slower cooking and roasting.',
                    items: ['Apples', 'Delicata squash', 'Kale', 'Broccoli', 'Beets', 'Pears']
                },
                winter: {
                    title: 'Winter mix',
                    description: 'Winter holds steady with citrus, hardy greens, roots, cabbage, and long-storing staples that travel well.',
                    items: ['Oranges', 'Carrots', 'Cabbage', 'Potatoes', 'Swiss chard', 'Onions']
                }
            },
            subscriptionTitle: 'Straightforward recurring membership.',
            subscriptionItems: [
                { label: 'Billing cycle', value: 'Weekly by default, or monthly on request' },
                { label: 'Recurring payment', value: 'Automatic renewal until paused or canceled' },
                { label: 'Start date', value: 'Start with the next available Tuesday or Thursday route' },
                { label: 'Renewal', value: 'Renews at the close of each billing cycle' },
                { label: 'Minimum commitment', value: 'Initial 4-week starter cycle' }
            ],
            deliveryTitle: 'Local routes with dashboard-managed changes.',
            deliveryItems: [
                { label: 'Delivery days', value: 'Tuesday and Thursday afternoons' },
                { label: 'Service area', value: 'Within 20 miles of the central packing hub' },
                { label: 'Pickup locations', value: 'Farm stand, downtown market, westside co-op, and neighborhood hosts' },
                { label: 'Address changes', value: 'Update the route address from your dashboard before Friday at 5:00 PM' }
            ],
            policyTitle: 'Members keep control after checkout.',
            policyAside: 'These controls are especially important because the dashboard is where subscribers manage travel, timing changes, and long-term membership status.',
            addonsTitle: 'Useful extras members often attach to this box.',
            addonsAside: 'Add-ons can be recurring or one-time, depending on your weekly needs.',
            sourceTitle: 'Packed from a rotating network of nearby growers.',
            sourceCopy1: 'The Family Box is sourced from partner farms that use low-spray, regenerative, and soil-first growing practices. The pack mix shifts by field strength, route timing, and what is at peak quality that week.',
            sourceCopy2: 'Most produce is harvested within a day of packing, cooled quickly, and staged in reusable boxes so members receive better texture and shelf life than typical retail handling.',
            sourceStats: [
                { value: '30+', label: 'farm partners contributing across the season' },
                { value: '24 hrs', label: 'target window from harvest to packing' },
                { value: '6', label: 'pickup hubs tied to the current route map' }
            ],
            faqTitle: 'Questions members usually ask before they start this plan.',
            faqAside: 'Answers cover substitutions, missed deliveries, billing, allergies, and plan changes.',
            faqItems: [
                {
                    question: 'Can I request substitutions in the Family Box?',
                    answer: 'Yes. Members can flag dislikes and request eligible swaps before the weekly cutoff if alternate inventory is available.'
                },
                {
                    question: 'What happens if I miss a delivery?',
                    answer: 'Delivery notes, pickup switches, and address changes can be managed in the dashboard ahead of route day. If a route is missed, support can review the order history and route notes.'
                },
                {
                    question: 'How does billing work after the first order?',
                    answer: 'Your card is billed automatically on the schedule attached to your membership, and renewals continue until you pause or cancel.'
                },
                {
                    question: 'Can you accommodate allergies?',
                    answer: 'You can note common produce dislikes and certain sensitivities, but because packing happens in a farm-box system, ingredient-specific guarantees should be confirmed with support before subscribing.'
                },
                {
                    question: 'Can I change from Family Box to another plan later?',
                    answer: 'Yes. Plan changes can be made from the dashboard before the next billing cutoff, subject to inventory and route availability.'
                }
            ]
        },
        fruit: {
            pageTitle: 'Fruit Box | Pure Fields Product Details',
            metaDescription: 'View the Fruit Box details, including price, seasonal fruit mix, subscription terms, delivery options, add-ons, and FAQ.',
            name: 'Fruit Box',
            heroImage: {
                src: '../../assets/images/Products details imgs/pexels-jill-wellington-1638660-5421412.jpg',
                alt: 'Apples packed for a weekly fruit subscription'
            },
            secondaryImage: {
                src: '../../assets/images/Products details imgs/pexels-jonathan-david-1312107-31956598.jpg',
                alt: 'Fresh strawberries packed at peak season'
            },
            sourceImages: {
                large: {
                    src: '../../assets/images/Products details imgs/pexels-zen-chung-5529527.jpg',
                    alt: 'Apples gathered from a local orchard'
                },
                small: {
                    src: '../../assets/images/Products details imgs/pexels-zen-chung-5529561.jpg',
                    alt: 'Grapes gathered for the peak-season fruit share'
                }
            },
            highlight: {
                label: 'Snack-ready mix',
                value: 'orchard and citrus heavy',
                copy: 'This plan is packed for lunches, snacks, breakfast prep, and light produce use.'
            },
            priceValue: '$22',
            priceSuffix: 'per box',
            summary: 'A fruit-forward share built for lunchboxes, snacking, breakfast prep, and households that want a lighter weekly produce plan.',
            boxSize: '7-9 fruit-focused items',
            frequency: 'Weekly or biweekly',
            bestFor: 'Snackers and lunch prep',
            startWindow: 'Next Tuesday or Thursday',
            notes: [
                'Great as a standalone fruit subscription',
                'Often paired with the Small or Vegetable Box',
                'Best variety appears during peak orchard months'
            ],
            overviewTitle: 'Designed for households that want fruit without committing to a full mixed box.',
            overviewCopy: 'The Fruit Box focuses on snackable, family-friendly produce with a rotation that tracks orchard peaks, citrus season, and berry windows.',
            overviewCards: [
                {
                    label: 'Who it is for',
                    title: 'Best for lunchboxes and snacking',
                    description: 'A useful fit for families, office snacking, and anyone who wants ready-to-eat fruit on hand.'
                },
                {
                    label: 'Household fit',
                    title: 'Pairs well with other plans',
                    description: 'Many members add it to a vegetable-heavy plan to balance dinners with fruit for breakfasts and snacks.'
                },
                {
                    label: 'Buying pattern',
                    title: 'Seasonal variety swings more',
                    description: 'Fruit availability changes faster than mixed boxes, especially during berry and stone-fruit windows.'
                }
            ],
            includedTitle: 'A typical Fruit Box leans into peak-season sweetness and easy eating.',
            quantities: [
                { amount: '2-3 lbs', item: 'core fruit staples' },
                { amount: '1-2 pints', item: 'berries when in season' },
                { amount: '1-2 lbs', item: 'citrus or orchard fruit' },
                { amount: '1 item', item: 'specialty or peak fruit' },
                { amount: '1 note', item: 'ripening and storage guidance' }
            ],
            sampleHeading: 'Sample weekly contents',
            sampleHeadingBadge: 'Fruit-forward mix',
            sampleItems: ['Oranges', 'Strawberries', 'Apples', 'Pears', 'Blueberries', 'Peaches', 'Lemons'],
            sampleCopy: 'Exact fruit types rotate with orchard timing, weather, and what is picking best that week.',
            seasonalTitle: 'Fruit rotation moves more dramatically with the season.',
            seasonalAside: 'Berry windows, stone-fruit peaks, and citrus months each shape the box in different ways across the year.',
            seasons: {
                spring: {
                    title: 'Spring mix',
                    description: 'Spring starts with citrus holdovers, strawberries, and early orchard fruit when available.',
                    items: ['Strawberries', 'Oranges', 'Grapefruit', 'Loquats', 'Lemons', 'Early cherries']
                },
                summer: {
                    title: 'Summer mix',
                    description: 'Summer is peak variety, led by berries, peaches, plums, melons, and nectarines.',
                    items: ['Peaches', 'Plums', 'Blueberries', 'Blackberries', 'Melon', 'Nectarines']
                },
                fall: {
                    title: 'Fall mix',
                    description: 'As weather cools, the box shifts toward apples, pears, grapes, and later figs.',
                    items: ['Apples', 'Pears', 'Grapes', 'Figs', 'Persimmons', 'Late berries']
                },
                winter: {
                    title: 'Winter mix',
                    description: 'Winter holds steady on citrus, apples, and long-holding orchard staples.',
                    items: ['Navel oranges', 'Mandarins', 'Apples', 'Grapefruit', 'Lemons', 'Pears']
                }
            },
            subscriptionTitle: 'Flexible recurring fruit delivery.',
            subscriptionItems: [
                { label: 'Billing cycle', value: 'Weekly or biweekly' },
                { label: 'Recurring payment', value: 'Automatic renewal until paused or canceled' },
                { label: 'Start date', value: 'Next available Tuesday or Thursday route' },
                { label: 'Renewal', value: 'Renews at the close of each billing cycle' },
                { label: 'Minimum commitment', value: 'Initial 2-week starter cycle' }
            ],
            deliveryTitle: 'Fruit boxes follow the same route map as other subscriptions.',
            deliveryItems: [
                { label: 'Delivery days', value: 'Tuesday and Thursday afternoons' },
                { label: 'Service area', value: 'Within 20 miles of the central packing hub' },
                { label: 'Pickup locations', value: 'Farm stand, downtown market, westside co-op, and neighborhood hosts' },
                { label: 'Address changes', value: 'Update the route address from your dashboard before Friday at 5:00 PM' }
            ],
            policyTitle: 'Fruit subscriptions are managed the same way as other plans.',
            policyAside: 'Dashboard controls stay important here because berry and orchard seasons often change how often members want the box.',
            addonsTitle: 'Useful extras for a fruit-heavy plan.',
            addonsAside: 'Members often add bread, honey, or jam to round out breakfast and snack use.',
            sourceTitle: 'Packed from orchard partners, berry growers, and regional citrus routes.',
            sourceCopy1: 'The Fruit Box pulls from orchard blocks and specialty fruit growers within the same local network that supports the mixed CSA plans.',
            sourceCopy2: 'Packing is timed closely to harvest so softer fruit arrives with better texture and shelf life than a longer retail supply chain.',
            sourceStats: [
                { value: '20+', label: 'fruit-producing partners across the season' },
                { value: '24 hrs', label: 'target harvest-to-pack window for softer fruit' },
                { value: '2', label: 'delivery cadence options available' }
            ],
            faqTitle: 'Questions members ask before subscribing to the Fruit Box.',
            faqAside: 'Answers cover fruit substitutions, seasonality, billing, and combining it with other plans.',
            faqItems: [
                {
                    question: 'Will the Fruit Box always include berries?',
                    answer: 'No. Berry availability is seasonal, so the mix rotates among citrus, orchard fruit, melons, grapes, and berries depending on the time of year.'
                },
                {
                    question: 'Can I combine the Fruit Box with another plan?',
                    answer: 'Yes. Many members pair it with the Small or Vegetable Box for a more complete weekly produce mix.'
                },
                {
                    question: 'Can I skip weeks when fruit season is lighter?',
                    answer: 'Yes. Skips and pauses are handled from the dashboard before the weekly billing cutoff.'
                },
                {
                    question: 'How do substitutions work if I do not want a certain fruit?',
                    answer: 'Eligible fruit swaps can be requested whenever alternate inventory is available that week.'
                },
                {
                    question: 'Does this plan renew automatically too?',
                    answer: 'Yes. The Fruit Box follows the same recurring billing logic as the other subscription plans.'
                }
            ]
        },
        vegetable: {
            pageTitle: 'Vegetable Box | Pure Fields Product Details',
            metaDescription: 'View the Vegetable Box details, including price, seasonal vegetable mix, subscription terms, delivery options, add-ons, and FAQ.',
            name: 'Vegetable Box',
            heroImage: {
                src: '../../assets/images/Products details imgs/pexels-helenalopes-27176788.jpg',
                alt: 'Leafy greens harvested for a vegetable box'
            },
            secondaryImage: {
                src: '../../assets/images/Products details imgs/pexels-gustavo-fring-4894576.jpg',
                alt: 'Fresh radishes bundled for the vegetable box'
            },
            sourceImages: {
                large: {
                    src: '../../assets/images/Products details imgs/pexels-helenalopes-27176778.jpg',
                    alt: 'Brassicas picked for weekly vegetable packing'
                },
                small: {
                    src: '../../assets/images/Products details imgs/pexels-richa-varshney-3635708-28937089.jpg',
                    alt: 'Sweet peppers selected for the vegetable route'
                }
            },
            highlight: {
                label: 'Cook-from-scratch mix',
                value: 'vegetable heavy each week',
                copy: 'Built for members who want the broadest produce selection for dinners, soups, salads, and meal prep.'
            },
            priceValue: '$26',
            priceSuffix: 'per weekly box',
            summary: 'A vegetable-first CSA plan for plant-forward cooks who want more leafy greens, roots, herbs, and cooking staples week after week.',
            boxSize: '8-10 vegetable-focused items',
            frequency: 'Weekly',
            bestFor: 'Plant-forward cooks',
            startWindow: 'Next Tuesday or Thursday',
            notes: [
                'Best value during peak harvest months',
                'Strong fit for home cooks and meal prep',
                'Easy to balance with fruit or pantry add-ons'
            ],
            overviewTitle: 'Made for members who cook often and want stronger field variety.',
            overviewCopy: 'The Vegetable Box keeps the mix centered on greens, roots, herbs, and seasonal cooking staples. It is a strong choice for home cooks, vegetarians, and anyone building dinners around produce.',
            overviewCards: [
                {
                    label: 'Who it is for',
                    title: 'Best for regular home cooks',
                    description: 'Ideal for households that plan several meals each week around vegetables rather than snacks or fruit.'
                },
                {
                    label: 'Household fit',
                    title: 'Vegetable-heavy by design',
                    description: 'The mix stays focused on cooking staples and strong seasonal field crops instead of a balanced fruit split.'
                },
                {
                    label: 'Buying pattern',
                    title: 'Often paired with a fruit add-on',
                    description: 'Many members keep the box vegetable-heavy and add fruit only when they want it.'
                }
            ],
            includedTitle: 'A typical Vegetable Box delivers a broad produce base for cooking.',
            quantities: [
                { amount: '2 bunches', item: 'leafy greens' },
                { amount: '2-3 lbs', item: 'roots and staples' },
                { amount: '1-2 lbs', item: 'seasonal cooking vegetables' },
                { amount: '1 bunch', item: 'herbs or aromatics' },
                { amount: '1 item', item: 'specialty or peak crop' },
                { amount: '1 note', item: 'storage and prep guidance' }
            ],
            sampleHeading: 'Sample weekly contents',
            sampleHeadingBadge: 'Vegetable-forward mix',
            sampleItems: ['Kale', 'Spinach', 'Carrots', 'Broccoli', 'Potatoes', 'Zucchini', 'Basil', 'Onions', 'Beets'],
            sampleCopy: 'This plan keeps fruit minimal or absent so the box can stay focused on produce for main meals.',
            seasonalTitle: 'Vegetable variety moves with field strength and weather.',
            seasonalAside: 'The plan follows the strongest vegetable crops in each season, which makes it especially dynamic for cooks who enjoy rotating produce.',
            seasons: {
                spring: {
                    title: 'Spring mix',
                    description: 'Spring leans into tender greens, herbs, peas, radishes, and early brassicas.',
                    items: ['Spinach', 'Lettuce', 'Peas', 'Radishes', 'Asparagus', 'Spring onions']
                },
                summer: {
                    title: 'Summer mix',
                    description: 'Summer brings volume and variety with tomatoes, cucumbers, peppers, basil, and squash.',
                    items: ['Tomatoes', 'Cucumbers', 'Sweet peppers', 'Zucchini', 'Basil', 'Eggplant']
                },
                fall: {
                    title: 'Fall mix',
                    description: 'Autumn shifts to roasting and braising vegetables with brassicas, squash, and roots.',
                    items: ['Broccoli', 'Kale', 'Delicata squash', 'Beets', 'Carrots', 'Cauliflower']
                },
                winter: {
                    title: 'Winter mix',
                    description: 'Winter stays grounded in hardy greens, roots, onions, potatoes, and storage vegetables.',
                    items: ['Cabbage', 'Chard', 'Carrots', 'Potatoes', 'Onions', 'Turnips']
                }
            },
            subscriptionTitle: 'Recurring delivery for vegetable-first cooking.',
            subscriptionItems: [
                { label: 'Billing cycle', value: 'Weekly' },
                { label: 'Recurring payment', value: 'Automatic renewal until paused or canceled' },
                { label: 'Start date', value: 'Start with the next available Tuesday or Thursday route' },
                { label: 'Renewal', value: 'Renews at the close of each billing cycle' },
                { label: 'Minimum commitment', value: 'Initial 4-week starter cycle' }
            ],
            deliveryTitle: 'Vegetable-heavy plans use the same route and pickup network.',
            deliveryItems: [
                { label: 'Delivery days', value: 'Tuesday and Thursday afternoons' },
                { label: 'Service area', value: 'Within 20 miles of the central packing hub' },
                { label: 'Pickup locations', value: 'Farm stand, downtown market, westside co-op, and neighborhood hosts' },
                { label: 'Address changes', value: 'Update the route address from your dashboard before Friday at 5:00 PM' }
            ],
            policyTitle: 'Dashboard controls matter most for frequent cooks.',
            policyAside: 'Vegetable-heavy plans are often tied closely to meal planning, so pause and skip controls need to stay simple for the member.',
            addonsTitle: 'Good pairings for the Vegetable Box.',
            addonsAside: 'Members often round this plan out with fruit, eggs, bread, or dairy depending on how they cook.',
            sourceTitle: 'Built around the strongest field crops from nearby growers.',
            sourceCopy1: 'The Vegetable Box is packed from the farms contributing the best greens, roots, brassicas, herbs, and seasonal staples each week.',
            sourceCopy2: 'Because the mix is less dependent on orchard timing, this plan often shows the clearest view of what is strongest in the field at a given moment.',
            sourceStats: [
                { value: '30+', label: 'farm partners contributing across the season' },
                { value: '24 hrs', label: 'target window from harvest to packing' },
                { value: '8-10', label: 'vegetable-focused items in a typical weekly box' }
            ],
            faqTitle: 'Questions members ask before starting the Vegetable Box.',
            faqAside: 'Answers focus on vegetable variety, substitutions, billing, and combining this plan with fruit or pantry extras.',
            faqItems: [
                {
                    question: 'Does the Vegetable Box include fruit?',
                    answer: 'Usually little to none. This plan is intentionally vegetable-heavy, though occasional seasonal crossover items may appear.'
                },
                {
                    question: 'Can I add fruit later if I want it?',
                    answer: 'Yes. Members often add the Fruit Box or one-off fruit extras depending on the season.'
                },
                {
                    question: 'Are substitutions available for certain vegetables?',
                    answer: 'Yes. Eligible swaps can be requested whenever alternate inventory is available before the cutoff.'
                },
                {
                    question: 'Is this the best plan for meal prep?',
                    answer: 'For most heavy home cooks, yes. It gives the broadest vegetable base for dinners, soups, roasting, and salads.'
                },
                {
                    question: 'Can I pause it during travel or a busy month?',
                    answer: 'Yes. Use the dashboard to pause or skip before the next billing lock date.'
                }
            ]
        }
    };

    const urlParams = new URLSearchParams(window.location.search);
    const requestedPlanKey = urlParams.get('plan');
    const activePlanKey = Object.prototype.hasOwnProperty.call(planContent, requestedPlanKey) ? requestedPlanKey : 'family';
    const activePlan = planContent[activePlanKey];

    /**
     * Sets text content when the element exists.
     * @function setTextContent
     * @param {string} selector - CSS selector for the target node
     * @param {string} value - New text content
     * @returns {void}
     */
    function setTextContent(selector, value) {
        const element = document.querySelector(selector);
        if (element) {
            element.textContent = value;
        }
    }

    /**
     * Updates an image source and alt text.
     * @function setImageContent
     * @param {string} selector - CSS selector for the target image
     * @param {{src: string, alt: string}} image - Image data
     * @returns {void}
     */
    function setImageContent(selector, image) {
        const element = document.querySelector(selector);
        if (element && image) {
            element.src = image.src;
            element.alt = image.alt;
        }
    }

    /**
     * Renders label/value rows for spec-style lists.
     * @function renderLabelValueList
     * @param {string} selector - CSS selector for the target container
     * @param {Array<{label: string, value: string}>} items - Rows to render
     * @returns {void}
     */
    function renderLabelValueList(selector, items) {
        const container = document.querySelector(selector);
        if (!container) return;

        container.innerHTML = items.map(function(item) {
            return '<li><span>' + item.label + '</span><strong>' + item.value + '</strong></li>';
        }).join('');
    }

    /**
     * Renders overview or policy cards.
     * @function renderFeatureCards
     * @param {string} selector - CSS selector for the target container
     * @param {Array<{label: string, title: string, description: string}>} items - Card data
     * @param {string} className - Class name for each generated card
     * @returns {void}
     */
    function renderFeatureCards(selector, items, className) {
        const container = document.querySelector(selector);
        if (!container) return;

        container.innerHTML = items.map(function(item) {
            return '<article class="' + className + '">' +
                '<span>' + item.label + '</span>' +
                '<h3>' + item.title + '</h3>' +
                '<p>' + item.description + '</p>' +
            '</article>';
        }).join('');
    }

    /**
     * Renders the quantity rows in the included section.
     * @function renderQuantityRows
     * @param {Array<{amount: string, item: string}>} items - Quantity data
     * @returns {void}
     */
    function renderQuantityRows(items) {
        const quantityList = document.getElementById('quantity-list');
        if (!quantityList) return;

        quantityList.innerHTML = items.map(function(item) {
            return '<li><span>' + item.amount + '</span><strong>' + item.item + '</strong></li>';
        }).join('');
    }

    /**
     * Renders pill-style chip lists.
     * @function renderChipList
     * @param {string} selector - CSS selector for the target container
     * @param {string[]} items - Text values for each chip
     * @returns {void}
     */
    function renderChipList(selector, items) {
        const container = document.querySelector(selector);
        if (!container) return;

        container.innerHTML = items.map(function(item) {
            return '<span>' + item + '</span>';
        }).join('');
    }

    /**
     * Renders all seasonal panels while keeping the existing tab structure.
     * @function renderSeasonPanels
     * @param {Record<string, {title: string, description: string, items: string[]}>} seasons - Seasonal content map
     * @returns {void}
     */
    function renderSeasonPanels(seasons) {
        Object.keys(seasons).forEach(function(key) {
            const panel = document.querySelector('[data-season-panel="' + key + '"]');
            if (!panel) return;

            const season = seasons[key];
            panel.innerHTML =
                '<div>' +
                    '<h3>' + season.title + '</h3>' +
                    '<p>' + season.description + '</p>' +
                '</div>' +
                '<div class="product-detail-chip-list">' +
                    season.items.map(function(item) {
                        return '<span>' + item + '</span>';
                    }).join('') +
                '</div>';
        });
    }

    /**
     * Renders the add-on grid.
     * @function renderAddons
     * @param {Array<{badge: string, title: string, description: string, price: string}>} addons - Add-on content
     * @returns {void}
     */
    function renderAddons(addons) {
        const container = document.getElementById('addon-grid');
        if (!container) return;

        container.innerHTML = addons.map(function(addon) {
            return '<article class="product-detail-addon-card">' +
                '<span class="product-detail-addon-card__badge">' + addon.badge + '</span>' +
                '<div><h3>' + addon.title + '</h3><p>' + addon.description + '</p></div>' +
                '<strong>' + addon.price + '</strong>' +
            '</article>';
        }).join('');
    }

    /**
     * Renders the source statistics row.
     * @function renderSourceStats
     * @param {Array<{value: string, label: string}>} stats - Source stat content
     * @returns {void}
     */
    function renderSourceStats(stats) {
        const container = document.getElementById('source-stats');
        if (!container) return;

        container.innerHTML = stats.map(function(stat) {
            return '<article><strong>' + stat.value + '</strong><span>' + stat.label + '</span></article>';
        }).join('');
    }

    /**
     * Renders the FAQ accordion.
     * @function renderFaqItems
     * @param {Array<{question: string, answer: string}>} items - FAQ content
     * @returns {void}
     */
    function renderFaqItems(items) {
        const container = document.getElementById('faq-list');
        if (!container) return;

        container.innerHTML = items.map(function(item, index) {
            return '<details class="product-detail-faq-item"' + (index === 0 ? ' open' : '') + '>' +
                '<summary>' + item.question + '</summary>' +
                '<p>' + item.answer + '</p>' +
            '</details>';
        }).join('');
    }

    setImageContent('#product-hero-image', activePlan.heroImage);
    setImageContent('#product-secondary-image', activePlan.secondaryImage);
    setImageContent('#source-image-large', activePlan.sourceImages.large);
    setImageContent('#source-image-small', activePlan.sourceImages.small);

    setTextContent('#product-breadcrumb-name', activePlan.name);
    setTextContent('#product-detail-title', activePlan.name);
    setTextContent('#product-price-value', activePlan.priceValue);
    setTextContent('#product-price-suffix', activePlan.priceSuffix);
    setTextContent('#product-summary', activePlan.summary);
    setTextContent('#product-box-size', activePlan.boxSize);
    setTextContent('#product-frequency', activePlan.frequency);
    setTextContent('#product-best-for', activePlan.bestFor);
    setTextContent('#product-start-window', activePlan.startWindow);
    setTextContent('#product-highlight-label', activePlan.highlight.label);
    setTextContent('#product-highlight-value', activePlan.highlight.value);
    setTextContent('#product-highlight-copy', activePlan.highlight.copy);

    setTextContent('#overview-title', activePlan.overviewTitle);
    setTextContent('#overview-copy', activePlan.overviewCopy);
    setTextContent('#included-title', activePlan.includedTitle);
    setTextContent('#sample-heading', activePlan.sampleHeading);
    setTextContent('#sample-heading-badge', activePlan.sampleHeadingBadge);
    setTextContent('#sample-copy', activePlan.sampleCopy);
    setTextContent('#seasonal-title', activePlan.seasonalTitle);
    setTextContent('#seasonal-aside', activePlan.seasonalAside);
    setTextContent('#subscription-title', activePlan.subscriptionTitle);
    setTextContent('#delivery-title', activePlan.deliveryTitle);
    setTextContent('#addons-title', activePlan.addonsTitle);
    setTextContent('#addons-aside', activePlan.addonsAside);
    setTextContent('#source-title', activePlan.sourceTitle);
    setTextContent('#source-copy-1', activePlan.sourceCopy1);
    setTextContent('#source-copy-2', activePlan.sourceCopy2);
    setTextContent('#faq-title', activePlan.faqTitle);
    setTextContent('#faq-aside', activePlan.faqAside);

    const subscribeLink = document.getElementById('product-subscribe-link');
    if (subscribeLink) {
        subscribeLink.href = 'cart.html?plan=' + activePlanKey;
    }

    const noteList = document.getElementById('product-note-list');
    if (noteList) {
        noteList.innerHTML = activePlan.notes.map(function(note) {
            return '<li>' + note + '</li>';
        }).join('');
    }

    const sampleChipList = document.getElementById('sample-chip-list');
    if (sampleChipList) {
        sampleChipList.setAttribute('aria-label', 'Sample ' + activePlan.name + ' contents');
    }

    const seasonTabList = document.querySelector('.product-detail-season-tabs__nav');
    if (seasonTabList) {
        seasonTabList.setAttribute('aria-label', activePlan.name + ' seasonal examples');
    }

    renderFeatureCards('#overview-cards', activePlan.overviewCards, 'product-detail-overview-card');
    renderQuantityRows(activePlan.quantities);
    renderChipList('#sample-chip-list', activePlan.sampleItems);
    renderSeasonPanels(activePlan.seasons);
    renderLabelValueList('#subscription-data-list', activePlan.subscriptionItems);
    renderLabelValueList('#delivery-data-list', activePlan.deliveryItems);
    renderAddons(commonAddons);
    renderSourceStats(activePlan.sourceStats);
    renderFaqItems(activePlan.faqItems);

    document.title = activePlan.pageTitle;

    const detailUrl = 'https://purefields.com/products-details.html?plan=' + activePlanKey;
    const metaDescription = document.querySelector('meta[name="description"]');
    const canonical = document.querySelector('link[rel="canonical"]');
    const ogUrl = document.querySelector('meta[property="og:url"]');
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDescription = document.querySelector('meta[property="og:description"]');
    const ogImage = document.querySelector('meta[property="og:image"]');
    const twitterUrl = document.querySelector('meta[property="twitter:url"]');
    const twitterTitle = document.querySelector('meta[property="twitter:title"]');
    const twitterDescription = document.querySelector('meta[property="twitter:description"]');
    const twitterImage = document.querySelector('meta[property="twitter:image"]');

    if (metaDescription) metaDescription.setAttribute('content', activePlan.metaDescription);
    if (canonical) canonical.setAttribute('href', detailUrl);
    if (ogUrl) ogUrl.setAttribute('content', detailUrl);
    if (ogTitle) ogTitle.setAttribute('content', activePlan.pageTitle);
    if (ogDescription) ogDescription.setAttribute('content', activePlan.metaDescription);
    if (ogImage) ogImage.setAttribute('content', activePlan.heroImage.src);
    if (twitterUrl) twitterUrl.setAttribute('content', detailUrl);
    if (twitterTitle) twitterTitle.setAttribute('content', activePlan.pageTitle);
    if (twitterDescription) twitterDescription.setAttribute('content', activePlan.metaDescription);
    if (twitterImage) twitterImage.setAttribute('content', activePlan.heroImage.src);
});

/* =============================================================================
   15. BLOG FILTERS
   =============================================================================
   Purpose: Keep the blog page topic filters simple and lightweight
   Features:
   - Filters latest blog cards by topic
   - Preserves accessibility with aria-pressed and hidden state
================================================================================ */

document.addEventListener('DOMContentLoaded', function() {
    const filterButtons = document.querySelectorAll('[data-blog-filter]');
    const postCards = document.querySelectorAll('[data-blog-category]');

    if (filterButtons.length && postCards.length) {
        filterButtons.forEach(function(button) {
            button.addEventListener('click', function() {
                const activeFilter = button.getAttribute('data-blog-filter');

                filterButtons.forEach(function(filterButton) {
                    const isActive = filterButton === button;
                    filterButton.classList.toggle('is-active', isActive);
                    filterButton.setAttribute('aria-pressed', String(isActive));
                });

                postCards.forEach(function(card) {
                    const matches = activeFilter === 'all' || card.getAttribute('data-blog-category') === activeFilter;
                    card.hidden = !matches;
                });
            });
        });
    }

});

/* =============================================================================
   16. BLOG ARTICLE DETAILS
   =============================================================================
   Purpose: Reuse the visible article-detail shell for multiple journal posts
   Features:
   - Loads article-specific content from the query string
   - Keeps the article sections visible in blog-details.html
   - Updates hero, article body, sidebar, related posts, and metadata
================================================================================ */

document.addEventListener('DOMContentLoaded', function() {
    if (!document.body.classList.contains('blog-detail-page')) return;

    const articleLibrary = {
        'weekly-box': {
            slug: 'weekly-box',
            pageTitle: 'What’s In This Week’s CSA Box? | Pure Fields Journal',
            metaDescription: 'See what is landing in this week’s CSA box, how to store it, and the easiest ways to cook through it.',
            category: 'Farm News',
            date: 'March 9, 2026',
            author: 'Pure Fields Packing Team',
            title: 'What’s in this week’s CSA box?',
            intro: 'This week leans fresh and flexible: greens, spring roots, citrus, and herbs that can move across lunches, quick dinners, and one steady weekend cook-up.',
            heroImage: {
                src: '../../assets/images/blog details imgs/pexels-n-voitkevich-5425794.jpg',
                alt: 'Seasonal produce basket prepared for the weekly CSA box'
            },
            previewTitle: 'What’s in this week’s CSA box?',
            previewExcerpt: 'A closer look at current harvest highlights, storage notes, and the easiest ways to build a few good meals from one delivery.',
            contentHtml: `
                <section>
                    <h3>Boxes are packed around quality first, not just variety.</h3>
                    <p>Some weeks the box looks broader, while other weeks it leans into a few things that are especially strong. This delivery is built around spinach, spring onions, radishes, lettuces, herbs, oranges, and a few sturdier staples that can hold for later in the week.</p>
                    <p>That mix is useful because it gives members something crisp to eat right away, something to cook down quickly, and enough anchor produce to keep the box practical rather than decorative.</p>
                </section>
                <figure>
                    <img src="../../assets/images/blog details imgs/pexels-damir-mijailovic-1921088-5542250.jpg" alt="Fresh basil prepared for longer storage" loading="lazy">
                    <figcaption>Greens move fast in early spring, so the packing order is planned around shelf life.</figcaption>
                </figure>
                <section>
                    <h3>Use the most delicate produce early.</h3>
                    <p>Spinach, lettuces, and herbs should set the tone for the first two days. Keep them dry, open up the bunches, and build one meal around them immediately so nothing sits waiting for the perfect plan.</p>
                    <p>The roots and citrus can stretch further. That balance is what makes a weekly box workable for members who want a real food routine, not extra pressure.</p>
                </section>
                <section>
                    <h3>Think in meal anchors, not one recipe per ingredient.</h3>
                    <p>A grain bowl, a quick pasta, and one tray of roasted vegetables already clears most of this week’s produce. Once the cooking starts that way, the rest of the box becomes easier to improvise.</p>
                </section>
            `,
            takeaway: 'Use the greens and herbs first, let the roots carry the middle of the week, and build two anchor meals before you start improvising.',
            seasonalTitle: 'This article matches the current early-spring box pattern.',
            seasonalCopy: 'Members on active routes are likely to keep seeing a similar run of leafy greens, herbs, radishes, and citrus over the next few pickups.',
            seasonalList: [
                'Spinach and lettuces are showing up more often than winter storage crops.',
                'Spring onions and herbs are strong flavor builders right now.',
                'Radishes and citrus help keep meals bright while the season is still cool.'
            ],
            usageTitle: 'Use it well this week.',
            usageList: [
                'Turn the greens into a skillet pasta or folded egg dish on day one.',
                'Roast the roots together and reuse them across lunches for two days.',
                'Finish bowls, toast, or dressings with herbs instead of treating them as garnish.'
            ],
            sourceTitle: 'Packed from nearby growers on short field-to-pack timelines.',
            sourceCopy: 'This mix is assembled from the same regional partner farms that cover greens, herbs, roots, and orchard fruit for the CSA routes. Packing stays close to harvest timing so delicate items arrive with better texture and fewer weak spots.',
            sourceStats: ['6 partner farms in this week’s mixed route', '24-hour target between harvest and pack'],
            tags: ['Farm News', 'Seasonal Produce', 'CSA Tips'],
            related: ['family-box-dinners', 'store-leafy-greens', 'spring-planting'],
            ctaCopy: 'Compare this week’s produce plans, join the route, or go back to the journal for more seasonal guidance.'
        },
        'family-box-dinners': {
            slug: 'family-box-dinners',
            pageTitle: 'Three Dinners From One Family Box | Pure Fields Journal',
            metaDescription: 'Turn one family produce box into three simple dinners without overplanning the week.',
            category: 'Recipes',
            date: 'March 6, 2026',
            author: 'Pure Fields Kitchen Notes',
            title: 'Three dinners from one family box',
            intro: 'The easiest way to use a CSA box is to treat it like a flexible base for a few repeatable meals instead of a pile of ingredients that each need their own recipe.',
            heroImage: {
                src: '../../assets/images/blog details imgs/pexels-farhad-5713732.jpg',
                alt: 'Fresh vegetables arranged for easy weeknight meals'
            },
            previewTitle: 'Three dinners from one family box',
            previewExcerpt: 'A simple dinner rhythm for households that want the box to feel useful, not complicated.',
            contentHtml: `
                <section>
                    <h3>Start with one tray, one pot, and one bowl.</h3>
                    <p>A family box usually has enough range for a roast, a quick stovetop meal, and one cold or room-temperature dinner. That is often all you need for the week to feel organised.</p>
                    <p>Instead of planning by ingredient, plan by format: roasted vegetables with protein, greens folded into pasta or rice, and one bowl meal that clears leftovers.</p>
                </section>
                <figure>
                    <img src="../../assets/images/blog details imgs/pexels-n-voitkevich-5425794.jpg" alt="Seasonal produce basket ready to be turned into a few family meals" loading="lazy">
                    <figcaption>Roasting a larger batch early in the week makes the rest of the box easier to manage.</figcaption>
                </figure>
                <section>
                    <h3>Reuse prep instead of restarting the whole meal plan.</h3>
                    <p>Cook extra grains, keep herbs washed, and leave one dressing or sauce in the fridge. That is usually enough to turn the next two dinners into assembly rather than a full reset.</p>
                </section>
            `,
            takeaway: 'A family box feels easier when you reuse prep across three meal formats instead of planning three unrelated recipes.',
            seasonalTitle: 'The family box is especially useful during mixed spring harvests.',
            seasonalCopy: 'Spring produce gives enough freshness for quick meals and enough sturdy vegetables to carry leftovers through busier days.',
            seasonalList: [
                'Greens work best in the first half of the week.',
                'Roots and citrus make reliable back-half meals.',
                'Herbs can connect all three dinners without extra shopping.'
            ],
            usageTitle: 'Dinner formats that work well.',
            usageList: [
                'Tray bake with roots, onions, and soft herbs.',
                'Greens pasta with citrus and pantry cheese.',
                'Grain bowl using leftover roast vegetables and one quick egg or bean topping.'
            ],
            sourceTitle: 'Built around the Family Box route.',
            sourceCopy: 'The Family Box pulls from the broadest produce mix in the Pure Fields catalog, so it is the clearest example of how one delivery can support several different dinners without feeling repetitive.',
            sourceStats: ['Best for 3 to 5 people', 'Weekly and biweekly delivery options'],
            tags: ['Recipes', 'Family Box', 'CSA Tips'],
            related: ['weekly-box', 'pause-skip-week', 'store-leafy-greens'],
            ctaCopy: 'If this is the rhythm you want at home, compare the Family Box with the smaller plans and choose the cadence that fits your week.'
        },
        'store-leafy-greens': {
            slug: 'store-leafy-greens',
            pageTitle: 'How To Store Leafy Greens So They Last | Pure Fields Journal',
            metaDescription: 'Keep spinach, lettuce, and herbs in better shape through the week with a few simple storage habits.',
            category: 'Seasonal Produce Guides',
            date: 'March 4, 2026',
            author: 'Pure Fields Produce Team',
            title: 'How to store leafy greens so they last',
            intro: 'Most early losses in a CSA box come from moisture, heat, and crowded storage. Small handling changes usually matter more than complicated prep.',
            heroImage: {
                src: '../../assets/images/blog details imgs/pexels-damir-mijailovic-1921088-5542250.jpg',
                alt: 'Fresh basil leaves prepared for storage'
            },
            previewTitle: 'How to store leafy greens so they last',
            previewExcerpt: 'A few simple storage adjustments can stretch spinach, lettuce, and herbs further through the week.',
            contentHtml: `
                <section>
                    <h3>Dry storage is usually the real fix.</h3>
                    <p>Greens break down quickly when they stay pressed together with too much moisture. Unwrap them, line the container or drawer with a towel, and give them a little air rather than sealing them too tightly.</p>
                </section>
                <figure>
                    <img src="../../assets/images/blog details imgs/pexels-shvetsa-5830995.jpg" alt="Careful plant handling before trimming and storage" loading="lazy">
                    <figcaption>Sorting and drying greens early saves more produce than washing everything at once.</figcaption>
                </figure>
                <section>
                    <h3>Separate sturdy bunches from delicate leaves.</h3>
                    <p>Spinach, lettuces, and herbs do not all behave the same way. Lettuces want room, spinach handles cooler storage well, and herbs last better when stems are trimmed and the leaves stay dry.</p>
                    <p>If the week is unpredictable, keep washing to the day you plan to cook. That gives delicate leaves a better chance of holding shape and texture.</p>
                </section>
            `,
            takeaway: 'Dry, separated, lightly protected greens outlast washed and crowded greens almost every time.',
            seasonalTitle: 'Storage matters more when the box turns greener.',
            seasonalCopy: 'As spring ramps up, members receive more tender leaves and herbs, which makes careful handling more useful than during root-heavy winter weeks.',
            seasonalList: [
                'Tender lettuces need airflow and light protection.',
                'Spinach can hold well if kept cool and dry.',
                'Herbs last longer when stored separately from heavier produce.'
            ],
            usageTitle: 'Best ways to use greens before they fade.',
            usageList: [
                'Fold spinach into pasta, eggs, or soup bases.',
                'Use lettuces for wraps and simple lunch plates first.',
                'Blend herbs into dressings, yogurt sauces, or quick pesto.'
            ],
            sourceTitle: 'Drawn from mixed green growers across the local route.',
            sourceCopy: 'These notes come from the farms supplying the weekly greens mix and the packing team that sees where delicate produce succeeds or struggles once it reaches members.',
            sourceStats: ['3 greens-focused growers in rotation', 'Highest-loss produce category in spring'],
            tags: ['Seasonal Produce Guides', 'Storage Tips', 'CSA Tips'],
            related: ['weekly-box', 'family-box-dinners', 'spring-planting'],
            ctaCopy: 'If your box tends to lose steam by midweek, start with the plan size you can genuinely cook through and adjust later from the dashboard.'
        },
        'spring-planting': {
            slug: 'spring-planting',
            pageTitle: 'Field Notes From Early Spring Planting | Pure Fields Journal',
            metaDescription: 'See what local farms are planting in early spring and how it shapes the upcoming CSA boxes.',
            category: 'Farm News',
            date: 'March 2, 2026',
            author: 'North Field Growers',
            title: 'Field notes from early spring planting',
            intro: 'Spring planting always looks slower from the outside than it feels on the farm. Trays, timing, and weather windows shape the next few weeks of the box before members see any of it.',
            heroImage: {
                src: '../../assets/images/blog details imgs/pexels-shvetsa-5830995.jpg',
                alt: 'Hands transplanting seedlings into soil trays'
            },
            previewTitle: 'Field notes from early spring planting',
            previewExcerpt: 'What growers are planting now, and how those decisions shape the next run of CSA deliveries.',
            contentHtml: `
                <section>
                    <h3>Planting season is mostly about timing, not speed.</h3>
                    <p>Growers are balancing warm spells, cool nights, bed preparation, and labor availability. That means the field can look calm while the real work happens in trays, tunnels, and short planting windows.</p>
                </section>
                <figure>
                    <img src="../../assets/images/blog details imgs/pexels-n-voitkevich-5425794.jpg" alt="Seasonal produce basket shaped by early planting decisions" loading="lazy">
                    <figcaption>Early field decisions ripple forward into the market table and the CSA route.</figcaption>
                </figure>
                <section>
                    <h3>What goes in now affects the box later.</h3>
                    <p>Spring onions, lettuces, herbs, and quick greens create the first noticeable shift in member boxes. Slower crops are already being set up, but they will not show up on the route for a little while yet.</p>
                    <p>The best planting plans spread out the season so the box stays useful week after week instead of peaking once and thinning out too fast.</p>
                </section>
            `,
            takeaway: 'The strongest CSA seasons come from steady planting decisions made well before the produce appears in the box.',
            seasonalTitle: 'This is the bridge between winter storage and spring freshness.',
            seasonalCopy: 'Members will notice the season change first through lighter greens, herbs, and alliums before the broader late-spring mix arrives.',
            seasonalList: [
                'Spring onions and lettuces are among the first visible shifts.',
                'Herbs begin to carry more of the flavor load in member meals.',
                'Tunnel crops often stabilize the earliest deliveries.'
            ],
            usageTitle: 'How members can plan around the transition.',
            usageList: [
                'Expect lighter boxes and cook flexible meals early in spring.',
                'Use pantry grains and eggs to turn greens into fuller dinners.',
                'Watch the dashboard for route updates as harvest volume changes.'
            ],
            sourceTitle: 'Reported with notes from North Field and two tunnel growers.',
            sourceCopy: 'The story draws from partner growers handling early plantings for mixed greens, herbs, alliums, and first-run lettuces on the Pure Fields route.',
            sourceStats: ['2 tunnel growers', '4 main spring planting windows'],
            tags: ['Farm News', 'Seasonal Produce', 'Grower Notes'],
            related: ['weekly-box', 'store-leafy-greens', 'spring-market-dates'],
            ctaCopy: 'Follow the next phase of the season through the journal, or step into the produce plans if you want the harvest updates to become part of your weekly routine.'
        },
        'pause-skip-week': {
            slug: 'pause-skip-week',
            pageTitle: 'How To Pause Or Skip A Week Without Losing Rhythm | Pure Fields Journal',
            metaDescription: 'A practical guide to pausing, skipping, or adjusting your CSA plan without making the subscription harder to manage.',
            category: 'CSA Tips',
            date: 'February 28, 2026',
            author: 'Pure Fields Member Support',
            title: 'How to pause or skip a week without losing rhythm',
            intro: 'Good subscription systems should flex with real schedules. Members usually get the most from a CSA when they adjust early and keep the plan matched to how they are actually cooking.',
            heroImage: {
                src: '../../assets/images/blog details imgs/pexels-valeri-mak-2319397-8523085.jpg',
                alt: 'Member checking CSA schedule updates on a phone'
            },
            previewTitle: 'How to pause or skip a week without losing rhythm',
            previewExcerpt: 'Travel, busy weeks, and changing schedules do not need to break the value of a produce subscription.',
            contentHtml: `
                <section>
                    <h3>Skipping a week works best when it happens before the route locks.</h3>
                    <p>The closer the box is to packing, the fewer options there are. Members who update their plan early usually keep the most control over billing, delivery, and when the next box resumes.</p>
                </section>
                <figure>
                    <img src="../../assets/images/blog details imgs/pexels-khwanchai-4174744.jpg" alt="Grocery bag handoff at a member pickup point" loading="lazy">
                    <figcaption>Matching the plan to the real week keeps the subscription useful instead of wasteful.</figcaption>
                </figure>
                <section>
                    <h3>Use the dashboard to resize before you cancel.</h3>
                    <p>Many households do better by switching cadence or box size rather than stopping entirely. The goal is consistency that fits the season of life you are in now.</p>
                </section>
            `,
            takeaway: 'The best subscription is the one you can adjust early, not the one you feel locked into.',
            seasonalTitle: 'Membership flexibility matters during busy harvest transitions.',
            seasonalCopy: 'As the box changes by season, households often need to tweak size, cadence, or skip timing to keep the produce manageable.',
            seasonalList: [
                'Travel weeks are easier to handle when skipped before billing closes.',
                'Smaller households often move between plan sizes across the year.',
                'Dashboard updates keep the route cleaner for both members and farms.'
            ],
            usageTitle: 'Practical actions members should take.',
            usageList: [
                'Pause early if you know you will not cook the next box.',
                'Switch plans instead of cancelling if the issue is volume.',
                'Update the delivery address before the route cutoff, not after.'
            ],
            sourceTitle: 'Built from member support patterns across the CSA cycle.',
            sourceCopy: 'These recommendations reflect the common requests Pure Fields sees around travel, seasonal schedule changes, and households that need different box sizes at different points in the year.',
            sourceStats: ['Most requests happen before holidays and school breaks', 'Dashboard changes are fastest before billing renewal'],
            tags: ['CSA Tips', 'Membership', 'Dashboard'],
            related: ['family-box-dinners', 'weekly-box', 'shorter-food-routes'],
            ctaCopy: 'If flexibility matters to your household, compare the plans and use the dashboard tools as part of the subscription instead of treating them like a fallback.'
        },
        'shorter-food-routes': {
            slug: 'shorter-food-routes',
            pageTitle: 'Why Shorter Food Routes Matter | Pure Fields Journal',
            metaDescription: 'Freshness matters, but shorter food routes also change waste, planning, and how local farms move produce.',
            category: 'Sustainability',
            date: 'February 25, 2026',
            author: 'Pure Fields Sourcing Notes',
            title: 'Why shorter food routes matter',
            intro: 'Shorter routes are not only about freshness. They affect timing, waste, pack quality, and how much room farms have to grow for real demand instead of broad speculation.',
            heroImage: {
                src: '../../assets/images/blog details imgs/pexels-artempodrez-5025664.jpg',
                alt: 'Route boxes loaded for a local delivery run'
            },
            previewTitle: 'Why shorter food routes matter',
            previewExcerpt: 'A tighter sourcing loop changes quality, planning, and waste in ways most shoppers never see.',
            contentHtml: `
                <section>
                    <h3>Distance changes more than freshness.</h3>
                    <p>Longer routes usually require harder harvesting, more packaging, and more time between field and kitchen. Shorter routes allow the produce to be packed closer to its best eating window.</p>
                </section>
                <figure>
                    <img src="../../assets/images/blog details imgs/pexels-khwanchai-4174744.jpg" alt="Member pickup handoff on a local route" loading="lazy">
                    <figcaption>Shorter routes keep produce closer to growers, pack teams, and members in the same weekly loop.</figcaption>
                </figure>
                <section>
                    <h3>Local distribution also changes planning.</h3>
                    <p>When farms and packing routes stay closer together, the system can respond faster to weather, volume shifts, and substitutions. That makes the box more honest to the season rather than pretending everything is always available.</p>
                    <p>Better timing and less handling can reduce spoilage before the box reaches the member, which means the value of the subscription is carried further into the week.</p>
                </section>
            `,
            takeaway: 'Shorter sourcing routes improve quality, reduce handling, and make seasonal planning more truthful.',
            seasonalTitle: 'Seasonality is easier to see when the route is local.',
            seasonalCopy: 'Members notice cleaner produce shifts because the box follows the nearby harvest more directly instead of smoothing it out through distant supply chains.',
            seasonalList: [
                'Boxes reflect local weather changes faster.',
                'Substitutions are easier when grower and pack teams stay close.',
                'Delicate produce benefits most from shorter handling chains.'
            ],
            usageTitle: 'What this means in the kitchen.',
            usageList: [
                'Use delicate produce first and trust the quality window.',
                'Expect more honest seasonal shifts in the box contents.',
                'Build meals around what is strong locally rather than a fixed shopping list.'
            ],
            sourceTitle: 'Grounded in the Pure Fields partner route.',
            sourceCopy: 'The article reflects the sourcing structure Pure Fields uses across nearby mixed-vegetable farms, orchard partners, and pickup routes designed around harvest timing rather than broad warehouse storage.',
            sourceStats: ['Regional rather than national sourcing focus', 'Fewer handling steps before delivery'],
            tags: ['Sustainability', 'Farm News', 'Seasonal Produce'],
            related: ['weekly-box', 'spring-planting', 'pause-skip-week'],
            ctaCopy: 'If you want a produce routine built around local timing instead of supermarket consistency, start by comparing the current CSA plans and route options.'
        },
        'spring-market-dates': {
            slug: 'spring-market-dates',
            pageTitle: 'Spring Market Dates And Member Tasting Table | Pure Fields Journal',
            metaDescription: 'See the upcoming pickup-day tastings, field walks, and local spring market dates for CSA members.',
            category: 'Community Events',
            date: 'February 22, 2026',
            author: 'Pure Fields Community Team',
            title: 'Spring market dates and member tasting table',
            intro: 'The CSA works best when the box is not the only connection. Seasonal tastings, pickup-day conversations, and simple field events help members understand what is changing and why.',
            heroImage: {
                src: '../../assets/images/blog details imgs/pexels-yankrukov-5479515.jpg',
                alt: 'Family visiting a greenhouse during a seasonal farm event'
            },
            previewTitle: 'Spring market dates and member tasting table',
            previewExcerpt: 'Upcoming tastings, field walks, and member events that connect the journal back to the local farm community.',
            contentHtml: `
                <section>
                    <h3>Events make the season easier to read.</h3>
                    <p>A tasting table or short grower conversation helps members connect the produce in the box to what is happening in the field. That context often changes how the box gets used at home.</p>
                </section>
                <figure>
                    <img src="../../assets/images/blog details imgs/pexels-khwanchai-4174744.jpg" alt="Produce handoff during a community pickup event" loading="lazy">
                    <figcaption>Simple pickup-day moments often create the strongest connection between members and the route.</figcaption>
                </figure>
                <section>
                    <h3>Keep events practical and tied to the route.</h3>
                    <p>The best member events are small, timely, and useful. A pickup-day sample, a quick storage demo, or a short field walk usually lands better than anything overproduced.</p>
                    <p>Members come away with a better sense of what is in season, who grew it, and how the subscription works when community moments stay close to the real CSA system.</p>
                </section>
            `,
            takeaway: 'Community events work when they strengthen trust in the box, the growers, and the seasonal rhythm behind the route.',
            seasonalTitle: 'Spring is the best time to reconnect members to the field.',
            seasonalCopy: 'As the harvest mix starts changing again, events help members understand what is arriving, what is coming next, and why the box shifts week to week.',
            seasonalList: [
                'Tasting tables help members try less familiar produce.',
                'Field walks turn harvest updates into something visible.',
                'Pickup conversations often reduce confusion about substitutions.'
            ],
            usageTitle: 'Good ways to use event ideas at home.',
            usageList: [
                'Turn tasting-table combinations into quick lunch plates.',
                'Repeat storage demos as part of your box unpack routine.',
                'Use event notes to choose the right plan size for your household.'
            ],
            sourceTitle: 'Drawn from community pickup sites and partner farms.',
            sourceCopy: 'These notes come from local pickup teams, partner growers, and member-facing events designed to keep the CSA connected to the people actually packing and growing the produce.',
            sourceStats: ['Pickup tastings planned across spring', 'Field walks tied to partner farm calendars'],
            tags: ['Community Events', 'Farm News', 'CSA Tips'],
            related: ['weekly-box', 'spring-planting', 'shorter-food-routes'],
            ctaCopy: 'Follow the community calendar through the journal, then step into the plans if you want those pickup-day moments tied to your own weekly box.'
        }
    };

    const articleSlug = new URLSearchParams(window.location.search).get('article');
    const activeArticle = articleLibrary[articleSlug] || articleLibrary['weekly-box'];

    const setText = function(id, value) {
        const node = document.getElementById(id);
        if (node) node.textContent = value;
    };

    const renderList = function(id, items) {
        const list = document.getElementById(id);
        if (!list) return;
        list.innerHTML = items.map(function(item) {
            return '<li>' + item + '</li>';
        }).join('');
    };

    setText('article-breadcrumb-category', activeArticle.category);
    setText('article-meta-category', activeArticle.category);
    setText('article-meta-date', activeArticle.date);
    setText('article-meta-author', activeArticle.author);
    setText('article-title', activeArticle.title);
    setText('article-intro', activeArticle.intro);
    setText('article-takeaway-copy', activeArticle.takeaway);
    setText('article-seasonal-title', activeArticle.seasonalTitle);
    setText('article-seasonal-copy', activeArticle.seasonalCopy);
    setText('article-usage-title', activeArticle.usageTitle);
    setText('article-source-title', activeArticle.sourceTitle);
    setText('article-source-copy', activeArticle.sourceCopy);
    setText('article-cta-copy', activeArticle.ctaCopy);

    renderList('article-seasonal-list', activeArticle.seasonalList);
    renderList('article-usage-list', activeArticle.usageList);

    const heroImage = document.getElementById('article-hero-image');
    if (heroImage) {
        heroImage.src = activeArticle.heroImage.src;
        heroImage.alt = activeArticle.heroImage.alt;
    }

    const contentBody = document.getElementById('article-content-body');
    if (contentBody) contentBody.innerHTML = activeArticle.contentHtml;

    const sourceStats = document.getElementById('article-source-stats');
    if (sourceStats) {
        sourceStats.innerHTML = activeArticle.sourceStats.map(function(item) {
            return '<span class="blog-detail-source-stat">' + item + '</span>';
        }).join('');
    }

    const articleTags = document.getElementById('article-tags');
    if (articleTags) {
        articleTags.innerHTML = activeArticle.tags.map(function(tag) {
            return '<a class="blog-detail-tag" href="blog.html#latest-posts">' + tag + '</a>';
        }).join('');
    }

    const relatedGrid = document.getElementById('article-related-grid');
    if (relatedGrid) {
        relatedGrid.innerHTML = activeArticle.related.map(function(slug) {
            const relatedArticle = articleLibrary[slug];
            if (!relatedArticle) return '';

            return [
                '<article class="blog-detail-related-card">',
                '<a href="blog-details.html?article=' + relatedArticle.slug + '" aria-label="Read ' + relatedArticle.previewTitle + '">',
                '<img src="' + relatedArticle.heroImage.src + '" alt="' + relatedArticle.heroImage.alt + '" loading="lazy">',
                '</a>',
                '<div class="blog-detail-related-card__content">',
                '<div class="blog-detail-meta">',
                '<span>' + relatedArticle.category + '</span>',
                '<span>' + relatedArticle.date + '</span>',
                '</div>',
                '<h3><a href="blog-details.html?article=' + relatedArticle.slug + '">' + relatedArticle.previewTitle + '</a></h3>',
                '<p>' + relatedArticle.previewExcerpt + '</p>',
                '</div>',
                '</article>'
            ].join('');
        }).join('');
    }

    document.title = activeArticle.pageTitle;

    const metaDescription = document.querySelector('meta[name="description"]');
    const canonical = document.querySelector('link[rel="canonical"]');
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDescription = document.querySelector('meta[property="og:description"]');
    const ogImage = document.querySelector('meta[property="og:image"]');
    const ogUrl = document.querySelector('meta[property="og:url"]');
    const twitterTitle = document.querySelector('meta[property="twitter:title"]');
    const twitterDescription = document.querySelector('meta[property="twitter:description"]');
    const twitterImage = document.querySelector('meta[property="twitter:image"]');
    const twitterUrl = document.querySelector('meta[property="twitter:url"]');
    const schemaScript = document.getElementById('blog-article-schema');
    const articleUrl = 'https://purefields.com/blog-details.html?article=' + activeArticle.slug;

    if (metaDescription) metaDescription.setAttribute('content', activeArticle.metaDescription);
    if (canonical) canonical.setAttribute('href', articleUrl);
    if (ogTitle) ogTitle.setAttribute('content', activeArticle.pageTitle);
    if (ogDescription) ogDescription.setAttribute('content', activeArticle.metaDescription);
    if (ogImage) ogImage.setAttribute('content', activeArticle.heroImage.src);
    if (ogUrl) ogUrl.setAttribute('content', articleUrl);
    if (twitterTitle) twitterTitle.setAttribute('content', activeArticle.pageTitle);
    if (twitterDescription) twitterDescription.setAttribute('content', activeArticle.metaDescription);
    if (twitterImage) twitterImage.setAttribute('content', activeArticle.heroImage.src);
    if (twitterUrl) twitterUrl.setAttribute('content', articleUrl);

    if (schemaScript) {
        schemaScript.textContent = JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: activeArticle.title,
            description: activeArticle.metaDescription,
            author: {
                '@type': 'Organization',
                name: activeArticle.author
            },
            publisher: {
                '@type': 'Organization',
                name: 'Pure Fields',
                logo: {
                    '@type': 'ImageObject',
                    url: 'https://purefields.com/assets/images/pure-fields-favicon.svg'
                }
            },
            image: activeArticle.heroImage.src,
            mainEntityOfPage: articleUrl
        });
    }
});

/* =============================================================================
   17. CART PAGE DETAILS
   =============================================================================
   Purpose: Keeps the standalone cart page in sync with the selected CSA plan
   Features:
   - Reads the plan from ?plan=small|family|fruit|vegetable
   - Updates plan details, subscription notes, and close/checkout links
   - Calculates quantity, add-ons, delivery fees, tax, and total
================================================================================ */

document.addEventListener('DOMContentLoaded', function() {
    const cartRoot = document.querySelector('.cart-page .cart-modal');
    if (!cartRoot) return;

    const planKey = new URLSearchParams(window.location.search).get('plan');

    const cartPlans = {
        small: {
            name: 'Small Box',
            price: 22,
            badge: 'Small Box',
            summary: 'A lighter CSA plan for solo members or couples who want a compact weekly mix without overbuying.',
            size: '6-8 seasonal items',
            frequency: 'Weekly',
            cadence: 'Weekly delivery',
            billingNote: 'Billing starts on the next open route for the Small Box plan.',
            closeLink: 'products-details.html?plan=small',
            checkoutLink: '../auth/register.html?plan=small'
        },
        family: {
            name: 'Family Box',
            price: 34,
            badge: 'Family Box',
            summary: 'A balanced CSA plan for households that cook most nights and want enough range for dinners, lunches, and a few flexible staples.',
            size: '10-12 seasonal items',
            frequency: 'Weekly',
            cadence: 'Weekly delivery',
            billingNote: 'Billing will start on the next open route once you complete checkout.',
            closeLink: 'products-details.html?plan=family',
            checkoutLink: '../auth/register.html?plan=family'
        },
        fruit: {
            name: 'Fruit Box',
            price: 28,
            badge: 'Fruit Box',
            summary: 'A fruit-focused subscription built around orchard partners, berry growers, and seasonal citrus on the local route.',
            size: '8-10 fruit items',
            frequency: 'Weekly or biweekly',
            cadence: 'Biweekly delivery by default',
            billingNote: 'Fruit Box billing follows your selected weekly or biweekly route.',
            closeLink: 'products-details.html?plan=fruit',
            checkoutLink: '../auth/register.html?plan=fruit'
        },
        vegetable: {
            name: 'Vegetable Box',
            price: 30,
            badge: 'Vegetable Box',
            summary: 'A vegetable-first plan for members who cook heavily from produce and want a deeper savory mix each week.',
            size: '9-11 vegetable items',
            frequency: 'Weekly',
            cadence: 'Weekly delivery',
            billingNote: 'Vegetable Box billing begins on the next available weekly route.',
            closeLink: 'products-details.html?plan=vegetable',
            checkoutLink: '../auth/register.html?plan=vegetable'
        }
    };

    const activePlan = planKey && cartPlans[planKey] ? cartPlans[planKey] : null;
    const qtyInput = document.getElementById('cart-qty-input');
    const decreaseButton = document.getElementById('cart-qty-decrease');
    const increaseButton = document.getElementById('cart-qty-increase');
    const addonInputs = document.querySelectorAll('[data-addon-price]');
    const fulfillmentInputs = document.querySelectorAll('input[name="fulfillment"]');
    const routeField = document.getElementById('cart-route');
    const windowField = document.getElementById('cart-window');
    const addressFields = document.querySelectorAll('#cart-address-line-1, #cart-city, #cart-zip');
    const formatCurrency = function(value) {
        return '$' + value.toFixed(2);
    };

    const setText = function(id, value) {
        const node = document.getElementById(id);
        if (node) node.textContent = value;
    };

    const setDisabledState = function(disabled) {
        const badge = document.getElementById('cart-plan-badge');
        const checkoutLink = document.getElementById('cart-checkout-link');

        if (qtyInput) qtyInput.disabled = disabled;
        if (decreaseButton) decreaseButton.disabled = disabled;
        if (increaseButton) increaseButton.disabled = disabled;
        if (routeField) routeField.disabled = disabled;
        if (windowField) windowField.disabled = disabled;

        addonInputs.forEach(function(input) {
            if (disabled) input.checked = false;
            input.disabled = disabled;
        });

        fulfillmentInputs.forEach(function(input) {
            input.disabled = disabled;
            if (disabled) input.checked = input.value === 'delivery';
        });

        addressFields.forEach(function(input) {
            input.disabled = disabled;
        });

        if (badge) badge.hidden = disabled;

        if (checkoutLink) {
            checkoutLink.textContent = disabled ? 'Choose a Plan' : 'Proceed to Checkout';
            checkoutLink.href = disabled ? 'products.html#plans' : activePlan.checkoutLink;
            checkoutLink.classList.toggle('is-disabled', false);
        }
    };

    const updatePlanDetails = function() {
        if (!activePlan) {
            setText('cart-plan-name', 'No plan selected');
            setText('cart-plan-summary', 'Your selected subscription will appear here once you add it from a plan detail page.');
            setText('cart-plan-size', 'Not added');
            setText('cart-plan-price', '$0');
            setText('cart-plan-frequency', 'Choose a CSA plan to begin checkout.');
            setText('cart-plan-frequency-detail', 'Not set');
            setText('cart-billing-note', 'Choose a plan from the products page before checkout becomes available.');

            const closeLink = document.getElementById('cart-close-link');
            if (closeLink) closeLink.href = 'products.html';

            setDisabledState(true);
            return;
        }

        setText('cart-plan-badge', activePlan.badge);
        setText('cart-plan-name', activePlan.name);
        setText('cart-plan-summary', activePlan.summary);
        setText('cart-plan-size', activePlan.size);
        setText('cart-plan-price', '$' + activePlan.price);
        setText('cart-plan-frequency', activePlan.cadence);
        setText('cart-plan-frequency-detail', activePlan.frequency);
        setText('cart-billing-note', activePlan.billingNote);

        const closeLink = document.getElementById('cart-close-link');
        const checkoutLink = document.getElementById('cart-checkout-link');
        if (closeLink) closeLink.href = activePlan.closeLink;
        if (checkoutLink) checkoutLink.href = activePlan.checkoutLink;
        setDisabledState(false);
    };

    const getQuantity = function() {
        if (!qtyInput) return 1;
        const parsed = parseInt(qtyInput.value, 10);
        return Number.isNaN(parsed) || parsed < 1 ? 1 : parsed;
    };

    const getAddonTotal = function() {
        let total = 0;
        addonInputs.forEach(function(input) {
            if (!input.checked) return;
            total += parseFloat(input.getAttribute('data-addon-price'));
        });
        return total;
    };

    const getDeliveryFee = function() {
        if (fulfillmentInputs.length === 0) return 0;
        const selected = document.querySelector('input[name="fulfillment"]:checked');
        return selected && selected.value === 'pickup' ? 0 : 6;
    };

    const recalcTotals = function() {
        if (!activePlan) {
            setText('cart-line-plan', '$0.00');
            setText('cart-line-addons', '$0.00');
            setText('cart-line-delivery', '$0.00');
            setText('cart-line-tax', '$0.00');
            setText('cart-line-total', '$0.00');
            return;
        }

        const quantity = getQuantity();
        const planSubtotal = activePlan.price * quantity;
        const addons = addonInputs.length > 0 ? getAddonTotal() : 0;
        const delivery = getDeliveryFee();
        const safeSubtotal = planSubtotal + addons + delivery;
        const tax = safeSubtotal * 0.065;
        const total = safeSubtotal + tax;

        setText('cart-line-plan', formatCurrency(planSubtotal));
        setText('cart-line-addons', formatCurrency(addons));
        setText('cart-line-delivery', formatCurrency(delivery));
        setText('cart-line-tax', formatCurrency(tax));
        setText('cart-line-total', formatCurrency(total));
    };

    updatePlanDetails();
    recalcTotals();

    if (decreaseButton && qtyInput) {
        decreaseButton.addEventListener('click', function() {
            qtyInput.value = Math.max(1, getQuantity() - 1);
            recalcTotals();
        });
    }

    if (increaseButton && qtyInput) {
        increaseButton.addEventListener('click', function() {
            qtyInput.value = getQuantity() + 1;
            recalcTotals();
        });
    }

    if (qtyInput) {
        qtyInput.addEventListener('input', function() {
            if (getQuantity() !== parseInt(qtyInput.value, 10)) qtyInput.value = getQuantity();
            recalcTotals();
        });
    }

    addonInputs.forEach(function(input) {
        input.addEventListener('change', recalcTotals);
    });

    fulfillmentInputs.forEach(function(input) {
        input.addEventListener('change', function() {
            recalcTotals();
        });
    });

});

/* =============================================================================
   18. AUTH PAGE NOTE
   =============================================================================
   Purpose: Documents that the auth pages rely on native form behavior
   Notes:
   - Login and register pages use standalone HTML forms without page-specific JS
   - Shared global scripts still load safely for consistency across the project
================================================================================ */

/* =============================================================================
   19. CONTACT PAGE NOTE
   =============================================================================
   Purpose: Documents that the contact page relies on native HTML behavior
   Notes:
   - No page-specific JavaScript is required for the contact form layout
   - FAQ preview uses native <details>/<summary> interactions
   - Shared newsletter validation and site navigation behavior still apply
================================================================================ */

/* =============================================================================
   END OF JAVASCRIPT
   =============================================================================

   For questions or issues, please refer to:
   - INSTALLATION.md for setup instructions
   - CUSTOMIZATION.md for customization options
   - README.md for project overview

================================================================================ */
