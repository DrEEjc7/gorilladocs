// Gorilla Docs - Premium Rich Text Editor Application
class GorillaDocsApp {
    constructor() {
        this.quill = null;
        this.currentTheme = 'light';
        this.editorHidden = false;
        this.mobileToolbarVisible = false;
        this.isMobile = false;
        this.isLoading = false;
        
        // Bind methods to maintain context
        this.handleResize = this.handleResize.bind(this);
        this.handleClickOutside = this.handleClickOutside.bind(this);
        this.updateAnalytics = this.updateAnalytics.bind(this);
        
        this.init();
    }

    async init() {
        try {
            this.showLoading();
            
            // Check device type
            this.checkDeviceType();
            
            // Initialize components
            await this.setupQuillEditor();
            this.setupThemeToggle();
            this.setupEventListeners();
            this.updateCurrentYear();
            this.initializeAnalytics();
            
            this.hideLoading();
        } catch (error) {
            console.error('Failed to initialize Gorilla Docs:', error);
            this.showNotification('Failed to initialize editor. Please refresh the page.', 'error');
            this.hideLoading();
        }
    }

    checkDeviceType() {
        this.isMobile = window.innerWidth <= 768;
    }

    async setupQuillEditor() {
        // Check if Quill is available
        if (typeof Quill === 'undefined') {
            throw new Error('Quill.js library not loaded');
        }

        // Simplified toolbar for better mobile experience
        const toolbarOptions = [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['link', 'blockquote'],
            ['clean']
        ];

        // Initialize Quill with proper error handling
        try {
            const editorElement = document.getElementById('editor');
            if (!editorElement) {
                throw new Error('Editor element not found');
            }

            this.quill = new Quill('#editor', {
                theme: 'snow',
                modules: {
                    toolbar: {
                        container: toolbarOptions
                    }
                },
                placeholder: 'Start writing your document...',
                bounds: '#editor'
            });

            // Handle toolbar positioning based on device
            this.positionToolbar();

            // Listen for text changes with debouncing
            this.quill.on('text-change', this.debounce(this.updateAnalytics, 300));
            
            // Handle selection changes for better UX
            this.quill.on('selection-change', (range) => {
                if (range && this.isMobile && this.mobileToolbarVisible) {
                    // Auto-hide mobile toolbar when user starts typing
                    this.hideMobileToolbar();
                }
            });

        } catch (error) {
            console.error('Failed to initialize Quill editor:', error);
            throw new Error('Editor initialization failed');
        }
    }

    positionToolbar() {
        const toolbar = document.querySelector('.ql-toolbar');
        if (!toolbar) return;

        // Prevent duplicate toolbar issues
        const currentParent = toolbar.parentNode;
        
        if (this.isMobile) {
            // Move to mobile container
            const mobileContainer = document.getElementById('mobileToolbarContainer');
            if (mobileContainer && currentParent !== mobileContainer) {
                mobileContainer.appendChild(toolbar);
            }
        } else {
            // Move to desktop container above editor
            const desktopContainer = document.getElementById('desktopToolbar');
            if (desktopContainer && currentParent !== desktopContainer) {
                desktopContainer.appendChild(toolbar);
            }
        }
    }

    setupThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
        if (!themeToggle) return;

        // Load saved theme or default to light
        const savedTheme = this.getSavedTheme();
        this.setTheme(savedTheme);
        
        themeToggle.addEventListener('click', () => {
            const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
            this.setTheme(newTheme);
        });
    }

    getSavedTheme() {
        try {
            return localStorage.getItem('gorilla-docs-theme') || 'light';
        } catch (error) {
            console.warn('Could not access localStorage for theme preference');
            return 'light';
        }
    }

    setTheme(theme) {
        if (!['light', 'dark'].includes(theme)) {
            theme = 'light';
        }

        this.currentTheme = theme;
        document.body.setAttribute('data-theme', theme);
        
        const themeIcon = document.querySelector('.theme-icon');
        if (themeIcon) {
            themeIcon.textContent = theme === 'light' ? '🌙' : '☀️';
        }
        
        // Save theme preference
        try {
            localStorage.setItem('gorilla-docs-theme', theme);
        } catch (error) {
            console.warn('Could not save theme preference to localStorage');
        }
    }

    setupEventListeners() {
        // Editor controls
        this.addEventListenerSafely('toggleEditor', 'click', () => this.toggleEditor());
        this.addEventListenerSafely('shareBtn', 'click', () => this.shareDocument());
        this.addEventListenerSafely('downloadBtn', 'click', () => this.downloadPDF());
        
        // Mobile toolbar controls
        this.addEventListenerSafely('mobileToolbarToggle', 'click', () => this.toggleMobileToolbar());
        this.addEventListenerSafely('closeMobileToolbar', 'click', () => this.hideMobileToolbar());

        // Global event listeners
        window.addEventListener('resize', this.handleResize);
        document.addEventListener('click', this.handleClickOutside);
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 's':
                        e.preventDefault();
                        this.downloadPDF();
                        break;
                    case 'h':
                        if (this.isMobile) {
                            e.preventDefault();
                            this.toggleMobileToolbar();
                        }
                        break;
                }
            }
            
            // Escape key to close mobile toolbar
            if (e.key === 'Escape' && this.mobileToolbarVisible) {
                this.hideMobileToolbar();
            }
        });
    }

    addEventListenerSafely(elementId, event, handler) {
        const element = document.getElementById(elementId);
        if (element) {
            element.addEventListener(event, handler);
        }
    }

    handleResize() {
        const wasMobile = this.isMobile;
        this.checkDeviceType();
        
        // If device type changed, reposition toolbar
        if (wasMobile !== this.isMobile) {
            this.positionToolbar();
            
            // Hide mobile toolbar if switching to desktop
            if (!this.isMobile && this.mobileToolbarVisible) {
                this.hideMobileToolbar();
            }
        }
    }

    handleClickOutside(e) {
        if (this.mobileToolbarVisible && 
            !e.target.closest('#mobileToolbar') && 
            !e.target.closest('#mobileToolbarToggle')) {
            this.hideMobileToolbar();
        }
    }

    toggleEditor() {
        const editorContainer = document.getElementById('editorContainer');
        const toggleBtn = document.getElementById('toggleEditor');
        if (!editorContainer || !toggleBtn) return;

        this.editorHidden = !this.editorHidden;
        
        editorContainer.classList.toggle('hidden', this.editorHidden);
        toggleBtn.innerHTML = `<span>${this.editorHidden ? '👁️' : '📝'}</span>`;
        toggleBtn.setAttribute('aria-label', this.editorHidden ? 'Show editor' : 'Hide editor');
        
        // Focus editor when showing
        if (!this.editorHidden && this.quill) {
            setTimeout(() => this.quill.focus(), 100);
        }
    }

    async shareDocument() {
        if (!this.quill) return;
        
        const content = this.quill.getText();
        const title = 'Gorilla Docs - Document';
        const text = content.substring(0, 280) + (content.length > 280 ? '...' : '');
        
        try {
            if (navigator.share && this.isMobile) {
                await navigator.share({
                    title,
                    text,
                    url: window.location.href
                });
                this.showNotification('Document shared successfully!', 'success');
            } else {
                // Fallback: copy link to clipboard
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    await navigator.clipboard.writeText(window.location.href);
                    this.showNotification('Link copied to clipboard!', 'success');
                } else {
                    // Fallback for older browsers
                    const textArea = document.createElement('textarea');
                    textArea.value = window.location.href;
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                    this.showNotification('Link copied to clipboard!', 'success');
                }
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Share failed:', error);
                this.showNotification('Unable to share document', 'error');
            }
        }
    }

    downloadPDF() {
        if (!this.quill) return;
        
        try {
            const content = this.quill.root.innerHTML;
            const printWindow = window.open('', '_blank');
            
            if (!printWindow) {
                this.showNotification('Please allow popups to download PDF', 'warning');
                return;
            }
            
            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Gorilla Docs - Document</title>
                    <meta charset="UTF-8">
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                        body { 
                            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                            line-height: 1.6;
                            max-width: 800px;
                            margin: 0 auto;
                            padding: 2rem;
                            color: #172b4d;
                            font-size: 16px;
                        }
                        h1, h2, h3, h4, h5, h6 { 
                            font-weight: 700;
                            margin-top: 2rem; 
                            margin-bottom: 1rem;
                            letter-spacing: -0.02em;
                        }
                        p { margin-bottom: 1rem; }
                        blockquote { 
                            border-left: 4px solid #0052cc;
                            margin: 1.5rem 0;
                            padding: 1rem 1.5rem;
                            background-color: #f4f5f7;
                            font-style: italic;
                            border-radius: 0 4px 4px 0;
                        }
                        ul, ol { margin: 1rem 0; padding-left: 2rem; }
                        li { margin-bottom: 0.5rem; }
                        @media print {
                            body { margin: 0; padding: 1rem; }
                            @page { margin: 1cm; }
                        }
                    </style>
                </head>
                <body>
                    ${content}
                </body>
                </html>
            `;
            
            printWindow.document.write(htmlContent);
            printWindow.document.close();
            printWindow.focus();
            
            setTimeout(() => {
                printWindow.print();
                printWindow.close();
            }, 250);
            
        } catch (error) {
            console.error('PDF download failed:', error);
            this.showNotification('Failed to generate PDF', 'error');
        }
    }

    toggleMobileToolbar() {
        if (this.mobileToolbarVisible) {
            this.hideMobileToolbar();
        } else {
            this.showMobileToolbar();
        }
    }

    showMobileToolbar() {
        const mobileToolbar = document.getElementById('mobileToolbar');
        const toggleBtn = document.getElementById('mobileToolbarToggle');
        
        if (!mobileToolbar || !toggleBtn) return;
        
        mobileToolbar.classList.add('active');
        toggleBtn.innerHTML = '<span>✕</span>';
        this.mobileToolbarVisible = true;
        
        // Prevent body scroll when toolbar is open
        document.body.style.overflow = 'hidden';
    }

    hideMobileToolbar() {
        const mobileToolbar = document.getElementById('mobileToolbar');
        const toggleBtn = document.getElementById('mobileToolbarToggle');
        
        if (!mobileToolbar || !toggleBtn) return;
        
        mobileToolbar.classList.remove('active');
        toggleBtn.innerHTML = '<span>🛠️</span>';
        this.mobileToolbarVisible = false;
        
        // Restore body scroll
        document.body.style.overflow = '';
    }

    updateCurrentYear() {
        const yearElement = document.getElementById('currentYear');
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
    }

    initializeAnalytics() {
        this.updateAnalytics();
    }

    updateAnalytics() {
        if (!this.quill) return;
        
        try {
            const text = this.quill.getText();
            const stats = this.calculateTextStats(text);
            
            this.updateElement('wordCount', stats.words);
            this.updateElement('charCount', stats.characters);
            this.updateElement('readingTime', stats.readingTime);
            this.updateElement('paragraphCount', stats.paragraphs);
            
            const readability = this.calculateReadabilityScore(text);
            const scoreElement = document.getElementById('readabilityScore');
            if (scoreElement) {
                const scoreValue = scoreElement.querySelector('.score-value');
                if (scoreValue) {
                    scoreValue.textContent = readability.score;
                    scoreElement.title = readability.description;
                }
            }
        } catch (error) {
            console.error('Analytics update failed:', error);
        }
    }

    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    calculateTextStats(text) {
        const cleanText = text.trim();
        
        // More accurate word counting
        const words = cleanText ? (cleanText.match(/\b\w+\b/g) || []).length : 0;
        
        // Character count excluding whitespace
        const characters = cleanText.replace(/\s/g, '').length;
        
        // Better paragraph counting using Quill's line breaks
        const paragraphs = cleanText ? Math.max(1, (cleanText.split(/\n\s*\n/).filter(p => p.trim().length > 0).length)) : 0;
        
        // Reading time calculation (200 words per minute average)
        const readingTimeMinutes = Math.ceil(words / 200);
        const readingTime = readingTimeMinutes === 0 ? '0 min' : 
                          readingTimeMinutes === 1 ? '1 min' : 
                          `${readingTimeMinutes} min`;
        
        return { words, characters, readingTime, paragraphs };
    }

    calculateReadabilityScore(text) {
        if (!text || text.trim().length === 0) {
            return { score: '-', description: 'No text to analyze' };
        }

        const cleanText = text.trim();
        
        // Count sentences more accurately
        const sentences = Math.max(1, (cleanText.match(/[.!?]+/g) || []).length);
        
        // Count words
        const words = (cleanText.match(/\b\w+\b/g) || []).length;
        
        if (words < 10) {
            return { score: '-', description: 'Need more text for analysis' };
        }
        
        // Count syllables
        const syllables = this.countSyllables(cleanText);
        
        // Flesch Reading Ease Score
        const score = 206.835 - (1.015 * (words / sentences)) - (84.6 * (syllables / words));
        
        // Round and constrain score
        const roundedScore = Math.max(0, Math.min(100, Math.round(score)));
        
        const description = this.getReadabilityDescription(roundedScore);
        
        return { score: roundedScore, description };
    }

    countSyllables(text) {
        if (!text || text.length === 0) return 0;
        
        // Convert to lowercase and remove non-alphabetic characters
        const cleanText = text.toLowerCase().replace(/[^a-z\s]/g, ' ');
        const words = cleanText.split(/\s+/).filter(word => word.length > 0);
        
        return words.reduce((totalSyllables, word) => {
            // Remove common suffixes that don't add syllables
            let processedWord = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
            processedWord = processedWord.replace(/^y/, '');
            
            // Count vowel groups
            const syllableMatches = processedWord.match(/[aeiouy]{1,2}/g);
            const syllableCount = syllableMatches ? syllableMatches.length : 0;
            
            // Every word has at least one syllable
            return totalSyllables + Math.max(1, syllableCount);
        }, 0);
    }

    getReadabilityDescription(score) {
        if (score >= 90) return 'Very Easy to read';
        if (score >= 80) return 'Easy to read';
        if (score >= 70) return 'Fairly Easy to read';
        if (score >= 60) return 'Standard readability';
        if (score >= 50) return 'Fairly Difficult to read';
        if (score >= 30) return 'Difficult to read';
        return 'Very Difficult to read';
    }

    showLoading() {
        this.isLoading = true;
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.add('active');
        }
    }

    hideLoading() {
        this.isLoading = false;
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.remove('active');
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.textContent = message;
        
        const typeColors = {
            success: 'var(--success)',
            warning: 'var(--warning)',
            error: 'var(--error)',
            info: 'var(--accent-primary)'
        };
        
        notification.style.cssText = `
            position: fixed;
            top: ${this.isMobile ? '80px' : '20px'};
            right: 20px;
            left: ${this.isMobile ? '20px' : 'auto'};
            background: var(--bg-elevated);
            color: var(--text-primary);
            border: 1px solid var(--border-primary);
            border-left: 4px solid ${typeColors[type] || typeColors.info};
            padding: 1rem 1.5rem;
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-xl);
            z-index: 10000;
            font-size: var(--font-size-sm);
            font-weight: 500;
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            transform: translateX(${this.isMobile ? '0' : '20px'});
            opacity: 0;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            max-width: 400px;
        `;
        
        document.body.appendChild(notification);
        
        // Trigger animation
        requestAnimationFrame(() => {
            notification.style.transform = 'translateX(0)';
            notification.style.opacity = '1';
        });
        
        // Auto-remove notification
        setTimeout(() => {
            notification.style.transform = `translateX(${this.isMobile ? '0' : '20px'})`;
            notification.style.opacity = '0';
            
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, type === 'error' ? 5000 : 3000);
    }

    // Utility function for debouncing
    debounce(func, wait) {
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

    // Cleanup method for when the app is destroyed
    destroy() {
        window.removeEventListener('resize', this.handleResize);
        document.removeEventListener('click', this.handleClickOutside);
        
        if (this.quill) {
            this.quill = null;
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.gorillaDocsApp = new GorillaDocsApp();
    } catch (error) {
        console.error('Failed to start Gorilla Docs:', error);
        
        // Show fallback error message
        const errorDiv = document.createElement('div');
        errorDiv.innerHTML = `
            <div style="
                position: fixed; top: 50%; left: 50%; 
                transform: translate(-50%, -50%);
                background: white; padding: 2rem; 
                border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                text-align: center; max-width: 400px;
            ">
                <h3 style="margin-bottom: 1rem; color: #172b4d;">Failed to Load Editor</h3>
                <p style="margin-bottom: 1.5rem; color: #5e6c84;">
                    There was an error loading Gorilla Docs. Please refresh the page to try again.
                </p>
                <button onclick="window.location.reload()" style="
                    background: #0052cc; color: white; border: none; 
                    padding: 0.75rem 1.5rem; border-radius: 6px; 
                    cursor: pointer; font-weight: 500;
                ">Refresh Page</button>
            </div>
        `;
        document.body.appendChild(errorDiv);
    }
});
