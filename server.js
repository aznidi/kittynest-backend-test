const express = require('express');
const bodyParser = require('body-parser');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Utilisation de la clé secrète Stripe via les variables d'environnement
const cors = require('cors');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors({
  origin: 'https://kittynest.vercel.app', // Assurez-vous que l'origine correspond à l'URL de votre frontend
  methods: ['GET', 'POST'],
}));

// Route pour créer une session de paiement Stripe
app.post('/create-checkout-session', async (req, res) => {
  try {
    const { amount, name, email } = req.body;

    // Validation des champs
    if (!amount || !name || !email) {
      return res.status(400).json({ error: 'Veuillez fournir tous les champs requis (amount, name, email).' });
    }

    // Création de la session de paiement
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'mad', // Devise
            product_data: {
              name: 'Don pour les chats', // Nom du produit
            },
            unit_amount: amount, // Montant en centimes (10 MAD = 1000)
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: 'https://kittynest.vercel.app/success', // URL après un paiement réussi
      cancel_url: 'https://kittynest.vercel.app/cancel',   // URL si l'utilisateur annule
      customer_email: email, // Email du client
    });

    // Réponse avec l'ID de session et l'URL Stripe Checkout
    res.json({ id: session.id, url: session.url });
  } catch (error) {
    console.error('Erreur Stripe :', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Écoute sur le port
app.listen(3000, () => {
  console.log('Serveur en écoute sur le port 3000');
});
