# Ami Home Care website

A static website (HTML, CSS and a little JavaScript) with one PHP file for the contact and job application forms. Built for one.com hosting.

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
| `.htaccess` | Server settings: redirects from the old site's addresses, 404 page, caching, security headers |
| `robots.txt`, `sitemap.xml` | For search engines |
| `favicon.ico`, `apple-touch-icon.png`, `site.webmanifest` | Browser and phone icons |
| `_backup-*` folders | Earlier versions. **Do not upload.** |

## Viewing it on your laptop

Open the folder in VS Code and use the **Live Server** extension (right-click `index.html` → Open with Live Server).

Live Server cannot run PHP, so the forms will say the message could not be sent. That is expected. They work once the site is on one.com.

## Editing

- **Text:** edit the HTML file for that page. The header, footer and icons are repeated at the top and bottom of every page, so a change to the menu or footer must be made in all 8 HTML files (VS Code: Edit → Replace in Files).
- **Photos:** each photo exists in four widths. To replace one, create the same four sizes with the same names (for example `hero-480.webp`, `hero-800.webp`, `hero-1200.webp`, `hero-1536.webp`), or ask a developer to regenerate them.
- **After editing CSS or JS:** change `?v=20261115` to today's date in the `<link>` and `<script>` lines of every page, so returning visitors get the new version.

## Going live on one.com

1. **Preview first:** upload everything except `_backup-*` folders and `README.md` into a folder called `new`, then open `amihomecare.com/new/`. Pages, photos and PDFs will work. (The 404 page and redirects only work at the top level.)
2. **Go live:** back up the current site, then upload the same files to the main website folder. Do not press Publish in the one.com Website Builder afterwards, as it would replace the new site.
3. **Test the forms:** send one test enquiry and one test application, then check they arrive at info@amihomecare.com (check the spam folder too). If nothing arrives, ask one.com support to confirm PHP email (`mail()`) is enabled for the domain.
5. **Turn on HTTPS redirect** in the one.com control panel if it isn't already on.
6. **Google:** submit `https://amihomecare.com/sitemap.xml` in Google Search Console, and update the website link on your Google Business Profile if needed.

The `.htaccess` file permanently redirects the old Website Builder addresses (`/our-services`, `/about-us`, `/vacancies`, the old policy pages and PDF links) to the new pages, so existing links and search results keep working. The Privacy Notice PDF itself refers to `/privacy-notice-for-service-users`, which now redirects to `privacy.html`.

If the site shows "Internal Server Error" right after uploading `.htaccess`, rename that file to `htaccess-disabled.txt` and contact one.com support.

## Analytics and cookies

The site currently sets no cookies and uses no analytics, so no cookie banner is shown. To add Google Analytics later, put the measurement ID in `ANALYTICS_ID` at the top of `js/main.js`. A consent banner then appears automatically, analytics only load after a visitor accepts, and a "Cookie settings" link appears in the footer. Update the "Using this website" section of `privacy.html` at the same time.

## If the CQC rating changes

The CQC rating is written by hand in three places: the CQC section and ratings box on `index.html`, the footer trust strip (all 8 pages) and `about.html` (Good, report published 28 May 2021). Update all of them if CQC publishes a new rating.

## Information still to confirm with Ami Home Care

- Description of **Help at Home Care**. The current wording is based on the practical tasks listed on the old homepage.
- More detail on **Night Sitting** and **Palliative Care**.
- **Field Manager** job description.
- **Funding** accepted (private, council, NHS, direct payments). This is not stated on the site yet.
- **Areas covered**: the site says Hounslow and nearby areas, with care teams across Hounslow, Hillingdon and Surrey.
- **Privacy wording** for website enquiries and job applicants, including how long enquiries are kept.
- Genuine **testimonials** with permission to publish, if wanted.
- Real **photos** of the team. The current photos are AI-generated illustrations and must not be presented as real staff or clients.
