// Content script for Resume Tailor extension
// This script runs on web pages to detect job postings and add functionality

class JobPageDetector {
    constructor() {
        this.jobInfo = null;
        this.tailorButton = null;
        this.init();
    }

    init() {
        // Wait for page to load
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.detectJobPage());
        } else {
            this.detectJobPage();
        }

        // Listen for messages from popup
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            this.handleMessage(request, sender, sendResponse);
            return true; // Keep message channel open for async response
        });
    }

    detectJobPage() {
        console.log('🔍 Resume Tailor: Starting job page detection...');
        console.log('📍 Current URL:', window.location.href);
        console.log('📄 Page title:', document.title);
        console.log('🌐 Domain:', window.location.hostname);
        
        // Wait a bit for page to fully load
        setTimeout(() => {
            this.performJobDetection();
        }, 1000);
    }

    performJobDetection() {
        console.log('🔍 Performing job detection...');
        
        // Check if this looks like a job posting page
        const jobIndicators = this.findJobIndicators();
        console.log('📊 Job indicators result:', jobIndicators);
        
        if (jobIndicators.isJobPage) {
            this.jobInfo = jobIndicators.jobInfo;
            this.addTailorButton();
            console.log('✅ Job page detected successfully!');
            console.log('📋 Job info:', this.jobInfo);
            
            // Notify popup that job was detected
            chrome.runtime.sendMessage({ 
                action: 'jobDetected', 
                jobInfo: this.jobInfo 
            });
        } else {
            console.log('❌ No job page detected on this page');
            console.log('🔍 Page analysis:', {
                url: window.location.href,
                title: document.title,
                bodyLength: document.body ? document.body.innerText.length : 0,
                hasJobKeywords: this.hasJobKeywords(),
                isKnownJobSite: this.isKnownJobSite()
            });
        }
    }

    hasJobKeywords() {
        const bodyText = document.body ? document.body.innerText.toLowerCase() : '';
        const title = document.title.toLowerCase();
        
        const jobKeywords = [
            'job', 'career', 'position', 'opening', 'employment',
            'apply now', 'job description', 'requirements', 'qualifications',
            'hiring', 'recruitment', 'vacancy', 'opportunity'
        ];
        
        return jobKeywords.some(keyword => 
            bodyText.includes(keyword) || title.includes(keyword)
        );
    }

    isKnownJobSite() {
        const url = window.location.href;
        const jobSites = [
            'linkedin.com', 'indeed.com', 'glassdoor.com', 'monster.com',
            'ziprecruiter.com', 'careerbuilder.com', 'angel.co', 
            'stackoverflow.com', 'github.com', 'pwc.wd3.myworkdayjobs.com'
        ];
        
        return jobSites.some(site => url.includes(site));
    }

    findJobIndicators() {
        const url = window.location.href;
        const title = document.title;
        const bodyText = document.body.innerText.toLowerCase();

        console.log('Resume Tailor: Analyzing page for job indicators...');
        console.log('URL:', url);
        console.log('Title:', title);
        console.log('Body text length:', bodyText.length);

        // Common job site patterns
        const jobSites = {
            'linkedin.com': () => this.parseLinkedInJob(),
            'indeed.com': () => this.parseIndeedJob(),
            'glassdoor.com': () => this.parseGlassdoorJob(),
            'monster.com': () => this.parseMonsterJob(),
            'ziprecruiter.com': () => this.parseZipRecruiterJob(),
            'careerbuilder.com': () => this.parseCareerBuilderJob(),
            'angel.co': () => this.parseAngelListJob(),
            'stackoverflow.com': () => this.parseStackOverflowJob(),
            'github.com': () => this.parseGitHubJob(),
            'pwc.wd3.myworkdayjobs.com': () => this.parseWorkdayJob(),
            'jobs.scotiabank.com': () => this.parseScotiabankJob() // Add Scotiabank support
        };

        // Check for specific job sites
        for (const [site, parser] of Object.entries(jobSites)) {
            if (url.includes(site)) {
                console.log(`Resume Tailor: Detected job site: ${site}`);
                const jobInfo = parser();
                console.log(`Resume Tailor: Parser result for ${site}:`, jobInfo);
                if (jobInfo) {
                    return { isJobPage: true, jobInfo };
                }
            }
        }

        // Generic job page detection
        const jobKeywords = [
            'job', 'career', 'position', 'opening', 'employment',
            'apply now', 'job description', 'requirements', 'qualifications'
        ];

        const hasJobKeywords = jobKeywords.some(keyword => 
            bodyText.includes(keyword) || title.toLowerCase().includes(keyword)
        );

        if (hasJobKeywords) {
            return { 
                isJobPage: true, 
                jobInfo: this.parseGenericJob() 
            };
        }

        return { isJobPage: false, jobInfo: null };
    }

    parseLinkedInJob() {
        console.log('🔍 Parsing LinkedIn job page...');
        try {
            // Try multiple selectors for LinkedIn's frequently changing structure
            const titleSelectors = [
                'h1.job-title',
                '.job-details-jobs-unified-top-card__job-title',
                'h1[data-test-id="job-title"]',
                '.jobs-unified-top-card__job-title',
                'h1.job-title-text',
                'h1[data-automation-id="job-title"]'
            ];
            
            const companySelectors = [
                '.job-details-jobs-unified-top-card__company-name',
                '.job-details-jobs-unified-top-card__company-name a',
                '[data-test-id="job-company-name"]',
                '.jobs-unified-top-card__company-name',
                '.job-details-jobs-unified-top-card__company-name a span'
            ];
            
            const locationSelectors = [
                '.job-details-jobs-unified-top-card__bullet',
                '.job-details-jobs-unified-top-card__job-location',
                '[data-test-id="job-location"]',
                '.jobs-unified-top-card__bullet',
                '.job-details-jobs-unified-top-card__job-location span'
            ];
            
            const descriptionSelectors = [
                '.jobs-description-content__text',
                '.jobs-box__html-content',
                '.jobs-description__content',
                '.jobs-description-content',
                '#job-details',
                '.jobs-description__text'
            ];

            const titleElement = this.findElementBySelectors(titleSelectors);
            const companyElement = this.findElementBySelectors(companySelectors);
            const locationElement = this.findElementBySelectors(locationSelectors);
            const descriptionElement = this.findElementBySelectors(descriptionSelectors);

            const jobInfo = {
                title: titleElement?.textContent?.trim() || this.extractTitleFromPage(),
                company: companyElement?.textContent?.trim() || this.extractCompanyFromPage(),
                location: locationElement?.textContent?.trim() || '',
                description: descriptionElement?.innerHTML || descriptionElement?.textContent || '',
                url: window.location.href,
                source: 'LinkedIn'
            };

            console.log('📋 LinkedIn job parsed:', jobInfo);
            
            // Validate that we got meaningful data
            if (jobInfo.title && jobInfo.company) {
                return jobInfo;
            } else {
                console.log('⚠️ LinkedIn job parsing incomplete, trying fallback...');
                return this.parseGenericJob();
            }
        } catch (error) {
            console.error('❌ Error parsing LinkedIn job:', error);
            return null;
        }
    }

    findElementBySelectors(selectors) {
        for (const selector of selectors) {
            const element = document.querySelector(selector);
            if (element && element.textContent.trim()) {
                console.log(`✅ Found element with selector: ${selector}`);
                return element;
            }
        }
        return null;
    }

    extractTitleFromPage() {
        // Fallback: try to extract title from page title or headers
        const title = document.title;
        if (title && title !== 'LinkedIn') {
            // Remove common suffixes
            return title.replace(/\s*-\s*LinkedIn$/, '').replace(/\s*\|\s*LinkedIn$/, '');
        }
        return '';
    }

    extractCompanyFromPage() {
        // Fallback: try to extract company from various places
        const companySelectors = [
            '[data-test-id="company-name"]',
            '.job-details-jobs-unified-top-card__company-name',
            '.jobs-unified-top-card__company-name'
        ];
        
        for (const selector of companySelectors) {
            const element = document.querySelector(selector);
            if (element && element.textContent.trim()) {
                return element.textContent.trim();
            }
        }
        return '';
    }

    parseIndeedJob() {
        try {
            const titleElement = document.querySelector('h1[data-testid="job-title"], .jobsearch-JobInfoHeader-title');
            const companyElement = document.querySelector('[data-testid="company-name"], .jobsearch-CompanyInfoContainer');
            const locationElement = document.querySelector('[data-testid="job-location"], .jobsearch-JobInfoHeader-subtitle');
            const descriptionElement = document.querySelector('#jobDescriptionText, .jobsearch-jobDescriptionText');

            return {
                title: titleElement?.textContent?.trim() || '',
                company: companyElement?.textContent?.trim() || '',
                location: locationElement?.textContent?.trim() || '',
                description: descriptionElement?.innerHTML || '',
                url: window.location.href,
                source: 'Indeed'
            };
        } catch (error) {
            console.error('Error parsing Indeed job:', error);
            return null;
        }
    }

    parseGlassdoorJob() {
        try {
            const titleElement = document.querySelector('.jobTitle, .JobDetails_jobTitle__');
            const companyElement = document.querySelector('.employerName, .JobDetails_employerName__');
            const locationElement = document.querySelector('.location, .JobDetails_location__');
            const descriptionElement = document.querySelector('.jobDescriptionContent, .JobDetails_jobDescription__');

            return {
                title: titleElement?.textContent?.trim() || '',
                company: companyElement?.textContent?.trim() || '',
                location: locationElement?.textContent?.trim() || '',
                description: descriptionElement?.innerHTML || '',
                url: window.location.href,
                source: 'Glassdoor'
            };
        } catch (error) {
            console.error('Error parsing Glassdoor job:', error);
            return null;
        }
    }

    parseMonsterJob() {
        try {
            const titleElement = document.querySelector('h1[data-testid="job-title"], .job-title');
            const companyElement = document.querySelector('[data-testid="company-name"], .company-name');
            const locationElement = document.querySelector('[data-testid="job-location"], .job-location');
            const descriptionElement = document.querySelector('.job-description, .job-details');

            return {
                title: titleElement?.textContent?.trim() || '',
                company: companyElement?.textContent?.trim() || '',
                location: locationElement?.textContent?.trim() || '',
                description: descriptionElement?.innerHTML || '',
                url: window.location.href,
                source: 'Monster'
            };
        } catch (error) {
            console.error('Error parsing Monster job:', error);
            return null;
        }
    }

    parseZipRecruiterJob() {
        try {
            const titleElement = document.querySelector('h1[data-testid="job-title"], .job_title');
            const companyElement = document.querySelector('[data-testid="company-name"], .company_name');
            const locationElement = document.querySelector('[data-testid="job-location"], .job_location');
            const descriptionElement = document.querySelector('.job_description, .job-details');

            return {
                title: titleElement?.textContent?.trim() || '',
                company: companyElement?.textContent?.trim() || '',
                location: locationElement?.textContent?.trim() || '',
                description: descriptionElement?.innerHTML || '',
                url: window.location.href,
                source: 'ZipRecruiter'
            };
        } catch (error) {
            console.error('Error parsing ZipRecruiter job:', error);
            return null;
        }
    }

    parseCareerBuilderJob() {
        try {
            const titleElement = document.querySelector('h1[data-testid="job-title"], .job-title');
            const companyElement = document.querySelector('[data-testid="company-name"], .company-name');
            const locationElement = document.querySelector('[data-testid="job-location"], .job-location');
            const descriptionElement = document.querySelector('.job-description, .job-details');

            return {
                title: titleElement?.textContent?.trim() || '',
                company: companyElement?.textContent?.trim() || '',
                location: locationElement?.textContent?.trim() || '',
                description: descriptionElement?.innerHTML || '',
                url: window.location.href,
                source: 'CareerBuilder'
            };
        } catch (error) {
            console.error('Error parsing CareerBuilder job:', error);
            return null;
        }
    }

    parseAngelListJob() {
        try {
            const titleElement = document.querySelector('h1, .job-title');
            const companyElement = document.querySelector('.company-name, .startup-name');
            const locationElement = document.querySelector('.location, .job-location');
            const descriptionElement = document.querySelector('.job-description, .description');

            return {
                title: titleElement?.textContent?.trim() || '',
                company: companyElement?.textContent?.trim() || '',
                location: locationElement?.textContent?.trim() || '',
                description: descriptionElement?.innerHTML || '',
                url: window.location.href,
                source: 'AngelList'
            };
        } catch (error) {
            console.error('Error parsing AngelList job:', error);
            return null;
        }
    }

    parseStackOverflowJob() {
        try {
            const titleElement = document.querySelector('h1, .job-title');
            const companyElement = document.querySelector('.company-name, .employer-name');
            const locationElement = document.querySelector('.location, .job-location');
            const descriptionElement = document.querySelector('.job-description, .description');

            return {
                title: titleElement?.textContent?.trim() || '',
                company: companyElement?.textContent?.trim() || '',
                location: locationElement?.textContent?.trim() || '',
                description: descriptionElement?.innerHTML || '',
                url: window.location.href,
                source: 'StackOverflow'
            };
        } catch (error) {
            console.error('Error parsing StackOverflow job:', error);
            return null;
        }
    }

    parseGitHubJob() {
        try {
            const titleElement = document.querySelector('h1, .job-title');
            const companyElement = document.querySelector('.company-name, .organization-name');
            const locationElement = document.querySelector('.location, .job-location');
            const descriptionElement = document.querySelector('.job-description, .description');

            return {
                title: titleElement?.textContent?.trim() || '',
                company: companyElement?.textContent?.trim() || '',
                location: locationElement?.textContent?.trim() || '',
                description: descriptionElement?.innerHTML || '',
                url: window.location.href,
                source: 'GitHub'
            };
        } catch (error) {
            console.error('Error parsing GitHub job:', error);
            return null;
        }
    }

    parseWorkdayJob() {
        console.log('Resume Tailor: Parsing Workday job page...');
        try {
            // Workday-specific selectors for PwC and other companies using Workday
            const titleElement = document.querySelector('h1[data-automation-id="jobTitle"], .job-title, h1');
            const companyElement = document.querySelector('[data-automation-id="jobCompany"], .company-name, .job-company');
            const locationElement = document.querySelector('[data-automation-id="jobLocation"], .job-location, .location');
            const descriptionElement = document.querySelector('[data-automation-id="jobPostingDescription"], .job-description, .description');

            console.log('Workday elements found:', {
                title: titleElement?.textContent?.trim(),
                company: companyElement?.textContent?.trim(),
                location: locationElement?.textContent?.trim(),
                description: descriptionElement ? 'Found' : 'Not found'
            });

            const jobInfo = {
                title: titleElement?.textContent?.trim() || document.title,
                company: companyElement?.textContent?.trim() || 'PwC', // Default to PwC if not found
                location: locationElement?.textContent?.trim() || '',
                description: descriptionElement?.innerHTML || document.body.innerHTML,
                url: window.location.href,
                source: 'Workday'
            };

            console.log('Workday job info parsed:', jobInfo);
            return jobInfo;
        } catch (error) {
            console.error('Error parsing Workday job:', error);
            return null;
        }
    }

    parseScotiabankJob() {
        console.log('🏦 Resume Tailor: Parsing Scotiabank job page...');
        try {
            // Scotiabank-specific selectors
            const titleSelectors = [
                'h1.job-title',
                '.job-title',
                'h1[data-testid="job-title"]',
                'h1.job-header-title',
                '.job-header h1',
                'h1'
            ];
            
            const companySelectors = [
                '.company-name',
                '.employer-name',
                '[data-testid="company-name"]',
                '.job-company',
                '.employer'
            ];
            
            const locationSelectors = [
                '.job-location',
                '.location',
                '[data-testid="job-location"]',
                '.work-location',
                '.job-address'
            ];
            
            const descriptionSelectors = [
                '.job-description',
                '.job-details',
                '[data-testid="job-description"]',
                '.job-content',
                '.description',
                '.job-summary'
            ];

            const titleElement = this.findElementBySelectors(titleSelectors);
            const companyElement = this.findElementBySelectors(companySelectors);
            const locationElement = this.findElementBySelectors(locationSelectors);
            const descriptionElement = this.findElementBySelectors(descriptionSelectors);

            // Extract company from URL if not found
            let company = companyElement?.textContent?.trim() || '';
            if (!company) {
                if (window.location.href.includes('scotiabank.com')) {
                    company = 'Scotiabank';
                } else if (window.location.href.includes('tangerine')) {
                    company = 'Tangerine';
                }
            }

            const jobInfo = {
                title: titleElement?.textContent?.trim() || this.extractTitleFromPage(),
                company: company,
                location: locationElement?.textContent?.trim() || '',
                description: descriptionElement?.innerHTML || descriptionElement?.textContent || '',
                url: window.location.href,
                source: 'Scotiabank'
            };

            console.log('🏦 Scotiabank job parsed:', jobInfo);
            
            // Validate that we got meaningful data
            if (jobInfo.title || jobInfo.company) {
                return jobInfo;
            } else {
                console.log('⚠️ Scotiabank job parsing incomplete, trying fallback...');
                return this.parseGenericJob();
            }
        } catch (error) {
            console.error('❌ Error parsing Scotiabank job:', error);
            return null;
        }
    }

    parseGenericJob() {
        console.log('🔍 Parsing generic job page...');
        try {
            // Try to find common job posting elements with multiple selectors
            const titleSelectors = [
                'h1', 'h2', '.job-title', '.position-title', '.job-header h1',
                '[data-testid*="job-title"]', '[data-automation-id*="job-title"]',
                '.job-title-text', '.job-name', '.position-name'
            ];
            
            const companySelectors = [
                '.company-name', '.employer', '.company', '.organization',
                '[data-testid*="company"]', '[data-automation-id*="company"]',
                '.employer-name', '.company-title', '.organization-name'
            ];
            
            const locationSelectors = [
                '.location', '.job-location', '.work-location',
                '[data-testid*="location"]', '[data-automation-id*="location"]',
                '.job-address', '.work-address', '.office-location'
            ];
            
            const descriptionSelectors = [
                '.job-description', '.description', '.job-details', '.requirements',
                '[data-testid*="description"]', '[data-automation-id*="description"]',
                '.job-content', '.job-summary', '.position-description'
            ];

            const titleElement = this.findElementBySelectors(titleSelectors);
            const companyElement = this.findElementBySelectors(companySelectors);
            const locationElement = this.findElementBySelectors(locationSelectors);
            const descriptionElement = this.findElementBySelectors(descriptionSelectors);

            // Extract title from page title if no element found
            let title = titleElement?.textContent?.trim() || '';
            if (!title) {
                title = this.extractTitleFromPage();
            }

            // Extract company from various sources
            let company = companyElement?.textContent?.trim() || '';
            if (!company) {
                company = this.extractCompanyFromPage();
            }

            // Get description
            let description = '';
            if (descriptionElement) {
                description = descriptionElement.innerHTML || descriptionElement.textContent || '';
            } else {
                // Fallback: get main content area
                const mainContent = document.querySelector('main, .main, .content, .job-content, #content');
                if (mainContent) {
                    description = mainContent.innerHTML || mainContent.textContent || '';
                } else {
                    description = document.body.innerHTML;
                }
            }

            const jobInfo = {
                title: title,
                company: company,
                location: locationElement?.textContent?.trim() || '',
                description: description,
                url: window.location.href,
                source: 'Generic'
            };

            console.log('📋 Generic job parsed:', jobInfo);
            
            // Validate that we got some meaningful data
            if (jobInfo.title || jobInfo.company || jobInfo.description) {
                return jobInfo;
            } else {
                console.log('⚠️ Generic job parsing failed - no meaningful data found');
                return null;
            }
        } catch (error) {
            console.error('❌ Error parsing generic job:', error);
            return null;
        }
    }

    addTailorButton() {
        // Remove existing button if it exists
        if (this.tailorButton) {
            this.tailorButton.remove();
        }

        // Create the tailor button
        this.tailorButton = document.createElement('div');
        this.tailorButton.id = 'resume-tailor-button';
        this.tailorButton.innerHTML = `
            <div class="tailor-button-content">
                <span class="tailor-icon">📄</span>
                <span class="tailor-text">Tailor Resume</span>
            </div>
        `;

        // Add click event
        this.tailorButton.addEventListener('click', () => {
            this.openExtensionPopup();
        });

        // Add to page
        document.body.appendChild(this.tailorButton);

        // Position the button
        this.positionButton();
    }

    positionButton() {
        if (!this.tailorButton) return;

        // Try to position near common apply buttons
        const applyButtons = document.querySelectorAll(
            'button[data-testid*="apply"], .apply-button, .job-apply-button, ' +
            '[data-testid*="apply-now"], .apply-now-button, ' +
            'button[aria-label*="Apply"], a[aria-label*="Apply"], ' +
            'button[title*="Apply"], a[title*="Apply"]'
        );

        if (applyButtons.length > 0) {
            const applyButton = applyButtons[0];
            const rect = applyButton.getBoundingClientRect();
            
            this.tailorButton.style.position = 'fixed';
            this.tailorButton.style.top = `${rect.top + window.scrollY}px`;
            this.tailorButton.style.left = `${rect.right + 20}px`;
            this.tailorButton.style.zIndex = '10000';
        } else {
            // Fallback: look for buttons with "Apply" text
            const allButtons = document.querySelectorAll('button, a');
            let applyButtonByText = null;
            
            for (const button of allButtons) {
                const text = button.textContent.toLowerCase().trim();
                if (text.includes('apply') && text.length < 50) {
                    applyButtonByText = button;
                    break;
                }
            }
            
            if (applyButtonByText) {
                const rect = applyButtonByText.getBoundingClientRect();
                this.tailorButton.style.position = 'fixed';
                this.tailorButton.style.top = `${rect.top + window.scrollY}px`;
                this.tailorButton.style.left = `${rect.right + 20}px`;
                this.tailorButton.style.zIndex = '10000';
            } else {
                // Default position - top right
                this.tailorButton.style.position = 'fixed';
                this.tailorButton.style.top = '20px';
                this.tailorButton.style.right = '20px';
                this.tailorButton.style.zIndex = '10000';
            }
        }
    }

    openExtensionPopup() {
        // Send message to background script to open popup
        chrome.runtime.sendMessage({ action: 'openPopup' });
    }

    async handleMessage(request, sender, sendResponse) {
        console.log('Content script received message:', request);
        
        try {
            switch (request.action) {
                case 'getJobInfo':
                    console.log('Sending job info:', this.jobInfo);
                    sendResponse({ jobInfo: this.jobInfo });
                    break;

                case 'analyzeJob':
                    console.log('Analyzing job...');
                    try {
                        if (!this.jobInfo) {
                            throw new Error('No job information available');
                        }
                        const analysis = await this.analyzeJobDescription(this.jobInfo);
                        console.log('Job analysis completed:', analysis);
                        sendResponse({ analysis });
                    } catch (error) {
                        console.error('Error analyzing job:', error);
                        sendResponse({ error: error.message });
                    }
                    break;

                default:
                    console.warn('Unknown action:', request.action);
                    sendResponse({ error: `Unknown action: ${request.action}` });
            }
        } catch (error) {
            console.error('Error handling message:', error);
            sendResponse({ error: error.message });
        }
        
        return true; // Keep message channel open for async responses
    }

    async analyzeJobDescription(jobInfo) {
        if (!jobInfo || !jobInfo.description) {
            throw new Error('No job description available');
        }

        // Extract text content from HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = jobInfo.description;
        const textContent = tempDiv.textContent || tempDiv.innerText || '';

        // Simple keyword extraction (in a real app, you'd use more sophisticated NLP)
        const analysis = {
            keywords: this.extractKeywords(textContent),
            requirements: this.extractRequirements(textContent),
            skills: this.extractSkills(textContent),
            experience: this.extractExperienceLevel(textContent),
            industry: this.detectIndustry(textContent)
        };

        return analysis;
    }

    extractKeywords(text) {
        // Common technical and professional keywords
        const keywordPatterns = [
            /\b(?:javascript|python|java|react|angular|vue|node\.?js|typescript|sql|aws|azure|docker|kubernetes|git|agile|scrum)\b/gi,
            /\b(?:leadership|management|communication|analytical|problem.?solving|teamwork|collaboration)\b/gi,
            /\b(?:bachelor|master|phd|degree|certification|experience|years?)\b/gi
        ];

        const keywords = new Set();
        
        keywordPatterns.forEach(pattern => {
            const matches = text.match(pattern);
            if (matches) {
                matches.forEach(match => keywords.add(match.toLowerCase()));
            }
        });

        return Array.from(keywords).slice(0, 20); // Limit to top 20 keywords
    }

    extractRequirements(text) {
        const requirements = [];
        const lines = text.split('\n');
        
        lines.forEach(line => {
            const trimmed = line.trim();
            if (trimmed.match(/^\d+\.|^•|^\-|^requirements?/i) && trimmed.length > 10) {
                requirements.push(trimmed);
            }
        });

        return requirements.slice(0, 10); // Limit to top 10 requirements
    }

    extractSkills(text) {
        const skillKeywords = [
            'programming', 'coding', 'development', 'software', 'web', 'mobile',
            'database', 'cloud', 'devops', 'machine learning', 'ai', 'data science',
            'project management', 'agile', 'scrum', 'leadership', 'communication'
        ];

        const foundSkills = skillKeywords.filter(skill => 
            text.toLowerCase().includes(skill.toLowerCase())
        );

        return foundSkills;
    }

    extractExperienceLevel(text) {
        const experiencePatterns = [
            /(\d+)\+?\s*years?\s*(?:of\s*)?experience/gi,
            /(?:entry|junior|mid|senior|lead|principal|director|manager)/gi
        ];

        const levels = [];
        
        experiencePatterns.forEach(pattern => {
            const matches = text.match(pattern);
            if (matches) {
                levels.push(...matches);
            }
        });

        return levels;
    }

    detectIndustry(text) {
        const industries = {
            'technology': ['software', 'tech', 'programming', 'development', 'engineering'],
            'finance': ['banking', 'finance', 'financial', 'investment', 'trading'],
            'healthcare': ['health', 'medical', 'healthcare', 'hospital', 'clinic'],
            'education': ['education', 'teaching', 'academic', 'university', 'school'],
            'retail': ['retail', 'sales', 'customer', 'commerce', 'ecommerce']
        };

        const textLower = text.toLowerCase();
        
        for (const [industry, keywords] of Object.entries(industries)) {
            if (keywords.some(keyword => textLower.includes(keyword))) {
                return industry;
            }
        }

        return 'general';
    }
}

// Initialize the job page detector
new JobPageDetector();

