import StateNumber from '../tools/StateNumber';

interface MotorValuesInterface {
    [key: number]: {
        velocity: StateNumber;
        enabled: StateNumber;
    };
} 

let MotorValues: MotorValuesInterface = {
    0: {
        velocity: new StateNumber(0),
        enabled: new StateNumber(0),
    },
    1: {
        velocity: new StateNumber(0),
        enabled: new StateNumber(0),
    },
}

export default MotorValues;
