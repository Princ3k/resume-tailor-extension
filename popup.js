// Popup script for Resume Tailor extension

class ResumeTailorPopup {
    constructor() {
        this.currentJob = null;
        this.resumeData = null;
        this.aiConfig = null;
        this.resumeParser = null;
        this.parsedResumeData = null;
        
        try {
            this.resumeParser = new ResumeParser();
            console.log('ResumeParser instantiated successfully');
        } catch (error) {
            console.error('Error instantiating ResumeParser:', error);
        }
        
        this.init();
    }

    async init() {
        console.log('ResumeTailorPopup initializing...');
        await this.loadResumeData();
        await this.loadAIConfig();
        await this.checkCurrentJob();
        this.setupEventListeners();
        this.updateUI();
        console.log('ResumeTailorPopup initialization complete');
    }

    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // AI configuration
        const configureAIBtn = document.getElementById('configureAIBtn');
        const testAIBtn = document.getElementById('testAIBtn');
        const saveAIBtn = document.getElementById('saveAIBtn');
        const cancelAIBtn = document.getElementById('cancelAIBtn');
        
        if (configureAIBtn) {
            configureAIBtn.addEventListener('click', () => {
                console.log('Configure AI button clicked');
                this.showAIModal();
            });
        } else {
            console.error('configureAIBtn element not found');
        }
        
        if (testAIBtn) {
            testAIBtn.addEventListener('click', () => this.testAI());
        } else {
            console.error('testAIBtn element not found');
        }
        
        if (saveAIBtn) {
            saveAIBtn.addEventListener('click', () => {
                console.log('Save AI button clicked');
                this.saveAIConfig();
            });
        } else {
            console.error('saveAIBtn element not found');
        }
        
        if (cancelAIBtn) {
            cancelAIBtn.addEventListener('click', () => this.hideAIModal());
        } else {
            console.error('cancelAIBtn element not found');
        }
        
        // Temperature slider
        const aiTemperature = document.getElementById('aiTemperature');
        const temperatureValue = document.getElementById('temperatureValue');
        if (aiTemperature && temperatureValue) {
            aiTemperature.addEventListener('input', (e) => {
                temperatureValue.textContent = e.target.value;
            });
        } else {
            console.error('Temperature slider elements not found');
        }

        // Resume management
        const uploadResumeBtn = document.getElementById('uploadResumeBtn');
        const editResumeBtn = document.getElementById('editResumeBtn');
        const manualEntryBtn = document.getElementById('manualEntryBtn');
        
        if (uploadResumeBtn) {
            uploadResumeBtn.addEventListener('click', () => {
                console.log('Upload Resume button clicked');
                this.showUploadModal();
            });
        } else {
            console.error('uploadResumeBtn element not found');
        }
        
        if (editResumeBtn) {
            editResumeBtn.addEventListener('click', () => this.showResumeModal());
        } else {
            console.error('editResumeBtn element not found');
        }
        
        if (manualEntryBtn) {
            manualEntryBtn.addEventListener('click', () => this.showResumeModal());
        } else {
            console.error('manualEntryBtn element not found');
        }
        const saveResumeBtn = document.getElementById('saveResumeBtn');
        const cancelResumeBtn = document.getElementById('cancelResumeBtn');
        
        if (saveResumeBtn) {
            saveResumeBtn.addEventListener('click', () => this.saveResume());
        } else {
            console.error('saveResumeBtn element not found');
        }
        
        if (cancelResumeBtn) {
            cancelResumeBtn.addEventListener('click', () => this.hideResumeModal());
        } else {
            console.error('cancelResumeBtn element not found');
        }

        // Upload functionality
        const selectFileBtn = document.getElementById('selectFileBtn');
        const fileInput = document.getElementById('fileInput');
        
        if (selectFileBtn) {
            selectFileBtn.addEventListener('click', () => {
                console.log('Select File button clicked');
                this.selectFile();
            });
        } else {
            console.error('selectFileBtn element not found');
        }
        
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                console.log('File input change event triggered');
                this.handleFileSelect(e);
            });
            
            // Test if file input is accessible
            console.log('File input element found:', fileInput);
            console.log('File input accept attribute:', fileInput.accept);
            console.log('File input style display:', fileInput.style.display);
        } else {
            console.error('fileInput element not found');
        }
        const saveParsedResumeBtn = document.getElementById('saveParsedResumeBtn');
        const editParsedResumeBtn = document.getElementById('editParsedResumeBtn');
        const testUploadBtn = document.getElementById('testUploadBtn');
        const analyzeJobBtn = document.getElementById('analyzeJobBtn');
        const tailorResumeBtn = document.getElementById('tailorResumeBtn');
        const downloadPdfBtn = document.getElementById('downloadPdfBtn');
        const previewBtn = document.getElementById('previewBtn');
        
        if (saveParsedResumeBtn) {
            saveParsedResumeBtn.addEventListener('click', () => this.saveParsedResume());
        } else {
            console.error('saveParsedResumeBtn element not found');
        }
        
        if (editParsedResumeBtn) {
            editParsedResumeBtn.addEventListener('click', () => this.editParsedResume());
        } else {
            console.error('editParsedResumeBtn element not found');
        }
        
        if (testUploadBtn) {
            testUploadBtn.addEventListener('click', () => this.testWithSampleResume());
        } else {
            console.error('testUploadBtn element not found');
        }

        // Job analysis
        if (analyzeJobBtn) {
            analyzeJobBtn.addEventListener('click', () => this.analyzeJob());
        } else {
            console.error('analyzeJobBtn element not found');
        }

        // Manual job detection
        const manualDetectBtn = document.getElementById('manualDetectBtn');
        const refreshJobBtn = document.getElementById('refreshJobBtn');
        
        if (manualDetectBtn) {
            manualDetectBtn.addEventListener('click', () => this.manualJobDetection());
        } else {
            console.error('manualDetectBtn element not found');
        }
        
        if (refreshJobBtn) {
            refreshJobBtn.addEventListener('click', () => this.refreshJobDetection());
        } else {
            console.error('refreshJobBtn element not found');
        }

        // Resume tailoring
        if (tailorResumeBtn) {
            tailorResumeBtn.addEventListener('click', () => this.tailorResume());
        } else {
            console.error('tailorResumeBtn element not found');
        }

        // Download
        if (downloadPdfBtn) {
            downloadPdfBtn.addEventListener('click', () => this.downloadPDF());
        } else {
            console.error('downloadPdfBtn element not found');
        }
        
        if (previewBtn) {
            previewBtn.addEventListener('click', () => this.previewResume());
        } else {
            console.error('previewBtn element not found');
        }

        // Modal close buttons
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal.id === 'uploadModal') {
                    this.hideUploadModal();
                } else {
                    modal.style.display = 'none';
                }
            });
        });

        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                if (e.target.id === 'uploadModal') {
                    this.hideUploadModal();
                } else {
                    e.target.style.display = 'none';
                }
            }
        });
    }

    async loadResumeData() {
        try {
            const result = await chrome.storage.local.get(['resumeData']);
            this.resumeData = result.resumeData || null;
        } catch (error) {
            console.error('Error loading resume data:', error);
        }
    }

    async loadAIConfig() {
        try {
            const result = await chrome.storage.local.get(['aiConfig']);
            this.aiConfig = result.aiConfig || null;
        } catch (error) {
            console.error('Error loading AI config:', error);
        }
    }

    async checkCurrentJob() {
        console.log('🔍 Checking current job...');
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            console.log('📍 Current tab:', tab.url, tab.title);
            
            // Check if we're on a job site
            const jobSites = [
                'linkedin.com', 'indeed.com', 'glassdoor.com', 'monster.com',
                'ziprecruiter.com', 'careerbuilder.com', 'angel.co', 
                'stackoverflow.com', 'github.com', 'pwc.wd3.myworkdayjobs.com'
            ];
            
            const isJobSite = jobSites.some(site => tab.url.includes(site));
            console.log('🎯 Is job site:', isJobSite);
            
            if (isJobSite) {
                try {
                    const response = await chrome.tabs.sendMessage(tab.id, { action: 'getJobInfo' });
                    console.log('📨 Response from content script:', response);
                    
                    if (response && response.jobInfo) {
                        this.currentJob = response.jobInfo;
                        console.log('✅ Job info received:', this.currentJob);
                    } else {
                        console.log('⚠️ No job info received from content script');
                        // Try to manually detect job info
                        this.currentJob = await this.manualJobDetection(tab);
                    }
                } catch (error) {
                    console.error('❌ Error communicating with content script:', error);
                    // Try manual detection as fallback
                    this.currentJob = await this.manualJobDetection(tab);
                }
            } else {
                console.log('ℹ️ Not on a known job site');
            }
        } catch (error) {
            console.error('❌ Error checking current job:', error);
        }
    }

    async manualJobDetection(tab) {
        console.log('🔧 Attempting manual job detection...');
        
        // Create a basic job info object from tab data
        const jobInfo = {
            title: this.extractJobTitleFromTab(tab),
            company: '',
            location: '',
            description: '',
            url: tab.url,
            source: 'Manual Detection',
            detected: false
        };
        
        console.log('📋 Manual job info:', jobInfo);
        return jobInfo;
    }

    extractJobTitleFromTab(tab) {
        const title = tab.title;
        
        // Remove common suffixes
        let jobTitle = title
            .replace(/\s*-\s*LinkedIn$/, '')
            .replace(/\s*\|\s*LinkedIn$/, '')
            .replace(/\s*-\s*Indeed$/, '')
            .replace(/\s*\|\s*Indeed$/, '')
            .replace(/\s*-\s*Glassdoor$/, '')
            .replace(/\s*\|\s*Glassdoor$/, '')
            .replace(/\s*-\s*Monster$/, '')
            .replace(/\s*\|\s*Monster$/, '');
        
        // If title is too generic, try to extract from URL
        if (jobTitle.length < 5 || jobTitle.toLowerCase().includes('home') || jobTitle.toLowerCase().includes('search')) {
            const url = tab.url;
            // Try to extract job title from URL path
            const pathMatch = url.match(/\/([^\/]+)(?:\/|$)/);
            if (pathMatch) {
                const pathPart = decodeURIComponent(pathMatch[1]).replace(/-/g, ' ');
                if (pathPart.length > 5 && !pathPart.includes('jobs') && !pathPart.includes('search')) {
                    jobTitle = pathPart;
                }
            }
        }
        
        return jobTitle || 'Job Posting';
    }

    async manualJobDetection() {
        console.log('🔧 Manual job detection triggered...');
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            console.log('📍 Current tab for manual detection:', tab.url, tab.title);
            
            this.currentJob = await this.manualJobDetection(tab);
            this.updateUI();
            
            if (this.currentJob && this.currentJob.title) {
                this.showNotification('Job detected manually! You can now analyze it.', 'success');
            } else {
                this.showNotification('Could not detect job information. Please try a different page.', 'error');
            }
        } catch (error) {
            console.error('❌ Error in manual job detection:', error);
            this.showNotification('Error detecting job. Please try again.', 'error');
        }
    }

    async refreshJobDetection() {
        console.log('🔄 Refreshing job detection...');
        try {
            await this.checkCurrentJob();
            this.updateUI();
            
            if (this.currentJob && this.currentJob.title) {
                this.showNotification('Job detection refreshed!', 'success');
            } else {
                this.showNotification('No job detected on this page.', 'info');
            }
        } catch (error) {
            console.error('❌ Error refreshing job detection:', error);
            this.showNotification('Error refreshing job detection.', 'error');
        }
    }

    updateUI() {
        // Update AI status
        const aiStatusIndicator = document.getElementById('aiStatusIndicator');
        const aiStatusText = document.getElementById('aiStatusText');
        const testAIBtn = document.getElementById('testAIBtn');

        if (this.aiConfig && this.aiConfig.apiKey) {
            aiStatusIndicator.classList.add('loaded');
            aiStatusText.textContent = `AI configured (${this.aiConfig.model})`;
            testAIBtn.disabled = false;
        } else {
            aiStatusIndicator.classList.remove('loaded');
            aiStatusText.textContent = 'AI not configured';
            testAIBtn.disabled = true;
        }

        // Update resume status
        const statusIndicator = document.getElementById('statusIndicator');
        const statusText = document.getElementById('statusText');
        const editResumeBtn = document.getElementById('editResumeBtn');

        if (this.resumeData) {
            statusIndicator.classList.add('loaded');
            statusText.textContent = 'Resume loaded';
            editResumeBtn.disabled = false;
        } else {
            statusIndicator.classList.remove('loaded');
            statusText.textContent = 'No resume loaded';
            editResumeBtn.disabled = true;
        }

        // Update job info
        const jobInfo = document.getElementById('jobInfo');
        const analyzeJobBtn = document.getElementById('analyzeJobBtn');

        if (this.currentJob) {
            jobInfo.innerHTML = `
                <div class="job-title">${this.currentJob.title || 'Job Title'}</div>
                <div class="job-company">${this.currentJob.company || 'Company'}</div>
            `;
            analyzeJobBtn.disabled = false;
        } else {
            jobInfo.innerHTML = '<p class="no-job">Navigate to a job posting to analyze it</p>';
            analyzeJobBtn.disabled = true;
        }

        // Update tailor and download buttons
        const tailorBtn = document.getElementById('tailorResumeBtn');
        const downloadBtn = document.getElementById('downloadPdfBtn');
        const previewBtn = document.getElementById('previewBtn');

        const canTailor = this.resumeData && this.currentJob;
        tailorBtn.disabled = !canTailor;
        downloadBtn.disabled = !canTailor;
        previewBtn.disabled = !canTailor;
    }

    showResumeModal() {
        const modal = document.getElementById('resumeModal');
        
        if (this.resumeData) {
            // Populate form with existing data
            document.getElementById('fullName').value = this.resumeData.fullName || '';
            document.getElementById('email').value = this.resumeData.email || '';
            document.getElementById('phone').value = this.resumeData.phone || '';
            document.getElementById('linkedin').value = this.resumeData.linkedin || '';
            document.getElementById('summary').value = this.resumeData.summary || '';
            document.getElementById('skills').value = this.resumeData.skills ? this.resumeData.skills.join(', ') : '';
            document.getElementById('experience').value = this.resumeData.experience ? JSON.stringify(this.resumeData.experience, null, 2) : '';
            document.getElementById('education').value = this.resumeData.education ? JSON.stringify(this.resumeData.education, null, 2) : '';
        } else {
            // Clear form
            document.getElementById('resumeForm').reset();
        }
        
        modal.style.display = 'block';
    }

    hideResumeModal() {
        document.getElementById('resumeModal').style.display = 'none';
    }

    showUploadModal() {
        console.log('showUploadModal called');
        const modal = document.getElementById('uploadModal');
        
        if (!modal) {
            console.error('uploadModal element not found');
            return;
        }
        
        console.log('Upload Modal found, showing modal');
        this.resetUploadModal();
        modal.style.display = 'block';
        this.setupDragAndDrop();
        console.log('Upload Modal displayed');
    }

    hideUploadModal() {
        console.log('Hiding upload modal');
        document.getElementById('uploadModal').style.display = 'none';
        
        // Reset file input when modal is hidden
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            fileInput.value = '';
            console.log('File input reset');
        }
    }

    resetUploadModal() {
        console.log('Resetting upload modal');
        document.getElementById('uploadArea').style.display = 'block';
        document.getElementById('uploadProgress').style.display = 'none';
        document.getElementById('uploadResult').style.display = 'none';
        
        // Don't reset file input value immediately to avoid interfering with file selection
        // document.getElementById('fileInput').value = '';
        console.log('Upload modal reset complete');
    }

    setupDragAndDrop() {
        const uploadArea = document.getElementById('uploadArea');
        
        if (!uploadArea) {
            console.error('uploadArea element not found');
            return;
        }
        
        // Remove existing event listeners by cloning the element
        const newUploadArea = uploadArea.cloneNode(true);
        uploadArea.parentNode.replaceChild(newUploadArea, uploadArea);
        
        console.log('Setting up drag and drop for upload area');
        
        newUploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            newUploadArea.classList.add('dragover');
        });

        newUploadArea.addEventListener('dragleave', () => {
            newUploadArea.classList.remove('dragover');
        });

        newUploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            newUploadArea.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                console.log('File dropped:', files[0].name);
                this.processFile(files[0]);
            }
        });

        newUploadArea.addEventListener('click', () => {
            console.log('Upload area clicked, triggering file input');
            const fileInput = document.getElementById('fileInput');
            if (fileInput) {
                fileInput.click();
            } else {
                console.error('fileInput not found when upload area clicked');
            }
        });
    }

    selectFile() {
        console.log('selectFile called');
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            console.log('File input found, triggering click');
            console.log('File input element:', fileInput);
            console.log('File input current value:', fileInput.value);
            console.log('File input files:', fileInput.files);
            
            try {
                fileInput.click();
                console.log('File input click triggered successfully');
            } catch (error) {
                console.error('Error triggering file input click:', error);
            }
        } else {
            console.error('fileInput element not found in selectFile');
        }
    }

    handleFileSelect(e) {
        console.log('handleFileSelect called');
        console.log('Event target:', e.target);
        console.log('Files:', e.target.files);
        console.log('Files length:', e.target.files ? e.target.files.length : 'files is null');
        
        const file = e.target.files ? e.target.files[0] : null;
        if (file) {
            console.log('Processing selected file:', file.name, 'Size:', file.size, 'Type:', file.type);
            this.processFile(file);
        } else {
            console.log('No file selected or files array is empty');
        }
    }

    async processFile(file) {
        console.log('Processing file:', file.name, 'Size:', file.size, 'Type:', file.type);
        
        try {
            // Show progress
            document.getElementById('uploadArea').style.display = 'none';
            document.getElementById('uploadProgress').style.display = 'block';
            this.updateProgress(10, 'Reading file...');

            // Parse the file
            this.updateProgress(30, 'Extracting text...');
            console.log('Calling resumeParser.parseFile...');
            
            if (!this.resumeParser) {
                console.error('ResumeParser not initialized, using fallback parser');
                // Create a simple fallback parser
                const parsedData = await this.fallbackParseFile(file);
                console.log('Fallback parsed data:', parsedData);
                
                // Continue with the rest of the process
                this.updateProgress(70, 'Analyzing content...');
                this.parsedResumeData = parsedData;
                
                this.updateProgress(100, 'Complete!');
                
                // Show results
                setTimeout(() => {
                    console.log('Showing parsed results from fallback...');
                    this.showParsedResults(parsedData);
                }, 500);
                return;
            }
            
            console.log('Using ResumeParser to parse file');
            const parsedData = await this.resumeParser.parseFile(file);
            console.log('Parsed data received:', parsedData);
            
            this.updateProgress(70, 'Analyzing content...');
            this.parsedResumeData = parsedData;
            
            this.updateProgress(100, 'Complete!');
            
            // Show results
            setTimeout(() => {
                console.log('Showing parsed results...');
                this.showParsedResults(parsedData);
            }, 500);

        } catch (error) {
            console.error('Error processing file:', error);
            this.showNotification(`Error processing file: ${error.message}`, 'error');
            this.resetUploadModal();
        }
    }

    async fallbackParseFile(file) {
        console.log('Using fallback file parser for:', file.name);
        
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const text = e.target.result;
                    console.log('File read successfully, length:', text.length);
                    
                    // Create a basic resume data structure
                    const resumeData = {
                        fullName: 'Resume Uploaded',
                        email: '',
                        phone: '',
                        linkedin: '',
                        summary: `Resume file "${file.name}" uploaded successfully. Please review and edit the information below.`,
                        skills: [],
                        experience: [],
                        education: []
                    };
                    
                    // Try to extract basic information from the text
                    if (text) {
                        // Extract email
                        const emailMatch = text.match(/[\w.-]+@([\w-]+\.)+[\w-]{2,4}/);
                        if (emailMatch) {
                            resumeData.email = emailMatch[0];
                        }
                        
                        // Extract phone
                        const phoneMatch = text.match(/(\+?\d{1,2}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?(\d{3}[-.\s]?\d{4})/);
                        if (phoneMatch) {
                            resumeData.phone = phoneMatch[0];
                        }
                        
                        // Extract name (first line that looks like a name)
                        const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
                        for (let i = 0; i < Math.min(3, lines.length); i++) {
                            const line = lines[i];
                            if (line.length > 5 && line.length < 50 && /^[A-Za-z\s.]+$/.test(line) && !line.includes('@') && !line.includes('phone')) {
                                resumeData.fullName = line;
                                break;
                            }
                        }
                    }
                    
                    resolve(resumeData);
                } catch (error) {
                    console.error('Error in fallback parser:', error);
                    reject(error);
                }
            };
            reader.onerror = (error) => {
                console.error('Error reading file:', error);
                reject(error);
            };
            reader.readAsText(file);
        });
    }

    updateProgress(percent, text) {
        document.getElementById('progressFill').style.width = `${percent}%`;
        document.getElementById('progressText').textContent = text;
    }

    showParsedResults(parsedData) {
        document.getElementById('uploadProgress').style.display = 'none';
        document.getElementById('uploadResult').style.display = 'block';
        
        const content = document.getElementById('parsedContent');
        content.innerHTML = `
            <h5>Name:</h5>
            <p>${parsedData.fullName || 'Not found'}</p>
            
            <h5>Email:</h5>
            <p>${parsedData.email || 'Not found'}</p>
            
            <h5>Phone:</h5>
            <p>${parsedData.phone || 'Not found'}</p>
            
            <h5>LinkedIn:</h5>
            <p>${parsedData.linkedin || 'Not found'}</p>
            
            <h5>Summary:</h5>
            <p>${parsedData.summary || 'Not found'}</p>
            
            <h5>Skills (${parsedData.skills.length} found):</h5>
            <p>${parsedData.skills.slice(0, 10).join(', ')}${parsedData.skills.length > 10 ? '...' : ''}</p>
            
            <h5>Experience (${parsedData.experience.length} positions):</h5>
            <p>${parsedData.experience.slice(0, 3).map(exp => `${exp.title} at ${exp.company}`).join(', ')}${parsedData.experience.length > 3 ? '...' : ''}</p>
            
            <h5>Education (${parsedData.education.length} entries):</h5>
            <p>${parsedData.education.slice(0, 2).map(edu => edu.degree).join(', ')}${parsedData.education.length > 2 ? '...' : ''}</p>
        `;
    }

    async saveParsedResume() {
        if (!this.parsedResumeData) {
            this.showNotification('No parsed resume data to save.', 'error');
            return;
        }

        try {
            await chrome.storage.local.set({ resumeData: this.parsedResumeData });
            this.resumeData = this.parsedResumeData;
            this.hideUploadModal();
            this.updateUI();
            this.showNotification('Resume saved successfully!', 'success');
        } catch (error) {
            console.error('Error saving parsed resume:', error);
            this.showNotification('Error saving resume. Please try again.', 'error');
        }
    }

    editParsedResume() {
        if (!this.parsedResumeData) {
            this.showNotification('No parsed resume data to edit.', 'error');
            return;
        }

        // Populate the resume modal with parsed data
        document.getElementById('fullName').value = this.parsedResumeData.fullName || '';
        document.getElementById('email').value = this.parsedResumeData.email || '';
        document.getElementById('phone').value = this.parsedResumeData.phone || '';
        document.getElementById('linkedin').value = this.parsedResumeData.linkedin || '';
        document.getElementById('summary').value = this.parsedResumeData.summary || '';
        document.getElementById('skills').value = this.parsedResumeData.skills.join(', ');
        document.getElementById('experience').value = JSON.stringify(this.parsedResumeData.experience, null, 2);
        document.getElementById('education').value = JSON.stringify(this.parsedResumeData.education, null, 2);

        this.hideUploadModal();
        this.showResumeModal();
    }

    async testWithSampleResume() {
        console.log('Testing with sample resume...');
        
        // Create a sample resume data object
        const sampleResumeData = {
            fullName: 'John Doe',
            email: 'john.doe@email.com',
            phone: '(555) 123-4567',
            linkedin: 'linkedin.com/in/johndoe',
            summary: 'Experienced software engineer with 5+ years of experience in full-stack development. Passionate about creating scalable web applications and leading development teams.',
            skills: ['JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'AWS', 'Docker', 'Git', 'Agile', 'Scrum'],
            experience: [
                {
                    title: 'Senior Software Engineer',
                    company: 'Tech Company Inc.',
                    duration: '2020 - Present',
                    description: 'Led development of microservices architecture. Improved application performance by 40%. Mentored junior developers.'
                },
                {
                    title: 'Software Engineer',
                    company: 'StartupXYZ',
                    duration: '2018 - 2020',
                    description: 'Developed React-based web applications. Collaborated with cross-functional teams. Implemented CI/CD pipelines.'
                }
            ],
            education: [
                {
                    degree: 'Bachelor of Science in Computer Science',
                    school: 'University of Technology',
                    year: '2018'
                }
            ]
        };

        // Show the parsed results directly
        document.getElementById('uploadArea').style.display = 'none';
        document.getElementById('uploadProgress').style.display = 'none';
        document.getElementById('uploadResult').style.display = 'block';
        
        this.parsedResumeData = sampleResumeData;
        this.showParsedResults(sampleResumeData);
    }

    showAIModal() {
        console.log('showAIModal called');
        const modal = document.getElementById('aiModal');
        
        if (!modal) {
            console.error('aiModal element not found');
            return;
        }
        
        console.log('AI Modal found, showing modal');
        
        if (this.aiConfig) {
            // Populate form with existing config
            document.getElementById('openaiKey').value = this.aiConfig.apiKey || '';
            document.getElementById('aiModel').value = this.aiConfig.model || 'gpt-4';
            document.getElementById('aiTemperature').value = this.aiConfig.temperature || 0.7;
            document.getElementById('temperatureValue').textContent = this.aiConfig.temperature || 0.7;
        } else {
            // Clear form
            document.getElementById('aiForm').reset();
            document.getElementById('temperatureValue').textContent = '0.7';
        }
        
        modal.style.display = 'block';
        console.log('AI Modal displayed');
    }

    hideAIModal() {
        document.getElementById('aiModal').style.display = 'none';
    }

    async saveAIConfig() {
        console.log('saveAIConfig function called');
        try {
            const apiKey = document.getElementById('openaiKey').value.trim();
            const model = document.getElementById('aiModel').value;
            const temperature = parseFloat(document.getElementById('aiTemperature').value);

            console.log('Form values:', { apiKey: apiKey.substring(0, 10) + '...', model, temperature });

            if (!apiKey) {
                console.log('No API key provided');
                alert('Please enter your OpenAI API key.');
                return;
            }

            if (!apiKey.startsWith('sk-')) {
                console.log('API key does not start with sk-');
                alert('Please enter a valid OpenAI API key (should start with "sk-").');
                return;
            }

            console.log('API key validation passed, proceeding with save');

            const config = {
                apiKey,
                model,
                temperature,
                maxTokens: 2000
            };

            console.log('Sending message to background script...');
            await chrome.runtime.sendMessage({ 
                action: 'setAIKey', 
                apiKey: apiKey 
            });
            console.log('Message sent to background script successfully');

            // Save complete config to storage
            console.log('Saving config to chrome.storage.local...');
            await chrome.storage.local.set({ aiConfig: config });
            console.log('Config saved to storage successfully');
            
            // Update local config
            this.aiConfig = config;
            console.log('Local config updated');
            
            this.hideAIModal();
            console.log('AI modal hidden');
            
            this.updateUI();
            console.log('UI updated');
            
            this.showNotification('AI configuration saved successfully!', 'success');
            console.log('Success notification shown');
        } catch (error) {
            console.error('Error saving AI config:', error);
            this.showNotification('Error saving AI configuration. Please try again.', 'error');
        }
    }

    async testAI() {
        if (!this.aiConfig || !this.aiConfig.apiKey) {
            this.showNotification('Please configure AI first.', 'error');
            return;
        }

        try {
            this.setLoading(true);
            
            // Test AI with a simple prompt
            const testPrompt = "Respond with 'AI is working correctly' if you can read this message.";
            
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.aiConfig.apiKey}`
                },
                body: JSON.stringify({
                    model: this.aiConfig.model,
                    messages: [
                        {
                            role: 'user',
                            content: testPrompt
                        }
                    ],
                    max_tokens: 50,
                    temperature: 0.1
                })
            });

            if (response.ok) {
                this.showNotification('AI is working correctly!', 'success');
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'AI test failed');
            }
        } catch (error) {
            console.error('AI test error:', error);
            this.showNotification(`AI test failed: ${error.message}`, 'error');
        } finally {
            this.setLoading(false);
        }
    }

    async saveResume() {
        try {
            const formData = {
                fullName: document.getElementById('fullName').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                linkedin: document.getElementById('linkedin').value,
                summary: document.getElementById('summary').value,
                skills: document.getElementById('skills').value.split(',').map(s => s.trim()).filter(s => s),
                experience: this.parseJSONField('experience'),
                education: this.parseJSONField('education')
            };

            // Validate required fields
            if (!formData.fullName || !formData.email) {
                alert('Please fill in at least your name and email.');
                return;
            }

            await chrome.storage.local.set({ resumeData: formData });
            this.resumeData = formData;
            this.hideResumeModal();
            this.updateUI();
            
            // Show success message
            this.showNotification('Resume saved successfully!', 'success');
        } catch (error) {
            console.error('Error saving resume:', error);
            this.showNotification('Error saving resume. Please try again.', 'error');
        }
    }

    parseJSONField(fieldId) {
        const value = document.getElementById(fieldId).value.trim();
        if (!value) return [];
        
        try {
            return JSON.parse(value);
        } catch (error) {
            console.error(`Error parsing ${fieldId}:`, error);
            return [];
        }
    }

    async analyzeJob() {
        if (!this.currentJob) return;

        try {
            this.setLoading(true);
            
            // Send message to content script to analyze the job
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            const response = await chrome.tabs.sendMessage(tab.id, { 
                action: 'analyzeJob',
                jobInfo: this.currentJob 
            });

            if (response && response.analysis) {
                this.currentJob.analysis = response.analysis;
                this.showNotification('Job analysis completed!', 'success');
            } else {
                this.showNotification('Failed to analyze job. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Error analyzing job:', error);
            this.showNotification('Error analyzing job. Please try again.', 'error');
        } finally {
            this.setLoading(false);
        }
    }

    async tailorResume() {
        if (!this.resumeData || !this.currentJob) return;

        try {
            this.setLoading(true);
            
            const options = {
                includeKeywords: document.getElementById('includeKeywords').checked,
                highlightSkills: document.getElementById('highlightSkills').checked,
                adjustExperience: document.getElementById('adjustExperience').checked
            };

            // Use AI-powered tailoring if available
            if (this.aiConfig && this.aiConfig.apiKey) {
                const response = await chrome.runtime.sendMessage({
                    action: 'generateTailoredResume',
                    resumeData: this.resumeData,
                    jobInfo: this.currentJob,
                    options: options
                });

                if (response.error) {
                    throw new Error(response.error);
                }

                this.showNotification('AI-powered resume tailored successfully!', 'success');
                
                // Show tailoring notes if available
                if (response.tailoredResume && response.tailoredResume.tailoringNotes) {
                    this.showTailoringNotes(response.tailoredResume.tailoringNotes);
                }
            } else {
                // Fallback to simple tailoring
                const tailoredResume = await this.generateTailoredResume(this.resumeData, this.currentJob, options);
                await chrome.storage.local.set({ tailoredResume });
                this.showNotification('Resume tailored successfully!', 'success');
            }
        } catch (error) {
            console.error('Error tailoring resume:', error);
            this.showNotification(`Error tailoring resume: ${error.message}`, 'error');
        } finally {
            this.setLoading(false);
        }
    }

    async generateTailoredResume(resumeData, jobInfo, options) {
        // This is a simplified version - in a real implementation, you'd use AI/ML
        const tailoredResume = { ...resumeData };

        if (options.includeKeywords && jobInfo.analysis && jobInfo.analysis.keywords) {
            // Add job keywords to skills if not already present
            const newSkills = jobInfo.analysis.keywords.filter(keyword => 
                !resumeData.skills.some(skill => 
                    skill.toLowerCase().includes(keyword.toLowerCase())
                )
            );
            tailoredResume.skills = [...resumeData.skills, ...newSkills];
        }

        if (options.adjustExperience && jobInfo.analysis && jobInfo.analysis.requirements) {
            // Adjust experience descriptions to match job requirements
            tailoredResume.experience = resumeData.experience.map(exp => ({
                ...exp,
                description: this.enhanceDescription(exp.description, jobInfo.analysis.requirements)
            }));
        }

        return tailoredResume;
    }

    enhanceDescription(description, requirements) {
        // Simple keyword enhancement - in reality, you'd use more sophisticated NLP
        let enhanced = description;
        
        requirements.forEach(req => {
            if (!enhanced.toLowerCase().includes(req.toLowerCase())) {
                enhanced += ` Experience with ${req}.`;
            }
        });
        
        return enhanced;
    }

    async previewResume() {
        try {
            const result = await chrome.storage.local.get(['tailoredResume']);
            const resume = result.tailoredResume || this.resumeData;
            
            if (!resume) {
                this.showNotification('No resume to preview. Please load a resume first.', 'error');
                return;
            }

            // Generate HTML preview
            const htmlContent = this.generateResumeHTML(resume);
            const previewFrame = document.getElementById('previewFrame');
            
            // Create a blob URL for the HTML content
            const blob = new Blob([htmlContent], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            previewFrame.src = url;
            
            // Show preview modal
            document.getElementById('previewModal').style.display = 'block';
            
            // Clean up the URL when modal is closed
            previewFrame.addEventListener('load', () => {
                setTimeout(() => URL.revokeObjectURL(url), 1000);
            });
        } catch (error) {
            console.error('Error previewing resume:', error);
            this.showNotification('Error generating preview. Please try again.', 'error');
        }
    }

    generateResumeHTML(resume) {
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Resume - ${resume.fullName}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; color: #333; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
        .name { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
        .contact { font-size: 14px; color: #666; }
        .section { margin-bottom: 25px; }
        .section-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; border-bottom: 1px solid #ccc; }
        .experience-item, .education-item { margin-bottom: 15px; }
        .job-title { font-weight: bold; }
        .company { color: #666; }
        .duration { font-style: italic; color: #888; }
        .skills { display: flex; flex-wrap: wrap; gap: 8px; }
        .skill { background: #f0f0f0; padding: 4px 8px; border-radius: 4px; font-size: 12px; }
    </style>
</head>
<body>
    <div class="header">
        <div class="name">${resume.fullName}</div>
        <div class="contact">
            ${resume.email} | ${resume.phone || ''} | ${resume.linkedin || ''}
        </div>
    </div>
    
    <div class="section">
        <div class="section-title">Professional Summary</div>
        <p>${resume.summary || 'Professional summary not provided.'}</p>
    </div>
    
    <div class="section">
        <div class="section-title">Skills</div>
        <div class="skills">
            ${resume.skills.map(skill => `<span class="skill">${skill}</span>`).join('')}
        </div>
    </div>
    
    <div class="section">
        <div class="section-title">Experience</div>
        ${resume.experience.map(exp => `
            <div class="experience-item">
                <div class="job-title">${exp.title}</div>
                <div class="company">${exp.company} | <span class="duration">${exp.duration}</span></div>
                <p>${exp.description}</p>
            </div>
        `).join('')}
    </div>
    
    <div class="section">
        <div class="section-title">Education</div>
        ${resume.education.map(edu => `
            <div class="education-item">
                <div class="job-title">${edu.degree}</div>
                <div class="company">${edu.school} | <span class="duration">${edu.year}</span></div>
            </div>
        `).join('')}
    </div>
</body>
</html>`;
    }

    async downloadPDF() {
        try {
            const result = await chrome.storage.local.get(['tailoredResume']);
            const resume = result.tailoredResume || this.resumeData;
            
            if (!resume) {
                this.showNotification('No resume to download. Please load a resume first.', 'error');
                return;
            }

            // Generate LaTeX content
            const latexContent = this.generateLaTeXResume(resume);
            
            // For now, we'll download as HTML since PDF generation requires additional setup
            // In a production app, you'd integrate with a PDF generation service
            const htmlContent = this.generateResumeHTML(resume);
            const blob = new Blob([htmlContent], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `${resume.fullName.replace(/\s+/g, '_')}_Resume.html`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showNotification('Resume downloaded successfully!', 'success');
        } catch (error) {
            console.error('Error downloading resume:', error);
            this.showNotification('Error downloading resume. Please try again.', 'error');
        }
    }

    generateLaTeXResume(resume) {
        // Generate LaTeX content for the resume
        return `\\documentclass[11pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[margin=0.75in]{geometry}
\\usepackage{enumitem}
\\usepackage{titlesec}
\\usepackage{hyperref}

\\titleformat{\\section}{\\large\\bfseries}{}{0em}{}[\\titlerule]
\\titleformat{\\subsection}{\\normalsize\\bfseries}{}{0em}{}

\\begin{document}

\\begin{center}
    {\\huge\\bfseries ${resume.fullName}} \\\\
    \\vspace{0.5em}
    ${resume.email} $|$ ${resume.phone || ''} $|$ ${resume.linkedin || ''}
\\end{center}

\\section{Professional Summary}
${resume.summary || 'Professional summary not provided.'}

\\section{Skills}
\\begin{itemize}[leftmargin=0.5in]
    ${resume.skills.map(skill => `\\item ${skill}`).join('\n    ')}
\\end{itemize}

\\section{Experience}
${resume.experience.map(exp => `
\\subsection{${exp.title} - ${exp.company}}
\\textit{${exp.duration}} \\\\
${exp.description}
`).join('\n')}

\\section{Education}
${resume.education.map(edu => `
\\subsection{${edu.degree} - ${edu.school}}
\\textit{${edu.year}}
`).join('\n')}

\\end{document}`;
    }

    setLoading(loading) {
        const container = document.querySelector('.container');
        if (loading) {
            container.classList.add('loading');
        } else {
            container.classList.remove('loading');
        }
    }

    showTailoringNotes(notes) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>AI Tailoring Summary</h3>
                    <span class="close">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="tailoring-summary">
                        <h4>Key Changes Made:</h4>
                        <ul>
                            ${notes.keyChanges.map(change => `<li>${change}</li>`).join('')}
                        </ul>
                        
                        <h4>Strengths Emphasized:</h4>
                        <ul>
                            ${notes.strengthsEmphasized.map(strength => `<li>${strength}</li>`).join('')}
                        </ul>
                        
                        <h4>Metrics Added:</h4>
                        <ul>
                            ${notes.metricsAdded.map(metric => `<li>${metric}</li>`).join('')}
                        </ul>
                        
                        <h4>Soft Skills Added:</h4>
                        <ul>
                            ${notes.softSkillsAdded.map(skill => `<li>${skill}</li>`).join('')}
                        </ul>
                        
                        <h4>Company Alignment:</h4>
                        <p>${notes.companyAlignment}</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary close-modal">Close</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close modal handlers
        modal.querySelector('.close').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        modal.querySelector('.close-modal').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 6px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            animation: slideIn 0.3s ease;
            background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#007bff'};
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize the popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ResumeTailorPopup();
});

// Add CSS for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);
