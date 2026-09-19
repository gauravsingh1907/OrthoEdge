import { db } from "./db"

export async function syncAllPatients() {
  const unsynced = await db.patients.where('synced').equals(0).toArray()

  let successCount = 0
  let failCount = 0

  for (const patient of unsynced) {
    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          localId: patient.id,
          name: patient.name,
          age: patient.age,
          gender: patient.gender,
          weight: patient.weight,
          height: patient.height,
          bmi: patient.bmi,
          abhaNumber: patient.abhaNumber,
          questionnaireAnswers: patient.questionnaireAnswers,
          womacScore: patient.womacScore,
          gaitScore: patient.gaitScore,
          combinedScore: patient.combinedScore,
          consent: patient.consent ?? null,
          timestamp: patient.timestamp,
        }),
      })

      if (!res.ok) throw new Error(`Sync failed with status ${res.status}`)

      // "ok" and "skipped_stale" both mean there is nothing left to send
      await db.patients.update(patient.id, { synced: 1 })
      successCount++
    } catch (err) {
      console.error(`Failed to sync patient ${patient.id}:`, err)
      failCount++
    }
  }

  return { successCount, failCount, total: unsynced.length }
}