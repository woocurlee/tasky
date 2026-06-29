import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tasky",
  description: "개인용 할일 관리",
};

// 모바일 대응: 적절한 스케일, 확대 허용
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* 저장된 액센트 테마를 첫 페인트 전에 적용 (FOUC 방지) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var a=localStorage.getItem('tasky:accent');if(a&&a!=='indigo')document.documentElement.dataset.accent=a;}catch(e){}`,
          }}
        />
        {children}
      </body>
    </html>
  );
}
