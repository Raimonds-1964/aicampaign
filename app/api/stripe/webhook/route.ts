import { NextResponse } from "next/server";

function pickEnv(name: string) {
  const v = process.env[name];
  return v && v.trim().length ? v.trim() : null;
}

/**
 * Stripe Variant B (bez stripe SDK):
 * - šobrīd: webhook “dev-mode” pieņem eventu un atgriež 200
 * - vēlāk: pievienosim signature verifikāciju (vai ieliksim stripe SDK)
 */
export async function POST(req: Request) {
  try {
    const webhookSecret = pickEnv("STRIPE_WEBHOOK_SECRET");

    // Stripe sūta JSON body; Next.js app router ļauj to nolasīt kā text
    const bodyText = await req.text();

    // Mēģinām parsēt eventu (bez verifikācijas)
    let event: any = null;
    try {
      event = JSON.parse(bodyText);
    } catch {
      event = null;
    }

    // Ja nav webhook secret, darām “dev-mode”
    if (!webhookSecret) {
      // Šeit vari vēlāk pieslēgt DB atzīmes utt.
      // Piemēram: ja event.type === "checkout.session.completed" -> atzīmēt subscriptionActive=true
      return NextResponse.json({
        ok: true,
        received: true,
        mode: "dev-no-signature-verify",
        type: event?.type || null,
      });
    }

    /**
     * ŠEIT būs nākamais solis:
     * - signature verifikācija pēc header "stripe-signature"
     * - bez stripe SDK tas ir darāms, bet nedaudz garāk (HMAC + timestamp tolerance).
     *
     * Pagaidām, lai neblokētu projektu, atgriežam 501 ar skaidru erroru.
     */
    return NextResponse.json(
      {
        ok: false,
        error: "WEBHOOK_SIGNATURE_VERIFY_NOT_IMPLEMENTED",
        message:
          "Šobrīd webhook signature verifikācija nav ieslēgta Variant B režīmā. Nākamajā solī to pievienosim.",
      },
      { status: 501 }
    );
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: "SERVER_CRASH", message: String(e?.message || e) },
      { status: 500 }
    );
  }
}
