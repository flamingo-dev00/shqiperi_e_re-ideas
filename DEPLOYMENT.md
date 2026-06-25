# Deployimi në Netlify

Ky projekt është konfiguruar për Netlify me Astro server-side rendering.

## 1. Publiko Apps Script si API publike

Në Google Apps Script:

1. Hap `Deploy` → `Manage deployments`.
2. Krijo ose ndrysho një deployment të tipit `Web app`.
3. Vendos `Execute as`: **Me**.
4. Vendos `Who has access`: **Anyone**.
5. Publiko versionin e ri dhe kopjo URL-në që mbaron me `/exec`.
6. Testoje në një dritare private:

   `APPS_SCRIPT_URL?format=json`

Duhet të shfaqet JSON me fushat `stats` dhe `ideas`, pa kërkuar hyrje në Google.
Sa herë ndryshon `Code.gs`, krijo një version të ri të deployment-it.

## 2. Konfiguro projektin në Netlify

Repository përmban `netlify.toml`, i cili vendos automatikisht:

- Base directory: `frontend`
- Build command: `npm run build`
- Publish directory: `dist`
- Node.js: `22`

Në Netlify shto Environment Variables:

   - `APPS_SCRIPT_API_URL`: URL-ja publike `/exec`.
   - `PUBLIC_FORM_URL`: URL-ja publike e Google Form.

Pastaj hap `Deploys` dhe zgjidh **Trigger deploy → Clear cache and deploy site**.

Faqja dhe `/api/ideas` ruhen në cache
për 30 sekonda, kështu që Apps Script nuk thirret për çdo vizitor.

## 3. Kontrolli pas deploy-it

Hap:

- `https://DOMENI-YT/api/ideas` — duhet të kthejë JSON.
- `https://DOMENI-YT/` — duhet të tregojë të njëjtat statistika dhe ide.

API-ja publikon vetëm idetë me status `APPROVED`. Nëse Apps Script kërkon hyrje
në Google ose kthen HTML në vend të JSON, frontend-i shfaq një gabim të qartë dhe
nuk e paraqet situatën si “zero ide”.
