
import React, { useState, useRef, useEffect } from 'react';

interface RecorderProps {
  audioStream: MediaStream | null;
}

const Recorder: React.FC<RecorderProps> = ({ audioStream }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    return () => {
      if (recordedUrl) {
        URL.revokeObjectURL(recordedUrl);
      }
    };
  }, [recordedUrl]);

  const handleStartRecording = () => {
    if (!audioStream) {
      alert("Audio context not ready. Please allow microphone access.");
      return;
    }
    setRecordedUrl(null);
    if (recordedUrl) URL.revokeObjectURL(recordedUrl);

    recordedChunksRef.current = [];
    // Prefer audio/webm for broader compatibility and quality.
    const options = { mimeType: 'audio/webm;codecs=opus' };
    try {
        mediaRecorderRef.current = new MediaRecorder(audioStream, options);
    } catch(e) {
        console.error("Failed to create MediaRecorder:", e);
        alert("Your browser doesn't support audio/webm recording. Try a different browser.");
        return;
    }

    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };

    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
      const url = URL.createObjectURL(blob);
      setRecordedUrl(url);
    };
    
    mediaRecorderRef.current.start();
    setIsRecording(true);
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      handleStopRecording();
    } else {
      handleStartRecording();
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-2xl w-full max-w-2xl mt-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Recording Panel</h3>
        <button
          onClick={toggleRecording}
          className={`px-6 py-3 rounded-lg font-bold text-white transition-all duration-200 flex items-center space-x-2 focus:outline-none focus:ring-4 ${
            isRecording ? 'bg-red-600 hover:bg-red-500 focus:ring-red-400' : 'bg-gray-600 hover:bg-gray-500 focus:ring-gray-400'
          }`}
        >
          <span className={`w-3 h-3 rounded-full ${isRecording ? 'bg-white animate-pulse' : 'bg-red-500'}`}></span>
          <span>{isRecording ? 'Stop Recording' : 'Record'}</span>
        </button>
      </div>
      {recordedUrl && (
        <div className="bg-gray-700/50 p-4 rounded-lg">
            <h4 className="text-white mb-2 font-medium">Last Recording:</h4>
            <audio controls src={recordedUrl} className="w-full"></audio>
            <a 
                href={recordedUrl} 
                download={`metronome-recording-${Date.now()}.webm`}
                className="block text-center mt-3 text-cyan-400 hover:text-cyan-300 text-sm font-medium"
            >
                Download Recording (.webm)
            </a>
        </div>
      )}
    </div>
  );
};

export default Recorder;
