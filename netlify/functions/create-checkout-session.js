import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PRICE_IDS = {
  pro: process.env.STRIPE_PRICE_ID_PRO,
  vip: process.env.STRIPE_PRICE_ID_VIP,
};

export default async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  try {
    const { uid, tier, successUrl, cancelUrl } = await req.json();

    if (!uid || typeof uid !== "string") {
      return new Response(JSON.stringify({ error: "uid manquant" }), { status: 400 });
    }
    const priceId = PRICE_IDS[tier];
    if (!priceId) {
      return new Response(JSON.stringify({ error: "tier invalide (attendu: pro | vip)" }), { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      // Permet au webhook de savoir QUEL joueur (uid Firebase) vient de payer
      client_reference_id: uid,
      success_url: successUrl || "https://ptitbacbac.netlify.app/?checkout=success",
      cancel_url: cancelUrl || "https://ptitbacbac.netlify.app/?checkout=cancel",
    });

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("create-checkout-session error:", e.message);
    return new Response(JSON.stringify({ error: "Erreur lors de la création de la session Stripe" }), { status: 500 });
  }
};
