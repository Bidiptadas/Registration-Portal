import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import Footer from '../../components/navigation/Footer';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
        <div className="w-20 h-20 mb-6 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-danger)' }}>
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>403 - Access Denied</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)', maxWidth: '24rem' }}>You do not have administrative permissions to view this resource.</p>
        <Link to="/dashboard"><Button>Back to Dashboard</Button></Link>
      </div>
      <Footer />
    </div>
  );
}
