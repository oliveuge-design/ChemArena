import { useRouter } from "next/router"
import { useEffect } from "react"
import HomePageLayout from "@/components/home/HomePageLayout"
import HomeContent from "@/components/home/HomeContent"
import useHomeState from "@/hooks/useHomeState"

export default function Home() {
  const router = useRouter()
  const contentProps = useHomeState()

  useEffect(() => {
    const { pin, qr } = router.query

    if (pin && qr === "1") {
      router.push(`/game?pin=${pin}&qr=1`)
    }
  }, [router.query, router])

  return (
    <HomePageLayout onAdminClick={() => router.push("/login")}>
      <HomeContent {...contentProps} />
    </HomePageLayout>
  )
}
