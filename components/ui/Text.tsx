import { Text as RNText, TextProps as RNTextProps } from 'react-native';
import { forwardRef, ReactNode } from 'react';

type TextVariant = 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'label';
type TextColor = 'default' | 'muted' | 'primary' | 'white';

interface TextProps extends RNTextProps {
  children: ReactNode;
  variant?: TextVariant;
  color?: TextColor;
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  centered?: boolean;
}

const variantStyles = {
  h1: 'text-4xl font-bold',
  h2: 'text-3xl font-bold',
  h3: 'text-2xl font-semibold',
  body: 'text-base',
  caption: 'text-sm',
  label: 'text-xs font-medium',
};

const colorStyles = {
  default: 'text-neutral-900 dark:text-neutral-100',
  muted: 'text-neutral-600 dark:text-neutral-400',
  primary: 'text-primary-500',
  white: 'text-white',
};

const weightStyles = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
};

export const Text = forwardRef<RNText, TextProps>(
  (
    {
      children,
      variant = 'body',
      color = 'default',
      weight,
      centered = false,
      className = '',
      ...props
    },
    ref
  ) => {
    return (
      <RNText
        ref={ref}
        className={`
          ${variantStyles[variant]}
          ${colorStyles[color]}
          ${weight ? weightStyles[weight] : ''}
          ${centered ? 'text-center' : ''}
          ${className}
        `}
        {...props}
      >
        {children}
      </RNText>
    );
  }
);

Text.displayName = 'Text';
