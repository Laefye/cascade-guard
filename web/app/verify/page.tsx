import { Suspense } from "react";
import { ComponentWithCaptcha } from "./captcha";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center">
      <div className="bg-surface rounded-default p-8 box-border max-w-100 w-full">
        <Suspense>
          <ComponentWithCaptcha />
        </Suspense>
      </div>
    </main>
  );
}
