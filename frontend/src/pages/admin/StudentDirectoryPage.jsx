/** StudentDirectoryPage — Student directory dashboard for searches/viewing. */
import { useEffect, useState } from 'react';
import studentApi from '../../services/studentApi';
import adminApi from '../../services/adminApi';
import DataTable from '../../components/common/DataTable';
import SearchBar from '../../components/common/SearchBar';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import { exportToCSV } from '../../utils/exportUtils';
import { useNotification } from '../../context/NotificationContext';

export default function StudentDirectoryPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useNotification();

  async function loadStudents() {
    try {
      const res = await studentApi.getAll({ limit: 100 });
      setStudents(res.data.data.students || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStudents();
  }, []);

  const handleSearch = async (query) => {
    if (!query) {
      loadStudents();
      return;
    }
    try {
      const res = await studentApi.getAll({ search: query });
      setStudents(res.data.data || []);
    } catch {
      toast.error('Search failed');
    }
  };

  const handleExport = async () => {
    try {
      const res = await adminApi.exportStudents();
      exportToCSV(res.data.data.students, 'tecnophite_students.csv');
      toast.success('Student report exported successfully.');
    } catch {
      toast.error('Export failed');
    }
  };

  const columns = [
    { key: 'displayName', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'college', label: 'College' },
    { key: 'department', label: 'Department' },
    { key: 'year', label: 'Year' },
    { key: 'rollNumber', label: 'Roll Number' },
  ];

  if (loading && students.length === 0) return <Loader />;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Student Directory</h1>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Search, view, and export student participant lists</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <SearchBar onSearch={handleSearch} placeholder="Search students..." className="w-full sm:w-64" />
          <Button onClick={handleExport} variant="secondary">📥 Export</Button>
        </div>
      </div>

      <DataTable columns={columns} data={students} />
    </div>
  );
}
