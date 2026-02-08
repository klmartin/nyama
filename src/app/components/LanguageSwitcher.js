"use client";
import { usePathname, useRouter } from "next/navigation";

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();

  function switchLang(lang) {
    const newPath = `/${lang}${pathname.substring(3)}`;
    router.push(newPath);
  }

  return (
    <select
      onChange={(e) => switchLang(e.target.value)}
      className="border p-2 rounded"
    >
      <option value="en">English</option>
      <option value="sw">Swahili</option>
    </select>
  );
}
