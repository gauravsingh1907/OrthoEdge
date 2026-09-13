import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Result from "@/components/Result";

export default async function RecordDetailPage({ params }) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  const { id } = await params;

  return <Result patientId={Number(id)} />;
}