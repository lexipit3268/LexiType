export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .normalize('NFD') // Tách dấu ra khỏi ký tự gốc
    .replace(/[\u0300-\u036f]/g, '') // Xóa các dấu tiếng Việt
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D') // Xử lý chữ đ
    .replace(/[^a-z0-9\s-]/g, '') // Xóa ký tự đặc biệt
    .replace(/\s+/g, '-') // Thay khoảng trắng bằng dấu gạch ngang
    .replace(/-+/g, '-') // Xóa các dấu gạch ngang dư thừa
    .trim();
};
