import Stripe from "stripe";
import admin from "firebase-admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PRICE_TO_TIER = {
  [process.env.STRIPE_PRICE_ID_PRO]: "pro",
  [process.env.STRIPE_PRICE_ID_VIP]: "vip",
};

if (!admin.apps.length) {
  // FIREBASE_SERVICE_ACCOUNT_JSON contient le JSON du compte de service
  // (encodé en base64 pour éviter les soucis d'échappement dans les env vars).
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON || "";
  const json = raw.trim().startsWith("{") ? raw : Buffer.from(raw, "base64").toString("utf8");
  const serviceAccount = JSON.parse(json);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });
}
const db = admin.database();

async function setTierForUid(uid, tier) {
  await db.ref(`users/${uid}`).update({ tier, tierUpdatedAt: Date.now() });
}

async function setTierForCustomer(customerId, tier) {
  const snap = await db.ref(`stripeCustomers/${customerId}`).get();
  const uid = snap.val();
  if (!uid) {
    console.warn("Aucun uid connu pour le customer Stripe:", customerId);
    return;
  }
  await setTierForUid(uid, tier);
}

export default async (req) => {
  const sig = req.headers.get("stripe-signature");
  const rawBody = await req.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (e) {
    console.error("Signature webhook invalide:", e.message);
    return new Response(JSON.stringify({ error: "signature invalide" }), { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const uid = session.client_reference_id;
        const customerId = session.customer;
        if (!uid) {
          console.warn("checkout.session.completed sans client_reference_id");
          break;
        }
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
        const priceId = lineItems.data[0]?.price?.id;
        const tier = PRICE_TO_TIER[priceId] || "pro";
        await setTierForUid(uid, tier);
        if (customerId) await db.ref(`stripeCustomers/${customerId}`).set(uid);
        console.log(`Tier "${tier}" activé pour uid=${uid}`);
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object;
        await setTierForCustomer(sub.customer, "free");
        break;
      }
      case "customer.subscription.updated": {
        const sub = event.data.object;
        // Abonnement impayé / en retard / annulé -> repasser gratuit.
        // Redevenu actif -> remonter au tier correspondant au prix courant.
        if (["canceled", "unpaid", "past_due", "incomplete_expired"].includes(sub.status)) {
          await setTierForCustomer(sub.customer, "free");
        } else if (sub.status === "active") {
          const priceId = sub.items?.data?.[0]?.price?.id;
          const tier = PRICE_TO_TIER[priceId];
          if (tier) await setTierForCustomer(sub.customer, tier);
        }
        break;
      }
      default:
        break; // événement non géré, ignoré volontairement
    }
  } catch (e) {
    console.error("Erreur de traitement du webhook:", e.message);
    return new Response(JSON.stringify({ error: "erreur interne" }), { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
};
