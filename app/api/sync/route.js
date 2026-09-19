import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";


const MAX_BODY_BYTES = 200_000;

function isNum(v) {
  return v === null || v === undefined || (typeof v === "number" && Number.isFinite(v));
}

export async function POST(request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }

  let p;
  try {
    p = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Validation
  if (typeof p.abhaNumber !== "string" || !/^\d{14}$/.test(p.abhaNumber)) {
    return NextResponse.json({ error: "Invalid ABHA number" }, { status: 400 });
  }
  if (typeof p.name !== "string" || p.name.length > 200) {
    return NextResponse.json({ error: "Invalid name" }, { status: 400 });
  }
  if (![p.age, p.weight, p.height, p.bmi, p.gaitScore, p.localId].every(isNum)) {
    return NextResponse.json({ error: "Invalid numeric field" }, { status: 400 });
  }
  const ts = new Date(p.timestamp);
  if (Number.isNaN(ts.getTime())) {
    return NextResponse.json({ error: "Invalid timestamp" }, { status: 400 });
  }

  // Don't let an older offline record overwrite a newer cloud record.
  const { data: existing, error: readError } = await supabaseAdmin
    .from("patients")
    .select("timestamp")
    .eq("abha_number", p.abhaNumber)
    .maybeSingle();

  if (readError) {
    console.error("Sync read error:", readError);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }

  if (existing?.timestamp && new Date(existing.timestamp) > ts) {
    return NextResponse.json({ status: "skipped_stale" });
  }

  const { error } = await supabaseAdmin.from("patients").upsert(
    {
      local_id: p.localId ?? null,
      worker_id: userId, // always the verified Clerk user, never client-supplied
      name: p.name,
      age: p.age ?? null,
      gender: p.gender ?? null,
      weight: p.weight ?? null,
      height: p.height ?? null,
      bmi: p.bmi ?? null,
      abha_number: p.abhaNumber,
      questionnaire_answers: p.questionnaireAnswers ?? null,
      womac_score: p.womacScore ?? null,
      gait_score: p.gaitScore ?? null,
      combined_score: p.combinedScore ?? null,
      timestamp: ts.toISOString(),
      synced_at: new Date().toISOString(),
    },
    { onConflict: "abha_number" },
  );

  if (error) {
    console.error("Sync upsert error:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }

  return NextResponse.json({ status: "ok" });
}