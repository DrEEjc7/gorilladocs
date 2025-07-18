// Gorilla Docs - Premium Rich Text Editor with Enhanced Analytics
class GorillaDocsApp {
    constructor() {
        this.editor = null;
        this.currentTheme = 'light';
        this.editorHidden = false;
        this.lastSavedData = null;
        this.autosaveInterval = null;
        
        // Bind methods to maintain context
        this.updateAnalytics = this.updateAnalytics.bind(this);
        this.imageUploadHandler = this.imageUploadHandler.bind(this);
        this.autosave = this.autosave.bind(this);
        
        this.init();
    }

    async init() {
        try {
            this.showLoading();
            
            // Check if Editor.js is loaded
            if (typeof EditorJS === 'undefined') {
                throw new Error('Editor.js library not loaded. Please check your internet connection.');
            }
            
            // Initialize Lucide icons
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
            
            // Initialize components
            await this.setupEditorJS();
            this.setupThemeToggle();
            this.setupEventListeners();
            this.updateCurrentYear();
            this.initializeAnalytics();
            this.setupAutosave();
            
            this.hideLoading();
        } catch (error) {
            console.error('Failed to initialize Gorilla Docs:', error);
            this.showNotification('Failed to initialize editor. Please refresh the page.', 'error');
            this.hideLoading();
        }
    }

    async setupEditorJS() {
        try {
            // Build tools object with available plugins
            const tools = this.buildToolsConfig();

            // Load saved data or use default
            const savedData = this.getSavedData();

            this.editor = new EditorJS({
                holder: 'editor',
                placeholder: 'Start writing your document...',
                autofocus: true,
                tools: tools,
                data: savedData,
                onChange: this.debounce(this.updateAnalytics, 500),
                onReady: () => {
                    console.log('Editor.js is ready to work!');
                    this.updateAnalytics(); // Initial analytics update
                }
            });

            await this.editor.isReady;
            
        } catch (error) {
            console.error('Failed to initialize Editor.js:', error);
            throw new Error('Editor initialization failed: ' + error.message);
        }
    }

    buildToolsConfig() {
        const tools = {};

        // Build tools dynamically based on what's available
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
                        codepen: true,
                        twitter: true,
                        instagram: true,
                        vimeo: true,
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

        return tools;
    }

    getSavedData() {
        try {
            const saved = localStorage.getItem('gorilla-docs-content');
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (error) {
            console.warn('Could not load saved content:', error);
        }

        // Default content
        return {
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
                        text: 'You can now create rich, block-based content with tables, embedded media, and much more! Start typing to see real-time analytics.'
                    }
                },
                {
                    type: 'code',
                    data: {
                        code: 'function helloWorld() {\n    console.log("Hello, from Gorilla Docs!");\n}'
                    }
                }
            ]
        };
    }

    setupAutosave() {
        // Autosave every 30 seconds
        this.autosaveInterval = setInterval(this.autosave, 30000);
    }

    async autosave() {
        if (!this.editor) return;
        
        try {
            const outputData = await this.editor.save();
            localStorage.setItem('gorilla-docs-content', JSON.stringify(outputData));
            
            // Show subtle autosave indicator
            this.showAutosaveIndicator();
        } catch (error) {
            console.error('Autosave failed:', error);
        }
    }

    showAutosaveIndicator() {
        const indicator = document.createElement('div');
        indicator.innerHTML = '<i data-lucide="check" style="width: 16px; height: 16px; margin-right: 0.5rem;"></i>Saved';
        indicator.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: var(--success);
            color: white;
            padding: 0.5rem 1rem;
            border-radius: var(--radius);
            font-size: var(--font-size-sm);
            z-index: 1000;
            opacity: 0;
            transition: opacity 0.3s ease;
            display: flex;
            align-items: center;
        `;
        
        document.body.appendChild(indicator);
        
        // Initialize Lucide icons for the new element
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
        
        requestAnimationFrame(() => {
            indicator.style.opacity = '1';
        });
        
        setTimeout(() => {
            indicator.style.opacity = '0';
            setTimeout(() => {
                if (indicator.parentNode) {
                    indicator.remove();
                }
            }, 300);
        }, 2000);
    }

    async imageUploadHandler(file) {
        return new Promise((resolve, reject) => {
            if (file.size > 5 * 1024 * 1024) {
                reject(new Error('Image size should be less than 5MB'));
                return;
            }

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
            // Update the icon data attribute
            themeIcon.setAttribute('data-lucide', theme === 'light' ? 'moon' : 'sun');
            
            // Re-initialize Lucide icons to update the display
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }
        
        try {
            localStorage.setItem('gorilla-docs-theme', theme);
        } catch (error) {
            console.warn('Could not save theme preference to localStorage');
        }
    }

    setupEventListeners() {
        this.addEventListenerSafely('toggleEditor', 'click', () => this.toggleEditor());
        this.addEventListenerSafely('shareBtn', 'click', () => this.shareDocument());
        this.addEventListenerSafely('downloadBtn', 'click', () => this.downloadPDF());
        this.addEventListenerSafely('exportBtn', 'click', () => this.exportDocument());
        this.addEventListenerSafely('importBtn', 'click', () => this.importDocument());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 's':
                        e.preventDefault();
                        this.autosave();
                        break;
                    case 'p':
                        e.preventDefault();
                        this.downloadPDF();
                        break;
                }
            }
        });

        // Cleanup on page unload
        window.addEventListener('beforeunload', () => {
            if (this.autosaveInterval) {
                clearInterval(this.autosaveInterval);
            }
            this.autosave();
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
        
        // Update the icon
        const icon = toggleBtn.querySelector('i');
        if (icon) {
            icon.setAttribute('data-lucide', this.editorHidden ? 'eye' : 'edit');
            
            // Re-initialize Lucide icons to update the display
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }
        
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
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    await navigator.clipboard.writeText(window.location.href);
                    this.showNotification('Link copied to clipboard!', 'success');
                } else {
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

    async exportDocument() {
        if (!this.editor) return;
        
        try {
            const outputData = await this.editor.save();
            const dataStr = JSON.stringify(outputData, null, 2);
            const dataBlob = new Blob([dataStr], {type: 'application/json'});
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `gorilla-docs-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            
            this.showNotification('Document exported successfully!', 'success');
        } catch (error) {
            console.error('Export failed:', error);
            this.showNotification('Failed to export document', 'error');
        }
    }

    importDocument() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            try {
                const text = await file.text();
                const data = JSON.parse(text);
                
                if (data.blocks && Array.isArray(data.blocks)) {
                    await this.editor.render(data);
                    this.showNotification('Document imported successfully!', 'success');
                    this.updateAnalytics();
                } else {
                    throw new Error('Invalid document format');
                }
            } catch (error) {
                console.error('Import failed:', error);
                this.showNotification('Failed to import document. Please check the file format.', 'error');
            }
        };
        input.click();
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

    // FIXED ANALYTICS - This was the main issue
    extractTextFromBlocks(blocks) {
        if (!blocks || !Array.isArray(blocks)) return '';
        
        return blocks.map(block => {
            try {
                if (!block || !block.data) return '';
                
                switch (block.type) {
                    case 'header':
                    case 'paragraph':
                        return block.data.text || '';
                    case 'list':
                        return (block.data.items || []).join(' ');
                    case 'checklist':
                        return (block.data.items || []).map(item => item.text || '').join(' ');
                    case 'quote':
                        return `${block.data.text || ''} ${block.data.caption || ''}`;
                    case 'code':
                        return block.data.code || '';
                    case 'table':
                        if (block.data.content && Array.isArray(block.data.content)) {
                            return block.data.content.flat().join(' ');
                        }
                        return '';
                    case 'warning':
                        return `${block.data.title || ''} ${block.data.message || ''}`;
                    case 'image':
                        return block.data.caption || '';
                    default:
                        return '';
                }
            } catch (error) {
                console.error('Error extracting text from block:', block, error);
                return '';
            }
        }).join(' ').trim();
    }

    updateCurrentYear() {
        const yearElement = document.getElementById('currentYear');
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
    }

    initializeAnalytics() {
        // Initial update after a short delay to ensure editor is ready
        setTimeout(() => {
            this.updateAnalytics();
        }, 500);
    }

    async updateAnalytics() {
        if (!this.editor) return;
        
        try {
            const outputData = await this.editor.save();
            const text = this.extractTextFromBlocks(outputData.blocks);
            
            // Basic stats
            const stats = this.calculateTextStats(text);
            
            // Structure analysis
            const structure = this.analyzeDocumentStructure(outputData.blocks);
            
            // Writing quality
            const quality = this.analyzeWritingQuality(text);
            
            // Update UI
            this.updateElement('wordCount', stats.words);
            this.updateElement('charCount', stats.characters);
            this.updateElement('readingTime', stats.readingTime);
            this.updateElement('blockCount', outputData.blocks.length);
            this.updateElement('sentenceCount', stats.sentences);
            this.updateElement('avgWordsPerSentence', stats.avgWordsPerSentence);
            this.updateElement('paragraphCount', structure.paragraphs);
            this.updateElement('headingCount', structure.headings);
            
            // Readability
            const readability = this.calculateReadabilityScore(text);
            const scoreElement = document.getElementById('readabilityScore');
            if (scoreElement) {
                const scoreValue = scoreElement.querySelector('.score-value');
                if (scoreValue) {
                    scoreValue.textContent = readability.score;
                    scoreElement.title = readability.description;
                }
            }
            
            // SEO Score
            this.updateElement('seoScore', this.calculateSEOScore(text, structure));
            
            // Writing Grade Level
            this.updateElement('gradeLevel', quality.gradeLevel);
            
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
        
        // Word counting
        const words = cleanText ? (cleanText.match(/\b\w+\b/g) || []).length : 0;
        
        // Character count (without spaces)
        const characters = cleanText.replace(/\s/g, '').length;
        
        // Sentence counting
        const sentences = Math.max(1, (cleanText.match(/[.!?]+/g) || []).length);
        
        // Average words per sentence
        const avgWordsPerSentence = words > 0 ? Math.round(words / sentences) : 0;
        
        // Reading time (200 words per minute)
        const readingTimeMinutes = Math.ceil(words / 200);
        const readingTime = readingTimeMinutes === 0 ? '0 min' : 
                          readingTimeMinutes === 1 ? '1 min' : 
                          `${readingTimeMinutes} min`;
        
        return { 
            words, 
            characters, 
            readingTime, 
            sentences, 
            avgWordsPerSentence 
        };
    }

    analyzeDocumentStructure(blocks) {
        const structure = {
            paragraphs: 0,
            headings: 0,
            lists: 0,
            images: 0,
            tables: 0,
            quotes: 0,
            codeBlocks: 0
        };
        
        blocks.forEach(block => {
            switch (block.type) {
                case 'paragraph':
                    structure.paragraphs++;
                    break;
                case 'header':
                    structure.headings++;
                    break;
                case 'list':
                case 'checklist':
                    structure.lists++;
                    break;
                case 'image':
                    structure.images++;
                    break;
                case 'table':
                    structure.tables++;
                    break;
                case 'quote':
                    structure.quotes++;
                    break;
                case 'code':
                    structure.codeBlocks++;
                    break;
            }
        });
        
        return structure;
    }

    analyzeWritingQuality(text) {
        if (!text || text.trim().length === 0) {
            return { gradeLevel: '-' };
        }

        const cleanText = text.trim();
        const words = (cleanText.match(/\b\w+\b/g) || []).length;
        const sentences = Math.max(1, (cleanText.match(/[.!?]+/g) || []).length);
        const syllables = this.countSyllables(cleanText);
        
        // Flesch-Kincaid Grade Level
        const gradeLevel = words > 0 ? 
            (0.39 * (words / sentences)) + (11.8 * (syllables / words)) - 15.59 : 0;
        
        const roundedGrade = Math.max(1, Math.min(16, Math.round(gradeLevel)));
        
        return {
            gradeLevel: `Grade ${roundedGrade}`
        };
    }

    calculateSEOScore(text, structure) {
        let score = 0;
        const words = (text.match(/\b\w+\b/g) || []).length;
        
        // Word count (ideal: 300-2000 words)
        if (words >= 300 && words <= 2000) score += 25;
        else if (words >= 150) score += 15;
        
        // Headings structure
        if (structure.headings >= 2) score += 25;
        else if (structure.headings >= 1) score += 15;
        
        // Paragraph count (ideal: multiple short paragraphs)
        if (structure.paragraphs >= 3) score += 25;
        else if (structure.paragraphs >= 1) score += 15;
        
        // Media elements
        if (structure.images > 0) score += 15;
        if (structure.lists > 0) score += 10;
        
        return Math.min(100, score);
    }

    calculateReadabilityScore(text) {
        if (!text || text.trim().length === 0) {
            return { score: '-', description: 'No text to analyze' };
        }

        const cleanText = text.trim();
        const sentences = Math.max(1, (cleanText.match(/[.!?]+/g) || []).length);
        const words = (cleanText.match(/\b\w+\b/g) || []).length;
        
        if (words < 10) {
            return { score: '-', description: 'Need more text for analysis' };
        }
        
        const syllables = this.countSyllables(cleanText);
        
        // Flesch Reading Ease Score
        const score = 206.835 - (1.015 * (words / sentences)) - (84.6 * (syllables / words));
        const roundedScore = Math.max(0, Math.min(100, Math.round(score)));
        const description = this.getReadabilityDescription(roundedScore);
        
        return { score: roundedScore, description };
    }

    countSyllables(text) {
        if (!text || text.length === 0) return 0;
        
        const cleanText = text.toLowerCase().replace(/[^a-z\s]/g, ' ');
        const words = cleanText.split(/\s+/).filter(word => word.length > 0);
        
        return words.reduce((totalSyllables, word) => {
            let processedWord = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
            processedWord = processedWord.replace(/^y/, '');
            
            const syllableMatches = processedWord.match(/[aeiouy]{1,2}/g);
            const syllableCount = syllableMatches ? syllableMatches.length : 0;
            
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
        
        // Create notification with icon based on type
        const iconMap = {
            success: 'check-circle',
            warning: 'alert-triangle',
            error: 'x-circle',
            info: 'info'
        };
        
        const icon = iconMap[type] || iconMap.info;
        
        notification.innerHTML = `
            <i data-lucide="${icon}" style="width: 16px; height: 16px; margin-right: 0.5rem; flex-shrink: 0;"></i>
            <span>${message}</span>
        `;
        
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
            display: flex;
            align-items: center;
        `;
        
        document.body.appendChild(notification);
        
        // Initialize Lucide icons for the new element
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
        
        requestAnimationFrame(() => {
            notification.style.transform = 'translateX(0)';
            notification.style.opacity = '1';
        });
        
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
