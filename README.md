# FlowState

**Find Your Flow. Own Your Time.**

FlowState adalah aplikasi produktivitas untuk membantu pelajar dan mahasiswa mengelola tugas, merencanakan waktu, dan membangun kebiasaan fokus. Aplikasi menyatukan daftar tugas, kalender, sesi fokus, pengingat, dan pelacakan progres dalam satu antarmuka.

> Proyek ini merupakan aplikasi frontend. Data disimpan secara lokal di browser; belum ada backend atau sinkronisasi antarperangkat.

## Fitur utama

- **Dashboard produktivitas** — ringkasan tugas hari ini, progres target harian, grafik produktivitas, aktivitas terbaru, serta deadline mendatang dan peringatan tugas yang terlambat.
- **Manajemen tugas** — buat dan ubah tugas, atur prioritas, status, estimasi waktu, dan deadline; kelompokkan tugas ke dalam folder; cari, filter, dan tampilkan tugas sebagai daftar atau grid.
- **Kalender terpadu** — lihat tugas, acara, sesi fokus, dan Rest Day dalam tampilan bulanan, mingguan, atau harian. Jadwal dapat ditambahkan dan dikelola dari kalender.
- **Focus Mode** — jalankan sesi fokus dengan durasi dan opsi Do Not Disturb, pilih situs yang ingin dihindari, atur sesi terjadwal, dan tinjau riwayat fokus.
- **Focus Lock dengan ekstensi browser** — ekstensi opsional untuk browser berbasis Chromium dapat menampilkan layar blokir pada domain yang dipilih selama sesi fokus aktif. Tanpa ekstensi, Focus Lock hanya berfungsi sebagai simulasi di antarmuka aplikasi.
- **Pengingat** — atur kategori pengingat untuk deadline, tugas terlambat, jadwal fokus, streak, dan ringkasan harian. Pengingat dalam versi ini disimulasikan secara lokal.
- **Progres dan gamifikasi** — pantau streak, target harian, riwayat aktivitas, heatmap fokus, statistik profil, serta jadwalkan Rest Day untuk membantu menjaga ritme.
- **Preferensi dan pengelolaan data** — pilih tema terang atau gelap, sesuaikan preferensi fokus, ekspor atau pulihkan cadangan JSON, dan reset data lokal.
- **Tampilan responsif** — antarmuka dirancang agar dapat digunakan pada layar desktop maupun perangkat seluler.

## Teknologi

- React 19 dan JavaScript
- Vite
- Tailwind CSS
- Zustand untuk state dan persistensi lokal
- React Router untuk navigasi
- Recharts untuk grafik
- Lucide React untuk ikon

## Menjalankan proyek

Pastikan Node.js dan npm tersedia, lalu jalankan:

```bash
npm install
npm run dev
```

Buka alamat yang ditampilkan Vite, biasanya `http://localhost:5173`.

Perintah lain yang tersedia:

```bash
npm run build      # membuat build produksi di dist/
npm run preview    # melihat build produksi secara lokal
npm run lint       # menjalankan Oxlint
```

## Memasang ekstensi Focus Lock (opsional)

Ekstensi tersedia di folder `extension/` dan menggunakan Manifest V3. Untuk memuatnya di browser berbasis Chromium:

1. Buka `chrome://extensions` (atau halaman ekstensi yang setara).
2. Aktifkan **Developer mode / Mode developer**.
3. Pilih **Load unpacked**, lalu pilih folder `extension/` pada proyek ini.
4. Buka atau muat ulang FlowState. Saat ekstensi terhubung, status Focus Lock akan menunjukkan bahwa penguncian nyata tersedia.
5. Di **Focus Mode**, pilih domain yang ingin dibatasi dan mulai sesi. Ekstensi akan menampilkan layar blokir untuk domain tersebut sampai sesi selesai atau waktunya habis.

Ekstensi membatasi situs web di browser, bukan aplikasi desktop. Izin ekstensi dan dukungan browser menentukan apakah pemblokiran dapat berjalan. Jika ekstensi tidak dipasang atau tidak terhubung, sesi fokus tetap dapat digunakan sebagai fitur pencatatan dan simulasi di aplikasi.

## Data dan privasi

Data aplikasi disimpan di `localStorage` browser pada perangkat yang digunakan. Versi ini tidak memakai server, akun pengguna, atau sinkronisasi cloud. Menghapus data situs dari browser dapat menghapus progres lokal; gunakan **Settings → Data & penyimpanan → Ekspor cadangan** untuk menyimpan file JSON. Cadangan dapat dipulihkan melalui menu yang sama.

## Struktur proyek

```text
src/
├── components/   # komponen UI per fitur
├── data/         # data awal/demo
├── hooks/        # hook React
├── pages/        # halaman aplikasi
├── services/     # logika fitur dan selector data
├── store/        # state aplikasi dengan Zustand
└── utils/        # fungsi utilitas
extension/        # ekstensi browser Focus Lock
public/           # aset statis
```
