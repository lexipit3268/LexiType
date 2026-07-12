# ĐẶC TẢ KIẾN TRÚC HỆ THỐNG LEXITYPE (CẬP NHẬT V2)

## I. TẦNG DỮ LIỆU (DATABASE SCHEMA - NATIVE MONGODB DRIVER)

Vì hệ thống sử dụng **Native MongoDB Driver**, cấu trúc dữ liệu sẽ được định nghĩa thông qua các TypeScript Interfaces ở tầng ứng dụng và áp dụng trực tiếp khi tương tác với các Collections. Để tối ưu việc tìm kiếm và thiết lập mối quan hệ, các trường định danh tùy chỉnh (`deckID`, `questionID`, `historyID`) sẽ đóng vai trò là Khóa chính (Primary Key) và được đánh chỉ mục duy nhất (`unique: true`).
Ứng dụng sẽ sử dụng kiến trúc `Feature-Based / Modular Architecture`

### 1. Collection `decks` (Quản lý bộ từ vựng)

Mỗi document đại diện cho một chủ đề hoặc một cấp độ từ vựng.

- **`deckID`**: `String` (Khóa chính độc lập, chuỗi định danh duy nhất ví dụ: `deck_b2_academic`)
- **`title`**: `String` (Ví dụ: "B2 Academic Word-Form")
- **`description`**: `String` (Mô tả ngắn gọn về bộ từ vựng)
- **`slug`**: `String` (Dùng cho URL thân thiện, ví dụ: `b2-academic-word-form`, có unique index)
- **`isPublic`**: `Boolean` (Mặc định `true`, bộ từ do hệ thống tạo công khai)
- **`createdAt`**: `Date`

### 2. Collection `questions` (Chi tiết câu hỏi)

Mỗi câu hỏi sẽ liên kết trực tiếp với một bộ từ vựng thông qua `deckID`.

- **`questionID`**: `String` (Khóa chính độc lập, ví dụ: `q_001_rev`)
- **`deckID`**: `String` (Khóa ngoại liên kết tới `deckID` của collection `decks`)
- **`sentence`**: `String` (Chuỗi chứa ký tự đánh dấu ô trống, ví dụ: `"The internet has [blank] changed the way we communicate."`)
- **`rootWord`**: `String` (Từ gốc được cung cấp, ví dụ: `"REVOLUTION"`)
- **`answer`**: `String` (Đáp án đúng hoàn chỉnh, ví dụ: `"revolutionary"`)
- **`wordClass`**: `String` (Từ loại: Noun, Verb, Adjective, Adverb)
- **`hints`**: `Object`
- **`definition`**: `String` (Định nghĩa tiếng Anh hoặc nghĩa tiếng Việt)
- **`firstLetter`**: `String` (Ký tự đầu tiên của đáp án)

### 3. Collection `histories` (Lịch sử & Thống kê kết quả)

Lưu lại dữ liệu của mỗi lượt chơi để phục vụ vẽ biểu đồ Dashboard phong cách RetroUI.

- **`historyID`**: `String` (Khóa chính độc lập, ví dụ: `hist_20260712_01`)
- **`deckID`**: `String` (Khóa ngoại liên kết tới `deckID` của bộ từ vừa chơi)
- **`wpm`**: `Number` (Tốc độ gõ tính theo công thức chuẩn quốc tế)
- **`accuracy`**: `Number` (Độ chính xác theo tỷ lệ %, ví dụ: `94.5`)
- **`wrongWords`**: `Array of Strings` (Danh sách các từ gõ sai để gom làm Flashcard)
- **`playedAt`**: `Date`

---

## II. TẦNG XỬ LÝ TRUNG GIAN (BACKEND - NODE.JS & EXPRESS)

Tầng Backend sử dụng kết nối trực tiếp thông qua `mongodb` client, xử lý logic nghiệp vụ và cung cấp các REST API.

### 1. Tối ưu hóa hiệu năng truy vấn dữ liệu

- **Cơ chế Lấy & Xáo trộn câu hỏi:** Thay vì tải toàn bộ câu hỏi lên RAM của Node.js rồi dùng thuật toán xáo trộn, Backend sẽ tận dụng **Aggregation Pipeline** của MongoDB với toán tử `$sample` ở endpoint `GET /api/decks/:deckID/questions`. Hệ thống sẽ bốc ngẫu nhiên số lượng câu hỏi định sẵn (ví dụ: 20 câu) ngay từ tầng Database, giúp giảm thiểu tải RAM và tăng tốc độ phản hồi.
- **Ràng buộc dữ liệu bằng Index:** Khi khởi chạy ứng dụng, Backend sẽ tự động gọi `createIndex` đảm bảo các trường `deckID`, `questionID`, và `historyID` luôn có index dạng `unique` để duy trì toàn vẹn dữ liệu thay cho cơ chế Validate của Mongoose.

### 2. Hệ thống API Endpoints

- **`GET /api/decks`**: Lấy danh sách tất cả các bộ từ vựng hiển thị ra Dashboard.
- **`GET /api/decks/:deckID/questions`**: Lấy danh sách câu hỏi đã được xáo trộn ngẫu nhiên bằng `$sample` từ DB.
- **`POST /api/decks/custom`**: User gửi dữ liệu lên để tự tạo một bộ từ vựng riêng. _Payload: `{ title, description, questions: [...] }_`.
- **`POST /api/history`**: Lưu kết quả sau khi kết thúc lượt chơi vào DB. _Payload: `{ deckID, wpm, accuracy, wrongWords }_`.
- **`GET /api/stats`**: Lấy dữ liệu tổng hợp các lượt chơi gần nhất để Frontend vẽ biểu đồ.

---

## III. GIAO DIỆN & ENGINE GAME (FRONTEND - REACT, ZUSTAND & RETROUI)

Frontend chịu trách nhiệm dựng UI theo phong cách Neobrutalism (sử dụng thư viện RetroUI nguyên bản) và vận hành Core Game Engine thời gian thực.

### 1. Công thức tính WPM chuẩn quốc tế (Chuẩn hóa 5 ký tự)

Để đảm bảo tính công bằng tuyệt đối giữa các câu hỏi có từ ngắn (ví dụ: _act_) và từ dài (ví dụ: _institutionalization_), hệ thống áp dụng công thức:

$$\text{WPM} = \frac{\text{Tổng số ký tự gõ đúng} / 5}{\text{Thời gian hoàn thành (tính bằng phút)}}$$

- **Cơ chế đếm:** Mỗi khi người dùng gõ đúng một ký tự hợp lệ trùng khớp với ký tự tại vị trí tương ứng của đáp án, hệ thống sẽ tăng biến đếm `correctChars`. Khi hết giờ hoặc hoàn thành bộ từ, WPM sẽ được tính dựa trên tổng số `correctChars` này.

### 2. Quản lý trạng thái bằng Zustand Store (`useGameStore`)

- **States:**
- `gameState`: Trạng thái game (`'IDLE'`, `'PLAYING'`, `'FINISHED'`).
- `questions`: Mảng danh sách câu hỏi.
- `currentIndex`: Vị trí câu hỏi hiện tại đang xử lý.
- `userInput`: Chuỗi ký tự user đang gõ.
- `correctChars`: Tổng số ký tự gõ đúng tích lũy từ đầu trận để tính WPM.
- `timer`: Số giây đếm ngược.
- `hintLevel`: Cấp độ gợi ý (`0`: ẩn, `1`: hiện từ loại, `2`: điền hộ chữ đầu).

- **Actions:**
- `startNewGame(deckID)`: Gọi API lấy câu hỏi (đã sample), reset timer và bộ đếm ký tự, chuyển `gameState` sang `'PLAYING'`.
- `handleInputChange(value)`: Cập nhật `userInput`. So khớp thời gian thực. Nếu chuỗi trùng khớp hoàn toàn với `answer`, cộng số ký tự của đáp án vào `correctChars` và tự động chuyển sang câu tiếp theo (`currentIndex++`).
- `triggerHint()` / `skipQuestion()`: Xử lý tăng gợi ý hoặc bỏ qua câu hỏi qua phím tắt.

### 3. Core Game Engine: Ô nhập liệu ẩn danh & Phản hồi Realtime

- **Input ẩn danh:** Sử dụng một thẻ `<input>` ẩn (`opacity-0`) luôn luôn được tự động `focus()`. Mọi thao tác gõ của người dùng đều được bắt giữ tại đây.
- **Hiển thị ký tự Neobrutalism:** Đáp án được tách thành mảng ký tự bằng `.split('')` và render thành chuỗi các ô vuông viền đen dày bản đặc trưng của RetroUI:
- _Chưa gõ tới:_ Ô vuông nền trung tính, chữ xám mờ.
- _Gõ đúng:_ Kích hoạt màu chủ đạo của RetroUI (ví dụ: vàng sáng/xanh chanh).
- _Gõ sai:_ Kích hoạt màu cảnh báo (đỏ/cam đậm) kèm hiệu ứng rung lắc `animate-shake`.

### 4. Realtime Virtual Keyboard (Bàn phím ảo phản hồi xúc giác)

- Lắng nghe sự kiện toàn cục `keydown` và `keyup` để cập nhật trạng thái phím đang nhấn (`activeKey`).
- Bàn phím ảo được map từ mảng QWERTY. Nút nào trùng với `activeKey` sẽ lập tức triệt tiêu bóng đổ (`shadow-none`) và dịch chuyển tịnh tiến nhẹ (`translate-x-[2px] translate-y-[2px]`), tạo cảm giác cơ học lún xuống cực kỳ trực quan trên giao diện Neobrutalism.

---

## IV. LUỒNG TRẢI NGHIỆM ĐẦY ĐỦ CỦA USER (END-TO-END FLOW)

1. **Bước 1: Dashboard (Trạng thái IDLE)**
   User truy cập website, các bộ từ vựng hiển thị trực quan dưới dạng các khối hộp Neobrutalism với mã định danh `deckID` rõ ràng phía sau hệ thống. User click nút "Bắt đầu thử thách" tại một bộ từ.
2. **Bước 2: Gameplay (Trạng thái PLAYING)**
   Màn hình chuyển sang sân khấu gõ phím. Một câu tiếng Anh xuất hiện, yêu cầu người dùng phải vận dụng tư duy ngữ pháp để biến đổi từ gốc (được cho sẵn trong ngoặc) thành dạng từ loại chính xác (Word-Form) điền vào ô trống. Hệ thống bắt đầu tính thời gian và đếm từng ký tự gõ đúng. User có thể dùng phím tắt để mở các tầng gợi ý hoặc chuyển câu.
3. **Bước 3: Scoreboard (Trạng thái FINISHED)**
   Khi đồng hồ về 0, game dừng lại. Hệ thống lấy tổng số ký tự gõ đúng chia cho 5, rồi chia cho tỷ lệ thời gian để ra chỉ số WPM chuẩn hóa chính xác nhất. Màn hình kết quả hiện lên kèm danh sách từ sai để lưu làm Flashcard, đồng thời một lệnh `POST` gọn nhẹ chứa `deckID` và dữ liệu thô được Native Driver bắn thẳng vào collection `histories` của MongoDB.

---
