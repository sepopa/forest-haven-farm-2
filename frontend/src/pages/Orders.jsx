import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { IconClock, IconPin, IconCheck, IconMail } from "../components/icons";
import { submitOrder, fetchPickupDates, fetchBreadCatalog } from "../api";
import { useLanguage } from "../i18n/LanguageContext";
import PickupDatePicker from "../components/PickupDatePicker";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  pickup_date: "",
  pickup_location: "Farm Stand",
  notes: "",
};

function formatUSD(n) {
  return `$${n.toFixed(2)}`;
}

// Shown while the (free-tier) server wakes up after being idle.
const DATE_MESSAGES = {
  en: {
    loading: "Loading dates… (can take up to a minute)",
    failed: "Couldn't load the pickup dates.",
    retry: "Try again",
  },
  es: {
    loading: "Cargando fechas… (puede tardar hasta un minuto)",
    failed: "No se pudieron cargar las fechas de recogida.",
    retry: "Reintentar",
  },
};

export default function Orders() {
  const { t, lang } = useLanguage();
  const [catalog, setCatalog] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [items, setItems] = useState([]);
  const [draftBread, setDraftBread] = useState("");
  const [draftQty, setDraftQty] = useState(1);
  const [pickupDates, setPickupDates] = useState([]);
  const [datesLoading, setDatesLoading] = useState(true);
  const [datesFailed, setDatesFailed] = useState(false);
  const [policyAck, setPolicyAck] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'success' | 'error', text }
  const [submitting, setSubmitting] = useState(false);

  const loadDates = () => {
    setDatesLoading(true);
    setDatesFailed(false);
    fetchPickupDates()
      .then(setPickupDates)
      .catch(() => {
        setPickupDates([]);
        setDatesFailed(true);
      })
      .finally(() => setDatesLoading(false));
  };

  useEffect(loadDates, []);

  useEffect(() => {
    fetchBreadCatalog(lang)
      .then(setCatalog)
      .catch(() => setCatalog([]));
  }, [lang]);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const selectedDate = pickupDates.find((d) => d.date === form.pickup_date) || null;
  const cartTotal = items.reduce((sum, it) => sum + it.quantity, 0);
  const remainingForCart = selectedDate ? Math.max(selectedDate.remaining - cartTotal, 0) : 0;
  const orderTotal = items.reduce((sum, it) => sum + it.unit_price * it.quantity, 0);

  const usedBreadIds = new Set(items.map((it) => it.item_id));
  const availableCatalog = catalog.filter((c) => !usedBreadIds.has(c.id));

  const canAddMore = !!selectedDate && remainingForCart > 0;
  const maxDraftQty = Math.max(remainingForCart, 1);

  const changeDate = (iso) => {
    setForm((f) => ({ ...f, pickup_date: iso }));
    setItems([]); // capacity resets against the newly chosen date
  };

  const addItem = () => {
    const bread = catalog.find((c) => c.id === draftBread);
    if (!bread || !selectedDate) return;
    const qty = Math.min(Math.max(Number(draftQty) || 1, 1), remainingForCart);
    if (qty < 1) return;
    setItems((prev) => [...prev, { item_id: bread.id, bread_item: bread.name, unit_price: bread.price, quantity: qty }]);
    setDraftBread("");
    setDraftQty(1);
  };

  const removeItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!policyAck) {
      setStatus({ type: "error", text: t("orders.policyError") });
      return;
    }
    if (!form.pickup_date) {
      setStatus({ type: "error", text: t("orders.pickupDateError") });
      return;
    }
    if (items.length === 0) {
      setStatus({ type: "error", text: t("orders.cartEmptyError") });
      return;
    }
    setSubmitting(true);
    setStatus(null);
    try {
      const payloadItems = items.map((it) => ({ item_id: it.item_id, quantity: it.quantity }));
      await submitOrder({ ...form, items: payloadItems, policy_ack: policyAck, lang });
      setStatus({ type: "success", text: t("orders.successMsg") });
      // Keep the pickup date/location selected so the bread + quantity
      // controls stay usable right away for a second order — only the
      // per-customer fields and cart are cleared.
      setForm((f) => ({ ...initialForm, pickup_date: f.pickup_date, pickup_location: f.pickup_location }));
      setItems([]);
      setPolicyAck(false);
      loadDates();
    } catch (err) {
      setStatus({ type: "error", text: err.message || t("orders.errorMsg") });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <div className="breadcrumb"><Link to="/">{t("nav.home")}</Link> / {t("orders.breadcrumb")}</div>
          <span className="eyebrow">{t("orders.eyebrow")}</span>
          <h1>{t("orders.h1")}</h1>
          <p className="lede">{t("orders.lede")}</p>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="contact-grid">
            <div className="form-card">
              <h2>{t("orders.formTitle")}</h2>
              <p className="lede mt-2" style={{ marginBottom: "1.6rem" }}>{t("orders.formIntro")}</p>

              <form onSubmit={handleSubmit} noValidate>
                <div className="form-row">
                  <div className="field">
                    <label htmlFor="order-name">{t("orders.fullName")}</label>
                    <input id="order-name" required autoComplete="name" value={form.name} onChange={update("name")} />
                  </div>
                  <div className="field">
                    <label htmlFor="order-email">{t("orders.email")}</label>
                    <input id="order-email" type="email" required autoComplete="email" value={form.email} onChange={update("email")} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="field">
                    <label htmlFor="order-phone">{t("orders.phone")}</label>
                    <input id="order-phone" type="tel" required autoComplete="tel" value={form.phone} onChange={update("phone")} />
                  </div>
                  <div className="field">
                    <label htmlFor="order-pickup-date">{t("orders.pickupDate")}</label>
                    <PickupDatePicker
                      dates={pickupDates}
                      value={form.pickup_date}
                      onChange={changeDate}
                      placeholder={datesLoading ? (DATE_MESSAGES[lang] || DATE_MESSAGES.en).loading : t("orders.selectDate")}
                    />
                    {datesFailed && (
                      <p role="alert" style={{ marginTop: "0.5rem", fontSize: "0.9rem" }}>
                        {(DATE_MESSAGES[lang] || DATE_MESSAGES.en).failed}{" "}
                        <button type="button" className="btn btn-outline" onClick={loadDates}>
                          {(DATE_MESSAGES[lang] || DATE_MESSAGES.en).retry}
                        </button>
                      </p>
                    )}
                  </div>
                </div>

                <div className="field">
                  <label>{t("orders.bread")}</label>

                  <div className="order-cart">
                    {items.length === 0 ? (
                      <p className="order-cart-empty">{t("orders.cartEmpty")}</p>
                    ) : (
                      <table className="order-cart-table">
                        <thead>
                          <tr>
                            <th>{t("orders.bread")}</th>
                            <th>{t("orders.quantity")}</th>
                            <th>{t("orders.total")}</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((it, i) => (
                            <tr key={`${it.item_id}-${i}`}>
                              <td>{it.bread_item}</td>
                              <td>{it.quantity}</td>
                              <td>{formatUSD(it.unit_price * it.quantity)}</td>
                              <td>
                                <button type="button" className="order-cart-remove" onClick={() => removeItem(i)}>
                                  {t("orders.remove")}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="order-cart-total-row">
                            <td colSpan={2}>{t("orders.orderTotal")}</td>
                            <td colSpan={2}>{formatUSD(orderTotal)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    )}

                    {!selectedDate ? (
                      <p className="order-cart-hint">{t("orders.selectDateFirst")}</p>
                    ) : !canAddMore ? (
                      <p className="order-cart-hint">{t("orders.dateFullHint")}</p>
                    ) : (
                      <div className="order-cart-add">
                        <div className="field">
                          <label htmlFor="order-bread" className="visually-hidden">{t("orders.bread")}</label>
                          <select id="order-bread" value={draftBread} onChange={(e) => setDraftBread(e.target.value)}>
                            <option value="">{t("orders.selectLoaf")}</option>
                            {availableCatalog.map((opt) => (
                              <option key={opt.id} value={opt.id}>{opt.name} — {formatUSD(opt.price)}</option>
                            ))}
                          </select>
                        </div>
                        <div className="field qty-field">
                          <label htmlFor="order-qty" className="visually-hidden">{t("orders.quantity")}</label>
                          <input
                            id="order-qty"
                            type="number"
                            min="1"
                            max={maxDraftQty}
                            value={draftQty}
                            onChange={(e) => setDraftQty(e.target.value)}
                          />
                        </div>
                        <button type="button" className="btn btn-outline" onClick={addItem} disabled={!draftBread}>
                          {t("orders.addBread")}
                        </button>
                      </div>
                    )}
                    {selectedDate && (
                      <p className="order-cart-hint">
                        {t("orders.spotsLeft").replace("{n}", remainingForCart).replace("{max}", selectedDate.max_breads)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="field">
                  <label htmlFor="order-pickup-location">{t("orders.pickupLocation")}</label>
                  <select id="order-pickup-location" required value={form.pickup_location} onChange={update("pickup_location")}>
                    <option value="Farm Stand">{t("orders.farmStandOption")}</option>
                    <option value="Sylvan Ridge Farmers Market">{t("orders.marketOption")}</option>
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="order-notes">
                    {t("orders.notesLabel")} <span className="hint">{t("orders.optional")}</span>
                  </label>
                  <textarea
                    id="order-notes"
                    placeholder={t("orders.notesPlaceholder")}
                    value={form.notes}
                    onChange={update("notes")}
                  />
                </div>
                <div className="checkbox-row mb-2">
                  <input
                    type="checkbox"
                    id="order-policy"
                    checked={policyAck}
                    onChange={(e) => setPolicyAck(e.target.checked)}
                  />
                  <label htmlFor="order-policy">{t("orders.policyLabel")}</label>
                </div>
                <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
                  {submitting ? t("orders.submitting") : t("orders.submit")}
                </button>
                {status && <div className={`form-msg show ${status.type}`} role="status">{status.text}</div>}
              </form>
            </div>

            <div>
              <div className="order-summary">
                <h3>{t("orders.beforeOrderTitle")}</h3>
                <ul>
                  <li><IconClock /><span><strong>{t("orders.leadTimeBold")}</strong> {t("orders.leadTimeText")}</span></li>
                  <li><IconClock /><span><strong>{t("orders.cutoffBold")}</strong> {t("orders.cutoffText")}</span></li>
                  <li><IconPin /><span><strong>{t("orders.pickupSpotsBold")}</strong> {t("orders.pickupSpotsText")}</span></li>
                  <li><IconCheck /><span><strong>{t("orders.paymentBold")}</strong> {t("orders.paymentText")}</span></li>
                  <li><IconMail /><span><strong>{t("orders.confirmationBold")}</strong> {t("orders.confirmationText")}</span></li>
                </ul>
              </div>
              <div className="testimonial-card mt-2">
                <p className="quote">{t("orders.quote")}</p>
                <div className="testimonial-who">
                  <div className="testimonial-avatar"></div>
                  <div><strong>{t("orders.quoteWho")}</strong><span>{t("orders.quoteWhere")}</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
