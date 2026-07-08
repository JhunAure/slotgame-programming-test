import { _decorator, Animation, Component, math, Node, Sprite } from 'cc';
import { SlotmachineManager, SpinResult } from '../Managers/SlotmachineManager';
import { PaylineHUDItem } from './PaylineHUDItem';
const { ccclass, property } = _decorator;

@ccclass('PaylineHUD')
export class PaylineHUD extends Component {
    @property(PaylineHUDItem) private paylines: PaylineHUDItem[] = [];

    private hasMatchedPaylines: boolean;

    protected onEnable() {
        SlotmachineManager.instance.events.on(SlotmachineManager.EVENT_ON_MATCH_RESULT_SHOWN, this.onMatchResultShown, this);
        SlotmachineManager.instance.events.on(SlotmachineManager.EVENT_ON_SPIN_STARTED, this.onSpinStarted, this);
    }

    protected onDisable() {
        SlotmachineManager.instance.events.off(SlotmachineManager.EVENT_ON_MATCH_RESULT_SHOWN, this.onMatchResultShown, this);
        SlotmachineManager.instance.events.off(SlotmachineManager.EVENT_ON_SPIN_STARTED, this.onSpinStarted, this);
    }

    protected start() {
        this.resetPaylines();
    }

    private onSpinStarted() {
        this.resetPaylines();
    }

    private onMatchResultShown(spinResult: SpinResult) {
        this.hasMatchedPaylines = true;

        for (let i = 0; i < spinResult.matches.length; i++) {
            const match = spinResult.matches[i];
            this.paylines[match.payline].startAnimation();
        }
    }

    private resetPaylines() {
        if(!this.hasMatchedPaylines){
            return; // avoid re-reset if not changes in payline states
        }

        this.hasMatchedPaylines = false;

        for (let i = 0; i < this.paylines.length; i++) {
            this.paylines[i].stopAnimation();
        }
    }
}


