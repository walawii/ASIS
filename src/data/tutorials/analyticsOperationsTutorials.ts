import { TutorialItem } from '../../types/tutorial.ts';

export const analyticsOperationsTutorials: TutorialItem[] = [
  {
    id: 'tax-dashboard',
    featureViewId: 'tax-dashboard',
    title: 'Pajak & Tax Dashboard',
    badge: '0.5%',
    badgeColor: 'bg-amber-500 text-slate-950 font-bold',
    category: 'Pajak',
    shortSummary:
      'Perhitungan PPh Final PP 23/55 UMKM 0.5%, PPN, SPT Masa, serta pemantauan akumulasi omzet terhadap batas bebas pajak Rp 500 Juta.',
    readTimeMinutes: 4,
    difficulty: 'Menengah',
    keywords: ['pajak shopee', 'pph final umkm', 'pp 23/55', 'omzet 500 juta', 'spt masa pajak', 'pajak seller'],
    commonProblemsSolved: [
      'Bingung cara menghitung PPh Final 0.5% dari omzet kotor Shopee',
      'Tidak tahu apakah omzet tahunan sudah melewati batas bebas pajak Rp 500 juta untuk wajib pajak orang pribadi',
    ],
    content: {
      functionality:
        'Tax Dashboard memonitor kepatuhan perpajakan tokomu secara otomatis. Sistem mencatat omzet bruto kumulatif, menerapkan fasilitas batas omzet tidak kena pajak Rp 500 Juta bagi Wajib Pajak Orang Pribadi (PP 55/2022), serta menghitung estimasi setoran PPh Final 0.5% setiap bulan.',
      whenToUse:
        'Gunakan setiap akhir bulan sebelum tanggal 15 saat menyiapkan pembuatan Kode Billing dan pembayaran pajak, atau saat pelaporan SPT Tahunan.',
      requiredInputs: [
        {
          name: 'Profil Wajib Pajak',
          description: 'Orang Pribadi (dengan fasilitas omzet Rp 500 juta bebas pajak) atau Badan Usaha (CV/PT).',
          example: 'Wajib Pajak Orang Pribadi UMKM',
        },
        {
          name: 'Data Omzet Bulanan',
          description: 'Total omzet kotor yang masuk setiap bulan dari Shopee.',
          example: 'Rp 45.000.000/bulan',
        },
      ],
      steps: [
        '1. Masuk ke menu "Pajak & Tax Dashboard".',
        '2. Atur profil perpajakanmu di tab Pengaturan Pajak (NPWP, status OP/Badan).',
        '3. Periksa progres akumulasi omzet tahun berjalan pada meteran Rp 500 Juta.',
        '4. Lihat tabel ringkasan per bulan: ASIS merinci omzet kotor, omzet kena pajak, dan nominal PPh Final 0.5% yang wajib disetor.',
      ],
      example: {
        scenario: 'Seller Orang Pribadi memiliki omzet bulan Januari - Mei total Rp 450 Juta. Bulan Juni omzet Rp 80 Juta.',
        inputValues: {
          'Omzet Kumulatif s.d. Mei': 'Rp 450.000.000 (Masih di bawah Rp 500jt, PPh = Rp 0)',
          'Omzet Juni': 'Rp 80.000.000 (Total jadi Rp 530jt)',
        },
        calculationFlow: [
          'Bagian omzet Juni yang masih bebas pajak: Rp 50.000.000 (mencapai batas 500jt)',
          'Omzet kena pajak bulan Juni: Rp 30.000.000',
          'Setoran PPh Final Juni = 0.5% × Rp 30.000.000 = Rp 150.000',
        ],
        finalResult: 'Pajak terutang bulan Juni tepat Rp 150.000.',
        explanation: 'Fasilitas Rp 500 Juta dihitung secara tertib dan otomatis.',
      },
      howToReadResults: [
        {
          metric: 'Omzet Bruto Kena Pajak',
          meaning: 'Bagian dari pendapatan kotor yang dikenakan tarif 0.5%.',
          actionGuide: 'Gunakan angka ini saat mengisi SSP / billing pajak di DJP Online.',
        },
      ],
      tips: [
        'Simpan bukti rekap bulanan dari ASIS untuk mempermudah pelaporan SPT Tahunan di bulan Maret.',
      ],
      commonMistakes: [
        'Membayar pajak 0.5% dari laba bersih: Aturan PP 55 mengatur 0.5% dihitung dari omzet bruto, bukan laba bersih.',
      ],
    },
  },
  {
    id: 'profit-analytics',
    featureViewId: 'profit-analytics',
    title: 'Analisa Laba Rugi (Profit Analytics)',
    badge: 'ANALITIK',
    badgeColor: 'bg-emerald-600 text-white',
    category: 'Profit & Biaya',
    shortSummary:
      'Laporan laba rugi berkala lengkap: visualisasi tren omzet, pemotongan fee Shopee, biaya operasional, dan laba bersih aktual.',
    readTimeMinutes: 4,
    difficulty: 'Menengah',
    keywords: ['analisa laba rugi', 'profit analytics', 'laporan keuangan toko', 'grafik omzet', 'laba bersih bulanan'],
    commonProblemsSolved: [
      'Ingin tahu apakah tren keuntungan toko bulan ini naik atau turun dibandingkan bulan lalu',
      'Mendeteksi lonjakan biaya tak terduga yang membebani kas toko',
    ],
    content: {
      functionality:
        'Halaman ini menyajikan laporan keuangan komprehensif toko e-commerce kamu. Menampilkan grafik pendapatan kotor, total potongan marketplace, pengeluaran iklan, HPP barang terjual, serta margin laba bersih harian, mingguan, dan bulanan.',
      whenToUse:
        'Gunakan saat penutupan buku mingguan atau bulanan untuk memantau performa kesehatan finansial tokomu.',
      requiredInputs: [
        {
          name: 'Filter Periode Waktu',
          description: 'Pilihan rentang waktu: 7 Hari Terakhir, 30 Hari Terakhir, Bulan Ini, atau Custom.',
          example: '30 Hari Terakhir',
        },
      ],
      steps: [
        '1. Masuk ke menu "Analisa Laba Rugi".',
        '2. Pilih toko (jika mengelola lebih dari satu toko di ASIS).',
        '3. Atur rentang tanggal yang ingin kamu telaah.',
        '4. Periksa kartu KPI utama di bagian atas: Omzet Kotor, Potongan Shopee, Beban Iklan, Laba Bersih, dan Net Margin %.',
        '5. Analisis grafik waterfall untuk melihat aliran pengeluaran.',
      ],
      example: {
        scenario: 'Evaluasi kinerja toko bulan berjalan dengan omzet Rp 120.000.000.',
        inputValues: {
          'Omzet Kotor': 'Rp 120.000.000',
          'Biaya Admin & Program': 'Rp 14.400.000 (12%)',
          'Biaya Iklan Shopee Ads': 'Rp 12.000.000 (10%)',
          'HPP Barang Terjual': 'Rp 60.000.000 (50%)',
          'Operasional & Packing': 'Rp 8.000.000 (6.7%)',
        },
        calculationFlow: [
          'Total Pengeluaran = 14.4jt + 12jt + 60jt + 8jt = Rp 94.400.000',
          'Laba Bersih Toko = 120jt - 94.4jt = Rp 25.600.000 (Margin 21.3%)',
        ],
        finalResult: 'Toko membukukan laba bersih Rp 25.600.000 dengan margin sehat di atas 20%.',
        explanation: 'Seluruh struktur biaya terlihat jelas tanpa ada yang tersembunyi.',
      },
      howToReadResults: [
        {
          metric: 'Net Profit Margin %',
          meaning: 'Kesehatan bisnis secara umum. Target ideal 15% - 25%.',
          actionGuide: 'Jika margin di bawah 10%, lakukan efisiensi iklan atau evaluasi harga produk.',
        },
      ],
      tips: [
        'Bandingkan performa minggu campaign (Double Day) dengan minggu reguler untuk melihat apakah campaign benar-benar menambah profit bersih atau hanya menaikkan omzet.',
      ],
      commonMistakes: [
        'Hanya melihat omzet kotor di Shopee Seller Centre dan menganggap toko sangat sukses tanpa menghitung potongan fee dan iklan.',
      ],
    },
  },
  {
    id: 'product-analytics',
    featureViewId: 'product-analytics',
    title: 'Analisis Produk (Product Analytics)',
    badge: 'PRODUK',
    badgeColor: 'bg-blue-600 text-white',
    category: 'Produk',
    shortSummary:
      'Klasifikasi SKU produk ke dalam kuadran: Produk Juara (Winner), Produk Penopang (Cash Cow), Produk Impas (Break-even), dan Produk Boncos (Bleeder).',
    readTimeMinutes: 3,
    difficulty: 'Menengah',
    keywords: ['analisis produk', 'sku winner', 'sku boncos', 'bleeder', 'kontribusi laba'],
    commonProblemsSolved: [
      'Tidak sadar ada produk yang laris manis tapi ternyata setiap transaksi justru bikin rugi',
      'Ingin tahu produk mana yang paling banyak menyumbang laba bersih ke toko',
    ],
    content: {
      functionality:
        'Product Analytics membedah kinerja setiap produk individual dalam katalog tokomu. Setiap produk dinilai berdasarkan volume penjualan dan margin bersihnya, sehingga seller tahu mana SKU yang harus didukung iklan besar dan mana yang harus diperbaiki harganya.',
      whenToUse:
        'Gunakan minimal sekali sebulan untuk bersih-bersih katalog produk dan menyeleksi SKU unggulan.',
      requiredInputs: [
        {
          name: 'Katalog Produk & Data Transaksi',
          description: 'Otomatis tersinkronisasi dari inventaris atau data import pesanan.',
          example: 'Katalog 50 SKU',
        },
      ],
      steps: [
        '1. Masuk ke "Analisis Produk".',
        '2. Urutkan tabel berdasarkan "Total Profit Kontribusi" tertinggi.',
        '3. Buka tab "Produk Boncos / Bleeder" untuk melihat SKU yang menghasilkan margin negatif.',
        '4. Klik aksi "Optimasi di Reverse Pricing" untuk memperbaiki harga jual produk yang bermasalah.',
      ],
      example: {
        scenario: 'Toko mendeteksi SKU Casing HP terjual 500 pcs/bulan tetapi margin per unit minus Rp 1.500 karena fee naik.',
        inputValues: {
          'Penjualan': '500 unit',
          'Margin': '-Rp 1.500 / unit',
        },
        calculationFlow: [
          'Kerugian tersembunyi per bulan = 500 × -1.500 = -Rp 750.000',
        ],
        finalResult: 'Segera naikkan harga jual atau keluar dari program fee yang tidak efisien.',
        explanation: 'Menyelamatkan toko dari kebocoran laba yang tidak kasat mata.',
      },
      howToReadResults: [
        {
          metric: 'Kuadran Status Produk',
          meaning: 'Label otomatis: Winner, Cash Cow, Potential, atau Bleeder.',
          actionGuide: 'Fokuskan budget iklan pada produk Winner dan naikkan harga pada produk Bleeder.',
        },
      ],
      tips: [
        'Jangan ragu menghapus atau menaikkan harga produk bleeder: lebih baik tidak jualan daripada tekor tenaga packing.',
      ],
      commonMistakes: [
        'Mempertahankan harga murah hanya demi mengejar badge "Terlaris" padahal toko terus nombok.',
      ],
    },
  },
  {
    id: 'orders',
    featureViewId: 'orders',
    title: 'AsisFlow Order (Manajemen Pesanan)',
    badge: 'OPERASIONAL',
    badgeColor: 'bg-emerald-600 text-white',
    category: 'Operasional',
    shortSummary:
      'Kelola alur pemrosesan pesanan, verifikasi ongkos kirim riil, dan pantau laba bersih per nomor resi secara real-time.',
    readTimeMinutes: 3,
    difficulty: 'Pemula',
    keywords: ['asisflow order', 'manajemen pesanan', 'cek resi shopee', 'laba per invoice', 'pesanan shopee'],
    commonProblemsSolved: [
      'Ingin tahu berapa rupiah untung bersih yang didapat dari setiap nomor resi yang dikirim hari ini',
    ],
    content: {
      functionality:
        'AsisFlow Order menghubungkan transaksi harian toko dengan True Profit Engine. Setiap pesanan dihitung otomatis laba bersihnya setelah dikurangi HPP produk yang dibeli, estimasi fee pesanan, dan alokasi packing.',
      whenToUse:
        'Gunakan sehari-hari saat tim gudang sedang memproses pesanan dan mencetak label resi pengiriman.',
      requiredInputs: [
        {
          name: 'Daftar Pesanan',
          description: 'Nomor pesanan, nama pembeli, rincian SKU, dan status kirim.',
          example: 'Order #SHP-2026-001',
        },
      ],
      steps: [
        '1. Masuk ke menu "AsisFlow Order".',
        '2. Lihat daftar pesanan masuk hari ini.',
        '3. Periksa status laba per baris pesanan (badge hijau jika untung).',
        '4. Klik detail pesanan untuk melihat rincian pemotongan fee per transaksi.',
      ],
      example: {
        scenario: 'Pesanan masuk senilai Rp 150.000 berisi 2 barang berbeda.',
        inputValues: {
          'Nilai Pesanan': 'Rp 150.000',
          'Total HPP': 'Rp 70.000',
          'Estimasi Fee Shopee': 'Rp 16.500',
          'Biaya Packing': 'Rp 3.000',
        },
        calculationFlow: [
          'Laba Bersih Pesanan = 150.000 - 70.000 - 16.500 - 3.000 = Rp 60.500',
        ],
        finalResult: 'Pesanan ini menyumbang laba bersih riil Rp 60.500.',
        explanation: 'Membuat seller tenang karena setiap paket yang dikirim pasti menghasilkan uang.',
      },
      howToReadResults: [
        {
          metric: 'Net Profit per Order',
          meaning: 'Keuntungan bersih aktual dari pesanan tersebut.',
          actionGuide: 'Jika ada pesanan dengan profit minus (misal karena klaim voucher salah), segera hubungi customer service atau batalkan sebelum dikirim.',
        },
      ],
      tips: [
        'Gunakan filter status pesanan untuk memantau paket yang masih dalam perjalanan ekspedisi.',
      ],
      commonMistakes: [
        'Lupa memasukkan HPP produk sehingga laba per pesanan tercatat keliru.',
      ],
    },
  },
  {
    id: 'inventory',
    featureViewId: 'inventory',
    title: 'Manajemen Stok (Inventory)',
    badge: 'OPERASIONAL',
    badgeColor: 'bg-indigo-600 text-white',
    category: 'Operasional',
    shortSummary:
      'Pantau jumlah stok fisik, nilai persediaan HPP yang tertahan di gudang, dan status peringatan stok menipis.',
    readTimeMinutes: 3,
    difficulty: 'Pemula',
    keywords: ['manajemen stok', 'inventory shopee', 'stok gudang', 'nilai persediaan hpp', 'reorder stok'],
    commonProblemsSolved: [
      'Sering kehabisan stok saat flash sale berlangsung (out of stock)',
      'Tidak tahu berapa ratus juta uang modal yang tertimbun di rak gudang',
    ],
    content: {
      functionality:
        'Halaman ini melacak inventaris barang siap kirim di tokomu. Sistem menghitung total nilai persediaan modal (Asset Value at HPP) dan memberikan indikator visual saat stok mendekati batas minimum.',
      whenToUse:
        'Gunakan saat penerimaan barang baru dari supplier dan pengecekan stok fisik (stock opname) berkala.',
      requiredInputs: [
        {
          name: 'Stok Fisik & Nilai HPP',
          description: 'Jumlah unit aktual di gudang dan harga beli per unit.',
          example: 'Stok: 120 pcs, HPP: Rp 45.000',
        },
      ],
      steps: [
        '1. Masuk ke "Manajemen Stok".',
        '2. Lihat total modal tertahan di banner atas.',
        '3. Gunakan filter "Stok Menipis" untuk melihat barang yang butuh restock.',
        '4. Perbarui jumlah stok secara manual atau sinkronisasi dengan Shopee.',
      ],
      example: {
        scenario: 'Toko memiliki 5 SKU dengan total 1.200 unit barang di rak.',
        inputValues: {
          'Total Unit': '1.200 unit',
          'Rata-rata HPP': 'Rp 50.000',
        },
        calculationFlow: [
          'Total Nilai Persediaan = 1.200 × 50.000 = Rp 60.000.000 modal tertahan',
        ],
        finalResult: 'Uang persediaan toko terdata akurat sebesar Rp 60 Juta.',
        explanation: 'Membantu perencanaan arus kas untuk belanja barang berikutnya.',
      },
      howToReadResults: [
        {
          metric: 'Total Inventory Value',
          meaning: 'Aset modal barang yang ada di gudang.',
          actionGuide: 'Jaga rasio perputaran persediaan agar uang modal tidak macet pada barang deadstock.',
        },
      ],
      tips: [
        'Terapkan batas safety stock minimal 7 hari penjualan agar tokomu tidak terkena penalti poin keterlambatan kirim di Shopee.',
      ],
      commonMistakes: [
        'Menumpuk terlalu banyak stok pada barang musiman yang cepat usang.',
      ],
    },
  },
  {
    id: 'stock-forecast',
    featureViewId: 'stock-forecast',
    title: 'Stock Forecast & Prediksi Kebutuhan',
    badge: 'PREDIKSI',
    badgeColor: 'bg-emerald-600 text-white',
    category: 'Operasional',
    shortSummary:
      'Prediksi waktu kehabisan stok (Days of Inventory) dan rekomendasi jumlah reorder point berdasarkan kecepatan penjualan (velocity).',
    readTimeMinutes: 3,
    difficulty: 'Menengah',
    keywords: ['stock forecast', 'prediksi stok', 'reorder point', 'lead time supplier', 'kehabisan barang'],
    commonProblemsSolved: [
      'Terlambat restock ke supplier sehingga iklan terpaksa dimatikan dan algoritma Shopee turun',
    ],
    content: {
      functionality:
        'Stock Forecast mengkalkulasi kecepatan penjualan harian (Sales Velocity) tiap SKU dan menghitung berapa hari lagi stok gudang akan habis. Sistem juga menghitung tanggal ideal melakukan pemesanan ulang (Reorder Point) dengan memperhitungkan waktu pengiriman supplier (Lead Time).',
      whenToUse:
        'Gunakan setiap hari Senin saat menyusun jadwal Purchase Order (PO) ke pabrik atau distributor.',
      requiredInputs: [
        {
          name: 'Stok Saat Ini & Rata-rata Penjualan Harian',
          description: 'Kuantitas barang di gudang dan kecepatan laku barang per hari.',
          example: 'Stok 150 pcs, Laku 10 pcs/hari',
        },
        {
          name: 'Lead Time Supplier',
          description: 'Berapa hari supplier butuh waktu untuk memproduksi dan mengirimkan barang.',
          example: '7 Hari',
        },
      ],
      steps: [
        '1. Masuk ke menu "Stock Forecast".',
        '2. Amati kolom "Sisa Hari Persediaan (Days of Stock)".',
        '3. Cek kolom "Rekomendasi Waktu Reorder": jika berstatus "Order Sekarang", segera buat PO.',
      ],
      example: {
        scenario: 'Produk sisa 80 pcs, laku 10 pcs/hari. Supplier butuh 5 hari pengiriman.',
        inputValues: {
          'Sisa Stok': '80 pcs',
          'Velocity': '10 pcs/hari (Habis dalam 8 hari)',
          'Lead Time': '5 hari (Safety buffer 2 hari)',
        },
        calculationFlow: [
          'Titik Reorder = (Lead Time 5 hari + Buffer 2 hari) × 10 pcs/hari = 70 pcs',
          'Karena stok saat ini 80 pcs, reorder wajib dilakukan 1 hari lagi saat stok mencapai 70 pcs.',
        ],
        finalResult: 'Barang baru akan tiba tepat 1 hari sebelum stok lama habis.',
        explanation: 'Mencegah toko kehilangan momentum penjualan di Shopee.',
      },
      howToReadResults: [
        {
          metric: 'Days of Stock Remaining',
          meaning: 'Estimasi jumlah hari sampai barang benar-benar habis di gudang.',
          actionGuide: 'Jika di bawah 10 hari, prioritaskan pengadaan barang tersebut.',
        },
      ],
      tips: [
        'Sebelum Double Day (misal 11.11 atau 12.12), kalikan rata-rata penjualan harian dengan faktor 3x lipat.',
      ],
      commonMistakes: [
        'Baru memesan ke supplier setelah stok di etalase bernilai 0.',
      ],
    },
  },
  {
    id: 'opportunity-center',
    featureViewId: 'opportunity-center',
    title: 'Opportunity Center & Rekomendasi Profit',
    badge: 'AI / SMART',
    badgeColor: 'bg-emerald-500 text-slate-950 font-bold',
    category: 'Data & Laporan',
    shortSummary:
      'Deteksi otomatis peluang kenaikan laba: saran kenaikan harga aman, deteksi kebocoran margin, dan peluang efisiensi biaya iklan.',
    readTimeMinutes: 3,
    difficulty: 'Pemula',
    keywords: ['opportunity center', 'peluang profit', 'rekomendasi cerdas', 'kebocoran margin', 'audit otomatis'],
    commonProblemsSolved: [
      'Ingin tahu bagian mana dari toko yang masih bisa dioptimalkan untuk menambah uang tunai',
    ],
    content: {
      functionality:
        'Opportunity Center memindai seluruh data tokomu untuk menemukan celah keuntungan yang belum dimaksimalkan: produk yang bisa dinaikkan harganya tanpa menurunkan konversi, SKU yang terlalu boros iklan, atau program Shopee yang mubazir.',
      whenToUse:
        'Gunakan seminggu sekali untuk mengambil tindakan perbaikan cepat (quick wins).',
      requiredInputs: [
        {
          name: 'Data Toko Terkini',
          description: 'Otomatis dianalisis oleh sistem ASIS.',
          example: 'Data katalog, transaksi, dan iklan',
        },
      ],
      steps: [
        '1. Masuk ke "Opportunity Center".',
        '2. Baca kartu peluang yang diurutkan berdasarkan potensi penambahan rupiah (Estimated Impact).',
        '3. Klik tombol aksi (misal "Terapkan di Reverse Pricing" atau "Perbaiki ROAS").',
      ],
      example: {
        scenario: 'Sistem mendeteksi 3 produk terlaris memiliki harga 15% di bawah rata-rata pasar kompetitor.',
        inputValues: {
          'Peluang': 'Kenaikan Harga Wajar Rp 3.000 / pcs pada 3 SKU',
          'Estimasi Penjualan': '1.000 unit/bulan',
        },
        calculationFlow: [
          'Potensi tambahan laba bersih bulanan = 1.000 × Rp 3.000 = +Rp 3.000.000/bulan murni.',
        ],
        finalResult: 'Tambahan profit Rp 3 Juta tanpa menambah modal sepeser pun.',
        explanation: 'Peluang riil yang langsung berdampak ke saldo kas seller.',
      },
      howToReadResults: [
        {
          metric: 'Estimated Impact (Rp)',
          meaning: 'Perkiraan nominal tambahan uang yang bisa kamu dapatkan jika rekomendasi dijalankan.',
          actionGuide: 'Dahulukan peluang dengan dampak nominal terbesar.',
        },
      ],
      tips: [
        'Eksekusi peluang secara bertahap dan amati respon pembeli dalam 3-5 hari ke depan.',
      ],
      commonMistakes: [
        'Mengabaikan peringatan kebocoran margin sehingga kerugian terus terakumulasi berminggu-minggu.',
      ],
    },
  },
  {
    id: 'reports',
    featureViewId: 'reports',
    title: 'Laporan & Export Data',
    badge: 'LAPORAN',
    badgeColor: 'bg-blue-600 text-white',
    category: 'Data & Laporan',
    shortSummary:
      'Unduh rekapitulasi data keuangan, rincian potongan fee per transaksi, dan laporan pajak dalam format Excel / CSV yang siap pakai.',
    readTimeMinutes: 2,
    difficulty: 'Pemula',
    keywords: ['laporan export', 'unduh excel', 'rekap csv', 'laporan keuangan shopee', 'export data'],
    commonProblemsSolved: [
      'Butuh rekap transaksi untuk diserahkan ke bagian akunting atau konsultan pajak',
    ],
    content: {
      functionality:
        'Laporan & Export menyediakan fitur download satu klik untuk seluruh ringkasan finansial di ASIS: Laporan Laba Rugi, Rekap Fee Shopee per Kategori, Laporan Pajak PPh Final, dan Inventaris Stok.',
      whenToUse:
        'Gunakan pada akhir bulan atau akhir tahun untuk keperluan arsip akuntansi dan pelaporan pajak.',
      requiredInputs: [
        {
          name: 'Jenis Laporan & Format',
          description: 'Pilihan laporan yang ingin diunduh dan format file (CSV / Excel).',
          example: 'Laporan Laba Rugi Bulanan (Excel)',
        },
      ],
      steps: [
        '1. Masuk ke menu "Laporan & Export".',
        '2. Pilih jenis laporan yang dibutuhkan.',
        '3. Tentukan periode waktu.',
        '4. Klik tombol "Download CSV / Excel".',
      ],
      example: {
        scenario: 'Seller mengunduh Rekap Transaksi Bulanan untuk laporan keuangan.',
        inputValues: {
          'Periode': 'September 2026',
          'Jenis': 'Laporan Laba Rugi Riil',
        },
        calculationFlow: [
          'Sistem merangkum seluruh order, fee, pajak, dan HPP ke dalam tabel spreadsheet rapi.',
        ],
        finalResult: 'File spreadsheet siap diarsip atau dibuka di Microsoft Excel / Google Sheets.',
        explanation: 'Menghemat waktu berjam-jam pengerjaan rekap manual.',
      },
      howToReadResults: [
        {
          metric: 'Download Ready File',
          meaning: 'File spreadsheet lengkap dengan rumus dan struktur kolom standar akuntansi.',
          actionGuide: 'Buka file di aplikasi spreadsheet favoritmu untuk audit lebih lanjut.',
        },
      ],
      tips: [
        'Rutin unduh rekap setiap tanggal 1 bulan baru untuk menjaga catatan historis tokomu tetap aman.',
      ],
      commonMistakes: [
        'Tidak pernah mencadangkan (backup) data penjualan sehingga kesulitan saat butuh data tahun lalu.',
      ],
    },
  },
  {
    id: 'dashboard',
    featureViewId: 'dashboard',
    title: 'Dashboard Utama',
    badge: 'RINGKASAN',
    badgeColor: 'bg-orange-500 text-slate-950 font-bold',
    category: 'Profit & Biaya',
    shortSummary:
      'Ringkasan eksekutif kesehatan finansial toko: omzet kotor, laba bersih hari ini, margin rata-rata, grafik penjualan, dan status toko.',
    readTimeMinutes: 3,
    difficulty: 'Pemula',
    keywords: ['dashboard utama', 'ringkasan toko', 'kpi shopee', 'laba hari ini', 'omzet hari ini'],
    commonProblemsSolved: [
      'Ingin tahu kondisi toko hari ini hanya dalam 5 detik saat pertama kali membuka aplikasi',
    ],
    content: {
      functionality:
        'Dashboard Utama adalah pusat kendali operasional harian tokomu di ASIS. Merangkum metrik terpenting: Penjualan Hari Ini, Laba Bersih Hari Ini, Jumlah Pesanan Masuk, Rata-rata Nilai Transaksi, dan Peringatan Kritis yang butuh perhatian segera.',
      whenToUse:
        'Gunakan setiap pagi dan sore hari saat mengecek perkembangan harian bisnis toko Shopee kamu.',
      requiredInputs: [
        {
          name: 'Pilihan Toko Aktif',
          description: 'Pilih toko yang ingin dilihat di pemilih toko (Multi-Store).',
          example: 'Toko Fashion Utama',
        },
      ],
      steps: [
        '1. Klik "Dashboard Utama" di menu paling atas sidebar.',
        '2. Lihat kartu metrik utama di baris paling atas.',
        '3. Cek grafik tren omzet vs laba bersih mingguan.',
        '4. Periksa kotak peringatan (Alerts) jika ada produk yang butuh restock atau margin kritis.',
      ],
      example: {
        scenario: 'Seller membuka ASIS di pagi hari untuk melihat rekap performa kemarin.',
        inputValues: {
          'Penjualan Kemarin': 'Rp 8.500.000 (65 pesanan)',
          'Laba Bersih Kemarin': 'Rp 2.100.000 (Margin 24.7%)',
        },
        calculationFlow: [
          'Sistem mengagregasikan seluruh transaksi, memotong fee Shopee, HPP, packing, dan iklan secara otomatis.',
        ],
        finalResult: 'Seller langsung mengetahui performa riil kemarin dalam sekejap mata.',
        explanation: 'Tidak perlu menghitung manual atau membuka banyak tab di Seller Centre.',
      },
      howToReadResults: [
        {
          metric: 'Laba Bersih Hari Ini',
          meaning: 'Uang bersih sesungguhnya yang dihasilkan tokomu pada hari berjalan.',
          actionGuide: 'Pantau pencapaiannya terhadap target harian yang sudah kamu canangkan.',
        },
      ],
      tips: [
        'Gunakan tombol shortcut di kartu kalkulator pada dashboard untuk melompat langsung ke Reverse Pricing atau True Profit Engine.',
      ],
      commonMistakes: [
        'Hanya melihat kenaikan omzet tanpa memperhatikan apakah laba bersih hariannya juga ikut naik.',
      ],
    },
  },
];
