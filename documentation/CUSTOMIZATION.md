# Pure Fields - Customization Guide

This guide will help you customize the Pure Fields website for your own farm or business.

---

## Table of Contents

1. [Branding & Colors](#branding--colors)
2. [Typography](#typography)
3. [Images](#images)
4. [Content Updates](#content-updates)
5. [Adding New Pages](#adding-new-pages)
6. [Features Configuration](#features-configuration)
7. [SEO Settings](#seo-settings)
8. [Performance Tips](#performance-tips)

---

## Branding & Colors

### Changing the Primary Color

The website uses CSS variables for easy color customization. Open `assets/css/style.css` and locate the `:root` section at the top:

```css
:root {
    /* Primary Color Palette */
    --primary: #31695A;        /* Main brand color - CHANGE THIS */
    --primary-light: #4a8b78; /* Lighter shade for hover states */
    --primary-dark: #000000;  /* Darker shade for emphasis */
    --secondary: #4a8b78;     /* Secondary accent color */
    
    /* ... other variables ... */
}
```

**To change the primary color:**
1. Replace `#31695A` with your brand color (hex code)
2. Generate a lighter shade for `--primary-light` (use a color tool like https://hexcolor.co)
3. The buttons, links, and accents will automatically update

### Example: Blue Brand Color
```css
--primary: #2563EB;        /* Your brand blue */
--primary-light: #3B82F6;  /* Lighter blue */
--secondary: #1D4ED8;      /* Darker blue */
```

### Dark Mode Colors

If you want different colors for dark mode, find the `html.dark` section at the bottom of the CSS file:

```css
html.dark {
    /* Dark mode specific colors */
    --bg-light: #0b0f14;
    --text-primary: #f9fafb;
    /* ... */
}
```

---

## Typography

### Changing Fonts

The website uses two font families:
- **Headings:** Lora (serif)
- **Body:** Poppins (sans-serif)

To change fonts:

1. **Update Google Fonts link** in each HTML file (in the `<head>` section):
```html
<link href="https://fonts.googleapis.com/css2?family=YOUR-FONT:wght@400;500;600;700&display=swap" rel="stylesheet">
```

2. **Update CSS variables** in `style.css`:
```css
:root {
    --font-family: 'Your Font', sans-serif;
    --font-heading: 'Your Heading Font', serif;
}
```

### Recommended Font Pairings

| Style | Heading Font | Body Font |
|-------|--------------|-----------|
| Modern | Poppins | Poppins |
| Classic | Playfair Display | Lato |
| Minimal | Montserrat | Open Sans |
| Rustic | Merriweather | Source Sans Pro |

---

## Images

### Replacing Images

1. **Add your images** to `assets/images/`
2. **Update image paths** in HTML files:
```html
<!-- Old path -->
<img src="../../assets/images/old-image.jpg">

<!-- New path -->
<img src="../../assets/images/your-new-image.jpg">
```

### Image Best Practices

- **Use WebP format** for better performance (convert using https://squoosh.app)
- **Optimize file sizes** - keep images under 200KB when possible
- **Use descriptive alt text** for accessibility
- **Lazy load** images below the fold:
```html
<img src="image.jpg" loading="lazy" alt="Description">
```

### Recommended Image Sizes

| Section | Recommended Size | Aspect Ratio |
|---------|------------------|--------------|
| Hero | 1920x1080 | 16:9 |
| About Images | 600x400 | 3:2 |
| Product Cards | 400x400 | 1:1 |
| Blog Thumbnails | 400x300 | 4:3 |

---

## Content Updates

### Updating Business Information

Update your business details in these locations:

#### 1. Contact Information (in each HTML file)
```html
<!-- Footer section -->
<a href="tel:+1-555-123-4567">+1-555-123-4567</a>
<a href="mailto:hello@purefields.com">hello@purefields.com</a>
```

#### 2. Business Address (JSON-LD in index.html)
```html
<script type="application/ld+json">
{
    "address": {
        "@type": "PostalAddress",
        "streetAddress": "123 Farm Road",
        "addressLocality": "Farmville",
        "addressRegion": "CA",
        "postalCode": "12345"
    },
    "telephone": "+1-555-123-4567"
}
</script>
```

#### 3. Social Media Links (in footer)
```html
<a href="https://facebook.com/yourfarm" aria-label="Follow us on Facebook">
    <i class="fab fa-facebook-f"></i>
</a>
```

### Updating Text Content

Simply edit the text between HTML tags:
```html
<!-- Before -->
<h1>Welcome to Our Farm</h1>

<!-- After -->
<h1>Welcome to Green Acres Farm</h1>
```

---

## Adding New Pages

### Template for New Pages

Create a new HTML file based on this structure:

```html
<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- SEO Meta Tags -->
    <meta name="description" content="Your page description">
    <title>Your Page Title | Pure Fields</title>
    
    <!-- Fonts & Icons -->
    <link href="https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&family=Poppins:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
    
    <!-- Styles -->
    <link rel="stylesheet" href="../../assets/css/style.css">
</head>
<body>
    <!-- Skip Link -->
    <a href="#main-content" class="skip-link">Skip to main content</a>
    
    <!-- Navigation (copy from existing pages) -->
    <nav class="site-nav">...</nav>
    
    <!-- Main Content -->
    <main id="main-content">
        <!-- Your content here -->
    </main>
    
    <!-- Footer (copy from existing pages) -->
    <footer class="farm-footer">...</footer>
    
    <script src="../../assets/js/main.js"></script>
</body>
</html>
```

---

## Features Configuration

### Dark Mode

Dark mode is enabled by default. To customize:
- Toggle button is in the navigation
- Colors are defined in CSS under `html.dark`
- State is saved in localStorage

### RTL (Right-to-Left) Support

RTL support is included. To add RTL styles:
1. Create `assets/css/rtl.css` for RTL-specific styles
2. The JavaScript already handles the direction toggle
3. Add the stylesheet to HTML when needed:
```html
<link rel="stylesheet" href="../../assets/css/rtl.css">
```

### Newsletter Form

The newsletter form is pre-configured with validation. To customize:
- Error messages are in `assets/js/main.js`
- Success message text can be modified there
- Email regex pattern can be updated for different formats

---

## SEO Settings

### Updating Meta Tags

In each HTML file's `<head>` section, update:

```html
<!-- Basic Meta Tags -->
<meta name="description" content="Your unique description">
<meta name="keywords" content="relevant, keywords, here">
<link rel="canonical" href="https://yourdomain.com/page">

<!-- Open Graph (Facebook) -->
<meta property="og:title" content="Your Title">
<meta property="og:description" content="Your Description">
<meta property="og:image" content="https://yourdomain.com/image.jpg">
<meta property="og:url" content="https://yourdomain.com/page">

<!-- Twitter -->
<meta property="twitter:title" content="Your Title">
<meta property="twitter:description" content="Your Description">
<meta property="twitter:image" content="https://yourdomain.com/image.jpg">
```

### Updating Structured Data

Update the JSON-LD in `index.html`:

```html
<script type="application/ld+json">
{
    "@type": "LocalBusiness",
    "name": "Your Farm Name",
    "description": "Your description",
    "url": "https://yourdomain.com",
    "telephone": "+1-555-123-4567",
    "address": {
        "streetAddress": "Your Street Address",
        "addressLocality": "Your City",
        "addressRegion": "Your State",
        "postalCode": "Your ZIP"
    }
}
</script>
```

### Updating Sitemap

Edit `sitemap.xml` with:
- Your actual domain URLs
- Appropriate change frequencies
- Last modified dates

---

## Performance Tips

### Quick Wins

1. **Compress Images** - Use WebP format
2. **Minify CSS/JS** - Use tools like https://cssminifier.com
3. **Enable Caching** - Configure on your hosting server
4. **Use Lazy Loading** - Already implemented for below-fold images

### Image Optimization Script

If you have Node.js installed, you can optimize images:

```bash
# Install image optimization tools
npm install -g imagemin-webp

# Convert images to WebP
imagemin-webp assets/images/*.jpg --output assets/images/
```

---

## Browser Support

The website supports all modern browsers:
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

Internet Explorer is not supported.

---

## Need Help?

- Check INSTALLATION.md for setup help
- Review the TODO.md for planned features
- Check browser console (F12) for any errors

---

**Last Updated:** January 2025
**Version:** 1.0.0

