// Flat, one-weight stroke icons — matches the RidePerks brand identity
// ("Flat, warm, one-weight line... rounded 2px stroke on ember-soft
// tiles"). No emoji anywhere in the UI.

type IconProps = { className?: string };

export function FuelIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M4 20V5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v15" />
      <path d="M4 20h11" />
      <path d="M15 9h2a2 2 0 0 1 2 2v7a2 2 0 0 0 2 2" />
      <path d="M17 6h.01" />
    </svg>
  );
}

export function FoodIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M5 3v18" />
      <path d="M5 13a4 4 0 0 0 4-4V3" />
      <path d="M15 3v18" />
      <path d="M19 3c0 4-1 5-4 6" />
    </svg>
  );
}

export function WrenchIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M14.7 6.3a4 4 0 0 0-5.6 5.6L3 18l3 3 6.1-6.1a4 4 0 0 0 5.6-5.6l-2.8 2.8-2.7-.7-.7-2.7z" />
    </svg>
  );
}

export function HeartPulseIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M20.8 8.6c0 4.5-8.8 10.4-8.8 10.4S3.2 13.1 3.2 8.6a4.6 4.6 0 0 1 8.3-2.7 4.6 4.6 0 0 1 9.3 2.7z" />
      <path d="M4.3 12h3l1.7-3 2 5 1.7-4 1.3 2H19" />
    </svg>
  );
}

export function CheckIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function SteeringWheelIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="2.4" />
      <path d="M12 3v6.6M6.2 16.8l4.2-3.4M17.8 16.8l-4.2-3.4" />
    </svg>
  );
}
