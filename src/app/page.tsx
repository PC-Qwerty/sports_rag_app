"use client"

import { useState } from "react"
import { Header } from "./components/header"
import { ChatArea } from "./components/chat-area"
import { InputArea } from "./components/input-area"
import { BodyDescription } from "./components/body-description"

export default function Home() {
  // const [url, setUrl] = useState("")
  // const [chatStarted, setChatStarted] = useState(false)

  // const handleUrlSubmit = (submittedUrl: string) => {
  //   setUrl(submittedUrl)
  //   setChatStarted(true)
  // }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        {/* {!chatStarted ? (
          <>
            <BodyDescription />
            <InputArea onUrlSubmit={handleUrlSubmit} />
          </>
        ) : (
          <ChatArea url={url} />
        )} */}
        <ChatArea />
      </main>
    </div>
  )
}

