import { View, ViewProps } from 'react-native';
import { forwardRef, ReactNode } from 'react';

type CardVariant = 'default' | 'elevated' | 'outlined';

interface CardProps extends ViewProps {
  children: ReactNode;
  variant?: CardVariant;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const variantStyles = {
  default: 'bg-white dark:bg-neutral-900',
  elevated: 'bg-white dark:bg-neutral-900 shadow-lg',
  outlined: 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800',
};

const paddingStyles = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

export const Card = forwardRef<View, CardProps>(
  ({ children, variant = 'default', padding = 'md', className = '', ...props }, ref) => {
    return (
      <View
        ref={ref}
        className={`
          ${variantStyles[variant]}
          ${paddingStyles[padding]}
          rounded-2xl
          ${className}
        `}
        {...props}
      >
        {children}
      </View>
    );
  }
);

Card.displayName = 'Card';
