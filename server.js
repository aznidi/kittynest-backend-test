const express = require('express');
const bodyParser = require('body-parser');
const stripe = require('stripe')('sk_test_4eC39HqLyjWDarjtT1zdp7dc'); // Remplacez par votre clé secrète Stripe
const cors = require('cors');


const app = express();
app.use(bodyParser.json());
app.use(cors({
  origin: 'http://localhost:5173', // Origine de votre application React
  methods: ['GET', 'POST'],       // Méthodes HTTP autorisées
}));

app.post('/create-checkout-session', async (req, res) => {
  try {
    const { amount, name, email } = req.body;

    if (!amount || !name || !email) {
      return res.status(400).json({ error: 'Veuillez fournir tous les champs requis (amount, name, email).' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'mad', // Assurez-vous de définir la devise ici
            product_data: {
              name: 'Don pour les chats', // Nom du produit
            },
            unit_amount: amount * 100, // Montant en centimes (10 MAD = 1000)
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: 'http://localhost:3000/success',
      cancel_url: 'http://localhost:3000/cancel',
      customer_email: email,
    });

    res.json({ id: session.id, url: session.url });
  } catch (error) {
    console.error('Erreur Stripe :', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Serveur en écoute sur le port 3000');
});
