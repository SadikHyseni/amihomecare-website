# Ami Home Care website

A static website (HTML, CSS and a little JavaScript) with one PHP file for the contact and job application forms. Built for one.com hosting.

**Live since 22 November 2026** at https://www.amihomecare.com. GitHub copy: `SadikHyseni/ami-home-care`.

## What's in this folder

| File or folder | What it is |
|---|---|
| `index.html` | Home page |
| `services.html` | Our Services (all 9 services, each with its own section) |
| `about.html` | About Us, directors, CQC registration details, areas covered |
| `careers.html` | Vacancies and the job application form |
| `contact.html` | Contact details and the care enquiry form |
| `policies.html` | Policies and documents (PDF links and on-page preview) |
| `carbon-reduction-plan.html` | Carbon Reduction Plan summary and signed PDF. **This exact address is quoted in the signed documents and the Hounslow tender. Do not rename it.** |
| `net-zero-policy.html` | Net Zero and Environmental Sustainability Policy summary and signed PDF. **Same: do not rename.** |
| `privacy.html` | Summary of the Privacy Notice, plus how the website handles enquiries |
| `404.html` | "Page not found" page |
| `send.php` | Emails form submissions to info@amihomecare.com, with spam protection |
| `css/styles.css` | All styling. Brand colours are at the top (`--plum`, `--berry`, `--stone`) |
| `js/main.js` | Menu, forms, PDF preview and the optional analytics consent banner |
| `js/vendor/` | pdf.js (used only when someone clicks "Preview on this page") |
| `img/` | Photos in several sizes (`name-480.webp`, `-800`, `-1200`, full size), social image, icons, and `logo-trimmed.png` (the official logo with its empty margins cropped, used in the header and footer) |
| `docs/` | The three policy PDFs. Tender Appendix 9 must never be put here. |
| `.htaccess` | Server settings: https redirect, hides the old-site backup, redirects from the old site's addresses, 404 page, caching, security headers |
| `robots.txt`, `sitemap.xml` | For search engines |
| `favicon.ico`, `apple-touch-icon.png`, `site.webmanifest` | Browser and phone icons |
| `_backup-*` folders | Earlier versions. **Do not upload.** |

## Viewing it on your laptop

Open the folder in VS Code and use the **Live Server** extension (right-click `index.html` → Open with Live Server).

Live Server cannot run PHP, so the forms will say the message could not be sent. That is expected. They work once the site is on
