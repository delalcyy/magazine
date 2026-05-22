'use strict';

/* ═══════════════════════════════════════════════════════════
   lang.js — Casting çok dil desteği (TR / EN / RU)
   ═══════════════════════════════════════════════════════════ */

const LANGS = {

  tr: {
    /* Genel nav */
    'nav.casting':   'Casting',
    'nav.listings':  'Vitrin',
    'nav.apply':     'Başvuru Oluştur',
    'nav.back':      'fashiontv magazine',
    'nav.login':     'Giriş Yap',
    'nav.apply.hdr': 'Başvuru Oluştur',

    /* Hero */
    'hero.label':  'fashiontv magazine casting',
    'hero.title':  'Yeteneğini Göster,<br>Kariyerini İnşa Et',
    'hero.sub':    'Model, Manken Ve Oyuncu İlanlarını Keşfet. Kendi Başvurunu Oluştur, Ekibimizin İncelemesini Bekle Ve fashiontv magazine\'in Dünyasında Yer Al.',
    'hero.browse': 'İlanları Keşfet',
    'hero.apply':  'Başvuru Oluştur',

    /* Stats */
    'stats.active':     'Aktif İlan',
    'stats.cities':     'Şehir',
    'stats.categories': 'Kategori',
    'stats.verified':   'Onaylı İlanlar',

    /* Kategoriler */
    'categories.label': 'Kategoriler',
    'categories.title': 'Ne arıyorsunuz?',
    'cat.browse':             'İlanları Gör',
    'cat.model.title':        'Model',
    'cat.model.desc':         'Reklam, editöryal ve marka çalışmaları için profesyonel modeller.',
    'cat.manken.title':       'Manken',
    'cat.manken.desc':        'Defileler, showroom ve moda gösterileri için podyum mankenleri.',
    'cat.oyuncu.title':       'Oyuncu',
    'cat.oyuncu.desc':        'Reklam filmleri, dizi ve sinema projeleri için deneyimli oyuncular.',
    'cat.ic_giyim.title':     'İç Giyim',
    'cat.ic_giyim.desc':      'İç giyim markaları ve kampanyaları için özel çekimler.',
    'cat.spor_giyim.title':   'Spor Giyim',
    'cat.spor_giyim.desc':    'Spor ve aktivewear markaları için dinamik çekimler.',
    'cat.abiye.title':        'Abiye & Gelinlik',
    'cat.abiye.desc':         'Abiye, gece kıyafeti ve gelinlik koleksiyonları için özel çekimler.',

    /* Öne çıkan */
    'featured.title': 'Vitrin',
    'featured.all':   'Tümünü Gör',

    /* CTA */
    'cta.title': 'Sen de platformumuza katıl',
    'cta.sub':   'Başvurunu oluştur, ekibimiz incelesin. Onaylandıktan sonra ilanın binlerce profesyonele ulaşsın.',
    'cta.btn':   'Başvuru Oluştur',

    /* İlanlar sayfası */
    'listings.title':       'İlanlar',
    'filter.toggle':        'Filtreler',
    'filter.title':         'Filtreler',
    'filter.clear':         'Temizle',
    'filter.category':      'Kategori',
    'filter.all':           'Tümü',
    'filter.gender':        'Cinsiyet',
    'filter.female':        'Kadın',
    'filter.male':          'Erkek',
    'filter.other':         'Diğer',
    'filter.city':          'Şehir',
    'filter.all.cities':    'Tüm Şehirler',
    'filter.experience':    'Deneyim',
    'filter.all.exp':       'Tümü',
    'filter.exp.new':       'Yeni Başlayan',
    'filter.exp.mid':       'Deneyimli',
    'filter.exp.pro':       'Profesyonel',
    'filter.age':           'Yaş Aralığı',
    'filter.height':        'Boy (cm)',
    'filter.weight':        'Kilo (kg)',
    'filter.hair':          'Saç Rengi',
    'filter.eye':           'Göz Rengi',
    'filter.featured.only': 'Sadece Öne Çıkanlar',
    'filter.photos.only':   'Sadece Fotoğraflılar',
    'filter.apply':         'Filtrele',
    'filter.min':           'Min',
    'filter.max':           'Max',
    'results.loading':      'Yükleniyor…',
    'results.empty':        'Uygun ilan bulunamadı.',
    'results.empty.sub':    'Filtrelerinizi değiştirmeyi deneyin.',

    /* Başvuru sayfası */
    'apply.title':         'Başvuru Oluştur',
    'apply.sub':           'Bilgilerini doldur, ekibimiz incelesin. Onaylandıktan sonra ilanınız yayınlansın.',
    'apply.login.title':   'Başvuru için giriş yapman gerekiyor',
    'apply.login.sub':     'Ücretsiz hesap oluşturabilir veya mevcut hesabınla giriş yapabilirsin.',
    'apply.login.btn':     'Giriş Yap',
    'apply.register.btn':  'Kayıt Ol',
    'section.personal':    'Kişisel Bilgiler',
    'section.category':    'Kategori & Deneyim',
    'section.physical':    'Fiziksel Özellikler',
    'section.photos':      'Fotoğraflar',
    'section.skills':      'Diller & Yetenekler',
    'section.contact':     'İletişim Bilgileri',
    'field.fullname':      'Ad Soyad',
    'field.age':           'Yaş',
    'field.gender':        'Cinsiyet',
    'field.city':          'Şehir',
    'field.district':      'İlçe',
    'field.category':      'Kategori',
    'field.experience':    'Deneyim',
    'field.description':   'Hakkında / Açıklama',
    'field.height':        'Boy (cm)',
    'field.weight':        'Kilo (kg)',
    'field.bodysize':      'Beden',
    'field.eyecolor':      'Göz Rengi',
    'field.haircolor':     'Saç Rengi',
    'field.shoesize':      'Ayakkabı No',
    'field.bust':          'Göğüs (cm)',
    'field.waist':         'Bel (cm)',
    'field.hips':          'Kalça (cm)',
    'field.skintone':      'Ten Rengi',
    'field.profile.label': 'Profil Fotoğrafı',
    'field.profile.hint':  'Yüz görünür olmalı',
    'field.fullbody.label':'Tam Boy Fotoğraf',
    'field.gallery.label': 'Ek Fotoğraflar',
    'field.gallery.hint':  'Birden fazla seçebilirsin',
    'field.languages':     'Konuştuğun Diller',
    'field.skills':        'Yetenekler',
    'field.skills.ph':     'Yetenek ekle (Ör: Dans, Atlı Binicilik…)',
    'field.skills.add':    'Ekle',
    'field.prevworks':     'Önceki Çalışmalar',
    'field.phone':         'Telefon',
    'field.email':         'E-posta',
    'field.instagram':     'Instagram',
    'section.accounttype':      'Hesap Türü',
    'section.accounttype.sub':  'Başvurunuzu bireysel mi yoksa bir ajans adına mı yapıyorsunuz?',
    'type.individual':          'Bireysel',
    'type.individual.desc':     'Kişisel başvuru, tek ilan hakkı',
    'type.agency':              'Ajans',
    'type.agency.desc':         'Kurumsal başvuru, birden fazla ilan hakkı',
    'section.agency':           'Ajans Bilgileri',
    'field.company':            'Şirket / Ajans Adı',
    'field.taxno':              'Vergi Numarası',
    'field.taxoffice':          'Vergi Dairesi',
    'field.website':            'Web Sitesi',
    'ph.company':               'Ajans veya şirket adı',
    'ph.taxno':                 'Vergi numarası',
    'ph.taxoffice':             'Vergi dairesi',
    'apply.submit':        'Başvuruyu Gönder',
    'apply.sending':       'Gönderiliyor…',
    'apply.success':       'Başvurunuz alındı! Ekibimiz inceledikten sonra sizinle iletişime geçecektir.',
    'select.placeholder':  'Seç…',
    'ph.fullname':         'Adın ve soyadın',
    'ph.age':              '16-80',
    'ph.district':         'İlçe (opsiyonel)',
    'ph.description':      'Kendin, hedeflerin ve çalışma tarzın hakkında kısa bir tanıtım yaz (en az 20 karakter)…',
    'ph.height':           'Ör: 175',
    'ph.weight':           'Ör: 60',
    'ph.bodysize':         'Ör: S, M, 38',
    'ph.shoesize':         'Ör: 39',
    'ph.bust':             'Ör: 90',
    'ph.waist':            'Ör: 65',
    'ph.hips':             'Ör: 95',
    'ph.prevworks':        'Daha önce yaptığın işleri, projeleri veya markaları kısaca yaz…',
    'ph.phone':            '05XX XXX XX XX',
    'ph.email':            'ornek@mail.com',
    'ph.instagram':        '@kullaniciadi',

    /* Footer */
    'footer.desc':       'Moda, yetenek ve fırsatın buluştuğu platform.',
    'footer.whatsapp':   'WhatsApp İletişim',
    'footer.col.casting':'Casting',
    'footer.col.corp':   'Kurumsal',
    'footer.col.contact':'İletişim',
    'footer.listings':   'İlanlar',
    'footer.form':       'Başvuru Formu',
    'footer.models':     'Modeller',
    'footer.actors':     'Oyuncular',
    'footer.mannequins': 'Mankenler',
    'footer.about':      'Hakkımızda',
    'footer.how':        'Nasıl Çalışır',
    'footer.privacy':    'Gizlilik Politikası',
    'footer.terms':      'Kullanım Koşulları',
    'footer.copy':       '© 2026 fashiontv magazine casting. Tüm hakları saklıdır.',
  },

  en: {
    'nav.casting':   'Casting',
    'nav.listings':  'Showcase',
    'nav.apply':     'Apply Now',
    'nav.back':      'Back to Main Site',
    'nav.login':     'Sign In',
    'nav.apply.hdr': 'Apply Now',

    'hero.label':  'fashiontv magazine casting',
    'hero.title':  'Show Your Talent,<br>Build Your Career',
    'hero.sub':    'Discover Model, Mannequin & Actor Listings. Create Your Application, Await Our Team\'s Review And Join the World of fashiontv magazine.',
    'hero.browse': 'Explore Listings',
    'hero.apply':  'Apply Now',

    'stats.active':     'Active Listings',
    'stats.cities':     'Cities',
    'stats.categories': 'Categories',
    'stats.verified':   'Verified Listings',

    'categories.label': 'Categories',
    'categories.title': 'What are you looking for?',
    'cat.browse':             'View Listings',
    'cat.model.title':        'Model',
    'cat.model.desc':         'Professional models for advertising, editorial and brand campaigns.',
    'cat.manken.title':       'Mannequin',
    'cat.manken.desc':        'Runway mannequins for fashion shows, showrooms and collections.',
    'cat.oyuncu.title':       'Actor',
    'cat.oyuncu.desc':        'Experienced actors for commercials, TV series and cinema projects.',
    'cat.ic_giyim.title':     'Lingerie',
    'cat.ic_giyim.desc':      'Specialized shoots for lingerie brands and campaigns.',
    'cat.spor_giyim.title':   'Sportswear',
    'cat.spor_giyim.desc':    'Dynamic shoots for sport and activewear brands.',
    'cat.abiye.title':        'Evening & Bridal',
    'cat.abiye.desc':         'Exclusive shoots for evening gown and bridal wear collections.',

    'featured.title': 'Showcase',
    'featured.all':   'View All',

    'cta.title': 'Join Our Platform',
    'cta.sub':   'Create your application, let our team review it. Once approved, your listing reaches thousands of professionals.',
    'cta.btn':   'Apply Now',

    'listings.title':       'Listings',
    'filter.toggle':        'Filters',
    'filter.title':         'Filters',
    'filter.clear':         'Clear',
    'filter.category':      'Category',
    'filter.all':           'All',
    'filter.gender':        'Gender',
    'filter.female':        'Female',
    'filter.male':          'Male',
    'filter.other':         'Other',
    'filter.city':          'City',
    'filter.all.cities':    'All Cities',
    'filter.experience':    'Experience',
    'filter.all.exp':       'All',
    'filter.exp.new':       'Beginner',
    'filter.exp.mid':       'Experienced',
    'filter.exp.pro':       'Professional',
    'filter.age':           'Age Range',
    'filter.height':        'Height (cm)',
    'filter.weight':        'Weight (kg)',
    'filter.hair':          'Hair Color',
    'filter.eye':           'Eye Color',
    'filter.featured.only': 'Featured Only',
    'filter.photos.only':   'With Photos Only',
    'filter.apply':         'Apply Filters',
    'filter.min':           'Min',
    'filter.max':           'Max',
    'results.loading':      'Loading…',
    'results.empty':        'No listings found.',
    'results.empty.sub':    'Try adjusting your filters.',

    'apply.title':         'Create Application',
    'apply.sub':           'Fill in your details, let our team review. Once approved your listing goes live.',
    'apply.login.title':   'Sign in to apply',
    'apply.login.sub':     'Create a free account or sign in with your existing account.',
    'apply.login.btn':     'Sign In',
    'apply.register.btn':  'Register',
    'section.personal':    'Personal Information',
    'section.category':    'Category & Experience',
    'section.physical':    'Physical Characteristics',
    'section.photos':      'Photos',
    'section.skills':      'Languages & Skills',
    'section.contact':     'Contact Information',
    'field.fullname':      'Full Name',
    'field.age':           'Age',
    'field.gender':        'Gender',
    'field.city':          'City',
    'field.district':      'District',
    'field.category':      'Category',
    'field.experience':    'Experience',
    'field.description':   'About You / Description',
    'field.height':        'Height (cm)',
    'field.weight':        'Weight (kg)',
    'field.bodysize':      'Size',
    'field.eyecolor':      'Eye Color',
    'field.haircolor':     'Hair Color',
    'field.shoesize':      'Shoe Size',
    'field.bust':          'Bust (cm)',
    'field.waist':         'Waist (cm)',
    'field.hips':          'Hips (cm)',
    'field.skintone':      'Skin Tone',
    'field.profile.label': 'Profile Photo',
    'field.profile.hint':  'Face must be visible',
    'field.fullbody.label':'Full Body Photo',
    'field.gallery.label': 'Additional Photos',
    'field.gallery.hint':  'You can select multiple',
    'field.languages':     'Languages You Speak',
    'field.skills':        'Skills',
    'field.skills.ph':     'Add a skill (e.g. Dance, Horse Riding…)',
    'field.skills.add':    'Add',
    'field.prevworks':     'Previous Work',
    'field.phone':         'Phone',
    'field.email':         'Email',
    'field.instagram':     'Instagram',
    'section.accounttype':      'Account Type',
    'section.accounttype.sub':  'Are you applying as an individual or on behalf of an agency?',
    'type.individual':          'Individual',
    'type.individual.desc':     'Personal application, single listing',
    'type.agency':              'Agency',
    'type.agency.desc':         'Corporate application, multiple listings',
    'section.agency':           'Agency Information',
    'field.company':            'Company / Agency Name',
    'field.taxno':              'Tax Number',
    'field.taxoffice':          'Tax Office',
    'field.website':            'Website',
    'ph.company':               'Agency or company name',
    'ph.taxno':                 'Tax number',
    'ph.taxoffice':             'Tax office',
    'apply.submit':        'Submit Application',
    'apply.sending':       'Submitting…',
    'apply.success':       'Your application has been received! Our team will contact you after review.',
    'select.placeholder':  'Select…',
    'ph.fullname':         'Your full name',
    'ph.age':              '16-80',
    'ph.district':         'District (optional)',
    'ph.description':      'Write a short introduction about yourself, your goals and working style (min 20 characters)…',
    'ph.height':           'e.g. 175',
    'ph.weight':           'e.g. 60',
    'ph.bodysize':         'e.g. S, M, 38',
    'ph.shoesize':         'e.g. 39',
    'ph.bust':             'e.g. 90',
    'ph.waist':            'e.g. 65',
    'ph.hips':             'e.g. 95',
    'ph.prevworks':        'Briefly describe your previous work, projects or brands…',
    'ph.phone':            '+90 5XX XXX XX XX',
    'ph.email':            'example@mail.com',
    'ph.instagram':        '@username',

    'footer.desc':       'Where fashion, talent and opportunity meet.',
    'footer.whatsapp':   'WhatsApp Contact',
    'footer.col.casting':'Casting',
    'footer.col.corp':   'Corporate',
    'footer.col.contact':'Contact',
    'footer.listings':   'Listings',
    'footer.form':       'Application Form',
    'footer.models':     'Models',
    'footer.actors':     'Actors',
    'footer.mannequins': 'Mannequins',
    'footer.about':      'About Us',
    'footer.how':        'How It Works',
    'footer.privacy':    'Privacy Policy',
    'footer.terms':      'Terms of Use',
    'footer.copy':       '© 2026 fashiontv magazine casting. All rights reserved.',
  },

  ru: {
    'nav.casting':   'Кастинг',
    'nav.listings':  'Витрина',
    'nav.apply':     'Подать заявку',
    'nav.back':      'На главный сайт',
    'nav.login':     'Войти',
    'nav.apply.hdr': 'Подать заявку',

    'hero.label':  'fashiontv magazine casting',
    'hero.title':  'Покажи талант,<br>Построй карьеру',
    'hero.sub':    'Найди объявления для моделей, манекенщиц и актёров. Создай заявку, дождись проверки нашей команды и стань частью мира fashiontv magazine.',
    'hero.browse': 'Смотреть объявления',
    'hero.apply':  'Подать заявку',

    'stats.active':     'Активных объявлений',
    'stats.cities':     'Городов',
    'stats.categories': 'Категорий',
    'stats.verified':   'Проверенных объявлений',

    'categories.label': 'Категории',
    'categories.title': 'Что вы ищете?',
    'cat.browse':             'Смотреть объявления',
    'cat.model.title':        'Модель',
    'cat.model.desc':         'Профессиональные модели для рекламы, редакционных съёмок и брендов.',
    'cat.manken.title':       'Манекенщица',
    'cat.manken.desc':        'Подиумные манекенщицы для показов мод, шоурумов и коллекций.',
    'cat.oyuncu.title':       'Актёр',
    'cat.oyuncu.desc':        'Опытные актёры для рекламы, сериалов и кинопроектов.',
    'cat.ic_giyim.title':     'Нижнее бельё',
    'cat.ic_giyim.desc':      'Специализированные съёмки для брендов нижнего белья.',
    'cat.spor_giyim.title':   'Спортивная одежда',
    'cat.spor_giyim.desc':    'Динамичные съёмки для спортивных и активных брендов.',
    'cat.abiye.title':        'Вечернее & Свадебное',
    'cat.abiye.desc':         'Эксклюзивные съёмки для вечерних и свадебных коллекций.',

    'featured.title': 'Витрина',
    'featured.all':   'Смотреть все',

    'cta.title': 'Присоединяйтесь к нашей платформе',
    'cta.sub':   'Создайте заявку, наша команда проверит её. После одобрения ваше объявление увидят тысячи профессионалов.',
    'cta.btn':   'Подать заявку',

    'listings.title':       'Объявления',
    'filter.toggle':        'Фильтры',
    'filter.title':         'Фильтры',
    'filter.clear':         'Очистить',
    'filter.category':      'Категория',
    'filter.all':           'Все',
    'filter.gender':        'Пол',
    'filter.female':        'Женский',
    'filter.male':          'Мужской',
    'filter.other':         'Другой',
    'filter.city':          'Город',
    'filter.all.cities':    'Все города',
    'filter.experience':    'Опыт',
    'filter.all.exp':       'Все',
    'filter.exp.new':       'Начинающий',
    'filter.exp.mid':       'Опытный',
    'filter.exp.pro':       'Профессионал',
    'filter.age':           'Возраст',
    'filter.height':        'Рост (см)',
    'filter.weight':        'Вес (кг)',
    'filter.hair':          'Цвет волос',
    'filter.eye':           'Цвет глаз',
    'filter.featured.only': 'Только избранные',
    'filter.photos.only':   'Только с фото',
    'filter.apply':         'Применить',
    'filter.min':           'Мин',
    'filter.max':           'Макс',
    'results.loading':      'Загрузка…',
    'results.empty':        'Объявления не найдены.',
    'results.empty.sub':    'Попробуйте изменить фильтры.',

    'apply.title':         'Подать заявку',
    'apply.sub':           'Заполните данные, наша команда проверит их. После одобрения объявление будет опубликовано.',
    'apply.login.title':   'Войдите, чтобы подать заявку',
    'apply.login.sub':     'Создайте бесплатный аккаунт или войдите в существующий.',
    'apply.login.btn':     'Войти',
    'apply.register.btn':  'Зарегистрироваться',
    'section.personal':    'Личная информация',
    'section.category':    'Категория и опыт',
    'section.physical':    'Физические характеристики',
    'section.photos':      'Фотографии',
    'section.skills':      'Языки и навыки',
    'section.contact':     'Контактная информация',
    'field.fullname':      'Полное имя',
    'field.age':           'Возраст',
    'field.gender':        'Пол',
    'field.city':          'Город',
    'field.district':      'Район',
    'field.category':      'Категория',
    'field.experience':    'Опыт',
    'field.description':   'О себе / Описание',
    'field.height':        'Рост (см)',
    'field.weight':        'Вес (кг)',
    'field.bodysize':      'Размер',
    'field.eyecolor':      'Цвет глаз',
    'field.haircolor':     'Цвет волос',
    'field.shoesize':      'Размер обуви',
    'field.bust':          'Грудь (см)',
    'field.waist':         'Талия (см)',
    'field.hips':          'Бёдра (см)',
    'field.skintone':      'Тон кожи',
    'field.profile.label': 'Фото профиля',
    'field.profile.hint':  'Лицо должно быть видно',
    'field.fullbody.label':'Фото в полный рост',
    'field.gallery.label': 'Дополнительные фото',
    'field.gallery.hint':  'Можно выбрать несколько',
    'field.languages':     'Языки общения',
    'field.skills':        'Навыки',
    'field.skills.ph':     'Добавить навык (напр. Танцы, Верховая езда…)',
    'field.skills.add':    'Добавить',
    'field.prevworks':     'Предыдущие работы',
    'field.phone':         'Телефон',
    'field.email':         'Эл. почта',
    'field.instagram':     'Instagram',
    'section.accounttype':      'Тип аккаунта',
    'section.accounttype.sub':  'Вы подаёте заявку как физическое лицо или от имени агентства?',
    'type.individual':          'Физическое лицо',
    'type.individual.desc':     'Личная заявка, одно объявление',
    'type.agency':              'Агентство',
    'type.agency.desc':         'Корпоративная заявка, несколько объявлений',
    'section.agency':           'Информация об агентстве',
    'field.company':            'Компания / Агентство',
    'field.taxno':              'ИНН',
    'field.taxoffice':          'Налоговая инспекция',
    'field.website':            'Веб-сайт',
    'ph.company':               'Название агентства или компании',
    'ph.taxno':                 'ИНН',
    'ph.taxoffice':             'Налоговая инспекция',
    'apply.submit':        'Отправить заявку',
    'apply.sending':       'Отправляем…',
    'apply.success':       'Ваша заявка принята! Наша команда свяжется с вами после проверки.',
    'select.placeholder':  'Выбрать…',
    'ph.fullname':         'Ваше полное имя',
    'ph.age':              '16-80',
    'ph.district':         'Район (необязательно)',
    'ph.description':      'Напишите короткое описание о себе, ваших целях и стиле работы (мин. 20 символов)…',
    'ph.height':           'Напр. 175',
    'ph.weight':           'Напр. 60',
    'ph.bodysize':         'Напр. S, M, 38',
    'ph.shoesize':         'Напр. 39',
    'ph.bust':             'Напр. 90',
    'ph.waist':            'Напр. 65',
    'ph.hips':             'Напр. 95',
    'ph.prevworks':        'Кратко опишите ваши предыдущие работы, проекты или бренды…',
    'ph.phone':            '+90 5XX XXX XX XX',
    'ph.email':            'example@mail.com',
    'ph.instagram':        '@username',

    'footer.desc':       'Там, где мода встречает талант.',
    'footer.whatsapp':   'Связаться в WhatsApp',
    'footer.col.casting':'Кастинг',
    'footer.col.corp':   'О компании',
    'footer.col.contact':'Контакты',
    'footer.listings':   'Объявления',
    'footer.form':       'Форма заявки',
    'footer.models':     'Модели',
    'footer.actors':     'Актёры',
    'footer.mannequins': 'Манекенщицы',
    'footer.about':      'О нас',
    'footer.how':        'Как это работает',
    'footer.privacy':    'Политика конфиденциальности',
    'footer.terms':      'Условия использования',
    'footer.copy':       '© 2026 fashiontv magazine casting. Все права защищены.',
  },
};

/* ═══════════════════════════════════════════════════════════
   I18N ENGİNE
   ═══════════════════════════════════════════════════════════ */
const LANG_META = {
  tr: { flag: '🇹🇷', name: 'Türkçe',  code: 'TR' },
  en: { flag: '🇬🇧', name: 'English',  code: 'EN' },
  ru: { flag: '🇷🇺', name: 'Русский',  code: 'RU' },
};

const I18n = {
  _lang: 'tr',

  init() {
    const saved = localStorage.getItem('ftv_lang') || 'tr';
    this.setLang(saved, false);
    this._initDropdown();
  },

  setLang(lang, save = true) {
    if (!LANGS[lang]) return;
    this._lang = lang;
    if (save) localStorage.setItem('ftv_lang', lang);
    document.documentElement.lang = lang;
    this.applyAll();
    this.updateSwitcher();
    /* Dropdown'u kapat */
    document.querySelectorAll('.lang-switcher').forEach(s => s.classList.remove('open'));
  },

  t(key) {
    return LANGS[this._lang][key] || LANGS['tr'][key] || key;
  },

  applyAll() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      const val = this.t(key);
      if (val.includes('<br>')) {
        el.innerHTML = val;
      } else {
        el.textContent = val;
      }
    });
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
      const val = this.t(el.dataset.i18nPh);
      el.placeholder = val;
      el.setAttribute('placeholder', val);
    });
  },

  updateSwitcher() {
    const m = LANG_META[this._lang];
    /* Mevcut dil göstergesi */
    document.querySelectorAll('.lang-flag-current').forEach(el => el.textContent = m.flag);
    document.querySelectorAll('.lang-code-current').forEach(el => el.textContent = m.code);
    /* Seçenekler */
    document.querySelectorAll('.lang-opt').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === this._lang);
    });
  },

  _initDropdown() {
    document.querySelectorAll('.lang-switcher').forEach(sw => {
      const trigger = sw.querySelector('.lang-current');
      if (!trigger) return;
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        sw.classList.toggle('open');
      });
    });
    document.querySelectorAll('.lang-opt').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        I18n.setLang(btn.dataset.lang);
      });
    });
    document.addEventListener('click', () => {
      document.querySelectorAll('.lang-switcher').forEach(s => s.classList.remove('open'));
    });
  },
};

/* DOM zaten yüklüyse hemen çalıştır, değilse bekle */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => I18n.init());
} else {
  I18n.init();
}
