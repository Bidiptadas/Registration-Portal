/** StudentProfilePage — View and edit student profile. */
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import ProfileForm from '../../components/forms/ProfileForm';
import studentApi from '../../services/studentApi';
import { uploadProfileImage } from '../../firebase/storageService';
import Avatar from '../../components/common/Avatar';
import Loader from '../../components/common/Loader';
import { useNotification } from '../../context/NotificationContext';

export default function StudentProfilePage() {
  const { user, userProfile, refreshProfile, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const toast = useNotification();

  const handleUpdate = async (formData) => {
    setLoading(true);
    try {
      const profileImageUrl = imageFile ? await uploadProfileImage(imageFile, user.uid) : undefined;
      await studentApi.updateMyProfile({ ...formData, profileImageUrl });
      await refreshProfile();
      setImageFile(null);
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
      {authLoading && <Loader />}
      {!authLoading && !userProfile && <p style={{ color: 'var(--color-text-secondary)' }}>Your profile could not be loaded.</p>}
      {!authLoading && userProfile && (
        <>
          <div className="flex items-center gap-4 mb-6">
            <Avatar src={userProfile.profileImageUrl} name={userProfile.displayName || userProfile.display_name} size="xl" />
            <div>
              <p className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{userProfile.displayName || userProfile.display_name}</p>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{userProfile.email}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6" style={{ color: 'var(--color-text-secondary)' }}>
            <p><strong>Name:</strong> {userProfile.displayName || userProfile.display_name || '—'}</p>
            <p><strong>Email:</strong> {userProfile.email || '—'}</p>
            <p><strong>Phone:</strong> {userProfile.phone || '—'}</p>
            <p><strong>College:</strong> {userProfile.college || '—'}</p>
            <p><strong>Department:</strong> {userProfile.department || '—'}</p>
            <p><strong>Year:</strong> {userProfile.year || '—'}</p>
            <p><strong>Roll number:</strong> {userProfile.roll_number || userProfile.rollNumber || '—'}</p>
            <p><strong>Verification:</strong> {userProfile.emailVerified ? 'Verified' : 'Not verified'}</p>
            <p><strong>Created:</strong> {userProfile.createdAt?.toDate ? userProfile.createdAt.toDate().toLocaleDateString() : '—'}</p>
          </div>
          <ProfileForm initialData={userProfile} onSubmit={handleUpdate} onCancel={() => setImageFile(null)} onImageChange={setImageFile} loading={loading} />
        </>
      )}
    </div>
  );
}
