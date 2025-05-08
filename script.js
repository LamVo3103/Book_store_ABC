// TO TOP
window.onscroll = function () {
  const btn = document.getElementById("toTopBtn");
  if (
    document.body.scrollTop > 200 ||
    document.documentElement.scrollTop > 200
  ) {
    btn.style.display = "block";
  } else {
    btn.style.display = "none";
  }
};

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Giỏ hàng
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let isAddingToCart = false;

// Cập nhật thông tin giỏ hàng
function updateCartSummary() {
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  document.querySelectorAll(".cart-count").forEach((el) => {
    el.textContent = cartCount;
  });

  document.querySelectorAll(".cart-total").forEach((el) => {
    el.textContent = cartTotal.toLocaleString("vi-VN") + " VNĐ";
  });
}

// Hàm chung để thêm sản phẩm vào giỏ
function addProductToCart(name, price, quantity, image) {
  const existingItem = cart.find((item) => item.name === name);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({
      name: name,
      price: price,
      quantity: quantity,
      image: image,
    });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartSummary();
  alert(`Đã thêm ${quantity} "${name}" vào giỏ hàng`);
}

// Xử lý nút thêm giỏ hàng trên trang danh sách
function handleListAddToCart(button) {
  button.addEventListener("click", function (e) {
    e.preventDefault();
    if (isAddingToCart) return;
    isAddingToCart = true;

    try {
      const productCard = button.closest(".product-card");
      const productName =
        productCard.querySelector(".product-title").textContent;
      const priceText = productCard.querySelector(".product-price").textContent;
      const productImage = productCard.querySelector("img").src;

      const price = parseFloat(
        priceText.replace(" VNĐ", "").replace(/\./g, "")
      );
      addProductToCart(productName, price, 1, productImage);
    } catch (error) {
      console.error("Lỗi khi thêm vào giỏ hàng:", error);
    } finally {
      isAddingToCart = false;
    }
  });
}

// Xử lý nút thêm giỏ hàng trên trang chi tiết
function handleDetailAddToCart(button) {
  button.addEventListener("click", function (e) {
    e.preventDefault();
    if (isAddingToCart) return;
    isAddingToCart = true;

    try {
      const productName = document.querySelector(".info h2").textContent;
      const priceText = document.querySelector(".info .price").textContent;
      const quantity = parseInt(document.getElementById("quantity").value);
      const mainImage = document.getElementById("mainImage").src;

      const price = parseFloat(
        priceText.replace("Giá:", "").replace("₫", "").replace(/\./g, "").trim()
      );
      addProductToCart(productName, price, quantity, mainImage);
    } catch (error) {
      console.error("Lỗi khi thêm vào giỏ hàng:", error);
    } finally {
      isAddingToCart = false;
    }
  });
}

// Hiển thị giỏ hàng (trang giỏ hàng)
function displayCart() {
  const cartContent = document.getElementById("cart-content");
  const cartSummary = document.getElementById("cart-summary");
  const itemCount = document.getElementById("item-count");

  if (!cartContent) return;

  if (cart.length === 0) {
    cartContent.innerHTML = `
          <div class="empty-cart">
            <i class="fas fa-shopping-basket"></i>
            <p>Giỏ hàng của bạn đang trống</p>
            <a href="index.html" class="empty-cart-btn">Tiếp tục mua sắm</a>
          </div>
        `;
    if (cartSummary) cartSummary.style.display = "none";
    if (itemCount) itemCount.textContent = "0 sản phẩm";
    return;
  }

  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  if (itemCount) itemCount.textContent = `${totalItems} sản phẩm`;

  let cartHTML = `
        <table class="cart-items">
          <thead>
            <tr>
              <th>Sản phẩm</th>
              <th>Giá</th>
              <th>Số lượng</th>
              <th>Tổng</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
      `;

  let subtotal = 0;

  cart.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;

    cartHTML += `
          <tr>
            <td>
              <div style="display: flex; align-items: center;">
                <img src="${item.image}" alt="${
      item.name
    }" class="cart-item-img">
                <div style="margin-left: 15px;">
                  <div class="cart-item-name">${item.name}</div>
                </div>
              </div>
            </td>
            <td class="cart-item-price">${item.price.toLocaleString(
              "vi-VN"
            )} VNĐ</td>
            <td>
              <div class="cart-item-quantity">
                <button class="quantity-btn" onclick="updateQuantity(${index}, -1)">-</button>
                <input type="text" class="quantity-input" value="${
                  item.quantity
                }" readonly>
                <button class="quantity-btn" onclick="updateQuantity(${index}, 1)">+</button>
              </div>
            </td>
            <td class="cart-item-price">${itemTotal.toLocaleString(
              "vi-VN"
            )} VNĐ</td>
            <td><button class="remove-btn" onclick="removeItem(${index})"><i class="fas fa-trash-alt"></i></button></td>
          </tr>
        `;
  });

  cartHTML += `</tbody></table>`;
  cartContent.innerHTML = cartHTML;

  if (cartSummary) {
    document.getElementById(
      "subtotal"
    ).textContent = `${subtotal.toLocaleString("vi-VN")} VNĐ`;
    document.getElementById("total").textContent = `${subtotal.toLocaleString(
      "vi-VN"
    )} VNĐ`;
    cartSummary.style.display = "block";
  }
}

// Cập nhật số lượng sản phẩm (trang giỏ hàng)
function updateQuantity(index, change) {
  const newQuantity = cart[index].quantity + change;

  if (newQuantity < 1) {
    removeItem(index);
    return;
  }

  cart[index].quantity = newQuantity;
  saveCart();
  displayCart();
}

// Xóa sản phẩm (trang giỏ hàng)
function removeItem(index) {
  cart.splice(index, 1);
  saveCart();
  displayCart();
}

// Lưu giỏ hàng
function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartSummary();
}

// Khởi tạo khi trang được tải
document.addEventListener("DOMContentLoaded", function () {
  // Cập nhật thông tin giỏ hàng
  updateCartSummary();

  // Hiển thị giỏ hàng nếu là trang giỏ hàng
  if (document.getElementById("cart-content")) {
    displayCart();
  }

  // Gắn sự kiện cho các nút "Thêm vào giỏ"
  document
    .querySelectorAll(".product-card .add-to-cart-button")
    .forEach((button) => {
      handleListAddToCart(button);
    });

  const detailAddToCartBtn = document.querySelector(
    ".info .add-to-cart-button"
  );
  if (detailAddToCartBtn) {
    handleDetailAddToCart(detailAddToCartBtn);
  }
});

// Hàm xử lý thêm vào giỏ từ trang chi tiết
function addToCartFromDetail() {
  const productName = document.querySelector(".product-info h1").textContent;
  const priceText = document.querySelector(".price").textContent;
  const quantity = parseInt(document.getElementById("quantity").value);
  const mainImage = document.getElementById("mainImage").src;

  // Xử lý giá (loại bỏ ký tự không phải số)
  const price = parseFloat(priceText.replace(/[^\d]/g, ""));

  addProductToCart(productName, price, quantity, mainImage);
}

// Hàm tăng số lượng
function increase() {
  let qty = document.getElementById("quantity");
  qty.value = parseInt(qty.value) + 1;
}

// Hàm giảm số lượng
function decrease() {
  let qty = document.getElementById("quantity");
  if (parseInt(qty.value) > 1) {
    qty.value = parseInt(qty.value) - 1;
  }
}

// Hàm chuyển ảnh
function switchImage(clickedImage) {
  const mainImage = document.getElementById("mainImage");
  const thumbnails = document.querySelectorAll(".thumbnail");

  // Cập nhật ảnh chính
  mainImage.src = clickedImage.src;

  // Cập nhật trạng thái active
  thumbnails.forEach((thumb) => {
    thumb.classList.remove("active");
  });
  clickedImage.classList.add("active");
}

// Xử lý khi trang chi tiết sản phẩm được tải
document.addEventListener("DOMContentLoaded", function () {
  if (window.location.pathname.includes("sanpham.html")) {
    loadProductData();
  }
});

// Hàm tải dữ liệu sản phẩm dựa trên URL
function loadProductData() {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("product");
  const products = {
    "dac-nhan-tam": {
      name: "Đắc Nhân Tâm",
      price: 75000,
      images: [
        "img/dac-nhan-tam.jpg",
        "img/dac-nhan-tam.jpg",
        "img/dac-nhan-tam.jpg",
      ],
      description:
        "Cuốn sách kinh điển về nghệ thuật giao tiếp và đối nhân xử thế, giúp bạn xây dựng các mối quan hệ tốt đẹp hơn.",
    },
    "nha-gia-kim": {
      name: "Nhà Giả Kim",
      price: 68000,
      images: [
        "img/nha-gia-kim.jpg",
        "img/nha-gia-kim.jpg",
        "img/nha-gia-kim.jpg",
      ],
      description:
        "Hành trình phi thường của cậu bé chăn cừu Santiago đi tìm kho báu và ý nghĩa thực sự của cuộc sống.",
    },
    "tuoi-tre-dang-gia-bao-nhieu": {
      name: "Tuổi Trẻ Đáng Giá Bao Nhiêu",
      price: 89000,
      images: [
        "img/tuoi-tre-dang-gia-bao-nhieu.jpg",
        "img/tuoi-tre-dang-gia-bao-nhieu.jpg",
        "img/tuoi-tre-dang-gia-bao-nhieu.jpg",
      ],
      description:
        "Cuốn sách truyền cảm hứng cho giới trẻ về cách sử dụng tuổi trẻ một cách ý nghĩa và hiệu quả.",
    },
    "ca-phe-cung-tony": {
      name: "Cà Phê Cùng Tony",
      price: 65000,
      images: [
        "img/ca-phe-cung-tony.jpg",
        "img/ca-phe-cung-tony.jpg",
        "img/ca-phe-cung-tony.jpg",
      ],
      description:
        "Tập hợp những câu chuyện ý nghĩa, những bài học cuộc sống sâu sắc từ Tony Buổi Sáng.",
    },
    "day-con-lam-giau": {
      name: "Dạy Con Làm Giàu",
      price: 95000,
      images: [
        "img/day-con-lam-giau.jpg",
        "img/day-con-lam-giau.jpg",
        "img/day-con-lam-giau.jpg",
      ],
      description:
        "Bộ sách cung cấp kiến thức tài chính và tư duy làm giàu từ nhỏ cho trẻ em và cả người lớn.",
    },
    "tu-duy-nhanh-va-cham": {
      name: "Tư Duy Nhanh Và Chậm",
      price: 120000,
      images: [
        "img/tu-duy-nhanh-va-cham.jpg",
        "img/tu-duy-nhanh-va-cham.jpg",
        "img/tu-duy-nhanh-va-cham.jpg",
      ],
      description:
        "Khám phá hai hệ thống tư duy chi phối cách chúng ta suy nghĩ và đưa ra quyết định.",
    },
    "bi-mat-tu-duy-trieu-phu": {
      name: "Bí Mật Tư Duy Triệu Phú",
      price: 85000,
      images: [
        "img/bi-mat-tu-duy-trieu-phu.jpg",
        "img/bi-mat-tu-duy-trieu-phu.jpg",
        "img/bi-mat-tu-duy-trieu-phu.jpg",
      ],
      description:
        "Thay đổi tư duy về tiền bạc và thành công để đạt được tự do tài chính.",
    },
    "kinh-dien-ve-khoi-nghiep": {
      name: "Kinh Điển Về Khởi Nghiệp",
      price: 110000,
      images: [
        "img/kinh-dien-ve-khoi-nghiep.jpg",
        "img/kinh-dien-ve-khoi-nghiep.jpg",
        "img/kinh-dien-ve-khoi-nghiep.jpg",
      ],
      description:
        "Những bài học quý giá từ các doanh nhân thành công nhất thế giới.",
    },
    "7-thoi-quen-hieu-qua": {
      name: "7 Thói Quen Hiệu Quả",
      price: 105000,
      images: [
        "img/7-thoi-quen-hieu-qua.jpg",
        "img/7-thoi-quen-hieu-qua.jpg",
        "img/7-thoi-quen-hieu-qua.jpg",
      ],
      description:
        "7 nguyên tắc vàng giúp bạn thay đổi tư duy, nâng cao hiệu suất công việc và cuộc sống.",
    },
    "doc-vi-bat-ky-ai": {
      name: "Đọc Vị Bất Kỳ Ai",
      price: 78000,
      images: [
        "img/doc-vi-bat-ky-ai.jpg",
        "img/doc-vi-bat-ky-ai.jpg",
        "img/doc-vi-bat-ky-ai.jpg",
      ],
      description:
        "Nghệ thuật thấu hiểu tâm lý người khác để thành công trong giao tiếp và đàm phán.",
    },
    "nghe-thuat-giao-tiep": {
      name: "Nghệ Thuật Giao Tiếp",
      price: 65000,
      images: [
        "img/nghe-thuat-giao-tiep.jpg",
        "img/nghe-thuat-giao-tiep.jpg",
        "img/nghe-thuat-giao-tiep.jpg",
      ],
      description:
        "Kỹ năng giao tiếp hiệu quả trong mọi tình huống cuộc sống và công việc.",
    },
    "lam-chu-tu-duy-thay-doi-van-menh": {
      name: "Làm Chủ Tư Duy Thay Đổi Vận Mệnh",
      price: 115000,
      images: [
        "img/lam-chu-tu-duy-thay-doi-van-menh.jpg",
        "img/lam-chu-tu-duy-thay-doi-van-menh.jpg",
        "img/lam-chu-tu-duy-thay-doi-van-menh.jpg",
      ],
      description:
        "Khám phá sức mạnh của tư duy và cách thay đổi vận mệnh thông qua thay đổi nhận thức.",
    },
    doraemon: {
      name: "Truyện Tranh Doraemon",
      price: 25000,
      images: ["img/doraemon.jpg", "img/doraemon.jpg", "img/doraemon.jpg"],
      description:
        "Bộ truyện tranh nổi tiếng về chú mèo máy Doraemon đến từ tương lai.",
    },
    "than-dong-dat-viet": {
      name: "Thần Đồng Đất Việt",
      price: 30000,
      images: [
        "img/than-dong-dat-viet.jpg",
        "img/than-dong-dat-viet.jpg",
        "img/than-dong-dat-viet.jpg",
      ],
      description:
        "Truyện tranh lịch sử Việt Nam với nhân vật Trạng Tí thông minh, hài hước.",
    },
    harrypotter: {
      name: "Harry Potter (Tập 1)",
      price: 120000,
      images: [
        "img/harrypotter.jpg",
        "img/harrypotter.jpg",
        "img/harrypotter.jpg",
      ],
      description:
        "Câu chuyện phép thuật về cậu bé Harry Potter và những cuộc phiêu lưu tại trường Hogwarts.",
    },
    "tam-cam": {
      name: "Truyện Cổ Tích: Tấm Cám",
      price: 35000,
      images: ["img/tam-cam.jpg", "img/tam-cam.jpg", "img/tam-cam.jpg"],
      description:
        "Câu chuyện cổ tích Việt Nam quen thuộc về cô Tấm hiền lành và mẹ con Cám độc ác.",
    },
    "toan-lop-1": {
      name: "Toán Lớp 1",
      price: 25000,
      images: [
        "img/toan-lop-1.jpg",
        "img/toan-lop-1.jpg",
        "img/toan-lop-1.jpg",
      ],
      description:
        "Sách giáo khoa Toán lớp 1 theo chương trình của Bộ Giáo dục và Đào tạo.",
    },
    "tieng-viet-lop-2": {
      name: "Tiếng Việt Lớp 2",
      price: 30000,
      images: [
        "img/tieng-viet-lop-2.jpg",
        "img/tieng-viet-lop-2.jpg",
        "img/tieng-viet-lop-2.jpg",
      ],
      description:
        "Sách giáo khoa Tiếng Việt lớp 2 theo chương trình của Bộ Giáo dục và Đào tạo.",
    },
    "vat-li-lop-10": {
      name: "Vật Lý Lớp 10",
      price: 45000,
      images: [
        "img/vat-li-lop-10.jpg",
        "img/vat-li-lop-10.jpg",
        "img/vat-li-lop-10.jpg",
      ],
      description:
        "Sách giáo khoa Vật lý lớp 10 theo chương trình của Bộ Giáo dục và Đào tạo.",
    },
    "hoa-hoc-lop-11": {
      name: "Hóa Học Lớp 11",
      price: 50000,
      images: [
        "img/hoa-hoc-lop-11.jpg",
        "img/hoa-hoc-lop-11.jpg",
        "img/hoa-hoc-lop-11.jpg",
      ],
      description:
        "Sách giáo khoa Hóa học lớp 11 theo chương trình của Bộ Giáo dục và Đào tạo.",
    },
    english: {
      name: "English Grammar In Use",
      price: 150000,
      images: ["img/english.jpg", "img/english.jpg", "img/english.jpg"],
      description:
        "Tài liệu học ngữ pháp tiếng Anh kinh điển dành cho người học ở mọi trình độ.",
    },
    japanese: {
      name: "Tự Học Tiếng Nhật",
      price: 120000,
      images: ["img/japanese.jpg", "img/japanese.jpg", "img/japanese.jpg"],
      description:
        "Giáo trình tự học tiếng Nhật từ cơ bản đến nâng cao với đầy đủ kỹ năng.",
    },
    korean: {
      name: "Tiếng Hàn Tổng Hợp",
      price: 110000,
      images: ["img/korean.png", "img/korean.png", "img/korean.png"],
      description:
        "Giáo trình học tiếng Hàn toàn diện từ cơ bản đến nâng cao, kèm theo CD luyện nghe.",
    },
    ielts: {
      name: "IELTS Speaking Band 9",
      price: 180000,
      images: ["img/ielts.png", "img/ielts.png", "img/ielts.png"],
      description:
        "Bí quyết đạt điểm cao trong phần thi IELTS Speaking với các mẫu câu và chiến lược hiệu quả.",
    },
    // Thêm các sản phẩm khác
  };

  const product = products[productId];
  if (product) {
    document.querySelector(".product-info h1").textContent = product.name;
    document.querySelector(
      ".price"
    ).textContent = `Giá: ${product.price.toLocaleString()}₫`;
    document.getElementById("mainImage").src = product.images[0];

    // Cập nhật các thumbnail
    const thumbnailContainer = document.querySelector(".thumbnail-container");
    thumbnailContainer.innerHTML = "";

    product.images.forEach((img, index) => {
      const thumbnail = document.createElement("img");
      thumbnail.src = img;
      thumbnail.className = "thumbnail" + (index === 0 ? " active" : "");
      thumbnail.onclick = function () {
        switchImage(this);
      };
      thumbnailContainer.appendChild(thumbnail);
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const loginLink = document.getElementById("loginLink");
  const userDropdown = document.getElementById("userDropdown");
  const userAvatar = document.getElementById("userAvatar");

  if (currentUser) {
    if (loginLink) loginLink.style.display = "none";
    if (userDropdown) userDropdown.style.display = "block";
    if (userAvatar && currentUser.avatar) {
      userAvatar.src = currentUser.avatar;
    }
  } else {
    if (loginLink) loginLink.style.display = "inline-block";
    if (userDropdown) userDropdown.style.display = "none";
  }

  // Xử lý đăng xuất
  const logoutLink = document.getElementById("logoutLink");
  if (logoutLink) {
    logoutLink.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("currentUser");
      window.location.href = "index.html";
    });
  }
});

// footer

document.querySelectorAll(".mobile-collapsible h3").forEach((header) => {
  header.addEventListener("click", () => {
    const content = header.nextElementSibling;
    if (content) {
      content.style.display =
        content.style.display === "none" ? "block" : "none";
    }
  });
});

// gio hang

document.querySelectorAll(".mobile-collapsible h3").forEach((header) => {
  header.addEventListener("click", () => {
    header.parentElement.classList.toggle("active");
  });
});

// Trong phần xử lý thanh toán (thanhtoan.html)
document.querySelector(".submit-btn").addEventListener("click", function (e) {
  e.preventDefault();

  if (cart.length === 0) {
    alert("Giỏ hàng của bạn đang trống!");
    return;
  }

  // Kiểm tra thông tin bắt buộc
  const fullname = document.getElementById("fullname").value;
  const email = document.getElementById("email").value;
  const phone = document.getElementById("phone").value;
  const address = document.getElementById("address").value;

  if (!fullname || !email || !phone || !address) {
    alert("Vui lòng điền đầy đủ thông tin bắt buộc");
    return;
  }

  // Lấy phương thức thanh toán đã chọn
  const paymentMethod = document.querySelector(
    'input[name="payment"]:checked'
  ).value;
  let paymentMethodName = "";

  switch (paymentMethod) {
    case "cod":
      paymentMethodName = "Thanh toán khi nhận hàng (COD)";
      break;
    case "bank":
      paymentMethodName = "Chuyển khoản ngân hàng";
      break;
    case "momo":
      paymentMethodName = "Ví điện tử MoMo";
      break;
    case "zalopay":
      paymentMethodName = "ZaloPay";
      break;
  }

  // Tạo đơn hàng
  const order = {
    customer: { fullname, email, phone, address },
    items: [...cart], // Sao chép giỏ hàng hiện tại
    paymentMethod,
    total: calculateTotal(),
    date: new Date().toISOString(),
    status: "pending", // Trạng thái ban đầu là "pending" (đang chờ xử lý)
  };

  // Lưu đơn hàng vào localStorage
  saveOrder(order);

  // Xóa giỏ hàng
  localStorage.removeItem("cart");
  cart = [];

  // Hiển thị thông báo thành công
  alert(
    `Đơn hàng của bạn đã được đặt thành công!\nMã đơn hàng: ABC-${new Date(
      order.date
    )
      .getTime()
      .toString()
      .slice(-6)}\nPhương thức thanh toán: ${paymentMethodName}`
  );

  // Chuyển hướng về trang đơn hàng
  window.location.href = "account.html?tab=orders";
});

// Hàm lưu đơn hàng (cập nhật từ phiên bản trước)
function saveOrder(order) {
  let orders = JSON.parse(localStorage.getItem("orders")) || [];
  orders.push(order);
  localStorage.setItem("orders", JSON.stringify(orders));
}

// Thêm vào phần xử lý đơn hàng
function saveOrder(order) {
  let orders = JSON.parse(localStorage.getItem("orders")) || [];
  // Thêm trạng thái mặc định nếu chưa có
  if (!order.status) {
    order.status = "pending";
  }
  orders.push(order);
  localStorage.setItem("orders", JSON.stringify(orders));
}

// Hàm hỗ trợ cho trang theo dõi đơn hàng
function getOrderById(orderId) {
  const orders = JSON.parse(localStorage.getItem("orders")) || [];
  return orders.find((order) => {
    const id = `ABC-${new Date(order.date).getTime().toString().slice(-6)}`;
    return id === orderId;
  });
}
