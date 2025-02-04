"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bot, User2, ArrowDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";

export interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
}

interface ChatAreaProps {
  url?: string;
}

export function ChatArea({ url }: ChatAreaProps) {
  const name = url || "Sports";
  const [messages, setMessages] = useState<Message[]>([
    {
      id: crypto.randomUUID(),
      text: `Hello! I'm ready to chat about ${name}. What would you like to know?`,
      sender: "ai",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current;
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    if (!scrollArea) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollArea;
      const isScrolledUp = scrollTop < scrollHeight - clientHeight - 100;
      setShowScrollButton(isScrolledUp);
    };

    scrollArea.addEventListener("scroll", handleScroll);
    return () => scrollArea.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() === "" || isLoading) return;

    setIsLoading(true);
    const userMessage: Message = {
      id: crypto.randomUUID(),
      text: input,
      sender: "user",
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          url: url,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from server");
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      // Typing effect
      const aiMessageId = crypto.randomUUID();
      setMessages((prev) => [...prev, { id: aiMessageId, text: "", sender: "ai" }]);

      let currentText = "";
      const words = data.response.split(" ");

      words.forEach((word, index) => {
        setTimeout(() => {
          currentText += word + " ";
          setMessages((prev) =>
            prev.map((msg) => (msg.id === aiMessageId ? { ...msg, text: currentText } : msg))
          );
        }, index * 80); // Adjust delay (80ms per word)
      });

      setTimeout(() => setIsLoading(false), words.length * 80);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), text: "Sorry, I encountered an error. Please try again.", sender: "ai" },
      ]);
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-lg md:text-xl lg:text-2xl">Chat about {name}</CardTitle>
        <CardDescription className="text-center">
          AI-driven chatbot for sports insights, search, and interaction.
        </CardDescription>
      </CardHeader>
      <CardContent className="relative">
        <div className="h-[300px] md:h-[400px] lg:h-[500px] overflow-y-auto pr-4" ref={scrollAreaRef}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"} mb-4`}
            >
              <div className={`flex items-start ${message.sender === "user" ? "flex-row-reverse" : "flex-row"}`}>
                <Avatar className="w-6 h-6 md:w-8 md:h-8">
                  {message.sender === "user" ? (
                    <User2 className="w-6 h-6 object-contain" />
                  ) : (
                    <Bot className="w-6 h-6 object-contain" />
                  )}
                </Avatar>
                <div
                  className={`mx-2 p-2 md:p-3 rounded-lg ${
                    message.sender === "user" ? "bg-primary text-primary-foreground" : "bg-secondary"
                  }`}
                >
                  <p className="text-sm md:text-base whitespace-pre-wrap">{message.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        {showScrollButton && (
          <Button
            variant="outline"
            size="icon"
            className="absolute bottom-20 right-4 rounded-full z-10"
            onClick={scrollToBottom}
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
        )}
        <form onSubmit={handleSendMessage} className="mt-4 flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-grow"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Typing..." : "Send"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
