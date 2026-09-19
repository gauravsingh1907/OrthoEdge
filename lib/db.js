import Dexie from "dexie";

// Create database
export const db = new Dexie("OAScreeningDB");

// Define database schema
db.version(1).stores({
  patients: "++id, abhaNumber",
});

db.version(2).stores({
  patients: "++id, abhaNumber, synced",
});

/**
 * Create a new patient record
 *
 * @param {Object} data
 * @returns {Promise<number>} newly created patient ID
 */
export async function createPatient(data) {
  const existing = await db.patients.where('abhaNumber').equals(data.abhaNumber).first();

  if (existing) {
    // Update existing patient's info + reset screening data for a new visit
    await db.patients.update(existing.id, {
      workerId: data.workerId,
      name: data.name,
      age: data.age,
      gender: data.gender,
      weight: data.weight,
      height: data.height,
      bmi: data.bmi,
      consent: data.consent ?? null,

      // Reset screening-specific fields for the new visit
      questionnaireAnswers: null,
      womacScore: null,
      gaitScore: null,
      combinedScore: null,

      timestamp: new Date(),
      synced: 0,
    });

    return existing.id;
  }

  // No existing record — create new, as before
  const patient = {
    workerId: data.workerId,
    name: data.name,
    age: data.age,
    gender: data.gender,
    weight: data.weight,
    height: data.height,
    bmi: data.bmi,
    abhaNumber: data.abhaNumber,
    consent: data.consent ?? null,
    questionnaireAnswers: null,
    womacScore: null,
    gaitScore: null,
    combinedScore: null,
    timestamp: new Date(),
    synced: 0,
  };

  const id = await db.patients.add(patient);
  return id;
}



/**
 * Update an existing patient
 *
 * Only the fields provided in dataToMerge are updated.
 * Existing fields remain unchanged.
 *
 * @param {number} id
 * @param {Object} dataToMerge
 * @returns {Promise<number>}
 */
export async function updatePatient(id, dataToMerge) {
  const updatedCount = await db.patients.update(id, dataToMerge);

  if (updatedCount === 0) {
    throw new Error(`Patient with id ${id} not found`);
  }

  return updatedCount;
}

/**
 * Get a single patient by ID
 *
 * @param {number} id
 * @returns {Promise<Object|undefined>}
 */
export async function getPatient(id) {
  return await db.patients.get(id);
}

/**
 * Get all patients
 *
 * @returns {Promise<Array>}
 */
export async function getAllPatients() {
  return await db.patients.toArray();
}