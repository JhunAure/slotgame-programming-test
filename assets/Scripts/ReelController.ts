import { _decorator, Component, Layout, Node, sp } from 'cc';
import { Symbol } from "./Symbol";
import { ESlotState } from "./ESlotState";

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

            this.endYPosition = symbol.node.position.y;
        }
        this.symbolHeight = this.symbols[0].getHeight();
        this.reelHeight = this.symbols.length * (this.symbolHeight + this.layout.spacingY);
        this.endYPosition -= this.symbolHeight * 0.5;
    }

    private updateSpin(deltaTime: number) {
        const distance = this.spinSpeed * deltaTime;

        for (let i = 0; i < this.symbols.length; i++) {
            const symbol = this.symbols[i].node;
            let y = symbol.position.y - distance;

            if (y < this.endYPosition) {
                y += this.reelHeight;
            }

            symbol.setPosition(symbol.position.x, y);
        }
    }

    public initialize(index: number) {
        this.index = index;
        this.state = ESlotState.Idling;
        this.initializeSymbols();
    }

    public spin(speed: number, startDelay: number) {
        this.spinSpeed = speed;
        this.spinStartDelay = startDelay;
        this.state = ESlotState.Spinning;
    }

    public autoSpin(speed: number, startDelay: number) {
        this.spinSpeed = speed;
        this.spinStartDelay = startDelay;
        this.state = ESlotState.AutoSpinning;
    }

    public skipSpin() {
        this.state = ESlotState.QuickStopping;
    }
}


