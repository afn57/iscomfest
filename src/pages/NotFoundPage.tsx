import { Link } from 'react-router-dom'
import { Button, EmptyState } from '../components/common'

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <EmptyState
        icon={<span className="font-display text-lg font-bold">404</span>}
        title="Halaman tidak ditemukan"
        description="Halaman yang kamu tuju tidak tersedia di FOCUSLY."
        action={
          <Link to="/dashboard">
            <Button>Kembali ke Dashboard</Button>
          </Link>
        }
      />
    </div>
  )
}
