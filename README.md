# SQL Challenge Publisher

A public web application for importing supported SQL challenges, combining them with MySQL solutions, generating consistent Markdown files, and committing those files directly to GitHub.

**Live application:** [SQL Challenge Publisher](https://sql-challenge-publisher.das-reemika.chatgpt.site)

## Features

- Start from prominent HackerRank and DataLemur buttons in the **01 / COMPOSE** workspace
- Import public SQL problem statements from HackerRank and DataLemur question URLs

- Name every challenge file from its challenge number and title, such as `19506_Weather_Observation_Station_1.md` or `31_Page_With_No_Likes.md`

- Preview the generated Markdown and filename before publishing
- Clear the current challenge while keeping the GitHub destination and token ready for the next one
- Commit one Markdown file per challenge to a selected GitHub repository and folder
- Protect existing files unless replacement is explicitly enabled
- Keep GitHub tokens ephemeral—the application does not save them

## How it works

1. Enter the destination repository as `username/repository`.
2. Enter the destination branch and optional folder.
3. Enter a fine-grained GitHub token scoped to that repository with **Contents: read and write** permission.
4. Under **01 / COMPOSE**, select **HackerRank** or **DataLemur**. The selected platform opens separately so the user signs in directly with that provider.
5. Choose and solve a SQL challenge, copy its individual URL from the address bar, and return to the publisher.
6. Paste the URL into **Challenge URL** and select **Import question**. Catalog pages are not supported.
7. Review the imported details and paste the accepted MySQL solution into **SQL Solution #**.
8. Review the generated Markdown and filename, then select **Create & push Markdown**.
9. Select **Clear challenge** before starting the next problem. Repository, branch, folder, token, and SQL dialect are preserved.

The importer reads public challenge text only. It does not access DataLemur premium questions, provider login details, private editors, or submissions. SQL solutions therefore remain a user-provided field.

## Run locally

Requirements: Node.js 22.13 or later.

```bash
npm install
npm run dev
```

Open the local URL shown in the terminal.

## Build

```bash
npm run build
```

The application uses server-side API routes for HackerRank imports and GitHub commits.

## Repository branches

- `main` stores published SQL challenge Markdown files.
- `WebApp` stores this application's source code.

In the application, use **Branch** `main` and select a provider-specific folder such as `HackerRank_Challenges` or `DataLemur_Challenges` to keep solutions organized.

## Deployment

The current production deployment is hosted with ChatGPT Sites.

GitHub Pages cannot host this project unchanged because Pages serves static files and cannot run the two server-side API routes. The repository can still be used as the source for an automatic deployment through a server-capable Git-connected host, such as Cloudflare Workers, after configuring that provider's deployment credentials.

## Security

- Use a fine-grained GitHub token restricted to the intended repository.
- Grant only **Contents: read and write** permission.
- Do not commit tokens to this repository or save them in browser password storage.
- Sign in to HackerRank and DataLemur only on their official websites; the publisher never requests or stores those login details.
