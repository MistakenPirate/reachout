"use client";

import { useState, useRef, useEffect } from "react";
import { useChatbot, type ChatMessage } from "@/lib/queries/ai";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ChatPanelProps {
	title?: string;
	description?: string;
	emptyMessage?: string;
	emergencyType?: string;
}

export default function ChatPanel({
	title = "AI Emergency Assistant",
	description = "Get guidance on emergency response, first aid, and safety procedures.",
	emptyMessage = "Describe your emergency situation and get immediate guidance.",
	emergencyType,
}: ChatPanelProps) {
	const chatMutation = useChatbot();
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [chatInput, setChatInput] = useState("");
	const chatEndRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	function handleChat(e: React.FormEvent) {
		e.preventDefault();
		if (!chatInput.trim()) return;
		const userMsg: ChatMessage = { role: "user", content: chatInput.trim() };
		const updatedMessages = [...messages, userMsg];
		setMessages(updatedMessages);
		setChatInput("");
		chatMutation.mutate(
			{ messages: updatedMessages, emergencyType },
			{
				onSuccess: (reply) => {
					setMessages((prev) => [...prev, reply]);
				},
			},
		);
	}

	return (
		<div className="pt-4">
			<Card className="flex flex-col" style={{ height: "70vh" }}>
				<CardHeader className="shrink-0">
					<CardTitle>{title}</CardTitle>
					<CardDescription>{description}</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-1 flex-col overflow-hidden">
					<div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1">
						{messages.length === 0 && (
							<p className="text-sm text-muted-foreground text-center py-8">
								{emptyMessage}
							</p>
						)}
						{messages.map((msg, i) => (
							<div
								key={i}
								className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
							>
								<div
									className={`rounded-lg px-3 py-2 max-w-[80%] text-sm ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
								>
									{msg.content}
								</div>
							</div>
						))}
						{chatMutation.isPending && (
							<div className="flex justify-start">
								<div className="rounded-lg px-3 py-2 bg-muted text-sm text-muted-foreground">
									Thinking...
								</div>
							</div>
						)}
						<div ref={chatEndRef} />
					</div>
					<form onSubmit={handleChat} className="flex gap-2 shrink-0">
						<Input
							value={chatInput}
							onChange={(e) => setChatInput(e.target.value)}
							placeholder="Type your message..."
							disabled={chatMutation.isPending}
						/>
						<Button
							type="submit"
							disabled={chatMutation.isPending || !chatInput.trim()}
						>
							Send
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
