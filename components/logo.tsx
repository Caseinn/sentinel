import Image from "next/image";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  sm: 24,
  md: 32,
  lg: 48,
  xl: 64,
};

export function Logo({ size = "md", className = "" }: LogoProps) {
  const dimension = sizeMap[size];
  
  return (
    <div className={`relative inline-flex items-center gap-2 ${className}`}>
      <div className="relative" style={{ width: dimension, height: dimension }}>
        <Image
          src="/logo/logo.svg"
          alt="Sentinel Logo"
          width={dimension}
          height={dimension}
        />
      </div>
      <span className="font-bold tracking-tight" style={{ 
        fontSize: size === "sm" ? "1rem" : size === "md" ? "1.125rem" : size === "lg" ? "1.5rem" : "2rem"
      }}>
        Sentinel
      </span>
    </div>
  );
}

export function LogoIcon({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <Image
        src="/logo/logo.svg"
        alt="Sentinel"
        width={size}
        height={size}
      />
    </div>
  );
}
