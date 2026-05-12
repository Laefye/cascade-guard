import { Suspense } from "react";
import { Captcha } from "./captcha";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center">
      <div className="bg-surface rounded-default p-8 box-border max-w-100 w-full flex flex-col gap-6">
        <h1 className="text-2xl font-bold">Верификация</h1>
        <Suspense>
          <Captcha />
        </Suspense>
      </div>
    </main>
  );
}
