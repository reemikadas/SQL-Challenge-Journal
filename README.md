# SQL Challenge Journal

A small web application for turning SQL practice problems into consistent Markdown files and committing them directly to GitHub.

**Live application:** [SQL Challenge Publisher](https://sql-challenge-publisher.das-reemika.chatgpt.site)

## Features

- Import the public problem statement from a HackerRank challenge URL
- Name each Markdown file from the HackerRank challenge number and title, such as `19506_Weather_Observation_Station_1.md`
- Add a challenge number, SQL dialect, and accepted SQL solution
- Preview the generated Markdown and filename before publishing
- Clear the current challenge while keeping the GitHub destination and token ready for the next one
- Commit one Markdown file per challenge to a selected GitHub repository and folder
- Protect existing files unless replacement is explicitly enabled
- Keep GitHub tokens ephemeral—the application does not save them

## How it works

1. Enter the destination repository as `username/repository`.
2. Enter a fine-grained GitHub token scoped to that repository with **Contents: read and write** permission.
3. Paste a HackerRank problem URL and select **Import question**. The challenge number and title become a filename such as `19506_Weather_Observation_Station_1.md`.
4. Paste the accepted SQL solution.
5. Review the Markdown and select **Create & push Markdown**.
6. Select **Clear challenge** before starting the next problem. Repository, branch, folder, token, and SQL dialect are preserved.

HackerRank problem links expose the public challenge text but not the contents of a user's private editor or submission. SQL solutions therefore remain a user-provided field.

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

- `main` stores the published SQL challenge Markdown files in `HackerRank_Challenges/`.
- `WebApp` stores this application's source code.

In the application, keep **Branch** set to `main` and **Folder** set to `HackerRank_Challenges` so new solutions are added beside the existing ones.

## Deployment

The current production deployment is hosted with ChatGPT Sites.

GitHub Pages cannot host this project unchanged because Pages serves static files and cannot run the two server-side API routes. The repository can still be used as the source for an automatic deployment through a server-capable Git-connected host, such as Cloudflare Workers, after configuring that provider's deployment credentials.

## Security

- Use a fine-grained GitHub token restricted to the intended repository.
- Grant only **Contents: read and write** permission.
- Do not commit tokens to this repository or save them in browser password storage.
