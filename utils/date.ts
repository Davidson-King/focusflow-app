/**
 * Date utility functions.
 * All functions operate in the user's local timezone unless otherwise specified.
 */

/**
 * Returns the date part of a Date object as a 'YYYY-MM-DD' string,
 * reflecting the local timezone, not UTC.
 * @param date The date to format.
 */
export const getLocalISODateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export const getStartOfPreviousWeek = (): Date => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Get the date for the start of the current week (assuming Sunday is the first day)
    const startOfThisWeek = new Date(today);
    startOfThisWeek.setDate(today.getDate() - today.getDay());
    // The start of last week is 7 days before that
    const startOfLastWeek = new Date(startOfThisWeek);
    startOfLastWeek.setDate(startOfThisWeek.getDate() - 7);
    return startOfLastWeek;
};

export const getStartOfCurrentWeek = (): Date => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayOfWeek = today.getDay(); // 0 for Sunday, 1 for Monday, etc.
    const startOfThisWeek = new Date(today);
    startOfThisWeek.setDate(today.getDate() - dayOfWeek);
    return startOfThisWeek;
};

export const getPreviousWeekRange = (): { start: Date; end: Date } => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get the date for the start of the current week (assuming Sunday is the first day)
    const startOfThisWeek = new Date(today);
    startOfThisWeek.setDate(today.getDate() - today.getDay());

    // The end of last week is the day before the start of this week
    const endOfLastWeek = new Date(startOfThisWeek);
    endOfLastWeek.setDate(startOfThisWeek.getDate() - 1);
    endOfLastWeek.setHours(23, 59, 59, 999); // End of the day

    // The start of last week is 6 days before the end of last week
    const startOfLastWeek = new Date(endOfLastWeek);
    startOfLastWeek.setDate(endOfLastWeek.getDate() - 6);
    startOfLastWeek.setHours(0, 0, 0, 0); // Start of the day

    return { start: startOfLastWeek, end: endOfLastWeek };
};

export const startOfMonth = (date: Date): Date => {
    return new Date(date.getFullYear(), date.getMonth(), 1);
};

export const endOfMonth = (date: Date): Date => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
};

export const startOfWeek = (date: Date, weekStartsOn: number = 0 /* 0 = Sunday */): Date => {
    const d = new Date(date);
    d.setHours(0,0,0,0);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 && weekStartsOn === 1 ? -6 : weekStartsOn);
    return new Date(d.setDate(diff));
};

export const endOfWeek = (date: Date, weekStartsOn: number = 0): Date => {
    const d = startOfWeek(date, weekStartsOn);
    d.setDate(d.getDate() + 6);
    d.setHours(23, 59, 59, 999);
    return d;
};

export const addDays = (date: Date, days: number): Date => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
};