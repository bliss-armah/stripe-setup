    import React, { useState, useEffect } from "react";
    import "./App.css";
    import axios from "axios";

    const ProductDisplay = ({ onCheckout }) => (
      <section>
        <div className="product">
          <img
            src="https://i.imgur.com/EHyR2nP.png"
            alt="The cover of Stubborn Attachments"
          />
          <div className="description">
            <h3>Stubborn Attachments</h3>
            <h5>$20.00</h5>
          </div>
        </div>
        <button onClick={onCheckout}>
          Checkout
        </button>
      </section>
    );
    


    const Message = ({ message }) => (
      <section>
        <p>{message}</p>
      </section>
    );

    export default function App() {
      const [message, setMessage] = useState("");
      const [loading, setLoading] = useState(false);

      const handleCheckout = async () => {
        setLoading(true);
        try {
          const response = await axios.post("http://localhost:5000/api/transactions/create-checkout-session", {
            priceId: 'price_1Rc8g0HRqljSVYaAUJd2WCu5' // replace with actual Stripe price ID
          });
          window.location.href = response.data.url;
        } catch (error) {
          console.error("Error creating checkout session:", error);
          setMessage("Error creating checkout session. Please try again.");
        } finally {
          setLoading(false);
        }
      };
      

      useEffect(() => {
        // Check to see if this is a redirect back from Checkout
        const query = new URLSearchParams(window.location.search);

        if (query.get("success")) {
          setMessage("Order placed! You will receive an email confirmation.");
        }

        if (query.get("canceled")) {
          setMessage(
            "Order canceled -- continue to shop around and checkout when you're ready."
          );
        }
      }, []);

      if (loading) {
        return <div>Loading...</div>;
      }

      return message ? (
        <Message message={message} />
      ) : (
        <ProductDisplay onCheckout={handleCheckout} />
      );
    }