import { Pressable, Text, View, ActivityIndicator, PressableProps } from 'react-native';
import { forwardRef } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<PressableProps, 'children'> {
  children: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantStyles = {
  primary: 'bg-primary-500 active:bg-primary-600',
  secondary: 'bg-neutral-200 dark:bg-neutral-800 active:bg-neutral-300 dark:active:bg-neutral-700',
  outline: 'border-2 border-primary-500 bg-transparent active:bg-primary-50 dark:active:bg-primary-950',
  ghost: 'bg-transparent active:bg-neutral-100 dark:active:bg-neutral-800',
};

const textVariantStyles = {
  primary: 'text-white',
  secondary: 'text-neutral-900 dark:text-neutral-100',
  outline: 'text-primary-500',
  ghost: 'text-neutral-900 dark:text-neutral-100',
};

const sizeStyles = {
  sm: 'px-3 py-2 rounded-lg',
  md: 'px-4 py-3 rounded-xl',
  lg: 'px-6 py-4 rounded-2xl',
};

const textSizeStyles = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
};

export const Button = forwardRef<View, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      disabled = false,
      leftIcon,
      rightIcon,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <Pressable
        ref={ref}
        disabled={isDisabled}
        className={`
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${fullWidth ? 'w-full' : ''}
          ${isDisabled ? 'opacity-50' : ''}
          flex-row items-center justify-center gap-2
        `}
        {...props}
      >
        {loading ? (
          <ActivityIndicator color={variant === 'primary' ? '#ffffff' : '#22c55e'} />
        ) : (
          <>
            {leftIcon && leftIcon}
            <Text
              className={`
                ${textVariantStyles[variant]}
                ${textSizeStyles[size]}
                font-semibold
              `}
            >
              {children}
            </Text>
            {rightIcon && rightIcon}
          </>
        )}
      </Pressable>
    );
  }
);

Button.displayName = 'Button';
