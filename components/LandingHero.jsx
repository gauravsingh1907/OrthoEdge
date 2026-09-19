"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { useLanguage } from "@/components/LanguageProvider";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function LandingHero() {
  const { t, language, changeLanguage } = useLanguage();

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-[#0B132B]">
      {/* Desktop (1032px+): lab image + navy takeover */}
      <div className="absolute inset-0 hidden min-[1032px]:block">
        <Image
          src="/assets/lab_interior.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="scale-105 object-cover object-left"
        />
        {/* Deep navy takeover on the knee side */}
        <div className="absolute inset-0 bg-linear-to-r from-transparent from-40% via-[#0B132B]/85 via-60% to-[#0B132B]" />
        {/* Readability wash behind the text */}
        <div className="absolute inset-0 bg-linear-to-r from-white/70 via-white/10 to-transparent" />
      </div>

      {/* Below 1032px: white and navy radial theme (no images) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_25%,#dce8f5_0%,#c3d5ea_25%,#7f9fc9_50%,#274a86_75%,#0B132B_100%)] min-[1032px]:hidden" />

      {/* Navbar */}
<header className="relative z-20 flex w-full items-center justify-between px-4 py-5 sm:px-8 min-[1032px]:px-14">
        <Link href="/" className="flex items-center gap-2">
          <img
            src="/favicon.ico"
            alt="OrthoEdge"
            className="h-9 w-9 rounded-lg"
          />
          <span className="text-xl hidden md:flex font-bold text-[#0B1F4B]">OrthoEdge</span>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => changeLanguage(language === "en" ? "hi" : "en")}
            aria-label={t("language.select")}
            className="rounded-lg bg-white/70 px-3 py-2 text-sm font-medium text-slate-900 transition hover:bg-white min-[1032px]:bg-transparent min-[1032px]:text-slate-200 min-[1032px]:hover:bg-white/10"
          >
            {language === "en" ? "हिन्दी" : "English"}
          </button>

          <Link
            href="/signup"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            {t("home.signUp")}
          </Link>

          <Link
            href="/login"
            className="rounded-lg border border-slate-900/40 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-white min-[1032px]:border-slate-500 min-[1032px]:bg-transparent min-[1032px]:text-slate-100 min-[1032px]:hover:bg-white/10"
          >
            {t("home.login")}
          </Link>
        </nav>
      </header>

      {/* Main grid */}
            <div className="relative z-10 mx-auto grid min-h-[calc(100vh-80px)] max-w-7xl grid-cols-1 items-center gap-8 px-4 pb-12 sm:px-8 min-[1032px]:h-[calc(100vh-80px)] min-[1032px]:grid-cols-2">
        {/* Left: text */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
          className="max-w-xl py-8 min-[1032px]:py-0"
        >
          <motion.h1
            variants={fadeUp}
            className="text-5xl font-black uppercase leading-[1.05] tracking-tight text-[#0B1F4B] sm:text-6xl xl:text-7xl"
          >
            Precision.
            <br />
            Motion.
            <br />
            Mobility.
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mt-6 max-w-md text-base font-medium leading-relaxed text-[#1E293B] sm:text-lg"
          >
            {t("home.heroSubtitle")}
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center"
          >
            <Link
              href="/signup"
              className="rounded-xl border-2 border-[#0B1F4B] bg-white/60 px-6 py-3 text-center font-semibold text-[#0B1F4B] transition hover:bg-[#0B1F4B] hover:text-white min-[1032px]:bg-transparent"
            >
              {t("home.getStarted")}
            </Link>

            <Link
              href="/login"
              className="text-center text-base font-semibold text-[#0B1F4B] transition hover:text-blue-700 sm:text-left"
            >
              {t("home.alreadyAccount")}
            </Link>
          </motion.div>
        </motion.div>

        {/* Right: knee hologram (desktop only) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative hidden items-center justify-center min-[1032px]:flex"
        >
          {/* Glow behind the knee */}
          <div className="pointer-events-none absolute h-72 w-72 rounded-full bg-amber-500/25 blur-3xl sm:h-96 sm:w-96" />
          <div className="pointer-events-none absolute h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl" />

                    <Image
            src="/assets/knee.png"
            alt={t("home.kneeAlt")}
            width={800}
            height={1200}
            loading="eager"
            sizes="480px"
            className="relative z-10 h-[62vh] max-h-180 w-auto max-w-none"
          />
        </motion.div>
      </div>
    </section>
  );
}