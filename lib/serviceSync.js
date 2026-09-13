import { db } from './db'
import { supabase } from './supabase'

export async function syncAllPatients() {
  const unsynced = await db.patients.where('synced').equals(0).toArray()

  let successCount = 0
  let failCount = 0

  for (const patient of unsynced) {
    try {
      const { error } = await supabase
        .from('patients')
        .upsert({
          local_id: patient.id,
          worker_id: patient.workerId,
          name: patient.name,
          age: patient.age,
          gender: patient.gender,
          weight: patient.weight,
          height: patient.height,
          bmi: patient.bmi,
          abha_number: patient.abhaNumber,
          questionnaire_answers: patient.questionnaireAnswers,
          womac_score: patient.womacScore,
          gait_score: patient.gaitScore,
          combined_score: patient.combinedScore,
          timestamp: patient.timestamp,
        }, { onConflict: 'abha_number' })

      if (error) throw error

      await db.patients.update(patient.id, { synced: 1 })
      successCount++
    } catch (err) {
      console.error(`Failed to sync patient ${patient.id}:`, err)
      failCount++
    }
  }

  return { successCount, failCount, total: unsynced.length }
}