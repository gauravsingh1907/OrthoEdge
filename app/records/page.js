import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import RecordsList from '@/components/RecordList'

export default async function RecordsPage() {
  const { userId } = await auth()
  if (!userId) {
    redirect('/')
  }

  return <RecordsList />
}