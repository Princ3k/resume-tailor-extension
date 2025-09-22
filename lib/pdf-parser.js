// PDF Parser based on OpenResume's approach
// This is a simplified version that works in browser extensions

class PDFParser {
    constructor() {
        this.pdfjsLib = null;
    }

    async loadPDFJS() {
        if (this.pdfjsLib) return this.pdfjsLib;
        
        // Check if PDF.js is already loaded
        if (window.pdfjsLib) {
            this.pdfjsLib = window.pdfjsLib;
            this.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            return this.pdfjsLib;
        }
        
        // Load PDF.js from CDN
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        script.crossOrigin = 'anonymous';
        
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('PDF.js loading timeout'));
            }, 10000); // 10 second timeout
            
            script.onload = () => {
                clearTimeout(timeout);
                try {
                    // Configure PDF.js worker
                    if (window.pdfjsLib) {
                        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
                        this.pdfjsLib = window.pdfjsLib;
                        console.log('PDF.js loaded successfully');
                        resolve(this.pdfjsLib);
                    } else {
                        reject(new Error('PDF.js loaded but window.pdfjsLib is undefined'));
                    }
                } catch (error) {
                    reject(new Error(`Failed to configure PDF.js: ${error.message}`));
                }
            };
            
            script.onerror = (error) => {
                clearTimeout(timeout);
                console.error('PDF.js script loading failed:', error);
                reject(new Error('Failed to load PDF.js script from CDN'));
            };
            
            document.head.appendChild(script);
        });
    }

    async parsePDF(file) {
        try {
            console.log('Loading PDF.js...');
            await this.loadPDFJS();
            
            console.log('Reading PDF file...');
            const arrayBuffer = await this.fileToArrayBuffer(file);
            
            console.log('Loading PDF document...');
            const pdf = await this.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            
            console.log(`PDF loaded: ${pdf.numPages} pages`);
            
            let fullText = '';
            
            // Extract text from all pages
            for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                console.log(`Processing page ${pageNum}...`);
                const page = await pdf.getPage(pageNum);
                const textContent = await page.getTextContent();
                
                // Group text items into lines
                const lines = this.groupTextItemsIntoLines(textContent.items);
                
                // Convert lines to text
                for (const line of lines) {
                    const lineText = line.map(item => item.str).join(' ');
                    fullText += lineText + '\n';
                }
            }
            
            console.log('PDF text extraction complete');
            return fullText;
            
        } catch (error) {
            console.error('Error parsing PDF:', error);
            throw new Error(`Failed to parse PDF: ${error.message}`);
        }
    }

    fileToArrayBuffer(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsArrayBuffer(file);
        });
    }

    groupTextItemsIntoLines(textItems) {
        if (!textItems || textItems.length === 0) return [];
        
        // Sort text items by y position (top to bottom)
        const sortedItems = textItems.sort((a, b) => b.transform[5] - a.transform[5]);
        
        const lines = [];
        let currentLine = [];
        let currentY = null;
        const lineThreshold = 5; // pixels
        
        for (const item of sortedItems) {
            const y = item.transform[5];
            
            if (currentY === null || Math.abs(y - currentY) <= lineThreshold) {
                // Same line
                currentLine.push(item);
                currentY = y;
            } else {
                // New line
                if (currentLine.length > 0) {
                    // Sort items in line by x position (left to right)
                    currentLine.sort((a, b) => a.transform[4] - b.transform[4]);
                    lines.push(currentLine);
                }
                currentLine = [item];
                currentY = y;
            }
        }
        
        // Add the last line
        if (currentLine.length > 0) {
            currentLine.sort((a, b) => a.transform[4] - b.transform[4]);
            lines.push(currentLine);
        }
        
        return lines;
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PDFParser;
} else {
    window.PDFParser = PDFParser;
}

