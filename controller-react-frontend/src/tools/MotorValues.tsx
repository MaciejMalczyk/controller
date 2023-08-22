import StateNumber from '../tools/StateNumber';
import StateBool from '../tools/StateBool';

interface MotorValuesInterface {
    [key: number]: {
        velocity: StateNumber;
        enabled: StateBool;
    };
} 

let MotorValues: MotorValuesInterface = {
    0: {
        velocity: new StateNumber(0),
        enabled: new StateBool(false),
    },
    1: {
        velocity: new StateNumber(0),
        enabled: new StateBool(false),
    },
}

export default MotorValues;
