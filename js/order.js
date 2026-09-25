(function () {
  var PHONE = "79106913110";
  var backdrop = document.getElementById("order-backdrop");
  var form = document.getElementById("order-form");
  if (!backdrop || !form) return;

  var serviceSelect = form.querySelector('[name="service"]');
  var closeBtn = backdrop.querySelector(".order-close");

  function setService(preset) {
    if (!preset || !serviceSelect) return;
    var opt = serviceSelect.querySelector('option[value="' + preset + '"]');
    if (opt) serviceSelect.value = preset;
  }

  function openOrder(preset) {
    if (preset) setService(preset);
    backdrop.classList.add("is-open");
    backdrop.setAttribute("aria-hidden", "false");
    document.body.classList.add("order-open");
    var first = form.querySelector('[name="name"]');
    if (first) setTimeout(function () { first.focus(); }, 80);
  }

  function closeOrder() {
    backdrop.classList.remove("is-open");
    backdrop.setAttribute("aria-hidden", "true");
    document.body.classList.remove("order-open");
    if (window.location.hash === "#order") {
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }

  function serviceFromLink(el) {
    if (el.getAttribute("data-service")) return el.getAttribute("data-service");
    try {
      var u = new URL(el.href, window.location.href);
      return u.searchParams.get("service") || "";
    } catch (e) {
      return "";
    }
  }

  document.addEventListener("click", function (e) {
    var a = e.target.closest("a[href*='#order'], a[data-order], button[data-order]");
    if (!a) return;
    var href = a.getAttribute("href") || "";
    if (a.hasAttribute("data-order") || href.indexOf("#order") !== -1) {
      e.preventDefault();
      openOrder(serviceFromLink(a));
    }
  });

  if (closeBtn) closeBtn.addEventListener("click", closeOrder);

  backdrop.addEventListener("click", function (e) {
    if (e.target === backdrop) closeOrder();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && backdrop.classList.contains("is-open")) closeOrder();
  });

  var params = new URLSearchParams(window.location.search);
  setService(params.get("service") || "");
  if (window.location.hash === "#order" || params.get("order") === "1") {
    openOrder(params.get("service") || "");
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var data = new FormData(form);
    var name = String(data.get("name") || "").trim();
    var phone = String(data.get("phone") || "").trim();
    var service = String(data.get("service") || "").trim();
    var guests = String(data.get("guests") || "").trim();
    var date = String(data.get("date") || "").trim();
    var note = String(data.get("note") || "").trim();

    if (!name || !phone || !service) {
      alert("Заполните имя, телефон и услугу.");
      return;
    }

    var serviceLabel =
      (serviceSelect && serviceSelect.selectedOptions[0]
        ? serviceSelect.selectedOptions[0].text
        : service) || service;

    var lines = [
      "Заявка с сайта Гедония",
      "",
      "Имя: " + name,
      "Телефон: " + phone,
      "Услуга: " + serviceLabel,
    ];
    if (guests) lines.push("Гостей: " + guests);
    if (date) lines.push("Дата: " + date);
    if (note) lines.push("Комментарий: " + note);

    var text = lines.join("\n");
    var url = "https://wa.me/" + PHONE + "?text=" + encodeURIComponent(text);
    window.open(url, "_blank", "noopener");

    var status = document.getElementById("order-status");
    if (status) {
      status.textContent =
        "Откроется WhatsApp — нажмите «Отправить», и мы получим сообщение.";
      status.classList.add("is-on");
    }
  });
})();
