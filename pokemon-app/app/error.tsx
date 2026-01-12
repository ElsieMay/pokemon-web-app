"use client";

/**
 * Props for ErrorMessage component.
 */
interface ErrorMessageProps {
  error: Error & { digest?: string };
  /** Callback function */
  reset: () => void;
}

/**
 * Next.js error boundary component.
 * @param props - Component props
 * @returns A full-page error UI with retry button
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/error-handling
 */
export default function ErrorMessage({ error, reset }: ErrorMessageProps) {
  return (
    //TODO: improve error UI
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">
          Oops! Something went wrong.
        </h1>
        <p className="text-gray-700 dark:text-gray-300">{error.message}</p>
        <button onClick={reset} className="mt-4 btn-primary">
          Try again
        </button>{" "}
      </main>
    </div>
  );
}
