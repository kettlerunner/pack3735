# Pack 3735 Website

This repository contains the source for the **Cub Scout Pack 3735** website.  It is a simple, static site composed of HTML, CSS and JavaScript files with no server side component.

## Project structure

- **index.html** – main landing page for the website.
- **css/** – stylesheets used across the site.
- **js/** – JavaScript that powers interactive elements.
- **img/** – images and icons.
- **assets/** – fonts and other static resources.
- **partials/** – HTML snippets that are included on multiple pages.
- **games/** – browser‑based learning games for scouts.
- **pack_3735_flat_site_index.html** – standalone copy of the site for download or offline use.

## Getting started

Because the project is entirely static, it does not require any build step or runtime dependencies.  You can preview the site by opening `index.html` in your browser.

To serve the site locally you can use a simple HTTP server:

```bash
python3 -m http.server
```

Then visit [http://localhost:8000](http://localhost:8000) in your browser.

## Contributing

1. Fork and clone the repository.
2. Create a feature branch for your changes.
3. Make edits and verify that the site loads correctly in a browser.
4. Run tests (if any) and ensure the linter or build steps pass.
5. Commit and open a pull request.

## Licensing

No explicit license file is provided.  Please contact the Pack 3735 leadership before reusing content.

