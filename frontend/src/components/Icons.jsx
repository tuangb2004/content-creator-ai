import React from 'react';
import * as Lucide from 'lucide-react';

// Import SVGs so Vite bundles them correctly in production (paths like /src/assets/... 404 on deploy)
import logoSvg from '../assets/svg/Logo.svg';
import bellSvg from '../assets/svg/bell-svgrepo-com.svg';
import boxSvg from '../assets/svg/box-minimalistic-svgrepo-com.svg';
import calendarSvg from '../assets/svg/calendar-add-svgrepo-com.svg';
import clapperboardSvg from '../assets/svg/clapperboard-edit-svgrepo-com.svg';
import clapperboardPlaySvg from '../assets/svg/clapperboard-play-svgrepo-com.svg';
import clockSvg from '../assets/svg/clock-circle-svgrepo-com.svg';
import copySvg from '../assets/svg/copy-svgrepo-com.svg';
import downloadSvg from '../assets/svg/download-minimalistic-svgrepo-com.svg';
import eyeSvg from '../assets/svg/eye-svgrepo-com.svg';
import heartSvg from '../assets/svg/heart-svgrepo-com.svg';
import layersSvg from '../assets/svg/layers-minimalistic-svgrepo-com.svg';
import lightbulbSvg from '../assets/svg/lightbulb-bolt-svgrepo-com.svg';
import linkSvg from '../assets/svg/link-svgrepo-com.svg';
import logoutSvg from '../assets/svg/logout-2-svgrepo-com.svg';
import micSvg from '../assets/svg/microphone-svgrepo-com.svg';
import moonSvg from '../assets/svg/moon-svgrepo-com.svg';
import notebookSvg from '../assets/svg/notebook-svgrepo-com.svg';
import pieChartSvg from '../assets/svg/pie-chart-svgrepo-com.svg';
import pinSvg from '../assets/svg/pin-svgrepo-com.svg';
import pipSvg from '../assets/svg/pip-svgrepo-com.svg';
import refreshSvg from '../assets/svg/refresh-svgrepo-com.svg';
import shareSvg from '../assets/svg/share-svgrepo-com.svg';
import slidersSvg from '../assets/svg/slider-vertical-svgrepo-com.svg';
import sunSvg from '../assets/svg/sun-svgrepo-com.svg';
import trashSvg from '../assets/svg/trash-bin-2-svgrepo-com.svg';
import userSvg from '../assets/svg/user-id-svgrepo-com.svg';
import filterSvg from '../assets/svg/filters-svgrepo-com.svg';
import earthSvg from '../assets/svg/earth-svgrepo-com.svg';
import galleryEditSvg from '../assets/svg/gallery-edit-svgrepo-com.svg';
import gallerySvg from '../assets/svg/gallery-svgrepo-com.svg';
import maximizeSvg from '../assets/svg/maximize-square-svgrepo-com.svg';
import homeSvg from '../assets/svg/home-svgrepo-com.svg';
import chartSquareSvg from '../assets/svg/chart-square-svgrepo-com.svg';
import cropSvg from '../assets/svg/crop-minimalistic-svgrepo-com.svg';
import magicStickSvg from '../assets/svg/magic-stick-3-svgrepo-com.svg';
import stickerSmileSvg from '../assets/svg/sticker-smile-circle-2-svgrepo-com.svg';
import plusSvg from '../assets/svg/plus-svgrepo-com.svg';
import tuningSvg from '../assets/svg/tuning-2-svgrepo-com.svg';
import geminiOutlineSvg from '../assets/svg/gemini.svg';
import geminiFilledSvg from '../assets/svg/gemini (1).svg';
import shopSvg from '../assets/svg/shop-svgrepo-com.svg';
import bananaSvg from '../assets/svg/banana-illustration-svgrepo-com.svg';
import groqOutlineSvg from '../assets/svg/groq.svg';
import groqFilledSvg from '../assets/svg/groq (1).svg';
import facebookSvg from '../assets/svg/facebook.svg';
import googleSvg from '../assets/svg/google.svg';
import stabilitySvg from '../assets/svg/stability.svg';

// Filled variants (1) – shown on hover and when active
import homeFilledSvg from '../assets/svg/home-svgrepo-com (1).svg';
import clapperboardFilledSvg from '../assets/svg/clapperboard-edit-svgrepo-com (1).svg';
import galleryEditFilledSvg from '../assets/svg/gallery-edit-svgrepo-com (1).svg';
import chartSquareFilledSvg from '../assets/svg/chart-square-svgrepo-com (1).svg';
import calendarFilledSvg from '../assets/svg/calendar-add-svgrepo-com (1).svg';
import magicStickFilledSvg from '../assets/svg/magic-stick-3-svgrepo-com (1).svg';
import lightbulbFilledSvg from '../assets/svg/lightbulb-bolt-svgrepo-com (1).svg';
import layersFilledSvg from '../assets/svg/layers-minimalistic-svgrepo-com (1).svg';
import trashFilledSvg from '../assets/svg/trash-bin-2-svgrepo-com (1).svg';
import plusCircleFilledSvg from '../assets/svg/plus-circle-svgrepo-com (1).svg';
import stickerSmileFilledSvg from '../assets/svg/sticker-smile-circle-2-svgrepo-com (1).svg';
import boxFilledSvg from '../assets/svg/box-minimalistic-svgrepo-com (1).svg';
import clapperboardPlayFilledSvg from '../assets/svg/clapperboard-play-svgrepo-com (1).svg';
import galleryFilledSvg from '../assets/svg/gallery-svgrepo-com (1).svg';
import notebookFilledSvg from '../assets/svg/notebook-svgrepo-com (1).svg';
import pipFilledSvg from '../assets/svg/pip-svgrepo-com (1).svg';
import tuningFilledSvg from '../assets/svg/tuning-2-svgrepo-com (1).svg';
import clockFilledSvg from '../assets/svg/clock-circle-svgrepo-com (1).svg';
import shopFilledSvg from '../assets/svg/shop-svgrepo-com (1).svg';

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

/** Outline by default; shows filled on group-hover or when isActive. Parent must have class "group". */
const DualSvgIcon = ({ outlineSrc, filledSrc, size = 24, className = "", isActive = false }) => {
    const imgClass = "transition-opacity duration-200 pointer-events-none object-contain object-center";
    const baseStyle = { display: 'block', width: size, height: size, filter: 'currentColor' };
    return (
        <span className="relative inline-block shrink-0" style={{ width: size, height: size }}>
            <img
                src={outlineSrc}
                alt=""
                style={{ ...baseStyle, position: 'absolute', left: 0, top: 0 }}
                className={`${imgClass} ${isActive ? 'opacity-0' : 'opacity-100 group-hover:opacity-0'} ${className}`}
            />
            <img
                src={filledSrc}
                alt=""
                style={{ ...baseStyle, position: 'absolute', left: 0, top: 0 }}
                className={`${imgClass} opacity-0 ${isActive ? 'opacity-100' : 'group-hover:opacity-100'} ${className}`}
            />
        </span>
    );
};

export const Icons = {
    // SVG Assets – use imported URLs so production build serves correct paths
    Logo: (props) => <SvgIcon src={logoSvg} {...props} />,
    Bell: (props) => <SvgIcon src={bellSvg} {...props} />,
    Box: (props) => <DualSvgIcon outlineSrc={boxSvg} filledSrc={boxFilledSvg} isActive={props.isActive} {...props} />,
    Calendar: (props) => <DualSvgIcon outlineSrc={calendarSvg} filledSrc={calendarFilledSvg} isActive={props.isActive} {...props} />,
    Clapperboard: (props) => <DualSvgIcon outlineSrc={clapperboardSvg} filledSrc={clapperboardFilledSvg} isActive={props.isActive} {...props} />,
    ClapperboardPlay: (props) => <DualSvgIcon outlineSrc={clapperboardPlaySvg} filledSrc={clapperboardPlayFilledSvg} isActive={props.isActive} {...props} />,
    Clock: (props) => <DualSvgIcon outlineSrc={clockSvg} filledSrc={clockFilledSvg} isActive={props.isActive} {...props} />,
    Copy: (props) => <SvgIcon src={copySvg} {...props} />,
    Download: (props) => <SvgIcon src={downloadSvg} {...props} />,
    Eye: (props) => <SvgIcon src={eyeSvg} {...props} />,
    Heart: (props) => <SvgIcon src={heartSvg} {...props} />,
    Layers: (props) => <DualSvgIcon outlineSrc={layersSvg} filledSrc={layersFilledSvg} isActive={props.isActive} {...props} />,
    Lightbulb: (props) => <DualSvgIcon outlineSrc={lightbulbSvg} filledSrc={lightbulbFilledSvg} isActive={props.isActive} {...props} />,
    Link: (props) => <SvgIcon src={linkSvg} {...props} />,
    LogOut: (props) => <SvgIcon src={logoutSvg} {...props} />,
    Mic: (props) => <SvgIcon src={micSvg} {...props} />,
    Moon: (props) => <SvgIcon src={moonSvg} {...props} />,
    Notebook: (props) => <DualSvgIcon outlineSrc={notebookSvg} filledSrc={notebookFilledSvg} isActive={props.isActive} {...props} />,
    PieChart: (props) => <SvgIcon src={pieChartSvg} {...props} />,
    Pin: (props) => <SvgIcon src={pinSvg} {...props} />,
    Pip: (props) => <DualSvgIcon outlineSrc={pipSvg} filledSrc={pipFilledSvg} isActive={props.isActive} {...props} />,
    RefreshCw: (props) => <SvgIcon src={refreshSvg} {...props} />,
    Share2: (props) => <SvgIcon src={shareSvg} {...props} />,
    Sliders: (props) => <SvgIcon src={slidersSvg} {...props} />,
    Sun: (props) => <SvgIcon src={sunSvg} {...props} />,
    Trash2: (props) => <DualSvgIcon outlineSrc={trashSvg} filledSrc={trashFilledSvg} isActive={props.isActive} {...props} />,
    User: (props) => <SvgIcon src={userSvg} {...props} />,
    Video: (props) => <LucideIcon icon="Video" {...props} />,
    Filter: (props) => <SvgIcon src={filterSvg} {...props} />,
    Globe: (props) => <SvgIcon src={earthSvg} {...props} />,
    Image: (props) => <DualSvgIcon outlineSrc={galleryEditSvg} filledSrc={galleryEditFilledSvg} isActive={props.isActive} {...props} />,
    Gallery: (props) => <DualSvgIcon outlineSrc={gallerySvg} filledSrc={galleryFilledSvg} isActive={props.isActive} {...props} />,
    Maximize2: (props) => <SvgIcon src={maximizeSvg} {...props} />,
    Home: (props) => <DualSvgIcon outlineSrc={homeSvg} filledSrc={homeFilledSvg} isActive={props.isActive} {...props} />,
    BarChart2: (props) => <DualSvgIcon outlineSrc={chartSquareSvg} filledSrc={chartSquareFilledSvg} isActive={props.isActive} {...props} />,
    Ratio: (props) => <SvgIcon src={cropSvg} {...props} />,
    Crop: (props) => <SvgIcon src={cropSvg} {...props} />,
    Wand2: (props) => <DualSvgIcon outlineSrc={magicStickSvg} filledSrc={magicStickFilledSvg} isActive={props.isActive} {...props} />,
    Users: (props) => <DualSvgIcon outlineSrc={stickerSmileSvg} filledSrc={stickerSmileFilledSvg} isActive={props.isActive} {...props} />,
    Cloud: (props) => <DualSvgIcon outlineSrc={layersSvg} filledSrc={layersFilledSvg} isActive={props.isActive} {...props} />,
    PlusCircle: (props) => <DualSvgIcon outlineSrc={plusSvg} filledSrc={plusCircleFilledSvg} isActive={props.isActive} {...props} />,
    PlusSimple: (props) => <SvgIcon src={plusSvg} {...props} />,
    TuningSquare: (props) => <DualSvgIcon outlineSrc={tuningSvg} filledSrc={tuningFilledSvg} isActive={props.isActive} {...props} />,
    Gemini: (props) => <DualSvgIcon outlineSrc={geminiOutlineSvg} filledSrc={geminiFilledSvg} isActive={props.isActive} {...props} />,
    Shop: (props) => <DualSvgIcon outlineSrc={shopSvg} filledSrc={shopFilledSvg} isActive={props.isActive} {...props} />,
    Banana: (props) => <SvgIcon src={bananaSvg} {...props} />,
    Groq: (props) => <DualSvgIcon outlineSrc={groqOutlineSvg} filledSrc={groqFilledSvg} isActive={props.isActive} {...props} />,
    Facebook: (props) => <SvgIcon src={facebookSvg} {...props} />,
    Google: (props) => <SvgIcon src={googleSvg} {...props} />,
    Stability: (props) => <SvgIcon src={stabilitySvg} {...props} />,

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
    ChevronUp: (props) => <LucideIcon icon="ChevronUp" {...props} />,
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
