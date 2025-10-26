/**
 * Casa Vacacional - Script Principal
 * Funcionalidad principal del sitio web multilingüe
 */

class CasaVacacionalApp {
    constructor() {
        this.isInitialized = false;
        this.components = {};
    }

    /**
     * Inicializa la aplicación
     */
    async initialize() {
        try {
            console.log('🏠 Inicializando Casa Vacacional...');
            
            // Esperar a que las traducciones estén listas
            await this.waitForTranslations();
            
            // Inicializar componentes
            this.initializeLanguageSelector();
            this.initializeNavigation();
            this.initializeBookingForm();
            this.initializeContactForm();
            this.initializeAnimations();
            this.initializeVisualEffects();
            
            // Aplicar traducciones iniciales
            this.updateAllTranslations();
            
            this.isInitialized = true;
            console.log('✅ Casa Vacacional inicializada correctamente');
            
        } catch (error) {
            console.error('❌ Error al inicializar la aplicación:', error);
        }
    }

    /**
     * Espera a que las traducciones estén cargadas
     */
    async waitForTranslations() {
        return new Promise((resolve) => {
            if (window.translationManager && window.translationManager.isReady()) {
                resolve();
            } else {
                document.addEventListener('translationsLoaded', resolve, { once: true });
            }
        });
    }

    /**
     * Inicializa el selector de idioma
     */
    initializeLanguageSelector() {
        const languageBtn = document.getElementById('language-btn');
        const languageDropdown = document.getElementById('language-dropdown');
        const mobileLanguageBtn = document.getElementById('mobile-language-btn');

        if (!languageBtn || !languageDropdown) {
            console.warn('⚠️ Elementos del selector de idioma no encontrados');
            return;
        }

        // Poblar el dropdown con los idiomas disponibles
        this.populateLanguageDropdown();

        // Evento para mostrar/ocultar dropdown
        languageBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            languageDropdown.classList.toggle('show');
        });

        // Eventos para seleccionar idioma
        languageDropdown.addEventListener('click', (e) => {
            const option = e.target.closest('.language-option');
            if (option) {
                const selectedLang = option.getAttribute('data-lang');
                this.changeLanguage(selectedLang);
                languageDropdown.classList.remove('show');
            }
        });

        // Cerrar dropdown al hacer clic fuera
        document.addEventListener('click', () => {
            languageDropdown.classList.remove('show');
        });

        // Selector móvil (ciclar entre idiomas)
        if (mobileLanguageBtn) {
            mobileLanguageBtn.addEventListener('click', () => {
                this.cycleMobileLanguage();
            });
        }

        // Escuchar cambios de idioma
        document.addEventListener('languageChanged', () => {
            this.updateLanguageSelector();
            this.updateAllTranslations();
        });

        console.log('🌐 Selector de idioma inicializado');
    }

    /**
     * Pobla el dropdown de idiomas con los idiomas disponibles
     */
    populateLanguageDropdown() {
        const dropdown = document.getElementById('language-dropdown');
        if (!dropdown) return;

        const languages = window.translationManager.getAvailableLanguages();
        
        dropdown.innerHTML = languages.map(lang => `
            <div class="language-option" data-lang="${lang.code}">
                <span class="flag">${lang.flag}</span>
                <span>${lang.name}</span>
            </div>
        `).join('');
    }

    /**
     * Cambia el idioma de la aplicación
     */
    async changeLanguage(language) {
        const success = await window.translationManager.changeLanguage(language);
        if (success) {
            console.log('🔄 Idioma cambiado a:', language);
        }
    }

    /**
     * Cicla entre idiomas en dispositivos móviles
     */
    cycleMobileLanguage() {
        const languages = window.translationManager.getAvailableLanguages();
        const currentLang = window.translationManager.currentLanguage;
        const currentIndex = languages.findIndex(lang => lang.code === currentLang);
        const nextIndex = (currentIndex + 1) % languages.length;
        
        this.changeLanguage(languages[nextIndex].code);
    }

    /**
     * Actualiza la interfaz del selector de idioma
     */
    updateLanguageSelector() {
        const currentLangInfo = window.translationManager.getCurrentLanguageInfo();
        
        // Actualizar botón principal
        const currentLanguageSpan = document.getElementById('current-language');
        const languageIcon = document.getElementById('language-icon');
        
        if (currentLanguageSpan) {
            currentLanguageSpan.textContent = currentLangInfo.name;
        }
        
        if (languageIcon) {
            languageIcon.textContent = currentLangInfo.flag;
        }

        // Actualizar botón móvil
        const mobileLanguageIcon = document.getElementById('mobile-language-icon');
        if (mobileLanguageIcon) {
            mobileLanguageIcon.textContent = currentLangInfo.flag;
        }
    }

    /**
     * Actualiza todas las traducciones en la página
     */
    updateAllTranslations() {
        // Actualizar elementos con data-i18n
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = window.t(key);
            
            if (translation && translation !== key) {
                element.textContent = translation;
            }
        });

        // Actualizar placeholders
        const placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');
        placeholderElements.forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            const translation = window.t(key);
            
            if (translation && translation !== key) {
                element.placeholder = translation;
            }
        });

        console.log('🔄 Traducciones actualizadas');
    }

    /**
     * Inicializa la navegación suave
     */
    initializeNavigation() {
        const navLinks = document.querySelectorAll('nav a[href^="#"]');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    const headerHeight = document.getElementById('main-header').offsetHeight;
                    const targetPosition = targetElement.offsetTop - headerHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });

        console.log('🧭 Navegación suave inicializada');
    }

    /**
     * Inicializa el formulario de reserva
     */
    initializeBookingForm() {
        const checkinInput = document.getElementById('checkin');
        const checkoutInput = document.getElementById('checkout');
        const searchBtn = document.getElementById('search-btn');
        const bookNowBtn = document.getElementById('book-now-btn');

        if (!checkinInput || !checkoutInput || !searchBtn) {
            console.warn('⚠️ Elementos del formulario de reserva no encontrados');
            return;
        }

        // Configurar fechas mínimas
        const today = new Date().toISOString().split('T')[0];
        checkinInput.min = today;
        checkoutInput.min = today;

        // Validación de fechas
        checkinInput.addEventListener('change', () => {
            const checkinDate = new Date(checkinInput.value);
            checkinDate.setDate(checkinDate.getDate() + 1);
            checkoutInput.min = checkinDate.toISOString().split('T')[0];
            
            if (checkoutInput.value && checkoutInput.value <= checkinInput.value) {
                checkoutInput.value = checkinDate.toISOString().split('T')[0];
            }
        });

        // Evento de búsqueda
        searchBtn.addEventListener('click', () => {
            this.handleBookingSearch();
        });

        // Botón "Reservar Ahora"
        if (bookNowBtn) {
            bookNowBtn.addEventListener('click', () => {
                this.scrollToBookingForm();
            });
        }

        console.log('📅 Formulario de reserva inicializado');
    }

    /**
     * Maneja la búsqueda de reserva
     */
    handleBookingSearch() {
        const checkin = document.getElementById('checkin').value;
        const checkout = document.getElementById('checkout').value;
        const guests = document.getElementById('guests').value;

        // Validaciones
        if (!checkin || !checkout) {
            alert(window.t('hero.bookingForm.dateRequired') || 'Por favor selecciona las fechas de entrada y salida.');
            return;
        }

        if (new Date(checkin) >= new Date(checkout)) {
            alert(window.t('hero.bookingForm.invalidDates') || 'La fecha de salida debe ser posterior a la de entrada.');
            return;
        }

        // Procesar reserva (aquí puedes agregar tu lógica)
        console.log('🔍 Búsqueda de reserva:', { checkin, checkout, guests });
        
        const message = window.t('hero.bookingForm.searchSuccess') || 
                       `¡Búsqueda realizada! Entrada: ${checkin}, Salida: ${checkout}, Huéspedes: ${guests}`;
        alert(message);
    }

    /**
     * Desplaza a la sección del formulario de reserva
     */
    scrollToBookingForm() {
        const bookingForm = document.getElementById('booking-form');
        if (bookingForm) {
            bookingForm.scrollIntoView({ behavior: 'smooth' });
        }
    }

    /**
     * Inicializa el formulario de contacto
     */
    initializeContactForm() {
        const contactForm = document.getElementById('contact-form');
        
        if (!contactForm) {
            console.warn('⚠️ Formulario de contacto no encontrado');
            return;
        }

        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleContactSubmit();
        });

        console.log('📧 Formulario de contacto inicializado');
    }

    /**
     * Maneja el envío del formulario de contacto
     */
    async handleContactSubmit() {
        const name = document.getElementById('contact-name').value.trim();
        const email = document.getElementById('contact-email').value.trim();
        const message = document.getElementById('contact-message').value.trim();
        const submitBtn = document.querySelector('#contact-form button[type="submit"]');
        const spinner = document.getElementById('submit-spinner'); // Add <span id="submit-spinner" class="spinner-border d-none"></span> in HTML

        // Validaciones
        if (!name || !email || !message) {
            alert(window.t('contact.form.requiredFields'));
            return;
        }

        if (!this.isValidEmail(email)) {
            alert(window.t('contact.form.invalidEmail'));
            return;
        }

        // UI: Disable + loading
        submitBtn.disabled = true;
        submitBtn.textContent = window.t('contact.form.sending'); // Add to translations JSON
        if (spinner) spinner.classList.remove('d-none');

        try {
            const response = await fetch('/api/submit', {  // Node endpoint
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest' // AJAX flag
                },
                body: JSON.stringify({ name, email, message })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                console.log('📧 Contact form submitted:', { name, email, message });
                alert(window.t('contact.form.success'));
                document.getElementById('contact-form').reset();
            } else {
                const errorMsg = window.t('contact.form.error') + ". " + result.error;
                alert(errorMsg);
            }
        } catch (error) {
            console.error('Submission error:', error);
            alert(window.t('contact.form.networkError'));
        } finally {
            // Reset UI
            submitBtn.disabled = false;
            submitBtn.textContent = window.t('contact.form.send');
            if (spinner) spinner.classList.add('d-none');
        }

        // Procesar formulario (aquí puedes agregar tu lógica)
        console.log('📧 Formulario de contacto:', { name, email, message });

        //alert(window.t('contact.form.success'));
    }

    /**
     * Valida formato de email
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Inicializa las animaciones al hacer scroll
     */
    initializeAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        // Observar elementos animables
        const animateElements = document.querySelectorAll(
            '.feature-card, .gallery-item, .testimonial-card, .place-item'
        );
        animateElements.forEach(el => observer.observe(el));

        console.log('✨ Animaciones de scroll inicializadas');
    }

    /**
     * Inicializa efectos visuales
     */
    initializeVisualEffects() {
        // Efecto parallax para el hero
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const heroBackground = document.querySelector('.hero-background');
            
            if (heroBackground) {
                const speed = 0.5;
                heroBackground.style.transform = `translateY(${scrolled * speed}px)`;
            }
        });

        console.log('🎨 Efectos visuales inicializados');
    }

    /**
     * Utilidades
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        const currentLang = window.translationManager.currentLanguage;
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        
        return date.toLocaleDateString(currentLang, options);
    }

    isMobile() {
        return window.innerWidth <= 768;
    }
}

// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Iniciando Casa Vacacional...');
    
    // Inicializar gestor de traducciones
    await window.translationManager.initialize();
    
    // Inicializar aplicación principal
    window.casaVacacionalApp = new CasaVacacionalApp();
    await window.casaVacacionalApp.initialize();
});

// Manejo de errores globales
window.addEventListener('error', (e) => {
    console.error('❌ Error en la aplicación:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('❌ Promesa rechazada:', e.reason);
});

console.log('🔧 Script principal cargado');

