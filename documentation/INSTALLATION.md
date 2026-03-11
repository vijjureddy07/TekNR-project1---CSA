# Pure Fields - Installation Guide

Welcome to Pure Fields! This guide will help you set up the Local Farm & Community Supported Agriculture (CSA) website on your local machine or server.

---

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Quick Start](#quick-start)
3. [Project Structure](#project-structure)
4. [Running Locally](#running-locally)
5. [Deployment](#deployment)
6. [Troubleshooting](#troubleshooting)

---

## System Requirements

Before you begin, ensure your system meets the following requirements:

| Requirement | Details |
|-------------|---------|
| **Operating System** | Windows 10+, macOS 10.14+, or Linux (Ubuntu 18.04+) |
| **Web Browser** | Chrome 80+, Firefox 75+, Safari 13+, Edge 80+ |
| **Text Editor** | VS Code, Sublime Text, or any code editor |
| **Live Server** | VS Code Live Server extension or Python 3.x |

---

## Quick Start

### Option 1: Using VS Code (Recommended)

1. **Clone or Download the Project**
   ```bash
   # If using git
   git clone <repository-url>
   
   # Or download the ZIP file and extract it
   ```

2. **Open in VS Code**
   - Open VS Code
   - Go to `File > Open Folder`
   - Select the project folder

3. **Install Live Server Extension**
   - Go to `Extensions` (or press `Cmd/Ctrl + Shift + X`)
   - Search for "Live Server"
   - Click "Install" on the "Live Server" extension by Ritwick Dey

4. **Start the Server**
   - Right-click on `pages/public/index.html`
   - Select "Open with Live Server"
   - The website will open in your browser

### Option 2: Using Python

1. **Navigate to the Project Folder**
   ```bash
   cd "Local Farm or Community Supported Agriculture (CSA)"
   ```

2. **Start Python's Built-in Server**
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Or with Python 3 explicitly
   python3 -m http.server 8000
   ```

3. **Open in Browser**
   - Go to `http://localhost:8000/pages/public/index.html`

### Option 3: Using Node.js

1. **Install http-server**
   ```bash
   npm install -g http-server
   ```

2. **Start the Server**
   ```bash
   http-server . -p 8000
   ```

3. **Open in Browser**
   - Go to `http://localhost:8000/pages/public/index.html`

---

## Project Structure

```
Local Farm or Community Supported Agriculture (CSA)/
│
├── assets/
│   ├── css/
│   │   └── style.css          # Main stylesheet
│   ├── js/
│   │   └── main.js            # Main JavaScript file
│   ├── images/                # Website images
│   └── fonts/                 # Custom fonts (if any)
│
├── pages/
│   ├── public/
│   │   ├── index.html         # Main homepage
│   │   ├── home-page-2.html  # Alternative homepage
│   │   ├── about.html         # About us page
│   │   ├── products.html     # Products listing
│   │   ├── box-details.html  # Product details
│   │   ├── blog.html          # Blog listing
│   │   ├── blog-details.html # Blog post
│   │   ├── contact-us.html    # Contact form
│   │   └── cart.html          # Shopping cart
│   ├── auth/                 # Authentication pages
│   ├── dashboards/            # Admin & user dashboards
│   └── system/               # System files
│
├── documentation/
│   ├── INSTALLATION.md        # This file
│   └── CUSTOMIZATION.md       # Customization guide
│
├── robots.txt                # Search engine instructions
├── sitemap.xml               # XML sitemap
├── README.md                 # Project readme
└── TODO.md                   # Project tasks
```

---

## Running Locally

### Viewing Different Pages

To view different pages of the website:

1. **Home Page:** `http://localhost:8000/pages/public/index.html`
2. **About Page:** `http://localhost:8000/pages/public/about.html`
3. **Products:** `http://localhost:8000/pages/public/products.html`
4. **Contact:** `http://localhost:8000/pages/public/contact us.html`

### Using Dark Mode

The website includes a dark mode toggle in the navigation bar. You can also:
- Use keyboard shortcut: Not configured
- The mode persists using localStorage

### Using RTL Mode

For right-to-left languages (Arabic, Hebrew, etc.):
- Click the translation icon in the navigation bar
- The layout will switch to RTL mode

---

## Deployment

### Static Hosting Platforms

The Pure Fields website is a static HTML/CSS/JS site and can be deployed to any static hosting service:

#### Netlify (Free)
1. Create a Netlify account at netlify.com
2. Drag and drop your project folder to Netlify
3. Your site will be deployed instantly
4. Update the site URL in:
   - `sitemap.xml` (all URLs)
   - `robots.txt` (Host directive)
   - HTML files (canonical URLs)

#### Vercel (Free)
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the project directory
3. Follow the prompts to deploy

#### GitHub Pages (Free)
1. Push your code to a GitHub repository
2. Go to Settings > Pages
3. Select the main branch and save

### Updating URLs for Production

After deployment, update these files with your actual domain:

1. **sitemap.xml** - Update all `<loc>` URLs
2. **robots.txt** - Update the `Host` directive
3. **index.html** - Update the canonical URL in meta tags

---

## Troubleshooting

### Common Issues

#### 1. Images Not Loading
- Check that image paths are correct (e.g., `../../assets/images/`)
- Ensure images are in the correct folder

#### 2. CSS Not Applied
- Clear browser cache (Cmd/Ctrl + Shift + R)
- Check that the stylesheet link is correct
- Open browser developer tools (F12) to check for errors

#### 3. JavaScript Not Working
- Check browser console for errors
- Ensure JavaScript file is linked correctly
- Verify no syntax errors in main.js

#### 4. Live Server Not Working
- Check if another application is using the same port
- Try a different port: `python -m http.server 8080`
- Disable firewall temporarily to test

#### 5. Dark Mode Not Persisting
- Check that JavaScript is loading correctly
- Verify localStorage is not disabled
- Check browser console for errors

---

## Additional Resources

- [MDN Web Docs](https://developer.mozilla.org/) - HTML, CSS, JS documentation
- [Google Fonts](https://fonts.google.com/) - Font customization
- [Font Awesome](https://fontawesome.com/) - Icon library used
- [Material Icons](https://fonts.google.com/icons) - Google Material Icons

---

## Support

For additional help or questions:
- Check the README.md file
- Review the CUSTOMIZATION.md guide
- Open an issue on the project repository

---

**Last Updated:** January 2025
**Version:** 1.0.0

