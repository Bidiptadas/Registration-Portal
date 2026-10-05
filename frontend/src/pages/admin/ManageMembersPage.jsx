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
  const [showManualGuide, setShowManualGuide] = useState(false);
  const toast = useNotification();

  async function loadMembers() {
    try {
      setLoading(true);
      const res = await associationApi.getMembers();
      setMembers(res.data.data);
    } catch (err) {
      console.error('Failed to load members:', err);
      toast.error('Failed to load members from Firestore.');
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
        await associationApi.updateMember(editMember.memberId, {
          ...formData,
          _collection: editMember._collection,
        });
        toast.success('Member details updated');
      } else {
        await associationApi.createMember(formData);
        toast.success('Member added successfully');
      }
      setIsOpen(false);
      setEditMember(null);
      await loadMembers();
    } catch (err) {
      console.error('Failed to save association member:', err);
      const errMsg = err?.message || 'Check Firestore rules';
      toast.error(`Failed to save association member: ${errMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const targetMember = members.find((m) => m.memberId === deleteId);
    try {
      await associationApi.deleteMember(deleteId, targetMember?._collection);
      toast.success('Member removed successfully');
      setDeleteId(null);
      await loadMembers();
    } catch (err) {
      console.error('Failed to remove member:', err);
      toast.error('Failed to remove member');
    }
  };

  const startEdit = (row) => {
    setEditMember(row);
    setIsOpen(true);
  };

  const columns = [
    {
      key: 'photo',
      label: 'Photo',
      render: (row) => {
        const photo = row.profileImageUrl || row.photoUrl || row.photo;
        return (
          <div
            className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center border font-bold text-sm shadow-sm relative shrink-0"
            style={{
              backgroundColor: 'var(--color-surface-secondary)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-primary)',
            }}
          >
            {photo ? (
              <img
                src={photo}
                alt={row.name}
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
              className="w-full h-full flex items-center justify-center"
              style={{ display: photo ? 'none' : 'flex' }}
            >
              {row.name ? row.name.charAt(0).toUpperCase() : 'M'}
            </span>
          </div>
        );
      },
    },
    {
      key: 'name',
      label: 'Name',
      render: (row) => (
        <div>
          <p className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{row.name}</p>
          {row.email && (
            <p className="text-xs text-slate-400 font-mono">{row.email}</p>
          )}
        </div>
      ),
    },
    {
      key: 'post',
      label: 'Post / Role',
      render: (row) => {
        const postName = row.post || row.role?.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || 'Member';
        return (
          <span className="font-semibold text-xs px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
            {postName}
          </span>
        );
      },
    },
    {
      key: 'phone',
      label: 'Contact Number',
      render: (row) => (
        <span className="text-xs font-mono" style={{ color: 'var(--color-text-secondary)' }}>
          {row.phone || row.contact || '-'}
        </span>
      ),
    },
    {
      key: 'department',
      label: 'Department',
      render: (row) => (
        <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          {row.department || '-'}
        </span>
      ),
    },
    {
      key: 'order',
      label: 'Order',
      render: (row) => (
        <span
          className="px-2 py-0.5 rounded text-xs font-bold font-mono"
          style={{ backgroundColor: 'var(--color-surface-secondary)', color: 'var(--color-text-primary)' }}
        >
          {row.order !== undefined ? row.order : 0}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => startEdit(row)}>
            Edit
          </Button>
          <Button variant="danger" size="sm" onClick={() => setDeleteId(row.memberId)}>
            Remove
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            Manage Members
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Add, edit, or remove Technophite Association core members
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <Button
            variant="secondary"
            onClick={loadMembers}
            className="text-xs shadow-sm"
            title="Refresh members list"
          >
            Refresh
          </Button>

          <Button
            variant="outline"
            onClick={() => setShowManualGuide(!showManualGuide)}
            className="text-xs shadow-sm"
          >
            {showManualGuide ? 'Hide Schema Guide' : 'Manual Firebase Guide'}
          </Button>

          <Button
            onClick={() => {
              setIsOpen(true);
              setEditMember(null);
            }}
            className="text-xs shadow-md"
          >
            + Add Member
          </Button>
        </div>
      </div>

      {/* ── Manual Schema Helper Card ── */}
      {showManualGuide && (
        <div
          className="p-6 rounded-2xl border space-y-4 shadow-md transition-all"
          style={{
            backgroundColor: 'var(--color-surface, #ffffff)',
            borderColor: 'var(--color-border, #cbd5e1)',
          }}
        >
          <div className="flex items-start justify-between pb-2 border-b" style={{ borderColor: 'var(--color-border, #e2e8f0)' }}>
            <div className="flex items-center gap-2.5">
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-sky-400">
                Manual Firebase Schema Guide for Members
              </h3>
            </div>
            <button
              onClick={() => setShowManualGuide(false)}
              className="text-sm font-bold px-2 py-1 rounded text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="Close Guide"
            >
              ✕
            </button>
          </div>

          <p className="text-sm sm:text-base font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
            If adding documents directly in <strong>Firebase Console &gt; Firestore Database</strong>, you can use the <code className="px-2 py-0.5 rounded font-mono font-bold bg-slate-200 dark:bg-slate-800 text-sky-800 dark:text-sky-300">members</code> collection with these fields:
          </p>

          <div className="overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--color-border, #cbd5e1)' }}>
            <table className="w-full text-sm sm:text-base text-left">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800 border-b" style={{ borderColor: 'var(--color-border, #cbd5e1)' }}>
                  <th className="py-3 px-4 font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs sm:text-sm">
                    Field Name
                  </th>
                  <th className="py-3 px-4 font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs sm:text-sm">
                    Type
                  </th>
                  <th className="py-3 px-4 font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs sm:text-sm">
                    Example Value
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y text-slate-800 dark:text-slate-200" style={{ borderColor: 'var(--color-border, #e2e8f0)' }}>
                <tr className="bg-amber-50/60 dark:bg-amber-950/20 font-medium">
                  <td className="py-3 px-4 font-mono font-bold text-amber-800 dark:text-amber-300">
                    Collection ID
                  </td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-semibold">
                    Collection
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-sky-800 dark:text-sky-300">
                    members
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-mono font-bold text-indigo-900 dark:text-indigo-300">
                    name
                  </td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">
                    string
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                    Bidisha
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-mono font-bold text-indigo-900 dark:text-indigo-300">
                    email
                  </td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">
                    string
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                    bidisha@example.com
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-mono font-bold text-indigo-900 dark:text-indigo-300">
                    phone
                  </td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">
                    string
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                    9876543210
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-mono font-bold text-indigo-900 dark:text-indigo-300">
                    profileImageUrl
                  </td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">
                    string
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100 text-xs font-mono">
                    https://... or data:image/jpeg;base64,...
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-mono font-bold text-indigo-900 dark:text-indigo-300">
                    post
                  </td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">
                    string
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                    President / Vice President / Secretary
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-mono font-bold text-indigo-900 dark:text-indigo-300">
                    department
                  </td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">
                    string
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                    Computer Science
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-mono font-bold text-indigo-900 dark:text-indigo-300">
                    order
                  </td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">
                    number
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                    1
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {loading && members.length === 0 ? (
        <div className="py-12 flex justify-center">
          <Loader />
        </div>
      ) : (
        <DataTable columns={columns} data={members} />
      )}

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={editMember ? 'Edit Association Member' : 'Add Association Member'}
      >
        <MemberForm
          initialData={editMember || {}}
          onSubmit={handleSubmit}
          loading={loading}
        />
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
