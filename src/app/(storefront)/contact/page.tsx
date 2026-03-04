"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Send, Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";

const contactInfo = [
  {
    icon: Mail,
    label: "Email",
    value: "support@vastrayug.com",
    href: "mailto:support@vastrayug.com",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+91 98765 43210",
    href: "tel:+919876543210",
  },
  {
    icon: MapPin,
    label: "Address",
    value: "WeWork, Connaught Place, New Delhi 110001, India",
  },
  {
    icon: Clock,
    label: "Business Hours",
    value: "Mon - Sat: 10:00 AM - 7:00 PM IST",
  },
];

const subjectOptions = [
  { value: "general", label: "General Inquiry" },
  { value: "order", label: "Order Related" },
  { value: "returns", label: "Returns & Exchange" },
  { value: "bulk", label: "Bulk Order" },
  { value: "collaboration", label: "Collaboration" },
  { value: "other", label: "Other" },
];

export default function ContactPage() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const mailtoUrl = `mailto:support@vastrayug.com?subject=${encodeURIComponent(
      `[${formState.subject}] Contact from ${formState.name}`
    )}&body=${encodeURIComponent(
      `Name: ${formState.name}\nEmail: ${formState.email}\n\n${formState.message}`
    )}`;
    window.open(mailtoUrl);
    setSubmitted(true);
  }

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/10 via-accent/5 to-background py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h1 className="mb-4 font-display text-4xl font-bold md:text-5xl">
            Get in Touch
          </h1>
          <p className="mx-auto max-w-xl text-lg text-muted">
            Have a question, feedback, or want to collaborate? We&apos;d love to
            hear from you.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid gap-12 lg:grid-cols-5">
            {/* Contact Info */}
            <div className="lg:col-span-2">
              <h2 className="mb-6 font-display text-2xl font-bold">
                Contact Information
              </h2>
              <div className="space-y-6">
                {contactInfo.map((item) => (
                  <div key={item.label} className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted">
                        {item.label}
                      </p>
                      {item.href ? (
                        <a
                          href={item.href}
                          className="text-foreground hover:text-primary"
                        >
                          {item.value}
                        </a>
                      ) : (
                        <p className="text-foreground">{item.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-3">
              {submitted ? (
                <div className="rounded-xl border border-border bg-card p-8 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                    <Send className="h-8 w-8 text-success" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">Message Sent!</h3>
                  <p className="text-muted">
                    Thank you for reaching out. We&apos;ll get back to you within
                    24-48 hours.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-6"
                    onClick={() => {
                      setSubmitted(false);
                      setFormState({ name: "", email: "", subject: "", message: "" });
                    }}
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="rounded-xl border border-border bg-card p-6 md:p-8"
                >
                  <h2 className="mb-6 font-display text-2xl font-bold">
                    Send us a Message
                  </h2>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Input
                      label="Your Name"
                      placeholder="Full name"
                      required
                      value={formState.name}
                      onChange={(e) =>
                        setFormState({ ...formState, name: e.target.value })
                      }
                    />
                    <Input
                      label="Email Address"
                      type="email"
                      placeholder="you@example.com"
                      required
                      value={formState.email}
                      onChange={(e) =>
                        setFormState({ ...formState, email: e.target.value })
                      }
                    />
                  </div>
                  <div className="mt-5">
                    <Select
                      label="Subject"
                      options={subjectOptions}
                      placeholder="Select a topic"
                      required
                      value={formState.subject}
                      onChange={(e) =>
                        setFormState({ ...formState, subject: e.target.value })
                      }
                    />
                  </div>
                  <div className="mt-5">
                    <Textarea
                      label="Message"
                      placeholder="Tell us how we can help..."
                      rows={5}
                      required
                      value={formState.message}
                      onChange={(e) =>
                        setFormState({ ...formState, message: e.target.value })
                      }
                    />
                  </div>
                  <Button type="submit" className="mt-6" fullWidth>
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
