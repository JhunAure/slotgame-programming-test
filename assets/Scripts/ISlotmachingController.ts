import { SlotConfig } from "./SlotmachineManager";

export interface ISlotmachineController {
    onReelSpinCompleted();
    onReelMatchCompleted();
    getConfig(): SlotConfig;
}