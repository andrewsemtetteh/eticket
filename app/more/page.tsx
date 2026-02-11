import Link from "next/link";

export default function More() {
  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 sm:px-8 md:px-12">
      <div className="mx-auto w-full max-w-xl text-center">
        <h1 className="text-2xl font-medium tracking-tight text-[var(--foreground)] sm:text-3xl">
          More
        </h1>
        <p className="mt-2 text-sm text-[var(--foreground-muted)]">
          Further information
        </p>

        <div className="mt-10 space-y-6 border-t border-[var(--border)] pt-8">
          <p className="text-[var(--foreground)] leading-relaxed">
            E-tickets are sent by email and SMS after payment. Present your
            ticket (QR code) at the door. Bank cards and mobile money (MTN,
            Vodafone/Telecel, AirtelTigo) are accepted. Event location details
            will be shared via email after ticket purchase.
          </p>
          <Link
            href="/tickets"
            className="ora-btn inline-flex items-center justify-center rounded-[var(--radius)] border border-[var(--border)] bg-transparent px-5 py-2.5 text-sm font-medium text-[var(--foreground)] hover:border-[var(--foreground-muted)] hover:text-[var(--accent)]"
          >
            View tickets
          </Link>
        </div>
      </div>
    </div>
  );
}
