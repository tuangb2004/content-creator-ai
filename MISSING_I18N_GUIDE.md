# Missing I18N Translations & Fixes

## Issues Found:

### 1. Activity Types không dùng i18n (DashboardHome.jsx)
Currently hardcoded in useMemo at lines 138-166:
- "CONTENT GENERATED" 
- "CREDITS UPDATED"
- "NEW LOGIN"
- "IMAGE EXPORTED"

### 2. Activity Details không dùng i18n
- "Chrome on Windows"
- "Plan upgrade: X"
- "Daily allowance added"
- Tool names/project info

### 3. Relative Time không dùng i18n (lines 69-74)
- "Just now"
- "X mins ago", "X hours ago", "X days ago"

### 4. Credits card trend text
- "90% used" etc

### 5. Toast notifications
- Low credits warnings

---

## Solution: Add translation keys

### A. Add to translations.js - English:

```javascript
dashboard: {
  // ... existing keys ...
  
  studioPulse: {
    // ... existing keys ...
    activityTypes: {
      contentGenerated: 'CONTENT GENERATED',
      creditsUpdated: 'CREDITS UPDATED',
      newLogin: 'NEW LOGIN',
      imageExported: 'IMAGE EXPORTED',
    },
    activityDetails: {
      planUpgrade: 'Plan upgrade',
      dailyAllowance: 'Daily allowance added',
      defaultPlatform: 'Chrome on Windows',
    },
  },
  
  time: {
    justNow: 'Just now',
    minutesAgo: 'mins ago',
    minute: 'min',
    hoursAgo: 'hours ago',
    hour: 'hour',
    daysAgo: 'days ago',
    day: 'day',
    ago: 'ago',
  },
  
  metrics: {
    creditsUsed: {
      label: 'Credits Used',
      percentUsed: 'used',
    },
  },
}
```

### B. Add to translations.js - Vietnamese:

```javascript
dashboard: {
  // ... existing keys ...
  
  studioPulse: {
    // ... existing keys ...
    activityTypes: {
      contentGenerated: 'ĐÃ TẠO NỘI DUNG',
      creditsUpdated: 'CẬP NHẬT CREDITS',
      newLogin: 'ĐĂNG NHẬP MỚI',
      imageExported: 'XUẤT HÌNH ẢNH',
    },
    activityDetails: {
      planUpgrade: 'Nâng cấp gói',
      dailyAllowance: 'Hạn mức hàng ngày đã được thêm',
      defaultPlatform: 'Chrome trên Windows',
    },
  },
  
  time: {
    justNow: 'Vừa xong',
    minutesAgo: 'phút trước',
    minute: 'phút',
    hoursAgo: 'giờ trước',
    hour: 'giờ',
    daysAgo: 'ngày trước',
    day: 'ngày',
    ago: 'trước',
  },
  
  metrics: {
    creditsUsed: {
      label: 'Credits Đã Dùng',
      percentUsed: 'đã dùng',
    },
  },
}
```

---

## C. Update DashboardHome.jsx

### 1. Add `t` to useMemo dependencies (line 77):

```javascript
const activities = useMemo(() => {
  // ... existing code
}, [logs, t]); // Add 't' here
```

### 2. Update activity titles (lines 138-166):

```javascript
if (action === 'generate_content') {
  eventType = 'content';
  title = t?.dashboard?.studioPulse?.activityTypes?.contentGenerated || 'CONTENT GENERATED';
  // ... rest
} else if (action === 'credits_updated') {
  eventType = 'credits';
  title = t?.dashboard?.studioPulse?.activityTypes?.creditsUpdated || 'CREDITS UPDATED';
  detail = metadata.reason || (metadata.planName 
    ? `${t?.dashboard?.studioPulse?.activityDetails?.planUpgrade || 'Plan upgrade'}: ${metadata.planName}` 
    : t?.dashboard?.studioPulse?.activityDetails?.dailyAllowance || 'Daily allowance added');
  // ...
} else if (action === 'user_login') {
  eventType = 'login';
  title = t?.dashboard?.studioPulse?.activityTypes?.newLogin || 'NEW LOGIN';
  detail = metadata.platform || t?.dashboard?.studioPulse?.activityDetails?.defaultPlatform || 'Chrome on Windows';
  // ...
} else if (action === 'image_exported') {
  eventType = 'export';
  title = t?.dashboard?.studioPulse?.activityTypes?.imageExported || 'IMAGE EXPORTED';
  // ...
}
```

### 3. Update formatRelativeTime function (lines 64-75):

```javascript
const formatRelativeTime = (date) => {
  const now = Date.now();
  const target = date instanceof Date ? date.getTime() : new Date(date).getTime();
  const diffMs = Math.max(0, now - target);
  const diffMinutes = Math.floor(diffMs / 60000);
  
  if (diffMinutes < 1) return t?.dashboard?.time?.justNow || 'Just now';
  
  if (diffMinutes < 60) {
    const unit = diffMinutes === 1 
      ? (t?.dashboard?.time?.minute || 'min')
      : (t?.dashboard?.time?.minutesAgo || 'mins ago');
    return `${diffMinutes} ${unit}`;
  }
  
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    const unit = diffHours === 1
      ? (t?.dashboard?.time?.hour || 'hour')
      : (t?.dashboard?.time?.hoursAgo || 'hours ago');
    return `${diffHours} ${unit}`;
  }
  
  const diffDays = Math.floor(diffHours / 24);
  const unit = diffDays === 1
    ? (t?.dashboard?.time?.day || 'day')
    : (t?.dashboard?.time?.daysAgo || 'days ago');
  return `${diffDays} ${unit}`;
};
```

---

## D. Fix "Credits Used" metric card

Check if you have "Credits Used" card - update label:
```javascript
label={t?.dashboard?.metrics?.creditsUsed?.label || "Credits Used"}
```

---

## Implementation Order:

1. ✅ Add translation keys to translations.js (both EN & VI)
2. ✅ Update DashboardHome.jsx - formatRelativeTime function
3. ✅ Update DashboardHome.jsx - activities useMemo
4. ✅ Test language toggle

---

**Note:** These are complex dynamic translations inside useMemo. Make sure to add `t` to dependencies!
