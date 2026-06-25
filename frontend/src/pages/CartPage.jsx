import { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { Dialog } from 'primereact/dialog';
import { InputNumber } from 'primereact/inputnumber';
import { Message } from 'primereact/message';
import { Toast } from 'primereact/toast';
import { pdfUrl } from '../api/client';
import { redeemApi } from '../api/resources';
import { useAuth } from '../state/AuthContext.jsx';
import { useCart } from '../state/CartContext.jsx';
import { voucherStatus } from '../utils/vouchers';

export default function CartPage() {
  const toast = useRef(null);
  const { user, refreshUser } = useAuth();
  const { cart, loadCart, updateQuantity, removeItem, loading } = useCart();
  const [result, setResult] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsVisible, setTermsVisible] = useState(false);

  useEffect(() => {
    loadCart();
  }, []);

  const notEnoughPoints = cart.totalPoints > (user?.points || 0);

  async function checkout() {
    setResult(null);
    try {
      const data = await redeemApi.cart();
      setResult(data);
      await loadCart();
      await refreshUser();
      toast.current.show({ severity: 'success', summary: 'Checkout complete', detail: data.message });
    } catch (err) {
      toast.current.show({
        severity: 'error',
        summary: 'Checkout failed',
        detail: err.response?.data?.message || 'Please try again.'
      });
    }
  }

  return (
    <>
      <Toast ref={toast} />
      <section className="page-header">
        <p className="eyebrow">Cart</p>
        <h1>Review and redeem</h1>
      </section>

      <div className="cart-layout">
        <div className="cart-items">
          {cart.items.map((item) => (
            <article className="cart-item" key={item._id}>
              <img src={item.voucher.image} alt={item.voucher.title} />
              <div>
                <h3>{item.voucher.title}</h3>
                <p>{item.voucher.points} points each</p>
                <small>{voucherStatus(item.voucher).label}</small>
              </div>
              <InputNumber value={item.quantity} onValueChange={(e) => updateQuantity(item._id, e.value || 1)} min={1} showButtons />
              <strong>{item.voucher.points * item.quantity} pts</strong>
              <Button icon="pi pi-trash" severity="danger" text rounded aria-label="Remove" onClick={() => removeItem(item._id)} />
            </article>
          ))}
          {!cart.items.length && <div className="empty-state">Your cart is empty.</div>}
        </div>

        <aside className="summary-panel">
          <h2>Total</h2>
          <p className="total-points">{cart.totalPoints} pts</p>
          <p className="muted">Your balance: {user?.points || 0} pts</p>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', margin: '1rem 0' }}>
            <Checkbox
              inputId="terms-accept"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.checked)}
            />
            <label htmlFor="terms-accept" style={{ cursor: 'pointer', fontSize: '0.9rem', lineHeight: '1.4' }}>
              I agree to the{' '}
              <button
                type="button"
                onClick={() => setTermsVisible(true)}
                style={{ background: 'none', border: 'none', padding: 0, color: 'var(--primary-color, #6366f1)', cursor: 'pointer', textDecoration: 'underline', fontSize: 'inherit' }}
              >
                Terms and Conditions
              </button>
            </label>
          </div>

          <Button
            label="Checkout and redeem"
            icon="pi pi-check"
            onClick={checkout}
            disabled={!cart.items.length || notEnoughPoints || !termsAccepted}
            loading={loading}
          />
          {notEnoughPoints && (
            <Message severity="warn" text="Not enough points for this cart. Reduce quantity or remove an item." />
          )}
          {result && (
            <Message severity="success" text={`Success. Remaining points: ${result.remainingPoints}`} />
          )}
          {result?.pdfUrl && (
            <a className="download-link" href={pdfUrl(result.pdfUrl)} target="_blank" rel="noreferrer">
              <i className="pi pi-file-pdf" /> Download voucher PDF
            </a>
          )}
        </aside>
      </div>

      <Dialog
        header="Terms and Conditions"
        visible={termsVisible}
        onHide={() => setTermsVisible(false)}
        modal
        style={{ maxWidth: '560px', width: '90vw' }}
      >
        <h3>Standard Carter Bank Voucher Terms</h3>
        <p>Vouchers are issued after successful points redemption and are subject to partner availability.</p>
        <p>Each coupon code is unique. Codes cannot be reused, exchanged for cash, or transferred after redemption.</p>
        <p>Expired vouchers and vouchers that have reached their redemption limit cannot be redeemed.</p>
        <p>Carter Bank may verify vouchers using the QR code and coupon code shown in the downloaded PDF.</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
          <Button
            label="I Agree"
            icon="pi pi-check"
            onClick={() => {
              setTermsAccepted(true);
              setTermsVisible(false);
            }}
          />
        </div>
      </Dialog>
    </>
  );
}
