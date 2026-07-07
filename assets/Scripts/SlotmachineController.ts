import { _decorator, Button, Component, Label, Node, Toggle, ToggleContainer } from 'cc';
import { ReelController } from './ReelController';
import { ESlotState } from "./ESlotState";
import { SlotConfig, SlotmachineManager, SpinResult } from './SlotmachineManager';
import { ISlotmachineController } from './ISlotmachingController';
import { ESpinSpeedMode } from './ESpinSpeedMode';
const { ccclass, property } = _decorator;

@ccclass('SlotmachineController')
export class SlotmachineController extends Component implements ISlotmachineController {
    @property(ReelController) reels: ReelController[] = [];
    @property(Button) spinButton: Button;
    @property(Label) spinButtonLabel: Label;
    @property(Toggle) autoSpinToggle: Toggle;
    @property(Toggle) spinSpeedToggle1: Toggle;
    @property(Toggle) spinSpeedToggle2: Toggle;
    @property(Toggle) spinSpeedToggle3: Toggle;

    private state: ESlotState = ESlotState.Idling;
    private slotConfig: SlotConfig;

    private reelSequenceCounter: number;
    private spinResult: SpinResult;

    private totalMatchedPaylines: number;

    private speedMode: ESpinSpeedMode;

    private readonly autoSpinCallback = () => this.startSpin();

    protected onEnable() {
        this.spinSpeedToggle1?.node.on(Button.EventType.CLICK, this.onToggleFirstSpeed, this);
        this.spinSpeedToggle2?.node.on(Button.EventType.CLICK, this.onToggleSecondSpeed, this);
        this.spinSpeedToggle3?.node.on(Button.EventType.CLICK, this.onToggleThirdSpeed, this);
        this.spinButton?.node.on(Button.EventType.CLICK, this.onSpinButtonPressed, this);
    }

    protected onDisable(): void {
        this.unscheduleAllCallbacks();
        this.spinSpeedToggle1?.node.off(Button.EventType.CLICK, this.onToggleFirstSpeed, this);
        this.spinSpeedToggle2?.node.off(Button.EventType.CLICK, this.onToggleSecondSpeed, this);
        this.spinSpeedToggle3?.node.off(Button.EventType.CLICK, this.onToggleThirdSpeed, this);
        this.spinButton?.node.off(Button.EventType.CLICK, this.onSpinButtonPressed, this);
    }

    private onToggleFirstSpeed() {
        this.speedMode = ESpinSpeedMode.Normal;
    }

    private onToggleSecondSpeed() {
        this.speedMode = ESpinSpeedMode.Fast;
    }

    private onToggleThirdSpeed() {
        this.speedMode = ESpinSpeedMode.SuperFast;
    }

    protected start() {
        this.initialize();
    }

    private initialize() {
        this.slotConfig = SlotmachineManager.instance.getConfig();

        this.speedMode = ESpinSpeedMode.Normal;
        this.spinSpeedToggle1.isChecked = true;
        this.spinSpeedToggle2.isChecked = false;
        this.spinSpeedToggle3.isChecked = false;
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

        const reelSpinStartDelay = this.slotConfig.spinSpeedModes[this.speedMode].reelSpinStartDelay;

        if(reelSpinStartDelay > 0){
            this.toggleSpinButtonInteraction(false); // prevent spin/stop button getting spammed
        }

        this.spinResult = SlotmachineManager.instance.generateSpinResult();
        this.spinResult.print();

        this.reelSequenceCounter = 0;
        this.totalMatchedPaylines = 0;


        for (let i = 0; i < this.reels.length; i++) {
            this.reels[i].setSpinResult(this.spinResult.reels[i]);

            if (reelSpinStartDelay > 0) {
                this.scheduleOnce(() => this.spinReel(i, this.speedMode), i * reelSpinStartDelay)
            }
            else {
                this.spinReel(i, this.speedMode);
            }
        }
    }

    private spinReel(i: number, spinMode: ESpinSpeedMode) {
        this.reels[i].startSpin(this.autoSpinToggle.isChecked, spinMode);

        // reenable spin button if all reels has started spinning, to prevent unwanted behavior when spamming spin/stop 
        if(i >= this.reels.length - 1)
            this.toggleSpinButtonInteraction(true);
    }

    private stopSpin() {
        this.unscheduleAllCallbacks();

        for (let i = 0; i < this.reels.length; i++) {
            this.reels[i].stopSpin();
        }
    }

    private toggleSpinButtonInteraction(interactable: boolean) {
        this.spinButton.interactable = interactable;
        this.spinButtonLabel.string = !interactable? "WAIT" : this.state === ESlotState.Idling ? "SPIN" : "STOP";
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

            if (this.totalMatchedPaylines <= 0) {
                this.endSequence();
                return;
            }

            this.toggleSpinButtonInteraction(false);

            this.scheduleOnce(() => {
                for (const reel of this.reels) {
                    reel.startMatching(matchResults);
                }
            }, this.slotConfig.spinSpeedModes[this.speedMode].matchStartDelay);
        }
    }

    public onReelMatchCompleted() {
        this.reelSequenceCounter++;
        const totalSequenceCount = this.totalMatchedPaylines <= 0 ? this.reels.length : this.totalMatchedPaylines;

        if (this.reelSequenceCounter >= totalSequenceCount) {
            this.reelSequenceCounter = 0;
            this.totalMatchedPaylines = 0;
            this.endSequence();
        }
    }

    private endSequence() {
        if (this.state === ESlotState.AutoSpinning) {
            this.scheduleOnce(this.autoSpinCallback, this.slotConfig.spinSpeedModes[this.speedMode].matchEndDelay);
        }
        else {
            this.unscheduleAllCallbacks();
            this.updateState(ESlotState.Idling);
        }

        this.toggleSpinButtonInteraction(true);
    }

    public getConfig(): SlotConfig {
        return this.slotConfig;
    }
}