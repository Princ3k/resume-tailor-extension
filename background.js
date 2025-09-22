// Background script for Resume Tailor extension

// AI Configuration
const AI_CONFIG = {
    apiKey: null, // Will be set by user
    model: 'gpt-4',
    maxTokens: 2000,
    temperature: 0.7
};

chrome.runtime.onInstalled.addListener(() => {
    console.log('Resume Tailor extension installed');
    
    // Set up default storage
    chrome.storage.local.set({
        resumeData: null,
        tailoredResume: null,
        jobAnalysis: null,
        aiConfig: AI_CONFIG,
        companyProfiles: {}
    });
});

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Background script received message:', request);
    
    try {
        switch (request.action) {
            case 'openPopup':
                console.log('Opening popup...');
                try {
                    chrome.action.openPopup();
                    sendResponse({ success: true });
                } catch (error) {
                    console.error('Error opening popup:', error);
                    sendResponse({ error: error.message });
                }
                break;
                
            case 'analyzeJob':
                console.log('Analyzing job with AI...');
                analyzeJobWithAI(request.jobInfo)
                    .then(analysis => {
                        console.log('Job analysis completed:', analysis);
                        sendResponse({ analysis });
                    })
                    .catch(error => {
                        console.error('Error analyzing job:', error);
                        sendResponse({ error: error.message });
                    });
                return true; // Keep message channel open for async response
                
            case 'generateTailoredResume':
                console.log('Generating tailored resume...');
                generateAITailoredResume(request.resumeData, request.jobInfo, request.options)
                    .then(tailoredResume => {
                        console.log('Tailored resume generated:', tailoredResume);
                        sendResponse({ tailoredResume });
                    })
                    .catch(error => {
                        console.error('Error generating tailored resume:', error);
                        sendResponse({ error: error.message });
                    });
                return true; // Keep message channel open for async response
                
            case 'setAIKey':
                console.log('Setting AI key...');
                setAIKey(request.apiKey)
                    .then(() => {
                        console.log('AI key set successfully');
                        sendResponse({ success: true });
                    })
                    .catch(error => {
                        console.error('Error setting AI key:', error);
                        sendResponse({ error: error.message });
                    });
                return true;
                
            case 'analyzeCompany':
                console.log('Analyzing company...');
                analyzeCompanyWithAI(request.companyName)
                    .then(profile => {
                        console.log('Company analysis completed:', profile);
                        sendResponse({ profile });
                    })
                    .catch(error => {
                        console.error('Error analyzing company:', error);
                        sendResponse({ error: error.message });
                    });
                return true;
                
            case 'generatePDF':
                console.log('Generating PDF...');
                generatePDF(request.resumeData)
                    .then(pdfData => {
                        console.log('PDF generated:', pdfData);
                        sendResponse({ pdfData });
                    })
                    .catch(error => {
                        console.error('Error generating PDF:', error);
                        sendResponse({ error: error.message });
                    });
                return true; // Keep message channel open for async response
                
            default:
                console.warn('Unknown action:', request.action);
                sendResponse({ error: `Unknown action: ${request.action}` });
        }
    } catch (error) {
        console.error('Error handling message in background script:', error);
        sendResponse({ error: error.message });
    }
});

// AI-Powered Job Analysis
async function analyzeJobWithAI(jobInfo) {
    try {
        const config = await getAIConfig();
        if (!config.apiKey) {
            throw new Error('OpenAI API key not configured. Please set it in the extension settings.');
        }

        const prompt = createJobAnalysisPrompt(jobInfo);
        const aiResponse = await callOpenAI(prompt, config);
        
        const analysis = {
            ...aiResponse,
            company: jobInfo.company,
            title: jobInfo.title,
            location: jobInfo.location,
            url: jobInfo.url,
            source: jobInfo.source,
            analyzedAt: new Date().toISOString()
        };

        // Store the analysis
        await chrome.storage.local.set({ jobAnalysis: analysis });
        
        return analysis;
    } catch (error) {
        console.error('Error analyzing job with AI:', error);
        // Fallback to simple analysis
        return analyzeJobDescription(jobInfo);
    }
}

// AI-Powered Company Analysis
async function analyzeCompanyWithAI(companyName) {
    try {
        const config = await getAIConfig();
        if (!config.apiKey) {
            throw new Error('OpenAI API key not configured.');
        }

        // Check if we already have this company's profile
        const stored = await chrome.storage.local.get(['companyProfiles']);
        if (stored.companyProfiles && stored.companyProfiles[companyName]) {
            return stored.companyProfiles[companyName];
        }

        const prompt = createCompanyAnalysisPrompt(companyName);
        const aiResponse = await callOpenAI(prompt, config);
        
        const profile = {
            ...aiResponse,
            companyName,
            analyzedAt: new Date().toISOString()
        };

        // Store the company profile
        const companyProfiles = stored.companyProfiles || {};
        companyProfiles[companyName] = profile;
        await chrome.storage.local.set({ companyProfiles });
        
        return profile;
    } catch (error) {
        console.error('Error analyzing company with AI:', error);
        throw error;
    }
}

// AI-Powered Resume Tailoring
async function generateAITailoredResume(resumeData, jobInfo, options) {
    try {
        const config = await getAIConfig();
        if (!config.apiKey) {
            throw new Error('OpenAI API key not configured.');
        }

        // Get company profile if available
        let companyProfile = null;
        try {
            companyProfile = await analyzeCompanyWithAI(jobInfo.company);
        } catch (error) {
            console.log('Could not analyze company, proceeding without company profile');
        }

        const prompt = createResumeTailoringPrompt(resumeData, jobInfo, companyProfile, options);
        const aiResponse = await callOpenAI(prompt, config);
        
        const tailoredResume = {
            ...resumeData,
            ...aiResponse,
            tailoredFor: {
                jobTitle: jobInfo.title,
                company: jobInfo.company,
                location: jobInfo.location,
                tailoredAt: new Date().toISOString()
            }
        };

        // Store the tailored resume
        await chrome.storage.local.set({ tailoredResume });

        return tailoredResume;
    } catch (error) {
        console.error('Error generating AI tailored resume:', error);
        throw error;
    }
}

// OpenAI API Integration
async function callOpenAI(prompt, config) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({
            model: config.model,
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert resume writer and career consultant with deep knowledge of ATS systems, hiring practices, and industry trends. You help job seekers create compelling, tailored resumes that highlight their strengths and match job requirements.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            max_tokens: config.maxTokens,
            temperature: config.temperature
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    try {
        return JSON.parse(content);
    } catch (error) {
        // If response is not JSON, return as text
        return { analysis: content };
    }
}

// AI Prompt Creation Functions
function createJobAnalysisPrompt(jobInfo) {
    return `Analyze this job posting and provide a comprehensive analysis in JSON format:

Job Title: ${jobInfo.title}
Company: ${jobInfo.company}
Location: ${jobInfo.location}
Job Description: ${jobInfo.description}

Please provide analysis in this exact JSON format:
{
    "keywords": ["list", "of", "important", "keywords"],
    "requirements": ["list", "of", "key", "requirements"],
    "skills": {
        "technical": ["technical", "skills", "needed"],
        "soft": ["soft", "skills", "needed"]
    },
    "experience": {
        "level": "entry|mid|senior|lead",
        "years": "X+ years",
        "type": "description of experience type"
    },
    "industry": "detected industry",
    "companySize": "startup|small|medium|large|enterprise",
    "culture": "company culture indicators",
    "priorities": ["what", "company", "values", "most"],
    "metrics": ["quantifiable", "metrics", "they", "care", "about"],
    "growth": "growth opportunities mentioned",
    "challenges": ["key", "challenges", "role", "addresses"]
}`;
}

function createCompanyAnalysisPrompt(companyName) {
    return `Analyze this company and provide insights in JSON format:

Company: ${companyName}

Please provide analysis in this exact JSON format:
{
    "industry": "primary industry",
    "size": "startup|small|medium|large|enterprise",
    "culture": "company culture description",
    "values": ["core", "company", "values"],
    "mission": "company mission statement",
    "growth": "growth stage and trajectory",
    "reputation": "company reputation in industry",
    "workStyle": "typical work style and environment",
    "benefits": ["common", "benefits", "offered"],
    "challenges": ["company", "challenges", "or", "focus", "areas"],
    "techStack": ["common", "technologies", "used"],
    "leadership": "leadership style indicators",
    "innovation": "innovation level and approach"
}`;
}

function createResumeTailoringPrompt(resumeData, jobInfo, companyProfile, options) {
    return `Tailor this resume for the specific job and company. Provide the tailored resume in JSON format:

ORIGINAL RESUME:
Name: ${resumeData.fullName}
Email: ${resumeData.email}
Phone: ${resumeData.phone}
LinkedIn: ${resumeData.linkedin}
Summary: ${resumeData.summary}
Skills: ${resumeData.skills.join(', ')}
Experience: ${JSON.stringify(resumeData.experience)}
Education: ${JSON.stringify(resumeData.education)}

TARGET JOB:
Title: ${jobInfo.title}
Company: ${jobInfo.company}
Location: ${jobInfo.location}
Description: ${jobInfo.description}

COMPANY PROFILE: ${companyProfile ? JSON.stringify(companyProfile) : 'Not available'}

TAILORING OPTIONS:
- Include Keywords: ${options.includeKeywords}
- Highlight Skills: ${options.highlightSkills}
- Adjust Experience: ${options.adjustExperience}

Please provide the tailored resume in this exact JSON format:
{
    "fullName": "same as original",
    "email": "same as original",
    "phone": "same as original",
    "linkedin": "same as original",
    "summary": "tailored professional summary emphasizing relevant strengths and alignment with company values",
    "skills": ["reordered and enhanced skills list with job-relevant skills prioritized"],
    "experience": [
        {
            "title": "job title",
            "company": "company name",
            "duration": "duration",
            "description": "enhanced description with metrics, achievements, and job-relevant keywords"
        }
    ],
    "education": "same as original",
    "tailoringNotes": {
        "keyChanges": ["list of major changes made"],
        "strengthsEmphasized": ["user strengths that were highlighted"],
        "metricsAdded": ["quantifiable achievements added"],
        "softSkillsAdded": ["soft skills emphasized"],
        "companyAlignment": "how resume aligns with company culture and values"
    }
}

Focus on:
1. Adding quantifiable metrics and achievements
2. Emphasizing soft skills that match company culture
3. Highlighting user's strongest qualifications for this role
4. Using job-relevant keywords naturally
5. Aligning with company values and culture
6. Showing impact and results, not just responsibilities`;
}

// Utility Functions
async function getAIConfig() {
    const result = await chrome.storage.local.get(['aiConfig']);
    return result.aiConfig || AI_CONFIG;
}

async function setAIKey(apiKey) {
    const config = await getAIConfig();
    config.apiKey = apiKey;
    await chrome.storage.local.set({ aiConfig: config });
}

// Fallback analysis function (original implementation)
async function analyzeJobDescription(jobInfo) {
    try {
        const analysis = {
            keywords: extractKeywords(jobInfo.description),
            requirements: extractRequirements(jobInfo.description),
            skills: extractSkills(jobInfo.description),
            experience: extractExperienceLevel(jobInfo.description),
            industry: detectIndustry(jobInfo.description),
            company: jobInfo.company,
            title: jobInfo.title,
            location: jobInfo.location
        };

        await chrome.storage.local.set({ jobAnalysis: analysis });
        return analysis;
    } catch (error) {
        console.error('Error analyzing job description:', error);
        throw error;
    }
}

// Generate tailored resume based on job analysis
async function generateTailoredResume(resumeData, jobInfo, options) {
    try {
        const analysis = await analyzeJobDescription(jobInfo);
        const tailoredResume = { ...resumeData };

        // Apply tailoring based on options
        if (options.includeKeywords && analysis.keywords) {
            tailoredResume.skills = enhanceSkills(resumeData.skills, analysis.keywords);
        }

        if (options.highlightSkills && analysis.skills) {
            tailoredResume.skills = prioritizeSkills(resumeData.skills, analysis.skills);
        }

        if (options.adjustExperience && analysis.requirements) {
            tailoredResume.experience = enhanceExperience(resumeData.experience, analysis.requirements);
        }

        // Add job-specific summary
        if (analysis.industry && analysis.title) {
            tailoredResume.summary = enhanceSummary(resumeData.summary, analysis);
        }

        // Store the tailored resume
        await chrome.storage.local.set({ tailoredResume });

        return tailoredResume;
    } catch (error) {
        console.error('Error generating tailored resume:', error);
        throw error;
    }
}

// Generate PDF from resume data
async function generatePDF(resumeData) {
    try {
        // In a real implementation, you would:
        // 1. Generate LaTeX content
        // 2. Compile LaTeX to PDF using a service like Overleaf API
        // 3. Return the PDF data
        
        // For now, we'll return a placeholder
        const latexContent = generateLaTeXResume(resumeData);
        
        return {
            latexContent,
            message: 'PDF generation would be implemented with LaTeX compilation service'
        };
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw error;
    }
}

// Helper functions for job analysis
function extractKeywords(text) {
    const commonKeywords = [
        'javascript', 'python', 'java', 'react', 'angular', 'vue', 'nodejs', 'typescript',
        'sql', 'aws', 'azure', 'docker', 'kubernetes', 'git', 'agile', 'scrum',
        'leadership', 'management', 'communication', 'analytical', 'problem-solving',
        'teamwork', 'collaboration', 'bachelor', 'master', 'phd', 'degree', 'certification'
    ];

    const foundKeywords = commonKeywords.filter(keyword => 
        text.toLowerCase().includes(keyword.toLowerCase())
    );

    return foundKeywords;
}

function extractRequirements(text) {
    const lines = text.split('\n');
    const requirements = [];

    lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed.match(/^\d+\.|^•|^\-|^requirements?/i) && trimmed.length > 10) {
            requirements.push(trimmed);
        }
    });

    return requirements.slice(0, 10);
}

function extractSkills(text) {
    const skillCategories = {
        'programming': ['programming', 'coding', 'development', 'software'],
        'web': ['web', 'frontend', 'backend', 'full-stack'],
        'mobile': ['mobile', 'ios', 'android', 'react native'],
        'database': ['database', 'sql', 'nosql', 'mongodb'],
        'cloud': ['cloud', 'aws', 'azure', 'gcp'],
        'devops': ['devops', 'docker', 'kubernetes', 'ci/cd'],
        'ai': ['machine learning', 'ai', 'artificial intelligence', 'data science'],
        'management': ['project management', 'agile', 'scrum', 'leadership']
    };

    const foundSkills = [];
    
    Object.entries(skillCategories).forEach(([category, keywords]) => {
        if (keywords.some(keyword => text.toLowerCase().includes(keyword))) {
            foundSkills.push(category);
        }
    });

    return foundSkills;
}

function extractExperienceLevel(text) {
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

function detectIndustry(text) {
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

// Helper functions for resume tailoring
function enhanceSkills(originalSkills, jobKeywords) {
    const enhancedSkills = [...originalSkills];
    
    jobKeywords.forEach(keyword => {
        if (!enhancedSkills.some(skill => 
            skill.toLowerCase().includes(keyword.toLowerCase())
        )) {
            enhancedSkills.push(keyword);
        }
    });

    return enhancedSkills;
}

function prioritizeSkills(originalSkills, jobSkills) {
    const prioritized = [];
    
    // Add job-relevant skills first
    jobSkills.forEach(jobSkill => {
        const matchingSkill = originalSkills.find(skill => 
            skill.toLowerCase().includes(jobSkill.toLowerCase())
        );
        if (matchingSkill) {
            prioritized.push(matchingSkill);
        }
    });

    // Add remaining skills
    originalSkills.forEach(skill => {
        if (!prioritized.includes(skill)) {
            prioritized.push(skill);
        }
    });

    return prioritized;
}

function enhanceExperience(originalExperience, jobRequirements) {
    return originalExperience.map(exp => ({
        ...exp,
        description: enhanceDescription(exp.description, jobRequirements)
    }));
}

function enhanceDescription(description, requirements) {
    let enhanced = description;
    
    requirements.forEach(req => {
        if (!enhanced.toLowerCase().includes(req.toLowerCase())) {
            enhanced += ` Experience with ${req}.`;
        }
    });
    
    return enhanced;
}

function enhanceSummary(originalSummary, analysis) {
    const industryContext = analysis.industry !== 'general' ? 
        ` in the ${analysis.industry} industry` : '';
    
    const roleContext = analysis.title ? 
        ` for ${analysis.title} positions` : '';
    
    return `${originalSummary}${industryContext}${roleContext}.`;
}

function generateLaTeXResume(resumeData) {
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
    {\\huge\\bfseries ${resumeData.fullName}} \\\\
    \\vspace{0.5em}
    ${resumeData.email} $|$ ${resumeData.phone || ''} $|$ ${resumeData.linkedin || ''}
\\end{center}

\\section{Professional Summary}
${resumeData.summary || 'Professional summary not provided.'}

\\section{Skills}
\\begin{itemize}[leftmargin=0.5in]
    ${resumeData.skills.map(skill => `\\item ${skill}`).join('\n    ')}
\\end{itemize}

\\section{Experience}
${resumeData.experience.map(exp => `
\\subsection{${exp.title} - ${exp.company}}
\\textit{${exp.duration}} \\\\
${exp.description}
`).join('\n')}

\\section{Education}
${resumeData.education.map(edu => `
\\subsection{${edu.degree} - ${edu.school}}
\\textit{${edu.year}}
`).join('\n')}

\\end{document}`;
}

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
    // This will open the popup automatically due to the manifest configuration
    console.log('Extension icon clicked');
});

// Handle tab updates to detect job pages
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        // Check if this is a job posting page
        const jobSites = [
            'linkedin.com', 'indeed.com', 'glassdoor.com', 'monster.com',
            'ziprecruiter.com', 'careerbuilder.com', 'angel.co', 'stackoverflow.com'
        ];
        
        const isJobSite = jobSites.some(site => tab.url.includes(site));
        
        if (isJobSite) {
            // Update the extension icon to indicate job page detected
            chrome.action.setIcon({
                tabId: tabId,
                path: {
                    "16": "icons/icon16-active.png",
                    "32": "icons/icon32-active.png",
                    "48": "icons/icon48-active.png",
                    "128": "icons/icon128-active.png"
                }
            });
        } else {
            // Reset to default icon
            chrome.action.setIcon({
                tabId: tabId,
                path: {
                    "16": "icons/icon16.png",
                    "32": "icons/icon32.png",
                    "48": "icons/icon48.png",
                    "128": "icons/icon128.png"
                }
            });
        }
    }
});
