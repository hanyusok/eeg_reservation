"use client"

import {
  MapPin,
  Clock,
  Users,
  FileText,
  Phone,
  Mail,
  Building2,
} from "lucide-react"

export default function CenterInformation() {
  return (
    <div className="space-y-6">
      {/* Location Section */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="rounded-full bg-primary/10 p-2">
            <MapPin className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">Location</h2>
        </div>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Address
            </p>
            <p className="text-lg">
              서울특별시 강남구 테헤란로 123
              <br />
              EEG Monitoring Center, 3층
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone
              </p>
              <p className="text-sm">02-1234-5678</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </p>
              <p className="text-sm">eeg-center@hospital.com</p>
            </div>
          </div>
          <div className="mt-4 p-4 bg-muted/50 rounded-md">
            <p className="text-sm text-muted-foreground">
              <strong>대중교통 이용:</strong> 지하철 2호선 강남역 3번 출구에서 도보 5분
              <br />
              <strong>주차:</strong> 건물 지하 주차장 이용 가능 (검사 시간 동안 무료)
            </p>
          </div>
        </div>
      </div>

      {/* Operating Hours Section */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="rounded-full bg-primary/10 p-2">
            <Clock className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">Operating Hours</h2>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b">
            <span className="font-medium">Monday - Friday</span>
            <span className="text-muted-foreground">09:00 - 18:00</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span className="font-medium">Saturday</span>
            <span className="text-muted-foreground">09:00 - 13:00</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span className="font-medium">Sunday & Holidays</span>
            <span className="text-muted-foreground">Closed</span>
          </div>
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-md">
            <p className="text-sm">
              <strong>Emergency Appointments:</strong> 긴급한 경우 24시간 연락 가능
              <br />
              <span className="text-muted-foreground">
                Emergency Hotline: 02-1234-5678 (24/7)
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Staff Section */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="rounded-full bg-primary/10 p-2">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">Our Staff</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 border rounded-md">
            <h3 className="font-semibold mb-1">Dr. 김신경</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Chief Neurologist
            </p>
            <p className="text-sm">
              소아 신경과 전문의, 20년 이상의 경력
            </p>
          </div>
          <div className="p-4 border rounded-md">
            <h3 className="font-semibold mb-1">Dr. 이뇌파</h3>
            <p className="text-sm text-muted-foreground mb-2">
              EEG Specialist
            </p>
            <p className="text-sm">
              뇌파 검사 전문의, 소아 뇌전증 진단 전문
            </p>
          </div>
          <div className="p-4 border rounded-md">
            <h3 className="font-semibold mb-1">박기술사</h3>
            <p className="text-sm text-muted-foreground mb-2">
              EEG Technologist
            </p>
            <p className="text-sm">
              뇌파 검사 기술사, 10년 이상의 경력
            </p>
          </div>
          <div className="p-4 border rounded-md">
            <h3 className="font-semibold mb-1">최간호사</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Registered Nurse
            </p>
            <p className="text-sm">
              소아 간호 전문가, 환자 케어 전문
            </p>
          </div>
        </div>
      </div>

      {/* EEG Preparation Instructions Section */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="rounded-full bg-primary/10 p-2">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">EEG 검사 준비사항</h2>
        </div>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2 text-lg">검사 전 준비사항</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>
                  <strong>머리 씻기:</strong> 검사 전날 밤에 머리를 깨끗이 감고,
                  헤어 제품(스프레이, 젤, 왁스 등)을 사용하지 마세요.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>
                  <strong>수면 부족:</strong> 검사 전날 밤에는 평소보다 2-3시간
                  적게 주무세요. (의사의 지시에 따라 다를 수 있습니다)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>
                  <strong>약물 복용:</strong> 평소 복용 중인 약물은 의사와 상의 후
                  복용 여부를 결정하세요. 약물 중단이 필요한 경우 의사가 미리
                  안내합니다.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>
                  <strong>식사:</strong> 검사 당일 정상적으로 식사하셔도 됩니다.
                  단, 카페인 음료는 검사 4시간 전부터 피해주세요.
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2 text-lg">검사 당일 준비사항</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>
                  <strong>의복:</strong> 편안한 옷을 입으시고, 상의는 앞단추나
                  지퍼가 있는 것이 좋습니다.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>
                  <strong>소지품:</strong> 검사 중 움직임이 제한될 수 있으므로,
                  필요한 소지품만 가져오세요.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>
                  <strong>동반자:</strong> 소아 환자의 경우 보호자 동반이
                  필수입니다.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>
                  <strong>도착 시간:</strong> 예약 시간보다 15분 일찍 도착하여
                  준비 시간을 확보하세요.
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2 text-lg">검사 중 주의사항</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>
                  검사 중에는 가능한 한 움직이지 않도록 주의하세요.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>
                  깜빡이는 빛이나 특정 자극에 대한 검사가 포함될 수 있습니다.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>
                  검사 시간은 보통 1-2시간 정도 소요됩니다.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>
                  검사 후 전극 부착 자국이 남을 수 있으나, 하루 정도 지나면
                  사라집니다.
                </span>
              </li>
            </ul>
          </div>

          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-md border border-yellow-200 dark:border-yellow-900">
            <p className="text-sm font-semibold mb-1">⚠️ 중요 안내</p>
            <p className="text-sm">
              검사 전에 열이 나거나 감기 증상이 있으시면 미리 연락해 주세요.
              검사 일정 조정이 필요할 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
