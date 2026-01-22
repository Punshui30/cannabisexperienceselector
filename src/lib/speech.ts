export const startListening = (onResult: (t: string) => void, onStateChange: (listening: boolean) => void) => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
        alert("Speech recognition not supported in this browser.");
        return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.start();
    onStateChange(true);

    recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onResult(transcript);
    };

    recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        onStateChange(false);
    };

    recognition.onend = () => {
        onStateChange(false);
    };
};
