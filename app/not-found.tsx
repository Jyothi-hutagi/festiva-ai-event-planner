import Link from "next/link";
import { BRAND_NAME } from "@/lib/brand";

export default function NotFound() {
  return (
    <main className="mx-auto grid w-full max-w-lg gap-4 p-8">
      <h1 className="font-heading text-2xl font-semibold">
        This page is not on {BRAND_NAME}
      </h1>
      <p>
        That address does not match a planner page. Head back and start the
        celebration from the beginning.
      </p>
      <Link
        href="/"
        className="inline-flex min-h-11 w-fit items-center rounded-[4px] border border-border px-4 text-base font-semibold"
      >
        Back to {BRAND_NAME}
      </Link>
    </main>
  );
}
