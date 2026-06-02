/**
 * 60sec.shop - Domain Sales Portal Core Script
 * Shared across English, Arabic, and Portuguese pages.
 * Features: Light/Dark Switcher, Scroll-Spy, Form Validation, XSS Sanitization, Web3Forms.
 */

// Global Configuration
const CONFIG = {
    WEB3FORMS_ACCESS_KEY: "b33899ea-0d73-4db4-8d91-f964f66cb867",
    MINIMUM_OFFER: 500,
    API_URL: "https://api.web3forms.com/submit"
};

// Localized alerts for feedback messages
const TRANSLATIONS = {
    ar: {
        success: "تم إرسال عرضك بنجاح! سنقوم بمراجعته والرد عليك في أقرب وقت.",
        error: "الرجاء مراجعة الحقول وإدخال بيانات صحيحة.",
        connection_error: "تعذر الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت.",
        sending: "جاري الإرسال...",
        submit_btn: "إرسال العرض المالي"
    },
    en: {
        success: "Your offer has been submitted successfully! We will contact you within 12 hours.",
        error: "Please check the fields and enter valid details.",
        connection_error: "Connection error. Please check your internet connection.",
        sending: "Sending...",
        submit_btn: "Submit Financial Offer"
    },
    pt: {
        success: "Sua oferta foi enviada com sucesso! Entraremos em contato em até 12 horas.",
        error: "Por favor, verifique os campos e insira dados válidos.",
        connection_error: "Falha na conexão. Verifique sua internet.",
        sending: "Enviando...",
        submit_btn: "Enviar Oferta Financeira"
    }
};

// State Variables
let currentLang = "en";

// Initialize UI Interactions on Load
document.addEventListener("DOMContentLoaded", () => {
    detectLanguage();
    initTheme();
    initScrollSpy();
    initFAQ();
    initForm();
    initLanguageRedirect();
    initDraggableWhatsApp();
});

/**
 * Detect language of the current document from <html lang="...">
 */
function detectLanguage() {
    const htmlLang = document.documentElement.getAttribute("lang");
    if (htmlLang && TRANSLATIONS[htmlLang]) {
        currentLang = htmlLang;
    }
}

/**
 * Initialize theme toggler and retrieve preferences
 */
function initTheme() {
    const toggleBtn = document.querySelector(".theme-toggle-btn");
    if (!toggleBtn) return;

    // Retrieve saved theme or default to 'dark'
    const savedTheme = localStorage.getItem("theme") || "dark";
    setTheme(savedTheme);

    toggleBtn.addEventListener("click", () => {
        const currentTheme = document.documentElement.getAttribute("data-theme");
        const nextTheme = currentTheme === "light" ? "dark" : "light";
        setTheme(nextTheme);
    });
}

/**
 * Set theme and update switcher button icons
 */
function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    
    const toggleBtn = document.querySelector(".theme-toggle-btn");
    if (toggleBtn) {
        // Change icon based on theme
        if (theme === "light") {
            toggleBtn.innerHTML = `
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
            `; // Moon icon for dark theme click
        } else {
            toggleBtn.innerHTML = `
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none">
                    <circle cx="12" cy="12" r="5"></circle>
                    <line x1="12" y1="1" x2="12" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="23"></line>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                    <line x1="1" y1="12" x2="3" y2="12"></line>
                    <line x1="21" y1="12" x2="23" y2="12"></line>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
            `; // Sun icon for light theme click
        }
    }
}

/**
 * Initialize Scroll-Spy navigation tracking active viewport sections
 */
function initScrollSpy() {
    const sections = document.querySelectorAll("section[id]");
    const navLinks = document.querySelectorAll(".nav-link");
    const header = document.querySelector(".header");

    window.addEventListener("scroll", () => {
        let scrollY = window.pageYOffset;

        // Sticky header styling adjustment on scroll
        if (header) {
            if (scrollY > 50) {
                header.style.boxShadow = "0 10px 30px var(--shadow-color)";
                header.style.padding = "0.5rem 0";
            } else {
                header.style.boxShadow = "none";
                header.style.padding = "0.75rem 0";
            }
        }

        sections.forEach(current => {
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop - 120;
            const sectionId = current.getAttribute("id");

            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove("active");
                    if (link.getAttribute("href") === `#${sectionId}`) {
                        link.classList.add("active");
                    }
                });
            }
        });
    });
}

/**
 * Initialize FAQ Toggle behavior
 */
function initFAQ() {
    const faqItems = document.querySelectorAll(".faq-item");
    faqItems.forEach(item => {
        const question = item.querySelector(".faq-question");
        question.addEventListener("click", () => {
            const isActive = item.classList.contains("active");
            faqItems.forEach(i => i.classList.remove("active"));
            if (!isActive) {
                item.classList.add("active");
            }
        });
    });
}

/**
 * Sanitize text input to prevent HTML inject/XSS vectors
 */
function sanitizeInput(str) {
    if (typeof str !== "string") return "";
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#x27;")
        .replace(/\//g, "&#x2F;");
}

/**
 * Handle validation and configuration for contact submits
 */
function initForm() {
    const offerForm = document.getElementById("offer-form");
    if (!offerForm) return;

    offerForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        hideAlert();

        const nameField = document.getElementById("buyer-name");
        const emailField = document.getElementById("buyer-email");
        const amountField = document.getElementById("offer-amount");
        const messageField = document.getElementById("buyer-message");
        const submitBtn = document.getElementById("btn-submit-offer");

        const data = {
            name: sanitizeInput(nameField.value),
            email: sanitizeInput(emailField.value),
            amount: parseFloat(amountField.value),
            message: sanitizeInput(messageField.value)
        };

        if (!validateForm(data, nameField, emailField, amountField)) {
            showAlert("error", TRANSLATIONS[currentLang].error);
            return;
        }

        const payload = new FormData();
        payload.append("access_key", CONFIG.WEB3FORMS_ACCESS_KEY);
        payload.append("name", data.name);
        payload.append("email", data.email);
        payload.append("amount", `$${data.amount} USD`);
        payload.append("message", data.message);
        payload.append("subject", `New offer on 60sec.shop from ${data.name}`);
        payload.append("from_name", "60sec.shop Portal");

        setLoadingState(true, submitBtn);

        try {
            const response = await fetch(CONFIG.API_URL, {
                method: "POST",
                body: payload
            });

            const result = await response.json();

            if (response.ok && result.success) {
                showAlert("success", TRANSLATIONS[currentLang].success);
                offerForm.reset();
            } else {
                showAlert("error", result.message || TRANSLATIONS[currentLang].error);
            }
        } catch (error) {
            showAlert("error", TRANSLATIONS[currentLang].connection_error);
        } finally {
            setLoadingState(false, submitBtn);
        }
    });
}

/**
 * Validate input fields helper
 */
function validateForm(data, nameField, emailField, amountField) {
    let isValid = true;
    document.querySelectorAll(".form-group").forEach(el => el.classList.remove("invalid"));

    if (!data.name || data.name.trim().length < 2) {
        nameField.parentElement.classList.add("invalid");
        isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email || !emailRegex.test(data.email)) {
        emailField.parentElement.classList.add("invalid");
        isValid = false;
    }

    if (isNaN(data.amount) || data.amount < CONFIG.MINIMUM_OFFER) {
        amountField.parentElement.classList.add("invalid");
        isValid = false;
    }

    return isValid;
}

/**
 * Set submit button status loading/idle
 */
function setLoadingState(isLoading, btn) {
    if (!btn) return;
    
    if (isLoading) {
        btn.disabled = true;
        btn.querySelector("span").textContent = TRANSLATIONS[currentLang].sending;
        btn.style.opacity = "0.7";
    } else {
        btn.disabled = false;
        btn.querySelector("span").textContent = TRANSLATIONS[currentLang].submit_btn;
        btn.style.opacity = "1";
    }
}

/**
 * Helper alert boxes inside the form card
 */
function showAlert(type, message) {
    const alertBox = document.getElementById("form-alert-box");
    const alertMsg = document.getElementById("alert-msg-text");
    const alertIcon = document.getElementById("alert-icon-svg");

    if (!alertBox || !alertMsg) return;

    alertBox.className = `form-alert ${type}`;
    alertMsg.textContent = message;
    
    if (alertIcon) {
        alertIcon.innerHTML = type === "success" ? "✓" : "!";
    }
    
    alertBox.style.display = "flex";
}

/**
 * Hide active form alert boxes
 */
function hideAlert() {
    const alertBox = document.getElementById("form-alert-box");
    if (alertBox) {
        alertBox.style.display = "none";
    }
}

/**
 * Initialize language selector dropdown redirection behavior
 */
function initLanguageRedirect() {
    const langSelect = document.getElementById("lang-select");
    if (!langSelect) return;

    langSelect.addEventListener("change", (e) => {
        const val = e.target.value;
        let destination = "";

        if (val === "ar") {
            destination = "../ar/index.html";
        } else if (val === "pt") {
            destination = "../pt/index.html";
        } else {
            destination = "../en/index.html";
        }

        window.location.href = destination;
    });
}

/**
 * Initialize free-dragging logic on the floating WhatsApp button
 */
function initDraggableWhatsApp() {
    const wrapper = document.querySelector(".whatsapp-floating-wrapper");
    const link = document.querySelector(".whatsapp-floating");
    if (!wrapper || !link) return;

    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let clickStartX = 0;
    let clickStartY = 0;
    let hasMoved = false;
    const dragThreshold = 6; // px shift before blocking click event

    // Prevent direct link redirection on drag releases
    link.addEventListener("click", (e) => {
        if (hasMoved) {
            e.preventDefault();
        }
    });

    const dragStart = (e) => {
        isDragging = true;
        hasMoved = false;

        const clientX = e.type.startsWith("touch") ? e.touches[0].clientX : e.clientX;
        const clientY = e.type.startsWith("touch") ? e.touches[0].clientY : e.clientY;

        clickStartX = clientX;
        clickStartY = clientY;

        const rect = wrapper.getBoundingClientRect();
        startX = clientX - rect.left;
        startY = clientY - rect.top;

        // Strip default position properties and force absolute coordinates
        wrapper.style.right = "auto";
        wrapper.style.bottom = "auto";
        wrapper.style.left = `${rect.left}px`;
        wrapper.style.top = `${rect.top}px`;

        if (e.type === "touchstart") {
            // Prevent default mobile scrolling gestures during drag
            e.preventDefault();
        }
    };

    const dragMove = (e) => {
        if (!isDragging) return;

        const clientX = e.type.startsWith("touch") ? e.touches[0].clientX : e.clientX;
        const clientY = e.type.startsWith("touch") ? e.touches[0].clientY : e.clientY;

        let targetX = clientX - startX;
        let targetY = clientY - startY;

        // Boundary constraints to keep the element fully inside window viewport
        const minX = 10;
        const minY = 10;
        const maxX = window.innerWidth - wrapper.offsetWidth - 10;
        const maxY = window.innerHeight - wrapper.offsetHeight - 10;

        if (targetX < minX) targetX = minX;
        if (targetX > maxX) targetX = maxX;
        if (targetY < minY) targetY = minY;
        if (targetY > maxY) targetY = maxY;

        wrapper.style.left = `${targetX}px`;
        wrapper.style.top = `${targetY}px`;

        // Check if movement exceeds threshold to treat it as drag rather than simple tap
        if (Math.abs(clientX - clickStartX) > dragThreshold || Math.abs(clientY - clickStartY) > dragThreshold) {
            hasMoved = true;
        }
    };

    const dragEnd = () => {
        isDragging = false;
    };

    // Desktop mouse events
    link.addEventListener("mousedown", dragStart);
    window.addEventListener("mousemove", dragMove);
    window.addEventListener("mouseup", dragEnd);

    // Mobile touch events
    link.addEventListener("touchstart", dragStart, { passive: false });
    window.addEventListener("touchmove", dragMove, { passive: false });
    window.addEventListener("touchend", dragEnd);
}
