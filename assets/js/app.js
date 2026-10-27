(function () {
  "use strict";

  var RING_CIRCUMFERENCE = 552.92;
  var state = null;
  var hasChanges = false;

  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function valueOrZero(value) {
    return KPI.clamp(Number(value) || 0, 0, 100);
  }

  function scoreMessage(score) {
    if (score >= 95) return "ผลงานอยู่ในเกณฑ์ยอดเยี่ยม";
    if (score >= 85) return "อยู่ในเกณฑ์ดีมาก";
    if (score >= 70) return "อยู่ในเกณฑ์ตามเป้าหมาย";
    return "ต้องติดตามอย่างใกล้ชิด";
  }

  function buildMonthOptions() {
    var options = KPI.THAI_MONTHS.map(function (month, index) {
      return '<option value="' + (index + 1) + '">' + month + "</option>";
    }).join("");
    var reportMonth = qs("#reportMonth");
    var monthlyMonth = qs("#monthlyMonth");
    var selected = String(KPI.clamp(Number(state && state.meta && state.meta.reportMonth) || 1, 1, 12));

    if (reportMonth) reportMonth.innerHTML = options;
    if (monthlyMonth) {
      monthlyMonth.innerHTML = options;
      monthlyMonth.value = selected;
    }
  }

  function monthlyMonthIndex() {
    var select = qs("#monthlyMonth");
    return KPI.clamp(Number(select && select.value) - 1, 0, 11);
  }

  function updateMonthlyScore() {
    var score = KPI.weightedScoreForMonth(state, monthlyMonthIndex());
    if (qs("#monthlyScorePill")) qs("#monthlyScorePill").textContent = KPI.formatPercent(score);
    if (qs("#monthlyScoreInline")) qs("#monthlyScoreInline").textContent = KPI.formatPercent(score);
  }

  function renderMonthlyRows() {
    var tbody = qs("#monthlyRows");
    if (!tbody) return;

    var monthIndex = monthlyMonthIndex();
    var monthName = KPI.THAI_MONTHS[monthIndex];

    tbody.innerHTML = KPI.KPI_ITEMS.map(function (item) {
      var value = KPI.monthlyValue(state, item.id, monthIndex);
      return (
        '<tr data-monthly-row="' + item.id + '">' +
        '<td><span class="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 font-display text-[13px] font-semibold text-slate-500">' +
        String(item.no).padStart(2, "0") +
        "</span></td>" +
        '<td><p class="max-w-[470px] font-medium leading-6 text-slate-800">' + item.title + "</p>" +
        '<div class="mt-1.5 flex flex-wrap items-center gap-2"><span class="text-[12px] font-medium uppercase tracking-[0.1em] text-brand-700">' + item.category + "</span></div></td>" +
        '<td class="text-center"><span class="inline-flex min-w-12 items-center justify-center rounded-full bg-brand-50 px-2.5 py-1 text-[13px] font-semibold text-brand-800">' + item.weight + "%</span></td>" +
        '<td class="text-center text-[13px] font-medium text-slate-500">' + item.target + "%</td>" +
        '<td class="text-center">' +
        '<div class="relative mx-auto w-24"><input class="actual-field" type="number" inputmode="decimal" min="0" max="100" step="0.1" required ' +
        'data-monthly data-id="' + item.id + '" value="' + value + '" aria-label="ผลการดำเนินงานเดือน' + monthName + " " + item.title + '">' +
        '<span class="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-[12px] font-medium text-slate-500">%</span></div>' +
        "</td>" +
        "</tr>"
      );
    }).join("");

    updateMonthlyScore();
  }

  var WEIGHT_RADIUS = 86;
  var WEIGHT_CIRCUMFERENCE = 2 * Math.PI * WEIGHT_RADIUS;

  function renderWeightDonut() {
    var host = qs("#weightDonut");
    var legend = qs("#weightLegend");
    if (!host) return;

    var items = KPI.KPI_ITEMS;
    var total = items.reduce(function (sum, item) {
      return sum + item.weight;
    }, 0) || 100;
    var gap = 3;
    var offset = 0;

    var segments = items.map(function (item) {
      var length = (item.weight / total) * WEIGHT_CIRCUMFERENCE;
      var visible = Math.max(length - gap, 0.5);
      var rotation = (offset / WEIGHT_CIRCUMFERENCE) * 360 - 90;
      offset += length;
      return (
        '<circle class="donut-segment" cx="120" cy="120" r="' + WEIGHT_RADIUS + '" fill="none" stroke="' + item.color +
        '" stroke-width="30" stroke-dasharray="' + visible.toFixed(2) + " " + WEIGHT_CIRCUMFERENCE.toFixed(2) +
        '" transform="rotate(' + rotation.toFixed(2) + ' 120 120)">' +
        "<title>" + UI.escapeHtml(item.shortTitle) + " · น้ำหนัก " + item.weight + "%</title>" +
        "</circle>"
      );
    }).join("");

    host.innerHTML =
      '<svg viewBox="0 0 240 240" class="h-52 w-52 sm:h-60 sm:w-60" aria-hidden="true" focusable="false">' +
      '<circle cx="120" cy="120" r="' + WEIGHT_RADIUS + '" fill="none" stroke="#f1f5f9" stroke-width="30"></circle>' +
      segments +
      '<text x="120" y="116" text-anchor="middle" font-family="Prompt, \'Noto Sans Thai\', sans-serif" font-size="34" font-weight="600" fill="#0f172a">' + total + "%</text>" +
      '<text x="120" y="140" text-anchor="middle" font-family="\'Noto Sans Thai\', sans-serif" font-size="14" fill="#64748b">น้ำหนักรวม</text>' +
      "</svg>";

    if (legend) {
      legend.innerHTML = items.map(function (item) {
        return (
          '<li class="flex items-start gap-2.5">' +
          '<span class="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full" style="background-color:' + item.color + '"></span>' +
          '<span class="min-w-0 flex-1 text-[13px] leading-5 text-slate-600">' + UI.escapeHtml(item.shortTitle) + "</span>" +
          '<span class="shrink-0 text-[13px] font-semibold tabular-nums text-slate-800">' + item.weight + "%</span>" +
          "</li>"
        );
      }).join("");
    }

    var sorted = items.slice().sort(function (a, b) {
      return b.weight - a.weight;
    });
    var top = sorted[0];
    var focus = qs("#weightFocus");
    if (focus && top) {
      focus.innerHTML =
        "น้ำหนักสูงสุดอยู่ที่ <span class=\"font-semibold text-brand-800\">" + UI.escapeHtml(top.shortTitle) + " " + top.weight +
        "%</span> อีก " + (items.length - 1) + " รายการรวมกัน " + (total - top.weight) + "%";
    }
  }

  function progressMarkup(value, status) {
    return (
      '<div class="flex items-center justify-between gap-2 text-[12px] text-slate-500">' +
      '<span data-progress-label="' + status.key + '">' + KPI.formatPercent(value, 0) + "</span>" +
      '<span class="font-medium ' + (status.key === "achieved" ? "text-emerald-700" : status.key === "risk" ? "text-rose-700" : "text-brand-700") + '">' +
      (status.key === "achieved" ? "ครบเป้า" : status.key === "onTrack" ? "ใกล้เป้า" : status.key === "watch" ? "ติดตาม" : "ล่าช้า") +
      "</span>" +
      "</div>" +
      '<div class="progress-track mt-1.5"><div data-progress="' + status.key + '" class="progress-fill" style="width: ' + value + '%"></div></div>'
    );
  }

  function renderOverallRows() {
    var tbody = qs("#overallRows");
    if (!tbody) return;

    tbody.innerHTML = KPI.KPI_ITEMS.map(function (item) {
      var value = KPI.percentOr(state.overall[item.id], 0);
      var status = KPI.statusFor(value, item.target);

      return (
        '<tr data-overall-row="' + item.id + '">' +
        '<td><span class="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 font-display text-[13px] font-semibold text-slate-500">' +
        String(item.no).padStart(2, "0") +
        "</span></td>" +
        '<td><p class="max-w-[470px] font-medium leading-6 text-slate-800">' + item.title + "</p>" +
        '<div class="mt-1.5 flex flex-wrap items-center gap-2"><span class="text-[12px] font-medium uppercase tracking-[0.1em] text-brand-700">' + item.category + "</span></div></td>" +
        '<td class="text-center"><span class="inline-flex min-w-12 items-center justify-center rounded-full bg-brand-50 px-2.5 py-1 text-[13px] font-semibold text-brand-800">' + item.weight + "%</span></td>" +
        '<td class="text-center text-[13px] font-medium text-slate-500">' + item.target + "%</td>" +
        '<td class="text-center">' +
        '<div class="relative mx-auto w-24"><input class="actual-field" type="number" inputmode="decimal" min="0" max="100" step="0.1" required ' +
        'data-actual data-section="overall" data-id="' + item.id + '" value="' + value + '" aria-label="ผลการดำเนินงาน ' + item.title + '">' +
        '<span class="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-[12px] font-medium text-slate-500">%</span></div>' +
        "</td>" +
        '<td data-progress-cell="' + item.id + '">' + progressMarkup(value, status) + "</td>" +
        '<td><span data-status-for="overall-' + item.id + '" class="' + status.className + '">' + status.label + "</span></td>" +
        "</tr>"
      );
    }).join("");
  }

  function personalRowMarkup(goal, compact) {
    var section = "personal";
    var value = KPI.percentOr(state.personal[goal.id], 0);
    var status = KPI.statusFor(value, goal.targetValue);

    return (
      '<tr data-personal-row="' + goal.id + '">' +
      '<td><p class="max-w-[440px] font-medium leading-6 text-slate-800">' + goal.title + "</p>" +
      '<p class="mt-1 text-[12px] text-slate-500">เป้าหมาย: ' + goal.target + "</p></td>" +
      (compact
        ? '<td><span class="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[12px] font-semibold text-slate-500">' + goal.category + "</span></td>"
        : '<td class="text-[13px] font-medium text-slate-500">' + goal.target + "</td>") +
      '<td class="text-center">' +
      '<div class="relative mx-auto w-24"><input class="actual-field" type="number" inputmode="decimal" min="0" max="100" step="0.1" required ' +
      'data-actual data-section="' + section + '" data-id="' + goal.id + '" value="' + value + '" aria-label="ผลการดำเนินงาน ' + goal.title + '">' +
      '<span class="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-[12px] font-medium text-slate-500">%</span></div></td>' +
      '<td data-progress-cell="' + goal.id + '">' + progressMarkup(value, status) + "</td>" +
      '<td><span data-status-for="personal-' + goal.id + '" class="' + status.className + '">' + status.label + "</span></td>" +
      "</tr>"
    );
  }

  function renderPersonalRows() {
    var headBody = qs("#headRows");
    var staffBody = qs("#staffRows");
    if (headBody) headBody.innerHTML = KPI.HEAD_GOALS.map(function (goal) {
      return personalRowMarkup(goal, false);
    }).join("");
    if (staffBody) staffBody.innerHTML = KPI.STAFF_GOALS.map(function (goal) {
      return personalRowMarkup(goal, true);
    }).join("");
  }

  function populateMeta() {
    var reporter = qs("#reporter");
    var reportMonth = qs("#reportMonth");
    var reportDate = qs("#reportDate");
    if (reporter) reporter.value = state.meta.reporter || "";
    if (reportMonth) reportMonth.value = String(state.meta.reportMonth || 1);
    if (reportDate) reportDate.value = state.meta.reportDate || "";
  }

  function populateInputs() {
    qsa("[data-actual]").forEach(function (input) {
      var section = input.getAttribute("data-section");
      var id = input.getAttribute("data-id");
      if (!section || !id) return;
      input.value = KPI.percentOr(state[section][id], 0);
    });
  }

  function paintRow(input) {
    var section = input.getAttribute("data-section");
    var id = input.getAttribute("data-id");
    if (!section || !id) return;

    var goal = section === "overall"
      ? KPI.KPI_ITEMS.find(function (item) { return item.id === id; })
      : KPI.ALL_PERSONAL_GOALS.find(function (item) { return item.id === id; });
    if (!goal) return;

    var value = valueOrZero(input.value);
    var target = goal.target === undefined ? 100 : goal.target;
    var targetValue = goal.targetValue === undefined ? target : goal.targetValue;
    var status = KPI.statusFor(value, targetValue);
    var cell = qs('[data-progress-cell="' + id + '"]');
    var badge = qs('[data-status-for="' + section + "-" + id + '"]');

    if (cell) cell.innerHTML = progressMarkup(value, status);
    if (badge) {
      badge.className = status.className;
      badge.textContent = status.label;
    }
  }

  function updateSavedUi(isStored) {
    var heroBadge = qs("#heroDataBadge");
    var heroUpdated = qs("#heroUpdated");
    var summaryPill = qs("#summarySavedPill");
    var summaryUpdated = qs("#summaryUpdated");
    var formBadge = qs("#formSampleBadge");
    var formHint = qs("#formHint");

    if (state.updatedAt) {
      var updatedText = KPI.formatThaiDateTime(state.updatedAt);
      if (heroBadge) {
        heroBadge.textContent = "บันทึกแล้ว";
        heroBadge.className =
          "rounded-full border border-emerald-300/30 bg-emerald-400/15 px-3 py-1 text-[12px] font-semibold text-emerald-100";
      }
      if (heroUpdated) heroUpdated.textContent = "อัปเดตล่าสุด " + updatedText;
      if (summaryPill) {
        summaryPill.textContent = "บันทึกแล้ว";
        summaryPill.className = "pill-success";
      }
      if (summaryUpdated) {
        summaryUpdated.textContent = KPI.formatThaiDate(state.meta.reportDate || state.updatedAt, { short: true });
        summaryUpdated.title = updatedText;
      }
      if (formBadge) {
        formBadge.textContent = "บันทึกข้อมูลล่าสุดแล้ว";
        formBadge.className = "pill-success w-fit";
      }
      if (formHint) {
        formHint.textContent = "บันทึกข้อมูลล่าสุด " + updatedText + " · ข้อมูลถูกจัดเก็บในเบราว์เซอร์เครื่องนี้";
      }
    } else {
      if (heroBadge) {
        heroBadge.textContent = "ข้อมูลตัวอย่าง";
        heroBadge.className =
          "rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[12px] font-semibold text-white/80";
      }
      if (heroUpdated) heroUpdated.textContent = "ข้อมูลตัวอย่าง · แก้ไขและกดบันทึกเพื่ออัปเดต";
      if (summaryPill) {
        summaryPill.textContent = "ตัวอย่าง";
        summaryPill.className = "pill-neutral";
      }
      if (summaryUpdated) summaryUpdated.textContent = "ยังไม่บันทึก";
      if (formBadge) {
        formBadge.textContent = "กำลังแสดงข้อมูลตัวอย่าง";
        formBadge.className = "pill-warning w-fit";
      }
      if (formHint) {
        formHint.textContent = "ข้อมูลจะถูกจัดเก็บไว้ในเบราว์เซอร์เครื่องนี้ และแสดงผลต่อในหน้ารายงานผลการดำเนินงาน";
      }
    }

    if (isStored === false && state.updatedAt) {
      hasChanges = false;
    }
  }

  function updateSummary() {
    var stats = KPI.overallStats(state);
    var meta = KPI.scoreMeta(stats.score);
    var ring = qs("#heroRing");
    var scoreText = KPI.formatPercent(stats.score);
    var achievedText = stats.achieved + " / " + stats.total;

    if (ring) ring.setAttribute("stroke-dashoffset", String(RING_CIRCUMFERENCE * (1 - stats.score / 100)));

    if (qs("#heroScore")) qs("#heroScore").textContent = KPI.formatNumber(stats.score);
    if (qs("#heroStatus")) qs("#heroStatus").textContent = scoreMessage(stats.score);
    if (qs("#heroAchieved")) qs("#heroAchieved").textContent = String(stats.achieved);

    if (qs("#summaryScore")) qs("#summaryScore").textContent = scoreText;
    if (qs("#summaryScoreBar")) qs("#summaryScoreBar").style.width = stats.score + "%";
    if (qs("#summaryAchieved")) qs("#summaryAchieved").textContent = stats.achieved + " รายการ";
    if (qs("#summaryAchievedPill")) {
      qs("#summaryAchievedPill").textContent = achievedText;
      qs("#summaryAchievedPill").className = stats.achieved === stats.total ? "pill-success" : "pill-warning";
    }

    qsa("#formScore, #formScoreInline").forEach(function (element) {
      element.textContent = scoreText;
    });

    qsa("[data-score-meta]").forEach(function (element) {
      element.textContent = meta.label;
      element.className = meta.textClass;
    });
  }

  function readForm() {
    qsa("[data-actual]").forEach(function (input) {
      var section = input.getAttribute("data-section");
      var id = input.getAttribute("data-id");
      if (!section || !id) return;
      KPI.setField(state, section, id, input.value);
    });

    var monthIndex = monthlyMonthIndex();
    qsa("[data-monthly]").forEach(function (input) {
      KPI.setMonthly(state, input.getAttribute("data-id"), monthIndex, input.value);
    });

    var reporter = qs("#reporter");
    var reportMonth = qs("#reportMonth");
    var reportDate = qs("#reportDate");
    state.meta.reporter = KPI.sanitizeReporter(reporter && reporter.value);
    state.meta.reportMonth = String(KPI.clamp(Number(reportMonth && reportMonth.value) || 1, 1, 12));
    state.meta.reportDate = (reportDate && reportDate.value) || new Date().toISOString().slice(0, 10);
    return state;
  }

  function saveForm(event) {
    event.preventDefault();
    var form = event.currentTarget;

    if (!form.checkValidity()) {
      form.reportValidity();
      UI.showToast("กรุณากรอกผลการดำเนินงานให้ครบ 0–100%", "error");
      return;
    }

    readForm();

    try {
      state = KPI.save(state);
      hasChanges = false;
      updateSavedUi(true);
      updateSummary();
      UI.showToast("บันทึกผลการดำเนินงานเรียบร้อยแล้ว");
    } catch (error) {
      console.error(error);
      UI.showToast("ไม่สามารถบันทึกข้อมูลได้ กรุณาตรวจสอบพื้นที่จัดเก็บของเบราว์เซอร์", "error");
    }
  }

  function resetForm() {
    var confirmed = window.confirm(
      "ต้องการล้างผลการดำเนินงานทั้งหมดเป็น 0% หรือไม่?\nข้อมูลที่บันทึกไว้ในเบราว์เซอร์จะถูกแทนที่"
    );
    if (!confirmed) return;

    var cleared = KPI.createDefaultState();
    KPI.KPI_ITEMS.forEach(function (item) { cleared.overall[item.id] = 0; });
    KPI.ALL_PERSONAL_GOALS.forEach(function (goal) { cleared.personal[goal.id] = 0; });
    KPI.KPI_ITEMS.forEach(function (item) {
      cleared.monthlyByKpi[item.id] = cleared.monthlyByKpi[item.id].map(function () { return 0; });
    });
    cleared.monthly = cleared.monthly.map(function () { return 0; });
    cleared.meta.reporter = "";
    cleared.meta.reportMonth = state.meta.reportMonth;
    cleared.meta.reportDate = new Date().toISOString().slice(0, 10);

    try {
      state = KPI.save(cleared);
      populateInputs();
      populateMeta();
      qsa("[data-actual]").forEach(paintRow);
      renderMonthlyRows();
      updateSavedUi(true);
      updateSummary();
      UI.showToast("ล้างผลการดำเนินงานเรียบร้อยแล้ว");
    } catch (error) {
      console.error(error);
      UI.showToast("ไม่สามารถบันทึกข้อมูลได้", "error");
    }
  }

  function init() {
    if (!window.KPI) return;
    state = KPI.load();
    buildMonthOptions();
    renderWeightDonut();
    renderOverallRows();
    renderMonthlyRows();
    renderPersonalRows();
    populateInputs();
    populateMeta();
    updateSavedUi(KPI.isSaved());
    updateSummary();

    var form = qs("#kpiForm");
    if (form) {
      form.addEventListener("submit", saveForm);
      form.addEventListener("input", function (event) {
        var monthlyInput = event.target.closest("[data-monthly]");
        if (monthlyInput) {
          KPI.setMonthly(state, monthlyInput.getAttribute("data-id"), monthlyMonthIndex(), monthlyInput.value);
          hasChanges = true;
          updateMonthlyScore();
          return;
        }

        var input = event.target.closest("[data-actual]");
        if (!input) return;
        var section = input.getAttribute("data-section");
        var id = input.getAttribute("data-id");
        if (!section || !id) return;
        state[section][id] = valueOrZero(input.value);
        hasChanges = true;
        paintRow(input);
        updateSummary();
      });
      form.addEventListener("change", function (event) {
        if (event.target.matches("#reportMonth, #reportDate, #reporter")) hasChanges = true;
      });
    }

    var reset = qs("#resetButton");
    if (reset) reset.addEventListener("click", resetForm);

    var monthlyMonth = qs("#monthlyMonth");
    if (monthlyMonth) {
      monthlyMonth.addEventListener("change", function () {
        renderMonthlyRows();
      });
    }

    window.addEventListener("beforeunload", function (event) {
      if (!hasChanges) return;
      event.preventDefault();
      event.returnValue = "";
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
