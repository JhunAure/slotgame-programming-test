import { _decorator, CCInteger, Component, SpriteFrame } from "cc";

const { ccclass, property } = _decorator;

@ccclass("SymbolData")
export class SymbolData {
    @property(SpriteFrame) texture: SpriteFrame = null!;
    @property(String) name = "";
    @property(CCInteger) value = 0;
}

@ccclass("SlotConfig")
export class SlotConfig {
    @property spinSpeed = 1500;
    @property reelRotations = 10;

    @property reelCount = 5;
    @property visibleRows = 3;
}

@ccclass("SpinResult")
export class SpinResult {

    public reels: SymbolData[][] = [];

    constructor(reels: SymbolData[][]) {
        this.reels = reels;
    }

    public print() {
        console.log("=== Spin Result ===");

        for (let row = 0; row < this.reels[0].length; row++) {

            let line = "";

            for (let reel = 0; reel < this.reels.length; reel++) {
                line += this.reels[reel][row].name + "\t";
            }

            console.log(line);
        }
    }
}

@ccclass("SlotmachineManager")
export class SlotmachineManager extends Component {
    @property(SlotConfig) private config = new SlotConfig();
    @property([SymbolData]) private symbols: SymbolData[] = [];

    public static instance: SlotmachineManager;

    protected onLoad() {
        SlotmachineManager.instance = this;
    }

    public getConfig(): SlotConfig {
        return this.config;
    }

    public generateSpinResult(): SpinResult {

        const reels: SymbolData[][] = [];

        for (let i = 0; i < this.config.reelCount; i++) {
            reels.push(this.generateReelResult(this.config.visibleRows, true));
        }

        return new SpinResult(reels);
    }

    private generateReelResult(count: number, byRarity: boolean): SymbolData[] {
        const result: SymbolData[] = [];

        for (let i = 0; i < count; i++) {
            result.push(this.getRandomSymbol(byRarity));
        }

        return result;
    }

    public getRandomSymbol(byRarity = true): SymbolData {

        if (this.symbols.length === 0) {
            throw new Error("No symbols configured.");
        }

        if (!byRarity) {
            return this.getRandomUniformSymbol();
        }

        return this.getRandomWeightedSymbol();
    }

    private getRandomUniformSymbol(): SymbolData {
        const index = Math.floor(Math.random() * this.symbols.length);
        return this.symbols[index];
    }

    private getRandomWeightedSymbol(): SymbolData {
        let totalWeight = 0;

        for (let i = 0; i < this.symbols.length; i++) {
            totalWeight += this.symbols.length - i;
        }

        let random = Math.random() * totalWeight;

        for (let i = 0; i < this.symbols.length; i++) {

            random -= this.symbols.length - i;

            if (random <= 0) {
                return this.symbols[i];
            }
        }

        return this.symbols[this.symbols.length - 1];
    }
}