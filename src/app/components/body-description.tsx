import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function BodyDescription() {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Welcome to AI Chatbot SaaS</CardTitle>
        <CardDescription>Your intelligent companion for website analysis</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          This AI-powered chatbot allows you to have interactive conversations about any website. Simply enter a URL,
          and our AI will analyze the content, providing insights and answering your questions about the site. Whether
          you&apos;re researching competitors, exploring new markets, or just curious about a website&apos;s content, our chatbot
          is here to help.
        </p>
      </CardContent>
    </Card>
  )
}

