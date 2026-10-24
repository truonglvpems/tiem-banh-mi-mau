document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("form");

    if (!form) return;

    const hoTen = document.getElementById("ho-ten");
    const soDienThoai = document.getElementById("so-dien-thoai");

    const banhMiThit = document.getElementById("banh-mi-thit");
    const banhMiChao = document.getElementById("banh-mi-chao");
    const banhMiQue = document.getElementById("banh-mi-que-cay");

    const ngayNhan = document.getElementById("ngay-nhan");
    const diaChi = document.getElementById("dia-chi");

    const tongSoSuat = document.getElementById("tong-so-suat");
    const tamTinh = document.getElementById("tam-tinh");
    const mucGiam = document.getElementById("muc-giam");
    const soTienGiam = document.getElementById("so-tien-giam");
    const tongTienSauGiam = document.getElementById("tong-tien-sau-giam");

    const nutGui = form.querySelector('button[type="submit"]');

    // Tạo vùng hiển thị thông báo ngay trên nút gửi.
    const thongBao = document.createElement("p");
    thongBao.id = "thong-bao-don-hang";
    thongBao.setAttribute("role", "alert");
    thongBao.setAttribute("aria-live", "polite");
    nutGui.parentNode.insertBefore(thongBao, nutGui);

    // Định dạng số tiền theo kiểu Việt Nam, ví dụ: 270.000đ.
    function dinhDangTien(soTien) {
        return soTien.toLocaleString("vi-VN") + "đ";
    }

    // Chỉ chấp nhận số suất là số nguyên không âm.
    function laySoSuat(input) {
        const giaTri = input.value.trim();

        if (giaTri === "") return 0;

        const soSuat = Number(giaTri);

        if (
            !Number.isSafeInteger(soSuat) ||
            soSuat < 0
        ) {
            return 0;
        }

        return soSuat;
    }

    // Tính lại toàn bộ đơn hàng.
    function tinhTongDonHang() {
        const soSuatThit = laySoSuat(banhMiThit);
        const soSuatChao = laySoSuat(banhMiChao);
        const soSuatQue = laySoSuat(banhMiQue);

        const tongSuat =
            soSuatThit + soSuatChao + soSuatQue;

        const thanhTienThit = soSuatThit * 25000;
        const thanhTienChao = soSuatChao * 35000;
        const thanhTienQue = soSuatQue * 10000;

        const tamTinhDonHang =
            thanhTienThit + thanhTienChao + thanhTienQue;

        const phanTramGiam = tongSuat >= 10 ? 10 : 0;

        const tienGiam = Math.round(
            tamTinhDonHang * phanTramGiam / 100
        );

        const tongTien = tamTinhDonHang - tienGiam;

        tongSoSuat.value = tongSuat;
        tamTinh.value = dinhDangTien(tamTinhDonHang);
        mucGiam.value = phanTramGiam + "%";
        soTienGiam.value = dinhDangTien(tienGiam);
        tongTienSauGiam.value = dinhDangTien(tongTien);

        return {
            tongSuat: tongSuat,
            tamTinh: tamTinhDonHang,
            phanTramGiam: phanTramGiam,
            tienGiam: tienGiam,
            tongTien: tongTien
        };
    }

    // Tự động cập nhật khi khách thay đổi số lượng.
    [banhMiThit, banhMiChao, banhMiQue].forEach(function (input) {
        input.addEventListener("input", function () {
            tinhTongDonHang();
            thongBao.textContent = "";
        });

        input.addEventListener("change", tinhTongDonHang);
    });

    // Xóa thông báo cũ khi khách chỉnh sửa thông tin.
    [hoTen, soDienThoai, ngayNhan, diaChi].forEach(function (input) {
        input.addEventListener("input", function () {
            thongBao.textContent = "";
        });

        input.addEventListener("change", function () {
            thongBao.textContent = "";
        });
    });

    // Lấy ngày hiện tại theo giờ địa phương, tránh lỗi lệch múi giờ.
    function layNgayHomNay() {
        const homNay = new Date();

        const nam = homNay.getFullYear();
        const thang = String(homNay.getMonth() + 1).padStart(2, "0");
        const ngay = String(homNay.getDate()).padStart(2, "0");

        return `${nam}-${thang}-${ngay}`;
    }

    // Kiểm tra dữ liệu trước khi gửi.
    form.addEventListener("submit", function (event) {
        event.preventDefault();

        thongBao.textContent = "";
        thongBao.style.color = "red";

        const donHang = tinhTongDonHang();

        const ten = hoTen.value.trim();
        const dienThoai = soDienThoai.value.trim();
        const ngay = ngayNhan.value;
        const diaChiGiaoHang = diaChi.value.trim();

        let loi = "";

        if (!ten) {
            loi = "Vui lòng nhập họ và tên.";
        } else if (!/^0\d{9}$/.test(dienThoai)) {
            loi = "Số điện thoại phải gồm đúng 10 chữ số và bắt đầu bằng số 0.";
        } else if (
            ![banhMiThit, banhMiChao, banhMiQue].every(function (input) {
                return /^\d+$/.test(input.value.trim()) &&
                    Number.isSafeInteger(Number(input.value)) &&
                    Number(input.value) >= 0;
            })
        ) {
            loi = "Vui lòng nhập số suất là số nguyên không âm cho từng món.";
        } else if (donHang.tongSuat < 10) {
            loi = "Đơn hàng phải có tổng cộng ít nhất 10 suất.";
        } else if (!ngay) {
            loi = "Vui lòng chọn ngày nhận bánh.";
        } else if (ngay <= layNgayHomNay()) {
            loi = "Ngày nhận bánh phải sau ngày hôm nay.";
        } else if (!diaChiGiaoHang) {
            loi = "Vui lòng nhập địa chỉ giao hàng.";
        }

        if (loi) {
            thongBao.textContent = loi;
            thongBao.style.color = "red";
            return;
        }

        // Chỉ xác nhận trên giao diện, không gửi dữ liệu đi đâu.
        thongBao.textContent =
            "Đã ghi nhận đơn (trang mẫu – đơn chưa được gửi đi)";
        thongBao.style.color = "green";
    });

    // Hiển thị tổng tiền ban đầu.
    tinhTongDonHang();
});
