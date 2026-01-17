# Tại sao Sign Out ảnh hưởng đến Modal Verify Email?

## Flow hiện tại (Sau khi user nhấn "Create Account")

### Bước 1: User nhấn "Create Account"
- **File**: `frontend/src/components/Auth/AuthModal.jsx` (dòng 190-212)
- User điền form → nhấn "Create Account"
- Gọi `register(fullName, email, password)` từ AuthContext

### Bước 2: Register Function thực hiện
- **File**: `frontend/src/contexts/AuthContext.jsx` (dòng 181-220)
- Tạo user với `createUserWithEmailAndPassword()`
- Gửi email verification với `sendEmailVerification()`
- **QUAN TRỌNG**: Sign out user ngay lập tức (dòng 208)
  ```javascript
  await signOut(auth);
  ```

### Bước 3: Sign Out trigger `onAuthStateChanged`
- **File**: `frontend/src/contexts/AuthContext.jsx` (dòng 30-93)
- Firebase Auth có listener `onAuthStateChanged` được setup trong useEffect
- Khi `signOut(auth)` được gọi (dòng 208) → Firebase trigger event
- `onAuthStateChanged` callback chạy với `firebaseUser = null` (dòng 88-92)
- **State trong AuthContext thay đổi**: 
  ```javascript
  setUser(null);        // user state = null
  setUserData(null);    // userData state = null
  setLoading(false);    // loading = false
  ```
- **TẤT CẢ components dùng `useAuth()` nhận được `user = null`**

### Bước 4: LandingPage nhận state change
- **File**: `frontend/src/pages/LandingPage.jsx` (dòng 22, 51-68)
- LandingPage dùng `const { user } = useAuth()`
- Khi `user` thay đổi từ `object` → `null`:
  - useEffect ở dòng 51-68 chạy lại
  - Check `!user && !loading` → true
  - Check localStorage flag → có `showVerificationModal = 'true'`
  - **MỞ MODAL**: `setShowAuthModal(true)`

### Bước 5: AuthModal nhận props
- **File**: `frontend/src/components/Auth/AuthModal.jsx` (dòng 10, 100-103)
- AuthModal nhận `isOpen={showAuthModal}` từ LandingPage
- **NHƯNG**: Có logic `shouldShowModal`:
  ```javascript
  const shouldShowModal = isOpen || showWaitingScreen || localStorage.getItem('showVerificationModal') === 'true';
  ```
- Modal sẽ hiển thị nếu:
  - `isOpen = true` (từ LandingPage)
  - HOẶC `showWaitingScreen = true` (từ AuthModal state)
  - HOẶC có flag trong localStorage

## Vấn đề tại sao Sign Out ảnh hưởng?

### Vấn đề 1: Timing Race Condition
1. User nhấn "Create Account" → `register()` được gọi
2. `register()` set `showWaitingScreen = true` trong AuthModal
3. **NHƯNG** `signOut()` được gọi ngay sau đó (dòng 208)
4. `onAuthStateChanged` trigger → `user` state = `null`
5. LandingPage useEffect chạy → có thể đóng/mở modal lại
6. **KẾT QUẢ**: Modal có thể bị đóng rồi mở lại → gây flicker

### Vấn đề 2: State không đồng bộ
- `showWaitingScreen` được set trong AuthModal
- Nhưng `user` state thay đổi trong AuthContext
- LandingPage không biết về `showWaitingScreen` → chỉ dựa vào `user` state
- **KẾT QUẢ**: Có thể đóng modal khi `user = null` nếu không có localStorage flag

### Vấn đề 3: onClose có thể được gọi
- Khi `user` thay đổi, có thể có logic nào đó gọi `onClose()`
- `onClose()` set `setShowAuthModal(false)` trong LandingPage
- **KẾT QUẢ**: Modal bị đóng ngay cả khi đang chờ verification

## Giải pháp đã implement

### 1. localStorage Flag
- Lưu `showVerificationModal = 'true'` khi đăng ký thành công
- LandingPage check flag này để quyết định mở modal
- **Lợi ích**: State persist qua sign out và page refresh

### 2. shouldShowModal Logic
- Modal không chỉ dựa vào `isOpen` prop
- Còn check `showWaitingScreen` và localStorage flag
- **Lợi ích**: Modal vẫn hiển thị ngay cả khi `isOpen = false`

### 3. Prevent onClose khi đang chờ verification
- `onClose` trong LandingPage check flag trước khi đóng
- Backdrop và close button bị disable khi có flag
- **Lợi ích**: Modal không bị đóng nhầm

### 4. Set showWaitingScreen TRƯỚC khi sign out
- Set `showWaitingScreen = true` ngay khi nhận result
- Trước khi `signOut()` được gọi
- **Lợi ích**: Modal đã có state đúng trước khi user sign out

## Tóm tắt

### Sign Out ảnh hưởng vì:

1. **Firebase `onAuthStateChanged` là GLOBAL listener**
   - Khi `signOut(auth)` được gọi → Firebase trigger event
   - `onAuthStateChanged` callback chạy → `setUser(null)` trong AuthContext
   - **TẤT CẢ components** dùng `useAuth()` nhận được `user = null` ngay lập tức

2. **LandingPage phụ thuộc vào `user` state**
   - `const { user } = useAuth()` → nhận `user = null` khi sign out
   - useEffect ở dòng 51-68 chạy lại khi `user` thay đổi
   - Có thể trigger logic đóng/mở modal

3. **State không đồng bộ**
   - `showWaitingScreen` được set trong AuthModal (local state)
   - `user` state thay đổi trong AuthContext (global state)
   - LandingPage không biết về `showWaitingScreen` → chỉ dựa vào `user` state

4. **Timing race condition**
   - `register()` set `showWaitingScreen = true` trong AuthModal
   - Nhưng `signOut()` được gọi ngay sau đó
   - `onAuthStateChanged` trigger → `user = null` → LandingPage re-render
   - Modal có thể bị đóng rồi mở lại → gây flicker

### Giải pháp đã implement:

1. **localStorage Flag** - Persist state qua sign out
2. **shouldShowModal Logic** - Modal check nhiều điều kiện
3. **Prevent onClose** - Không đóng modal khi đang chờ verification
4. **Set state TRƯỚC** - `showWaitingScreen = true` trước khi sign out

### Flow mong muốn (Sau khi fix):

1. User nhấn "Create Account"
2. `register()` gọi → tạo user → gửi email
3. **TRƯỚC khi sign out**: Set `showWaitingScreen = true` + localStorage flag
4. `signOut()` được gọi → `onAuthStateChanged` trigger → `user = null`
5. LandingPage useEffect chạy → check localStorage flag → **GIỮ MODAL MỞ**
6. Modal hiển thị verification screen → **KHÔNG BỊ ĐÓNG**
