# I18N Audit Report - Multi-language Support

## 📋 Current Status

This document identifies all hardcoded text in the application that needs translation support for English/Vietnamese.

---

## 🔍 Files Requiring I18N Updates

### 1. **DashboardHome.jsx** ❌ NOT USING i18n

**Hardcoded English Text Found:**

#### Greeting Section:
- `"{greeting}, Creator."` (line 184)
- `"Here is what's happening in your studio today."` (line 186)

#### Metrics Cards:
- `"Content Generated"` (line 192, 198)
- `"This week"` (line 200)
- `"Last 7 days"` (line 201)
- `"Active Tools Used"` (line 207, 213)
- `"Different tools"` (line 216)
- `"Tools you've tried"` (line 217)
- `"Success Rate"` (line 222, 228)
- `"Quality output"` (line 231)
- `"Projects completed"` (line 232)
- `"Credits Remaining"` (line 237, 243)
- `"tokens left"` (line 246)
- `"Daily allowance"` (line 247)

#### Recent Activity Section:
- `"Recent Activity"` (line 268)
- `"View Projects"` (line 271)
- `"Quiet in the studio"` (line 283)
- `"Your creative pulse is waiting for its first beat..."` (line 285)
- `"Start First Project"` (line 299)
- `"Project"` (line 324)
- `"Type"` (line 325)
- `"Date"` (line 326)

#### Studio Pulse:
- `"Studio Pulse"` (line 370)
- `"No activity yet"` (line 375)
- `"Generate content to see your studio pulse here."` (line 376)
- `"View Full Audit Log"` (line 410)

#### Launchpad:
- `"Launchpad"` (line 418)
- Tool names and descriptions (lines 424-461)

---

### 2. **Home.jsx** (Command Center) ❌ NOT USING i18n

**Hardcoded English Text Found:**

#### Command Center:
- `"Command Center"` (line 328)
- `"Access the full depth of CreatorAI tools."` (line 331)
- `"Search tools, capabilities..."` (placeholder, line 337)

#### Category Filters:
- `"All"` (line 351)
- `"Text"` (line 351)
- `"Image"` (line 351)
- `"Social"` (line 351)
- `"Strategy"` (line 351)

#### Empty State:
- `"No matching tools found"` (line 447)
- `"Try adjusting your keywords or clearing the category filter."` (line 448)
- `"Clear All Filters"` (line 455)

#### Projects Section:
- `"Your Projects"` (line 475)
- `"Manage and organize your generated content."` (line 476)
- `" Items"` (line 479)

---

### 3. **ProjectList.jsx** ✅ PARTIALLY USING i18n

**Issues:**
- Uses `t?.projects?.searchPlaceholder` but many fallback strings are in English
- Filter buttons use hardcoded `'all'`, `'text'`, `'image'`
- Table headers are hardcoded in ProjectTable component

**Needs Translation:**
- `"Project Name / Prompt"` (line 208)
- `"Tool"` (line 209)  
- `"Type"` (line 210)
- `"Date"` (line 211)
- `"Actions"` (line 212)
- Button text: `"Copy"`, `"View"` (lines 190-191)

---

### 4. **EmptyState.jsx** ✅ USING i18n

**Status:** Good! Already using `useLanguage` hook with proper translations.

---

## 📝 Required Translation Keys

### **dashboard** (new section needed in translations.js)

```javascript
dashboard: {
  // Greeting
  greeting: {
    morning: "Good morning",
    afternoon: "Good afternoon",  
    evening: "Good evening",
    creator: "Creator"
  },
  subtitle: "Here is what's happening in your studio today.",
  
  // Metrics
  metrics: {
    contentGenerated: {
      label: "Content Generated",
      thisWeek: "This week",
      lastSevenDays: "Last 7 days",
      total: "total"
    },
    activeTools: {
      label: "Active Tools Used",
      differentTools: "Different tools",
      toolsTried: "Tools you've tried"
    },
    successRate: {
      label: "Success Rate",
      qualityOutput: "Quality output",
      projectsCompleted: "Projects completed"
    },
    creditsRemaining: {
      label: "Credits Remaining",
      tokensLeft: "tokens left",
      dailyAllowance: "Daily allowance"
    }
  },
  
  // Recent Activity
  recentActivity: {
    title: "Recent Activity",
    viewProjects: "View Projects",
    emptyTitle: "Quiet in the studio",
    emptyDescription: "Your creative pulse is waiting for its first beat. Launch a tool to begin synthesizing intelligence.",
    startProject: "Start First Project",
    tableHeaders: {
      project: "Project",
      type: "Type",
      date: "Date"
    }
  },
  
  // Studio Pulse
  studioPulse: {
    title: "Studio Pulse",
    noActivity: "No activity yet",
    noActivityHint: "Generate content to see your studio pulse here.",
    viewAuditLog: "View Full Audit Log"
  },
  
  // Launchpad
  launchpad: {
    title: "Launchpad",
    allTools: "All Tools"
  }
}
```

### **commandCenter** (new section)

```javascript
commandCenter: {
  title: "Command Center",
  subtitle: "Access the full depth of CreatorAI tools.",
  searchPlaceholder: "Search tools, capabilities...",
  
  filters: {
    all: "All",
    text: "Text",
    image: "Image",
    social: "Social",
    strategy: "Strategy"
  },
  
  emptyState: {
    title: "No matching tools found",
    description: "Try adjusting your keywords or clearing the category filter.",
    clearFilters: "Clear All Filters"
  }
}
```

### **projectsPage** (new section)

```javascript
projectsPage: {
  title: "Your Projects",
  subtitle: "Manage and organize your generated content.",
  itemCount: "Items",
  
  tableHeaders: {
    projectName: "Project Name / Prompt",
    tool: "Tool",
    type: "Type",
    date: "Date",
    actions: "Actions"
  },
  
  actions: {
    copy: "Copy",
    view: "View",
    delete: "Delete"
  }
}
```

---

## 🔧 Implementation Steps

### Step 1: Add Translation Keys

Add the above sections to `frontend/src/i18n/translations.js`:

1. **English** section (under `en` object)
2. **Vietnamese** section (under `vi` object)

### Step 2: Update Components

For each component, add `useLanguage` hook:

```javascript
import { useLanguage } from '../../contexts/LanguageContext';

const Component = () => {
  const { t } = useLanguage();
  
  // Use translations
  <h2>{t.dashboard.greeting.morning}, {t.dashboard.greeting.creator}.</h2>
};
```

### Step 3: Replace Hardcoded Text

**Example for DashboardHome.jsx:**

```javascript
// Before
<h2>{greeting}, Creator.</h2>

// After  
<h2>{greeting}, {t.dashboard.greeting.creator}.</h2>
```

### Step 4: Add Vietnamese Translations

```javascript
vi: {
  dashboard: {
    greeting: {
      morning: "Chào buổi sáng",
      afternoon: "Chào buổi chiều",
      evening: "Chào buổi tối",
      creator: "Người Sáng Tạo"
    },
    subtitle: "Đây là những gì đang xảy ra trong studio của bạn hôm nay.",
    // ... rest of translations
  }
}
```

---

## 📊 Priority Order

### High Priority: ✅
1. **DashboardHome.jsx** - Main dashboard, most visible
2. **Home.jsx** (Command Center) - Tool discovery
3. **ProjectList.jsx** - Project management

### Medium Priority: ⚠️
4. EnhancedMetrics.jsx - If it has hardcoded text
5. BillingPlans.jsx - Payment page
6. ProfileSettings.jsx - User settings

### Low Priority: ℹ️
7. Other utility components
8. Error messages
9. Tooltips

---

## ✅ Testing Checklist

After implementation:

- [ ] Dashboard shows correct language on load
- [ ] Language toggle works instantly
- [ ] All metrics labels translate
- [ ] Empty states show in correct language
- [ ] Table headers translate
- [ ] Button text translates
- [ ] Tooltips translate
- [ ] Error messages translate
- [ ] No missing translation warnings in console
- [ ] Vietnamese diacritics display correctly
- [ ] Text doesn't overflow in either language

---

## 🎯 Expected Outcome

**English:**
```
Good morning, Creator.
Here is what's happening in your studio today.

Content Generated: 12
Active Tools Used: 5
```

**Vietnamese:**
```
Chào buổi sáng, Người Sáng Tạo.
Đây là những gì đang xảy ra trong studio của bạn hôm nay.

Đã Tạo Nội Dung: 12
Công Cụ Đang Dùng: 5
```

---

## 📝 Notes

1. **Greeting Time Logic:**
   - Already implemented in DashboardHome
   - Just needs to use translated strings

2. **Tool Names:**
   - Tools already have `name` and `name_vi` in constants
   - No changes needed there

3. **Dynamic Content:**
   - Numbers, dates don't need translation
   - Format may need localization (future enhancement)

4. **Fallbacks:**
   - Always provide English fallback with `||`
   - Example: `{t.dashboard?.title || "Dashboard"}`

---

## 🚀 Next Actions

1. ✅ Add all translation keys to translations.js
2. ✅ Update DashboardHome.jsx to use i18n
3. ✅ Update Home.jsx (Command Center) to use i18n
4. ✅ Complete ProjectList.jsx i18n
5. ✅ Test language switching
6. ✅ Verify Vietnamese displays correctly

---

**Status:** 🔴 **Action Required**
**Priority:** 🔥 **High** - User-facing text
**Effort:** ⏱️ ~ 2 hours to complete all

Would you like me to proceed with implementing these changes?
