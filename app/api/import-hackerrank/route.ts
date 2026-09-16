import { NextResponse } from "next/server";

type HackerRankChallenge = {
  name?: string;
  problem_statement?: string;
  input_format?: string;
  constraints?: string;
  output_format?: string;
  difficulty_name?: string;
};

function meaningful(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function parseChallengeUrl(rawUrl: string) {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new Error("Paste a complete HackerRank challenge URL.");
  }

  if (url.protocol !== "https:" || !["hackerrank.com", "www.hackerrank.com"].includes(url.hostname.toLowerCase())) {
    throw new Error("Only public hackerrank.com challenge links are supported.");
  }

  const segments = url.pathname.split("/").filter(Boolean);
  if (segments[0] === "challenges" && segments[1]) {
    return { contest: "master", slug: segments[1] };
  }
  if (segments[0] === "contests" && segments[1] && segments[2] === "challenges" && segments[3]) {
    return { contest: segments[1], slug: segments[3] };
  }
  throw new Error("This does not look like a HackerRank challenge problem link.");
}

export async function POST(request: Request) {
  let rawUrl = "";
  try {
    const body = (await request.json()) as { url?: unknown };
    rawUrl = typeof body.url === "string" ? body.url.trim() : "";
  } catch {
    return NextResponse.json({ message: "The request was not valid JSON." }, { status: 400 });
  }

  let challenge: ReturnType<typeof parseChallengeUrl>;
  try {
    challenge = parseChallengeUrl(rawUrl);
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Invalid HackerRank URL." }, { status: 400 });
  }

  const endpoint = `https://www.hackerrank.com/rest/contests/${encodeURIComponent(challenge.contest)}/challenges/${encodeURIComponent(challenge.slug)}`;
  let response: Response;
  try {
    response = await fetch(endpoint, {
      headers: { accept: "application/json", "user-agent": "sql-challenge-publisher" },
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    return NextResponse.json({ message: "HackerRank did not respond. Try again shortly." }, { status: 502 });
  }

  if (!response.ok) {
    return NextResponse.json({ message: response.status === 404 ? "That public challenge was not found." : "HackerRank could not provide this challenge." }, { status: 502 });
  }

  const payload = (await response.json().catch(() => null)) as { status?: boolean; model?: HackerRankChallenge } | null;
  const model = payload?.model;
  if (!payload?.status || !model || !meaningful(model.name) || !meaningful(model.problem_statement)) {
    return NextResponse.json({ message: "HackerRank returned an incomplete challenge." }, { status: 502 });
  }

  const sections = [model.problem_statement.trim()];
  if (meaningful(model.input_format)) sections.push(`### Input Format\n\n${model.input_format.trim()}`);
  if (meaningful(model.constraints)) sections.push(`### Constraints\n\n${model.constraints.trim()}`);
  if (meaningful(model.output_format)) sections.push(`### Output Format\n\n${model.output_format.trim()}`);

  return NextResponse.json({
    title: model.name.trim(),
    question: sections.join("\n\n"),
    difficulty: meaningful(model.difficulty_name) ? model.difficulty_name.trim() : null,
  });
}
