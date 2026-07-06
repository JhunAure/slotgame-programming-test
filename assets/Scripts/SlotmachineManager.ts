import { _decorator, CCInteger, Component, Texture2D } from "cc";

const { ccclass, property } = _decorator;

@ccclass("SymbolData")
export class SymbolData
{
    @property(Texture2D) texture: Texture2D;
    @property(CCInteger) value: number = 0;
}

@ccclass("SlotConfig")
export class SlotConfig
{
    @property public spinSpeed = 1500;
}

@ccclass("SlotmachineManager")
export class SlotmachineManager extends Component
{
    @property(SlotConfig) private config: SlotConfig = new SlotConfig();
    @property([SymbolData]) private symbols: SymbolData[] = [];

    public static instance: SlotmachineManager;

    protected onLoad()
    {
        SlotmachineManager.instance = this;
    }

    public getConfig(): SlotConfig
    {
        return this.config;
    }

    public getRandomReelSymbols(): SymbolData
    {
        if (this.symbols.length === 0)
            return null;

        const index = Math.floor(Math.random() * this.symbols.length);
        return this.symbols[index];
    }
}