import type { Metadata } from "next";
import {
  Gem,
  Leaf,
  Ruler,
  Users,
  Zap,
  Truck,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Vastrayug - a contemporary men's fashion brand delivering quality fabrics, modern fits, and affordable luxury.",
};

const values = [
  {
    icon: Gem,
    title: "Quality First",
    description:
      "We source only the finest fabrics and materials. Every garment undergoes rigorous quality checks to ensure it meets our premium standards.",
  },
  {
    icon: Ruler,
    title: "Modern Design",
    description:
      "Our in-house design team stays ahead of global trends to bring you contemporary silhouettes and cuts that define modern menswear.",
  },
  {
    icon: Zap,
    title: "Perfect Fit",
    description:
      "Engineered for the modern man. Our sizing is tested across body types to deliver a fit that looks sharp and feels comfortable all day.",
  },
  {
    icon: Leaf,
    title: "Sustainable",
    description:
      "We are committed to responsible fashion. From eco-friendly packaging to ethical manufacturing, sustainability is woven into everything we do.",
  },
  {
    icon: Users,
    title: "Customer First",
    description:
      "Your satisfaction drives us. Easy returns, responsive support, and a seamless shopping experience are at the core of Vastrayug.",
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    description:
      "Get your order delivered quickly across India. We partner with top logistics providers to ensure fast, reliable shipping to your doorstep.",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#0A0A0A]/5 via-[#3B82F6]/5 to-background py-24 md:py-32">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-accent">
            Our Story
          </p>
          <h1 className="mb-6 font-display text-4xl font-bold text-foreground md:text-5xl lg:text-6xl">
            Crafted for the Modern Man
          </h1>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted">
            Vastrayug is a contemporary men&apos;s fashion brand built on a
            simple idea — that every man deserves clothing that combines
            premium quality, modern design, and honest pricing. No
            compromises.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="mb-6 font-display text-3xl font-bold">
                Who We Are
              </h2>
              <p className="mb-4 leading-relaxed text-muted">
                Founded with a vision to redefine men&apos;s everyday wear,
                Vastrayug brings together clean aesthetics, premium fabrics,
                and fits that actually work. From classic denim to
                streetwear-inspired hoodies, every piece in our collection is
                designed for men who value both style and substance.
              </p>
              <p className="mb-4 leading-relaxed text-muted">
                We believe great clothing shouldn&apos;t come with an
                unreasonable price tag. By working directly with trusted
                manufacturers and cutting out the middlemen, we deliver
                affordable luxury — quality you can see and feel, at prices
                that make sense.
              </p>
              <p className="leading-relaxed text-muted">
                Whether you&apos;re dressing up for the weekend, layering for
                winter, or keeping it minimal with a crisp tee, Vastrayug has
                you covered. This is menswear, elevated.
              </p>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-gradient-to-br from-[#0A0A0A]/10 to-[#3B82F6]/10">
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <p className="font-display text-6xl font-bold text-primary">
                      V
                    </p>
                    <p className="mt-2 text-sm font-medium text-muted">
                      Est. 2024
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-surface py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 font-display text-3xl font-bold">
              What We Stand For
            </h2>
            <p className="mx-auto max-w-xl text-muted">
              These core principles guide everything we do at Vastrayug.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {values.map((value) => (
              <div
                key={value.title}
                className="rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-md"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <value.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{value.title}</h3>
                <p className="text-sm leading-relaxed text-muted">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4">
          <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
            {[
              { value: "100k+", label: "Happy Customers" },
              { value: "50+", label: "Styles" },
              { value: "15+", label: "Cities" },
              { value: "4.8", label: "Avg Rating" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="font-display text-3xl font-bold text-primary md:text-4xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
