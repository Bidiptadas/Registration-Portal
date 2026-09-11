/** MemberCard - empty association member card ready for future details. */
export default function MemberCard() {
  return (
    <div
      className="h-48 rounded-xl hover-lift"
      aria-hidden="true"
      style={{
        backgroundColor: 'var(--color-surface)',
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid var(--color-border)',
      }}
    />
  );
}
