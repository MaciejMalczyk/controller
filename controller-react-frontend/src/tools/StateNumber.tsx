class StateNumber {
    value: number;
    event: string;
    eventE: Event;
    
    constructor(value: number) {
        this.value = value;
        this.event = crypto.randomUUID()
        this.eventE = new Event(this.event);
    }
    setValue(value: number) {
        this.value = value;
        dispatchEvent(this.eventE);
    }
}

export default StateNumber
