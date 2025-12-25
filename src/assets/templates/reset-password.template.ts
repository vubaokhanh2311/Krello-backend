export const resetPasswordEmailTemplate = (
  resetLink: string,
  expiresInMinutes = 15,
) => `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Đặt lại mật khẩu Krello</title>
    <style>
        /* Reset styles */
        body, p, h1, h2, h3 { margin: 0; padding: 0; }
        body { font-family: 'Segoe UI', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; background-color: #f3f4f6; color: #374151; }
        
        /* Layout */
        .wrapper { width: 100%; background-color: #f3f4f6; padding: 40px 0; }
        .container { max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); overflow: hidden; }
        
        /* Header */
        .header { background-color: #ffffff; padding: 32px 40px 0 40px; text-align: center; }
        .logo { font-size: 24px; font-weight: 800; color: #4F46E5; letter-spacing: -0.5px; text-decoration: none; }
        
        /* Content */
        .content { padding: 32px 40px; text-align: left; }
        .icon-container { display: flex; justify-content: center; margin-bottom: 24px; }
        .icon { width: 48px; height: 48px; background-color: #EEF2FF; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto; }
        
        h1 { font-size: 20px; font-weight: 700; color: #111827; margin-bottom: 16px; text-align: center; }
        p { font-size: 15px; line-height: 1.6; color: #4B5563; margin-bottom: 24px; }
        
        /* Button */
        .btn-container { text-align: center; margin: 32px 0; }
        .btn { display: inline-block; padding: 14px 32px; background-color: #4F46E5; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; transition: background-color 0.3s; box-shadow: 0 2px 4px rgba(79, 70, 229, 0.2); }
        .btn:hover { background-color: #4338ca; }
        
        /* Expire Warning */
        .warning { background-color: #FEF2F2; border-left: 4px solid #EF4444; padding: 12px 16px; border-radius: 4px; font-size: 14px; color: #991B1B; margin-bottom: 24px; }
        
        /* Alternate Link */
        .fallback { border-top: 1px solid #E5E7EB; padding-top: 24px; font-size: 13px; color: #6B7280; word-break: break-all; }
        .fallback a { color: #4F46E5; text-decoration: none; }
        
        /* Footer */
        .footer { background-color: #F9FAFB; padding: 24px 40px; text-align: center; font-size: 12px; color: #9CA3AF; border-top: 1px solid #E5E7EB; }
        .footer p { margin-bottom: 8px; font-size: 12px; }
        
        /* Mobile */
        @media only screen and (max-width: 600px) {
            .wrapper { padding: 20px 10px; }
            .content, .header, .footer { padding: 24px 20px; }
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="container">
            <div class="header">
                <a href="../" class="logo">Krello</a>
            </div>

            <div class="content">
               

                <h1>Đặt lại mật khẩu</h1>
                
                <p>Xin chào,</p>
                <p>Chúng tôi vừa nhận được yêu cầu đặt lại mật khẩu cho tài khoản Krello của bạn. Để đảm bảo an toàn, vui lòng nhấn vào nút bên dưới để tạo mật khẩu mới.</p>

                <div class="btn-container">
                    <a href="${resetLink}" class="btn">Đặt lại mật khẩu ngay</a>
                </div>

                <div class="warning">
                     Liên kết này chỉ có hiệu lực trong vòng <strong>${expiresInMinutes} phút</strong>.
                </div>

                <p>Nếu bạn không yêu cầu thay đổi mật khẩu, vui lòng bỏ qua email này. Tài khoản của bạn vẫn an toàn.</p>

                <div class="fallback">
                    <p style="margin-bottom: 8px;">Nếu nút bên trên không hoạt động, hãy sao chép và dán liên kết sau vào trình duyệt:</p>
                    <a href="${resetLink}">${resetLink}</a>
                </div>
            </div>

            <div class="footer">
                <p>© ${new Date().getFullYear()} Krello. All rights reserved.</p>
                <p>Bạn nhận được email này vì yêu cầu đặt lại mật khẩu dành cho tài khoản Krello.</p>
            </div>
        </div>
    </div>
</body>
</html>
`;
