"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Send, Copy, CheckCircle2, AlertCircle } from "lucide-react";

interface BindResponse {
  code: string;
  bot: string;
  expires: number;
}

export function TelegramBindCard() {
  const { data: session } = useSession(); 
  const [bindData, setBindData] = useState<BindResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const isCodeValid = bindData !== null && timeLeft > 0;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const generateCode = async () => {
    if (!session?.user?.email) {
      alert("Please sign in with your Google account first to get a bind code!");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/v1/bot/bind-code?user_email=${encodeURIComponent(session.user.email)}`, {
        method: "GET",
      });
      
      const data = await response.json();
      
      if (data.status === "success") {
        setBindData({
          code: data.bind_code,
          bot: data.bot_username,
          expires: data.expires_in_secs
        });
        setTimeLeft(data.expires_in_secs);
      }
    } catch (error) {
      console.error("Failed to generate bind code", error);
      alert("Failed to generate code. Please check if the backend service is running.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (bindData?.code) {
      navigator.clipboard.writeText(`/bind ${bindData.code}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm max-w-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
            <Send className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Telegram Alert Hub</h3>
            <p className="text-sm text-gray-500">Bind your account for real-time on-chain alerts</p>
          </div>
        </div>
      </div>

      {!session ? (
        <div className="p-4 bg-gray-50 rounded-lg flex items-start gap-3 border border-gray-100">
          <AlertCircle className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
          <p className="text-sm text-gray-500">
            You need to sign in at the top right first to bind this email with the Telegram bot.
          </p>
        </div>
      ) : !isCodeValid ? (
        <button
          onClick={generateCode}
          disabled={isLoading}
          className="w-full py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-400"
        >
          {isLoading ? "Generating..." : "Get Bind Code"}
        </button>
      ) : (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Please send this command to the bot:</p>
              <span className="text-xs font-medium text-orange-500 bg-orange-50 px-2 py-1 rounded-full">
                Valid for {formatTime(timeLeft)}
              </span>
            </div>
            
            <div className="flex items-center justify-between bg-white px-3 py-2 border border-gray-200 rounded-md shadow-sm">
              <code className="text-blue-600 font-mono font-bold text-lg tracking-wider">
                /bind {bindData.code}
              </code>
              <button 
                onClick={copyToClipboard}
                className="p-2 text-gray-400 hover:text-gray-700 transition-colors bg-gray-50 hover:bg-gray-100 rounded-md"
                title="Copy command"
              >
                {copied ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>
          
          <a
            href={`https://t.me/${bindData.bot}`} 
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center py-2.5 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition-colors border border-blue-100"
          >
            Open Telegram to Bind →
          </a>
        </div>
      )}
    </div>
  );
}