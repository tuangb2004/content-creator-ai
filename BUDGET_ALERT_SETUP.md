# Thiết lập Budget Alert – Google Cloud / AI Studio

Để tránh chi phí bất ngờ khi dùng Pay-as-you-go (Gemini API, Cloud), nên set **Budget** và **Budget Alert** trong Google Cloud. Cứ dùng là tính tiền nên cần giới hạn từ trước.

## Bước 1: Mở trang Budgets

1. Đăng nhập [Google Cloud Console](https://console.cloud.google.com).
2. Chọn đúng **project** (project Firebase của app Content Creator AI).
3. Vào **Billing** → **Budgets & alerts**  
   Hoặc mở trực tiếp: **[https://console.cloud.google.com/billing/budgets](https://console.cloud.google.com/billing/budgets)**

## Bước 2: Tạo budget mới

1. Bấm **Create budget**.
2. **Name:** ví dụ `Content Creator AI - Monthly cap`.
3. **Scope:** chọn project của bạn (hoặc toàn bộ account nếu muốn).
4. **Set budget amount:**
   - Nếu billing theo **VND**: chọn VND, đặt ví dụ **500,000 VND**/tháng (hoặc 300,000 / 200,000 tùy ngân sách).
   - Nếu billing theo **USD**: đặt ví dụ **20 USD**/tháng (tương đương ~500k VND).
5. Bấm **Next**.

## Bước 3: Thiết lập Alert (cảnh báo)

1. **Alert threshold:** thêm nhiều mức, ví dụ:
   - **50%** (250k VND hoặc $10) → Email.
   - **90%** (450k VND hoặc $18) → Email.
   - **100%** (500k VND hoặc $20) → Email (và có thể thêm SMS nếu bật).
2. **Manage notifications:** chọn email (và SMS nếu cần) để nhận cảnh báo.
3. Bấm **Finish** (hoặc **Next** rồi **Create budget**).

## Bước 4 (tùy chọn): Budget Action – tự động hạn chế chi tiêu

Một số tài khoản GCP có **Budget actions** (hành động khi vượt ngưỡng):

- Vào budget vừa tạo → **Edit**.
- Tìm **Budget actions** / **Alerts and actions**.
- Thêm action khi đạt **100%**: ví dụ **Disable billing** cho project (sẽ tắt billing khi vượt mức; cần bật trong Billing account).

Lưu ý: Disable billing có thể làm API (Gemini, Cloud Functions) ngừng hoạt động đến khi bạn bật lại hoặc nâng hạn mức. Chỉ nên dùng nếu bạn chấp nhận rủi ro đó.

## Tóm tắt gợi ý

| Mức   | Số tiền (gợi ý) | Hành động              |
|-------|------------------|-------------------------|
| Cảnh báo 1 | 50% budget       | Gửi email               |
| Cảnh báo 2 | 90% budget       | Gửi email (và SMS)      |
| Cảnh báo 3 | 100% budget      | Email + xem xét Budget action |

Budget tổng nên đặt theo số bạn sẵn sàng chi tối đa trong tháng (vd: 300k–500k VND hoặc $15–20).

---

Sau khi set xong, bạn vẫn nên xem **Billing** và **Usage** (AI Studio / Cloud Console) định kỳ để nắm chi phí thực tế.
