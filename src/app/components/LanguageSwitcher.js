"use client";
import { usePathname, useRouter } from "next/navigation";

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const currentLang = pathname.startsWith("/sw") ? "sw" : "en";

  function switchLang(lang) {
    if (lang === currentLang) return;
    router.push(`/${lang}${pathname.substring(3)}`);
  }

  return (
    <div className="flex border border-gray-300 rounded-lg overflow-hidden">
      <button
        onClick={() => switchLang("en")}
        className={`px-3 py-2 text-sm flex items-center gap-2
          ${currentLang === "en"
            ? "bg-red-700 text-white"
            : "bg-white text-gray-700 hover:bg-gray-100"}`}
      >
        🇺🇸 EN
      </button>

      <button
        onClick={() => switchLang("sw")}
        className={`px-3 py-2 text-sm flex items-center gap-2
          ${currentLang === "sw"
            ? "bg-red-700 text-white"
            : "bg-white text-gray-700 hover:bg-gray-100"}`}
      >
        🇹🇿 SW
      </button>
    </div>
  );
}
