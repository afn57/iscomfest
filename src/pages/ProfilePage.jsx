import { PageHeader } from '../components/common';
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { ProfileStats } from '../components/profile/ProfileStats';
export function ProfilePage() {
    return (<>
      <PageHeader title="Profile" description="Statistik dan informasi profil kamu." crumbs={[{ label: 'FOCUSLY', to: '/dashboard' }, { label: 'Profile' }]}/>

      <div className="space-y-4 sm:space-y-5">
        <ProfileHeader />
        <ProfileStats />
      </div>
    </>);
}