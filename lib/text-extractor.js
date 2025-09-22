// Text extraction utilities based on OpenResume's approach

class TextExtractor {
    constructor() {
        this.sectionKeywords = [
            'PROFILE', 'CONTACT', 'PERSONAL INFORMATION',
            'SUMMARY', 'OBJECTIVE', 'PROFESSIONAL SUMMARY',
            'EXPERIENCE', 'WORK EXPERIENCE', 'EMPLOYMENT',
            'EDUCATION', 'ACADEMIC BACKGROUND',
            'SKILLS', 'TECHNICAL SKILLS', 'CORE COMPETENCIES',
            'PROJECTS', 'PROJECT EXPERIENCE',
            'CERTIFICATIONS', 'LICENSES',
            'ACHIEVEMENTS', 'AWARDS',
            'PUBLICATIONS', 'RESEARCH'
        ];
    }

    extractResumeData(text) {
        console.log('Extracting resume data from text...');
        
        const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        console.log('Total lines:', lines.length);
        
        const resumeData = {
            fullName: '',
            email: '',
            phone: '',
            linkedin: '',
            summary: '',
            skills: [],
            experience: [],
            education: []
        };

        try {
            // Extract name (usually first line or most prominent name)
            resumeData.fullName = this.extractName(lines);
            console.log('Extracted name:', resumeData.fullName);

            // Extract contact information
            resumeData.email = this.extractEmail(text);
            resumeData.phone = this.extractPhone(text);
            resumeData.linkedin = this.extractLinkedIn(text);
            console.log('Extracted contact info:', { 
                email: resumeData.email, 
                phone: resumeData.phone, 
                linkedin: resumeData.linkedin 
            });

            // Extract summary/objective
            resumeData.summary = this.extractSummary(lines);
            console.log('Extracted summary length:', resumeData.summary.length);

            // Extract skills
            resumeData.skills = this.extractSkills(lines);
            console.log('Extracted skills:', resumeData.skills.length);

            // Extract experience
            resumeData.experience = this.extractExperience(lines);
            console.log('Extracted experience:', resumeData.experience.length);

            // Extract education
            resumeData.education = this.extractEducation(lines);
            console.log('Extracted education:', resumeData.education.length);

            // If we didn't extract much, provide a fallback
            if (!resumeData.fullName && !resumeData.email && resumeData.skills.length === 0) {
                console.log('Limited data extracted, providing fallback');
                resumeData.fullName = 'Resume Uploaded';
                resumeData.summary = 'Please review and edit the extracted information below.';
            }

            return resumeData;
        } catch (error) {
            console.error('Error extracting resume data:', error);
            // Return basic structure even if parsing fails
            return {
                fullName: 'Resume Uploaded',
                email: '',
                phone: '',
                linkedin: '',
                summary: 'Resume file uploaded successfully. Please review and edit the information.',
                skills: [],
                experience: [],
                education: []
            };
        }
    }

    extractName(lines) {
        // Look for name patterns - usually the first substantial line
        for (let i = 0; i < Math.min(5, lines.length); i++) {
            const line = lines[i];
            
            // Skip if it looks like a section header
            if (this.isSectionHeader(line)) continue;
            
            // Skip if it contains email, phone, or other contact info
            if (this.containsContactInfo(line)) continue;
            
            // Check if it looks like a name (2-4 words, mostly letters)
            if (this.looksLikeName(line)) {
                return line;
            }
        }
        
        return '';
    }

    extractEmail(text) {
        const emailRegex = /[\w.-]+@([\w-]+\.)+[\w-]{2,4}/g;
        const matches = text.match(emailRegex);
        return matches ? matches[0] : '';
    }

    extractPhone(text) {
        const phoneRegex = /(\+?\d{1,2}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?(\d{3}[-.\s]?\d{4})/g;
        const matches = text.match(phoneRegex);
        return matches ? matches[0] : '';
    }

    extractLinkedIn(text) {
        const linkedinRegex = /(linkedin\.com\/in\/[a-zA-Z0-9_-]+)/g;
        const matches = text.match(linkedinRegex);
        return matches ? matches[0] : '';
    }

    extractSummary(lines) {
        const summaryKeywords = ['SUMMARY', 'OBJECTIVE', 'PROFESSIONAL SUMMARY', 'PROFILE'];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].toUpperCase();
            
            if (summaryKeywords.some(keyword => line.includes(keyword))) {
                // Found summary section, collect following lines
                let summary = '';
                for (let j = i + 1; j < lines.length; j++) {
                    const nextLine = lines[j];
                    
                    // Stop if we hit another section
                    if (this.isSectionHeader(nextLine)) break;
                    
                    // Stop if line is too short (likely a section break)
                    if (nextLine.length < 10) break;
                    
                    summary += nextLine + ' ';
                }
                return summary.trim();
            }
        }
        
        return '';
    }

    extractSkills(lines) {
        const skillsKeywords = ['SKILLS', 'TECHNICAL SKILLS', 'CORE COMPETENCIES', 'TECHNOLOGIES'];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].toUpperCase();
            
            if (skillsKeywords.some(keyword => line.includes(keyword))) {
                // Found skills section, collect following lines
                let skillsText = '';
                for (let j = i + 1; j < lines.length; j++) {
                    const nextLine = lines[j];
                    
                    // Stop if we hit another section
                    if (this.isSectionHeader(nextLine)) break;
                    
                    skillsText += nextLine + ' ';
                }
                
                // Parse skills from text
                return this.parseSkillsFromText(skillsText);
            }
        }
        
        return [];
    }

    extractExperience(lines) {
        const experienceKeywords = ['EXPERIENCE', 'WORK EXPERIENCE', 'EMPLOYMENT', 'PROFESSIONAL EXPERIENCE'];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].toUpperCase();
            
            if (experienceKeywords.some(keyword => line.includes(keyword))) {
                // Found experience section, collect following lines
                const experienceLines = [];
                for (let j = i + 1; j < lines.length; j++) {
                    const nextLine = lines[j];
                    
                    // Stop if we hit another section
                    if (this.isSectionHeader(nextLine)) break;
                    
                    experienceLines.push(nextLine);
                }
                
                return this.parseExperienceFromLines(experienceLines);
            }
        }
        
        return [];
    }

    extractEducation(lines) {
        const educationKeywords = ['EDUCATION', 'ACADEMIC BACKGROUND', 'ACADEMIC QUALIFICATIONS'];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].toUpperCase();
            
            if (educationKeywords.some(keyword => line.includes(keyword))) {
                // Found education section, collect following lines
                const educationLines = [];
                for (let j = i + 1; j < lines.length; j++) {
                    const nextLine = lines[j];
                    
                    // Stop if we hit another section
                    if (this.isSectionHeader(nextLine)) break;
                    
                    educationLines.push(nextLine);
                }
                
                return this.parseEducationFromLines(educationLines);
            }
        }
        
        return [];
    }

    // Helper methods
    isSectionHeader(line) {
        const upperLine = line.toUpperCase();
        return this.sectionKeywords.some(keyword => upperLine.includes(keyword)) ||
               (line.length < 50 && /^[A-Z\s]+$/.test(line));
    }

    containsContactInfo(line) {
        return /@|\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|linkedin\.com/.test(line);
    }

    looksLikeName(line) {
        const words = line.split(/\s+/);
        return words.length >= 2 && words.length <= 4 && 
               words.every(word => /^[A-Za-z\.]+$/.test(word));
    }

    parseSkillsFromText(text) {
        // Split by common delimiters
        const skills = text.split(/[,;•\n\r]+/)
            .map(skill => skill.trim())
            .filter(skill => skill.length > 0 && skill.length < 50)
            .filter(skill => !this.isSectionHeader(skill));
        
        return [...new Set(skills)]; // Remove duplicates
    }

    parseExperienceFromLines(lines) {
        const experiences = [];
        let currentExp = null;
        
        for (const line of lines) {
            // Check if this looks like a job title/company line
            if (this.looksLikeJobTitle(line)) {
                if (currentExp) {
                    experiences.push(currentExp);
                }
                currentExp = this.parseJobTitleLine(line);
            } else if (currentExp && line.length > 10) {
                // Add to description
                currentExp.description += (currentExp.description ? '\n' : '') + line;
            }
        }
        
        if (currentExp) {
            experiences.push(currentExp);
        }
        
        return experiences;
    }

    parseEducationFromLines(lines) {
        const educations = [];
        let currentEdu = null;
        
        for (const line of lines) {
            // Check if this looks like a degree/school line
            if (this.looksLikeDegree(line)) {
                if (currentEdu) {
                    educations.push(currentEdu);
                }
                currentEdu = this.parseDegreeLine(line);
            } else if (currentEdu && line.length > 10) {
                // Add to description
                currentEdu.description += (currentEdu.description ? '\n' : '') + line;
            }
        }
        
        if (currentEdu) {
            educations.push(currentEdu);
        }
        
        return educations;
    }

    looksLikeJobTitle(line) {
        // Look for patterns like "Job Title | Company | Date" or "Job Title at Company"
        return /.*\s+(at|@|\||-)\s+.*|.*\|\s*.*\|\s*.*/.test(line) ||
               (line.length > 10 && line.length < 100 && !line.includes('@'));
    }

    looksLikeDegree(line) {
        const degreeKeywords = ['Bachelor', 'Master', 'PhD', 'Associate', 'Certificate', 'Diploma', 'Degree'];
        return degreeKeywords.some(keyword => line.includes(keyword));
    }

    parseJobTitleLine(line) {
        // Try to parse "Title | Company | Date" format
        const parts = line.split(/\s*\|\s*/);
        if (parts.length >= 2) {
            return {
                title: parts[0].trim(),
                company: parts[1].trim(),
                duration: parts[2] ? parts[2].trim() : '',
                description: ''
            };
        }
        
        // Try to parse "Title at Company" format
        const atMatch = line.match(/^(.+?)\s+(at|@)\s+(.+)$/);
        if (atMatch) {
            return {
                title: atMatch[1].trim(),
                company: atMatch[3].trim(),
                duration: '',
                description: ''
            };
        }
        
        // Fallback
        return {
            title: line,
            company: '',
            duration: '',
            description: ''
        };
    }

    parseDegreeLine(line) {
        // Try to parse degree information
        const parts = line.split(/\s*\|\s*/);
        if (parts.length >= 2) {
            return {
                degree: parts[0].trim(),
                school: parts[1].trim(),
                year: parts[2] ? parts[2].trim() : '',
                description: ''
            };
        }
        
        // Fallback
        return {
            degree: line,
            school: '',
            year: '',
            description: ''
        };
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TextExtractor;
} else {
    window.TextExtractor = TextExtractor;
}

