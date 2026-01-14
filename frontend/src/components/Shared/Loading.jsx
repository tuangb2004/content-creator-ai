import { useTheme } from '../../contexts/ThemeContext';

function Loading({ message = 'Loading...' }) {
  const { theme } = useTheme();
  
  return (
    <div className={`flex items-center justify-center min-h-screen transition-colors duration-500 ${
      theme === 'dark' ? 'bg-[#1C1B19]' : 'bg-[#F5F2EB]'
    }`}>
      <div className="text-center animate-fade-in-up">
        <div className={`w-16 h-16 rounded-full border-4 animate-spin mx-auto mb-4 ${
          theme === 'dark' 
            ? 'border-gray-700 border-t-gray-400' 
            : 'border-[#D6D1C7] border-t-[#2C2A26]'
        }`}></div>
        <p className={`text-sm font-serif italic transition-colors duration-500 ${
          theme === 'dark' 
            ? 'text-gray-400' 
            : 'text-[#5D5A53]'
        }`}>
          {message}
        </p>
      </div>
    </div>
  );
}

export default Loading;