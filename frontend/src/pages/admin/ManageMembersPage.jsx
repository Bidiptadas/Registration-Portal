/** ManageMembersPage — CRUD for association members. */
import { useEffect, useState } from 'react';
import associationApi from '../../services/associationApi';
import DataTable from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import MemberForm from '../../components/forms/MemberForm';
import { useNotification } from '../../context/NotificationContext';
import ConfirmDialog from '../../components/common/ConfirmDialog';

export default function ManageMembersPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editMember, setEditMember] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const toast = useNotification();

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

  useEffect(() => {
    loadMembers();
  }, []);

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      if (editMember) {
        await associationApi.updateMember(editMember.memberId, formData);
        toast.success('Member details updated');
      } else {
        await associationApi.createMember(formData);
        toast.success('Member added successfully');
      }
      setIsOpen(false);
      setEditMember(null);
      loadMembers();
    } catch {
      toast.error('Failed to save association member');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await associationApi.deleteMember(deleteId);
      toast.success('Member removed successfully');
      loadMembers();
    } catch {
      toast.error('Failed to remove member');
    }
  };

  const startEdit = (row) => {
    setEditMember(row);
    setIsOpen(true);
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'role', label: 'Role' },
    { key: 'department', label: 'Department' },
    { key: 'year', label: 'Year' },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => startEdit(row)}>Edit</Button>
          <Button variant="danger" size="sm" onClick={() => setDeleteId(row.memberId)}>Remove</Button>
        </div>
      ),
    },
  ];

  if (loading && members.length === 0) return <Loader />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Manage Members</h1>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Add, edit, or remove Tecnophite Association core members</p>
        </div>
        <Button onClick={() => { setIsOpen(true); setEditMember(null); }}>+ Add Member</Button>
      </div>

      <DataTable columns={columns} data={members} />

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={editMember ? 'Edit Association Member' : 'Add Association Member'}>
        <MemberForm initialData={editMember || {}} onSubmit={handleSubmit} loading={loading} />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Remove Member"
        message="Are you sure you want to remove this association member from the directory?"
      />
    </div>
  );
}
