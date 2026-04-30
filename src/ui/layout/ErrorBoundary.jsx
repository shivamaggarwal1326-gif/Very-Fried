import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMsg: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, errorMsg: error.message };
  }

  componentDidCatch(error, errorInfo) {
    // --- ZERO-DOWNTIME ARMOR ---
    // If Vercel pushes an update, the old JS chunks disappear, causing these specific errors.
    const isChunkError = 
      error.name === 'ChunkLoadError' || 
      error.message.includes('dynamically imported module') || 
      error.message.includes('Loading chunk') ||
      error.message.includes('fetch');

    if (isChunkError) {
      console.warn("SYSTEM UPGRADE DETECTED: Silently rebooting to acquire new deployment chunks.");
      // Instantly reload to fetch the new Vercel files. The merchant barely notices a blink.
      window.location.reload();
      return;
    }

    // Otherwise, log the actual critical error
    console.error("VeryFryd System Glitch:", error, errorInfo);
  }

  handleReboot = () => {
    this.setState({ hasError: false });
    window.location.href = '/'; 
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#111] text-[#fcfbf9] font-sans flex flex-col items-center justify-center p-4 md:p-8">
          <div className="border-8 border-red-600 p-8 md:p-16 max-w-2xl w-full bg-black shadow-[16px_16px_0px_0px_rgba(220,38,38,1)] flex flex-col items-center text-center">
            
            <svg viewBox="0 0 100 100" className="w-24 h-24 text-red-600 mb-8 animate-pulse">
               <path d="M50 10 L10 90 L90 90 Z" fill="none" stroke="currentColor" strokeWidth="8" strokeLinejoin="round"/>
               <line x1="50" y1="40" x2="50" y2="65" stroke="currentColor" strokeWidth="8" strokeLinecap="round"/>
               <circle cx="50" cy="80" r="5" fill="currentColor"/>
            </svg>

            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-red-600 leading-tight mb-2">
              System<br/>Glitch
            </h1>
            <p className="text-xl font-bold uppercase tracking-widest text-gray-400 mb-8">
              Dish Data Corrupted
            </p>

            <div className="bg-[#220000] border-2 border-red-600 p-4 w-full mb-12 text-left font-mono text-xs md:text-sm text-red-300 overflow-x-auto">
               <span className="font-bold text-white block mb-1">ERROR LOG:</span> 
               {this.state.errorMsg || "Unknown critical failure detected in the data payload."}
            </div>

            <button 
              onClick={this.handleReboot}
              className="bg-red-600 text-white text-2xl font-black uppercase px-12 py-4 border-4 border-red-600 transition-all shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] hover:shadow-none hover:translate-y-2 hover:translate-x-2 w-full"
            >
              Reboot System
            </button>

          </div>
        </div>
      );
    }
    return this.props.children; 
  }
}

export default ErrorBoundary;