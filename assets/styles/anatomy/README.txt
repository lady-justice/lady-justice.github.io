Homepage layout (see .temp/homepage-anatomy-reference.md)

CSS load order
--------------
main.css begins with @import of each file below (tokens stay in main.css).

anatomy/
  social-proof.css   §3 Social proof strip
  lead-magnet.css    §6 Lead magnet (optional block)

Everything else (header, hero base, studio, cards, gallery, book, footer)
remains in assets/styles/main.css.

HTML
----
index.html uses <main class="page-main"> with sections in anatomy order:
  #site-top (header) → #hero → #social-proof → #about → #services →
  #lead-magnet → #content-mood → #book → footer

Dual classes: e.g. anatomy-hero + hero so existing styles keep working.
