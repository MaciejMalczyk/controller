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
    'pump': {
        value: new StateNumber(0),
        enabled: new StateBool(false),
    },
    'pump_period_freq': {
        value: new StateNumber(0),
        enabled: new StateBool(false),
    },
    'pump_period_period': {
        value: new StateNumber(0),
        enabled: new StateBool(false),
    }
}

export default CultivationValues;
