
const UPDATE_INTERVAL = 2 * 60 * 60 * 1000;

export let savedSchedule = {
    schedule: null,
    updatedAt: null,
}

export const updateSchedule = (schedule) => {
    savedSchedule = {
        schedule: schedule,
        updatedAt: Date.now(),
    }
}

export const needToUpdateSchedule = () => {
    const currentStamp = Date.now();

    if (savedSchedule.updatedAt === null) return true;

    const elapcedTime = currentStamp - savedSchedule.updatedAt;

    return elapcedTime >= UPDATE_INTERVAL
}
