import { SignIn } from "@clerk/nextjs"

function page() {
  return (
    <div className='m-auto'>
      <SignIn/>
    </div>
  )
}

export default page
