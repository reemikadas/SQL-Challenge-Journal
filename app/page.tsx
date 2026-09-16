"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Code2, Download, Eye, FileCode2, GitFork, Loader2, LockKeyhole, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Toaster } from "@/components/ui/sonner";

type FormState = { challengeNumber: string; challengeTitle: string; challengeUrl: string; question: string; sql: string; dialect: string; repository: string; branch: string; directory: string; token: string; overwrite: boolean };
const initialForm: FormState = { challengeNumber: "", challengeTitle: "", challengeUrl: "", question: "", sql: "", dialect: "MySQL", repository: "", branch: "main", directory: "hackerrank/sql", token: "", overwrite: false };

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "sql-challenge";
}

function markdownFor(form: FormState) {
  const heading = [form.challengeNumber && `Challenge ${form.challengeNumber}`, form.challengeTitle].filter(Boolean).join(": ") || "SQL Challenge";
  const source = form.challengeUrl ? `\n**Source:** [View challenge](${form.challengeUrl})\n` : "";
  return `# ${heading}\n${source}\n## Challenge\n\n${form.question.trim() || "Your challenge question will appear here."}\n\n## SQL Solution\n\n~~~sql\n${form.sql.trim() || "-- Your SQL solution will appear here."}\n~~~\n\n_Dialect: ${form.dialect.trim() || "SQL"}_\n`;
}

function FieldLabel({ id, children, optional = false }: { id: string; children: React.ReactNode; optional?: boolean }) {
  return <label htmlFor={id} className="field-label">{children}{optional && <span>Optional</span>}</label>;
}

export default function Home() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [imported, setImported] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const markdown = useMemo(() => markdownFor(form), [form]);
  const filename = `${slugify([form.challengeNumber && `challenge-${form.challengeNumber}`, form.challengeTitle].filter(Boolean).join("-"))}.md`;

  useEffect(() => {
    const modelContext = (document as Document & { modelContext?: { registerTool?: (tool: unknown, options?: { signal?: AbortSignal }) => void | Promise<void> } }).modelContext;
    if (!modelContext?.registerTool) return;
    const lifecycle = new AbortController();
    const tool = {
      name: "stage_sql_challenge",
      title: "Stage SQL challenge",
      description: "Fill the visible challenge and SQL solution editor so the user can review the generated Markdown before publishing.",
      inputSchema: {
        type: "object",
        properties: {
          challengeNumber: { type: "string" },
          challengeTitle: { type: "string" },
          challengeUrl: { type: "string" },
          question: { type: "string" },
          sql: { type: "string" },
          dialect: { type: "string" },
        },
        required: ["challengeNumber", "challengeTitle", "question", "sql"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: true },
      execute(input: unknown) {
        if (!input || typeof input !== "object") throw new Error("Challenge details are required.");
        const values = input as Record<string, unknown>;
        for (const key of ["challengeNumber", "challengeTitle", "question", "sql"]) {
          if (typeof values[key] !== "string" || !values[key]) throw new Error(`${key} is required.`);
        }
        setForm((current) => ({
          ...current,
          challengeNumber: values.challengeNumber as string,
          challengeTitle: values.challengeTitle as string,
          challengeUrl: typeof values.challengeUrl === "string" ? values.challengeUrl : "",
          question: values.question as string,
          sql: values.sql as string,
          dialect: typeof values.dialect === "string" && values.dialect ? values.dialect : current.dialect,
        }));
        setPublishedUrl(null);
        return { staged: true, filename: `${slugify(`challenge-${values.challengeNumber}-${values.challengeTitle}`)}.md` };
      },
    };
    try {
      void Promise.resolve(modelContext.registerTool(tool, { signal: lifecycle.signal })).catch(() => undefined);
    } catch {
      // Browsers without a complete WebMCP implementation still use the visible form.
    }
    return () => lifecycle.abort();
  }, []);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setPublishedUrl(null);
    if (key === "challengeUrl") setImported(false);
  }

  async function importChallenge() {
    if (!form.challengeUrl.trim()) return;
    setIsImporting(true);
    setImported(false);
    try {
      const response = await fetch("/api/import-hackerrank", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: form.challengeUrl }),
      });
      const result = (await response.json()) as { message?: string; title?: string; question?: string };
      if (!response.ok || !result.title || !result.question) throw new Error(result.message || "The challenge could not be imported.");
      setForm((current) => ({ ...current, challengeTitle: result.title!, question: result.question! }));
      setImported(true);
      setPublishedUrl(null);
      toast.success("Challenge question imported");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Import failed.");
    } finally {
      setIsImporting(false);
    }
  }

  async function publish() {
    setIsPublishing(true);
    setPublishedUrl(null);
    try {
      const response = await fetch("/api/publish", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...form, filename, markdown }) });
      const result = (await response.json()) as { message?: string; htmlUrl?: string };
      if (!response.ok) throw new Error(result.message || "GitHub could not publish this file.");
      setPublishedUrl(result.htmlUrl || null);
      toast.success("Markdown published to GitHub");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Publishing failed.");
    } finally {
      setIsPublishing(false);
    }
  }

  const ready = form.challengeNumber.trim() && form.challengeTitle.trim() && form.question.trim() && form.sql.trim() && form.repository.trim() && form.branch.trim() && form.token.trim();

  return (
    <main className="min-h-screen">
      <Toaster richColors position="top-right" />
      <header className="topbar">
        <div className="brand-mark" aria-hidden="true"><FileCode2 size={20} /></div>
        <div><p className="eyebrow">SQL notebook</p><h1>Challenge Publisher</h1></div>
        <div className="privacy-note"><LockKeyhole size={14} />Token used once, never saved</div>
      </header>

      <section className="repo-strip" aria-labelledby="destination-title">
        <div className="repo-heading"><GitFork size={18} /><div><h2 id="destination-title">GitHub destination</h2><p>Choose where each Markdown file should be committed.</p></div></div>
        <div className="repo-grid">
          <div><FieldLabel id="repository">Repository</FieldLabel><Input id="repository" placeholder="username/sql-solutions" value={form.repository} onChange={(e) => update("repository", e.target.value)} /></div>
          <div><FieldLabel id="branch">Branch</FieldLabel><Input id="branch" value={form.branch} onChange={(e) => update("branch", e.target.value)} /></div>
          <div><FieldLabel id="directory" optional>Folder</FieldLabel><Input id="directory" value={form.directory} placeholder="hackerrank/sql" onChange={(e) => update("directory", e.target.value)} /></div>
          <div><FieldLabel id="token">Fine-grained token</FieldLabel><Input id="token" type="password" autoComplete="off" placeholder="github_pat_…" value={form.token} onChange={(e) => update("token", e.target.value)} /><p className="token-help">Requires repository Contents: read and write.</p></div>
        </div>
      </section>

      <div className="workspace">
        <section className="editor-column" aria-labelledby="editor-title">
          <div className="section-heading"><div><p className="step-label">01 / Compose</p><h2 id="editor-title">Challenge + solution</h2></div><Code2 size={22} aria-hidden="true" /></div>
          <div className="title-grid">
            <div><FieldLabel id="challenge-number">Challenge #</FieldLabel><Input id="challenge-number" placeholder="01" value={form.challengeNumber} onChange={(e) => update("challengeNumber", e.target.value)} /></div>
            <div><FieldLabel id="challenge-title">Title</FieldLabel><Input id="challenge-title" placeholder="Challenges" value={form.challengeTitle} onChange={(e) => update("challengeTitle", e.target.value)} /></div>
          </div>
          <div>
            <FieldLabel id="challenge-url">HackerRank challenge URL</FieldLabel>
            <div className="import-row">
              <Input id="challenge-url" type="url" placeholder="https://www.hackerrank.com/challenges/.../problem" value={form.challengeUrl} onChange={(e) => update("challengeUrl", e.target.value)} />
              <Button variant="outline" className="import-button" disabled={!form.challengeUrl.trim() || isImporting} onClick={importChallenge}>
                {isImporting ? <><Loader2 className="animate-spin" /> Importing…</> : <><Download /> Import question</>}
              </Button>
            </div>
            <p className={imported ? "import-note imported" : "import-note"}>
              {imported ? "Question imported. Paste your accepted SQL solution below." : "The link supplies the public question; your private SQL stays in the editor for you to paste."}
            </p>
          </div>
          <div className="editor-block">
            <div className="editor-label-row"><FieldLabel id="question">Challenge question</FieldLabel><span>{form.question.length.toLocaleString()} chars</span></div>
            <Textarea id="question" className="question-area" placeholder="Paste the challenge description here…" value={form.question} onChange={(e) => update("question", e.target.value)} />
          </div>
          <div className="editor-block">
            <div className="editor-label-row"><FieldLabel id="sql">SQL Solution #</FieldLabel><Input aria-label="SQL dialect" className="dialect-input" value={form.dialect} onChange={(e) => update("dialect", e.target.value)} /></div>
            <Textarea id="sql" spellCheck={false} className="sql-area" placeholder="SELECT …" value={form.sql} onChange={(e) => update("sql", e.target.value)} />
          </div>
        </section>

        <aside className="preview-column" aria-labelledby="preview-title">
          <div className="section-heading"><div><p className="step-label">02 / Review</p><h2 id="preview-title">Markdown preview</h2></div><Eye size={22} aria-hidden="true" /></div>
          <div className="file-tab"><span className="file-dot" /><span>{filename}</span></div>
          <pre className="markdown-preview" aria-label="Generated Markdown"><code>{markdown}</code></pre>
          <div className="publish-panel">
            <label className="overwrite-row" htmlFor="overwrite"><Checkbox id="overwrite" checked={form.overwrite} onCheckedChange={(checked) => update("overwrite", checked === true)} />Replace the file if it already exists</label>
            <Button size="lg" className="publish-button" disabled={!ready || isPublishing} onClick={publish}>
              {isPublishing ? <><Loader2 className="animate-spin" /> Publishing…</> : <><Send /> Create &amp; push Markdown</>}
            </Button>
            {publishedUrl && <a className="success-link" href={publishedUrl} target="_blank" rel="noreferrer"><CheckCircle2 size={17} /> Open published file</a>}
          </div>
        </aside>
      </div>
    </main>
  );
}
