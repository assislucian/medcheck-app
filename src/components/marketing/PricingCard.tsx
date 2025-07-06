import React from "react";

interface PricingCardProps {
  title: string;
  price: string;
  features: string[];
}

const PricingCard: React.FC<PricingCardProps> = ({
  title,
  price,
  features,
}) => (
  <div className="pricing-card">
    <h3>{title}</h3>
    <p>{price}</p>
    <ul>
      {features.map((feature, idx) => (
        <li key={idx}>{feature}</li>
      ))}
    </ul>
  </div>
);

export default PricingCard;
