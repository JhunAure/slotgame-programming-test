import { _decorator, Component, Layout, Node, sp } from 'cc';
import { Symbol } from "./Symbol";
import { ESlotState } from "./ESlotState";
import { SlotConfig, SlotmachineManager } from './SlotmachineManager';

const { ccclass, property } = _decorator;

@ccclass('ReelController')
export class ReelController extends Component {
    @property(Symbol) symbols: Symbol[] = [];
    @property(Layout) layout: Layout;

    private index: number;
    private state: ESlotState = ESlotState.Idling;
    private endYPosition: number;
    private reelHeight: number;
    private symbolHeight: number;

    private spinSpeed: number;
    private spinStartDelay: number;
    private spinDecelerationDelay: number;
    private slotConfig: SlotConfig;

    protected start() {

    }

    protected update(deltaTime: number) {
        switch (this.state) {
            case ESlotState.Spinning:
                this.updateSpin(deltaTime);
                break;
        }
    }

    private initializeSymbols() {
        for (let i = 0; i < this.symbols.length; i++) {
            const symbol = this.symbols[i];
            symbol.initialize(i);
            symbol.setData(SlotmachineManager.instance.getRandomSymbol(false));

            this.endYPosition = symbol.node.position.y;
        }

        this.symbolHeight = this.symbols[0].getHeight();
        this.reelHeight = this.symbols.length * (this.symbolHeight + this.layout.spacingY);
        this.endYPosition -= this.symbolHeight * 0.5;
    }

    private updateSpin(deltaTime: number) {
        if (this.spinSpeed <= 0) {
            this.state = ESlotState.Idling;
            return;
        }

        const distance = this.spinSpeed * deltaTime;

        for (let i = 0; i < this.symbols.length; i++) {
            const symbol = this.symbols[i].node;
            let y = symbol.position.y - distance;

            if (y < this.endYPosition) {
                y += this.reelHeight;
                this.symbols[i].setData(SlotmachineManager.instance.getRandomSymbol(false));
            }

            symbol.setPosition(symbol.position.x, y);
        }


        if(this.spinDecelerationDelay <= 0)
        {
            this.spinSpeed -= this.slotConfig.spinDeceleration * deltaTime;
            return
        }
        this.spinDecelerationDelay -= deltaTime;
    }

    private setConfig(slotConfig: SlotConfig) {
        this.slotConfig = slotConfig;
        this.spinSpeed = slotConfig.spinSpeed;
        this.spinStartDelay = this.index;
        this.spinDecelerationDelay = this.slotConfig.spinDecelerationDelay;
    }

    public initialize(index: number) {
        this.index = index;
        this.state = ESlotState.Idling;
        this.initializeSymbols();
    }

    public spin(slotConfig: SlotConfig) {
        this.setConfig(slotConfig);
        this.state = ESlotState.Spinning;
    }

    public autoSpin(slotConfig: SlotConfig) {
        this.setConfig(slotConfig);
        this.state = ESlotState.AutoSpinning;
    }

    public skipSpin() {
        this.state = ESlotState.QuickStopping;
    }
}


