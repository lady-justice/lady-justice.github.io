/**
 * Lady Justice — static i18n (el / en / ru). Persists choice in localStorage.
 */
(function () {
  const STORAGE_KEY = "lj-lang";
  const DEFAULT_LANG = "en";

  const T = {
    en: {
      meta_title: "Lady Justice — individual lessons in Nicosia",
      meta_description:
        "Individual dance, stretch, and fitness lessons in Nicosia, Cyprus. Children and adults. Book at JUSTICE Fitness & Dance (Ilia Venezi 5).",
      brand_alt: "Lady Justice",
      nav_aria: "Main navigation",
      nav_home: "Home",
      nav_about: "About",
      nav_classes: "Classes",
      nav_schedule: "Schedule",
      nav_book: "Book",
      nav_studio: "Studio",
      nav_contact: "Contact",
      nav_menu_open: "Open menu",
      nav_menu_close: "Close menu",
      lang_aria: "Language",
      hero_title: "Hero Section",
      hero_copy:
        "A short, powerful statement about what you do, for whom, or how you work goes in this section—often with a photo of you, your product, etc.",
      hero_book: "Book",
      social_heading: "Social proof",
      social_lede:
        "An “As Seen On” row or your best testimonials go here. You can repeat a social proof section farther down the page, too.",
      services_head: "Key services and offers",
      services_note:
        "Sometimes this block works better above “About”: here is what matters first—what you offer and main hooks—without filler, so it is clear what you do and what to book.",
      services_t1: "Individual lessons",
      services_d1:
        "A personal plan, your pace and goals: dance, stretch, or fitness—individually with an instructor.",
      services_t2: "Group fitness, dance, and stretch",
      services_d2:
        "Group classes—movement, music, and load in the format you set for your audience.",
      services_t3: "Studio rental",
      services_d3:
        "By the hour or in packages: rehearsals, mini-groups, shoots—when you need the space apart from classes.",
      services_tagline: "Key services and offers",
      about_hint: "Your best on-brand photo, team photo, etc.",
      about_heading: "About",
      about_lede:
        "Include only the details about you that they need or want to know—namely, how you help them.",
      lead_display: "Lead magnet",
      lead_title: "Make this title results-driven and punchy and the subtitle the same",
      lead_text: "CTA buttons should be a stand-out color.",
      lead_book: "Book",
      lead_figcap: "Use a visual/mockup of the lead magnet here",
      content_heading: "Content section",
      content_lede:
        "Optional section to highlight your best content (the ones that convert the most leads).",
      schedule_head: "Schedule",
      schedule_lede:
        "Put weekly hours, term dates, or a PDF timetable here. When visitors are ready, send them to the calendar in the Book section below.",
      schedule_cta: "Open booking",
      content_c1t: "Individual lessons",
      content_c1p:
        "Describe format, length, who individual lessons suit (kids, adults, event prep), how booking works, and what someone gets after the first session. Add numbers, a quote, or a calendar link.",
      content_c2t: "Group fitness, dance, and stretch",
      content_c2p:
        "Add schedule, group size, level, whether to book ahead, and how formats differ. Drop in studio photos, a short clip, or the weekly schedule—to answer common questions before they message you.",
      content_c3t: "Studio rental",
      content_c3p:
        "List floor space, surface, gear, time and sound rules, and how to book by the hour or in bundles. If rental ties to JUSTICE Fitness & Dance, remind them of the address and the map link in the page footer.",
      book_kicker: "Scheduling",
      book_title: "Book a lesson",
      book_sub: "Choose a time below. Calendar and confirmations are handled by Calendly.",
      footer_touch_eyebrow: "Bookings, studio visits, or a quick hello",
      footer_touch_aria: "Get in touch",
      footer_touch_line: "Get in touch",
      footer_social: "Socials",
      footer_contacts: "Contacts",
      footer_artist: "artist",
      footer_studio: "studio",
      footer_ig_lj_title: "Instagram: @__lady.justice_",
      footer_ig_j_title: "Instagram: @justicefitnessanddance",
      footer_map_eyebrow: "Studio",
      footer_open_maps: "Open in Google Maps",
      footer_map_iframe_title: "Map: Ilia Venezi 5, Nicosia, Cyprus",
      footer_back_top: "Back to top",
    },
    el: {
      meta_title: "Lady Justice — ατομικά μαθήματα στη Λευκωσία",
      meta_description:
        "Ατομικά μαθήματα χορού, ευλυγισίας και φυσικής κατάστασης στη Λευκωσία, Κύπρος. Παιδιά και ενήλικες. Κράτηση στο JUSTICE Fitness & Dance (Ilia Venezi 5).",
      brand_alt: "Lady Justice",
      nav_aria: "Κύρια πλοήγηση",
      nav_home: "Αρχική",
      nav_about: "Σχετικά",
      nav_classes: "Μαθήματα",
      nav_schedule: "Πρόγραμμα",
      nav_book: "Κράτηση",
      nav_studio: "Στούντιο",
      nav_contact: "Επικοινωνία",
      nav_menu_open: "Άνοιγμα μενού",
      nav_menu_close: "Κλείσιμο μενού",
      lang_aria: "Γλώσσα",
      hero_title: "Ενότητα ήρωας",
      hero_copy:
        "Εδώ μπαίνει μια σύντομη, δυνατή πρόταση για το τι κάνετε, για ποιους ή πώς—συχνά με φωτογραφία σας, του προϊόντος σας κ.λπ.",
      hero_book: "Κράτηση",
      social_heading: "Κοινωνική απόδειξη",
      social_lede:
        "Εδώ μπορείτε να βάλετε λογότυπα «Όπως εμφανίστηκε σε» ή τις καλύτερες μαρτυρίες. Μπορείτε να επαναλάβετε παρόμοια ενότητα και πιο κάτω στη σελίδα.",
      services_head: "Βασικές υπηρεσίες και προσφορές",
      services_note:
        "Μερικές φορές αυτό το μπλοκ δουλεύει καλύτερα πάνω από το «Σχετικά»: εδώ είναι πρώτα ό,τι μετράει—τι προσφέρετε και τα κύρια hooks—χωρίς περιττά, ώστε να είναι σαφές τι κάνετε και τι να κλείσουν.",
      services_t1: "Ατομικά μαθήματα",
      services_d1:
        "Προσωπικό πλάνο, ο ρυθμός και οι στόχοι σας: χορός, ευλυγισία ή φυσική κατάσταση—ατομικά με εκπαιδευτή.",
      services_t2: "Ομαδική φυσική κατάσταση, χορός και ευλυγισία",
      services_d2:
        "Ομαδικά μαθήματα—κίνηση, μουσική και ένταση στη μορφή που ορίζετε για το κοινό σας.",
      services_t3: "Ενοικίαση στούντιο",
      services_d3:
        "Ανά ώρα ή σε πακέτα: πρόβες, μικρές ομάδες, γυρίσματα—όταν χρειάζεστε τον χώρο χωριστά από τα μαθήματα.",
      services_tagline: "Βασικές υπηρεσίες και προσφορές",
      about_hint: "Η καλύτερη on-brand φωτογραφία σας, ομάδας κ.λπ.",
      about_heading: "Σχετικά",
      about_lede:
        "Βάλτε μόνο όσα χρειάζονται για εσάς—δηλαδή, πώς τους βοηθάτε.",
      lead_display: "Lead magnet",
      lead_title:
        "Κάντε τον τίτλο αποτελεσματικό και «σφιχτό» και το υπότιτλο το ίδιο",
      lead_text: "Τα κουμπιά CTA πρέπει να ξεχωρίζουν με χρώμα.",
      lead_book: "Κράτηση",
      lead_figcap: "Χρησιμοποιήστε εικόνα/mockup του lead magnet εδώ",
      content_heading: "Ενότητα περιεχομένου",
      content_lede:
        "Προαιρετική ενότητα για τα καλύτερα κομμάτια περιεχομένου σας (αυτά που φέρνουν τις περισσότερες επαφές).",
      schedule_head: "Πρόγραμμα",
      schedule_lede:
        "Εδώ μπαίνουν εβδομαδιαίες ώρες, ημερομηνίες περιόδων ή PDF προγράμματος. Όταν ο επισκέπτης είναι έτοιμος, οδηγήστε τον στο ημερολόγιο στην ενότητα «Κράτηση» παρακάτω.",
      schedule_cta: "Άνοιγμα κράτησης",
      content_c1t: "Ατομικά μαθήματα",
      content_c1p:
        "Περιγράψτε τη μορφή, τη διάρκεια, για ποιους ταιριάζει το one-to-one, πώς γίνεται η κράτηση και τι κερδίζει κάποιος μετά το πρώτο μάθημα. Προσθέστε αριθμούς, μαρτυρία ή σύνδεση ημερολογίου.",
      content_c2t: "Ομαδική φυσική κατάσταση, χορός και ευλυγισία",
      content_c2p:
        "Πρόγραμμα, μέγεθος ομάδας, επίπεδο, αν απαιτείται κράτηση και πώς διαφέρουν τα formats. Φωτογραφίες χώρου, σύντομο βίντεο ή εβδομαδιαίο πρόγραμμα—για να απαντηθούν ερωτήσεις πριν σας γράψουν.",
      content_c3t: "Ενοικίαση στούντιο",
      content_c3p:
        "Εμβαδόν, δάπεδο, εξοπλισμός, κανόνες ώρας και ήχου, κράτηση ανά ώρα ή πακέτα. Αν συνδέεται με JUSTICE Fitness & Dance, υπενθυμίστε τη διεύθυνση και τον χάρτη στο footer.",
      book_kicker: "Προγραμματισμός",
      book_title: "Κλείστε μάθημα",
      book_sub: "Διαλέξτε ώρα παρακάτω. Το ημερολόγιο και οι επιβεβαιώσεις γίνονται μέσω Calendly.",
      footer_touch_eyebrow: "Κρατήσεις, επίσκεψη στο studio ή ένα γρήγορο γεια",
      footer_touch_aria: "Επικοινωνήστε μαζί μου",
      footer_touch_line: "Επικοινωνήστε μαζί μου",
      footer_social: "Κοινωνικά",
      footer_contacts: "Επαφές",
      footer_artist: "καλλιτέχνης",
      footer_studio: "σχολή",
      footer_ig_lj_title: "Instagram: @__lady.justice_",
      footer_ig_j_title: "Instagram: @justicefitnessanddance",
      footer_map_eyebrow: "Στούντιο",
      footer_open_maps: "Άνοιγμα στο Google Maps",
      footer_map_iframe_title: "Χάρτης: Ilia Venezi 5, Λευκωσία, Κύπρος",
      footer_back_top: "Επιστροφή στην κορυφή",
    },
    ru: {
      meta_title: "Lady Justice — индивидуальные занятия в Никосии",
      meta_description:
        "Индивидуальные занятия танцем, растяжкой и фитнесом в Никосии, Кипр. Дети и взрослые. Запись в JUSTICE Fitness & Dance (Ilia Venezi 5).",
      brand_alt: "Lady Justice",
      nav_aria: "Основная навигация",
      nav_home: "Главная",
      nav_about: "Обо мне",
      nav_classes: "Занятия",
      nav_schedule: "Расписание",
      nav_book: "Запись",
      nav_studio: "Студия",
      nav_contact: "Контакты",
      nav_menu_open: "Открыть меню",
      nav_menu_close: "Закрыть меню",
      lang_aria: "Язык",
      hero_title: "Блок героя",
      hero_copy:
        "Сюда — короткая сильная формулировка: что вы делаете, для кого или как—часто с фото вас, продукта и т.д.",
      hero_book: "Запись",
      social_heading: "Социальное доказательство",
      social_lede:
        "Строка «As Seen On» или лучшие отзывы — здесь. Такой же блок можно повторить ниже по странице.",
      services_head: "Основные услуги и предложения",
      services_note:
        "Иногда этот блок удобнее поставить выше раздела «Обо мне»: здесь в первую очередь то, что клиенту важно понять о ваших услугах или главных офферах—без лишней воды, чтобы сразу было ясно, с чем вы работаете и что можно заказать.",
      services_t1: "Индивидуальные уроки",
      services_d1:
        "Персональный план, ваш темп и задачи: танец, растяжка или фитнес—индивидуально с педагогом.",
      services_t2: "Групповые фитнес, танцы и растяжка",
      services_d2:
        "Занятия в группе—движение, музыка и нагрузка в формате, который вы задаёте для своей аудитории.",
      services_t3: "Аренда студии",
      services_d3:
        "Почасово или пакетами: репетиции, мини-группы, съёмки—когда площадка нужна отдельно от уроков.",
      services_tagline: "Ключевые услуги и предложения",
      about_hint: "Лучшее фото в стиле бренда, команды и т.д.",
      about_heading: "Обо мне",
      about_lede:
        "Оставьте только то, что важно зрителю или ученику: опыт, стиль, как вы ведёте занятия и чем вы полезны.",
      lead_display: "Лид-магнит",
      lead_title:
        "Сделайте заголовок про результат и «ударность», подзаголовок — в том же духе",
      lead_text: "Кнопки призыва к действию должны выделяться цветом.",
      lead_book: "Запись",
      lead_figcap: "Сюда — визуал или макет лид-магнита",
      content_heading: "Контент-блок",
      content_lede:
        "Необязательный блок, чтобы показать лучший контент (тот, что чаще всего приводит к заявкам).",
      schedule_head: "Расписание",
      schedule_lede:
        "Сюда можно вынести часы работы по дням, даты сезона или PDF с расписанием. Когда человек готов записаться — отправьте его в блок «Запись» ниже, к календарю.",
      schedule_cta: "К записи",
      content_c1t: "Индивидуальные уроки",
      content_c1p:
        "Опишите формат, длительность, для кого подходит персональный формат (дети, взрослые, подготовка к событию), как проходит запись и что человек получит после первого занятия. Добавьте цифры, отзыв или ссылку на календарь.",
      content_c2t: "Групповые фитнес, танцы и растяжка",
      content_c2p:
        "Распишите расписание, размер группы, уровень, нужна ли запись заранее и чем отличаются направления. Можно вставить фото зала, короткое видео или расписание недели—чтобы снять типичные вопросы до сообщения вам.",
      content_c3t: "Аренда студии",
      content_c3p:
        "Укажите площадь, покрытие, оборудование, правила по времени и звуку, как бронировать почасово или пакетом. Если аренда связана с JUSTICE Fitness & Dance, кратко напомните адрес и ссылку на карту в подвале страницы.",
      book_kicker: "Расписание",
      book_title: "Записаться на урок",
      book_sub: "Выберите время ниже. Календарь и подтверждения — через Calendly.",
      footer_touch_eyebrow: "Бронирование, визит в студию или короткое «привет»",
      footer_touch_aria: "Связаться",
      footer_touch_line: "Связаться",
      footer_social: "Соцсети",
      footer_contacts: "Контакты",
      footer_artist: "артист",
      footer_studio: "студия",
      footer_ig_lj_title: "Instagram: @__lady.justice_",
      footer_ig_j_title: "Instagram: @justicefitnessanddance",
      footer_map_eyebrow: "Студия",
      footer_open_maps: "Открыть в Google Картах",
      footer_map_iframe_title: "Карта: Ilia Venezi 5, Никосия, Кипр",
      footer_back_top: "Наверх",
    },
  };

  function getStrings(lang) {
    return T[lang] && T[lang].meta_title ? T[lang] : T[DEFAULT_LANG];
  }

  function normalizeLang(code) {
    if (code === "el" || code === "en" || code === "ru") return code;
    return DEFAULT_LANG;
  }

  function readStoredLang() {
    try {
      return normalizeLang(localStorage.getItem(STORAGE_KEY));
    } catch {
      return DEFAULT_LANG;
    }
  }

  function storeLang(lang) {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (_) {}
  }

  function setHtmlLang(lang) {
    const html = document.documentElement;
    html.lang = lang === "el" ? "el" : lang === "ru" ? "ru" : "en";
    html.setAttribute("data-lang", lang);
  }

  function applyMeta(s) {
    const titleEl = document.querySelector("title");
    if (titleEl) titleEl.textContent = s.meta_title;
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", s.meta_description);
  }

  function applyIframes(lang) {
    const iframe = document.querySelector(".site-footer__map-embed iframe");
    if (!iframe) return;
    const hl = lang === "el" ? "el" : lang === "ru" ? "ru" : "en";
    try {
      const u = new URL(iframe.src);
      u.searchParams.set("hl", hl);
      iframe.src = u.toString();
    } catch {
      iframe.src = iframe.src.replace(/[?&]hl=[^&]*/, "").replace(/\?$/, "");
      const join = iframe.src.includes("?") ? "&" : "?";
      iframe.src = `${iframe.src}${join}hl=${hl}`;
    }
  }

  function apply(lang) {
    const L = normalizeLang(lang);
    const s = getStrings(L);
    setHtmlLang(L);
    storeLang(L);
    applyMeta(s);
    applyIframes(L);

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (!key || !(key in s)) return;
      const val = s[key];
      if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
        el.value = val;
        return;
      }
      el.textContent = val;
    });

    document.querySelectorAll("[data-i18n-attr]").forEach((el) => {
      const spec = el.getAttribute("data-i18n-attr");
      if (!spec) return;
      spec.trim().split(/\s+/).forEach((pair) => {
        const c = pair.indexOf(":");
        if (c === -1) return;
        const attr = pair.slice(0, c).trim();
        const key = pair.slice(c + 1).trim();
        if (!attr || !key || !(key in s)) return;
        el.setAttribute(attr, s[key]);
      });
    });

    const langSelect = document.getElementById("lj-lang-select");
    if (langSelect) langSelect.value = L;

    const navToggle = document.getElementById("lj-nav-toggle");
    if (navToggle && navToggle.getAttribute("aria-expanded") !== "true") {
      navToggle.setAttribute("aria-label", s.nav_menu_open);
    }
  }

  function init() {
    const initial = readStoredLang();
    apply(initial);

    const langSelect = document.getElementById("lj-lang-select");
    if (langSelect) {
      langSelect.addEventListener("change", () => {
        apply(langSelect.value);
      });
    }

    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());

    initMobileNav();
  }

  function initMobileNav() {
    const toggle = document.getElementById("lj-nav-toggle");
    const drawer = document.getElementById("lj-nav-drawer");
    const backdrop = document.getElementById("lj-nav-backdrop");
    if (!toggle || !drawer || !backdrop) return;

    const mq = window.matchMedia("(max-width: 767px)");
    let open = false;

    function navStrings() {
      const raw = document.documentElement.getAttribute("data-lang");
      return getStrings(normalizeLang(raw || DEFAULT_LANG));
    }

    function syncDrawerInert() {
      if (!mq.matches) {
        drawer.removeAttribute("inert");
        return;
      }
      if (open) drawer.removeAttribute("inert");
      else drawer.setAttribute("inert", "");
    }

    function setOpen(next) {
      open = next;
      document.body.classList.toggle("nav-drawer-open", open);
      document.body.style.overflow = open ? "hidden" : "";
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      backdrop.setAttribute("aria-hidden", open ? "false" : "true");
      const s = navStrings();
      toggle.setAttribute("aria-label", open ? s.nav_menu_close : s.nav_menu_open);
      syncDrawerInert();
    }

    function closeIfNarrow() {
      if (mq.matches) setOpen(false);
    }

    toggle.addEventListener("click", () => {
      if (!mq.matches) return;
      setOpen(!open);
    });

    backdrop.addEventListener("click", closeIfNarrow);

    drawer.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", closeIfNarrow);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeIfNarrow();
    });

    mq.addEventListener("change", () => {
      if (!mq.matches) setOpen(false);
      syncDrawerInert();
    });

    syncDrawerInert();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
