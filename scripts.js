/**
 * Taniti Island Tourism Website
 * scripts.js — Main JavaScript entry point
 *
 * This file initializes all interactive features for the Taniti Island
 * tourism site. Each feature is organized into its own clearly named
 * function so they're easy to find, update, or remove independently.
 *
 * Functions are defined below and all wired up at the bottom of this
 * file inside a single DOMContentLoaded listener. If you add a new
 * feature, define it as its own function and call it down there.
 *
 * Author: Abraham Macias
 * Last updated: 2026
 */


// =============================================================================
// MOBILE MENU
// Handles the hamburger menu toggle for small screens.
// The menu closes automatically when the user clicks anywhere outside of it,
// which prevents the common UX issue of a stuck-open nav on mobile.
// =============================================================================
function initMobileMenu() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    // Exit quietly if the menu elements aren't on this page
    if (!menuToggle || !navLinks) return;

    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('show');

        // Keep aria-expanded in sync so screen readers announce the correct state
        const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
        menuToggle.setAttribute('aria-expanded', String(!isExpanded));
    });

    // Close the menu when the user clicks anywhere outside the nav bar
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.main-nav') && navLinks.classList.contains('show')) {
            navLinks.classList.remove('show');
            menuToggle.setAttribute('aria-expanded', 'false');
        }
    });

    // Set up ARIA relationships so assistive tech knows what the button controls
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-controls', 'nav-links');
    navLinks.id = 'nav-links';
}


// =============================================================================
// FAQ ACCORDION
// Collapses and expands FAQ answers when users click a question heading.
// Only one answer is open at a time — closing the previous item keeps the
// page from becoming a wall of text. Deep-linking via URL hash is also
// supported, so you can link directly to a specific question.
// =============================================================================
function initFaqAccordion() {
    const faqItems = document.querySelectorAll('.faq-item h3');

    if (!faqItems.length) return;

    faqItems.forEach((item, index) => {
        // Build unique IDs so ARIA can link each question to its answer
        const itemId   = `faq-${index}`;
        const answerId = `faq-answer-${index}`;
        const answer   = item.nextElementSibling;

        item.setAttribute('aria-expanded', 'false');
        item.setAttribute('aria-controls', answerId);
        item.id = itemId;

        answer.setAttribute('aria-labelledby', itemId);
        answer.id = answerId;
        answer.setAttribute('role', 'region');

        item.addEventListener('click', () => {
            const parent     = item.parentElement;
            const isExpanded = item.getAttribute('aria-expanded') === 'true';

            // Close every other open item before opening this one
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.setAttribute('aria-expanded', 'false');
                    otherItem.parentElement.classList.remove('active');
                }
            });

            // Toggle the clicked item open or closed
            parent.classList.toggle('active');
            item.setAttribute('aria-expanded', String(!isExpanded));
        });
    });

    // If the URL contains a hash pointing to a specific FAQ item,
    // open and scroll to it automatically on page load
    if (window.location.hash) {
        const targetFaq = document.querySelector(window.location.hash);
        if (targetFaq && targetFaq.classList.contains('faq-item')) {
            targetFaq.querySelector('h3').click();
            targetFaq.scrollIntoView({ behavior: 'smooth' });
        }
    }
}


// =============================================================================
// TAB SWITCHING
// Manages the category tabs on the FAQ page (e.g. "Getting Here", "Safety").
// Uses ARIA roles (tab / tabpanel) so keyboard users and screen readers
// can navigate tabs without a mouse.
// =============================================================================
function initTabSwitching() {
    const tabButtons  = document.querySelectorAll('.tab-btn');
    const tabSections = document.querySelectorAll('.faq-section');

    if (!tabButtons.length || !tabSections.length) return;

    tabButtons.forEach(button => {
        // Wire up the click handler to switch the visible section
        button.addEventListener('click', () => {
            const target = button.dataset.target;

            // Deactivate all buttons, then activate the one that was clicked
            tabButtons.forEach(btn => {
                btn.classList.remove('active');
                btn.setAttribute('aria-selected', 'false');
            });
            button.classList.add('active');
            button.setAttribute('aria-selected', 'true');

            // Hide all sections, then show only the matching one
            tabSections.forEach(section => {
                section.classList.remove('active');
                section.setAttribute('aria-hidden', 'true');

                if (section.id === target) {
                    section.classList.add('active');
                    section.setAttribute('aria-hidden', 'false');
                }
            });
        });

        // ARIA setup: each button is a "tab" and controls a specific "tabpanel"
        button.setAttribute('role', 'tab');
        button.setAttribute('aria-selected', button.classList.contains('active') ? 'true' : 'false');
        button.id = `tab-${button.dataset.target}`;
        button.setAttribute('aria-controls', button.dataset.target);
    });

    // Each section is a "tabpanel" labelled by its corresponding tab button
    tabSections.forEach(section => {
        section.setAttribute('role', 'tabpanel');
        section.setAttribute('aria-hidden', String(!section.classList.contains('active')));
        section.setAttribute('aria-labelledby', `tab-${section.id}`);
    });
}


// =============================================================================
// NOTIFICATION BANNER
// Handles the dismissible announcement bar at the top of the page.
// The closed state is saved to sessionStorage so the banner stays hidden
// if the user refreshes the page during the same browser session.
// If you want the banner to reappear every visit, swap sessionStorage
// for a cookie with an expiry date instead.
// =============================================================================
function initNotificationBanner() {
    const closeBtn = document.querySelector('.close-notification');
    const banner   = document.querySelector('.notification-banner');

    if (!closeBtn || !banner) return;

    // Hide the banner immediately if the user already closed it this session
    if (sessionStorage.getItem('notificationClosed') === 'true') {
        banner.style.display = 'none';
        return;
    }

    closeBtn.addEventListener('click', () => {
        // Fade out first, then remove from the DOM once the animation finishes
        banner.classList.add('fade-out');
        setTimeout(() => banner.remove(), 500);

        // Remember the dismissal for the rest of this browser session
        sessionStorage.setItem('notificationClosed', 'true');
    });
}


// =============================================================================
// FAQ SEARCH
// Filters FAQ items in real time based on the user's search term.
// Matching items stay visible and their matching text gets highlighted.
// When the user switches tabs, highlights are cleared and all items
// are restored so the page looks normal again.
//
// Note: innerHTML replacement is used for highlighting. If this site
// ever accepts user-submitted FAQ content, sanitize before rendering.
// =============================================================================
function initSearchFunctionality() {
    const searchForm  = document.querySelector('.search-form');
    const searchInput = document.querySelector('#faq-search');

    if (!searchForm || !searchInput) return;

    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const searchTerm = searchInput.value.toLowerCase().trim();

        if (!searchTerm) return;

        const faqItems   = document.querySelectorAll('.faq-item');
        let foundResults = false;

        // Reset all sections and tab highlights before applying new search results
        document.querySelectorAll('.faq-section').forEach(s => s.classList.remove('active'));
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));

        faqItems.forEach(item => {
            const question = item.querySelector('h3').textContent.toLowerCase();
            const answer   = item.querySelector('.faq-answer').textContent.toLowerCase();

            // Hide every item by default; only show ones that match
            item.style.display = 'none';

            if (question.includes(searchTerm) || answer.includes(searchTerm)) {
                item.style.display = 'block';

                // Make sure the section containing this match is visible
                const parentSection = item.closest('.faq-section');
                parentSection.classList.add('active');

                // Also activate the corresponding tab so it looks selected
                const relatedTab = document.querySelector(`[data-target="${parentSection.id}"]`);
                if (relatedTab) relatedTab.classList.add('active');

                foundResults = true;
                highlightSearchTerms(item, searchTerm);
            }
        });

        // Show or create the results summary message below the search bar
        const resultsMessage = document.querySelector('.search-results-message') || createResultsMessage();

        if (foundResults) {
            resultsMessage.textContent = `Search results for: "${searchTerm}"`;
            resultsMessage.classList.remove('error');
        } else {
            resultsMessage.textContent = `No results found for: "${searchTerm}". Please try different keywords.`;
            resultsMessage.classList.add('error');

            // Fall back to showing the first section so the page isn't blank
            const firstSection = document.querySelector('.faq-section');
            if (firstSection) firstSection.classList.add('active');
            const firstTab = document.querySelector('.tab-btn');
            if (firstTab) firstTab.classList.add('active');
        }
    });

    // Creates and inserts the results summary element if it doesn't exist yet
    function createResultsMessage() {
        const message = document.createElement('div');
        message.className = 'search-results-message';
        searchForm.parentNode.insertBefore(message, searchForm.nextSibling);
        return message;
    }

    // Wraps matching text in <mark> tags for visual highlighting.
    // Stores the original HTML first so we can restore it cleanly later.
    function highlightSearchTerms(item, searchTerm) {
        const question = item.querySelector('h3');
        const answer   = item.querySelector('.faq-answer');

        // Save originals only once — prevents highlight-on-highlight stacking
        if (!question.dataset.original) {
            question.dataset.original = question.innerHTML;
            answer.dataset.original   = answer.innerHTML;
        }

        // Restore to original before re-applying highlights
        question.innerHTML = question.dataset.original;
        answer.innerHTML   = answer.dataset.original;

        const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
        question.innerHTML = question.innerHTML.replace(regex, '<mark>$1</mark>');
        answer.innerHTML   = answer.innerHTML.replace(regex, '<mark>$1</mark>');
    }

    // Escapes special regex characters in user input to prevent regex injection
    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // When the user switches tabs manually, clear search highlights and restore
    // all items so the selected tab shows its full content
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.faq-item').forEach(item => {
                item.style.display = 'block';

                const question = item.querySelector('h3');
                const answer   = item.querySelector('.faq-answer');

                if (question.dataset.original) {
                    question.innerHTML = question.dataset.original;
                    answer.innerHTML   = answer.dataset.original;
                }
            });

            // Clear the results summary when switching tabs
            const resultsMessage = document.querySelector('.search-results-message');
            if (resultsMessage) resultsMessage.textContent = '';
        });
    });
}


// =============================================================================
// FORM VALIDATION
// Validates all forms on the page except the FAQ search bar.
// Required fields are checked on submit, and email fields get a format check.
// Contact and newsletter forms show a success message instead of actually
// submitting — hook this up to a real backend (e.g. Formspree, EmailJS)
// when you're ready to go live.
// =============================================================================
function initFormValidation() {
    const forms = document.querySelectorAll('form:not(.search-form)');

    if (!forms.length) return;

    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            let isValid = true;
            const requiredInputs = form.querySelectorAll('[required]');

            requiredInputs.forEach(input => {
                // Clear any previous error on this field before re-validating
                const existingError = input.parentNode.querySelector('.error-message');
                if (existingError) existingError.remove();

                if (!input.value.trim()) {
                    isValid = false;
                    showError(input, 'This field is required');
                } else if (input.type === 'email' && !isValidEmail(input.value)) {
                    isValid = false;
                    showError(input, 'Please enter a valid email address');
                }
            });

            if (!isValid) {
                // Block submission and scroll the first error into view
                e.preventDefault();
                const firstError = form.querySelector('.error-message');
                if (firstError) {
                    firstError.parentNode.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            } else if (form.classList.contains('contact-form') || form.classList.contains('newsletter-form')) {
                // Intercept submission and show a friendly success state.
                // Replace this block with a real API call (e.g. fetch + EmailJS) for production.
                e.preventDefault();
                showFormSuccess(form);
            }
        });
    });

    // Appends an inline error message below the invalid field
    function showError(input, message) {
        const errorEl = document.createElement('div');
        errorEl.className = 'error-message';
        errorEl.textContent = message;

        input.parentNode.appendChild(errorEl);
        input.setAttribute('aria-invalid', 'true');
        input.classList.add('input-error');
    }

    // Basic email format check — not exhaustive, but catches obvious typos
    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // Replaces the form with a thank-you message and a button to submit again
    function showFormSuccess(form) {
        form.style.display = 'none';

        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';

        if (form.classList.contains('contact-form')) {
            successMessage.innerHTML = `
                <h3>Thank you for your message!</h3>
                <p>We've received your inquiry and will respond within 24 hours.</p>
            `;
        } else if (form.classList.contains('newsletter-form')) {
            successMessage.innerHTML = `
                <h3>Successfully subscribed!</h3>
                <p>Thanks for signing up — you'll hear from us soon about all things Taniti.</p>
            `;
        } else {
            successMessage.innerHTML = `
                <h3>Submitted successfully!</h3>
                <p>Thank you for your submission.</p>
            `;
        }

        // Give the user a way to submit another message without refreshing the page
        const resetButton = document.createElement('button');
        resetButton.className = 'btn btn-primary mt-3';
        resetButton.textContent = 'Send another message';
        resetButton.addEventListener('click', () => {
            form.reset();
            form.style.display = 'block';
            successMessage.remove();
        });

        successMessage.appendChild(resetButton);
        form.parentNode.appendChild(successMessage);
    }
}


// =============================================================================
// GALLERY LIGHTBOX
// Opens a full-screen overlay when a gallery image is clicked, with
// previous/next navigation and keyboard support (arrow keys + Escape).
// Body scrolling is locked while the lightbox is open so the overlay
// doesn't shift under the user's finger on mobile.
// =============================================================================
function initGalleryLightbox() {
    const galleryItems = document.querySelectorAll('.gallery-item img');

    if (!galleryItems.length) return;

    // Build the lightbox overlay once and append it to the body
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
        <div class="lightbox-content">
            <button class="lightbox-close" aria-label="Close lightbox">&times;</button>
            <img src="" alt="" class="lightbox-image">
            <div class="lightbox-caption"></div>
            <button class="lightbox-prev" aria-label="Previous image">&lt;</button>
            <button class="lightbox-next" aria-label="Next image">&gt;</button>
        </div>
    `;
    document.body.appendChild(lightbox);

    const lightboxImage   = lightbox.querySelector('.lightbox-image');
    const lightboxCaption = lightbox.querySelector('.lightbox-caption');
    const lightboxClose   = lightbox.querySelector('.lightbox-close');
    const lightboxPrev    = lightbox.querySelector('.lightbox-prev');
    const lightboxNext    = lightbox.querySelector('.lightbox-next');

    let currentIndex = 0;

    // Attach click and keyboard listeners to each gallery image
    galleryItems.forEach((img, index) => {
        img.addEventListener('click', (e) => {
            e.preventDefault();
            currentIndex = index;
            openLightbox(img);
        });

        // Make the parent wrapper keyboard-focusable so tab users can open images too
        img.parentElement.setAttribute('tabindex', '0');
        img.parentElement.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                currentIndex = index;
                openLightbox(img);
            }
        });
    });

    function openLightbox(img) {
        lightboxImage.src = img.src;
        lightboxImage.alt = img.alt;

        // Show the caption if the gallery item includes one
        const caption = img.closest('.gallery-item').querySelector('.gallery-caption');
        lightboxCaption.textContent = caption ? caption.textContent : '';

        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling while lightbox is open
        lightboxClose.focus();                    // Move focus to close button for keyboard/screen reader users
        updateNavButtons();
    }

    // Close when clicking the X button or the backdrop outside the image
    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';  // Restore normal scrolling
        galleryItems[currentIndex].parentElement.focus(); // Return focus to the last viewed item
    }

    lightboxPrev.addEventListener('click', showPrevImage);
    lightboxNext.addEventListener('click', showNextImage);

    function showPrevImage() {
        // Wrap around to the last image if already at the first
        currentIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
        openLightbox(galleryItems[currentIndex]);
    }

    function showNextImage() {
        // Wrap around to the first image if already at the last
        currentIndex = (currentIndex + 1) % galleryItems.length;
        openLightbox(galleryItems[currentIndex]);
    }

    // Only show nav arrows when there's more than one image to navigate
    function updateNavButtons() {
        const show = galleryItems.length > 1 ? 'block' : 'none';
        lightboxPrev.style.display = show;
        lightboxNext.style.display = show;
    }

    // Keyboard shortcuts: Escape to close, arrow keys to navigate
    lightbox.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;

        switch (e.key) {
            case 'Escape':    closeLightbox();  break;
            case 'ArrowLeft': showPrevImage();  break;
            case 'ArrowRight':showNextImage();  break;
        }
    });
}


// =============================================================================
// SMOOTH SCROLLING
// Intercepts clicks on internal anchor links (e.g. href="#section") and
// smoothly scrolls to the target instead of jumping. The header height is
// subtracted from the scroll position so content doesn't hide behind the
// sticky nav bar. Focus is moved to the target element for accessibility.
// =============================================================================
function initSmoothScrolling() {
    // Select all anchor links that point to an ID on the same page
    const anchorLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');

    anchorLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId      = link.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (!targetElement) return;

            e.preventDefault();

            // Offset by the sticky header height so the section isn't hidden underneath it
            const headerHeight  = document.querySelector('.site-header')?.offsetHeight || 0;
            const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;

            window.scrollTo({ top: targetPosition, behavior: 'smooth' });

            // Update the URL bar to reflect the new anchor without causing a scroll jump
            history.pushState(null, null, targetId);

            // Briefly make the target focusable, then move focus to it for screen readers
            targetElement.setAttribute('tabindex', '-1');
            targetElement.focus();
            setTimeout(() => targetElement.removeAttribute('tabindex'), 1000);
        });
    });
}


// =============================================================================
// WEATHER WIDGET
// Displays a 5-day forecast in the weather widget container.
//
// ⚠️  TODO: Replace the mock data below with a real API call.
// Recommended free option: Open-Meteo (https://open-meteo.com)
// No API key required. Example endpoint for Taniti's approximate coordinates:
//   https://api.open-meteo.com/v1/forecast?latitude=14.0&longitude=145.0
//   &daily=temperature_2m_max,weathercode&temperature_unit=fahrenheit&timezone=Pacific/Guam
// =============================================================================
// =============================================================================
// WEATHER WIDGET — LIVE DATA
// Fetches real forecast data from Open-Meteo (https://open-meteo.com).
// Open-Meteo is 100% free with no API key required — just a URL with
// coordinates. Taniti is fictional so we use a tropical Pacific location
// (similar latitude/climate to Hawaii) as a stand-in.
//
// Two targets are updated:
//   .weather-widget — the 5-day forecast cards on plan.html
//   .current-weather — the compact Today snapshot on index.html
//
// Falls back to friendly placeholder values if the API is unreachable.
// =============================================================================
function initWeatherWidget() {
    // Taniti is fictional — using Honolulu, Hawaii as a tropical Pacific stand-in
    // Coordinates: 21.3069° N, 157.8583° W
    const API_URL = 'https://api.open-meteo.com/v1/forecast'
        + '?latitude=21.3069'
        + '&longitude=-157.8583'
        + '&daily=weather_code,temperature_2m_max,temperature_2m_min'
        + '&temperature_unit=fahrenheit'
        + '&timezone=Pacific%2FHonolulu'
        + '&forecast_days=7';

    // WMO weather code → human-readable description + emoji
    // Full code list: https://open-meteo.com/en/docs#weathervariables
    function decodeWeatherCode(code) {
        if (code === 0)                return { desc: 'Clear Sky',         icon: '☀️' };
        if (code <= 2)                 return { desc: 'Partly Cloudy',     icon: '⛅' };
        if (code === 3)                return { desc: 'Overcast',          icon: '☁️' };
        if (code <= 49)                return { desc: 'Foggy',             icon: '🌫️' };
        if (code <= 57)                return { desc: 'Drizzle',           icon: '🌦️' };
        if (code <= 67)                return { desc: 'Rain',              icon: '🌧️' };
        if (code <= 77)                return { desc: 'Snow',              icon: '❄️' };
        if (code <= 82)                return { desc: 'Rain Showers',      icon: '🌦️' };
        if (code <= 86)                return { desc: 'Snow Showers',      icon: '🌨️' };
        if (code >= 95)                return { desc: 'Thunderstorm',      icon: '⛈️' };
        return                                { desc: 'Mixed Conditions',  icon: '🌤️' };
    }

    // Short day label from a date string like "2026-06-01"
    function getDayLabel(dateStr, index) {
        if (index === 0) return 'Today';
        if (index === 1) return 'Tomorrow';
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return days[new Date(dateStr).getDay()];
    }

    // Render the 5-day forecast cards into .weather-widget
    function renderForecastWidget(data) {
        const widget = document.querySelector('.weather-widget');
        if (!widget) return;

        widget.innerHTML = ''; // Clear any existing content

        data.daily.time.slice(0, 5).forEach((dateStr, i) => {
            const { desc, icon } = decodeWeatherCode(data.daily.weather_code[i]);
            const high = Math.round(data.daily.temperature_2m_max[i]);
            const low  = Math.round(data.daily.temperature_2m_min[i]);

            const day = document.createElement('div');
            day.className = 'weather-day';
            day.innerHTML = `
                <div class="weather-date">${getDayLabel(dateStr, i)}</div>
                <div class="weather-icon" aria-hidden="true">${icon}</div>
                <div class="weather-temp">${high}°F</div>
                <div class="weather-low">${low}°F</div>
                <div class="weather-desc">${desc}</div>
            `;
            widget.appendChild(day);
        });

        // Timestamp so visitors know the data is live
        const updated = document.createElement('p');
        updated.className = 'weather-updated';
        updated.textContent = `Updated: ${new Date().toLocaleTimeString()}`;
        widget.after(updated);
    }

    // Update the compact today snapshot on index.html
    function renderCurrentWeather(data) {
        const tempEl     = document.querySelector('.current-weather .temp');
        const forecastEl = document.querySelector('.current-weather .forecast');
        if (!tempEl || !forecastEl) return;

        const { desc, icon } = decodeWeatherCode(data.daily.weather_code[0]);
        const high = Math.round(data.daily.temperature_2m_max[0]);

        tempEl.textContent     = `Current: ${high}°F`;
        forecastEl.textContent = `${icon} ${desc}`;
    }

    // Fetch live data — gracefully fall back if the network is unavailable
    fetch(API_URL)
        .then(res => {
            if (!res.ok) throw new Error(`API error: ${res.status}`);
            return res.json();
        })
        .then(data => {
            renderForecastWidget(data);
            renderCurrentWeather(data);
        })
        .catch(err => {
            console.warn('Weather API unavailable — showing placeholder data.', err);
            // Graceful fallback — widget stays readable even if API is down
            const tempEl     = document.querySelector('.current-weather .temp');
            const forecastEl = document.querySelector('.current-weather .forecast');
            if (tempEl)     tempEl.textContent     = 'Current: 82°F';
            if (forecastEl) forecastEl.textContent = '☀️ Sunny';
        });
}


// =============================================================================
// ITINERARY BUILDER
// Lets visitors drag activities into a day-by-day trip plan, then save or
// print it. Activities are sorted chronologically within each day automatically.
//
// The save flow opens a modal with print and email options. The email feature
// currently simulates a send — hook it up to a backend service (e.g. EmailJS,
// SendGrid) to make it functional in production.
// =============================================================================
// =============================================================================
// TRIP PLANNER — FORM-DRIVEN ITINERARY GENERATOR
// Reads the user's arrival/departure dates and selected interests, then builds
// a personalized day-by-day itinerary and renders it in .planner-results.
// Each interest maps to a curated pool of activities. Days are filled by
// rotating through the pool so no activity repeats unnecessarily.
// =============================================================================
function initTripPlanner() {
    const form           = document.querySelector('.planner-form');
    const resultsDiv     = document.querySelector('.planner-results');

    // Guard — only run on pages that have the planner form
    if (!form || !resultsDiv) return;

    // -------------------------------------------------------------------------
    // Activity library — keyed by interest checkbox value.
    // Each activity has a time slot, emoji icon, title, and short description.
    // To expand the planner, just add more objects to any array below.
    // -------------------------------------------------------------------------
    const activityLibrary = {
        beaches: [
            { time: '9:00 AM',  icon: '🏖️', title: 'Taniti Main Beach',      desc: 'Swim, sunbathe, and soak in the crystal-clear waters at Taniti\'s most popular shore.' },
            { time: '2:00 PM',  icon: '🐚', title: 'Hidden Cove Exploration', desc: 'Discover a secluded cove accessible by a short scenic trail — perfect for snorkeling.' },
            { time: '10:00 AM', icon: '🌊', title: 'South Shore Surf Lesson', desc: 'Take a beginner-friendly surf lesson with local instructors on the gentler south side.' },
            { time: '4:00 PM',  icon: '🌅', title: 'Sunset Beach Walk',       desc: 'Stroll the shoreline as the sun dips toward the horizon for unforgettable golden-hour views.' },
        ],
        hiking: [
            { time: '7:30 AM',  icon: '🥾', title: 'Jungle Ridge Trail',      desc: 'A moderate 3-hour hike through lush rainforest canopy with sweeping coastal panoramas at the summit.' },
            { time: '8:00 AM',  icon: '🦜', title: 'Rainforest Nature Walk',  desc: 'Guided 2-hour walk spotting native birds, exotic flora, and hidden waterfalls deep in the interior.' },
            { time: '6:00 AM',  icon: '🌄', title: 'Sunrise Summit Hike',     desc: 'Rise early to catch sunrise from Taniti\'s highest accessible peak — an experience you\'ll never forget.' },
        ],
        volcano: [
            { time: '9:00 AM',  icon: '🌋', title: 'Volcano Rim Tour',        desc: 'A guided hike to the rim of Taniti\'s dormant volcano, with a geology talk and stunning crater views.' },
            { time: '1:00 PM',  icon: '🪨', title: 'Lava Field Walk',         desc: 'Explore ancient lava formations with a knowledgeable local guide explaining Taniti\'s volcanic history.' },
        ],
        culture: [
            { time: '10:00 AM', icon: '🏛️', title: 'Taniti Cultural Center',  desc: 'Explore the island\'s history, traditions, and artwork through interactive exhibits and live demonstrations.' },
            { time: '12:00 PM', icon: '🍱', title: 'Village Market Lunch',    desc: 'Wander the open-air village market and sample authentic Tanitian dishes prepared by local families.' },
            { time: '7:00 PM',  icon: '🎶', title: 'Traditional Dance Show',  desc: 'An evening performance of traditional Tanitian dance and music at the cultural amphitheater.' },
            { time: '3:00 PM',  icon: '🎨', title: 'Local Artisan Workshop',  desc: 'Join a hands-on workshop where local artisans teach traditional weaving, pottery, or woodcarving.' },
        ],
        'water-activities': [
            { time: '9:00 AM',  icon: '🤿', title: 'Guided Snorkel Tour',     desc: 'Explore vibrant coral reefs teeming with tropical fish on a 2-hour guided snorkeling excursion.' },
            { time: '1:00 PM',  icon: '🚤', title: 'Island Boat Excursion',   desc: 'Hop between Taniti\'s smaller surrounding islands on a half-day boat tour with snorkeling stops.' },
            { time: '10:00 AM', icon: '🏄', title: 'Kayak Coastal Tour',      desc: 'Paddle along Taniti\'s dramatic coastline, duck into sea caves, and discover hidden beaches by kayak.' },
            { time: '2:00 PM',  icon: '🪂', title: 'Parasailing Adventure',   desc: 'Soar high above the turquoise lagoon and get a bird\'s-eye view of the entire island.' },
        ],
        nightlife: [
            { time: '7:00 PM',  icon: '🍽️', title: 'Seafood Dinner',         desc: 'Dine on the day\'s freshest catch at a waterfront restaurant as the evening breeze rolls in.' },
            { time: '9:00 PM',  icon: '🍹', title: 'Beachside Bar Hopping',   desc: 'Experience Taniti\'s lively bar scene along the main strip — try the signature coconut rum cocktail.' },
            { time: '8:00 PM',  icon: '🎸', title: 'Live Music at The Cove',  desc: 'Local bands perform nightly at The Cove, Taniti\'s most beloved open-air music venue.' },
        ],
    };

    // Always include meals and a rest period regardless of interests selected
    const dailyEssentials = [
        { time: '7:00 AM',  icon: '☕', title: 'Breakfast',               desc: 'Start the day at your accommodation or a nearby café with fresh tropical fruit and local coffee.' },
        { time: '12:30 PM', icon: '🥥', title: 'Lunch Break',             desc: 'Recharge with a relaxed midday meal — ask your hotel for today\'s local recommendation.' },
        { time: '6:00 PM',  icon: '🌺', title: 'Evening Wind-Down',       desc: 'Relax, freshen up, and enjoy a leisurely evening stroll before dinner.' },
    ];

    // -------------------------------------------------------------------------
    // Form submit handler — builds and renders the itinerary
    // -------------------------------------------------------------------------
    form.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevent page reload on submit

        // --- Read form values ---
        const arrivalInput   = form.querySelector('#arrival-date').value;
        const departureInput = form.querySelector('#departure-date').value;
        const travelers      = form.querySelector('#travelers').value;
        const interestBoxes  = form.querySelectorAll('input[name="interests"]:checked');
        const selectedInterests = Array.from(interestBoxes).map(cb => cb.value);

        // --- Validate dates ---
        if (!arrivalInput || !departureInput) {
            showPlannerError('Please select both an arrival and departure date.');
            return;
        }

        const arrival   = new Date(arrivalInput);
        const departure = new Date(departureInput);
        const tripDays  = Math.round((departure - arrival) / (1000 * 60 * 60 * 24));

        if (tripDays <= 0) {
            showPlannerError('Departure date must be after your arrival date.');
            return;
        }

        if (tripDays > 14) {
            showPlannerError('The planner supports trips up to 14 days. Please adjust your dates.');
            return;
        }

        if (selectedInterests.length === 0) {
            showPlannerError('Please select at least one interest so we can personalise your itinerary.');
            return;
        }

        // --- Build the activity pool from selected interests ---
        // Gather all activities matching selected interests into one flat array,
        // then shuffle it so each trip feels unique
        let activityPool = [];
        selectedInterests.forEach(interest => {
            if (activityLibrary[interest]) {
                activityPool = activityPool.concat(activityLibrary[interest]);
            }
        });
        activityPool = shuffleArray(activityPool);

        // --- Generate the itinerary day by day ---
        const days = [];
        let poolIndex = 0;

        for (let i = 0; i < tripDays; i++) {
            const dayDate = new Date(arrival);
            dayDate.setDate(arrival.getDate() + i);

            // Pick 2 featured activities per day, cycling through the pool
            const featuredActivities = [];
            for (let j = 0; j < 2; j++) {
                featuredActivities.push(activityPool[poolIndex % activityPool.length]);
                poolIndex++;
            }

            // Combine essentials + featured activities, then sort by time
            const allActivities = [...dailyEssentials, ...featuredActivities];
            allActivities.sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));

            days.push({ date: dayDate, activities: allActivities });
        }

        // --- Render the itinerary ---
        renderItinerary(days, travelers, arrival, departure);
    });

    // -------------------------------------------------------------------------
    // renderItinerary — builds the full HTML output and injects it into the page
    // -------------------------------------------------------------------------
    function renderItinerary(days, travelers, arrival, departure) {
        const options    = { weekday: 'long', month: 'long', day: 'numeric' };
        const arrivalStr = arrival.toLocaleDateString('en-US', options);
        const depStr     = departure.toLocaleDateString('en-US', options);

        // Build the day cards HTML
        const dayCardsHTML = days.map((day, index) => {
            const dateLabel = day.date.toLocaleDateString('en-US', options);
            const isFirst   = index === 0;
            const isLast    = index === days.length - 1;

            // Add arrival/departure badges to the first and last day
            const badge = isFirst
                ? '<span class="day-badge arrival-badge">✈️ Arrival Day</span>'
                : isLast
                ? '<span class="day-badge departure-badge">✈️ Departure Day</span>'
                : '';

            const activitiesHTML = day.activities.map(act => `
                <div class="planner-activity-item">
                    <div class="planner-activity-time">${act.time}</div>
                    <div class="planner-activity-icon">${act.icon}</div>
                    <div class="planner-activity-details">
                        <strong>${act.title}</strong>
                        <p>${act.desc}</p>
                    </div>
                </div>
            `).join('');

            return `
                <div class="planner-day-card">
                    <div class="planner-day-header">
                        <h3>Day ${index + 1} — ${dateLabel}</h3>
                        ${badge}
                    </div>
                    <div class="planner-day-activities">
                        ${activitiesHTML}
                    </div>
                </div>
            `;
        }).join('');

        // Inject the full itinerary into the results container
        resultsDiv.innerHTML = `
            <div class="generated-itinerary">
                <div class="itinerary-summary">
                    <h3>🌺 Your Taniti Island Itinerary</h3>
                    <p>
                        <strong>${days.length}-day trip</strong> for
                        <strong>${travelers} traveller${travelers === '1' ? '' : 's'}</strong>
                        &nbsp;·&nbsp; ${arrivalStr} → ${depStr}
                    </p>
                </div>

                <div class="planner-day-cards">
                    ${dayCardsHTML}
                </div>

                <div class="itinerary-actions">
                    <button class="btn btn-secondary print-itinerary-btn">🖨️ Print Itinerary</button>
                    <button class="btn btn-primary replan-btn">🔄 Plan Again</button>
                </div>

                <p class="itinerary-disclaimer">
                    * This itinerary is a personalised suggestion based on your interests.
                    Times are approximate — feel free to adjust to your own pace!
                </p>
            </div>
        `;

        // Scroll smoothly to the results so the user sees them
        resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // --- Print button ---
        resultsDiv.querySelector('.print-itinerary-btn').addEventListener('click', () => {
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <title>Taniti Island Itinerary</title>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; padding: 20px; }
                        h2, h3 { color: #0d7e83; }
                        .planner-day-card { margin-bottom: 30px; border: 1px solid #ddd; border-radius: 6px; padding: 15px; page-break-inside: avoid; }
                        .planner-day-header { background: #0d7e83; color: white; padding: 10px 15px; margin: -15px -15px 15px; border-radius: 6px 6px 0 0; }
                        .planner-day-header h3 { color: white; margin: 0; }
                        .planner-activity-item { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #eee; }
                        .planner-activity-time { min-width: 90px; font-weight: bold; color: #0d7e83; font-size: 0.9em; }
                        .planner-activity-icon { font-size: 1.4em; }
                        .planner-activity-details strong { display: block; margin-bottom: 2px; }
                        .planner-activity-details p { margin: 0; font-size: 0.9em; color: #555; }
                        .itinerary-disclaimer { font-size: 0.85em; color: #888; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 15px; }
                        @media print { body { font-size: 11pt; } }
                    </style>
                </head>
                <body>
                    <h2>🌺 Taniti Island — Your Personalised Itinerary</h2>
                    ${resultsDiv.querySelector('.generated-itinerary').innerHTML
                        .replace(/<div class="itinerary-actions">[\s\S]*?<\/div>/, '')
                    }
                    <p style="margin-top:40px; font-size:0.85em; color:#888;">
                        Prepared by the Taniti Island Tourism Board · tanitiisland.com
                    </p>
                </body>
                </html>
            `);
            printWindow.document.close();
            setTimeout(() => { printWindow.focus(); printWindow.print(); }, 400);
        });

        // --- Plan Again button — resets the form and results ---
        resultsDiv.querySelector('.replan-btn').addEventListener('click', () => {
            resultsDiv.innerHTML = '<p>Your personalised itinerary will appear here after you submit your preferences.</p>';
            form.reset();
            form.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }

    // -------------------------------------------------------------------------
    // showPlannerError — displays a friendly inline validation message
    // -------------------------------------------------------------------------
    function showPlannerError(message) {
        resultsDiv.innerHTML = `
            <div class="planner-error">
                <p>⚠️ ${message}</p>
            </div>
        `;
    }

    // -------------------------------------------------------------------------
    // shuffleArray — randomises activity order using Fisher-Yates algorithm
    // so each generated itinerary feels fresh and not identical every time
    // -------------------------------------------------------------------------
    function shuffleArray(arr) {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    // -------------------------------------------------------------------------
    // timeToMinutes — converts "9:00 AM" style strings to total minutes
    // Used for sorting activities chronologically within a day
    // -------------------------------------------------------------------------
    function timeToMinutes(timeStr) {
        const [time, period] = timeStr.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        if (period === 'PM' && hours < 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;
        return hours * 60 + minutes;
    }
}

function initItineraryBuilder() {
    const itineraryBuilder = document.querySelector('.itinerary-builder');

    if (!itineraryBuilder) return;

    const daySelector      = itineraryBuilder.querySelector('.day-selector');
    const activitySelector = itineraryBuilder.querySelector('.activity-selector');
    const itineraryPreview = itineraryBuilder.querySelector('.itinerary-preview');

    // Activity catalogue — each entry has a unique ID, display name, time slot, and description.
    // To add more activities, just push new objects into the relevant category array.
    const activitiesByCategory = {
        beaches: [
            { id: 'b1', name: 'Taniti Beach',  time: '9:00 AM - 12:00 PM', desc: 'Relaxing at the main beach' },
            { id: 'b2', name: 'Hidden Cove',   time: '2:00 PM - 5:00 PM',  desc: 'Secluded beach with crystal waters' },
        ],
        hiking: [
            { id: 'h1', name: 'Volcano Trail', time: '8:00 AM - 12:00 PM', desc: 'Moderate hike with amazing views' },
            { id: 'h2', name: 'Jungle Trek',   time: '1:00 PM - 4:00 PM',  desc: 'Guided tour through rainforest' },
        ],
        dining: [
            { id: 'd1', name: 'Seafood Dinner', time: '6:00 PM - 8:00 PM',  desc: 'Fresh catch at coastal restaurant' },
            { id: 'd2', name: 'Local Cuisine',  time: '12:00 PM - 2:00 PM', desc: 'Traditional lunch at village market' },
        ],
        tours: [
            { id: 't1', name: 'Island Tour',    time: '9:00 AM - 3:00 PM',  desc: 'Comprehensive tour of main attractions' },
            { id: 't2', name: 'Boat Excursion', time: '10:00 AM - 2:00 PM', desc: 'Snorkeling and island hopping' },
        ],
    };

    // Build the day tab buttons (Day 1 through Day 7)
    for (let i = 1; i <= 7; i++) {
        const dayBtn = document.createElement('button');
        dayBtn.className   = 'day-btn' + (i === 1 ? ' active' : '');
        dayBtn.textContent = `Day ${i}`;
        dayBtn.dataset.day = i;
        daySelector.appendChild(dayBtn);
    }

    // Render the activity picker grouped by category
    Object.keys(activitiesByCategory).forEach(category => {
        const heading = document.createElement('h4');
        heading.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        activitySelector.appendChild(heading);

        const container = document.createElement('div');
        container.className = 'd-flex flex-wrap gap-2 mb-3';

        activitiesByCategory[category].forEach(activity => {
            const option = document.createElement('div');
            option.className        = 'activity-option';
            option.dataset.id       = activity.id;
            option.dataset.category = category;
            option.innerHTML = `
                <strong>${activity.name}</strong>
                <div>${activity.time}</div>
            `;
            container.appendChild(option);
        });

        activitySelector.appendChild(container);
    });

    // Build one itinerary panel for each day, hidden by default except Day 1
    for (let i = 1; i <= 7; i++) {
        const daySection = document.createElement('div');
        daySection.className   = 'itinerary-day' + (i === 1 ? '' : ' hidden');
        daySection.dataset.day = i;
        daySection.innerHTML = `
            <h4>Day ${i} Itinerary</h4>
            <div class="itinerary-items"></div>
            <div class="empty-message">No activities yet — click any activity above to add it here.</div>
        `;
        itineraryPreview.appendChild(daySection);
    }

    // Switch the visible itinerary panel when a day tab is clicked
    daySelector.addEventListener('click', (e) => {
        if (!e.target.classList.contains('day-btn')) return;

        const selectedDay = e.target.dataset.day;

        daySelector.querySelectorAll('.day-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');

        itineraryPreview.querySelectorAll('.itinerary-day').forEach(day => {
            day.classList.toggle('hidden', day.dataset.day !== selectedDay);
        });
    });

    // Add the clicked activity to the currently selected day's itinerary
    activitySelector.addEventListener('click', (e) => {
        const activityOption = e.target.closest('.activity-option');
        if (!activityOption) return;

        const activityId = activityOption.dataset.id;
        const category   = activityOption.dataset.category;
        const activity   = activitiesByCategory[category].find(a => a.id === activityId);

        const currentDay     = daySelector.querySelector('.day-btn.active').dataset.day;
        const daySection     = itineraryPreview.querySelector(`.itinerary-day[data-day="${currentDay}"]`);
        const itemsContainer = daySection.querySelector('.itinerary-items');
        const emptyMessage   = daySection.querySelector('.empty-message');

        // Prevent duplicates — each activity can only appear once per day
        if (itemsContainer.querySelector(`[data-id="${activityId}"]`)) {
            alert('This activity is already in your itinerary for this day.');
            return;
        }

        const itineraryItem = document.createElement('div');
        itineraryItem.className   = 'itinerary-item';
        itineraryItem.dataset.id  = activityId;
        itineraryItem.innerHTML = `
            <div class="itinerary-time">${activity.time}</div>
            <div class="itinerary-details">
                <strong>${activity.name}</strong>
                <div>${activity.desc}</div>
            </div>
            <button class="remove-activity" aria-label="Remove activity">&times;</button>
        `;
        itemsContainer.appendChild(itineraryItem);

        // Hide the placeholder message once there's at least one activity
        if (itemsContainer.children.length > 0) {
            emptyMessage.style.display = 'none';
        }

        // Keep activities in chronological order within the day
        sortItineraryItems(itemsContainer);
    });

    // Remove an activity when the × button is clicked
    itineraryPreview.addEventListener('click', (e) => {
        if (!e.target.classList.contains('remove-activity')) return;

        const item           = e.target.closest('.itinerary-item');
        const itemsContainer = item.parentNode;
        const emptyMessage   = itemsContainer.parentNode.querySelector('.empty-message');

        item.remove();

        // Show the placeholder message again if the list is now empty
        if (itemsContainer.children.length === 0) {
            emptyMessage.style.display = 'block';
        }
    });

    // Re-sorts all items in a container by their start time (earliest first)
    function sortItineraryItems(container) {
        const items = Array.from(container.children);

        items.sort((a, b) => {
            const startA = a.querySelector('.itinerary-time').textContent.split(' - ')[0];
            const startB = b.querySelector('.itinerary-time').textContent.split(' - ')[0];
            return convertTimeToMinutes(startA) - convertTimeToMinutes(startB);
        });

        // Re-append in sorted order (clears and rebuilds the list)
        container.innerHTML = '';
        items.forEach(item => container.appendChild(item));
    }

    // Converts a 12-hour time string like "2:30 PM" into total minutes for easy comparison
    function convertTimeToMinutes(timeStr) {
        const [time, period] = timeStr.split(' ');
        let [hours, minutes] = time.split(':').map(Number);

        if (period === 'PM' && hours < 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;

        return hours * 60 + minutes;
    }

    // Save button — builds a printable summary and opens a modal
    const saveButton = itineraryBuilder.querySelector('.save-itinerary button');
    if (!saveButton) return;

    saveButton.addEventListener('click', () => {
        // Don't let the user save an empty itinerary
        let hasActivities = false;
        itineraryPreview.querySelectorAll('.itinerary-items').forEach(container => {
            if (container.children.length > 0) hasActivities = true;
        });

        if (!hasActivities) {
            alert('Please add at least one activity to your itinerary before saving.');
            return;
        }

        // Build a clean, print-friendly copy of the itinerary
        const printableItinerary = document.createElement('div');
        printableItinerary.className = 'printable-itinerary';
        printableItinerary.innerHTML = '<h2>Your Taniti Island Itinerary</h2>';

        itineraryPreview.querySelectorAll('.itinerary-day').forEach(day => {
            const dayCopy = day.cloneNode(true);
            dayCopy.classList.remove('hidden');

            const items = dayCopy.querySelector('.itinerary-items');
            if (items.children.length === 0) {
                dayCopy.querySelector('.empty-message').textContent = 'No activities planned for this day.';
            } else {
                dayCopy.querySelector('.empty-message').style.display = 'none';
            }

            // Remove the interactive remove buttons from the printed version
            dayCopy.querySelectorAll('.remove-activity').forEach(btn => btn.remove());
            printableItinerary.appendChild(dayCopy);
        });

        printableItinerary.innerHTML += `
            <div class="itinerary-footer mt-4">
                <p>Thank you for planning your trip to Taniti Island!</p>
                <p>For assistance, contact our concierge at: concierge@tanitiisland.com</p>
            </div>
        `;

        // Show the itinerary in a modal with print and email options
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Your Itinerary is Ready!</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body"></div>
                <div class="modal-footer">
                    <button class="btn btn-secondary print-btn">Print Itinerary</button>
                    <button class="btn btn-primary email-btn">Email to Me</button>
                </div>
            </div>
        `;

        modal.querySelector('.modal-body').appendChild(printableItinerary);
        document.body.appendChild(modal);

        // Small delay lets the browser paint before triggering the CSS transition
        setTimeout(() => modal.classList.add('show'), 10);

        modal.querySelector('.modal-close').addEventListener('click', () => {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        });

        // Opens the itinerary in a new tab formatted for printing
        modal.querySelector('.print-btn').addEventListener('click', () => {
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Taniti Island Itinerary</title>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        h2, h4 { color: #0a7e85; }
                        .itinerary-day { margin-bottom: 30px; }
                        .itinerary-item { display: flex; margin-bottom: 10px; padding: 10px; border: 1px solid #ddd; }
                        .itinerary-time { min-width: 120px; font-weight: bold; color: #0a7e85; }
                        .itinerary-footer { margin-top: 50px; border-top: 1px solid #ddd; padding-top: 20px; }
                        @media print { body { font-size: 12pt; } .itinerary-day { page-break-inside: avoid; } }
                    </style>
                </head>
                <body>${printableItinerary.innerHTML}</body>
                </html>
            `);
            printWindow.document.close();
            printWindow.focus();

            // Small delay ensures the content is fully rendered before the print dialog opens
            setTimeout(() => printWindow.print(), 500);
        });

        // Email flow — collects an address and simulates sending.
        // TODO: Replace the setTimeout mock with a real email API call (e.g. EmailJS).
        modal.querySelector('.email-btn').addEventListener('click', () => {
            const modalFooter = modal.querySelector('.modal-footer');
            modalFooter.innerHTML = `
                <div class="form-row">
                    <label for="email">Your Email Address:</label>
                    <input type="email" id="email" required placeholder="Enter your email">
                </div>
                <button class="btn btn-primary send-email-btn">Send Itinerary</button>
            `;

            modalFooter.querySelector('.send-email-btn').addEventListener('click', () => {
                const emailInput = modalFooter.querySelector('#email');
                if (!emailInput.value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value)) {
                    emailInput.focus();
                    return;
                }

                const email = emailInput.value;
                modalFooter.innerHTML = '<p class="text-center">Sending itinerary to your email...</p>';

                // Simulated delay — replace with actual API call for production
                setTimeout(() => {
                    modalFooter.innerHTML = `
                        <div class="success-message text-center">
                            <p>Your itinerary has been sent to: ${email}</p>
                            <p class="mt-2">Please check your inbox (and spam folder) if it doesn't arrive in a few minutes.</p>
                            <button class="btn btn-secondary mt-3 close-modal-btn">Close</button>
                        </div>
                    `;
                    modalFooter.querySelector('.close-modal-btn').addEventListener('click', () => {
                        modal.classList.remove('show');
                        setTimeout(() => modal.remove(), 300);
                    });
                }, 2000);
            });
        });
    });
}


// =============================================================================
// MAP INTERACTION
// Renders an interactive island map with clickable location pins.
// Each pin shows a tooltip on hover and a detailed info card on click.
// The legend lets users filter pins by category (beach, dining, etc.).
//
// ⚠️  TODO: The map image path below currently points to a placeholder.
// Update the src to "Assets/interactivemap.png" to use the actual map file,
// or swap the <img> approach for Leaflet.js to add full zoom/pan support.
// =============================================================================
function initMapInteraction() {
    const mapContainer = document.querySelector('.map-container');

    if (!mapContainer) return;

    const mapPlaceholder = mapContainer.querySelector('.map-placeholder');
    const mapLegend      = mapContainer.querySelector('.map-legend');

    if (!mapPlaceholder) return;

    // Render the map image and overlay the location pins on top of it.
    // Pin positions (top/left %) are relative to the map image dimensions.
    mapPlaceholder.innerHTML = `
        <div class="map-demo">
            <img src="Assets/interactivemap.png" alt="Interactive map of Taniti Island showing beaches, dining, activities, shopping, accommodations, and attractions" class="map-image">
            <div class="map-overlay">
                <div class="map-point" style="top: 30%; left: 40%;" data-type="beach"         title="Taniti Beach"></div>
                <div class="map-point" style="top: 45%; left: 60%;" data-type="dining"        title="Seafood Restaurant"></div>
                <div class="map-point" style="top: 60%; left: 30%;" data-type="activity"      title="Volcano Hiking"></div>
                <div class="map-point" style="top: 35%; left: 70%;" data-type="shopping"      title="Local Market"></div>
                <div class="map-point" style="top: 50%; left: 50%;" data-type="accommodation" title="Taniti Resort"></div>
                <div class="map-point" style="top: 25%; left: 55%;" data-type="attraction"    title="Cultural Center"></div>
            </div>
        </div>
    `;

    const mapPoints = mapPlaceholder.querySelectorAll('.map-point');

    mapPoints.forEach(point => {
        // Each pin gets a tooltip that shows the location name on hover or focus
        const tooltip = document.createElement('div');
        tooltip.className   = 'map-tooltip';
        tooltip.textContent = point.getAttribute('title');
        point.appendChild(tooltip);

        point.addEventListener('mouseenter', () => tooltip.style.display = 'block');
        point.addEventListener('mouseleave', () => tooltip.style.display = 'none');

        // Make pins keyboard-accessible by adding them to the tab order
        point.setAttribute('tabindex', '0');
        point.addEventListener('focus', () => tooltip.style.display = 'block');
        point.addEventListener('blur',  () => tooltip.style.display = 'none');

        point.addEventListener('click', () => showPointDetails(point));
        point.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                showPointDetails(point);
            }
        });
    });

    // Builds and positions a contextual info card when a map pin is clicked
    function showPointDetails(point) {
        const type  = point.dataset.type;
        const title = point.getAttribute('title');

        const infoCard = document.createElement('div');
        infoCard.className = 'map-info-card';

        // Content is keyed by location type — add new types here as the site grows
        const contentByType = {
            beach: `
                <h4>${title}</h4>
                <p>Beautiful sandy beach with crystal-clear waters. Perfect for swimming and sunbathing.</p>
                <p><strong>Facilities:</strong> Restrooms, showers, beach chairs</p>
                <p><strong>Hours:</strong> Open 24/7</p>
                <a href="#" class="btn btn-sm btn-primary">More Details</a>
            `,
            dining: `
                <h4>${title}</h4>
                <p>Fresh seafood restaurant with ocean views. Local specialties and international cuisine.</p>
                <p><strong>Hours:</strong> 11:00 AM – 10:00 PM</p>
                <p><strong>Price Range:</strong> $$–$$$</p>
                <a href="#" class="btn btn-sm btn-primary">View Menu</a>
            `,
            activity: `
                <h4>${title}</h4>
                <p>Guided hiking tours of the dormant volcano with breathtaking views of the island.</p>
                <p><strong>Duration:</strong> 3–4 hours</p>
                <p><strong>Difficulty:</strong> Moderate</p>
                <a href="#" class="btn btn-sm btn-primary">Book Tour</a>
            `,
            shopping: `
                <h4>${title}</h4>
                <p>Traditional market with local crafts, fresh produce, and souvenirs.</p>
                <p><strong>Hours:</strong> 8:00 AM – 6:00 PM</p>
                <p><strong>Specialties:</strong> Handmade crafts, tropical fruits</p>
                <a href="#" class="btn btn-sm btn-primary">Shopping Guide</a>
            `,
            accommodation: `
                <h4>${title}</h4>
                <p>Luxury beachfront resort with spa, pools, and multiple restaurants.</p>
                <p><strong>Amenities:</strong> WiFi, A/C, room service</p>
                <p><strong>Price Range:</strong> $$$–$$$$</p>
                <a href="#" class="btn btn-sm btn-primary">Check Availability</a>
            `,
            attraction: `
                <h4>${title}</h4>
                <p>Learn about Taniti's rich cultural heritage through exhibits and live performances.</p>
                <p><strong>Hours:</strong> 9:00 AM – 5:00 PM</p>
                <p><strong>Admission:</strong> $10 adults, $5 children</p>
                <a href="#" class="btn btn-sm btn-primary">Plan Visit</a>
            `,
        };

        infoCard.innerHTML = contentByType[type] || `<h4>${title}</h4><p>No details available.</p>`;

        // Add a close button to dismiss the card
        const closeButton = document.createElement('button');
        closeButton.className = 'info-card-close';
        closeButton.innerHTML = '&times;';
        closeButton.setAttribute('aria-label', 'Close information');
        infoCard.appendChild(closeButton);

        // Remove any previously open info card before showing the new one
        mapPlaceholder.querySelectorAll('.map-info-card').forEach(card => card.remove());
        mapPlaceholder.appendChild(infoCard);

        // Position the card next to the pin, flipping sides if it would overflow the map
        const pointRect = point.getBoundingClientRect();
        const mapRect   = mapPlaceholder.getBoundingClientRect();

        let top  = pointRect.top - mapRect.top;
        let left = pointRect.left - mapRect.left + 30;

        if (left + 300 > mapRect.width)  left = pointRect.left - mapRect.left - 330;
        if (top  + 200 > mapRect.height) top  = mapRect.height - 220;

        infoCard.style.top  = `${top}px`;
        infoCard.style.left = `${left}px`;

        closeButton.addEventListener('click', () => infoCard.remove());

        // Also dismiss the card when clicking anywhere else on the page
        document.addEventListener('click', function closeCard(e) {
            if (!infoCard.contains(e.target) && e.target !== point) {
                infoCard.remove();
                document.removeEventListener('click', closeCard);
            }
        });

        setTimeout(() => closeButton.focus(), 100);
    }

    // Legend filter — clicking a category toggles its pins on and off
    if (mapLegend) {
        const legendItems = mapLegend.querySelectorAll('.legend-item');

        legendItems.forEach(item => {
            item.addEventListener('click', () => {
                const type = item.dataset.type;
                item.classList.toggle('active');

                mapPoints.forEach(point => {
                    if (type === 'all') {
                        // The "All" toggle syncs all other legend items to match its state
                        point.style.display = item.classList.contains('active') ? 'block' : 'none';
                        legendItems.forEach(li => {
                            if (li !== item) li.classList.toggle('active', item.classList.contains('active'));
                        });
                    } else if (point.dataset.type === type) {
                        point.style.display = item.classList.contains('active') ? 'block' : 'none';

                        // Sync the "All" indicator — mark it active only if every category is on
                        const allItem         = mapLegend.querySelector('[data-type="all"]');
                        const activeCount     = mapLegend.querySelectorAll('.legend-item.active:not([data-type="all"])').length;
                        const totalCategories = legendItems.length - 1; // Excludes the "All" item itself
                        if (allItem) allItem.classList.toggle('active', activeCount === totalCategories);
                    }
                });
            });
        });
    }
}


// =============================================================================
// SCROLL ANIMATIONS
// Uses the IntersectionObserver API to trigger CSS animations when elements
// scroll into view. Add the class "fade-in-element" or "slide-in-element"
// to any HTML element to opt it in. The animation fires once and won't
// repeat if the user scrolls back up.
//
// Gracefully skips browsers that don't support IntersectionObserver
// (mainly very old IE) without breaking anything else.
// =============================================================================
function initAnimations() {
    if (!('IntersectionObserver' in window)) return;

    const animatedElements = document.querySelectorAll('.fade-in-element, .slide-in-element');

    if (!animatedElements.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                observer.unobserve(entry.target); // Stop watching once the animation has played
            }
        });
    }, {
        threshold: 0.1,                // Fire when at least 10% of the element is visible
        rootMargin: '0px 0px -50px 0px' // Trigger slightly before the element fully enters the viewport
    });

    animatedElements.forEach(el => observer.observe(el));
}


// =============================================================================
// CURRENCY CONVERTER
// Lets visitors convert between common currencies and the fictional
// Taniti Dollar (TND) to help them budget for their trip.
//
// ⚠️  TODO: Exchange rates are hardcoded here for demonstration.
// Replace with a live rates API for production accuracy.
// Recommended free option: ExchangeRate-API (https://exchangerate-api.com)
// Free tier gives 1,500 requests/month — more than enough for a tourism site.
// =============================================================================
function initCurrencyConverter() {
    const converter = document.querySelector('.currency-converter');

    if (!converter) return;

    const fromInput    = converter.querySelector('#from-amount');
    const toInput      = converter.querySelector('#to-amount');
    const fromCurrency = converter.querySelector('#from-currency');
    const toCurrency   = converter.querySelector('#to-currency');
    const swapBtn      = converter.querySelector('.swap-btn');
    const convertBtn   = converter.querySelector('.convert-btn');
    const resultDiv    = converter.querySelector('.conversion-result');

    // Exchange rates — fetched live from ExchangeRate-API (free, no key needed for USD base).
    // TND (Taniti Dollar) is fictional — added at a fixed rate as a fun island touch.
    // Falls back to sensible static rates if the API is unreachable.
    let exchangeRates = {
        USD: 1,
        EUR: 0.92,
        GBP: 0.79,
        JPY: 149.50,
        AUD: 1.53,
        CAD: 1.36,
        TND: 2.5,  // Fictional Taniti Dollar — fixed by island law 😄
    };

    // Show a loading state while rates are being fetched
    if (resultDiv) {
        resultDiv.textContent = 'Loading live exchange rates...';
        resultDiv.classList.remove('error');
    }

    // Fetch live rates from the free Open Exchange Rates compatible endpoint
    // exchangerate-api.com offers 1,500 free requests/month — plenty for a portfolio site
    fetch('https://open.er-api.com/v6/latest/USD')
        .then(res => {
            if (!res.ok) throw new Error(`API error: ${res.status}`);
            return res.json();
        })
        .then(data => {
            if (data.result === 'success') {
                // Merge live rates with our fictional TND rate
                exchangeRates = { ...data.rates, TND: 2.5 };
                if (resultDiv) resultDiv.textContent = 'Rates updated live ✓';
                // Run an initial conversion so the widget shows a result immediately
                convertCurrency();
            }
        })
        .catch(err => {
            console.warn('Currency API unavailable — using fallback rates.', err);
            if (resultDiv) resultDiv.textContent = 'Using offline rates (API unavailable)';
            convertCurrency();
        });

    // All conversions go through USD as the common base to keep the math simple
    function convertCurrency() {
        const fromValue = parseFloat(fromInput.value);

        if (isNaN(fromValue) || fromInput.value === '') {
            resultDiv.textContent = 'Enter an amount to convert';
            resultDiv.classList.remove('error');
            return;
        }

        const inUSD     = fromValue / (exchangeRates[fromCurrency.value] || 1);
        const converted = inUSD * (exchangeRates[toCurrency.value] || 1);

        toInput.value         = converted.toFixed(2);
        resultDiv.textContent = `${fromValue} ${fromCurrency.value} = ${converted.toFixed(2)} ${toCurrency.value}`;
        resultDiv.classList.remove('error');
    }

    // Swaps both the selected currencies and their current values
    function swapCurrencies() {
        [fromCurrency.value, toCurrency.value] = [toCurrency.value, fromCurrency.value];
        [fromInput.value,    toInput.value]    = [toInput.value,    fromInput.value];
        if (fromInput.value) convertCurrency();
    }

    if (convertBtn) convertBtn.addEventListener('click', convertCurrency);
    if (swapBtn)    swapBtn.addEventListener('click', swapCurrencies);

    // Recalculate automatically whenever the user changes a value or currency
    [fromInput, fromCurrency, toCurrency].forEach(el => el.addEventListener('change', convertCurrency));

    // Start with a sensible default so users see an example conversion on load
    fromInput.value    = '1';
    fromCurrency.value = 'USD';
    toCurrency.value   = 'TND';
    convertCurrency();
}


// =============================================================================
// LANGUAGE SWITCHER (UI Demo)
// Updates the displayed language name in the selector dropdown.
//
// ⚠️  TODO: This is a UI-only demo — no translation logic is wired up yet.
// For real i18n, consider i18next (https://www.i18next.com) or a simple
// JSON-based approach where each language has its own translations file.
// =============================================================================
function initLanguageSwitcher() {
    const languageSelector = document.querySelector('.language-selector');

    if (!languageSelector) return;

    const languageOptions = languageSelector.querySelectorAll('.language-option');
    const currentLanguage = languageSelector.querySelector('.current-language');

    languageOptions.forEach(option => {
        option.addEventListener('click', () => {
            currentLanguage.textContent = option.textContent;

            // Inform the user that translation is not yet implemented
            showNotification(`Language changed to ${option.textContent}. Full translation support is coming soon!`);

            languageSelector.classList.remove('open');
        });
    });
}


// =============================================================================
// NOTIFICATION TOAST
// Displays a temporary pop-up message to give users non-blocking feedback
// (e.g. "Language changed", "Itinerary saved"). The toast auto-dismisses
// after the specified duration and includes a manual close button.
//
// Usage: showNotification('Your message here', 'info', 3000)
//   - type can be 'info', 'success', or 'error' (maps to CSS classes)
//   - duration is in milliseconds; pass 0 to keep it open until manually closed
// =============================================================================
function showNotification(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <p>${message}</p>
            <button class="notification-close" aria-label="Close notification">&times;</button>
        </div>
    `;

    document.body.appendChild(notification);

    // Trigger the entrance animation on the next frame
    setTimeout(() => notification.classList.add('show'), 10);

    const closeBtn = notification.querySelector('.notification-close');
    const dismiss  = () => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300); // Wait for the fade-out transition
    };

    closeBtn.addEventListener('click', dismiss);

    // Auto-dismiss after the specified duration (unless duration is 0)
    if (duration > 0) {
        setTimeout(() => {
            if (document.body.contains(notification)) dismiss();
        }, duration);
    }
}


// =============================================================================
// COUNTDOWN TIMER
// Displays a live days/hours/minutes/seconds countdown to the next event.
//
// ⚠️  TODO: The target date is currently set to 30 days from page load,
// which is useful for testing but not meaningful to real visitors.
// Update targetDate to a real upcoming event date, or fetch event dates
// from a CMS/API so the countdown stays accurate without code changes.
// =============================================================================
function initCountdownTimer() {
    const countdownContainer = document.querySelector('.countdown-timer');

    if (!countdownContainer) return;

    // Placeholder: 30 days from now — replace with a real event date
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 30);

    const countdownInterval = setInterval(updateCountdown, 1000);
    updateCountdown(); // Run immediately so there's no 1-second blank on load

    function updateCountdown() {
        const timeLeft = targetDate - new Date();

        if (timeLeft <= 0) {
            clearInterval(countdownInterval);
            countdownContainer.innerHTML = '<p class="countdown-finished">The event has started!</p>';
            return;
        }

        const days    = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours   = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

        countdownContainer.innerHTML = `
            <div class="countdown-item">
                <span class="countdown-value">${days}</span>
                <span class="countdown-label">Days</span>
            </div>
            <div class="countdown-item">
                <span class="countdown-value">${hours}</span>
                <span class="countdown-label">Hours</span>
            </div>
            <div class="countdown-item">
                <span class="countdown-value">${minutes}</span>
                <span class="countdown-label">Minutes</span>
            </div>
            <div class="countdown-item">
                <span class="countdown-value">${seconds}</span>
                <span class="countdown-label">Seconds</span>
            </div>
        `;
    }
}


// =============================================================================
// INITIALIZATION
// Wires up every feature above once the DOM is fully loaded.
// All functions check for their required elements internally, so it's safe
// to call them all here — they'll simply skip pages where they don't apply.
//
// To add a new feature: define its init function above, then call it here.
// =============================================================================
document.addEventListener('DOMContentLoaded', () => {
    // Core navigation and UI
    initMobileMenu();
    initSmoothScrolling();
    initNotificationBanner();
    initAnimations();

    // FAQ page features
    initFaqAccordion();
    initTabSwitching();
    initSearchFunctionality();

    // Forms
    initFormValidation();
    initTripPlanner();

    // Interactive widgets
    initGalleryLightbox();
    initWeatherWidget();
    initItineraryBuilder();
    initMapInteraction();
    initCurrencyConverter();
    initLanguageSwitcher();
    initCountdownTimer();

    // Signal to CSS that JS has loaded — enables transition animations
    // that would otherwise fire on page load before elements are in position
    document.body.classList.add('loaded');

    // Automatically keep the copyright year current — no manual updates needed
    // Uses querySelectorAll since the footer may have one or two year spans per page
    document.querySelectorAll('.copyright-year').forEach(el => {
        el.textContent = new Date().getFullYear();
    });
});