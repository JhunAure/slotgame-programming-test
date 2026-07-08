import { _decorator, Component, Layout } from 'cc';
import { Symbol } from '../UIs/Symbol';
import { ESlotState } from '../Enums/ESlotState';
import { MatchResult, SlotConfig, SlotmachineManager, SymbolData } from '../Managers/SlotmachineManager';
import { ISlotmachineController } from './ISlotmachingController';
import { ESpinSpeedMode } from '../Enums/ESpinSpeedMode';

const { ccclass, property } = _decorator;

@ccclass('ReelController')
export class ReelController extends Component {
    @property(Symbol) symbols: Symbol[] = [];
    @property(Layout) layout: Layout;

    private index = 0;
    private state = ESlotState.Idling;

    private slotConfig: SlotConfig;
    private controller: ISlotmachineController;

    private symbolHeight = 0;
    private reelHeight = 0;

    private bottomEndY = 0;

    private initialPositions: number[] = [];

    private traveledDistance = 0;
    private targetDistance = 0;
    private targetRotations = 0;
    private deceleration = 0;
    private speed = 0;

    private spinResult: SymbolData[] = [];
    private spinResultIndex = 0;
    private isFinalRotation = false;

    public setSpinResult(symbols: SymbolData[]) {
        this.spinResult = symbols;
        this.spinResultIndex = 0;
    }

    private getResultSymbol(): SymbolData {
        if (this.isFinalRotation) {
            const symbol = this.spinResult[this.spinResult.length - 1 - this.spinResultIndex];
            this.spinResultIndex++;
            return symbol;
        }

        return SlotmachineManager.instance.getRandomSymbol(false);
    }

    protected update(dt: number) {
        switch (this.state) {
            case ESlotState.Spinning:
            case ESlotState.AutoSpinning:
                this.updateSpin(dt);
                break;
        }
    }

    public initialize(index: number, controller: ISlotmachineController) {
        this.index = index;
        this.controller = controller;
        this.slotConfig = controller.getConfig();
        this.state = ESlotState.Idling;
        this.initializeSymbols();
    }

    public startSpin(autoSpin: boolean, speedMode: ESpinSpeedMode) {
        this.speed = this.slotConfig.spinSpeedModes[speedMode].spinSpeed;
        this.targetRotations = this.slotConfig.spinSpeedModes[speedMode].reelRotations;

        this.traveledDistance = 0;
        this.targetDistance = this.calculateTargetDistance();
        this.deceleration = this.calculateDeceleration();

        this.isFinalRotation = false;
        this.spinResultIndex = 0;

        this.stopMatchAnimations();

        this.state = autoSpin ? ESlotState.AutoSpinning : ESlotState.Spinning;
    }

    public startMatching(matches: MatchResult[]) {
        for (let i = 0; i < this.symbols.length; i++) {
            this.symbols[i].setGrayscale(true);
        }

        for (const match of matches) {
            const row = match.rows[this.index];

            this.symbols[row].setGrayscale(false);
            this.symbols[row].playMatchAnimation(() => 
                this.controller.onReelMatchCompleted()
            );
        }
    }

    public stopSpin() {
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

    private stopMatchAnimations()
    {
        for (let i = 0; i < this.symbols.length; i++) {
            const symbol = this.symbols[i];
            symbol.stopMatchAnimation();
            symbol.setGrayscale(false);
        }
    }

    private updateSpin(dt: number) {
        const remainingDistance = this.targetDistance - this.traveledDistance;

        if (remainingDistance <= 0.001) {
            this.stopSymbols();
            return;
        }

        const loopsRemaining = Math.ceil(remainingDistance / this.reelHeight);

        // flag if this is the last loop remaining in this reel
        if (!this.isFinalRotation && loopsRemaining <= 1) {
            this.isFinalRotation = true;
        }

        // make the speed vary by the remaining distance, slows down when distance is small
        this.speed = this.calculateSpeedByDistance(remainingDistance);

        // get the next move distance from speed or the remaining distance which ever the smallest 
        this.traveledDistance += Math.min(this.speed * dt, remainingDistance);

        this.updateSymbols();
    }

    private updateSymbols() {
        const currentDistanceInLoop = this.traveledDistance % this.reelHeight;

        for (let i = 0; i < this.symbols.length; i++) {
            const symbol = this.symbols[i];
            const symbolNode = symbol.node;

            let nextYPos = this.initialPositions[i] - currentDistanceInLoop;

            if (nextYPos < this.bottomEndY) {
                nextYPos += this.reelHeight;
            }

            // check if the symbol was moved to the top then update its data
            if (nextYPos > symbolNode.position.y) {
                symbol.setData(this.getResultSymbol());
            }

            symbolNode.setPosition(symbolNode.position.x, nextYPos);
        }
    }

    private stopSymbols() {
        this.traveledDistance = this.targetDistance;
        this.speed = 0;
        this.skipToResult();
        this.state = ESlotState.Idling;
    }

    private skipToResult() {
        for (let i = 0; i < this.symbols.length; i++) {
            const symbol = this.symbols[i];
            symbol.setData(this.spinResult[i]);
            symbol.node.setPosition(symbol.node.position.x, this.initialPositions[i]);
        }
        this.controller.onReelSpinCompleted();
    }

    private calculateSpeedByDistance(distance: number): number {
        // get the speed by the given distance using the constant acceleration equation
        return Math.sqrt(2 * this.deceleration * distance);
    }

    private calculateDeceleration(): number {
        return (this.speed * this.speed) / (2 * this.targetDistance);
    }

    private calculateTargetDistance(): number {
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