/** ManageEventHeadsPage — Manage Event Heads assignees. */
import { useEffect, useState } from 'react';
import associationApi from '../../services/associationApi';
import DataTable from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import { useNotification } from '../../context/NotificationContext';
import ConfirmDialog from '../../components/common/ConfirmDialog';

export default function ManageEventHeadsPage() {
  const [heads, setHeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', department: '' });
  const [editId, setEditId] = useState(null);
  const toast = useNotification();

  async function loadHeads() {
    try {
      const res = await associationApi.getEventHeads();
      setHeads(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHeads();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editId) {
        await associationApi.updateEventHead(editId, form);
        toast.success('Event head updated');
      } else {
        await associationApi.createEventHead(form);
        toast.success('Event head created');
      }
      setIsOpen(false);
      setForm({ name: '', email: '', phone: '', department: '' });
      setEditId(null);
      loadHeads();
    } catch {
      toast.error('Failed to save event head');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await associationApi.deleteEventHead(deleteId);
      toast.success('Event head deleted');
      loadHeads();
    } catch {
      toast.error('Failed to delete event head');
    }
  };

  const startEdit = (row) => {
    setForm({ name: row.name, email: row.email, phone: row.phone, department: row.department });
    setEditId(row.headId);
    setIsOpen(true);
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'department', label: 'Department' },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => startEdit(row)}>Edit</Button>
          <Button variant="danger" size="sm" onClick={() => setDeleteId(row.headId)}>Delete</Button>
        </div>
      ),
    },
  ];

  if (loading && heads.length === 0) return <Loader />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Event Heads</h1>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Manage coordinators who lead each event</p>
        </div>
        <Button onClick={() => { setIsOpen(true); setEditId(null); setForm({ name: '', email: '', phone: '', department: '' }); }}>+ Add Coordinator</Button>
      </div>

      <DataTable columns={columns} data={heads} />

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={editId ? 'Edit Coordinator' : 'Add Coordinator'}>
        <form onSubmit={handleSubmit}>
          <Input label="Name" name="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Email" name="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <Input label="Phone" name="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
          <Input label="Department" name="department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} required />
          <Button type="submit" loading={loading} fullWidth className="mt-4">Save</Button>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Coordinator"
        message="Are you sure you want to remove this coordinator? This will affect assigned events."
      />
    </div>
  );
}
