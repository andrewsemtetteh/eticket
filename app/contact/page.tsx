export default function Contact() {
  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 sm:px-8 md:px-12">
      <div className="mx-auto w-full max-w-xl text-center">
        <h1 className="text-2xl font-medium tracking-tight text-[var(--foreground)] sm:text-3xl">
          Contact
        </h1>
        <p className="mt-2 text-sm text-[var(--foreground-muted)]">
          Get in touch about the event
        </p>

        <div className="mt-6 space-y-4 border-t border-[var(--border)] pt-4">
          <div className="space-y-3">
            <h2 className="text-base font-medium text-[var(--foreground)]">
              Need Help?
            </h2>
            <p className="text-[var(--foreground)] leading-relaxed text-sm">
              Questions about tickets, the event, or technical issues? 
              We're here to assist you.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-[var(--foreground-muted)] text-sm">
              For enquiries:{" "}
              <a
                href="mailto:support@oraduku.com"
                className="ora-transition hover:text-[var(--accent)]"
              >
                support@oraduku.com
              </a>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
