import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface InputAreaProps {
  onUrlSubmit: (url: string) => void
}

export function InputArea({ onUrlSubmit }: InputAreaProps) {
  const [inputUrl, setInputUrl] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onUrlSubmit(inputUrl)
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Start Chatting with AI</CardTitle>
        <CardDescription>Enter a URL to begin your conversation</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="url"
            placeholder="https://example.com"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            required
            className="w-full"
          />
          <Button type="submit" className="w-full">
            Start Chat
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

