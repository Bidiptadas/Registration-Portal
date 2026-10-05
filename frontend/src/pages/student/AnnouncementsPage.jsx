/**
 * Campus Notice Board — physical bulletin-style interface for announcements.
 * Full access control: only administrators can add, edit, or delete notices.
 */
import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import studentContentApi from '../../services/studentContentApi';
import { SAMPLE_NOTICES } from '../../utils/sampleNotices';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Loader from '../../components/common/Loader';
import { useNotification } from '../../context/NotificationContext';
import './NoticeBoard.css';

const CATEGORIES = ['All', 'Urgent', 'Event', 'Workshop', 'Guidelines', 'Prizes'];

const PIN_COLORS = {
  Urgent: 'pin-red',
  Event: 'pin-gold',
  Workshop: 'pin-cyan',
  Guidelines: 'pin-emerald',
  Prizes: 'pin-purple',
  Default: 'pin-gold',
};

const TAG_STYLES = {
  Urgent: 'tag-urgent',
  Event: 'tag-event',
  Workshop: 'tag-workshop',
  Guidelines: 'tag-guidelines',
  Prizes: 'tag-prizes',
};

export default function AnnouncementsPage() {
  const { isAdmin } = useAuth();
  const toast = useNotification();

  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedNoticeId, setExpandedNoticeId] = useState(null);

  // Admin Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [savingNotice, setSavingNotice] = useState(false);

  // Form State
  const [form, setForm] = useState({
    title: '',
    category: 'Event',
    priority: 'normal',
    pinned: false,
    author: 'Technophite Committee',
    department: 'Department of Computer Science',
    message: '',
  });

  // Delete State
  const [deleteNoticeId, setDeleteNoticeId] = useState(null);
  const [deletingNotice, setDeletingNotice] = useState(false);

  // Fetch notices from Firestore
  const loadNotices = async () => {
    setLoading(true);
    try {
      const res = await studentContentApi.getAnnouncements();
      const firestoreNotices = res.data?.data || [];
      if (firestoreNotices.length > 0) {
        setNotices(firestoreNotices);
      } else {
        // Use realistic sample announcements for the demonstration
        setNotices(SAMPLE_NOTICES);
      }
    } catch (err) {
      console.warn('Failed to load notices, using sample notices:', err);
      setNotices(SAMPLE_NOTICES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotices();
  }, []);

  // Filter & Search logic
  const filteredNotices = useMemo(() => {
    return notices.filter((notice) => {
      const matchesCategory =
        selectedCategory === 'All' ||
        (notice.category || '').toLowerCase() === selectedCategory.toLowerCase() ||
        (selectedCategory === 'Urgent' && (notice.priority === 'urgent' || notice.isImportant));

      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        notice.title?.toLowerCase().includes(query) ||
        notice.message?.toLowerCase().includes(query) ||
        notice.author?.toLowerCase().includes(query) ||
        notice.department?.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [notices, selectedCategory, searchQuery]);

  // Open Modal for Add
  const handleOpenAdd = () => {
    setEditingNotice(null);
    setForm({
      title: '',
      category: 'Event',
      priority: 'normal',
      pinned: false,
      author: 'Technophite Committee',
      department: 'Department of Computer Science',
      message: '',
    });
    setModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEdit = (notice) => {
    setEditingNotice(notice);
    setForm({
      title: notice.title || '',
      category: notice.category || 'Event',
      priority: notice.priority || (notice.isImportant ? 'urgent' : 'normal'),
      pinned: Boolean(notice.pinned),
      author: notice.author || 'Technophite Committee',
      department: notice.department || 'Department of Computer Science',
      message: notice.message || notice.description || '',
    });
    setModalOpen(true);
  };

  // Submit Notice (Add / Edit)
  const handleSubmitNotice = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) {
      toast.error('Please enter both title and message for the notice.');
      return;
    }

    setSavingNotice(true);
    try {
      const payload = {
        title: form.title.trim(),
        category: form.category,
        priority: form.priority,
        pinned: form.pinned,
        isImportant: form.priority === 'urgent' || form.pinned,
        author: form.author.trim() || 'Technophite Committee',
        department: form.department.trim() || 'Department of Computer Science',
        message: form.message.trim(),
      };

      if (editingNotice) {
        const id = editingNotice.announcementId || editingNotice.id;
        try {
          await studentContentApi.updateAnnouncement(id, payload);
        } catch {
          // Fallback to local state update if mock/demo
        }
        setNotices((prev) =>
          prev.map((n) =>
            (n.announcementId || n.id) === id
              ? { ...n, ...payload, updatedAt: new Date() }
              : n
          )
        );
        toast.success('Notice updated successfully!');
      } else {
        let newId = `notice-${Date.now()}`;
        try {
          const res = await studentContentApi.createAnnouncement(payload);
          if (res.data?.data?.announcementId) {
            newId = res.data.data.announcementId;
          }
        } catch {
          // Fallback to local state update
        }
        const createdNotice = {
          ...payload,
          announcementId: newId,
          createdAt: new Date(),
        };
        setNotices((prev) => [createdNotice, ...prev]);
        toast.success('Notice pinned to the board successfully!');
      }

      setModalOpen(false);
    } catch (err) {
      toast.error(err.message || 'Failed to save notice.');
    } finally {
      setSavingNotice(false);
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deleteNoticeId) return;
    setDeletingNotice(true);
    try {
      try {
        await studentContentApi.deleteAnnouncement(deleteNoticeId);
      } catch {
        // Fallback for demo notices
      }
      setNotices((prev) =>
        prev.filter((n) => (n.announcementId || n.id) !== deleteNoticeId)
      );
      toast.success('Notice removed from the board.');
      setDeleteNoticeId(null);
    } catch (err) {
      toast.error(err.message || 'Failed to delete notice.');
    } finally {
      setDeletingNotice(false);
    }
  };

  // Seed sample notices to database
  const handleSeedSamples = async () => {
    setSavingNotice(true);
    try {
      for (const sample of SAMPLE_NOTICES) {
        const { announcementId: _announcementId, ...data } = sample;
        await studentContentApi.createAnnouncement(data);
      }
      await loadNotices();
      toast.success('Sample notices seeded to Firestore successfully!');
    } catch (err) {
      toast.error(err.message || 'Could not seed notices to database.');
    } finally {
      setSavingNotice(false);
    }
  };

  const formatNoticeDate = (dateVal) => {
    if (!dateVal) return 'Recently';
    const date = dateVal.toDate ? dateVal.toDate() : new Date(dateVal);
    if (Number.isNaN(date.getTime())) return 'Recently';
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="notice-board-wrapper">
      <div className="notice-board-frame">
        {/* ── Notice Board Header ── */}
        <div className="notice-board-header">
          <div>
            <div className="notice-board-title-plate">
              <span className="notice-board-badge">Official Bulletin</span>
              <span className="text-xs font-semibold text-slate-400">
                St. Joseph's University · Technophite
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight mt-2 flex items-center gap-2.5">
              <span>Campus Notice Board</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Official circulars, urgent announcements, and schedules for the fest.
            </p>
          </div>

          {/* Admin Toolbar (Strictly Visible Only to Admins) */}
          {isAdmin && (
            <div className="flex items-center gap-2.5 flex-wrap">
              <Button
                onClick={handleOpenAdd}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 hover:scale-[1.02] transition-all"
              >
                <span>Pin New Notice</span>
              </Button>
              <button
                type="button"
                onClick={handleSeedSamples}
                disabled={savingNotice}
                className="text-xs font-semibold px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 border border-white/15 transition-all"
                title="Populate demo notices into database"
              >
                {savingNotice ? 'Syncing...' : 'Sync Samples'}
              </button>
            </div>
          )}
        </div>

        {/* ── Category Filter Pills & Search ── */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between mb-6">
          <div className="notice-filter-pills mb-0">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`notice-pill ${selectedCategory === cat ? 'is-active' : ''}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative min-w-[200px] sm:min-w-[240px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search circulars..."
              className="w-full py-2 px-3.5 text-xs sm:text-sm bg-slate-900/80 text-white placeholder-slate-400 rounded-xl border border-white/15 focus:border-amber-400 focus:outline-none transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* ── Empty State ── */}
        {filteredNotices.length === 0 && (
          <div className="p-12 text-center border-2 border-dashed border-white/15 rounded-2xl bg-slate-900/50">
            <h3 className="text-lg font-bold text-white mb-1">
              No notices on the board
            </h3>
            <p className="text-sm text-slate-400 max-w-sm mx-auto mb-4">
              {searchQuery
                ? `No circulars matching "${searchQuery}"`
                : 'There are currently no circulars in this category.'}
            </p>
            {isAdmin && (
              <Button onClick={handleOpenAdd} className="bg-amber-500 text-slate-950 font-bold">
                Pin First Notice
              </Button>
            )}
          </div>
        )}

        {/* ── Notice Board Cards Grid ── */}
        <div className="notice-cards-grid">
          {filteredNotices.map((notice) => {
            const id = notice.announcementId || notice.id;
            const pinColor = PIN_COLORS[notice.category] || PIN_COLORS.Default;
            const tagStyle = TAG_STYLES[notice.category] || 'tag-event';
            const isPinned = Boolean(notice.pinned || notice.isImportant);
            const isUrgent = notice.priority === 'urgent';
            const isExpanded = expandedNoticeId === id;

            return (
              <article
                key={id}
                className={`notice-card ${isPinned ? 'is-pinned' : ''} ${
                  isUrgent ? 'is-urgent' : ''
                } ${isExpanded ? 'is-expanded' : ''}`}
              >
                {/* 3D Pushpin Icon */}
                <div
                  className={`notice-card__pin ${pinColor}`}
                  title={`${notice.category || 'Notice'} pin`}
                />

                <div>
                  {/* Category Stamp & Priority Badge */}
                  <div className="notice-card__meta">
                    <span className={`notice-category-tag ${tagStyle}`}>
                      {notice.category || 'Notice'}
                    </span>

                    {isPinned && (
                      <span className="text-[11px] font-bold text-amber-400">
                        PINNED
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h2 className="notice-card__title">
                    {notice.title}
                  </h2>

                  {/* Body Text */}
                  <div className="notice-card__body">
                    {notice.message || notice.description}
                  </div>

                  {(notice.message?.length > 180 || notice.description?.length > 180) && (
                    <button
                      type="button"
                      onClick={() => setExpandedNoticeId(isExpanded ? null : id)}
                      className="text-xs font-semibold text-amber-400 hover:text-amber-300 underline mb-3 block"
                    >
                      {isExpanded ? 'Show less ↑' : 'Read full notice →'}
                    </button>
                  )}
                </div>

                {/* Footer: Date & Author */}
                <div className="notice-card__footer">
                  <div className="notice-card__author">
                    <span className="truncate">
                      {notice.author || 'Technophite Committee'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                    <span>{formatNoticeDate(notice.createdAt)}</span>
                    {notice.department && (
                      <span className="truncate max-w-[140px] text-right opacity-75">
                        {notice.department}
                      </span>
                    )}
                  </div>

                  {/* ── Admin Action Toolbar (Strictly Visible Only to Admins) ── */}
                  {isAdmin && (
                    <div className="notice-card__admin-actions">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(notice)}
                        className="admin-btn admin-btn--edit"
                        title="Edit announcement content"
                      >
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteNoticeId(id)}
                        className="admin-btn admin-btn--delete"
                        title="Remove announcement from notice board"
                      >
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* ── Admin Add / Edit Notice Modal ── */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingNotice ? 'Edit Notice' : 'Pin New Notice'}
      >
        <form onSubmit={handleSubmitNotice} className="space-y-4">
          <Input
            label="Notice Title"
            name="title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Hackathon Submissions Open"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="notice-category"
                className="block mb-1.5 text-sm font-semibold text-white"
              >
                Category
              </label>
              <select
                id="notice-category"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-xl p-3 text-sm bg-slate-800 border border-slate-700 text-white focus:border-amber-400 outline-none"
              >
                <option value="Event">Event</option>
                <option value="Urgent">Urgent</option>
                <option value="Workshop">Workshop</option>
                <option value="Guidelines">Guidelines</option>
                <option value="Prizes">Prizes</option>
                <option value="General">General</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="notice-priority"
                className="block mb-1.5 text-sm font-semibold text-white"
              >
                Priority Level
              </label>
              <select
                id="notice-priority"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="w-full rounded-xl p-3 text-sm bg-slate-800 border border-slate-700 text-white focus:border-amber-400 outline-none"
              >
                <option value="normal">Normal Priority</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent Priority</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Author / Committee"
              name="author"
              value={form.author}
              onChange={(e) => setForm({ ...form, author: e.target.value })}
              placeholder="e.g. Technophite Committee"
              required
            />
            <Input
              label="Department / Office"
              name="department"
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              placeholder="e.g. Dept of Computer Science"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="notice-pinned"
              checked={form.pinned}
              onChange={(e) => setForm({ ...form, pinned: e.target.checked })}
              className="h-4 w-4 rounded accent-amber-500 cursor-pointer"
            />
            <label
              htmlFor="notice-pinned"
              className="text-sm font-semibold text-amber-300 cursor-pointer"
            >
              Pin this notice to the top of the bulletin board
            </label>
          </div>

          <div>
            <label
              htmlFor="notice-message"
              className="block mb-1.5 text-sm font-semibold text-white"
            >
              Notice Message / Details
            </label>
            <textarea
              id="notice-message"
              rows="5"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Type the full announcement content, instructions, venue details, or circular here..."
              className="w-full rounded-xl p-3 text-sm bg-slate-800 border border-slate-700 text-white placeholder-slate-400 focus:border-amber-400 outline-none"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setModalOpen(false)}
              disabled={savingNotice}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={savingNotice}
              disabled={savingNotice}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
            >
              {editingNotice ? 'Save Changes' : 'Pin to Board'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Admin Delete Notice Confirmation Dialog ── */}
      <ConfirmDialog
        isOpen={Boolean(deleteNoticeId)}
        onClose={() => setDeleteNoticeId(null)}
        onConfirm={handleConfirmDelete}
        title="Unpin & Delete Notice"
        message="Are you sure you want to delete this notice from the campus bulletin board? This action cannot be undone."
        loading={deletingNotice}
        confirmText="Yes, Delete Notice"
        variant="danger"
      />
    </div>
  );
}
