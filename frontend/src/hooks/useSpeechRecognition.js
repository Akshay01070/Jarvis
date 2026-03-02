"use client";

import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Conversational speech recognition — smooth like Alexa / Iron Man JARVIS.
 *
 * Modes:
 * - PASSIVE: Silently listening for "Jarvis" (fuzzy matching)
 * - ACTIVE: Wake word detected → capturing user's command
 * - CONVERSATION: After Jarvis replies → follow-ups without wake word (15s window)
 */

// Fuzzy match for "Jarvis" — handles common misheard variants
function containsWakeWord(text) {
    const lower = text.toLowerCase();
    const variants = [
        "jarvis", "jarves", "jarvas", "jarvus", "jarwis",
        "travis", "javis", "jaris", "jarvi", "j.a.r.v.i.s",
        "service", "java's", "harvest",
    ];
    return variants.some((v) => lower.includes(v));
}

function getWakeWordIndex(text) {
    const lower = text.toLowerCase();
    const variants = [
        "jarvis", "jarves", "jarvas", "jarvus", "jarwis",
        "travis", "javis", "jaris", "jarvi",
    ];
    for (const v of variants) {
        const idx = lower.indexOf(v);
        if (idx !== -1) return { index: idx, length: v.length };
    }
    return null;
}

export default function useSpeechRecognition({ onWakeWord, onCommand, onError }) {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [interimTranscript, setInterimTranscript] = useState("");
    const [isSupported, setIsSupported] = useState(false);
    const [wakeWordDetected, setWakeWordDetected] = useState(false);

    const recognitionRef = useRef(null);
    const modeRef = useRef("passive");
    const commandRef = useRef("");
    const silenceTimerRef = useRef(null);
    const conversationTimerRef = useRef(null);
    const shouldListenRef = useRef(false);
    const restartTimerRef = useRef(null);
    const isProcessingRef = useRef(false);
    const lastResultTimeRef = useRef(0);

    const onCommandRef = useRef(onCommand);
    const onWakeWordRef = useRef(onWakeWord);
    const onErrorRef = useRef(onError);
    useEffect(() => { onCommandRef.current = onCommand; }, [onCommand]);
    useEffect(() => { onWakeWordRef.current = onWakeWord; }, [onWakeWord]);
    useEffect(() => { onErrorRef.current = onError; }, [onError]);

    const clearAllTimers = useCallback(() => {
        if (silenceTimerRef.current) { clearTimeout(silenceTimerRef.current); silenceTimerRef.current = null; }
        if (conversationTimerRef.current) { clearTimeout(conversationTimerRef.current); conversationTimerRef.current = null; }
    }, []);

    const fireCommand = useCallback(() => {
        const cmd = commandRef.current.trim();
        if (cmd && !isProcessingRef.current) {
            console.log("[JARVIS] 🎯 Firing command:", cmd);
            isProcessingRef.current = true;
            commandRef.current = "";
            setTranscript("");
            setInterimTranscript("");
            onCommandRef.current?.(cmd);
        }
    }, []);

    const startSilenceTimer = useCallback(() => {
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
            console.log("[JARVIS] ⏱️ Silence → firing command");
            fireCommand();
        }, 3000);
    }, [fireCommand]);

    const enterConversationMode = useCallback(() => {
        console.log("[JARVIS] 💬 Conversation mode ON (15s window)");
        modeRef.current = "conversation";
        isProcessingRef.current = false;
        commandRef.current = "";
        setWakeWordDetected(true);
        setTranscript("");
        setInterimTranscript("");

        if (conversationTimerRef.current) clearTimeout(conversationTimerRef.current);
        conversationTimerRef.current = setTimeout(() => {
            if (modeRef.current === "conversation") {
                console.log("[JARVIS] ⏰ Conversation timeout → passive");
                modeRef.current = "passive";
                setWakeWordDetected(false);
                setTranscript("");
                setInterimTranscript("");
            }
        }, 15000);
    }, []);

    const resetConversationTimer = useCallback(() => {
        if (modeRef.current === "conversation") {
            if (conversationTimerRef.current) clearTimeout(conversationTimerRef.current);
            conversationTimerRef.current = setTimeout(() => {
                if (modeRef.current === "conversation") {
                    console.log("[JARVIS] ⏰ Conversation timeout → passive");
                    modeRef.current = "passive";
                    setWakeWordDetected(false);
                    setTranscript("");
                    setInterimTranscript("");
                }
            }, 15000);
        }
    }, []);

    const extractAfterWake = useCallback((text) => {
        const match = getWakeWordIndex(text);
        if (!match) return null;
        let after = text.substring(match.index + match.length).trim();
        after = after.replace(/^[\s,.:;!?]+/, "").trim();
        return after;
    }, []);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        setIsSupported(true);

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            console.log("[JARVIS] 🎤 Recognition started | Mode:", modeRef.current);
        };

        recognition.onresult = (event) => {
            if (isProcessingRef.current) return;

            lastResultTimeRef.current = Date.now();
            let interim = "";
            let final = "";

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const t = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    final += t;
                } else {
                    interim += t;
                }
            }

            const mode = modeRef.current;

            // ---- INTERIM ----
            if (interim) {
                if (mode === "passive") {
                    if (containsWakeWord(interim)) {
                        console.log("[JARVIS] 🔊 Wake word in interim:", interim);
                        modeRef.current = "active";
                        setWakeWordDetected(true);
                        onWakeWordRef.current?.();
                        const cmd = extractAfterWake(interim);
                        if (cmd) setInterimTranscript(cmd);
                    }
                } else if (mode === "active") {
                    const display = commandRef.current
                        ? (commandRef.current + " " + (extractAfterWake(interim) ?? interim)).trim()
                        : (extractAfterWake(interim) ?? interim);
                    setInterimTranscript(display);
                } else if (mode === "conversation") {
                    resetConversationTimer();
                    const display = (commandRef.current + " " + interim).trim();
                    setInterimTranscript(display);
                    startSilenceTimer();
                }
            }

            // ---- FINAL ----
            if (final) {
                setInterimTranscript("");

                if (mode === "passive") {
                    if (containsWakeWord(final)) {
                        console.log("[JARVIS] 🔊 Wake word in final:", final);
                        modeRef.current = "active";
                        setWakeWordDetected(true);
                        onWakeWordRef.current?.();

                        const cmd = extractAfterWake(final);
                        if (cmd) {
                            commandRef.current = cmd;
                            setTranscript(cmd);
                            console.log("[JARVIS] 📝 Command:", cmd);
                            startSilenceTimer();
                        }
                    }
                } else if (mode === "active") {
                    let text = final.trim();
                    if (containsWakeWord(text)) {
                        const cmd = extractAfterWake(text);
                        if (cmd) text = cmd;
                        else return;
                    }
                    commandRef.current = (commandRef.current + " " + text).trim();
                    setTranscript(commandRef.current);
                    console.log("[JARVIS] 📝 Buffer:", commandRef.current);
                    startSilenceTimer();

                } else if (mode === "conversation") {
                    commandRef.current = (commandRef.current + " " + final.trim()).trim();
                    setTranscript(commandRef.current);
                    console.log("[JARVIS] 💬 Follow-up:", commandRef.current);
                    resetConversationTimer();
                    startSilenceTimer();
                }
            }
        };

        recognition.onerror = (event) => {
            if (event.error === "not-allowed" || event.error === "service-not-allowed") {
                console.error("[JARVIS] ❌ Mic access denied");
                onErrorRef.current?.("Microphone access denied. Allow mic access and refresh the page.");
                return;
            }
            // no-speech and aborted are normal
        };

        recognition.onend = () => {
            if (shouldListenRef.current) {
                restartTimerRef.current = setTimeout(() => {
                    if (shouldListenRef.current && recognitionRef.current) {
                        try {
                            recognitionRef.current.start();
                        } catch (e) {
                            setTimeout(() => {
                                if (shouldListenRef.current && recognitionRef.current) {
                                    try { recognitionRef.current.start(); } catch (e2) { }
                                }
                            }, 500);
                        }
                    }
                }, 150);
            }
        };

        recognitionRef.current = recognition;

        return () => {
            shouldListenRef.current = false;
            clearAllTimers();
            if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
            try { recognitionRef.current?.abort(); } catch (e) { }
        };
    }, [extractAfterWake, startSilenceTimer, resetConversationTimer, clearAllTimers]);

    const startListening = useCallback(() => {
        if (!recognitionRef.current || shouldListenRef.current) return;
        console.log("[JARVIS] ▶️ Started listening");
        shouldListenRef.current = true;
        modeRef.current = "passive";
        isProcessingRef.current = false;
        commandRef.current = "";
        setIsListening(true);
        setTranscript("");
        setInterimTranscript("");
        setWakeWordDetected(false);
        try { recognitionRef.current.start(); } catch (e) {
            try { recognitionRef.current.stop(); } catch (e2) { }
            setTimeout(() => { try { recognitionRef.current?.start(); } catch (e3) { } }, 300);
        }
    }, []);

    const stopListening = useCallback(() => {
        shouldListenRef.current = false;
        clearAllTimers();
        if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
        try { recognitionRef.current?.abort(); } catch (e) { }
        modeRef.current = "passive";
        isProcessingRef.current = false;
        commandRef.current = "";
        setIsListening(false);
        setTranscript("");
        setInterimTranscript("");
        setWakeWordDetected(false);
    }, [clearAllTimers]);

    const resetState = useCallback(() => {
        clearAllTimers();
        commandRef.current = "";
        isProcessingRef.current = false;
        setTranscript("");
        setInterimTranscript("");
        setWakeWordDetected(false);
        modeRef.current = "passive";
    }, [clearAllTimers]);

    return {
        isListening, transcript, interimTranscript, isSupported, wakeWordDetected,
        startListening, stopListening, resetState, enterConversationMode,
    };
}
