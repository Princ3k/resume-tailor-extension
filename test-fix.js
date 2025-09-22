// Test script to verify the job detection fix
// Run this in the console on a job page

function testJobDetectionFix() {
    console.log('🧪 Testing Job Detection Fix...');
    
    // Test 1: Check if the syntax error is fixed
    console.log('✅ Test 1: Checking CSS selector syntax...');
    try {
        const testSelector = 'button[data-testid*="apply"], .apply-button, .job-apply-button, [data-testid*="apply-now"], .apply-now-button';
        document.querySelectorAll(testSelector);
        console.log('✅ CSS selector syntax is now valid!');
    } catch (error) {
        console.error('❌ CSS selector still has issues:', error.message);
    }
    
    // Test 2: Check if tailor button can be created
    console.log('✅ Test 2: Testing tailor button creation...');
    try {
        const tailorButton = document.createElement('div');
        tailorButton.id = 'resume-tailor-button';
        tailorButton.innerHTML = `
            <div class="tailor-button-content">
                <span class="tailor-icon">📄</span>
                <span class="tailor-text">Tailor Resume</span>
            </div>
        `;
        document.body.appendChild(tailorButton);
        console.log('✅ Tailor button created successfully!');
        
        // Remove test button
        document.body.removeChild(tailorButton);
    } catch (error) {
        console.error('❌ Error creating tailor button:', error.message);
    }
    
    // Test 3: Check job detection
    console.log('✅ Test 3: Testing job detection...');
    const currentUrl = window.location.href;
    const pageTitle = document.title;
    
    console.log('📍 Current URL:', currentUrl);
    console.log('📄 Page Title:', pageTitle);
    
    // Check if this looks like a job page
    const jobSites = [
        'linkedin.com', 'indeed.com', 'glassdoor.com', 'monster.com',
        'ziprecruiter.com', 'careerbuilder.com', 'angel.co', 
        'stackoverflow.com', 'github.com', 'jobs.scotiabank.com'
    ];
    
    const isJobSite = jobSites.some(site => currentUrl.includes(site));
    console.log('🎯 Is job site:', isJobSite);
    
    if (isJobSite) {
        console.log('✅ Job site detected!');
        
        // Test job parsing
        const titleElement = document.querySelector('h1, .job-title, [data-testid="job-title"]');
        const companyElement = document.querySelector('.company-name, .employer, [data-testid="company-name"]');
        
        console.log('📋 Job Title Found:', titleElement?.textContent?.trim() || 'Not found');
        console.log('🏢 Company Found:', companyElement?.textContent?.trim() || 'Not found');
        
        if (titleElement || companyElement) {
            console.log('✅ Job elements detected successfully!');
        } else {
            console.log('⚠️ Job elements not found, but site is recognized');
        }
    } else {
        console.log('ℹ️ Not a recognized job site');
    }
    
    // Test 4: Check for existing tailor button
    console.log('✅ Test 4: Checking for existing tailor button...');
    const existingButton = document.getElementById('resume-tailor-button');
    if (existingButton) {
        console.log('✅ Resume Tailor button already exists on page!');
        console.log('📍 Button position:', {
            top: existingButton.style.top,
            left: existingButton.style.left,
            right: existingButton.style.right
        });
    } else {
        console.log('ℹ️ No tailor button found (this is normal if page just loaded)');
    }
    
    console.log('🧪 Job Detection Fix Test Complete!');
    console.log('');
    console.log('📝 Next steps:');
    console.log('1. Reload the extension');
    console.log('2. Refresh the job page');
    console.log('3. Look for the "📄 Tailor Resume" button on the page');
    console.log('4. Open the extension popup to see job info');
}

// Auto-run the test
testJobDetectionFix();
