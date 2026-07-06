import { _decorator, Component, Node, Sprite, UITransform, Vec3 } from 'cc';
import { SymbolData } from './SlotmachineManager';
const { ccclass, property } = _decorator;

@ccclass('Symbol')
export class Symbol extends Component {
    @property(UITransform) transform: UITransform;
    @property(Sprite) sprite: Sprite;

    private index: number;

    protected start() {

    }

    public initialize(index: number) {
        this.index = index;
    }

    public setData(data: SymbolData) {
        this.sprite.spriteFrame = data.texture;
    }

    public getHeight(): number {
        return this.transform.height;
    }
}


