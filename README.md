# Resume Tailor - Browser Extension

A Chrome/Safari browser extension that automatically tailors your resume for job applications using AI-powered analysis.

## Features

- **🤖 AI-Powered Analysis**: Uses OpenAI GPT-4 to intelligently analyze job descriptions and company culture
- **🎯 Smart Resume Tailoring**: Automatically customizes your resume with relevant keywords, metrics, and achievements
- **🏢 Company Research**: AI analyzes company culture, values, and work style to align your resume
- **📊 Metrics Enhancement**: Adds quantifiable achievements and impact statements to your experience
- **💪 Strength Emphasis**: Highlights your strongest qualifications for each specific role
- **🤝 Soft Skills Matching**: Matches soft skills to company culture and role requirements
- **🔍 Automatic Job Detection**: Detects job postings on major job sites (LinkedIn, Indeed, Glassdoor, etc.)
- **📝 Resume Management**: Store and manage your resume data within the extension
- **📄 LaTeX Generation**: Generates professional LaTeX resumes with modern styling
- **⬇️ PDF Export**: Download tailored resumes as PDF files
- **⚡ One-Click Application**: Streamlined workflow for job applications

## Supported Job Sites

- LinkedIn
- Indeed
- Glassdoor
- Monster
- ZipRecruiter
- CareerBuilder
- AngelList
- Stack Overflow
- GitHub Jobs
- Generic job posting pages

## Installation

### Chrome
1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the extension folder
5. The extension will appear in your browser toolbar

### Safari
1. Download or clone this repository
2. Open Safari and go to Safari > Preferences > Extensions
3. Enable "Developer mode"
4. Click "Load unpacked" and select the extension folder

## Usage

1. **Configure AI**: Click the extension icon and set up your OpenAI API key for AI-powered features
2. **Set up your resume**: Fill in your resume information in the extension
3. **Navigate to a job posting**: Visit any supported job site
4. **Click "Tailor Resume"**: The extension will automatically detect the job and add a tailor button
5. **AI Analysis**: The AI will analyze the job description and company culture
6. **Customize options**: Choose which aspects of your resume to tailor
7. **Generate and download**: Get your AI-tailored resume as a PDF with detailed summary of changes

## AI Features

### What the AI Does:
- **Job Analysis**: Extracts keywords, requirements, skills, and company culture indicators
- **Company Research**: Analyzes company values, work style, and culture
- **Resume Enhancement**: Adds metrics, achievements, and impact statements
- **Keyword Optimization**: Naturally integrates job-relevant keywords
- **Strength Highlighting**: Emphasizes your strongest qualifications for the role
- **Soft Skills Matching**: Aligns soft skills with company culture
- **ATS Optimization**: Ensures resume passes Applicant Tracking Systems

### AI Configuration:
- Uses OpenAI GPT-4 for best results (GPT-3.5 Turbo also supported)
- Configurable creativity level (temperature setting)
- Local API key storage (never shared)
- Fallback to rule-based analysis if AI unavailable

## How It Works

1. **Job Detection**: The extension scans the current page for job posting indicators
2. **Content Analysis**: Extracts job title, company, location, and description
3. **AI Analysis**: Analyzes the job description for keywords, requirements, and skills
4. **Resume Tailoring**: Modifies your resume to match the job requirements
5. **LaTeX Generation**: Creates a professional LaTeX document
6. **PDF Export**: Compiles and downloads the tailored resume

## Privacy

- All data is stored locally in your browser
- No personal information is sent to external servers
- Job analysis is performed locally using pattern matching
- Resume data remains private and secure

## Development

### Project Structure
```
resume-tailor-extension/
├── manifest.json          # Extension configuration
├── popup.html             # Extension popup interface
├── popup.css              # Popup styling
├── popup.js               # Popup functionality
├── content.js             # Content script for job detection
├── content.css            # Content script styling
├── background.js          # Background service worker
├── icons/                 # Extension icons
├── templates/             # LaTeX templates
└── assets/                # Additional assets
```

### Building
No build process required - this is a vanilla JavaScript extension.

### Testing
1. Load the extension in developer mode
2. Navigate to job posting sites
3. Test the tailoring functionality
4. Verify PDF generation works correctly

## Future Enhancements

- Integration with LaTeX compilation services (Overleaf API)
- Advanced AI-powered resume optimization
- Multiple resume templates
- Integration with job application tracking
- Resume analytics and optimization suggestions
- Support for cover letter generation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and feature requests, please create an issue in the GitHub repository.
