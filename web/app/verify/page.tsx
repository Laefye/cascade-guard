import { Suspense } from "react";
import { Captcha } from "./captcha";
import { getVerificationRequest, VerificationRequest } from "@/lib/services/verifications";

export default async function Home({ searchParams }: { searchParams: Promise<{ id: string | string[] | undefined }> }) {
  const params = await searchParams;
  let verificationData: VerificationRequest | null = null;
  if (params.id && typeof params.id === "string") {
    verificationData = await getVerificationRequest(params.id);
  }
  return (
    <main className="min-h-screen flex flex-col items-center justify-center">
      <div className="bg-surface rounded-default p-8 box-border max-w-120 w-full flex flex-col gap-6">
        {!params.id || typeof params.id !== "string" ? (
          <div className="text-center flex flex-col gap-4">
            <h1 className="text-2xl font-bold">Неверная ссылка для верификации</h1>
            <p>Пожалуйста, используйте ссылку, предоставленную ботом в Discord.</p>
          </div>
        ) : (
          verificationData && verificationData.status === "pending" ? (
            <>
              {verificationData.avatarUrl && (
                <img src={verificationData.avatarUrl} alt="User Avatar" className="w-24 h-24 rounded-full mx-auto" />
              )}
              <h1 className="text-2xl font-bold text-center">Привет, {verificationData.userDisplayName}!</h1>
              <p className="text-center">Пожалуйста, подтвердите, что вы не робот, чтобы завершить верификацию.</p>
              <Suspense>
                <Captcha />
              </Suspense>
            </>
          ) : (
            <div className="text-center flex flex-col gap-4">
              <h1 className="text-2xl font-bold">Верификация не найдена</h1>
              <p>Пожалуйста, используйте ссылку, предоставленную ботом в Discord.</p>
            </div>
          )
        )}
        <p className="text-text-muted text-[12px]">
          Мы не сохраняем ваши данные после верификации.<br/>Ни IP, ни Cookies, ни другие персональные данные не собираются.
        </p>
      </div>
    </main>
  );
}
