export default function About() {
  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 pb-28 pt-6 sm:px-8 sm:pb-24 md:px-12 md:pb-28">
      <div className="mx-auto w-full max-w-xl text-center">
        <h1 className="text-2xl font-medium tracking-tight text-[var(--foreground)] sm:text-3xl">
          About
        </h1>
        <p className="font-event-title mt-2 text-sm text-[var(--foreground-muted)]">
          Sitting with the Silence After the Noise
        </p>

        <div className="mt-6 space-y-5 border-t border-[var(--border)] pt-5 sm:mt-10 sm:pt-8 sm:space-y-6">
          <p className="text-[var(--foreground)] leading-relaxed text-sm sm:text-base">
            Sitting with the Silence After the Noise is an intimate,
            invitation-only art experience designed for reflection, storytelling,
            and thoughtful conversation. Guests are guided through moments of
            silence and dialogue with a small selection of artworks, engaging
            directly with artists, curators, and collectors to explore meaning,
            intention, and value beyond aesthetics.
          </p>
          <p className="text-[var(--foreground-muted)] leading-relaxed text-sm sm:text-base">
            Rather than a traditional exhibition, the evening prioritises depth,
            presence, and connection. Curated tea, wine, light pastries, and
            music gently accompany the experience, creating space for meaningful
            exchange and discovery. Attendance is intentionally limited to
            preserve intimacy. This is an experiment in how African art can be
            encountered, understood, and valued slowly, thoughtfully, and with
            care.
          </p>
        </div>
      </div>
    </div>
  );
}
