interface LogoProps {
  size?: number;
  withWordmark?: boolean;
}

export function Logo({ size = 32, withWordmark = true }: LogoProps) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <img
        src="/logo.png"
        alt="Club Raider Atlántico"
        width={size}
        height={size}
        style={{ width: size, height: size, objectFit: 'contain', display: 'block' }}
      />
      {withWordmark ? (
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: size * 0.62,
            letterSpacing: '0.02em',
            lineHeight: 1,
            color: 'var(--blanco)',
          }}
        >
          Club Raider Atlántico
        </span>
      ) : null}
    </div>
  );
}
