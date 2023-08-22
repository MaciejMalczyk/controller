import { v4 as uuidv4 } from 'uuid';

class StateBool {
    value: boolean;
    event: string;
    eventE: Event;
    
    constructor(value: boolean) {
        this.value = value;
        this.event = uuidv4();
        this.eventE = new Event(this.event);
    }
    setValue(value: boolean) {
        this.value = value;
        dispatchEvent(this.eventE);
    }
}

export default StateBool
