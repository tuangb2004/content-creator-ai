/**
 * @typedef {'Text' | 'Image' | 'Strategy' | 'Social'} ToolCategory
 */

/**
 * @typedef {Object} Tool
 * @property {string} id
 * @property {string} name
 * @property {string} [name_vi] - Vietnamese Name
 * @property {string} tagline
 * @property {string} [tagline_vi] - Vietnamese Tagline
 * @property {string} description
 * @property {string} [description_vi] - Vietnamese Description
 * @property {string} [longDescription]
 * @property {ToolCategory} category
 * @property {string} imageUrl
 * @property {string[]} features
 * @property {string} systemInstruction
 * @property {'text' | 'image_prompt'} inputType
 */

/**
 * @typedef {Object} GeneratedContent
 * @property {string} id
 * @property {string} toolName
 * @property {string} prompt
 * @property {string} result
 * @property {'text' | 'image'} type
 * @property {number} timestamp
 */

/**
 * @typedef {Object} JournalArticle
 * @property {number} id
 * @property {string} title
 * @property {string} [title_vi]
 * @property {string} date
 * @property {string} excerpt
 * @property {string} [excerpt_vi]
 * @property {string} image
 * @property {import('react').ReactNode} content
 * @property {import('react').ReactNode} [content_vi]
 */

/**
 * @typedef {Object} ChatMessage
 * @property {'user' | 'model'} role
 * @property {string} text
 * @property {number} timestamp
 */

/**
 * @typedef {Object} Product
 * @property {string} name
 * @property {number} price
 * @property {string} imageUrl
 * @property {string} category
 */

/**
 * @typedef {Object} ViewStateHome
 * @property {'home'} type
 */

/**
 * @typedef {Object} ViewStateToolPreview
 * @property {'tool_preview'} type
 * @property {Tool} tool
 */

/**
 * @typedef {Object} ViewStateWorkspace
 * @property {'workspace'} type
 * @property {Tool} tool
 */

/**
 * @typedef {Object} ViewStateJournal
 * @property {'journal'} type
 * @property {JournalArticle} article
 */

/**
 * @typedef {Object} ViewStateTerms
 * @property {'terms'} type
 */

/**
 * @typedef {Object} ViewStatePrivacy
 * @property {'privacy'} type
 */

/**
 * @typedef {ViewStateHome | ViewStateToolPreview | ViewStateWorkspace | ViewStateJournal | ViewStateTerms | ViewStatePrivacy} ViewState
 */

export {};
