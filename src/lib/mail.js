// src/lib/mail.js
import nodemailer from 'nodemailer';

// Konfigurasi Transporter (Pengirim)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Pastikan ada di .env
    pass: process.env.EMAIL_PASS, // App Password Gmail
  },
});

/**
 * Mengirim email notifikasi stok menipis ke banyak penerima sekaligus.
 * @param {Array} barangList - Daftar barang yang stoknya kritis
 * @param {Array} targetEmails - Array berisi email tujuan (Admin/Manajer)
 */
export const kirimNotifikasiStok = async (barangList, targetEmails) => {
  if (!barangList || barangList.length === 0) return;
  if (!targetEmails || targetEmails.length === 0) return;

  // Format daftar barang menjadi HTML List
  const listHtml = barangList.map(item => 
    `<li>
      <b>${item.namaBarang}</b> (Kode: ${item.kodeBarang}) <br/>
      Sisa Stok: <span style="color:red; font-weight:bold;">${item.stok}</span> 
      (Min: ${item.minStok})
     </li>`
  ).join('');

  const mailOptions = {
    from: `"Sistem Inventory Bengkel" <${process.env.EMAIL_USER}>`,
    to: targetEmails, // Mengirim ke banyak orang sekaligus
    subject: '⚠️ URGENT: Peringatan Stok Menipis!',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd;">
        <h2 style="color: #d9534f;">Laporan Stok Kritis</h2>
        <p>Halo Admin & Manajer,</p>
        <p>Sistem mendeteksi transaksi baru yang menyebabkan stok barang berikut mencapai batas minimum:</p>
        <ul style="background: #f9f9f9; padding: 15px;">
          ${listHtml}
        </ul>
        <p>Mohon segera lakukan pengecekan atau restock barang agar operasional bengkel tidak terganggu.</p>
        <hr/>
        <p style="font-size: 12px; color: #888;">Notifikasi otomatis dari Sistem Inventory.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Notifikasi Stok Terkirim ke: ${targetEmails.join(', ')}`);
  } catch (error) {
    console.error("❌ Gagal mengirim email notifikasi:", error);
  }
};