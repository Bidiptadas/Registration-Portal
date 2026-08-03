/** ConfirmDialog — "Are you sure?" confirmation modal. */
import Modal from './Modal';
import Button from './Button';
export default function ConfirmDialog({ isOpen, onClose, onConfirm, title = 'Confirm Action', message = 'Are you sure you want to proceed?', confirmText = 'Confirm', cancelText = 'Cancel', variant = 'danger' }) {
  return (<Modal isOpen={isOpen} onClose={onClose} title={title} size="sm"><p className="mb-6 text-sm" style={{ color: 'var(--color-text-secondary)' }}>{message}</p><div className="flex gap-3 justify-end"><Button variant="secondary" onClick={onClose}>{cancelText}</Button><Button variant={variant} onClick={() => { onConfirm(); onClose(); }}>{confirmText}</Button></div></Modal>);
}
