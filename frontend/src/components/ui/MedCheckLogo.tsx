import React from 'react';

interface MedCheckLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'white' | 'dark';
}

const MedCheckLogo: React.FC<MedCheckLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'default',
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const getGradientId = () =>
    `logoGradient-${variant}-${Math.random().toString(36).substr(2, 9)}`;
  const getShadowId = () =>
    `logoShadow-${variant}-${Math.random().toString(36).substr(2, 9)}`;

  const gradientId = getGradientId();
  const shadowId = getShadowId();

  const getColors = () => {
    switch (variant) {
      case 'white':
        return {
          gradient: ['#FFFFFF', '#F8FAFC', '#F1F5F9'],
          accent: '#3B82F6',
          check: '#10B981',
          secondary: '#6366F1',
        };
      case 'dark':
        return {
          gradient: ['#1E293B', '#334155', '#475569'],
          accent: '#60A5FA',
          check: '#34D399',
          secondary: '#818CF8',
        };
      default:
        return {
          gradient: ['#2563EB', '#4F46E5', '#059669'],
          accent: '#3B82F6',
          check: '#10B981',
          secondary: '#6366F1',
        };
    }
  };

  const colors = getColors();

  return (
    <div className={`${sizeClasses[size]} ${className} relative`}>
      <svg viewBox="0 0 40 40" className="w-full h-full">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.gradient[0]} />
            <stop offset="50%" stopColor={colors.gradient[1]} />
            <stop offset="100%" stopColor={colors.gradient[2]} />
          </linearGradient>
          <linearGradient
            id={`${gradientId}-secondary`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor={colors.accent} />
            <stop offset="100%" stopColor={colors.secondary} />
          </linearGradient>
          <filter id={shadowId}>
            <feDropShadow
              dx="0"
              dy="3"
              stdDeviation="3"
              floodColor={colors.gradient[2]}
              floodOpacity="0.4"
            />
          </filter>
        </defs>

        {/* Base circular representando proteção/auditoria premium */}
        <circle
          cx="20"
          cy="20"
          r="19"
          fill={`url(#${gradientId})`}
          filter={`url(#${shadowId})`}
          opacity="0.15"
        />

        {/* Cruz médica estilizada premium no centro */}
        <rect
          x="17"
          y="9"
          width="6"
          height="22"
          rx="3"
          fill={`url(#${gradientId})`}
          filter={`url(#${shadowId})`}
        />
        <rect
          x="9"
          y="17"
          width="22"
          height="6"
          rx="3"
          fill={`url(#${gradientId})`}
          filter={`url(#${shadowId})`}
        />

        {/* Elementos de auditoria premium - gráficos CBHPM */}
        <rect
          x="5"
          y="25"
          width="3"
          height="10"
          rx="1.5"
          fill={`url(#${gradientId}-secondary)`}
          opacity="0.8"
        />
        <rect
          x="9"
          y="23"
          width="3"
          height="12"
          rx="1.5"
          fill={`url(#${gradientId}-secondary)`}
          opacity="0.9"
        />
        <rect
          x="13"
          y="27"
          width="3"
          height="8"
          rx="1.5"
          fill={`url(#${gradientId}-secondary)`}
          opacity="0.7"
        />

        {/* Elementos de auditoria premium - lado direito */}
        <rect
          x="24"
          y="24"
          width="3"
          height="11"
          rx="1.5"
          fill={`url(#${gradientId}-secondary)`}
          opacity="0.8"
        />
        <rect
          x="28"
          y="22"
          width="3"
          height="13"
          rx="1.5"
          fill={`url(#${gradientId}-secondary)`}
          opacity="0.9"
        />
        <rect
          x="32"
          y="26"
          width="3"
          height="9"
          rx="1.5"
          fill={`url(#${gradientId}-secondary)`}
          opacity="0.7"
        />

        {/* Símbolo de verificação/aprovação premium no centro */}
        <path
          d="M15 20l3 3 6-6"
          stroke={colors.check}
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={`url(#${shadowId})`}
        />

        {/* Elementos de contestação premium - pontos estratégicos */}
        <circle cx="7" cy="11" r="1.5" fill={colors.accent} opacity="0.8" />
        <circle cx="33" cy="11" r="1.5" fill={colors.accent} opacity="0.8" />
        <circle cx="7" cy="33" r="1.5" fill={colors.accent} opacity="0.8" />
        <circle cx="33" cy="33" r="1.5" fill={colors.accent} opacity="0.8" />

        {/* Indicador de crescimento financeiro premium */}
        <path
          d="M3 15 L7 11 L11 13 L15 7"
          stroke={colors.check}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.9"
          filter={`url(#${shadowId})`}
        />

        {/* Pequenos elementos decorativos premium */}
        <circle cx="20" cy="6" r="1" fill={colors.secondary} opacity="0.6" />
        <circle cx="34" cy="20" r="1" fill={colors.secondary} opacity="0.6" />
        <circle cx="20" cy="34" r="1" fill={colors.secondary} opacity="0.6" />
        <circle cx="6" cy="20" r="1" fill={colors.secondary} opacity="0.6" />
      </svg>
    </div>
  );
};

export default MedCheckLogo;
