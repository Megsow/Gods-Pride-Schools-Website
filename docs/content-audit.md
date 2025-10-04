# Firebase Content Audit

The table below documents every dynamic binding in the site and the Firestore location that powers it. Paths follow the `collection/doc` notation used by the Firebase Web SDK.

| Page | Component | Firestore Source | Notes |
| --- | --- | --- | --- |
| All pages | Header logos & slogan | `settings/global` | `logos.left.url`, `logos.right.url`, `siteName`, and `tagline` feed the masthead. |
| All pages | Footer contact block | `settings/global` | Uses `contact.email`, `contact.phone`, `address`, `social.facebook`, `social.instagram`, and `footer.copyright`. |
| Home (`index.html`) | Intro banner | `settings/homepage` | `intro.title` and `intro.marquee`. |
| Home | Carousel | `media/homeCarousel` collection | Ordered by `order`; each item exposes `image.url`, `caption`, `description`. |
| Home | Announcements list | `announcements` collection | Ordered by `publishedAt desc`, limited to three cards. |
| Home | Testimonials slider | `testimonials` collection | Ordered by `priority desc`, limited to six entries. |
| About | Proprietor profile, mandate, vision, mission, values, entrepreneurship | `content/about` | Individual fields (`owner.*`, `mandate.*`, `vision.*`, `mission.*`, `values.*`, `entrepreneurship.*`). |
| Admissions | Hero copy & step cards | `content/admissions` | `hero.title`, `hero.intro`, and `steps` (HTML list). |
| Contact | Page heading & intro | `content/contact` | `heading` and `intro`. |
| News | Page heading & intro | `content/news` | `heading`, `intro`, and `announcements.heading`, `latest.heading`. |
| News | Featured announcements | `announcements` collection | Shared with the home page. |
| News | Latest news cards | `news` collection | Ordered by `publishedAt desc`, up to six cards. |
| Gallery | Section heading & description | `content/gallery` | `heading` and `intro`. |
| Gallery | Media grid | `media/gallery` collection | Sorted by optional `order`; items require `url`, optional `caption`. |
| Schools overview | Overview hero | `content/schools` | `overview` (HTML) for the lead copy. |
| Schools overview | Program cards | `content/schools` | `programs` (HTML) renders card content. |
| Nursery & Primary | Hero, overview, testimonials, contact CTA | `content/nurseryPrimary` | Fields: `hero`, `overview`, `testimonials`, `contact` (all HTML). |
| Secondary School | Hero, overview, testimonials, contact CTA | `content/secondary` | Fields mirror the nursery/primary structure. |

### Image & asset handling

- Carousel and gallery components expect documents in `media/*` collections containing at minimum a `url` field. Optional metadata fields (`alt`, `caption`, `description`, `order`) enhance rendering.
- Announcements, news, and testimonials collections may include nested `image` objects with `url`/`alt` keys and rich-text HTML (`body`) used inside the expandable panels.

### Fallback behaviour

Each dynamic binding preserves its initial static HTML as a fallback. If Firestore is unreachable or fields are missing, the site restores the original markup so visitors never encounter broken sections.
