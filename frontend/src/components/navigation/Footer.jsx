/** Footer component - matches the public authentication footer style. */
import '../../layouts/AuthLayout.css';

export default function Footer() {
  return (
    <footer className="auth-layout__footer">
      <section>
        <h2>University Address</h2>
        <p>St Joseph University<br />36 Lalbagh Road<br />Bengaluru, Karnataka - 560027</p>
      </section>
      <section className="auth-layout__social">
        <h2>Contact Details</h2>
        <a href="https://instagram.com/sju_technophite" target="_blank" rel="noreferrer">Instagram</a>
        <a href="https://linkedin.com/company/sju-technophite" target="_blank" rel="noreferrer">LinkedIn</a>
      </section>
    </footer>
  );
}
