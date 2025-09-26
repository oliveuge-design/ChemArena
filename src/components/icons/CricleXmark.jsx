export default function CricleXmark({ className, fill = "currentColor" }) {
  return (
    <svg
      className={className}
      fill={fill}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        fill={fill}
        stroke="white"
        strokeWidth="1"
      />
      <path
        d="M8 8l8 8M16 8l-8 8"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
