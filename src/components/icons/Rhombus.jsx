export default function Rhombus({ className, fill = "currentColor" }) {
  return (
    <svg
      className={className}
      fill={fill}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 2L22 12L12 22L2 12L12 2Z"
        fill={fill}
      />
    </svg>
  )
}
