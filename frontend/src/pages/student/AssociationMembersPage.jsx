/** AssociationMembersPage — view Tecnophite members directory. */
import { useEffect, useState } from 'react';
import associationApi from '../../services/associationApi';
import MemberCard from '../../components/cards/MemberCard';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';

export default function AssociationMembersPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMembers() {
      try {
        const res = await associationApi.getMembers();
        setMembers(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadMembers();
  }, []);

  if (loading) return <Loader />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>Association Members</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>Meet the members organizing the Tecnophite fest</p>

      {members.length === 0 ? (
        <EmptyState title="No members listed" description="Check back soon for the core committee list." icon="👥" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {members.map(member => (
            <MemberCard key={member.memberId} member={member} />
          ))}
        </div>
      )}
    </div>
  );
}
