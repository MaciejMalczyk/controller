import { v4 as uuidv4 } from 'uuid';

class StateNumber {
    value: number;
    event: string;
    eventE: Event;
    
    constructor(value: number) {
        this.value = value;
        this.event = uuidv4();
        this.eventE = new Event(this.event);
    }
    setValue(value: number) {
        this.value = value;
        dispatchEvent(this.eventE);
    }
}

export default StateNumber
