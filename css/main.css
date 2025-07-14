// Gorilla Docs - Rich Text Editor Application
class GorillaDocsApp {
    constructor() {
        this.quill = null;
        this.currentTheme = 'light';
        this.editorHidden = false;
        this.mobileToolbarVisible = false;
        this.isMobile = window.innerWidth <= 768;
        
        this.init();
    }

    init() {
        this.setupQuillEditor();
        this.setupThemeToggle();
        this.setupEventListeners();
        this.updateCurrentYear();
        this.initializeAnalytics();
        this.handleResize();
    }

    setupQuillEditor() {
        // Define custom toolbar
        const toolbarOptions = [
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            [{ 'font': [] }],
            [{ 'size': ['small', false, 'large', 'huge'] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'script': 'sub'}, { 'script': 'super' }],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            [{ 'indent': '-1'}, { 'indent': '+1' }],
            [{ 'align': [] }],
            ['blockquote', 'code-block'],
            ['link', 'image'],
            ['clean']
        ];

        // Initialize Quill
        this.quill = new Quill('#editor', {
            theme: 'snow',
            modules: {
                toolbar: {
                    container: toolbarOptions
                }
            },
            placeholder: 'Start writing your document...'
        });

        this.setupToolbarForDevice();

        // Listen for text changes
        this.quill.on('text-change', () => {
            this.updateAnalytics();
        });
    }

    setupToolbarForDevice() {
        const toolbar = document.querySelector('.ql-toolbar');
        
        if (this.isMobile) {
            // Move toolbar to mobile container
            const mobileContainer = document.getElementById('mobileToolbarContainer');
            if (toolbar && mobileContainer) {
                mobileContainer.appendChild(toolbar);
            }
        } else {
            // Move toolbar to header
            const desktopContainer = document.getElementById('toolbar');
            if (toolbar && desktopContainer) {
                desktopContainer.appendChild(toolbar);
            }
        }
    }

    setupThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
        
        // Load saved theme or default to light
        const savedTheme = localStorage.getItem('gorilla-docs-theme') || 'light';
        this.setTheme(savedTheme);
        
        themeToggle.addEventListener('click', () => {
            const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
            this.setTheme(newTheme);
        });
    }

    setTheme(theme) {
        this.currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        
        const themeIcon = document.querySelector('.theme-icon');
        themeIcon.textContent = theme === 'light' ? '🌙' : '☀️';
        
        // Save theme preference
        localStorage.setItem('gorilla-docs-theme', theme);
    }

    setupEventListeners() {
        // Toggle editor visibility
        document.getElementById('toggleEditor').addEventListener('click', () => {
            this.toggleEditor();
        });

        // Share functionality
        document.getElementById('shareBtn').addEventListener('click', () => {
            this.shareDocument();
        });

        // Download PDF functionality
        document.getElementById('downloadBtn').addEventListener('click', () => {
            this.downloadPDF();
        });

        // Mobile toolbar toggle
        document.getElementById('mobileToolbarToggle').addEventListener('click', () => {
            this.toggleMobileToolbar();
        });

        // Handle window resize for responsive behavior
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // Handle clicks outside mobile toolbar to close it
        document.addEventListener('click', (e) => {
            if (this.mobileToolbarVisible && 
                !e.target.closest('.mobile-toolbar') && 
                !e.target.closest('.mobile-toolbar-toggle')) {
                this.hideMobileToolbar();
            }
        });

        // Prevent mobile toolbar from closing when clicking inside it
        document.getElementById('mobileToolbar').addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    toggleEditor() {
        const editorContainer = document.getElementById('editorContainer');
        const toggleBtn = document.getElementById('toggleEditor');
        
        this.editorHidden = !this.editorHidden;
        
        if (this.editorHidden) {
            editorContainer.classList.add('hidden');
            toggleBtn.innerHTML = '<span>👁️</span>';
            toggleBtn.setAttribute('aria-label', 'Show editor');
        } else {
            editorContainer.classList.remove('hidden');
            toggleBtn.innerHTML = '<span>📝</span>';
            toggleBtn.setAttribute('aria-label', 'Hide editor');
        }
    }

    shareDocument() {
        if (navigator.share) {
            const content = this.quill.getText();
            navigator.share({
                title: 'Gorilla Docs - Document',
                text: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
                url: window.location.href
            }).catch(console.error);
        } else {
            // Fallback: copy link to clipboard
            navigator.clipboard.writeText(window.location.href).then(() => {
                this.showNotification('Link copied to clipboard!');
            }).catch(() => {
                this.showNotification('Unable to copy link');
            });
        }
    }

    downloadPDF() {
        // Simple HTML to PDF conversion using print
        const content = this.quill.root.innerHTML;
        const printWindow = window.open('', '_blank');
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Gorilla Docs - Document</title>
                <style>
                    body { 
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        line-height: 1.6;
                        max-width: 800px;
                        margin: 0 auto;
                        padding: 2rem;
                        color: #333;
                    }
                    h1, h2, h3, h4, h5, h6 { margin-top: 2rem; margin-bottom: 1rem; }
                    p { margin-bottom: 1rem; }
                    blockquote { 
                        border-left: 4px solid #ccc;
                        margin: 1rem 0;
                        padding-left: 1rem;
                        font-style: italic;
                    }
                    @media print {
                        body { margin: 0; }
                    }
                </style>
            </head>
            <body>
                ${content}
            </body>
            </html>
        `);
        
        printWindow.document.close();
        printWindow.focus();
        
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    }

    updateCurrentYear() {
        const yearElement = document.getElementById('currentYear');
        yearElement.textContent = new Date().getFullYear();
    }

    initializeAnalytics() {
        this.updateAnalytics();
    }

    updateAnalytics() {
        const text = this.quill.getText();
        const html = this.quill.root.innerHTML;
        
        // Calculate statistics
        const stats = this.calculateTextStats(text, html);
        
        // Update DOM elements
        document.getElementById('wordCount').textContent = stats.words;
        document.getElementById('charCount').textContent = stats.characters;
        document.getElementById('readingTime').textContent = stats.readingTime;
        document.getElementById('paragraphCount').textContent = stats.paragraphs;
        
        // Update readability score
        const readabilityScore = this.calculateReadabilityScore(text);
        const scoreElement = document.getElementById('readabilityScore');
        scoreElement.querySelector('.score-value').textContent = readabilityScore.score;
        scoreElement.title = readabilityScore.description;
    }

    calculateTextStats(text, html) {
        // Remove extra whitespace and newlines
        const cleanText = text.trim().replace(/\s+/g, ' ');
        
        // Calculate words (split by whitespace, filter empty strings)
        const words = cleanText ? cleanText.split(/\s+/).filter(word => word.length > 0).length : 0;
        
        // Calculate characters (excluding whitespace)
        const characters = cleanText.replace(/\s/g, '').length;
        
        // Calculate reading time (average 200 words per minute)
        const readingTimeMinutes = Math.ceil(words / 200);
        const readingTime = readingTimeMinutes === 0 ? '0 min' : 
                          readingTimeMinutes === 1 ? '1 min' : 
                          `${readingTimeMinutes} min`;
        
        // Calculate paragraphs (count <p> tags in HTML)
        const paragraphs = (html.match(/<p>/g) || []).length || (cleanText ? 1 : 0);
        
        return {
            words,
            characters,
            readingTime,
            paragraphs
        };
    }

    calculateReadabilityScore(text) {
        if (!text || text.trim().length === 0) {
            return { score: '-', description: 'No text to analyze' };
        }

        const cleanText = text.trim();
        
        // Count sentences (approximate by counting sentence endings)
        const sentences = cleanText.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
        
        // Count words
        const words = cleanText.split(/\s+/).filter(word => word.length > 0).length;
        
        // Count syllables (approximation)
        const syllables = this.countSyllables(cleanText);
        
        if (sentences === 0 || words === 0) {
            return { score: '-', description: 'Insufficient text for analysis' };
        }
        
        // Flesch Reading Ease Score
        const score = 206.835 - (1.015 * (words / sentences)) - (84.6 * (syllables / words));
        
        // Round and constrain score
        const roundedScore = Math.max(0, Math.min(100, Math.round(score)));
        
        // Get description
        const description = this.getReadabilityDescription(roundedScore);
        
        return { score: roundedScore, description };
    }

    countSyllables(text) {
        // Simple syllable counting algorithm
        const words = text.toLowerCase().split(/\s+/);
        let totalSyllables = 0;
        
        words.forEach(word => {
            // Remove punctuation
            word = word.replace(/[^a-z]/g, '');
            if (word.length === 0) return;
            
            // Count vowel groups
            let syllables = word.match(/[aeiouy]+/g);
            syllables = syllables ? syllables.length : 0;
            
            // Subtract silent e
            if (word.endsWith('e')) syllables--;
            
            // Every word has at least one syllable
            syllables = Math.max(1, syllables);
            
            totalSyllables += syllables;
        });
        
        return totalSyllables;
    }

    getReadabilityDescription(score) {
        if (score >= 90) return 'Very Easy';
        if (score >= 80) return 'Easy';
        if (score >= 70) return 'Fairly Easy';
        if (score >= 60) return 'Standard';
        if (score >= 50) return 'Fairly Difficult';
        if (score >= 30) return 'Difficult';
        return 'Very Difficult';
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
        
        mobileToolbar.classList.add('active');
        toggleBtn.innerHTML = '<span>✕</span>';
        this.mobileToolbarVisible = true;
        
        // Prevent body scroll when toolbar is open
        document.body.style.overflow = 'hidden';
    }

    hideMobileToolbar() {
        const mobileToolbar = document.getElementById('mobileToolbar');
        const toggleBtn = document.getElementById('mobileToolbarToggle');
        
        mobileToolbar.classList.remove('active');
        toggleBtn.innerHTML = '<span>🛠️</span>';
        this.mobileToolbarVisible = false;
        
        // Restore body scroll
        document.body.style.overflow = '';
    }

    handleResize() {
        const wasMobile = this.isMobile;
        this.isMobile = window.innerWidth <= 768;
        
        // If device type changed, move toolbar to appropriate container
        if (wasMobile !== this.isMobile) {
            this.setupToolbarForDevice();
            
            // Hide mobile toolbar if switching to desktop
            if (!this.isMobile && this.mobileToolbarVisible) {
                this.hideMobileToolbar();
            }
        }
    }

    showNotification(message) {
        // Simple notification system with improved styling
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: ${this.isMobile ? '80px' : '20px'};
            right: 20px;
            left: ${this.isMobile ? '20px' : 'auto'};
            background: var(--bg-primary);
            color: var(--text-primary);
            padding: 1rem 1.5rem;
            border-radius: var(--radius-lg);
            border: 1px solid var(--border-color);
            box-shadow: var(--shadow-xl);
            z-index: 1000;
            font-size: 0.875rem;
            font-weight: 500;
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            transform: translateX(${this.isMobile ? '0' : '20px'});
            opacity: 0;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        `;
        
        document.body.appendChild(notification);
        
        // Trigger animation
        requestAnimationFrame(() => {
            notification.style.transform = 'translateX(0)';
            notification.style.opacity = '1';
        });
        
        // Remove with animation
        setTimeout(() => {
            notification.style.transform = `translateX(${this.isMobile ? '0' : '20px'})`;
            notification.style.opacity = '0';
            
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new GorillaDocsApp();
});
