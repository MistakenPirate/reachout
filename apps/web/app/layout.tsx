import type { Metadata } from "next";
import { DM_Sans, Space_Mono } from "next/font/google";
import { cn } from "@/lib/utils";
import { Providers } from "@/lib/providers";
import { Toaster } from "sonner";
import "./globals.css";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-sans" });
const spaceMono = Space_Mono({
	weight: ["400", "700"],
	subsets: ["latin"],
	variable: "--font-mono",
});

export const metadata: Metadata = {
	title: "ReachOut",
	description: "Real-time disaster response coordination",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body
				className={cn(
					"min-h-screen bg-background font-sans antialiased",
					dmSans.variable,
					spaceMono.variable,
				)}
			>
				<Providers>{children}</Providers>
				<Toaster richColors />
			</body>
		</html>
	);
}
