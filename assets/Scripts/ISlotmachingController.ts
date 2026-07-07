import { SlotConfig } from "./SlotmachineManager";

export interface ISlotmachineController {
    onReelSpinCompleted();
    getConfig(): SlotConfig;
}