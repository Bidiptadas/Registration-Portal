import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import Footer from '../../components/navigation/Footer';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
        <span className="text-8xl mb-4"></span>
        <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>404 - Page Not Found</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)', maxWidth: '24rem' }}>The page you are looking for does not exist or has been moved.</p>
        <Link to="/"><Button>Back to Home</Button></Link>
      </div>
      <Footer />
    </div>
  );
}
