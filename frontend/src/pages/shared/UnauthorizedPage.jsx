/** UnauthorizedPage — 403 handler. */
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
export default function UnauthorizedPage() {
  return (<div className="min-h-screen flex flex-col items-center justify-center text-center p-6" style={{ backgroundColor: 'var(--color-background)' }}><span className="text-8xl mb-4">🚫</span><h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>403 - Access Denied</h1><p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)', maxWidth: '24rem' }}>You do not have administrative permissions to view this resource.</p><Link to="/dashboard"><Button>Back to Dashboard</Button></Link></div>);
}
