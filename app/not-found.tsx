import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto grid w-full max-w-lg gap-4 p-8">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p>That address is not part of Festiva.</p>
      <Link
        href="/"
        className="w-fit rounded-md border border-border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        Back to the planner
      </Link>
    </main>
  );
}
