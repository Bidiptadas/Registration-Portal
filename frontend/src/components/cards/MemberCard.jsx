/** MemberCard — association member card. */
import Avatar from '../common/Avatar';
import { getRoleLabel } from '../../utils/roleUtils';
export default function MemberCard({ member }) {
  return (<div className="flex flex-col items-center p-6 rounded-xl text-center hover-lift" style={{ backgroundColor: 'var(--color-surface)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)' }}><Avatar src={member.profileImageUrl} name={member.name} size="xl" /><h3 className="mt-3 font-semibold" style={{ color: 'var(--color-text-primary)' }}>{member.name}</h3><p className="text-sm" style={{ color: 'var(--color-primary)' }}>{getRoleLabel(member.role)}</p><p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>{member.department} · Year {member.year}</p></div>);
}
