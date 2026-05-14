interface TricolorStripProps {
  thick?: boolean;
}

export function TricolorStrip({ thick = false }: TricolorStripProps) {
  return (
    <div
      aria-hidden="true"
      className="tricolor-strip"
      style={{ height: thick ? 6 : 4 }}
    >
      <span className="ts-yellow" />
      <span className="ts-blue" />
      <span className="ts-red" />
    </div>
  );
}
