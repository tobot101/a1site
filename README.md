# A1 Clean Up Website

Marketing site for A1 Clean Up, hosted on Railway and connected to the public domain `www.a1cleanupservices.com`.

## Project status

- GitHub repo: `https://github.com/tobot101/a1site`
- Railway service: `a1site`
- Public site: `https://www.a1cleanupservices.com`
- Verified on April 15, 2026: the live site matches the current GitHub `main` branch content.

## Local development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the site:

   ```bash
   npm start
   ```

3. Open:

   ```text
   http://localhost:3000
   ```

## Project structure

- `server.js`: Express server for the static site and `/health` endpoint
- `public/index.html`: Landing page markup
- `public/styles.css`: Site styles
- `public/app.js`: Quote assistant interactions and lead submission

## Notes for future edits

- The website is currently a lightweight static Express app.
- Quote submissions are sent from the frontend to `https://quote.a1cleanupservices.com/api/leads`.
- This repo is now the local working copy to use for terminal edits, testing, and future updates.
