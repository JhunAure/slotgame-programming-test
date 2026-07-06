import { _decorator, CCInteger, Component, SpriteFrame, Texture2D } from "cc";

const { ccclass, property } = _decorator;

@ccclass("SymbolData")
export class SymbolData {
    @property(SpriteFrame) texture: SpriteFrame;
    @property(CCInteger) value: number = 0;
}

@ccclass("SlotConfig")
export class SlotConfig {
    @property public spinSpeed = 1500;
}

@ccclass("SlotmachineManager")
export class SlotmachineManager extends Component {
    @property(SlotConfig) private config: SlotConfig = new SlotConfig();
    @property([SymbolData]) private symbols: SymbolData[] = [];

    public static instance: SlotmachineManager;

    protected onLoad() {
        SlotmachineManager.instance = this;
    }

    public getConfig(): SlotConfig {
        return this.config;
    }

    public getRandomSymbol(byRarity: boolean): SymbolData | null {
        if (this.symbols.length === 0)
            return null;

        if (byRarity) {
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
        else {
            const index = Math.floor(Math.random() * this.symbols.length);
            return this.symbols[index];
        }
    }

    public getRandomSymbols(count: number, byRarity: boolean): SymbolData[] {
        const result: SymbolData[] = [];

        for (let i = 0; i < count; i++) {
            const symbol = this.getRandomSymbol(byRarity);

            if (symbol) {
                result.push(symbol);
            }
        }

        return result;
    }
}