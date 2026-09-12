import Link from "next/link";

interface ComingSoonProps {
  name: string;
  description?: string;
  category?: string;
}

export function ComingSoon({
  name,
  description,
  category,
}: ComingSoonProps) {
  return (
    <section className="mx-auto flex min-h-[55vh] w-full max-w-3xl items-center justify-center px-4 py-12 sm:px-6">
      <div className="w-full rounded-3xl border bg-card p-8 text-center shadow-sm sm:p-12">
        <div className="mx-auto mb-6 inline-flex rounded-full border px-4 py-2 text-sm font-semibold">
          Yakında
        </div>

        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {name}
        </h1>

        {category ? (
          <p className="mt-3 text-sm text-muted-foreground">
            {category}
          </p>
        ) : null}

        <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-muted-foreground">
          {description ||
            "Bu hesaplama aracını hazırlıyoruz. Çok yakında kullanıma sunacağız."}
        </p>

        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex items-center rounded-xl border px-5 py-3 text-sm font-semibold transition hover:bg-muted"
          >
            Hesaplama araçlarına dön
          </Link>
        </div>
      </div>
    </section>
  );
}