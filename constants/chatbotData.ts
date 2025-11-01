export const chatbotResponses: { keywords: string[], response: string }[] = [
    {
        keywords: ["free", "price", "cost", "pricing"],
        response: "FocusFlow is currently completely free to use during its early access period. We may introduce a fair pricing model in the future to support development."
    },
    {
        keywords: ["data", "stored", "storage", "privacy", "where"],
        response: "Your data is stored exclusively on your device in your browser's local storage (IndexedDB). We do not have access to your data, ensuring it remains private and secure."
    },
    {
        keywords: ["backup", "export", "save"],
        response: "You can back up your data by going to Settings and using the 'Export Data' feature. This will save all your information to a JSON file. We highly recommend doing this regularly!"
    },
    {
        keywords: ["delete", "clear", "browser data", "lost"],
        response: "Clearing your browser's site data for FocusFlow will permanently delete all your data. Please use the backup feature in Settings to prevent data loss."
    },
    {
        keywords: ["mobile", "app", "ios", "android", "install"],
        response: "FocusFlow is a Progressive Web App (PWA). You can install it on your phone, tablet, or desktop by using the 'Add to Home Screen' or 'Install App' option in your browser menu."
    },
    {
        keywords: ["task", "tasks"],
        response: "You can manage your to-do lists, set priorities, due dates, and even create sub-tasks and recurring tasks in the Tasks section."
    },
    {
        keywords: ["note", "journal"],
        response: "The Notes & Journal sections feature a rich text editor for your thoughts. You can organize them with folders, and notes also support tags."
    },
    {
        keywords: ["goal", "habit"],
        response: "You can track daily habits to build streaks and set long-term, measurable goals to monitor your progress over time in the Goals section."
    }
];

export const defaultResponse = "I'm sorry, I can only answer questions about FocusFlow's features, data storage, and pricing. Could you please rephrase your question? You can also find detailed information on the Help & Guides page.";