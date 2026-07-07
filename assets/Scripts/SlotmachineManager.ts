import { _decorator, CCInteger, CCString, Component, SpriteFrame } from "cc";
import { EPaylineTypes } from "./EPaylineTypes";

const { ccclass, property } = _decorator;

@ccclass("SymbolData")
export class SymbolData {
    @property(SpriteFrame) texture: SpriteFrame = null!;
    @property(CCString) name = "";
    @property(CCInteger) value = 0;
}

@ccclass("SpinSpeedModeConfig")
export class SpinSpeedModeConfig {
    @property spinSpeed = 1500;
    @property reelRotations = 10;
    @property reelSpinStartDelay = 0.5;
    @property matchStartDelay = 0.5;
    @property matchEndDelay = 0.5;
}

@ccclass("SlotConfig")
export class SlotConfig {
    @property(SpinSpeedModeConfig) spinSpeedModes: SpinSpeedModeConfig[] = [];

    @property reelCount = 3;
    @property visibleRows = 5;
}

export class MatchResult {
    constructor(
        public payline: EPaylineTypes,
        public rows: number[],
        public symbol: SymbolData,
    ) { }

}

const PAYLINES = [
    // HORIZONTAL
    { type: EPaylineTypes.Top, rows: [1, 1, 1] },
    { type: EPaylineTypes.Middle, rows: [2, 2, 2] },
    { type: EPaylineTypes.Bottom, rows: [3, 3, 3] },

    // DIAGONAL
    { type: EPaylineTypes.TopLeftBottomRight, rows: [1, 2, 3] },
    { type: EPaylineTypes.TopRightBottomLeft, rows: [3, 2, 1] },

    // LSHAPE
    { type: EPaylineTypes.TopMiddleMiddle, rows: [1, 2, 2] },
    { type: EPaylineTypes.MiddleMiddleTop, rows: [2, 2, 1] },
    { type: EPaylineTypes.MiddleMiddleBottom, rows: [2, 2, 3] },
    { type: EPaylineTypes.BottomMiddleMiddle, rows: [3, 2, 2] },
];


@ccclass("SpinResult")
export class SpinResult {

    public reels: SymbolData[][] = [];

    constructor(reels: SymbolData[][]) {
        this.reels = reels;
    }

    public getMatches(): MatchResult[] {
        const matches: MatchResult[] = [];

        for (const payline of PAYLINES) {

            const symbolData = this.reels[0][payline.rows[0]];
            let matched = true;

            for (let reel = 1; reel < this.reels.length; reel++) {
                if (this.reels[reel][payline.rows[reel]].value !== symbolData.value) {
                    matched = false;
                    break;
                }
            }

            if (matched) {
                matches.push(new MatchResult(payline.type, payline.rows, symbolData));
                console.log(`[MATCH] ${EPaylineTypes[payline.type]} - Symbol ${symbolData.value}`);
            }
        }
        if(matches == null || matches.length <= 0){
            console.log(`[NO MATCH]`);
        }
        return matches;
    }

    public print() {
        console.log("=== Spin Result ===");

        for (let x = 0; x < this.reels[0].length; x++) {

            let line = "";

            for (let y = 0; y < this.reels.length; y++) {
                line += this.reels[y][x].name + "\t";
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