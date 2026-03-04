import type { Metadata } from "next";
import { Ruler } from "lucide-react";

export const metadata: Metadata = {
  title: "Size Guide",
  description:
    "Find your perfect fit with our comprehensive men's size guide for jeans, cargos, shirts, t-shirts, hoodies, and sweatshirts at Vastrayug.",
};

const topsSizes = [
  { size: "S", chest: "36", length: "26", shoulder: "16.5" },
  { size: "M", chest: "38", length: "27", shoulder: "17" },
  { size: "L", chest: "40", length: "28", shoulder: "17.5" },
  { size: "XL", chest: "42", length: "29", shoulder: "18" },
  { size: "XXL", chest: "44", length: "30", shoulder: "18.5" },
];

const bottomsSizes = [
  { waist: "28", waistIn: "28", hip: "36", inseam: "30" },
  { waist: "30", waistIn: "30", hip: "38", inseam: "30" },
  { waist: "32", waistIn: "32", hip: "40", inseam: "31" },
  { waist: "34", waistIn: "34", hip: "42", inseam: "31" },
  { waist: "36", waistIn: "36", hip: "44", inseam: "32" },
  { waist: "38", waistIn: "38", hip: "46", inseam: "32" },
  { waist: "40", waistIn: "40", hip: "48", inseam: "32" },
];

export default function SizeGuidePage() {
  return (
    <main className="min-h-screen">
      <section className="bg-gradient-to-br from-primary/10 via-accent/5 to-background py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Ruler className="h-7 w-7 text-primary" />
          </div>
          <h1 className="mb-4 font-display text-4xl font-bold md:text-5xl">
            Men&apos;s Size Guide
          </h1>
          <p className="mx-auto max-w-xl text-lg text-muted">
            All measurements are in inches. For the best fit, take your body
            measurements and compare with our size chart below.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-4xl space-y-16 px-4">
          {/* Tops */}
          <div>
            <h2 className="mb-2 font-display text-2xl font-bold">
              Tops
            </h2>
            <p className="mb-6 text-sm text-muted">
              T-Shirts, Shirts, Hoodies, Sweatshirts
            </p>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface">
                    <th className="px-4 py-3 text-left font-semibold">Size</th>
                    <th className="px-4 py-3 text-left font-semibold">
                      Chest
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">
                      Length
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">
                      Shoulder
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {topsSizes.map((row) => (
                    <tr
                      key={row.size}
                      className="border-b border-border last:border-0"
                    >
                      <td className="px-4 py-3 font-medium">{row.size}</td>
                      <td className="px-4 py-3 text-muted">
                        {row.chest}&quot;
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {row.length}&quot;
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {row.shoulder}&quot;
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottoms */}
          <div>
            <h2 className="mb-2 font-display text-2xl font-bold">
              Bottoms
            </h2>
            <p className="mb-6 text-sm text-muted">Jeans, Cargos</p>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface">
                    <th className="px-4 py-3 text-left font-semibold">
                      Waist Size
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">
                      Waist
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">Hip</th>
                    <th className="px-4 py-3 text-left font-semibold">
                      Inseam
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {bottomsSizes.map((row) => (
                    <tr
                      key={row.waist}
                      className="border-b border-border last:border-0"
                    >
                      <td className="px-4 py-3 font-medium">{row.waist}</td>
                      <td className="px-4 py-3 text-muted">
                        {row.waistIn}&quot;
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {row.hip}&quot;
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {row.inseam}&quot;
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* How to Measure */}
          <div className="rounded-xl border border-border bg-surface p-6 md:p-8">
            <h2 className="mb-4 font-display text-2xl font-bold">
              How to Measure
            </h2>
            <p className="mb-6 text-sm text-muted">
              Use a soft measuring tape and measure over light clothing for the
              most accurate results.
            </p>
            <div className="grid gap-6 sm:grid-cols-2">
              {[
                {
                  title: "Chest",
                  tip: "Measure around the fullest part of your chest, keeping the tape level under your arms and across your shoulder blades.",
                },
                {
                  title: "Waist",
                  tip: "Measure around your natural waistline where you normally wear your pants. Keep the tape comfortably snug.",
                },
                {
                  title: "Hip",
                  tip: "Stand with your feet together and measure around the fullest part of your hips and buttocks.",
                },
                {
                  title: "Shoulder",
                  tip: "Measure from the edge of one shoulder to the other across the back, following the natural shoulder line.",
                },
                {
                  title: "Inseam",
                  tip: "Measure from the crotch seam to the bottom hem of a well-fitting pair of pants you already own.",
                },
                {
                  title: "Length (Tops)",
                  tip: "Measure from the highest point of the shoulder, down over the chest, to the desired length at the hem.",
                },
              ].map((item) => (
                <div key={item.title}>
                  <h3 className="mb-1 font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted">{item.tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
