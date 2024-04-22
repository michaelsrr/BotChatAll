document.addEventListener('DOMContentLoaded', (event) => {
    window.botpressWebChat.init({
        "composerPlaceholder": "Chat with bot",
        "botConversationDescription": "This chatbot was built surprisingly fast with Botpress",
        "botId": "933d7189-7c77-4f42-aff1-fddc7246c5c2",
        "hostUrl": "https://cdn.botpress.cloud/webchat/v1",
        "messagingUrl": "https://messaging.botpress.cloud",
        "clientId": "933d7189-7c77-4f42-aff1-fddc7246c5c2",
        "webhookId": "5417aaa7-ae67-475b-9de7-83b8198d015a",
        "lazySocket": true,
        "themeName": "prism",
        "frontendVersion": "v1",
        "showPoweredBy": true,
        "theme": "prism",
        "themeColor": "#2563eb"
    });
    let ttsLang;
    window.botpressWebChat.onEvent(event => {
        if(event.type == 'TRIGGER' && event.value.ttsLang){
            ttsLang = event.value.ttsLang;
            console.log("Language: " + event.value.ttsLang);
        } else if (event.type == 'TRIGGER' && event.value.botResponse){
            let currentContent = transcriptionResult.innerHTML;
            transcriptionResult.innerHTML = currentContent + '<p>Bot: ' + event.value.botResponse + '</p>';
            synthesizeSpeech(event.value.botResponse);
        } else {console.log("Something wrong :(")}
    }, ['TRIGGER']);

    const startButton = document.getElementById('startButton');
    const stopButton = document.getElementById('stopButton');
    const transcriptionResult = document.getElementById('transriptionResult');
    let recognition;
    let transcript = '';
    let interimTranscript = '';

    if('webkitSpeechRecognition' in window){
        recognition = new webkitSpeechRecognition();
        recognition.continuos = true;
        recognition.interimResults = true;

        recognition.onstart = function(){
            startButton.disabled = true;
            stopButton.disabled = false;
            transcriptionResult.innerHTML = '<p>Listening ...</p>';
        };

        recognition.onerror = function(event){
            console.error(event.error);
        };

        recognition.onend = function(){
            startButton.disabled = false;
            stopButton.disabled = true;
        };

        recognition.onresult = function(event){
            interimTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i){
                if (event.results[i].isFinal){
                    transcript += event.results[i][0].transcript;
                } else {
                    interimResults +=event.results[i][0].transcript;
                }
            }
            transcriptionResult.innerHTML = '<h2>Transcription Result:</h2><p>' + transcript + interimTranscript + '</p>';
        };

    } else {
        alert("Your browser does not support the web speech API");
    }

    startButton.addEventListener('click', function(){
        transcript = '';
        recognition.lang = ttsLang;
        recognition.start();
    });

    stopButton.addEventListener('click', function(){
        recognition.stop();
        const combinedTranscript = transcript + interimTranscript;
        console.log("Transcript: " + combinedTranscript);
        window.botpressWebChat.sendPayload({
            type: 'trigger',
            payload: {sttTranscript: combinedTranscript}
        });
    });
});

async function synthesizeSpeech(text){
    const response = await fetch('http://localhost:3000/synthesize',{
        method: 'POST' ,
        headers: { 'Content-Type' : 'application/json'},
        body: JSON.stringify({ text })
    });

    if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);

        new Audio(audioUrl).play().catch(e => {
            console.error("Audio playback failed: ", e);
        });
    } else {
        alert('Failed to convert text to speech');
    }
}