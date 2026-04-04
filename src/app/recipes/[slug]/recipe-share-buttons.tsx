"use client";

import { useState, useEffect } from "react";
import { FaArrowUpRightFromSquare, FaCopy, FaEnvelope, FaFacebookF, FaLinkedinIn, FaPinterestP, FaShareNodes, FaTelegram, FaViber, FaWhatsapp, FaXTwitter } from "react-icons/fa6";

type RecipeShareButtonsProps = {
  title: string;
  url: string;
  imageUrl: string;
};

type ShareOption = {
  label: string;
  href: string;
  accentClassName: string;
  icon: "facebook" | "x" | "linkedin" | "whatsapp" | "telegram" | "viber" | "pinterest" | "email";
  badgeClassName: string;
};

function shareCardClassName(accentClassName: string) {
  return `group flex min-h-[5.5rem] items-center justify-between gap-4 rounded-[1.25rem] border border-black/8 bg-white/88 px-4 py-3.5 text-left shadow-[0_10px_24px_rgba(56,44,24,0.05)] transition duration-200 ease-out hover:-translate-y-1 hover:border-black/12 hover:bg-white ${accentClassName}`;
}

function SharePlatformIcon({ icon }: { icon: ShareOption["icon"] }) {
  const className = "h-5 w-5";

  if (icon === "facebook") {
    return <FaFacebookF aria-hidden="true" className={className} />;
  }

  if (icon === "x") {
    return <FaXTwitter aria-hidden="true" className={className} />;
  }

  if (icon === "linkedin") {
    return <FaLinkedinIn aria-hidden="true" className={className} />;
  }

  if (icon === "whatsapp") {
    return <FaWhatsapp aria-hidden="true" className={className} />;
  }

  if (icon === "telegram") {
    return <FaTelegram aria-hidden="true" className={className} />;
  }

  if (icon === "viber") {
    return <FaViber aria-hidden="true" className={className} />;
  }

  if (icon === "pinterest") {
    return <FaPinterestP aria-hidden="true" className={className} />;
  }

  return <FaEnvelope aria-hidden="true" className={className} />;
}

export function RecipeShareButtons({ title, url, imageUrl }: RecipeShareButtonsProps) {
  const [copyMessage, setCopyMessage] = useState("");
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    setCanNativeShare(typeof navigator !== "undefined" && "share" in navigator);
  }, []);
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedImage = encodeURIComponent(imageUrl);

  const shareOptions: ShareOption[] = [
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, accentClassName: "hover:shadow-[0_14px_30px_rgba(59,89,152,0.14)]", icon: "facebook", badgeClassName: "bg-[#1877F2] text-white" },
    { label: "X", href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`, accentClassName: "hover:shadow-[0_14px_30px_rgba(24,24,27,0.14)]", icon: "x", badgeClassName: "bg-[#111111] text-white" },
    { label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, accentClassName: "hover:shadow-[0_14px_30px_rgba(10,102,194,0.16)]", icon: "linkedin", badgeClassName: "bg-[#0A66C2] text-white" },
    { label: "WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`, accentClassName: "hover:shadow-[0_14px_30px_rgba(37,211,102,0.16)]", icon: "whatsapp", badgeClassName: "bg-[#25D366] text-white" },
    { label: "Telegram", href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`, accentClassName: "hover:shadow-[0_14px_30px_rgba(34,158,217,0.16)]", icon: "telegram", badgeClassName: "bg-[#229ED9] text-white" },
    { label: "Viber", href: `viber://forward?text=${encodeURIComponent(`${title} ${url}`)}`, accentClassName: "hover:shadow-[0_14px_30px_rgba(115,96,242,0.16)]", icon: "viber", badgeClassName: "bg-[#7360F2] text-white" },
    { label: "Pinterest", href: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&media=${encodedImage}&description=${encodedTitle}`, accentClassName: "hover:shadow-[0_14px_30px_rgba(230,0,35,0.16)]", icon: "pinterest", badgeClassName: "bg-[#E60023] text-white" },
    { label: "Email", href: `mailto:?subject=${encodedTitle}&body=${encodeURIComponent(`Виж тази рецепта: ${url}`)}`, accentClassName: "hover:shadow-[0_14px_30px_rgba(180,83,9,0.14)]", icon: "email", badgeClassName: "bg-stone-800 text-white" },
  ];

  async function copyLink() {
    await navigator.clipboard.writeText(url);
    setCopyMessage("Линкът е копиран.");
    window.setTimeout(() => setCopyMessage(""), 2500);
  }

  async function nativeShare() {
    if (!navigator.share) {
      return;
    }

    await navigator.share({
      title,
      text: title,
      url,
    });
  }

  return (
    <div className="grid gap-6 rounded-[1.9rem] px-6 py-6 sm:px-7 sm:py-7 xl:px-8 xl:py-8 shadow-[0_18px_50px_rgba(56,44,24,0.08)]">
      <div className="flex flex-wrap items-center justify-between gap-4 xl:gap-6">
        <div className="max-w-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-700">Сподели рецептата</p>
        </div>
        {canNativeShare ? (
          <button
            type="button"
            onClick={nativeShare}
            className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-700 shadow-[0_8px_18px_rgba(56,44,24,0.06)] transition duration-200 ease-out hover:-translate-y-0.5 hover:border-stone-300 hover:bg-stone-100"
          >
            <FaShareNodes aria-hidden="true" className="h-[18px] w-[18px]" />
            Сподели
          </button>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
        {shareOptions.map((option) => (
          <a
            key={option.label}
            href={option.href}
            target={option.href.startsWith("mailto:") || option.href.startsWith("viber:") ? undefined : "_blank"}
            rel={option.href.startsWith("mailto:") || option.href.startsWith("viber:") ? undefined : "noreferrer"}
            className={shareCardClassName(option.accentClassName)}
          >
            <span className="flex items-center gap-3">
              <span className={`inline-flex h-11 w-11 items-center justify-center rounded-full p-2.5 shadow-[0_8px_20px_rgba(56,44,24,0.12)] transition duration-200 ease-out group-hover:scale-105 ${option.badgeClassName}`}>
                <SharePlatformIcon icon={option.icon} />
              </span>
              <span className="grid gap-0.5">
                <span className="text-sm font-semibold text-stone-900">{option.label}</span>
                <span className="text-xs uppercase tracking-[0.16em] text-stone-500">Сподели</span>
              </span>
            </span>
            <span className="text-stone-400 transition duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-stone-700">
              <FaArrowUpRightFromSquare aria-hidden="true" className="h-[16px] w-[16px]" />
            </span>
          </a>
        ))}
        <button
          type="button"
          onClick={copyLink}
          className="group flex min-h-[5.5rem] items-center justify-between gap-4 rounded-[1.25rem] border border-stone-200 bg-white px-4 py-3.5 text-left shadow-[0_10px_24px_rgba(56,44,24,0.05)] transition duration-200 ease-out hover:-translate-y-1 hover:border-stone-300 hover:bg-stone-50 hover:shadow-[0_16px_30px_rgba(56,44,24,0.08)] xl:col-span-2 2xl:col-span-1"
        >
          <span className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-amber-200 bg-[linear-gradient(135deg,#fff3e4_0%,#ffe1bd_100%)] p-2.5 text-stone-700 shadow-[0_8px_20px_rgba(56,44,24,0.10)] transition duration-200 ease-out group-hover:scale-105">
              <FaCopy aria-hidden="true" className="h-5 w-5" />
            </span>
            <span className="grid gap-0.5">
              <span className="text-sm font-semibold text-stone-900">Копирай линк</span>
              <span className="text-xs uppercase tracking-[0.16em] text-stone-500">Бърз достъп</span>
            </span>
          </span>
          <span className="text-stone-400 transition duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-stone-700">
            <FaArrowUpRightFromSquare aria-hidden="true" className="h-[16px] w-[16px]" />
          </span>
        </button>
      </div>

      {copyMessage ? (
        <p className="rounded-[1rem] border border-emerald-200 bg-emerald-50 px-5 py-3.5 text-sm font-medium text-emerald-700">{copyMessage}</p>
      ) : null}
    </div>
  );
}