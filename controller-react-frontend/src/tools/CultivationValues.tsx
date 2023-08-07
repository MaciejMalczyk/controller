import StateNumber from '../tools/StateNumber';

interface CultivationValuesInterface {
    [key: string]: {
        value: StateNumber;
        enabled: StateNumber;
    };
} 

let CultivationValues: CultivationValuesInterface = {
    'light': {
        value: new StateNumber(0),
        enabled: new StateNumber(0),
    },
    'pump_ton': {
        value: new StateNumber(0),
        enabled: new StateNumber(0),
    },
    'pump_toff': {
        value: new StateNumber(0),
        enabled: new StateNumber(0),
    },
}

export default CultivationValues;
