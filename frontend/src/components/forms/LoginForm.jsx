/** LoginForm — shared login form component. */
import { useState } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';
export default function LoginForm({ onSubmit, loading = false, error = '' }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(email, password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div
          className="mb-4 rounded-xl p-4 text-base font-semibold"
          style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: 'var(--color-danger)' }}
        >
          {error}
        </div>
      )}
      <Input
        label="Email Address"
        name="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="e.g. johndoe@sju.edu.in"
        required
        icon="📧"
      />
      <Input
        label="Password"
        name="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
        required
        icon="🔒"
      />
      <Button type="submit" size="lg" loading={loading} fullWidth className="mt-2">
        Log In
      </Button>
    </form>
  );
}
