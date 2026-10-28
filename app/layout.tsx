import type { Metadata } from "next";
import { Baloo_2, Hind } from "next/font/google";
import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/brand";
import "./globals.css";

const baloo = Baloo_2({
  subsets: ["latin", "devanagari"],
  weight: ["600", "700"],
  variable: "--font-baloo",
  display: "swap",
});

const hind = Hind({
  subsets: ["latin", "devanagari"],
  weight: ["400", "500", "600"],
  variable: "--font-hind",
  display: "swap",
});

const themeBoot = `(function () {
  try {
    var saved = localStorage.getItem("toran-theme");
    document.documentElement.setAttribute(
      "data-theme",
      saved === "dark" ? "dark" : "light",
    );
  } catch (e) {
    document.documentElement.setAttribute("data-theme", "light");
  }
})();`;

export const metadata: Metadata = {
  title: BRAND_NAME,
  description: `${BRAND_NAME}, the ${BRAND_TAGLINE}. Budget, timeline, vendors, decor ideas and where to buy, built for your date and city.`,
  applicationName: BRAND_NAME,
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme="light"
      suppressHydrationWarning
      className={`${hind.variable} ${baloo.variable} h-full antialiased`}
    >
      <head>
        <script>{themeBoot}</script>
      </head>
      <body className="flex min-h-full flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
