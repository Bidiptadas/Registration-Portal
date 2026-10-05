/**
 * MemberCard — Premium modern card for association core members.
 * Displays photo, name, post, department, and contact number.
 */
export default function MemberCard({ member }) {
  const photo = member.profileImageUrl || member.photoUrl || member.photo;
  const post = member.post || member.role?.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  const contact = member.phone || member.contact;
  const department = member.department;

  return (
    <article
      className="group relative rounded-2xl p-5 flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1.5 overflow-hidden border"
      style={{
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        borderColor: 'rgba(255, 255, 255, 0.12)',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.35)',
      }}
    >
      {/* Decorative ambient top glow on hover */}
      <div
        className="absolute -top-10 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity pointer-events-none"
        style={{ background: 'radial-gradient(circle, #38bdf8 0%, transparent 70%)' }}
      />

      {/* Avatar Container */}
      <div className="relative mb-3.5">
        <div
          className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center border-2 transition-transform duration-300 group-hover:scale-105"
          style={{
            borderColor: 'rgba(56, 189, 248, 0.5)',
            backgroundColor: 'rgba(30, 41, 59, 0.95)',
            boxShadow: '0 0 16px rgba(56, 189, 248, 0.2)',
          }}
        >
          {photo ? (
            <img
              src={photo}
              alt={member.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                if (e.currentTarget.nextSibling) {
                  e.currentTarget.nextSibling.style.display = 'flex';
                }
              }}
            />
          ) : null}
          <span
            className="w-full h-full flex items-center justify-center text-2xl font-black text-sky-400 bg-gradient-to-br from-sky-500/20 to-indigo-500/20"
            style={{ display: photo ? 'none' : 'flex' }}
          >
            {member.name ? member.name.charAt(0).toUpperCase() : 'M'}
          </span>
        </div>
      </div>

      {/* Member Name */}
      <h3
        className="font-bold text-base sm:text-lg tracking-tight text-white group-hover:text-sky-300 transition-colors line-clamp-1"
        title={member.name}
      >
        {member.name}
      </h3>

      {/* Post / Designation Badge */}
      {post && (
        <div className="mt-1.5 mb-3">
          <span
            className="inline-block px-3 py-0.5 rounded-full text-xs font-semibold tracking-wide border shadow-sm"
            style={{
              backgroundColor: 'rgba(14, 165, 233, 0.12)',
              borderColor: 'rgba(56, 189, 248, 0.35)',
              color: '#38bdf8',
            }}
          >
            {post}
          </span>
        </div>
      )}

      {/* Department & Contact Details (Bottom Section) */}
      <div
        className="w-full pt-3 mt-auto border-t flex flex-col gap-1.5 text-xs"
        style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}
      >
        {department && (
          <p
            className="font-medium line-clamp-1"
            style={{ color: 'rgba(255, 255, 255, 0.75)' }}
            title={department}
          >
            {department}
          </p>
        )}

        {contact && (
          <a
            href={`tel:${contact.replace(/\s+/g, '')}`}
            className="inline-block font-mono text-[11px] text-slate-400 hover:text-sky-400 transition-colors"
            title={`Call ${member.name}`}
          >
            {contact}
          </a>
        )}
      </div>
    </article>
  );
}
