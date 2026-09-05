import Questionnaire from "@/Components/Questionnaire";
import Link from "next/link";
import { UserButton,Show } from "@clerk/nextjs";
export default function Home() {
  return (
    <> 
<Show when="signed-out">

    <Link href = "/login"><h1>login</h1></Link>
  

    <Link href = "/signup"><h1>signup</h1></Link>
</Show>
    <Show when="signed-in">
      <UserButton/>
    <Questionnaire/>
    </Show>
    </>
  );
}
