export default function Contact() {
  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 sm:px-8 md:px-12">
      <div className="mx-auto w-full max-w-xl">
        <h1 className="text-2xl font-medium tracking-tight text-[var(--foreground)] sm:text-3xl">
          Contact
        </h1>
        <p className="mt-2 text-sm text-[var(--foreground-muted)]">
          For invitations and enquiries
        </p>

        <div className="mt-10 space-y-6 border-t border-[var(--border)] pt-8">
          <p className="text-[var(--foreground)] leading-relaxed">
            This event is invitation-only. If you have received an invitation
            code, you may use it at checkout.
          </p>
          <p className="text-[var(--foreground-muted)] text-sm">
            Enquiries:{" "}
            <a
              href="mailto:hello@oraduku.com"
              className="ora-transition hover:text-[var(--accent)]"
            >
              hello@oraduku.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
