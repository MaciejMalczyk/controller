import StateNumber from '../tools/StateNumber';

let MotorValues: { [key: string]: StateNumber } = {
    vel1: new StateNumber(0),
    vel2: new StateNumber(0),
}

export default MotorValues;
