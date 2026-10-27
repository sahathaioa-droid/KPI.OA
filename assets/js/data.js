(function () {
  "use strict";

  const STORAGE_KEY = "kpi-oa-2569-v1";
  const STORAGE_VERSION = 4;

  const THAI_MONTHS = [
    "มกราคม",
    "กุมภาพันธ์",
    "มีนาคม",
    "เมษายน",
    "พฤษภาคม",
    "มิถุนายน",
    "กรกฎาคม",
    "สิงหาคม",
    "กันยายน",
    "ตุลาคม",
    "พฤศจิกายน",
    "ธันวาคม"
  ];

  const THAI_MONTHS_SHORT = [
    "ม.ค.",
    "ก.พ.",
    "มี.ค.",
    "เม.ย.",
    "พ.ค.",
    "มิ.ย.",
    "ก.ค.",
    "ส.ค.",
    "ก.ย.",
    "ต.ค.",
    "พ.ย.",
    "ธ.ค."
  ];

  const KPI_ITEMS = [
    {
      id: "cctv_sriwichai",
      no: 1,
      title: "ดูออนไลน์ กล้องวงจรปิด สาขาศรีวิชัย",
      shortTitle: "กล้องออนไลน์ สาขาศรีวิชัย",
      weight: 10,
      target: 100,
      category: "ระบบความปลอดภัย",
      color: "#7f1d1d",
      icon: "camera"
    },
    {
      id: "cctv_thaithong",
      no: 2,
      title: "ดูออนไลน์ กล้องวงจรปิด สาขาท่าทอง",
      shortTitle: "กล้องออนไลน์ สาขาท่าทอง",
      weight: 10,
      target: 100,
      category: "ระบบความปลอดภัย",
      color: "#991b1b",
      icon: "camera"
    },
    {
      id: "pos_upgrade",
      no: 3,
      title: "เปลี่ยนอุปกรณ์ เพิ่มความรวดเร็ว ระบบ POS",
      shortTitle: "เปลี่ยนอุปกรณ์ ระบบ POS",
      weight: 30,
      target: 100,
      category: "ระบบ POS",
      color: "#b91c1c",
      icon: "terminal"
    },
    {
      id: "pos_satisfaction",
      no: 4,
      title: "ความพึงพอใจของผู้ใช้งาน (แคชเชียร์) ระบบ POS (หลังจากปรับปรุงระบบแล้ว)",
      shortTitle: "ความพึงพอใจแคชเชียร์ POS",
      weight: 10,
      target: 100,
      category: "ระบบ POS",
      color: "#dc2626",
      icon: "smile"
    },
    {
      id: "phone",
      no: 5,
      title: "ระบบโทรศัพท์ภายในใช้งานได้อย่างมีประสิทธิภาพทุกจุด 100%",
      shortTitle: "ระบบโทรศัพท์ภายใน",
      weight: 10,
      target: 100,
      category: "โครงสร้างพื้นฐาน",
      color: "#ef4444",
      icon: "phone"
    },
    {
      id: "speaker",
      no: 6,
      title: "ระบบเสียงตามสายใช้งานได้อย่างมีประสิทธิภาพทุกจุด 100%",
      shortTitle: "ระบบเสียงตามสาย",
      weight: 10,
      target: 100,
      category: "โครงสร้างพื้นฐาน",
      color: "#f87171",
      icon: "speaker"
    },
    {
      id: "hris",
      no: 7,
      title: "พัฒนาระบบสารสนเทศ HR (HRIS)",
      shortTitle: "ระบบสารสนเทศ HR (HRIS)",
      weight: 20,
      target: 100,
      category: "ระบบสารสนเทศ",
      color: "#64748b",
      icon: "users"
    }
  ];

  const HEAD_GOALS = [
    {
      id: "head_cctv",
      title: "ระบบกล้องวงจรปิดใช้งานได้อย่างมีประสิทธิภาพทุกจุด 100% ภายในเดือน มิ.ย. 69",
      shortTitle: "กล้องวงจรปิดทุกจุดมีประสิทธิภาพ",
      target: "100% ภายใน มิ.ย. 69",
      targetValue: 100,
      category: "หัวหน้าแผนก O.A.",
      icon: "camera"
    }
  ];

  const STAFF_GOALS = [
    {
      id: "staff_sales_month",
      title: "จัดทำรายงานมาตรฐานยอดขายเทียบเป้า รายเดือน",
      shortTitle: "รายงานยอดขายเทียบเป้า รายเดือน",
      target: "100% ของเป้ายอดขาย",
      targetValue: 100,
      category: "ยอดขาย",
      icon: "chart"
    },
    {
      id: "staff_stock_month",
      title: "จัดทำรายงานมาตรฐานStock Cover Days",
      shortTitle: "รายงาน Stock Cover Days",
      target: "อยู่ในเกณฑ์ที่กำหนด",
      targetValue: 100,
      category: "Stock Cover Days",
      icon: "box"
    }
  ];

  const ALL_PERSONAL_GOALS = HEAD_GOALS.concat(STAFF_GOALS);

  const DEFAULT_OVERALL = {
    cctv_sriwichai: 100,
    cctv_thaithong: 100,
    pos_upgrade: 85,
    pos_satisfaction: 82,
    phone: 100,
    speaker: 100,
    hris: 65
  };

  const MONTHLY_GROWTH = [0, 0, 0, 0, 0, 0, 0.98, 0.97, 0.99, 1, 0, 0];

  const MONTHLY_OVERRIDES = {
    hris: [0, 0, 0, 0, 0, 0, 70, 76, 100, 100, 0, 0]
  };

  function buildMonthlyFromOverall(overall) {
    const result = {};
    KPI_ITEMS.forEach(function (item) {
      if (MONTHLY_OVERRIDES[item.id]) {
        result[item.id] = MONTHLY_OVERRIDES[item.id].slice();
        return;
      }
      const base = percentOr(overall[item.id], 0);
      result[item.id] = MONTHLY_GROWTH.map(function (factor) {
        return Math.round(clamp(base * factor, 0, 100) * 10) / 10;
      });
    });
    return result;
  }

  function buildDefaultMonthlyByKpi() {
    return buildMonthlyFromOverall(DEFAULT_OVERALL);
  }

  const DEFAULT_MONTHLY_BY_KPI = buildDefaultMonthlyByKpi();

  const DEFAULT_PERSONAL = {
    head_cctv: 90,
    staff_sales_month: 85,
    staff_stock_month: 78
  };

  const DEFAULT_MONTHLY = THAI_MONTHS.map(function (_, index) {
    const total = KPI_ITEMS.reduce(function (sum, item) {
      return sum + (DEFAULT_MONTHLY_BY_KPI[item.id][index] * item.weight) / 100;
    }, 0);
    return Math.round(total * 10) / 10;
  });

  const MONTHLY_TARGET = 100;

  const STATUS_META = {
    achieved: {
      label: "บรรลุเป้าหมาย",
      className: "pill-success",
      color: "emerald",
      dot: "bg-emerald-500"
    },
    onTrack: {
      label: "ใกล้เป้าหมาย",
      className: "pill-warning",
      color: "amber",
      dot: "bg-amber-500"
    },
    watch: {
      label: "ต้องติดตาม",
      className: "pill-brand",
      color: "brand",
      dot: "bg-brand-500"
    },
    risk: {
      label: "ล่าช้า",
      className: "pill-danger",
      color: "rose",
      dot: "bg-rose-500"
    }
  };

  const SCORE_META = {
    excellent: { label: "ยอดเยี่ยม", textClass: "text-emerald-700" },
    great: { label: "ดีมาก", textClass: "text-brand-700" },
    good: { label: "ตามเป้าหมาย", textClass: "text-amber-700" },
    follow: { label: "ต้องติดตาม", textClass: "text-rose-700" }
  };

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function numberOr(value, fallback) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function percentOr(value, fallback) {
    return clamp(numberOr(value, fallback), 0, 100);
  }

  function isPlainObject(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
  }

  function getNowMeta() {
    const now = new Date();
    return {
      reporter: "",
      reportMonth: String(now.getMonth() + 1),
      reportDate: now.toISOString().slice(0, 10)
    };
  }

  function copyMonthlyByKpi(source) {
    const out = {};
    KPI_ITEMS.forEach(function (item) {
      const values = source && Array.isArray(source[item.id]) ? source[item.id] : DEFAULT_MONTHLY_BY_KPI[item.id];
      out[item.id] = values.slice(0, 12).map(function (value, index) {
        return percentOr(value, DEFAULT_MONTHLY_BY_KPI[item.id][index]);
      });
    });
    return out;
  }

  function createDefaultState() {
    return {
      schemaVersion: STORAGE_VERSION,
      overall: Object.assign({}, DEFAULT_OVERALL),
      personal: Object.assign({}, DEFAULT_PERSONAL),
      monthly: DEFAULT_MONTHLY.slice(),
      monthlyByKpi: copyMonthlyByKpi(DEFAULT_MONTHLY_BY_KPI),
      meta: getNowMeta(),
      updatedAt: null
    };
  }

  function normalizeState(input) {
    const base = createDefaultState();
    const source = isPlainObject(input) ? input : {};
    const state = {
      schemaVersion: STORAGE_VERSION,
      overall: Object.assign({}, base.overall),
      personal: Object.assign({}, base.personal),
      monthly: base.monthly.slice(),
      monthlyByKpi: copyMonthlyByKpi(base.monthlyByKpi),
      meta: Object.assign({}, base.meta),
      updatedAt: typeof source.updatedAt === "string" ? source.updatedAt : null
    };

    if (isPlainObject(source.overall)) {
      KPI_ITEMS.forEach(function (item) {
        state.overall[item.id] = percentOr(source.overall[item.id], base.overall[item.id]);
      });
    }

    if (isPlainObject(source.personal)) {
      ALL_PERSONAL_GOALS.forEach(function (item) {
        state.personal[item.id] = percentOr(source.personal[item.id], base.personal[item.id]);
      });
    }

    if (isPlainObject(source.monthlyByKpi)) {
      KPI_ITEMS.forEach(function (item) {
        if (!Array.isArray(source.monthlyByKpi[item.id])) return;
        state.monthlyByKpi[item.id] = base.monthlyByKpi[item.id].map(function (fallback, index) {
          return percentOr(source.monthlyByKpi[item.id][index], fallback);
        });
      });
    } else {
      state.monthlyByKpi = buildMonthlyFromOverall(state.overall);
    }

    if (Array.isArray(source.monthly)) {
      state.monthly = base.monthly.map(function (fallback, index) {
        return percentOr(source.monthly[index], fallback);
      });
    }

    if (isPlainObject(source.meta)) {
      state.meta.reporter = typeof source.meta.reporter === "string" ? source.meta.reporter.slice(0, 80) : "";
      state.meta.reportMonth = String(clamp(numberOr(source.meta.reportMonth, base.meta.reportMonth), 1, 12));
      state.meta.reportDate = /^\d{4}-\d{2}-\d{2}$/.test(source.meta.reportDate || "")
        ? source.meta.reportDate
        : base.meta.reportDate;
    }

    const sourceVersion = numberOr(source.schemaVersion, 1);

    if (sourceVersion < 2) {
      KPI_ITEMS.forEach(function (item) {
        for (var monthIndex = 0; monthIndex < 6; monthIndex++) {
          state.monthlyByKpi[item.id][monthIndex] = 0;
        }
      });
      state.monthly = state.monthly.map(function (value, index) {
        return index < 6 ? 0 : value;
      });
    }

    if (sourceVersion < 3) {
      KPI_ITEMS.forEach(function (item) {
        const override = MONTHLY_OVERRIDES[item.id];
        if (override) state.monthlyByKpi[item.id] = override.slice();
      });
      state.monthly = monthlyScores(state);
    }

    if (sourceVersion < 4) {
      KPI_ITEMS.forEach(function (item) {
        state.monthlyByKpi[item.id][10] = 0;
        state.monthlyByKpi[item.id][11] = 0;
      });
      state.monthly = monthlyScores(state);
    }

    return state;
  }

  function load() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return createDefaultState();
      return normalizeState(JSON.parse(raw));
    } catch (error) {
      console.warn("ไม่สามารถอ่านข้อมูล KPI ที่บันทึกไว้ได้", error);
      return createDefaultState();
    }
  }

  function save(state) {
    const normalized = normalizeState(state);
    normalized.updatedAt = new Date().toISOString();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    return normalized;
  }

  function isSaved() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      return Boolean(parsed && parsed.updatedAt);
    } catch (error) {
      return false;
    }
  }

  function reset() {
    window.localStorage.removeItem(STORAGE_KEY);
    return createDefaultState();
  }

  function weightedScore(actuals) {
    const totalWeight = KPI_ITEMS.reduce(function (sum, item) {
      return sum + item.weight;
    }, 0);

    if (!totalWeight) return 0;

    const score = KPI_ITEMS.reduce(function (sum, item) {
      const value = percentOr(actuals[item.id], 0);
      return sum + (value * item.weight) / 100;
    }, 0);

    return Math.round(clamp(score, 0, 100) * 10) / 10;
  }

  function monthlyValue(state, id, monthIndex) {
    const values = state && state.monthlyByKpi && state.monthlyByKpi[id];
    if (!Array.isArray(values)) return 0;
    return percentOr(values[clamp(numberOr(monthIndex, 0), 0, 11)], 0);
  }

  function monthlyActuals(state, monthIndex) {
    const out = {};
    KPI_ITEMS.forEach(function (item) {
      out[item.id] = monthlyValue(state, item.id, monthIndex);
    });
    return out;
  }

  function weightedScoreForMonth(state, monthIndex) {
    return weightedScore(monthlyActuals(state, monthIndex));
  }

  function monthlyScores(state) {
    return THAI_MONTHS.map(function (_, index) {
      return weightedScoreForMonth(state, index);
    });
  }

  function monthlyKpiAverage(state, id) {
    return average(
      THAI_MONTHS.map(function (_, index) {
        return monthlyValue(state, id, index);
      })
    );
  }

  function setMonthly(state, id, monthIndex, value) {
    if (!state.monthlyByKpi) state.monthlyByKpi = {};
    if (!Array.isArray(state.monthlyByKpi[id])) {
      state.monthlyByKpi[id] = (DEFAULT_MONTHLY_BY_KPI[id] || DEFAULT_MONTHLY).slice();
    }
    state.monthlyByKpi[id][clamp(numberOr(monthIndex, 0), 0, 11)] = percentOr(value, 0);
    return state;
  }

  function average(values) {
    if (!values.length) return 0;
    const total = values.reduce(function (sum, value) {
      return sum + numberOr(value, 0);
    }, 0);
    return Math.round((total / values.length) * 10) / 10;
  }

  function averageFor(state, goals) {
    return average(
      goals.map(function (goal) {
        return percentOr(state.personal[goal.id], 0);
      })
    );
  }

  function overallStats(state) {
    const score = weightedScore(state.overall);
    const achieved = KPI_ITEMS.filter(function (item) {
      return percentOr(state.overall[item.id], 0) >= item.target;
    }).length;
    const totalWeight = KPI_ITEMS.reduce(function (sum, item) {
      return sum + item.weight;
    }, 0);

    return {
      score: score,
      achieved: achieved,
      total: KPI_ITEMS.length,
      totalWeight: totalWeight,
      headAverage: averageFor(state, HEAD_GOALS),
      staffAverage: averageFor(state, STAFF_GOALS),
      personalAverage: averageFor(state, ALL_PERSONAL_GOALS)
    };
  }

  function statusFor(value, target) {
    const score = percentOr(value, 0);
    const targetValue = percentOr(target === undefined ? 100 : target, 100);

    if (score >= targetValue) return Object.assign({ key: "achieved" }, STATUS_META.achieved);
    if (score >= 80) return Object.assign({ key: "onTrack" }, STATUS_META.onTrack);
    if (score >= 60) return Object.assign({ key: "watch" }, STATUS_META.watch);
    return Object.assign({ key: "risk" }, STATUS_META.risk);
  }

  function scoreMeta(score) {
    const value = percentOr(score, 0);
    if (value >= 95) return Object.assign({ key: "excellent" }, SCORE_META.excellent);
    if (value >= 85) return Object.assign({ key: "great" }, SCORE_META.great);
    if (value >= 70) return Object.assign({ key: "good" }, SCORE_META.good);
    return Object.assign({ key: "follow" }, SCORE_META.follow);
  }

  function monthlyStats(monthly, reportMonth) {
    const values = Array.isArray(monthly) ? monthly : DEFAULT_MONTHLY;
    const currentIndex = clamp(numberOr(reportMonth, 10) - 1, 0, 11);
    const currentValue = percentOr(values[currentIndex], 0);
    const previousValue = currentIndex > 0 ? percentOr(values[currentIndex - 1], 0) : currentValue;
    const bestValue = Math.max.apply(
      null,
      values.map(function (value) {
        return percentOr(value, 0);
      })
    );
    const bestIndex = values.findIndex(function (value) {
      return percentOr(value, 0) === bestValue;
    });

    return {
      average: average(values),
      currentValue: currentValue,
      currentIndex: currentIndex,
      previousValue: previousValue,
      delta: Math.round((currentValue - previousValue) * 10) / 10,
      bestValue: Math.round(bestValue * 10) / 10,
      bestIndex: bestIndex,
      firstValue: percentOr(values[0], 0),
      lastValue: percentOr(values[11], 0),
      trend: Math.round((percentOr(values[11], 0) - percentOr(values[0], 0)) * 10) / 10,
      achievedMonths: values.filter(function (value) {
        return percentOr(value, 0) >= MONTHLY_TARGET;
      }).length
    };
  }

  function formatNumber(value, digits) {
    const fractionDigits = digits === undefined ? 1 : digits;
    const number = numberOr(value, 0);
    return number.toLocaleString("th-TH", {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits
    });
  }

  function formatPercent(value, digits) {
    return formatNumber(value, digits === undefined ? 1 : digits) + "%";
  }

  function formatThaiDate(isoDate, options) {
    const opts = options || {};
    if (!isoDate) return opts.emptyText || "ยังไม่ระบุ";
    const date = new Date(isoDate + (isoDate.length === 10 ? "T00:00:00" : ""));
    if (Number.isNaN(date.getTime())) return opts.emptyText || "ยังไม่ระบุ";
    const day = date.getDate();
    const month = opts.short ? THAI_MONTHS_SHORT[date.getMonth()] : THAI_MONTHS[date.getMonth()];
    const year = date.getFullYear() + 543;
    return day + " " + month + " " + year;
  }

  function formatThaiDateTime(isoDate, emptyText) {
    if (!isoDate) return emptyText || "ยังไม่บันทึก";
    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) return emptyText || "ยังไม่บันทึก";
    const time = date.toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit"
    });
    return formatThaiDate(isoDate, { short: true }) + " · " + time + " น.";
  }

  function monthLabel(index, short) {
    const safeIndex = clamp(numberOr(index, 0), 0, 11);
    return short ? THAI_MONTHS_SHORT[safeIndex] : THAI_MONTHS[safeIndex];
  }

  function monthFromMeta(meta, short) {
    const month = clamp(numberOr(meta && meta.reportMonth, 1), 1, 12);
    return monthLabel(month - 1, short);
  }

  function setField(state, section, id, value) {
    if (!state[section]) state[section] = {};
    state[section][id] = percentOr(value, 0);
    return state;
  }

  function sanitizeReporter(value) {
    return String(value || "").trim().slice(0, 80);
  }

  window.KPI = {
    STORAGE_KEY: STORAGE_KEY,
    KPI_ITEMS: KPI_ITEMS,
    HEAD_GOALS: HEAD_GOALS,
    STAFF_GOALS: STAFF_GOALS,
    ALL_PERSONAL_GOALS: ALL_PERSONAL_GOALS,
    DEFAULT_OVERALL: DEFAULT_OVERALL,
    DEFAULT_PERSONAL: DEFAULT_PERSONAL,
    DEFAULT_MONTHLY: DEFAULT_MONTHLY,
    DEFAULT_MONTHLY_BY_KPI: DEFAULT_MONTHLY_BY_KPI,
    MONTHLY_TARGET: MONTHLY_TARGET,
    THAI_MONTHS: THAI_MONTHS,
    THAI_MONTHS_SHORT: THAI_MONTHS_SHORT,
    STATUS_META: STATUS_META,
    createDefaultState: createDefaultState,
    normalizeState: normalizeState,
    load: load,
    save: save,
    isSaved: isSaved,
    reset: reset,
    weightedScore: weightedScore,
    monthlyValue: monthlyValue,
    monthlyActuals: monthlyActuals,
    weightedScoreForMonth: weightedScoreForMonth,
    monthlyScores: monthlyScores,
    monthlyKpiAverage: monthlyKpiAverage,
    setMonthly: setMonthly,
    average: average,
    overallStats: overallStats,
    averageFor: averageFor,
    statusFor: statusFor,
    scoreMeta: scoreMeta,
    monthlyStats: monthlyStats,
    formatNumber: formatNumber,
    formatPercent: formatPercent,
    formatThaiDate: formatThaiDate,
    formatThaiDateTime: formatThaiDateTime,
    monthLabel: monthLabel,
    monthFromMeta: monthFromMeta,
    setField: setField,
    sanitizeReporter: sanitizeReporter,
    percentOr: percentOr,
    clamp: clamp
  };
})();
