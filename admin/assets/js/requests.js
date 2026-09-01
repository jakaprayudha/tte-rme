/* =====================================================
   API CONFIGURATION
===================================================== */

const API_URL = "../api/controller/AdminDemoRequestController.php";

/* =====================================================
   GLOBAL DATA
===================================================== */

let requestData = [];

/* =====================================================
   DOM ELEMENTS
===================================================== */

const requestTable = document.getElementById("requestTable");

const searchInput = document.getElementById("searchInput");

const refreshButton = document.getElementById("refreshButton");

const detailModal = document.getElementById("detailModal");

const modalBody = document.getElementById("modalBody");

const closeModalButton = document.getElementById("closeModalButton");

/* =====================================================
   LOAD REQUEST DATA
===================================================== */

async function loadRequests() {
  requestTable.innerHTML = `

    <tr>

      <td
        colspan="6"
        class="table-loading"
      >

        <i class="fa-solid fa-spinner fa-spin"></i>

        Memuat data request...

      </td>

    </tr>

  `;

  try {
    const response = await fetch(API_URL, {
      credentials: "include",
    });

    const result = await response.json();

    console.log("REQUEST API:", result);

    if (!result.success) {
      throw new Error(result.message || "Gagal mengambil data");
    }

    requestData = result.data || [];

    /* =====================================
       UPDATE STATISTICS
    ===================================== */

    document.getElementById("totalRequest").textContent =
      result.stats?.total || requestData.length || 0;

    document.getElementById("newRequest").textContent = result.stats?.new || 0;

    document.getElementById("contactedRequest").textContent =
      result.stats?.contacted || 0;

    document.getElementById("todayRequest").textContent =
      result.stats?.today || 0;

    /* =====================================
       RENDER TABLE
    ===================================== */

    renderTable(requestData);
  } catch (error) {
    console.error("LOAD REQUEST ERROR:", error);

    requestTable.innerHTML = `

      <tr>

        <td
          colspan="6"
          class="table-loading"
        >

          <i
            class="
              fa-solid
              fa-triangle-exclamation
            "
            style="color:#dc2626"
          ></i>

          <br /><br />

          Gagal memuat data request.

        </td>

      </tr>

    `;
  }
}

/* =====================================================
   RENDER TABLE
===================================================== */

function renderTable(data) {
  if (!data.length) {
    requestTable.innerHTML = `

      <tr>

        <td
          colspan="6"
          class="table-loading"
        >

          <i class="fa-regular fa-folder-open"></i>

          <br /><br />

          Belum ada request demo.

        </td>

      </tr>

    `;

    return;
  }

  requestTable.innerHTML = data
    .map(function (item) {
      return `

          <tr>


            <!-- REQUESTER -->

            <td>

              <div class="requester-info">

                <div class="requester-avatar">

                  ${getInitials(item.name)}

                </div>


                <div>

                  <div class="requester-name">

                    ${escapeHTML(item.name)}

                  </div>


                  <div class="requester-email">

                    ${escapeHTML(item.email)}

                  </div>

                </div>

              </div>

            </td>



            <!-- INSTITUTION -->

            <td>

              <div class="institution-name">

                ${escapeHTML(item.institution)}

              </div>


              <div class="institution-city">

                ${escapeHTML(item.city || "-")}

              </div>

            </td>



            <!-- PRODUCT -->

            <td>

              <span class="product-badge">

                ${escapeHTML(item.product)}

              </span>

            </td>



            <!-- SCHEDULE -->

            <td>

              <div class="schedule-date">

                ${formatDate(item.demo_date)}

              </div>


              <div class="schedule-time">

                ${escapeHTML(item.demo_time || "-")}

              </div>

            </td>



            <!-- STATUS -->

            <td>

              ${getStatusBadge(item.status)}

            </td>



            <!-- ACTION -->

            <td>

              <button
                type="button"
                class="detail-button"
                onclick="showDetail(${item.id})"
                title="Lihat Detail"
              >

                <i class="fa-solid fa-eye"></i>

              </button>

            </td>


          </tr>

        `;
    })
    .join("");
}

/* =====================================================
   STATUS BADGE
===================================================== */

function getStatusBadge(status) {
  const currentStatus = status || "NEW";

  if (currentStatus === "CONTACTED") {
    return `

      <span
        class="
          status-badge
          status-contacted
        "
      >

        <i class="fa-solid fa-phone"></i>

        CONTACTED

      </span>

    `;
  }

  if (currentStatus === "DEMO_SCHEDULED") {
    return `

      <span
        class="
          status-badge
          status-scheduled
        "
      >

        <i class="fa-solid fa-calendar-check"></i>

        SCHEDULED

      </span>

    `;
  }

  return `

    <span
      class="
        status-badge
        status-new
      "
    >

      <i class="fa-solid fa-circle"></i>

      NEW

    </span>

  `;
}

/* =====================================================
   SHOW DETAIL
===================================================== */

function showDetail(id) {
  const item = requestData.find(function (data) {
    return Number(data.id) === Number(id);
  });

  if (!item) {
    return;
  }

  let locationHTML = `

    <div class="detail-value">

      Lokasi tidak tersedia

    </div>

  `;

  if (item.latitude && item.longitude) {
    const mapsURL =
      `https://www.google.com/maps?q=` + `${item.latitude},${item.longitude}`;

    locationHTML = `

      <div class="detail-value">

        ${item.latitude},
        ${item.longitude}

      </div>


      <div
        style="
          margin-top:6px;
          font-size:11px;
          color:#64748b;
        "
      >

        Accuracy:
        ${item.location_accuracy || "-"}

        meter

      </div>


      <a
        href="${mapsURL}"
        target="_blank"
        class="location-button"
      >

        <i class="fa-solid fa-location-dot"></i>

        Lihat di Google Maps

      </a>

    `;
  }

  modalBody.innerHTML = `

    <div class="detail-grid">


      <div class="detail-item">

        <div class="detail-label">

          Nama Lengkap

        </div>


        <div class="detail-value">

          ${escapeHTML(item.name)}

        </div>

      </div>



      <div class="detail-item">

        <div class="detail-label">

          Jabatan

        </div>


        <div class="detail-value">

          ${escapeHTML(item.position || "-")}

        </div>

      </div>



      <div class="detail-item full">

        <div class="detail-label">

          Institusi

        </div>


        <div class="detail-value">

          ${escapeHTML(item.institution)}

        </div>

      </div>



      <div class="detail-item">

        <div class="detail-label">

          Email

        </div>


        <div class="detail-value">

          ${escapeHTML(item.email)}

        </div>

      </div>



      <div class="detail-item">

        <div class="detail-label">

          Nomor WhatsApp

        </div>


        <div class="detail-value">

          ${escapeHTML(item.phone)}

        </div>

      </div>



      <div class="detail-item">

        <div class="detail-label">

          Kota / Kabupaten

        </div>


        <div class="detail-value">

          ${escapeHTML(item.city || "-")}

        </div>

      </div>



      <div class="detail-item">

        <div class="detail-label">

          Jenis Fasilitas

        </div>


        <div class="detail-value">

          ${escapeHTML(item.facility || "-")}

        </div>

      </div>



      <div class="detail-item full">

        <div class="detail-label">

          Produk

        </div>


        <div class="detail-value">

          ${escapeHTML(item.product)}

        </div>

      </div>



      <div class="detail-item">

        <div class="detail-label">

          Preferensi Tanggal

        </div>


        <div class="detail-value">

          ${formatDate(item.demo_date)}

        </div>

      </div>



      <div class="detail-item">

        <div class="detail-label">

          Preferensi Waktu

        </div>


        <div class="detail-value">

          ${escapeHTML(item.demo_time || "-")}

        </div>

      </div>



      <div class="detail-item full">

        <div class="detail-label">

          Kebutuhan / Catatan

        </div>


        <div class="detail-value">

          ${escapeHTML(item.needs || "-")}

        </div>

      </div>



      <div class="detail-item full">

        <div class="detail-label">

          Lokasi Requester

        </div>


        ${locationHTML}

      </div>



      <div class="detail-item">

        <div class="detail-label">

          Status

        </div>


        <div class="detail-value">

          ${escapeHTML(item.status || "NEW")}

        </div>

      </div>



      <div class="detail-item">

        <div class="detail-label">

          Request Dibuat

        </div>


        <div class="detail-value">

          ${formatDateTime(item.created_at)}

        </div>

      </div>


    </div>

  `;

  detailModal.classList.add("active");
}

/* =====================================================
   CLOSE MODAL
===================================================== */

function closeModal() {
  detailModal.classList.remove("active");
}

closeModalButton.addEventListener("click", closeModal);

detailModal.addEventListener("click", function (event) {
  if (event.target === detailModal) {
    closeModal();
  }
});

/* =====================================================
   SEARCH
===================================================== */

searchInput.addEventListener("input", function () {
  const keyword = this.value.toLowerCase().trim();

  const filteredData = requestData.filter(function (item) {
    return (
      (item.name || "").toLowerCase().includes(keyword) ||
      (item.email || "").toLowerCase().includes(keyword) ||
      (item.institution || "").toLowerCase().includes(keyword) ||
      (item.city || "").toLowerCase().includes(keyword)
    );
  });

  renderTable(filteredData);
});

/* =====================================================
   REFRESH
===================================================== */

refreshButton.addEventListener("click", function () {
  loadRequests();
});

/* =====================================================
   GET INITIALS
===================================================== */

function getInitials(name) {
  if (!name) {
    return "?";
  }

  return name
    .split(" ")
    .slice(0, 2)
    .map(function (word) {
      return word.charAt(0);
    })
    .join("")
    .toUpperCase();
}

/* =====================================================
   FORMAT DATE
===================================================== */

function formatDate(date) {
  if (!date) {
    return "-";
  }

  const value = new Date(date);

  if (isNaN(value.getTime())) {
    return date;
  }

  return value.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/* =====================================================
   FORMAT DATETIME
===================================================== */

function formatDateTime(date) {
  if (!date) {
    return "-";
  }

  const value = new Date(date.replace(" ", "T"));

  if (isNaN(value.getTime())) {
    return date;
  }

  return value.toLocaleString("id-ID");
}

/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHTML(value) {
  if (value === null || value === undefined) {
    return "";
  }

  const div = document.createElement("div");

  div.textContent = value;

  return div.innerHTML;
}

/* =====================================================
   INITIAL LOAD
===================================================== */

document.addEventListener("DOMContentLoaded", function () {
  loadRequests();
});
