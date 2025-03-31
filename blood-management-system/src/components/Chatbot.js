import React, { useState, useRef, useEffect } from 'react';
import { FaMicrophone, FaStop, FaPaperPlane, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import { BsChatDotsFill } from 'react-icons/bs';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [autoSpeak, setAutoSpeak] = useState(false);
  const messagesEndRef = useRef(null);
  const speechRecognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  const languages = {
    en: 'English',
    es: 'Español',
    hi: 'हिंदी',
    te: 'తెలుగు'
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = selectedLanguage === 'en' ? 'en-US' : 
                        selectedLanguage === 'es' ? 'es-ES' :
                        selectedLanguage === 'hi' ? 'hi-IN' : 'te-IN';

      recognition.onstart = () => setIsRecording(true);
      recognition.onend = () => setIsRecording(false);
      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join(' ');
        setInputText(transcript);
        if (event.results[0].isFinal) {
          handleUserInput(transcript);
        }
      };

      speechRecognitionRef.current = recognition;
    }

    return () => {
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, [selectedLanguage]);

  const speakText = (text) => {
    if (synthRef.current && autoSpeak) {
      synthRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = selectedLanguage === 'en' ? 'en-US' : 
                      selectedLanguage === 'es' ? 'es-ES' :
                      selectedLanguage === 'hi' ? 'hi-IN' : 'te-IN';
      synthRef.current.speak(utterance);
    }
  };

  const handleUserInput = async (text) => {
    const userMessage = { type: 'user', text };
    setMessages(prev => [...prev, userMessage]);

    try {
      setIsProcessing(true);
      const response = await getHealthResponse(text);
      const botMessage = { type: 'bot', text: response };
      setMessages(prev => [...prev, botMessage]);
      speakText(response);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = { 
        type: 'bot', 
        text: "I'm sorry, I encountered an error. Please try again." 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
      setInputText('');
    }
  };

  const getHealthResponse = async (query) => {
    const responses = {
      blood: {
        en: "Blood donation saves lives! You can donate every 56 days. Common blood types: A+, A-, B+, B-, O+, O-, AB+, AB-. O- is universal donor.",
        es: "¡La donación de sangre salva vidas! Puede donar cada 56 días. Tipos de sangre: A+, A-, B+, B-, O+, O-, AB+, AB-. O- es donante universal.",
        hi: "रक्तदान जीवन बचाता है! आप हर 56 दिनों में दान कर सकते हैं। सामान्य रक्त समूह: A+, A-, B+, B-, O+, O-, AB+, AB-",
        te: "రక్తదానం ప్రాణాలను కాపాడుతుంది! మీరు ప్రతి 56 రోజులకు దానం చేయవచ్చు. సాధారణ రక్త రకాలు: A+, A-, B+, B-, O+, O-, AB+, AB-"
      },
      emergency: {
        en: " EMERGENCY: Call emergency services immediately! While waiting: 1. Stay calm 2. Find safe position 3. Have someone stay with you",
        es: " EMERGENCIA: ¡Llame a los servicios de emergencia inmediatamente! Mientras espera: 1. Mantenga la calma 2. Posición segura 3. Acompañamiento",
        hi: " आपातकाल: तुरंत आपातकालीन सेवाओं को कॉल करें! प्रतीक्षा करते समय: 1. शांत रहें 2. सुरक्षित स्थिति 3. किसी को साथ रखें",
        te: " అత్యవసరం: వెంటనే అత్యవసర సేవలను పిలవండి! వేచి ఉండగా: 1. ప్రశాంతంగా ఉండండి 2. సురక్షిత స్థానం 3. ఎవరైనా మీతో ఉండనివ్వండి"
      }
    };

    const lowercaseQuery = query.toLowerCase();
    let response;

    if (lowercaseQuery.includes('emergency') || lowercaseQuery.includes('urgent')) {
      response = responses.emergency[selectedLanguage];
    } else if (lowercaseQuery.includes('blood') || lowercaseQuery.includes('donation')) {
      response = responses.blood[selectedLanguage];
    } else {
      response = {
        en: "I can help with blood donation and emergency information. Please ask about these topics.",
        es: "Puedo ayudar con información sobre donación de sangre y emergencias. Por favor pregunte sobre estos temas.",
        hi: "मैं रक्तदान और आपातकालीन जानकारी में मदद कर सकता हूं। कृपया इन विषयों के बारे में पूछें।",
        te: "నేను రక్తదానం మరియు అత్యవసర సమాచారంతో సహాయపడగలను. దయచేసి ఈ అంశాల గురించి అడగండి."
      }[selectedLanguage];
    }

    return response;
  };

  const startRecording = () => {
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.start();
    }
  };

  const stopRecording = () => {
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputText.trim()) {
      handleUserInput(inputText);
    }
  };

  return (
    <div className="chatbot-container">
      {!isOpen ? (
        <button 
          className="chatbot-toggle"
          onClick={() => setIsOpen(true)}
          aria-label="Open chat"
        >
          <BsChatDotsFill size={24} />
        </button>
      ) : (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div className="header-controls">
              <select 
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="language-select"
              >
                {Object.entries(languages).map(([code, name]) => (
                  <option key={code} value={code}>{name}</option>
                ))}
              </select>
              <button
                onClick={() => setAutoSpeak(!autoSpeak)}
                className={`speak-toggle ${autoSpeak ? 'active' : ''}`}
                aria-label={autoSpeak ? 'Disable voice' : 'Enable voice'}
              >
                {autoSpeak ? <FaVolumeUp /> : <FaVolumeMute />}
              </button>
            </div>
            <button 
              className="close-button"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
            >
              ×
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.length === 0 && (
              <div className="welcome-message bot-message">
                <p> {
                  {
                    en: "Hello! I'm your health assistant. Ask me about blood donation or emergencies!",
                    es: "¡Hola! Soy tu asistente de salud. ¡Pregúntame sobre donación de sangre o emergencias!",
                    hi: "नमस्ते! मैं आपका स्वास्थ्य सहायक हूं। रक्तदान या आपातकाल के बारे में पूछें!",
                    te: "నమస్కారం! నేను మీ ఆరోగ్య సహాయకుడిని. రక్తదానం లేదా అత్యవసర పరిస్థితుల గురించి అడగండి!"
                  }[selectedLanguage]
                }</p>
              </div>
            )}
            {messages.map((message, index) => (
              <div key={index} className={`message ${message.type}-message`}>
                {message.text}
              </div>
            ))}
            {isProcessing && (
              <div className="bot-message message">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="chatbot-input">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                {
                  en: "Type your question...",
                  es: "Escribe tu pregunta...",
                  hi: "अपना प्रश्न लिखें...",
                  te: "మీ ప్రశ్నను టైప్ చేయండి..."
                }[selectedLanguage]
              }
              disabled={isRecording || isProcessing}
            />
            <div className="input-buttons">
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                className={`voice-button ${isRecording ? 'recording' : ''}`}
                disabled={isProcessing}
                aria-label={isRecording ? 'Stop recording' : 'Start recording'}
              >
                {isRecording ? <FaStop /> : <FaMicrophone />}
              </button>
              <button
                type="submit"
                disabled={!inputText.trim() || isProcessing || isRecording}
                aria-label="Send message"
              >
                <FaPaperPlane />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatBot;
