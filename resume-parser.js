// Enhanced Resume Parser for Resume Tailor Extension
// This file contains only the ResumeParser class - other classes are in separate files

class ResumeParser {
    constructor() {
        this.supportedFormats = ['pdf', 'docx', 'doc', 'txt'];
        this.pdfParser = null;
        this.textExtractor = null;
    }

    async parseFile(file) {
        console.log('Starting file parse for:', file.name, 'Type:', file.type, 'Size:', file.size);
        
        const fileType = this.getFileType(file);
        console.log('Detected file type:', fileType);
        
        if (!this.supportedFormats.includes(fileType)) {
            throw new Error(`Unsupported file format: ${fileType}`);
        }

        let text = '';
        
        try {
            switch (fileType) {
                case 'pdf':
                    console.log('Parsing PDF with enhanced parser...');
                    text = await this.parsePDF(file);
                    break;
                case 'docx':
                    console.log('Parsing DOCX...');
                    text = await this.parseDOCX(file);
                    break;
                case 'doc':
                    console.log('Parsing DOC...');
                    text = await this.parseDOC(file);
                    break;
                case 'txt':
                    console.log('Parsing TXT...');
                    text = await this.parseTXT(file);
                    break;
            }
            
            console.log('Extracted text length:', text.length);
            console.log('First 200 chars:', text.substring(0, 200));
            
            // Use enhanced text extractor
            if (!this.textExtractor) {
                this.textExtractor = new TextExtractor();
            }
            
            const resumeData = this.textExtractor.extractResumeData(text);
            console.log('Parsed resume data:', resumeData);
            
            return resumeData;
        } catch (error) {
            console.error('Error in parseFile:', error);
            throw error;
        }
    }

    getFileType(file) {
        const extension = file.name.split('.').pop().toLowerCase();
        return extension;
    }

    async parsePDF(file) {
        try {
            // Initialize PDF parser if not already done
            if (!this.pdfParser) {
                this.pdfParser = new PDFParser();
            }
            
            console.log('Using enhanced PDF parser...');
            const text = await this.pdfParser.parsePDF(file);
            return text;
        } catch (error) {
            console.error('Enhanced PDF parsing failed, falling back to basic method:', error);
            
            // Fallback to basic method
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        // For now, just return a placeholder message
                        const text = `PDF Resume: ${file.name}\n\nThis is a PDF file. For full PDF parsing support, please convert to TXT or DOCX format.\n\nName: [Please enter manually]\nEmail: [Please enter manually]\nPhone: [Please enter manually]\n\nSkills: [Please enter manually]\n\nExperience: [Please enter manually]\n\nEducation: [Please enter manually]`;
                        resolve(text);
                    } catch (error) {
                        reject(error);
                    }
                };
                reader.readAsText(file);
            });
        }
    }

    async parseDOCX(file) {
        // For now, let's treat DOCX as text and show a message
        console.log('DOCX parsing not fully implemented yet, treating as text');
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    // For now, just return a placeholder message
                    const text = `DOCX Resume: ${file.name}\n\nThis is a DOCX file. For full DOCX parsing support, please convert to TXT format.\n\nName: [Please enter manually]\nEmail: [Please enter manually]\nPhone: [Please enter manually]\n\nSkills: [Please enter manually]\n\nExperience: [Please enter manually]\n\nEducation: [Please enter manually]`;
                    resolve(text);
                } catch (error) {
                    reject(error);
                }
            };
            reader.readAsText(file);
        });
    }

    async parseDOC(file) {
        // DOC files are more complex, for now we'll treat them like DOCX
        return this.parseDOCX(file);
    }

    async parseTXT(file) {
        console.log('Parsing TXT file...');
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                console.log('TXT file read successfully, length:', e.target.result.length);
                resolve(e.target.result);
            };
            reader.onerror = (error) => {
                console.error('Error reading TXT file:', error);
                reject(new Error('Failed to read file'));
            };
            reader.readAsText(file);
        });
    }
}