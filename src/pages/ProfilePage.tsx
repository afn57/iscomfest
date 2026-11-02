import { PageHeader } from '../components/common'
import { ProfileHeader } from '../components/profile/ProfileHeader'
import { ProfileStats } from '../components/profile/ProfileStats'
import { ProfileCustomizer } from '../components/profile/ProfileCustomizer'
import { ShowcasePicker } from '../components/profile/ShowcasePicker'

export function ProfilePage() {
  return (
    <>
      <PageHeader
        title="Profile"
        description="Tampilan, statistik, dan showcase achievement milikmu."
        crumbs={[{ label: 'FOCUSLY', to: '/dashboard' }, { label: 'Profile' }]}
      />

      <div className="space-y-4 sm:space-y-5">
        <ProfileHeader />
        <ProfileStats />
        <ProfileCustomizer />
        <ShowcasePicker />
      </div>
    </>
  )
}
