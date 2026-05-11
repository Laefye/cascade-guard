import { Suspense } from "react";
import { ComponentWithCaptcha } from "./captcha";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center">
      <Suspense fallback={<div>Думаем...</div>}>
        <ComponentWithCaptcha />
      </Suspense>
    </main>
  );
}
