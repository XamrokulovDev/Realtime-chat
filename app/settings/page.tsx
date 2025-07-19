import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      <Card className="w-full max-w-md bg-zinc-900 border-zinc-800">
        <CardHeader className="space-y-5 text-center">
          <CardTitle className="text-3xl">Sozlamalar</CardTitle>
          <CardDescription className="text-zinc-400">Funksionallik keyinroq qo'shiladi.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <Link href="/global">
              <Button variant="outline" className="text-blue-500 border-blue-500 hover:bg-blue-900 bg-transparent">
                Global chatga qaytish
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}