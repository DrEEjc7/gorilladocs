// Gorilla Docs - Premium Rich Text Editor with Editor.js
class GorillaDocsApp {
    constructor() {
        this.editor = null;
        this.currentTheme = 'light';
        this.editorHidden = false;
        
        // Bind methods to maintain context
        this.updateAnalytics = this.updateAnalytics.bind(this);
        this.imageUploadHandler = this.imageUploadHandler.bind(this);
        
        this.init();
    }

    async init() {
        try {
            this.showLoading();
            
            // Check if Editor.js is loaded
            if (typeof EditorJS === 'undefined') {
                throw new Error('Editor.js library not loaded. Please check your internet connection.');
            }
            
            // Initialize components
            await this.setupEditorJS();
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

    async setupEditorJS() {
        try {
            // Check if all required classes are available
            const requiredClasses = {
                'Header': typeof Header !== 'undefined',
                'Paragraph': typeof Paragraph !== 'undefined',
                'List': typeof List !== 'undefined',
                'Checklist': typeof Checklist !== 'undefined',
                'ImageTool': typeof ImageTool !== 'undefined',
                'Quote': typeof Quote !== 'undefined',
                'CodeTool': typeof CodeTool !== 'undefined',
                'Delimiter': typeof Delimiter !== 'undefined',
                'RawTool': typeof RawTool !== 'undefined',
                'Embed': typeof Embed !== 'undefined',
                'Table': typeof Table !== 'undefined',
                'LinkTool': typeof LinkTool !== 'undefined',
                'Warning': typeof Warning !== 'undefined',
                'Marker': typeof Marker !== 'undefined',
                'InlineCode': typeof InlineCode !== 'undefined'
            };

            const missingClasses = Object.entries(requiredClasses)
                .filter(([name, available]) => !available)
                .map(([name]) => name);

            if (missingClasses.length > 0) {
                console.warn('Missing Editor.js plugins:', missingClasses);
                this.showNotification(`Some editor features may not work. Missing: ${missingClasses.join(', ')}`, 'warning');
            }

            // Build tools object with only available plugins
            const tools = {};

            if (typeof Header !== 'undefined') {
                tools.header = {
                    class: Header,
                    config: {
                        placeholder: 'Enter a header',
                        levels: [1, 2, 3, 4, 5, 6],
                        defaultLevel: 2
                    }
                };
            }

            if (typeof Paragraph !== 'undefined') {
                tools.paragraph = {
                    class: Paragraph,
                    inlineToolbar: true,
                    config: {
                        placeholder: 'Start typing...'
                    }
                };
            }

            if (typeof List !== 'undefined') {
                tools.list = {
                    class: List,
                    inlineToolbar: true,
                    config: {
                        defaultStyle: 'unordered'
                    }
                };
            }

            if (typeof Checklist !== 'undefined') {
                tools.checklist = {
                    class: Checklist,
                    inlineToolbar: true,
                };
            }

            if (typeof ImageTool !== 'undefined') {
                tools.image = {
                    class: ImageTool,
                    config: {
                        uploader: {
                            uploadByFile: this.imageUploadHandler,
                        }
                    }
                };
            }

            if (typeof Quote !== 'undefined') {
                tools.quote = {
                    class: Quote,
                    inlineToolbar: true,
                    config: {
                        quotePlaceholder: 'Enter a quote',
                        captionPlaceholder: 'Quote\'s author',
                    },
                };
            }

            if (typeof CodeTool !== 'undefined') {
                tools.code = {
                    class: CodeTool,
                    config: {
                        placeholder: 'Enter code...'
                    }
                };
            }

            if (typeof Delimiter !== 'undefined') {
                tools.delimiter = Delimiter;
            }

            if (typeof RawTool !== 'undefined') {
                tools.raw = RawTool;
            }

            if (typeof Embed !== 'undefined') {
                tools.embed = {
                    class: Embed,
                    config: {
                        services: {
                            youtube: true,
                            coub: true,
                            codepen: true,
                            twitter: true,
                            instagram: true,
                            vimeo: true,
                            gfycat: true,
                            imgur: true,
                            vine: true,
                            aparat: true,
                            facebook: true,
                            pinterest: true,
                        }
                    }
                };
            }

            if (typeof Table !== 'undefined') {
                tools.table = {
                    class: Table,
                    inlineToolbar: true,
                    config: {
                        rows: 2,
                        cols: 3,
                    },
                };
            }

            // Only add linkTool if it's available and we have a working endpoint
            if (typeof LinkTool !== 'undefined') {
                tools.linkTool = {
                    class: LinkTool,
                    config: {
                        endpoint: '/fetchUrl' // You'll need to implement this endpoint
                    }
                };
            }

            if (typeof Warning !== 'undefined') {
                tools.warning = {
                    class: Warning,
                    inlineToolbar: true,
                    config: {
                        titlePlaceholder: 'Title',
                        messagePlaceholder: 'Message',
                    },
                };
            }

            if (typeof Marker !== 'undefined') {
                tools.marker = {
                    class: Marker,
                };
            }

            if (typeof InlineCode !== 'undefined') {
                tools.inlineCode = {
                    class: InlineCode,
                };
            }

            this.editor = new EditorJS({
                holder: 'editor',
                placeholder: 'Start writing your document...',
                autofocus: true,
                tools: tools,
                data: {
                    blocks: [
                        {
                            type: 'header',
                            data: {
                                text: 'Welcome to Your Upgraded Gorilla Docs!',
                                level: 1
                            }
                        },
                        {
                            type: 'paragraph',
                            data: {
                                text: 'You can now create rich, block-based content with tables, embedded media, and much more!'
                            }
                        },
                        {
                            type: 'code',
                            data: {
                                code: 'function helloWorld() {\n    console.log("Hello, from Gorilla Docs!");\n}'
                            }
                        }
                    ]
                },
                onChange: this.debounce(this.updateAnalytics, 300),
                onReady: () => {
                    console.log('Editor.js is ready to work!');
                }
            });

            await this.editor.isReady;
            
        } catch (error) {
            console.error('Failed to initialize Editor.js:', error);
            throw new Error('Editor initialization failed: ' + error.message);
        }
    }

    async imageUploadHandler(file) {
        return new Promise((resolve, reject) => {
            // Check file size (limit to 5MB)
            if (file.size > 5 * 1024 * 1024) {
                reject(new Error('Image size should be less than 5MB'));
                return;
            }

            // Check file type
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                reject(new Error('Only JPEG, PNG, GIF, and WebP images are allowed'));
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                resolve({
                    success: 1,
                    file: {
                        url: e.target.result,
                        name: file.name,
                        size: file.size
                    }
                });
            };
            reader.onerror = () => {
                reject(new Error('Failed to read file'));
            };
            reader.readAsDataURL(file);
        });
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
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 's':
                        e.preventDefault();
                        this.downloadPDF();
                        break;
                }
            }
        });
    }

    addEventListenerSafely(elementId, event, handler) {
        const element = document.getElementById(elementId);
        if (element) {
            element.addEventListener(event, handler);
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
    }

    async shareDocument() {
        if (!this.editor) return;
        
        try {
            const outputData = await this.editor.save();
            const text = this.extractTextFromBlocks(outputData.blocks);
            const title = 'Gorilla Docs - Document';
            const shareText = text.substring(0, 280) + (text.length > 280 ? '...' : '');
            
            if (navigator.share) {
                await navigator.share({
                    title,
                    text: shareText,
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

    async downloadPDF() {
        if (!this.editor) return;
        
        try {
            const outputData = await this.editor.save();
            const htmlContent = this.convertBlocksToHTML(outputData.blocks);
            
            const printWindow = window.open('', '_blank');
            
            if (!printWindow) {
                this.showNotification('Please allow popups to download PDF', 'warning');
                return;
            }
            
            const fullHtmlContent = `
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
                        img { max-width: 100%; height: auto; }
                        pre { 
                            background: #f4f5f7;
                            padding: 1rem;
                            border-radius: 4px;
                            overflow-x: auto;
                        }
                        code {
                            background: #f4f5f7;
                            padding: 0.2rem 0.4rem;
                            border-radius: 3px;
                            font-family: monospace;
                        }
                        table {
                            border-collapse: collapse;
                            width: 100%;
                            margin: 1rem 0;
                        }
                        th, td {
                            border: 1px solid #ddd;
                            padding: 0.5rem;
                            text-align: left;
                        }
                        th {
                            background-color: #f4f5f7;
                            font-weight: 600;
                        }
                        .delimiter {
                            margin: 2rem 0;
                            text-align: center;
                            font-size: 1.5rem;
                            color: #5e6c84;
                        }
                        .warning {
                            background-color: #fffbf0;
                            border: 1px solid #ffab00;
                            border-radius: 4px;
                            padding: 1rem;
                            margin: 1rem 0;
                        }
                        .warning-title {
                            font-weight: 600;
                            color: #ffab00;
                            margin-bottom: 0.5rem;
                        }
                        @media print {
                            body { margin: 0; padding: 1rem; }
                            @page { margin: 1cm; }
                        }
                    </style>
                </head>
                <body>
                    ${htmlContent}
                </body>
                </html>
            `;
            
            printWindow.document.write(fullHtmlContent);
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

    convertBlocksToHTML(blocks) {
        return blocks.map(block => {
            try {
                switch (block.type) {
                    case 'header':
                        return `<h${block.data.level}>${this.escapeHtml(block.data.text)}</h${block.data.level}>`;
                    case 'paragraph':
                        return `<p>${this.escapeHtml(block.data.text)}</p>`;
                    case 'list':
                        const listType = block.data.style === 'ordered' ? 'ol' : 'ul';
                        const listItems = block.data.items.map(item => `<li>${this.escapeHtml(item)}</li>`).join('');
                        return `<${listType}>${listItems}</${listType}>`;
                    case 'checklist':
                        const checkItems = block.data.items.map(item => 
                            `<li><input type="checkbox" ${item.checked ? 'checked' : ''} disabled> ${this.escapeHtml(item.text)}</li>`
                        ).join('');
                        return `<ul style="list-style: none;">${checkItems}</ul>`;
                    case 'quote':
                        return `<blockquote>${this.escapeHtml(block.data.text)}${block.data.caption ? `<cite> — ${this.escapeHtml(block.data.caption)}</cite>` : ''}</blockquote>`;
                    case 'code':
                        return `<pre><code>${this.escapeHtml(block.data.code)}</code></pre>`;
                    case 'delimiter':
                        return `<div class="delimiter">* * *</div>`;
                    case 'image':
                        return `<img src="${block.data.file.url}" alt="${this.escapeHtml(block.data.caption || '')}" />`;
                    case 'table':
                        if (block.data.content && Array.isArray(block.data.content)) {
                            const tableRows = block.data.content.map((row, index) => {
                                const cells = row.map(cell => 
                                    index === 0 ? `<th>${this.escapeHtml(cell)}</th>` : `<td>${this.escapeHtml(cell)}</td>`
                                ).join('');
                                return `<tr>${cells}</tr>`;
                            }).join('');
                            return `<table>${tableRows}</table>`;
                        }
                        return '';
                    case 'warning':
                        return `<div class="warning"><div class="warning-title">${this.escapeHtml(block.data.title)}</div><div>${this.escapeHtml(block.data.message)}</div></div>`;
                    case 'raw':
                        return block.data.html || '';
                    default:
                        return '';
                }
            } catch (error) {
                console.error('Error converting block to HTML:', block, error);
                return '';
            }
        }).join('');
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    extractTextFromBlocks(blocks) {
        return blocks.map(block => {
            try {
                switch (block.type) {
                    case 'header':
                    case 'paragraph':
                        return block.data.text || '';
                    case 'list':
                        return (block.data.items || []).join(' ');
                    case 'checklist':
                        return (block.data.items || []).map(item => item.text || '').join(' ');
                    case 'quote':
                        return block.data.text || '';
                    case 'code':
                        return block.data.code || '';
                    case 'table':
                        if (block.data.content && Array.isArray(block.data.content)) {
                            return block.data.content.flat().join(' ');
                        }
                        return '';
                    case 'warning':
                        return `${block.data.title || ''} ${block.data.message || ''}`;
                    default:
                        return '';
                }
            } catch (error) {
                console.error('Error extracting text from block:', block, error);
                return '';
            }
        }).join(' ');
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

    async updateAnalytics() {
        if (!this.editor) return;
        
        try {
            const outputData = await this.editor.save();
            const text = this.extractTextFromBlocks(outputData.blocks);
            const stats = this.calculateTextStats(text);
            
            this.updateElement('wordCount', stats.words);
            this.updateElement('charCount', stats.characters);
            this.updateElement('readingTime', stats.readingTime);
            this.updateElement('blockCount', outputData.blocks.length);
            
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
        
        // Reading time calculation (200 words per minute average)
        const readingTimeMinutes = Math.ceil(words / 200);
        const readingTime = readingTimeMinutes === 0 ? '0 min' : 
                          readingTimeMinutes === 1 ? '1 min' : 
                          `${readingTimeMinutes} min`;
        
        return { words, characters, readingTime };
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
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.add('active');
        }
    }

    hideLoading() {
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
            top: 20px;
            right: 20px;
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
            transform: translateX(20px);
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
            notification.style.transform = 'translateX(20px)';
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
                z-index: 10000;
            ">
                <h3 style="margin-bottom: 1rem; color: #172b4d;">Failed to Load Editor</h3>
                <p style="margin-bottom: 1.5rem; color: #5e6c84;">
                    There was an error loading Gorilla Docs. Please check your internet connection and refresh the page.
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
