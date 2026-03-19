import type { Metadata } from "next";
import { DM_Sans, Space_Mono, Newsreader, Work_Sans } from "next/font/google";
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
const newsreader = Newsreader({
	subsets: ["latin"],
	variable: "--font-headline",
	style: ["normal", "italic"],
});
const workSans = Work_Sans({
	subsets: ["latin"],
	weight: ["300", "400", "500", "600", "700"],
	variable: "--font-body",
});

export const metadata: Metadata = {
	title: "ReachOut | Crisis care, simplified.",
	description: "Real-time disaster response coordination",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<head>
				<link
					href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
					rel="stylesheet"
				/>
			</head>
			<body
				className={cn(
					"min-h-screen bg-background font-sans antialiased",
					dmSans.variable,
					spaceMono.variable,
					newsreader.variable,
					workSans.variable,
				)}
			>
				<Providers>{children}</Providers>
				<Toaster richColors />
			</body>
		</html>
	);
}
