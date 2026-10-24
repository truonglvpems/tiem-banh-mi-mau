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

    const SO_ZALO = ""; // Điền số Zalo của tiệm, chỉ gồm mã quốc gia và số điện thoại, không có dấu +

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

        // Lấy nguồn khách từ URL, không có thì ghi "không rõ".
        const thamSo = new URLSearchParams(window.location.search);
        const nguon = (thamSo.get("nguon") || "").trim() || "không rõ";

        // Lấy ghi chú nếu form có trường ghi chú.
        const truongGhiChu = document.querySelector(
            '[name="ghiChu"], [name="ghi-chu"], #ghiChu, #ghi-chu'
        );
        const ghiChu = truongGhiChu
            ? truongGhiChu.value.trim()
            : "";

        // ĐỌC LƯU Ý Ở DƯỚI: cần khớp tên thuộc tính với tinhTongDonHang().
        const tongTienSauGiam = donHang.tongTien;

        const dinhDangTien = function (soTien) {
            return Number(soTien).toLocaleString("vi-VN") + " VNĐ";
        };

        const noiDungDon = [
            "ĐƠN ĐẶT BÁNH MÌ",
            "Họ tên: " + ten,
            "Số điện thoại: " + dienThoai,
            "Bánh mì thịt: " + banhMiThit.value + " suất",
            "Bánh mì chảo: " + banhMiChao.value + " suất",
            "Bánh mì que: " + banhMiQue.value + " suất",
            "Tổng số suất: " + donHang.tongSuat + " suất",
            "Tổng tiền sau giảm: " +
                (Number.isFinite(Number(tongTienSauGiam))
                    ? dinhDangTien(tongTienSauGiam)
                    : "CHƯA XÁC ĐỊNH - cần kiểm tra tên thuộc tính"),
            "Ngày nhận: " + ngay,
            "Địa chỉ giao hàng: " + diaChiGiaoHang,
            "Ghi chú: " + (ghiChu || "Không có"),
            "Nguồn khách: " + nguon
        ].join("\n");

        thongBao.textContent = "Đơn hàng đã được soạn. Chưa gửi đi.";
        thongBao.style.color = "green";

        // Tạo vùng hiển thị đơn và nút thao tác ngay bên dưới thông báo.
        let khungDon = document.getElementById("khungDonHang");
        if (!khungDon) {
            khungDon = document.createElement("div");
            khungDon.id = "khungDonHang";
            khungDon.style.marginTop = "12px";
            khungDon.style.padding = "12px";
            khungDon.style.border = "1px solid #ccc";
            khungDon.style.borderRadius = "8px";

            const noiDung = document.createElement("pre");
            noiDung.id = "noiDungDonHang";
            noiDung.style.whiteSpace = "pre-wrap";
            noiDung.style.overflowWrap = "anywhere";
            noiDung.style.fontFamily = "inherit";

            const nutZalo = document.createElement("button");
            nutZalo.type = "button";
            nutZalo.textContent = "Sao chép đơn và mở Zalo";

            const ketQuaSaoChep = document.createElement("p");
            ketQuaSaoChep.id = "ketQuaSaoChep";
            ketQuaSaoChep.setAttribute("role", "status");

            khungDon.append(noiDung, nutZalo, ketQuaSaoChep);

            // Hiển thị ngay sau form, gần nút gửi.
            form.insertAdjacentElement("afterend", khungDon);

            nutZalo.addEventListener("click", async function () {
                const noiDungHienTai =
                    document.getElementById("noiDungDonHang").textContent;
                const ketQua = document.getElementById("ketQuaSaoChep");

                try {
                    await navigator.clipboard.writeText(noiDungHienTai);
                    ketQua.textContent = "Đã sao chép nội dung đơn.";
                } catch (error) {
                    ketQua.textContent =
                        "Không sao chép tự động được. Hãy chọn và sao chép nội dung đơn bên trên.";
                    return;
                }

                if (!SO_ZALO.trim()) {
                    ketQua.textContent += " Tiệm chưa điền số Zalo.";
                    return;
                }

                // Chỉ mở Zalo của tiệm; không đưa thông tin khách vào URL.
                const soZalo = SO_ZALO.replace(/\D/g, "");
                if (!soZalo) {
                    ketQua.textContent += " Số Zalo chưa hợp lệ.";
                    return;
                }

                window.open(
                    "https://zalo.me/" + soZalo,
                    "_blank",
                    "noopener,noreferrer"
                );
            });
        }

        document.getElementById("noiDungDonHang").textContent = noiDungDon;
        document.getElementById("ketQuaSaoChep").textContent = "";
    });

    // Hiển thị tổng tiền ban đầu.
    tinhTongDonHang();
});
