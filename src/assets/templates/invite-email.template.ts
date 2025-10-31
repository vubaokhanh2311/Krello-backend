export function inviteEmailTemplate(boardName: string, acceptLink: string) {
  return `
 <div
  style="
    font-family: 'Arial', sans-serif;
    background-color: #f4f6f8;
    padding: 40px 0;
  "
>
  <div
    style="
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    "
  >
    <!-- Header -->
    <div
      style="
        background-color: #0056d2;
        color: #ffffff;
        text-align: center;
        padding: 20px 0;
        font-size: 22px;
        font-weight: 700;
      "
    >
      Trello Clone – Board Invitation
    </div>

    <!-- Body -->
    <div style="padding: 32px; color: #333; font-size: 16px; line-height: 1.6">
      <p>Hi there,</p>
      <p>
        You’ve been invited to join the board <strong>"${boardName}"</strong>.
      </p>
      <p style="text-align: center; margin: 40px 0">
        <a
          href="${acceptLink}"
          style="
            background-color: #0056d2;
            color: #ffffff;
            text-decoration: none;
            padding: 14px 28px;
            border-radius: 8px;
            font-weight: bold;
            display: inline-block;
            font-size: 16px;
          "
        >
          Accept Invitation
        </a>
      </p>

      <hr style="margin: 40px 0; border: none; border-top: 1px solid #e0e0e0" />

      <p
        style="
          font-size: 12px;
          color: #999;
          text-align: center;
          line-height: 1.4;
        "
      >
        This invitation will expire in 7 days. If you did not expect this email,
        please ignore it.
      </p>
    </div>

    <!-- Footer -->
    <div
      style="
        background-color: #f4f6f8;
        text-align: center;
        padding: 16px;
        font-size: 12px;
        color: #999;
      "
    >
      &copy; 2025 Trello Clone. All rights reserved.
    </div>
  </div>
</div>
  `;
}
