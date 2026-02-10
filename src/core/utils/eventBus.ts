type EventType = 'FEATURES_UPDATED'

const listeners: { [key in EventType]?: (() => void)[] } = {}

export const eventBus = {
    on(event: EventType, callback: () => void) {
        if (!listeners[event]) listeners[event] = []
        listeners[event]!.push(callback)
    },
    off(event: EventType, callback: () => void) {
        listeners[event] = listeners[event]?.filter(cb => cb !== callback)
    },
    emit(event: EventType) {
        listeners[event]?.forEach(cb => cb())
    },
}