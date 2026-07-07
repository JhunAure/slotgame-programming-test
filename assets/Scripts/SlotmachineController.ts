import { _decorator, Button, Component, Node } from 'cc';
import { ReelController } from './ReelController';
import { ESlotState } from "./ESlotState";
import { SlotConfig, SlotmachineManager } from './SlotmachineManager';
const { ccclass, property } = _decorator;

@ccclass('SlotmachineController')
export class SlotmachineController extends Component {

    @property(ReelController) reels: ReelController[] = []
    @property(Button) spinButton: Button;

    private state: ESlotState = ESlotState.Idling;
    private slotConfig: SlotConfig;

    protected start() {
        this.spinButton?.node.on(Button.EventType.CLICK, this.onSpinButtonPressed, this);
        this.initialize();
    }

    protected update(deltaTime: number) {

    }

    private initialize() {
        this.state = ESlotState.Idling;
        this.slotConfig = SlotmachineManager.instance.getConfig();

        for (let i = 0; i < this.reels.length; i++) {
            this.reels[i].initialize(i, this.slotConfig);
        }
    }

    private onSpinButtonPressed() {
        for (let i = 0; i < this.reels.length; i++) {
            this.reels[i].spin(false);
        }
    }
}