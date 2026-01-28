import React from 'react';
import * as Lucide from 'lucide-react';

const SvgIcon = ({ src, size = 24, className = "" }) => {
    return (
        <img
            src={src}
            width={size}
            height={size}
            className={className}
            style={{ display: 'inline-block', verticalAlign: 'middle', filter: 'currentColor' }}
            alt=""
        />
    );
};

const LucideIcon = ({ icon, size = 24, className = "" }) => {
    const Icon = Lucide[icon];
    if (!Icon) return null;
    return <Icon size={size} className={className} />;
};

export const Icons = {
    // SVG Assets from assets/svg
    Logo: (props) => <SvgIcon src="/src/assets/svg/Logo.svg" {...props} />,
    Bell: (props) => <SvgIcon src="/src/assets/svg/bell-svgrepo-com.svg" {...props} />,
    Box: (props) => <SvgIcon src="/src/assets/svg/box-minimalistic-svgrepo-com.svg" {...props} />,
    Calendar: (props) => <SvgIcon src="/src/assets/svg/calendar-add-svgrepo-com.svg" {...props} />,
    Clapperboard: (props) => <SvgIcon src="/src/assets/svg/clapperboard-edit-svgrepo-com.svg" {...props} />,
    ClapperboardPlay: (props) => <SvgIcon src="/src/assets/svg/clapperboard-play-svgrepo-com.svg" {...props} />,
    Clock: (props) => <SvgIcon src="/src/assets/svg/clock-circle-svgrepo-com.svg" {...props} />,
    Copy: (props) => <SvgIcon src="/src/assets/svg/copy-svgrepo-com.svg" {...props} />,
    Download: (props) => <SvgIcon src="/src/assets/svg/download-minimalistic-svgrepo-com.svg" {...props} />,
    Eye: (props) => <SvgIcon src="/src/assets/svg/eye-svgrepo-com.svg" {...props} />,
    Heart: (props) => <SvgIcon src="/src/assets/svg/heart-svgrepo-com.svg" {...props} />,
    Layers: (props) => <SvgIcon src="/src/assets/svg/layers-minimalistic-svgrepo-com.svg" {...props} />,
    Lightbulb: (props) => <SvgIcon src="/src/assets/svg/lightbulb-bolt-svgrepo-com.svg" {...props} />,
    Link: (props) => <SvgIcon src="/src/assets/svg/link-svgrepo-com.svg" {...props} />,
    LogOut: (props) => <SvgIcon src="/src/assets/svg/logout-2-svgrepo-com.svg" {...props} />,
    Mic: (props) => <SvgIcon src="/src/assets/svg/microphone-svgrepo-com.svg" {...props} />,
    Moon: (props) => <SvgIcon src="/src/assets/svg/moon-svgrepo-com.svg" {...props} />,
    Notebook: (props) => <SvgIcon src="/src/assets/svg/notebook-svgrepo-com.svg" {...props} />,
    PieChart: (props) => <SvgIcon src="/src/assets/svg/pie-chart-svgrepo-com.svg" {...props} />,
    Pin: (props) => <SvgIcon src="/src/assets/svg/pin-svgrepo-com.svg" {...props} />,
    Pip: (props) => <SvgIcon src="/src/assets/svg/pip-svgrepo-com.svg" {...props} />,
    RefreshCw: (props) => <SvgIcon src="/src/assets/svg/refresh-svgrepo-com.svg" {...props} />,
    Share2: (props) => <SvgIcon src="/src/assets/svg/share-svgrepo-com.svg" {...props} />,
    Sliders: (props) => <SvgIcon src="/src/assets/svg/slider-vertical-svgrepo-com.svg" {...props} />,
    Sun: (props) => <SvgIcon src="/src/assets/svg/sun-svgrepo-com.svg" {...props} />,
    Trash2: (props) => <SvgIcon src="/src/assets/svg/trash-bin-2-svgrepo-com.svg" {...props} />,
    User: (props) => <SvgIcon src="/src/assets/svg/user-id-svgrepo-com.svg" {...props} />,
    Video: (props) => <SvgIcon src="/src/assets/svg/video-library-svgrepo-com.svg" {...props} />,
    Filter: (props) => <SvgIcon src="/src/assets/svg/filters-svgrepo-com.svg" {...props} />,
    Globe: (props) => <SvgIcon src="/src/assets/svg/earth-svgrepo-com.svg" {...props} />,
    Image: (props) => <SvgIcon src="/src/assets/svg/gallery-edit-svgrepo-com.svg" {...props} />,
    Gallery: (props) => <SvgIcon src="/src/assets/svg/gallery-svgrepo-com.svg" {...props} />,
    Maximize2: (props) => <SvgIcon src="/src/assets/svg/maximize-square-svgrepo-com.svg" {...props} />,
    Home: (props) => <SvgIcon src="/src/assets/svg/home-svgrepo-com.svg" {...props} />,
    BarChart2: (props) => <SvgIcon src="/src/assets/svg/chart-square-svgrepo-com.svg" {...props} />,
    Ratio: (props) => <SvgIcon src="/src/assets/svg/crop-minimalistic-svgrepo-com.svg" {...props} />,
    Crop: (props) => <SvgIcon src="/src/assets/svg/crop-minimalistic-svgrepo-com.svg" {...props} />,
    Wand2: (props) => <SvgIcon src="/src/assets/svg/magic-stick-3-svgrepo-com.svg" {...props} />,
    Users: (props) => <SvgIcon src="/src/assets/svg/sticker-smile-circle-2-svgrepo-com.svg" {...props} />,
    Cloud: (props) => <SvgIcon src="/src/assets/svg/layers-minimalistic-svgrepo-com.svg" {...props} />,

    // Lucide Fallbacks
    LayoutGrid: (props) => <LucideIcon icon="LayoutGrid" {...props} />,
    Plus: (props) => <LucideIcon icon="Plus" {...props} />,
    Play: (props) => <LucideIcon icon="Play" {...props} />,
    CheckCircle: (props) => <LucideIcon icon="CheckCircle" {...props} />,
    ChevronRight: (props) => <LucideIcon icon="ChevronRight" {...props} />,
    ChevronLeft: (props) => <LucideIcon icon="ChevronLeft" {...props} />,
    Search: (props) => <LucideIcon icon="Search" {...props} />,
    Upload: (props) => <LucideIcon icon="Upload" {...props} />,
    CreditCard: (props) => <LucideIcon icon="CreditCard" {...props} />,
    Settings: (props) => <LucideIcon icon="Settings" {...props} />,
    X: (props) => <LucideIcon icon="X" {...props} />,
    Menu: (props) => <LucideIcon icon="Menu" {...props} />,
    Folder: (props) => <LucideIcon icon="Folder" {...props} />,
    List: (props) => <LucideIcon icon="List" {...props} />,
    ArrowUp: (props) => <LucideIcon icon="ArrowUp" {...props} />,
    Scissors: (props) => <LucideIcon icon="Scissors" {...props} />,
    Store: (props) => <LucideIcon icon="Store" {...props} />,
    HelpCircle: (props) => <LucideIcon icon="HelpCircle" {...props} />,
    Sparkles: (props) => <LucideIcon icon="Sparkles" {...props} />,
    MoreHorizontal: (props) => <LucideIcon icon="MoreHorizontal" {...props} />,
    Monitor: (props) => <LucideIcon icon="Monitor" {...props} />,
    Smartphone: (props) => <LucideIcon icon="Smartphone" {...props} />,
    Square: (props) => <LucideIcon icon="Square" {...props} />,
    Zap: (props) => <LucideIcon icon="Zap" {...props} />,
    Bot: (props) => <LucideIcon icon="Bot" {...props} />,
    ArrowRight: (props) => <LucideIcon icon="ArrowRight" {...props} />,
    Inbox: (props) => <LucideIcon icon="Inbox" {...props} />,
    Gift: (props) => <LucideIcon icon="Gift" {...props} />,
    Brush: (props) => <LucideIcon icon="Brush" {...props} />,
    QrCode: (props) => <LucideIcon icon="QrCode" {...props} />,
    Aperture: (props) => <LucideIcon icon="Aperture" {...props} />,
    Tag: (props) => <LucideIcon icon="Tag" {...props} />,
    FileText: (props) => <LucideIcon icon="FileText" {...props} />,
    Shield: (props) => <LucideIcon icon="Shield" {...props} />,
    Sidebar: (props) => <LucideIcon icon="Sidebar" {...props} />,
    Eraser: (props) => <LucideIcon icon="Eraser" {...props} />,
    Move: (props) => <LucideIcon icon="Move" {...props} />,
    RotateCw: (props) => <LucideIcon icon="RotateCw" {...props} />,
    History: (props) => <LucideIcon icon="History" {...props} />,
    MessageSquare: (props) => <LucideIcon icon="MessageSquare" {...props} />,
    ChevronDown: (props) => <LucideIcon icon="ChevronDown" {...props} />,
    PanelLeftClose: (props) => <LucideIcon icon="PanelLeftClose" {...props} />,
    PanelLeftOpen: (props) => <LucideIcon icon="PanelLeftOpen" {...props} />,
    Cpu: (props) => <LucideIcon icon="Cpu" {...props} />,
    Film: (props) => <LucideIcon icon="Film" {...props} />,
    ThumbsUp: (props) => <LucideIcon icon="ThumbsUp" {...props} />,
    ThumbsDown: (props) => <LucideIcon icon="ThumbsDown" {...props} />,
    MoreVertical: (props) => <LucideIcon icon="MoreVertical" {...props} />,
    Send: (props) => <LucideIcon icon="Send" {...props} />,
    Briefcase: (props) => <LucideIcon icon="Briefcase" {...props} />,
    Loader: (props) => <LucideIcon icon="Loader" {...props} />,
};
