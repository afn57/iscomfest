import { addDays } from 'date-fns';
import { dayKey } from '../../utils/date';
import { uid } from '../../utils/id';
const dk = (offset) => dayKey(addDays(new Date(), offset));
export function createSeedEvents() {
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
    ];
}