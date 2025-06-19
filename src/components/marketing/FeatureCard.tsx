import React from 'react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon }) => (
  <div className="feature-card">
    {icon && <div className="feature-card-icon">{icon}</div>}
    <h3>{title}</h3>
    <p>{description}</p>
  </div>
);

export default FeatureCard;