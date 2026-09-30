import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getOrder, updateOrderStatus } from "../../api";

const STATUSES = ["new", "confirmed", "fulfilled", "cancelled"];

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getOrder(id)
      .then(setOrder)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const changeStatus = async (status) => {
    setOrder((prev) => ({ ...prev, status }));
    try {
      await updateOrderStatus(id, status);
    } catch (err) {
      setError(err.message);
      load();
    }
  };

  if (loading) return <div className="admin-page"><p>Loading…</p></div>;
  if (error) return <div className="admin-page"><div className="admin-error">{error}</div></div>;
  if (!order) return null;

  return (
    <div className="admin-page">
      <div className="admin-page-head no-print">
        <div>
          <Link to="/admin/orders" className="admin-back-link">← Back to Orders</Link>
          <h1>Order #{order.id}</h1>
          <p className="admin-page-desc">Placed {new Date(order.created_at).toLocaleString()}</p>
        </div>
        <div className="admin-actions">
          <label className="admin-order-status-select">
            Status
            <select value={order.status} onChange={(e) => changeStatus(e.target.value)}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>
          <button type="button" className="admin-btn admin-btn-primary" onClick={() => window.print()}>
            Print / Save as PDF
          </button>
        </div>
      </div>

      <div className="order-bill">
        <div className="order-bill-head">
          <div>
            <h2>Forest Haven Farm</h2>
            <p>Real Sourdough Bread</p>
          </div>
          <div className="order-bill-meta">
            <div><span>Order #</span><strong>{order.id}</strong></div>
            <div><span>Date Placed</span><strong>{new Date(order.created_at).toLocaleDateString()}</strong></div>
            <div><span>Status</span><strong>{order.status}</strong></div>
          </div>
        </div>

        <div className="order-bill-parties">
          <div>
            <h3>Bill To</h3>
            <p>{order.name}<br />{order.email}<br />{order.phone}</p>
          </div>
          <div>
            <h3>Pickup</h3>
            <p>{order.pickup_date}<br />{order.pickup_location}</p>
          </div>
        </div>

        <table className="order-bill-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th>Line Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((it) => (
              <tr key={it.id}>
                <td>{it.bread_item}</td>
                <td>{it.quantity}</td>
                <td>${it.unit_price.toFixed(2)}</td>
                <td>${it.line_total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3}>Total Due</td>
              <td>${order.total_amount.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>

        {order.notes && (
          <div className="order-bill-notes">
            <h3>Notes</h3>
            <p>{order.notes}</p>
          </div>
        )}

        <p className="order-bill-footer">Payment is due at pickup. Thank you for supporting the farm!</p>
      </div>
    </div>
  );
}
