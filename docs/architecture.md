# ĐẶC TẢ KIẾN TRÚC HỆ THỐNG LEXITYPE V3

## I. TẦNG DỮ LIỆU (DATABASE SCHEMA - MONGOOSE ODM)

Hệ thống sử dụng **Mongoose ODM** để tương tác với MongoDB. Cấu trúc dữ liệu được định nghĩa chặt chẽ thông qua `Mongoose Schema`, mang lại khả năng tự động kiểm tra dữ liệu đầu vào (Validation) và quản lý vòng đời dữ liệu (Hooks/Timestamps).
Ứng dụng tiếp tục duy trì kiến trúc `Feature-Based / Modular Architecture`. Các trường định danh tùy chỉnh (`deckID`, `questionID`, `historyID`) vẫn đóng vai trò là Khóa chính (Primary Key) bên cạnh `_id` mặc định, được thiết lập `unique: true` và `required: true` trực tiếp trong Schema.

Ứng dụng Singleton Pattern, Barrel Pattern,
Dùng Swagger để test api

### 1. Collection `decks` (Quản lý bộ từ vựng)

Mỗi document đại diện cho một chủ đề hoặc một cấp độ từ vựng. Mongoose sẽ tự động quản lý thời gian tạo qua option `{ timestamps: true }`.

- **`_id`**: `String` (Khóa chính độc lập, chuỗi định danh duy nhất)
- **`title`**: `String` (Ví dụ: "B2 Academic Word-Form", `required: true`)
- **`description`**: `String` (Mô tả ngắn gọn về bộ từ vựng)
- **`slug`**: `String` (Dùng cho URL thân thiện, ví dụ: `b2-academic-word-form`, `unique: true`)
- **`isPublic`**: `Boolean` (Mặc định `true`, bộ từ do hệ thống tạo công khai)
- **`createdAt`**: `Date` (Do Mongoose tự động sinh)
- **`updatedAt`**: `Date` (Do Mongoose tự động sinh)

### 2. Collection `questions` (Chi tiết câu hỏi)

Mỗi câu hỏi sẽ liên kết trực tiếp với một bộ từ vựng thông qua `deckID`.

- **`questionID`**: `String` (Khóa chính độc lập, ví dụ: `q_001_rev`, `unique: true`)
- **`deckID`**: `String` (Khóa ngoại liên kết tới `deckID` của collection `decks`, có thể cấu hình `ref` để dùng tính năng Populate của Mongoose nếu cần)
- **`sentence`**: `String` (Chuỗi chứa ký tự đánh dấu ô trống, ví dụ: `"The internet has [blank] changed the way we communicate."`)
- **`rootWord`**: `String` (Từ gốc được cung cấp, ví dụ: `"REVOLUTION"`)
- **`answer`**: `String` (Đáp án đúng hoàn chỉnh, ví dụ: `"revolutionary"`)
- **`wordClass`**: `String` (Từ loại: Noun, Verb, Adjective, Adverb)
- **`hints`**: `Object`
- **`definition`**: `String` (Định nghĩa tiếng Anh hoặc nghĩa tiếng Việt)
- **`firstLetter`**: `String` (Ký tự đầu tiên của đáp án)

### 3. Collection `histories` (Lịch sử & Thống kê kết quả)

Lưu lại dữ liệu của mỗi lượt chơi để phục vụ vẽ biểu đồ Dashboard phong cách RetroUI.

- **`historyID`**: `String` (Khóa chính độc lập, ví dụ: `hist_20260712_01`, `unique: true`)
- **`deckID`**: `String` (Khóa ngoại liên kết tới bộ từ vừa chơi)
- **`wpm`**: `Number` (Tốc độ gõ tính theo công thức chuẩn quốc tế)
- **`accuracy`**: `Number` (Độ chính xác theo tỷ lệ %, ví dụ: `94.5`)
- **`wrongWords`**: `Array of Strings` (Danh sách các từ gõ sai để gom làm Flashcard {
  questionID,
  userAnswer,
  correctAnswer
  })
- **`playedAt`**: `Date` (Sử dụng `default: Date.now` của Mongoose)

**4. Collection `users` (Quản lý người dùng)**

Lưu trữ thông tin định danh và bảo mật.

- **`_id`**: `String` (Khóa chính định danh)
- **`email`**: `String` (`unique: true`, `required: true`)
- **`password`**: `String` (Lưu giá trị đã được băm qua **bcrypt**, tuyệt đối không lưu plain-text)
- **`fullName`**: `String` (Tên hiển thị)
- **`createdAt`**: `Date`

Sử dụng AccessToken và RefreshToken

**Cập nhật mối quan hệ (Data Isolation):**
Tất cả các collection liên quan đến dữ liệu cá nhân (`decks`, `histories`, `wrongWords`) sẽ thêm trường:

- **`ownerId`**: `Schema.Types.ObjectId` (Liên kết với `User` model).

---

## II. TẦNG XỬ LÝ TRUNG GIAN (BACKEND - NODE.JS & EXPRESS)

Tầng Backend sử dụng Mongoose để xử lý logic nghiệp vụ và cung cấp các REST API. Mongoose sẽ tự động quản lý Connection Pool để tối ưu hóa hiệu năng kết nối.

### 1. Tối ưu hóa hiệu năng truy vấn dữ liệu

- **Cơ chế Lấy & Xáo trộn câu hỏi:** Tận dụng sức mạnh Aggregation của Mongoose: `QuestionModel.aggregate([{ $match: { deckID } }, { $sample: { size: 20 } }])`. Hệ thống sẽ bốc ngẫu nhiên số lượng câu hỏi định sẵn ngay từ tầng Database, giúp giảm tải RAM cho Node.js.
- **Bảo vệ toàn vẹn dữ liệu:** Mongoose Schema sẽ đứng ra làm "bảo vệ" ở cửa ngõ. Bất kỳ payload nào từ Frontend gửi lên nếu thiếu trường `required` hoặc sai kiểu dữ liệu sẽ bị Mongoose chặn lại ngay lập tức và ném lỗi rõ ràng trước khi ghi vào DB.

### 2. Hệ thống API Endpoints

- **`GET /api/decks`**: Lấy danh sách tất cả các bộ từ vựng hiển thị ra Dashboard (Dùng `DeckModel.find()`).
- **`GET /api/decks/:deckID/questions`**: Lấy danh sách câu hỏi đã được xáo trộn ngẫu nhiên bằng `$sample`.
- **`POST /api/decks/custom`**: User gửi dữ liệu lên để tự tạo một bộ từ vựng riêng. _Payload: `{ title, description, questions: [...] }_`.
- **`POST /api/history`**: Lưu kết quả sau khi kết thúc lượt chơi vào DB. _Payload: `{ deckID, wpm, accuracy, wrongWords }_`.
- **`GET /api/stats`**: Lấy dữ liệu tổng hợp các lượt chơi gần nhất để Frontend vẽ biểu đồ.

### 3. Hệ thống Authentication & Authorization

- **Authentication (Đăng nhập):** Sử dụng chiến lược `Local Strategy` (Email/Password). Backend sẽ kiểm tra hash password, nếu khớp sẽ tạo một **JWT** (Payload chứa `userID`, thời hạn 24h-7 ngày).
- **Authorization (Middleware `protect`):**
- Tất cả các route yêu cầu dữ liệu cá nhân phải đi qua middleware `protect`.
- Middleware sẽ giải mã Header `Authorization: Bearer <token>`.
- Nếu token hợp lệ, nó sẽ gắn `req.user` vào request để các Controller bên dưới biết chính xác ai đang thực hiện hành động.
- Nếu token hết hạn hoặc sai, trả về lỗi `401 Unauthorized`.

---

## III. GIAO DIỆN & ENGINE GAME (FRONTEND - REACT, ZUSTAND & RETROUI)

Frontend chịu trách nhiệm dựng UI theo phong cách Neobrutalism (sử dụng Tailwind v4 và thư viện RetroUI) và vận hành Core Game Engine thời gian thực.

### 1. Công thức tính WPM chuẩn quốc tế (Chuẩn hóa 5 ký tự)

Để đảm bảo tính công bằng tuyệt đối giữa các câu hỏi có từ ngắn và từ dài, hệ thống áp dụng công thức:

$$\text{WPM} = \frac{\text{Tổng số ký tự gõ đúng} / 5}{\text{Thời gian hoàn thành (tính bằng phút)}}$$

- **Cơ chế đếm:** Mỗi khi người dùng gõ đúng một ký tự hợp lệ trùng khớp với ký tự tại vị trí tương ứng của đáp án, hệ thống sẽ tăng biến đếm `correctChars`. Khi hết giờ hoặc hoàn thành bộ từ, WPM sẽ được tính dựa trên tổng số `correctChars` này.

### 2. Quản lý trạng thái bằng Zustand Store (`useGameStore`)

- **States:**
- `gameState`: Trạng thái game (`'IDLE'`, `'PLAYING'`, `'FINISHED'`).
- `questions`: Mảng danh sách câu hỏi.
- `currentIndex`: Vị trí câu hỏi hiện tại đang xử lý.
- `userInput`: Chuỗi ký tự user đang gõ.
- `correctChars`: Tổng số ký tự gõ đúng tích lũy từ đầu trận.
- `timer`: Số giây đếm ngược.
- `hintLevel`: Cấp độ gợi ý (`0`: ẩn, `1`: hiện từ loại, `2`: điền hộ chữ đầu).

- **Actions:**
- `startNewGame(deckID)`: Gọi API lấy câu hỏi, reset timer và bộ đếm, chuyển `gameState` sang `'PLAYING'`.
- `handleInputChange(value)`: Cập nhật `userInput`. So khớp thời gian thực. Nếu chuỗi trùng khớp hoàn toàn với `answer`, cộng số ký tự vào `correctChars` và tự động chuyển sang câu tiếp theo (`currentIndex++`).
- `triggerHint()` / `skipQuestion()`: Xử lý tăng gợi ý hoặc bỏ qua câu hỏi.

### 3. Core Game Engine: Ô nhập liệu ẩn danh & Phản hồi Realtime

- **Input ẩn danh:** Sử dụng một thẻ `<input>` ẩn (`opacity-0`) luôn luôn được tự động `focus()`. Mọi thao tác gõ của người dùng đều được bắt giữ tại đây.
- **Hiển thị ký tự Neobrutalism:** Đáp án được tách thành mảng ký tự bằng `.split('')` và render thành chuỗi các ô vuông viền đen đặc trưng của RetroUI:
- _Chưa gõ tới:_ Ô vuông nền trung tính, chữ xám mờ.
- _Gõ đúng:_ Kích hoạt màu chủ đạo của RetroUI (vàng sáng/xanh chanh).
- _Gõ sai:_ Kích hoạt màu cảnh báo (đỏ) kèm hiệu ứng rung lắc `animate-shake`.

### 4. Realtime Virtual Keyboard (Bàn phím ảo phản hồi xúc giác)

- Lắng nghe sự kiện toàn cục `keydown` và `keyup` để cập nhật trạng thái phím đang nhấn (`activeKey`).
- Bàn phím ảo được map từ mảng QWERTY. Nút nào trùng với `activeKey` sẽ lập tức triệt tiêu bóng đổ (`shadow-none`) và dịch chuyển tịnh tiến nhẹ (`translate-x-[2px] translate-y-[2px]`), tạo cảm giác cơ học lún xuống cực kỳ trực quan trên giao diện Neobrutalism.

---

## IV. LUỒNG TRẢI NGHIỆM ĐẦY ĐỦ CỦA USER (END-TO-END FLOW)

1. **Bước 1: Dashboard (Trạng thái IDLE)**
   User truy cập website, các bộ từ vựng hiển thị trực quan dưới dạng các khối hộp Neobrutalism với mã định danh `deckID` rõ ràng. User click nút "Bắt đầu thử thách" tại một bộ từ.
2. **Bước 2: Gameplay (Trạng thái PLAYING)**
   Màn hình chuyển sang sân khấu gõ phím. Một câu tiếng Anh xuất hiện, yêu cầu người dùng phải vận dụng tư duy ngữ pháp để biến đổi từ gốc thành dạng từ loại chính xác (Word-Form) điền vào ô trống. Hệ thống bắt đầu tính thời gian và đếm từng ký tự gõ đúng. User có thể dùng phím tắt để mở các tầng gợi ý hoặc chuyển câu.
3. **Bước 3: Scoreboard (Trạng thái FINISHED)**
   Khi đồng hồ về 0, game dừng lại. Hệ thống tính toán chỉ số WPM chuẩn hóa. Màn hình kết quả hiện lên kèm danh sách từ sai để lưu làm Flashcard. Đồng thời, một lệnh `POST` gọi API để lưu kết quả. Backend sẽ khởi tạo một instance của Mongoose Model (`new History(data)`) và gọi `.save()` để kiểm tra tính hợp lệ trước khi lưu vĩnh viễn vào CSDL.

## V. LUỒNG BẢO MẬT DỮ LIỆU

Mọi truy vấn dữ liệu từ Frontend lên Backend đều phải tuân thủ nguyên tắc **"Người dùng chỉ thấy những gì là của họ"**:

- **GET `/api/decks**`: Backend sẽ query: `DeckModel.find({ ownerId: req.user.id })`.
- **POST `/api/history**`: Backend sẽ tự động gán `ownerId = req.user.id`vào document trước khi`.save()`.
- **Xóa/Sửa**: Backend sẽ query: `DeckModel.findOneAndDelete({ _id: deckID, ownerId: req.user.id })`. Việc này đảm bảo ngay cả khi người dùng gửi `deckID` của người khác lên, họ cũng không thể xóa được (vì sai `ownerId`).

---
