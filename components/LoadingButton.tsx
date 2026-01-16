interface LoadingButtonProps {
  loading: boolean;
  loadingText?: string;
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

/**
 * A button that shows a loading state when performing an action
 */
export function LoadingButton({
  loading,
  loadingText = "Loading...",
  children,
  onClick,
  disabled,
  className = "btn-primary",
}: LoadingButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      className={className}
    >
      {loading ? loadingText : children}
    </button>
  );
}
