import React from 'react';

interface LoginProps {
  onLogin: () => void;
  isLoading: boolean;
}

export function Login({ onLogin, isLoading }: LoginProps) {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500 bg-pink-50">
      <div className="w-28 h-28 bg-rose-200 rounded-[2.5rem] flex items-center justify-center border-4 border-rose-400 shadow-[8px_8px_0_0_rgba(251,113,133,0.3)] mb-8 transform -rotate-6 transition-transform hover:rotate-6 duration-300 cursor-default">
        <span className="text-5xl">🎀</span>
      </div>
      <h1 className="text-4xl font-display font-bold text-rose-500 mb-4 tracking-tighter">Keuangan Pintar</h1>
      <p className="text-rose-400 font-medium mb-12 max-w-[280px]">Catat pengeluaranmu dengan mudah dan sinkronisasi otomatis dengan Google Sheets.</p>
      
      <button 
        className="gsi-material-button disabled:opacity-50 hover:-translate-y-1 transition-transform"
        onClick={onLogin}
        disabled={isLoading}
        style={{ width: '100%', maxWidth: '300px' }}
      >
        <div className="gsi-material-button-state"></div>
        <div className="gsi-material-button-content-wrapper p-3.5 flex items-center justify-center border-2 border-rose-200 rounded-2xl bg-white shadow-[0_8px_30px_rgba(251,113,133,0.1)] hover:shadow-[0_8px_30px_rgba(251,113,133,0.2)] transition-all">
          <div className="gsi-material-button-icon mr-3">
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" xmlnsXlink="http://www.w3.org/1999/xlink" style={{display: 'block', width: '24px', height: '24px'}}>
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
              <path fill="none" d="M0 0h48v48H0z"></path>
            </svg>
          </div>
          <span className="gsi-material-button-contents font-bold text-rose-500 text-lg">Masuk dengan Google</span>
        </div>
      </button>
    </div>
  );
}
