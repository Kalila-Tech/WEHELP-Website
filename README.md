# WE HELP — You Are Not Alone

A single-page website for **WE HELP**, offering 24/7 text and hotline support,
therapy connections, and a judgment-free space for anyone facing a mental
health struggle.

## File Structure

```
├── index.html            # All page sections (Home, About, Services, Gallery,
│                          #   Books, Contacts)
├── style.css              # External stylesheet, linked from index.html
├── wehelp-pictures/        # Image assets used in the site icon and gallery
└── README.md               # This file
```

## How to View

Open `index.html` directly in a browser, or serve the folder with a local dev
server (e.g. VS Code's Live Server extension) and browse to:

```
http://127.0.0.1:5500/<project-folder>/index.html
```

The page pulls in Google Fonts (Fraunces + Inter) and Font Awesome icons via a
kit script, so an internet connection is needed for those to load correctly.

## Design System

- **Colour:** soft purple (`#5B3E96` / `#382A5C`) for calm and trust, warm
  coral (`#E8927C` / `#D97B62`) as an accent
- **Type:** Fraunces (serif, headings), Inter (sans-serif, body)
- **Layout:** card-based grids, sticky header and nav, back-to-top button
- **Signature elements:** an animated "breathing" visual on the hero
  section, a swaying hug emoji in the logo, and a skip-link for keyboard
  users

## Page Sections

| Section | Purpose |
|---|---|
| Home | Hero introduction, mission statement, "What We Provide" list |
| About | Organisation background and mission |
| Services | 24/7 text line, hotline, and therapy support cards |
| Gallery | Photos representing the community and support offered |
| Books | Recommended reading on mental health topics |
| Contacts | Hotline/text/email details, emergency note, and a contact form |

## Changelog

All edits made to the repository should be logged below, most recent first.
Add an entry for every change, with enough detail that someone reviewing the
project can see exactly what changed and why.

---

### [Unreleased]

*No edits logged yet — add entries here as changes are made, following the
format below.*

**Entry format:**

```
**YYYY-MM-DD**
- Description of the change and the reasoning behind it.
```
