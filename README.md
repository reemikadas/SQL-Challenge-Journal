# SQL Challenge Journal

## Description

SQL Challenge Journal is a collection of my SQL practice solutions. Each challenge is stored as an individual Markdown file containing the HackerRank problem statement, a link to the original challenge, and my SQL solution.

The repository is updated through the [SQL Notebook Publisher](https://sql-challenge-publisher.das-reemika.chatgpt.site/), a web app that imports public HackerRank challenge details, creates a consistent Markdown document, and commits it directly to this repository.

## Snap of SQL Notebook Publisher web app

[![SQL Notebook Publisher interface](assets/sql-challenge-publisher.jpg)](https://sql-challenge-publisher.das-reemika.chatgpt.site/)

## Step-by-step guide to use the web app

1. Open the [SQL Notebook Publisher](https://sql-challenge-publisher.das-reemika.chatgpt.site/).
2. In **Repository**, enter `reemikadas/SQL-Challenge-Journal`.
3. Keep **Branch** set to `main`.
4. Keep **Folder** set to `HackerRank_Challenges`.
5. Enter a fine-grained GitHub token that is restricted to this repository and has **Contents: Read and write** permission. The app uses the token only for the GitHub request and does not save it.
6. Paste the HackerRank problem link into **HackerRank challenge URL**.
7. Select **Import question**. The app imports the public challenge description and fills in the challenge number and title.
8. Review the imported question, then paste your accepted query into **SQL Solution #**. Update the SQL dialect if necessary.
9. Review the generated Markdown and filename. Files follow the format `<HackerRank Challenge #>_<Title>.md`, for example `12889_The_PADS.md`.
10. Select **Create & push Markdown**. If the filename already exists, enable **Replace the file if it already exists** only when you intentionally want to overwrite it.
11. Open the published file from the success link. Select **Clear challenge** to start the next problem while keeping the GitHub destination settings available.
