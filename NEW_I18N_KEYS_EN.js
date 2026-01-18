// ============================================
// NEW I18N KEYS TO ADD TO translations.js
// Insert BEFORE line 628 (before closing "}" of en object)
// ============================================

// Dashboard Home
dashboard: {
    greeting: {
        goodMorning: 'Good morning',
            goodAfternoon: 'Good afternoon',
                goodEvening: 'Good evening',
                    creator: 'Creator',
      },
    subtitle: "Here is what's happening in your studio today.",

        // Metrics
        metrics: {
        contentGenerated: {
            label: 'Content Generated',
                thisWeek: 'This week',
                    lastSevenDays: 'Last 7 days',
                        total: 'total',
        },
        activeTools: {
            label: 'Active Tools Used',
                differentTools: 'Different tools',
                    toolsTried: "Tools you've tried",
        },
        successRate: {
            label: 'Success Rate',
                qualityOutput: 'Quality output',
                    projectsCompleted: 'Projects completed',
        },
        creditsRemaining: {
            label: 'Credits Remaining',
                tokensLeft: 'tokens left',
                    dailyAllowance: 'Daily allowance',
        },
    },

    // Recent Activity
    recentActivity: {
        title: 'Recent Activity',
            viewProjects: 'View Projects',
                emptyTitle: 'Quiet in the studio',
                    emptyDescription: 'Your creative pulse is waiting for its first beat. Launch a tool to begin synthesizing intelligence.',
                        startProject: 'Start First Project',
                            tableHeaders: {
            project: 'Project',
                type: 'Type',
                    date: 'Date',
        },
    },

    // Studio Pulse
    studioPulse: {
        title: 'Studio Pulse',
            noActivity: 'No activity yet',
                noActivityHint: 'Generate content to see your studio pulse here.',
                    viewAuditLog: 'View Full Audit Log',
                        activityTypes: {
            contentGenerated: 'CONTENT GENERATED',
                creditsUpdated: 'CREDITS UPDATED',
                    newLogin: 'NEW LOGIN',
                        imageExported: 'IMAGE EXPORTED',
        },
    },

    // Launchpad
    launchpad: {
        title: 'Launchpad',
            allTools: 'All Tools',
      },
},

// Command Center
commandCenter: {
    title: 'Command Center',
        subtitle: 'Access the full depth of CreatorAI tools.',
            searchPlaceholder: 'Search tools, capabilities...',

                filters: {
        all: 'All',
            text: 'Text',
                image: 'Image',
                    social: 'Social',
                        strategy: 'Strategy',
      },

    emptyState: {
        title: 'No matching tools found',
            description: 'Try adjusting your keywords or clearing the category filter.',
                clearFilters: 'Clear All Filters',
      },
},

// Projects Page
projectsPage: {
    title: 'Your Projects',
        subtitle: 'Manage and organize your generated content.',
            itemCount: 'Items',

                tableHeaders: {
        projectName: 'Project Name / Prompt',
            tool: 'Tool',
                type: 'Type',
                    date: 'Date',
                        actions: 'Actions',
      },

    actions: {
        copy: 'Copy',
            view: 'View',
                delete: 'Delete',
      },
},
