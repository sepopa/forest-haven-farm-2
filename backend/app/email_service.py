"""Outbound email: order notifications and admin password-reset messages.

Uses plain smtplib against whatever SMTP relay is configured via env vars
(works with Gmail/Yahoo app passwords, SendGrid, Postmark, etc. — anything
that speaks SMTP). If SMTP_HOST isn't set (e.g. local dev with no mail
provider on hand), the email is logged to the console instead of sent, so
order submission and password reset never fail just because mail isn't
configured yet.
"""
import logging
import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

logger = logging.getLogger("forest_haven.email")

SMTP_HOST = os.getenv("SMTP_HOST")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
FROM_EMAIL = os.getenv("FROM_EMAIL", SMTP_USER or "no-reply@foresthavenfarm.example")
ORDER_NOTIFY_EMAIL = os.getenv("ORDER_NOTIFY_EMAIL", "epforest@yahoo.com")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")


def send_email(to: str, subject: str, html_body: str, text_body: str | None = None) -> None:
    if not SMTP_HOST:
        # No handler is guaranteed to be configured for this logger, so use
        # warning (Python's logging "handler of last resort" prints
        # WARNING+ to stderr) to make sure this is visible in dev.
        logger.warning("SMTP not configured — logging email instead of sending.\nTo: %s\nSubject: %s\n%s", to, subject, text_body or html_body)
        return

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = FROM_EMAIL
    msg["To"] = to
    if text_body:
        msg.attach(MIMEText(text_body, "plain"))
    msg.attach(MIMEText(html_body, "html"))

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
        server.starttls()
        if SMTP_USER and SMTP_PASSWORD:
            server.login(SMTP_USER, SMTP_PASSWORD)
        server.sendmail(FROM_EMAIL, [to], msg.as_string())


def _email_header_html() -> str:
    """Logo header shared by every outbound email, matching the site's look."""
    return f"""
      <div style="background:#FBF3E4;padding:22px 24px;border-radius:10px 10px 0 0;text-align:center;border-bottom:2px solid #8A4B2B;">
        <img src="{FRONTEND_URL}/assets/logo/logo-full.png" alt="Forest Haven Farm" style="max-width:220px;height:auto;display:inline-block;">
        <p style="margin:8px 0 0;font-size:12px;letter-spacing:0.06em;text-transform:uppercase;color:#8A4B2B;">Real Sourdough Bread</p>
      </div>
    """


def _order_bill_table_html(order) -> str:
    rows = "".join(
        f"""
        <tr>
          <td style="padding:8px 10px;border-bottom:1px solid #e6ddce;">{item.bread_item}</td>
          <td style="padding:8px 10px;border-bottom:1px solid #e6ddce;text-align:center;">{item.quantity}</td>
          <td style="padding:8px 10px;border-bottom:1px solid #e6ddce;text-align:right;">${item.unit_price:,.2f}</td>
          <td style="padding:8px 10px;border-bottom:1px solid #e6ddce;text-align:right;">${item.line_total:,.2f}</td>
        </tr>"""
        for item in order.items
    )

    return f"""
        <table style="width:100%;font-size:14px;margin-bottom:16px;">
          <tr><td style="color:#58493D;">Order #</td><td style="text-align:right;font-weight:bold;">{order.id}</td></tr>
          <tr><td style="color:#58493D;">Placed</td><td style="text-align:right;">{order.created_at.strftime('%b %d, %Y')}</td></tr>
          <tr><td style="color:#58493D;">Pickup date</td><td style="text-align:right;">{order.pickup_date}</td></tr>
          <tr><td style="color:#58493D;">Pickup location</td><td style="text-align:right;">{order.pickup_location}</td></tr>
        </table>

        <h3 style="font-size:13px;text-transform:uppercase;letter-spacing:0.04em;color:#8A4B2B;margin:0 0 6px;">Bill To</h3>
        <p style="margin:0 0 16px;font-size:14px;line-height:1.5;">
          {order.name}<br>{order.email}<br>{order.phone}
        </p>

        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <thead>
            <tr style="background:#F3E6CE;">
              <th style="padding:8px 10px;text-align:left;">Item</th>
              <th style="padding:8px 10px;text-align:center;">Qty</th>
              <th style="padding:8px 10px;text-align:right;">Unit</th>
              <th style="padding:8px 10px;text-align:right;">Total</th>
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </table>

        <table style="width:100%;font-size:15px;margin-top:12px;">
          <tr>
            <td style="font-weight:bold;">Total Due</td>
            <td style="text-align:right;font-weight:bold;font-size:18px;color:#5E3119;">${order.total_amount:,.2f}</td>
          </tr>
        </table>

        {f'<p style="margin-top:16px;font-size:13px;color:#58493D;"><strong>Notes:</strong> {order.notes}</p>' if order.notes else ""}
    """


def render_order_bill_html(order) -> str:
    """Renders an order as an invoice/bill — used for the admin notification
    email and structurally mirrored by the admin order-detail print view."""
    return f"""
    <div style="font-family:Georgia,'Times New Roman',serif;max-width:560px;margin:0 auto;color:#2B2420;">
      {_email_header_html()}
      <div style="border:1px solid #e6ddce;border-top:none;padding:20px 24px;border-radius:0 0 10px 10px;">
        {_order_bill_table_html(order)}
        <p style="margin-top:20px;font-size:12px;color:#58493D;">Payment is due at pickup.</p>
      </div>
    </div>
    """


def render_order_confirmation_html(order) -> str:
    """Customer-facing confirmation — same branded bill, with a thank-you note."""
    return f"""
    <div style="font-family:Georgia,'Times New Roman',serif;max-width:560px;margin:0 auto;color:#2B2420;">
      {_email_header_html()}
      <div style="border:1px solid #e6ddce;border-top:none;padding:20px 24px;border-radius:0 0 10px 10px;">
        <p style="font-size:15px;line-height:1.6;margin:0 0 18px;">
          Thanks! Your order request was received — we'll confirm by email or phone within 24 hours.
        </p>
        {_order_bill_table_html(order)}
        <p style="margin-top:20px;font-size:12px;color:#58493D;">Payment is due at pickup. Thank you for supporting the farm!</p>
      </div>
    </div>
    """


def send_order_notification(order, db=None) -> None:
    subject = f"New order #{order.id} — {order.name} (pickup {order.pickup_date})"
    html = render_order_bill_html(order)
    recipient = ORDER_NOTIFY_EMAIL
    if db is not None:
        try:
            from . import content_service

            recipient = content_service.get_parameters(db).get("orderNotifyEmail") or recipient
        except Exception:
            logger.exception("Falling back to env ORDER_NOTIFY_EMAIL for order #%s", order.id)
    try:
        send_email(recipient, subject, html)
    except Exception:
        logger.exception("Failed to send order notification email for order #%s", order.id)


def send_order_confirmation(order) -> None:
    subject = f"Forest Haven Farm — order #{order.id} received"
    html = render_order_confirmation_html(order)
    try:
        send_email(order.email, subject, html)
    except Exception:
        logger.exception("Failed to send order confirmation email for order #%s", order.id)


def send_username_reminder(admin) -> None:
    subject = "Forest Haven Farm admin — your username"
    forgot_password_link = f"{FRONTEND_URL}/admin/forgot-password"
    html = f"""
    <div style="font-family:Georgia,'Times New Roman',serif;max-width:480px;margin:0 auto;color:#2B2420;">
      {_email_header_html()}
      <div style="border:1px solid #e6ddce;border-top:none;padding:20px 24px;border-radius:0 0 10px 10px;">
        <h2 style="color:#5E3119;font-size:18px;margin-top:0;">Username reminder</h2>
        <p style="font-size:15px;line-height:1.6;">Your admin username is:</p>
        <p style="font-size:20px;font-weight:bold;color:#5E3119;margin:0 0 18px;">{admin.username}</p>
        <p style="font-size:14px;line-height:1.6;">Need to reset your password too? Head back to the
          <a href="{forgot_password_link}" style="color:#8A4B2B;">forgot password page</a> and enter your username there.</p>
        <p style="font-size:12px;color:#58493D;margin-top:16px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    </div>
    """
    try:
        send_email(admin.email, subject, html)
    except Exception:
        logger.exception("Failed to send username reminder email to %s", admin.email)


def send_password_reset(admin, reset_link: str) -> None:
    subject = "Forest Haven Farm admin — password reset"
    html = f"""
    <div style="font-family:Georgia,'Times New Roman',serif;max-width:480px;margin:0 auto;color:#2B2420;">
      {_email_header_html()}
      <div style="border:1px solid #e6ddce;border-top:none;padding:20px 24px;border-radius:0 0 10px 10px;">
        <h2 style="color:#5E3119;font-size:18px;margin-top:0;">Password reset requested</h2>
        <p style="font-size:14px;">Your admin username is <strong>{admin.username}</strong>.</p>
        <p style="font-size:14px;">Click the button below to set a new password. This link expires in 1 hour.</p>
        <p><a href="{reset_link}" style="display:inline-block;background:#8A4B2B;color:#FBF3E4;padding:10px 18px;border-radius:6px;text-decoration:none;">Reset your password</a></p>
        <p style="font-size:12px;color:#58493D;margin-top:16px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    </div>
    """
    try:
        send_email(admin.email, subject, html)
    except Exception:
        logger.exception("Failed to send password reset email to %s", admin.email)
