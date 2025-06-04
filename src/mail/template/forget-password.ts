export const forgetPassword = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #f9f9f9;">
    <h2 style="color: #2c3e50;">Reset Your Password</h2>
    <p>Hi there,</p>
    <p>We received a request to reset your password for your <strong>Elevation Health</strong> account.</p>
    <p>Click the button below to reset your password. This link will expire in <strong>1 minute</strong> for your security.</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.RESET_LINK}" target="_blank" 
         style="background-color: #1976d2; color: white; padding: 12px 20px; text-decoration: none; border-radius: 6px; display: inline-block;">
        Reset Password
      </a>
    </div>
    <p>If you didn’t request a password reset, you can safely ignore this email.</p>
    <hr style="margin-top: 30px; border: none; border-top: 1px solid #ddd;">
    <p style="font-size: 12px; color: #888;">&copy; ${new Date().getFullYear()} Elevation Health. All rights reserved.</p>
  </div>
`;
