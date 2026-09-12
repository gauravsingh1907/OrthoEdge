import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import ScreeningFlow from '@/components/ScreeningFlow'

export default async function ScreeningPage() {
  const { userId } = await auth()
  if (!userId) {
    redirect('/')
  }

  return <ScreeningFlow />
}