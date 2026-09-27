import { TutorialItem } from '../../types/tutorial.ts';

export const calculatorTutorials: TutorialItem[] = [
  {
    id: 'roas-calculator',
    featureViewId: 'roas-calculator',
    title: 'Kalkulator ROAS Real-time',
    badge: 'IKLAN',
    badgeColor: 'bg-emerald-600 text-white',
    category: 'Iklan',
    shortSummary:
      'Ukur efektivitas iklan Shopee Ads, hitung Break-Even ROAS (BEP ROAS), dan ketahui apakah iklanmu menghasilkan untung atau malah boncos.',
    readTimeMinutes: 4,
    difficulty: 'Pemula',
    keywords: ['roas', 'shopee ads', 'iklan boncos', 'bep roas', 'biaya iklan', 'omzet iklan'],
    commonProblemsSolved: [
      'ROAS di dashboard Shopee Ads menunjukkan angka 4x tetapi kas toko malah tekor',
      'Tidak tahu berapa angka ROAS minimal agar iklan tidak rugi',
    ],
    content: {
      functionality:
        'ROAS (Return on Ad Spend) adalah rasio antara omzet penjualan yang dihasilkan dari iklan dibandingkan dengan biaya iklan yang dikeluarkan.\n\nKalkulator ini menghitung ROAS aktual serta membandingkannya dengan Break-Even ROAS (BEP ROAS) toko kamu. Jika ROAS aktual di atas BEP ROAS, iklanmu menghasilkan untung bersih; jika di bawahnya, iklanmu merugi.',
      whenToUse:
        'Gunakan setiap hari atau setiap minggu saat mengevaluasi laporan performa Shopee Ads untuk memutuskan kampanye mana yang harus dinaikkan budget-nya (scale up) atau dimatikan.',
      requiredInputs: [
        {
          name: 'Biaya Iklan (Ad Spend)',
          description: 'Total pengeluaran saldo iklan Shopee Ads pada periode yang dianalisis.',
          example: 'Rp 500.000',
        },
        {
          name: 'Omzet Penjualan dari Iklan',
          description: 'Nilai pesanan yang dihasilkan secara langsung dari iklan.',
          example: 'Rp 2.500.000',
        },
        {
          name: 'Margin Kotor Produk Sebelum Iklan',
          description: 'Sisa persentase margin produk setelah dikurangi HPP, fee Shopee, dan operasional.',
          example: '30%',
        },
      ],
      steps: [
        '1. Buka "Kalkulator ROAS Real-time" di sidebar.',
        '2. Masukkan total biaya iklan dan omzet yang dihasilkan dari Shopee Ads.',
        '3. Masukkan margin kotor produk tokomu.',
        '4. Periksa indikator warna: Hijau (Untung), Kuning (Impas), Merah (Boncos).',
        '5. Baca rekomendasi aksi taktis yang diberikan ASIS.',
      ],
      example: {
        scenario: 'Seller mengeluarkan biaya iklan Rp 500.000 dan menghasilkan omzet Rp 2.500.000 dengan margin produk 25%.',
        inputValues: {
          'Biaya Iklan': 'Rp 500.000',
          'Omzet Iklan': 'Rp 2.500.000',
          'Margin Produk': '25%',
        },
        calculationFlow: [
          'ROAS Aktual = Omzet ÷ Biaya Iklan = 2.500.000 ÷ 500.000 = 5.0x',
          'Laba Kotor Sebelum Iklan = 25% × 2.500.000 = Rp 625.000',
          'Laba Bersih Setelah Iklan = 625.000 - 500.000 = Rp 125.000 (Untung)',
          'BEP ROAS = 1 ÷ 25% = 4.0x',
        ],
        finalResult: 'ROAS 5.0x melebihi BEP ROAS (4.0x), artinya iklan berhasil menyumbang laba bersih Rp 125.000.',
        explanation: 'Dengan mengetahui BEP ROAS 4.0x, kamu tahu batas bawah performa iklan sebelum mulai merugi.',
      },
      howToReadResults: [
        {
          metric: 'ROAS Aktual',
          meaning: 'Efisiensi iklan saat ini (Omzet ÷ Biaya Iklan).',
          actionGuide: 'Jika ROAS > BEP ROAS, pertahankan atau naikkan budget.',
        },
        {
          metric: 'BEP ROAS (Titik Impas Iklan)',
          meaning: 'Angka ROAS minimum di mana keuntungan kotor sama persis dengan biaya iklan (laba bersih = Rp 0).',
          actionGuide: 'Jangan pernah membiarkan iklan berjalan di bawah angka ini dalam jangka panjang.',
        },
      ],
      tips: [
        'Semakin tebal margin produkmu, semakin rendah BEP ROAS yang dibutuhkan, sehingga tokomu lebih leluasa beriklan.',
      ],
      commonMistakes: [
        'Mengira ROAS 3x pasti untung: Padahal jika margin produk hanya 20%, BEP ROAS adalah 5.0x, sehingga ROAS 3x sebenarnya rugi besar.',
      ],
    },
  },
  {
    id: 'target-roas',
    featureViewId: 'target-roas',
    title: 'Kalkulator Target ROAS',
    badge: 'TARGET',
    badgeColor: 'bg-emerald-600 text-white',
    category: 'Iklan',
    shortSummary:
      'Tentukan target efisiensi iklan minimal berdasarkan margin laba yang kamu inginkan sebelum menyalakan campaign Shopee Ads.',
    readTimeMinutes: 3,
    difficulty: 'Pemula',
    keywords: ['target roas', 'bep iklan', 'budget shopee ads', 'strategi bidding'],
    commonProblemsSolved: [
      'Bingung menentukan angka Target ROAS saat menyetel iklan otomatis atau manual di Shopee',
      'Ingin memastikan iklan tetap menyisakan profit bersih tertentu (misal 10%)',
    ],
    content: {
      functionality:
        'Target ROAS membantu seller menentukan target efisiensi iklan berdasarkan margin dan biaya toko, sehingga kamu tahu persis angka bidding dan ROAS yang wajib dicapai agar target keuntungan bersih terpenuhi.',
      whenToUse:
        'Gunakan sebelum mengaktifkan iklan kata kunci atau iklan produk serupa di Shopee, atau saat menentukan batasan bid maksimal per klik.',
      requiredInputs: [
        {
          name: 'Harga Jual Produk',
          description: 'Harga efektif barang di Shopee.',
          example: 'Rp 100.000',
        },
        {
          name: 'Total Biaya (HPP + Fee + Ops)',
          description: 'Seluruh biaya di luar iklan per produk.',
          example: 'Rp 70.000',
        },
        {
          name: 'Target Laba Bersih yang Diinginkan',
          description: 'Berapa persen laba bersih yang ingin kamu sisihkan setelah iklan dibayar.',
          example: '10% (Rp 10.000)',
        },
      ],
      steps: [
        '1. Buka "Kalkulator Target ROAS".',
        '2. Masukkan harga produk dan total beban biaya produk.',
        '3. Tentukan sisa margin laba bersih yang kamu inginkan.',
        '4. ASIS langsung menghitung Target ROAS minimum yang harus kamu pasang di pengaturan Shopee Ads.',
      ],
      example: {
        scenario: 'Produk Rp 100.000 memiliki total modal dan fee Rp 70.000. Seller ingin mengantongi untung bersih 10% (Rp 10.000).',
        inputValues: {
          'Harga Jual': 'Rp 100.000',
          'Biaya Non-Iklan': 'Rp 70.000 (Margin kotor 30%)',
          'Target Laba Bersih': '10% (Rp 10.000)',
        },
        calculationFlow: [
          'Budget iklan maksimal per produk = 30% - 10% = 20% dari harga (Rp 20.000)',
          'Target ROAS = 100% ÷ 20% = 5.0x',
        ],
        finalResult: 'Target ROAS yang harus disetel di Shopee Ads adalah minimal 5.0x.',
        explanation: 'Jika iklan berjalan di ROAS 5.0x, kamu akan memperoleh omzet dengan menyisakan laba bersih pas 10%.',
      },
      howToReadResults: [
        {
          metric: 'Target ROAS Wajib',
          meaning: 'Patokan ROAS minimal di dashboard Shopee Ads.',
          actionGuide: 'Setel ROAS target pada fitur Iklan Otomatis di Shopee mendekati angka ini.',
        },
      ],
      tips: [
        'Untuk produk baru fase bakar uang (branding), kamu bisa menurunkan target laba sementara ke 0% (hanya mengincar BEP ROAS) untuk mengumpulkan ulasan.',
      ],
      commonMistakes: [
        'Menyetel target ROAS terlalu rendah sehingga setiap barang yang laku dari iklan justru memotong modal sendiri.',
      ],
    },
  },
  {
    id: 'discount-calculator',
    featureViewId: 'discount-calculator',
    title: 'Discount Safety',
    badge: 'PROFIT',
    badgeColor: 'bg-amber-600 text-white',
    category: 'Kalkulator',
    shortSummary:
      'Hitung batas diskon aman agar potongan harga dan promo coret tidak memakan margin dan menyebabkan kerugian.',
    readTimeMinutes: 3,
    difficulty: 'Pemula',
    keywords: ['diskon aman', 'promo coret', 'diskon shopee', 'safety margin', 'flash sale'],
    commonProblemsSolved: [
      'Ikut promo diskon besar-besaran tapi setelah dicek ternyata nombok fee Shopee',
      'Ingin tahu diskon maksimal yang masih menyisakan laba',
    ],
    content: {
      functionality:
        'Kalkulator Discount Safety menganalisis harga normal, persentase diskon, dan harga setelah diskon, lalu menguji dampaknya terhadap profitabilitas produk berdasarkan potongan fee Shopee terkini.',
      whenToUse:
        'Gunakan sebelum mendaftarkan produk ke Flash Sale Shopee, diskon toko bulanan, atau saat membuat voucher potongan harga bertingkat.',
      requiredInputs: [
        {
          name: 'Harga Normal (Sebelum Diskon)',
          description: 'Harga etalase asli produk.',
          example: 'Rp 100.000',
        },
        {
          name: 'Rencana Diskon (%)',
          description: 'Berapa persen diskon yang ingin kamu berikan ke pembeli.',
          example: '20%',
        },
        {
          name: 'HPP & Biaya Toko',
          description: 'Modal barang dan biaya packing.',
          example: 'HPP: Rp 50.000, Packing: Rp 2.000',
        },
      ],
      steps: [
        '1. Masuk ke menu "Discount Safety".',
        '2. Masukkan harga normal produk dan modal HPP.',
        '3. Geser slider diskon atau ketik nominal diskon yang direncanakan.',
        '4. Periksa visual indikator: ASIS memperingatkan batas diskon maksimal sebelum produk mengalami kerugian (Loss-Making Zone).',
      ],
      example: {
        scenario: 'Produk seharga Rp 100.000 dengan modal total Rp 60.000 ingin didiskon 30%.',
        inputValues: {
          'Harga Normal': 'Rp 100.000',
          'Diskon': '30% (Harga jadi Rp 70.000)',
          'HPP + Packing': 'Rp 60.000',
          'Fee Shopee': '10% dari Rp 70.000 = Rp 7.000',
        },
        calculationFlow: [
          'Pendapatan setelah diskon: Rp 70.000',
          'Potongan Fee Shopee: -Rp 7.000',
          'Modal HPP: -Rp 60.000',
          'Sisa Untung Bersih: Rp 3.000 (Margin tinggal 4.3%)',
        ],
        finalResult: 'Batas diskon aman untuk produk ini adalah maksimal 32%. Di atas 32%, toko akan rugi.',
        explanation: 'Kalkulator memberi tahu zona aman diskon secara akurat.',
      },
      howToReadResults: [
        {
          metric: 'Max Safe Discount (%)',
          meaning: 'Persentase diskon tertinggi di mana laba bersih tepat sama dengan Rp 0.',
          actionGuide: 'Jangan pernah memberikan diskon melebihi persentase ini kecuali berniat cuci gudang.',
        },
      ],
      tips: [
        'Gunakan strategi naikkan harga etalase terlebih dahulu (markup awal) secara wajar sebelum memasang promo coret.',
      ],
      commonMistakes: [
        'Mengira diskon 20% dari produk dengan margin 25% masih menyisakan untung 5%: Lupa bahwa fee Shopee dan pajak tetap berjalan.',
      ],
    },
  },
  {
    id: 'voucher-simulator',
    featureViewId: 'voucher-simulator',
    title: 'Voucher Simulator',
    badge: 'SIMULASI',
    badgeColor: 'bg-purple-600 text-white',
    category: 'Kalkulator',
    shortSummary:
      'Simulasikan pemberian voucher toko (diskon nominal vs persentase) dan amati dampaknya terhadap margin laba bersih.',
    readTimeMinutes: 3,
    difficulty: 'Pemula',
    keywords: ['voucher toko', 'voucher shopee', 'klaim voucher', 'subsidi diskon'],
    commonProblemsSolved: [
      'Ragu menetapkan minimal belanja dan nominal voucher toko agar tidak tekor',
      'Ingin tahu efek voucher terhadap keranjang belanja pembeli',
    ],
    content: {
      functionality:
        'Voucher Simulator membantu seller memodelkan voucher diskon toko (baik nominal tetap seperti Rp 10.000 maupun persentase dengan maksimum potongan), serta menghitung sisa laba bersih per transaksi yang menggunakan voucher.',
      whenToUse:
        'Gunakan saat membuat Voucher Ikuti Toko, Voucher Live Streaming, atau Voucher Sambutan Pelanggan Baru di Shopee Seller Centre.',
      requiredInputs: [
        {
          name: 'Nilai Keranjang Belanja (Basket Size)',
          description: 'Total belanja pembeli sebelum voucher diterapkan.',
          example: 'Rp 200.000',
        },
        {
          name: 'Nominal / Persentase Voucher',
          description: 'Besaran potongan voucher toko.',
          example: 'Voucher 10% max Rp 15.000',
        },
      ],
      steps: [
        '1. Buka "Voucher Simulator".',
        '2. Tentukan rata-rata nilai pesanan pembeli.',
        '3. Masukkan nominal voucher dan syarat minimal belanja.',
        '4. Lihat simulasi sisa profit dan persentase subsidi yang ditanggung tokomu.',
      ],
      example: {
        scenario: 'Voucher Rp 10.000 dengan minimal belanja Rp 100.000 pada produk bermargin 35%.',
        inputValues: {
          'Keranjang Belanja': 'Rp 100.000',
          'Voucher': 'Rp 10.000',
          'Fee Shopee': 'Dihitung setelah voucher toko seller',
        },
        calculationFlow: [
          'Harga transaksi efektif: Rp 90.000',
          'Biaya fee Shopee dihitung dari Rp 90.000',
          'Laba bersih tersisa tetap aman di atas 20%.',
        ],
        finalResult: 'Voucher aman digunakan dan efektif meningkatkan konversi checkout.',
        explanation: 'Voucher seller mengurangi omzet kena fee, sehingga fee Shopee ikut mengecil.',
      },
      howToReadResults: [
        {
          metric: 'Effective Seller Subsidy',
          meaning: 'Beban riil yang ditanggung toko per klaim voucher.',
          actionGuide: 'Pastikan minimal belanja cukup tinggi agar margin pesanan tidak terserap habis oleh voucher.',
        },
      ],
      tips: [
        'Pasang minimal belanja minimal 2x dari rata-rata harga produk tunggal untuk mendorong pembelian多 (upselling).',
      ],
      commonMistakes: [
        'Membuat voucher tanpa syarat minimal belanja pada produk berharga murah.',
      ],
    },
  },
  {
    id: 'product-launch',
    featureViewId: 'product-launch',
    title: 'Buat Produk Baru (Product Launch)',
    badge: 'LAUNCH',
    badgeColor: 'bg-emerald-500 text-white',
    category: 'Produk',
    shortSummary:
      'Panduan langkah-demi-langkah merilis produk baru di Shopee: dari validasi HPP, strategi harga, simulasi iklan, hingga target penjualan awal.',
    readTimeMinutes: 5,
    difficulty: 'Menengah',
    keywords: ['product launch', 'buat produk baru', 'validasi hpp', 'strategi peluncuran', 'sku baru'],
    commonProblemsSolved: [
      'Bingung urutan langkah saat mau merilis barang baru di toko Shopee',
      'Takut produk baru tidak laku karena salah menentukan harga awal',
    ],
    content: {
      functionality:
        'Product Launch Assistant memandu seller melalui checklist komprehensif saat ingin meluncurkan SKU baru: validasi margin awal, penentuan harga promo peluncuran, kesiapan stok, alokasi budget iklan Shopee, dan proyeksi omzet 30 hari pertama.',
      whenToUse:
        'Gunakan setiap kali tokomu kedatangan produk atau varian baru sebelum di-listing ke Shopee.',
      requiredInputs: [
        {
          name: 'Profil Produk & HPP',
          description: 'Nama produk, kategori, dan modal pokok.',
          example: 'Gamis Katun Premium, HPP Rp 65.000',
        },
        {
          name: 'Target Volume & Margin',
          description: 'Ekspektasi penjualan bulanan dan target margin minimal.',
          example: '100 pcs/bulan, Target Margin 25%',
        },
      ],
      steps: [
        '1. Masuk ke menu "Buat Produk Baru (Launch)".',
        '2. Isi form informasi dasar produk dan biaya modal.',
        '3. Ikuti wizard 4 tahap: Validasi Finansial -> Penentuan Harga -> Strategi Diskon -> Rencana Iklan.',
        '4. Simpan produk ke inventaris toko atau ekspor ringkasan strateginya.',
      ],
      example: {
        scenario: 'Meluncurkan produk botol minum stainless dengan HPP Rp 30.000.',
        inputValues: {
          'HPP': 'Rp 30.000',
          'Target Profit': 'Rp 20.000/pcs',
          'Budget Iklan Launch': 'Rp 500.000',
        },
        calculationFlow: [
          'Harga jual etalase disarankan: Rp 69.000',
          'Diskon coret promo launch 15% -> Harga efektif: Rp 58.650',
          'Net profit per pcs: Rp 20.200 (Aman sesuai target).',
        ],
        finalResult: 'Produk siap di-listing dengan rencana finansial yang matang.',
        explanation: 'Mengurangi risiko kegagalan produk baru karena margin sudah divalidasi sejak hari pertama.',
      },
      howToReadResults: [
        {
          metric: 'Launch Feasibility Score',
          meaning: 'Skor kelayakan peluncuran produk berdasarkan daya saing margin dan beban operasional.',
          actionGuide: 'Skor di atas 80 berarti produk sangat aman dan prospektif untuk dirilis.',
        },
      ],
      tips: [
        'Pada 2 minggu pertama, fokuskan pada pengumpulan ulasan bintang 5 dengan harga peluncuran yang kompetitif.',
      ],
      commonMistakes: [
        'Langsung menetapkan harga mati tanpa ruang untuk promo coret atau voucher sambutan.',
      ],
    },
  },
  {
    id: 'price-simulator',
    featureViewId: 'price-simulator',
    title: 'Price Simulator (A/B/C)',
    badge: 'SIMULASI',
    badgeColor: 'bg-blue-600 text-white',
    category: 'Kalkulator',
    shortSummary:
      'Bandingkan 3 skenario harga jual sekaligus (Harga Rendah vs Sedang vs Tinggi) untuk melihat dampak langsung ke profit dan omzet.',
    readTimeMinutes: 3,
    difficulty: 'Menengah',
    keywords: ['price simulator', 'skenario harga', 'ab testing harga', 'sensitivitas margin'],
    commonProblemsSolved: [
      'Ragu apakah lebih menguntungkan jual murah volume banyak atau jual mahal volume sedikit',
      'Ingin menguji skenario perubahan harga sebelum mengubahnya di Shopee',
    ],
    content: {
      functionality:
        'Price Simulator memungkinkan seller membuat 3 skenario harga (Skenario A: Agresif, B: Moderat, C: Premium) secara berdampingan. Sistem menghitung laba bersih per unit dan total profit proyeksi berdasarkan estimasi volume.',
      whenToUse:
        'Gunakan ketika ingin menaikkan harga produk lama atau mengevaluasi elastisitas permintaan barang.',
      requiredInputs: [
        {
          name: '3 Kandidat Harga',
          description: 'Pilihan nominal harga jual yang ingin diuji.',
          example: 'Rp 89.000 vs Rp 99.000 vs Rp 109.000',
        },
      ],
      steps: [
        '1. Masuk ke menu "Price Simulator (A/B/C)".',
        '2. Masukkan rincian biaya tetap produk (HPP, packing, fee).',
        '3. Isi 3 opsi harga jual dan estimasi penjualan per bulan.',
        '4. Amati grafik perbandingan total profit bulanan.',
      ],
      example: {
        scenario: 'Menguji harga Rp 85.000 (100 pcs) vs Rp 95.000 (80 pcs).',
        inputValues: {
          'Skenario A': 'Harga 85k -> Profit per pcs 15k -> Total profit Rp 1.500.000',
          'Skenario B': 'Harga 95k -> Profit per pcs 23k -> Total profit Rp 1.840.000',
        },
        calculationFlow: [
          'Meskipun penjualan turun 20 pcs pada Skenario B, total keuntungan justru naik Rp 340.000 (+22.6%).',
        ],
        finalResult: 'Skenario B lebih menguntungkan karena margin per unit jauh lebih sehat.',
        explanation: 'Jual lebih sedikit bisa menghasilkan uang lebih banyak jika margin per unit lebih tinggi.',
      },
      howToReadResults: [
        {
          metric: 'Total Monthly Profit',
          meaning: 'Akumulasi keuntungan bersih bulanan dari kombinasi harga dan volume.',
          actionGuide: 'Pilih skenario yang memberikan total laba bersih tertinggi dengan risiko operasional terendah.',
        },
      ],
      tips: [
        'Selalu pertimbangkan beban packing: menjual volume lebih sedikit dengan untung sama menghemat tenaga kerja dan lakban.',
      ],
      commonMistakes: [
        'Terjebak pada gengsi omzet kotor tinggi padahal laba bersihnya lebih kecil akibat perang harga.',
      ],
    },
  },
  {
    id: 'ads-budget',
    featureViewId: 'ads-budget',
    title: 'Ads Budget Calculator',
    badge: 'BUDGET',
    badgeColor: 'bg-emerald-600 text-white',
    category: 'Iklan',
    shortSummary:
      'Alokasikan budget harian dan bulanan iklan Shopee Ads berdasarkan target omzet dan target ROAS tanpa takut overspend.',
    readTimeMinutes: 3,
    difficulty: 'Menengah',
    keywords: ['ads budget', 'budget iklan shopee', 'top up saldo iklan', 'alokasi iklan'],
    commonProblemsSolved: [
      'Bingung harus top-up saldo iklan berapa setiap bulan',
      'Iklan sering kehabisan saldo di tengah hari saat jam belanja ramai',
    ],
    content: {
      functionality:
        'Kalkulator ini menghitung alokasi modal iklan harian dan bulanan yang ideal berdasarkan target omzet toko dan efisiensi ROAS historis.',
      whenToUse:
        'Gunakan di awal bulan saat menyusun anggaran promosi atau saat mempersiapkan event Mega Campaign (Double Day 11.11, 12.12).',
      requiredInputs: [
        {
          name: 'Target Omzet Toko',
          description: 'Ekspektasi total penjualan yang ingin dicapai.',
          example: 'Rp 50.000.000',
        },
        {
          name: 'Porsi Penjualan dari Iklan',
          description: 'Persentase omzet yang diharapkan datang dari Shopee Ads.',
          example: '40% (Rp 20.000.000)',
        },
        {
          name: 'Ekspektasi ROAS',
          description: 'Rata-rata ROAS iklan toko.',
          example: '5.0x',
        },
      ],
      steps: [
        '1. Masuk ke menu "Ads Budget Calculator".',
        '2. Tentukan target omzet bulanan dan persentase kontribusi iklan.',
        '3. Masukkan asumsi ROAS realistis tokomu.',
        '4. Dapatkan rekomendasi batas top-up bulanan dan limit pengeluaran per hari.',
      ],
      example: {
        scenario: 'Target omzet iklan Rp 20.000.000 dengan perkiraan ROAS 4.0x.',
        inputValues: {
          'Omzet Iklan': 'Rp 20.000.000',
          'Target ROAS': '4.0x',
        },
        calculationFlow: [
          'Kebutuhan budget iklan bulanan = 20.000.000 ÷ 4.0 = Rp 5.000.000',
          'Budget iklan harian yang disarankan = 5.000.000 ÷ 30 hari = Rp 166.666 / hari',
        ],
        finalResult: 'Setel batas harian Shopee Ads kamu sebesar Rp 165.000 - Rp 170.000/hari.',
        explanation: 'Mencegah saldo iklan terkuras habis di awal bulan.',
      },
      howToReadResults: [
        {
          metric: 'Daily Budget Limit',
          meaning: 'Batas maksimal pembelanjaan iklan per hari.',
          actionGuide: 'Pasang angka ini sebagai modal harian di dashboard Shopee Ads.',
        },
      ],
      tips: [
        'Tingkatkan budget harian hingga 2x-3x lipat khusus pada hari H campaign tanggal kembar dan payday.',
      ],
      commonMistakes: [
        'Menyetel iklan "Tanpa Batas Modal" sehingga saldo ratusan ribu ludes dalam hitungan jam karena klik bot.',
      ],
    },
  },
  {
    id: 'bep-calculator',
    featureViewId: 'bep-calculator',
    title: 'BEP Calculator',
    badge: 'KEUANGAN',
    badgeColor: 'bg-slate-700 text-white',
    category: 'Kalkulator',
    shortSummary:
      'Hitung Titik Impas (Break-Even Point) dalam satuan unit barang dan nominal rupiah omzet agar tahu batas minimal toko wajib jualan.',
    readTimeMinutes: 3,
    difficulty: 'Pemula',
    keywords: ['bep calculator', 'break even point', 'titik impas', 'biaya tetap toko', 'gaji karyawan'],
    commonProblemsSolved: [
      'Tidak tahu harus laku berapa paket per bulan agar biaya sewa toko, gaji, dan listrik tertutup',
    ],
    content: {
      functionality:
        'BEP Calculator menghitung berapa banyak unit barang yang wajib terjual per bulan agar seluruh biaya tetap (gaji karyawan, sewa tempat, internet, langganan software) tertutupi oleh margin kontribusi produk.',
      whenToUse:
        'Gunakan setiap kali menambah karyawan baru, memperluas gudang, atau menyusun target penjualan bulanan tim operasional.',
      requiredInputs: [
        {
          name: 'Total Biaya Tetap Bulanan (Fixed Cost)',
          description: 'Gaji, sewa ruko/gudang, listrik, internet, dan langganan software.',
          example: 'Rp 6.000.000/bulan',
        },
        {
          name: 'Rata-rata Margin Kontribusi per Unit',
          description: 'Sisa uang per pesanan setelah dikurangi HPP, packing, dan fee Shopee.',
          example: 'Rp 20.000/unit',
        },
      ],
      steps: [
        '1. Masuk ke "BEP Calculator".',
        '2. Masukkan total pengeluaran tetap bulanan tokomu.',
        '3. Masukkan rata-rata margin kontribusi produk.',
        '4. ASIS langsung menampilkan jumlah unit minimal yang wajib terjual per bulan dan per hari.',
      ],
      example: {
        scenario: 'Biaya operasional tetap toko Rp 6.000.000/bulan dengan untung bersih Rp 20.000 per paket.',
        inputValues: {
          'Fixed Cost': 'Rp 6.000.000',
          'Margin per Unit': 'Rp 20.000',
        },
        calculationFlow: [
          'BEP Unit = 6.000.000 ÷ 20.000 = 300 unit per bulan',
          'Target harian = 300 ÷ 30 hari = 10 paket per hari',
        ],
        finalResult: 'Toko wajib menjual minimal 10 paket/hari agar operasional tidak nombok.',
        explanation: 'Penjualan di atas 300 unit per bulan adalah murni keuntungan bersih toko.',
      },
      howToReadResults: [
        {
          metric: 'BEP Unit & BEP Rupiah',
          meaning: 'Batas minimal volume penjualan untuk menutup seluruh beban tetap.',
          actionGuide: 'Jadikan angka ini sebagai target minimum KPI tim penjualan tokomu.',
        },
      ],
      tips: [
        'Kombinasikan produk volume tinggi (meski margin tipis) untuk mempercepat pencapaian BEP bulanan.',
      ],
      commonMistakes: [
        'Hanya menghitung HPP dan melupakan biaya tetap seperti gaji admin dan sewa gudang.',
      ],
    },
  },
  {
    id: 'profit-simulator',
    featureViewId: 'profit-simulator',
    title: 'Profit Simulator (+100%)',
    badge: 'PERTUMBUHAN',
    badgeColor: 'bg-emerald-500 text-slate-950 font-bold',
    category: 'Profit & Biaya',
    shortSummary:
      'Simulasi melipatgandakan keuntungan toko melalui 3 pengungkit utama: efisiensi HPP, kenaikan volume order, atau kenaikan harga jual.',
    readTimeMinutes: 4,
    difficulty: 'Menengah',
    keywords: ['profit simulator', 'lipat gandakan profit', 'growth hack', 'skala bisnis', 'efisiensi biaya'],
    commonProblemsSolved: [
      'Ingin meningkatkan laba bersih toko 2x lipat tanpa harus bekerja 2x lebih keras',
      'Ingin tahu pengungkit mana yang paling berdampak besar bagi laba toko',
    ],
    content: {
      functionality:
        'Simulator ini memperlihatkan efek kekuatan pengungkit bisnis (leverage). Seringkali kenaikan harga 5% atau negosiasi HPP 5% menghasilkan kenaikan laba bersih hingga 50% - 100% karena biaya tetap toko tidak bertambah.',
      whenToUse:
        'Gunakan saat rapat strategi tahunan atau evaluasi kuartalan untuk menentukan fokus utama tim.',
      requiredInputs: [
        {
          name: 'Baseline Kinerja Saat Ini',
          description: 'Omzet, HPP, fee, dan profit bulanan toko saat ini.',
          example: 'Omzet 50jt, Profit 10jt',
        },
        {
          name: 'Simulasi Pengungkit (%)',
          description: 'Kenaikan harga (+5%), penurunan HPP (-5%), atau kenaikan volume (+20%).',
          example: 'Harga +5%, HPP -5%',
        },
      ],
      steps: [
        '1. Masuk ke menu "Profit Simulator (+100%)".',
        '2. Muat data historis toko atau masukkan angka rata-rata tokomu.',
        '3. Geser slider pengungkit (Harga, HPP, Biaya Iklan, Volume).',
        '4. Perhatikan proyeksi kenaikan laba bersih dan grafik visualisasi pertumbuhannya.',
      ],
      example: {
        scenario: 'Toko dengan omzet Rp 100jt dan laba Rp 15jt berhasil menaikkan harga jual rata-rata sebesar 5%.',
        inputValues: {
          'Omzet Awal': 'Rp 100.000.000',
          'Laba Awal': 'Rp 15.000.000',
          'Kenaikan Harga': '+5%',
        },
        calculationFlow: [
          'Tambahan omzet dari kenaikan harga: +Rp 5.000.000',
          'Karena HPP dan operasional tidak bertambah, sebagian besar tambahan ini langsung menjadi laba.',
          'Laba baru meningkat dari Rp 15jt menjadi ~Rp 19.5jt (+30% peningkatan laba).',
        ],
        finalResult: 'Hanya dengan menaikkan harga 5%, keuntungan bersih melonjak hingga 30%.',
        explanation: 'Kekuatan margin membuat penyesuaian harga kecil berdampak luar biasa bagi kantong seller.',
      },
      howToReadResults: [
        {
          metric: 'Profit Multiplier',
          meaning: 'Faktor pelipatgandaan laba bersih hasil kombinasi optimasi.',
          actionGuide: 'Fokuskan energi pada pengungkit yang memiliki sensitivitas laba paling tinggi.',
        },
      ],
      tips: [
        'Negosiasi HPP dengan supplier untuk diskon kuantitas seringkali lebih mudah daripada perang iklan di Shopee.',
      ],
      commonMistakes: [
        'Selalu berpikir jalan satu-satunya menaikkan laba adalah dengan menambah iklan, padahal optimasi harga dan HPP jauh lebih hemat.',
      ],
    },
  },
];
