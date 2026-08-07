"""Notification helpers.

Sends a lightweight new-lead alert to the RYC team when a new lead lands.

Supports TWO providers (whichever env vars are set — first match wins):

1) Resend (recommended, quick to set up)
   RESEND_API_KEY=xxx
   NOTIFY_FROM_EMAIL=onboarding@resend.dev  (Resend's sandbox from address)
   NOTIFY_TO_EMAIL=inforouteyourcareer@gmail.com

2) SMTP (works with Gmail app password)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=inforouteyourcareer@gmail.com
   SMTP_PASS=your-app-password
   NOTIFY_TO_EMAIL=inforouteyourcareer@gmail.com

If neither is set, notifications are quietly skipped so the API keeps working.
"""
import os
import smtplib
import logging
import asyncio
import ssl
from email.mime.text import MIMEText
import httpx

log = logging.getLogger(__name__)


def _fmt_lead(lead: dict) -> tuple[str, str]:
    subject = f"[RYC] New {lead.get('type','lead')}: {lead.get('name','?')} \u00b7 {lead.get('country') or 'no country'}"
    body_lines = [
        f"Name:        {lead.get('name','-')}",
        f"Phone:       {lead.get('phone','-')}",
        f"Email:       {lead.get('email') or '-'}",
        f"Country:     {lead.get('country') or '-'}",
        f"NEET score:  {lead.get('neet_score') or '-'}",
        f"Source:      {lead.get('source') or '-'}",
        f"Type:        {lead.get('type') or '-'}",
        f"Message:     {lead.get('message') or '-'}",
        f"Created at:  {lead.get('created_at')}",
        "",
        "\u2014 RYC lead notifier",
    ]
    return subject, "\n".join(body_lines)


async def _send_resend(subject: str, body: str) -> bool:
    key = os.environ.get("RESEND_API_KEY")
    to = os.environ.get("NOTIFY_TO_EMAIL", "inforouteyourcareer@gmail.com")
    frm = os.environ.get("NOTIFY_FROM_EMAIL", "onboarding@resend.dev")
    if not key:
        return False
    try:
        async with httpx.AsyncClient(timeout=15) as c:
            r = await c.post(
                "https://api.resend.com/emails",
                headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
                json={"from": frm, "to": [to], "subject": subject, "text": body},
            )
        if r.status_code >= 300:
            log.warning("Resend failed %s: %s", r.status_code, r.text[:200])
            return False
        return True
    except Exception as e:
        log.warning("Resend error: %s", e)
        return False


def _send_smtp_sync(subject: str, body: str) -> bool:
    host = os.environ.get("SMTP_HOST")
    if not host:
        return False
    port = int(os.environ.get("SMTP_PORT", "587"))
    user = os.environ.get("SMTP_USER")
    pw = os.environ.get("SMTP_PASS")
    to = os.environ.get("NOTIFY_TO_EMAIL", "inforouteyourcareer@gmail.com")
    frm = os.environ.get("NOTIFY_FROM_EMAIL", user or to)
    try:
        msg = MIMEText(body, "plain", "utf-8")
        msg["Subject"] = subject
        msg["From"] = frm
        msg["To"] = to
        ctx = ssl.create_default_context()
        with smtplib.SMTP(host, port, timeout=15) as s:
            s.ehlo()
            s.starttls(context=ctx)
            s.ehlo()
            if user and pw:
                s.login(user, pw)
            s.sendmail(frm, [to], msg.as_string())
        return True
    except Exception as e:
        log.warning("SMTP error: %s", e)
        return False


async def notify_new_lead(lead: dict) -> None:
    """Fire-and-forget lead notification. Never raises."""
    try:
        subject, body = _fmt_lead(lead)
        if await _send_resend(subject, body):
            return
        # SMTP is sync; run in a worker so we don't block the event loop
        loop = asyncio.get_running_loop()
        ok = await loop.run_in_executor(None, _send_smtp_sync, subject, body)
        if not ok:
            log.info("Lead notification skipped: no email provider configured")
    except Exception as e:
        log.exception("notify_new_lead error: %s", e)
