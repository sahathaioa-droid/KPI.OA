(function () {
  "use strict";

  var state = null;
  var albumFilter = "all";
  var lightboxList = [];
  var lightboxPosition = 0;

  var ALBUM = [];
  for (var albumIndex = 1; albumIndex <= 20; albumIndex++) {
    ALBUM.push({
      file: "album-" + String(albumIndex).padStart(2, "0") + ".jpg",
      title: "ภาพกิจกรรมแผนก O.A. ลำดับที่ " + albumIndex,
      category: "ภาพกิจกรรม"
    });
  }

  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function scoreMessage(score) {
    if (score >= 95) return "ผลงานอยู่ในเกณฑ์ยอดเยี่ยม";
    if (score >= 85) return "อยู่ในเกณฑ์ดีมาก";
    if (score >= 70) return "อยู่ในเกณฑ์ตามเป้าหมาย";
    return "ต้องติดตามอย่างใกล้ชิด";
  }

  var MONTHLY_ACTION_NOTES = {
    cctv_sriwichai: "ตรวจสอบคุณภาพภาพ จุดบอด และอุปกรณ์บันทึกภาพประจำเดือน",
    cctv_thaithong: "ตรวจสอบคุณภาพภาพ จุดบอด และอุปกรณ์บันทึกภาพประจำเดือน",
    pos_upgrade: "วัดความเร็วในการทำรายการและติดตามข้อขัดข้องหลังเปลี่ยนอุปกรณ์",
    pos_satisfaction: "สำรวจความพึงพอใจแคชเชียร์และแก้จุดติดขัดการใช้งานเป็นรายเดือน",
    phone: "ตรวจสอบสายและเครื่องโทรศัพท์ทุกจุดอย่างสม่ำเสมอ",
    speaker: "ทดสอบเสียงตามสายทุกจุดและวางแผนซ่อมบำรุงเชิงป้องกัน",
    hris: "รักษามาตรฐานการใช้งานและติดตามปัญหาผู้ใช้อย่างต่อเนื่อง"
  };

  function buildMonthlyAnalysis() {
    var scores = KPI.monthlyScores(state);
    var reported = [];

    KPI.THAI_MONTHS.forEach(function (_, index) {
      var hasData = KPI.KPI_ITEMS.some(function (item) {
        return KPI.monthlyValue(state, item.id, index) > 0;
      });
      if (hasData) reported.push(index);
    });

    var hasReported = reported.length > 0;

    if (!hasReported) {
      var fallbackIndex = KPI.clamp(Number(state.meta && state.meta.reportMonth) - 1 || 0, 0, 11);
      reported = [fallbackIndex];
    }

    var firstIndex = reported[0];
    var latestIndex = reported[reported.length - 1];
    var reportedScores = reported.map(function (index) { return scores[index]; });
    var bestIndex = reported.reduce(function (best, index) {
      return scores[index] > scores[best] ? index : best;
    }, reported[0]);

    var entries = KPI.KPI_ITEMS.map(function (item) {
      var value = KPI.monthlyValue(state, item.id, latestIndex);
      return {
        item: item,
        value: value,
        delta: Math.round((value - KPI.monthlyValue(state, item.id, firstIndex)) * 10) / 10
      };
    });

    var weakest = entries.filter(function (entry) {
      return entry.value < entry.item.target;
    }).sort(function (a, b) {
      return a.value - b.value || b.item.weight - a.item.weight;
    });

    var strongest = entries.slice().sort(function (a, b) {
      return b.value - a.value || b.item.weight - a.item.weight;
    })[0];

    var improver = entries.slice().sort(function (a, b) {
      return b.delta - a.delta;
    })[0];

    return {
      scores: scores,
      reported: reported,
      empty: !hasReported,
      reportCount: hasReported ? reported.length : 0,
      firstIndex: firstIndex,
      latestIndex: latestIndex,
      reportedAverage: KPI.average(reportedScores),
      latestScore: scores[latestIndex],
      bestIndex: bestIndex,
      bestScore: scores[bestIndex],
      trend: Math.round((scores[latestIndex] - scores[firstIndex]) * 10) / 10,
      achieved: entries.filter(function (entry) { return entry.value >= entry.item.target; }).length,
      entries: entries,
      weakest: weakest,
      strongest: strongest,
      improver: improver,
      hris: entries.filter(function (entry) { return entry.item.id === "hris"; })[0]
    };
  }

  function updateHeader(analysis) {
    var stats = KPI.overallStats(state);
    var months = KPI.monthlyStats(KPI.monthlyScores(state), state.meta.reportMonth);
    var currentMonth = KPI.monthFromMeta(state.meta, false);
    var updatedText = KPI.formatThaiDateTime(state.updatedAt, "ยังไม่บันทึกข้อมูล");

    if (qs("#reportMonthLabel")) qs("#reportMonthLabel").textContent = currentMonth + " 2569";
    if (qs("#reporterLabel")) qs("#reporterLabel").textContent = state.meta.reporter || "ไม่ระบุ";
    if (qs("#reportUpdated")) qs("#reportUpdated").textContent = state.updatedAt ? "อัปเดตล่าสุด " + updatedText : "ยังไม่บันทึกข้อมูล";
    if (qs("#footerUpdated")) qs("#footerUpdated").textContent = updatedText;

    if (qs("#reportSavedBadge")) {
      if (state.updatedAt) {
        qs("#reportSavedBadge").textContent = "บันทึกแล้ว";
        qs("#reportSavedBadge").className =
          "rounded-full border border-emerald-300/30 bg-emerald-400/15 px-3 py-1 text-[12px] font-semibold text-emerald-100";
      } else {
        qs("#reportSavedBadge").textContent = "ข้อมูลตัวอย่าง";
        qs("#reportSavedBadge").className =
          "rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[12px] font-semibold text-white/80";
      }
    }

    if (qs("#currentMonthScore")) qs("#currentMonthScore").textContent = KPI.formatPercent(months.currentValue);
    if (qs("#currentMonthLabel")) qs("#currentMonthLabel").textContent = currentMonth + " 2569";
    if (qs("#currentMonthDeltaPill")) {
      var delta = months.currentIndex === 0 ? 0 : months.delta;
      qs("#currentMonthDeltaPill").textContent = (delta > 0 ? "+" : "") + KPI.formatNumber(delta) + "%";
      qs("#currentMonthDeltaPill").className =
        delta > 0 ? "pill-success" : delta < 0 ? "pill-danger" : "pill-neutral";
    }
    if (qs("#monthlyAverage")) qs("#monthlyAverage").textContent = analysis.empty ? "—" : KPI.formatPercent(analysis.reportedAverage);
    if (qs("#monthlyAverageBadge")) qs("#monthlyAverageBadge").textContent = analysis.reportCount + " / 12 เดือน";
    if (qs("#monthlyBest")) {
      qs("#monthlyBest").textContent = analysis.empty
        ? "ยังไม่มีผลรายเดือน"
        : "สูงสุด " + KPI.THAI_MONTHS_SHORT[analysis.bestIndex] + " " + KPI.formatPercent(analysis.bestScore);
    }
    if (qs("#personalAverage")) qs("#personalAverage").textContent = KPI.formatPercent(stats.personalAverage);
    if (qs("#personalBreakdown")) {
      qs("#personalBreakdown").textContent =
        "หัวหน้า " + KPI.formatPercent(stats.headAverage) + " · เจ้าหน้าที่ " + KPI.formatPercent(stats.staffAverage);
    }
    if (qs("#achievedCount")) qs("#achievedCount").textContent = analysis.achieved + " รายการ";
    if (qs("#achievedPill")) {
      qs("#achievedPill").textContent = analysis.achieved + " / " + KPI.KPI_ITEMS.length;
      qs("#achievedPill").className = analysis.achieved === KPI.KPI_ITEMS.length ? "pill-success" : "pill-warning";
    }
    if (qs("#achievedMeta")) {
      qs("#achievedMeta").textContent = analysis.empty
        ? "ยังไม่มีผลรายเดือน"
        : "จาก " + KPI.KPI_ITEMS.length + " รายการ · " + KPI.THAI_MONTHS_SHORT[analysis.latestIndex] + " 2569";
    }

    return {
      stats: stats,
      months: months,
      analysis: analysis,
      currentMonth: currentMonth
    };
  }

  function updateExecutiveSummary(context) {
    var analysis = context.analysis;
    var top = analysis.strongest;
    var lowest = analysis.weakest[0] || top;

    if (!top) return;

    if (analysis.empty) {
      if (qs("#execSummary")) {
        qs("#execSummary").textContent =
          "ยังไม่มีผลการดำเนินงานรายเดือนที่บันทึกไว้ จึงยังไม่สามารถวิเคราะห์ภาพรวมและแนวโน้มได้ เมื่อบันทึกผลของแต่ละเดือนแล้ว ระบบจะสรุปจุดแข็ง จุดที่ต้องเร่งรัด และข้อเสนอแนะให้อัตโนมัติ";
      }
      if (qs("#execNote")) {
        qs("#execNote").textContent = "เริ่มบันทึกผลรายเดือนได้ที่หน้าเป้าหมาย KPI · มีข้อมูล 0 / 12 เดือน";
      }
      if (qs("#topKpiTitle")) qs("#topKpiTitle").textContent = "—";
      if (qs("#topKpiScore")) qs("#topKpiScore").textContent = "—";
      if (qs("#focusKpiTitle")) qs("#focusKpiTitle").textContent = "—";
      if (qs("#focusKpiScore")) qs("#focusKpiScore").textContent = "—";
      if (qs("#trendLabel")) qs("#trendLabel").textContent = "ยังไม่มีข้อมูล";
      if (qs("#trendScore")) {
        qs("#trendScore").textContent = "—";
        qs("#trendScore").className = "mt-2 font-display text-lg font-semibold text-slate-500";
      }
      var emptyAttention = qs("#attentionList");
      if (emptyAttention) {
        emptyAttention.innerHTML =
          '<li class="flex items-start gap-3">' +
          '<span class="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/10 font-display text-[12px] font-semibold text-brand-100">01</span>' +
          '<div class="min-w-0">' +
          '<p class="text-[13px] font-semibold leading-5 text-white">ยังไม่มีผลการดำเนินงานรายเดือน</p>' +
          '<p class="mt-1 text-[12px] leading-5 text-white/65">เริ่มบันทึกผลของเดือน ก.ค. เป็นต้นไป เพื่อให้ระบบคำนวณภาพรวมและข้อสังเกตอัตโนมัติ</p>' +
          '<p class="mt-1 text-[12px] font-medium text-brand-200">มีข้อมูล 0 / 12 เดือน</p>' +
          "</div>" +
          "</li>";
      }
      return;
    }

    var firstMonth = KPI.THAI_MONTHS_SHORT[analysis.firstIndex];
    var latestMonth = KPI.THAI_MONTHS_SHORT[analysis.latestIndex];
    var rangeLabel =
      analysis.firstIndex === analysis.latestIndex
        ? firstMonth + " 2569"
        : firstMonth + "–" + latestMonth + " 2569";
    var trendText =
      analysis.trend > 0
        ? "เพิ่มขึ้น " + KPI.formatNumber(analysis.trend) + " จุด"
        : analysis.trend < 0
          ? "ลดลง " + KPI.formatNumber(Math.abs(analysis.trend)) + " จุด"
          : "ทรงตัว";
    var gapEntries = analysis.weakest.slice(0, 2);
    var gapText = gapEntries
      .map(function (entry) {
        return entry.item.shortTitle + " (" + KPI.formatPercent(entry.value) + ")";
      })
      .join(" และ ");
    var trendClause =
      analysis.firstIndex === analysis.latestIndex
        ? ""
        : " " + trendText + "จากเดือน " + firstMonth;

    var summaryText =
      "จากผลการดำเนินงาน " +
      analysis.reportCount +
      " เดือนที่รายงาน (" +
      rangeLabel +
      ") แผนก O.A. ทำคะแนนถ่วงน้ำหนักเฉลี่ยได้ " +
      KPI.formatPercent(analysis.reportedAverage) +
      " " +
      scoreMessage(analysis.reportedAverage) +
      " ขณะที่เดือน " +
      latestMonth +
      " ทำได้ " +
      KPI.formatPercent(analysis.latestScore) +
      trendClause +
      " และมีตัวชี้วัดที่บรรลุเป้าหมาย " +
      analysis.achieved +
      " จาก " +
      KPI.KPI_ITEMS.length +
      " รายการ";

    if (gapEntries.length) {
      summaryText +=
        " จุดที่ต้องเร่งปิดช่องว่างคือ " + gapText + " ซึ่งควรจัดลำดับความสำคัญในการแก้ไขก่อนตัวชี้วัดอื่น";
    } else {
      summaryText += " ทุกตัวชี้วัดบรรลุเป้าหมาย ควรวางแผนรักษามาตรฐานอย่างต่อเนื่อง";
    }

    if (analysis.hris && analysis.hris.delta > 0) {
      summaryText +=
        " ทั้งนี้ HRIS ปรับตัวดีที่สุด จาก " +
        KPI.formatPercent(analysis.hris.value - analysis.hris.delta) +
        " เป็น " +
        KPI.formatPercent(analysis.hris.value) +
        " ภายใน " +
        analysis.reportCount +
        " เดือน";
    }

    if (analysis.reportCount < 12) {
      summaryText +=
        " อย่างไรก็ตาม ยังไม่มีผลการดำเนินงานอีก " +
        (12 - analysis.reportCount) +
        " เดือน จึงยังไม่สามารถสรุปภาพรวมทั้งปีได้";
    }

    if (qs("#execSummary")) qs("#execSummary").textContent = summaryText;
    if (qs("#execNote")) {
      var noteText =
        analysis.reportCount === 12
          ? "วิเคราะห์จากผลครบ 12 เดือน (" + rangeLabel + ")"
          : "วิเคราะห์จาก " +
            analysis.reportCount +
            " เดือนที่มีการบันทึกผล (" +
            rangeLabel +
            ") และเปรียบเทียบเฉพาะเดือนที่รายงาน";
      if (analysis.reportCount < 12) {
        noteText += " · ยังไม่มีข้อมูลอีก " + (12 - analysis.reportCount) + " เดือน";
      }
      qs("#execNote").textContent = noteText;
    }

    if (qs("#execSummary")) qs("#execSummary").textContent = summaryText;
    if (qs("#topKpiTitle")) qs("#topKpiTitle").textContent = top.item.shortTitle;
    if (qs("#topKpiScore")) qs("#topKpiScore").textContent = KPI.formatPercent(top.value);
    if (qs("#focusKpiTitle")) qs("#focusKpiTitle").textContent = lowest.item.shortTitle;
    if (qs("#focusKpiScore")) qs("#focusKpiScore").textContent = KPI.formatPercent(lowest.value);

    if (qs("#trendLabel")) {
      qs("#trendLabel").textContent =
        analysis.firstIndex === analysis.latestIndex
          ? latestMonth + " 2569"
          : firstMonth + " → " + latestMonth + " 2569";
    }
    if (qs("#trendScore")) {
      if (analysis.firstIndex === analysis.latestIndex) {
        qs("#trendScore").textContent = "—";
        qs("#trendScore").className = "mt-2 font-display text-lg font-semibold text-slate-500";
      } else {
        qs("#trendScore").textContent =
          (analysis.trend > 0 ? "+" : "") + KPI.formatNumber(analysis.trend) + " จุด";
        qs("#trendScore").className =
          "mt-2 font-display text-lg font-semibold " + (analysis.trend >= 0 ? "text-brand-800" : "text-rose-700");
      }
    }

    var actions = [];
    var used = {};

    analysis.weakest.slice(0, 2).forEach(function (entry) {
      used[entry.item.id] = true;
      actions.push({
        title: entry.item.shortTitle,
        note: MONTHLY_ACTION_NOTES[entry.item.id] || "ติดตามผลและกำหนดแนวทางปรับปรุงอย่างต่อเนื่อง",
        meta: "ผลล่าสุด " + KPI.formatPercent(entry.value) + " · เป้า " + KPI.formatPercent(entry.item.target)
      });
    });

    if (analysis.improver && analysis.improver.delta > 0 && !used[analysis.improver.item.id]) {
      used[analysis.improver.item.id] = true;
      actions.push({
        title: analysis.improver.item.shortTitle,
        note:
          "พัฒนาจาก " +
          KPI.formatPercent(analysis.improver.value - analysis.improver.delta) +
          " เป็น " +
          KPI.formatPercent(analysis.improver.value) +
          " ควรวางแผนรักษามาตรฐานและติดตามการใช้งานต่อเนื่อง",
        meta: "เพิ่มขึ้น " + KPI.formatNumber(analysis.improver.delta) + " จุดใน " + analysis.reportCount + " เดือน"
      });
    }

    if (analysis.reportCount < 12) {
      actions.push({
        title: "ความครบถ้วนของข้อมูลรายเดือน",
        note: "บันทึกผลเดือนที่เหลือเมื่อมีข้อมูลจริง เพื่อให้ค่าเฉลี่ยปีและแนวโน้มสะท้อนผลงานได้ครบถ้วน",
        meta: "มีข้อมูล " + analysis.reportCount + " / 12 เดือน"
      });
    }

    if (actions.length < 3 && analysis.strongest && !used[analysis.strongest.item.id]) {
      actions.push({
        title: analysis.strongest.item.shortTitle,
        note: "รักษามาตรฐานการดำเนินงานและวางแผนตรวจสอบเชิงป้องกันอย่างสม่ำเสมอ",
        meta: "ผลล่าสุด " + KPI.formatPercent(analysis.strongest.value) + " · เต็มเป้า"
      });
    }

    var attention = qs("#attentionList");
    if (attention) {
      attention.innerHTML = actions.slice(0, 4).map(function (entry, index) {
        return (
          '<li class="flex items-start gap-3">' +
          '<span class="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/10 font-display text-[12px] font-semibold text-brand-100">' +
          String(index + 1).padStart(2, "0") +
          "</span>" +
          '<div class="min-w-0">' +
          '<p class="text-[13px] font-semibold leading-5 text-white">' + UI.escapeHtml(entry.title) + "</p>" +
          '<p class="mt-1 text-[12px] leading-5 text-white/65">' + UI.escapeHtml(entry.note) + "</p>" +
          '<p class="mt-1 text-[12px] font-medium text-brand-200">' + UI.escapeHtml(entry.meta) + "</p>" +
          "</div>" +
          "</li>"
        );
      }).join("");
    }
  }

  function yearlyValueClass(value) {
    if (value >= 100) return "text-emerald-700";
    if (value >= 80) return "text-slate-700";
    if (value >= 60) return "text-amber-700";
    return "text-rose-700";
  }

  function renderYearlyTable() {
    var tbody = qs("#yearlyRows");
    var tfoot = qs("#yearlyFoot");
    if (!tbody) return;

    tbody.innerHTML = KPI.KPI_ITEMS.map(function (item) {
      var cells = KPI.THAI_MONTHS.map(function (_, index) {
        var value = KPI.monthlyValue(state, item.id, index);
        return (
          '<td class="text-center text-[13px]">' +
          '<span class="font-medium tabular-nums ' + yearlyValueClass(value) + '">' + KPI.formatNumber(value) + "</span>" +
          "</td>"
        );
      }).join("");

      return (
        '<tr data-yearly-row="' + item.id + '">' +
        '<td><span class="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-slate-50 font-display text-[12px] font-semibold text-slate-500">' +
        String(item.no).padStart(2, "0") +
        "</span></td>" +
        '<td><p class="min-w-[210px] text-[13px] font-medium leading-5 text-slate-800">' + item.title + "</p>" +
        '<p class="mt-0.5 text-[12px] text-brand-700">น้ำหนัก ' + item.weight + "%</p></td>" +
        cells +
        '<td class="text-center text-[13px] font-semibold tabular-nums text-slate-900">' +
        KPI.formatPercent(KPI.monthlyKpiAverage(state, item.id)) +
        "</td>" +
        "</tr>"
      );
    }).join("");

    if (tfoot) {
      var scores = KPI.monthlyScores(state);
      tfoot.innerHTML =
        '<tr class="bg-brand-50/60">' +
        '<td colspan="2" class="px-4 py-4 text-right text-[13px] font-semibold uppercase tracking-[0.08em] text-slate-500">คะแนนถ่วงน้ำหนักรวม</td>' +
        scores.map(function (score) {
          return '<td class="text-center text-[13px] font-semibold tabular-nums text-brand-900">' + KPI.formatNumber(score) + "</td>";
        }).join("") +
        '<td class="text-center text-[13px] font-bold tabular-nums text-brand-800">' + KPI.formatPercent(KPI.average(scores)) + "</td>" +
        "</tr>";
    }
  }

  function refreshReport() {
    var analysis = buildMonthlyAnalysis();
    updateExecutiveSummary(updateHeader(analysis));
    renderYearlyTable();
  }

  function renderAlbum() {
    var grid = qs("#albumGrid");
    if (!grid) return;
    grid.innerHTML = ALBUM.map(function (photo, index) {
      return (
        '<button type="button" class="gallery-card group" data-album-index="' + index + '" data-category="' + photo.category + '" aria-label="เปิด' + photo.title + '">' +
        '<img src="assets/images/' + photo.file + '" alt="' + photo.title + '" loading="lazy">' +
        "</button>"
      );
    }).join("");
  }

  function visibleAlbumIndexes() {
    return qsa("#albumGrid .gallery-card")
      .filter(function (card) { return !card.classList.contains("hidden"); })
      .map(function (card) { return Number(card.getAttribute("data-album-index")); });
  }

  function applyAlbumFilter(filter) {
    albumFilter = filter;
    qsa("[data-filter]").forEach(function (button) {
      var active = button.getAttribute("data-filter") === filter;
      button.classList.toggle("filter-btn-active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });
    qsa("#albumGrid .gallery-card").forEach(function (card) {
      var show = filter === "all" || card.getAttribute("data-category") === filter;
      card.classList.toggle("hidden", !show);
    });
  }

  function renderLightbox() {
    if (!lightboxList.length) return;
    var index = lightboxList[lightboxPosition];
    var photo = ALBUM[index];
    if (!photo) return;

    var image = qs("#lightboxImage");
    if (image) {
      image.src = "assets/images/" + photo.file;
      image.alt = photo.title;
    }
    if (qs("#lightboxCounter")) qs("#lightboxCounter").textContent = lightboxPosition + 1 + " / " + lightboxList.length;

    var prev = qs("#lightboxPrev");
    var next = qs("#lightboxNext");
    if (prev) prev.disabled = lightboxList.length < 2;
    if (next) next.disabled = lightboxList.length < 2;
  }

  function openLightbox(index) {
    var dialog = qs("#lightbox");
    if (!dialog) return;
    lightboxList = visibleAlbumIndexes();
    lightboxPosition = Math.max(0, lightboxList.indexOf(index));
    renderLightbox();

    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    } else {
      dialog.setAttribute("open", "");
    }
    document.documentElement.classList.add("overflow-hidden");
  }

  function closeLightbox() {
    var dialog = qs("#lightbox");
    if (!dialog) return;
    if (typeof dialog.close === "function") dialog.close();
    else dialog.removeAttribute("open");
    document.documentElement.classList.remove("overflow-hidden");
  }

  function moveLightbox(direction) {
    if (lightboxList.length < 2) return;
    lightboxPosition = (lightboxPosition + direction + lightboxList.length) % lightboxList.length;
    renderLightbox();
  }

  function initLightbox() {
    var dialog = qs("#lightbox");
    if (!dialog) return;

    qsa("#albumGrid .gallery-card").forEach(function (card) {
      card.addEventListener("click", function () {
        openLightbox(Number(card.getAttribute("data-album-index")));
      });
    });

    if (qs("#lightboxClose")) qs("#lightboxClose").addEventListener("click", closeLightbox);
    if (qs("#lightboxCloseBottom")) qs("#lightboxCloseBottom").addEventListener("click", closeLightbox);
    if (qs("#lightboxPrev")) qs("#lightboxPrev").addEventListener("click", function () { moveLightbox(-1); });
    if (qs("#lightboxNext")) qs("#lightboxNext").addEventListener("click", function () { moveLightbox(1); });

    dialog.addEventListener("click", function (event) {
      if (event.target === dialog) closeLightbox();
    });

    dialog.addEventListener("keydown", function (event) {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        moveLightbox(-1);
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        moveLightbox(1);
      }
    });

    dialog.addEventListener("close", function () {
      document.documentElement.classList.remove("overflow-hidden");
    });
  }

  function initFilters() {
    qsa("[data-filter]").forEach(function (button) {
      button.addEventListener("click", function () {
        applyAlbumFilter(button.getAttribute("data-filter"));
      });
    });
    applyAlbumFilter("all");
  }

  function init() {
    if (!window.KPI) return;
    state = KPI.load();
    renderAlbum();
    refreshReport();
    initLightbox();
    initFilters();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
