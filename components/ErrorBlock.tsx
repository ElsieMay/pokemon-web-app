import { LoadingButton } from "./LoadingButton";

interface ErrorBlockProps {
  error: string;
  onRetry: () => void;
  loading: boolean;
  retryText?: string;
}

/**
 * A component to display an error message with a retry button
 */
export function ErrorBlock({
  error,
  onRetry,
  loading,
  retryText = "Retry",
}: ErrorBlockProps) {
  return (
    <div className="w-full flex flex-col items-center">
      <p className="mt-4 text-red-500">{error}</p>
      <LoadingButton
        className="btn-primary mt-6"
        onClick={onRetry}
        loading={loading}
        loadingText="Retrying..."
      >
        {retryText}
      </LoadingButton>
    </div>
  );
}
