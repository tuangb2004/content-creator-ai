import { Icons } from '../Icons';

const Avatars = () => {
    return (
        <div className="p-8 h-full flex flex-col items-center justify-center">
            <div className="text-center">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Icons.Users size={40} className="text-gray-400 dark:text-gray-500" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Avatars & Voices</h1>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-8">
                    Create custom avatars and clone voices for your content. This feature is coming soon to your dashboard.
                </p>
                <button className="bg-black dark:bg-white text-white dark:text-black font-bold py-2 px-6 rounded-full hover:opacity-80 transition-opacity">
                    Notify me when available
                </button>
            </div>
        </div>
    );
};

export default Avatars;
