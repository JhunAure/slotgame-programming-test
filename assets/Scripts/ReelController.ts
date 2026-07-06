import { _decorator, Component, Node } from 'cc';
import { Symbol } from "./Symbol";
import { ESlotState } from "./ESlotState";

const { ccclass, property } = _decorator;

@ccclass('ReelController')
export class ReelController extends Component {
    @property(Symbol) symbols: Symbol[] = [];
    @property speed: number = 1500;
    @property symbolHeight: number = 150;
    @property symbolSpacing: number = 20;

    private index: number;
    private state: ESlotState = ESlotState.Idling;
    private endYPosition: number;
    private reelHeight: number;

    protected start() {

    }

    protected update(deltaTime: number) {
        switch (this.state) {
            case ESlotState.Spinning:
                this.updateSpin(deltaTime);
                break;
        } 
    }

    private updateSpin(deltaTime: number) {
        const distance = this.speed * deltaTime;

        for (let i = 0; i < this.symbols.length; i++) {
            const symbol = this.symbols[i].node;
            let y = symbol.position.y - distance;

            if (y < this.endYPosition) {
                y += this.reelHeight;
            }

            symbol.setPosition(symbol.position.x, y);
        }
    }

    private initializeSymbols() {

        for (let i = 0; i < this.symbols.length; i++) {
            const symbol = this.symbols[i];
            symbol.initialize(i);

            this.endYPosition = symbol.node.position.y;
        }

        this.reelHeight = this.symbols.length * (this.symbolHeight + this.symbolSpacing);
        this.endYPosition -= this.symbolHeight * 0.5;
    }

    public initialize(index: number) {
        this.index = index;
        this.state = ESlotState.Idling;
        this.initializeSymbols();
    }

    public spin() {
        this.state = ESlotState.Spinning;
    }

    public autoSpin() {
        this.state = ESlotState.AutoSpinning;
    }

    public stopSpin() {
        this.state = ESlotState.Stopping;
    }

    public quickStopSpin() {
        this.state = ESlotState.QuickStopping;
    }
}


