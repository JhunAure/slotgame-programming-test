import { _decorator, CCBoolean, CCInteger, CCString, Component, SpriteFrame } from "cc";
import { EPaylineTypes } from '../Enums/EPaylineTypes';
import { EventTarget } from 'cc';

const { ccclass, property } = _decorator;

@ccclass("SymbolData")
export class SymbolData {
    @property(SpriteFrame) texture: SpriteFrame = null!;
    @property(CCString) name = "";
    @property(CCInteger) value = 0;
    @property(CCInteger) weight = 1;
    @property(CCBoolean) isWild = false;
}

@ccclass("SpinSpeedModeConfig")
export class SpinSpeedModeConfig {
    @property spinSpeed = 1500;
    @property(CCInteger) reelRotations = 10;
    @property reelSpinStartDelay = 0.5;
    @property matchStartDelay = 0.5;
    @property matchEndDelay = 0.5;
}

@ccclass("SlotConfig")
export class SlotConfig {
    @property(SpinSpeedModeConfig) spinSpeedModes: SpinSpeedModeConfig[] = [];

    @property(CCInteger) reelCount = 3;
    @property(CCInteger) symbolsPerReel = 5;

    @property(CCInteger) costPerSpin = 10;
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
    public matches: MatchResult[] = [];
    public totalWinAmount: number = 0;

    constructor(reels: SymbolData[][]) {
        this.reels = reels;
        this.matches = this.getMatches();
    }

    public getMatches(): MatchResult[] {
        const matches: MatchResult[] = [];

        for (const payline of PAYLINES) {

            const winningSymbol = this.getWinningSymbol(payline.rows);

            if (winningSymbol == null) {
                continue;
            }

            matches.push(
                new MatchResult(
                    payline.type,
                    payline.rows,
                    winningSymbol
                )
            );

            this.totalWinAmount += winningSymbol.value * payline.rows.length;

            console.log(
                `[MATCH] ${EPaylineTypes[payline.type]} - ${winningSymbol.name}`
            );
        }

        if (matches.length === 0) {
            console.log("[NO MATCH]");
        }

        return matches;
    }

    private getWinningSymbol(rows: number[]): SymbolData | null {

        let baseSymbol: SymbolData | null = null;

        // Find the first non-Wild symbol
        for (let reel = 0; reel < this.reels.length; reel++) {

            const symbol = this.reels[reel][rows[reel]];

            if (!symbol.isWild) {
                baseSymbol = symbol;
                break;
            }
        }

        // All symbols are Wild -> pay as Wild
        if (baseSymbol == null) {
            return this.reels[0][rows[0]];
        }

        // Validate the payline
        for (let reel = 0; reel < this.reels.length; reel++) {

            const symbol = this.reels[reel][rows[reel]];

            if (symbol.isWild) {
                continue;
            }

            if (symbol.name !== baseSymbol.name) {
                return null;
            }
        }

        return baseSymbol;
    }

    public print() {
        console.log("=== [SPIN RESULT] ===");

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

    public static instance: SlotmachineManager | null = null;

    public readonly events = new EventTarget();
    public static readonly EVENT_ON_MATCH_RESULT_SHOWN = "match-result-shown";
    public static readonly EVENT_ON_SPIN_STARTED = "spin-started";

    protected onLoad() {
        if (SlotmachineManager.instance && SlotmachineManager.instance !== this) {
            this.node.destroy();
            return;
        }

        SlotmachineManager.instance = this;
    }

    protected onDestroy() {
        if (SlotmachineManager.instance === this) {
            SlotmachineManager.instance = null;
        }
    }

    public getConfig(): SlotConfig {
        return this.config;
    }

    public generateSpinResult(): SpinResult {

        const reels: SymbolData[][] = [];

        for (let i = 0; i < this.config.reelCount; i++) {
            reels.push(this.generateReelResult(this.config.symbolsPerReel, true));
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

        for (const symbol of this.symbols) {
            totalWeight += symbol.weight;
        }

        let random = Math.random() * totalWeight;

        for (const symbol of this.symbols) {

            random -= symbol.weight;

            if (random < 0) {
                return symbol;
            }
        }

        return this.symbols[this.symbols.length - 1];
    }
}