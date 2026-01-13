import { BackButton } from "@/components/ui/back-button"
import CenterInformation from "@/components/information/center-information"

export default function InformationPage() {
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <BackButton href="/dashboard" />
        </div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold">EEG 검사 센터 정보</h1>
        </div>
        <p className="text-muted-foreground">
          검사 센터 위치, 근무시간, 직원 정보 및 검사 준비사항을 확인하세요
        </p>
      </div>

      <CenterInformation />
    </div>
  )
}
