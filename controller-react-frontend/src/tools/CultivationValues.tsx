import StateNumber from '../tools/StateNumber';
import StateBool from '../tools/StateBool';

interface CultivationValuesInterface {
    [key: string]: {
        value: StateNumber;
        enabled: StateBool;
    };
} 

let CultivationValues: CultivationValuesInterface = {
    'light': {
        value: new StateNumber(0),
        enabled: new StateBool(false),
    },
    'pump_ton': {
        value: new StateNumber(0),
        enabled: new StateBool(false),
    },
    'pump_toff': {
        value: new StateNumber(0),
        enabled: new StateBool(false),
    },
}

export default CultivationValues;
