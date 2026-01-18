import { X, Calendar, Mail, Image, Rocket, FileText, MessageSquare } from 'lucide-react';

const PROJECT_TEMPLATES = [
    {
        id: 'content-calendar',
        name: 'Content Calendar',
        description: 'Plan your month with ease',
        icon: Calendar,
        color: 'blue',
        includes: [
            '4 blog post outlines',
            '16 social media posts',
            'Editorial calendar template',
            'Content tracking sheet'
        ],
        thumbnail: '/templates/calendar.png'
    },
    {
        id: 'social-campaign',
        name: 'Social Campaign',
        description: 'Launch your social presence',
        icon: MessageSquare,
        color: 'purple',
        includes: [
            '10 social post variations',
            '5 image concepts',
            'Hashtag strategy',
            'Posting schedule'
        ],
        thumbnail: '/templates/social.png'
    },
    {
        id: 'email-sequence',
        name: 'Email Sequence',
        description: 'Nurture your audience',
        icon: Mail,
        color: 'green',
        includes: [
            '5-email welcome series',
            'Subject line variations',
            'CTA templates',
            'A/B testing suggestions'
        ],
        thumbnail: '/templates/email.png'
    },
    {
        id: 'product-launch',
        name: 'Product Launch',
        description: 'Go-to-market strategy',
        icon: Rocket,
        color: 'orange',
        includes: [
            'Press release draft',
            'Social announcement posts',
            'Landing page copy',
            'Launch timeline'
        ],
        thumbnail: '/templates/launch.png'
    },
    {
        id: 'blog-series',
        name: 'Blog Series',
        description: 'Multi-part content strategy',
        icon: FileText,
        color: 'indigo',
        includes: [
            '5 interconnected articles',
            'SEO keyword research',
            'Internal linking plan',
            'Promotion strategy'
        ],
        thumbnail: '/templates/blog.png'
    },
    {
        id: 'visual-brand',
        name: 'Visual Brand Kit',
        description: 'Consistent brand assets',
        icon: Image,
        color: 'pink',
        includes: [
            '10 branded templates',
            'Color palette guide',
            'Typography system',
            'Logo variations'
        ],
        thumbnail: '/templates/brand.png'
    }
];

const colorClasses = {
    blue: {
        bg: 'bg-blue-50',
        text: 'text-blue-600',
        border: 'border-blue-200',
        hover: 'hover:border-blue-400',
        gradient: 'from-blue-500 to-blue-600'
    },
    purple: {
        bg: 'bg-purple-50',
        text: 'text-purple-600',
        border: 'border-purple-200',
        hover: 'hover:border-purple-400',
        gradient: 'from-purple-500 to-purple-600'
    },
    green: {
        bg: 'bg-green-50',
        text: 'text-green-600',
        border: 'border-green-200',
        hover: 'hover:border-green-400',
        gradient: 'from-green-500 to-green-600'
    },
    orange: {
        bg: 'bg-orange-50',
        text: 'text-orange-600',
        border: 'border-orange-200',
        hover: 'hover:border-orange-400',
        gradient: 'from-orange-500 to-orange-600'
    },
    indigo: {
        bg: 'bg-indigo-50',
        text: 'text-indigo-600',
        border: 'border-indigo-200',
        hover: 'hover:border-indigo-400',
        gradient: 'from-indigo-500 to-indigo-600'
    },
    pink: {
        bg: 'bg-pink-50',
        text: 'text-pink-600',
        border: 'border-pink-200',
        hover: 'hover:border-pink-400',
        gradient: 'from-pink-500 to-pink-600'
    }
};

export default function TemplateGalleryModal({ onClose, onSelectTemplate }) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-200 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-serif font-bold text-gray-900">
                            Project Templates
                        </h2>
                        <p className="text-gray-600 mt-1">
                            Start with a pre-built structure and customize it to your needs
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                {/* Template Grid */}
                <div className="flex-1 overflow-y-auto p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {PROJECT_TEMPLATES.map((template) => (
                            <TemplateCard
                                key={template.id}
                                template={template}
                                onSelect={() => onSelectTemplate(template)}
                            />
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-8 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                        Can't find what you need? Create a blank project and customize it.
                    </p>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}

function TemplateCard({ template, onSelect }) {
    const Icon = template.icon;
    const colors = colorClasses[template.color];

    return (
        <div
            className={`bg-white border-2 ${colors.border} ${colors.hover} rounded-xl overflow-hidden transition-all transform hover:scale-105 hover:shadow-lg cursor-pointer`}
            onClick={onSelect}
        >
            {/* Icon Header */}
            <div className={`h-32 bg-gradient-to-br ${colors.gradient} flex items-center justify-center relative overflow-hidden`}>
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -mr-16 -mt-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full -ml-12 -mb-12"></div>
                </div>
                <Icon className="w-16 h-16 text-white relative z-10" />
            </div>

            {/* Content */}
            <div className="p-5">
                <h3 className="font-bold text-gray-900 text-lg mb-1">
                    {template.name}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                    {template.description}
                </p>

                {/* Includes List */}
                <div className="space-y-2 mb-4">
                    <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                        Includes:
                    </p>
                    <ul className="space-y-1">
                        {template.includes.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                                <span className={`mt-1 w-1 h-1 rounded-full ${colors.bg} flex-shrink-0`}></span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* CTA Button */}
                <button
                    className={`w-full py-2.5 ${colors.bg} ${colors.text} font-semibold rounded-lg hover:opacity-80 transition-opacity`}
                >
                    Use Template
                </button>
            </div>
        </div>
    );
}
