interface StatusBadgeProps {
  label: string;
  tone?: 'neutral' | 'success' | 'warning' | 'danger';
}

export function StatusBadge({ label, tone = 'neutral' }: StatusBadgeProps) {
  return (
    <span className="status-badge">
      <span className="status-dot" data-tone={tone} />
      {label}
    </span>
  );
}
