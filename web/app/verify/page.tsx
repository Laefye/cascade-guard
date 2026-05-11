import Image from "next/image";
import { ComponentWithCaptcha } from "./captcha";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center">
      <ComponentWithCaptcha />
    </main>
  );
}
