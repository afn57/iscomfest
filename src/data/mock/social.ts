import type { CalendarEvent, Post, LeaderboardUser, Reward } from '../../types'
import { addDays } from 'date-fns'
import { dayKey } from '../../utils/date'
import { uid } from '../../utils/id'

/* ------------------------------ Rewards --------------------------- */

export const REWARDS: Reward[] = [
  {
    id: 'rw_theme',
    name: 'Custom Profile Theme',
    description: 'Buka enam opsi aksen profil eksklusif untuk halaman profilmu.',
    cost: 300,
    category: 'theme',
    icon: 'Palette',
  },
  {
    id: 'rw_avatar_1',
    name: 'Exclusive Avatar — Rocket',
    description: 'Avatar beranimasi untuk profil kamu.',
    cost: 450,
    category: 'avatar',
    icon: 'Rocket',
  },
  {
    id: 'rw_avatar_2',
    name: 'Exclusive Avatar — Deep Thinker',
    description: 'Avatar eksklusif bertema fokus dan analisis.',
    cost: 450,
    category: 'avatar',
    icon: 'Brain',
  },
  {
    id: 'rw_badge',
    name: 'Profile Badge — Focus Scholar',
    description: 'Badge yang tampil di samping nama kamu di komunitas.',
    cost: 250,
    category: 'badge',
    icon: 'BadgeCheck',
  },
  {
    id: 'rw_frame',
    name: 'Special Frame — Aurora Ring',
    description: 'Bingkai avatar bercahaya di seluruh halaman.',
    cost: 600,
    category: 'frame',
    icon: 'Aperture',
  },
  {
    id: 'rw_bg_1',
    name: 'Premium Background — Nebula',
    description: 'Latar profil premium dengan nuansa luar angkasa.',
    cost: 500,
    category: 'background',
    icon: 'Sparkles',
  },
  {
    id: 'rw_bg_2',
    name: 'Premium Background — Terminal',
    description: 'Latar bergaya terminal untuk kamu yang suka kode.',
    cost: 400,
    category: 'background',
    icon: 'Type',
  },
  {
    id: 'rw_frame_2',
    name: 'Special Frame — Mint Line',
    description: 'Bingkai tipis berwarna mint untuk tampilan minimalis.',
    cost: 350,
    category: 'frame',
    icon: 'Circle',
  },
]

/* ---------------------------- Leaderboard -------------------------- */

const rawUsers: Array<Omit<LeaderboardUser, 'isSelf'>> = [
  { id: 'u1', displayName: 'Alya Prameswari', username: 'alya.p', avatarId: 'rose', xp: 9_840, focusMinutes: 4_260, streak: 48, dailyScore: 96, isFriend: true },
  { id: 'u2', displayName: 'Rafi Nugraha', username: 'rafi.n', avatarId: 'cyan', xp: 8_720, focusMinutes: 3_980, streak: 31, dailyScore: 92, isFriend: true },
  { id: 'u3', displayName: 'Dimas Aryasatya', username: 'dimas.a', avatarId: 'blue', xp: 12_410, focusMinutes: 5_120, streak: 63, dailyScore: 88, isFriend: false },
  { id: 'u4', displayName: 'Sekar Ayu', username: 'sekar.ayu', avatarId: 'mint', xp: 7_650, focusMinutes: 3_410, streak: 27, dailyScore: 90, isFriend: true },
  { id: 'u5', displayName: 'Bagas Prakoso', username: 'bagas.p', avatarId: 'amber', xp: 6_980, focusMinutes: 2_870, streak: 19, dailyScore: 74, isFriend: false },
  { id: 'u6', displayName: 'Nadia Karina', username: 'nadia.k', avatarId: 'violet', xp: 11_050, focusMinutes: 4_730, streak: 55, dailyScore: 85, isFriend: false },
  { id: 'u7', displayName: 'Yoga Mahendra', username: 'yoga.m', avatarId: 'slate', xp: 5_430, focusMinutes: 2_140, streak: 14, dailyScore: 68, isFriend: true },
  { id: 'u8', displayName: 'Citra Lestari', username: 'citra.l', avatarId: 'rose', xp: 9_120, focusMinutes: 3_640, streak: 36, dailyScore: 81, isFriend: false },
  { id: 'u9', displayName: 'Farhan Maulana', username: 'farhan.m', avatarId: 'blue', xp: 4_870, focusMinutes: 1_980, streak: 11, dailyScore: 62, isFriend: true },
  { id: 'u10', displayName: 'Intan Permata', username: 'intan.p', avatarId: 'mint', xp: 13_760, focusMinutes: 5_480, streak: 71, dailyScore: 94, isFriend: false },
  { id: 'u11', displayName: 'Reza Alfarizi', username: 'reza.a', avatarId: 'amber', xp: 3_940, focusMinutes: 1_620, streak: 8, dailyScore: 55, isFriend: false },
  { id: 'u12', displayName: 'Kayla Ramadhani', username: 'kayla.r', avatarId: 'cyan', xp: 7_210, focusMinutes: 3_050, streak: 23, dailyScore: 77, isFriend: true },
]

export const LEADERBOARD_USERS = rawUsers

export function leaderboardSnapshot(self: {
  displayName: string
  username: string
  avatarId: string
  xp: number
  focusMinutes: number
  streak: number
  dailyScore: number
}): LeaderboardUser[] {
  return [
    ...LEADERBOARD_USERS,
    { ...self, id: 'self', isFriend: true, isSelf: true },
  ]
}

/* ----------------------------- Community --------------------------- */

export interface CommunityAuthor {
  id: string
  displayName: string
  username: string
  avatarId: string
  level: number
}

export const COMMUNITY_AUTHORS: CommunityAuthor[] = [
  { id: 'u1', displayName: 'Alya Prameswari', username: 'alya.p', avatarId: 'rose', level: 24 },
  { id: 'u3', displayName: 'Dimas Aryasatya', username: 'dimas.a', avatarId: 'blue', level: 31 },
  { id: 'u6', displayName: 'Nadia Karina', username: 'nadia.k', avatarId: 'violet', level: 28 },
  { id: 'u8', displayName: 'Citra Lestari', username: 'citra.l', avatarId: 'rose', level: 22 },
  { id: 'u10', displayName: 'Intan Permata', username: 'intan.p', avatarId: 'mint', level: 33 },
  { id: 'self', displayName: 'Nabil Ahmad', username: 'nabil.a', avatarId: 'violet', level: 15 },
]

export const POST_CATEGORIES = [
  'Study Tips',
  'Focus Techniques',
  'Motivation',
  'Resources',
  'Q&A',
  'Wins',
] as const

const now = Date.now()
const hours = (h: number) => new Date(now - h * 3_600_000).toISOString()

export const SEED_POSTS: Post[] = [
  {
    id: 'post_1',
    authorId: 'u1',
    category: 'Focus Techniques',
    title: 'Teknik 2-menit yang menyelamatkan minggu ujian saya',
    body: 'Kalau kamu menunda tugas karena terasa besar, pecah jadi langkah 2 menit dulu. Buka dokumen, tulis judul, satu paragraf. Biasanya momentumnya jalan sendiri setelah itu. Saya pakai ini tiap kali mengerjakan laporan praktikum.',
    at: hours(3),
    likes: 48,
    likedByMe: false,
    shares: 6,
    comments: [
      { id: 'c1', authorId: 'u6', body: 'Saya coba ini minggu lalu dan laporannya kelar sebelum deadline. Works!', at: hours(2) },
      { id: 'c2', authorId: 'u8', body: 'Kuncinya memang jangan mikirin hasilnya dulu, cuma mulai aja.', at: hours(1) },
    ],
  },
  {
    id: 'post_2',
    authorId: 'u3',
    category: 'Study Tips',
    title: 'Cara saya mencatat kuliah tanpa menyalin slide mentah-mentah',
    body: 'Slide hanya jadi kerangka. Saya tulis ulang dengan kalimat sendiri dalam 3 kolom: konsep, contoh, pertanyaan yang masih bingung. Bagian pertanyaan itu yang paling sering muncul di ujian.',
    at: hours(11),
    likes: 92,
    likedByMe: true,
    shares: 14,
    comments: [
      { id: 'c3', authorId: 'u10', body: 'Kolom "pertanyaan" idenya bagus banget. Mulai besok pakai ini.', at: hours(9) },
    ],
  },
  {
    id: 'post_3',
    authorId: 'u6',
    category: 'Motivation',
    title: 'Streak 55 hari: yang saya jaga bukan jumlah jam, tapi jam mulainya',
    body: 'Percobaan saya jatuh tiap kali menargetkan "belajar 6 jam". Yang akhirnya bertahan cuma satu aturan: duduk di meja yang sama setiap jam 7 pagi, walau cuma 25 menit. Konsistensi mengalahkan durasi.',
    at: hours(26),
    likes: 167,
    likedByMe: false,
    shares: 31,
    comments: [
      { id: 'c4', authorId: 'u1', body: 'Setuju. Jam mulai lebih mudah dijaga daripada target durasi.', at: hours(24) },
      { id: 'c5', authorId: 'self', body: 'Ikut terapkan mulai hari ini. Terima kasih sharingnya!', at: hours(20) },
      { id: 'c6', authorId: 'u8', body: 'Sama! Saya juga pakai jadwal tetap, jauh lebih stabil.', at: hours(18) },
    ],
  },
  {
    id: 'post_4',
    authorId: 'u10',
    category: 'Resources',
    title: 'Kumpulan template laporan praktikum yang bisa langsung dipakai',
    body: 'Saya kumpulkan template laporan (Word + LaTeX) untuk fisika, kimia, dan biologi dasar. Silakan pakai, tolong jangan hapus kreditnya. Ada juga checklist sebelum submit yang biasanya menyelamatkan nilai.',
    at: hours(34),
    likes: 214,
    likedByMe: false,
    shares: 58,
    comments: [
      { id: 'c7', authorId: 'u3', body: 'Checklist-nya kepake banget buat laporan saya kemarin.', at: hours(30) },
    ],
  },
  {
    id: 'post_5',
    authorId: 'u8',
    category: 'Wins',
    title: 'Akhirnya lulus mata kuliah Statistika setelah 2 kali mengulang',
    body: 'Dua semester gagal karena saya belajar mendadak. Kali ini saya bagi materi jadi 15 sesi fokus kecil dan kerjakan soal tiap selesai satu sesi. Nilai akhir 87. Terima kasih buat yang sudah sharing strateginya di sini.',
    at: hours(48),
    likes: 302,
    likedByMe: true,
    shares: 22,
    comments: [
      { id: 'c8', authorId: 'u6', body: 'Selamat! Usahanya kelihatan banget.', at: hours(46) },
      { id: 'c9', authorId: 'u10', body: 'Ini bukti konsistensi > durasi. Kerja bagus!', at: hours(44) },
    ],
  },
  {
    id: 'post_6',
    authorId: 'self',
    category: 'Q&A',
    title: 'Ada yang punya cara mengatasi loop YouTube setelah satu sesi fokus?',
    body: 'Sesi fokusnya lancar, tapi begitu break mulai, saya buka YouTube dan hilang 40 menit. Sudah coba restricted apps list tapi masih lewat di HP. Minta sarannya.',
    at: hours(55),
    likes: 37,
    likedByMe: false,
    shares: 3,
    comments: [
      { id: 'c10', authorId: 'u1', body: 'Saya ganti break-nya jadi jalan kelas / ngopi, buka layar sama sekali. Lebih efektif dari sekadar memblokir.', at: hours(53) },
      { id: 'c11', authorId: 'u3', body: 'Tambahkan aturan: HP di luar ruangan selama break. Hambatan fisik itu paling kuat.', at: hours(51) },
    ],
  },
]

/* ----------------------------- Calendar ---------------------------- */

const dk = (offset: number) => dayKey(addDays(new Date(), offset))

export function createSeedEvents(): CalendarEvent[] {
  return [
    {
      id: uid('ev'),
      title: 'Laporan Praktikum Fisika',
      type: 'deadline',
      date: dk(0),
      note: 'Submit sebelum pukul 22.00.',
    },
    {
      id: uid('ev'),
      title: 'Tugas Besar Algoritma — Graph',
      type: 'deadline',
      date: dk(1),
      note: 'Kumpul via portal kelas.',
    },
    {
      id: uid('ev'),
      title: 'Esai Etika AI',
      type: 'deadline',
      date: dk(-1),
      note: 'Terlambat satu hari — segera selesaikan.',
    },
    {
      id: uid('ev'),
      title: 'Rapat Koordinasi Divisi Acara',
      type: 'event',
      date: dk(3),
      startMinute: 19 * 60 + 30,
      endMinute: 21 * 60,
      note: 'Ruang sekretariat.',
    },
    {
      id: uid('ev'),
      title: 'Presentasi Kelompok',
      type: 'deadline',
      date: dk(5),
      startMinute: 10 * 60,
    },
    {
      id: uid('ev'),
      title: 'Focus block — pagi',
      type: 'focus',
      date: dk(0),
      startMinute: 7 * 60,
      endMinute: 7 * 60 + 50,
    },
    {
      id: uid('ev'),
      title: 'Focus block — sore',
      type: 'focus',
      date: dk(1),
      startMinute: 16 * 60,
      endMinute: 16 * 60 + 50,
    },
    {
      id: uid('ev'),
      title: 'Rest Day',
      type: 'rest',
      date: dk(5),
      note: 'Istirahat terjadwal — streak tetap aman.',
    },
    {
      id: uid('ev'),
      title: 'Catatan Kuliah Statistika selesai',
      type: 'completed',
      date: dk(-2),
    },
    {
      id: uid('ev'),
      title: 'Backup foto selesai',
      type: 'completed',
      date: dk(-6),
    },
  ]
}
