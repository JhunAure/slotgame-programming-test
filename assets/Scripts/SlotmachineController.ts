import { _decorator, Button, Component, Label, Node } from 'cc';
import { ReelController } from './ReelController';
import { ESlotState } from "./ESlotState";
import { SlotConfig, SlotmachineManager } from './SlotmachineManager';
const { ccclass, property } = _decorator;

@ccclass('SlotmachineController')
export class SlotmachineController extends Component {

    @property(ReelController) reels: ReelController[] = []
    @property(Button) spinButton: Button;
    @property(Label) spinButtonLabel: Label;

    private state: ESlotState = ESlotState.Idling;
    private slotConfig: SlotConfig;

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

        this.updateState(ESlotState.Idling);

        for (let i = 0; i < this.reels.length; i++) {
            this.reels[i].initialize(i, this.slotConfig);
        }
    }

    private onSpinButtonPressed() {
        if(this.state == ESlotState.Spinning)
        {
            for (let i = 0; i < this.reels.length; i++) {
                this.reels[i].skipSpin();
            }

            this.updateState(ESlotState.Idling);
        }
        else
        {
            this.updateState(ESlotState.Spinning);

            for (let i = 0; i < this.reels.length; i++) {
                this.reels[i].spin(false);
            }
        }
    }

    private updateState(state: ESlotState)
    {
        this.state = state;
        this.spinButtonLabel.string = this.state === ESlotState.Idling? "SPIN": "STOP";
    }
}