// Hàm format số tiền VNĐ
export const formatCurrency = (amount) => {
  if (amount >= 1000000000) {
    return `${(amount / 1000000000).toFixed(1)}B VNĐ`;
  }
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M VNĐ`;
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K VNĐ`;
  }
  return `${amount.toLocaleString("vi-VN")} VNĐ`;
};
