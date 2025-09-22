// Test script for job detection debugging
// Run this in the browser console on a job page to test detection

function testJobDetection() {
    console.log('🧪 Testing Job Detection...');
    console.log('📍 Current URL:', window.location.href);
    console.log('📄 Page Title:', document.title);
    
    // Test if content script is loaded
    if (window.JobPageDetector) {
        console.log('✅ JobPageDetector class found');
    } else {
        console.log('❌ JobPageDetector class not found');
    }
    
    // Test job indicators
    const jobKeywords = [
        'job', 'career', 'position', 'opening', 'employment',
        'apply now', 'job description', 'requirements', 'qualifications'
    ];
    
    const bodyText = document.body ? document.body.innerText.toLowerCase() : '';
    const title = document.title.toLowerCase();
    
    console.log('🔍 Job Keywords Found:');
    jobKeywords.forEach(keyword => {
        const inTitle = title.includes(keyword);
        const inBody = bodyText.includes(keyword);
        if (inTitle || inBody) {
            console.log(`  ✅ "${keyword}" - Title: ${inTitle}, Body: ${inBody}`);
        }
    });
    
    // Test common job site detection
    const jobSites = [
        'linkedin.com', 'indeed.com', 'glassdoor.com', 'monster.com',
        'ziprecruiter.com', 'careerbuilder.com', 'angel.co', 
        'stackoverflow.com', 'github.com', 'pwc.wd3.myworkdayjobs.com'
    ];
    
    const isJobSite = jobSites.some(site => window.location.href.includes(site));
    console.log('🌐 Job Site Detection:', isJobSite);
    
    // Test common job elements
    console.log('🔍 Testing Job Elements:');
    
    const titleSelectors = [
        'h1', 'h2', '.job-title', '.position-title', 
        '[data-testid*="job-title"]', '[data-automation-id*="job-title"]'
    ];
    
    const companySelectors = [
        '.company-name', '.employer', '.company', 
        '[data-testid*="company"]', '[data-automation-id*="company"]'
    ];
    
    const descriptionSelectors = [
        '.job-description', '.description', '.job-details', 
        '[data-testid*="description"]', '[data-automation-id*="description"]'
    ];
    
    console.log('  📋 Job Title Elements:');
    titleSelectors.forEach(selector => {
        const element = document.querySelector(selector);
        if (element && element.textContent.trim()) {
            console.log(`    ✅ ${selector}: "${element.textContent.trim()}"`);
        }
    });
    
    console.log('  🏢 Company Elements:');
    companySelectors.forEach(selector => {
        const element = document.querySelector(selector);
        if (element && element.textContent.trim()) {
            console.log(`    ✅ ${selector}: "${element.textContent.trim()}"`);
        }
    });
    
    console.log('  📝 Description Elements:');
    descriptionSelectors.forEach(selector => {
        const element = document.querySelector(selector);
        if (element && element.textContent.trim()) {
            const preview = element.textContent.trim().substring(0, 100) + '...';
            console.log(`    ✅ ${selector}: "${preview}"`);
        }
    });
    
    // Test if tailor button exists
    const tailorButton = document.getElementById('resume-tailor-button');
    if (tailorButton) {
        console.log('✅ Resume Tailor button found on page');
    } else {
        console.log('❌ Resume Tailor button not found on page');
    }
    
    // Test extension communication
    if (typeof chrome !== 'undefined' && chrome.runtime) {
        console.log('✅ Chrome extension API available');
        
        // Test message sending
        chrome.runtime.sendMessage({ action: 'test' }, (response) => {
            if (chrome.runtime.lastError) {
                console.log('❌ Extension communication error:', chrome.runtime.lastError.message);
            } else {
                console.log('✅ Extension communication working');
            }
        });
    } else {
        console.log('❌ Chrome extension API not available');
    }
    
    console.log('🧪 Job Detection Test Complete');
}

function testManualJobDetection() {
    console.log('🔧 Testing Manual Job Detection...');
    
    const tab = {
        url: window.location.href,
        title: document.title
    };
    
    // Simulate the manual detection logic
    let jobTitle = tab.title
        .replace(/\s*-\s*LinkedIn$/, '')
        .replace(/\s*\|\s*LinkedIn$/, '')
        .replace(/\s*-\s*Indeed$/, '')
        .replace(/\s*\|\s*Indeed$/, '')
        .replace(/\s*-\s*Glassdoor$/, '')
        .replace(/\s*\|\s*Glassdoor$/, '');
    
    console.log('📋 Manual Detection Results:');
    console.log('  Original Title:', tab.title);
    console.log('  Cleaned Title:', jobTitle);
    console.log('  URL:', tab.url);
    
    if (jobTitle.length < 5 || jobTitle.toLowerCase().includes('home') || jobTitle.toLowerCase().includes('search')) {
        const pathMatch = tab.url.match(/\/([^\/]+)(?:\/|$)/);
        if (pathMatch) {
            const pathPart = decodeURIComponent(pathMatch[1]).replace(/-/g, ' ');
            if (pathPart.length > 5 && !pathPart.includes('jobs') && !pathPart.includes('search')) {
                jobTitle = pathPart;
                console.log('  Title from URL:', jobTitle);
            }
        }
    }
    
    console.log('  Final Job Title:', jobTitle);
}

// Auto-run if in console
if (typeof window !== 'undefined') {
    console.log('🛠️ Job Detection Test Functions Loaded');
    console.log('📝 Available functions:');
    console.log('  - testJobDetection() - Test full job detection');
    console.log('  - testManualJobDetection() - Test manual detection logic');
    console.log('');
    console.log('🚀 Run testJobDetection() to start testing...');
}
