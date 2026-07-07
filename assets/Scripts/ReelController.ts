import { _decorator, Component, Layout } from 'cc';
import { Symbol } from './Symbol';
import { ESlotState } from './ESlotState';
import { SlotConfig, SlotmachineManager } from './SlotmachineManager';

const { ccclass, property } = _decorator;

@ccclass('ReelController')
export class ReelController extends Component {
    @property(Symbol) symbols: Symbol[] = [];
    @property(Layout) layout: Layout;

    private index = 0;
    private state = ESlotState.Idling;

    private slotConfig: SlotConfig;

    private symbolHeight = 0;
    private reelHeight = 0;

    private bottomEndY = 0;

    private initialPositions: number[] = [];

    private traveledDistance = 0;
    private targetDistance = 0;
    private targetRotations = 0;
    private deceleration = 0;
    private speed = 0;

    protected update(dt: number) {
        if (this.state !== ESlotState.Spinning)
            return;

        this.updateSpin(dt);
    }

    public initialize(index: number, config: SlotConfig) {
        this.index = index;
        this.slotConfig = config;
        this.state = ESlotState.Idling;
        this.initializeSymbols();
    }

    public spin(autoSpin: boolean) {
        this.speed = this.slotConfig.spinSpeed;
        this.targetRotations = this.slotConfig.reelRotations;

        this.traveledDistance = 0;
        this.targetDistance = this.calculateTargetDistance();
        this.deceleration = this.calculateDeceleration();

        this.state = autoSpin? ESlotState.AutoSpinning: ESlotState.Spinning;
    }

    public skipSpin() {
        this.stopSymbols();
    }

    private initializeSymbols() {
        this.symbolHeight = this.symbols[0].getHeight();
        this.initialPositions.length = 0;

        for (let i = 0; i < this.symbols.length; i++) {
            const symbol = this.symbols[i];

            symbol.initialize(i);
            symbol.setData(SlotmachineManager.instance.getRandomSymbol(false));

            this.initialPositions.push(symbol.node.position.y);
        }

        this.reelHeight = this.calculateReelHeight();
        this.bottomEndY = this.calculateBottomEndPos();
    }

    private updateSpin(dt: number) {
        const remainingDistance = this.targetDistance - this.traveledDistance;

        if (remainingDistance <= 0.001) {
            this.stopSymbols();
            return;
        }

        // make the speed vary by the remaining distance, slows down when distance is small
        this.speed = this.calculateSpeedByDistance(remainingDistance);

        // get the next move distance from speed or the remaining distance which ever the smallest 
        this.traveledDistance += Math.min(this.speed * dt, remainingDistance);

        this.moveSymbols();
    }

    private moveSymbols() {
        // currentDistanceInLoop = current traveled distance within one reel loop
        const currentDistanceInLoop = this.traveledDistance % this.reelHeight;

        for (let i = 0; i < this.symbols.length; i++) {
            const symbolNode = this.symbols[i].node;
            let nextYPos = this.initialPositions[i] - currentDistanceInLoop;

            // if the symbol reached the bottom end or the reel move the symbol at the top of the reel
            if (nextYPos < this.bottomEndY) {
                nextYPos += this.reelHeight;
            }

            symbolNode.setPosition(symbolNode.position.x, nextYPos);
        }
    }

    private stopSymbols() {
        this.traveledDistance = this.targetDistance;
        this.speed = 0;
        this.moveSymbols();
        this.state = ESlotState.Idling;
    }

    private calculateSpeedByDistance(distance: number): number {
        // get the speed by the given distance using the constant acceleration equation
        return Math.sqrt(2 * this.deceleration * distance);
    }
    
    private calculateDeceleration(): number {
        return (this.speed * this.speed) / (2 * this.targetDistance);
    }

    private calculateTargetDistance(): number{
        return this.targetRotations * this.reelHeight;
    }

    private calculateBottomEndPos(): number {
        return this.initialPositions[this.initialPositions.length - 1] -
            this.symbolHeight * 0.5
    }

    private calculateReelHeight(): number {
        return this.symbols.length *
            (this.symbolHeight + this.layout.spacingY);
    }
}