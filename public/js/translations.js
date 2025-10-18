/**
 * Módulo de Traducciones
 * Carga y gestiona las traducciones desde archivos JSON externos
 */

class TranslationManager {
    constructor() {
        this.translations = {};
        this.languages = {};
        this.currentLanguage = 'es';
        this.isLoaded = false;
    }

    /**
     * Inicializa el sistema de traducciones
     */
    async initialize() {
        try {
            // Cargar configuración de idiomas
            await this.loadLanguages();
            
            // Detectar idioma inicial
            this.detectInitialLanguage();
            
            // Cargar todas las traducciones
            await this.loadAllTranslations();
            
            this.isLoaded = true;
            console.log('✅ Sistema de traducciones inicializado correctamente');
            
            // Disparar evento personalizado
            document.dispatchEvent(new CustomEvent('translationsLoaded'));
            
        } catch (error) {
            console.error('❌ Error al inicializar traducciones:', error);
            this.isLoaded = false;
        }
    }

    /**
     * Carga la configuración de idiomas desde languages.json
     */
    async loadLanguages() {
        try {
            const response = await fetch('data/languages.json');
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
            const data = await response.json();
            this.languages = data.languages;
            
            console.log('📋 Idiomas cargados:', Object.keys(this.languages));
            
        } catch (error) {
            console.error('❌ Error al cargar configuración de idiomas:', error);
            // Fallback a configuración por defecto
            this.languages = {
                es: { name: "Castellano", flag: "🇪🇸", default: true },
                ca: { name: "Català", flag: "🏴󠁥󠁳󠁣󠁴󠁿", default: false },
                en: { name: "English", flag: "🇬🇧", default: false }
            };
        }
    }

    /**
     * Detecta el idioma inicial basado en localStorage o navegador
     */
    detectInitialLanguage() {
        // Prioridad 1: Idioma guardado en localStorage
        const savedLanguage = localStorage.getItem('casa-vacacional-language');
        if (savedLanguage && this.languages[savedLanguage]) {
            this.currentLanguage = savedLanguage;
            return;
        }

        // Prioridad 2: Idioma del navegador
        const browserLanguage = navigator.language.substring(0, 2);
        if (this.languages[browserLanguage]) {
            this.currentLanguage = browserLanguage;
            return;
        }

        // Prioridad 3: Idioma por defecto
        const defaultLanguage = Object.keys(this.languages).find(
            lang => this.languages[lang].default
        );
        if (defaultLanguage) {
            this.currentLanguage = defaultLanguage;
        }

        console.log('🌐 Idioma inicial detectado:', this.currentLanguage);
    }

    /**
     * Carga todas las traducciones disponibles
     */
    async loadAllTranslations() {
        const loadPromises = Object.keys(this.languages).map(lang => 
            this.loadLanguageFile(lang)
        );

        try {
            await Promise.all(loadPromises);
            console.log('📚 Todas las traducciones cargadas correctamente');
        } catch (error) {
            console.error('❌ Error al cargar algunas traducciones:', error);
        }
    }

    /**
     * Carga un archivo de traducción específico
     */
    async loadLanguageFile(language) {
        try {
            const response = await fetch(`data/${language}.json`);
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status} para idioma ${language}`);
            }
            
            const translations = await response.json();
            this.translations[language] = translations;
            
            console.log(`📖 Traducciones cargadas para: ${language}`);
            
        } catch (error) {
            console.error(`❌ Error al cargar traducciones para ${language}:`, error);
            this.translations[language] = {};
        }
    }

    /**
     * Cambia el idioma actual
     */
    async changeLanguage(language) {
        if (!this.languages[language]) {
            console.error('❌ Idioma no disponible:', language);
            return false;
        }

        // Si las traducciones no están cargadas, cargarlas
        if (!this.translations[language]) {
            await this.loadLanguageFile(language);
        }

        this.currentLanguage = language;
        localStorage.setItem('casa-vacacional-language', language);
        
        // Actualizar el atributo lang del documento
        document.documentElement.lang = language;
        
        console.log('🔄 Idioma cambiado a:', language);
        
        // Disparar evento de cambio de idioma
        document.dispatchEvent(new CustomEvent('languageChanged', {
            detail: { language, languageInfo: this.languages[language] }
        }));
        
        return true;
    }

    /**
     * Obtiene una traducción por su clave
     */
    getTranslation(key) {
        if (!this.isLoaded) {
            console.warn('⚠️ Traducciones aún no cargadas');
            return key;
        }

        const keys = key.split('.');
        let translation = this.translations[this.currentLanguage];

        for (const k of keys) {
            if (translation && typeof translation === 'object' && translation[k] !== undefined) {
                translation = translation[k];
            } else {
                console.warn(`⚠️ Traducción no encontrada: ${key} (idioma: ${this.currentLanguage})`);
                return key;
            }
        }

        return translation;
    }

    /**
     * Obtiene información del idioma actual
     */
    getCurrentLanguageInfo() {
        return {
            code: this.currentLanguage,
            ...this.languages[this.currentLanguage]
        };
    }

    /**
     * Obtiene la lista de idiomas disponibles
     */
    getAvailableLanguages() {
        return Object.keys(this.languages).map(code => ({
            code,
            ...this.languages[code]
        }));
    }

    /**
     * Verifica si las traducciones están cargadas
     */
    isReady() {
        return this.isLoaded;
    }
}

// Crear instancia global del gestor de traducciones
window.translationManager = new TranslationManager();

// Función de conveniencia para obtener traducciones (similar a i18n.t())
window.t = function(key) {
    return window.translationManager.getTranslation(key);
};

console.log('🔧 Módulo de traducciones cargado');

