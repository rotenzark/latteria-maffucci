/* ── FIRMA · entrata hero ────────────────────────────────────────────
   Tutto con gsap.from(): senza GSAP l'hero è già visibile per CSS, quindi
   qui non serve nessun watchdog e non può restare bianco (bug 19/7). ── */
window.bespokeHeroEntrance = function () {
  if (typeof gsap === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.from('.hero-kicker', { y: 14, opacity: 0, duration: .6 })
    .from('#hero h1',     { y: 30, opacity: 0, duration: .9 }, '-=.35')
    .from('.hero-sub',    { y: 20, opacity: 0, duration: .7 }, '-=.55')
    .from('.hero-meta',   { y: 16, opacity: 0, duration: .6 }, '-=.45');
};

/* PLUMBING_V 2 — Bespoke Studio · meccanica invisibile canonica.
   ────────────────────────────────────────────────────────────────
   CONFINE (inviolabile): questo file contiene SOLO plumbing — la meccanica
   che il visitatore non percepisce come design. NIENTE markup di sezioni,
   NIENTE stile, NIENTE struttura: concept, griglia, tipografia, hero e
   animazioni-firma si progettano DA ZERO per ogni cliente (GATE #3).
   Se qui dentro scivola del layout, questo diventa il nuovo scheletro
   condiviso — cioè il difetto "copia-incolla" che il metodo combatte.

   Come si usa: si COPIA nella cartella js/ del sito e si adatta la sola
   costante SITE. Le animazioni-firma del sito si scrivono nel proprio
   main.js DOPO questo file (o in coda a questo file, sotto il marcatore).
   Ogni bug nuovo si corregge QUI (bump PLUMBING_V + changelog nel README)
   e poi nel sito: mai il contrario.

   Fix già incorporati (non rimuovere):
   - ScrollTrigger registrato SUBITO allo script load, MAI dentro l'intro
     o un setTimeout (bug APF #5 del 16/7: race col watchdog → sezioni
     che sparivano allo scroll).
   - Reveal con once:true (niente re-animazioni da zero ri-scorrendo).
   - Watchdog 1,5s che forza visibile e UCCIDE i trigger non scattati.
   - Lightbox su [hidden] + override CSS !important (bug: display:flex
     batteva [hidden] e la lightbox restava visibile).
   - Foto-contenuto MAI lazy (regola workflow §8): il plumbing non tocca
     il loading, ma il lint lo verifica.
   - Orari Europe/Rome con finestre multiple e scavalco di mezzanotte
     (pattern Il Cavallante 18:00–00:30). */

(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.add('js');
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) root.classList.add('reduced-motion');

  /* ══════════ CONFIG PER-SITO — l'unica parte da adattare ══════════ */
  var SITE = {
    slug: 'latteria-maffucci',                 // usato per localStorage lang
    whatsapp: {
      number: '',                     // '39xxxxxxxxxx' — vuoto = niente wiring
      message: 'Ciao! Vorrei informazioni.',
      ids: ['ctaPrenota', 'heroWhatsapp', 'doveWhatsapp', 'barWhatsapp'],
    },
    /* orari: per giorno (0=domenica) un array di finestre [inizio, fine]
       in minuti-stringa 'HH:MM'. Fine oltre '24:00' = scavalca mezzanotte
       (es. ['18:00','24:30'] = apre alle 18, chiude alle 00:30 del giorno
       dopo). Giorno chiuso = []. */
    hours: {
      0: [],
      1: [['12:30', '14:30']],
      2: [['12:30', '14:30']],
      3: [['12:30', '14:30'], ['20:30', '23:30']],
      4: [['12:30', '14:30'], ['20:30', '23:30']],
      5: [['12:30', '14:30'], ['20:30', '23:30']],
      6: [['20:30', '23:30']],
    },
    hoursStatusId: 'orarioStato',     // elemento testo stato
    hoursTableSelector: '[data-day]', // righe/li con data-day da evidenziare
    todayClass: 'oggi',
    introId: 'intro',
    introDuration: 1800,
    revealSelector: '.reveal',
    inViewClass: 'in-view',
    breakpointMenu: 960,
    /* dizionario EN: SOLO overlay — l'HTML è la versione italiana */
    EN: {
      'skip': 'Skip to content',
      'brand.aria': 'Latteria Maffucci, back to top',
      'burger.aria': 'Open the menu',
      'nav.sett': 'The week', 'nav.pranzo': 'Lunch', 'nav.sera': 'Evening',
      'nav.sala': 'The room', 'nav.dove': 'Find us',
      'lang.aria': 'Passa all’italiano', 'lang.txt': 'IT',
      'nav.cta': 'Book',

      'hero.kicker': 'A former neighbourhood dairy shop · Dergano, Milan',
      'hero.h': 'At midday and<br>in the evening it isn’t<br>the same place.',
      'hero.sub': 'Same address, same room with the checked tablecloths. But at lunch it’s a trattoria, with the blackboard hanging on the wall; in the evening the kitchen turns to fish.',
      'hero.rating': 'from 498 Google reviews',

      'sett.eyebrow': 'The week',
      'sett.h': 'No need to explain it:<br>just look at when they open.',
      'g.lun': 'mon', 'g.mar': 'tue', 'g.mer': 'wed', 'g.gio': 'thu',
      'g.ven': 'fri', 'g.sab': 'sat', 'g.dom': 'sun',
      'g.pranzo': 'lunch', 'g.cena': 'dinner',
      'a.lunp': 'Monday lunch: open', 'a.marp': 'Tuesday lunch: open',
      'a.merp': 'Wednesday lunch: open', 'a.giop': 'Thursday lunch: open',
      'a.venp': 'Friday lunch: open', 'a.sabp': 'Saturday lunch: closed',
      'a.domp': 'Sunday lunch: closed',
      'a.lunc': 'Monday dinner: closed', 'a.marc': 'Tuesday dinner: closed',
      'a.merc': 'Wednesday dinner: open', 'a.gioc': 'Thursday dinner: open',
      'a.venc': 'Friday dinner: open', 'a.sabc': 'Saturday dinner: open',
      'a.domc': 'Sunday dinner: closed',
      'sett.nota': '<strong>Monday and Tuesday they only open at midday. Saturday only in the evening.</strong> In between, three days when the place does both jobs.',

      'pr.eyebrow': 'At midday',
      'pr.h': 'The blackboard,<br>hanging on the wall.',
      'pr.p1': 'At lunch it works like a neighbourhood trattoria: the menu is a board written in chalk, with the sign at the top, and it changes with whatever there is.',
      'pr.p2': 'These were the dishes on the day we photographed it. It isn’t a fixed carte: it is here to show the register.',
      'p2': 'Fregola',
      'p3': 'Broad bean and chicory soup', 'p4': 'Sea bass',
      'p5': 'Swordfish involtini', 'p6': 'Roast beef steak',
      'p7': 'Sides — spinach, courgettes, carrots, broccoli, peas, sautéed mushrooms',
      'p8': 'Carrot and chocolate cake',
      'pr.nota': 'Prices read off their own blackboard: they change with the menu, please confirm in the room.',

      'sr.eyebrow': 'The evening',
      'sr.h': 'Then the place<br>changes trade.',
      'sr.p1': 'In the evening it is <strong>fish</strong>, and everyone starts <strong>together at 8:30pm</strong>: a single sitting, for the whole room. It is a different dinner from lunch, and a different bill: worth knowing before you book.',
      'sr.p2': 'Among the dishes that come back most often: <strong>impepata di cozze</strong>, octopus salad, spaghetti alle vongole, swordfish involtini. At the end there may be <strong>seadas</strong>.',
      'sr.cit': '«More rare than unique. How lucky to have found a place like this. A convivial atmosphere, simple and warm. Excellent fish dishes, quality and quantity.»',
      'sr.cit.c': 'Simone Tomasello, Google review',
      'sr.cta': 'Book a table',

      'sa.eyebrow': 'The room',
      'sa.h': 'You can still see<br>it was a dairy shop.',
      'sa.p1': 'The floor is <strong>alla palladiana</strong>, the terrazzo of old Milanese shops. The tablecloths are checked, over a burgundy underskirt, and the chairs are the usual bentwood ones.',
      'sa.p2': 'On the shelves there are <strong>two vintage radios</strong> and a <strong>black wall telephone</strong>. They aren’t props bought to create atmosphere: they stayed here from when this place sold milk.',
      'sa.cit': '«A family feel, but well looked after in the details.»',
      'sa.a1': 'Enlarge: the vintage radios', 'sa.a2': 'Enlarge: the tables',
      'sa.nota': 'There are few public photos: these are the verified ones. A room like this deserves a proper photo shoot.',

      'voci.eyebrow': 'Google reviews', 'voci.h': '4.7 out of 498.',
      'v1.p': '«More rare than unique. How lucky to have found a place like this. A convivial atmosphere, simple and warm. Excellent fish dishes, quality and quantity.»',
      'v1.c': 'Simone Tomasello',
      'v2.p': '«At my friend Silvio’s you eat a lot and you eat well. Every course an explosion of flavour in your mouth, a family feel but well looked after in the details.»',
      'v2.c': 'Antonio Giametta',
      'v3.p': '«A prodigious experience. A spectacular dinner, with truly tempting menu suggestions, good and satisfying: I got up from the table thoroughly stuffed.»',
      'v3.c': 'Daniele Maffessoli',

      'dove.eyebrow': 'Where we are',
      'dove.h': 'Dergano,<br>on the edge of Bovisa.',
      'dove.serv': 'Dine in · booking recommended for dinner',
      'dove.cta': 'Call to book',
      'dove.maptitle': 'Map: Latteria Maffucci, Via Angiolo Maffucci 24, Milan',
      'd.lun': 'Monday', 'd.mar': 'Tuesday', 'd.mer': 'Wednesday',
      'd.gio': 'Thursday', 'd.ven': 'Friday', 'd.sab': 'Saturday', 'd.dom': 'Sunday',
      'o.lun': '12:30pm–2:30pm', 'o.mar': '12:30pm–2:30pm', 'o.sab': '8:30pm–11:30pm',
      'd.chiuso': 'closed',

      'faq.h': 'Questions',
      'f1.q': 'Is lunch the same as dinner?',
      'f1.a': 'No. At midday there is the trattoria, with the day’s blackboard hanging in the room. In the evening the kitchen changes and turns to fish.',
      'f2.q': 'When are you open?',
      'f2.a': 'Monday and Tuesday lunch only. Wednesday, Thursday and Friday lunch and dinner. Saturday dinner only. Closed Sunday.',
      'f3.q': 'Do I need to book?',
      'f3.a': 'For dinner yes: there are about twenty seats and everyone starts together at 8:30pm, in a single sitting. A phone call to 02 375614 is enough.',
      'f4.q': 'What is on the lunch blackboard?',
      'f4.a': 'It changes. On the day of the photo: strozzapreti alla Luciana, fregola, broad bean and chicory soup, sea bass, swordfish involtini, roast beef steak, sides and carrot and chocolate cake.',
      'f5.q': 'Where exactly are you?',
      'f5.a': 'Via Privata Angiolo Maffucci 24, in Dergano, on the edge of Bovisa.',

      'foot.pranzo': 'Lunch: Mon–Fri 12:30pm–2:30pm',
      'foot.cena': 'Dinner: Wed–Sat 8:30pm–11:30pm',
      'foot.chiuso': 'Closed on Sunday',
      'foot.demo': 'Demonstration site built by',
      'ab.call': 'Book', 'ab.map': 'Find us',
      'nav.storia': 'Since 1988',
      'st.dal': 'Since',
      'st.p1': 'It used to be a real dairy shop: it sold milk from Milan’s Centrale del latte, eggs, cheeses and sandwiches to the bricklayers of the neighbourhood.',
      'st.p2': 'In <strong>1988</strong> it was taken over by <strong>Silvio Matta</strong> and his wife <strong>Annunziata Riviecchio</strong>, Nunzia to everyone, who turned it into a small restaurant. They kept the name. Today their daughter <strong>Valentina</strong> runs the kitchen.',
      'st.fonte': 'History pieced together from <a href="https://www.ilgolosario.it/it/milano-latteria-maffucci" target="_blank" rel="noopener">il Golosario</a> and their own Facebook page.',
      'sa.p3': 'There are <strong>about twenty seats</strong>, in front of the old counter, plus two small tables outside. That is all of it — which is why the evening starts together.',
      'p1': 'Strozzapreti alla Luciana — octopus, tomato, garlic, olives and capers',
      'f6.q': 'How long have you been open?',
      'f6.a': 'The place was a neighbourhood dairy shop. In 1988 Silvio Matta and his wife Annunziata «Nunzia» Riviecchio took it over and turned it into a restaurant, keeping the name. Today their daughter Valentina runs the kitchen.',
      'lb.close': 'Close',
    },
  };
  /* ═════════════════════════════════════════════════════════════════ */

  /* ---------- WhatsApp wiring ---------- */
  if (SITE.whatsapp.number) {
    var waHref = 'https://wa.me/' + SITE.whatsapp.number + '?text=' +
      encodeURIComponent(SITE.whatsapp.message);
    SITE.whatsapp.ids.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) { el.href = waHref; el.target = '_blank'; el.rel = 'noopener'; }
    });
  }

  /* ---------- GSAP: registrazione IMMEDIATA + reveal + watchdog ---------- */
  var hasGsap = typeof gsap !== 'undefined';
  var hasST = hasGsap && typeof ScrollTrigger !== 'undefined';
  if (hasST) gsap.registerPlugin(ScrollTrigger);

  function showAllReveals() {
    var els = document.querySelectorAll(SITE.revealSelector);
    els.forEach(function (el) { el.classList.add(SITE.inViewClass); });
    if (hasGsap) {
      if (hasST) {
        els.forEach(function (el) {
          ScrollTrigger.getAll().forEach(function (st) {
            if (st.trigger === el && !st.progress) st.kill();
          });
        });
      }
      gsap.set(els, { opacity: 1, y: 0, x: 0 });
    }
  }
  // FIX FOUC (18/7): il watchdog è SOLO un fallback se GSAP non c'è (o reduced-motion).
  // Rivelare in anticipo tutti i .reveal mentre gli scroll-trigger sono attivi causava il
  // flash (scompaiono/ricompaiono) sotto la piega. Con GSAP attivo, rivelano gli ScrollTrigger.
  setTimeout(function () { if (!hasGsap || reducedMotion) showAllReveals(); }, 1500);

  if (hasGsap && !reducedMotion) {
    // reveal generico: le animazioni-FIRMA del sito vanno oltre questo,
    // ma si registrano ANCHE LORO subito, mai dopo l'intro.
    // ⚠️ REGOLA ANTI-FLASH (18/7): un elemento .reveal deve avere UNA SOLA animazione che
    // ne porta l'opacità a 1. Se un elemento ha una FIRMA che ne anima l'opacità (stagger,
    // timeline, ecc.), ESCLUDILO da qui via SITE.revealSelector (es. '.reveal:not(.mondo)'),
    // altrimenti il reveal generico + la firma si sovrappongono e l'elemento FLASHA.
    // immediateRender:false → lo stato "from" (opacity:0) NON viene ri-applicato ad ogni
    // ScrollTrigger.refresh() (che scatta al window.load mentre scrolli) → niente flash su refresh.
    gsap.utils.toArray(SITE.revealSelector).forEach(function (el) {
      gsap.fromTo(el, { opacity: 0, y: 28 }, {
        opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', immediateRender: false,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      });
    });
  } else {
    // fallback senza GSAP: IntersectionObserver + classe
    if ('IntersectionObserver' in window && !reducedMotion) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add(SITE.inViewClass); io.unobserve(e.target); }
        });
      }, { threshold: 0.12 });
      document.querySelectorAll(SITE.revealSelector).forEach(function (el) { io.observe(el); });
    } else {
      showAllReveals();
    }
  }

  /* ---------- intro skippabile (NON gate-a nulla) ---------- */
  var intro = document.getElementById(SITE.introId);
  var heroEntrance = window.bespokeHeroEntrance || function () {};
  function hideIntro() {
    if (!intro) return;
    var el = intro; intro = null;
    el.classList.add('hide');
    setTimeout(function () { el.remove(); }, 700);
    heroEntrance();
  }
  // rimozione IMMEDIATA (niente fade): serve quando qualcosa deve stare sopra
  // l'intro subito, es. l'apertura del menu. Durante il fade l'intro resta
  // hit-testable e i link del drawer non sono cliccabili.
  function killIntroNow() {
    if (!intro) return;
    var el = intro; intro = null;
    el.remove();
    heroEntrance();
  }
  if (reducedMotion || !intro) {
    if (intro) { intro.remove(); intro = null; }
    heroEntrance();
  } else {
    setTimeout(hideIntro, SITE.introDuration);
    setTimeout(hideIntro, 6000); // safety net: l'intro non può incastrarsi
    intro.addEventListener('click', hideIntro);
  }

  /* ---------- burger menu (inert + focus + Escape + resize) ---------- */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('mainNav');
  if (burger && nav) {
    var lastFocus = null;
    var closeNav = function () {
      nav.classList.remove('nav-open');
      burger.setAttribute('aria-expanded', 'false');
      if (lastFocus) { lastFocus.focus(); lastFocus = null; }
    };
    var openNav = function () {
      // L'intro ha z-index alto ed è figlia del body: se è ancora a schermo
      // copre il drawer (che vive nello stacking context dell'header) e i link
      // risultano non cliccabili. Aprire il menu chiude l'intro.
      // (bug trovato da qa-motion su Linea Uomo, 19/7/2026 → PLUMBING_V 2)
      if (typeof killIntroNow === 'function') killIntroNow();
      lastFocus = document.activeElement;
      nav.classList.add('nav-open');
      burger.setAttribute('aria-expanded', 'true');
      var first = nav.querySelector('a, button');
      if (first) first.focus();
    };
    burger.addEventListener('click', function () {
      nav.classList.contains('nav-open') ? closeNav() : openNav();
    });
    nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeNav); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('nav-open')) closeNav();
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > SITE.breakpointMenu) closeNav();
    });
  }

  /* ---------- lightbox accessibile ---------- */
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightboxImg');
  var lightboxClose = document.getElementById('lightboxClose');
  if (lightbox && lightboxImg) {
    var opener = null;
    var openLb = function (src, alt) {
      lightboxImg.src = src; lightboxImg.alt = alt || '';
      lightbox.hidden = false;
      document.body.style.overflow = 'hidden';
      if (lightboxClose) lightboxClose.focus();
    };
    var closeLb = function () {
      lightbox.hidden = true; lightboxImg.src = '';
      document.body.style.overflow = '';
      if (opener) { opener.focus(); opener = null; }
    };
    document.querySelectorAll('[data-full]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        opener = btn;
        var img = btn.querySelector('img');
        openLb(btn.getAttribute('data-full'), img ? img.alt : '');
      });
    });
    if (lightboxClose) lightboxClose.addEventListener('click', closeLb);
    lightbox.addEventListener('click', function (e) { if (e.target === lightbox) closeLb(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !lightbox.hidden) closeLb();
    });
  }

  /* ---------- orari dinamici Europe/Rome (finestre multiple + scavalco) ---------- */
  function romeNow() {
    try {
      var f = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/Rome', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false,
      });
      var p = f.formatToParts(new Date());
      var map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
      var get = function (t) { return p.find(function (x) { return x.type === t; }).value; };
      return { day: map[get('weekday')], mins: parseInt(get('hour'), 10) * 60 + parseInt(get('minute'), 10) };
    } catch (e) {
      var d = new Date();
      return { day: d.getDay(), mins: d.getHours() * 60 + d.getMinutes() };
    }
  }
  var toMin = function (hm) {
    var a = hm.split(':');
    return parseInt(a[0], 10) * 60 + parseInt(a[1], 10);
  };
  var fmt = function (m) {
    m = m % 1440;
    return ('0' + Math.floor(m / 60)).slice(-2) + ':' + ('0' + (m % 60)).slice(-2);
  };
  var DAYS_IT = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
  var DAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  function hoursState() {
    var now = romeNow();
    // finestra del giorno corrente
    var wins = SITE.hours[now.day] || [];
    for (var i = 0; i < wins.length; i++) {
      var s = toMin(wins[i][0]), e = toMin(wins[i][1]);
      if (now.mins >= s && now.mins < Math.min(e, 1440)) {
        return { open: true, day: now.day, closesAt: fmt(e) };
      }
    }
    // coda dopo mezzanotte della sera PRIMA
    var prev = (now.day + 6) % 7;
    var pw = SITE.hours[prev] || [];
    for (var j = 0; j < pw.length; j++) {
      var pe = toMin(pw[j][1]);
      if (pe > 1440 && now.mins < pe - 1440) {
        return { open: true, day: prev, closesAt: fmt(pe) };
      }
    }
    // chiuso: prossima apertura (oggi o nei prossimi 7 giorni)
    for (var k = 0; k < wins.length; k++) {
      if (now.mins < toMin(wins[k][0])) {
        return { open: false, day: now.day, opensToday: fmt(toMin(wins[k][0])) };
      }
    }
    for (var d = 1; d <= 7; d++) {
      var nd = (now.day + d) % 7;
      var nw = SITE.hours[nd] || [];
      if (nw.length) return { open: false, day: now.day, opensDay: nd, opensAt: fmt(toMin(nw[0][0])) };
    }
    return { open: false, day: now.day };
  }

  function renderHours() {
    var el = document.getElementById(SITE.hoursStatusId);
    var st = hoursState();
    document.querySelectorAll(SITE.hoursTableSelector).forEach(function (row) {
      row.classList.toggle(SITE.todayClass,
        parseInt(row.getAttribute('data-day'), 10) === st.day);
    });
    if (!el) return;
    var en = root.lang === 'en';
    var txt;
    if (st.open) {
      txt = (en ? 'Open now' : 'Aperto ora') + ' · ' + (en ? 'closes at ' : 'chiude alle ') + st.closesAt;
    } else if (st.opensToday) {
      txt = (en ? 'Closed · opens today at ' : 'Chiuso · apre oggi alle ') + st.opensToday;
    } else if (st.opensAt !== undefined) {
      txt = (en ? 'Closed · opens ' + DAYS_EN[st.opensDay] + ' at ' : 'Chiuso · apre ' + DAYS_IT[st.opensDay] + ' alle ') + st.opensAt;
    } else {
      txt = en ? 'Closed' : 'Chiuso';
    }
    el.textContent = txt;
  }
  renderHours();
  setInterval(renderHours, 60000);

  /* ---------- i18n overlay (EN sopra l'IT del DOM) ---------- */
  var originals = {}; // attr -> key -> testo IT
  var I18N_ATTRS = [
    ['data-i18n', null],
    ['data-i18n-aria', 'aria-label'],
    ['data-i18n-alt', 'alt'],
    ['data-i18n-placeholder', 'placeholder'],
    ['data-i18n-title', 'title'],
  ];
  function setLang(lang) {
    root.lang = lang === 'en' ? 'en' : 'it';
    I18N_ATTRS.forEach(function (pair) {
      var dattr = pair[0], target = pair[1];
      if (!originals[dattr]) originals[dattr] = {};
      document.querySelectorAll('[' + dattr + ']').forEach(function (el) {
        var key = el.getAttribute(dattr);
        var store = originals[dattr];
        if (!(key in store)) store[key] = target ? el.getAttribute(target) : el.textContent;
        var val = lang === 'en' && SITE.EN[key] !== undefined ? SITE.EN[key] : store[key];
        if (target) el.setAttribute(target, val); else el.textContent = val;
      });
    });
    renderHours();
    try { localStorage.setItem(SITE.slug + '-lang', lang); } catch (e) {}
  }
  var langToggle = document.getElementById('langToggle');
  if (langToggle) {
    langToggle.addEventListener('click', function () {
      setLang(root.lang === 'en' ? 'it' : 'en');
    });
  }
  try {
    if (localStorage.getItem(SITE.slug + '-lang') === 'en') setLang('en');
  } catch (e) {}

  /* ---------- action-bar mobile (opzionale: #actionBar) ---------- */
  var actionBar = document.getElementById('actionBar');
  if (actionBar) {
    var onScroll = function () {
      actionBar.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.6);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ══════════ FINE PLUMBING — da qui in giù SOLO il codice-firma
     del sito (animazioni e interazioni uniche del cliente), che si
     registra comunque SUBITO, mai dentro setTimeout/intro. ══════════ */

  /* ══════════ FINE PLUMBING — sotto, il codice-firma ══════════ */

  var header = document.getElementById('header');
  if (header) {
    var headerScroll = function () { header.classList.toggle('scrolled', window.scrollY > 10); };
    window.addEventListener('scroll', headerScroll, { passive: true });
    headerScroll();
  }

  /* FIRMA: la settimana che si disegna da sola.
     Le caselle piene entrano in ordine di lettura — prima la riga del
     pranzo (ocra), poi quella della cena (bordeaux) — così si vede
     nascere la forma dei due mestieri: un blocco a sinistra, uno a
     destra, tre giorni in mezzo che si sovrappongono.
     Solo scale: senza GSAP le caselle sono già colorate dal CSS e la
     griglia resta leggibile identica. */
  if (hasST && !reducedMotion) {
    var piene = document.querySelectorAll('.cella.on');
    if (piene.length) {
      gsap.from(piene, {
        scale: 0,
        duration: .42,
        ease: 'back.out(1.9)',
        stagger: { each: .055 },
        immediateRender: false,
        scrollTrigger: { trigger: '.griglia', start: 'top 78%', once: true },
      });
    }
  }
})();
