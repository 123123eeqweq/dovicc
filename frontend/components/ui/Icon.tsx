interface IconProps {
  name: string;
  className?: string;
  filled?: boolean;
}

export const Icon = ({ name, className = "", filled = false }: IconProps) => {
  return (
    <span
      className={`material-symbols-outlined ${filled ? 'fill-1' : ''} ${className}`}
      style={{ fontVariationSettings: filled ? "'FILL' 1" : "'FILL' 0" }}
    >
      {name}
    </span>
  );
};
