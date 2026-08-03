/** StudentProfilePage — View and edit student profile. */
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import ProfileForm from '../../components/forms/ProfileForm';
import studentApi from '../../services/studentApi';
import { useNotification } from '../../context/NotificationContext';

export default function StudentProfilePage() {
  const { userProfile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const toast = useNotification();

  const handleUpdate = async (formData) => {
    setLoading(true);
    try {
      await studentApi.updateMyProfile(formData);
      await refreshProfile();
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto rounded-xl p-6 shadow-sm" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
      <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>Student Profile</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>Update your profile details</p>
      {userProfile && (
        <ProfileForm initialData={userProfile} onSubmit={handleUpdate} loading={loading} />
      )}
    </div>
  );
}
