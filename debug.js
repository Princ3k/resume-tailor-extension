// Debug helper for Resume Tailor extension
// Add this script to help identify common issues

class ExtensionDebugger {
    constructor() {
        this.issues = [];
        this.init();
    }

    init() {
        console.log('🔍 Resume Tailor Debug Helper Started');
        this.checkManifest();
        this.checkPermissions();
        this.checkStorage();
        this.checkConsole();
    }

    checkManifest() {
        console.log('📋 Checking manifest...');
        
        // Check if manifest exists
        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getManifest) {
            const manifest = chrome.runtime.getManifest();
            console.log('✅ Manifest loaded:', manifest);
            
            // Check required permissions
            const requiredPermissions = ['storage', 'activeTab', 'scripting'];
            const manifestPermissions = manifest.permissions || [];
            
            requiredPermissions.forEach(permission => {
                if (manifestPermissions.includes(permission)) {
                    console.log(`✅ Permission granted: ${permission}`);
                } else {
                    console.error(`❌ Missing permission: ${permission}`);
                    this.issues.push(`Missing permission: ${permission}`);
                }
            });
        } else {
            console.error('❌ Chrome runtime not available');
            this.issues.push('Chrome runtime not available');
        }
    }

    checkPermissions() {
        console.log('🔐 Checking permissions...');
        
        if (typeof chrome !== 'undefined' && chrome.permissions) {
            chrome.permissions.getAll((permissions) => {
                console.log('📝 Current permissions:', permissions);
            });
        }
    }

    checkStorage() {
        console.log('💾 Checking storage...');
        
        if (typeof chrome !== 'undefined' && chrome.storage) {
            chrome.storage.local.get(null, (items) => {
                console.log('📦 Storage contents:', items);
                
                if (Object.keys(items).length === 0) {
                    console.log('ℹ️ Storage is empty (this is normal for new installations)');
                }
            });
        } else {
            console.error('❌ Chrome storage not available');
            this.issues.push('Chrome storage not available');
        }
    }

    checkConsole() {
        console.log('🖥️ Console check...');
        
        // Check for common JavaScript errors
        const originalError = console.error;
        console.error = (...args) => {
            this.issues.push(`Console error: ${args.join(' ')}`);
            originalError.apply(console, args);
        };
        
        // Check if required classes exist
        const requiredClasses = ['ResumeParser', 'TextExtractor', 'PDFParser'];
        requiredClasses.forEach(className => {
            if (window[className]) {
                console.log(`✅ Class available: ${className}`);
            } else {
                console.error(`❌ Class missing: ${className}`);
                this.issues.push(`Missing class: ${className}`);
            }
        });
    }

    testFileUpload() {
        console.log('📁 Testing file upload...');
        
        // Create a test file
        const testContent = `John Doe
john.doe@email.com
(555) 123-4567

PROFESSIONAL SUMMARY
Experienced software engineer with 5+ years of experience.

SKILLS
JavaScript, Python, React, Node.js, SQL

EXPERIENCE
Senior Software Engineer | Tech Company | 2020-Present
Led development of microservices architecture.

EDUCATION
Bachelor of Science in Computer Science | University | 2018`;

        const testFile = new File([testContent], 'test-resume.txt', { type: 'text/plain' });
        
        if (window.ResumeParser) {
            const parser = new ResumeParser();
            parser.parseFile(testFile)
                .then(result => {
                    console.log('✅ File upload test successful:', result);
                })
                .catch(error => {
                    console.error('❌ File upload test failed:', error);
                    this.issues.push(`File upload failed: ${error.message}`);
                });
        } else {
            console.error('❌ ResumeParser not available for testing');
            this.issues.push('ResumeParser not available');
        }
    }

    testJobDetection() {
        console.log('🎯 Testing job detection...');
        
        // Check if content script is running
        if (window.location.href.includes('linkedin.com') || 
            window.location.href.includes('indeed.com') ||
            window.location.href.includes('glassdoor.com')) {
            
            console.log('✅ On a job site');
            
            // Check if job detector is running
            if (window.JobPageDetector || document.getElementById('resume-tailor-button')) {
                console.log('✅ Job detection working');
            } else {
                console.error('❌ Job detection not working');
                this.issues.push('Job detection not working');
            }
        } else {
            console.log('ℹ️ Not on a job site (this is normal)');
        }
    }

    testAI() {
        console.log('🤖 Testing AI configuration...');
        
        if (typeof chrome !== 'undefined' && chrome.storage) {
            chrome.storage.local.get(['aiConfig'], (result) => {
                if (result.aiConfig && result.aiConfig.apiKey) {
                    console.log('✅ AI configured');
                    
                    // Test API key format
                    if (result.aiConfig.apiKey.startsWith('sk-')) {
                        console.log('✅ API key format looks correct');
                    } else {
                        console.error('❌ API key format incorrect');
                        this.issues.push('API key format incorrect');
                    }
                } else {
                    console.log('ℹ️ AI not configured (this is normal)');
                }
            });
        }
    }

    generateReport() {
        console.log('📊 Generating debug report...');
        
        const report = {
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent,
            issues: this.issues,
            recommendations: []
        };

        if (this.issues.length === 0) {
            report.recommendations.push('✅ No issues detected!');
        } else {
            if (this.issues.some(issue => issue.includes('permission'))) {
                report.recommendations.push('🔧 Check extension permissions in browser settings');
            }
            if (this.issues.some(issue => issue.includes('storage'))) {
                report.recommendations.push('🔧 Clear browser cache and reload extension');
            }
            if (this.issues.some(issue => issue.includes('ResumeParser'))) {
                report.recommendations.push('🔧 Check if all script files are loaded correctly');
            }
        }

        console.log('📋 Debug Report:', report);
        return report;
    }
}

// Auto-run debugger if in popup context
if (window.location.href.includes('popup.html') || window.location.href.includes('chrome-extension://')) {
    window.debugger = new ExtensionDebugger();
    
    // Add debug methods to window for manual testing
    window.testFileUpload = () => window.debugger.testFileUpload();
    window.testJobDetection = () => window.debugger.testJobDetection();
    window.testAI = () => window.debugger.testAI();
    window.generateReport = () => window.debugger.generateReport();
    
    console.log('🛠️ Debug methods available: testFileUpload(), testJobDetection(), testAI(), generateReport()');
}
