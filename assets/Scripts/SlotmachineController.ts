import { _decorator, Button, Component, Label, Node, Toggle } from 'cc';
import { ReelController } from './ReelController';
import { ESlotState } from "./ESlotState";
import { SlotConfig, SlotmachineManager } from './SlotmachineManager';
const { ccclass, property } = _decorator;

@ccclass('SlotmachineController')
export class SlotmachineController extends Component implements ISlotmachineController {
    @property(ReelController) reels: ReelController[] = []
    @property(Button) spinButton: Button;
    @property(Label) spinButtonLabel: Label;
    @property(Toggle) autoSpinToggle: Toggle;

    private state: ESlotState = ESlotState.Idling;
    private slotConfig: SlotConfig;

    private reelCompletedSpin: number;

    protected onEnable() {
        this.spinButton?.node.on(Button.EventType.CLICK, this.onSpinButtonPressed, this);
    }

    protected onDisable(): void {
        this.spinButton?.node.off(Button.EventType.CLICK, this.onSpinButtonPressed, this);
    }

    protected start() {
        this.initialize();
    }

    private initialize() {
        this.slotConfig = SlotmachineManager.instance.getConfig();

        this.autoSpinToggle.isChecked = false;
        this.updateState(ESlotState.Idling);

        for (let i = 0; i < this.reels.length; i++) {
            this.reels[i].initialize(i, this);
        }
    }

    private onSpinButtonPressed() {
        if (this.state != ESlotState.Idling && this.state != ESlotState.Matching) {
            this.stopSpin();
            this.updateState(ESlotState.Idling);
        }
        else {
            this.updateState(this.autoSpinToggle.isChecked ? ESlotState.AutoSpinning : ESlotState.Spinning);
            this.startSpin();
        }
    }

    private startSpin() {
        this.reelCompletedSpin = 0;

        for (let i = 0; i < this.reels.length; i++) {
            this.reels[i].startSpin(this.autoSpinToggle.isChecked);
        }
    }

    private stopSpin() {
        for (let i = 0; i < this.reels.length; i++) {
            this.reels[i].stopSpin();
        }
    }

    private updateState(state: ESlotState) {
        this.state = state;
        this.spinButtonLabel.string = this.state === ESlotState.Idling ? "SPIN" : "STOP";
    }

    public onReelSpinCompleted() {
        this.reelCompletedSpin++;

        if (this.reelCompletedSpin >= this.reels.length) {
            for (let i = 0; i < this.reels.length; i++) {
                const reel = this.reels[i];
                reel.startMatching();
            }

            if (this.state === ESlotState.AutoSpinning) {
                this.startSpin();
            }
            else{
                this.updateState(ESlotState.Idling);
            }
        }
    }

    public getConfig(): SlotConfig {
        return this.slotConfig;
    }
}

export interface ISlotmachineController {
    onReelSpinCompleted();
    getConfig(): SlotConfig;
}