"use client";

import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Text-to-Speech hook that selects the most natural-sounding voice available.
 * Prioritizes premium/neural voices for a human-like Jarvis experience.
 */
export default function useTextToSpeech() {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [voices, setVoices] = useState([]);
    const utteranceRef = useRef(null);
    const onEndCallbackRef = useRef(null);

    // Load available voices
    useEffect(() => {
        if (typeof window === "undefined" || !window.speechSynthesis) return;

        const loadVoices = () => {
            const v = window.speechSynthesis.getVoices();
            if (v.length > 0) {
                setVoices(v);
                console.log("[TTS] Available voices:", v.length);
                // Log the best English voices for debugging
                v.filter(voice => voice.lang.startsWith("en"))
                    .slice(0, 8)
                    .forEach(voice => console.log(`[TTS]   ${voice.name} (${voice.lang}) ${voice.localService ? 'local' : 'remote'}`));
            }
        };

        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;

        return () => {
            window.speechSynthesis.onvoiceschanged = null;
        };
    }, []);

    // Select the best voice — prioritize natural/premium voices
    const selectBestVoice = useCallback(() => {
        if (voices.length === 0) return null;

        const englishVoices = voices.filter((v) => v.lang.startsWith("en"));

        // Priority list: most natural-sounding male voices (Jarvis should sound refined)
        const preferredNames = [
            // Google premium voices (Chrome)
            "Google UK English Male",
            "Google US English",
            // Microsoft natural voices (Edge) — these sound very human
            "Microsoft Ryan Online (Natural)",
            "Microsoft Guy Online (Natural)",
            "Microsoft Mark Online (Natural)",
            "Microsoft David Online (Natural)",
            "Microsoft George Online (Natural)",
            // Apple voices (Safari)
            "Daniel",
            "Aaron",
            "Arthur",
            // Fallback names
            "David",
            "Mark",
            "James",
            "Male",
        ];

        // Try each preferred voice name
        for (const name of preferredNames) {
            const match = englishVoices.find((v) =>
                v.name.toLowerCase().includes(name.toLowerCase())
            );
            if (match) {
                console.log("[TTS] Selected voice:", match.name);
                return match;
            }
        }

        // Fallback: any English male voice
        const maleVoice = englishVoices.find(
            (v) => v.name.toLowerCase().includes("male") || v.name.toLowerCase().includes("david")
        );
        if (maleVoice) return maleVoice;

        // Last resort: first English voice
        return englishVoices[0] || voices[0];
    }, [voices]);

    // Warmup: prime TTS on first user interaction to avoid autoplay restrictions
    useEffect(() => {
        if (typeof window === "undefined" || !window.speechSynthesis) return;

        const warmup = () => {
            const u = new SpeechSynthesisUtterance("");
            u.volume = 0;
            window.speechSynthesis.speak(u);
            window.speechSynthesis.cancel();
            // Remove listeners after first interaction
            document.removeEventListener("click", warmup);
            document.removeEventListener("keydown", warmup);
            document.removeEventListener("touchstart", warmup);
        };

        document.addEventListener("click", warmup, { once: true });
        document.addEventListener("keydown", warmup, { once: true });
        document.addEventListener("touchstart", warmup, { once: true });

        return () => {
            document.removeEventListener("click", warmup);
            document.removeEventListener("keydown", warmup);
            document.removeEventListener("touchstart", warmup);
        };
    }, []);

    const speak = useCallback(
        (text, onEnd) => {
            if (!window.speechSynthesis || !text) return;

            // Cancel any current speech
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            const voice = selectBestVoice();
            if (voice) utterance.voice = voice;

            // Natural speech parameters
            utterance.rate = 0.95;
            utterance.pitch = 0.95;
            utterance.volume = 1.0;

            utterance.onstart = () => {
                setIsSpeaking(true);
            };

            // Chrome bug workaround: speechSynthesis sometimes pauses after ~15 seconds
            let resumeInterval = null;

            utterance.onend = () => {
                if (resumeInterval) clearInterval(resumeInterval);
                setIsSpeaking(false);
                onEndCallbackRef.current = null;
                onEnd?.();
            };

            utterance.onerror = (event) => {
                if (resumeInterval) clearInterval(resumeInterval);
                // These are expected/harmless browser policy errors
                if (event.error !== "interrupted" && event.error !== "not-allowed") {
                    console.warn("[TTS] Error:", event.error);
                }
                setIsSpeaking(false);
                onEndCallbackRef.current = null;
                // If not-allowed, still call onEnd so the app doesn't get stuck
                if (event.error === "not-allowed") {
                    onEnd?.();
                }
            };

            onEndCallbackRef.current = onEnd;
            utteranceRef.current = utterance;

            resumeInterval = setInterval(() => {
                if (window.speechSynthesis.speaking) {
                    window.speechSynthesis.pause();
                    window.speechSynthesis.resume();
                } else {
                    clearInterval(resumeInterval);
                }
            }, 10000);

            window.speechSynthesis.speak(utterance);
        },
        [selectBestVoice]
    );

    const stop = useCallback(() => {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
        setIsSpeaking(false);
        onEndCallbackRef.current = null;
    }, []);

    return { isSpeaking, speak, stop };
}
