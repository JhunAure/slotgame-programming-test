import { SlotConfig } from "../Managers/SlotmachineManager";

export interface ISlotmachineController {
    onReelSpinCompleted();
    onReelMatchCompleted();
    getConfig(): SlotConfig;
}