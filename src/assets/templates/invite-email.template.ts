export function inviteEmailTemplate(
  boardName: string,
  acceptLink: string,
): string {
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
      Krello – Lời mời tham gia bảng
    </div>

    <!-- Body -->
    <div style="padding: 32px; color: #333; font-size: 16px; line-height: 1.6">
      <p>Xin chào,</p>
      <p>
        Bạn đã được mời tham gia bảng <strong>"${boardName}"</strong>.
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
          Chấp nhận lời mời
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
        Lời mời này sẽ hết hạn sau 7 ngày. Nếu bạn không mong đợi email này,
        vui lòng bỏ qua.
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
      &copy; 2025 Trello Clone. Đã đăng ký bản quyền.
    </div>
  </div>
</div>
  `;
}
