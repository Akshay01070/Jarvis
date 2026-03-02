"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CoreVisualization from "@/components/CoreVisualization";
import TranscriptDisplay from "@/components/TranscriptDisplay";
import ChatPanel from "@/components/ChatPanel";
import TextInput from "@/components/TextInput";
import useSpeechRecognition from "@/hooks/useSpeechRecognition";
import useTextToSpeech from "@/hooks/useTextToSpeech";
import { sendMessage } from "@/lib/api";

export default function Home() {
  // App status:
  // "idle"       = passive listening for wake word
  // "listening"  = wake word detected, capturing command
  // "processing" = sending to AI
  // "speaking"   = Jarvis speaking (mic paused to avoid echo)
  // "error"      = something went wrong
  const [status, setStatus] = useState("idle");
  const [messages, setMessages] = useState([]);
  const [chatPanelOpen, setChatPanelOpen] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const statusRef = useRef("idle");

  // TTS hook
  const { isSpeaking, speak, stop: stopSpeaking } = useTextToSpeech();

  // Speech recognition hook (declare first, wire up below)
  const {
    isListening,
    transcript,
    interimTranscript,
    isSupported,
    wakeWordDetected,
    startListening,
    stopListening,
    resetState,
    enterConversationMode,
  } = useSpeechRecognition({
    onWakeWord: () => {
      console.log("[PAGE] 🔊 Wake word detected!");
      // If Jarvis is speaking, interrupt him
      if (statusRef.current === "speaking") {
        console.log("[PAGE] ✋ Interrupting TTS");
        stopSpeaking();
      }
      setStatus("listening");
      statusRef.current = "listening";
    },
    onCommand: (command) => {
      handleCommandRef.current?.(command);
    },
    onError: (error) => {
      console.error("[PAGE] Speech error:", error);
      setStatus("error");
      statusRef.current = "error";
      setTimeout(() => {
        setStatus("idle");
        statusRef.current = "idle";
      }, 3000);
    },
  });

  // Use ref for handleCommand to avoid stale closure in onCommand
  const handleCommandRef = useRef(null);

  // Handle incoming command (from voice or text)
  const handleCommand = useCallback(
    async (command) => {
      if (!command.trim()) return;

      console.log("[PAGE] 📤 Sending command:", command);
      setStatus("processing");
      statusRef.current = "processing";
      setCurrentTranscript(command);

      // *** STOP recognition while processing + speaking to prevent echo ***
      stopListening();

      // Add user message
      const userMsg = {
        role: "user",
        content: command,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, userMsg]);

      try {
        const history = messages.slice(-10).map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const data = await sendMessage(command, history);
        console.log("[PAGE] 📥 Got reply:", data.reply?.substring(0, 60));

        const assistantMsg = {
          role: "assistant",
          content: data.reply,
          timestamp: new Date().toLocaleTimeString(),
        };
        setMessages((prev) => [...prev, assistantMsg]);

        // Speak the response (mic is OFF — no echo)
        setStatus("speaking");
        statusRef.current = "speaking";
        speak(data.reply, () => {
          console.log("[PAGE] 🔇 TTS finished — resuming mic + conversation mode");
          setStatus("idle");
          statusRef.current = "idle";
          setCurrentTranscript("");

          // *** RESUME recognition after speaking finishes ***
          startListening();

          // Enter conversation mode — follow-ups without "Jarvis" for 15s
          setTimeout(() => {
            enterConversationMode();
          }, 300); // Small delay to let recognition start first
        });
      } catch (error) {
        console.error("[PAGE] ❌ Command error:", error);
        setStatus("error");
        statusRef.current = "error";

        const errorMsg = {
          role: "assistant",
          content: "I'm having trouble processing that request. Please try again, sir.",
          timestamp: new Date().toLocaleTimeString(),
        };
        setMessages((prev) => [...prev, errorMsg]);
        setTimeout(() => {
          setStatus("idle");
          statusRef.current = "idle";
          // Resume mic after error too
          startListening();
        }, 3000);
      }
    },
    [messages, speak, stopListening, startListening, enterConversationMode]
  );

  // Keep handleCommand ref always up to date
  useEffect(() => {
    handleCommandRef.current = handleCommand;
  }, [handleCommand]);

  // Auto-start listening on page load
  useEffect(() => {
    if (isSupported) {
      const timer = setTimeout(() => {
        startListening();
        console.log("[PAGE] 🚀 Auto-started listening");
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isSupported]); // eslint-disable-line react-hooks/exhaustive-deps

  // Update current transcript from speech recognition
  useEffect(() => {
    const display = interimTranscript || transcript;
    if (display) {
      setCurrentTranscript(display);
    }
  }, [transcript, interimTranscript]);

  // Handle cancel
  const handleCancel = () => {
    stopSpeaking();
    resetState();
    setStatus("idle");
    statusRef.current = "idle";
    setCurrentTranscript("");
    // Restart listening
    startListening();
  };

  // Handle text input
  const handleTextSend = (text) => {
    handleCommand(text);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden relative">
      {/* Background Grid */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20 grid-bg"></div>

      {/* Header */}
      <Header
        status={status}
        onSettingsClick={() => setChatPanelOpen(true)}
      />

      {/* Main Content — Fully Centered */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 md:p-6 overflow-hidden">
        <div className="flex flex-col items-center justify-center w-full max-w-2xl gap-4">
          {/* Core Visualization */}
          <CoreVisualization status={status} />

          {/* Transcript Display */}
          <TranscriptDisplay
            transcript={currentTranscript}
            status={status}
            onCancel={handleCancel}
          />

          {/* Controls */}
          <div className="flex flex-col items-center gap-4 mt-2">
            {!isSupported && (
              <p className="text-red-400 text-xs text-center max-w-xs">
                Speech recognition is not supported in your browser. Please use Chrome or Edge.
              </p>
            )}

            {/* Text Input */}
            <TextInput
              onSend={handleTextSend}
              disabled={status === "processing" || status === "speaking"}
            />

            {/* Chat log button */}
            <button
              onClick={() => setChatPanelOpen(true)}
              className="flex items-center gap-2 text-slate-500 hover:text-primary text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">forum</span>
              <span>View Conversation Log ({messages.length})</span>
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Chat Panel Modal */}
      <ChatPanel
        messages={messages}
        isOpen={chatPanelOpen}
        onClose={() => setChatPanelOpen(false)}
      />
    </div>
  );
}
