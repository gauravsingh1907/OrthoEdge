"use client";

import { createPatient } from "@/lib/db";
import { useUser } from "@clerk/nextjs";
import { useLanguage } from "@/components/LanguageProvider";

import { useState, useEffect } from "react";

export default function PatientForm({ onComplete }) {
  const { user } = useUser();
  const { t } = useLanguage();

  const [bmi, setBmi] = useState("—");

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    weight: "",
    height: "",
    abhaNumber: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    if (!formData.weight || !formData.height) {
      setBmi("—");
      return;
    }

    const timer = setTimeout(() => {
      const calculatedBmi =
        Number(formData.weight) /
        (Number(formData.height) / 100) ** 2;

      setBmi(calculatedBmi.toFixed(1));
    }, 2000);

    return () => clearTimeout(timer);
  }, [formData.weight, formData.height]);

  const isFormComplete =
    formData.name.trim() &&
    formData.age &&
    formData.gender &&
    formData.weight &&
    formData.height &&
    formData.abhaNumber.trim().length === 14;

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const newId = await createPatient({
        workerId: user.id,
        name: formData.name.trim(),
        age: Number(formData.age),
        gender: formData.gender,
        weight: Number(formData.weight),
        height: Number(formData.height),
        bmi: Number(bmi),
        abhaNumber: formData.abhaNumber.trim(),
      });

      console.log("Patient created:", newId);
      onComplete(newId);
    } catch (error) {
      console.error("Failed to create patient:", error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-2xl mx-auto rounded-2xl bg-white p-5 shadow-sm sm:p-6"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {t("patient.title")}
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          {t("patient.description")}
        </p>
      </div>

      <div className="space-y-5">

        {/* Name */}
        <div>
          <label
            htmlFor="name"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            {t("patient.name")}
          </label>

          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            placeholder={t("patient.namePlaceholder")}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Age */}
        <div>
          <label
            htmlFor="age"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            {t("patient.age")}
          </label>

          <input
            id="age"
            name="age"
            type="number"
            min="0"
            value={formData.age}
            onChange={handleChange}
            placeholder={t("patient.agePlaceholder")}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Gender */}
        <div>
          <label
            htmlFor="gender"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            {t("patient.gender")}
          </label>

          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-base outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">
              {t("patient.selectGender")}
            </option>

            <option value="Male">
              {t("patient.male")}
            </option>

            <option value="Female">
              {t("patient.female")}
            </option>

            <option value="Other">
              {t("patient.other")}
            </option>
          </select>
        </div>

        {/* Weight + Height */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="weight"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              {t("patient.weight")} (kg)
            </label>

            <input
              id="weight"
              name="weight"
              type="number"
              min="0"
              step="0.1"
              value={formData.weight}
              onChange={handleChange}
              placeholder={t("patient.weightPlaceholder")}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label
              htmlFor="height"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              {t("patient.height")} (cm)
            </label>

            <input
              id="height"
              name="height"
              type="number"
              min="0"
              step="0.1"
              value={formData.height}
              onChange={handleChange}
              placeholder={t("patient.heightPlaceholder")}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        {/* BMI - Derived, not an input */}
        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              {t("patient.bmi")}
            </span>

            <span className="text-xl font-bold text-blue-700">
              {bmi}
            </span>
          </div>
        </div>

        {/* ABHA Number */}
        <div>
          <label
            htmlFor="abhaNumber"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            {t("patient.abhaNumber")}
          </label>

          <input
            id="abhaNumber"
            name="abhaNumber"
            type="text"
            inputMode="numeric"
            maxLength={14}
            value={formData.abhaNumber}
            onChange={(e) => {
              const digitsOnly = e.target.value
                .replace(/\D/g, "")
                .slice(0, 14);

              setFormData((prev) => ({
                ...prev,
                abhaNumber: digitsOnly,
              }));
            }}
            placeholder={t("patient.abhaPlaceholder")}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!isFormComplete}
          className="w-full rounded-xl bg-blue-600 px-5 py-3.5 text-base font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {t("common.continue")}
        </button>

      </div>
    </form>
  );
}