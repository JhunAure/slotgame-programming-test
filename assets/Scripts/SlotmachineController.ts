import { _decorator, Button, Component, Label, Node, Toggle } from 'cc';
import { ReelController } from './ReelController';
import { ESlotState } from "./ESlotState";
import { SlotConfig, SlotmachineManager, SpinResult } from './SlotmachineManager';
import { ISlotmachineController } from './ISlotmachingController';
const { ccclass, property } = _decorator;

@ccclass('SlotmachineController')
export class SlotmachineController extends Component implements ISlotmachineController {
    @property(ReelController) reels: ReelController[] = []
    @property(Button) spinButton: Button;
    @property(Label) spinButtonLabel: Label;
    @property(Toggle) autoSpinToggle: Toggle;

    private state: ESlotState = ESlotState.Idling;
    private slotConfig: SlotConfig;

    private reelSequenceCounter: number;
    private spinResult: SpinResult;

    private totalMatchedPaylines : number;
    private readonly autoSpinCallback = ()=> this.startSpin();
 
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
            this.updateState(ESlotState.Idling);
            this.stopSpin();
        }
        else {
            this.updateState(this.autoSpinToggle.isChecked ? ESlotState.AutoSpinning : ESlotState.Spinning);
            this.startSpin();
        }
    }

    private startSpin() {
        this.unscheduleAllCallbacks();

        this.spinResult = SlotmachineManager.instance.generateSpinResult();
        this.spinResult.print();

        this.reelSequenceCounter = 0;
        this.totalMatchedPaylines = 0;

        for (let i = 0; i < this.reels.length; i++) {
            this.reels[i].setSpinResult(this.spinResult.reels[i]);
            this.reels[i].startSpin(this.autoSpinToggle.isChecked);
        }
    }

    private stopSpin() {
        this.unscheduleAllCallbacks();

        for (let i = 0; i < this.reels.length; i++) {
            this.reels[i].stopSpin();
        }
    }

    private updateState(state: ESlotState) {
        this.state = state;
        this.spinButtonLabel.string = this.state === ESlotState.Idling ? "SPIN" : "STOP";
    }

    public onReelSpinCompleted() {
        this.reelSequenceCounter++;

        if (this.reelSequenceCounter >= this.reels.length) {
            this.reelSequenceCounter = 0;

            const matchResults = this.spinResult.getMatches();
            this.totalMatchedPaylines = matchResults.length * this.reels.length;

            if(this.totalMatchedPaylines <= 0)
            {
                this.endSequence();
                return;
            }

            this.spinButton.interactable = false;
            
            this.scheduleOnce(() => {
                for (const reel of this.reels) {
                    reel.startMatching(matchResults);
                }
            }, this.slotConfig.matchStartDelay);
        }
    }

    public onReelMatchCompleted() {
        this.reelSequenceCounter++;
        const totalSequenceCount = this.totalMatchedPaylines <= 0? this.reels.length: this.totalMatchedPaylines;

        if (this.reelSequenceCounter >= totalSequenceCount) {
            this.reelSequenceCounter = 0;
            this.totalMatchedPaylines = 0;
            this.endSequence();
        }
    }

    private endSequence() {
        if (this.state === ESlotState.AutoSpinning) {
            this.scheduleOnce(this.autoSpinCallback, 1);
        }
        else {
            this.unscheduleAllCallbacks();
            this.updateState(ESlotState.Idling);
        }
        
        this.spinButton.interactable = true;
    }

    public getConfig(): SlotConfig {
        return this.slotConfig;
    }
}