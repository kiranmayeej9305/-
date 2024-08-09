// pages/embed/[chatbotId].tsx

import { useState } from 'react';
import { useRouter } from 'next/router';
import { CopyIcon, CheckIcon, ExternalLink } from 'lucide-react';
import BlurPage from '@/components/global/blur-page';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const EmbedPage = ({ chatbotId }) => {
  const iframeCode = `<iframe src="https://www.yourdomain.com/chatbot-iframe/${chatbotId}" width="100%" style="height: 100%; min-height: 700px" frameborder="0"></iframe>`;
  const scriptTag = `<script>window.embeddedChatbotConfig = { chatbotId: "${chatbotId}", domain: "www.yourdomain.com" }</script><script src="https://www.yourdomain.com/embed.min.js" defer></script>`;
  const shareLink = `https://www.yourdomain.com/chatbot-iframe/${chatbotId}`;

  const [copiedIframe, setCopiedIframe] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedShareLink, setCopiedShareLink] = useState(false);

  const copyToClipboard = (text, setCopied) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <BlurPage>
      <div className="flex flex-col justify-center items-center px-4 py-8">
        <div className="w-full max-w-[800px]">
          <Card className="border-none">
            <CardHeader>
              <CardTitle>Embed Your Chatbot</CardTitle>
              <CardDescription>Add the chatbot to your website using the iframe code or the chat bubble script tag.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <div>
                <h3 className="text-lg font-semibold">Iframe Code</h3>
                <Separator className="my-2" />
                <p className="mb-2">To add the chatbot anywhere on your website, add this iframe to your HTML code:</p>
                <div className="relative bg-muted p-4 rounded-md">
                  <code className="block whitespace-pre-wrap">{iframeCode}</code>
                  <Button variant="outline" size="icon" className="absolute top-2 right-2" onClick={() => copyToClipboard(iframeCode, setCopiedIframe)}>
                    {copiedIframe ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
                  </Button>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Chat Bubble Script Tag</h3>
                <Separator className="my-2" />
                <p className="mb-2">To add a chat bubble to the bottom right of your website, add this script tag to your HTML:</p>
                <div className="relative bg-muted p-4 rounded-md">
                  <code className="block whitespace-pre-wrap">{scriptTag}</code>
                  <Button variant="outline" size="icon" className="absolute top-2 right-2" onClick={() => copyToClipboard(scriptTag, setCopiedScript)}>
                    {copiedScript ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
                  </Button>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Share Link</h3>
                <Separator className="my-2" />
                <p className="mb-2">Use this link to share your chatbot with others:</p>
                <div className="relative bg-muted p-4 rounded-md">
                  <code className="block whitespace-pre-wrap">{shareLink}</code>
                  <Button variant="outline" size="icon" className="absolute top-2 right-2" onClick={() => copyToClipboard(shareLink, setCopiedShareLink)}>
                    {copiedShareLink ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
                  </Button>
                </div>
              </div>
              <div className="flex justify-between items-center mt-6">
                <Button asChild variant="link">
                  <a href={`https://www.yourdomain.com/chatbot-iframe/${chatbotId}`} target="_blank" rel="noopener noreferrer">
                    <ExternalLink size={16} className="mr-2" />
                    Visit Chatbot
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </BlurPage>
  );
};

export default EmbedPage;
