import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import ScreeningFlow from '@/Components/ScreeningFlow'

export default async function ScreeningPage() {
  const { userId } = await auth()
  if (!userId) {
    redirect('/')
  }

  return <ScreeningFlow />
}