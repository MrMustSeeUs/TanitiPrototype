/**
 * Taniti Island Tourism Website
 * Main JavaScript file
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all interactive components
    initMobileMenu();
    initFaqAccordion();
    initTabSwitching();
    initNotificationBanner();
    initSearchFunctionality();
    initFormValidation();
    initGalleryLightbox();
    initSmoothScrolling();
    initWeatherWidget();
    initItineraryBuilder();
    initMapInteraction();
    initAnimations();
});

/**
 * Mobile Menu Toggle
 */
function initMobileMenu() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (!menuToggle || !navLinks) return;
    
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('show');
        menuToggle.setAttribute('aria-expanded', 
            menuToggle.getAttribute('aria-expanded') === 'true' ? 'false' : 'true'
        );
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.main-nav') && navLinks.classList.contains('show')) {
            navLinks.classList.remove('show');
            menuToggle.setAttribute('aria-expanded', 'false');
        }
    });
    
    // Set initial ARIA attributes
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-controls', 'nav-links');
    navLinks.id = 'nav-links';
}

/**
 * FAQ Accordion Functionality
 */
function initFaqAccordion() {
    const faqItems = document.querySelectorAll('.faq-item h3');
    
    if (!faqItems.length) return;
    
    faqItems.forEach((item, index) => {
        // Set ARIA attributes
        const itemId = `faq-${index}`;
        const answerId = `faq-answer-${index}`;
        const answer = item.nextElementSibling;
        
        item.setAttribute('aria-expanded', 'false');
        item.setAttribute('aria-controls', answerId);
        item.id = itemId;
        
        answer.setAttribute('aria-labelledby', itemId);
        answer.id = answerId;
        answer.setAttribute('role', 'region');
        
        // Add click event
        item.addEventListener('click', () => {
            const parent = item.parentElement;
            const isExpanded = item.getAttribute('aria-expanded') === 'true';
            
            // Close all other items
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.setAttribute('aria-expanded', 'false');
                    otherItem.parentElement.classList.remove('active');
                }
            });
            
            // Toggle current item
            parent.classList.toggle('active');
            item.setAttribute('aria-expanded', !isExpanded);
        });
    });
    
    // Open FAQ item if URL has hash
    if (window.location.hash) {
        const targetFaq = document.querySelector(window.location.hash);
        if (targetFaq && targetFaq.classList.contains('faq-item')) {
            targetFaq.querySelector('h3').click();
            targetFaq.scrollIntoView({ behavior: 'smooth' });
        }
    }
}

/**
 * Tab Switching Functionality
 */
function initTabSwitching() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabSections = document.querySelectorAll('.faq-section');
    
    if (!tabButtons.length || !tabSections.length) return;
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const target = button.dataset.target;
            
            // Update active button
            tabButtons.forEach(btn => {
                btn.classList.remove('active');
                btn.setAttribute('aria-selected', 'false');
            });
            
            button.classList.add('active');
            button.setAttribute('aria-selected', 'true');
            
            // Show target section
            tabSections.forEach(section => {
                section.classList.remove('active');
                section.setAttribute('aria-hidden', 'true');
                
                if (section.id === target) {
                    section.classList.add('active');
                    section.setAttribute('aria-hidden', 'false');
                }
            });
        });
        
        // Set initial ARIA attributes
        button.setAttribute('role', 'tab');
        button.setAttribute('aria-selected', button.classList.contains('active') ? 'true' : 'false');
        button.id = `tab-${button.dataset.target}`;
        button.setAttribute('aria-controls', button.dataset.target);
    });
    
    // Set initial ARIA attributes for tab sections
    tabSections.forEach(section => {
        section.setAttribute('role', 'tabpanel');
        section.setAttribute('aria-hidden', !section.classList.contains('active'));
        section.setAttribute('aria-labelledby', `tab-${section.id}`);
    });
}

/**
 * Notification Banner
 */
function initNotificationBanner() {
    const closeNotification = document.querySelector('.close-notification');
    const notificationBanner = document.querySelector('.notification-banner');
    
    if (!closeNotification || !notificationBanner) return;
    
    closeNotification.addEventListener('click', () => {
        notificationBanner.classList.add('fade-out');
        
        // Remove from DOM after animation completes
        setTimeout(() => {
            notificationBanner.remove();
        }, 500);
        
        // Store in session storage so it doesn't reappear on page refresh
        sessionStorage.setItem('notificationClosed', 'true');
    });
    
    // Check if notification was previously closed
    if (sessionStorage.getItem('notificationClosed') === 'true') {
        notificationBanner.style.display = 'none';
    }
}

/**
 * Search Functionality
 */
function initSearchFunctionality() {
    const searchForm = document.querySelector('.search-form');
    const searchInput = document.querySelector('#faq-search');
    
    if (!searchForm || !searchInput) return;
    
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const searchTerm = searchInput.value.toLowerCase().trim();
        
        if (!searchTerm) return;
        
        // Get all FAQ items
        const faqItems = document.querySelectorAll('.faq-item');
        let foundResults = false;
        
        // First, hide all FAQ sections and show the one with results
        document.querySelectorAll('.faq-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Reset active state on tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Search through FAQ items
        faqItems.forEach(item => {
            const question = item.querySelector('h3').textContent.toLowerCase();
            const answer = item.querySelector('.faq-answer').textContent.toLowerCase();
            
            item.style.display = 'none'; // Hide by default
            
            if (question.includes(searchTerm) || answer.includes(searchTerm)) {
                item.style.display = 'block';
                
                // Show the section containing this item
                const parentSection = item.closest('.faq-section');
                parentSection.classList.add('active');
                
                // Highlight the corresponding tab
                const tabId = parentSection.id;
                const relatedTab = document.querySelector(`[data-target="${tabId}"]`);
                if (relatedTab) relatedTab.classList.add('active');
                
                foundResults = true;
                
                // Highlight search terms
                highlightSearchTerms(item, searchTerm);
            }
        });
        
        // Show message if no results found
        const resultsMessage = document.querySelector('.search-results-message') || 
                              createResultsMessage();
        
        if (foundResults) {
            resultsMessage.textContent = `Search results for: "${searchTerm}"`;
            resultsMessage.classList.remove('error');
        } else {
            resultsMessage.textContent = `No results found for: "${searchTerm}". Please try different keywords.`;
            resultsMessage.classList.add('error');
            
            // Show first section if no results
            const firstSection = document.querySelector('.faq-section');
            if (firstSection) firstSection.classList.add('active');
            
            const firstTab = document.querySelector('.tab-btn');
            if (firstTab) firstTab.classList.add('active');
        }
    });
    
    // Create results message element
    function createResultsMessage() {
        const message = document.createElement('div');
        message.className = 'search-results-message';
        searchForm.parentNode.insertBefore(message, searchForm.nextSibling);
        return message;
    }
    
    // Highlight search terms in content
    function highlightSearchTerms(item, searchTerm) {
        const question = item.querySelector('h3');
        const answer = item.querySelector('.faq-answer');
        
        // Store original text to restore later
        if (!question.dataset.original) {
            question.dataset.original = question.innerHTML;
            answer.dataset.original = answer.innerHTML;
        }
        
        // Restore original content before highlighting
        question.innerHTML = question.dataset.original;
        answer.innerHTML = answer.dataset.original;
        
        // Highlight the search term
        const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
        question.innerHTML = question.innerHTML.replace(regex, '<mark>$1</mark>');
        answer.innerHTML = answer.innerHTML.replace(regex, '<mark>$1</mark>');
    }
    
    // Helper to escape special regex characters
    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    
    // Clear highlights when changing tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.faq-item').forEach(item => {
                item.style.display = 'block';
                
                const question = item.querySelector('h3');
                const answer = item.querySelector('.faq-answer');
                
                if (question.dataset.original) {
                    question.innerHTML = question.dataset.original;
                    answer.innerHTML = answer.dataset.original;
                }
            });
            
            // Remove search results message
            const resultsMessage = document.querySelector('.search-results-message');
            if (resultsMessage) resultsMessage.textContent = '';
        });
    });
}

/**
 * Form Validation
 */
function initFormValidation() {
    const forms = document.querySelectorAll('form:not(.search-form)');
    
    if (!forms.length) return;
    
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            let isValid = true;
            
            // Get all required inputs
            const requiredInputs = form.querySelectorAll('[required]');
            
            requiredInputs.forEach(input => {
                // Remove previous error messages
                const existingError = input.parentNode.querySelector('.error-message');
                if (existingError) existingError.remove();
                
                // Check if input is empty
                if (!input.value.trim()) {
                    isValid = false;
                    showError(input, 'This field is required');
                } else if (input.type === 'email' && !isValidEmail(input.value)) {
                    isValid = false;
                    showError(input, 'Please enter a valid email address');
                }
            });
            
            // Prevent form submission if validation fails
            if (!isValid) {
                e.preventDefault();
                
                // Scroll to first error
                const firstError = form.querySelector('.error-message');
                if (firstError) {
                    firstError.parentNode.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            } else if (form.classList.contains('contact-form') || form.classList.contains('newsletter-form')) {
                // For demo purposes, prevent actual form submission and show success message
                e.preventDefault();
                showFormSuccess(form);
            }
        });
    });
    
    // Helper function to show error message
    function showError(input, message) {
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        
        input.parentNode.appendChild(errorElement);
        input.setAttribute('aria-invalid', 'true');
        input.classList.add('input-error');
    }
    
    // Helper function to validate email
    function isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    // Show success message after form submission
    function showFormSuccess(form) {
        // Hide the form
        form.style.display = 'none';
        
        // Create success message
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        
        if (form.classList.contains('contact-form')) {
            successMessage.innerHTML = `
                <h3>Thank you for your message!</h3>
                <p>We have received your inquiry and will respond within 24 hours.</p>
            `;
        } else if (form.classList.contains('newsletter-form')) {
            successMessage.innerHTML = `
                <h3>Successfully subscribed!</h3>
                <p>Thank you for subscribing to our newsletter. You'll receive updates about Taniti Island soon.</p>
            `;
        } else {
            successMessage.innerHTML = `
                <h3>Form submitted successfully!</h3>
                <p>Thank you for your submission.</p>
            `;
        }
        
        // Add button to reset form
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

/**
 * Gallery Lightbox
 */
function initGalleryLightbox() {
    const galleryItems = document.querySelectorAll('.gallery-item img');
    
    if (!galleryItems.length) return;
    
    // Create lightbox elements
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
    
    // Get lightbox elements
    const lightboxImage = lightbox.querySelector('.lightbox-image');
    const lightboxCaption = lightbox.querySelector('.lightbox-caption');
    const lightboxClose = lightbox.querySelector('.lightbox-close');
    const lightboxPrev = lightbox.querySelector('.lightbox-prev');
    const lightboxNext = lightbox.querySelector('.lightbox-next');
    
    let currentIndex = 0;
    
    // Open lightbox when clicking on gallery image
    galleryItems.forEach((img, index) => {
        img.addEventListener('click', (e) => {
            e.preventDefault();
            currentIndex = index;
            openLightbox(img);
        });
        
        // Add keyboard accessibility
        img.parentElement.setAttribute('tabindex', '0');
        img.parentElement.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                currentIndex = index;
                openLightbox(img);
            }
        });
    });
    
    // Open lightbox with selected image
    function openLightbox(img) {
        lightboxImage.src = img.src;
        lightboxImage.alt = img.alt;
        
        // Get caption if available
        const caption = img.closest('.gallery-item').querySelector('.gallery-caption');
        lightboxCaption.textContent = caption ? caption.textContent : '';
        
        // Show lightbox
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
        
        // Focus on close button for accessibility
        lightboxClose.focus();
        
        // Update navigation buttons
        updateNavButtons();
    }
    
    // Close lightbox
    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });
    
    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
        
        // Return focus to the image that was clicked
        galleryItems[currentIndex].parentElement.focus();
    }
    
    // Navigate between images
    lightboxPrev.addEventListener('click', showPrevImage);
    lightboxNext.addEventListener('click', showNextImage);
    
    function showPrevImage() {
        currentIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
        openLightbox(galleryItems[currentIndex]);
    }
    
    function showNextImage() {
        currentIndex = (currentIndex + 1) % galleryItems.length;
        openLightbox(galleryItems[currentIndex]);
    }
    
    // Update navigation buttons visibility
    function updateNavButtons() {
        lightboxPrev.style.display = galleryItems.length > 1 ? 'block' : 'none';
        lightboxNext.style.display = galleryItems.length > 1 ? 'block' : 'none';
    }
    
    // Keyboard navigation
    lightbox.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        
        switch (e.key) {
            case 'Escape':
                closeLightbox();
                break;
            case 'ArrowLeft':
                showPrevImage();
                break;
            case 'ArrowRight':
                showNextImage();
                break;
        }
    });
}

/**
 * Smooth Scrolling for Anchor Links
 */
function initSmoothScrolling() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');
    
    anchorLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                e.preventDefault();
                
                // Get header height for offset
                const headerHeight = document.querySelector('.site-header')?.offsetHeight || 0;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Update URL without scrolling
                history.pushState(null, null, targetId);
                
                // Set focus to the target element for accessibility
                targetElement.setAttribute('tabindex', '-1');
                targetElement.focus();
                
                // Remove tabindex after focus
                setTimeout(() => {
                    targetElement.removeAttribute('tabindex');
                }, 1000);
            }
        });
    });
}

/**
 * Weather Widget
 */
function initWeatherWidget() {
    const weatherWidget = document.querySelector('.weather-widget');
    
    if (!weatherWidget) return;
    
    // For demo purposes, we'll use mock data
    // In a real application, you would fetch this from a weather API
    const weatherData = [
        { date: 'Today', icon: '☀️', temp: '84°F', desc: 'Sunny' },
        { date: 'Tomorrow', icon: '⛅', temp: '82°F', desc: 'Partly Cloudy' },
        { date: 'Wed', icon: '🌦️', temp: '79°F', desc: 'Scattered Showers' },
        { date: 'Thu', icon: '☀️', temp: '83°F', desc: 'Sunny' },
        { date: 'Fri', icon: '☀️', temp: '85°F', desc: 'Sunny' }
    ];
    
    // Populate weather widget
    weatherData.forEach(day => {
        const dayElement = document.createElement('div');
        dayElement.className = 'weather-day';
        dayElement.innerHTML = `
            <div class="weather-date">${day.date}</div>
            <div class="weather-icon">${day.icon}</div>
            <div class="weather-temp">${day.temp}</div>
            <div class="weather-desc">${day.desc}</div>
        `;
        weatherWidget.appendChild(dayElement);
    });
    
    // Add last updated info
    const lastUpdated = document.createElement('div');
    lastUpdated.className = 'weather-updated mt-2 text-center fs-small';
    lastUpdated.textContent = `Last updated: ${new Date().toLocaleString()}`;
    weatherWidget.parentNode.appendChild(lastUpdated);
}

/**
 * Itinerary Builder
 */
function initItineraryBuilder() {
    const itineraryBuilder = document.querySelector('.itinerary-builder');
    
    if (!itineraryBuilder) return;
    
    const daySelector = itineraryBuilder.querySelector('.day-selector');
    const activitySelector = itineraryBuilder.querySelector('.activity-selector');
    const itineraryPreview = itineraryBuilder.querySelector('.itinerary-preview');
    
    // Sample activities data
    const activitiesByCategory = {
        beaches: [
            { id: 'b1', name: 'Taniti Beach', time: '9:00 AM - 12:00 PM', desc: 'Relaxing at the main beach' },
            { id: 'b2', name: 'Hidden Cove', time: '2:00 PM - 5:00 PM', desc: 'Secluded beach with crystal waters' }
        ],
        hiking: [
            { id: 'h1', name: 'Volcano Trail', time: '8:00 AM - 12:00 PM', desc: 'Moderate hike with amazing views' },
            { id: 'h2', name: 'Jungle Trek', time: '1:00 PM - 4:00 PM', desc: 'Guided tour through rainforest' }
        ],
        dining: [
            { id: 'd1', name: 'Seafood Dinner', time: '6:00 PM - 8:00 PM', desc: 'Fresh catch at coastal restaurant' },
            { id: 'd2', name: 'Local Cuisine', time: '12:00 PM - 2:00 PM', desc: 'Traditional lunch at village market' }
        ],
        tours: [
            { id: 't1', name: 'Island Tour', time: '9:00 AM - 3:00 PM', desc: 'Comprehensive tour of main attractions' },
            { id: 't2', name: 'Boat Excursion', time: '10:00 AM - 2:00 PM', desc: 'Snorkeling and island hopping' }
        ]
    };
    
    // Initialize days (for a week-long trip)
    for (let i = 1; i <= 7; i++) {
        const dayBtn = document.createElement('button');
        dayBtn.className = 'day-btn' + (i === 1 ? ' active' : '');
        dayBtn.textContent = `Day ${i}`;
        dayBtn.dataset.day = i;
        daySelector.appendChild(dayBtn);
    }
    
    // Initialize activity categories
    Object.keys(activitiesByCategory).forEach(category => {
        const categoryHeading = document.createElement('h4');
        categoryHeading.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        activitySelector.appendChild(categoryHeading);
        
        const activitiesContainer = document.createElement('div');
        activitiesContainer.className = 'd-flex flex-wrap gap-2 mb-3';
        
        activitiesByCategory[category].forEach(activity => {
            const activityOption = document.createElement('div');
            activityOption.className = 'activity-option';
            activityOption.dataset.id = activity.id;
            activityOption.dataset.category = category;
            activityOption.innerHTML = `
                <strong>${activity.name}</strong>
                <div>${activity.time}</div>
            `;
            activitiesContainer.appendChild(activityOption);
        });
        
        activitySelector.appendChild(activitiesContainer);
    });
    
    // Initialize itinerary days
    for (let i = 1; i <= 7; i++) {
        const daySection = document.createElement('div');
        daySection.className = 'itinerary-day' + (i === 1 ? '' : ' hidden');
        daySection.dataset.day = i;
        daySection.innerHTML = `
            <h4>Day ${i} Itinerary</h4>
            <div class="itinerary-items"></div>
            <div class="empty-message">No activities selected for this day. Click on activities to add them.</div>
        `;
        itineraryPreview.appendChild(daySection);
    }
    
    // Day selection
    daySelector.addEventListener('click', (e) => {
        if (e.target.classList.contains('day-btn')) {
            const selectedDay = e.target.dataset.day;
            
            // Update active button
            daySelector.querySelectorAll('.day-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            e.target.classList.add('active');
            
            // Show corresponding itinerary
            itineraryPreview.querySelectorAll('.itinerary-day').forEach(day => {
                day.classList.add('hidden');
                if (day.dataset.day === selectedDay) {
                    day.classList.remove('hidden');
                }
            });
        }
    });
    
    // Activity selection
    activitySelector.addEventListener('click', (e) => {
        const activityOption = e.target.closest('.activity-option');
        if (!activityOption) return;
        
        const activityId = activityOption.dataset.id;
        const category = activityOption.dataset.category;
        const activity = activitiesByCategory[category].find(a => a.id === activityId);
        
        // Get current day
        const currentDay = daySelector.querySelector('.day-btn.active').dataset.day;
        const daySection = itineraryPreview.querySelector(`.itinerary-day[data-day="${currentDay}"]`);
        const itemsContainer = daySection.querySelector('.itinerary-items');
        const emptyMessage = daySection.querySelector('.empty-message');
        
        // Check if activity already added
        const existingItem = itemsContainer.querySelector(`[data-id="${activityId}"]`);
        if (existingItem) {
            alert('This activity is already in your itinerary for this day.');
            return;
        }
        
        // Add activity to itinerary
        const itineraryItem = document.createElement('div');
        itineraryItem.className = 'itinerary-item';
        itineraryItem.dataset.id = activityId;
        itineraryItem.innerHTML = `
            <div class="itinerary-time">${activity.time}</div>
            <div class="itinerary-details">
                <strong>${activity.name}</strong>
                <div>${activity.desc}</div>
            </div>
            <button class="remove-activity" aria-label="Remove activity">&times;</button>
        `;
        itemsContainer.appendChild(itineraryItem);
        
        // Hide empty message if there are items
        if (itemsContainer.children.length > 0) {
            emptyMessage.style.display = 'none';
        }
        
        // Sort items by time
        sortItineraryItems(itemsContainer);
    });
    
    // Remove activity
    itineraryPreview.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-activity')) {
            const item = e.target.closest('.itinerary-item');
            const itemsContainer = item.parentNode;
            const emptyMessage = itemsContainer.parentNode.querySelector('.empty-message');
            
            item.remove();
            
            // Show empty message if no items
            if (itemsContainer.children.length === 0) {
                emptyMessage.style.display = 'block';
            }
        }
    });
    
    // Sort itinerary items by time
    function sortItineraryItems(container) {
        const items = Array.from(container.children);
        
        items.sort((a, b) => {
            const timeA = a.querySelector('.itinerary-time').textContent;
            const timeB = b.querySelector('.itinerary-time').textContent;
            
            // Extract start time for comparison
            const startTimeA = timeA.split(' - ')[0];
            const startTimeB = timeB.split(' - ')[0];
            
            return convertTimeToMinutes(startTimeA) - convertTimeToMinutes(startTimeB);
        });
        
        // Clear and re-append in sorted order
        container.innerHTML = '';
        items.forEach(item => container.appendChild(item));
    }
    
    // Helper to convert time to minutes for comparison
    function convertTimeToMinutes(timeStr) {
        const [time, period] = timeStr.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        
        if (period === 'PM' && hours < 12) {
            hours += 12;
        } else if (period === 'AM' && hours === 12) {
            hours = 0;
        }
        
        return hours * 60 + minutes;
    }
    
    // Save itinerary
    const saveButton = itineraryBuilder.querySelector('.save-itinerary button');
    if (saveButton) {
        saveButton.addEventListener('click', () => {
                        // In a real application, this would save to a database or local storage
            // For demo purposes, we'll just show a success message
            
            // Check if there are any activities in the itinerary
            let hasActivities = false;
            itineraryPreview.querySelectorAll('.itinerary-items').forEach(container => {
                if (container.children.length > 0) {
                    hasActivities = true;
                }
            });
            
            if (!hasActivities) {
                alert('Please add at least one activity to your itinerary before saving.');
                return;
            }
            
            // Create a printable version
            const printableItinerary = document.createElement('div');
            printableItinerary.className = 'printable-itinerary';
            printableItinerary.innerHTML = '<h2>Your Taniti Island Itinerary</h2>';
            
            // Copy all day sections
            itineraryPreview.querySelectorAll('.itinerary-day').forEach(day => {
                const dayCopy = day.cloneNode(true);
                dayCopy.classList.remove('hidden');
                
                // Remove empty days
                const items = dayCopy.querySelector('.itinerary-items');
                if (items.children.length === 0) {
                    dayCopy.querySelector('.empty-message').textContent = 'No activities planned for this day.';
                } else {
                    dayCopy.querySelector('.empty-message').style.display = 'none';
                }
                
                // Remove remove buttons
                dayCopy.querySelectorAll('.remove-activity').forEach(btn => btn.remove());
                
                printableItinerary.appendChild(dayCopy);
            });
            
            // Add contact information
            printableItinerary.innerHTML += `
                <div class="itinerary-footer mt-4">
                    <p>Thank you for planning your trip to Taniti Island!</p>
                    <p>For assistance, contact our concierge at: concierge@tanitiisland.com</p>
                </div>
            `;
            
            // Create a modal to display the itinerary
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
            
            // Add the printable itinerary to the modal
            modal.querySelector('.modal-body').appendChild(printableItinerary);
            
            // Add the modal to the page
            document.body.appendChild(modal);
            
            // Show the modal
            setTimeout(() => {
                modal.classList.add('show');
            }, 10);
            
            // Close modal
            modal.querySelector('.modal-close').addEventListener('click', () => {
                modal.classList.remove('show');
                setTimeout(() => {
                    modal.remove();
                }, 300);
            });
            
            // Print functionality
            modal.querySelector('.print-btn').addEventListener('click', () => {
                const printContent = printableItinerary.innerHTML;
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
                            @media print {
                                body { font-size: 12pt; }
                                .itinerary-day { page-break-inside: avoid; }
                            }
                        </style>
                    </head>
                    <body>
                        ${printContent}
                    </body>
                    </html>
                `);
                
                printWindow.document.close();
                printWindow.focus();
                
                // Print after a short delay to ensure content is loaded
                setTimeout(() => {
                    printWindow.print();
                }, 500);
            });
            
            // Email functionality (demo)
            modal.querySelector('.email-btn').addEventListener('click', () => {
                const emailForm = document.createElement('form');
                emailForm.className = 'email-form mt-3';
                emailForm.innerHTML = `
                    <div class="form-row">
                        <label for="email">Your Email Address:</label>
                        <input type="email" id="email" required placeholder="Enter your email">
                    </div>
                    <button type="submit" class="btn btn-primary">Send Itinerary</button>
                `;
                
                // Replace buttons with form
                const modalFooter = modal.querySelector('.modal-footer');
                modalFooter.innerHTML = '';
                modalFooter.appendChild(emailForm);
                
                // Handle form submission
                emailForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const email = emailForm.querySelector('#email').value;
                    
                    // Show sending state
                    modalFooter.innerHTML = '<p class="text-center">Sending itinerary to your email...</p>';
                    
                    // Simulate sending delay
                    setTimeout(() => {
                        modalFooter.innerHTML = `
                            <div class="success-message text-center">
                                <p>Your itinerary has been sent to: ${email}</p>
                                <p class="mt-2">Please check your inbox (and spam folder) for the email.</p>
                                <button class="btn btn-secondary mt-3 close-modal-btn">Close</button>
                            </div>
                        `;
                        
                        // Add event listener to new close button
                        modalFooter.querySelector('.close-modal-btn').addEventListener('click', () => {
                            modal.classList.remove('show');
                            setTimeout(() => {
                                modal.remove();
                            }, 300);
                        });
                    }, 2000);
                });
            });
        });
    }
}

/**
 * Map Interaction
 */
function initMapInteraction() {
    const mapContainer = document.querySelector('.map-container');
    
    if (!mapContainer) return;
    
    const mapPlaceholder = mapContainer.querySelector('.map-placeholder');
    const mapLegend = mapContainer.querySelector('.map-legend');
    
    if (!mapPlaceholder) return;
    
    // For demo purposes, we'll use a placeholder instead of an actual map
    // In a real application, you would initialize a map library like Google Maps or Leaflet
    
    mapPlaceholder.innerHTML = `
        <div class="map-demo">
            <img src="images/taniti-map.jpg" alt="Map of Taniti Island" class="map-image">
            <div class="map-overlay">
                <div class="map-point" style="top: 30%; left: 40%;" data-type="beach" title="Taniti Beach"></div>
                <div class="map-point" style="top: 45%; left: 60%;" data-type="dining" title="Seafood Restaurant"></div>
                <div class="map-point" style="top: 60%; left: 30%;" data-type="activity" title="Volcano Hiking"></div>
                <div class="map-point" style="top: 35%; left: 70%;" data-type="shopping" title="Local Market"></div>
                <div class="map-point" style="top: 50%; left: 50%;" data-type="accommodation" title="Taniti Resort"></div>
                <div class="map-point" style="top: 25%; left: 55%;" data-type="attraction" title="Cultural Center"></div>
            </div>
        </div>
    `;
    
    // Add interaction to map points
    const mapPoints = mapPlaceholder.querySelectorAll('.map-point');
    
    mapPoints.forEach(point => {
        // Create tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'map-tooltip';
        tooltip.textContent = point.getAttribute('title');
        point.appendChild(tooltip);
        
        // Show tooltip on hover/focus
        point.addEventListener('mouseenter', () => {
            tooltip.style.display = 'block';
        });
        
        point.addEventListener('mouseleave', () => {
            tooltip.style.display = 'none';
        });
        
        // Make points focusable and handle keyboard events
        point.setAttribute('tabindex', '0');
        point.addEventListener('focus', () => {
            tooltip.style.display = 'block';
        });
        
        point.addEventListener('blur', () => {
            tooltip.style.display = 'none';
        });
        
        // Show more info when clicked
        point.addEventListener('click', () => {
            showPointDetails(point);
        });
        
        point.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                showPointDetails(point);
            }
        });
    });
    
    // Show details for a map point
    function showPointDetails(point) {
        const type = point.dataset.type;
        const title = point.getAttribute('title');
        
        // Create info card
        const infoCard = document.createElement('div');
        infoCard.className = 'map-info-card';
        
        // Set content based on point type
        switch (type) {
            case 'beach':
                infoCard.innerHTML = `
                    <h4>${title}</h4>
                    <p>Beautiful sandy beach with crystal clear waters. Perfect for swimming and sunbathing.</p>
                    <p><strong>Facilities:</strong> Restrooms, showers, beach chairs</p>
                    <p><strong>Hours:</strong> Open 24/7</p>
                    <a href="#" class="btn btn-sm btn-primary">More Details</a>
                `;
                break;
            case 'dining':
                infoCard.innerHTML = `
                    <h4>${title}</h4>
                    <p>Fresh seafood restaurant with ocean views. Local specialties and international cuisine.</p>
                    <p><strong>Hours:</strong> 11:00 AM - 10:00 PM</p>
                    <p><strong>Price Range:</strong> $$-$$$</p>
                    <a href="#" class="btn btn-sm btn-primary">View Menu</a>
                `;
                break;
            case 'activity':
                infoCard.innerHTML = `
                    <h4>${title}</h4>
                    <p>Guided hiking tours of the dormant volcano with breathtaking views of the island.</p>
                    <p><strong>Duration:</strong> 3-4 hours</p>
                    <p><strong>Difficulty:</strong> Moderate</p>
                    <a href="#" class="btn btn-sm btn-primary">Book Tour</a>
                `;
                break;
            case 'shopping':
                infoCard.innerHTML = `
                    <h4>${title}</h4>
                    <p>Traditional market with local crafts, fresh produce, and souvenirs.</p>
                    <p><strong>Hours:</strong> 8:00 AM - 6:00 PM</p>
                    <p><strong>Specialties:</strong> Handmade crafts, tropical fruits</p>
                    <a href="#" class="btn btn-sm btn-primary">Shopping Guide</a>
                `;
                break;
            case 'accommodation':
                infoCard.innerHTML = `
                    <h4>${title}</h4>
                    <p>Luxury beachfront resort with spa, pools, and multiple restaurants.</p>
                    <p><strong>Amenities:</strong> WiFi, A/C, room service</p>
                    <p><strong>Price Range:</strong> $$$-$$$$</p>
                    <a href="#" class="btn btn-sm btn-primary">Check Availability</a>
                `;
                break;
            case 'attraction':
                infoCard.innerHTML = `
                    <h4>${title}</h4>
                    <p>Learn about Taniti's rich cultural heritage through exhibits and performances.</p>
                    <p><strong>Hours:</strong> 9:00 AM - 5:00 PM</p>
                    <p><strong>Admission:</strong> $10 adults, $5 children</p>
                    <a href="#" class="btn btn-sm btn-primary">Plan Visit</a>
                `;
                break;
        }
        
        // Add close button
        const closeButton = document.createElement('button');
        closeButton.className = 'info-card-close';
        closeButton.innerHTML = '&times;';
        closeButton.setAttribute('aria-label', 'Close information');
        infoCard.appendChild(closeButton);
        
        // Remove any existing info cards
        const existingCards = mapPlaceholder.querySelectorAll('.map-info-card');
        existingCards.forEach(card => card.remove());
        
        // Add the new card
        mapPlaceholder.appendChild(infoCard);
        
        // Position the card near the point but ensure it's visible
        const pointRect = point.getBoundingClientRect();
        const mapRect = mapPlaceholder.getBoundingClientRect();
        
        let top = pointRect.top - mapRect.top;
        let left = pointRect.left - mapRect.left + 30; // Offset to the right of the point
        
        // Adjust if the card would go off the right edge
        if (left + 300 > mapRect.width) { // Assuming card width is about 300px
            left = pointRect.left - mapRect.left - 330; // Place to the left of the point
        }
        
        // Adjust if the card would go off the bottom
        if (top + 200 > mapRect.height) { // Assuming card height is about 200px
            top = mapRect.height - 220;
        }
        
        infoCard.style.top = `${top}px`;
        infoCard.style.left = `${left}px`;
        
        // Add close functionality
        closeButton.addEventListener('click', () => {
            infoCard.remove();
        });
        
        // Close when clicking outside
        document.addEventListener('click', function closeCard(e) {
            if (!infoCard.contains(e.target) && e.target !== point) {
                infoCard.remove();
                document.removeEventListener('click', closeCard);
            }
        });
        
        // Focus the close button for accessibility
        setTimeout(() => {
            closeButton.focus();
        }, 100);
    }
    
    // Add filter functionality if legend exists
    if (mapLegend) {
        const legendItems = mapLegend.querySelectorAll('.legend-item');
        
        legendItems.forEach(item => {
            item.addEventListener('click', () => {
                const type = item.dataset.type;
                
                // Toggle active state
                item.classList.toggle('active');
                
                // Show/hide corresponding map points
                mapPoints.forEach(point => {
                    if (type === 'all' || point.dataset.type === type) {
                        if (type === 'all') {
                            // If "All" is clicked, show/hide all points based on its state
                            point.style.display = item.classList.contains('active') ? 'block' : 'none';
                            
                            // Update other legend items to match
                            legendItems.forEach(li => {
                                if (li !== item) {
                                    if (item.classList.contains('active')) {
                                        li.classList.add('active');
                                    } else {
                                        li.classList.remove('active');
                                    }
                                }
                            });
                        } else {
                            // For specific categories
                            point.style.display = item.classList.contains('active') ? 'block' : 'none';
                            
                            // Update "All" based on other categories
                            const allLegendItem = mapLegend.querySelector('[data-type="all"]');
                            const activeCategories = mapLegend.querySelectorAll('.legend-item.active:not([data-type="all"])');
                            
                            if (activeCategories.length === legendItems.length - 1) {
                                // All categories are active
                                allLegendItem.classList.add('active');
                            } else {
                                // Not all categories are active
                                allLegendItem.classList.remove('active');
                            }
                        }
                    }
                });
            });
        });
    }
}

/**
 * Animations on Scroll
 */
function initAnimations() {
    // Only run on browsers that support IntersectionObserver
    if (!('IntersectionObserver' in window)) return;
    
    const animatedElements = document.querySelectorAll('.fade-in-element, .slide-in-element');
    
    if (!animatedElements.length) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                // Stop observing after animation is triggered
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1, // Trigger when 10% of the element is visible
        rootMargin: '0px 0px -50px 0px' // Adjust the trigger point (negative value means trigger before fully in view)
    });
    
    animatedElements.forEach(element => {
        observer.observe(element);
    });
}

/**
 * Currency Converter
 */
function initCurrencyConverter() {
    const converter = document.querySelector('.currency-converter');
    
    if (!converter) return;
    
    const fromInput = converter.querySelector('#from-amount');
    const toInput = converter.querySelector('#to-amount');
    const fromCurrency = converter.querySelector('#from-currency');
    const toCurrency = converter.querySelector('#to-currency');
    const swapBtn = converter.querySelector('.swap-btn');
    const convertBtn = converter.querySelector('.convert-btn');
    const resultDiv = converter.querySelector('.conversion-result');
    
    // Exchange rates (fixed for demo purposes)
    // In a real application, these would be fetched from an API
    const exchangeRates = {
        USD: 1,
        EUR: 0.85,
        GBP: 0.73,
        JPY: 110.14,
        AUD: 1.35,
        CAD: 1.25,
        TND: 2.5 // Taniti Dollar (fictional)
    };
    
    // Convert currency
    function convertCurrency() {
        const fromValue = parseFloat(fromInput.value);
        if (isNaN(fromValue)) {
            resultDiv.textContent = 'Please enter a valid amount';
            resultDiv.classList.add('error');
            return;
        }
        
        const fromRate = exchangeRates[fromCurrency.value];
        const toRate = exchangeRates[toCurrency.value];
        
        // Convert to USD first, then to target currency
        const inUSD = fromValue / fromRate;
        const converted = inUSD * toRate;
        
        // Display result with 2 decimal places
        toInput.value = converted.toFixed(2);
        
        // Show result message
        resultDiv.textContent = `${fromValue} ${fromCurrency.value} = ${converted.toFixed(2)} ${toCurrency.value}`;
        resultDiv.classList.remove('error');
    }
    
    // Swap currencies
    function swapCurrencies() {
        const tempCurrency = fromCurrency.value;
        fromCurrency.value = toCurrency.value;
        toCurrency.value = tempCurrency;
        
        const tempValue = fromInput.value;
        fromInput.value = toInput.value;
        toInput.value = tempValue;
        
        // Update result if values exist
        if (fromInput.value) {
            convertCurrency();
        }
    }
    
    // Event listeners
    if (convertBtn) {
        convertBtn.addEventListener('click', convertCurrency);
    }
    
    if (swapBtn) {
        swapBtn.addEventListener('click', swapCurrencies);
    }
    
    // Auto-convert when inputs change
    [fromInput, fromCurrency, toCurrency].forEach(element => {
        element.addEventListener('change', convertCurrency);
    });
    
    // Initialize with default values
    fromInput.value = '1';
    fromCurrency.value = 'USD';
    toCurrency.value = 'TND';
    convertCurrency();
}

/**
 * Language Switcher (Demo)
 */
function initLanguageSwitcher() {
    const languageSelector = document.querySelector('.language-selector');
    
    if (!languageSelector) return;
    
    const languageOptions = languageSelector.querySelectorAll('.language-option');
    const currentLanguage = languageSelector.querySelector('.current-language');
    
    languageOptions.forEach(option => {
        option.addEventListener('click', () => {
            const language = option.dataset.lang;
            const languageName = option.textContent;
            
            // Update current language display
            currentLanguage.textContent = languageName;
            
            // In a real application, this would load translated content
            // For demo purposes, just show a notification
            showNotification(`Language changed to ${languageName}. In a real application, the page content would be translated.`);
            
            // Close dropdown (if implemented as a clickable dropdown rather than hover)
            languageSelector.classList.remove('open');
        });
    });
}

/**
 * Show a temporary notification
 */
function showNotification(message, type = 'info', duration = 3000) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <p>${message}</p>
            <button class="notification-close" aria-label="Close notification">&times;</button>
        </div>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Show with animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Set up close button
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    });
    
    // Auto-remove after duration
    if (duration) {
        setTimeout(() => {
            if (document.body.contains(notification)) {
                notification.classList.remove('show');
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }
        }, duration);
    }
}

/**
 * Countdown Timer for Special Events
 */
function initCountdownTimer() {
    const countdownContainer = document.querySelector('.countdown-timer');
    
    if (!countdownContainer) return;
    
    // Set the target date (for demo purposes, 30 days from now)
    const now = new Date();
    const targetDate = new Date();
    targetDate.setDate(now.getDate() + 30);
    
    // Update the countdown every second
    const countdownInterval = setInterval(updateCountdown, 1000);
    
    // Initial update
    updateCountdown();
    
    function updateCountdown() {
        const now = new Date();
        const timeLeft = targetDate - now;
        
        // If countdown is finished
        if (timeLeft <= 0) {
            clearInterval(countdownInterval);
            countdownContainer.innerHTML = '<p class="countdown-finished">The event has started!</p>';
            return;
        }
        
        // Calculate time units
        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        
        // Update the HTML
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

/**
 * Initialize all components
 */
document.addEventListener('DOMContentLoaded', function() {
    // Core functionality
    initMobileMenu();
    initFaqAccordion();
    initTabSwitching();
    initNotificationBanner();
    initSearchFunctionality();
    initFormValidation();
    initGalleryLightbox();
    initSmoothScrolling();
    
    // Additional features
    initWeatherWidget();
    initItineraryBuilder();
    initMapInteraction();
    initAnimations();
    initCurrencyConverter();
    initLanguageSwitcher();
    initCountdownTimer();
    
    // Add "loaded" class to body for CSS transitions
    document.body.classList.add('loaded');
});
