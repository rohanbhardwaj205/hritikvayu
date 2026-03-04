import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

function verifyWebhookSignature(
  body: string,
  signature: string
): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!secret) {
    throw new Error("RAZORPAY_WEBHOOK_SECRET is not configured");
  }

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(signature)
  );
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing signature" },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const isValid = verifyWebhookSignature(rawBody, signature);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    const event = JSON.parse(rawBody);
    const supabaseAdmin = createAdminClient();

    const eventType = event.event;
    const payment = event.payload?.payment?.entity;

    if (!payment) {
      // Acknowledge events we don't process
      return NextResponse.json({ status: "ok" });
    }

    const razorpayOrderId = payment.order_id;

    if (!razorpayOrderId) {
      return NextResponse.json({ status: "ok" });
    }

    switch (eventType) {
      case "payment.authorized": {
        // Payment authorized but not yet captured
        await supabaseAdmin
          .from("orders")
          .update({
            payment_status: "pending",
            razorpay_payment_id: payment.id,
            updated_at: new Date().toISOString(),
          })
          .eq("razorpay_order_id", razorpayOrderId);

        break;
      }

      case "payment.captured": {
        // Payment successfully captured
        await supabaseAdmin
          .from("orders")
          .update({
            payment_status: "paid",
            status: "confirmed",
            razorpay_payment_id: payment.id,
            updated_at: new Date().toISOString(),
          })
          .eq("razorpay_order_id", razorpayOrderId);

        break;
      }

      case "payment.failed": {
        // Payment failed
        await supabaseAdmin
          .from("orders")
          .update({
            payment_status: "failed",
            razorpay_payment_id: payment.id,
            notes: `Payment failed: ${payment.error_description ?? "Unknown error"}`,
            updated_at: new Date().toISOString(),
          })
          .eq("razorpay_order_id", razorpayOrderId);

        break;
      }

      case "refund.created":
      case "refund.processed": {
        // Refund processed
        await supabaseAdmin
          .from("orders")
          .update({
            payment_status: "refunded",
            status: "refunded",
            updated_at: new Date().toISOString(),
          })
          .eq("razorpay_order_id", razorpayOrderId);

        break;
      }

      default:
        // Unhandled event type -- acknowledge silently
        break;
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Webhook processing failed";

    // Always return 200 for webhook retries to avoid Razorpay retrying indefinitely
    // Log the error for debugging
    console.error("[Razorpay Webhook Error]", message);

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
