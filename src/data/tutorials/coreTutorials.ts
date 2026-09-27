import { TutorialItem } from '../../types/tutorial.ts';

export const coreTutorials: TutorialItem[] = [
  {
    id: 'reverse-pricing',
    featureViewId: 'new-pricing',
    title: 'Reverse Pricing',
    badge: 'SOLVER',
    badgeColor: 'bg-emerald-600 text-white',
    category: 'Kalkulator',
    shortSummary:
      'Hitung mundur harga jual yang harus dipasang di Shopee berdasarkan target profit bersih akhir dan seluruh rincian beban seller.',
    readTimeMinutes: 4,
    difficulty: 'Pemula',
    keywords: [
      'reverse pricing',
      'harga jual',
      'target profit',
      'hitung mundur harga',
      'solver',
      'markup harga',
      'net profit target',
      'harga coret',
      'harga pasang',
    ],
    commonProblemsSolved: [
      'Bingung menentukan harga jual agar tidak boncos setelah dipotong admin Shopee',
      'Ingin mengunci keuntungan bersih pas Rp 55.000 per paket pesanan',
      'Ingin tahu harga asli sebelum diskon coret toko dipasang di etalase',
    ],
    content: {
      functionality:
        'Fitur ini digunakan ketika kamu sudah menentukan target akhir yang ingin dicapai (misalnya ingin bersih Rp 55.000 atau margin bersih 25%), lalu ASIS menghitung mundur harga yang diperlukan di etalase Shopee.\n\nReverse Pricing bekerja sebagai SOLVER (mesin pencari angka optimal) yang menjalankan True Profit Engine secara berulang menggunakan binary search hingga menemukan nominal harga listing yang tepat.',
      whenToUse:
        'Gunakan fitur ini setiap kali kamu ingin merilis produk baru, menaikkan harga akibat penyesuaian biaya operasional, atau saat ingin memastikan bahwa diskon coret yang dipasang tetap menghasilkan profit bersih yang kamu targetkan.',
      requiredInputs: [
        {
          name: 'Target Akhir',
          description: 'Nominal laba bersih (Rp) atau persentase margin bersih (%) yang ingin masuk kantong kamu per pesanan.',
          example: 'Rp 55.000 (atau 25%)',
        },
        {
          name: 'HPP (Harga Pokok Penjualan)',
          description: 'Modal bersih pembelian barang atau biaya produksi per unit.',
          example: 'Rp 50.000',
        },
        {
          name: 'Biaya Packing & Operasional',
          description: 'Biaya kardus, bubble wrap, lakban, thermal print, dan overhead toko per paket.',
          example: 'Packing: Rp 2.500, Ops: Rp 4.000',
        },
        {
          name: 'Shopee Ads & Risiko Retur',
          description: 'Estimasi beban alokasi iklan per order serta cadangan retur/pembatalan barang.',
          example: 'Ads: Rp 10.000, Retur: 2%',
        },
        {
          name: 'Status Seller & Kategori Shopee',
          description: 'Tipe toko (Non-Star, Star, Star+, Mall) dan kategori produk untuk mencocokkan skema fee resmi.',
          example: 'Star Seller - Fashion & Pakaian',
        },
        {
          name: 'Program Shopee & Diskon Seller',
          description: 'Partisipasi Gratis Ongkir Xtra, Cashback Xtra, serta persentase diskon coret yang ingin ditampilkan.',
          example: 'Diskon Seller: 10%, Program Gratis Ongkir Xtra: Aktif',
        },
      ],
      steps: [
        '1. Buka menu "Reverse Pricing [SOLVER]" di sidebar.',
        '2. Pada Card Target Akhir, pilih mode "Nominal Bersih (Rp)" dan ketikkan target akhirmu, misalnya Rp 55.000.',
        '3. Masukkan rincian HPP, biaya packing, dan biaya operasional toko.',
        '4. Tentukan status tokomu (misal Star Seller) dan pilih kategori produk yang sesuai.',
        '5. Centang program Shopee yang kamu ikuti (seperti Gratis Ongkir Xtra / Cashback Xtra).',
        '6. Jika ingin memasang harga coret di Shopee, masukkan persentase Diskon Toko (misal 10%).',
        '7. Lihat kartu hasil utama di sisi kanan: ASIS seketika menampilkan "HARGA YANG HARUS DIPASANG DI SHOPEE" dan "HARGA SETELAH DISKON".',
        '8. Periksa rincian Waterfall untuk memastikan seluruh elemen biaya dan pajak telah dihitung mundur.',
      ],
      example: {
        scenario: 'Seller busana muslim ingin mengantongi untung bersih tepat Rp 55.000 per gamis.',
        inputValues: {
          'Target Akhir': 'Rp 55.000',
          'HPP Barang': 'Rp 50.000',
          'Biaya Packing': 'Rp 2.500',
          'Biaya Operasional': 'Rp 4.000',
          'Alokasi Shopee Ads': 'Rp 10.000',
          'Cadangan Retur': '2%',
          'Status Toko': 'Star Seller',
          'Program Shopee': 'Gratis Ongkir Xtra Aktif',
        },
        calculationFlow: [
          'HARGA YANG DICARI DI SHOPEE',
          '↓ Potongan Shopee (Biaya Admin & Layanan)',
          '↓ Program Shopee (Gratis Ongkir Xtra & Cashback Xtra)',
          '↓ Shopee Ads (Alokasi biaya iklan per order)',
          '↓ Retur / Refund (Penyisihan risiko pembatalan)',
          '↓ Pajak (PPh Final UMKM 0.5%)',
          '↓ HPP (Modal barang pokok)',
          '↓ Packing (Dus, bubble wrap, lakban)',
          '↓ Operasional (Overhead toko)',
          '↓ TARGET AKHIR: Rp 55.000 (Tepat tanpa selisih)',
        ],
        finalResult: 'Harga pasang etalase yang disarankan dihitung otomatis oleh solver sehingga target bersih Rp 55.000 tercapai secara presisi.',
        explanation:
          'Reverse Pricing bukan kalkulator diskon biasa. Solver ini memanggil True Profit Engine di setiap iterasi candidate price sampai menghasilkan laba bersih yang sama persis dengan targetmu.',
      },
      howToReadResults: [
        {
          metric: 'HARGA YANG HARUS DIPASANG DI SHOPEE',
          meaning: 'Nominal harga normal (sebelum diskon coret) yang harus kamu ketikkan pada kolom Harga di Seller Centre Shopee.',
          actionGuide: 'Salin nominal ini dan masukkan ke etalase toko Shopee kamu.',
        },
        {
          metric: 'HARGA SETELAH DISKON (Effective Price)',
          meaning: 'Harga riil yang dibayar pembeli setelah diskon tokomu diterapkan. Seluruh fee Shopee dihitung dari harga ini.',
          actionGuide: 'Gunakan angka ini untuk memastikan tokomu tetap berdaya saing di mata pembeli.',
        },
        {
          metric: 'TARGET AKHIR & DELTA REKONSILIASI',
          meaning: 'Konfirmasi bahwa hasil bersih setelah diverifikasi ulang oleh True Profit Engine cocok dengan targetmu.',
          actionGuide: 'Jika delta bernilai Rp 0, artinya harga pasang sudah 100% presisi.',
        },
      ],
      tips: [
        'Ingat bahwa fee administrasi Shopee dipotong dari Harga Setelah Diskon Toko, bukan harga coret awal.',
        'Gunakan fitur preset nominal (Rp 25k, Rp 50k, Rp 100k) untuk simulasi cepat.',
        'Jika tokomu mengenakan diskon coret tinggi (misal 50%), harga pasang etalase akan otomatis dinaikkan oleh solver agar harga efektifnya tetap mencukupi seluruh biaya.',
      ],
      commonMistakes: [
        'Menganggap Reverse Pricing hanya kalkulator markup sederhana (misal HPP + Margin): Ini salah besar karena fee Shopee bertingkat, ada cap maksimal program, dan pajak dipotong dari omzet.',
        'Lupa memasukkan biaya packing dan alokasi iklan: Akibatnya setelah transaksi berjalan, profit bersih yang diterima ternyata jauh lebih kecil dari target.',
      ],
    },
  },
  {
    id: 'true-profit-engine',
    featureViewId: 'true-profit-engine',
    title: 'True Profit Engine',
    badge: 'CORE',
    badgeColor: 'bg-emerald-500 text-slate-950 font-bold',
    category: 'Profit & Biaya',
    shortSummary:
      'Sumber utama kalkulasi akuntansi ASIS. Menghitung omzet riil, rincian potongan admin Shopee, program xtra, pajak UMKM, HPP, hingga laba bersih sesungguhnya.',
    readTimeMinutes: 5,
    difficulty: 'Menengah',
    keywords: [
      'true profit engine',
      'laba bersih riil',
      'biaya admin shopee',
      'fee shopee',
      'pph 0.5%',
      'gratis ongkir xtra',
      'cashback xtra',
      'core engine',
      'audit trail',
    ],
    commonProblemsSolved: [
      'Omzet di Seller Centre terlihat ratusan juta tapi saldo rekening tidak bertambah',
      'Bingung membedakan potongan biaya administrasi, biaya layanan, dan biaya transaksi',
      'Tidak tahu cara menghitung PPh Final PP 23/55 UMKM 0.5% yang sah',
    ],
    content: {
      functionality:
        'True Profit Engine adalah CORE / sumber utama seluruh perhitungan di aplikasi ASIS. Engine ini membedah setiap rupiah dari transaksi penjualan di Shopee menggunakan aturan resmi (rulesData) yang selalu ter-update.\n\nKalkulator lain di ASIS (termasuk Reverse Pricing, Price Simulator, dan Bulk Pricing) semuanya bertumpu dan memanggil True Profit Engine sebagai evaluator resmi.',
      whenToUse:
        'Gunakan setiap kali kamu ingin mengaudit kesehatan finansial produk, mengecek potongan fee Shopee per transaksi, melihat audit trail rinci per komponen biaya, atau menyiapkan penetapan harga yang transparan.',
      requiredInputs: [
        {
          name: 'Harga Jual Produk',
          description: 'Harga yang dibayar pembeli (harga efektif setelah voucher toko atau promo coret).',
          example: 'Rp 100.000',
        },
        {
          name: 'Tipe Toko (Seller Tier)',
          description: 'Status toko di Shopee: Non-Star, Star Seller, Star+, atau Shopee Mall.',
          example: 'Star Seller',
        },
        {
          name: 'Kategori Produk',
          description: 'Kategori barang (A, B, C, D, atau E) yang menentukan persentase biaya administrasi resmi Shopee.',
          example: 'Kategori B (Fashion)',
        },
        {
          name: 'Partisipasi Program Shopee',
          description: 'Program Gratis Ongkir Xtra, Cashback Xtra, atau program promosi musiman lainnya.',
          example: 'Gratis Ongkir Xtra (4.5% cap 10.000)',
        },
        {
          name: 'Tanggal Transaksi',
          description: 'Menentukan tabel aturan fee yang berlaku (misalnya aturan pra-1 April 2026 vs pasca-1 April 2026).',
          example: '2026-04-01',
        },
        {
          name: 'HPP & Biaya Toko',
          description: 'Modal awal barang, biaya packing, overhead operasional, dan alokasi iklan.',
          example: 'HPP: Rp 45.000, Packing: Rp 2.500',
        },
      ],
      steps: [
        '1. Masuk ke menu "True Profit Engine [CORE]".',
        '2. Masukkan harga produk yang ingin kamu audit.',
        '3. Pilih tipe seller toko kamu saat ini.',
        '4. Tentukan kategori produk sesuai katalog Shopee.',
        '5. Aktifkan sakelar program yang sedang diikuti toko (Gratis Ongkir Xtra / Cashback Xtra / Promo).',
        '6. Isi modal HPP dan biaya packing/operasional.',
        '7. Amati rincian audit trail di tab hasil: ASIS menyajikan pendapatan kotor, total fee marketplace, pajak PPh, HPP, laba bersih (Net Profit), dan persentase margin.',
      ],
      example: {
        scenario: 'Audit produk terjual seharga Rp 120.000 di toko Star Seller kategori Fashion.',
        inputValues: {
          'Harga Jual': 'Rp 120.000',
          'Seller Tier': 'Star Seller',
          'Kategori': 'Fashion (Kategori B)',
          'Program': 'Gratis Ongkir Xtra Aktif',
          'HPP': 'Rp 60.000',
          'Packing': 'Rp 3.000',
        },
        calculationFlow: [
          'Pendapatan Kotor: Rp 120.000',
          'Potongan Fee Admin Shopee (6.0%): -Rp 7.200',
          'Potongan Program Gratis Ongkir Xtra (4.5%, cap Rp 10.000): -Rp 5.400',
          'Biaya Pemrosesan/Layanan Transaksi: -Rp 1.000',
          'Pajak PPh Final UMKM (0.5%): -Rp 600',
          'Biaya Pokok (HPP): -Rp 60.000',
          'Biaya Packing: -Rp 3.000',
          'Total Bersih (True Profit): Rp 42.800 (Margin 35.7%)',
        ],
        finalResult: 'Laba Bersih Riil: Rp 42.800 per unit penjualan dengan margin 35.7%.',
        explanation: 'Engine mengurai setiap beban secara transparan sehingga tidak ada biaya siluman yang terlewat.',
      },
      howToReadResults: [
        {
          metric: 'True Net Profit (Rp)',
          meaning: 'Uang bersih yang benar-benar tersisa di rekening bank kamu setelah semua pihak (Shopee, supplier HPP, kurir packing, dan kas negara) dibayar.',
          actionGuide: 'Jika angka ini negatif atau di bawah target, segera ubah harga atau kurangi beban program.',
        },
        {
          metric: 'Net Margin (%)',
          meaning: 'Persentase laba bersih terhadap omzet kotor. Standar sehat e-commerce berkisar 15% - 30%.',
          actionGuide: 'Gunakan sebagai tolok ukur efisiensi saat membandingkan antar SKU.',
        },
        {
          metric: 'Audit Trail Waterfall',
          meaning: 'Daftar runut setiap komponen biaya dari omzet kotor hingga laba bersih.',
          actionGuide: 'Periksa baris mana yang memakan porsi terbesar (apakah HPP, Ads, atau Fee Shopee).',
        },
      ],
      tips: [
        'Selalu cek tanggal efektif transaksi untuk mengantisipasi perubahan skema komisi resmi Shopee.',
        'Gunakan fitur Salin Audit jika kamu ingin mendiskusikan rincian biaya dengan tim keuangan toko.',
      ],
      commonMistakes: [
        'Mengira potongan Shopee hanya biaya administrasi 6%: Padahal masih ada biaya Gratis Ongkir Xtra (3-5%), biaya penanganan, dan pajak.',
        'Menghitung persentase laba dari HPP (Markup) bukan dari Omzet (Margin): Ini menimbulkan ilusi untung besar padahal tergerus fee.',
      ],
    },
  },
  {
    id: 'fee-scenarios',
    featureViewId: 'fee-scenarios',
    title: 'Fee Scenario Simulator',
    badge: 'SIMULASI',
    badgeColor: 'bg-indigo-600 text-white',
    category: 'Shopee',
    shortSummary:
      'Bandingkan dampak finansial jika toko naik kelas dari Non-Star menjadi Star, Star+, atau Shopee Mall, serta simulasi keikutsertaan program promosi.',
    readTimeMinutes: 3,
    difficulty: 'Menengah',
    keywords: [
      'fee scenario',
      'simulasi shopee mall',
      'perbandingan star seller',
      'gratis ongkir xtra untung rugi',
      'kenaikan fee shopee',
    ],
    commonProblemsSolved: [
      'Ragu apakah ikut program Gratis Ongkir Xtra menguntungkan atau malah bikin rugi',
      'Ingin tahu berapa penambahan fee jika toko beralih ke Shopee Mall',
    ],
    content: {
      functionality:
        'Fitur ini menyajikan perbandingan berdampingan (side-by-side) antara 2 hingga 4 skenario status seller dan program Shopee. Kamu bisa melihat langsung perbedaan nominal potongan dan laba bersih tanpa harus mengubah pengaturan toko.',
      whenToUse:
        'Gunakan ketika mendapat tawaran bergabung ke program Gratis Ongkir Xtra, saat mempertimbangkan undangan menjadi Shopee Mall, atau saat mengevaluasi apakah efisiensi biaya lebih baik jika keluar dari program tertentu.',
      requiredInputs: [
        {
          name: 'Harga Jual Standar',
          description: 'Harga rata-rata barang yang ingin disimulasikan.',
          example: 'Rp 150.000',
        },
        {
          name: 'Pilihan Skenario A & B',
          description: 'Skenario status toko (misal Skenario A: Star Seller, Skenario B: Shopee Mall).',
          example: 'Star Seller vs Shopee Mall',
        },
      ],
      steps: [
        '1. Buka menu "Fee Scenario Simulator".',
        '2. Tentukan harga produk referensi.',
        '3. Atur konfigurasi Skenario 1 (misal: Star Seller tanpa program Xtra).',
        '4. Atur konfigurasi Skenario 2 (misal: Star Seller dengan Gratis Ongkir Xtra).',
        '5. Bandingkan kolom Delta: ASIS menampilkan perbedaan laba per produk dan kenaikan volume penjualan yang dibutuhkan untuk menutup selisih fee.',
      ],
      example: {
        scenario: 'Produk seharga Rp 100.000 ingin ikut program Gratis Ongkir Xtra (fee tambahan 4%).',
        inputValues: {
          'Harga Jual': 'Rp 100.000',
          'Skenario 1 (Tanpa Xtra)': 'Fee 6.5% = Rp 6.500 | Profit = Rp 33.500',
          'Skenario 2 (Dengan Xtra)': 'Fee 10.5% = Rp 10.500 | Profit = Rp 29.500',
        },
        calculationFlow: [
          'Selisih fee per unit: Rp 4.000',
          'Laba turun dari Rp 33.500 ke Rp 29.500 (-11.9%)',
          'Kebutuhan kenaikan volume penjualan agar total profit sama: +13.6% order',
        ],
        finalResult: 'Jika program Xtra mampu menaikkan order lebih dari 14%, maka program ini layak diambil.',
        explanation: 'Simulator menghitung break-even volume order sehingga keputusan bisnismu berbasis data riil.',
      },
      howToReadResults: [
        {
          metric: 'Volume Break-Even Growth',
          meaning: 'Berapa persen order tambahan yang wajib dicapai agar penurunan profit per unit tertutupi oleh total keuntungan.',
          actionGuide: 'Jika tren campaign mampu melipatgandakan order 2x lipat, program sangat direkomendasikan.',
        },
      ],
      tips: [
        'Ingat program Xtra memiliki batas biaya maksimal (cap fee), sehingga untuk barang berharga tinggi persentase fee efektifnya mengecil.',
      ],
      commonMistakes: [
        'Hanya melihat penurunan margin per unit tanpa menghitung efek pelipatgandaan omzet yang dibawa oleh badge Gratis Ongkir Xtra.',
      ],
    },
  },
  {
    id: 'bulk-pricing',
    featureViewId: 'bulk-pricing',
    title: 'Bulk Pricing Calculator',
    badge: 'PRO',
    badgeColor: 'bg-blue-500 text-white',
    category: 'Kalkulator',
    shortSummary:
      'Kalkulasi harga jual massal untuk puluhan hingga ratusan SKU sekaligus berdasarkan target profit atau margin seragam.',
    readTimeMinutes: 4,
    difficulty: 'Menengah',
    keywords: [
      'bulk pricing',
      'harga massal',
      'banyak sku',
      'kalkulasi katalog',
      'ekspor harga shopee',
    ],
    commonProblemsSolved: [
      'Pusing menghitung harga satu per satu karena memiliki katalog ratusan produk',
      'Kenaikan fee Shopee mengharuskan revisi harga untuk seluruh toko secara cepat',
    ],
    content: {
      functionality:
        'Bulk Pricing Calculator memungkinkan seller menghitung harga jual optimal untuk banyak produk sekaligus dalam satu tabel interaktif. Fitur ini terhubung ke True Profit Engine sehingga setiap baris SKU mendapatkan kalkulasi akurat sesuai kategorinya.',
      whenToUse:
        'Gunakan ketika toko baru mengimpor katalog dari supplier, saat terjadi perubahan tarif admin Shopee, atau saat ingin menerapkan strategi margin seragam untuk satu etalase produk.',
      requiredInputs: [
        {
          name: 'Daftar SKU & HPP',
          description: 'Nama produk, kode SKU, dan modal bersih masing-masing barang.',
          example: 'SKU-01 (HPP Rp 30.000), SKU-02 (HPP Rp 45.000)',
        },
        {
          name: 'Target Margin Global / Per Baris',
          description: 'Persentase margin laba bersih yang diinginkan untuk seluruh SKU atau spesifik per baris.',
          example: 'Target Margin: 25%',
        },
      ],
      steps: [
        '1. Buka menu "Bulk Pricing Calculator".',
        '2. Pilih toko dan kategori default.',
        '3. Masukkan target margin atau target profit yang diinginkan.',
        '4. Tambahkan produk dari inventaris toko atau impor lewat CSV.',
        '5. Klik "Hitung Semua": Kolom harga rekomendasi akan terisi seketika.',
        '6. Ekspor hasil kalkulasi ke format Excel/CSV untuk diunggah massal ke Shopee Seller Centre.',
      ],
      example: {
        scenario: 'Toko aksesoris memiliki 15 SKU dengan variasi HPP dari Rp 15.000 hingga Rp 80.000.',
        inputValues: {
          'Target Margin Bersih': '30%',
          'Status Toko': 'Star Seller',
          'Biaya Packing Standar': 'Rp 2.000',
        },
        calculationFlow: [
          'Engine memproses setiap baris secara independen.',
          'SKU A (HPP 20k) -> Rekomendasi Harga Jual: Rp 36.500',
          'SKU B (HPP 50k) -> Rekomendasi Harga Jual: Rp 88.000',
          'Semua produk menghasilkan margin bersih tepat 30%.',
        ],
        finalResult: 'Rekomendasi harga jual untuk seluruh katalog selesai dalam hitungan detik.',
        explanation: 'Tidak ada lagi risiko salah ketik atau salah rumus saat mengelola ratusan produk.',
      },
      howToReadResults: [
        {
          metric: 'Rekomendasi Harga Jual',
          meaning: 'Harga pasang yang disarankan agar target margin tercapai setelah dikurangi fee Shopee dan pajak.',
          actionGuide: 'Gunakan tombol ekspor untuk mempermudah update harga massal di Seller Centre.',
        },
      ],
      tips: [
        'Gunakan fitur pembulatan ke ratusan atau ribuan terdekat (misal Rp 49.900) untuk tampilan harga psikologis yang lebih menarik bagi pembeli.',
      ],
      commonMistakes: [
        'Menyamaratakan persentase markup tanpa memperhitungkan batas fee maksimal (cap) pada program tertentu.',
      ],
    },
  },
  {
    id: 'admin-fee-rules',
    featureViewId: 'admin-fee-rules',
    title: 'Aturan Fee Shopee',
    badge: 'AUDIT',
    badgeColor: 'bg-amber-500 text-slate-950 font-bold',
    category: 'Shopee',
    shortSummary:
      'Referensi dan audit tabel komisi resmi Shopee Indonesia: pembagian Kategori A/B/C/D/E, batas maksimal program Xtra, dan tanggal efektif peraturan.',
    readTimeMinutes: 3,
    difficulty: 'Pemula',
    keywords: [
      'fee shopee',
      'kategori a b c d e',
      'tabel biaya admin',
      'komisi shopee',
      'biaya penanganan',
    ],
    commonProblemsSolved: [
      'Tidak tahu produk saya masuk Kategori A, B, C, D, atau E di Shopee',
      'Kaget saat melihat potongan fee naik tanpa tahu dasar peraturannya',
    ],
    content: {
      functionality:
        'Halaman Aturan Fee Shopee menyajikan transparansi seluruh aturan basis data (rulesData) yang dipakai oleh True Profit Engine. Semua tarif, cap maksimal program, dan skema tier seller ditampilkan secara jujur tanpa angka yang disembunyikan.',
      whenToUse:
        'Gunakan sebagai rujukan ketika Shopee mengumumkan perubahan skema fee, saat ingin memverifikasi potongan di invoice penarikan dana, atau saat memeriksa kategori produk.',
      requiredInputs: [
        {
          name: 'Pencarian Kategori',
          description: 'Ketik nama barang untuk melihat ke kelompok kategori mana barang tersebut digolongkan oleh Shopee.',
          example: 'Baju muslim, casing hp, camilan',
        },
      ],
      steps: [
        '1. Masuk ke menu "Aturan Fee Shopee".',
        '2. Pilih tab Status Seller (Non-Star, Star, Star+, Mall).',
        '3. Gunakan filter pencarian untuk menemukan kategori produkmu.',
        '4. Periksa persentase Biaya Admin, Biaya Layanan, dan Program Xtra.',
      ],
      example: {
        scenario: 'Pengecekan biaya untuk produk Fashion Muslim di toko Star Seller.',
        inputValues: {
          'Kategori': 'Fashion (Kategori B)',
          'Status Toko': 'Star Seller',
        },
        calculationFlow: [
          'Biaya Administrasi: 6.0%',
          'Program Gratis Ongkir Xtra: 4.5% (Maksimal Rp 10.000 / kuantitas)',
          'Biaya Pemrosesan Transaksi: Rp 1.000 / pesanan',
        ],
        finalResult: 'Total estimasi potongan marketplace dapat diprediksi dengan tepat.',
        explanation: 'Semua aturan terintegrasi langsung ke sistem kalkulator ASIS.',
      },
      howToReadResults: [
        {
          metric: 'Biaya Administrasi (%)',
          meaning: 'Potongan dasar platform berdasarkan kategori produk.',
          actionGuide: 'Pastikan produkmu masuk di kategori yang paling tepat agar tidak terkena fee kategori yang lebih mahal.',
        },
      ],
      tips: [
        'Perhatikan tanggal efektif aturan: ASIS secara otomatis menerapkan skema fee terbaru sesuai regulasi resmi.',
      ],
      commonMistakes: [
        'Memasukkan produk ke kategori yang salah di Shopee sehingga terkena potongan komisi yang lebih tinggi dari yang seharusnya.',
      ],
    },
  },
];
